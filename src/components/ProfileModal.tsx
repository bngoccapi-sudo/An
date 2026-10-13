import React, { useState } from 'react';
import { GroupData, UserId, UserProfile } from '../types';
import { User, Mail, Phone, MapPin, Briefcase, Calendar, Sparkles, X, Save, Heart } from 'lucide-react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  group: GroupData;
  currentUserId: UserId;
  onUpdateProfile: (userId: UserId, profile: Partial<UserProfile>) => void;
}

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'
];

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  group,
  currentUserId,
  onUpdateProfile
}) => {
  const [activeTab, setActiveTab] = useState<'me' | 'partner'>('me');

  const myProfile = group.users[currentUserId];
  const partnerId: UserId = currentUserId === 'user1' ? 'user2' : 'user1';
  const partnerProfile = group.users[partnerId];

  // Form states for current user
  const [name, setName] = useState(myProfile.name || '');
  const [avatar, setAvatar] = useState(myProfile.avatar || '');
  const [birthday, setBirthday] = useState(myProfile.birthday || '');
  const [bio, setBio] = useState(myProfile.bio || '');
  const [homeAddress, setHomeAddress] = useState(myProfile.homeAddress || '');
  const [workAddress, setWorkAddress] = useState(myProfile.workAddress || '');
  const [email, setEmail] = useState(myProfile.email || '');
  const [phone, setPhone] = useState(myProfile.phone || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile(currentUserId, {
      name: name.trim(),
      avatar: avatar.trim(),
      birthday,
      bio: bio.trim(),
      homeAddress: homeAddress.trim(),
      workAddress: workAddress.trim(),
      email: email.trim(),
      phone: phone.trim()
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-2xl bg-[#192742] border border-blue-900 rounded-3xl p-6 sm:p-8 shadow-2xl text-slate-100 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-blue-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold text-lg shadow-md shadow-amber-400/20">
              👤
            </div>
            <div>
              <h2 className="font-bold text-xl font-['Quicksand'] text-white">
                Couple Profiles
              </h2>
              <span className="text-xs text-blue-200">
                Personal details and places for both of you
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

        {/* Tab switcher */}
        <div className="flex p-1 bg-blue-950/80 rounded-2xl my-4 border border-blue-900/60">
          <button
            onClick={() => setActiveTab('me')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activeTab === 'me'
                ? 'bg-amber-400 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            My Profile ({myProfile.name})
          </button>
          <button
            onClick={() => setActiveTab('partner')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activeTab === 'partner'
                ? 'bg-amber-400 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Partner Profile ({partnerProfile.name})
          </button>
        </div>

        {savedSuccess && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs text-center font-bold">
            ✓ Profile saved and synchronized successfully!
          </div>
        )}

        {activeTab === 'me' ? (
          <form onSubmit={handleSave} className="space-y-4">
            {/* Avatar Selection */}
            <div>
              <label className="block text-xs font-medium text-blue-200 mb-2">
                Profile Photo (Avatar)
              </label>
              <div className="flex items-center gap-4 flex-wrap">
                <img
                  src={avatar || myProfile.avatar}
                  alt="Preview avatar"
                  className="w-16 h-16 rounded-2xl object-cover ring-2 ring-amber-400 shadow-md"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = 'https://api.dicebear.com/7.x/bottts/svg?seed=' + currentUserId;
                  }}
                />
                <div className="flex-1 space-y-2">
                  <input
                    type="url"
                    value={avatar}
                    onChange={(e) => setAvatar(e.target.value)}
                    placeholder="Paste image link here..."
                    className="w-full px-3 py-2 rounded-xl bg-blue-950 border border-blue-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-amber-400"
                  />
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-blue-300">Or pick a preset:</span>
                    <div className="flex gap-1.5">
                      {AVATAR_PRESETS.map((p, idx) => (
                        <img
                          key={idx}
                          src={p}
                          alt="Preset"
                          onClick={() => setAvatar(p)}
                          className="w-6 h-6 rounded-lg object-cover cursor-pointer hover:ring-2 hover:ring-amber-400 transition-all"
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Name */}
              <div>
                <label className="block text-xs font-medium text-blue-200 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-blue-950 border border-blue-800 text-white text-xs focus:outline-none focus:border-amber-400"
                    required
                  />
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                </div>
              </div>

              {/* Birthday */}
              <div>
                <label className="block text-xs font-medium text-blue-200 mb-1">
                  Birthday
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={birthday}
                    onChange={(e) => setBirthday(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-blue-950 border border-blue-800 text-white text-xs focus:outline-none focus:border-amber-400 cursor-pointer"
                  />
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-medium text-blue-200 mb-1">
                  Email
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your.email@gmail.com"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-blue-950 border border-blue-800 text-white text-xs focus:outline-none focus:border-amber-400"
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-medium text-blue-200 mb-1">
                  Phone Number
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Phone number..."
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-blue-950 border border-blue-800 text-white text-xs focus:outline-none focus:border-amber-400"
                  />
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                </div>
              </div>

              {/* Home Address */}
              <div>
                <label className="block text-xs font-medium text-blue-200 mb-1">
                  Home Address
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={homeAddress}
                    onChange={(e) => setHomeAddress(e.target.value)}
                    placeholder="Street, City..."
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-blue-950 border border-blue-800 text-white text-xs focus:outline-none focus:border-amber-400"
                  />
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                </div>
              </div>

              {/* Work Address */}
              <div>
                <label className="block text-xs font-medium text-blue-200 mb-1">
                  Workplace Address
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={workAddress}
                    onChange={(e) => setWorkAddress(e.target.value)}
                    placeholder="Office, building..."
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-blue-950 border border-blue-800 text-white text-xs focus:outline-none focus:border-amber-400"
                  />
                  <Briefcase className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                </div>
              </div>
            </div>

            {/* Bio */}
            <div>
              <label className="block text-xs font-medium text-blue-200 mb-1">
                Personal Bio
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                placeholder="Hobbies, favorite food, favorite quote..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-blue-950 border border-blue-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-blue-900">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs text-slate-300 hover:bg-white/10 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-md cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Save Profile</span>
              </button>
            </div>
          </form>
        ) : (
          /* Partner Profile View */
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-blue-950/60 border border-blue-800">
              <img
                src={partnerProfile.avatar}
                alt={partnerProfile.name}
                className="w-20 h-20 rounded-2xl object-cover ring-2 ring-amber-400 shadow-md"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = 'https://api.dicebear.com/7.x/bottts/svg?seed=' + partnerId;
                }}
              />
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-lg text-white font-['Quicksand']">
                    {partnerProfile.name}
                  </h3>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-300/30">
                    {partnerProfile.pawColor === 'blue' ? 'Blue Paw' : 'Yellow Paw'} 🐾
                  </span>
                </div>
                <p className="text-xs text-blue-200 italic">
                  "{partnerProfile.bio || 'No bio updated yet'}"
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-blue-950/40 border border-blue-900/60 flex items-start gap-2.5">
                <Calendar className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-blue-300 block text-[10px] uppercase font-bold">Birthday</span>
                  <span className="font-semibold text-white">{partnerProfile.birthday || 'Not specified'}</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-blue-950/40 border border-blue-900/60 flex items-start gap-2.5">
                <Mail className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-blue-300 block text-[10px] uppercase font-bold">Email</span>
                  <span className="font-semibold text-white">{partnerProfile.email || 'Not specified'}</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-blue-950/40 border border-blue-900/60 flex items-start gap-2.5">
                <Phone className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-blue-300 block text-[10px] uppercase font-bold">Phone Number</span>
                  <span className="font-semibold text-white">{partnerProfile.phone || 'Not specified'}</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-blue-950/40 border border-blue-900/60 flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-blue-300 block text-[10px] uppercase font-bold">Home Address</span>
                  <span className="font-semibold text-white">{partnerProfile.homeAddress || 'Not specified'}</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-blue-950/40 border border-blue-900/60 flex items-start gap-2.5 sm:col-span-2">
                <Briefcase className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-blue-300 block text-[10px] uppercase font-bold">Workplace</span>
                  <span className="font-semibold text-white">{partnerProfile.workAddress || 'Not specified'}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
