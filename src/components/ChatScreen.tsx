import React, { useState, useRef, useEffect } from 'react';
import { GroupData, UserId, Message, MessageReplyInfo } from '../types';
import { Send, Check, CheckCheck, Smile, Heart, Sparkles, Camera, X, ZoomIn, Download, Mic, Reply, Trash2 } from 'lucide-react';
import { CameraCaptureModal } from './CameraCaptureModal';
import { VoiceRecorderBar } from './VoiceRecorderBar';
import { AudioMessagePlayer } from './AudioMessagePlayer';

interface ChatScreenProps {
  group: GroupData;
  currentUserId: UserId;
  onSendMessage: (text: string, imageUrl?: string, audioUrl?: string, audioDuration?: number, replyTo?: MessageReplyInfo) => void;
  onMarkRead: () => void;
  onClearAllMessages: () => void;
  partnerOnline: boolean;
}

export const ChatScreen: React.FC<ChatScreenProps> = ({
  group,
  currentUserId,
  onSendMessage,
  onMarkRead,
  onClearAllMessages,
  partnerOnline
}) => {
  const [inputText, setInputText] = useState('');
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [zoomImageUrl, setZoomImageUrl] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<MessageReplyInfo | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement | null>(null);
  const textInputRef = useRef<HTMLInputElement | null>(null);

  const currentUser = group.users[currentUserId];
  const partnerId: UserId = currentUserId === 'user1' ? 'user2' : 'user1';
  const partnerUser = group.users[partnerId];

  // Auto scroll only the internal chat container to bottom
  const scrollToBottom = (smooth = true) => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: smooth ? 'smooth' : 'auto'
      });
    }
  };

  useEffect(() => {
    scrollToBottom(false);
    // Mark partner's messages as read
    onMarkRead();
  }, [group.messages.length, onMarkRead]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText, undefined, undefined, undefined, replyingTo || undefined);
    setInputText('');
    setReplyingTo(null);
  };

  const handleSendQuick = (text: string) => {
    onSendMessage(text, undefined, undefined, undefined, replyingTo || undefined);
    setReplyingTo(null);
  };

  const handleStartReply = (msg: Message, senderName: string) => {
    setReplyingTo({
      id: msg.id,
      senderId: msg.senderId,
      senderName,
      text: msg.text,
      imageUrl: msg.imageUrl,
      audioUrl: msg.audioUrl
    });
    setTimeout(() => {
      textInputRef.current?.focus();
    }, 50);
  };

  const scrollToMessage = (msgId?: string) => {
    if (!msgId || !chatContainerRef.current) return;
    const el = document.getElementById(`msg-${msgId}`);
    if (el) {
      const container = chatContainerRef.current;
      const elOffset = el.offsetTop - container.offsetTop;
      container.scrollTo({
        top: Math.max(0, elOffset - 25),
        behavior: 'smooth'
      });
      el.classList.add('ring-2', 'ring-amber-400', 'shadow-lg');
      setTimeout(() => {
        el.classList.remove('ring-2', 'ring-amber-400', 'shadow-lg');
      }, 1600);
    }
  };

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  };

  return (
    <div className="relative w-full h-full min-h-0 flex-1 bg-[#192b49] flex items-center justify-center p-2 sm:p-3 lg:p-4 overflow-hidden overscroll-none select-none lg:select-auto">
      {/* Background illustrated art matching Image 1 */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <img
          src="/src/assets/images/cat_bar_scene_1791796094259.jpg"
          alt="Cat Bar Background"
          className="w-full h-full object-cover opacity-80 filter brightness-95"
          onError={(e) => {
            (e.currentTarget as HTMLElement).style.display = 'none';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#172642]/60 via-transparent to-[#101b2f]/80 pointer-events-none" />
      </div>

      {/* Main Container: Split 2 columns on desktop matching Image 1 */}
      <div className="relative z-10 w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-3 lg:gap-5 items-stretch h-full max-h-full min-h-0">
        {/* Left Column: Cozy Bar Scene Ambience & Cat Bartender card */}
        <div className="hidden lg:flex lg:col-span-5 flex-col justify-between p-5 lg:p-6 rounded-3xl bg-slate-950/30 backdrop-blur-xs border border-white/10 text-white shadow-2xl h-full min-h-0 overflow-hidden">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-400/20 border border-amber-300/30 text-amber-200 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Cozy Cat Bar Lounge</span>
            </div>
            <h1 className="text-3xl font-extrabold font-['Quicksand'] text-white drop-shadow-md">
              {group.name}
            </h1>
            <p className="text-sm text-blue-100/80 leading-relaxed">
              Real-time private space for {group.users.user1.name} & {group.users.user2.name}. Messages, photos, and seen indicators synchronize instantly.
            </p>
          </div>

          {/* Quick couple mood pills */}
          <div className="space-y-3 pt-6 border-t border-white/10">
            <div className="flex items-center justify-between text-xs text-blue-200">
              <span className="flex items-center gap-1.5">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    partnerOnline ? 'bg-emerald-400 shadow-sm shadow-emerald-400/80' : 'bg-slate-400'
                  }`}
                />
                {partnerUser.name} {partnerOnline ? 'is online' : 'visited recently'}
              </span>
              <span className="font-mono text-amber-300">Code: {group.code}</span>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              <button
                onClick={() => handleSendQuick('Miss you so much! ❤️')}
                className="px-3 py-1.5 text-xs rounded-xl bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/15 transition-all hover:scale-105 cursor-pointer"
              >
                Miss you so much! ❤️
              </button>
              <button
                onClick={() => handleSendQuick('How was your day? ☕')}
                className="px-3 py-1.5 text-xs rounded-xl bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/15 transition-all hover:scale-105 cursor-pointer"
              >
                How was your day? ☕
              </button>
              <button
                onClick={() => handleSendQuick("Let's grab tasty dinner! 🍱")}
                className="px-3 py-1.5 text-xs rounded-xl bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/15 transition-all hover:scale-105 cursor-pointer"
              >
                Let's grab tasty dinner! 🍱
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Cozy Cream Chat Notebook Card matching Image 1 */}
        <div className="lg:col-span-7 flex flex-col bg-[#faeed8] rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl border-4 border-[#e8d5b8] overflow-hidden h-full min-h-0 text-slate-800">
          {/* Chat Header */}
          <div className="px-5 sm:px-6 py-3 sm:py-4 border-b border-[#ebd7be] bg-[#fdf6e9] flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="relative">
                <img
                  src={partnerUser.avatar}
                  alt={partnerUser.name}
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-amber-500 shadow-sm"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src =
                      'https://api.dicebear.com/7.x/bottts/svg?seed=' + partnerId;
                  }}
                />
                <span
                  className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#faeed8] ${
                    partnerOnline ? 'bg-emerald-500' : 'bg-slate-400'
                  }`}
                  title={partnerOnline ? 'Online' : 'Offline'}
                />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base leading-tight font-['Quicksand']">
                  {partnerUser.name}
                </h3>
                <span className="text-xs text-amber-800/70 font-medium">
                  {partnerOnline ? 'Active in room' : 'Seen messages'}
                </span>
              </div>
            </div>

            {/* Clear All Messages Button */}
            <button
              type="button"
              onClick={() => setShowClearConfirm(true)}
              disabled={group.messages.length === 0}
              title={group.messages.length === 0 ? 'No messages to clear' : 'Clear all messages'}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-150 ${
                group.messages.length === 0
                  ? 'bg-[#ebd7be]/50 text-[#a38b6d] border border-[#ebd7be] cursor-not-allowed opacity-60'
                  : 'bg-rose-100 hover:bg-rose-200 text-rose-700 active:scale-95 border border-rose-300/80 shadow-xs hover:shadow cursor-pointer'
              }`}
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Chat</span>
            </button>
          </div>

          {/* Messages Stream with chatContainerRef */}
          <div
            ref={chatContainerRef}
            className="flex-1 p-3 sm:p-5 overflow-y-auto overscroll-contain space-y-3.5 min-h-0 select-text"
          >
            {group.messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-amber-800/60">
                <span className="text-3xl mb-2">💌</span>
                <p className="text-sm font-medium">No messages yet.</p>
                <p className="text-xs">Send your first sweet message to each other!</p>
              </div>
            ) : (
              group.messages.map((msg) => {
                const isMe = msg.senderId === currentUserId;
                const senderProfile = group.users[msg.senderId];

                return (
                  <div
                    key={msg.id}
                    id={`msg-${msg.id}`}
                    className={`flex items-end gap-2 transition-all p-1 rounded-2xl ${
                      isMe ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {/* Partner avatar */}
                    {!isMe && (
                      <img
                        src={senderProfile.avatar}
                        alt={senderProfile.name}
                        className="w-7 h-7 rounded-full object-cover shrink-0 mb-1 ring-1 ring-amber-400"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src =
                            'https://api.dicebear.com/7.x/bottts/svg?seed=' + msg.senderId;
                        }}
                      />
                    )}

                    <div
                      className={`max-w-[85%] sm:max-w-[78%] flex flex-col ${
                        isMe ? 'items-end' : 'items-start'
                      }`}
                    >
                      {/* Replied Message Quote Block */}
                      {msg.replyTo && (() => {
                        const isReplyBlue =
                          group.users[msg.replyTo.senderId]?.pawColor === 'blue' ||
                          msg.replyTo.senderId === 'user1';

                        return (
                          <div
                            className={`w-fit max-w-full mb-1 ${
                              isMe ? 'self-end mr-0.5' : 'self-start ml-0.5'
                            }`}
                          >
                            <div
                              onClick={() => scrollToMessage(msg.replyTo?.id)}
                              title="Click to jump to original message"
                              className={`px-3 py-1.5 rounded-xl text-xs transition-all cursor-pointer border-l-[3px] select-none shadow-xs ${
                                isReplyBlue
                                  ? 'bg-blue-100/90 border-blue-600 hover:bg-blue-200/90'
                                  : 'bg-amber-100/90 border-amber-600 hover:bg-amber-200/90'
                              }`}
                            >
                              <div
                                className={`flex items-center gap-1 font-bold text-[11px] mb-0.5 ${
                                  isReplyBlue ? 'text-blue-900' : 'text-[#7c2d12]'
                                }`}
                              >
                                <Reply
                                  className={`w-3 h-3 shrink-0 ${
                                    isReplyBlue ? 'text-blue-700' : 'text-[#9a3412]'
                                  }`}
                                />
                                <span>
                                  {msg.replyTo.senderId === currentUserId ? 'You' : msg.replyTo.senderName}
                                </span>
                              </div>
                              {msg.replyTo.text && (
                                <p
                                  className={`line-clamp-2 text-[11px] leading-tight font-medium ${
                                    isReplyBlue ? 'text-blue-950' : 'text-[#9a3412]'
                                  }`}
                                >
                                  {msg.replyTo.text}
                                </p>
                              )}
                              {msg.replyTo.imageUrl && (
                                <div
                                  className={`flex items-center gap-1.5 text-[11px] font-medium ${
                                    isReplyBlue ? 'text-blue-950' : 'text-[#9a3412]'
                                  }`}
                                >
                                  <img
                                    src={msg.replyTo.imageUrl}
                                    alt="Quoted Photo"
                                    className="w-5 h-5 object-cover rounded shrink-0 border border-black/10"
                                  />
                                  <span>📷 Photo {msg.replyTo.text ? `- ${msg.replyTo.text}` : ''}</span>
                                </div>
                              )}
                              {msg.replyTo.audioUrl && (
                                <div
                                  className={`flex items-center gap-1 text-[11px] font-medium ${
                                    isReplyBlue ? 'text-blue-950' : 'text-[#9a3412]'
                                  }`}
                                >
                                  <span>🎙️ Voice note</span>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })()}

                      {/* Main Bubble Row */}
                      <div
                        className={`flex items-center gap-1.5 w-full ${
                          isMe ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        {/* Reply Button on Left for sender */}
                        {isMe && (
                          <button
                            type="button"
                            onClick={() => handleStartReply(msg, senderProfile.name)}
                            title="Reply to message"
                            className="p-1.5 rounded-full text-slate-400 hover:text-amber-400 hover:bg-white/10 transition-all cursor-pointer shrink-0 opacity-70 hover:opacity-100 hover:scale-110"
                          >
                            <Reply className="w-4 h-4" />
                            <span className="sr-only">Reply</span>
                          </button>
                        )}

                        {/* Bubble Content */}
                        <div
                          className={`flex flex-col max-w-full ${
                            isMe ? 'items-end' : 'items-start'
                          }`}
                        >
                          {/* Attached Photo */}
                          {msg.imageUrl && (
                            <div
                              onClick={() => setZoomImageUrl(msg.imageUrl || null)}
                              className="overflow-hidden rounded-2xl cursor-pointer group/img relative shadow-md border-2 border-white/70 hover:opacity-95 transition-all max-w-[280px] sm:max-w-[340px]"
                            >
                              <img
                                src={msg.imageUrl}
                                alt="Camera capture"
                                className="w-full h-auto max-h-[260px] object-cover transition-transform duration-300 group-hover/img:scale-105"
                              />
                              <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/15 transition-colors flex items-center justify-center opacity-0 group-hover/img:opacity-100">
                                <span className="px-2.5 py-1 rounded-full bg-black/60 text-white text-[11px] font-medium flex items-center gap-1 backdrop-blur-xs">
                                  <ZoomIn className="w-3.5 h-3.5" /> Zoom
                                </span>
                              </div>
                            </div>
                          )}

                          {/* Attached Audio */}
                          {msg.audioUrl && (
                            <div className={msg.imageUrl ? 'mt-1.5' : ''}>
                              <AudioMessagePlayer
                                audioUrl={msg.audioUrl}
                                duration={msg.audioDuration}
                                isMe={isMe}
                              />
                            </div>
                          )}

                          {/* Main Text Bubble */}
                          {msg.text && (
                            <div
                              className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-xs transition-all ${
                                msg.imageUrl || msg.audioUrl ? 'mt-1.5' : ''
                              } ${
                                isMe
                                  ? 'bg-[#29528d] text-white rounded-br-xs'
                                  : 'bg-white text-slate-800 rounded-bl-xs border border-[#e4d2b7]'
                              }`}
                            >
                              {msg.text}
                            </div>
                          )}
                        </div>

                        {/* Reply Button on Right for receiver */}
                        {!isMe && (
                          <button
                            type="button"
                            onClick={() => handleStartReply(msg, senderProfile.name)}
                            title="Reply to message"
                            className="p-1.5 rounded-full text-slate-400 hover:text-amber-600 hover:bg-amber-100/60 transition-all cursor-pointer shrink-0 opacity-70 hover:opacity-100 hover:scale-110"
                          >
                            <Reply className="w-4 h-4" />
                            <span className="sr-only">Reply</span>
                          </button>
                        )}
                      </div>

                      {/* Timestamp & Status */}
                      <div className="flex items-center gap-1.5 mt-1 text-[11px] text-amber-900/60 px-1 font-medium">
                        <span>{formatTime(msg.timestamp)}</span>
                        {isMe && (
                          <span className="inline-flex items-center gap-0.5">
                            {msg.status === 'read' ? (
                              <span className="text-emerald-700 font-semibold flex items-center gap-0.5">
                                <CheckCheck className="w-3.5 h-3.5" />
                                <span>Seen</span>
                              </span>
                            ) : msg.status === 'delivered' ? (
                              <span className="text-amber-800 flex items-center gap-0.5">
                                <CheckCheck className="w-3.5 h-3.5" />
                                <span>Delivered</span>
                              </span>
                            ) : (
                              <span className="text-slate-500 flex items-center gap-0.5">
                                <Check className="w-3.5 h-3.5" />
                                <span>Sent</span>
                              </span>
                            )}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Sender Avatar on the right */}
                    {isMe && (
                      <img
                        src={currentUser.avatar}
                        alt={currentUser.name}
                        className="w-7 h-7 rounded-full object-cover shrink-0 mb-1 ring-1 ring-blue-500"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src =
                            'https://api.dicebear.com/7.x/bottts/svg?seed=' + currentUserId;
                        }}
                      />
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Replying Banner above Input Bar */}
          {replyingTo && (
            <div className="px-4 py-2 bg-[#f4e2c8] border-t border-[#ebd0ad] flex items-center justify-between text-xs text-amber-950 transition-all animate-in fade-in">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <div className="p-1.5 rounded-full bg-amber-400/30 text-amber-900 shrink-0">
                  <Reply className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-[11px] text-amber-900 flex items-center gap-1">
                    <span>Replying to {replyingTo.senderId === currentUserId ? 'yourself' : replyingTo.senderName}:</span>
                  </div>
                  <div className="truncate text-slate-800 text-[11px]">
                    {replyingTo.text ? (
                      <span>"{replyingTo.text}"</span>
                    ) : replyingTo.imageUrl ? (
                      <span>📷 [Photo]</span>
                    ) : replyingTo.audioUrl ? (
                      <span>🎙️ [Voice note]</span>
                    ) : (
                      <span>Message</span>
                    )}
                  </div>
                </div>
                {replyingTo.imageUrl && (
                  <img
                    src={replyingTo.imageUrl}
                    alt="Thumbnail"
                    className="w-8 h-8 rounded-lg object-cover border border-amber-300 shrink-0"
                  />
                )}
              </div>
              <button
                type="button"
                onClick={() => setReplyingTo(null)}
                className="p-1.5 rounded-full hover:bg-black/10 text-amber-900 hover:text-amber-950 transition-colors ml-2 cursor-pointer shrink-0"
                title="Cancel reply"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Input Bar or Voice Recorder Bar */}
          <div className="p-4 bg-[#fbf3e4] border-t border-[#ebd7be]">
            {isRecordingVoice ? (
              <VoiceRecorderBar
                onSendAudio={(audioUrl, duration) => {
                  onSendMessage('', undefined, audioUrl, duration, replyingTo || undefined);
                  setReplyingTo(null);
                  setIsRecordingVoice(false);
                }}
                onCancel={() => setIsRecordingVoice(false)}
                partnerName={partnerUser.name}
              />
            ) : (
              <form onSubmit={handleSubmit} className="flex items-center gap-2">
                {/* Heart Quick Button */}
                <button
                  type="button"
                  onClick={() => handleSendQuick('❤️')}
                  title="Send heart"
                  className="p-2.5 rounded-2xl text-rose-500 hover:bg-rose-100/60 transition-colors cursor-pointer shrink-0"
                >
                  <Heart className="w-5 h-5 fill-rose-500" />
                </button>

                {/* Camera Icon Button beside Heart Button */}
                <button
                  type="button"
                  onClick={() => setIsCameraOpen(true)}
                  title="Take photo from camera"
                  className="p-2.5 rounded-2xl text-amber-800 hover:text-amber-950 hover:bg-amber-100/80 transition-all cursor-pointer relative group shrink-0"
                >
                  <Camera className="w-5 h-5 transition-transform group-hover:scale-110" />
                  <span className="sr-only">Take photo</span>
                </button>

                <input
                  ref={textInputRef}
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={`Message ${partnerUser.name}...`}
                  className="flex-1 px-4 py-2.5 rounded-2xl bg-white border border-[#dec9ab] text-slate-900 placeholder:text-amber-900/40 text-sm focus:outline-none focus:border-amber-600 shadow-inner min-w-0"
                />

                {/* Mic Icon Button beside Send Button */}
                <button
                  type="button"
                  onClick={() => setIsRecordingVoice(true)}
                  title="Record voice message"
                  className="p-2.5 rounded-2xl text-amber-800 hover:text-amber-950 hover:bg-amber-100/80 transition-all cursor-pointer shrink-0"
                >
                  <Mic className="w-5 h-5" />
                  <span className="sr-only">Voice note</span>
                </button>

                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  className={`p-2.5 rounded-2xl transition-all cursor-pointer shrink-0 ${
                    inputText.trim()
                      ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold shadow-md shadow-amber-500/30'
                      : 'bg-amber-200/60 text-amber-800/50 cursor-not-allowed'
                  }`}
                >
                  <Send className="w-5 h-5" />
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Camera Capture Modal */}
      <CameraCaptureModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        partnerName={partnerUser.name}
        onSendPhoto={(photoUrl, caption) => {
          onSendMessage(caption || '', photoUrl, undefined, undefined, replyingTo || undefined);
          setReplyingTo(null);
        }}
      />

      {/* Lightbox Zoom Modal for Chat Photos */}
      {zoomImageUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setZoomImageUrl(null)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute -top-12 right-0 flex items-center gap-2">
              <a
                href={zoomImageUrl}
                download="duospace_moment.jpg"
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
                title="Download photo"
              >
                <Download className="w-5 h-5" />
              </a>
              <button
                onClick={() => setZoomImageUrl(null)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <img
              src={zoomImageUrl}
              alt="Zoomed moment"
              className="max-h-[85vh] max-w-full rounded-2xl object-contain shadow-2xl border border-white/20"
            />
          </div>
        </div>
      )}

      {/* Clear All Messages Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-[#fffaf2] rounded-3xl p-6 shadow-2xl border-2 border-[#ebd7be] text-slate-800 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold font-['Quicksand'] text-slate-900 leading-tight">
                  Clear all messages?
                </h3>
                <p className="text-xs text-rose-600 font-medium">
                  This action cannot be undone
                </p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              All messages, photos, and voice notes between you two will be removed from the chat history.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowClearConfirm(false)}
                className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onClearAllMessages();
                  setShowClearConfirm(false);
                }}
                className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-md shadow-rose-600/30 transition-all active:scale-95 cursor-pointer"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
