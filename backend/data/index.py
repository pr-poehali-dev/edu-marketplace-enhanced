import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor


def _resp(status, body):
    return {
        'statusCode': status,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token, X-User-Id',
        },
        'isBase64Encoded': False,
        'body': json.dumps(body, default=str, ensure_ascii=False),
    }


def handler(event: dict, context) -> dict:
    '''Единый API для данных маркетплейса: категории, услуги, заявки, отзывы, платежи, избранное, жалобы, блог, уведомления, пользователи'''
    method = event.get('httpMethod', 'GET')
    if method == 'OPTIONS':
        return _resp(200, {})

    params = event.get('queryStringParameters') or {}
    resource = params.get('resource', '')
    headers = event.get('headers') or {}
    uid = headers.get('X-User-Id') or headers.get('x-user-id') or params.get('user_id')

    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    try:
        cur = conn.cursor(cursor_factory=RealDictCursor)

        if method == 'GET':
            return _handle_get(cur, resource, params, uid)
        if method == 'POST':
            body = json.loads(event.get('body') or '{}')
            return _handle_post(cur, conn, resource, body, uid)
        if method in ('PUT', 'DELETE'):
            body = json.loads(event.get('body') or '{}')
            return _handle_mutate(cur, conn, method, resource, body, uid)

        return _resp(400, {'error': 'Метод не поддерживается'})
    finally:
        conn.close()


