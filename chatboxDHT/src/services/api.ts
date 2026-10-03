import axios from 'axios';
import { 
  AccountUser, 
  BotNode, 
  FAQItem, 
  KnowledgeDocument, 
  UserProfile, 
  UserRole,
  BillingTransaction,
  BillingPaymentConfig,
  UserAnalyticsData 
} from '../types';

function normalizeApiBaseUrl(value?: string): string {
  const baseUrl = (value || '/api').replace(/\/+$/, '');
  if (!baseUrl || baseUrl === '/') return '/api';
  return baseUrl.endsWith('/api') ? baseUrl : `${baseUrl}/api`;
}

const API_BASE_URL = normalizeApiBaseUrl(import.meta.env.VITE_API_URL);

export type OAuthProvider = 'google' | 'facebook' | 'github';

export interface WidgetMessage {
  id: string;
  sender: 'user' | 'bot' | 'agent';
  content: string;
  timestamp?: string;
  quickReplies?: Array<{ id?: string; label: string; payload?: string }>;
  cards?: Array<{ image?: string; title: string; price?: string; description?: string }>;
}

interface WidgetMessageResponse {
  success: boolean;
  data: {
    userMessage: WidgetMessage;
    botReply: WidgetMessage;
    reply: string;
  };
}

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
      if (!['/login', '/signup', '/auth/callback'].includes(window.location.pathname)) {
        window.location.replace('/login?session=expired');
      }
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

  getOAuthProviders: async () => {
    const res = await apiClient.get<{
      success: boolean;
      data: Record<OAuthProvider, boolean>;
    }>('/auth/oauth/providers');
    return res.data.data;
  },

  getOAuthStartUrl: (provider: OAuthProvider) => {
    return new URL(`${API_BASE_URL}/auth/oauth/${provider}`, window.location.origin).toString();
  },

  exchangeOAuthLogin: async () => {
    const res = await apiClient.post<{
      success: boolean;
      token: string;
      user: UserProfile;
    }>('/auth/oauth/exchange', {}, { withCredentials: true });
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
  },

  getBillingHistory: async () => {
    const res = await apiClient.get<{ success: boolean; data: BillingTransaction[] }>('/billing/history');
    return res.data?.data || [];
  },

  getBillingPaymentConfig: async () => {
    const res = await apiClient.get<{ success: boolean; data: BillingPaymentConfig }>('/billing/payment-config');
    return res.data?.data || null;
  },

  purchaseAddon: async (payload: { packId: string }) => {
    const res = await apiClient.post<{
      success: boolean;
      message: string;
      transaction: BillingTransaction;
      newTotalExtra: number;
    }>('/billing/purchase-addon', payload);
    return res.data;
  },

  getUserBillingAnalytics: async () => {
    const res = await apiClient.get<{ success: boolean; data: UserAnalyticsData }>('/billing/analytics');
    return res.data?.data || null;
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
    } catch {
      console.error('Health check request failed.');
      return null;
    }
  },

  // Widget Client APIs
  sendWidgetMessage: async (content: string) => {
    try {
      const res = await apiClient.post<WidgetMessageResponse>(
        '/widget/send',
        { content },
        { timeout: 35000, withCredentials: true }
      );
      return res.data?.data || null;
    } catch {
      console.error('Widget message request failed.');
      return null;
    }
  },

  getWidgetMessages: async () => {
    const res = await apiClient.get<{ success: boolean; data: WidgetMessage[] }>(
      '/widget/messages',
      { withCredentials: true }
    );
    return res.data.data;
  },

  // Conversation & Message APIs
  sendConversationMessage: async (conversationId: string, content: string, sender: 'user' | 'agent' | 'bot' = 'user') => {
    try {
      const res = await apiClient.post(`/conversations/${conversationId}/messages`, { content, sender }, { timeout: 35000 });
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
  },

  // 4, 21, 27. Channel Customers Management APIs
  getChannelCustomers: async (channel?: string, search?: string) => {
    try {
      const res = await apiClient.get<{ success: boolean; data: any[] }>('/customers', {
        params: { channel, search }
      });
      return res.data.data || [];
    } catch {
      return [];
    }
  },

  getCustomerById: async (id: string) => {
    const res = await apiClient.get<{ success: boolean; data: any }>(`/customers/${id}`);
    return res.data.data;
  },

  updateCustomer: async (id: string, data: any) => {
    const res = await apiClient.put<{ success: boolean; data: any }>(`/customers/${id}`, data);
    return res.data.data;
  },

  mergeCustomers: async (primaryCustomerId: string, secondaryCustomerId: string) => {
    const res = await apiClient.post<{ success: boolean; message: string; data: any }>('/customers/merge', {
      primaryCustomerId,
      secondaryCustomerId
    });
    return res.data;
  },

  // 8, 9, 10, 24. Channel Config & Integration APIs
  getChannelConfigs: async () => {
    try {
      const res = await apiClient.get<{ success: boolean; data: any[] }>('/channel-config');
      return res.data.data || [];
    } catch {
      return [];
    }
  },

  updateChannelConfig: async (channel: string, data: any) => {
    const res = await apiClient.put<{ success: boolean; message: string; data: any }>(`/channel-config/${channel}`, data);
    return res.data;
  },

  testChannelConnection: async (channel: string) => {
    const res = await apiClient.post<{ success: boolean; channel: string; latencyMs: number; message: string }>(
      `/channel-config/test-connection/${channel}`
    );
    return res.data;
  },

  simulateChannelMessage: async (payload: { channel: string; senderId?: string; senderName?: string; senderPhone?: string; content: string }) => {
    const res = await apiClient.post<{ success: boolean; message: string; data: any }>('/channel-config/simulate-message', payload);
    return res.data;
  },

  // 26, 28, 29, 30, 31. Testing & Benchmark APIs
  testIntentAccuracy: async () => {
    const res = await apiClient.get<{
      success: boolean;
      accuracyPercentage: number;
      passed: number;
      total: number;
      avgLatencyMs: number;
      details: any[];
    }>('/test-suite/intent-accuracy');
    return res.data;
  },

  testCustomQuery: async (text: string) => {
    const res = await apiClient.post<{
      success: boolean;
      query: string;
      intent: string;
      confidence: number;
      entities: any;
      latencyMs: number;
      needsHandoff: boolean;
    }>('/test-suite/query', { text });
    return res.data;
  },

  testChannelResponseTime: async (channel: string, message: string) => {
    const res = await apiClient.post<{
      success: boolean;
      channel: string;
      message: string;
      botReply: string;
      totalElapsedMs: number;
      serverProcessingMs: number;
      intent: string;
      handledBy: string;
    }>('/test-suite/response-time', { channel, message });
    return res.data;
  },

  testErrorSimulation: async (errorType: string) => {
    const res = await apiClient.post<{
      success: boolean;
      errorType: string;
      handled: boolean;
      message: string;
    }>('/test-suite/simulate-error', { errorType });
    return res.data;
  },

  getSecurityAuditStatus: async () => {
    const res = await apiClient.get<{
      success: boolean;
      securityChecks: Array<{ name: string; status: string; detail: string }>;
      auditedAt: string;
    }>('/test-suite/security-audit');
    return res.data;
  }
};