import React, { useEffect, useState } from 'react';
import { X, Eye, EyeOff, RefreshCw, Copy, Check, Loader2, Save } from 'lucide-react';
import { generatePassword, DEFAULT_OPTIONS, type GeneratorOptions } from '@/lib/generator';
import { StrengthMeter } from '@/components/StrengthMeter';
import type { VaultEntry } from '@/context/VaultContext';

type FormData = {
  title: string;
  url: string;
  category: string;
  username: string;
  password: string;
  notes: string;
};

const CATEGORIES = ['General', 'Social', 'Work', 'Finance', 'Shopping', 'Email', 'Entertainment', 'Developer'];

type Props = {
  open: boolean;
  editing: VaultEntry | null;
  onClose: () => void;
  onSave: (data: FormData, id?: string) => Promise<void>;
};

export function EntryModal({ open, editing, onClose, onSave }: Props) {
  const [form, setForm] = useState<FormData>({
    title: '',
    url: '',
    category: 'General',
    username: '',
    password: '',
    notes: '',
  });
  const [showPw, setShowPw] = useState(false);
  const [showGen, setShowGen] = useState(false);
  const [genOpts, setGenOpts] = useState<GeneratorOptions>(DEFAULT_OPTIONS);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      if (editing) {
        setForm({
          title: editing.title,
          url: editing.url ?? '',
          category: editing.category,
          username: editing.decrypted.username,
          password: editing.decrypted.password,
          notes: editing.decrypted.notes,
        });
      } else {
        setForm({ title: '', url: '', category: 'General', username: '', password: '', notes: '' });
      }
      setError(null);
      setShowPw(false);
      setShowGen(false);
    }
  }, [open, editing]);

  if (!open) return null;

  const regen = () => {
    setForm((f) => ({ ...f, password: generatePassword(genOpts) }));
  };

  const copyPw = () => {
    navigator.clipboard.writeText(form.password);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      setError('Title is required');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await onSave(form, editing?.id);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-lg max-h-[90vh] overflow-y-auto animate-scale-in rounded-2xl border border-white/10 bg-ink-900 shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-ink-900/95 px-5 py-4 backdrop-blur">
          <h2 className="text-lg font-semibold text-white">
            {editing ? 'Edit Entry' : 'New Password Entry'}
          </h2>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-ink-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={submit} className="space-y-4 p-5">
          {/* Title */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-300">Title *</label>
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. GitHub"
              className="w-full rounded-xl border border-white/10 bg-ink-950/60 px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition focus:border-brand-500/50 focus:ring-2 focus:ring-brand-500/20"
            />
          </div>

          {/* URL + Category */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-300">Website URL</label>
              <input
                value={form.url}
                onChange={(e) => setForm({ ...form, url: e.target.value })}
                placeholder="github.com"
                className="w-full rounded-xl border border-white/10 bg-ink-950/60 px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition focus:border-brand-500/50 focus:ring-2 focus:ring-brand-500/20"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-300">Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-ink-950/60 px-4 py-2.5 text-sm text-white outline-none transition focus:border-brand-500/50 focus:ring-2 focus:ring-brand-500/20"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Username */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-300">Username / Email</label>
            <input
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              placeholder="your@email.com"
              className="w-full rounded-xl border border-white/10 bg-ink-950/60 px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition focus:border-brand-500/50 focus:ring-2 focus:ring-brand-500/20"
            />
          </div>

          {/* Password */}
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label className="text-xs font-medium text-slate-300">Password</label>
              <button
                type="button"
                onClick={() => setShowGen((v) => !v)}
                className="text-xs font-medium text-brand-400 transition hover:text-brand-300"
              >
                {showGen ? 'Hide generator' : 'Generate'}
              </button>
            </div>
            <div className="relative">
              <input
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                type={showPw ? 'text' : 'password'}
                placeholder="••••••••"
                className="w-full rounded-xl border border-white/10 bg-ink-950/60 py-2.5 pl-4 pr-20 font-mono text-sm text-white placeholder-slate-500 outline-none transition focus:border-brand-500/50 focus:ring-2 focus:ring-brand-500/20"
              />
              <div className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1">
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-500 transition hover:text-white"
                >
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
                <button
                  type="button"
                  onClick={copyPw}
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-500 transition hover:text-white"
                >
                  {copied ? <Check className="h-4 w-4 text-brand-400" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="mt-2">
              <StrengthMeter password={form.password} />
            </div>

            {/* Generator panel */}
            {showGen && (
              <div className="mt-3 animate-fade-in rounded-xl border border-white/10 bg-ink-950/60 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-300">Length: {genOpts.length}</span>
                  <button
                    type="button"
                    onClick={regen}
                    className="flex items-center gap-1.5 rounded-lg bg-brand-500/15 px-3 py-1.5 text-xs font-medium text-brand-300 transition hover:bg-brand-500/25"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    Regenerate
                  </button>
                </div>
                <input
                  type="range"
                  min={8}
                  max={48}
                  value={genOpts.length}
                  onChange={(e) => setGenOpts({ ...genOpts, length: Number(e.target.value) })}
                  className="mt-2 w-full accent-brand-500"
                />
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {([
                    ['uppercase', 'A-Z'],
                    ['lowercase', 'a-z'],
                    ['numbers', '0-9'],
                    ['symbols', '!@#'],
                  ] as const).map(([key, label]) => (
                    <label
                      key={key}
                      className="flex items-center gap-2 rounded-lg border border-white/5 bg-ink-900/40 px-3 py-2 text-xs text-slate-300 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={genOpts[key]}
                        onChange={(e) => setGenOpts({ ...genOpts, [key]: e.target.checked })}
                        className="h-3.5 w-3.5 accent-brand-500"
                      />
                      {label}
                    </label>
                  ))}
                </div>
                <label className="mt-2 flex items-center gap-2 text-xs text-slate-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={genOpts.excludeAmbiguous}
                    onChange={(e) => setGenOpts({ ...genOpts, excludeAmbiguous: e.target.checked })}
                    className="h-3.5 w-3.5 accent-brand-500"
                  />
                  Exclude ambiguous characters (Il1O0)
                </label>
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-300">Notes</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Optional notes…"
              rows={2}
              className="w-full resize-none rounded-xl border border-white/10 bg-ink-950/60 px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition focus:border-brand-500/50 focus:ring-2 focus:ring-brand-500/20"
            />
          </div>

          {error && (
            <p className="text-sm text-red-400">{error}</p>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-white/10 bg-ink-800/60 py-3 text-sm font-medium text-slate-300 transition hover:bg-ink-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-500/25 transition hover:brightness-110 active:scale-[0.98] disabled:opacity-60"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {editing ? 'Save Changes' : 'Add Entry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
