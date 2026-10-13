import { useEffect, useRef, useState, useCallback } from 'react';
import { GroupData, UserId, Message, MessageReplyInfo, CalendarAction, CalendarNote, ScheduleItem, UserProfile, CustomIcon } from '../types';

interface UseDuoSocketProps {
  groupCode: string | null;
  currentUserId: UserId;
}

export function useDuoSocket({ groupCode, currentUserId }: UseDuoSocketProps) {
  const [group, setGroup] = useState<GroupData | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [partnerOnline, setPartnerOnline] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<any>(null);

  // Connect WebSocket
  const connectWs = useCallback(() => {
    if (!groupCode) return;

    if (wsRef.current && (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING)) {
      return;
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}`;

    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        setError(null);
        // Join group
        ws.send(JSON.stringify({
          type: 'join',
          groupCode,
          userId: currentUserId
        }));
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          switch (data.type) {
            case 'init':
              setGroup(data.group);
              setLoading(false);
              break;

            case 'presence':
              if (data.userId !== currentUserId) {
                setPartnerOnline(data.status === 'online');
              }
              break;

            case 'chat:received':
              setGroup((prev) => {
                if (!prev) return prev;
                // Idempotent: Avoid duplicate message ID
                if (prev.messages.some((m) => m.id === data.message.id)) {
                  return prev;
                }
                return {
                  ...prev,
                  messages: [...prev.messages, data.message]
                };
              });
              break;

            case 'chat:read_status':
              setGroup((prev) => {
                if (!prev) return prev;
                return {
                  ...prev,
                  messages: prev.messages.map((m) =>
                    m.senderId !== data.readerId ? { ...m, status: 'read' as const } : m
                  )
                };
              });
              break;

            case 'chat:cleared':
              setGroup((prev) => {
                if (!prev) return prev;
                return {
                  ...prev,
                  messages: []
                };
              });
              break;

            case 'calendar:updated':
              setGroup((prev) => {
                if (!prev) return prev;
                return {
                  ...prev,
                  calendar: {
                    ...prev.calendar,
                    [data.date]: data.dayData
                  },
                  notifications: data.notifications || prev.notifications
                };
              });
              break;

            case 'profile:updated':
              setGroup((prev) => {
                if (!prev) return prev;
                return {
                  ...prev,
                  users: {
                    ...prev.users,
                    [data.userId]: data.profile
                  },
                  notifications: data.notifications || prev.notifications
                };
              });
              break;

            case 'group:updated':
              setGroup((prev) => {
                if (!prev) return prev;
                return {
                  ...prev,
                  name: data.name || prev.name,
                  avatar: data.avatar || prev.avatar
                };
              });
              break;

            case 'schedule:updated':
              setGroup((prev) => {
                if (!prev) return prev;
                return {
                  ...prev,
                  schedules: data.schedules,
                  notifications: data.notifications || prev.notifications
                };
              });
              break;

            case 'icon:uploaded':
              setGroup((prev) => {
                if (!prev) return prev;
                const existing = prev.customIcons || [];
                const updatedIcons = existing.some((i) => i.id === data.icon.id) ? existing : [...existing, data.icon];
                return {
                  ...prev,
                  customIcons: updatedIcons,
                  notifications: data.notifications || prev.notifications
                };
              });
              break;

            case 'icon:deleted':
              setGroup((prev) => {
                if (!prev) return prev;
                return {
                  ...prev,
                  customIcons: (prev.customIcons || []).filter((i) => i.id !== data.iconId)
                };
              });
              break;

            case 'notifications:updated':
              setGroup((prev) => {
                if (!prev) return prev;
                return {
                  ...prev,
                  notifications: data.notifications || []
                };
              });
              break;
          }
        } catch (e) {
          console.error('WS parse message error:', e);
        }
      };

      ws.onerror = (e) => {
        console.warn('WS connection error, will retry...', e);
      };

      ws.onclose = () => {
        setIsConnected(false);
        wsRef.current = null;
        // Schedule auto reconnect
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = setTimeout(() => {
          connectWs();
        }, 3000);
      };
    } catch (err) {
      console.error('WS initialization error:', err);
    }
  }, [groupCode, currentUserId]);

  // Initial fetch via REST API
  const fetchGroupInitial = useCallback(async (code: string) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/groups/${code}`);
      if (!res.ok) {
        throw new Error('Không thể tải dữ liệu nhóm');
      }
      const data = await res.json();
      setGroup(data);
      setError(null);
    } catch (e: any) {
      setError(e.message || 'Lỗi kết nối nhóm');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (groupCode) {
      fetchGroupInitial(groupCode);
      connectWs();
    }
    return () => {
      clearTimeout(reconnectTimeoutRef.current);
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [groupCode, fetchGroupInitial, connectWs]);

  // Safe send over WebSocket
  const sendWs = useCallback((payload: any) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(payload));
    }
  }, []);

  // Action methods
  const sendMessage = useCallback((
    text?: string,
    imageUrl?: string,
    audioUrl?: string,
    audioDuration?: number,
    replyTo?: MessageReplyInfo
  ) => {
    const cleanText = (text || '').trim();
    if ((!cleanText && !imageUrl && !audioUrl) || !groupCode) return;
    sendWs({
      type: 'chat:send',
      groupCode,
      senderId: currentUserId,
      text: cleanText,
      imageUrl,
      audioUrl,
      audioDuration,
      replyTo
    });
  }, [groupCode, currentUserId, sendWs]);

  const markMessagesAsRead = useCallback(() => {
    if (!groupCode) return;
    sendWs({
      type: 'chat:read',
      groupCode,
      readerId: currentUserId
    });
  }, [groupCode, currentUserId, sendWs]);

  const clearAllMessages = useCallback(() => {
    if (!groupCode) return;
    setGroup((prev) => (prev ? { ...prev, messages: [] } : prev));
    sendWs({
      type: 'chat:clear_all',
      groupCode
    });
    fetch(`/api/groups/${groupCode}/messages/clear`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }).catch((err) => console.error('Error clearing messages via REST:', err));
  }, [groupCode, sendWs]);

  const saveCalendarDay = useCallback((date: string, actions: CalendarAction[], notes: CalendarNote[]) => {
    if (!groupCode) return;
    sendWs({
      type: 'calendar:save_day',
      groupCode,
      userId: currentUserId,
      date,
      actions,
      notes
    });
  }, [groupCode, currentUserId, sendWs]);

  const updateProfile = useCallback((targetUserId: UserId, profile: Partial<UserProfile>) => {
    if (!groupCode) return;
    sendWs({
      type: 'profile:update',
      groupCode,
      targetUserId,
      profile
    });
  }, [groupCode, sendWs]);

  const updateGroup = useCallback((data: { name?: string; password?: string; avatar?: string }) => {
    if (!groupCode) return;
    sendWs({
      type: 'group:update',
      groupCode,
      ...data
    });
  }, [groupCode, sendWs]);

  const addSchedule = useCallback((schedule: ScheduleItem) => {
    if (!groupCode) return;
    sendWs({
      type: 'schedule:add',
      groupCode,
      schedule
    });
  }, [groupCode, sendWs]);

  const updateSchedule = useCallback((scheduleId: string, updates: Partial<ScheduleItem>) => {
    if (!groupCode) return;
    sendWs({
      type: 'schedule:update',
      groupCode,
      scheduleId,
      updates
    });
  }, [groupCode, sendWs]);

  const deleteSchedule = useCallback((scheduleId: string) => {
    if (!groupCode) return;
    sendWs({
      type: 'schedule:delete',
      groupCode,
      scheduleId
    });
  }, [groupCode, sendWs]);

  const uploadIcon = useCallback((icon: CustomIcon) => {
    if (!groupCode) return;
    sendWs({
      type: 'icon:upload',
      groupCode,
      icon
    });
  }, [groupCode, sendWs]);

  const deleteIcon = useCallback((iconId: string) => {
    if (!groupCode) return;
    sendWs({
      type: 'icon:delete',
      groupCode,
      iconId
    });
  }, [groupCode, sendWs]);

  const markNotificationsAsRead = useCallback(() => {
    if (!groupCode) return;
    setGroup((prev) => {
      if (!prev || !prev.notifications) return prev;
      return {
        ...prev,
        notifications: prev.notifications.map((n) => ({ ...n, read: true }))
      };
    });
    sendWs({
      type: 'notifications:mark_all_read',
      groupCode
    });
  }, [groupCode, sendWs]);

  const clearNotifications = useCallback(() => {
    if (!groupCode) return;
    setGroup((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        notifications: []
      };
    });
    sendWs({
      type: 'notifications:clear_all',
      groupCode
    });
  }, [groupCode, sendWs]);

  return {
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
    clearNotifications,
    refetch: () => groupCode && fetchGroupInitial(groupCode)
  };
}
