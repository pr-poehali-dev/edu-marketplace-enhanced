import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { useAuth, dashboardPath } from '@/lib/auth';
import { Role } from '@/lib/api';

const DEMO = [
  { role: 'Админ', email: 'admin@nastavnik.ru' },
  { role: 'Репетитор', email: 'anna@nastavnik.ru' },
  { role: 'Ученик', email: 'ivan@mail.ru' },
];

export default function Login() {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPass, setLoginPass] = useState('');

  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPass, setRegPass] = useState('');
  const [regRole, setRegRole] = useState<Role>('student');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const u = await login(loginEmail, loginPass);
      toast({ title: `Добро пожаловать, ${u.full_name}!` });
      navigate(dashboardPath(u.role));
    } catch (err) {
      toast({ title: 'Ошибка входа', description: (err as Error).message, variant: 'destructive' });
    } finally { setLoading(false); }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const u = await register(regName, regEmail, regPass, regRole);
      toast({ title: 'Регистрация успешна!', description: `Аккаунт ${u.email} создан` });
      navigate(dashboardPath(u.role));
    } catch (err) {
      toast({ title: 'Ошибка регистрации', description: (err as Error).message, variant: 'destructive' });
    } finally { setLoading(false); }
  };

  const quickFill = (email: string) => { setLoginEmail(email); setLoginPass('123456'); };

  return (
    <div className="flex min-h-screen items-center justify-center bg-mesh p-4 font-sans">
      <div className="grid w-full max-w-4xl overflow-hidden rounded-3xl bg-white shadow-2xl shadow-primary/20 md:grid-cols-2">
        {/* Left brand panel */}
        <div className="relative hidden flex-col justify-between bg-gradient-to-br from-primary via-purple-600 to-accent p-10 text-white md:flex">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
              <Icon name="GraduationCap" size={24} />
            </div>
            <span className="font-display text-xl font-extrabold">Наставник</span>
          </Link>
          <div>
            <h2 className="font-display text-3xl font-black leading-tight">Образование начинается здесь</h2>
            <p className="mt-3 text-white/80">Тысячи проверенных репетиторов по всем предметам ждут именно вас.</p>
          </div>
          <div className="space-y-3">
            <p className="text-sm font-semibold text-white/70">Демо-доступы (пароль: 123456):</p>
            {DEMO.map((d) => (
              <button key={d.email} onClick={() => quickFill(d.email)}
                className="flex w-full items-center justify-between rounded-xl bg-white/10 px-4 py-2 text-left text-sm transition hover:bg-white/20">
                <span className="font-semibold">{d.role}</span>
                <span className="text-white/70">{d.email}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Right form panel */}
        <div className="p-8 sm:p-10">
          <Tabs defaultValue="login">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Вход</TabsTrigger>
              <TabsTrigger value="register">Регистрация</TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="mt-6">
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <Label>Email</Label>
                  <Input type="email" required value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} placeholder="you@mail.ru" className="mt-1.5" />
                </div>
                <div>
                  <Label>Пароль</Label>
                  <Input type="password" required value={loginPass} onChange={(e) => setLoginPass(e.target.value)} placeholder="••••••" className="mt-1.5" />
                </div>
                <Button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-primary to-accent font-semibold text-white hover:opacity-90">
                  {loading ? 'Вход...' : 'Войти'}
                </Button>
              </form>
              <Card className="mt-6 border-dashed bg-secondary/40 md:hidden">
                <CardContent className="space-y-1 p-3 text-xs">
                  <p className="font-semibold">Демо (пароль 123456):</p>
                  {DEMO.map((d) => (
                    <button key={d.email} onClick={() => quickFill(d.email)} className="block text-primary underline">{d.role}: {d.email}</button>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="register" className="mt-6">
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <Label>Имя и фамилия</Label>
                  <Input required value={regName} onChange={(e) => setRegName(e.target.value)} placeholder="Иван Иванов" className="mt-1.5" />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input type="email" required value={regEmail} onChange={(e) => setRegEmail(e.target.value)} placeholder="you@mail.ru" className="mt-1.5" />
                </div>
                <div>
                  <Label>Пароль</Label>
                  <Input type="password" required value={regPass} onChange={(e) => setRegPass(e.target.value)} placeholder="Минимум 4 символа" className="mt-1.5" />
                </div>
                <div>
                  <Label className="mb-2 block">Я хочу</Label>
                  <RadioGroup value={regRole} onValueChange={(v) => setRegRole(v as Role)} className="grid grid-cols-2 gap-3">
                    <label className={`flex cursor-pointer items-center gap-2 rounded-xl border p-3 ${regRole === 'student' ? 'border-primary bg-primary/5' : 'border-border'}`}>
                      <RadioGroupItem value="student" /> <span className="text-sm font-semibold">Учиться</span>
                    </label>
                    <label className={`flex cursor-pointer items-center gap-2 rounded-xl border p-3 ${regRole === 'tutor' ? 'border-primary bg-primary/5' : 'border-border'}`}>
                      <RadioGroupItem value="tutor" /> <span className="text-sm font-semibold">Преподавать</span>
                    </label>
                  </RadioGroup>
                </div>
                <Button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-primary to-accent font-semibold text-white hover:opacity-90">
                  {loading ? 'Создаём...' : 'Создать аккаунт'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <Link to="/" className="mt-6 flex items-center justify-center gap-1 text-sm text-muted-foreground hover:text-primary">
            <Icon name="ArrowLeft" size={14} /> Вернуться на главную
          </Link>
        </div>
      </div>
    </div>
  );
}
