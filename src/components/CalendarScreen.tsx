import React, { useState } from 'react';
import { GroupData, UserId, DayData } from '../types';
import { ActionIcon } from './ActionIcon';
import { ChevronLeft, ChevronRight, Plus, Sparkles, Filter, CalendarDays } from 'lucide-react';

interface CalendarScreenProps {
  group: GroupData;
  currentUserId: UserId;
  onSelectDate: (date: string) => void;
  onOpenAdd: (date: string) => void;
}

export const CalendarScreen: React.FC<CalendarScreenProps> = ({
  group,
  currentUserId,
  onSelectDate,
  onOpenAdd
}) => {
  const [selectedYear, setSelectedYear] = useState(2026);
  const [selectedMonth, setSelectedMonth] = useState(10); // 1-12 (October)

  const handlePrevMonth = () => {
    if (selectedMonth === 1) {
      setSelectedMonth(12);
      setSelectedYear((prev) => prev - 1);
    } else {
      setSelectedMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 12) {
      setSelectedMonth(1);
      setSelectedYear((prev) => prev + 1);
    } else {
      setSelectedMonth((prev) => prev + 1);
    }
  };

  // Days in month
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month, 0).getDate();
  };

  const totalDays = getDaysInMonth(selectedYear, selectedMonth);

  // Pad day string: YYYY-MM-DD
  const formatDayKey = (dayNum: number) => {
    const m = String(selectedMonth).padStart(2, '0');
    const d = String(dayNum).padStart(2, '0');
    return `${selectedYear}-${m}-${d}`;
  };

  const handleDayClick = (dayNum: number) => {
    const dateKey = formatDayKey(dayNum);
    const dayData = group.calendar[dateKey];
    if (dayData && (dayData.actions.length > 0 || dayData.notes.length > 0)) {
      onSelectDate(dateKey);
    } else {
      // Empty day -> Go directly to Add screen as requested!
      onOpenAdd(dateKey);
    }
  };

  const todayKey = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`;

  return (
    <div className="relative w-full min-h-[calc(100vh-4rem)] bg-[#172744] flex flex-col items-center justify-start p-3 sm:p-6 text-slate-100 overflow-x-hidden">
      {/* Background Illustrated Cozy Desk Art matching Image 2 */}
      <div className="absolute inset-0 z-0">
        <img
          src="/src/assets/images/desk_calendar_scene_1791796106638.jpg"
          alt="Desk Calendar Ambience"
          className="w-full h-full object-cover opacity-70 filter brightness-90"
          onError={(e) => {
            (e.currentTarget as HTMLElement).style.display = 'none';
          }}
        />
        <div className="absolute inset-0 bg-radial from-transparent via-[#132039]/60 to-[#0e182d]/90 pointer-events-none" />
      </div>

      <div className="relative z-10 w-full max-w-6xl space-y-4">
        {/* Top Header matching Image 2: "MONTHLY STREAK" */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-slate-950/40 backdrop-blur-md p-4 sm:p-6 rounded-3xl border border-white/10 shadow-xl">
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 text-amber-300 font-extrabold tracking-widest text-2xl sm:text-3xl font-['Quicksand'] drop-shadow-sm uppercase">
              <span className="text-amber-400">ミ</span>
              <span>MONTHLY STREAK</span>
              <span className="text-amber-400">彡</span>
            </div>
            <p className="text-xs sm:text-sm text-blue-100/90 font-medium mt-1">
              Keep going, you're doing great!
            </p>
          </div>

          {/* Date Filter & Add Button */}
          <div className="flex items-center gap-3 flex-wrap justify-center">
            {/* Month Navigator */}
            <div className="flex items-center bg-blue-950/70 border border-blue-800/80 rounded-2xl p-1 text-xs">
              <button
                onClick={handlePrevMonth}
                className="p-1.5 hover:bg-white/10 rounded-xl text-blue-200 transition-colors cursor-pointer"
                title="Previous month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-3 font-bold font-mono text-white text-sm">
                {new Date(selectedYear, selectedMonth - 1).toLocaleString('en-US', { month: 'long' })} {selectedYear}
              </span>
              <button
                onClick={handleNextMonth}
                className="p-1.5 hover:bg-white/10 rounded-xl text-blue-200 transition-colors cursor-pointer"
                title="Next month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Add Button */}
            <button
              onClick={() => onOpenAdd(todayKey)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold bg-amber-400 hover:bg-amber-300 active:scale-95 text-slate-950 text-xs sm:text-sm transition-all shadow-lg shadow-amber-400/25 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Add New</span>
            </button>
          </div>
        </div>

        {/* Calendar Board matching Image 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Left Side Note: Sticky Note & Cat Motivation matching Image 2 */}
          <div className="hidden lg:flex lg:col-span-3 flex-col gap-4">
            {/* Sticky note card */}
            <div className="relative p-5 rounded-2xl bg-[#fffae0] text-amber-950 shadow-xl border-t-8 border-[#f3d97b] rotate-[-2deg] transform transition-transform hover:rotate-0">
              {/* Tape */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-5 bg-[#c8e6c9]/80 backdrop-blur-xs rounded-xs shadow-xs" />
              <p className="font-['Quicksand'] font-bold text-base leading-snug text-center mt-2 text-slate-800">
                Small steps every day lead to big changes.
              </p>
              <div className="text-center text-rose-500 text-lg mt-2 font-bold">❤️</div>
            </div>

            {/* Stamps Legend card */}
            <div className="p-4 rounded-2xl bg-slate-950/40 backdrop-blur-md border border-white/10 text-xs space-y-2.5">
              <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider block">
                Stamps Legend
              </span>
              <div className="flex items-center gap-2 text-slate-200">
                <ActionIcon
                  type={currentUserId === 'user2' ? 'paw_yellow' : 'paw_blue'}
                  imageUrl={currentUserId === 'user2' ? '/icons/icon_2.png' : '/icons/icon_1.png'}
                  size="sm"
                />
                <span>
                  {currentUserId === 'user2'
                    ? `Her Paw (${group.users.user2.name})`
                    : `His Paw (${group.users.user1.name})`}
                </span>
              </div>
              <div className="pt-2 border-t border-white/10 flex items-center gap-2 text-rose-200">
                <ActionIcon type="note" size="sm" />
                <span>Notes & Memories</span>
              </div>
              <div className="pt-2 border-t border-white/10 flex items-center gap-2 text-slate-300">
                <ActionIcon type="icon_3" imageUrl="/icons/icon_3.png" size="sm" />
                <span>Couple Memory Stamps</span>
              </div>
            </div>
          </div>

          {/* Right/Center: Calendar Grid Board matching Image 2 */}
          <div className="lg:col-span-9 bg-[#fbf5e8] rounded-[2.5rem] p-4 sm:p-6 shadow-2xl border-4 border-[#e9dbbe] text-slate-900">
            {/* Days Grid: 7 columns (Sunday to Saturday) */}
            <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2 pb-2 border-b border-[#eedec0] text-center text-xs font-bold text-amber-900/70 uppercase">
              <span>SUN</span>
              <span>MON</span>
              <span>TUE</span>
              <span>WED</span>
              <span>THU</span>
              <span>FRI</span>
              <span>SAT</span>
            </div>

            {/* Days Cells */}
            <div className="grid grid-cols-7 gap-1.5 sm:gap-2.5">
              {Array.from({ length: totalDays }, (_, i) => i + 1).map((dayNum) => {
                const dateKey = formatDayKey(dayNum);
                const dayData = group.calendar[dateKey];
                const hasData = dayData && (dayData.actions.length > 0 || dayData.notes.length > 0);
                const isToday = dateKey === todayKey;

                return (
                  <div
                    key={dayNum}
                    onClick={() => handleDayClick(dayNum)}
                    className={`relative min-h-[72px] sm:min-h-[88px] p-1.5 sm:p-2 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between group ${
                      hasData
                        ? 'bg-[#fffdf7] border-[#d4c3a3] hover:border-amber-500 shadow-sm hover:shadow-md hover:-translate-y-0.5'
                        : 'bg-[#f7eedc]/50 border-dashed border-[#e2d0b0] hover:bg-[#fff9ed] hover:border-amber-400'
                    } ${isToday ? 'ring-2 ring-amber-500 ring-offset-1 ring-offset-[#fbf5e8]' : ''}`}
                  >
                    {/* Day number */}
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-xs sm:text-sm font-bold font-['Quicksand'] ${
                          isToday ? 'text-amber-700 font-extrabold' : 'text-slate-700'
                        }`}
                      >
                        {dayNum}
                      </span>
                      {dayData?.notes && dayData.notes.length > 0 && (
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" title="Has journal note" />
                      )}
                    </div>

                    {/* Stamps inside day cell matching Image 2 */}
                    <div className="flex flex-wrap items-center justify-center gap-1 my-auto">
                      {dayData?.actions?.slice(0, 4).map((act) => (
                        <ActionIcon
                          key={act.id}
                          type={act.type}
                          imageUrl={act.imageUrl}
                          size="sm"
                          title={`${act.label} (${act.userId === 'user1' ? group.users.user1.name : group.users.user2.name})`}
                        />
                      ))}
                      {dayData?.actions && dayData.actions.length > 4 && (
                        <span className="text-[10px] font-bold text-amber-800">
                          +{dayData.actions.length - 4}
                        </span>
                      )}
                      {!hasData && (
                        <span className="hidden group-hover:inline-block text-[10px] text-amber-700 font-medium">
                          + Add
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
