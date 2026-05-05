import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationsContext';
import { io } from 'socket.io-client';
import { Send, User as UserIcon, Loader2, ArrowRight, Pencil, Trash2, Check, CheckCheck, X, Circle } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

/** unreadCount من الـ API يكون غالباً كائن JSON وليس Map — استدعاء .get() يسبب crash */
function unreadCountForUser(unreadCount, userId) {
  if (unreadCount == null) return 0;
  const key = String(userId);
  if (typeof unreadCount.get === 'function') {
    return Number(unreadCount.get(key) ?? unreadCount.get(userId) ?? 0) || 0;
  }
  const v = unreadCount[key] ?? unreadCount[userId];
  return Number(v) || 0;
}

function buildUserImageUrl(imagePath) {
  if (!imagePath) return '';
  if (
    imagePath.startsWith('http://') ||
    imagePath.startsWith('https://') ||
    imagePath.startsWith('data:') ||
    imagePath.startsWith('blob:')
  ) {
    return imagePath;
  }
  if (imagePath.startsWith('/uploads/')) {
    return `${API_BASE_URL}${imagePath.replace('/uploads/', '/')}`;
  }
  if (imagePath.startsWith('/')) {
    return `${API_BASE_URL}${imagePath}`;
  }
  return `${API_BASE_URL}/${imagePath}`;
}

function setUnreadCountForUser(unreadCount, userId, value) {
  const key = String(userId);
  const v = Number(value) || 0;
  if (unreadCount && typeof unreadCount.get === 'function') {
    const next = new Map(unreadCount);
    next.set(key, v);
    return next;
  }
  return { ...(unreadCount || {}), [key]: v };
}

