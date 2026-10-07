import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, LogOut, UserRound } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Logo, Button } from '@/components/ui';
import { useToast } from '@/contexts/ToastContext';

export function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const handleLogout = () => {
    logout();
    toast.success('Sesión cerrada correctamente');
    navigate('/login');
  };

  const initial = user?.name?.charAt(0)?.toUpperCase() || '?';

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition ${
      isActive
        ? 'bg-elevated text-text'
        : 'text-muted hover:bg-elevated/60 hover:text-text'
    }`;

  return (
    <div className="min-h-screen bg-bg">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-32 top-0 h-96 w-96 rounded-full bg-accent-violet/10 blur-3xl" />
        <div className="absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-accent-cyan/10 blur-3xl" />
      </div>

      <header className="relative z-10 border-b border-border/80 bg-surface/70 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
          <Logo />
          <nav className="flex items-center gap-1">
            <NavLink to="/dashboard" className={linkClass}>
              <LayoutDashboard className="h-4 w-4" />
              <span className="hidden sm:inline">Panel</span>
            </NavLink>
            <NavLink to="/profile" className={linkClass}>
              <UserRound className="h-4 w-4" />
              <span className="hidden sm:inline">Perfil</span>
            </NavLink>
          </nav>
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium text-text">{user?.name}</p>
              <p className="font-mono text-[11px] text-muted">{user?.email}</p>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-accent-violet/80 to-accent-cyan/80 text-sm font-semibold text-bg">
              {initial}
            </div>
            <Button variant="ghost" onClick={handleLogout} aria-label="Cerrar sesión" className="!px-2">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-6xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
