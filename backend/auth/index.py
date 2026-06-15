import json
import os
import hashlib
import secrets as pysecrets
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


def _hash(password):
    return hashlib.sha256(password.encode('utf-8')).hexdigest()


def _user_public(row):
    return {
        'id': row['id'],
        'full_name': row['full_name'],
        'email': row['email'],
        'role': row['role'],
        'avatar_url': row['avatar_url'],
        'phone': row['phone'],
        'city': row['city'],
        'bio': row['bio'],
        'balance': float(row['balance']) if row['balance'] is not None else 0,
        'is_blocked': row['is_blocked'],
    }


def handler(event: dict, context) -> dict:
    '''Авторизация и регистрация пользователей с тремя ролями (admin, tutor, student)'''
    method = event.get('httpMethod', 'GET')
    if method == 'OPTIONS':
        return _resp(200, {})

    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    try:
        cur = conn.cursor(cursor_factory=RealDictCursor)
        body = json.loads(event.get('body') or '{}')
        action = body.get('action', '')

        if action == 'login':
            email = (body.get('email') or '').strip().lower()
            password = body.get('password') or ''
            cur.execute("SELECT * FROM users WHERE LOWER(email) = %s", (email,))
            user = cur.fetchone()
            if not user or user['password_hash'] != _hash(password):
                return _resp(401, {'error': 'Неверный email или пароль'})
            if user['is_blocked']:
                return _resp(403, {'error': 'Аккаунт заблокирован'})
            token = pysecrets.token_hex(16)
            return _resp(200, {'token': token, 'user': _user_public(user)})

        if action == 'register':
            full_name = (body.get('full_name') or '').strip()
            email = (body.get('email') or '').strip().lower()
            password = body.get('password') or ''
            role = body.get('role', 'student')
            if role not in ('student', 'tutor'):
                role = 'student'
            if not full_name or not email or len(password) < 4:
                return _resp(400, {'error': 'Заполните все поля, пароль минимум 4 символа'})
            cur.execute("SELECT id FROM users WHERE LOWER(email) = %s", (email,))
            if cur.fetchone():
                return _resp(409, {'error': 'Пользователь с таким email уже существует'})
            avatar = f'https://i.pravatar.cc/150?u={email}'
            cur.execute(
                "INSERT INTO users (full_name, email, password_hash, role, avatar_url) "
                "VALUES (%s, %s, %s, %s, %s) RETURNING *",
                (full_name, email, _hash(password), role, avatar)
            )
            user = cur.fetchone()
            conn.commit()
            token = pysecrets.token_hex(16)
            return _resp(200, {'token': token, 'user': _user_public(user)})

        return _resp(400, {'error': 'Неизвестное действие'})
    finally:
        conn.close()
