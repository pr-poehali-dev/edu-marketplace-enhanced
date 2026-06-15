/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAuth, dashboardPath } from '@/lib/auth';
import { api } from '@/lib/api';
import Stars from '@/components/Stars';

const HERO_IMG = 'https://cdn.poehali.dev/projects/36271f72-d2de-4df7-8cf2-7aa6ca3dbeea/files/110784e4-3788-4264-8266-704647bd5f42.jpg';
const RUB = (n: number) => `${Number(n).toLocaleString('ru-RU')} ₽`;

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

const Index = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [categories, setCategories] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [activeCat, setActiveCat] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [favIds, setFavIds] = useState<number[]>([]);
  const [bookFor, setBookFor] = useState<any>(null);
  const [bookDate, setBookDate] = useState('');
  const [bookComment, setBookComment] = useState('');

  const loadServices = (categoryId?: number | null, q?: string) => {
    api.services({ category_id: categoryId || undefined, search: q || undefined }).then((d) => setServices(d.items || []));
  };

  useEffect(() => {
    api.categories().then((d) => setCategories(d.items || []));
    loadServices();
    if (user && user.role === 'student') {
      api.favorites().then((d) => setFavIds((d.items || []).map((s: any) => s.id)));
    }
  }, [user]);

  const selectCat = (id: number) => {
    const next = activeCat === id ? null : id;
    setActiveCat(next);
    loadServices(next, search);
    document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' });
  };

  const doSearch = () => { loadServices(activeCat, search); document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' }); };

  const requireAuth = () => {
    if (!user) { toast({ title: 'Войдите в аккаунт', description: 'Чтобы продолжить, авторизуйтесь' }); navigate('/login'); return false; }
    return true;
  };

  const toggleFav = async (serviceId: number) => {
    if (!requireAuth()) return;
    const d = await api.toggleFavorite(serviceId);
    setFavIds((p) => d.favorited ? [...p, serviceId] : p.filter((x) => x !== serviceId));
  };

  const openBooking = (s: any) => { if (!requireAuth()) return; setBookFor(s); setBookDate(''); setBookComment(''); };

  const submitBooking = async () => {
    if (!bookFor || !bookDate) { toast({ title: 'Укажите дату занятия', variant: 'destructive' }); return; }
    await api.createBooking({ service_id: bookFor.id, lesson_date: bookDate, comment: bookComment });
    toast({ title: 'Заявка отправлена!', description: 'Репетитор скоро подтвердит занятие' });
    setBookFor(null);
  };

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
            <Button variant="ghost" size="sm" className="font-medium text-foreground/70 hover:text-primary" onClick={() => document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' })}>Каталог</Button>
            <Button variant="ghost" size="sm" className="font-medium text-foreground/70 hover:text-primary" onClick={() => document.getElementById('categories')?.scrollIntoView({ behavior: 'smooth' })}>Категории</Button>
            <Button variant="ghost" size="sm" className="font-medium text-foreground/70 hover:text-primary" onClick={() => document.getElementById('how')?.scrollIntoView({ behavior: 'smooth' })}>Как работает</Button>
            <Button variant="ghost" size="sm" className="font-medium text-foreground/70 hover:text-primary" onClick={() => document.getElementById('footer')?.scrollIntoView({ behavior: 'smooth' })}>Контакты</Button>
          </nav>

          <div className="flex items-center gap-2">
            {user ? (
              <>
                <Button variant="ghost" className="hidden sm:inline-flex gap-2 font-semibold" onClick={() => navigate(dashboardPath(user.role))}>
                  <Avatar className="h-7 w-7"><AvatarImage src={user.avatar_url || undefined} /><AvatarFallback>{user.full_name[0]}</AvatarFallback></Avatar>
                  Кабинет
                </Button>
                <Button variant="ghost" size="icon" onClick={() => { logout(); toast({ title: 'Вы вышли из аккаунта' }); }}><Icon name="LogOut" size={20} /></Button>
              </>
            ) : (
              <>
                <Button variant="ghost" className="hidden sm:inline-flex font-semibold" onClick={() => navigate('/login')}>Войти</Button>
                <Button className="bg-gradient-to-r from-primary to-accent font-semibold text-white shadow-lg shadow-primary/30 hover:opacity-90" onClick={() => navigate('/login')}>
                  Начать
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="container relative grid items-center gap-10 py-12 md:grid-cols-2 md:py-20">
        <div className="animate-fade-in">
          <Badge className="mb-5 border-0 bg-white/70 px-4 py-1.5 text-sm font-semibold text-primary shadow-sm">
            <Icon name="Sparkles" size={14} className="mr-1.5" /> Более 15 000 проверенных преподавателей
          </Badge>
          <h1 className="font-display text-4xl font-black leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
            Найди своего <span className="text-gradient animate-gradient">идеального</span> репетитора
          </h1>
          <p className="mt-5 max-w-md text-lg text-muted-foreground">
            Маркетплейс образовательных услуг по всем предметам: от школьной программы до музыки и программирования.
          </p>

          <div className="mt-8 flex flex-col gap-3 rounded-2xl bg-white p-3 shadow-xl shadow-primary/10 sm:flex-row">
            <div className="relative flex-1">
              <Icon name="Search" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && doSearch()} placeholder="Что хотите изучать?" className="h-12 border-0 bg-secondary/50 pl-10 text-base focus-visible:ring-primary" />
            </div>
            <Button onClick={doSearch} className="h-12 bg-gradient-to-r from-primary to-accent px-6 font-semibold text-white hover:opacity-90">Найти</Button>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-3">
            {[
              { v: '15 000+', l: 'репетиторов' },
              { v: '120 000+', l: 'учеников' },
              { v: '4.9', l: 'средний рейтинг' },
            ].map((s) => (
              <div key={s.l}><div className="font-display text-2xl font-extrabold text-primary">{s.v}</div><div className="text-sm text-muted-foreground">{s.l}</div></div>
            ))}
          </div>
        </div>

        <div className="relative animate-scale-in">
          <div className="absolute -inset-4 rounded-[2.5rem] bg-gradient-to-tr from-primary/30 via-accent/20 to-orange-300/30 blur-2xl" />
          <img src={HERO_IMG} alt="Образование онлайн" className="relative w-full rounded-[2.5rem] shadow-2xl shadow-primary/20 animate-float" />
          <div className="absolute -bottom-4 -left-4 flex items-center gap-3 rounded-2xl bg-white p-3 shadow-xl">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600"><Icon name="BadgeCheck" size={22} /></div>
            <div><div className="text-sm font-bold">Проверенные анкеты</div><div className="text-xs text-muted-foreground">100% преподавателей</div></div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section id="categories" className="container py-12">
        <div className="mb-8 flex items-end justify-between">
          <div><h2 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">Категории услуг</h2><p className="mt-2 text-muted-foreground">Выберите направление обучения</p></div>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {categories.map((cat) => (
            <button key={cat.id} onClick={() => selectCat(cat.id)}
              className={`group flex flex-col items-start gap-3 rounded-2xl border bg-white p-4 text-left transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10 ${activeCat === cat.id ? 'border-primary ring-2 ring-primary/30' : 'border-border'}`}>
              <div className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${cat.color} text-white shadow-lg`}><Icon name={cat.icon} size={22} /></div>
              <div><div className="text-sm font-semibold leading-tight">{cat.name}</div><div className="mt-0.5 text-xs text-muted-foreground">{cat.description?.slice(0, 28)}</div></div>
            </button>
          ))}
        </div>
      </section>

      {/* Tutors catalog */}
      <section id="catalog" className="container py-12">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div><h2 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">Каталог репетиторов</h2>
            <p className="mt-2 text-muted-foreground">{activeCat ? categories.find((c) => c.id === activeCat)?.name : 'Лучшие преподаватели по отзывам'} · найдено {services.length}</p></div>
          {activeCat && <Button variant="outline" onClick={() => selectCat(activeCat)} className="font-semibold"><Icon name="X" size={16} className="mr-1" /> Сбросить фильтр</Button>}
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((t) => (
            <Card key={t.id} className="group overflow-hidden border-border/70 bg-white transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary/10">
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <Avatar className="h-16 w-16 ring-2 ring-primary/10"><AvatarImage src={t.tutor_avatar} alt={t.tutor_name} /><AvatarFallback>{t.tutor_name[0]}</AvatarFallback></Avatar>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div><h3 className="font-display font-bold leading-tight">{t.tutor_name}</h3><p className="text-sm text-muted-foreground">{t.category_name}</p></div>
                      <Button variant="ghost" size="icon" className={`h-8 w-8 shrink-0 ${favIds.includes(t.id) ? 'text-accent' : 'text-muted-foreground'} hover:text-accent`} onClick={() => toggleFav(t.id)}>
                        <Icon name="Heart" size={18} className={favIds.includes(t.id) ? 'fill-current' : ''} />
                      </Button>
                    </div>
                    <div className="mt-2 flex items-center gap-2"><Stars value={t.rating} /><span className="text-sm font-bold">{t.rating}</span><span className="text-xs text-muted-foreground">({t.reviews_count})</span></div>
                  </div>
                </div>
                <p className="mt-3 line-clamp-2 text-sm font-medium">{t.title}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {(t.tags || '').split(',').filter(Boolean).slice(0, 3).map((tag: string) => (
                    <Badge key={tag} variant="secondary" className="bg-secondary font-medium text-secondary-foreground">{tag.trim()}</Badge>
                  ))}
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-4">
                  <div><span className="font-display text-xl font-extrabold text-primary">{RUB(t.price)}</span><span className="text-sm text-muted-foreground"> / час</span>
                    <div className="text-xs text-muted-foreground">{t.experience_years} лет опыта</div></div>
                  <Button className="bg-gradient-to-r from-primary to-accent font-semibold text-white hover:opacity-90" onClick={() => openBooking(t)}>Записаться</Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {services.length === 0 && <p className="col-span-full text-center text-muted-foreground">По вашему запросу ничего не найдено</p>}
        </div>
      </section>

      {/* Features */}
      <section className="container py-12">
        <div className="mb-10 text-center"><h2 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">Всё для удобного обучения</h2>
          <p className="mx-auto mt-2 max-w-xl text-muted-foreground">Современная платформа с инструментами для учеников и преподавателей</p></div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <Card key={f.title} className="border-border/70 bg-white transition-all hover:shadow-xl hover:shadow-primary/5"><CardContent className="p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 text-primary"><Icon name={f.icon} size={24} /></div>
              <h3 className="font-display text-lg font-bold">{f.title}</h3><p className="mt-1.5 text-sm text-muted-foreground">{f.text}</p>
            </CardContent></Card>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="container py-12">
        <div className="rounded-[2rem] bg-gradient-to-br from-primary via-purple-600 to-accent p-8 text-white shadow-2xl shadow-primary/30 sm:p-12">
          <h2 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">Как это работает</h2>
          <p className="mt-2 max-w-md text-white/80">Начать обучение можно за три простых шага</p>
          <div className="mt-10 grid gap-8 md:grid-cols-3">
            {STEPS.map((s) => (
              <div key={s.n} className="relative"><div className="font-display text-5xl font-black text-white/25">{s.n}</div>
                <h3 className="mt-2 font-display text-xl font-bold">{s.title}</h3><p className="mt-1.5 text-white/80">{s.text}</p></div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container py-12">
        <Card className="overflow-hidden border-0 bg-white shadow-xl"><CardContent className="flex flex-col items-center gap-6 p-8 text-center sm:p-12">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent text-white shadow-lg shadow-primary/30"><Icon name="Rocket" size={32} /></div>
          <div><h2 className="font-display text-2xl font-extrabold tracking-tight sm:text-3xl">Вы — преподаватель?</h2>
            <p className="mx-auto mt-2 max-w-lg text-muted-foreground">Создайте анкету, разместите свои услуги и начните зарабатывать на любимом деле. Тысячи учеников уже ищут вас.</p></div>
          <div className="flex flex-wrap justify-center gap-3">
            <Button size="lg" className="bg-gradient-to-r from-primary to-accent font-semibold text-white hover:opacity-90" onClick={() => navigate('/login')}>Стать репетитором</Button>
          </div>
        </CardContent></Card>
      </section>

      {/* Footer */}
      <footer id="footer" className="mt-12 border-t border-border/60 bg-white/50">
        <div className="container grid gap-8 py-12 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-2"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent text-white"><Icon name="GraduationCap" size={20} /></div>
              <span className="font-display text-xl font-extrabold">Наставник</span></div>
            <p className="mt-3 text-sm text-muted-foreground">Маркетплейс образовательных услуг и репетиторов №1 в России.</p>
          </div>
          {[
            { t: 'Ученикам', l: ['Каталог', 'Как выбрать', 'Отзывы', 'Избранное'] },
            { t: 'Репетиторам', l: ['Разместить услугу', 'Кабинет', 'Финансы', 'Статистика'] },
            { t: 'Компания', l: ['О нас', 'Блог', 'Контакты', 'Поддержка'] },
          ].map((col) => (
            <div key={col.t}><h4 className="font-display font-bold">{col.t}</h4>
              <ul className="mt-3 space-y-2">{col.l.map((l) => (<li key={l}><a href="#" className="text-sm text-muted-foreground transition-colors hover:text-primary">{l}</a></li>))}</ul></div>
          ))}
        </div>
        <div className="border-t border-border/60"><div className="container flex flex-col items-center justify-between gap-3 py-5 sm:flex-row">
          <p className="text-sm text-muted-foreground">© 2024 Наставник. Все права защищены.</p>
          <div className="flex gap-2">{['Send', 'Instagram', 'Youtube', 'Facebook'].map((s) => (<Button key={s} variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-primary"><Icon name={s} size={18} /></Button>))}</div>
        </div></div>
      </footer>

      {/* Booking dialog */}
      <Dialog open={!!bookFor} onOpenChange={(o) => !o && setBookFor(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Запись на занятие</DialogTitle></DialogHeader>
          {bookFor && (
            <div className="space-y-3">
              <div className="flex items-center gap-3 rounded-xl bg-secondary/50 p-3">
                <Avatar className="h-12 w-12"><AvatarImage src={bookFor.tutor_avatar} /><AvatarFallback>{bookFor.tutor_name[0]}</AvatarFallback></Avatar>
                <div><div className="font-bold">{bookFor.tutor_name}</div><div className="text-sm text-muted-foreground">{bookFor.title}</div>
                  <div className="font-display font-extrabold text-primary">{RUB(bookFor.price)}/час</div></div>
              </div>
              <div><Label>Дата и время занятия</Label><Input type="datetime-local" value={bookDate} onChange={(e) => setBookDate(e.target.value)} className="mt-1.5" /></div>
              <div><Label>Комментарий репетитору</Label><Textarea rows={2} placeholder="Что хотите изучить?" value={bookComment} onChange={(e) => setBookComment(e.target.value)} className="mt-1.5" /></div>
            </div>
          )}
          <DialogFooter><Button onClick={submitBooking} className="w-full bg-gradient-to-r from-primary to-accent text-white">Отправить заявку</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;