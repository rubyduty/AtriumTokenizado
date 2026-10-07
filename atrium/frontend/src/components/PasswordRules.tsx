import { Check, X } from 'lucide-react';

const RULES = [
  { id: 'len', label: 'Mínimo 8 caracteres', test: (p: string) => p.length >= 8 },
  { id: 'upper', label: 'Una mayúscula', test: (p: string) => /[A-Z]/.test(p) },
  { id: 'lower', label: 'Una minúscula', test: (p: string) => /[a-z]/.test(p) },
  { id: 'num', label: 'Un número', test: (p: string) => /[0-9]/.test(p) },
  { id: 'special', label: 'Un carácter especial', test: (p: string) => /[^A-Za-z0-9]/.test(p) },
];

export function PasswordRules({ password }: { password: string }) {
  return (
    <ul className="mt-2 grid gap-1.5 sm:grid-cols-2">
      {RULES.map((r) => {
        const ok = r.test(password);
        return (
          <li
            key={r.id}
            className={`flex items-center gap-1.5 text-xs ${ok ? 'text-accent-cyan' : 'text-muted'}`}
          >
            {ok ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
            {r.label}
          </li>
        );
      })}
    </ul>
  );
}

export function isPasswordStrong(password: string) {
  return RULES.every((r) => r.test(password));
}
