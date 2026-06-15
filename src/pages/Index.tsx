import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';

const HERO_IMG = 'https://cdn.poehali.dev/projects/36271f72-d2de-4df7-8cf2-7aa6ca3dbeea/files/110784e4-3788-4264-8266-704647bd5f42.jpg';

const CATEGORIES = [
  { name: 'Математика', icon: 'Sigma', count: 1240, color: 'from-violet-500 to-purple-600' },
  { name: 'Русский язык', icon: 'BookOpen', count: 890, color: 'from-pink-500 to-rose-600' },
  { name: 'Иностранные языки', icon: 'Languages', count: 2130, color: 'from-blue-500 to-indigo-600' },
  { name: 'Физика и астрономия', icon: 'Atom', count: 540, color: 'from-cyan-500 to-blue-600' },
  { name: 'Химия и биология', icon: 'FlaskConical', count: 470, color: 'from-emerald-500 to-teal-600' },
  { name: 'История, общество', icon: 'Landmark', count: 610, color: 'from-amber-500 to-orange-600' },
  { name: 'ЕГЭ / ОГЭ / ВПР', icon: 'GraduationCap', count: 1830, color: 'from-fuchsia-500 to-purple-600' },
  { name: 'Начальная школа', icon: 'Pencil', count: 720, color: 'from-rose-500 to-pink-600' },
  { name: 'Программирование', icon: 'Code2', count: 980, color: 'from-slate-600 to-violet-600' },
  { name: 'Музыка', icon: 'Music', count: 430, color: 'from-purple-500 to-fuchsia-600' },
  { name: 'Танцы и хореография', icon: 'PersonStanding', count: 210, color: 'from-pink-500 to-orange-500' },
  { name: 'Спорт и фитнес', icon: 'Dumbbell', count: 350, color: 'from-lime-500 to-emerald-600' },
  { name: 'Логопедия', icon: 'MessageCircle', count: 290, color: 'from-sky-500 to-cyan-600' },
  { name: 'Психология', icon: 'Brain', count: 380, color: 'from-indigo-500 to-violet-600' },
  { name: 'Для взрослых', icon: 'Briefcase', count: 560, color: 'from-teal-500 to-cyan-600' },
  { name: 'Творчество, рисование', icon: 'Palette', count: 320, color: 'from-orange-500 to-rose-600' },
  { name: 'Подготовка к школе', icon: 'Backpack', count: 410, color: 'from-violet-500 to-pink-600' },
  { name: 'Онлайн-курсы', icon: 'MonitorPlay', count: 1120, color: 'from-blue-500 to-purple-600' },
];

const TUTORS = [
  {
    name: 'Анна Соколова', subject: 'Математика, подготовка к ЕГЭ', price: 1500, rating: 4.9, reviews: 187,
    tags: ['ЕГЭ', 'Алгебра', 'Геометрия'], exp: '12 лет опыта', online: true,
    img: 'https://i.pravatar.cc/150?img=47',
  },
  {
    name: 'Дмитрий Орлов', subject: 'Английский язык', price: 1200, rating: 4.8, reviews: 243,
    tags: ['Разговорный', 'IELTS', 'Бизнес'], exp: '8 лет опыта', online: true,
    img: 'https://i.pravatar.cc/150?img=12',
  },
  {
    name: 'Елена Морозова', subject: 'Русский язык и литература', price: 1300, rating: 5.0, reviews: 156,
    tags: ['ОГЭ', 'Сочинение', 'Грамотность'], exp: '15 лет опыта', online: false,
    img: 'https://i.pravatar.cc/150?img=45',
  },
  {
    name: 'Максим Волков', subject: 'Программирование Python', price: 2000, rating: 4.9, reviews: 98,
    tags: ['Python', 'Web', 'Алгоритмы'], exp: '6 лет опыта', online: true,
    img: 'https://i.pravatar.cc/150?img=33',
  },
  {
    name: 'Ольга Кузнецова', subject: 'Фортепиано, теория музыки', price: 1800, rating: 4.9, reviews: 74,
    tags: ['Фортепиано', 'Вокал', 'Сольфеджио'], exp: '20 лет опыта', online: false,
    img: 'https://i.pravatar.cc/150?img=20',
  },
  {
    name: 'Игорь Лебедев', subject: 'Физика, астрономия', price: 1600, rating: 4.7, reviews: 132,
    tags: ['ЕГЭ', 'Механика', 'Олимпиады'], exp: '10 лет опыта', online: true,
    img: 'https://i.pravatar.cc/150?img=15',
  },
];

