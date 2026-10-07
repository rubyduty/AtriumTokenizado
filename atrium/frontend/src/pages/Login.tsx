import { FormEvent, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { getErrorMessage } from '@/lib/api';
import { Button, Input, Logo } from '@/components/ui';

export function Login() {
  const { login, isAuthenticated } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [email, setEmail] = useState('demo@atrium.dev');
  const [password, setPassword] = useState('Demo123!');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  const validate = () => {
    const next: typeof errors = {};
    if (!email.trim()) next.email = 'El email es obligatorio';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = 'Email no válido';
    if (!password) next.password = 'La contraseña es obligatoria';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await login(email.trim(), password);
      toast.success('Inicio de sesión correcto');
      navigate('/dashboard');
    } catch (err) {
      toast.error(getErrorMessage(err, 'Credenciales incorrectas'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-bg px-4 py-10">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/4 top-1/4 h-72 w-72 rounded-full bg-accent-violet/15 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 h-72 w-72 rounded-full bg-accent-cyan/10 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_transparent_0%,_#0B0F14_70%)]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <Logo size="lg" />
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-text">Bienvenido de nuevo</h1>
            <p className="mt-1 text-sm text-muted">Accede a tu espacio de gestión de usuarios</p>
          </div>
        </div>

        <form
          onSubmit={onSubmit}
          className="rounded-2xl border border-border bg-surface/80 p-6 shadow-card backdrop-blur-md"
        >
          <div className="space-y-4">
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3.5 top-[2.35rem] h-4 w-4 text-muted" />
              <Input
                label="Email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={errors.email}
                className="pl-10"
                placeholder="tu@email.com"
              />
            </div>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3.5 top-[2.35rem] h-4 w-4 text-muted" />
              <Input
                label="Contraseña"
                type={show ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={errors.password}
                className="pl-10 pr-10"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShow((s) => !s)}
                className="absolute right-3 top-[2.25rem] text-muted hover:text-text"
                aria-label={show ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <Button type="submit" loading={loading} className="mt-6 w-full">
            Iniciar sesión
          </Button>

          <p className="mt-5 text-center text-sm text-muted">
            ¿No tienes cuenta?{' '}
            <Link to="/register" className="font-medium text-accent-cyan hover:underline">
              Crear cuenta
            </Link>
          </p>
        </form>

        <p className="mt-4 text-center font-mono text-[11px] text-muted/70">
          Demo · demo@atrium.dev / Demo123!
        </p>
      </motion.div>
    </div>
  );
}
