import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const apiService = {
  // Check backend health
  checkHealth: async () => {
    try {
      const res = await apiClient.get('/health');
      return res.data;
    } catch {
      return null;
    }
  },

  sendWidgetMessage: async (content: string) => {
    try {
      const res = await apiClient.post('/widget/send', { content });
      return res.data?.data || null;
    } catch {
      return null;
    }
  },

  sendConversationMessage: async (conversationId: string, content: string, sender: 'user' | 'agent' | 'bot' = 'user') => {
    try {
      const res = await apiClient.post(`/conversations/${conversationId}/messages`, { content, sender });
      return res.data?.data || null;
    } catch {
      return null;
    }
  },

  // Conversations
  getConversations: async (channel?: string, status?: string, search?: string) => {
    try {
      const res = await apiClient.get('/conversations', {
        params: { channel, status, search }
      });
      return res.data.data;
    } catch {
      return null;
    }
  },

  getMessages: async (conversationId: string) => {
    try {
      const res = await apiClient.get(`/conversations/${conversationId}/messages`);
      return res.data.data;
    } catch {
      return null;
    }
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
    try {
      const res = await apiClient.post(`/conversations/${conversationId}/toggle-bot`);
      return res.data;
    } catch {
      return null;
    }
  },

  submitRating: async (conversationId: string, score: number, feedback: string) => {
    try {
      const res = await apiClient.post(`/conversations/${conversationId}/rating`, {
        score,
        feedback
      });
      return res.data.data;
    } catch {
      return null;
    }
  },

  // Bot Flow
  getBotFlow: async () => {
    try {
      const res = await apiClient.get('/bot/flow');
      return res.data.data;
    } catch {
      return null;
    }
  },

  saveBotFlow: async (data: any) => {
    try {
      const res = await apiClient.post('/bot/flow', data);
      return res.data.data;
    } catch {
      return null;
    }
  },

  // Knowledge & FAQs
  getFAQs: async () => {
    try {
      const res = await apiClient.get('/knowledge/faqs');
      return res.data.data;
    } catch {
      return null;
    }
  },

  createFAQ: async (question: string, answer: string, category: string) => {
    try {
      const res = await apiClient.post('/knowledge/faqs', { question, answer, category });
      return res.data.data;
    } catch {
      return null;
    }
  },

  getDocs: async () => {
    try {
      const res = await apiClient.get('/knowledge/docs');
      return res.data.data;
    } catch {
      return null;
    }
  },

  // Analytics
  getAnalytics: async () => {
    try {
      const res = await apiClient.get('/analytics');
      return res.data.data;
    } catch {
      return null;
    }
  }
};
