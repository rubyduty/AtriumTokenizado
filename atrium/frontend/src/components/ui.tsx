import { type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

export function Button({
  children,
  loading,
  variant = 'primary',
  className = '',
  disabled,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  loading?: boolean;
  variant?: 'primary' | 'ghost' | 'danger' | 'secondary';
}) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-violet/60 disabled:cursor-not-allowed disabled:opacity-50';
  const variants = {
    primary:
      'bg-gradient-to-r from-accent-violet to-accent-cyan text-bg shadow-glow hover:brightness-110',
    secondary:
      'border border-border bg-elevated text-text hover:border-accent-violet/40 hover:bg-elevated/80',
    ghost: 'text-muted hover:bg-elevated hover:text-text',
    danger: 'border border-danger/40 bg-danger/10 text-danger hover:bg-danger/20',
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
}

export function Input({
  label,
  error,
  className = '',
  id,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label?: string; error?: string }) {
  const inputId = id || props.name;
  return (
    <label className="flex w-full flex-col gap-1.5">
      {label && <span className="text-xs font-medium uppercase tracking-wide text-muted">{label}</span>}
      <input
        id={inputId}
        className={`w-full rounded-xl border bg-bg/60 px-3.5 py-2.5 text-sm text-text outline-none transition placeholder:text-muted/60 focus:border-accent-violet/50 focus:ring-2 focus:ring-accent-violet/20 ${
          error ? 'border-danger/50' : 'border-border'
        } ${className}`}
        {...props}
      />
      {error && <span className="text-xs text-danger">{error}</span>}
    </label>
  );
}

export function Card({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-2xl border border-border bg-surface/80 p-5 shadow-card backdrop-blur ${className}`}>
      {children}
    </div>
  );
}

export function Logo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = { sm: 'h-7 w-7 text-sm', md: 'h-9 w-9 text-base', lg: 'h-12 w-12 text-lg' };
  return (
    <div className="flex items-center gap-2.5">
      <div
        className={`flex items-center justify-center rounded-xl bg-gradient-to-br from-accent-violet to-accent-cyan font-semibold text-bg ${sizes[size]}`}
      >
        A
      </div>
      <span className="font-semibold tracking-tight text-text">
        Atrium
        <span className="ml-1 text-xs font-normal text-muted">API</span>
      </span>
    </div>
  );
}

export function Spinner({ className = 'h-5 w-5' }: { className?: string }) {
  return <Loader2 className={`animate-spin text-accent-violet ${className}`} />;
}

export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-elevated ${className}`} />;
}
