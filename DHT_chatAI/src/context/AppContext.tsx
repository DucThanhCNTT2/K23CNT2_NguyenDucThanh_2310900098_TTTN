import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Conversation, 
  Message, 
  UserProfile, 
  ConversationStatus, 
  ChannelType,
  ProductCard,
  QuickReply
} from '../types';
import { 
  currentUser as mockUser, 
  initialConversations, 
  sampleMessages,
  cannedResponses
} from '../mock/data';
import { apiService } from '../services/api';

interface AppContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  currentUser: UserProfile;
  conversations: Conversation[];
  activeConversationId: string;
  setActiveConversationId: (id: string) => void;
  activeConversation?: Conversation;
  messages: Record<string, Message[]>;
  isAgentOnline: boolean;
  setIsAgentOnline: (online: boolean) => void;
  toggleBotSwitch: (conversationId: string) => void;
  sendMessage: (conversationId: string, content: string, sender?: 'user' | 'agent' | 'bot', cards?: ProductCard[], quickReplies?: QuickReply[]) => void;
  updateConversationStatus: (conversationId: string, status: ConversationStatus) => void;
  filterChannel: ChannelType | 'all';
  setFilterChannel: (channel: ChannelType | 'all') => void;
  filterStatus: ConversationStatus | 'all';
  setFilterStatus: (status: ConversationStatus | 'all') => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  
  // Client Live Chat Widget state
  widgetOpen: boolean;
  setWidgetOpen: (open: boolean) => void;
  widgetMessages: Message[];
  sendWidgetMessage: (content: string) => void;
  isWidgetTyping: boolean;
  widgetRatingSubmitted: boolean;
  submitWidgetRating: (score: number, feedback: string) => void;
  clearWidgetHistory: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('dht_theme') as 'light' | 'dark') || 'light';
  });

  const [currentUser] = useState<UserProfile>(mockUser);
  const [isAgentOnline, setIsAgentOnline] = useState<boolean>(true);
  const [conversations, setConversations] = useState<Conversation[]>(initialConversations);
  const [activeConversationId, setActiveConversationId] = useState<string>('conv_01');
  const [messages, setMessages] = useState<Record<string, Message[]>>(sampleMessages);
  
  const [filterChannel, setFilterChannel] = useState<ChannelType | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<ConversationStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Client Widget state
  const [widgetOpen, setWidgetOpen] = useState<boolean>(false);
  const [isWidgetTyping, setIsWidgetTyping] = useState<boolean>(false);
  const [widgetRatingSubmitted, setWidgetRatingSubmitted] = useState<boolean>(false);
  
  const [widgetMessages, setWidgetMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem('dht_widget_messages');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing widget messages', e);
      }
    }
    return [
      {
        id: 'wm_welcome',
        conversationId: 'widget_client',
        sender: 'bot',
        senderName: 'DHT AI Assistant',
        content: 'Xin chào Quý khách! Em là Trợ lý Trí tuệ Nhân tạo đa kênh của DHT AI. Rất vui được hỗ trợ Anh/Chị!',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'seen',
        quickReplies: [
          { id: 'wqr_1', label: 'Xem bảng giá', payload: 'price' },
          { id: 'wqr_2', label: 'Tích hợp FB & Zalo', payload: 'omnichannel' },
          { id: 'wqr_3', label: 'Gặp tư vấn viên', payload: 'human' }
        ]
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem('dht_theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('dht_widget_messages', JSON.stringify(widgetMessages));
  }, [widgetMessages]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const activeConversation = conversations.find(c => c.id === activeConversationId);

  // Toggle Bot Switch (1-Click Switch can thiệp/tiếp quản)
  const toggleBotSwitch = (conversationId: string) => {
    setConversations(prev => prev.map(conv => {
      if (conv.id === conversationId) {
        const nextBotState = !conv.isBotHandling;
        const newStatus: ConversationStatus = nextBotState ? 'bot_active' : 'assigned';
        return {
          ...conv,
          isBotHandling: nextBotState,
          status: newStatus,
          assignedAgent: nextBotState ? undefined : {
            id: currentUser.id,
            name: currentUser.name,
            avatar: currentUser.avatar
          }
        };
      }
      return conv;
    }));

    // Gửi tin nhắn hệ thống thông báo chuyển đổi
    const targetConv = conversations.find(c => c.id === conversationId);
    const isNowBot = targetConv ? !targetConv.isBotHandling : false;
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const systemNotice: Message = {
      id: 'sys_' + Date.now(),
      conversationId,
      sender: 'agent',
      senderName: 'Hệ thống DHT AI',
      content: isNowBot 
        ? '🤖 [Hệ thống] Bot AI đã được kích hoạt tự động xử lý hội thoại này.'
        : `👨‍💼 [Hệ thống] Tư vấn viên ${currentUser.name} đã tiếp quản cuộc trò chuyện.`,
      timestamp: nowTime,
      status: 'seen'
    };

    setMessages(prev => ({
      ...prev,
      [conversationId]: [...(prev[conversationId] || []), systemNotice]
    }));
  };

  const sendMessage = (
    conversationId: string, 
    content: string, 
    sender: 'user' | 'agent' | 'bot' = 'agent',
    cards?: ProductCard[],
    quickReplies?: QuickReply[]
  ) => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newMsg: Message = {
      id: 'msg_' + Date.now(),
      conversationId,
      sender,
      senderName: sender === 'agent' ? currentUser.name : (sender === 'bot' ? 'DHT Bot AI' : 'Khách hàng'),
      content,
      timestamp: time,
      status: 'sent',
      cards,
      quickReplies
    };

    setMessages(prev => ({
      ...prev,
      [conversationId]: [...(prev[conversationId] || []), newMsg]
    }));

    setConversations(prev => prev.map(c => {
      if (c.id === conversationId) {
        return {
          ...c,
          lastMessage: newMsg,
          updatedAt: 'Vừa xong'
        };
      }
      return c;
    }));

    if (sender === 'user') {
      const requiresHuman = /(nhân viên|tư vấn viên|tư vấn|agent|human|gặp.*người|chat.*người)/i.test(content);

      setTimeout(async () => {
        const aiResponse = await apiService.sendConversationMessage(conversationId, content, 'user');
        const botReply = aiResponse?.botReply || {
          id: 'msg_ai_' + Date.now(),
          conversationId,
          sender: 'bot' as const,
          senderName: 'DHT AI Assistant',
          content: 'Dạ, em đã nhận tin nhắn của Anh/Chị. Nếu cần hỗ trợ nhanh, vui lòng cho em biết mục tiêu hoặc vấn đề bạn đang gặp phải ạ.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: 'seen' as const
        };

        if (requiresHuman) {
          setConversations(prev => prev.map(c => c.id === conversationId ? {
            ...c,
            isBotHandling: false,
            status: 'assigned',
            assignedAgent: {
              id: currentUser.id,
              name: currentUser.name,
              avatar: currentUser.avatar
            }
          } : c));

          const handoffNotice: Message = {
            id: 'handoff_' + Date.now(),
            conversationId,
            sender: 'agent',
            senderName: 'Hệ thống DHT AI',
            content: '👨‍💼 [Hệ thống] Khách hàng yêu cầu được trao đổi với nhân viên hỗ trợ. Chuyển cuộc trò chuyện sang CSKH ngay.',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            status: 'seen'
          };

          setMessages(prev => ({
            ...prev,
            [conversationId]: [...(prev[conversationId] || []), handoffNotice, botReply]
          }));
          return;
        }

        setMessages(prev => ({
          ...prev,
          [conversationId]: [...(prev[conversationId] || []), botReply]
        }));
      }, 1000);
    }

    setTimeout(() => {
      setMessages(prev => ({
        ...prev,
        [conversationId]: (prev[conversationId] || []).map(m => 
          m.id === newMsg.id ? { ...m, status: 'delivered' } : m
        )
      }));
    }, 800);

    setTimeout(() => {
      setMessages(prev => ({
        ...prev,
        [conversationId]: (prev[conversationId] || []).map(m => 
          m.id === newMsg.id ? { ...m, status: 'seen' } : m
        )
      }));
    }, 1800);
  };

  const updateConversationStatus = (conversationId: string, status: ConversationStatus) => {
    setConversations(prev => prev.map(c => c.id === conversationId ? { ...c, status } : c));
  };

  const sendWidgetMessage = async (content: string) => {
    if (!content.trim()) return;

    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg: Message = {
      id: 'wm_' + Date.now(),
      conversationId: 'widget_client',
      sender: 'user',
      content,
      timestamp: time,
      status: 'sent'
    };

    setWidgetMessages(prev => [...prev, userMsg]);
    setIsWidgetTyping(true);

    setTimeout(() => {
      setWidgetMessages(prev => prev.map(m => m.id === userMsg.id ? { ...m, status: 'seen' } : m));
    }, 1000);

    try {
      const res = await apiService.sendWidgetMessage(content);
      const assistantReply = res || {
        id: 'wm_bot_' + Date.now(),
        conversationId: 'widget_client',
        sender: 'bot',
        senderName: 'DHT AI Assistant',
        content: 'Dạ cảm ơn Anh/Chị đã gửi tin nhắn! DHT AI có thể hỗ trợ thêm thông tin gì không ạ?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'seen'
      };

      setTimeout(() => {
        setIsWidgetTyping(false);
        const botMsg: Message = {
          id: assistantReply.id || 'wm_bot_' + Date.now(),
          conversationId: 'widget_client',
          sender: assistantReply.sender || 'bot',
          senderName: assistantReply.senderName || 'DHT AI Assistant',
          content: assistantReply.content || 'Dạ, em sẽ hỗ trợ quý khách ngay ạ.',
          timestamp: assistantReply.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: 'seen',
          cards: assistantReply.cards,
          quickReplies: assistantReply.quickReplies
        };

        setWidgetMessages(prev => [...prev, botMsg]);
      }, 1800);
    } catch {
      setTimeout(() => {
        setIsWidgetTyping(false);
        const fallback: Message = {
          id: 'wm_bot_' + Date.now(),
          conversationId: 'widget_client',
          sender: 'bot',
          senderName: 'DHT AI Assistant',
          content: 'Dạ, em đã nhận được tin nhắn. Anh/Chị cần hỗ trợ về giải pháp AI, báo giá hay tích hợp kênh không ạ?',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: 'seen',
          quickReplies: [
            { id: 'wqr_1', label: 'Xem bảng giá', payload: 'price' },
            { id: 'wqr_2', label: 'Tích hợp FB & Zalo', payload: 'omnichannel' },
            { id: 'wqr_3', label: 'Gặp tư vấn viên', payload: 'human' }
          ]
        };
        setWidgetMessages(prev => [...prev, fallback]);
      }, 1800);
    }
  };

  const submitWidgetRating = (score: number, feedback: string) => {
    setWidgetRatingSubmitted(true);
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const thankMsg: Message = {
      id: 'wm_thank_' + Date.now(),
      conversationId: 'widget_client',
      sender: 'bot',
      senderName: 'DHT AI Bot',
      content: `⭐ Cảm ơn bạn đã đánh giá ${score} sao cho dịch vụ của chúng tôi! Góp ý của bạn: "${feedback || 'Rất hài lòng'}" đã được ghi nhận.`,
      timestamp: time,
      status: 'seen'
    };
    setWidgetMessages(prev => [...prev, thankMsg]);
  };

  const clearWidgetHistory = () => {
    localStorage.removeItem('dht_widget_messages');
    setWidgetRatingSubmitted(false);
    setWidgetMessages([
      {
        id: 'wm_welcome_reset',
        conversationId: 'widget_client',
        sender: 'bot',
        senderName: 'DHT AI Assistant',
        content: 'Cuộc trò chuyện đã được làm mới. Em có thể hỗ trợ gì cho Anh/Chị hôm nay?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'seen',
        quickReplies: [
          { id: 'wqr_reset_1', label: 'Tư vấn giải pháp AI', payload: 'solution' },
          { id: 'wqr_reset_2', label: 'Báo giá phần mềm', payload: 'pricing' }
        ]
      }
    ]);
  };

  return (
    <AppContext.Provider
      value={{
        theme,
        toggleTheme,
        currentUser,
        conversations,
        activeConversationId,
        setActiveConversationId,
        activeConversation,
        messages,
        isAgentOnline,
        setIsAgentOnline,
        toggleBotSwitch,
        sendMessage,
        updateConversationStatus,
        filterChannel,
        setFilterChannel,
        filterStatus,
        setFilterStatus,
        searchQuery,
        setSearchQuery,
        widgetOpen,
        setWidgetOpen,
        widgetMessages,
        sendWidgetMessage,
        isWidgetTyping,
        widgetRatingSubmitted,
        submitWidgetRating,
        clearWidgetHistory
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
