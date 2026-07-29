import { AuthProvider, useAuth } from '@/context/AuthContext';
import { VaultProvider, useVault } from '@/context/VaultContext';
import { ToastProvider } from '@/context/ToastContext';
import { AuthScreen } from '@/components/AuthScreen';
import { LockScreen } from '@/components/LockScreen';
import { Dashboard } from '@/components/Dashboard';
import { Loader2 } from 'lucide-react';

function AppShell() {
  const { user, loading } = useAuth();
  const { locked } = useVault();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ink-950">
        <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
      </div>
    );
  }

  if (!user) return <AuthScreen />;
  if (locked) return <LockScreen />;
  return <Dashboard />;
}

export default function App() {
  return (
    <AuthProvider>
      <VaultProvider>
        <ToastProvider>
          <AppShell />
        </ToastProvider>
      </VaultProvider>
    </AuthProvider>
  );
}
