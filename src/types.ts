export type UserId = 'user1' | 'user2';

export interface UserProfile {
  id: UserId;
  name: string;
  avatar: string;
  pawColor: 'blue' | 'yellow';
  birthday: string;
  bio: string;
  homeAddress: string;
  workAddress: string;
  email: string;
  phone: string;
}

export interface MessageReplyInfo {
  id: string;
  senderId: UserId;
  senderName: string;
  text?: string;
  imageUrl?: string;
  audioUrl?: string;
}

export interface Message {
  id: string;
  senderId: UserId;
  text: string;
  imageUrl?: string;
  audioUrl?: string;
  audioDuration?: number;
  replyTo?: MessageReplyInfo;
  timestamp: number;
  status: 'sent' | 'delivered' | 'read';
}

export type ActionIconType = 'paw_blue' | 'paw_yellow' | 'house' | 'food' | 'flower' | 'note' | string;

export interface CustomIcon {
  id: string;
  name?: string;
  url: string; // Base64 data URL or external URL
  createdBy: UserId;
  createdAt: number;
}

export interface CalendarAction {
  id: string;
  type: ActionIconType;
  imageUrl?: string;
  userId: UserId;
  label: string;
  timestamp: number;
  noteRefId?: string;
}

export interface CalendarNote {
  id: string;
  userId: UserId;
  authorName: string;
  content: string;
  timestamp: number;
}

export interface DayData {
  date: string; // YYYY-MM-DD
  actions: CalendarAction[];
  notes: CalendarNote[];
}

export type ScheduleCategory = 'work' | 'date' | 'exercise' | 'meal' | 'rest' | 'other';

export interface ScheduleItem {
  id: string;
  userId: UserId;
  dayOfWeek: number; // 0 = Sun, 1 = Mon ... 6 = Sat
  time: string; // "08:30"
  title: string;
  category: ScheduleCategory;
  note?: string;
  completed?: boolean;
}

export interface AppNotification {
  id: string;
  senderId: UserId;
  senderName: string;
  type: 'schedule_add' | 'schedule_update' | 'schedule_delete' | 'calendar_save' | 'calendar_clear' | 'icon_upload' | 'profile_update';
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  dateKey?: string;
}

export interface GroupData {
  code: string;
  name: string;
  password: string;
  avatar: string;
  createdAt: number;
  users: {
    user1: UserProfile;
    user2: UserProfile;
  };
  messages: Message[];
  calendar: Record<string, DayData>;
  schedules: ScheduleItem[];
  customIcons?: CustomIcon[];
  notifications?: AppNotification[];
}
