CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'student' CHECK (role IN ('admin','tutor','student')),
    avatar_url TEXT,
    phone VARCHAR(50),
    city VARCHAR(120),
    bio TEXT,
    is_blocked BOOLEAN NOT NULL DEFAULT FALSE,
    balance NUMERIC(12,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(160) NOT NULL,
    icon VARCHAR(80) NOT NULL DEFAULT 'BookOpen',
    color VARCHAR(120) NOT NULL DEFAULT 'from-violet-500 to-purple-600',
    description TEXT,
    sort_order INT NOT NULL DEFAULT 0
);

CREATE TABLE services (
    id SERIAL PRIMARY KEY,
    tutor_id INT NOT NULL REFERENCES users(id),
    category_id INT NOT NULL REFERENCES categories(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    price NUMERIC(10,2) NOT NULL DEFAULT 0,
    format VARCHAR(20) NOT NULL DEFAULT 'online' CHECK (format IN ('online','offline','any')),
    experience_years INT NOT NULL DEFAULT 0,
    rating NUMERIC(3,2) NOT NULL DEFAULT 0,
    reviews_count INT NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
    tags TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE bookings (
    id SERIAL PRIMARY KEY,
    service_id INT NOT NULL REFERENCES services(id),
    student_id INT NOT NULL REFERENCES users(id),
    tutor_id INT NOT NULL REFERENCES users(id),
    lesson_date TIMESTAMP NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'new' CHECK (status IN ('new','confirmed','completed','cancelled')),
    price NUMERIC(10,2) NOT NULL DEFAULT 0,
    comment TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE reviews (
    id SERIAL PRIMARY KEY,
    service_id INT NOT NULL REFERENCES services(id),
    student_id INT NOT NULL REFERENCES users(id),
    tutor_id INT NOT NULL REFERENCES users(id),
    rating INT NOT NULL DEFAULT 5 CHECK (rating BETWEEN 1 AND 5),
    text TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id),
    booking_id INT REFERENCES bookings(id),
    amount NUMERIC(12,2) NOT NULL,
    type VARCHAR(20) NOT NULL DEFAULT 'payment' CHECK (type IN ('payment','payout','refund')),
    status VARCHAR(20) NOT NULL DEFAULT 'completed' CHECK (status IN ('pending','completed','failed')),
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE favorites (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id),
    service_id INT NOT NULL REFERENCES services(id),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, service_id)
);

CREATE TABLE complaints (
    id SERIAL PRIMARY KEY,
    author_id INT NOT NULL REFERENCES users(id),
    target_type VARCHAR(20) NOT NULL DEFAULT 'service',
    target_id INT,
    reason VARCHAR(255) NOT NULL,
    text TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'open' CHECK (status IN ('open','resolved','rejected')),
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE articles (
    id SERIAL PRIMARY KEY,
    author_id INT REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    excerpt TEXT,
    content TEXT,
    cover_url TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'published' CHECK (status IN ('draft','published')),
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    text TEXT,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    icon VARCHAR(80) NOT NULL DEFAULT 'Bell',
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_services_tutor ON services(tutor_id);
CREATE INDEX idx_services_category ON services(category_id);
CREATE INDEX idx_bookings_student ON bookings(student_id);
CREATE INDEX idx_bookings_tutor ON bookings(tutor_id);
CREATE INDEX idx_reviews_service ON reviews(service_id);
CREATE INDEX idx_notifications_user ON notifications(user_id);