const ChatPage = () => {
  const { currentUser, token } = useAuth();
  const { markSenderMessagesRead } = useNotifications();
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [showConversations, setShowConversations] = useState(true);
  const [actionsMessageId, setActionsMessageId] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [editingMessage, setEditingMessage] = useState(null);
  const [editText, setEditText] = useState('');
  const [typingUser, setTypingUser] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState(new Set());

  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Connect to Socket and Fetch Conversations
  useEffect(() => {
    if (!currentUser || !token) return;

    socketRef.current = io(API_BASE_URL);

    // Register user as online
    socketRef.current.emit('register_user', currentUser._id);
    setOnlineUsers((prev) => new Set(prev).add(String(currentUser._id)));

    const fetchConversations = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/v1/chat/conversations`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();

        if (data.status === 'success') {
          setConversations(data.data);

          const state = location.state;
          if (state && state.ownerId) {
            startOrSetConversation(state.ownerId, state.propertyId);
          } else if (data.data.length > 0) {
            setActiveConversation(data.data[0]);
          }
        }
      } catch (error) {
        console.error('Error fetching conversations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();

    // Socket event listeners
    socketRef.current.on('receive_message', (msg) => {
      setMessages((prev) => [...prev, msg]);
      setConversations(prevConvs => prevConvs.map(conv => {
        if (conv._id === msg.conversationId) {
          return { ...conv, lastMessage: msg };
        }
        return conv;
      }));
    });

    socketRef.current.on('message_edited', (data) => {
      setMessages(prev => prev.map(msg =>
        msg._id === data.messageId ? { ...msg, text: data.text, isEdited: true } : msg
      ));
    });

    socketRef.current.on('message_deleted', (data) => {
      setMessages(prev => prev.map(msg =>
        msg._id === data.messageId ? { ...msg, text: data.text, isDeleted: true } : msg
      ));
    });

    socketRef.current.on('user_typing', (data) => {
      if (data.isTyping) {
        setTypingUser(data.userName);
      } else {
        setTypingUser(null);
      }
    });

    socketRef.current.on('user_online', (userId) => {
      setOnlineUsers((prev) => new Set(prev).add(String(userId)));
    });

    socketRef.current.on('user_offline', (userId) => {
      setOnlineUsers((prev) => {
        const updated = new Set(prev);
        updated.delete(String(userId));
        return updated;
      });
    });

    socketRef.current.on('messages_read', (data) => {
      const convId = String(data.conversationId);
      setMessages(prev => prev.map(msg => {
        const senderId = msg.sender?._id ?? msg.sender;
        const msgConvId = String(msg.conversationId ?? '');
        const isMyMessage = String(senderId) === String(currentUser._id);
        if (isMyMessage && msgConvId === convId && !msg.isDeleted) {
          return { ...msg, isRead: true };
        }
        return msg;
      }));
    });

    socketRef.current.on('online_users_list', (userIds) => {
      if (Array.isArray(userIds)) {
        setOnlineUsers(new Set(userIds.map((id) => String(id))));
      }
    });

    return () => {
      socketRef.current.disconnect();
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, [currentUser, token, location.state]);

  // When active conversation changes, fetch messages and join room
  useEffect(() => {
    if (!activeConversation || !token) return;

    const fetchMessages = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/v1/chat/messages/${activeConversation._id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.status === 'success') {
          setMessages(data.data);
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };

    fetchMessages();
    socketRef.current.emit('join_conversation', activeConversation._id);

    // Mark messages as read via API
    fetch(`${API_BASE_URL}/api/v1/chat/messages/${activeConversation._id}/read`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` }
    });

    // Also mark via socket for real-time
    socketRef.current.emit('mark_read', {
      conversationId: activeConversation._id,
      userId: currentUser._id
    });

    // Decrease unread badge on conversations list immediately
    setConversations((prev) =>
      prev.map((c) =>
        c._id === activeConversation._id
          ? { ...c, unreadCount: setUnreadCountForUser(c.unreadCount, currentUser._id, 0) }
          : c
      )
    );

    // Decrease unread badge on Messages icon + Notifications icon
    const other = getOtherParticipant(activeConversation);
    const otherId = other?._id ?? other;
    if (otherId) markSenderMessagesRead(otherId);

    setTypingUser(null);
    setActionsMessageId(null);
  }, [activeConversation, token, currentUser, markSenderMessagesRead]);

  const startOrSetConversation = async (ownerId, propertyId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/chat/conversations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ receiverId: ownerId, propertyId })
      });
      const data = await res.json();

      if (data.status === 'success') {
        const newConv = data.data;
        setConversations(prev => {
          if (prev.find(c => c._id === newConv._id)) return prev;
          return [newConv, ...prev];
        });
        setActiveConversation(newConv);
      }
    } catch (error) {
      console.error('Error starting conversation:', error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConversation) return;

    const messageData = {
      conversationId: activeConversation._id,
      senderId: currentUser._id,
      text: newMessage
    };

    socketRef.current.emit('send_message', messageData);
    socketRef.current.emit('stop_typing', {
      conversationId: activeConversation._id,
      userId: currentUser._id,
      userName: currentUser.name
    });
    setNewMessage('');
  };

  const handleEditMessage = async (messageId) => {
    if (!editText.trim() || !activeConversation) return;

    // Update via API
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/chat/messages/${messageId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ text: editText })
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(prev => prev.map(msg =>
          msg._id === messageId ? { ...msg, text: data.data.text, isEdited: true } : msg
        ));
      }
    } catch (error) {
      console.error('Error editing message:', error);
    }

    // Also emit via socket
    socketRef.current.emit('edit_message', {
      messageId,
      text: editText,
      senderId: currentUser._id,
      conversationId: activeConversation._id
    });

    setEditingMessage(null);
    setEditText('');
  };

  const handleDeleteMessage = async (messageId) => {
    if (!activeConversation) return;

    // Update via API
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/chat/messages/${messageId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setMessages(prev => prev.map(msg =>
          msg._id === messageId ? { ...msg, text: 'تم حذف هذه الرسالة', isDeleted: true } : msg
        ));
      }
    } catch (error) {
      console.error('Error deleting message:', error);
    }

    // Also emit via socket
    socketRef.current.emit('delete_message', {
      messageId,
      senderId: currentUser._id,
      conversationId: activeConversation._id
    });
  };

  const handleTyping = () => {
    if (!activeConversation) return;

    socketRef.current.emit('typing', {
      conversationId: activeConversation._id,
      userId: currentUser._id,
      userName: currentUser.name
    });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socketRef.current.emit('stop_typing', {
        conversationId: activeConversation._id,
        userId: currentUser._id,
        userName: currentUser.name
      });
    }, 2000);
  };

  const getOtherParticipant = (conversation) => {
    if (!conversation?.participants) return null;
    return conversation.participants.find(p => p._id !== currentUser._id) || conversation.participants[0];
  };

  const isOtherUserOnline = () => {
    const otherUser = getOtherParticipant(activeConversation);
    if (!otherUser) return false;
    const oid = otherUser._id ?? otherUser;
    return onlineUsers.has(String(oid)) || onlineUsers.has(oid);
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const renderReadStatus = (msg) => {
    const senderId = msg.sender?._id ?? msg.sender;
    const isMe = String(senderId) === String(currentUser._id);
    if (!isMe) return null;

    if (msg.isRead) {
      return (
        <span title="شُوهدت" className="inline-flex items-center">
          <CheckCheck size={12} className="text-blue-500 ml-1" aria-hidden />
        </span>
      );
    }
    return (
      <span title="مُرسلة" className="inline-flex items-center">
        <Check size={12} className="text-gray-400 ml-1" aria-hidden />
      </span>
    );
  };

  if (!currentUser) {
    return <div className="text-center p-10 font-arabic text-xl">يجب تسجيل الدخول لعرض المحادثات!</div>;
  }

  return (
    <div className="max-w-6xl mx-auto md:my-6 font-arabic h-[100dvh] md:h-[80vh] flex flex-col md:flex-row md:border border-gray-200 md:rounded-xl overflow-hidden bg-[#f0f2f5] md:bg-white md:shadow-sm w-full">
      {/* Sidebar: Conversations List */}
      <div className={`${showConversations ? 'flex' : 'hidden'} md:flex w-full md:w-1/3 bg-gray-50 md:border-l border-gray-200 flex-col h-full overflow-hidden`}>
        <div className="p-4 bg-primary text-primary-foreground font-bold text-lg flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="hover:bg-primary-foreground/20 p-2 rounded-full transition-colors flex items-center justify-center"
            title="رجوع للخلف"
          >
            <ArrowRight size={20} />
          </button>
          <span>محادثاتي</span>
        </div>

        {loading ? (
          <div className="flex justify-center mt-10 text-primary"><Loader2 className="animate-spin" size={32} /></div>
        ) : conversations.length === 0 ? (
          <div className="p-6 text-gray-500 text-center">لا توجد محادثات سابقة.</div>
        ) : (
          <div className="overflow-y-auto flex-1">
            {conversations.map((conv) => {
              const otherUser = getOtherParticipant(conv);
              const isActive = activeConversation?._id === conv._id;
              const otherId = otherUser?._id ?? otherUser;
              const isOnline = otherUser && (onlineUsers.has(String(otherId)) || onlineUsers.has(otherId));
              const unreadCount = unreadCountForUser(conv.unreadCount, currentUser._id);

              return (
                <div
                  key={conv._id}
                  onClick={() => { setActiveConversation(conv); setShowConversations(false); }}
                  className={`p-4 border-b border-gray-100 cursor-pointer transition-colors duration-200 flex items-center gap-3 relative
                    ${isActive ? 'bg-blue-50 border-r-4 border-l-0 border-r-primary' : 'hover:bg-gray-100'}
                  `}
                >
                  <div className="relative">
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 overflow-hidden">
                      {otherUser?.profileImg ? (
                        <img src={buildUserImageUrl(otherUser.profileImg)} alt={otherUser.name} className="w-full h-full object-cover" />
                      ) : (
                        <UserIcon size={24} />
                      )}
                    </div>
                    {isOnline && (
                      <div className="absolute bottom-0 left-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full" />
                    )}
                  </div>
                  <div className="flex-1 overflow-hidden text-right">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-800 truncate">{otherUser?.name || 'مستخدم غير معروف'}</h3>
                      {unreadCount > 0 && (
                        <span className="bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                          {unreadCount}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 truncate">
                      {conv.lastMessage?.isDeleted ? 'تم حذف هذه الرسالة' :
                       conv.lastMessage?.text ? (conv.lastMessage.isEdited ? '(معدل) ' : '') + conv.lastMessage.text : 'بدء المحادثة...'}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Main Chat Area */}
      <div className={`${showConversations ? 'hidden' : 'flex'} md:flex w-full md:w-2/3 flex-col bg-[#f0f2f5] relative h-full overflow-hidden`}>
        {activeConversation ? (
          <>
            {/* Chat header */}
            <div className="p-4 bg-white border-b border-gray-200 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowConversations(true)}
                className="md:hidden hover:bg-gray-100 p-2 rounded-full transition-colors flex items-center justify-center shrink-0 text-gray-700"
                title="العودة للمحادثات"
              >
                <ArrowRight size={20} />
              </button>
              <div className="relative">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 overflow-hidden">
                  {getOtherParticipant(activeConversation)?.profileImg ? (
                    <img src={buildUserImageUrl(getOtherParticipant(activeConversation).profileImg)} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <UserIcon size={20} />
                  )}
                </div>
                {isOtherUserOnline() && (
                  <div className="absolute bottom-0 left-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
                )}
              </div>
              <div>
                <h2 className="font-bold text-gray-800">
                  {getOtherParticipant(activeConversation)?.name}
                </h2>
                <div className="flex items-center gap-1.5">
                  <Circle size={6} className={`fill-current ${isOtherUserOnline() ? 'text-green-500' : 'text-gray-400'}`} />
                  <p className="text-xs text-gray-500">
                    {isOtherUserOnline() ? 'نشط الآن' : 'غير متصل'}
                  </p>
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 p-3 sm:p-4 overflow-y-auto flex flex-col gap-3 min-h-0">
              {messages.map((msg, index) => {
                const senderId = msg.sender?._id ?? msg.sender;
                const isMe = String(senderId) === String(currentUser._id);
                const isEditing = editingMessage === msg._id;

                return (
                  <div key={msg._id || index} className={`w-full flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className="group max-w-[85%] sm:max-w-[70%]">
                      <div
                        onClick={() => {
                          if (!isMe || msg.isDeleted || isEditing) return;
                          setActionsMessageId((prev) => (prev === msg._id ? null : msg._id));
                        }}
                        className={`p-3 rounded-lg shadow-sm w-full break-words text-right relative
                          ${isMe
                            ? 'bg-primary text-primary-foreground rounded-tr-none'
                            : 'bg-white text-gray-800 rounded-tl-none border border-gray-100'
                          }
                          ${msg.isDeleted ? 'italic opacity-60' : ''}
                        `}
                      >
                        {isEditing ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={editText}
                              onChange={(e) => setEditText(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleEditMessage(msg._id);
                                if (e.key === 'Escape') setEditingMessage(null);
                              }}
                              className="flex-1 p-1 rounded bg-white/20 border border-white/30 text-white placeholder-white/60 text-sm"
                              autoFocus
                            />
                            <button type="button" onClick={() => handleEditMessage(msg._id)} className="p-1 hover:bg-white/20 rounded">
                              <Check size={14} className="text-green-400" />
                            </button>
                            <button type="button" onClick={() => setEditingMessage(null)} className="p-1 hover:bg-white/20 rounded">
                              <X size={14} className="text-red-400" />
                            </button>
                          </div>
                        ) : (
                          <>{msg.text}</>
                        )}

                        {/* تعديل / حذف: يظهر عند التمرير أو عند التركيز (أفضل للموبايل) */}
                        {isMe && !msg.isDeleted && !isEditing && (
                          <div
                            className={`z-10 items-center gap-1 bg-white rounded-lg shadow-md border border-gray-200 p-1
                              max-md:mt-2 max-md:justify-end max-md:w-fit max-md:ms-auto max-md:static
                              md:absolute md:top-1/2 md:-translate-y-1/2 md:end-full md:-me-px
                              transition-opacity
                              ${actionsMessageId === msg._id ? 'flex opacity-100 pointer-events-auto' : 'hidden md:flex opacity-0 pointer-events-none'}
                              md:group-hover:opacity-100 md:group-hover:pointer-events-auto
                              md:group-focus-within:opacity-100 md:group-focus-within:pointer-events-auto`}
                          >
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); setEditingMessage(msg._id); setEditText(msg.text); }}
                              className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                              title="تعديل"
                            >
                              <Pencil size={13} className="text-gray-500" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); handleDeleteMessage(msg._id); setActionsMessageId(null); }}
                              className="p-1.5 hover:bg-red-50 rounded transition-colors"
                              title="حذف"
                            >
                              <Trash2 size={13} className="text-red-500" />
                            </button>
                          </div>
                        )}
                      </div>

                      <div className={`flex items-center text-[10px] text-gray-400 mt-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
                        {renderReadStatus(msg)}
                        <span>
                          {formatTime(msg.createdAt)}
                          {msg.isEdited && !msg.isDeleted && ' • معدل'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Typing indicator */}
              {typingUser && (
                <div className="w-full flex justify-start">
                  <div className="max-w-[85%] sm:max-w-[70%]">
                  <div className="p-3 rounded-lg rounded-tl-none bg-white border border-gray-100 shadow-sm">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1">{typingUser} يكتب...</p>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Message Input Form */}
            <form onSubmit={handleSendMessage} className="p-3 sm:p-4 bg-white border-t border-gray-200 flex gap-2 shrink-0">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onInput={handleTyping}
                placeholder="اكتب رسالة..."
                className="flex-1 p-3 border border-gray-300 rounded-full focus:outline-none focus:border-primary text-right bg-white text-gray-900 placeholder-gray-400"
                dir="rtl"
              />
              <button
                type="submit"
                disabled={!newMessage.trim()}
                className="bg-primary text-primary-foreground w-12 h-12 rounded-full flex items-center justify-center hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                <div style={{ transform: 'scaleX(-1)' }}><Send size={20} /></div>
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center flex-col text-gray-400 gap-4">
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center opacity-50">
              <Send size={48} className="text-gray-400" />
            </div>
            <p className="text-xl">اختر محادثة للبدء في التواصل</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;
