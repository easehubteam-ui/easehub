import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { supportApi, SupportConversation, SupportMessage } from '../../services/supportApi';

export const PrivateSupportChatPage: React.FC = () => {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [conversation, setConversation] = useState<SupportConversation | null>(null);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && (!isAuthenticated || !user)) {
      navigate('/login', { state: { from: { pathname: '/support/chat' } }, replace: true });
    }
  }, [authLoading, isAuthenticated, user, navigate]);

  const scrollToBottom = useCallback((smooth = true) => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
    }
  }, []);

  // Load or initialize conversation and messages
  const loadConversationData = useCallback(async (isInitial = false) => {
    if (!user?.id) return;
    try {
      if (isInitial) setLoading(true);

      const conv = await supportApi.getOrCreateUserConversation(user.id);
      setConversation(conv);

      const msgs = await supportApi.getConversationMessages(conv.id);
      setMessages(msgs);
      setError(null);

      if (isInitial) {
        setTimeout(() => scrollToBottom(false), 80);
      }
    } catch (err: any) {
      console.error('Failed to load private support chat:', err);
      if (isInitial) {
        setError(err.message || 'Failed to connect to EaseHub Support.');
      }
    } finally {
      if (isInitial) setLoading(false);
    }
  }, [user, scrollToBottom]);

  // Initial setup + Realtime + Sync polling
  useEffect(() => {
    if (!user) return;

    loadConversationData(true);

    let unsubscribe = () => {};

    // Once conversation ID is available, subscribe
    if (conversation?.id) {
      unsubscribe = supportApi.subscribe(
        conversation.id,
        (newMsg) => {
          setMessages((prev) => {
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
          setTimeout(() => scrollToBottom(true), 80);
        },
        (newStatus) => {
          setConversation((prev) => (prev ? { ...prev, status: newStatus } : null));
        }
      );
    }

    const interval = setInterval(() => {
      loadConversationData(false);
    }, 4000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, [user, conversation?.id, loadConversationData, scrollToBottom]);

  // Send message to Admin
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || sending || !user?.id || !conversation?.id) return;

    const textToSend = inputText.trim();
    setInputText('');

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    const tempId = `temp-${Date.now()}`;
    const optimisticMsg: SupportMessage = {
      id: tempId,
      conversation_id: conversation.id,
      sender_id: user.id,
      message: textToSend,
      is_admin_reply: false,
      created_at: new Date().toISOString(),
      sender: {
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
      const savedMsg = await supportApi.sendMessage(conversation.id, user.id, textToSend, false);
      setMessages((prev) =>
        prev.map((m) => (m.id === tempId ? { ...savedMsg, status: 'sent' } : m))
      );
    } catch (err: any) {
      console.error('Failed to send support message:', err);
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

  // Reopen closed conversation
  const handleReopenConversation = async () => {
    if (!conversation) return;
    try {
      setUpdatingStatus(true);
      await supportApi.updateConversationStatus(conversation.id, 'OPEN');
      setConversation((prev) => (prev ? { ...prev, status: 'OPEN' } : null));
    } catch (err: any) {
      alert('Unable to reopen conversation: ' + (err.message || 'Error'));
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      if (isNaN(date.getTime())) return '';
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col h-[calc(100vh-130px)] md:h-[calc(100vh-115px)] min-h-[500px] bg-white rounded-3xl border border-[#E5E1D6] shadow-sm overflow-hidden">
      
      {/* 1. Header Bar */}
      <div className="px-4 sm:px-6 py-3.5 bg-[#F7F5EF] border-b border-[#E5E1D6] flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#225944] text-white flex items-center justify-center shadow-xs shrink-0">
            <span className="material-symbols-outlined text-[22px]">support_agent</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-extrabold text-[#171A18] tracking-tight leading-none">
                EaseHub Admin Desk
              </h1>
              {conversation && (
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide ${
                    conversation.status === 'OPEN'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {conversation.status}
                </span>
              )}
            </div>
            <p className="text-xs text-[#6B6B63] mt-0.5 font-medium">
              Private 1-on-1 assistance for bookings, room changes &amp; payments
            </p>
          </div>
        </div>

        {/* WhatsApp & Community Shortcuts */}
        <div className="flex items-center gap-2">
          <Link
            to="/community"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#E5E1D6] text-xs font-bold text-[#171A18] hover:bg-[#E5E1D6]/40 transition shadow-2xs"
          >
            <span className="material-symbols-outlined text-[16px] text-[#225944]">forum</span>
            <span>Community</span>
          </Link>

          <a
            href="https://wa.me/916201614778?text=Hi%20EaseHub%20Support,%20I%20need%20assistance%20with%20my%20stay"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#EECA3A] hover:bg-[#E0BD2C] text-[#171A18] text-xs font-bold transition shadow-2xs"
            title="Chat on WhatsApp (+91 6201614778)"
          >
            <span className="material-symbols-outlined text-[16px]">chat</span>
            <span>WhatsApp</span>
          </a>
        </div>
      </div>

      {/* 2. Chat Stream */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-[#FCFBF8] custom-scrollbar">
        {loading ? (
          <div className="space-y-4 py-8">
            <div className="flex items-start gap-3 max-w-md">
              <div className="w-8 h-8 rounded-xl bg-gray-200 animate-pulse" />
              <div className="h-14 w-64 bg-gray-200 rounded-2xl animate-pulse" />
            </div>
            <div className="flex items-start gap-3 max-w-md ml-auto justify-end">
              <div className="h-12 w-48 bg-[#225944]/20 rounded-2xl animate-pulse" />
            </div>
          </div>
        ) : error ? (
          <div className="p-8 text-center max-w-md mx-auto my-auto">
            <p className="text-sm font-bold text-rose-600">{error}</p>
            <button
              onClick={() => loadConversationData(true)}
              className="mt-3 px-4 py-2 rounded-xl bg-[#225944] text-white text-xs font-bold"
            >
              Retry
            </button>
          </div>
        ) : messages.length === 0 ? (
          // Honest empty state - NO fake messages
          <div className="h-full flex flex-col items-center justify-center text-center p-8 max-w-md mx-auto my-auto">
            <div className="w-16 h-16 rounded-3xl bg-[#225944]/10 text-[#225944] flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-[32px]">mark_chat_read</span>
            </div>
            <h3 className="text-lg font-extrabold text-[#171A18] tracking-tight">
              Start your private conversation
            </h3>
            <p className="text-xs text-[#6B6B63] mt-2 leading-relaxed">
              Send a message below. Our central support desk and campus coordinators will assist you right away.
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isOwn = msg.sender_id === user?.id && !msg.is_admin_reply;
            return (
              <div
                key={msg.id}
                className={`flex gap-3 items-end ${isOwn ? 'justify-end' : 'justify-start'}`}
              >
                {!isOwn && (
                  <div className="w-8 h-8 rounded-xl bg-[#225944] text-[#EECA3A] font-black text-xs flex items-center justify-center shrink-0 shadow-2xs">
                    EH
                  </div>
                )}

                <div className={`flex flex-col max-w-[85%] sm:max-w-[70%] ${isOwn ? 'items-end' : 'items-start'}`}>
                  {!isOwn && (
                    <div className="flex items-center gap-1.5 mb-1 px-1">
                      <span className="text-xs font-bold text-[#171A18]">
                        {msg.sender?.name || 'EaseHub Official Support'}
                      </span>
                      <span className="px-1.5 py-0.2 rounded-md bg-[#225944] text-white text-[9px] font-black uppercase">
                        Admin
                      </span>
                    </div>
                  )}

                  <div
                    className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-wrap break-words shadow-2xs ${
                      isOwn
                        ? 'bg-[#225944] text-white rounded-br-xs'
                        : 'bg-white text-[#171A18] border border-[#E5E1D6] rounded-bl-xs'
                    }`}
                  >
                    {msg.message}
                  </div>

                  <div className="flex items-center gap-1 mt-1 px-1 text-[10px] text-[#6B6B63]">
                    <span>{formatTime(msg.created_at)}</span>
                    {isOwn && msg.status === 'sending' && <span>• Sending...</span>}
                    {isOwn && msg.status === 'failed' && (
                      <span className="text-rose-600 font-bold">• Failed</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 3. Composer / Status Footer */}
      {conversation?.status === 'CLOSED' ? (
        <div className="p-4 bg-[#F7F5EF] border-t border-[#E5E1D6] text-center flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-[#6B6B63] font-medium">
            This support conversation has been marked <span className="font-bold text-[#171A18]">Closed</span> by support.
          </p>
          <button
            onClick={handleReopenConversation}
            disabled={updatingStatus}
            className="px-4 py-2 rounded-xl bg-[#225944] text-white text-xs font-bold hover:bg-[#184232] transition cursor-pointer"
          >
            {updatingStatus ? 'Reopening...' : 'Reopen Conversation'}
          </button>
        </div>
      ) : (
        <form
          onSubmit={handleSendMessage}
          className="p-3 sm:p-4 bg-white border-t border-[#E5E1D6] flex items-end gap-2 shrink-0"
        >
          <div className="flex-1 bg-[#F7F5EF] rounded-2xl border border-[#E5E1D6] focus-within:border-[#225944] focus-within:ring-2 focus-within:ring-[#225944]/10 transition-all p-2 flex items-end gap-2">
            <textarea
              ref={textareaRef}
              rows={1}
              value={inputText}
              onChange={(e) => {
                setInputText(e.target.value);
                e.target.style.height = 'auto';
                e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
              }}
              onKeyDown={handleKeyDown}
              placeholder="Type your message to EaseHub Admin... (Enter to send)"
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
      )}
    </div>
  );
};

export default PrivateSupportChatPage;
