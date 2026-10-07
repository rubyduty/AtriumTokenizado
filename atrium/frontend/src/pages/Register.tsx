import { FormEvent, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { getErrorMessage } from '@/lib/api';
import { Button, Input, Logo } from '@/components/ui';
import { PasswordRules, isPasswordStrong } from '@/components/PasswordRules';

export function Register() {
  const { register, isAuthenticated } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  const validate = () => {
    const next: Record<string, string> = {};
    if (name.trim().length < 2) next.name = 'El nombre debe tener al menos 2 caracteres';
    if (!email.trim()) next.email = 'El email es obligatorio';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = 'Email no válido';
    if (!isPasswordStrong(password)) next.password = 'La contraseña no cumple los requisitos';
    if (password !== confirm) next.confirm = 'Las contraseñas no coinciden';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await register(name.trim(), email.trim().toLowerCase(), password);
      toast.success('Cuenta creada. Sesión iniciada');
      navigate('/dashboard');
    } catch (err) {
      toast.error(getErrorMessage(err, 'No se pudo crear la cuenta'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-bg px-4 py-10">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute right-1/4 top-1/3 h-72 w-72 rounded-full bg-accent-cyan/12 blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 h-72 w-72 rounded-full bg-accent-violet/12 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <Logo size="lg" />
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-text">Crear cuenta</h1>
            <p className="mt-1 text-sm text-muted">Regístrate para gestionar usuarios y sesiones</p>
          </div>
        </div>

        <form
          onSubmit={onSubmit}
          className="rounded-2xl border border-border bg-surface/80 p-6 shadow-card backdrop-blur-md"
        >
          <div className="space-y-4">
            <Input
              label="Nombre"
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={errors.name}
              placeholder="Juan Pérez"
              autoComplete="name"
            />
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
              placeholder="juan@example.com"
              autoComplete="email"
            />
            <div>
              <Input
                label="Contraseña"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={errors.password}
                placeholder="Password123!"
                autoComplete="new-password"
              />
              <PasswordRules password={password} />
            </div>
            <Input
              label="Confirmar contraseña"
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              error={errors.confirm}
              placeholder="Repite la contraseña"
              autoComplete="new-password"
            />
          </div>

          <Button type="submit" loading={loading} className="mt-6 w-full">
            Registrarme
          </Button>

          <p className="mt-5 text-center text-sm text-muted">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="font-medium text-accent-cyan hover:underline">
              Iniciar sesión
            </Link>
          </p>
        </form>
      </motion.div>
    </div>
  );
}
