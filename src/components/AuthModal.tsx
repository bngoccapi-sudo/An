import React, { useState } from 'react';
import { Lock, KeyRound, Users, Plus, ShieldCheck, Sparkles, UserCheck } from 'lucide-react';
import { GroupData, UserId } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onSuccess: (group: GroupData, chosenUserId: UserId) => void;
  defaultCode?: string;
  initialUserId?: UserId;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onSuccess,
  defaultCode = 'DUO2026',
  initialUserId = 'user1'
}) => {
  const [mode, setMode] = useState<'login' | 'create'>('login');
  const [code, setCode] = useState(defaultCode);
  const [password, setPassword] = useState('123');
  const [chosenUserId, setChosenUserId] = useState<UserId>(initialUserId);
  const [groupName, setGroupName] = useState('');
  const [creatorName, setCreatorName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !password.trim()) {
      setError('Please enter both group code and passcode');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/groups/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim(), password: password.trim() })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }
      onSuccess(data.group, chosenUserId);
    } catch (err: any) {
      setError(err.message || 'Incorrect group code or passcode');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName.trim() || !password.trim()) {
      setError('Please enter a space name and secure passcode');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/groups/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: groupName.trim(),
          password: password.trim(),
          creatorName: creatorName.trim() || 'User 1'
        })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Unable to create group space');
      }
      onSuccess(data.group, 'user1');
    } catch (err: any) {
      setError(err.message || 'Error creating space');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = (userChoice: UserId = 'user1') => {
    setCode('DUO2026');
    setPassword('123');
    setChosenUserId(userChoice);
    setMode('login');
    setTimeout(() => {
      fetch('/api/groups/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: 'DUO2026', password: '123' })
      })
        .then((r) => r.json())
        .then((d) => {
          if (d.group) onSuccess(d.group, userChoice);
        })
        .catch(() => {});
    }, 100);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-md bg-[#192742] border border-blue-900/60 rounded-3xl p-6 sm:p-8 shadow-2xl text-slate-100 overflow-hidden">
        {/* Glow decoration */}
        <div className="absolute -top-20 -right-20 w-44 h-44 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-44 h-44 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative text-center mb-6">
          <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-200 text-slate-900 flex items-center justify-center shadow-lg shadow-amber-400/20 text-3xl">
            🐾
          </div>
          <h2 className="text-2xl font-bold font-['Quicksand'] tracking-tight text-white">
            {mode === 'login' ? 'Unlock Couple Space' : 'Create New Space'}
          </h2>
          <p className="text-xs text-blue-200/80 mt-1">
            {mode === 'login'
              ? 'Enter group code and passcode to start sharing moments together'
              : 'Create a private space for two and share your group code'}
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex p-1 bg-blue-950/80 rounded-xl mb-5 border border-blue-900/50">
          <button
            type="button"
            onClick={() => { setMode('login'); setError(null); }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              mode === 'login'
                ? 'bg-amber-400 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Join Space
          </button>
          <button
            type="button"
            onClick={() => { setMode('create'); setError(null); }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              mode === 'create'
                ? 'bg-amber-400 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Create New Space
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-950/60 border border-rose-800/60 text-rose-300 text-xs text-center font-medium">
            {error}
          </div>
        )}

        {mode === 'login' ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-blue-200 mb-1.5">
                Group Code
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="e.g. DUO2026"
                  className="w-full uppercase font-mono tracking-wider pl-10 pr-4 py-2.5 rounded-xl bg-blue-950/60 border border-blue-800 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 text-sm"
                  required
                />
                <Users className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-blue-200 mb-1.5">
                Group Passcode
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter passcode..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-blue-950/60 border border-blue-800 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 text-sm"
                  required
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              </div>
            </div>

            {/* Select User Identity */}
            <div>
              <label className="block text-xs font-medium text-blue-200 mb-1.5">
                Sign in as:
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setChosenUserId('user1')}
                  className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    chosenUserId === 'user1'
                      ? 'bg-blue-600 text-white border-blue-400 shadow-md ring-2 ring-blue-400/50'
                      : 'bg-blue-950/60 text-blue-200 border-blue-800 hover:border-blue-700'
                  }`}
                >
                  <UserCheck className="w-4 h-4" />
                  <span>User 1 (Him)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setChosenUserId('user2')}
                  className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    chosenUserId === 'user2'
                      ? 'bg-amber-500 text-slate-950 border-amber-300 shadow-md ring-2 ring-amber-400/50'
                      : 'bg-blue-950/60 text-blue-200 border-blue-800 hover:border-blue-700'
                  }`}
                >
                  <UserCheck className="w-4 h-4" />
                  <span>User 2 (Her)</span>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl font-bold bg-amber-400 hover:bg-amber-300 active:scale-98 text-slate-950 transition-all shadow-md shadow-amber-400/20 text-sm flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              {loading ? (
                <span>Connecting...</span>
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  <span>Unlock & Enter Space</span>
                </>
              )}
            </button>

            {/* Quick Demo Buttons */}
            <div className="pt-2 text-center border-t border-blue-900/40 space-y-1">
              <span className="text-[11px] text-slate-400 block">Quick Demo (Code: DUO2026 / Pass: 123):</span>
              <div className="flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => handleQuickDemo('user1')}
                  className="text-xs text-blue-300 hover:text-white underline underline-offset-4 cursor-pointer"
                >
                  Sign in as User 1 🐾
                </button>
                <span className="text-slate-600">·</span>
                <button
                  type="button"
                  onClick={() => handleQuickDemo('user2')}
                  className="text-xs text-amber-300 hover:text-white underline underline-offset-4 cursor-pointer"
                >
                  Sign in as User 2 🐾
                </button>
              </div>
            </div>
          </form>
        ) : (
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-blue-200 mb-1.5">
                Couple Space Name
              </label>
              <input
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="e.g. Bear & Cat 🐾"
                className="w-full px-4 py-2.5 rounded-xl bg-blue-950/60 border border-blue-800 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-blue-200 mb-1.5">
                Your Name
              </label>
              <input
                type="text"
                value={creatorName}
                onChange={(e) => setCreatorName(e.target.value)}
                placeholder="e.g. Alex"
                className="w-full px-4 py-2.5 rounded-xl bg-blue-950/60 border border-blue-800 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-blue-200 mb-1.5">
                Security Passcode
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Set a passcode to access together..."
                className="w-full px-4 py-2.5 rounded-xl bg-blue-950/60 border border-blue-800 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 text-sm"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 transition-all shadow-md shadow-amber-400/20 text-sm flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              {loading ? (
                <span>Creating space...</span>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Create Space & Begin</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