def _handle_get(cur, resource, params, uid):
    if resource == 'categories':
        cur.execute("SELECT * FROM categories ORDER BY sort_order")
        return _resp(200, {'items': cur.fetchall()})

    if resource == 'services':
        category_id = params.get('category_id')
        tutor_id = params.get('tutor_id')
        search = params.get('search')
        status = params.get('status', 'approved')
        q = ("SELECT s.*, u.full_name AS tutor_name, u.avatar_url AS tutor_avatar, "
             "u.city AS tutor_city, c.name AS category_name, c.color AS category_color, c.icon AS category_icon "
             "FROM services s JOIN users u ON u.id = s.tutor_id JOIN categories c ON c.id = s.category_id WHERE 1=1")
        args = []
        if status and status != 'all':
            q += " AND s.status = %s"; args.append(status)
        if category_id:
            q += " AND s.category_id = %s"; args.append(category_id)
        if tutor_id:
            q += " AND s.tutor_id = %s"; args.append(tutor_id)
        if search:
            q += " AND (s.title ILIKE %s OR s.description ILIKE %s OR s.tags ILIKE %s)"
            like = f'%{search}%'; args += [like, like, like]
        q += " ORDER BY s.rating DESC, s.reviews_count DESC"
        cur.execute(q, args)
        return _resp(200, {'items': cur.fetchall()})

    if resource == 'service':
        sid = params.get('id')
        cur.execute(
            "SELECT s.*, u.full_name AS tutor_name, u.avatar_url AS tutor_avatar, u.city AS tutor_city, "
            "u.bio AS tutor_bio, c.name AS category_name FROM services s "
            "JOIN users u ON u.id = s.tutor_id JOIN categories c ON c.id = s.category_id WHERE s.id = %s", (sid,))
        svc = cur.fetchone()
        cur.execute(
            "SELECT r.*, u.full_name AS student_name, u.avatar_url AS student_avatar FROM reviews r "
            "JOIN users u ON u.id = r.student_id WHERE r.service_id = %s ORDER BY r.created_at DESC", (sid,))
        reviews = cur.fetchall()
        return _resp(200, {'service': svc, 'reviews': reviews})

    if resource == 'bookings':
        role = params.get('role', 'student')
        col = 'tutor_id' if role == 'tutor' else 'student_id'
        cur.execute(
            f"SELECT b.*, s.title AS service_title, st.full_name AS student_name, st.avatar_url AS student_avatar, "
            f"tu.full_name AS tutor_name, tu.avatar_url AS tutor_avatar FROM bookings b "
            f"JOIN services s ON s.id = b.service_id JOIN users st ON st.id = b.student_id "
            f"JOIN users tu ON tu.id = b.tutor_id WHERE b.{col} = %s ORDER BY b.lesson_date DESC", (uid,))
        return _resp(200, {'items': cur.fetchall()})

    if resource == 'reviews':
        tutor_id = params.get('tutor_id', uid)
        cur.execute(
            "SELECT r.*, u.full_name AS student_name, u.avatar_url AS student_avatar, s.title AS service_title "
            "FROM reviews r JOIN users u ON u.id = r.student_id JOIN services s ON s.id = r.service_id "
            "WHERE r.tutor_id = %s ORDER BY r.created_at DESC", (tutor_id,))
        return _resp(200, {'items': cur.fetchall()})

    if resource == 'transactions':
        cur.execute(
            "SELECT t.*, u.full_name AS user_name FROM transactions t JOIN users u ON u.id = t.user_id "
            "WHERE t.user_id = %s OR %s IS NULL ORDER BY t.created_at DESC LIMIT 100",
            (uid, uid if uid else None))
        return _resp(200, {'items': cur.fetchall()})

    if resource == 'all_transactions':
        cur.execute(
            "SELECT t.*, u.full_name AS user_name, u.role AS user_role FROM transactions t "
            "JOIN users u ON u.id = t.user_id ORDER BY t.created_at DESC LIMIT 200")
        return _resp(200, {'items': cur.fetchall()})

    if resource == 'favorites':
        cur.execute(
            "SELECT f.id AS fav_id, s.*, u.full_name AS tutor_name, u.avatar_url AS tutor_avatar, "
            "c.name AS category_name, c.color AS category_color, c.icon AS category_icon FROM favorites f "
            "JOIN services s ON s.id = f.service_id JOIN users u ON u.id = s.tutor_id "
            "JOIN categories c ON c.id = s.category_id WHERE f.user_id = %s ORDER BY f.created_at DESC", (uid,))
        return _resp(200, {'items': cur.fetchall()})

    if resource == 'complaints':
        cur.execute(
            "SELECT c.*, u.full_name AS author_name, u.avatar_url AS author_avatar FROM complaints c "
            "JOIN users u ON u.id = c.author_id ORDER BY c.created_at DESC")
        return _resp(200, {'items': cur.fetchall()})

    if resource == 'articles':
        cur.execute(
            "SELECT a.*, u.full_name AS author_name FROM articles a LEFT JOIN users u ON u.id = a.author_id "
            "ORDER BY a.created_at DESC")
        return _resp(200, {'items': cur.fetchall()})

    if resource == 'notifications':
        cur.execute("SELECT * FROM notifications WHERE user_id = %s ORDER BY created_at DESC LIMIT 50", (uid,))
        return _resp(200, {'items': cur.fetchall()})

    if resource == 'users':
        role = params.get('role')
        q = "SELECT id, full_name, email, role, avatar_url, phone, city, bio, is_blocked, balance, created_at FROM users WHERE 1=1"
        args = []
        if role:
            q += " AND role = %s"; args.append(role)
        q += " ORDER BY created_at DESC"
        cur.execute(q, args)
        return _resp(200, {'items': cur.fetchall()})

    if resource == 'stats':
        cur.execute("SELECT role, COUNT(*) AS cnt FROM users GROUP BY role")
        roles = {r['role']: r['cnt'] for r in cur.fetchall()}
        cur.execute("SELECT COUNT(*) AS c FROM services")
        services_total = cur.fetchone()['c']
        cur.execute("SELECT COUNT(*) AS c FROM services WHERE status = 'pending'")
        services_pending = cur.fetchone()['c']
        cur.execute("SELECT COUNT(*) AS c FROM bookings")
        bookings_total = cur.fetchone()['c']
        cur.execute("SELECT COALESCE(SUM(amount),0) AS s FROM transactions WHERE type='payment' AND status='completed'")
        revenue = float(cur.fetchone()['s'])
        cur.execute("SELECT COUNT(*) AS c FROM complaints WHERE status='open'")
        complaints_open = cur.fetchone()['c']
        return _resp(200, {
            'users': roles, 'services_total': services_total, 'services_pending': services_pending,
            'bookings_total': bookings_total, 'revenue': revenue, 'complaints_open': complaints_open,
        })

    if resource == 'tutor_stats':
        cur.execute("SELECT COUNT(*) AS c FROM services WHERE tutor_id = %s", (uid,))
        services_cnt = cur.fetchone()['c']
        cur.execute("SELECT COUNT(*) AS c FROM bookings WHERE tutor_id = %s", (uid,))
        bookings_cnt = cur.fetchone()['c']
        cur.execute("SELECT COUNT(*) AS c FROM bookings WHERE tutor_id = %s AND status='completed'", (uid,))
        completed = cur.fetchone()['c']
        cur.execute("SELECT COALESCE(AVG(rating),0) AS a FROM reviews WHERE tutor_id = %s", (uid,))
        avg_rating = round(float(cur.fetchone()['a']), 2)
        cur.execute("SELECT COALESCE(SUM(price),0) AS s FROM bookings WHERE tutor_id = %s AND status='completed'", (uid,))
        earned = float(cur.fetchone()['s'])
        return _resp(200, {'services': services_cnt, 'bookings': bookings_cnt, 'completed': completed,
                           'avg_rating': avg_rating, 'earned': earned})

    return _resp(400, {'error': 'Неизвестный ресурс'})