const FEATURES = [
  { icon: 'CalendarCheck', title: 'Умный календарь', text: 'Записывайтесь на занятия в пару кликов, переносите и отслеживайте расписание.' },
  { icon: 'CreditCard', title: 'Безопасные платежи', text: 'Оплата онлайн с защитой средств. Деньги репетитору — только после занятия.' },
  { icon: 'Star', title: 'Честный рейтинг', text: 'Реальные отзывы учеников и проверенные анкеты преподавателей.' },
  { icon: 'Bell', title: 'Уведомления', text: 'Напоминания о занятиях, новых сообщениях и акциях прямо в браузере.' },
  { icon: 'SlidersHorizontal', title: 'Точные фильтры', text: 'Подбор по цене, предмету, формату, рейтингу и опыту преподавателя.' },
  { icon: 'MessagesSquare', title: 'Чат с репетитором', text: 'Обсуждайте детали и задавайте вопросы до начала занятий.' },
];

const STEPS = [
  { n: '01', title: 'Выберите предмет', text: 'Найдите нужную категорию или воспользуйтесь поиском.' },
  { n: '02', title: 'Сравните анкеты', text: 'Изучите рейтинг, отзывы, цены и опыт преподавателей.' },
  { n: '03', title: 'Запишитесь и учитесь', text: 'Забронируйте удобное время и оплатите занятие онлайн.' },
];

function Stars({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Icon
          key={i}
          name="Star"
          size={14}
          className={i <= Math.round(value) ? 'text-amber-400 fill-amber-400' : 'text-muted-foreground/30'}
        />
      ))}
    </div>
  );
}

