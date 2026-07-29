import React, { useState } from 'react';
import { Copy, Check, Eye, EyeOff, Star, Pencil, Trash2, ExternalLink, Globe } from 'lucide-react';
import type { VaultEntry } from '@/context/VaultContext';
import { useToast } from '@/context/ToastContext';

type Props = {
  key?: React.Key;
  entry: VaultEntry;
  onEdit: (entry: VaultEntry) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
};

function getInitials(title: string): string {
  const cleaned = title.replace(/^https?:\/\//, '').replace(/^www\./, '');
  const parts = cleaned.split(/[.\s/-]/).filter(Boolean);
  const letters = parts.slice(0, 2).map((p) => p[0]?.toUpperCase() ?? '');
  return letters.join('') || '?';
}

function getColor(title: string): string {
  const palette = [
    'from-emerald-500 to-teal-600',
    'from-blue-500 to-indigo-600',
    'from-rose-500 to-pink-600',
    'from-amber-500 to-orange-600',
    'from-cyan-500 to-sky-600',
    'from-violet-500 to-purple-600',
    'from-lime-500 to-green-600',
  ];
  let hash = 0;
  for (let i = 0; i < title.length; i++) hash = (hash * 31 + title.charCodeAt(i)) >>> 0;
  return palette[hash % palette.length];
}

export function PasswordCard({ entry, onEdit, onDelete, onToggleFavorite }: Props) {
  const [showPw, setShowPw] = useState(false);
  const [copied, setCopied] = useState<'user' | 'pass' | null>(null);
  const { toast } = useToast();

  const copy = (text: string, kind: 'user' | 'pass') => {
    navigator.clipboard.writeText(text);
    setCopied(kind);
    toast(kind === 'pass' ? 'Password copied' : 'Username copied');
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <div className="group relative animate-fade-in-up overflow-hidden rounded-2xl border border-white/10 bg-ink-900/50 p-4 transition-all hover:border-white/20 hover:bg-ink-850/60 hover:shadow-xl hover:shadow-black/30 sm:p-5">
      {/* Top row */}
      <div className="flex items-start gap-3">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${getColor(
            entry.title,
          )} text-sm font-bold text-white shadow-lg`}
        >
          {getInitials(entry.title)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <h3 className="truncate font-semibold text-white">{entry.title}</h3>
            {entry.favorite && (
              <Star className="h-3.5 w-3.5 shrink-0 fill-amber-400 text-amber-400" />
            )}
          </div>
          <p className="truncate text-xs text-slate-400">{entry.decrypted.username || 'No username'}</p>
          {entry.url && (
            <a
              href={entry.url.startsWith('http') ? entry.url : `https://${entry.url}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-0.5 inline-flex items-center gap-1 text-xs text-brand-400 transition hover:text-brand-300"
            >
              <Globe className="h-3 w-3" />
              <span className="max-w-[180px] truncate">{entry.url}</span>
              <ExternalLink className="h-2.5 w-2.5 opacity-50" />
            </a>
          )}
        </div>
        <span className="rounded-md bg-ink-800/80 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-400">
          {entry.category}
        </span>
      </div>

      {/* Password row */}
      <div className="mt-4 flex items-center gap-2">
        <div className="flex-1 rounded-lg border border-white/5 bg-ink-950/50 px-3 py-2 font-mono text-sm text-slate-300">
          {showPw ? entry.decrypted.password : '•'.repeat(Math.min(entry.decrypted.password.length || 8, 16))}
        </div>
        <button
          onClick={() => setShowPw((v) => !v)}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-ink-800/60 text-slate-400 transition hover:text-white hover:border-white/20"
          title={showPw ? 'Hide' : 'Reveal'}
        >
          {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
        <button
          onClick={() => copy(entry.decrypted.password, 'pass')}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-ink-800/60 text-slate-400 transition hover:text-white hover:border-white/20"
          title="Copy password"
        >
          {copied === 'pass' ? <Check className="h-4 w-4 text-brand-400" /> : <Copy className="h-4 w-4" />}
        </button>
      </div>

      {/* Username copy */}
      {entry.decrypted.username && (
        <button
          onClick={() => copy(entry.decrypted.username, 'user')}
          className="mt-2 flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs text-slate-500 transition hover:text-slate-300"
        >
          <span className="truncate">Copy username: {entry.decrypted.username}</span>
          {copied === 'user' ? <Check className="h-3.5 w-3.5 text-brand-400" /> : <Copy className="h-3.5 w-3.5" />}
        </button>
      )}

      {/* Actions */}
      <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-3">
        <button
          onClick={() => onToggleFavorite(entry.id)}
          className={`flex items-center gap-1.5 text-xs transition ${
            entry.favorite ? 'text-amber-400' : 'text-slate-500 hover:text-amber-400'
          }`}
        >
          <Star className={`h-3.5 w-3.5 ${entry.favorite ? 'fill-amber-400' : ''}`} />
          {entry.favorite ? 'Favorited' : 'Favorite'}
        </button>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit(entry)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-ink-800 hover:text-brand-400"
            title="Edit"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => onDelete(entry.id)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-red-500/10 hover:text-red-400"
            title="Delete"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