def _handle_post(cur, conn, resource, body, uid):
    if resource == 'service':
        cur.execute(
            "INSERT INTO services (tutor_id, category_id, title, description, price, format, experience_years, tags, status) "
            "VALUES (%s,%s,%s,%s,%s,%s,%s,%s,'pending') RETURNING *",
            (uid, body.get('category_id'), body.get('title'), body.get('description'),
             body.get('price', 0), body.get('format', 'online'), body.get('experience_years', 0), body.get('tags', '')))
        conn.commit()
        return _resp(200, {'item': cur.fetchone()})

    if resource == 'booking':
        cur.execute("SELECT tutor_id, price FROM services WHERE id = %s", (body.get('service_id'),))
        svc = cur.fetchone()
        cur.execute(
            "INSERT INTO bookings (service_id, student_id, tutor_id, lesson_date, price, comment, status) "
            "VALUES (%s,%s,%s,%s,%s,%s,'new') RETURNING *",
            (body.get('service_id'), uid, svc['tutor_id'], body.get('lesson_date'), svc['price'], body.get('comment', '')))
        booking = cur.fetchone()
        cur.execute("INSERT INTO notifications (user_id, title, text, icon) VALUES (%s,%s,%s,'UserPlus')",
                    (svc['tutor_id'], 'Новая заявка', 'Поступила новая заявка на занятие'))
        conn.commit()
        return _resp(200, {'item': booking})

    if resource == 'review':
        cur.execute(
            "INSERT INTO reviews (service_id, student_id, tutor_id, rating, text) VALUES (%s,%s,%s,%s,%s) RETURNING *",
            (body.get('service_id'), uid, body.get('tutor_id'), body.get('rating', 5), body.get('text', '')))
        review = cur.fetchone()
        cur.execute(
            "UPDATE services SET reviews_count = reviews_count + 1, "
            "rating = (SELECT ROUND(AVG(rating),2) FROM reviews WHERE service_id = %s) WHERE id = %s",
            (body.get('service_id'), body.get('service_id')))
        conn.commit()
        return _resp(200, {'item': review})

    if resource == 'favorite':
        cur.execute("SELECT id FROM favorites WHERE user_id = %s AND service_id = %s", (uid, body.get('service_id')))
        existing = cur.fetchone()
        if existing:
            cur.execute("DELETE FROM favorites WHERE id = %s", (existing['id'],))
            conn.commit()
            return _resp(200, {'favorited': False})
        cur.execute("INSERT INTO favorites (user_id, service_id) VALUES (%s,%s)", (uid, body.get('service_id')))
        conn.commit()
        return _resp(200, {'favorited': True})

    if resource == 'complaint':
        cur.execute(
            "INSERT INTO complaints (author_id, target_type, target_id, reason, text) VALUES (%s,%s,%s,%s,%s) RETURNING *",
            (uid, body.get('target_type', 'service'), body.get('target_id'), body.get('reason'), body.get('text', '')))
        conn.commit()
        return _resp(200, {'item': cur.fetchone()})

    if resource == 'article':
        cur.execute(
            "INSERT INTO articles (author_id, title, excerpt, content, status) VALUES (%s,%s,%s,%s,%s) RETURNING *",
            (uid, body.get('title'), body.get('excerpt', ''), body.get('content', ''), body.get('status', 'published')))
        conn.commit()
        return _resp(200, {'item': cur.fetchone()})

    if resource == 'category':
        cur.execute(
            "INSERT INTO categories (name, icon, color, description) VALUES (%s,%s,%s,%s) RETURNING *",
            (body.get('name'), body.get('icon', 'BookOpen'), body.get('color', 'from-violet-500 to-purple-600'),
             body.get('description', '')))
        conn.commit()
        return _resp(200, {'item': cur.fetchone()})

    return _resp(400, {'error': 'Неизвестный ресурс'})


