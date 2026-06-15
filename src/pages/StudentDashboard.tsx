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
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';
import DashboardLayout from '@/components/DashboardLayout';
import Stars from '@/components/Stars';

const NAV = [
  { key: 'overview', label: 'Профиль', icon: 'User' },
  { key: 'lessons', label: 'Мои занятия', icon: 'CalendarDays' },
  { key: 'favorites', label: 'Избранное', icon: 'Heart' },
  { key: 'notifications', label: 'Уведомления', icon: 'Bell' },
  { key: 'payments', label: 'Платежи', icon: 'CreditCard' },
  { key: 'settings', label: 'Настройки', icon: 'Settings' },
];

const RUB = (n: number) => `${Number(n).toLocaleString('ru-RU')} ₽`;
const ST: Record<string, { l: string; c: string }> = {
  new: { l: 'Ожидает', c: 'bg-blue-100 text-blue-700' },
  confirmed: { l: 'Подтверждено', c: 'bg-emerald-100 text-emerald-700' },
  completed: { l: 'Завершено', c: 'bg-gray-100 text-gray-600' },
  cancelled: { l: 'Отменено', c: 'bg-red-100 text-red-700' },
};

export default function StudentDashboard() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [tab, setTab] = useState('overview');

  const [bookings, setBookings] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [profile, setProfile] = useState({ full_name: '', phone: '', city: '', bio: '' });
  const [reviewFor, setReviewFor] = useState<any>(null);
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(5);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    if (user.role !== 'student') { navigate('/'); return; }
    setProfile({ full_name: user.full_name, phone: user.phone || '', city: user.city || '', bio: user.bio || '' });
    api.bookings('student').then((d) => setBookings(d.items || []));
    api.favorites().then((d) => setFavorites(d.items || []));
    api.notifications().then((d) => setNotifications(d.items || []));
    api.transactions().then((d) => setTransactions(d.items || []));
  }, [user, navigate]);

  const saveProfile = async () => {
    const d = await api.updateProfile(profile);
    if (d.item) { setUser({ ...user!, ...d.item }); toast({ title: 'Профиль сохранён' }); }
  };

  const removeFavorite = async (serviceId: number) => {
    await api.toggleFavorite(serviceId);
    setFavorites((p) => p.filter((x) => x.id !== serviceId));
    toast({ title: 'Удалено из избранного' });
  };

  const markRead = async () => {
    await api.markNotificationsRead();
    setNotifications((p) => p.map((x) => ({ ...x, is_read: true })));
  };

  const submitReview = async () => {
    if (!reviewFor) return;
    await api.createReview({ service_id: reviewFor.service_id, tutor_id: reviewFor.tutor_id, rating: reviewRating, text: reviewText });
    toast({ title: 'Спасибо за отзыв!' });
    setReviewFor(null); setReviewText(''); setReviewRating(5);
  };

  const unread = notifications.filter((n) => !n.is_read).length;

  return (
    <DashboardLayout title="Кабинет ученика" items={NAV} active={tab} onSelect={setTab}>
      {tab === 'overview' && (
        <div className="space-y-6">
          <Card className="overflow-hidden border-0 bg-gradient-to-br from-primary to-accent text-white"><CardContent className="flex flex-wrap items-center gap-4 p-6">
            <Avatar className="h-16 w-16 ring-4 ring-white/30"><AvatarImage src={user!.avatar_url || undefined} /><AvatarFallback>{user!.full_name[0]}</AvatarFallback></Avatar>
            <div className="flex-1"><div className="font-display text-2xl font-black">{user!.full_name}</div><div className="text-white/80">{user!.email}</div></div>
            <div className="rounded-2xl bg-white/15 px-5 py-3 text-center"><div className="text-xs text-white/70">Баланс</div><div className="font-display text-xl font-extrabold">{RUB(user!.balance)}</div></div>
          </CardContent></Card>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { l: 'Занятий', v: bookings.length, i: 'CalendarDays', c: 'from-violet-500 to-purple-600' },
              { l: 'В избранном', v: favorites.length, i: 'Heart', c: 'from-pink-500 to-rose-600' },
              { l: 'Завершено', v: bookings.filter((b) => b.status === 'completed').length, i: 'CircleCheck', c: 'from-emerald-500 to-teal-600' },
            ].map((s) => (
              <Card key={s.l} className="border-border/70"><CardContent className="p-5">
                <div className={`mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${s.c} text-white shadow-lg`}><Icon name={s.i} size={22} /></div>
                <div className="font-display text-2xl font-extrabold">{s.v}</div><div className="text-sm text-muted-foreground">{s.l}</div>
              </CardContent></Card>
            ))}
          </div>
          <Button onClick={() => navigate('/')} className="bg-gradient-to-r from-primary to-accent text-white"><Icon name="Search" size={18} className="mr-1" /> Найти репетитора</Button>
        </div>
      )}

      {tab === 'lessons' && (
        <div className="space-y-3">
          {bookings.length === 0 && <p className="text-muted-foreground">У вас пока нет занятий. <button className="text-primary underline" onClick={() => navigate('/')}>Найти репетитора</button></p>}
          {bookings.map((b) => (
            <Card key={b.id} className="border-border/70"><CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-11 w-11"><AvatarImage src={b.tutor_avatar} /><AvatarFallback>{b.tutor_name[0]}</AvatarFallback></Avatar>
                <div><div className="font-semibold">{b.tutor_name}</div><div className="text-xs text-muted-foreground">{b.service_title}</div>
                  <div className="text-xs text-muted-foreground">{new Date(b.lesson_date).toLocaleString('ru-RU', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}</div></div>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-display font-bold text-primary">{RUB(b.price)}</span>
                <Badge className={ST[b.status].c}>{ST[b.status].l}</Badge>
                {b.status === 'completed' && <Button size="sm" variant="outline" onClick={() => setReviewFor(b)}><Icon name="Star" size={14} className="mr-1" /> Отзыв</Button>}
              </div>
            </CardContent></Card>
          ))}
        </div>
      )}

      {tab === 'favorites' && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {favorites.length === 0 && <p className="text-muted-foreground">В избранном пока пусто</p>}
          {favorites.map((s) => (
            <Card key={s.id} className="border-border/70"><CardContent className="p-5">
              <div className="flex items-start gap-3">
                <Avatar className="h-12 w-12"><AvatarImage src={s.tutor_avatar} /><AvatarFallback>{s.tutor_name[0]}</AvatarFallback></Avatar>
                <div className="flex-1"><div className="font-semibold">{s.tutor_name}</div><div className="text-xs text-muted-foreground">{s.category_name}</div><div className="mt-1"><Stars value={s.rating} /></div></div>
                <Button size="icon" variant="ghost" className="text-accent" onClick={() => removeFavorite(s.id)}><Icon name="Heart" size={18} className="fill-current" /></Button>
              </div>
              <p className="mt-2 line-clamp-2 text-sm font-medium">{s.title}</p>
              <div className="mt-3 flex items-center justify-between"><span className="font-display font-extrabold text-primary">{RUB(s.price)}/час</span>
                <Button size="sm" className="bg-gradient-to-r from-primary to-accent text-white" onClick={() => navigate('/')}>Записаться</Button></div>
            </CardContent></Card>
          ))}
        </div>
      )}

      {tab === 'notifications' && (
        <div className="space-y-3">
          {unread > 0 && <Button variant="outline" size="sm" onClick={markRead}><Icon name="CheckCheck" size={16} className="mr-1" /> Отметить все прочитанными</Button>}
          {notifications.length === 0 && <p className="text-muted-foreground">Нет уведомлений</p>}
          {notifications.map((n) => (
            <Card key={n.id} className={`border-border/70 ${!n.is_read ? 'bg-primary/5' : ''}`}><CardContent className="flex items-start gap-3 p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"><Icon name={n.icon} size={20} /></div>
              <div className="flex-1"><div className="font-semibold">{n.title}</div><div className="text-sm text-muted-foreground">{n.text}</div>
                <div className="mt-1 text-xs text-muted-foreground">{new Date(n.created_at).toLocaleString('ru-RU')}</div></div>
              {!n.is_read && <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-accent" />}
            </CardContent></Card>
          ))}
        </div>
      )}

      {tab === 'payments' && (
        <Card className="border-border/70"><CardContent className="divide-y divide-border/60 p-0">
          {transactions.length === 0 && <p className="p-4 text-muted-foreground">Платежей пока нет</p>}
          {transactions.map((t) => (
            <div key={t.id} className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${t.type === 'refund' ? 'bg-amber-100 text-amber-600' : 'bg-primary/10 text-primary'}`}><Icon name="CreditCard" size={18} /></div>
                <div><div className="font-semibold">{t.type === 'payment' ? 'Оплата занятия' : t.type === 'refund' ? 'Возврат средств' : 'Платёж'}</div>
                  <div className="text-xs text-muted-foreground">{new Date(t.created_at).toLocaleDateString('ru-RU')}</div></div>
              </div>
              <div className={`font-bold ${t.type === 'refund' ? 'text-emerald-600' : 'text-foreground'}`}>{t.type === 'refund' ? '+' : '-'}{RUB(t.amount)}</div>
            </div>
          ))}
        </CardContent></Card>
      )}

      {tab === 'settings' && (
        <Card className="max-w-xl border-border/70"><CardContent className="space-y-4 p-6">
          <div><Label>Имя и фамилия</Label><Input value={profile.full_name} onChange={(e) => setProfile({ ...profile, full_name: e.target.value })} className="mt-1.5" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Телефон</Label><Input value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} className="mt-1.5" /></div>
            <div><Label>Город</Label><Input value={profile.city} onChange={(e) => setProfile({ ...profile, city: e.target.value })} className="mt-1.5" /></div>
          </div>
          <div><Label>О себе</Label><Textarea rows={3} value={profile.bio} onChange={(e) => setProfile({ ...profile, bio: e.target.value })} className="mt-1.5" /></div>
          <Button onClick={saveProfile} className="bg-gradient-to-r from-primary to-accent text-white">Сохранить</Button>
          <div className="border-t border-border/60 pt-4">
            <Label className="text-muted-foreground">Смена пароля</Label>
            <div className="mt-2 grid grid-cols-2 gap-3">
              <Input type="password" placeholder="Новый пароль" />
              <Input type="password" placeholder="Повторите пароль" />
            </div>
            <Button variant="outline" className="mt-3" onClick={() => toast({ title: 'Пароль обновлён' })}>Изменить пароль</Button>
          </div>
        </CardContent></Card>
      )}

      <Dialog open={!!reviewFor} onOpenChange={(o) => !o && setReviewFor(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Оставить отзыв</DialogTitle></DialogHeader>
          {reviewFor && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">{reviewFor.tutor_name} · {reviewFor.service_title}</p>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <button key={i} onClick={() => setReviewRating(i)}>
                    <Icon name="Star" size={28} className={i <= reviewRating ? 'text-amber-400 fill-amber-400' : 'text-muted-foreground/30'} />
                  </button>
                ))}
              </div>
              <Textarea rows={3} placeholder="Расскажите о занятиях..." value={reviewText} onChange={(e) => setReviewText(e.target.value)} />
            </div>
          )}
          <DialogFooter><Button onClick={submitReview} className="bg-primary text-white">Отправить</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
