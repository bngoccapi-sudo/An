import React from 'react';
import { GroupData, UserId, CalendarAction } from '../types';
import { ActionIcon } from './ActionIcon';
import { Calendar, X, Plus, Sparkles, Clock, User, Trash2 } from 'lucide-react';

interface DayDetailModalProps {
  date: string;
  group: GroupData;
  currentUserId: UserId;
  onClose: () => void;
  onOpenAdd: (date: string) => void;
  onClearDay?: (date: string) => void;
}

export const DayDetailModal: React.FC<DayDetailModalProps> = ({
  date,
  group,
  currentUserId,
  onClose,
  onOpenAdd,
  onClearDay
}) => {
  const dayData = group.calendar[date];

  // Parse date for English display
  const dateObj = new Date(date);
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayOfWeek = isNaN(dateObj.getTime()) ? '' : dayNames[dateObj.getDay()];
  const formattedDate = isNaN(dateObj.getTime())
    ? date
    : `${dayOfWeek}, ${dateObj.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`;

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  };

  // Priority order for display in Detail: paw -> tulip -> home -> food
  const getStampOrder = (act: CalendarAction): number => {
    const t = act.type?.toLowerCase() || '';
    const l = act.label?.toLowerCase() || '';
    const u = act.imageUrl?.toLowerCase() || '';

    if (t.includes('paw') || l.includes('paw') || l.includes('dấu chân') || l.includes('here') || u.includes('icon_1') || u.includes('icon_2')) {
      return 1;
    }
    if (t.includes('tulip') || t === 'flower' || l.includes('tulip') || u.includes('icon_3')) {
      return 2;
    }
    if (t.includes('home') || t === 'house' || l.includes('home') || u.includes('icon_4')) {
      return 3;
    }
    if (t.includes('food') || l.includes('food') || u.includes('icon_6')) {
      return 4;
    }
    if (t === 'note' || l.includes('note')) {
      return 5;
    }
    return 6;
  };

  const getCleanLabel = (act: CalendarAction): string => {
    const order = getStampOrder(act);
    if (order === 1) {
      return act.userId === 'user2' ? "Her Paw" : "His Paw";
    }
    if (order === 2) return 'Tulip';
    if (order === 3) return 'Home';
    if (order === 4) return 'Food';
    return act.label || 'Stamp';
  };

  const sortedActions = [...(dayData?.actions || [])].sort((a, b) => {
    return getStampOrder(a) - getStampOrder(b);
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-lg bg-[#fcf6e8] text-slate-900 rounded-[2.5rem] p-6 sm:p-7 shadow-2xl border-4 border-[#e9dbbe] space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#ebd7be]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold shadow-md shadow-amber-400/20">
              📅
            </div>
            <div>
              <h2 className="font-bold text-lg sm:text-xl font-['Quicksand'] text-slate-900">
                Day Details
              </h2>
              <span className="text-xs text-amber-900/80 font-medium">
                {formattedDate}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-amber-200/60 rounded-xl text-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Stamps Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Accumulated Stamps ({dayData?.actions?.length || 0})</span>
            </span>
          </div>

          {(!dayData?.actions || dayData.actions.length === 0) ? (
            <div className="p-4 rounded-2xl bg-white/60 border border-amber-200 text-center text-xs text-amber-800/70">
              No stamps have been added for this day yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {sortedActions.map((act) => {
                const owner = group.users[act.userId];
                const displayLabel = getCleanLabel(act);
                return (
                  <div
                    key={act.id}
                    className="flex items-center gap-3 p-2.5 rounded-2xl bg-white border border-[#e4d4ba] shadow-xs"
                  >
                    <ActionIcon type={act.type} imageUrl={act.imageUrl} size="md" />
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-bold text-slate-800 truncate">
                        {displayLabel}
                      </span>
                      <span className="text-[11px] text-amber-800/70 flex items-center gap-1">
                        <User className="w-3 h-3" />
                        <span>By {owner?.name || (act.userId === 'user2' ? 'Partner' : 'Me')}</span>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Notes Section */}
        <div className="space-y-3 pt-2">
          <span className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
            <span>📝</span>
            <span>Journal Notes ({dayData?.notes?.length || 0})</span>
          </span>

          {(!dayData?.notes || dayData.notes.length === 0) ? (
            <div className="p-4 rounded-2xl bg-white/60 border border-amber-200 text-center text-xs text-amber-800/70">
              No journal notes recorded for this day.
            </div>
          ) : (
            <div className="space-y-2.5">
              {dayData.notes.map((note) => (
                <div
                  key={note.id}
                  className="p-3.5 rounded-2xl bg-[#fffaec] border border-[#fae29c] shadow-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between text-xs text-amber-900/70">
                    <span className="font-bold text-slate-900">
                      {note.authorName || (note.userId === 'user1' ? group.users.user1.name : group.users.user2.name)}
                    </span>
                    <span className="text-[11px] flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatTime(note.timestamp)}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">
                    {note.content}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bottom Actions */}
        <div className="pt-3 border-t border-[#ebd7be] flex items-center justify-between gap-3">
          <button
            onClick={() => {
              if (onClearDay) {
                onClearDay(date);
              }
              onClose();
            }}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-100/70 border border-rose-300/80 hover:border-rose-400 transition-all cursor-pointer shadow-xs active:scale-95"
            title="Clear all stamps and notes for this date"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Day</span>
          </button>
          <button
            onClick={() => {
              onClose();
              onOpenAdd(date);
            }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold bg-amber-400 hover:bg-amber-500 active:scale-95 text-slate-950 text-xs transition-all shadow-md shadow-amber-400/20 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>+ Add Stamp For This Day</span>
          </button>
        </div>
      </div>
    </div>
  );
};
