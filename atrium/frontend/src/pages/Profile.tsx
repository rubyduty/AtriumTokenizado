import { FormEvent, useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, UserRound } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { updateName, getErrorMessage } from '@/lib/api';
import { Button, Card, Input } from '@/components/ui';

export function Profile() {
  const { user, token, updateUser } = useAuth();
  const toast = useToast();
  const [name, setName] = useState(user?.name || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (name.trim().length < 2) {
      setError('El nombre debe tener al menos 2 caracteres');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await updateName(name.trim());
      updateUser(res.data);
      toast.success('Nombre actualizado correctamente');
    } catch (err) {
      toast.error(getErrorMessage(err, 'No se pudo actualizar el nombre'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-text">Mi perfil</h1>
        <p className="mt-1 text-sm text-muted">
          Actualiza tu nombre mediante <span className="font-mono text-accent-cyan">PATCH /api/users/name</span>
        </p>
      </div>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <Card>
          <div className="mb-6 flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-accent-violet to-accent-cyan text-xl font-semibold text-bg">
              {user?.name?.charAt(0)?.toUpperCase() || '?'}
            </div>
            <div>
              <p className="font-semibold text-text">{user?.name}</p>
              <p className="font-mono text-sm text-muted">{user?.email}</p>
            </div>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <Input
              label="Nombre"
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={error}
              placeholder="Tu nombre"
            />
            <Input label="Email" value={user?.email || ''} disabled className="opacity-60" />
            <div className="rounded-xl border border-border bg-bg/40 p-3">
              <div className="mb-1 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted">
                <Shield className="h-3.5 w-3.5" />
                Token de sesión (Bearer)
              </div>
              <p className="break-all font-mono text-[11px] text-accent-cyan/90">
                {token || '—'}
              </p>
            </div>
            <Button type="submit" loading={loading} className="w-full sm:w-auto">
              <UserRound className="h-4 w-4" />
              Guardar cambios
            </Button>
          </form>
        </Card>
      </motion.div>

      <Card className="border-dashed">
        <h3 className="text-sm font-semibold text-text">Cómo funciona esta pantalla</h3>
        <ol className="mt-3 list-decimal space-y-1.5 pl-4 text-sm text-muted">
          <li>El frontend envía el header <code className="font-mono text-accent-cyan">Authorization: Bearer TOKEN</code></li>
          <li>El middleware busca el token en la tabla <code className="font-mono">tokens</code></li>
          <li>Si es válido y no ha expirado, actualiza el <code className="font-mono">name</code> del usuario</li>
          <li>La API responde con el usuario actualizado (sin password)</li>
        </ol>
      </Card>
    </div>
  );
}
