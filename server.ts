import express from 'express';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

const PORT = 3000;
const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'duo_store.json');

app.use(express.json({ limit: '25mb' }));

// Initial seed data
interface UserProfile {
  id: 'user1' | 'user2';
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

interface MessageReplyInfo {
  id: string;
  senderId: 'user1' | 'user2';
  senderName: string;
  text?: string;
  imageUrl?: string;
  audioUrl?: string;
}

interface Message {
  id: string;
  senderId: 'user1' | 'user2';
  text: string;
  imageUrl?: string;
  audioUrl?: string;
  audioDuration?: number;
  replyTo?: MessageReplyInfo;
  timestamp: number;
  status: 'sent' | 'delivered' | 'read';
}

interface CalendarAction {
  id: string;
  type: 'paw_blue' | 'paw_yellow' | 'house' | 'food' | 'flower' | 'note';
  userId: 'user1' | 'user2';
  label: string;
  timestamp: number;
}

interface CalendarNote {
  id: string;
  userId: 'user1' | 'user2';
  authorName: string;
  content: string;
  timestamp: number;
}

interface DayData {
  date: string; // YYYY-MM-DD
  actions: CalendarAction[];
  notes: CalendarNote[];
}

interface ScheduleItem {
  id: string;
  userId: 'user1' | 'user2';
  dayOfWeek: number; // 0 = Sun, 1 = Mon ... 6 = Sat
  time: string; // e.g. "08:30"
  title: string;
  category: 'work' | 'date' | 'exercise' | 'meal' | 'rest' | 'other';
  note?: string;
  completed?: boolean;
}

interface CustomIcon {
  id: string;
  name?: string;
  url: string;
  createdBy: 'user1' | 'user2';
  createdAt: number;
}

interface AppNotification {
  id: string;
  senderId: 'user1' | 'user2';
  senderName: string;
  type: 'schedule_add' | 'schedule_update' | 'schedule_delete' | 'calendar_save' | 'calendar_clear' | 'icon_upload' | 'profile_update';
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  dateKey?: string;
}

interface GroupData {
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
  calendar: Record<string, DayData>; // keyed by YYYY-MM-DD
  schedules: ScheduleItem[];
  customIcons?: CustomIcon[];
  notifications?: AppNotification[];
}

// In-memory database
let store: {
  groups: Record<string, GroupData>;
} = {
  groups: {}
};

// Ensure data folder and load
function initStore() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      store = JSON.parse(raw);
    }
  } catch (err) {
    console.error('Error loading store:', err);
  }

  // Pre-seed default group if empty
  if (!store.groups['DUO2026']) {
    const today = new Date();
    const curYear = today.getFullYear();
    const curMonth = String(today.getMonth() + 1).padStart(2, '0');
    const day2 = `${curYear}-${curMonth}-02`;
    const day3 = `${curYear}-${curMonth}-03`;
    const day4 = `${curYear}-${curMonth}-04`;
    const day5 = `${curYear}-${curMonth}-05`;
    const day7 = `${curYear}-${curMonth}-07`;
    const day8 = `${curYear}-${curMonth}-08`;
    const day12 = `${curYear}-${curMonth}-12`;

    const defaultGroup: GroupData = {
      code: 'DUO2026',
      name: 'Alex & Emma 🐾',
      password: '123',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=duocute',
      createdAt: Date.now(),
      users: {
        user1: {
          id: 'user1',
          name: 'Alex',
          avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
          pawColor: 'blue',
          birthday: '2000-11-20',
          bio: 'Enjoys coding, cooking dinners and film photography 📸',
          homeAddress: 'Downtown Apartment',
          workAddress: 'Tech Tower Office',
          email: 'alex.duo@example.com',
          phone: '0987654321'
        },
        user2: {
          id: 'user2',
          name: 'Emma',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          pawColor: 'yellow',
          birthday: '2001-08-15',
          bio: 'Enjoys painting, design podcasts and cozy cafes 🧸',
          homeAddress: 'Garden Studio',
          workAddress: 'Creative Hub',
          email: 'emma.duo@example.com',
          phone: '0912345678'
        }
      },
      messages: [
        {
          id: 'msg-1',
          senderId: 'user1',
          text: 'Are you free for afternoon coffee today? ☕',
          timestamp: Date.now() - 1000 * 60 * 30,
          status: 'read'
        },
        {
          id: 'msg-2',
          senderId: 'user2',
          text: 'Yes sweetheart! Pick me up at 7 PM. I just added it to our weekly schedule! 💛',
          timestamp: Date.now() - 1000 * 60 * 25,
          status: 'read'
        },
        {
          id: 'msg-3',
          senderId: 'user1',
          text: 'Yay! Don\'t forget to drop our stamps into the jar today 🐾',
          timestamp: Date.now() - 1000 * 60 * 5,
          status: 'read'
        }
      ],
      calendar: {
        [day2]: {
          date: day2,
          actions: [
            { id: 'act-2-1', type: 'paw_blue', userId: 'user1', label: 'His Paw Stamp', timestamp: Date.now() - 86400000 * 10 },
            { id: 'act-2-2', type: 'paw_yellow', userId: 'user2', label: 'Her Paw Stamp', timestamp: Date.now() - 86400000 * 10 }
          ],
          notes: [{ id: 'n-2', userId: 'user1', authorName: 'Alex', content: 'Sunset park stroll together, so relaxing!', timestamp: Date.now() - 86400000 * 10 }]
        },
        [day3]: {
          date: day3,
          actions: [
            { id: 'act-3-1', type: 'paw_blue', userId: 'user1', label: 'His Paw Stamp', timestamp: Date.now() - 86400000 * 9 },
            { id: 'act-3-2', type: 'paw_yellow', userId: 'user2', label: 'Her Paw Stamp', timestamp: Date.now() - 86400000 * 9 }
          ],
          notes: []
        },
        [day4]: {
          date: day4,
          actions: [
            { id: 'act-4-1', type: 'paw_blue', userId: 'user1', label: 'His Paw Stamp', timestamp: Date.now() - 86400000 * 8 },
            { id: 'act-4-2', type: 'paw_yellow', userId: 'user2', label: 'Her Paw Stamp', timestamp: Date.now() - 86400000 * 8 }
          ],
          notes: []
        },
        [day5]: {
          date: day5,
          actions: [
            { id: 'act-5-1', type: 'paw_blue', userId: 'user1', label: 'His Paw Stamp', timestamp: Date.now() - 86400000 * 7 },
            { id: 'act-5-2', type: 'paw_yellow', userId: 'user2', label: 'Her Paw Stamp', timestamp: Date.now() - 86400000 * 7 }
          ],
          notes: []
        },
        [day7]: {
          date: day7,
          actions: [
            { id: 'act-7-1', type: 'paw_blue', userId: 'user1', label: 'His Paw Stamp', timestamp: Date.now() - 86400000 * 5 },
            { id: 'act-7-2', type: 'paw_yellow', userId: 'user2', label: 'Her Paw Stamp', timestamp: Date.now() - 86400000 * 5 }
          ],
          notes: []
        },
        [day8]: {
          date: day8,
          actions: [
            { id: 'act-8-1', type: 'paw_blue', userId: 'user1', label: 'His Paw Stamp', timestamp: Date.now() - 86400000 * 4 },
            { id: 'act-8-2', type: 'paw_yellow', userId: 'user2', label: 'Her Paw Stamp', timestamp: Date.now() - 86400000 * 4 },
            { id: 'act-8-3', type: 'food', userId: 'user2', label: 'Food', timestamp: Date.now() - 86400000 * 4 }
          ],
          notes: [{ id: 'n-8', userId: 'user2', authorName: 'Emma', content: 'Delicious BBQ feast together, so tasty and fun!', timestamp: Date.now() - 86400000 * 4 }]
        },
        [day12]: {
          date: day12,
          actions: [
            { id: 'act-12-1', type: 'flower', userId: 'user1', label: 'Tulip', timestamp: Date.now() }
          ],
          notes: [{ id: 'n-12', userId: 'user1', authorName: 'Alex', content: 'A wonderful blooming day, thank you for the sweet flowers 🌸', timestamp: Date.now() }]
        }
      },
      schedules: [
        {
          id: 'sch-1',
          userId: 'user1',
          dayOfWeek: 1, // Monday
          time: '09:00',
          title: 'Weekly Team Sync',
          category: 'work',
          note: 'Q4 milestones and product roadmap',
          completed: false
        },
        {
          id: 'sch-2',
          userId: 'user1',
          dayOfWeek: 3, // Wednesday
          time: '18:00',
          title: 'Pilates & Core Training',
          category: 'exercise',
          note: 'Downtown Yoga Studio',
          completed: false
        },
        {
          id: 'sch-3',
          userId: 'user1',
          dayOfWeek: 6, // Saturday
          time: '19:00',
          title: 'Romantic Dinner Date',
          category: 'date',
          note: 'Riverside Italian Bistro',
          completed: false
        },
        {
          id: 'sch-4',
          userId: 'user2',
          dayOfWeek: 1, // Monday
          time: '08:30',
          title: 'Tech Sprint Planning',
          category: 'work',
          note: 'Backlog refinement & scope',
          completed: true
        },
        {
          id: 'sch-5',
          userId: 'user2',
          dayOfWeek: 4, // Thursday
          time: '17:30',
          title: 'Gym & 5km Run',
          category: 'exercise',
          note: 'Cardio & treadmill',
          completed: false
        },
        {
          id: 'sch-6',
          userId: 'user2',
          dayOfWeek: 6, // Saturday
          time: '18:30',
          title: 'Pick up partner for dinner',
          category: 'date',
          note: 'Remember a cozy jacket',
          completed: false
        }
      ]
    };
    store.groups['DUO2026'] = defaultGroup;
    saveStore();
  }
}

