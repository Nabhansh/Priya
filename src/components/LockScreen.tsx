import React, { useMemo, useState } from 'react';
import { Lock, Eye, EyeOff, Loader2, AlertCircle, ShieldCheck, ArrowLeft, Info } from 'lucide-react';
import { useVault } from '@/context/VaultContext';
import { useAuth } from '@/context/AuthContext';
import { StrengthMeter } from '@/components/StrengthMeter';
import { isPasswordValid } from '@/lib/validation';

export function LockScreen() {
  const { unlock, unlocking, error } = useVault();
  const { user, signOut } = useAuth();
  const [masterPw, setMasterPw] = useState('');
  const [showPw, setShowPw] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await unlock(masterPw);
  };

  const showStrength = useMemo(() => masterPw.length > 0, [masterPw]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-ink-950">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/4 left-1/2 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-brand-600/15 blur-[120px]" />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
      </div>

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-md animate-fade-in-up">
          <div className="mb-8 flex flex-col items-center text-center">
            <div className="relative mb-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 shadow-lg shadow-brand-500/30">
                <Lock className="h-8 w-8 text-white" strokeWidth={2.2} />
              </div>
              <div className="absolute -inset-1 -z-10 rounded-2xl bg-brand-500/30 blur-md" />
            </div>
            <h1 className="text-2xl font-bold text-white">Vault Locked</h1>
            <p className="mt-2 text-sm text-slate-400">
              Enter your master password to decrypt your vault.
            </p>
            <p className="mt-1 text-xs text-slate-600">
              Signed in as {user?.email}
            </p>
          </div>

          <div className="glass rounded-2xl border border-white/10 p-6 shadow-2xl shadow-black/40 sm:p-8">
            <form onSubmit={submit} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-300">Master Password</label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <input
                    type={showPw ? 'text' : 'password'}
                    required
                    autoFocus
                    value={masterPw}
                    onChange={(e) => setMasterPw(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-white/10 bg-ink-950/60 py-3 pl-10 pr-11 text-sm text-white placeholder-slate-500 outline-none transition focus:border-brand-500/50 focus:ring-2 focus:ring-brand-500/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-slate-300"
                  >
                    {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>

                {showStrength && (
                  <div className="mt-3 animate-fade-in">
                    <StrengthMeter password={masterPw} />
                  </div>
                )}
              </div>

              {/* Info banner for first-time users */}
              <div className="flex items-start gap-2.5 rounded-xl border border-brand-500/20 bg-brand-500/5 px-4 py-3 text-xs leading-relaxed text-slate-400">
                <Info className="mt-0.5 h-4 w-4 shrink-0 text-brand-400" />
                <span>
                  First time here? Your master password <strong className="text-slate-300">encrypts your entire vault</strong> and is never stored.
                  Make sure it's strong — and remember it, because it can't be recovered.
                </span>
              </div>

              {error && (
                <div className="flex items-start gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300 animate-fade-in">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={unlocking || !masterPw}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-500/25 transition hover:shadow-brand-500/40 hover:brightness-110 active:scale-[0.98] disabled:opacity-60"
              >
                {unlocking ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                {unlocking ? 'Decrypting…' : 'Unlock Vault'}
              </button>
            </form>

            <button
              onClick={() => signOut()}
              className="mt-5 flex w-full items-center justify-center gap-1.5 text-xs text-slate-500 transition hover:text-slate-300"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Sign out of account
            </button>
          </div>

          <p className="mt-6 text-center text-xs leading-relaxed text-slate-600">
            Your master password is never stored or sent to our servers.
            It derives the encryption key locally — lose it and your vault
            cannot be recovered.
          </p>
        </div>
      </div>
    </div>
  );
}
