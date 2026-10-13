import React, { useState, useRef, useEffect } from 'react';
import { GroupData, UserId, AppNotification } from '../types';
import {
  MessageSquare,
  Calendar,
  Clock,
  Settings,
  User,
  Copy,
  Check,
  Bell,
  Sparkles,
  CalendarDays,
  FileEdit,
  Trash2,
  CheckCheck,
  X
} from 'lucide-react';

interface HeaderNavProps {
  currentTab: 'chat' | 'calendar' | 'schedule';
  setCurrentTab: (tab: 'chat' | 'calendar' | 'schedule') => void;
  group: GroupData | null;
  currentUserId: UserId;
  onOpenProfile: () => void;
  onOpenGroupSettings: () => void;
  partnerOnline: boolean;
  onMarkNotificationsAsRead?: () => void;
  onClearNotifications?: () => void;
  onSelectDate?: (date: string) => void;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
  currentTab,
  setCurrentTab,
  group,
  currentUserId,
  onOpenProfile,
  onOpenGroupSettings,
  partnerOnline,
  onMarkNotificationsAsRead,
  onClearNotifications,
  onSelectDate
}) => {
  const [copied, setCopied] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifDropdownRef = useRef<HTMLDivElement | null>(null);

  const currentUser = group?.users[currentUserId];
  const partnerId: UserId = currentUserId === 'user1' ? 'user2' : 'user1';
  const partnerUser = group?.users[partnerId];

  // Unread messages from partner (excluding own messages)
  const unreadChatCount =
    group?.messages?.filter(
      (m) => m.senderId !== currentUserId && m.status !== 'read'
    ).length || 0;

  // Partner activity notifications
  const allNotifications: AppNotification[] = group?.notifications || [];
  const partnerNotifications = allNotifications.filter(
    (n) => n.senderId !== currentUserId
  );
  const unreadNotifsCount = partnerNotifications.filter((n) => !n.read).length;

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        notifDropdownRef.current &&
        !notifDropdownRef.current.contains(event.target as Node)
      ) {
        setIsNotifOpen(false);
      }
    }
    if (isNotifOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isNotifOpen]);

  const handleCopyCode = () => {
    if (group?.code) {
      navigator.clipboard.writeText(group.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatTimestamp = (ts: number) => {
    const diff = Date.now() - ts;
    const mins = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    const d = new Date(ts);
    return `${d.getMonth() + 1}/${d.getDate()}`;
  };

  const getNotifIcon = (type: string) => {
    switch (type) {
      case 'schedule_add':
        return <Clock className="w-4 h-4 text-emerald-400" />;
      case 'schedule_update':
        return <FileEdit className="w-4 h-4 text-blue-400" />;
      case 'schedule_delete':
        return <Trash2 className="w-4 h-4 text-rose-400" />;
      case 'calendar_save':
        return <CalendarDays className="w-4 h-4 text-amber-400" />;
      case 'calendar_clear':
        return <Trash2 className="w-4 h-4 text-rose-400" />;
      case 'icon_upload':
        return <Sparkles className="w-4 h-4 text-purple-400" />;
      default:
        return <Bell className="w-4 h-4 text-amber-400" />;
    }
  };

  // Nav menu items: Chat - Calendar - Weekly Schedule
  const navItems = [
    { id: 'chat' as const, label: 'Chat', icon: MessageSquare },
    { id: 'calendar' as const, label: 'Calendar', icon: Calendar },
    { id: 'schedule' as const, label: 'Weekly Schedule', icon: Clock }
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#162238]/95 backdrop-blur-md border-b border-blue-900/40 text-slate-100 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Brand & Group identity */}
        <div className="flex items-center gap-3 shrink-0">
          <div
            className="flex items-center gap-2 cursor-pointer group"
            onClick={() => setCurrentTab('calendar')}
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-400 to-amber-200 flex items-center justify-center shadow-md shadow-amber-400/20 text-slate-900 font-bold transition-transform group-hover:scale-105">
              🐾
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-base tracking-tight text-white font-['Quicksand']">
                DuoSpace
              </span>
              <span className="text-[11px] text-blue-200/70 truncate max-w-[140px]">
                {group?.name || 'Couple Space'}
              </span>
            </div>
          </div>

          {/* Group code pill with 1-click copy */}
          {group && (
            <button
              onClick={handleCopyCode}
              title="Click to copy group code and share with your partner"
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono rounded-lg bg-blue-950/60 border border-blue-800/60 text-blue-200 hover:bg-blue-900/60 hover:text-white transition-colors cursor-pointer"
            >
              <span>Code: {group.code}</span>
              {copied ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Copy className="w-3.5 h-3.5 text-blue-300/80" />
              )}
            </button>
          )}
        </div>

        {/* Zone 2: Navigation Links (Chat - Calendar - Weekly Schedule) */}
        <nav className="flex items-center gap-1 sm:gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            const isChatWithUnread = item.id === 'chat' && unreadChatCount > 0;

            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`relative flex items-center gap-2 px-3 py-2 text-xs sm:text-sm font-medium rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-amber-400 text-slate-950 font-semibold shadow-sm shadow-amber-400/30'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <div className="relative flex items-center">
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? 'text-slate-950' : 'text-slate-400'
                    }`}
                  />
                  {/* Unread dot beside Chat icon */}
                  {isChatWithUnread && (
                    <span
                      className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse ring-2 ring-rose-400/60"
                      title={`${unreadChatCount} unread message(s)`}
                    />
                  )}
                </div>
                <span className="hidden sm:inline">{item.label}</span>

                {/* Additional unread badge for Chat on larger screens */}
                {isChatWithUnread && (
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-black bg-rose-500 text-white shadow-xs">
                    {unreadChatCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Notifications, Profile & Settings */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Notification Bell Icon */}
          <div className="relative" ref={notifDropdownRef}>
            <button
              onClick={() => {
                setIsNotifOpen((prev) => !prev);
                if (!isNotifOpen && unreadNotifsCount > 0 && onMarkNotificationsAsRead) {
                  onMarkNotificationsAsRead();
                }
              }}
              title="Partner Activity Notifications"
              className={`relative p-2 rounded-xl transition-all cursor-pointer border ${
                isNotifOpen
                  ? 'bg-amber-400/20 text-amber-300 border-amber-400/50'
                  : 'text-slate-300 hover:text-white hover:bg-white/5 border-transparent hover:border-blue-800/50'
              }`}
            >
              <Bell className="w-4 h-4" />
              {unreadNotifsCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center animate-bounce shadow-md ring-2 ring-[#162238]">
                  {unreadNotifsCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown Panel */}
            {isNotifOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-[#101b33] border border-blue-900/80 rounded-2xl shadow-2xl p-3 text-slate-100 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between pb-2 border-b border-blue-900/50 px-1">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-amber-400" />
                    <span className="font-bold text-xs sm:text-sm font-['Quicksand'] text-white">
                      Partner Activity
                    </span>
                    {unreadNotifsCount > 0 && (
                      <span className="text-[10px] bg-rose-500/20 text-rose-300 px-1.5 py-0.5 rounded-full font-bold border border-rose-500/30">
                        {unreadNotifsCount} new
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-[11px]">
                    {unreadNotifsCount > 0 && onMarkNotificationsAsRead && (
                      <button
                        onClick={onMarkNotificationsAsRead}
                        className="text-blue-300 hover:text-white flex items-center gap-1 cursor-pointer font-medium"
                        title="Mark all as read"
                      >
                        <CheckCheck className="w-3.5 h-3.5" />
                        <span>Read all</span>
                      </button>
                    )}
                    {partnerNotifications.length > 0 && onClearNotifications && (
                      <button
                        onClick={onClearNotifications}
                        className="text-slate-400 hover:text-rose-400 cursor-pointer p-1"
                        title="Clear notification list"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      onClick={() => setIsNotifOpen(false)}
                      className="p-1 text-slate-400 hover:text-white cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Notifications List */}
                <div className="mt-2 max-h-80 overflow-y-auto space-y-1.5 pr-0.5">
                  {partnerNotifications.length === 0 ? (
                    <div className="py-8 px-4 text-center text-slate-400 text-xs">
                      <span className="text-3xl block mb-2">🐾</span>
                      <p className="font-semibold text-slate-300">
                        No activity yet
                      </p>
                      <p className="text-[11px] text-blue-200/60 mt-1">
                        When {partnerUser?.name || 'your partner'} adds or modifies schedules and calendar stamps, you'll see them here!
                      </p>
                    </div>
                  ) : (
                    partnerNotifications.map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => {
                          if (notif.dateKey && onSelectDate) {
                            onSelectDate(notif.dateKey);
                            setCurrentTab('calendar');
                          } else if (notif.type.startsWith('schedule')) {
                            setCurrentTab('schedule');
                          }
                          setIsNotifOpen(false);
                        }}
                        className={`p-2.5 rounded-xl border text-xs flex items-start gap-2.5 transition-colors cursor-pointer ${
                          !notif.read
                            ? 'bg-blue-950/80 border-blue-700/60 text-white'
                            : 'bg-white/5 border-white/5 text-slate-300 hover:bg-white/10'
                        }`}
                      >
                        <div className="p-1.5 rounded-lg bg-blue-900/50 border border-blue-800 shrink-0 mt-0.5">
                          {getNotifIcon(notif.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-bold text-white truncate text-[11px] sm:text-xs">
                              {notif.title}
                            </span>
                            <span className="text-[10px] text-slate-400 shrink-0 font-mono">
                              {formatTimestamp(notif.timestamp)}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-300 line-clamp-2 mt-0.5">
                            {notif.message}
                          </p>
                        </div>
                        {!notif.read && (
                          <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0 mt-1.5 ring-2 ring-amber-400/40" />
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Profile Button */}
          <button
            onClick={onOpenProfile}
            title="Couple Profiles"
            className="p-2 text-slate-300 hover:text-white rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-blue-800/50 cursor-pointer"
          >
            <User className="w-4 h-4" />
          </button>

          {/* Group Settings Button */}
          <button
            onClick={onOpenGroupSettings}
            title="Group Settings & Password"
            className="p-2 text-slate-300 hover:text-white rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-blue-800/50 cursor-pointer"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
