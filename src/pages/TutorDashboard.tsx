/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar } from '@/components/ui/calendar';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';
import DashboardLayout from '@/components/DashboardLayout';
import Stars from '@/components/Stars';

const NAV = [
  { key: 'overview', label: 'Статистика', icon: 'LayoutDashboard' },
  { key: 'services', label: 'Мои услуги', icon: 'BookOpen' },
  { key: 'calendar', label: 'Календарь занятий', icon: 'CalendarDays' },
  { key: 'reviews', label: 'Отзывы', icon: 'Star' },
  { key: 'finance', label: 'Финансы', icon: 'Wallet' },
  { key: 'profile', label: 'Личные данные', icon: 'User' },
];

const RUB = (n: number) => `${Number(n).toLocaleString('ru-RU')} ₽`;
const EMPTY = { id: 0, title: '', description: '', price: 1000, format: 'online', category_id: 1, experience_years: 1, tags: '' };
const ST: Record<string, { l: string; c: string }> = {
  new: { l: 'Новая', c: 'bg-blue-100 text-blue-700' },
  confirmed: { l: 'Подтверждена', c: 'bg-emerald-100 text-emerald-700' },
  completed: { l: 'Завершена', c: 'bg-gray-100 text-gray-600' },
  cancelled: { l: 'Отменена', c: 'bg-red-100 text-red-700' },
};

