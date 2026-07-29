import React, { useMemo, useState, useRef } from 'react';
import {
  Shield, Search, Plus, Lock, LogOut, Star, FolderKanban,
  Loader2, Trash2, KeyRound, AlertTriangle, Download, Upload, FileText, Copy, Check, X,
} from 'lucide-react';
import { useVault, type VaultEntry } from '@/context/VaultContext';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { PasswordCard } from '@/components/PasswordCard';
import { EntryModal } from '@/components/EntryModal';

export function Dashboard() {
  const { entries, loading, lock, addEntry, updateEntry, deleteEntry, toggleFavorite, exportCSV, importCSV, getRawCSV } = useVault();
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [query, setQuery] = useState('');
  const [activeCat, setActiveCat] = useState('All');
  const [showFavs, setShowFavs] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<VaultEntry | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [showRawCSV, setShowRawCSV] = useState(false);
  const [copiedCSV, setCopiedCSV] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const categories = useMemo(() => {
    const set = new Set(entries.map((e) => e.category));
    return ['All', ...Array.from(set).sort()];
  }, [entries]);

  const filtered = useMemo(() => {
    return entries.filter((e) => {
      if (showFavs && !e.favorite) return false;
      if (activeCat !== 'All' && e.category !== activeCat) return false;
      if (query) {
        const q = query.toLowerCase();
        return (
          e.title.toLowerCase().includes(q) ||
          e.decrypted.username.toLowerCase().includes(q) ||
          e.url?.toLowerCase().includes(q) ||
          e.category.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [entries, activeCat, query, showFavs]);

  const openAdd = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (entry: VaultEntry) => {
    setEditing(entry);
    setModalOpen(true);
  };

  const handleSave = async (data: Parameters<typeof addEntry>[0], id?: string) => {
    if (id) {
      await updateEntry(id, data);
      toast('Entry updated and saved to CSV');
    } else {
      await addEntry(data);
      toast('Password saved to CSV vault');
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await deleteEntry(deleteId);
      setDeleteId(null);
      toast('Entry deleted from CSV', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const count = await importCSV(text);
      if (count > 0) {
        toast(`Successfully imported ${count} entries from CSV!`);
      } else {
        toast('No valid CSV entries found in file.', 'error');
      }
    } catch {
      toast('Failed to read CSV file.', 'error');
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const copyCSVToClipboard = () => {
    navigator.clipboard.writeText(getRawCSV());
    setCopiedCSV(true);
    toast('Human-readable CSV copied to clipboard!');
    setTimeout(() => setCopiedCSV(false), 2000);
  };

  const stats = {
    total: entries.length,
    favorites: entries.filter((e) => e.favorite).length,
    categories: new Set(entries.map((e) => e.category)).size,
  };

  return (
    <div className="min-h-screen bg-ink-950">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-white/10 glass">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 shadow-lg shadow-brand-500/20">
              <Shield className="h-5 w-5 text-white" strokeWidth={2.2} />
            </div>
            <div>
              <h1 className="text-base font-bold leading-none text-white">Priya Password Vault</h1>
              <p className="mt-0.5 text-[10px] text-brand-400 font-mono">CSV-Backed Vault Storage</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={lock}
              className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-ink-800/60 px-3 py-2 text-xs font-medium text-slate-300 transition hover:border-white/20 hover:text-white"
            >
              <Lock className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Lock Vault</span>
            </button>
            <button
              onClick={signOut}
              className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-ink-800/60 px-3 py-2 text-xs font-medium text-slate-300 transition hover:border-red-500/30 hover:text-red-400"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Sign out</span>
            </button>
            <div className="hidden h-8 w-8 items-center justify-center rounded-full bg-brand-500/20 text-xs font-semibold text-brand-300 sm:flex">
              {user?.email?.[0]?.toUpperCase() ?? 'U'}
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        {/* CSV Storage Toolbar */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-brand-500/20 bg-brand-500/10 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500/20 text-brand-300">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white">Human-Readable CSV File Storage</h2>
              <p className="text-xs text-slate-300">
                All data is stored in plain human-readable CSV format. You can export or import CSV files anytime.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowRawCSV(true)}
              className="flex items-center gap-1.5 rounded-xl border border-white/15 bg-ink-900/80 px-3.5 py-2 text-xs font-semibold text-slate-200 transition hover:bg-ink-800 hover:text-white"
            >
              <FileText className="h-3.5 w-3.5 text-brand-400" />
              View Raw CSV
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 rounded-xl border border-white/15 bg-ink-900/80 px-3.5 py-2 text-xs font-semibold text-slate-200 transition hover:bg-ink-800 hover:text-white"
            >
              <Upload className="h-3.5 w-3.5 text-cyan-400" />
              Import CSV
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              onClick={exportCSV}
              className="flex items-center gap-1.5 rounded-xl border border-brand-500/30 bg-brand-500/20 px-3.5 py-2 text-xs font-semibold text-brand-300 transition hover:bg-brand-500/30 hover:text-white"
            >
              <Download className="h-3.5 w-3.5" />
              Export CSV File
            </button>
          </div>
        </div>

        {/* Hero / Stats */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard icon={KeyRound} label="Total Passwords" value={stats.total} accent="brand" />
          <StatCard icon={Star} label="Favorites" value={stats.favorites} accent="amber" />
          <StatCard icon={FolderKanban} label="Categories" value={stats.categories} accent="cyan" />
        </div>

        {/* Search + Add */}
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by title, username, or URL…"
              className="w-full rounded-xl border border-white/10 bg-ink-900/60 py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 outline-none transition focus:border-brand-500/50 focus:ring-2 focus:ring-brand-500/20"
            />
          </div>
          <button
            onClick={openAdd}
            className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-500/25 transition hover:brightness-110 active:scale-[0.98]"
          >
            <Plus className="h-4 w-4" />
            Add Password
          </button>
        </div>

        {/* Category filters */}
        <div className="mb-5 flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowFavs((v) => !v)}
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
              showFavs
                ? 'border-amber-500/40 bg-amber-500/15 text-amber-300'
                : 'border-white/10 bg-ink-900/40 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Star className={`h-3.5 w-3.5 ${showFavs ? 'fill-amber-400 text-amber-400' : ''}`} />
            Favorites
          </button>
          <div className="h-4 w-px bg-white/10" />
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCat(cat)}
              className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
                activeCat === cat && !showFavs
                  ? 'border-brand-500/40 bg-brand-500/15 text-brand-300'
                  : 'border-white/10 bg-ink-900/40 text-slate-400 hover:text-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-slate-500">
            <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
            <p className="mt-3 text-sm">Loading CSV vault entries…</p>
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState hasEntries={entries.length > 0} onAdd={openAdd} />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((entry) => (
              <PasswordCard
                key={entry.id}
                entry={entry}
                onEdit={openEdit}
                onDelete={setDeleteId}
                onToggleFavorite={toggleFavorite}
              />
            ))}
          </div>
        )}
      </main>

      {/* Raw CSV Modal */}
      {showRawCSV && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fade-in" onClick={() => setShowRawCSV(false)} />
          <div className="relative z-10 w-full max-w-2xl animate-scale-in rounded-2xl border border-white/10 bg-ink-900 p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <FileText className="h-5 w-5 text-brand-400" />
                <h3 className="font-semibold text-white">Human-Readable CSV File Content</h3>
              </div>
              <button
                onClick={() => setShowRawCSV(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-white/10 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="mb-3 text-xs text-slate-400">
              Below is the exact human-readable CSV formatted string stored in your local storage:
            </p>
            <textarea
              readOnly
              rows={12}
              value={getRawCSV()}
              className="w-full rounded-xl border border-white/10 bg-black/50 p-3.5 font-mono text-xs text-emerald-400 outline-none"
            />
            <div className="mt-4 flex justify-between gap-3">
              <button
                onClick={copyCSVToClipboard}
                className="flex items-center gap-2 rounded-xl border border-brand-500/30 bg-brand-500/20 px-4 py-2.5 text-xs font-semibold text-brand-300 transition hover:bg-brand-500/30"
              >
                {copiedCSV ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copiedCSV ? 'Copied CSV!' : 'Copy Raw CSV'}
              </button>
              <button
                onClick={exportCSV}
                className="flex items-center gap-2 rounded-xl bg-brand-500 px-5 py-2.5 text-xs font-semibold text-white shadow-lg transition hover:bg-brand-600"
              >
                <Download className="h-4 w-4" />
                Download .CSV File
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      <EntryModal
        open={modalOpen}
        editing={editing}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
      />

      {/* Delete confirmation */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => setDeleteId(null)} />
          <div className="relative z-10 w-full max-w-sm animate-scale-in rounded-2xl border border-white/10 bg-ink-900 p-6 shadow-2xl">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-500/15">
                <AlertTriangle className="h-5 w-5 text-red-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Delete entry?</h3>
                <p className="text-xs text-slate-400">This will be removed from your CSV file.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                disabled={deleting}
                className="flex-1 rounded-xl border border-white/10 bg-ink-800/60 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-ink-800"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-500/90 py-2.5 text-sm font-semibold text-white transition hover:bg-red-500 active:scale-[0.98] disabled:opacity-60"
              >
                {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  accent: 'brand' | 'amber' | 'cyan';
}) {
  const colors = {
    brand: 'from-brand-500/20 to-brand-600/5 text-brand-300 border-brand-500/20',
    amber: 'from-amber-500/20 to-amber-600/5 text-amber-300 border-amber-500/20',
    cyan: 'from-cyan-500/20 to-cyan-600/5 text-cyan-300 border-cyan-500/20',
  };
  return (
    <div className={`flex items-center gap-3 rounded-2xl border bg-gradient-to-br p-4 ${colors[accent]}`}>
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/5">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-2xl font-bold text-white">{value}</p>
        <p className="text-xs text-slate-400">{label}</p>
      </div>
    </div>
  );
}

function EmptyState({ hasEntries, onAdd }: { hasEntries: boolean; onAdd: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-ink-800/60 border border-white/10">
        <KeyRound className="h-7 w-7 text-slate-500" />
      </div>
      <h3 className="text-lg font-semibold text-white">
        {hasEntries ? 'No matching entries' : 'Your vault is empty'}
      </h3>
      <p className="mt-1 max-w-xs text-sm text-slate-500">
        {hasEntries
          ? 'Try adjusting your search or filters to find what you need.'
          : 'Add your first password or import a CSV file.'}
      </p>
      {!hasEntries && (
        <button
          onClick={onAdd}
          className="mt-5 flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-500/25 transition hover:brightness-110"
        >
          <Plus className="h-4 w-4" />
          Add Your First Password
        </button>
      )}
    </div>
  );
}
