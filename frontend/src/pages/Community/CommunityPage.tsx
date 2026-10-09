import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { communityApi, CommunityMessage } from '../../services/communityApi';

export const CommunityPage: React.FC = () => {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [messages, setMessages] = useState<CommunityMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'syncing' | 'offline'>('syncing');
  const [isScrolledToBottom, setIsScrolledToBottom] = useState(true);
  const [hasNewMessagesWhileScrolled, setHasNewMessagesWhileScrolled] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Redirect unauthenticated customers to /login
  useEffect(() => {
    if (!authLoading && (!isAuthenticated || !user)) {
      navigate('/login', { state: { from: { pathname: '/community' } }, replace: true });
    }
  }, [authLoading, isAuthenticated, user, navigate]);

  // Scroll to bottom helper
  const scrollToBottom = useCallback((smooth = true) => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
      setHasNewMessagesWhileScrolled(false);
    }
  }, []);

  // Monitor scroll position
  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 60;
    setIsScrolledToBottom(isAtBottom);
    if (isAtBottom) {
      setHasNewMessagesWhileScrolled(false);
    }
  };

  // Fetch messages from InsForge database
  const loadMessages = useCallback(async (isInitial = false) => {
    try {
      if (isInitial) setLoading(true);
      const data = await communityApi.getMessages();
      setMessages(data);
      setError(null);
      setConnectionStatus('connected');

      if (isInitial) {
        setTimeout(() => scrollToBottom(false), 80);
      } else if (isScrolledToBottom) {
        setTimeout(() => scrollToBottom(true), 80);
      }
    } catch (err: any) {
      console.error('Failed to load community messages:', err);
      if (isInitial) {
        setError(err.message || 'Failed to connect to community chat.');
      }
      setConnectionStatus('offline');
    } finally {
      if (isInitial) setLoading(false);
    }
  }, [isScrolledToBottom, scrollToBottom]);

  // Initial load and Realtime + Polling sync
  useEffect(() => {
    if (!user) return;

    loadMessages(true);

    // 1. Subscribe to InsForge realtime
    const unsubscribe = communityApi.subscribe(
      (newMsg) => {
        setMessages((prev) => {
          if (prev.some((m) => m.id === newMsg.id)) return prev;
          return [...prev, newMsg];
        });
        if (isScrolledToBottom) {
          setTimeout(() => scrollToBottom(true), 80);
        } else {
          setHasNewMessagesWhileScrolled(true);
        }
      },
      (deletedId) => {
        setMessages((prev) => prev.filter((m) => m.id !== deletedId));
      }
    );

    // 2. Heartbeat polling every 4 seconds to guarantee sync
    const interval = setInterval(() => {
      loadMessages(false);
    }, 4000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, [user, loadMessages, isScrolledToBottom, scrollToBottom]);

  // Handle Send Message
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || sending || !user?.id) return;

    const textToSend = inputText.trim();
    setInputText('');

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    // Create optimistic message entry
    const tempId = `temp-${Date.now()}`;
    const optimisticMsg: CommunityMessage = {
      id: tempId,
      user_id: user.id,
      message: textToSend,
      created_at: new Date().toISOString(),
      user: {
        id: user.id,
        name: user.name || 'You',
        avatar_url: user.avatar || null,
        role: user.role,
      },
      status: 'sending',
    };

    setMessages((prev) => [...prev, optimisticMsg]);
    setSending(true);
    setTimeout(() => scrollToBottom(true), 40);

    try {
      const savedMsg = await communityApi.sendMessage(textToSend, user.id);
      // Replace optimistic message with actual database message
      setMessages((prev) =>
        prev.map((m) => (m.id === tempId ? { ...savedMsg, status: 'sent' } : m))
      );
      setConnectionStatus('connected');
    } catch (err: any) {
      console.error('Failed to send community message:', err);
      // Mark optimistic message as failed
      setMessages((prev) =>
        prev.map((m) =>
          m.id === tempId
            ? { ...m, status: 'failed', error: err.message || 'Send failed' }
            : m
        )
      );
    } finally {
      setSending(false);
    }
  };

  // Retry sending a failed message
  const handleRetry = async (failedMsg: CommunityMessage) => {
    if (!user?.id) return;
    setMessages((prev) =>
      prev.map((m) => (m.id === failedMsg.id ? { ...m, status: 'sending', error: undefined } : m))
    );

    try {
      const savedMsg = await communityApi.sendMessage(failedMsg.message, user.id);
      setMessages((prev) =>
        prev.map((m) => (m.id === failedMsg.id ? { ...savedMsg, status: 'sent' } : m))
      );
    } catch (err: any) {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === failedMsg.id
            ? { ...m, status: 'failed', error: err.message || 'Retry failed' }
            : m
        )
      );
    }
  };

  // Keyboard shortcut: Enter to send, Shift+Enter for newline
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Auto-resize textarea as text grows
  const handleTextareaInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
  };

  // Format timestamp nicely
  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      if (isNaN(date.getTime())) return '';
      const now = new Date();
      const isToday =
        date.getDate() === now.getDate() &&
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear();

      const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      if (isToday) return timeStr;
      return `${date.toLocaleDateString([], { month: 'short', day: 'numeric' })}, ${timeStr}`;
    } catch {
      return '';
    }
  };

  // User initials avatar
  const getInitials = (name?: string) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col h-[calc(100vh-130px)] md:h-[calc(100vh-115px)] min-h-[500px] bg-white rounded-3xl border border-[#E5E1D6] shadow-sm overflow-hidden">
      
      {/* 1. Header Bar */}
      <div className="px-4 sm:px-6 py-3.5 bg-[#F7F5EF] border-b border-[#E5E1D6] flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#225944] text-white flex items-center justify-center shadow-xs shrink-0">
            <span className="material-symbols-outlined text-[22px]">forum</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-extrabold text-[#171A18] tracking-tight leading-none">
                Community Support
              </h1>
              {/* Realtime Live Status Indicator */}
              <span
                className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-tight ${
                  connectionStatus === 'connected'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : connectionStatus === 'syncing'
                    ? 'bg-amber-50 text-amber-700 border border-amber-200'
                    : 'bg-rose-50 text-rose-700 border border-rose-200'
                }`}
                title={
                  connectionStatus === 'connected'
                    ? 'Connected to live database'
                    : connectionStatus === 'syncing'
                    ? 'Syncing latest messages'
                    : 'Reconnecting...'
                }
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    connectionStatus === 'connected'
                      ? 'bg-emerald-500 animate-pulse'
                      : connectionStatus === 'syncing'
                      ? 'bg-amber-500 animate-ping'
                      : 'bg-rose-500'
                  }`}
                />
                <span className="capitalize">{connectionStatus}</span>
              </span>
            </div>
            <p className="text-xs text-[#6B6B63] mt-0.5 font-medium">
              Connect with fellow student residents across Bhilai &amp; Durg
            </p>
          </div>
        </div>

        {/* Quick Actions (Private Admin Chat & WhatsApp) */}
        <div className="flex items-center gap-2">
          <Link
            to="/support/chat"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#E5E1D6] text-xs font-bold text-[#225944] hover:bg-[#E5E1D6]/40 transition shadow-2xs"
            title="Private 1-on-1 chat with EaseHub support staff"
          >
            <span className="material-symbols-outlined text-[16px]">support_agent</span>
            <span>Contact Admin</span>
          </Link>

          <a
            href="https://wa.me/916201614778?text=Hi%20EaseHub%20Support,%20I%20have%20an%20urgent%20inquiry"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#EECA3A] hover:bg-[#E0BD2C] text-[#171A18] text-xs font-bold transition shadow-2xs"
            title="Official WhatsApp Support (+91 6201614778)"
          >
            <span className="material-symbols-outlined text-[16px]">chat</span>
            <span className="hidden md:inline">WhatsApp</span>
          </a>
        </div>
      </div>

      {/* 2. Main Chat Feed */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-[#FCFBF8] custom-scrollbar relative"
      >
        {loading ? (
          // Loading skeleton state
          <div className="space-y-4 py-8">
            <div className="flex items-start gap-3 max-w-md">
              <div className="w-9 h-9 rounded-xl bg-gray-200 animate-pulse shrink-0" />
              <div className="space-y-2 flex-1">
                <div className="h-3 w-24 bg-gray-200 rounded animate-pulse" />
                <div className="h-14 bg-gray-200 rounded-2xl animate-pulse" />
              </div>
            </div>
            <div className="flex items-start gap-3 max-w-md ml-auto justify-end">
              <div className="space-y-2 flex-1 items-end flex flex-col">
                <div className="h-3 w-16 bg-gray-200 rounded animate-pulse" />
                <div className="h-12 w-48 bg-[#225944]/20 rounded-2xl animate-pulse" />
              </div>
            </div>
            <div className="flex items-start gap-3 max-w-md">
              <div className="w-9 h-9 rounded-xl bg-gray-200 animate-pulse shrink-0" />
              <div className="space-y-2 flex-1">
                <div className="h-3 w-32 bg-gray-200 rounded animate-pulse" />
                <div className="h-10 bg-gray-200 rounded-2xl animate-pulse" />
              </div>
            </div>
          </div>
        ) : error ? (
          // Connection error state
          <div className="p-8 text-center max-w-md mx-auto my-auto">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3">
              <span className="material-symbols-outlined text-[28px]">cloud_off</span>
            </div>
            <h3 className="text-base font-extrabold text-[#171A18]">Unable to load community messages</h3>
            <p className="text-xs text-[#6B6B63] mt-1">{error}</p>
            <button
              onClick={() => loadMessages(true)}
              className="mt-4 px-4 py-2 rounded-xl bg-[#225944] text-white text-xs font-bold hover:bg-[#184232] transition cursor-pointer"
            >
              Retry Connection
            </button>
          </div>
        ) : messages.length === 0 ? (
          // Honest empty state - NO fake messages inserted
          <div className="h-full flex flex-col items-center justify-center text-center p-8 max-w-md mx-auto my-auto">
            <div className="w-16 h-16 rounded-3xl bg-[#EECA3A]/20 text-[#225944] flex items-center justify-center mb-4 shadow-xs">
              <span className="material-symbols-outlined text-[34px]">mark_chat_unread</span>
            </div>
            <h3 className="text-lg font-extrabold text-[#171A18] tracking-tight">
              Be the first to start the conversation.
            </h3>
            <p className="text-xs text-[#6B6B63] mt-2 leading-relaxed">
              Ask about campus hostels, mess meal timings, doorstep laundry slots, or connect with peers in Nehru Nagar, Junwani, and Durg.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {[
                '👋 Hello everyone!',
                '📍 Best PG near BIT Durg?',
                '🍱 How is the daily tiffin service?',
              ].map((starter) => (
                <button
                  key={starter}
                  onClick={() => setInputText(starter)}
                  className="px-3 py-1.5 rounded-full bg-white border border-[#E5E1D6] text-xs font-semibold text-[#171A18] hover:border-[#225944] hover:text-[#225944] transition cursor-pointer shadow-2xs"
                >
                  {starter}
                </button>
              ))}
            </div>
          </div>
        ) : (
          // Chronological Messages List
          messages.map((msg) => {
            const isOwn = msg.user_id === user?.id;
            const senderName = msg.user?.name || (isOwn ? 'You' : 'EaseHub Resident');
            const senderAvatar = msg.user?.avatar_url;
            const senderRole = msg.user?.role;
            const isStaff =
              senderRole === 'admin' ||
              senderRole === 'superadmin' ||
              senderRole === 'subadmin' ||
              senderRole === 'SUPER_ADMIN' ||
              senderRole === 'SUB_ADMIN';

            return (
              <div
                key={msg.id}
                className={`flex gap-3 items-end ${isOwn ? 'justify-end' : 'justify-start'} group`}
              >
                {/* Other User Avatar */}
                {!isOwn && (
                  <div className="w-8 h-8 rounded-xl bg-[#E5E1D6] text-[#225944] font-black text-xs flex items-center justify-center shrink-0 overflow-hidden shadow-2xs">
                    {senderAvatar ? (
                      <img src={senderAvatar} alt={senderName} className="w-full h-full object-cover" />
                    ) : (
                      <span>{getInitials(senderName)}</span>
                    )}
                  </div>
                )}

                {/* Message Bubble Container */}
                <div className={`flex flex-col max-w-[85%] sm:max-w-[70%] ${isOwn ? 'items-end' : 'items-start'}`}>
                  {/* Sender Name & Role Meta */}
                  {!isOwn && (
                    <div className="flex items-center gap-1.5 mb-1 px-1">
                      <span className="text-xs font-bold text-[#171A18]">{senderName}</span>
                      {isStaff && (
                        <span className="px-1.5 py-0.2 rounded-md bg-[#225944] text-white text-[9px] font-black tracking-wider uppercase">
                          Staff
                        </span>
                      )}
                    </div>
                  )}

                  {/* Bubble Content */}
                  <div
                    className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-wrap break-words shadow-2xs ${
                      isOwn
                        ? 'bg-[#225944] text-white rounded-br-xs'
                        : 'bg-white text-[#171A18] border border-[#E5E1D6] rounded-bl-xs'
                    }`}
                  >
                    {msg.message}
                  </div>

                  {/* Status / Timestamp */}
                  <div className="flex items-center gap-1.5 mt-1 px-1 text-[10px] text-[#6B6B63] font-medium">
                    <span>{formatTime(msg.created_at)}</span>
                    {isOwn && (
                      <>
                        {msg.status === 'sending' && (
                          <span className="text-amber-600 font-bold flex items-center gap-0.5">
                            <span className="material-symbols-outlined text-[12px] animate-spin">sync</span>
                            Sending...
                          </span>
                        )}
                        {msg.status === 'failed' && (
                          <button
                            onClick={() => handleRetry(msg)}
                            className="text-rose-600 font-bold flex items-center gap-0.5 hover:underline cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[12px]">error</span>
                            Failed. Retry?
                          </button>
                        )}
                        {msg.status !== 'sending' && msg.status !== 'failed' && (
                          <span className="material-symbols-outlined text-[12px] text-[#225944]">done_all</span>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* Own User Avatar */}
                {isOwn && (
                  <div className="w-8 h-8 rounded-xl bg-[#225944] text-white font-black text-xs flex items-center justify-center shrink-0 overflow-hidden shadow-2xs">
                    {user?.avatar ? (
                      <img src={user.avatar} alt="You" className="w-full h-full object-cover" />
                    ) : (
                      <span>{getInitials(user?.name)}</span>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Floating Scroll to Bottom Notification */}
      {hasNewMessagesWhileScrolled && !isScrolledToBottom && (
        <div className="absolute bottom-24 right-6 z-20 animate-bounce">
          <button
            onClick={() => scrollToBottom(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#225944] text-white text-xs font-bold shadow-lg hover:bg-[#184232] transition cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_downward</span>
            <span>New messages</span>
          </button>
        </div>
      )}

      {/* 3. Bottom Message Composer */}
      <form
        onSubmit={handleSendMessage}
        className="p-3 sm:p-4 bg-white border-t border-[#E5E1D6] flex items-end gap-2 shrink-0 relative"
      >
        <div className="flex-1 bg-[#F7F5EF] rounded-2xl border border-[#E5E1D6] focus-within:border-[#225944] focus-within:ring-2 focus-within:ring-[#225944]/10 transition-all p-2 flex items-end gap-2">
          <textarea
            ref={textareaRef}
            rows={1}
            value={inputText}
            onChange={handleTextareaInput}
            onKeyDown={handleKeyDown}
            placeholder="Type your message... (Enter to send, Shift+Enter for newline)"
            className="flex-1 bg-transparent border-none outline-none resize-none text-xs sm:text-sm text-[#171A18] placeholder-[#6B6B63] max-h-28 min-h-[24px] py-1 px-1"
          />
        </div>

        <button
          type="submit"
          disabled={!inputText.trim() || sending}
          className={`h-11 px-4 sm:px-5 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all shadow-xs shrink-0 cursor-pointer ${
            !inputText.trim() || sending
              ? 'bg-[#E5E1D6] text-[#6B6B63] cursor-not-allowed opacity-70'
              : 'bg-[#225944] hover:bg-[#184232] text-white active:scale-95'
          }`}
        >
          {sending ? (
            <span className="material-symbols-outlined text-[18px] animate-spin">sync</span>
          ) : (
            <>
              <span className="hidden sm:inline">Send</span>
              <span className="material-symbols-outlined text-[18px]">send</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default CommunityPage;