def _handle_mutate(cur, conn, method, resource, body, uid):
    item_id = body.get('id')

    if method == 'DELETE':
        if resource == 'service':
            cur.execute("DELETE FROM favorites WHERE service_id = %s", (item_id,))
            cur.execute("DELETE FROM services WHERE id = %s", (item_id,))
        elif resource == 'category':
            cur.execute("DELETE FROM categories WHERE id = %s", (item_id,))
        elif resource == 'article':
            cur.execute("DELETE FROM articles WHERE id = %s", (item_id,))
        elif resource == 'booking':
            cur.execute("DELETE FROM bookings WHERE id = %s", (item_id,))
        else:
            return _resp(400, {'error': 'Нельзя удалить этот ресурс'})
        conn.commit()
        return _resp(200, {'deleted': True})

    # PUT
    if resource == 'service_status':
        cur.execute("UPDATE services SET status = %s WHERE id = %s RETURNING *", (body.get('status'), item_id))
        conn.commit()
        return _resp(200, {'item': cur.fetchone()})

    if resource == 'service':
        cur.execute(
            "UPDATE services SET title=%s, description=%s, price=%s, format=%s, category_id=%s, "
            "experience_years=%s, tags=%s WHERE id=%s RETURNING *",
            (body.get('title'), body.get('description'), body.get('price'), body.get('format'),
             body.get('category_id'), body.get('experience_years', 0), body.get('tags', ''), item_id))
        conn.commit()
        return _resp(200, {'item': cur.fetchone()})

    if resource == 'booking_status':
        cur.execute("UPDATE bookings SET status = %s WHERE id = %s RETURNING *", (body.get('status'), item_id))
        conn.commit()
        return _resp(200, {'item': cur.fetchone()})

    if resource == 'user_block':
        cur.execute("UPDATE users SET is_blocked = %s WHERE id = %s RETURNING id, is_blocked",
                    (body.get('is_blocked', True), item_id))
        conn.commit()
        return _resp(200, {'item': cur.fetchone()})

    if resource == 'user_role':
        cur.execute("UPDATE users SET role = %s WHERE id = %s RETURNING id, role", (body.get('role'), item_id))
        conn.commit()
        return _resp(200, {'item': cur.fetchone()})

    if resource == 'profile':
        cur.execute(
            "UPDATE users SET full_name=%s, phone=%s, city=%s, bio=%s WHERE id=%s "
            "RETURNING id, full_name, email, role, avatar_url, phone, city, bio, balance, is_blocked",
            (body.get('full_name'), body.get('phone'), body.get('city'), body.get('bio'), uid))
        conn.commit()
        return _resp(200, {'item': cur.fetchone()})

    if resource == 'complaint_status':
        cur.execute("UPDATE complaints SET status = %s WHERE id = %s RETURNING *", (body.get('status'), item_id))
        conn.commit()
        return _resp(200, {'item': cur.fetchone()})

    if resource == 'notification_read':
        cur.execute("UPDATE notifications SET is_read = TRUE WHERE user_id = %s RETURNING id", (uid,))
        conn.commit()
        return _resp(200, {'updated': True})

    return _resp(400, {'error': 'Неизвестный ресурс'})
