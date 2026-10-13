import React, { useState } from 'react';
import { GroupData } from '../types';
import { Settings, Lock, Users, Copy, Check, Save, LogOut, X, Sparkles } from 'lucide-react';

interface GroupSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  group: GroupData;
  onUpdateGroup: (data: { name?: string; password?: string; avatar?: string }) => void;
  onLockGroup: () => void;
}

export const GroupSettingsModal: React.FC<GroupSettingsModalProps> = ({
  isOpen,
  onClose,
  group,
  onUpdateGroup,
  onLockGroup
}) => {
  const [name, setName] = useState(group.name);
  const [password, setPassword] = useState(group.password);
  const [avatar, setAvatar] = useState(group.avatar);
  const [copied, setCopied] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(group.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateGroup({
      name: name.trim(),
      password: password.trim(),
      avatar: avatar.trim()
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-lg bg-[#192742] border border-blue-900 rounded-3xl p-6 sm:p-7 shadow-2xl text-slate-100 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-blue-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold text-lg shadow-md shadow-amber-400/20">
              ⚙️
            </div>
            <div>
              <h2 className="font-bold text-xl font-['Quicksand'] text-white">
                Group Settings
              </h2>
              <span className="text-xs text-blue-200">
                Manage group code, passcode and couple name
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-xl text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Group Code Card with Copy */}
        <div className="p-4 rounded-2xl bg-blue-950/70 border border-blue-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-blue-300 uppercase block">
              Shareable Group Code
            </span>
            <span className="font-mono text-xl font-extrabold text-amber-300 tracking-wider">
              {group.code}
            </span>
          </div>
          <button
            onClick={handleCopyCode}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-xs font-semibold text-white transition-all shadow-xs cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Code</span>
              </>
            )}
          </button>
        </div>

        {savedSuccess && (
          <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs text-center font-bold">
            ✓ Group settings updated! Both of you will see changes immediately.
          </div>
        )}

        {/* Form settings */}
        <form onSubmit={handleSave} className="space-y-3.5">
          <div>
            <label className="block text-xs font-medium text-blue-200 mb-1">
              Couple Space Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-blue-950 border border-blue-800 text-white text-xs focus:outline-none focus:border-amber-400"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-blue-200 mb-1">
              Group Passcode (Required to unlock space)
            </label>
            <div className="relative">
              <input
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Set passcode..."
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-blue-950 border border-blue-800 text-white font-mono text-xs focus:outline-none focus:border-amber-400"
                required
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </div>
            <span className="text-[11px] text-blue-300/80 mt-1 block">
              Passcode protects your private couple space from prying eyes.
            </span>
          </div>

          <div>
            <label className="block text-xs font-medium text-blue-200 mb-1">
              Group Avatar (URL)
            </label>
            <input
              type="url"
              value={avatar}
              onChange={(e) => setAvatar(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-blue-950 border border-blue-800 text-white text-xs focus:outline-none focus:border-amber-400"
            />
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-blue-900">
            {/* Lock group button */}
            <button
              type="button"
              onClick={onLockGroup}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs text-rose-300 hover:bg-rose-950/40 border border-rose-800/40 cursor-pointer"
              title="Lock screen to require passcode"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Lock Space</span>
            </button>

            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-md cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save Settings</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