const Index = () => {
  const [activeCat, setActiveCat] = useState<string | null>(null);

  const navLinks = ['Главная', 'Каталог', 'Поиск', 'Кабинет', 'Контакты'];

  return (
    <div className="min-h-screen bg-mesh font-sans text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-border/60">
        <div className="container flex h-16 items-center justify-between gap-4">
          <a href="#" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent text-white shadow-lg shadow-primary/30">
              <Icon name="GraduationCap" size={20} />
            </div>
            <span className="font-display text-xl font-extrabold tracking-tight">Наставник</span>
          </a>

          <nav className="hidden items-center gap-1 md:flex">
            {navLinks.map((l) => (
              <Button key={l} variant="ghost" size="sm" className="font-medium text-foreground/70 hover:text-primary">
                {l}
              </Button>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="relative">
              <Icon name="Heart" size={20} />
            </Button>
            <Button variant="ghost" size="icon" className="relative">
              <Icon name="ShoppingCart" size={20} />
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-white">2</span>
            </Button>
            <Button variant="ghost" className="hidden sm:inline-flex font-semibold">Войти</Button>
            <Button className="bg-gradient-to-r from-primary to-accent font-semibold text-white shadow-lg shadow-primary/30 hover:opacity-90">
              Стать репетитором
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="container relative grid items-center gap-10 py-12 md:grid-cols-2 md:py-20">
        <div className="animate-fade-in">
          <Badge className="mb-5 border-0 bg-white/70 px-4 py-1.5 text-sm font-semibold text-primary shadow-sm">
            <Icon name="Sparkles" size={14} className="mr-1.5" />
            Более 15 000 проверенных преподавателей
          </Badge>
          <h1 className="font-display text-4xl font-black leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
            Найди своего <span className="text-gradient animate-gradient">идеального</span> репетитора
          </h1>
          <p className="mt-5 max-w-md text-lg text-muted-foreground">
            Маркетплейс образовательных услуг по всем предметам: от школьной программы до музыки и программирования.
          </p>

          {/* Search bar */}
          <div className="mt-8 flex flex-col gap-3 rounded-2xl bg-white p-3 shadow-xl shadow-primary/10 sm:flex-row">
            <div className="relative flex-1">
              <Icon name="Search" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Что хотите изучать?" className="h-12 border-0 bg-secondary/50 pl-10 text-base focus-visible:ring-primary" />
            </div>
            <Select>
              <SelectTrigger className="h-12 border-0 bg-secondary/50 sm:w-40">
                <SelectValue placeholder="Формат" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="online">Онлайн</SelectItem>
                <SelectItem value="offline">Очно</SelectItem>
                <SelectItem value="any">Любой</SelectItem>
              </SelectContent>
            </Select>
            <Button className="h-12 bg-gradient-to-r from-primary to-accent px-6 font-semibold text-white hover:opacity-90">
              Найти
            </Button>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-3">
            {[
              { v: '15 000+', l: 'репетиторов' },
              { v: '120 000+', l: 'учеников' },
              { v: '4.9', l: 'средний рейтинг' },
            ].map((s) => (
              <div key={s.l}>
                <div className="font-display text-2xl font-extrabold text-primary">{s.v}</div>
                <div className="text-sm text-muted-foreground">{s.l}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative animate-scale-in">
          <div className="absolute -inset-4 rounded-[2.5rem] bg-gradient-to-tr from-primary/30 via-accent/20 to-orange-300/30 blur-2xl" />
          <img
            src={HERO_IMG}
            alt="Образование онлайн"
            className="relative w-full rounded-[2.5rem] shadow-2xl shadow-primary/20 animate-float"
          />
          <div className="absolute -bottom-4 -left-4 flex items-center gap-3 rounded-2xl bg-white p-3 shadow-xl">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
              <Icon name="BadgeCheck" size={22} />
            </div>
            <div>
              <div className="text-sm font-bold">Проверенные анкеты</div>
              <div className="text-xs text-muted-foreground">100% преподавателей</div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="container py-12">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">Категории услуг</h2>
            <p className="mt-2 text-muted-foreground">Выберите направление обучения</p>
          </div>
          <Button variant="ghost" className="hidden font-semibold text-primary sm:inline-flex">
            Все категории <Icon name="ArrowRight" size={16} className="ml-1" />
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.name}
              onClick={() => setActiveCat(cat.name)}
              className={`group flex flex-col items-start gap-3 rounded-2xl border bg-white p-4 text-left transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10 ${
                activeCat === cat.name ? 'border-primary ring-2 ring-primary/30' : 'border-border'
              }`}
            >
              <div className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${cat.color} text-white shadow-lg`}>
                <Icon name={cat.icon} size={22} />
              </div>
              <div>
                <div className="text-sm font-semibold leading-tight">{cat.name}</div>
                <div className="mt-0.5 text-xs text-muted-foreground">{cat.count} анкет</div>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Tutors catalog */}
      <section className="container py-12">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">Топ репетиторов</h2>
            <p className="mt-2 text-muted-foreground">Лучшие преподаватели по отзывам учеников</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2 font-semibold">
              <Icon name="SlidersHorizontal" size={16} /> Фильтры
            </Button>
            <Select>
              <SelectTrigger className="w-44 font-medium">
                <SelectValue placeholder="Сортировка" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rating">По рейтингу</SelectItem>
                <SelectItem value="price-asc">Сначала дешевле</SelectItem>
                <SelectItem value="price-desc">Сначала дороже</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {TUTORS.map((t) => (
            <Card key={t.name} className="group overflow-hidden border-border/70 bg-white transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary/10">
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <div className="relative">
                    <Avatar className="h-16 w-16 ring-2 ring-primary/10">
                      <AvatarImage src={t.img} alt={t.name} />
                      <AvatarFallback>{t.name[0]}</AvatarFallback>
                    </Avatar>
                    {t.online && (
                      <span className="absolute bottom-0.5 right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-500" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-display font-bold leading-tight">{t.name}</h3>
                        <p className="text-sm text-muted-foreground">{t.subject}</p>
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 text-muted-foreground hover:text-accent">
                        <Icon name="Heart" size={18} />
                      </Button>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <Stars value={t.rating} />
                      <span className="text-sm font-bold">{t.rating}</span>
                      <span className="text-xs text-muted-foreground">({t.reviews} отзывов)</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-1.5">
                  {t.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="bg-secondary font-medium text-secondary-foreground">
                      {tag}
                    </Badge>
                  ))}
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-4">
                  <div>
                    <span className="font-display text-xl font-extrabold text-primary">{t.price} ₽</span>
                    <span className="text-sm text-muted-foreground"> / час</span>
                    <div className="text-xs text-muted-foreground">{t.exp}</div>
                  </div>
                  <Button className="bg-gradient-to-r from-primary to-accent font-semibold text-white hover:opacity-90">
                    Записаться
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-10 flex justify-center">
          <Button variant="outline" size="lg" className="gap-2 font-semibold">
            Показать ещё репетиторов <Icon name="ChevronDown" size={18} />
          </Button>
        </div>
      </section>

      {/* Features */}
      <section className="container py-12">
        <div className="mb-10 text-center">
          <h2 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">Всё для удобного обучения</h2>
          <p className="mx-auto mt-2 max-w-xl text-muted-foreground">
            Современная платформа с инструментами для учеников и преподавателей
          </p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <Card key={f.title} className="border-border/70 bg-white transition-all hover:shadow-xl hover:shadow-primary/5">
              <CardContent className="p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 text-primary">
                  <Icon name={f.icon} size={24} />
                </div>
                <h3 className="font-display text-lg font-bold">{f.title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{f.text}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="container py-12">
        <div className="rounded-[2rem] bg-gradient-to-br from-primary via-purple-600 to-accent p-8 text-white shadow-2xl shadow-primary/30 sm:p-12">
          <h2 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">Как это работает</h2>
          <p className="mt-2 max-w-md text-white/80">Начать обучение можно за три простых шага</p>
          <div className="mt-10 grid gap-8 md:grid-cols-3">
            {STEPS.map((s) => (
              <div key={s.n} className="relative">
                <div className="font-display text-5xl font-black text-white/25">{s.n}</div>
                <h3 className="mt-2 font-display text-xl font-bold">{s.title}</h3>
                <p className="mt-1.5 text-white/80">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container py-12">
        <Card className="overflow-hidden border-0 bg-white shadow-xl">
          <CardContent className="flex flex-col items-center gap-6 p-8 text-center sm:p-12">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent text-white shadow-lg shadow-primary/30">
              <Icon name="Rocket" size={32} />
            </div>
            <div>
              <h2 className="font-display text-2xl font-extrabold tracking-tight sm:text-3xl">Вы — преподаватель?</h2>
              <p className="mx-auto mt-2 max-w-lg text-muted-foreground">
                Создайте анкету, разместите свои услуги и начните зарабатывать на любимом деле. Тысячи учеников уже ищут вас.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-3">
              <Button size="lg" className="bg-gradient-to-r from-primary to-accent font-semibold text-white hover:opacity-90">
                Разместить услугу
              </Button>
              <Button size="lg" variant="outline" className="font-semibold">
                Узнать подробнее
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="mt-12 border-t border-border/60 bg-white/50">
        <div className="container grid gap-8 py-12 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent text-white">
                <Icon name="GraduationCap" size={20} />
              </div>
              <span className="font-display text-xl font-extrabold">Наставник</span>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              Маркетплейс образовательных услуг и репетиторов №1 в России.
            </p>
          </div>
          {[
            { t: 'Ученикам', l: ['Каталог', 'Как выбрать', 'Отзывы', 'Избранное'] },
            { t: 'Репетиторам', l: ['Разместить услугу', 'Кабинет', 'Финансы', 'Статистика'] },
            { t: 'Компания', l: ['О нас', 'Блог', 'Контакты', 'Поддержка'] },
          ].map((col) => (
            <div key={col.t}>
              <h4 className="font-display font-bold">{col.t}</h4>
              <ul className="mt-3 space-y-2">
                {col.l.map((l) => (
                  <li key={l}>
                    <a href="#" className="text-sm text-muted-foreground transition-colors hover:text-primary">{l}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-border/60">
          <div className="container flex flex-col items-center justify-between gap-3 py-5 sm:flex-row">
            <p className="text-sm text-muted-foreground">© 2024 Наставник. Все права защищены.</p>
            <div className="flex gap-2">
              {['Send', 'Instagram', 'Youtube', 'Facebook'].map((s) => (
                <Button key={s} variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-primary">
                  <Icon name={s} size={18} />
                </Button>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
