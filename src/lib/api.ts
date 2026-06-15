const AUTH_URL = 'https://functions.poehali.dev/e39560c7-5cb4-4488-874b-030af0134352';
const DATA_URL = 'https://functions.poehali.dev/af57b0d5-c0b8-4326-bef9-9bf7f5750139';

export type Role = 'admin' | 'tutor' | 'student';

export interface User {
  id: number;
  full_name: string;
  email: string;
  role: Role;
  avatar_url: string | null;
  phone: string | null;
  city: string | null;
  bio: string | null;
  balance: number;
  is_blocked: boolean;
}

function userId(): string {
  try {
    const raw = localStorage.getItem('nastavnik_user');
    if (raw) return String(JSON.parse(raw).id);
  } catch { /* ignore */ }
  return '';
}

export const authApi = {
  async login(email: string, password: string) {
    const r = await fetch(AUTH_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'login', email, password }),
    });
    const data = await r.json();
    if (!r.ok) throw new Error(data.error || 'Ошибка входа');
    return data as { token: string; user: User };
  },
  async register(full_name: string, email: string, password: string, role: Role) {
    const r = await fetch(AUTH_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'register', full_name, email, password, role }),
    });
    const data = await r.json();
    if (!r.ok) throw new Error(data.error || 'Ошибка регистрации');
    return data as { token: string; user: User };
  },
};

async function dataGet(resource: string, params: Record<string, string | number | undefined> = {}) {
  const qs = new URLSearchParams({ resource });
  Object.entries(params).forEach(([k, v]) => { if (v !== undefined && v !== '') qs.append(k, String(v)); });
  const r = await fetch(`${DATA_URL}?${qs.toString()}`, {
    headers: { 'X-User-Id': userId() },
  });
  return r.json();
}

async function dataSend(method: string, resource: string, body: Record<string, unknown> = {}) {
  const r = await fetch(`${DATA_URL}?resource=${resource}`, {
    method,
    headers: { 'Content-Type': 'application/json', 'X-User-Id': userId() },
    body: JSON.stringify(body),
  });
  return r.json();
}

export const api = {
  categories: () => dataGet('categories'),
  services: (p?: Record<string, string | number | undefined>) => dataGet('services', p),
  service: (id: number) => dataGet('service', { id }),
  bookings: (role: Role) => dataGet('bookings', { role }),
  reviews: (tutor_id?: number) => dataGet('reviews', { tutor_id }),
  transactions: () => dataGet('transactions'),
  allTransactions: () => dataGet('all_transactions'),
  favorites: () => dataGet('favorites'),
  complaints: () => dataGet('complaints'),
  articles: () => dataGet('articles'),
  notifications: () => dataGet('notifications'),
  users: (role?: string) => dataGet('users', { role }),
  stats: () => dataGet('stats'),
  tutorStats: () => dataGet('tutor_stats'),

  createService: (b: Record<string, unknown>) => dataSend('POST', 'service', b),
  updateService: (b: Record<string, unknown>) => dataSend('PUT', 'service', b),
  setServiceStatus: (id: number, status: string) => dataSend('PUT', 'service_status', { id, status }),
  deleteService: (id: number) => dataSend('DELETE', 'service', { id }),

  createBooking: (b: Record<string, unknown>) => dataSend('POST', 'booking', b),
  setBookingStatus: (id: number, status: string) => dataSend('PUT', 'booking_status', { id, status }),

  createReview: (b: Record<string, unknown>) => dataSend('POST', 'review', b),
  toggleFavorite: (service_id: number) => dataSend('POST', 'favorite', { service_id }),
  createComplaint: (b: Record<string, unknown>) => dataSend('POST', 'complaint', b),
  setComplaintStatus: (id: number, status: string) => dataSend('PUT', 'complaint_status', { id, status }),

  createArticle: (b: Record<string, unknown>) => dataSend('POST', 'article', b),
  deleteArticle: (id: number) => dataSend('DELETE', 'article', { id }),
  createCategory: (b: Record<string, unknown>) => dataSend('POST', 'category', b),
  deleteCategory: (id: number) => dataSend('DELETE', 'category', { id }),

  blockUser: (id: number, is_blocked: boolean) => dataSend('PUT', 'user_block', { id, is_blocked }),
  setUserRole: (id: number, role: string) => dataSend('PUT', 'user_role', { id, role }),
  updateProfile: (b: Record<string, unknown>) => dataSend('PUT', 'profile', b),
  markNotificationsRead: () => dataSend('PUT', 'notification_read', {}),
};
