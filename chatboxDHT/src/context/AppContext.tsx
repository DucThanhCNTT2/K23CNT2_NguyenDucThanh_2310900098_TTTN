import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Conversation,
  ChannelType,
  ConversationStatus,
  Message,
  MessageSenderType,
  UserProfile
} from '../types';
import { currentUser as mockUser, initialConversations, sampleMessages } from '../mock/data';
import { apiService } from '../services/api';
import { io } from 'socket.io-client';

interface AppContextType {
  theme: string;
  toggleTheme: () => void;
  isWidgetOpen: boolean;
  setWidgetOpen: (open: boolean) => void;
  conversations: Conversation[];
  setConversations: React.Dispatch<React.SetStateAction<Conversation[]>>;
  activeConversationId: string | null;
  setActiveConversationId: (id: string | null) => void;
  filterChannel: ChannelType | 'all';
  setFilterChannel: (channel: ChannelType | 'all') => void;
  filterStatus: ConversationStatus | 'all';
  setFilterStatus: (status: ConversationStatus | 'all') => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  activeConversation: Conversation | null;
  messages: Record<string, Message[]>;
  sendMessage: (
    conversationId: string,
    content: string,
    sender?: MessageSenderType
  ) => Promise<void>;
  toggleBotSwitch: (conversationId: string) => Promise<void>;
  updateConversationStatus: (
    conversationId: string,
    status: ConversationStatus
  ) => Promise<void>;
  currentUser: UserProfile;
  updateCurrentUser: (userData: Partial<UserProfile>) => void;
  isAgentOnline: boolean;
  setIsAgentOnline: React.Dispatch<React.SetStateAction<boolean>>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
  const [isWidgetOpen, setWidgetOpen] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>(initialConversations || []);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(
    initialConversations?.[0]?.id || 'conv_01'
  );
  const [filterChannel, setFilterChannel] = useState<ChannelType | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<ConversationStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [messages, setMessages] = useState<Record<string, Message[]>>(
    sampleMessages as Record<string, Message[]>
  );
  
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch {
        console.error('Could not parse the saved user profile.');
      }
    }
    return mockUser;
  });

  const updateCurrentUser = (userData: Partial<UserProfile>) => {
    setCurrentUser((prev) => {
      const updated = { ...prev, ...userData };
      localStorage.setItem('user', JSON.stringify(updated));
      return updated;
    });
  };
  const [isAgentOnline, setIsAgentOnline] = useState(true);

  const activeConversation =
    conversations.find((conversation) => conversation.id === activeConversationId) || null;

  const toggleTheme = () => {
    setTheme((prev) => {
      const nextTheme = prev === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme', nextTheme);
      return nextTheme;
    });
  };

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.documentElement.style.colorScheme = theme;
  }, [theme]);

  // Lắng nghe sự kiện Socket.io Realtime cho Admin
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token || !['admin', 'agent', 'supervisor'].includes(currentUser.role)) return;
    const socket = io({ auth: { token } });

    socket.on('new_message', (data: any) => {
      const incomingMessage: Message = {
        id: data.message.id || `msg_${Date.now()}`,
        conversationId: data.conversationId,
        sender: data.message.sender || 'bot',
        senderName: data.message.senderName,
        senderAvatar: data.message.senderAvatar,
        content: data.message.content || data.message.text || '',
        timestamp: data.message.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: data.message.status || 'delivered'
      };

      setMessages((prevMessages) => {
        const currentList = prevMessages[data.conversationId] || [];
        if (currentList.some((message) => message.id === incomingMessage.id)) {
          return prevMessages;
        }
        return {
          ...prevMessages,
          [data.conversationId]: [...currentList, incomingMessage]
        };
      });

      setConversations((prevConvs) => {
        const conversationIndex = prevConvs.findIndex((conversation) => conversation.id === data.conversationId);
        
        if (conversationIndex !== -1) {
          const updatedConversations = [...prevConvs];
          const existingConversation = updatedConversations[conversationIndex];
          updatedConversations[conversationIndex] = {
            ...existingConversation,
            channel: data.channel || data.customer?.channel || existingConversation.channel,
            customer: { ...existingConversation.customer, ...data.customer },
            status: data.status || existingConversation.status,
            isBotHandling: data.isBotHandling ?? existingConversation.isBotHandling,
            lastMessage: incomingMessage,
            unreadCount: data.unreadCount ?? (data.message.sender === 'user'
              ? (existingConversation.unreadCount || 0) + 1
              : existingConversation.unreadCount),
            updatedAt: 'Vừa xong'
          };
          return updatedConversations;
        } else {
          // Ép kiểu tường minh bằng as unknown as Conversation để tránh hoàn toàn lỗi TS
          const newConv = {
            id: data.conversationId,
            channel: data.channel || data.customer?.channel || 'website',
            customer: {
              ...(data.customer || {}),
              id: data.customer?.id || 'guest',
              name: data.customer?.name || 'Khách hàng mới',
              avatar: data.customer?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
            },
            status: data.status || 'bot_active',
            isBotHandling: data.isBotHandling ?? true,
            unreadCount: data.unreadCount ?? (data.message.sender === 'user' ? 1 : 0),
            lastMessage: incomingMessage,
            updatedAt: 'Vừa xong'
          } as unknown as Conversation;

          return [newConv, ...prevConvs];
        }
      });
    });

    return () => {
      socket.disconnect();
    };
  }, [currentUser]);

  useEffect(() => {
    const fetchApiConversations = async () => {
      try {
        const data = await apiService.getConversations();
        if (data?.length > 0) setConversations(data);
      } catch {
        // Keep mock conversations available when the API is offline.
      }
    };
    fetchApiConversations();
  }, []);

  useEffect(() => {
    if (!activeConversationId) return;

    const fetchMessages = async () => {
      try {
        const data = await apiService.getMessages(activeConversationId);
        if (data) setMessages((previous) => ({ ...previous, [activeConversationId]: data }));
      } catch {
        // Keep mock messages available when the API is offline.
      }
    };

    fetchMessages();
  }, [activeConversationId]);

  const sendMessage = async (
    conversationId: string,
    content: string,
    sender: MessageSenderType = 'agent'
  ) => {
    const optimisticMessage: Message = {
      id: `local_${Date.now()}`,
      conversationId,
      sender,
      senderName: sender === 'agent' ? currentUser.name : undefined,
      content,
      timestamp: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      }),
      status: 'sent'
    };

    setMessages((previous) => ({
      ...previous,
      [conversationId]: [...(previous[conversationId] || []), optimisticMessage]
    }));

    setConversations((previous) =>
      previous.map((conversation) =>
        conversation.id === conversationId
          ? {
              ...conversation,
              lastMessage: optimisticMessage,
              updatedAt: 'Vừa xong'
            }
          : conversation
      )
    );

    try {
      const data = await apiService.sendConversationMessage(conversationId, content, sender);
      if (!data) {
        setMessages((previous) => ({
          ...previous,
          [conversationId]: (previous[conversationId] || []).map((message) =>
            message.id === optimisticMessage.id ? { ...message, status: 'failed' } : message
          )
        }));
        return;
      }

      const responseMessages: Message[] =
        'userMessage' in data
          ? [data.userMessage, data.botReply]
          : [data];
      const responseIds = new Set(responseMessages.map((message) => message.id));

      setMessages((previous) => ({
        ...previous,
        [conversationId]: [
          ...(previous[conversationId] || []).filter(
            (message) => message.id !== optimisticMessage.id && !responseIds.has(message.id)
          ),
          ...responseMessages
        ]
      }));
    } catch {
      setMessages((previous) => ({
        ...previous,
        [conversationId]: (previous[conversationId] || []).map((message) =>
          message.id === optimisticMessage.id ? { ...message, status: 'failed' } : message
        )
      }));
    }
  };

  const toggleBotSwitch = async (conversationId: string) => {
    const conversation = conversations.find((item) => item.id === conversationId);
    if (!conversation) return;

    const isBotHandling = !conversation.isBotHandling;
    setConversations((previous) =>
      previous.map((item) =>
        item.id === conversationId
          ? {
              ...item,
              isBotHandling,
              status: isBotHandling ? 'bot_active' : 'assigned'
            }
          : item
      )
    );

    try {
      await apiService.toggleBotSwitch(conversationId);
    } catch {
      // Keep the local state usable when the API is offline.
    }
  };

  const updateConversationStatus = async (
    conversationId: string,
    status: ConversationStatus
  ) => {
    setConversations((previous) =>
      previous.map((conversation) =>
        conversation.id === conversationId ? { ...conversation, status } : conversation
      )
    );
  };

  return (
    <AppContext.Provider
      value={{
        theme,
        toggleTheme,
        isWidgetOpen,
        setWidgetOpen,
        conversations,
        setConversations,
        activeConversationId,
        setActiveConversationId,
        filterChannel,
        setFilterChannel,
        filterStatus,
        setFilterStatus,
        searchQuery,
        setSearchQuery,
        activeConversation,
        messages,
        sendMessage,
        toggleBotSwitch,
        updateConversationStatus,
        currentUser,
        updateCurrentUser,
        isAgentOnline,
        setIsAgentOnline
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};