import React, { useMemo, useState } from 'react';
import {
  Shield, Lock, Mail, Eye, EyeOff, Loader2, AlertCircle, Check, X, KeyRound,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { validatePassword, isPasswordValid, PASSWORD_RULES } from '@/lib/validation';
import { StrengthMeter } from '@/components/StrengthMeter';

export function AuthScreen() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validation = useMemo(() => validatePassword(password), [password]);
  const passwordsMatch = !confirmPw || password === confirmPw;
  const canSubmit =
    mode === 'signin'
      ? email.trim().length > 0 && password.length > 0
      : email.trim().length > 0 && isPasswordValid(password) && passwordsMatch && password === confirmPw;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (mode === 'signup' && !isPasswordValid(password)) {
      setError('Please meet all password requirements.');
      return;
    }
    if (mode === 'signup' && password !== confirmPw) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      if (mode === 'signin') {
        await signIn(email, password);
      } else {
        await signUp(email, password);
        await signIn(email, password);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-ink-950">
      {/* Ambient background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 -left-40 h-[32rem] w-[32rem] rounded-full bg-brand-600/20 blur-[120px]" />
        <div className="absolute top-1/3 -right-40 h-[28rem] w-[28rem] rounded-full bg-emerald-500/10 blur-[120px]" />
        <div className="absolute bottom-0 left-1/3 h-[24rem] w-[24rem] rounded-full bg-cyan-500/10 blur-[120px]" />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
      </div>

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-10">
        <div className="grid w-full max-w-4xl gap-0 lg:grid-cols-2 lg:items-center">
          {/* Left: branding panel (desktop only) */}
          <div className="hidden animate-fade-in-up flex-col justify-center pr-12 lg:flex">
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 shadow-lg shadow-brand-500/30">
              <Shield className="h-7 w-7 text-white" strokeWidth={2.2} />
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-white">
              KeyVault
            </h1>
            <p className="mt-3 max-w-sm text-base leading-relaxed text-slate-400">
              A zero-knowledge password manager. Your passwords are encrypted
              in your browser before they ever touch our servers.
            </p>
            <div className="mt-8 space-y-4">
              {[
                { icon: Lock, title: 'AES-256 Encryption', desc: 'Military-grade encryption for every entry' },
                { icon: KeyRound, title: 'Master Password', desc: 'Only you can decrypt your vault' },
                { icon: Shield, title: 'Zero Knowledge', desc: 'We never see your plaintext data' },
              ].map((f) => (
                <div key={f.title} className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-500/10 text-brand-400">
                    <f.icon className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{f.title}</p>
                    <p className="text-xs text-slate-500">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: auth card */}
          <div className="w-full max-w-md animate-fade-in-up justify-self-center lg:max-w-none">
            {/* Mobile logo */}
            <div className="mb-6 flex flex-col items-center text-center lg:hidden">
              <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 shadow-lg shadow-brand-500/30">
                <Shield className="h-7 w-7 text-white" strokeWidth={2.2} />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-white">KeyVault</h1>
            </div>

            <div className="glass rounded-2xl border border-white/10 p-6 shadow-2xl shadow-black/40 sm:p-8">
              <div className="mb-6 flex rounded-xl bg-ink-900/60 p-1">
                <button
                  onClick={() => { setMode('signin'); setError(null); }}
                  className={`flex-1 rounded-lg py-2 text-sm font-medium transition-all ${
                    mode === 'signin'
                      ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/20'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Sign In
                </button>
                <button
                  onClick={() => { setMode('signup'); setError(null); }}
                  className={`flex-1 rounded-lg py-2 text-sm font-medium transition-all ${
                    mode === 'signup'
                      ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/20'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Create Account
                </button>
              </div>

              <form onSubmit={submit} className="space-y-4">
                {/* Email */}
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-300">Email</label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full rounded-xl border border-white/10 bg-ink-950/60 py-3 pl-10 pr-4 text-sm text-white placeholder-slate-500 outline-none transition focus:border-brand-500/50 focus:ring-2 focus:ring-brand-500/20"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-300">
                    {mode === 'signin' ? 'Password' : 'Create a Password'}
                  </label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                    <input
                      type={showPw ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
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

                  {/* Strength meter + requirements (signup only) */}
                  {mode === 'signup' && password.length > 0 && (
                    <div className="mt-3 animate-fade-in space-y-3">
                      <StrengthMeter password={password} />
                      <div className="grid grid-cols-1 gap-1.5">
                        {PASSWORD_RULES.map((rule) => {
                          const ok = validation.passed.some((p) => p.id === rule.id);
                          return (
                            <div
                              key={rule.id}
                              className={`flex items-center gap-2 text-xs transition ${
                                ok ? 'text-brand-400' : 'text-slate-500'
                              }`}
                            >
                              {ok ? (
                                <Check className="h-3.5 w-3.5 shrink-0" />
                              ) : (
                                <X className="h-3.5 w-3.5 shrink-0 text-slate-600" />
                              )}
                              <span>{rule.label}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirm password (signup only) */}
                {mode === 'signup' && (
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-slate-300">Confirm Password</label>
                    <div className="relative">
                      <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                      <input
                        type={showPw ? 'text' : 'password'}
                        required
                        value={confirmPw}
                        onChange={(e) => setConfirmPw(e.target.value)}
                        placeholder="••••••••"
                        className={`w-full rounded-xl border bg-ink-950/60 py-3 pl-10 pr-11 text-sm text-white placeholder-slate-500 outline-none transition focus:ring-2 focus:ring-brand-500/20 ${
                          !passwordsMatch
                            ? 'border-red-500/50 focus:border-red-500/50'
                            : 'border-white/10 focus:border-brand-500/50'
                        }`}
                      />
                      {confirmPw.length > 0 && (
                        <span className="absolute right-3 top-1/2 -translate-y-1/2">
                          {passwordsMatch ? (
                            <Check className="h-4 w-4 text-brand-400" />
                          ) : (
                            <X className="h-4 w-4 text-red-400" />
                          )}
                        </span>
                      )}
                    </div>
                    {!passwordsMatch && (
                      <p className="mt-1.5 text-xs text-red-400">Passwords do not match</p>
                    )}
                  </div>
                )}

                {error && (
                  <div className="flex items-start gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300 animate-fade-in">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || !canSubmit}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-500/25 transition hover:shadow-brand-500/40 hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  {mode === 'signin' ? 'Sign In' : 'Create Account'}
                </button>
              </form>

              <p className="mt-5 text-center text-xs leading-relaxed text-slate-500">
                {mode === 'signin' ? (
                  <>Use your account password to sign in. You'll unlock your vault next.</>
                ) : (
                  <>Your account password secures your login. You'll set a separate master password to encrypt your vault.</>
                )}
              </p>
            </div>

            <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-600">
              <Shield className="h-3.5 w-3.5" />
              <span>AES-256 encryption · Zero-knowledge architecture</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
