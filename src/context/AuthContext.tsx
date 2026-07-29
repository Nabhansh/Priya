import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

export type User = {
  id: string;
  email: string;
};

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('priya_vault_user');
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  const signIn = async (email: string, _password: string) => {
    const newUser = { id: 'usr_' + btoa(email).replace(/=/g, ''), email };
    setUser(newUser);
    localStorage.setItem('priya_vault_user', JSON.stringify(newUser));
  };

  const signUp = async (email: string, password: string) => {
    await signIn(email, password);
  };

  const signOut = async () => {
    setUser(null);
    localStorage.removeItem('priya_vault_user');
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, signIn, signUp, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
