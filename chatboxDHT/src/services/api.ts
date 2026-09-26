import axios from 'axios';
import { 
  AccountUser, 
  BotNode, 
  FAQItem, 
  KnowledgeDocument, 
  UserProfile, 
  UserRole,
  BillingTransaction,
  UserAnalyticsData 
} from '../types';

const API_BASE_URL = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json'
  }
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    return Promise.reject(error);
  }
);

export const apiService = {
  // Auth APIs
  login: async (email: string, password: string) => {
    const res = await apiClient.post<{ success: boolean; token: string; user: UserProfile }>(
      '/auth/login',
      { email, password }
    );
    return res.data;
  },

  requestPasswordReset: async (email: string) => {
    const res = await apiClient.post<{ success: boolean; message: string }>(
      '/auth/forgot-password',
      { email },
      { timeout: 30000 }
    );
    return res.data;
  },

  verifyPasswordResetCode: async (email: string, code: string) => {
    const res = await apiClient.post<{ success: boolean; resetToken: string }>(
      '/auth/verify-reset-code',
      { email, code }
    );
    return res.data;
  },

  resetPassword: async (email: string, resetToken: string, newPassword: string) => {
    const res = await apiClient.post<{ success: boolean; message: string }>(
      '/auth/reset-password',
      { email, resetToken, newPassword }
    );
    return res.data;
  },

  signup: async (payload: {
    companyName: string;
    fullName: string;
    email: string;
    password: string;
  }) => {
    const res = await apiClient.post<{ success: boolean; token: string; user: UserProfile }>(
      '/auth/signup',
      payload
    );
    return res.data;
  },

  logout: async () => {
    try {
      await apiClient.post('/auth/logout');
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  },

  getCurrentUser: async () => {
    const res = await apiClient.get<{ success: boolean; data: UserProfile }>('/auth/me');
    return res.data.data;
  },

  updateProfile: async (payload: {
    name?: string;
    avatar?: string;
    phone?: string;
    companyName?: string;
    currentPassword?: string;
    newPassword?: string;
  }) => {
    const res = await apiClient.put<{ success: boolean; message?: string; data?: UserProfile }>(
      '/auth/profile',
      payload
    );
    return res.data;
  },

  getUserUsage: async () => {
    try {
      const res = await apiClient.get<{
        success: boolean;
        data: {
          usedMessages: number;
          maxMessages: number;
          baseMessages?: number;
          extraMessages?: number;
          percentage: number;
          remainingMessages: number;
          plan?: string;
        };
      }>('/users/usage');
      return res.data?.data || null;
    } catch {
      return null;
    }
  },

  getBillingHistory: async () => {
    try {
      const res = await apiClient.get<{ success: boolean; data: BillingTransaction[] }>('/billing/history');
      return res.data?.data || [];
    } catch {
      return [];
    }
  },

  purchaseAddon: async (payload: {
    packId: string;
    packName: string;
    messagesCount: number;
    amount: number;
    paymentMethod?: string;
  }) => {
    const res = await apiClient.post<{
      success: boolean;
      message: string;
      transaction: BillingTransaction;
      newTotalExtra: number;
    }>('/billing/purchase-addon', payload);
    return res.data;
  },

  getUserBillingAnalytics: async () => {
    try {
      const res = await apiClient.get<{ success: boolean; data: UserAnalyticsData }>('/billing/analytics');
      return res.data?.data || null;
    } catch {
      return null;
    }
  },

  getUsers: async () => {
    const res = await apiClient.get<{ success: boolean; data: AccountUser[] }>('/users');
    return res.data.data;
  },

  updateUserRole: async (userId: string, role: UserRole) => {
    const res = await apiClient.patch<{ success: boolean; data: AccountUser }>(`/users/${userId}/role`, { role });
    return res.data.data;
  },

  deleteUser: async (userId: string) => {
    const res = await apiClient.delete<{ success: boolean; message: string }>(`/users/${userId}`);
    return res.data;
  },

  checkHealth: async () => {
    try {
      const res = await apiClient.get('/health');
      return res.data;
    } catch (error) {
      console.error('Health check failed', error);
      return null;
    }
  },

  // Widget Client APIs
  sendWidgetMessage: async (content: string) => {
    try {
      const res = await apiClient.post('/widget/send', { content });
      return res.data?.data || null;
    } catch (error) {
      console.error('Widget message failed', error);
      return null;
    }
  },

  // Conversation & Message APIs
  sendConversationMessage: async (conversationId: string, content: string, sender: 'user' | 'agent' | 'bot' = 'user') => {
    try {
      const res = await apiClient.post(`/conversations/${conversationId}/messages`, { content, sender });
      return res.data?.data || null;
    } catch {
      return null;
    }
  },

  getConversations: async (channel?: string, status?: string, search?: string) => {
    const res = await apiClient.get('/conversations', { params: { channel, status, search } });
    return res.data.data;
  },

  getMessages: async (conversationId: string) => {
    const res = await apiClient.get(`/conversations/${conversationId}/messages`);
    return res.data.data;
  },

  sendMessage: async (conversationId: string, content: string, sender: string = 'agent') => {
    try {
      const res = await apiClient.post(`/conversations/${conversationId}/messages`, {
        content,
        sender
      });
      return res.data.data;
    } catch {
      return null;
    }
  },

  toggleBotSwitch: async (conversationId: string) => {
    const res = await apiClient.post(`/conversations/${conversationId}/toggle-bot`);
    return res.data;
  },

  // Đánh dấu đã đọc cuộc trò chuyện
  markAsRead: async (conversationId: string) => {
    try {
      const res = await apiClient.post(`/conversations/${conversationId}/read`);
      return res.data;
    } catch {
      return null;
    }
  },

  // Lấy hoặc Tạo mới cuộc hội thoại dành riêng cho User hiện tại từ User Portal
  getOrCreateUserConversation: async (userId: string, userName: string, userEmail: string) => {
    try {
      const res = await apiClient.post('/conversations/user-session', {
        userId,
        userName,
        userEmail
      });
      return res.data?.data || null;
    } catch {
      return null;
    }
  },

  // Bot Builder APIs
  getBotFlow: async () => {
    try {
      const res = await apiClient.get('/bot/flow');
      return res.data.data;
    } catch {
      return null;
    }
  },

  saveBotFlow: async (data: any) => {
    const res = await apiClient.post<{ data: { nodes: BotNode[]; config?: object } }>('/bot/flow', data);
    return res.data.data;
  },

  // Knowledge Base (FAQ & Docs) APIs
  getFAQs: async () => {
    const res = await apiClient.get<{ data: FAQItem[] }>('/knowledge/faqs');
    return res.data.data;
  },

  createFAQ: async (question: string, answer: string, category: string) => {
    const res = await apiClient.post<{ data: FAQItem }>('/knowledge/faqs', { question, answer, category });
    return res.data.data;
  },

  deleteFAQ: async (id: string) => {
    await apiClient.delete(`/knowledge/faqs/${id}`);
  },

  getDocs: async () => {
    const res = await apiClient.get<{ data: KnowledgeDocument[] }>('/knowledge/docs');
    return res.data.data;
  },

  createDoc: async (payload: { name: string; size: string; type: string }) => {
    const res = await apiClient.post<{ data: KnowledgeDocument }>('/knowledge/docs', payload);
    return res.data.data;
  },

  // Analytics API
  getAnalytics: async () => {
    const res = await apiClient.get('/analytics');
    return res.data.data;
  }
};