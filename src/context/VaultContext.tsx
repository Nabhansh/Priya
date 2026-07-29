import React, { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import {
  entriesToCSV,
  csvToEntries,
  downloadCSVFile,
  type HumanEntry,
} from '@/lib/csv';

export type VaultEntry = {
  id: string;
  user_id: string;
  title: string;
  url: string | null;
  category: string;
  encrypted_data: string;
  favorite: boolean;
  created_at: string;
  updated_at: string;
  decrypted: {
    username: string;
    password: string;
    notes: string;
  };
};

type VaultContextValue = {
  locked: boolean;
  unlocking: boolean;
  entries: VaultEntry[];
  loading: boolean;
  error: string | null;
  unlock: (masterPassword: string) => Promise<void>;
  lock: () => void;
  addEntry: (input: {
    title: string;
    url: string;
    category: string;
    username: string;
    password: string;
    notes: string;
  }) => Promise<void>;
  updateEntry: (
    id: string,
    input: {
      title: string;
      url: string;
      category: string;
      username: string;
      password: string;
      notes: string;
    },
  ) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;
  toggleFavorite: (id: string) => Promise<void>;
  exportCSV: () => void;
  importCSV: (csvText: string) => Promise<number>;
  getRawCSV: () => string;
};

const STORAGE_KEY = 'priya_vault_csv_data';
const MASTER_KEY = 'priya_vault_master_pass';

const VaultContext = createContext<VaultContextValue | undefined>(undefined);

export function VaultProvider({ children }: { children: ReactNode }) {
  const [locked, setLocked] = useState(true);
  const [unlocking, setUnlocking] = useState(false);
  const [entries, setEntries] = useState<VaultEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Helper to sync state to CSV in localStorage
  const syncToCSVStorage = useCallback((currentEntries: VaultEntry[]) => {
    const humanEntries: HumanEntry[] = currentEntries.map((e) => ({
      id: e.id,
      title: e.title,
      category: e.category,
      url: e.url || '',
      username: e.decrypted.username,
      password: e.decrypted.password,
      notes: e.decrypted.notes,
      favorite: e.favorite,
      createdAt: e.created_at,
      updatedAt: e.updated_at,
    }));

    const csvContent = entriesToCSV(humanEntries);
    localStorage.setItem(STORAGE_KEY, csvContent);
    return csvContent;
  }, []);

  // Load entries from CSV storage
  const loadFromCSVStorage = useCallback(() => {
    try {
      const csvContent = localStorage.getItem(STORAGE_KEY);
      if (!csvContent) {
        // Seed default initial sample entry if empty
        const sampleHuman: HumanEntry[] = [
          {
            id: 'entry_sample_1',
            title: 'Google Account',
            category: 'Logins',
            url: 'https://accounts.google.com',
            username: 'user@gmail.com',
            password: 'SuperSecretPassword123!',
            notes: 'Primary email account',
            favorite: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: 'entry_sample_2',
            title: 'GitHub',
            category: 'Developer',
            url: 'https://github.com',
            username: 'dev_user',
            password: 'GitHubPass2026#',
            notes: 'Personal developer account',
            favorite: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ];
        const defaultCSV = entriesToCSV(sampleHuman);
        localStorage.setItem(STORAGE_KEY, defaultCSV);
        return loadFromCSVStorage();
      }

      const humanList = csvToEntries(csvContent);
      const vaultList: VaultEntry[] = humanList.map((h) => ({
        id: h.id,
        user_id: 'local_user',
        title: h.title,
        url: h.url || null,
        category: h.category || 'General',
        encrypted_data: '',
        favorite: h.favorite,
        created_at: h.createdAt,
        updated_at: h.updatedAt,
        decrypted: {
          username: h.username,
          password: h.password,
          notes: h.notes,
        },
      }));

      setEntries(vaultList);
    } catch (err) {
      console.error('Failed to parse CSV storage:', err);
      setError('Could not read vault CSV file from local storage.');
    }
  }, []);

  const unlock = useCallback(
    async (masterPassword: string) => {
      setUnlocking(true);
      setError(null);
      try {
        const storedMaster = localStorage.getItem(MASTER_KEY);
        if (!storedMaster) {
          // Set initial master password
          localStorage.setItem(MASTER_KEY, masterPassword);
        } else if (storedMaster !== masterPassword) {
          throw new Error('Incorrect master password');
        }

        setLocked(false);
        loadFromCSVStorage();
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to unlock vault');
        setLocked(true);
      } finally {
        setUnlocking(false);
      }
    },
    [loadFromCSVStorage],
  );

  const lock = useCallback(() => {
    setEntries([]);
    setLocked(true);
  }, []);

  const addEntry = useCallback(
    async (input: {
      title: string;
      url: string;
      category: string;
      username: string;
      password: string;
      notes: string;
    }) => {
      const now = new Date().toISOString();
      const newEntry: VaultEntry = {
        id: 'entry_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now(),
        user_id: 'local_user',
        title: input.title,
        url: input.url || null,
        category: input.category || 'General',
        encrypted_data: '',
        favorite: false,
        created_at: now,
        updated_at: now,
        decrypted: {
          username: input.username,
          password: input.password,
          notes: input.notes,
        },
      };

      setEntries((prev) => {
        const updated = [newEntry, ...prev];
        syncToCSVStorage(updated);
        return updated;
      });
    },
    [syncToCSVStorage],
  );

  const updateEntry = useCallback(
    async (
      id: string,
      input: {
        title: string;
        url: string;
        category: string;
        username: string;
        password: string;
        notes: string;
      },
    ) => {
      const now = new Date().toISOString();
      setEntries((prev) => {
        const updated = prev.map((e) =>
          e.id === id
            ? {
                ...e,
                title: input.title,
                url: input.url || null,
                category: input.category || 'General',
                updated_at: now,
                decrypted: {
                  username: input.username,
                  password: input.password,
                  notes: input.notes,
                },
              }
            : e,
        );
        syncToCSVStorage(updated);
        return updated;
      });
    },
    [syncToCSVStorage],
  );

  const deleteEntry = useCallback(
    async (id: string) => {
      setEntries((prev) => {
        const updated = prev.filter((e) => e.id !== id);
        syncToCSVStorage(updated);
        return updated;
      });
    },
    [syncToCSVStorage],
  );

  const toggleFavorite = useCallback(
    async (id: string) => {
      setEntries((prev) => {
        const updated = prev.map((e) =>
          e.id === id ? { ...e, favorite: !e.favorite } : e,
        );
        syncToCSVStorage(updated);
        return updated;
      });
    },
    [syncToCSVStorage],
  );

  const exportCSV = useCallback(() => {
    const csvContent = getRawCSV();
    downloadCSVFile(csvContent, 'passwords_vault.csv');
  }, [entries]);

  const getRawCSV = useCallback(() => {
    const humanEntries: HumanEntry[] = entries.map((e) => ({
      id: e.id,
      title: e.title,
      category: e.category,
      url: e.url || '',
      username: e.decrypted.username,
      password: e.decrypted.password,
      notes: e.decrypted.notes,
      favorite: e.favorite,
      createdAt: e.created_at,
      updatedAt: e.updated_at,
    }));
    return entriesToCSV(humanEntries);
  }, [entries]);

  const importCSV = useCallback(
    async (csvText: string): Promise<number> => {
      const importedHuman = csvToEntries(csvText);
      if (importedHuman.length === 0) return 0;

      const newVaultEntries: VaultEntry[] = importedHuman.map((h) => ({
        id: h.id,
        user_id: 'local_user',
        title: h.title,
        url: h.url || null,
        category: h.category || 'General',
        encrypted_data: '',
        favorite: h.favorite,
        created_at: h.createdAt,
        updated_at: h.updatedAt,
        decrypted: {
          username: h.username,
          password: h.password,
          notes: h.notes,
        },
      }));

      setEntries((prev) => {
        const merged = [...newVaultEntries, ...prev];
        syncToCSVStorage(merged);
        return merged;
      });

      return importedHuman.length;
    },
    [syncToCSVStorage],
  );

  return (
    <VaultContext.Provider
      value={{
        locked,
        unlocking,
        entries,
        loading,
        error,
        unlock,
        lock,
        addEntry,
        updateEntry,
        deleteEntry,
        toggleFavorite,
        exportCSV,
        importCSV,
        getRawCSV,
      }}
    >
      {children}
    </VaultContext.Provider>
  );
}

export function useVault() {
  const ctx = useContext(VaultContext);
  if (!ctx) throw new Error('useVault must be used within VaultProvider');
  return ctx;
}
