INSERT INTO categories (name, icon, color, description, sort_order) VALUES
('Математика', 'Sigma', 'from-violet-500 to-purple-600', 'Алгебра, геометрия, высшая математика', 1),
('Русский язык и литература', 'BookOpen', 'from-pink-500 to-rose-600', 'Грамотность, сочинения, литература', 2),
('Иностранные языки', 'Languages', 'from-blue-500 to-indigo-600', 'Английский, немецкий, французский, испанский, китайский', 3),
('Физика и астрономия', 'Atom', 'from-cyan-500 to-blue-600', 'Механика, оптика, астрономия', 4),
('Химия и биология', 'FlaskConical', 'from-emerald-500 to-teal-600', 'Органика, неорганика, биология', 5),
('История и обществознание', 'Landmark', 'from-amber-500 to-orange-600', 'История России и мира, обществознание', 6),
('Подготовка к ЕГЭ / ОГЭ / ВПР', 'GraduationCap', 'from-fuchsia-500 to-purple-600', 'Подготовка к экзаменам по всем предметам', 7),
('Начальная школа', 'Pencil', 'from-rose-500 to-pink-600', 'Все предметы начальной школы', 8),
('Программирование и IT', 'Code2', 'from-slate-600 to-violet-600', 'Python, веб-разработка, алгоритмы', 9),
('Музыка', 'Music', 'from-purple-500 to-fuchsia-600', 'Фортепиано, гитара, вокал, теория музыки', 10),
('Танцы и хореография', 'PersonStanding', 'from-pink-500 to-orange-500', 'Современные и классические танцы', 11),
('Спорт и фитнес', 'Dumbbell', 'from-lime-500 to-emerald-600', 'Индивидуальные тренировки', 12),
('Логопедия и развитие речи', 'MessageCircle', 'from-sky-500 to-cyan-600', 'Постановка звуков, развитие речи', 13),
('Психология и профориентация', 'Brain', 'from-indigo-500 to-violet-600', 'Психология, выбор профессии', 14),
('Репетиторы для взрослых', 'Briefcase', 'from-teal-500 to-cyan-600', 'Бизнес-английский, экзамены для взрослых', 15),
('Творчество и рисование', 'Palette', 'from-orange-500 to-rose-600', 'Рисование, живопись, дизайн', 16),
('Подготовка к школе', 'Backpack', 'from-violet-500 to-pink-600', 'Чтение, счёт, подготовка к 1 классу', 17),
('Онлайн-курсы и вебинары', 'MonitorPlay', 'from-blue-500 to-purple-600', 'Курсы по любым направлениям', 18);

-- Пароль у всех: "123456" (демо-хеш sha256)
-- Админы
INSERT INTO users (full_name, email, password_hash, role, avatar_url, phone, city, bio, balance) VALUES
('Сергей Администраторов', 'admin@nastavnik.ru', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', 'admin', 'https://i.pravatar.cc/150?img=68', '+7 900 100-10-01', 'Москва', 'Главный администратор платформы', 0),
('Мария Контролёва', 'moderator@nastavnik.ru', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', 'admin', 'https://i.pravatar.cc/150?img=49', '+7 900 100-10-02', 'Санкт-Петербург', 'Модератор услуг и жалоб', 0);

-- Репетиторы
INSERT INTO users (full_name, email, password_hash, role, avatar_url, phone, city, bio, balance) VALUES
('Анна Соколова', 'anna@nastavnik.ru', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', 'tutor', 'https://i.pravatar.cc/150?img=47', '+7 901 111-22-33', 'Москва', 'Преподаватель математики с 12-летним стажем, эксперт ЕГЭ', 84500),
('Дмитрий Орлов', 'dmitry@nastavnik.ru', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', 'tutor', 'https://i.pravatar.cc/150?img=12', '+7 902 222-33-44', 'Казань', 'Преподаватель английского, сертификат CELTA, подготовка к IELTS', 67200),
('Елена Морозова', 'elena@nastavnik.ru', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', 'tutor', 'https://i.pravatar.cc/150?img=45', '+7 903 333-44-55', 'Москва', 'Учитель русского языка высшей категории, 15 лет в профессии', 92100),
('Максим Волков', 'maksim@nastavnik.ru', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', 'tutor', 'https://i.pravatar.cc/150?img=33', '+7 904 444-55-66', 'Новосибирск', 'Senior Python разработчик, преподаю программирование с нуля', 53800),
('Ольга Кузнецова', 'olga@nastavnik.ru', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', 'tutor', 'https://i.pravatar.cc/150?img=20', '+7 905 555-66-77', 'Екатеринбург', 'Пианистка, выпускница консерватории, преподаю фортепиано и вокал', 71400),
('Игорь Лебедев', 'igor@nastavnik.ru', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', 'tutor', 'https://i.pravatar.cc/150?img=15', '+7 906 666-77-88', 'Москва', 'Кандидат физ-мат наук, готовлю к олимпиадам и ЕГЭ по физике', 48900),
('Наталья Зайцева', 'natalya@nastavnik.ru', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', 'tutor', 'https://i.pravatar.cc/150?img=31', '+7 907 777-88-99', 'Самара', 'Логопед-дефектолог, опыт работы с детьми 10 лет', 39600),
('Павел Семёнов', 'pavel@nastavnik.ru', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', 'tutor', 'https://i.pravatar.cc/150?img=51', '+7 908 888-99-00', 'Нижний Новгород', 'Преподаватель химии и биологии, готовлю к поступлению в медвузы', 61300);

-- Ученики
INSERT INTO users (full_name, email, password_hash, role, avatar_url, phone, city, bio, balance) VALUES
('Иван Петров', 'ivan@mail.ru', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', 'student', 'https://i.pravatar.cc/150?img=3', '+7 910 111-00-11', 'Москва', 'Готовлюсь к ЕГЭ по математике и физике', 5000),
('Анастасия Иванова', 'nastya@mail.ru', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', 'student', 'https://i.pravatar.cc/150?img=44', '+7 910 222-00-22', 'Казань', 'Изучаю английский для работы', 8500),
('Алексей Смирнов', 'alex@mail.ru', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', 'student', 'https://i.pravatar.cc/150?img=53', '+7 910 333-00-33', 'Новосибирск', 'Хочу научиться программировать', 3200),
('Дарья Кузьмина', 'darya@mail.ru', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', 'student', 'https://i.pravatar.cc/150?img=16', '+7 910 444-00-44', 'Москва', 'Учусь играть на фортепиано', 12000),
('Михаил Новиков', 'mikhail@mail.ru', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', 'student', 'https://i.pravatar.cc/150?img=60', '+7 910 555-00-55', 'Екатеринбург', 'Подтягиваю русский язык перед ОГЭ', 4700);