import { useMemo } from 'react';
import { scorePassword } from '@/lib/crypto';

const COLORS = ['#ef4444', '#f97316', '#eab308', '#84cc16', '#10b981'];
const LABELS = ['Very weak', 'Weak', 'Fair', 'Strong', 'Excellent'];

export function StrengthMeter({ password }: { password: string }) {
  const { score, label, crackTime } = useMemo(() => scorePassword(password), [password]);
  const active = password.length > 0 ? score : 0;

  return (
    <div>
      <div className="flex gap-1">
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-1.5 flex-1 rounded-full transition-all duration-300"
            style={{
              backgroundColor: i < active ? COLORS[Math.max(0, active - 1)] : '#1e293b',
            }}
          />
        ))}
      </div>
      <div className="mt-1.5 flex items-center justify-between text-xs">
        <span className="text-slate-400">
          {password ? label : '—'}
        </span>
        {password && (
          <span className="text-slate-500">
            ~{crackTime} to crack
          </span>
        )}
      </div>
    </div>
  );
}
