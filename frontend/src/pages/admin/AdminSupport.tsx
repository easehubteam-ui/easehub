import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { isAdminRole } from '../../types';
import {
  supportApi,
  SupportConversation,
  SupportMessage,
} from '../../services/supportApi';
import {
  communityApi,
  CommunityMessage,
} from '../../services/communityApi';

interface AdminSupportProps {
  defaultTab?: 'conversations' | 'community';
}

export const AdminSupport: React.FC<AdminSupportProps> = ({ defaultTab }) => {
  const { user, hasPermission } = useAuth();
  const location = useLocation();

  const canAccessSupport = hasPermission('support');
  const canAccessCommunity = hasPermission('community');

  const computeInitialTab = (): 'conversations' | 'community' => {
    if (defaultTab) return defaultTab;
    if (location.pathname.includes('/admin/community')) return 'community';
    if (!canAccessSupport && canAccessCommunity) return 'community';
    return 'conversations';
  };

  // Active Tab: 'conversations' (1-on-1 private customer chats) or 'community' (Community Chat & Moderation)
  const [activeTab, setActiveTab] = useState<'conversations' | 'community'>(computeInitialTab);

  useEffect(() => {
    if (defaultTab) {
      setActiveTab(defaultTab);
    } else if (location.pathname.includes('/admin/community')) {
      setActiveTab('community');
    } else if (location.pathname.includes('/admin/support') && canAccessSupport) {
      setActiveTab('conversations');
    }
  }, [location.pathname, defaultTab, canAccessSupport]);

  // --- 1. Private Support Conversations State ---
  const [conversations, setConversations] = useState<SupportConversation[]>([]);
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [replyText, setReplyText] = useState('');
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sendingReply, setSendingReply] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'OPEN' | 'CLOSED'>('ALL');

  // --- 2. Community Chat & Moderation State ---
  const [communityMessages, setCommunityMessages] = useState<CommunityMessage[]>([]);
  const [adminCommunityText, setAdminCommunityText] = useState('');
  const [sendingCommunity, setSendingCommunity] = useState(false);
  const [loadingCommunity, setLoadingCommunity] = useState(false);
  const [moderatingId, setModeratingId] = useState<string | null>(null);
  const [communityViewMode, setCommunityViewMode] = useState<'chat' | 'table'>('chat');
  const [showDeletedCommunity, setShowDeletedCommunity] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const communityEndRef = useRef<HTMLDivElement>(null);

  // Helper to get currently selected conversation
  const selectedConv = conversations.find((c) => c.id === selectedConvId) || conversations[0] || null;

  // Load conversations list
  const loadConversations = useCallback(async (isInitial = false) => {
    if (!canAccessSupport) {
      if (isInitial) setLoadingConvs(false);
      return;
    }
    try {
      if (isInitial) setLoadingConvs(true);
      const data = await supportApi.getAllConversations();
      setConversations(data);
      if (data.length > 0 && !selectedConvId) {
        setSelectedConvId(data[0].id);
      }
    } catch (err) {
      console.error('Failed to load support conversations:', err);
    } finally {
      if (isInitial) setLoadingConvs(false);
    }
  }, [selectedConvId, canAccessSupport]);

  // Load selected conversation messages
  const loadConversationMessages = useCallback(async (convId: string, smoothScroll = true) => {
    if (!canAccessSupport) return;
    try {
      setLoadingMessages(true);
      const msgs = await supportApi.getConversationMessages(convId);
      setMessages(msgs);
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: smoothScroll ? 'smooth' : 'auto' });
      }, 60);
    } catch (err) {
      console.error('Failed to load conversation messages:', err);
    } finally {
      setLoadingMessages(false);
    }
  }, [canAccessSupport]);

  // Load community messages
  const loadCommunityMessages = useCallback(async () => {
    if (!canAccessCommunity) return;
    try {
      setLoadingCommunity(true);
      const msgs = await communityApi.getMessages(showDeletedCommunity);
      setCommunityMessages(msgs);
      setTimeout(() => {
        communityEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 60);
    } catch (err) {
      console.error('Failed to load community messages:', err);
    } finally {
      setLoadingCommunity(false);
    }
  }, [showDeletedCommunity, canAccessCommunity]);

  // Initial load
  useEffect(() => {
    if (canAccessSupport) {
      loadConversations(true);
    } else {
      setLoadingConvs(false);
    }
  }, [loadConversations, canAccessSupport]);

  // When selected conversation ID changes, load messages & subscribe to realtime
  useEffect(() => {
    if (selectedConvId && canAccessSupport) {
      loadConversationMessages(selectedConvId, false);

      const unsubscribe = supportApi.subscribe(
        selectedConvId,
        (newMsg) => {
          setMessages((prev) => {
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
          setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
          }, 60);
        },
        (newStatus) => {
          setConversations((prev) =>
            prev.map((c) => (c.id === selectedConvId ? { ...c, status: newStatus } : c))
          );
        }
      );

      return () => unsubscribe();
    }
  }, [selectedConvId, loadConversationMessages, canAccessSupport]);

  // Subscribe to realtime community chat updates when on community tab
  useEffect(() => {
    if (activeTab !== 'community' || !canAccessCommunity) return;
    const unsubscribe = communityApi.subscribe(
      (newMsg) => {
        setCommunityMessages((prev) => {
          if (prev.some((m) => m.id === newMsg.id)) return prev;
          return [...prev, newMsg];
        });
        setTimeout(() => {
          communityEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 60);
      },
      (deletedId) => {
        if (showDeletedCommunity) {
          loadCommunityMessages();
        } else {
          setCommunityMessages((prev) => prev.filter((m) => m.id !== deletedId));
        }
      }
    );
    return () => unsubscribe();
  }, [activeTab, canAccessCommunity, showDeletedCommunity, loadCommunityMessages]);

  // Regular heartbeat sync polling every 3.5s
  useEffect(() => {
    const interval = setInterval(() => {
      if (canAccessSupport && activeTab === 'conversations') {
        supportApi.getAllConversations().then((data) => {
          setConversations(data);
        }).catch(() => {});

        if (selectedConvId) {
          supportApi.getConversationMessages(selectedConvId).then((msgs) => {
            setMessages(msgs);
          }).catch(() => {});
        }
      }

      if (canAccessCommunity && activeTab === 'community') {
        communityApi.getMessages(showDeletedCommunity).then((msgs) => {
          setCommunityMessages(msgs);
        }).catch(() => {});
      }
    }, 3500);

    return () => clearInterval(interval);
  }, [selectedConvId, activeTab, showDeletedCommunity, canAccessSupport, canAccessCommunity]);

  // When switching to community tab, fetch community messages
  useEffect(() => {
    if (activeTab === 'community' && canAccessCommunity) {
      loadCommunityMessages();
    }
  }, [activeTab, loadCommunityMessages, canAccessCommunity]);

  // Send admin reply in private chat
  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || sendingReply || !selectedConv || !user?.id) return;

    const text = replyText.trim();
    setReplyText('');

    const tempId = `temp-${Date.now()}`;
    const optimisticMsg: SupportMessage = {
      id: tempId,
      conversation_id: selectedConv.id,
      sender_id: user.id,
      message: text,
      is_admin_reply: true,
      created_at: new Date().toISOString(),
      sender: {
        id: user.id,
        name: user.name || 'EaseHub Support Desk',
        role: user.role,
      },
      status: 'sending',
    };

    setMessages((prev) => [...prev, optimisticMsg]);
    setSendingReply(true);

    try {
      const saved = await supportApi.sendMessage(selectedConv.id, user.id, text, true);
      setMessages((prev) =>
        prev.map((m) => (m.id === tempId ? { ...saved, status: 'sent' } : m))
      );
      loadConversations(false);
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 60);
    } catch (err: any) {
      alert('Failed to send reply: ' + (err.message || 'Error'));
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
    } finally {
      setSendingReply(false);
    }
  };

  // Admin posts an official message into Community Chat
  const handleSendCommunityMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminCommunityText.trim() || sendingCommunity || !user?.id) return;

    const text = adminCommunityText.trim();
    setAdminCommunityText('');
    setSendingCommunity(true);

    try {
      await communityApi.sendMessage(text, user.id);
      loadCommunityMessages();
      setTimeout(() => {
        communityEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 80);
    } catch (err: any) {
      alert('Failed to send community announcement: ' + (err.message || 'Error'));
    } finally {
      setSendingCommunity(false);
    }
  };

  // Toggle conversation status (OPEN <-> CLOSED)
  const handleToggleStatus = async (conv: SupportConversation) => {
    const newStatus = conv.status === 'OPEN' ? 'CLOSED' : 'OPEN';
    try {
      await supportApi.updateConversationStatus(conv.id, newStatus);
      setConversations((prev) =>
        prev.map((c) => (c.id === conv.id ? { ...c, status: newStatus } : c))
      );
    } catch (err: any) {
      alert('Failed to update status: ' + (err.message || 'Error'));
    }
  };

  // Moderate/delete community message
  const handleDeleteCommunityMessage = async (msgId: string) => {
    if (!confirm('Are you sure you want to remove this message from Community chat?')) return;
    if (!user?.id) return;
    try {
      setModeratingId(msgId);
      await communityApi.deleteMessage(msgId, user.id);
      loadCommunityMessages();
    } catch (err: any) {
      alert('Failed to remove message: ' + (err.message || 'Error'));
    } finally {
      setModeratingId(null);
    }
  };

  // Filter conversations
  const filteredConversations = conversations.filter((c) => {
    if (filterStatus === 'ALL') return true;
    return c.status === filterStatus;
  });

  const formatDateTime = (iso?: string) => {
    if (!iso) return '';
    try {
      const d = new Date(iso);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Tab Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#E5E1D6] shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#225944] text-white flex items-center justify-center shadow-xs">
              <span className="material-symbols-outlined text-[20px]">chat</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#171A18] tracking-tight">
              Support Desk &amp; Community Chat
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-[#6B6B63] mt-1">
            Answer private student queries in real-time or post and moderate public discussions.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center p-1 bg-[#F3F4F0] rounded-xl border border-[#E5E1D6] shrink-0">
          {canAccessSupport && (
            <button
              onClick={() => setActiveTab('conversations')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'conversations'
                  ? 'bg-white text-[#225944] shadow-xs'
                  : 'text-[#6B6B63] hover:text-[#171A18]'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">support_agent</span>
              <span>Private Inquiries</span>
              {conversations.length > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-[#225944] text-white text-[10px] font-black">
                  {conversations.length}
                </span>
              )}
            </button>
          )}

          {canAccessCommunity && (
            <button
              onClick={() => setActiveTab('community')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'community'
                  ? 'bg-white text-[#225944] shadow-xs'
                  : 'text-[#6B6B63] hover:text-[#171A18]'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">forum</span>
              <span>Community Live Chat</span>
            </button>
          )}
        </div>
      </div>

      {/* TAB 1: 1-on-1 Customer Support Conversations */}
      {activeTab === 'conversations' && canAccessSupport && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[720px]">
          
          {/* Left Column: Conversations List (5 Cols) */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-[#E5E1D6] shadow-xs flex flex-col overflow-hidden">
            {/* Filter Pills */}
            <div className="p-3 bg-[#F7F5EF] border-b border-[#E5E1D6] flex items-center justify-between gap-2">
              <span className="text-xs font-extrabold text-[#171A18]">
                Customer Chats ({conversations.length})
              </span>
              <div className="flex gap-1">
                {(['ALL', 'OPEN', 'CLOSED'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setFilterStatus(st)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                      filterStatus === st
                        ? 'bg-[#225944] text-white'
                        : 'bg-white text-[#6B6B63] hover:text-[#171A18] border border-[#E5E1D6]'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* List Body */}
            <div className="flex-1 overflow-y-auto divide-y divide-[#E5E1D6] custom-scrollbar">
              {loadingConvs ? (
                <div className="p-6 text-center text-xs text-[#6B6B63]">Loading customer chats...</div>
              ) : filteredConversations.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-gray-100 text-[#6B6B63] flex items-center justify-center mx-auto mb-3">
                    <span className="material-symbols-outlined text-[24px]">chat_bubble_outline</span>
                  </div>
                  <p className="text-sm font-bold text-[#171A18]">No customer conversations yet</p>
                  <p className="text-xs text-[#6B6B63] mt-1">
                    When students start a chat from /support/chat, they appear here live.
                  </p>
                </div>
              ) : (
                filteredConversations.map((conv) => {
                  const isSelected = selectedConv?.id === conv.id;
                  const customerName = conv.user?.name || conv.user?.email || 'Student Resident';
                  return (
                    <div
                      key={conv.id}
                      onClick={() => setSelectedConvId(conv.id)}
                      className={`p-4 transition cursor-pointer ${
                        isSelected
                          ? 'bg-[#F0EDE6] border-l-4 border-[#225944]'
                          : 'hover:bg-[#F9F8F5]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="font-bold text-xs text-[#171A18] truncate">{customerName}</span>
                          <span
                            className={`px-1.5 py-0.2 rounded-md text-[9px] font-extrabold uppercase ${
                              conv.status === 'OPEN'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            {conv.status}
                          </span>
                        </div>
                        <span className="text-[10px] text-[#6B6B63] shrink-0 font-medium">
                          {formatDateTime(conv.last_message_at || conv.updated_at)}
                        </span>
                      </div>
                      <p className="text-xs text-[#6B6B63] truncate leading-snug">
                        {conv.last_message || 'New inquiry created'}
                      </p>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Column: Full Conversation Chat Window (7 Cols) */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-[#E5E1D6] shadow-xs flex flex-col overflow-hidden">
            {selectedConv ? (
              <>
                {/* Header */}
                <div className="p-4 bg-[#F7F5EF] border-b border-[#E5E1D6] flex items-center justify-between gap-3 shrink-0">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-[#225944] text-white font-black text-xs flex items-center justify-center shrink-0 shadow-2xs">
                      {(selectedConv.user?.name || 'C').slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h2 className="text-sm font-extrabold text-[#171A18] truncate">
                          {selectedConv.user?.name || 'Student Resident'}
                        </h2>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${
                            selectedConv.status === 'OPEN'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-gray-200 text-gray-700'
                          }`}
                        >
                          {selectedConv.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#6B6B63] truncate">
                        {selectedConv.user?.email || selectedConv.user?.phone || 'Customer Account'}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleToggleStatus(selectedConv)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shadow-2xs cursor-pointer ${
                        selectedConv.status === 'OPEN'
                          ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                          : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200'
                      }`}
                    >
                      {selectedConv.status === 'OPEN' ? 'Close Issue' : 'Reopen Issue'}
                    </button>
                  </div>
                </div>

                {/* Messages Stream */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 bg-[#FCFBF8] custom-scrollbar">
                  {loadingMessages ? (
                    <div className="p-6 text-center text-xs text-[#6B6B63]">Loading messages...</div>
                  ) : messages.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-center p-6 text-xs text-[#6B6B63]">
                      No messages in this inquiry yet. Send a response below.
                    </div>
                  ) : (
                    messages.map((msg) => {
                      const isAdminMsg = msg.is_admin_reply;
                      return (
                        <div
                          key={msg.id}
                          className={`flex flex-col ${isAdminMsg ? 'items-end' : 'items-start'}`}
                        >
                          <span className="text-[10px] text-[#6B6B63] mb-0.5 px-1 font-semibold">
                            {isAdminMsg ? 'EaseHub Admin (You)' : selectedConv.user?.name || 'Customer'}
                          </span>
                          <div
                            className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-wrap break-words shadow-2xs ${
                              isAdminMsg
                                ? 'bg-[#225944] text-white rounded-br-xs'
                                : 'bg-white text-[#171A18] border border-[#E5E1D6] rounded-bl-xs'
                            }`}
                          >
                            {msg.message}
                          </div>
                          <span className="text-[9px] text-[#6B6B63] mt-0.5 px-1">
                            {formatDateTime(msg.created_at)}
                          </span>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Admin Reply Composer */}
                <form
                  onSubmit={handleSendReply}
                  className="p-3 bg-white border-t border-[#E5E1D6] flex items-center gap-2 shrink-0"
                >
                  <input
                    type="text"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Type official reply to student... (Press Enter)"
                    className="flex-1 px-4 py-2.5 rounded-xl bg-[#F7F5EF] border border-[#E5E1D6] text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#225944]"
                  />
                  <button
                    type="submit"
                    disabled={!replyText.trim() || sendingReply}
                    className="h-10 px-5 rounded-xl bg-[#225944] hover:bg-[#184232] text-white text-xs font-bold transition shadow-xs disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                  >
                    {sendingReply ? (
                      <span className="material-symbols-outlined text-[16px] animate-spin">sync</span>
                    ) : (
                      <>
                        <span>Send</span>
                        <span className="material-symbols-outlined text-[16px]">send</span>
                      </>
                    )}
                  </button>
                </form>
              </>
            ) : (
              <div className="h-full flex items-center justify-center text-center p-8 text-[#6B6B63] text-xs">
                Select a customer chat from the list to view and reply.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: Community Chat & Moderation */}
      {activeTab === 'community' && canAccessCommunity && (
        <div className="bg-white rounded-2xl border border-[#E5E1D6] shadow-xs p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E5E1D6]">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-[#171A18]">
                  Campus Community Feed ({communityMessages.length})
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                  Live
                </span>
              </div>
              <p className="text-xs text-[#6B6B63] mt-0.5">
                Interact with student residents as Admin, post campus notices, or remove spam.
              </p>
            </div>

            {/* View Switcher & Controls */}
            <div className="flex items-center gap-3">
              <div className="flex bg-[#F3F4F0] p-1 rounded-xl border border-[#E5E1D6]">
                <button
                  type="button"
                  onClick={() => setCommunityViewMode('chat')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                    communityViewMode === 'chat'
                      ? 'bg-white text-[#225944] shadow-2xs'
                      : 'text-[#6B6B63]'
                  }`}
                >
                  Live Chat View
                </button>
                <button
                  type="button"
                  onClick={() => setCommunityViewMode('table')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                    communityViewMode === 'table'
                      ? 'bg-white text-[#225944] shadow-2xs'
                      : 'text-[#6B6B63]'
                  }`}
                >
                  Table &amp; Audit
                </button>
              </div>

              <label className="flex items-center gap-2 text-xs font-semibold text-[#171A18] cursor-pointer">
                <input
                  type="checkbox"
                  checked={showDeletedCommunity}
                  onChange={(e) => setShowDeletedCommunity(e.target.checked)}
                  className="rounded text-[#225944] focus:ring-[#225944]"
                />
                <span className="hidden sm:inline">Show Deleted</span>
              </label>

              <button
                onClick={loadCommunityMessages}
                className="px-3 py-1.5 rounded-xl bg-[#F7F5EF] border border-[#E5E1D6] text-xs font-bold hover:bg-[#E5E1D6] transition cursor-pointer"
              >
                Refresh
              </button>
            </div>
          </div>

          {/* Sub-view 1: Interactive Live Community Chat for Admin */}
          {communityViewMode === 'chat' && (
            <div className="flex flex-col h-[560px] bg-[#FCFBF8] rounded-2xl border border-[#E5E1D6] overflow-hidden">
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 custom-scrollbar">
                {loadingCommunity ? (
                  <div className="text-center py-12 text-xs text-[#6B6B63]">Loading community chat...</div>
                ) : communityMessages.length === 0 ? (
                  <div className="text-center py-16 text-[#6B6B63]">
                    <span className="material-symbols-outlined text-[36px] text-gray-300 mb-2">forum</span>
                    <p className="text-sm font-bold text-[#171A18]">No community messages yet.</p>
                    <p className="text-xs mt-1">Post the first announcement below as EaseHub Admin.</p>
                  </div>
                ) : (
                  communityMessages.map((msg) => {
                    const isOwnAdmin = msg.user_id === user?.id || isAdminRole(msg.user?.role);
                    return (
                      <div
                        key={msg.id}
                        className={`flex gap-3 items-start group ${isOwnAdmin ? 'justify-end' : 'justify-start'}`}
                      >
                        {!isOwnAdmin && (
                          <div className="w-8 h-8 rounded-xl bg-[#E5E1D6] text-[#225944] font-black text-xs flex items-center justify-center shrink-0">
                            {(msg.user?.name || 'U').slice(0, 2).toUpperCase()}
                          </div>
                        )}

                        <div className={`flex flex-col max-w-[80%] ${isOwnAdmin ? 'items-end' : 'items-start'}`}>
                          <div className="flex items-center gap-1.5 mb-1 px-1">
                            <span className="text-xs font-bold text-[#171A18]">
                              {msg.user?.name || 'Student Resident'}
                            </span>
                            {isOwnAdmin && (
                              <span className="px-1.5 py-0.2 rounded bg-[#225944] text-white text-[9px] font-black uppercase">
                                Staff
                              </span>
                            )}
                            {msg.is_deleted && (
                              <span className="px-1.5 py-0.2 rounded bg-rose-100 text-rose-800 text-[9px] font-black uppercase">
                                Removed
                              </span>
                            )}
                          </div>

                          <div
                            className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-wrap break-words shadow-2xs relative ${
                              isOwnAdmin
                                ? 'bg-[#225944] text-white rounded-br-xs'
                                : 'bg-white text-[#171A18] border border-[#E5E1D6] rounded-bl-xs'
                            } ${msg.is_deleted ? 'opacity-50 line-through' : ''}`}
                          >
                            {msg.message}
                          </div>

                          <div className="flex items-center gap-2 mt-1 px-1 text-[10px] text-[#6B6B63]">
                            <span>{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            {!msg.is_deleted && (
                              <button
                                onClick={() => handleDeleteCommunityMessage(msg.id)}
                                disabled={moderatingId === msg.id}
                                className="text-rose-600 hover:underline font-bold cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                {moderatingId === msg.id ? 'Deleting...' : 'Delete'}
                              </button>
                            )}
                          </div>
                        </div>

                        {isOwnAdmin && (
                          <div className="w-8 h-8 rounded-xl bg-[#225944] text-white font-black text-xs flex items-center justify-center shrink-0">
                            EH
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
                <div ref={communityEndRef} />
              </div>

              {/* Admin Community Message Composer */}
              <form
                onSubmit={handleSendCommunityMessage}
                className="p-3 bg-white border-t border-[#E5E1D6] flex items-center gap-2"
              >
                <input
                  type="text"
                  value={adminCommunityText}
                  onChange={(e) => setAdminCommunityText(e.target.value)}
                  placeholder="Post an official announcement or answer as EaseHub Admin..."
                  className="flex-1 px-4 py-2.5 rounded-xl bg-[#F7F5EF] border border-[#E5E1D6] text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#225944]"
                />
                <button
                  type="submit"
                  disabled={!adminCommunityText.trim() || sendingCommunity}
                  className="h-10 px-5 rounded-xl bg-[#225944] hover:bg-[#184232] text-white text-xs font-bold transition shadow-xs disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                >
                  {sendingCommunity ? (
                    <span className="material-symbols-outlined text-[16px] animate-spin">sync</span>
                  ) : (
                    <>
                      <span>Post</span>
                      <span className="material-symbols-outlined text-[16px]">send</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* Sub-view 2: Table & Audit View */}
          {communityViewMode === 'table' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[#F7F5EF] text-[#6B6B63] font-bold border-b border-[#E5E1D6]">
                    <th className="py-3 px-4">Author</th>
                    <th className="py-3 px-4">Message</th>
                    <th className="py-3 px-4">Date &amp; Time</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E1D6]">
                  {communityMessages.map((msg) => (
                    <tr
                      key={msg.id}
                      className={msg.is_deleted ? 'bg-rose-50/40 text-gray-500' : 'hover:bg-[#FDFCF9]'}
                    >
                      <td className="py-3 px-4 whitespace-nowrap font-bold text-[#171A18]">
                        {msg.user?.name || 'Resident'}
                        <div className="text-[10px] text-[#6B6B63] font-normal">{msg.user?.role || 'customer'}</div>
                      </td>
                      <td className="py-3 px-4 max-w-md break-words font-medium leading-relaxed">
                        {msg.is_deleted ? (
                          <span className="italic text-rose-700 line-through">{msg.message}</span>
                        ) : (
                          msg.message
                        )}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap text-[#6B6B63]">
                        {new Date(msg.created_at).toLocaleString([], {
                          dateStyle: 'short',
                          timeStyle: 'short',
                        })}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        {msg.is_deleted ? (
                          <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-bold">
                            Deleted
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                            Live
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        {!msg.is_deleted && (
                          <button
                            onClick={() => handleDeleteCommunityMessage(msg.id)}
                            disabled={moderatingId === msg.id}
                            className="px-3 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold border border-rose-200 transition cursor-pointer"
                          >
                            {moderatingId === msg.id ? 'Deleting...' : 'Remove'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminSupport;
