import React, { useState, useEffect } from 'react';
import { GroupData, UserId, CalendarAction, CalendarNote, ScheduleItem } from './types';
import { useDuoSocket } from './hooks/useDuoSocket';
import { HeaderNav } from './components/HeaderNav';
import { AuthModal } from './components/AuthModal';
import { ChatScreen } from './components/ChatScreen';
import { CalendarScreen } from './components/CalendarScreen';
import { AddStampPopup } from './components/AddStampPopup';
import { DayDetailModal } from './components/DayDetailModal';
import { ScheduleScreen } from './components/ScheduleScreen';
import { ProfileModal } from './components/ProfileModal';
import { GroupSettingsModal } from './components/GroupSettingsModal';

export default function App() {
  // Stored session
  const [groupCode, setGroupCode] = useState<string | null>(() => {
    return localStorage.getItem('duo_group_code') || 'DUO2026';
  });

  const [isAuthUnlocked, setIsAuthUnlocked] = useState<boolean>(() => {
    return localStorage.getItem('duo_unlocked') === 'true';
  });

  const [currentUserId, setCurrentUserId] = useState<UserId>(() => {
    return (localStorage.getItem('duo_active_user') as UserId) || 'user1';
  });

  // Current active tab: 'chat' | 'calendar' | 'schedule'
  const [currentTab, setCurrentTab] = useState<'chat' | 'calendar' | 'schedule'>('calendar');

  // Selected date for Add or Detail within Calendar
  const [selectedDateForAdd, setSelectedDateForAdd] = useState<string | null>(null);
  const [selectedDateForDetail, setSelectedDateForDetail] = useState<string | null>(null);

  // Modals
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isGroupSettingsOpen, setIsGroupSettingsOpen] = useState(false);

  // Save current active user in localStorage
  useEffect(() => {
    localStorage.setItem('duo_active_user', currentUserId);
  }, [currentUserId]);

  // Hook for real-time WebSocket sync and group data
  const {
    group,
    setGroup,
    isConnected,
    partnerOnline,
    loading,
    error,
    sendMessage,
    markMessagesAsRead,
    clearAllMessages,
    saveCalendarDay,
    updateProfile,
    updateGroup,
    addSchedule,
    updateSchedule,
    deleteSchedule,
    uploadIcon,
    deleteIcon,
    markNotificationsAsRead,
    clearNotifications
  } = useDuoSocket({
    groupCode: isAuthUnlocked ? groupCode : null,
    currentUserId
  });

  // Handlers for Auth
  const handleAuthSuccess = (authedGroup: GroupData, chosenUser: UserId) => {
    setGroupCode(authedGroup.code);
    setIsAuthUnlocked(true);
    setGroup(authedGroup);
    setCurrentUserId(chosenUser);
    localStorage.setItem('duo_group_code', authedGroup.code);
    localStorage.setItem('duo_unlocked', 'true');
    localStorage.setItem('duo_active_user', chosenUser);
  };

  const handleLockGroup = () => {
    setIsAuthUnlocked(false);
    localStorage.removeItem('duo_unlocked');
    setIsGroupSettingsOpen(false);
  };

  // Open Add action within calendar for a specific date
  const handleOpenAddForDate = (date: string) => {
    setSelectedDateForAdd(date);
    setCurrentTab('calendar');
  };

  // Switch to Day Detail Modal
  const handleSelectDateForDetail = (date: string) => {
    setSelectedDateForDetail(date);
  };

  return (
    <div
      className={`min-h-screen ${
        currentTab === 'chat' ? 'h-screen max-h-screen overflow-hidden' : ''
      } bg-[#14233c] text-slate-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif] selection:bg-amber-300 selection:text-slate-950`}
    >
      {/* Top Header Navigation */}
      <HeaderNav
        currentTab={currentTab}
        setCurrentTab={(tab) => {
          setSelectedDateForAdd(null);
          setCurrentTab(tab);
        }}
        group={group}
        currentUserId={currentUserId}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenGroupSettings={() => setIsGroupSettingsOpen(true)}
        partnerOnline={partnerOnline}
        onMarkNotificationsAsRead={markNotificationsAsRead}
        onClearNotifications={clearNotifications}
        onSelectDate={handleSelectDateForDetail}
      />

      {/* Main Body View */}
      <main
        className={`flex-1 flex flex-col min-h-0 ${
          currentTab === 'chat' ? 'h-[calc(100vh-4rem)] max-h-[calc(100vh-4rem)] overflow-hidden' : ''
        }`}
      >
        {!isAuthUnlocked || !group ? (
          <div className="flex-1 flex items-center justify-center p-6 text-center">
            <div className="max-w-md p-8 rounded-3xl bg-[#192742] border border-blue-900/60 shadow-xl space-y-4">
              <span className="text-5xl block animate-bounce">🐾</span>
              <h2 className="text-2xl font-bold font-['Quicksand'] text-white">
                DuoSpace - Couple Space
              </h2>
              <p className="text-xs text-blue-200">
                Please unlock with group password to start chatting and collecting stamps together.
              </p>
              <button
                onClick={() => setIsAuthUnlocked(false)}
                className="px-6 py-3 rounded-2xl bg-amber-400 text-slate-950 font-bold text-sm shadow-md shadow-amber-400/20 cursor-pointer"
              >
                Enter Group Password
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Tab 1: Chat Screen matching Image 1 */}
            {currentTab === 'chat' && (
              <ChatScreen
                group={group}
                currentUserId={currentUserId}
                onSendMessage={sendMessage}
                onMarkRead={markMessagesAsRead}
                onClearAllMessages={clearAllMessages}
                partnerOnline={partnerOnline}
              />
            )}

            {/* Tab 2: Calendar Screen matching Image 2, with Add stamp popup */}
            {currentTab === 'calendar' && (
              <>
                <CalendarScreen
                  group={group}
                  currentUserId={currentUserId}
                  onSelectDate={handleSelectDateForDetail}
                  onOpenAdd={handleOpenAddForDate}
                />

                {/* Add Stamp Popup matching user's layout */}
                {selectedDateForAdd && (
                  <AddStampPopup
                    isOpen={Boolean(selectedDateForAdd)}
                    initialDate={selectedDateForAdd}
                    group={group}
                    currentUserId={currentUserId}
                    onClose={() => setSelectedDateForAdd(null)}
                    onSaveDay={(date, actions, notes) => {
                      saveCalendarDay(date, actions, notes);
                      setSelectedDateForAdd(null);
                    }}
                    onUploadIcon={uploadIcon}
                    onDeleteIcon={deleteIcon}
                  />
                )}
              </>
            )}

            {/* Tab 3: Schedule Screen */}
            {currentTab === 'schedule' && (
              <ScheduleScreen
                group={group}
                currentUserId={currentUserId}
                onAddSchedule={addSchedule}
                onUpdateSchedule={updateSchedule}
                onDeleteSchedule={deleteSchedule}
              />
            )}
          </>
        )}
      </main>

      {/* Auth Password Modal (Locks when accessing if not unlocked) */}
      <AuthModal
        isOpen={!isAuthUnlocked}
        onSuccess={handleAuthSuccess}
        defaultCode={groupCode || 'DUO2026'}
        initialUserId={currentUserId}
      />

      {/* Day Detail Modal */}
      {selectedDateForDetail && group && (
        <DayDetailModal
          date={selectedDateForDetail}
          group={group}
          currentUserId={currentUserId}
          onClose={() => setSelectedDateForDetail(null)}
          onOpenAdd={(date) => {
            setSelectedDateForDetail(null);
            handleOpenAddForDate(date);
          }}
          onClearDay={(date) => {
            saveCalendarDay(date, [], []);
          }}
        />
      )}

      {/* User Profile Modal */}
      {group && (
        <ProfileModal
          isOpen={isProfileOpen}
          onClose={() => setIsProfileOpen(false)}
          group={group}
          currentUserId={currentUserId}
          onUpdateProfile={updateProfile}
        />
      )}

      {/* Group Settings Modal */}
      {group && (
        <GroupSettingsModal
          isOpen={isGroupSettingsOpen}
          onClose={() => setIsGroupSettingsOpen(false)}
          group={group}
          onUpdateGroup={updateGroup}
          onLockGroup={handleLockGroup}
        />
      )}
    </div>
  );
}
