import React, { useState } from 'react';
import { GroupData, UserId, ScheduleItem, ScheduleCategory } from '../types';
import { Plus, Clock, CheckCircle2, Circle, Trash2, Edit3, Lock, Eye, Calendar, Sparkles, X } from 'lucide-react';

interface ScheduleScreenProps {
  group: GroupData;
  currentUserId: UserId;
  onAddSchedule: (schedule: ScheduleItem) => void;
  onUpdateSchedule: (id: string, updates: Partial<ScheduleItem>) => void;
  onDeleteSchedule: (id: string) => void;
}

export const ScheduleScreen: React.FC<ScheduleScreenProps> = ({
  group,
  currentUserId,
  onAddSchedule,
  onUpdateSchedule,
  onDeleteSchedule
}) => {
  // Tab to view user's schedule: defaults to current active user
  const [viewingUserId, setViewingUserId] = useState<UserId>(currentUserId);

  // Modal to add schedule item
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedDayOfWeek, setSelectedDayOfWeek] = useState<number>(1); // 1 = Monday
  const [timeInput, setTimeInput] = useState('08:30');
  const [titleInput, setTitleInput] = useState('');
  const [categoryInput, setCategoryInput] = useState<ScheduleCategory>('work');
  const [noteInput, setNoteInput] = useState('');

  const currentUser = group.users[currentUserId];
  const partnerId: UserId = currentUserId === 'user1' ? 'user2' : 'user1';
  const partnerUser = group.users[partnerId];

  // Check if viewing user can edit: ONLY if viewingUserId === currentUserId!
  const isOwner = viewingUserId === currentUserId;

  const daysOfWeek = [
    { num: 1, label: 'Monday' },
    { num: 2, label: 'Tuesday' },
    { num: 3, label: 'Wednesday' },
    { num: 4, label: 'Thursday' },
    { num: 5, label: 'Friday' },
    { num: 6, label: 'Saturday' },
    { num: 0, label: 'Sunday' }
  ];

  const categoryLabels: Record<ScheduleCategory, { label: string; icon: string; bg: string }> = {
    work: { label: 'Work / Study', icon: '💼', bg: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
    date: { label: 'Couple Date', icon: '💖', bg: 'bg-rose-500/20 text-rose-300 border-rose-500/30' },
    exercise: { label: 'Sports & Health', icon: '🏃', bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
    meal: { label: 'Dining & Food', icon: '🍱', bg: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
    rest: { label: 'Rest & Chill', icon: '🌙', bg: 'bg-purple-500/20 text-purple-300 border-purple-500/30' },
    other: { label: 'Other', icon: '✨', bg: 'bg-slate-500/20 text-slate-300 border-slate-500/30' }
  };

  const handleOpenAddForDay = (dayNum: number) => {
    if (!isOwner) return;
    setSelectedDayOfWeek(dayNum);
    setTitleInput('');
    setNoteInput('');
    setIsAddModalOpen(true);
  };

  const handleSaveNewSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titleInput.trim()) return;

    const newItem: ScheduleItem = {
      id: 'sch-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      userId: currentUserId, // Always set to current user!
      dayOfWeek: selectedDayOfWeek,
      time: timeInput,
      title: titleInput.trim(),
      category: categoryInput,
      note: noteInput.trim() || undefined,
      completed: false
    };

    onAddSchedule(newItem);
    setIsAddModalOpen(false);
    setTitleInput('');
    setNoteInput('');
  };

  // Filter schedules for viewed user
  const userSchedules = group.schedules.filter((s) => s.userId === viewingUserId);

  return (
    <div className="relative w-full min-h-[calc(100vh-4rem)] bg-[#172744] p-3 sm:p-6 text-slate-100 flex flex-col items-center">
      {/* Background illustrated art subtle backdrop */}
      <div className="absolute inset-0 z-0">
        <img
          src="/src/assets/images/desk_calendar_scene_1791796106638.jpg"
          alt="Schedule background"
          className="w-full h-full object-cover opacity-35 filter brightness-75"
          onError={(e) => {
            (e.currentTarget as HTMLElement).style.display = 'none';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#132039]/90 via-[#132039]/95 to-[#0e172a] pointer-events-none" />
      </div>

      <div className="relative z-10 w-full max-w-6xl space-y-5">
        {/* Header with Switcher tabs */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-slate-950/60 backdrop-blur-md p-4 sm:p-6 rounded-3xl border border-white/10 shadow-xl">
          <div>
            <div className="flex items-center gap-2 text-amber-300 font-extrabold text-2xl font-['Quicksand']">
              <Clock className="w-6 h-6 text-amber-400" />
              <span>Weekly Schedule</span>
            </div>
            <p className="text-xs text-blue-200 mt-1">
              Organized by days and hours. You can manage your own schedule and view your partner's calendar.
            </p>
          </div>

          {/* User selector tab */}
          <div className="flex items-center p-1.5 bg-blue-950/90 rounded-2xl border border-blue-800/80">
            <button
              onClick={() => setViewingUserId(currentUserId)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                viewingUserId === currentUserId
                  ? 'bg-amber-400 text-slate-950 shadow-md'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <span>Me</span>
            </button>

            <button
              onClick={() => setViewingUserId(partnerId)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                viewingUserId === partnerId
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <span>Partner</span>
            </button>
          </div>
        </div>

        {/* View mode banner */}
        {!isOwner ? (
          <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-amber-950/40 border border-amber-600/40 text-amber-200 text-xs">
            <Eye className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <span className="font-bold">Viewing {partnerUser.name}'s schedule: </span>
              <span>Read-only mode. You cannot edit partner items. Live updates sync automatically.</span>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-blue-950/50 border border-blue-700/50 text-blue-200 text-xs">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>This is your schedule. You can add, edit and complete items.</span>
            </div>
            <button
              onClick={() => handleOpenAddForDay(1)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs transition-all shadow-md cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add New</span>
            </button>
          </div>
        )}

        {/* Weekly Day Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-3.5">
          {daysOfWeek.map((day) => {
            const dayItems = userSchedules
              .filter((s) => s.dayOfWeek === day.num)
              .sort((a, b) => a.time.localeCompare(b.time));

            return (
              <div
                key={day.num}
                className="flex flex-col bg-slate-950/50 backdrop-blur-md rounded-2xl border border-white/10 p-3 min-h-[360px] shadow-lg"
              >
                {/* Column header */}
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10">
                  <span className="text-xs font-bold text-amber-300 font-['Quicksand']">
                    {day.label}
                  </span>
                  {isOwner && (
                    <button
                      onClick={() => handleOpenAddForDay(day.num)}
                      title={`Add plan to ${day.label}`}
                      className="p-1 hover:bg-white/10 rounded-lg text-amber-300 hover:text-white transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Day schedule items */}
                <div className="flex-1 space-y-2 overflow-y-auto">
                  {dayItems.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-3 text-slate-500 text-[11px]">
                      <span>No plans</span>
                    </div>
                  ) : (
                    dayItems.map((item) => {
                      const catInfo = categoryLabels[item.category] || categoryLabels.other;
                      return (
                        <div
                          key={item.id}
                          className={`p-2.5 rounded-xl border text-xs transition-all ${
                            item.completed
                              ? 'bg-slate-900/40 border-slate-800 text-slate-400 line-through'
                              : 'bg-blue-950/60 border-blue-800/80 text-white shadow-xs'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-mono text-[10px] text-amber-300 font-bold flex items-center gap-1">
                              <Clock className="w-2.5 h-2.5" />
                              {item.time}
                            </span>
                            <span className="text-[10px]">{catInfo.icon}</span>
                          </div>

                          <div className="font-semibold text-xs leading-snug mb-1">
                            {item.title}
                          </div>

                          {item.note && (
                            <p className="text-[11px] text-slate-300/80 mb-2 leading-tight">
                              {item.note}
                            </p>
                          )}

                          {/* Owner actions: toggle done & delete */}
                          {isOwner && (
                            <div className="flex items-center justify-between pt-1 border-t border-white/5">
                              <button
                                onClick={() =>
                                  onUpdateSchedule(item.id, { completed: !item.completed })
                                }
                                className="flex items-center gap-1 text-[10px] text-blue-300 hover:text-emerald-400 cursor-pointer"
                              >
                                {item.completed ? (
                                  <>
                                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                    <span>Done</span>
                                  </>
                                ) : (
                                  <>
                                    <Circle className="w-3 h-3" />
                                    <span>Pending</span>
                                  </>
                                )}
                              </button>

                              <button
                                onClick={() => onDeleteSchedule(item.id)}
                                title="Delete this plan"
                                className="p-1 hover:text-rose-400 text-slate-500 cursor-pointer"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Schedule Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="relative w-full max-w-md bg-[#192742] border border-blue-900 rounded-3xl p-6 shadow-2xl text-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-blue-800">
              <h3 className="font-bold text-lg font-['Quicksand'] text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-400" />
                <span>Add New Schedule Plan</span>
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveNewSchedule} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-blue-200 mb-1">
                    Day of Week
                  </label>
                  <select
                    value={selectedDayOfWeek}
                    onChange={(e) => setSelectedDayOfWeek(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-blue-950 border border-blue-800 text-white text-xs focus:outline-none focus:border-amber-400"
                  >
                    {daysOfWeek.map((d) => (
                      <option key={d.num} value={d.num}>
                        {d.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-blue-200 mb-1">
                    Time
                  </label>
                  <input
                    type="time"
                    value={timeInput}
                    onChange={(e) => setTimeInput(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-blue-950 border border-blue-800 text-white text-xs focus:outline-none focus:border-amber-400 font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-blue-200 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={titleInput}
                  onChange={(e) => setTitleInput(e.target.value)}
                  placeholder="e.g. Yoga class, Team sync, Movie date..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-blue-950 border border-blue-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-amber-400"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-blue-200 mb-1">
                  Category
                </label>
                <select
                  value={categoryInput}
                  onChange={(e) => setCategoryInput(e.target.value as ScheduleCategory)}
                  className="w-full px-3 py-2 rounded-xl bg-blue-950 border border-blue-800 text-white text-xs focus:outline-none focus:border-amber-400"
                >
                  {Object.entries(categoryLabels).map(([key, info]) => (
                    <option key={key} value={key}>
                      {info.icon} {info.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-blue-200 mb-1">
                  Notes
                </label>
                <textarea
                  value={noteInput}
                  onChange={(e) => setNoteInput(e.target.value)}
                  placeholder="Location, details or reminders..."
                  rows={2}
                  className="w-full px-3.5 py-2 rounded-xl bg-blue-950 border border-blue-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-300 hover:bg-white/10 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-md cursor-pointer"
                >
                  Save Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