export default function TutorDashboard() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [tab, setTab] = useState('overview');

  const [stats, setStats] = useState<any>(null);
  const [services, setServices] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [form, setForm] = useState<any>(EMPTY);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [profile, setProfile] = useState({ full_name: '', phone: '', city: '', bio: '' });

  const load = () => {
    api.tutorStats().then(setStats);
    api.services({ tutor_id: user!.id, status: 'all' }).then((d) => setServices(d.items || []));
    api.bookings('tutor').then((d) => setBookings(d.items || []));
    api.reviews(user!.id).then((d) => setReviews(d.items || []));
    api.transactions().then((d) => setTransactions(d.items || []));
  };

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    if (user.role !== 'tutor') { navigate('/'); return; }
    api.categories().then((d) => setCategories(d.items || []));
    setProfile({ full_name: user.full_name, phone: user.phone || '', city: user.city || '', bio: user.bio || '' });
    load();
  }, [user, navigate]);

  const openNew = () => { setForm(EMPTY); setDialogOpen(true); };
  const openEdit = (s: any) => { setForm({ ...s, category_id: s.category_id }); setDialogOpen(true); };

  const saveService = async () => {
    if (!form.title) return;
    if (form.id) {
      const d = await api.updateService(form);
      if (d.item) setServices((p) => p.map((x) => x.id === form.id ? { ...x, ...d.item } : x));
      toast({ title: 'Услуга обновлена' });
    } else {
      const d = await api.createService(form);
      if (d.item) { setServices((p) => [d.item, ...p]); toast({ title: 'Услуга создана и отправлена на модерацию' }); }
    }
    setDialogOpen(false);
  };

  const removeService = async (id: number) => {
    await api.deleteService(id);
    setServices((p) => p.filter((x) => x.id !== id));
    toast({ title: 'Услуга удалена' });
  };

  const setBookingStatus = async (b: any, status: string) => {
    await api.setBookingStatus(b.id, status);
    setBookings((p) => p.map((x) => x.id === b.id ? { ...x, status } : x));
    toast({ title: 'Статус занятия обновлён' });
  };

  const saveProfile = async () => {
    const d = await api.updateProfile(profile);
    if (d.item) { setUser({ ...user!, ...d.item }); toast({ title: 'Профиль сохранён' }); }
  };

  const dayBookings = bookings.filter((b) => date && new Date(b.lesson_date).toDateString() === date.toDateString());
  const bookedDays = bookings.map((b) => new Date(b.lesson_date));

  return (
    <DashboardLayout title="Кабинет репетитора" items={NAV} active={tab} onSelect={setTab}>
      {tab === 'overview' && stats && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { l: 'Услуг', v: stats.services, i: 'BookOpen', c: 'from-violet-500 to-purple-600' },
            { l: 'Занятий', v: stats.bookings, i: 'CalendarCheck', c: 'from-blue-500 to-indigo-600' },
            { l: 'Проведено', v: stats.completed, i: 'CircleCheck', c: 'from-emerald-500 to-teal-600' },
            { l: 'Рейтинг', v: stats.avg_rating, i: 'Star', c: 'from-amber-500 to-orange-600' },
            { l: 'Заработано', v: RUB(stats.earned), i: 'TrendingUp', c: 'from-fuchsia-500 to-pink-600' },
            { l: 'Баланс', v: RUB(user!.balance), i: 'Wallet', c: 'from-teal-500 to-cyan-600' },
          ].map((s) => (
            <Card key={s.l} className="border-border/70"><CardContent className="p-5">
              <div className={`mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${s.c} text-white shadow-lg`}><Icon name={s.i} size={22} /></div>
              <div className="font-display text-2xl font-extrabold">{s.v}</div>
              <div className="text-sm text-muted-foreground">{s.l}</div>
            </CardContent></Card>
          ))}
        </div>
      )}

      {tab === 'services' && (
        <div className="space-y-4">
          <Button onClick={openNew} className="bg-gradient-to-r from-primary to-accent text-white"><Icon name="Plus" size={18} className="mr-1" /> Добавить услугу</Button>
          <div className="grid gap-4 md:grid-cols-2">
            {services.map((s) => (
              <Card key={s.id} className="border-border/70"><CardContent className="p-5">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-display font-bold">{s.title}</h3>
                  <Badge className={s.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : s.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}>
                    {s.status === 'approved' ? 'Одобрено' : s.status === 'rejected' ? 'Отклонено' : 'На модерации'}
                  </Badge>
                </div>
                <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{s.description}</p>
                <div className="mt-3 flex items-center gap-2"><Stars value={s.rating} /><span className="text-sm font-semibold">{s.rating}</span><span className="text-xs text-muted-foreground">({s.reviews_count})</span></div>
                <div className="mt-3 flex items-center justify-between border-t border-border/60 pt-3">
                  <span className="font-display font-extrabold text-primary">{RUB(s.price)}/час</span>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => openEdit(s)}><Icon name="Pencil" size={16} /></Button>
                    <Button size="sm" variant="outline" className="text-destructive" onClick={() => removeService(s.id)}><Icon name="Trash2" size={16} /></Button>
                  </div>
                </div>
              </CardContent></Card>
            ))}
          </div>
        </div>
      )}

      {tab === 'calendar' && (
        <div className="grid gap-6 lg:grid-cols-[auto_1fr]">
          <Card className="border-border/70"><CardContent className="p-3">
            <Calendar mode="single" selected={date} onSelect={setDate} modifiers={{ booked: bookedDays }}
              modifiersClassNames={{ booked: 'bg-primary/15 font-bold text-primary rounded-full' }} className="rounded-md" />
          </CardContent></Card>
          <div>
            <h3 className="mb-3 font-display font-bold">Занятия на {date?.toLocaleDateString('ru-RU')}</h3>
            <div className="space-y-3">
              {dayBookings.length === 0 && <p className="text-muted-foreground">Нет занятий на эту дату</p>}
              {dayBookings.map((b) => (
                <Card key={b.id} className="border-border/70"><CardContent className="flex items-center justify-between gap-3 p-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10"><AvatarImage src={b.student_avatar} /><AvatarFallback>{b.student_name[0]}</AvatarFallback></Avatar>
                    <div>
                      <div className="font-semibold">{b.student_name}</div>
                      <div className="text-xs text-muted-foreground">{b.service_title} · {new Date(b.lesson_date).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={ST[b.status].c}>{ST[b.status].l}</Badge>
                    {b.status === 'new' && <Button size="sm" variant="outline" className="text-emerald-600" onClick={() => setBookingStatus(b, 'confirmed')}>Принять</Button>}
                    {b.status === 'confirmed' && <Button size="sm" variant="outline" onClick={() => setBookingStatus(b, 'completed')}>Завершить</Button>}
                  </div>
                </CardContent></Card>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === 'reviews' && (
        <div className="grid gap-4 md:grid-cols-2">
          {reviews.length === 0 && <p className="text-muted-foreground">Пока нет отзывов</p>}
          {reviews.map((r) => (
            <Card key={r.id} className="border-border/70"><CardContent className="p-5">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10"><AvatarImage src={r.student_avatar} /><AvatarFallback>{r.student_name[0]}</AvatarFallback></Avatar>
                <div className="flex-1"><div className="font-semibold">{r.student_name}</div><Stars value={r.rating} /></div>
                <span className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleDateString('ru-RU')}</span>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">{r.text}</p>
              <Badge variant="secondary" className="mt-2">{r.service_title}</Badge>
            </CardContent></Card>
          ))}
        </div>
      )}

      {tab === 'finance' && (
        <div className="space-y-4">
          <Card className="overflow-hidden border-0 bg-gradient-to-br from-primary to-accent text-white"><CardContent className="p-6">
            <div className="text-sm text-white/80">Доступно к выводу</div>
            <div className="font-display text-4xl font-black">{RUB(user!.balance)}</div>
            <Button className="mt-4 bg-white text-primary hover:bg-white/90" onClick={() => toast({ title: 'Заявка на вывод отправлена' })}>
              <Icon name="Banknote" size={18} className="mr-1" /> Вывести средства
            </Button>
          </CardContent></Card>
          <Card className="border-border/70"><CardContent className="divide-y divide-border/60 p-0">
            {transactions.map((t) => (
              <div key={t.id} className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${t.type === 'payout' ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}`}>
                    <Icon name={t.type === 'payout' ? 'ArrowUpRight' : 'ArrowDownLeft'} size={18} />
                  </div>
                  <div><div className="font-semibold">{t.type === 'payout' ? 'Вывод средств' : t.type === 'payment' ? 'Оплата занятия' : 'Возврат'}</div>
                    <div className="text-xs text-muted-foreground">{new Date(t.created_at).toLocaleDateString('ru-RU')}</div></div>
                </div>
                <div className={`font-bold ${t.type === 'payout' ? 'text-destructive' : 'text-emerald-600'}`}>{t.type === 'payout' ? '-' : '+'}{RUB(t.amount)}</div>
              </div>
            ))}
          </CardContent></Card>
        </div>
      )}

      {tab === 'profile' && (
        <Card className="max-w-xl border-border/70"><CardContent className="space-y-4 p-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16"><AvatarImage src={user!.avatar_url || undefined} /><AvatarFallback>{user!.full_name[0]}</AvatarFallback></Avatar>
            <div><div className="font-display text-lg font-bold">{user!.full_name}</div><div className="text-sm text-muted-foreground">{user!.email}</div></div>
          </div>
          <div><Label>Имя и фамилия</Label><Input value={profile.full_name} onChange={(e) => setProfile({ ...profile, full_name: e.target.value })} className="mt-1.5" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Телефон</Label><Input value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} className="mt-1.5" /></div>
            <div><Label>Город</Label><Input value={profile.city} onChange={(e) => setProfile({ ...profile, city: e.target.value })} className="mt-1.5" /></div>
          </div>
          <div><Label>О себе</Label><Textarea rows={3} value={profile.bio} onChange={(e) => setProfile({ ...profile, bio: e.target.value })} className="mt-1.5" /></div>
          <Button onClick={saveProfile} className="bg-gradient-to-r from-primary to-accent text-white">Сохранить</Button>
        </CardContent></Card>
      )}

      {/* Service dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{form.id ? 'Редактировать услугу' : 'Новая услуга'}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Название</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
            <div><Label>Описание</Label><Textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Цена за час, ₽</Label><Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} /></div>
              <div><Label>Опыт, лет</Label><Input type="number" value={form.experience_years} onChange={(e) => setForm({ ...form, experience_years: Number(e.target.value) })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Категория</Label>
                <Select value={String(form.category_id)} onValueChange={(v) => setForm({ ...form, category_id: Number(v) })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{categories.map((c) => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Формат</Label>
                <Select value={form.format} onValueChange={(v) => setForm({ ...form, format: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="online">Онлайн</SelectItem><SelectItem value="offline">Очно</SelectItem><SelectItem value="any">Любой</SelectItem></SelectContent>
                </Select>
              </div>
            </div>
            <div><Label>Теги (через запятую)</Label><Input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} /></div>
          </div>
          <DialogFooter><Button onClick={saveService} className="bg-primary text-white">{form.id ? 'Сохранить' : 'Создать'}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
