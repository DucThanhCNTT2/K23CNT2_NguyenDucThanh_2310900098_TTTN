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
  const [theme, setTheme] = useState('light');
  const [isWidgetOpen, setWidgetOpen] = useState(true);
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
      const parsedUser = JSON.parse(savedUser);
      // Ưu tiên lấy trực tiếp thông tin user mới từ localStorage nếu có đầy đủ id/email
      return parsedUser; 
    } catch (e) {
      console.error("Lỗi parse user từ localStorage", e);
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
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

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
      if (!data) return;

      const responseMessages: Message[] =
        'userMessage' in data
          ? [data.userMessage, data.botReply]
          : [data];

      setMessages((previous) => ({
        ...previous,
        [conversationId]: [
          ...(previous[conversationId] || []).filter(
            (message) => message.id !== optimisticMessage.id
          ),
          ...responseMessages
        ]
      }));
    } catch {
      // The optimistic message remains visible when the API is offline.
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