function saveStore() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(store, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving store:', err);
  }
}

initStore();

// Track active WebSocket clients per group
interface ClientConnection {
  ws: WebSocket;
  groupCode: string;
  userId: 'user1' | 'user2';
}

const clients = new Set<ClientConnection>();

function broadcastToGroup(groupCode: string, payload: any, senderWs?: WebSocket) {
  const data = JSON.stringify(payload);
  clients.forEach((client) => {
    if (client.groupCode === groupCode && client.ws.readyState === WebSocket.OPEN) {
      if (client.ws !== senderWs) {
        client.ws.send(data);
      }
    }
  });
}

function broadcastToAllInGroup(groupCode: string, payload: any) {
  const data = JSON.stringify(payload);
  clients.forEach((client) => {
    if (client.groupCode === groupCode && client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(data);
    }
  });
}

// WebSocket connection handling
wss.on('connection', (ws: WebSocket) => {
  let currentConn: ClientConnection | null = null;

  ws.on('message', (message: string) => {
    try {
      const data = JSON.parse(message.toString());
      const { type, groupCode, userId } = data;

      if (type === 'join') {
        currentConn = { ws, groupCode, userId };
        clients.add(currentConn);

        // Send current full group data to the joining client
        const group = store.groups[groupCode];
        if (group) {
          ws.send(JSON.stringify({ type: 'init', group }));
          // Notify other client that partner is active
          broadcastToGroup(groupCode, { type: 'presence', userId, status: 'online' }, ws);
        }
        return;
      }

      if (!currentConn || !store.groups[currentConn.groupCode]) {
        return;
      }

      const group = store.groups[currentConn.groupCode];

      switch (type) {
        case 'chat:send': {
          const newMsg: Message = {
            id: 'msg-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
            senderId: data.senderId,
            text: data.text || '',
            imageUrl: data.imageUrl || undefined,
            audioUrl: data.audioUrl || undefined,
            audioDuration: data.audioDuration || undefined,
            replyTo: data.replyTo || undefined,
            timestamp: Date.now(),
            status: 'sent'
          };
          group.messages.push(newMsg);
          saveStore();
          // Broadcast message to both (or sender receives confirmation)
          broadcastToAllInGroup(currentConn.groupCode, {
            type: 'chat:received',
            message: newMsg
          });
          break;
        }

        case 'chat:read': {
          // Mark messages sent by the other user as read
          let updated = false;
          group.messages.forEach((msg) => {
            if (msg.senderId !== data.readerId && msg.status !== 'read') {
              msg.status = 'read';
              updated = true;
            }
          });
          if (updated) {
            saveStore();
            broadcastToAllInGroup(currentConn.groupCode, {
              type: 'chat:read_status',
              readerId: data.readerId
            });
          }
          break;
        }

        case 'chat:clear_all': {
          group.messages = [];
          saveStore();
          broadcastToAllInGroup(currentConn.groupCode, {
            type: 'chat:cleared'
          });
          break;
        }

        case 'calendar:save_day': {
          const { date, actions, notes } = data;
          const isCleared = (!actions || actions.length === 0) && (!notes || notes.length === 0);
          if (!group.calendar[date]) {
            group.calendar[date] = { date, actions: [], notes: [] };
          }
          group.calendar[date].actions = actions || [];
          if (notes) {
            group.calendar[date].notes = notes;
          }

          const actorId = (data.userId || currentConn.userId) as 'user1' | 'user2';
          const actorUser = group.users[actorId];
          const notif: AppNotification = {
            id: 'notif-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
            senderId: actorId,
            senderName: actorUser?.name || (actorId === 'user1' ? 'User 1' : 'User 2'),
            type: isCleared ? 'calendar_clear' : 'calendar_save',
            title: isCleared ? 'Calendar date cleared' : 'Calendar date updated',
            message: isCleared
              ? `${actorUser?.name || 'Partner'} cleared all stamps and notes for ${date}`
              : `${actorUser?.name || 'Partner'} updated stamps & notes for ${date}`,
            timestamp: Date.now(),
            read: false,
            dateKey: date
          };
          if (!group.notifications) group.notifications = [];
          group.notifications.unshift(notif);
          if (group.notifications.length > 50) group.notifications.pop();

          saveStore();
          broadcastToAllInGroup(currentConn.groupCode, {
            type: 'calendar:updated',
            date,
            dayData: group.calendar[date],
            notification: notif,
            notifications: group.notifications
          });
          break;
        }

        case 'calendar:add_action': {
          const { date, action, note } = data;
          if (!group.calendar[date]) {
            group.calendar[date] = { date, actions: [], notes: [] };
          }
          if (action) {
            group.calendar[date].actions.push(action);
          }
          if (note) {
            group.calendar[date].notes.push(note);
          }

          const actorId = (action?.userId || currentConn.userId) as 'user1' | 'user2';
          const actorUser = group.users[actorId];
          const notif: AppNotification = {
            id: 'notif-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
            senderId: actorId,
            senderName: actorUser?.name || (actorId === 'user1' ? 'User 1' : 'User 2'),
            type: 'calendar_save',
            title: 'Stamp added to calendar',
            message: `${actorUser?.name || 'Partner'} added a stamp "${action?.label || 'Stamp'}" for ${date}`,
            timestamp: Date.now(),
            read: false,
            dateKey: date
          };
          if (!group.notifications) group.notifications = [];
          group.notifications.unshift(notif);
          if (group.notifications.length > 50) group.notifications.pop();

          saveStore();
          broadcastToAllInGroup(currentConn.groupCode, {
            type: 'calendar:updated',
            date,
            dayData: group.calendar[date],
            notification: notif,
            notifications: group.notifications
          });
          break;
        }

        case 'profile:update': {
          const { targetUserId, profile } = data;
          if (targetUserId === 'user1' || targetUserId === 'user2') {
            const uid = targetUserId as 'user1' | 'user2';
            group.users[uid] = { ...group.users[uid], ...profile };

            const notif: AppNotification = {
              id: 'notif-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
              senderId: uid,
              senderName: group.users[uid]?.name || (uid === 'user1' ? 'User 1' : 'User 2'),
              type: 'profile_update',
              title: 'Profile updated',
              message: `${group.users[uid]?.name || 'Partner'} updated profile information`,
              timestamp: Date.now(),
              read: false
            };
            if (!group.notifications) group.notifications = [];
            group.notifications.unshift(notif);
            if (group.notifications.length > 50) group.notifications.pop();

            saveStore();
            broadcastToAllInGroup(currentConn.groupCode, {
              type: 'profile:updated',
              userId: uid,
              profile: group.users[uid],
              notification: notif,
              notifications: group.notifications
            });
          }
          break;
        }

        case 'group:update': {
          const { name, password, avatar } = data;
          if (name) group.name = name;
          if (password) group.password = password;
          if (avatar) group.avatar = avatar;
          saveStore();
          broadcastToAllInGroup(currentConn.groupCode, {
            type: 'group:updated',
            name: group.name,
            avatar: group.avatar
          });
          break;
        }

        case 'schedule:add': {
          const { schedule } = data;
          if (schedule) {
            group.schedules.push(schedule);
            const actorId = (schedule.userId || currentConn.userId) as 'user1' | 'user2';
            const actorUser = group.users[actorId];
            const notif: AppNotification = {
              id: 'notif-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
              senderId: actorId,
              senderName: actorUser?.name || 'Partner',
              type: 'schedule_add',
              title: 'New schedule added',
              message: `${actorUser?.name || 'Partner'} added "${schedule.title}" (${schedule.time})`,
              timestamp: Date.now(),
              read: false
            };
            if (!group.notifications) group.notifications = [];
            group.notifications.unshift(notif);
            if (group.notifications.length > 50) group.notifications.pop();

            saveStore();
            broadcastToAllInGroup(currentConn.groupCode, {
              type: 'schedule:updated',
              schedules: group.schedules,
              notification: notif,
              notifications: group.notifications
            });
          }
          break;
        }

        case 'schedule:update': {
          const { scheduleId, updates } = data;
          const idx = group.schedules.findIndex((s) => s.id === scheduleId);
          if (idx !== -1) {
            group.schedules[idx] = { ...group.schedules[idx], ...updates };
            const item = group.schedules[idx];
            const actorId = (item.userId || currentConn.userId) as 'user1' | 'user2';
            const actorUser = group.users[actorId];
            const notif: AppNotification = {
              id: 'notif-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
              senderId: actorId,
              senderName: actorUser?.name || 'Partner',
              type: 'schedule_update',
              title: 'Schedule updated',
              message: `${actorUser?.name || 'Partner'} ${updates.completed !== undefined ? (updates.completed ? 'completed' : 'uncompleted') : 'edited'} schedule "${item.title}"`,
              timestamp: Date.now(),
              read: false
            };
            if (!group.notifications) group.notifications = [];
            group.notifications.unshift(notif);
            if (group.notifications.length > 50) group.notifications.pop();

            saveStore();
            broadcastToAllInGroup(currentConn.groupCode, {
              type: 'schedule:updated',
              schedules: group.schedules,
              notification: notif,
              notifications: group.notifications
            });
          }
          break;
        }

        case 'schedule:delete': {
          const { scheduleId } = data;
          const deletedItem = group.schedules.find((s) => s.id === scheduleId);
          group.schedules = group.schedules.filter((s) => s.id !== scheduleId);
          const actorId = currentConn.userId as 'user1' | 'user2';
          const actorUser = group.users[actorId];
          const notif: AppNotification = {
            id: 'notif-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
            senderId: actorId,
            senderName: actorUser?.name || 'Partner',
            type: 'schedule_delete',
            title: 'Schedule deleted',
            message: `${actorUser?.name || 'Partner'} deleted schedule "${deletedItem?.title || 'an item'}"`,
            timestamp: Date.now(),
            read: false
          };
          if (!group.notifications) group.notifications = [];
          group.notifications.unshift(notif);
          if (group.notifications.length > 50) group.notifications.pop();

          saveStore();
          broadcastToAllInGroup(currentConn.groupCode, {
            type: 'schedule:updated',
            schedules: group.schedules,
            notification: notif,
            notifications: group.notifications
          });
          break;
        }

        case 'icon:upload': {
          const { icon } = data;
          if (icon && icon.url) {
            if (!group.customIcons) {
              group.customIcons = [];
            }
            group.customIcons.push(icon);
            const actorId = (icon.createdBy || currentConn.userId) as 'user1' | 'user2';
            const actorUser = group.users[actorId];
            const notif: AppNotification = {
              id: 'notif-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
              senderId: actorId,
              senderName: actorUser?.name || 'Partner',
              type: 'icon_upload',
              title: 'New stamp icon uploaded',
              message: `${actorUser?.name || 'Partner'} added custom stamp "${icon.name || 'Custom stamp'}"`,
              timestamp: Date.now(),
              read: false
            };
            if (!group.notifications) group.notifications = [];
            group.notifications.unshift(notif);
            if (group.notifications.length > 50) group.notifications.pop();

            saveStore();
            broadcastToAllInGroup(currentConn.groupCode, {
              type: 'icon:uploaded',
              icon,
              customIcons: group.customIcons,
              notification: notif,
              notifications: group.notifications
            });
          }
          break;
        }

        case 'icon:delete': {
          const { iconId } = data;
          if (group.customIcons) {
            group.customIcons = group.customIcons.filter((ic) => ic.id !== iconId);
            saveStore();
            broadcastToAllInGroup(currentConn.groupCode, {
              type: 'icon:deleted',
              iconId,
              customIcons: group.customIcons
            });
          }
          break;
        }

        case 'notifications:mark_all_read': {
          if (group.notifications) {
            group.notifications.forEach((n) => {
              n.read = true;
            });
            saveStore();
            broadcastToAllInGroup(currentConn.groupCode, {
              type: 'notifications:updated',
              notifications: group.notifications
            });
          }
          break;
        }

        case 'notifications:clear_all': {
          group.notifications = [];
          saveStore();
          broadcastToAllInGroup(currentConn.groupCode, {
            type: 'notifications:updated',
            notifications: []
          });
          break;
        }
      }
    } catch (err) {
      console.error('WebSocket message parsing error:', err);
    }
  });

  ws.on('close', () => {
    if (currentConn) {
      clients.delete(currentConn);
      broadcastToGroup(currentConn.groupCode, {
        type: 'presence',
        userId: currentConn.userId,
        status: 'offline'
      });
    }
  });
});

