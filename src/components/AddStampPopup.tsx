import React, { useState, useEffect, useRef } from 'react';
import { GroupData, UserId, ActionIconType, CalendarAction, CalendarNote, CustomIcon } from '../types';
import { ActionIcon, ACTION_METADATA } from './ActionIcon';
import { X, ChevronLeft, ChevronRight, Check, Calendar as CalendarIcon, FileText, Upload, Plus, Trash2 } from 'lucide-react';

interface AddStampPopupProps {
  isOpen: boolean;
  initialDate: string;
  group: GroupData;
  currentUserId: UserId;
  onClose: () => void;
  onSaveDay: (date: string, actions: CalendarAction[], notes: CalendarNote[]) => void;
  onUploadIcon?: (icon: CustomIcon) => void;
  onDeleteIcon?: (iconId: string) => void;
}

interface StagedStampItem {
  id: string;
  type: ActionIconType;
  imageUrl?: string;
  userId: UserId;
  label: string;
  noteContent?: string;
}

const DEFAULT_BASE_ICONS: CustomIcon[] = [
  { id: 'icon_1', name: 'His Paw Stamp', url: '/icons/icon_1.png', createdBy: 'user1', createdAt: 0 },
  { id: 'icon_2', name: 'Her Paw Stamp', url: '/icons/icon_2.png', createdBy: 'user1', createdAt: 0 },
  { id: 'icon_3', name: 'Tulip', url: '/icons/icon_3.png', createdBy: 'user1', createdAt: 0 },
  { id: 'icon_4', name: 'Home', url: '/icons/icon_4.png', createdBy: 'user1', createdAt: 0 },
  { id: 'icon_6', name: 'Food', url: '/icons/icon_6.png', createdBy: 'user1', createdAt: 0 },
];

