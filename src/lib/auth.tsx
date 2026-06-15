import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, authApi, Role } from './api';

interface AuthCtx {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (full_name: string, email: string, password: string, role: Role) => Promise<User>;
  logout: () => void;
  setUser: (u: User) => void;
}

const Ctx = createContext<AuthCtx>({} as AuthCtx);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('nastavnik_user');
      if (raw) setUserState(JSON.parse(raw));
    } catch { /* ignore */ }
    setLoading(false);
  }, []);

  const persist = (u: User | null) => {
    setUserState(u);
    if (u) localStorage.setItem('nastavnik_user', JSON.stringify(u));
    else localStorage.removeItem('nastavnik_user');
  };

  const login = async (email: string, password: string) => {
    const { user: u } = await authApi.login(email, password);
    persist(u);
    return u;
  };

  const register = async (full_name: string, email: string, password: string, role: Role) => {
    const { user: u } = await authApi.register(full_name, email, password, role);
    persist(u);
    return u;
  };

  const logout = () => persist(null);

  return (
    <Ctx.Provider value={{ user, loading, login, register, logout, setUser: persist }}>
      {children}
    </Ctx.Provider>
  );
}

export const useAuth = () => useContext(Ctx);

export function dashboardPath(role: Role) {
  if (role === 'admin') return '/admin';
  if (role === 'tutor') return '/tutor';
  return '/student';
}