// REST API Endpoints
// Verify or create group
app.post('/api/groups/auth', (req, res) => {
  const { code, password } = req.body;
  const normalizedCode = (code || '').trim().toUpperCase();

  const group = store.groups[normalizedCode];
  if (!group) {
    return res.status(404).json({ error: 'Không tìm thấy nhóm với mã này' });
  }

  if (group.password && group.password !== password) {
    return res.status(401).json({ error: 'Mật khẩu nhóm không chính xác' });
  }

  res.json({ success: true, group });
});

app.post('/api/groups/create', (req, res) => {
  const { name, password, avatar, creatorName } = req.body;
  const code = 'DUO' + Math.floor(1000 + Math.random() * 9000);

  const newGroup: GroupData = {
    code,
    name: name || 'Không Gian Của Chúng Mình 💕',
    password: password || '123456',
    avatar: avatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=' + code,
    createdAt: Date.now(),
    users: {
      user1: {
        id: 'user1',
        name: creatorName || 'Anh ta',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        pawColor: 'blue',
        birthday: '2001-01-01',
        bio: 'Chào mừng bạn đến với DuoSpace! 🌟',
        homeAddress: 'TP. Hồ Chí Minh',
        workAddress: 'Văn phòng',
        email: 'user1@example.com',
        phone: '0900000001'
      },
      user2: {
        id: 'user2',
        name: 'Ả',
        avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
        pawColor: 'yellow',
        birthday: '2000-01-01',
        bio: 'Cùng nhau lưu giữ từng khoảnh khắc đáng yêu 💛',
        homeAddress: 'TP. Hồ Chí Minh',
        workAddress: 'Văn phòng',
        email: 'user2@example.com',
        phone: '0900000002'
      }
    },
    messages: [
      {
        id: 'msg-welcome',
        senderId: 'user1',
        text: 'Chào mừng cả hai đã cùng tham gia nhóm! Chúc chúng mình có những kỷ niệm thật vui nhé 🐾✨',
        timestamp: Date.now(),
        status: 'read'
      }
    ],
    calendar: {},
    schedules: []
  };

  store.groups[code] = newGroup;
  saveStore();

  res.json({ success: true, group: newGroup });
});

app.get('/api/groups/:code', (req, res) => {
  const group = store.groups[req.params.code.toUpperCase()];
  if (!group) {
    return res.status(404).json({ error: 'Nhóm không tồn tại' });
  }
  res.json(group);
});

app.post('/api/groups/:code/messages/clear', (req, res) => {
  const code = (req.params.code || '').toUpperCase();
  const group = store.groups[code];
  if (!group) {
    return res.status(404).json({ error: 'Nhóm không tồn tại' });
  }
  group.messages = [];
  saveStore();
  broadcastToAllInGroup(code, {
    type: 'chat:cleared'
  });
  res.json({ success: true, message: 'Đã xóa tất cả tin nhắn' });
});

// Dev and Production handling
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`DuoSpace server running on port ${PORT}`);
  });
}

startServer();