export const AddStampPopup: React.FC<AddStampPopupProps> = ({
  isOpen,
  initialDate,
  group,
  currentUserId,
  onClose,
  onSaveDay,
  onUploadIcon,
  onDeleteIcon
}) => {
  const [selectedDate, setSelectedDate] = useState<string>(initialDate);
  const [stagedItems, setStagedItems] = useState<StagedStampItem[]>([]);
  const [notesList, setNotesList] = useState<CalendarNote[]>([]);

  // Note dialog state
  const [isNoteInputOpen, setIsNoteInputOpen] = useState(false);
  const [noteText, setNoteText] = useState('');

  const currentUser = group.users[currentUserId];
  const partnerId: UserId = currentUserId === 'user1' ? 'user2' : 'user1';
  const partnerUser = group.users[partnerId];

  // Helper checks for pet paw icons
  const isBluePawIcon = (icon: CustomIcon) => {
    return icon.id === 'icon_1' ||
      icon.id === 'paw_blue' ||
      Boolean(icon.url && (icon.url.includes('icon_1.png') || icon.url.includes('image 192.png'))) ||
      Boolean(icon.name && (icon.name.toLowerCase().includes('dấu chân') || icon.name.toLowerCase().includes('his paw') || icon.name.toLowerCase().includes('blue paw')));
  };

  const isYellowPawIcon = (icon: CustomIcon) => {
    return icon.id === 'icon_2' ||
      icon.id === 'paw_yellow' ||
      Boolean(icon.url && (icon.url.includes('icon_2.png') || icon.url.includes('image 191.png'))) ||
      Boolean(icon.name && (icon.name.toLowerCase().includes('dấu chân') || icon.name.toLowerCase().includes('her paw') || icon.name.toLowerCase().includes('yellow paw')));
  };

  // Helper check to remove duplicate static note icon (icon_5 / image 196)
  const isDuplicateNoteIcon = (icon: CustomIcon) => {
    return icon.id === 'icon_5' ||
      Boolean(icon.url && (icon.url.includes('icon_5.png') || icon.url.includes('image 196.png'))) ||
      Boolean(icon.name && (icon.name.toLowerCase().includes('image 196') || icon.name.toLowerCase().includes('con dấu 5')));
  };

  const isTulipIcon = (icon: CustomIcon) => {
    return icon.id === 'icon_3' ||
      icon.id === 'flower' ||
      Boolean(icon.url && icon.url.includes('icon_3.png')) ||
      Boolean(icon.name && (icon.name.toLowerCase().includes('tulip') || icon.name.toLowerCase().includes('hoa') || icon.name?.includes('194')));
  };

  const isHomeIcon = (icon: CustomIcon) => {
    return icon.id === 'icon_4' ||
      icon.id === 'house' ||
      Boolean(icon.url && icon.url.includes('icon_4.png')) ||
      Boolean(icon.name && (icon.name.toLowerCase().includes('home') || icon.name.toLowerCase().includes('nhà') || icon.name?.includes('193')));
  };

  const isFoodIcon = (icon: CustomIcon) => {
    return icon.id === 'icon_6' ||
      icon.id === 'food' ||
      Boolean(icon.url && icon.url.includes('icon_6.png')) ||
      Boolean(icon.name && (icon.name.toLowerCase().includes('food') || icon.name.toLowerCase().includes('ăn') || icon.name?.includes('195')));
  };

  const isBlueUser = (currentUser?.pawColor === 'blue') || (currentUserId === 'user1');

  // Base icons: either from group.customIcons or fallback to standard 6 icons
  const rawBaseIcons = (group.customIcons && group.customIcons.length > 0)
    ? group.customIcons
    : DEFAULT_BASE_ICONS;

  // Filter icons:
  // - Remove duplicate static note icon at position 5 (user requested to delete this)
  // - User 1 (Anh ta - blue) only sees the blue pet paw
  // - User 2 (Ả - yellow) only sees the yellow pet paw
  // Both users see the remaining common stamp icons
  const baseIcons = rawBaseIcons.filter((icon) => {
    if (isDuplicateNoteIcon(icon)) return false;
    if (isBluePawIcon(icon)) return isBlueUser;
    if (isYellowPawIcon(icon)) return !isBlueUser;
    return true;
  });

  // Normalize icon key to reliably check per-user uniqueness (1 time per user)
  const getIconKey = (icon: { id: string; name?: string; url?: string; type?: string }) => {
    const customIcon = icon as CustomIcon;
    if (isBluePawIcon(customIcon)) return 'paw_blue';
    if (isYellowPawIcon(customIcon)) return 'paw_yellow';
    if (isTulipIcon(customIcon)) return 'flower';
    if (isHomeIcon(customIcon)) return 'house';
    if (isFoodIcon(customIcon)) return 'food';
    return icon.id || icon.type || icon.url || 'custom';
  };

  const getItemKey = (item: StagedStampItem) => {
    if (item.type === 'note') return null; // Note icon is excluded from the 1-time limit
    if (item.type === 'paw_blue' || item.type === 'icon_1' || item.label.includes('Anh ta')) return 'paw_blue';
    if (item.type === 'paw_yellow' || item.type === 'icon_2' || item.label.includes('Ả')) return 'paw_yellow';
    if (item.type === 'flower' || item.type === 'icon_3' || item.label.toLowerCase().includes('tulip')) return 'flower';
    if (item.type === 'house' || item.type === 'icon_4' || item.label.toLowerCase().includes('home') || item.label.toLowerCase().includes('nhà')) return 'house';
    if (item.type === 'food' || item.type === 'icon_6' || item.label.toLowerCase().includes('food') || item.label.toLowerCase().includes('ăn')) return 'food';
    return item.type || item.imageUrl || item.id;
  };

  // Sync staged items whenever selectedDate or initialDate changes
  useEffect(() => {
    setSelectedDate(initialDate);
  }, [initialDate]);

  useEffect(() => {
    const existing = group.calendar[selectedDate];
    if (existing) {
      const items: StagedStampItem[] = [];
      const userNonNoteSeen = new Set<string>();

      existing.actions.forEach((act) => {
        const matchingNote = existing.notes.find((n) => n.userId === act.userId);
        const item: StagedStampItem = {
          id: act.id,
          type: act.type,
          imageUrl: act.imageUrl,
          userId: act.userId,
          label: act.label,
          noteContent: act.type === 'note' ? (act.label.replace(/^Ghi chú:\s*/, '') || matchingNote?.content) : matchingNote?.content
        };

        if (item.type === 'note') {
          items.push(item);
        } else {
          const itemKey = getItemKey(item);
          const dedupeKey = `${item.userId}_${itemKey}`;
          if (!userNonNoteSeen.has(dedupeKey)) {
            userNonNoteSeen.add(dedupeKey);
            items.push(item);
          }
        }
      });

      // Ensure all notes also appear as note icons inside the jar
      existing.notes.forEach((note) => {
        const alreadyInItems = items.some((it) => it.type === 'note' && (it.noteContent === note.content || it.label.includes(note.content)));
        if (!alreadyInItems) {
          items.push({
            id: 'stg-note-' + note.id,
            type: 'note',
            userId: note.userId,
            label: `Note: ${note.content}`,
            noteContent: note.content
          });
        }
      });

      setStagedItems(items);
      setNotesList([...existing.notes]);
    } else {
      setStagedItems([]);
      setNotesList([]);
    }
  }, [selectedDate, group.calendar]);

  if (!isOpen) return null;

  // Date navigation helpers
  const handlePrevDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    setSelectedDate(`${yyyy}-${mm}-${dd}`);
  };

  const handleNextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    setSelectedDate(`${yyyy}-${mm}-${dd}`);
  };

  const formatDisplayDateDMY = (dateStr: string) => {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
  };

  // Check if an icon is already added by current user (max 1 time per user)
  const isIconAddedByCurrentUser = (icon: { id: string; name?: string; url?: string }) => {
    const targetKey = getIconKey(icon);
    return stagedItems.some((item) => item.userId === currentUserId && getItemKey(item) === targetKey);
  };

  const currentNotesCount = stagedItems.filter(
    (item) => item.userId === currentUserId && item.type === 'note'
  ).length;

  // Add base icon stamp: Each icon only 1 time per user (clicking again toggles/removes it)
  const handleAddBaseIcon = (icon: { id: string; name?: string; url: string }) => {
    const targetKey = getIconKey(icon);

    // Rule: Each icon can only be added 1 time per user (note icon can be added multiple times)
    const existingIndex = stagedItems.findIndex(
      (item) => item.userId === currentUserId && getItemKey(item) === targetKey
    );

    // If already added by current user, toggle it off (remove from staged items)
    if (existingIndex !== -1) {
      setStagedItems((prev) => prev.filter((_, idx) => idx !== existingIndex));
      return;
    }

    const isBlue = isBluePawIcon(icon as CustomIcon);
    const isYellow = isYellowPawIcon(icon as CustomIcon);
    const isTulip = isTulipIcon(icon as CustomIcon);
    const isHome = isHomeIcon(icon as CustomIcon);
    const isFood = isFoodIcon(icon as CustomIcon);

    let defaultLabel = icon.name || 'Stamp';
    let type = icon.id;
    if (isBlue) {
      defaultLabel = 'His Paw Stamp';
      type = 'paw_blue';
    } else if (isYellow) {
      defaultLabel = 'Her Paw Stamp';
      type = 'paw_yellow';
    } else if (isTulip) {
      defaultLabel = 'Tulip';
      type = 'flower';
    } else if (isHome) {
      defaultLabel = 'Home';
      type = 'house';
    } else if (isFood) {
      defaultLabel = 'Food';
      type = 'food';
    }

    const newItem: StagedStampItem = {
      id: 'stg-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      type,
      imageUrl: icon.url,
      userId: currentUserId,
      label: defaultLabel
    };
    setStagedItems((prev) => [...prev, newItem]);
  };

  const handleConfirmNote = () => {
    if (!noteText.trim()) {
      setIsNoteInputOpen(false);
      return;
    }

    const noteId = 'note-' + Date.now();
    const newNote: CalendarNote = {
      id: noteId,
      userId: currentUserId,
      authorName: currentUser.name,
      content: noteText.trim(),
      timestamp: Date.now()
    };
    setNotesList((prev) => [...prev, newNote]);

    const newItem: StagedStampItem = {
      id: 'stg-note-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      type: 'note',
      userId: currentUserId,
      label: `Ghi chú: ${noteText.trim()}`,
      noteContent: noteText.trim()
    };

    setStagedItems((prev) => [...prev, newItem]);
    setIsNoteInputOpen(false);
    setNoteText('');
  };

  const handleRemoveItem = (id: string) => {
    const itemToRemove = stagedItems.find((item) => item.id === id);
    if (itemToRemove && itemToRemove.type === 'note' && itemToRemove.noteContent) {
      setNotesList((prev) => prev.filter((n) => n.content !== itemToRemove.noteContent));
    }
    setStagedItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleSave = () => {
    // Enforce rule: Each icon only 1 time per user; note icon can be added multiple times
    const userSeenNonNotes = new Set<string>();
    const deduplicatedItems: StagedStampItem[] = [];

    stagedItems.forEach((item) => {
      if (item.type === 'note') {
        deduplicatedItems.push(item);
      } else {
        const itemKey = getItemKey(item);
        const dedupeKey = `${item.userId}_${itemKey}`;
        if (!userSeenNonNotes.has(dedupeKey)) {
          userSeenNonNotes.add(dedupeKey);
          deduplicatedItems.push(item);
        }
      }
    });

    const calendarActions: CalendarAction[] = deduplicatedItems.map((item) => ({
      id: item.id,
      type: item.type,
      imageUrl: item.imageUrl,
      userId: item.userId,
      label: item.label,
      timestamp: Date.now()
    }));

    onSaveDay(selectedDate, calendarActions, notesList);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-[460px] bg-[#0c162d] border border-blue-900/60 rounded-[2.5rem] p-4 sm:p-5 shadow-2xl text-slate-100 flex flex-col space-y-3.5 max-h-[96vh] overflow-y-auto">
        {/* Top bar with Date Adjustment and Close Button */}
        <div className="flex items-center justify-between pb-1 border-b border-blue-900/40">
          <div className="flex items-center gap-1.5 bg-blue-950/80 border border-blue-800/80 rounded-2xl px-2 py-1 text-xs">
            <button
              onClick={handlePrevDay}
              className="p-1 hover:bg-white/10 rounded-xl text-blue-200 transition-colors"
              title="Previous day"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-1.5 px-1.5 font-bold font-mono text-white text-xs sm:text-sm">
              <CalendarIcon className="w-3.5 h-3.5 text-amber-400" />
              <span>{formatDisplayDateDMY(selectedDate)}</span>
            </div>
            <button
              onClick={handleNextDay}
              className="p-1 hover:bg-white/10 rounded-xl text-blue-200 transition-colors"
              title="Next day"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Close button */}
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-white/10 rounded-xl text-slate-400 hover:text-white transition-colors"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* SECTION 1: Transparent Glass Jar (Bình chứa trong suốt) */}
        <div className="relative w-full flex flex-col items-center pt-2 pb-1">
          {/* Glass Jar container with rounded dome, highlights, handles and wooden base */}
          <div
            className="relative w-full aspect-[1/0.95] max-h-[300px] rounded-[2.5rem] border-2 border-white/40 shadow-[0_0_30px_rgba(255,255,255,0.15),inset_0_0_25px_rgba(255,255,255,0.25)] bg-gradient-to-b from-white/20 via-blue-200/10 to-white/15 backdrop-blur-xs flex flex-col justify-between p-4 overflow-hidden"
          >
            {/* Top glass slot rim & reflections */}
            <div className="w-32 h-3 mx-auto rounded-full bg-white/30 border border-white/50 shadow-inner" />
            <div className="absolute top-2 left-4 w-7 h-8 rounded-full border border-white/40 transform -rotate-12 bg-white/10 pointer-events-none" />
            <div className="absolute top-2 right-4 w-7 h-8 rounded-full border border-white/40 transform rotate-12 bg-white/10 pointer-events-none" />
            <div className="absolute top-8 left-6 w-12 h-32 rounded-full bg-white/15 blur-xs transform -rotate-6 pointer-events-none" />
            <div className="absolute top-8 right-6 w-8 h-28 rounded-full bg-white/10 blur-xs transform rotate-6 pointer-events-none" />

            {/* Staged Items inside the Glass Jar */}
            <div className="flex-1 flex flex-wrap items-center justify-center content-center gap-3 p-3 overflow-y-auto z-10">
              {stagedItems.length === 0 ? (
                <div className="text-center text-blue-200/60 select-none py-6">
                  <span className="text-3xl block mb-1">🐾</span>
                  <p className="text-xs font-semibold text-blue-100">The jar is currently empty</p>
                  <p className="text-[11px] text-blue-200/60">
                    Pick icons below to drop them into the jar!
                  </p>
                </div>
              ) : (
                stagedItems.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleRemoveItem(item.id)}
                    title={item.noteContent ? `📝 Note: "${item.noteContent}" (Tap to remove)` : `${item.label} (Tap to remove)`}
                    className="group cursor-pointer p-1 rounded-2xl transition-transform hover:scale-120 active:scale-95 flex items-center justify-center relative"
                  >
                    <ActionIcon type={item.type} imageUrl={item.imageUrl} size="lg" />
                    {item.type === 'note' && (
                      <span className="absolute -bottom-1 -left-1 bg-amber-400 text-slate-950 text-[9px] font-extrabold px-1 py-0.2 rounded-full shadow-xs border border-amber-300 pointer-events-none">
                        Note
                      </span>
                    )}
                    {/* Subtle hover remove badge */}
                    <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white flex items-center justify-center text-[10px] font-bold shadow-xs opacity-0 group-hover:opacity-100 transition-opacity">
                      ×
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Bottom translucent pill banner inside the jar */}
            <div className="w-full py-1.5 px-4 rounded-full bg-slate-900/60 backdrop-blur-md border border-white/20 flex items-center justify-between text-xs text-slate-200 z-10 shadow-xs">
              <span className="font-medium text-[11px] sm:text-xs">
                In jar: <strong className="text-amber-300 font-bold">{stagedItems.length} stamps</strong>
              </span>
              <span className="text-[11px] text-amber-200/90 font-medium">
                1 icon/person • Multiple notes allowed
              </span>
            </div>
          </div>

          {/* Wooden shelf base underneath jar */}
          <div className="w-[94%] h-3 rounded-full bg-[#703b17] shadow-md border-t border-[#8e4c1f] -mt-1.5" />
        </div>

        {/* SECTION 2: Bottom Control Panel (Icon selection row) */}
        <div className="bg-[#101e3b] border border-blue-900/80 rounded-3xl p-3.5 sm:p-4 shadow-xl space-y-3">
          {/* Icon Selection Row - Pure icons without text */}
          <div className="flex flex-wrap items-center justify-start gap-2.5 py-1 max-h-36 overflow-y-auto">
            {/* 1. Pet paw icons */}
            {baseIcons
              .filter((icon) => isBluePawIcon(icon) || isYellowPawIcon(icon))
              .map((icon) => {
                const isAdded = isIconAddedByCurrentUser(icon);
                const titleText = isBluePawIcon(icon) ? 'His Paw Stamp' : 'Her Paw Stamp';
                return (
                  <button
                    key={icon.id}
                    onClick={() => handleAddBaseIcon(icon)}
                    title={
                      isAdded
                        ? `${titleText} (Added 1/1 • Tap to remove)`
                        : `${titleText} (Tap to add)`
                    }
                    className={`relative flex items-center justify-center p-2 sm:p-2.5 rounded-2xl transition-all hover:scale-110 active:scale-95 cursor-pointer shadow-sm shrink-0 ${
                      isAdded
                        ? 'bg-amber-400/25 border-2 border-amber-400 ring-2 ring-amber-400/40 shadow-amber-400/20'
                        : 'bg-white/5 hover:bg-white/10 border-2 border-dashed border-amber-300/40 hover:border-amber-400'
                    }`}
                  >
                    <ActionIcon type={icon.id} imageUrl={icon.url} size="lg" />
                    {isAdded && (
                      <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center text-[10px] font-black shadow-sm">
                        ✓
                      </span>
                    )}
                  </button>
                );
              })}

            {/* 2. Card Note */}
            <button
              type="button"
              onClick={() => {
                setNoteText('');
                setIsNoteInputOpen(true);
              }}
              title={
                currentNotesCount > 0
                  ? `Added ${currentNotesCount} notes (Tap to add another)`
                  : 'Add note & memory (can add multiple times)'
              }
              className="relative flex items-center justify-center p-2 sm:p-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border-2 border-dashed border-amber-300/50 hover:border-amber-300 transition-all hover:scale-110 active:scale-95 cursor-pointer shadow-sm shrink-0 group"
            >
              <ActionIcon type="note" size="lg" />
              {currentNotesCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-4 h-4 px-1 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center text-[10px] font-black shadow-sm">
                  {currentNotesCount}
                </span>
              )}
            </button>

            {/* 3. Common memory icons: Tulip, Home, Food */}
            {baseIcons
              .filter((icon) => !isBluePawIcon(icon) && !isYellowPawIcon(icon))
              .sort((a, b) => {
                const getOrder = (ic: CustomIcon) => {
                  if (isTulipIcon(ic)) return 1;
                  if (isHomeIcon(ic)) return 2;
                  if (isFoodIcon(ic)) return 3;
                  return 4;
                };
                return getOrder(a) - getOrder(b);
              })
              .map((icon) => {
                const label = isTulipIcon(icon)
                  ? 'Tulip'
                  : isHomeIcon(icon)
                  ? 'Home'
                  : isFoodIcon(icon)
                  ? 'Food'
                  : (icon.name || 'Stamp');
                const isAdded = isIconAddedByCurrentUser(icon);
                return (
                  <button
                    key={icon.id}
                    onClick={() => handleAddBaseIcon(icon)}
                    title={
                      isAdded
                        ? `${label} (Added 1/1 • Tap to remove)`
                        : `${label} (Tap to add)`
                    }
                    className={`relative flex items-center justify-center p-2 sm:p-2.5 rounded-2xl transition-all hover:scale-110 active:scale-95 cursor-pointer shadow-sm shrink-0 ${
                      isAdded
                        ? 'bg-amber-400/25 border-2 border-amber-400 ring-2 ring-amber-400/40 shadow-amber-400/20'
                        : 'bg-white/5 hover:bg-white/10 border-2 border-dashed border-amber-300/40 hover:border-amber-400'
                    }`}
                  >
                    <ActionIcon type={icon.id} imageUrl={icon.url} size="lg" />
                    {isAdded && (
                      <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center text-[10px] font-black shadow-sm">
                        ✓
                      </span>
                    )}
                  </button>
                );
              })}
          </div>

          {/* Primary Save CTA Button */}
          <button
            onClick={handleSave}
            className="w-full py-3 px-4 rounded-2xl font-bold bg-[#ff9f00] hover:bg-[#f59300] active:scale-98 text-slate-950 transition-all shadow-lg shadow-amber-500/25 text-sm sm:text-base flex items-center justify-center gap-2 cursor-pointer mt-1"
          >
            <Check className="w-5 h-5 stroke-[3]" />
            <span>Save To Calendar {formatDisplayDateDMY(selectedDate)}</span>
          </button>
        </div>
      </div>

      {/* Note Input Sub-dialog */}
      {isNoteInputOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-[#fffdf5] text-amber-950 rounded-3xl p-5 sm:p-6 shadow-2xl border-4 border-[#edd89f] space-y-3.5">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-amber-200/80">
              <div className="flex items-center gap-2.5">
                <ActionIcon type="note" size="md" />
                <div>
                  <h3 className="font-bold text-base sm:text-lg font-['Quicksand'] text-amber-950 leading-tight">
                    Write Note & Memory
                  </h3>
                  <div className="flex items-center gap-2 text-[11px] text-amber-800/80 mt-0.5">
                    <span>Date {formatDisplayDateDMY(selectedDate)}</span>
                    <span>•</span>
                    <span className="font-semibold text-amber-900">
                      By {currentUser.name} 🐾
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsNoteInputOpen(false)}
                className="p-1.5 hover:bg-amber-200/60 rounded-xl text-amber-900 transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Suggestion Chips */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-amber-900/60 uppercase tracking-wider">
                Quick ideas:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  '❤️ Loving',
                  '☕ Coffee Date',
                  '🍱 Tasty Meal',
                  '🎬 Movie Night',
                  '✨ Special Memory',
                  '🚗 Road Trip',
                  '🐾 City Stroll'
                ].map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => {
                      setNoteText((prev) => (prev ? `${prev} ${tag}` : tag));
                    }}
                    className="px-2.5 py-1 rounded-full bg-amber-100 hover:bg-amber-200/80 text-amber-900 text-[11px] font-medium transition-colors cursor-pointer border border-amber-200"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Note Textarea */}
            <div className="relative">
              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Write your note or memory for today... When saved, it will drop into the glass jar!"
                rows={4}
                className="w-full p-3.5 rounded-2xl bg-white border border-amber-300/90 text-slate-900 placeholder:text-amber-800/40 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 text-xs sm:text-sm leading-relaxed shadow-inner resize-none font-medium"
                autoFocus
              />
              <div className="flex justify-end mt-1 text-[11px] text-amber-800/60">
                {noteText.trim().length} characters
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2.5 pt-1 border-t border-amber-200/60">
              <button
                type="button"
                onClick={() => setIsNoteInputOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-amber-900 hover:bg-amber-200/50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmNote}
                disabled={!noteText.trim()}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-[#ff9f00] hover:bg-[#f59300] active:scale-95 text-slate-950 shadow-md shadow-amber-500/25 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <span>Drop Into Jar</span>
                <span className="text-sm">🐾</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
