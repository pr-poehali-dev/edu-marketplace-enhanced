import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/auth';

export interface NavItem {
  key: string;
  label: string;
  icon: string;
}

interface Props {
  title: string;
  items: NavItem[];
  active: string;
  onSelect: (key: string) => void;
  children: ReactNode;
}

const ROLE_LABEL: Record<string, string> = {
  admin: 'Администратор',
  tutor: 'Репетитор',
  student: 'Ученик',
};

export default function DashboardLayout({ title, items, active, onSelect, children }: Props) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <div className="flex min-h-screen bg-mesh font-sans text-foreground">
      {/* Sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-border/60 bg-white/70 backdrop-blur-xl lg:flex">
        <button onClick={() => navigate('/')} className="flex items-center gap-2 px-6 py-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent text-white shadow-lg shadow-primary/30">
            <Icon name="GraduationCap" size={20} />
          </div>
          <span className="font-display text-lg font-extrabold tracking-tight">Наставник</span>
        </button>

        <div className="mx-3 mb-2 rounded-2xl bg-secondary/60 p-3">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user.avatar_url || undefined} />
              <AvatarFallback>{user.full_name[0]}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <div className="truncate text-sm font-bold">{user.full_name}</div>
              <Badge variant="secondary" className="mt-0.5 bg-primary/10 text-[10px] font-semibold text-primary">
                {ROLE_LABEL[user.role]}
              </Badge>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
          {items.map((it) => (
            <button
              key={it.key}
              onClick={() => onSelect(it.key)}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all ${
                active === it.key
                  ? 'bg-gradient-to-r from-primary to-accent text-white shadow-lg shadow-primary/30'
                  : 'text-foreground/70 hover:bg-secondary'
              }`}
            >
              <Icon name={it.icon} size={18} />
              {it.label}
            </button>
          ))}
        </nav>

        <div className="border-t border-border/60 p-3">
          <Button variant="ghost" onClick={handleLogout} className="w-full justify-start gap-3 text-destructive hover:bg-destructive/10 hover:text-destructive">
            <Icon name="LogOut" size={18} /> Выйти
          </Button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-border/60 glass px-4 sm:px-8">
          <div>
            <h1 className="font-display text-lg font-extrabold tracking-tight sm:text-xl">{title}</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => navigate('/')} title="На главную">
              <Icon name="Home" size={20} />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleLogout} className="lg:hidden text-destructive">
              <Icon name="LogOut" size={20} />
            </Button>
            <Avatar className="h-9 w-9 lg:hidden">
              <AvatarImage src={user.avatar_url || undefined} />
              <AvatarFallback>{user.full_name[0]}</AvatarFallback>
            </Avatar>
          </div>
        </header>

        {/* Mobile nav */}
        <div className="flex gap-2 overflow-x-auto border-b border-border/60 bg-white/50 px-4 py-2 lg:hidden">
          {items.map((it) => (
            <button
              key={it.key}
              onClick={() => onSelect(it.key)}
              className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold ${
                active === it.key ? 'bg-primary text-white' : 'bg-secondary text-foreground/70'
              }`}
            >
              <Icon name={it.icon} size={14} />
              {it.label}
            </button>
          ))}
        </div>

        <main className="flex-1 p-4 sm:p-8">{children}</main>
      </div>
    </div>
  );
}
