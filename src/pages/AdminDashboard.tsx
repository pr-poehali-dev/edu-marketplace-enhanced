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
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
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
  { key: 'overview', label: 'Обзор', icon: 'LayoutDashboard' },
  { key: 'users', label: 'Пользователи', icon: 'Users' },
  { key: 'services', label: 'Модерация услуг', icon: 'ShieldCheck' },
  { key: 'transactions', label: 'Транзакции', icon: 'Wallet' },
  { key: 'categories', label: 'Категории', icon: 'FolderTree' },
  { key: 'articles', label: 'Блог / статьи', icon: 'Newspaper' },
  { key: 'complaints', label: 'Жалобы', icon: 'Flag' },
];

const RUB = (n: number) => `${Number(n).toLocaleString('ru-RU')} ₽`;
const ROLE_RU: Record<string, string> = { admin: 'Админ', tutor: 'Репетитор', student: 'Ученик' };
const STATUS_RU: Record<string, string> = { pending: 'На модерации', approved: 'Одобрено', rejected: 'Отклонено', open: 'Открыта', resolved: 'Решена' };

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [tab, setTab] = useState('overview');

  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [articles, setArticles] = useState<any[]>([]);
  const [complaints, setComplaints] = useState<any[]>([]);

  const [newCat, setNewCat] = useState({ name: '', description: '', icon: 'BookOpen' });
  const [newArt, setNewArt] = useState({ title: '', excerpt: '', content: '' });

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    if (user.role !== 'admin') { navigate('/'); return; }
    api.stats().then((d) => setStats(d));
    api.users().then((d) => setUsers(d.items || []));
    api.services({ status: 'all' }).then((d) => setServices(d.items || []));
    api.allTransactions().then((d) => setTransactions(d.items || []));
    api.categories().then((d) => setCategories(d.items || []));
    api.articles().then((d) => setArticles(d.items || []));
    api.complaints().then((d) => setComplaints(d.items || []));
  }, [user, navigate]);

  const toggleBlock = async (u: any) => {
    await api.blockUser(u.id, !u.is_blocked);
    setUsers((p) => p.map((x) => x.id === u.id ? { ...x, is_blocked: !x.is_blocked } : x));
    toast({ title: u.is_blocked ? 'Пользователь разблокирован' : 'Пользователь заблокирован' });
  };

  const moderate = async (s: any, status: string) => {
    await api.setServiceStatus(s.id, status);
    setServices((p) => p.map((x) => x.id === s.id ? { ...x, status } : x));
    toast({ title: status === 'approved' ? 'Услуга одобрена' : 'Услуга отклонена' });
  };

  const removeCategory = async (id: number) => {
    await api.deleteCategory(id);
    setCategories((p) => p.filter((x) => x.id !== id));
    toast({ title: 'Категория удалена' });
  };

  const addCategory = async () => {
    if (!newCat.name) return;
    const d = await api.createCategory(newCat);
    if (d.item) { setCategories((p) => [...p, d.item]); setNewCat({ name: '', description: '', icon: 'BookOpen' }); toast({ title: 'Категория добавлена' }); }
  };

  const addArticle = async () => {
    if (!newArt.title) return;
    const d = await api.createArticle({ ...newArt, status: 'published' });
    if (d.item) { setArticles((p) => [d.item, ...p]); setNewArt({ title: '', excerpt: '', content: '' }); toast({ title: 'Статья опубликована' }); }
  };

  const removeArticle = async (id: number) => {
    await api.deleteArticle(id);
    setArticles((p) => p.filter((x) => x.id !== id));
  };

  const resolveComplaint = async (c: any, status: string) => {
    await api.setComplaintStatus(c.id, status);
    setComplaints((p) => p.map((x) => x.id === c.id ? { ...x, status } : x));
    toast({ title: 'Статус жалобы обновлён' });
  };

  return (
    <DashboardLayout title="Панель администратора" items={NAV} active={tab} onSelect={setTab}>
      {tab === 'overview' && stats && (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { l: 'Пользователей', v: (stats.users.admin || 0) + (stats.users.tutor || 0) + (stats.users.student || 0), i: 'Users', c: 'from-violet-500 to-purple-600' },
              { l: 'Услуг всего', v: stats.services_total, i: 'BookOpen', c: 'from-blue-500 to-indigo-600' },
              { l: 'Заявок', v: stats.bookings_total, i: 'CalendarCheck', c: 'from-emerald-500 to-teal-600' },
              { l: 'Оборот', v: RUB(stats.revenue), i: 'TrendingUp', c: 'from-amber-500 to-orange-600' },
            ].map((s) => (
              <Card key={s.l} className="overflow-hidden border-border/70">
                <CardContent className="p-5">
                  <div className={`mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${s.c} text-white shadow-lg`}>
                    <Icon name={s.i} size={22} />
                  </div>
                  <div className="font-display text-2xl font-extrabold">{s.v}</div>
                  <div className="text-sm text-muted-foreground">{s.l}</div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <Card className="border-border/70"><CardContent className="p-5">
              <div className="flex items-center gap-2 text-amber-600"><Icon name="Clock" size={18} /><span className="font-semibold">На модерации</span></div>
              <div className="mt-2 font-display text-3xl font-extrabold">{stats.services_pending}</div>
              <div className="text-sm text-muted-foreground">услуг ждут проверки</div>
            </CardContent></Card>
            <Card className="border-border/70"><CardContent className="p-5">
              <div className="flex items-center gap-2 text-destructive"><Icon name="Flag" size={18} /><span className="font-semibold">Жалобы</span></div>
              <div className="mt-2 font-display text-3xl font-extrabold">{stats.complaints_open}</div>
              <div className="text-sm text-muted-foreground">открытых обращений</div>
            </CardContent></Card>
            <Card className="border-border/70"><CardContent className="p-5">
              <div className="flex items-center gap-2 text-primary"><Icon name="GraduationCap" size={18} /><span className="font-semibold">Репетиторов</span></div>
              <div className="mt-2 font-display text-3xl font-extrabold">{stats.users.tutor || 0}</div>
              <div className="text-sm text-muted-foreground">активных преподавателей</div>
            </CardContent></Card>
          </div>
        </div>
      )}

      {tab === 'users' && (
        <Card className="border-border/70"><CardContent className="p-0">
          <Table>
            <TableHeader><TableRow>
              <TableHead>Пользователь</TableHead><TableHead>Роль</TableHead><TableHead>Город</TableHead>
              <TableHead>Баланс</TableHead><TableHead>Статус</TableHead><TableHead className="text-right">Действия</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9"><AvatarImage src={u.avatar_url} /><AvatarFallback>{u.full_name[0]}</AvatarFallback></Avatar>
                      <div><div className="font-semibold">{u.full_name}</div><div className="text-xs text-muted-foreground">{u.email}</div></div>
                    </div>
                  </TableCell>
                  <TableCell><Badge variant="secondary">{ROLE_RU[u.role]}</Badge></TableCell>
                  <TableCell className="text-muted-foreground">{u.city || '—'}</TableCell>
                  <TableCell className="font-semibold">{RUB(u.balance)}</TableCell>
                  <TableCell>
                    {u.is_blocked ? <Badge variant="destructive">Заблокирован</Badge> : <Badge className="bg-emerald-100 text-emerald-700">Активен</Badge>}
                  </TableCell>
                  <TableCell className="text-right">
                    {u.role !== 'admin' && (
                      <Button size="sm" variant={u.is_blocked ? 'outline' : 'destructive'} onClick={() => toggleBlock(u)}>
                        {u.is_blocked ? 'Разблокировать' : 'Заблокировать'}
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent></Card>
      )}

      {tab === 'services' && (
        <div className="grid gap-4 md:grid-cols-2">
          {services.map((s) => (
            <Card key={s.id} className="border-border/70"><CardContent className="p-5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-display font-bold">{s.title}</h3>
                  <p className="text-sm text-muted-foreground">{s.tutor_name} · {s.category_name}</p>
                </div>
                <Badge className={s.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : s.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}>
                  {STATUS_RU[s.status]}
                </Badge>
              </div>
              <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{s.description}</p>
              <div className="mt-3 flex items-center justify-between">
                <span className="font-display font-extrabold text-primary">{RUB(s.price)}/час</span>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="text-emerald-600" onClick={() => moderate(s, 'approved')}><Icon name="Check" size={16} /></Button>
                  <Button size="sm" variant="outline" className="text-destructive" onClick={() => moderate(s, 'rejected')}><Icon name="X" size={16} /></Button>
                </div>
              </div>
            </CardContent></Card>
          ))}
        </div>
      )}

      {tab === 'transactions' && (
        <Card className="border-border/70"><CardContent className="p-0">
          <Table>
            <TableHeader><TableRow>
              <TableHead>Пользователь</TableHead><TableHead>Тип</TableHead><TableHead>Сумма</TableHead>
              <TableHead>Статус</TableHead><TableHead>Дата</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {transactions.map((t) => (
                <TableRow key={t.id}>
                  <TableCell className="font-semibold">{t.user_name} <span className="text-xs text-muted-foreground">({ROLE_RU[t.user_role]})</span></TableCell>
                  <TableCell><Badge variant="secondary">{t.type === 'payment' ? 'Оплата' : t.type === 'payout' ? 'Вывод' : 'Возврат'}</Badge></TableCell>
                  <TableCell className={`font-bold ${t.type === 'payout' ? 'text-destructive' : 'text-emerald-600'}`}>{t.type === 'payout' ? '-' : '+'}{RUB(t.amount)}</TableCell>
                  <TableCell>{t.status === 'completed' ? <Badge className="bg-emerald-100 text-emerald-700">Завершён</Badge> : <Badge className="bg-amber-100 text-amber-700">Ожидает</Badge>}</TableCell>
                  <TableCell className="text-muted-foreground">{new Date(t.created_at).toLocaleDateString('ru-RU')}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent></Card>
      )}

      {tab === 'categories' && (
        <div className="space-y-4">
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-primary to-accent text-white"><Icon name="Plus" size={18} className="mr-1" /> Добавить категорию</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Новая категория</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div><Label>Название</Label><Input value={newCat.name} onChange={(e) => setNewCat({ ...newCat, name: e.target.value })} /></div>
                <div><Label>Описание</Label><Input value={newCat.description} onChange={(e) => setNewCat({ ...newCat, description: e.target.value })} /></div>
                <div><Label>Иконка (lucide)</Label><Input value={newCat.icon} onChange={(e) => setNewCat({ ...newCat, icon: e.target.value })} /></div>
              </div>
              <DialogFooter><Button onClick={addCategory} className="bg-primary text-white">Создать</Button></DialogFooter>
            </DialogContent>
          </Dialog>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((c) => (
              <Card key={c.id} className="border-border/70"><CardContent className="flex items-center gap-3 p-4">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${c.color} text-white`}><Icon name={c.icon} size={20} /></div>
                <div className="min-w-0 flex-1"><div className="truncate font-semibold">{c.name}</div><div className="truncate text-xs text-muted-foreground">{c.description}</div></div>
                <Button size="icon" variant="ghost" className="text-destructive" onClick={() => removeCategory(c.id)}><Icon name="Trash2" size={16} /></Button>
              </CardContent></Card>
            ))}
          </div>
        </div>
      )}

      {tab === 'articles' && (
        <div className="space-y-4">
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-primary to-accent text-white"><Icon name="Plus" size={18} className="mr-1" /> Новая статья</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Создать статью</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div><Label>Заголовок</Label><Input value={newArt.title} onChange={(e) => setNewArt({ ...newArt, title: e.target.value })} /></div>
                <div><Label>Краткое описание</Label><Input value={newArt.excerpt} onChange={(e) => setNewArt({ ...newArt, excerpt: e.target.value })} /></div>
                <div><Label>Текст</Label><Textarea rows={4} value={newArt.content} onChange={(e) => setNewArt({ ...newArt, content: e.target.value })} /></div>
              </div>
              <DialogFooter><Button onClick={addArticle} className="bg-primary text-white">Опубликовать</Button></DialogFooter>
            </DialogContent>
          </Dialog>
          <div className="grid gap-4 md:grid-cols-2">
            {articles.map((a) => (
              <Card key={a.id} className="border-border/70"><CardContent className="p-5">
                <div className="flex items-start justify-between gap-2">
                  <Badge variant={a.status === 'published' ? 'default' : 'secondary'}>{a.status === 'published' ? 'Опубликовано' : 'Черновик'}</Badge>
                  <Button size="icon" variant="ghost" className="text-destructive" onClick={() => removeArticle(a.id)}><Icon name="Trash2" size={16} /></Button>
                </div>
                <h3 className="mt-2 font-display font-bold">{a.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{a.excerpt}</p>
                <p className="mt-2 text-xs text-muted-foreground">Автор: {a.author_name || '—'}</p>
              </CardContent></Card>
            ))}
          </div>
        </div>
      )}

      {tab === 'complaints' && (
        <div className="grid gap-4 md:grid-cols-2">
          {complaints.map((c) => (
            <Card key={c.id} className="border-border/70"><CardContent className="p-5">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8"><AvatarImage src={c.author_avatar} /><AvatarFallback>{c.author_name[0]}</AvatarFallback></Avatar>
                  <div><div className="text-sm font-semibold">{c.author_name}</div><div className="text-xs text-muted-foreground">{new Date(c.created_at).toLocaleDateString('ru-RU')}</div></div>
                </div>
                <Badge className={c.status === 'open' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}>{STATUS_RU[c.status] || c.status}</Badge>
              </div>
              <div className="mt-3 font-semibold">{c.reason}</div>
              <p className="text-sm text-muted-foreground">{c.text}</p>
              {c.status === 'open' && (
                <div className="mt-3 flex gap-2">
                  <Button size="sm" variant="outline" className="text-emerald-600" onClick={() => resolveComplaint(c, 'resolved')}>Решить</Button>
                  <Button size="sm" variant="outline" className="text-destructive" onClick={() => resolveComplaint(c, 'rejected')}>Отклонить</Button>
                </div>
              )}
            </CardContent></Card>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}