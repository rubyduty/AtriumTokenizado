import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  KeyRound,
  Search,
  Server,
  Users,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { getUsers, healthCheck, getErrorMessage } from '@/lib/api';
import type { User } from '@/types/api';
import { Button, Card, Skeleton } from '@/components/ui';

export function Dashboard() {
  const { token, user } = useAuth();
  const toast = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiOnline, setApiOnline] = useState<boolean | null>(null);
  const [query, setQuery] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const [usersRes, healthRes] = await Promise.all([
        getUsers(),
        healthCheck().catch(() => null),
      ]);
      setUsers(usersRes.data || []);
      setApiOnline(healthRes?.data?.status === 'online');
    } catch (err) {
      toast.error(getErrorMessage(err, 'No se pudieron cargar los usuarios'));
      setApiOnline(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.id.toLowerCase().includes(q)
    );
  }, [users, query]);

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleString('es-ES', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });

  const stats = [
    {
      label: 'Usuarios (muestra)',
      value: loading ? '—' : String(users.length),
      hint: 'Primeros 10 de la API',
      icon: Users,
      accent: 'from-accent-violet/20 to-transparent',
    },
    {
      label: 'Sesión actual',
      value: user?.name?.split(' ')[0] || '—',
      hint: user?.email || '',
      icon: Activity,
      accent: 'from-accent-cyan/20 to-transparent',
    },
    {
      label: 'Estado API',
      value: apiOnline === null ? '…' : apiOnline ? 'Online' : 'Offline',
      hint: '/api/health',
      icon: Server,
      accent: apiOnline ? 'from-accent-cyan/20 to-transparent' : 'from-danger/20 to-transparent',
    },
    {
      label: 'Token activo',
      value: token ? 'Sí' : 'No',
      hint: token ? `${token.slice(0, 8)}…${token.slice(-4)}` : 'Sin sesión',
      icon: KeyRound,
      accent: 'from-accent-violet/15 to-transparent',
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-text">Panel de control</h1>
          <p className="mt-1 text-sm text-muted">
            Vista en tiempo real de usuarios y estado de la API Atrium
          </p>
        </div>
        <Button variant="secondary" onClick={() => void load()} loading={loading}>
          <RefreshCw className="h-4 w-4" />
          Actualizar
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className={`relative overflow-hidden bg-gradient-to-br ${s.accent}`}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted">{s.label}</p>
                  <p className="mt-2 text-2xl font-semibold text-text">{s.value}</p>
                  <p className="mt-1 truncate font-mono text-[11px] text-muted">{s.hint}</p>
                </div>
                <div className="rounded-lg border border-border bg-bg/40 p-2">
                  <s.icon className="h-4 w-4 text-accent-violet" />
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <Card className="!p-0 overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
          <div>
            <h2 className="font-semibold text-text">Usuarios registrados</h2>
            <p className="text-xs text-muted">GET /api/users · sin contraseñas</p>
          </div>
          <div className="relative w-full max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por nombre, email o id…"
              className="w-full rounded-xl border border-border bg-bg/60 py-2 pl-9 pr-3 text-sm text-text outline-none placeholder:text-muted/60 focus:border-accent-violet/40 focus:ring-2 focus:ring-accent-violet/15"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-elevated/50 text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="px-5 py-3 font-medium">Nombre</th>
                <th className="px-5 py-3 font-medium">Email</th>
                <th className="px-5 py-3 font-medium">ID</th>
                <th className="px-5 py-3 font-medium">Creado</th>
              </tr>
            </thead>
            <tbody>
              {loading &&
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-t border-border/60">
                    <td className="px-5 py-3" colSpan={4}>
                      <Skeleton className="h-6 w-full" />
                    </td>
                  </tr>
                ))}

              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-5 py-12 text-center text-muted">
                    {query
                      ? 'No hay resultados para esa búsqueda'
                      : 'Aún no hay usuarios. Crea uno desde Registro.'}
                  </td>
                </tr>
              )}

              {!loading &&
                filtered.map((u) => (
                  <tr
                    key={u.id}
                    className="border-t border-border/60 transition hover:bg-elevated/30"
                  >
                    <td className="px-5 py-3 font-medium text-text">{u.name}</td>
                    <td className="px-5 py-3 text-muted">{u.email}</td>
                    <td className="px-5 py-3 font-mono text-xs text-muted">{u.id.slice(0, 8)}…</td>
                    <td className="px-5 py-3 text-muted">{formatDate(u.createdAt)}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
