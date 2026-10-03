import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, X, Minus, RefreshCw, MessageSquare, Sparkles, ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { apiService, type WidgetMessage } from '../../services/api';

export const LiveChatWidget: React.FC = () => {
  const appContext = useApp();
  const isWidgetOpen = appContext?.isWidgetOpen ?? true;
  const setWidgetOpen = appContext?.setWidgetOpen ?? (() => {});
  const navigate = useNavigate();

  const [messages, setMessages] = useState<WidgetMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [widgetError, setWidgetError] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef(false);

  const defaultStarterPrompts = [
    'Báo giá gói Pro',
    'Tích hợp Zalo & FB',
    'Kích hoạt dùng thử 14 ngày',
    'Gặp tư vấn viên'
  ];

  // Tự động cuộn xuống tin nhắn mới nhất
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Tải lịch sử gắn với cookie phiên widget do server ký.
  const fetchMessages = async () => {
    try {
      const data = await apiService.getWidgetMessages();
      setWidgetError('');
      if (data && data.length > 0) {
        setMessages(data);
      } else {
        setMessages([
          { 
            id: 'init_welcome', 
            sender: 'bot', 
            content: 'Dạ xin chào! Em là trợ lý AI thông minh của DHT ChatAI. Em sẵn sàng giải đáp mọi thắc mắc về tính năng, báo giá hoặc hướng dẫn tích hợp đa kênh 24/7 ạ!',
            quickReplies: [
              { id: 'qr_p', label: 'Báo giá chi tiết', payload: 'pricing' },
              { id: 'qr_z', label: 'Tích hợp Zalo & FB', payload: 'zalo' },
              { id: 'qr_t', label: 'Dùng thử 14 ngày', payload: 'trial' },
              { id: 'qr_h', label: 'Gặp chuyên viên CSKH', payload: 'human' }
            ]
          }
        ]);
      }
    } catch {
      setWidgetError('Không thể tải hội thoại. Vui lòng thử đồng bộ lại.');
      console.error('Không thể tải tin nhắn.');
    }
  };

  useEffect(() => {
    if (!isWidgetOpen) return;
    fetchMessages();
    const interval = setInterval(() => {
      if (!loadingRef.current) void fetchMessages();
    }, 10000);
    return () => clearInterval(interval);
  }, [isWidgetOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Gửi tin nhắn từ Khách hàng với Optimistic Update
  const handleSend = async (customText?: string) => {
    const userText = (customText || input).trim();
    if (!userText || loading) return;

    setInput('');
    const tempUserMsg: WidgetMessage = {
      id: 'pending-user-message',
      sender: 'user',
      content: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, tempUserMsg]);
    setWidgetError('');
    setLoading(true);
    loadingRef.current = true;

    try {
      const result = await apiService.sendWidgetMessage(userText);
      if (result?.botReply) {
        setMessages(prev => {
          const filtered = prev.filter(m => m.id !== tempUserMsg.id);
          return [
            ...filtered,
            result.userMessage,
            result.botReply
          ];
        });
      } else {
        setMessages((previous) => previous.filter((message) => message.id !== tempUserMsg.id));
        await fetchMessages();
        setWidgetError('Tin nhắn chưa gửi được. Vui lòng thử lại sau giây lát.');
      }
    } catch {
      console.error('Không thể gửi tin nhắn.');
      await fetchMessages();
      setWidgetError('Tin nhắn chưa gửi được. Vui lòng thử lại sau giây lát.');
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  };

  // Khi widget đang đóng -> Hiển thị nút Nổi Floating Action Button góc phải
  if (!isWidgetOpen) {
    return (
      <button
        onClick={() => setWidgetOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-tr from-indigo-600 via-indigo-600 to-purple-600 text-white shadow-xl shadow-indigo-500/35 flex items-center justify-center hover:scale-110 active:scale-95 transition-all group cursor-pointer"
        aria-label="Mở khung hỗ trợ AI"
        title="Mở khung hỗ trợ AI"
      >
        <MessageSquare className="w-6 h-6 group-hover:rotate-12 transition-transform" />
        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full animate-pulse" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-[410px] max-w-[calc(100vw-1.5rem)] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl shadow-indigo-950/25 border border-slate-200/80 dark:border-slate-800 overflow-hidden flex flex-col transition-all duration-300 animate-in fade-in slide-in-from-bottom-5">
      
      {/* Header Widget */}
      <div className="bg-gradient-to-r from-indigo-600 via-indigo-600 to-purple-600 p-4 text-white flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur border border-white/20 flex items-center justify-center shadow-inner">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 border-2 border-indigo-600 rounded-full animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-extrabold text-sm tracking-tight text-white">DHT ChatAI Support</h3>
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            </div>
            <p className="text-[11px] text-indigo-100 font-medium">Trực tuyến • Trí tuệ AI phản hồi tức thì</p>
          </div>
        </div>

        {/* Các nút hành động Header */}
        <div className="flex items-center gap-1 text-indigo-100">
          <button
            onClick={fetchMessages}
            className="p-1.5 rounded-xl hover:bg-white/15 hover:text-white transition-colors cursor-pointer"
            aria-label="Đồng bộ tin nhắn"
            title="Đồng bộ lại"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setWidgetOpen(false)}
            className="p-1.5 rounded-xl hover:bg-white/15 hover:text-white transition-colors cursor-pointer"
            aria-label="Thu nhỏ khung chat"
            title="Thu nhỏ"
          >
            <Minus className="w-4 h-4" />
          </button>
          <button
            onClick={() => setWidgetOpen(false)}
            className="p-1.5 rounded-xl hover:bg-white/15 hover:text-white transition-colors cursor-pointer"
            aria-label="Đóng khung chat"
            title="Đóng"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Khung chứa nội dung tin nhắn */}
      <div className="h-[380px] p-4 overflow-y-auto space-y-3.5 bg-slate-50/80 dark:bg-slate-950/50 text-xs scroll-smooth">
        {messages.map((m, idx) => {
          const isUser = m.sender === 'user';
          return (
            <div key={m.id || idx} className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-2`}>
              <div className={`max-w-[85%] p-3.5 rounded-2xl leading-relaxed shadow-xs transition-all ${
                isUser 
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-br-xs font-medium shadow-indigo-600/10' 
                  : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200/80 dark:border-slate-700/80 rounded-bl-xs shadow-xs'
              }`}>
                <p className="whitespace-pre-wrap">{m.content}</p>

                {/* Thẻ sản phẩm / dịch vụ đính kèm nếu có */}
                {m.cards && m.cards.length > 0 && (
                  <div className="mt-3 p-3 bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950 text-white rounded-2xl shadow-lg border border-indigo-500/30 space-y-2 text-left">
                    {m.cards[0].image && (
                      <img src={m.cards[0].image} alt={m.cards[0].title} className="w-full h-24 object-cover rounded-xl shadow-xs" />
                    )}
                    <h4 className="font-extrabold text-xs text-white">{m.cards[0].title}</h4>
                    <p className="text-amber-300 font-black text-xs">{m.cards[0].price}</p>
                    <p className="text-[10px] text-indigo-200/80 leading-relaxed">{m.cards[0].description}</p>
                    <button
                      onClick={() => navigate('/pricing')}
                      className="w-full mt-1.5 py-1.5 rounded-xl bg-white hover:bg-indigo-50 text-indigo-900 font-bold text-[11px] shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                    >
                      <ShoppingBag className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Xem Bảng Giá Ngay</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Nút bấm nhanh (Quick Replies) */}
              {!isUser && m.quickReplies && m.quickReplies.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-0.5 max-w-[95%]">
                  {m.quickReplies.map((qr) => (
                    <button
                      key={qr.id || qr.label}
                      onClick={() => handleSend(qr.label)}
                      className="px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-[10.5px] font-semibold transition-all cursor-pointer shadow-2xs active:scale-95"
                    >
                      {qr.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {widgetError && (
          <p role="status" className="rounded-xl bg-rose-50 px-3 py-2 text-[11px] text-rose-700 dark:bg-rose-950/50 dark:text-rose-300">
            {widgetError}
          </p>
        )}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3.5 py-2.5 rounded-2xl text-slate-400 text-xs italic flex items-center gap-2 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" />
              <span className="text-[11px]">DHT AI đang suy nghĩ câu trả lời...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggestion Prompts Gợi Ý Nhanh */}
      <div className="px-3 py-1.5 bg-slate-100/90 dark:bg-slate-900/90 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        <span className="text-[9.5px] font-bold text-slate-400 uppercase flex-shrink-0 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-indigo-500" />
          <span>Gợi ý:</span>
        </span>
        {defaultStarterPrompts.map((p, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(p)}
            className="px-2.5 py-0.5 bg-white dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 hover:text-indigo-600 dark:hover:text-indigo-400 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-full text-[10.5px] font-medium transition-all flex-shrink-0 cursor-pointer active:scale-95 shadow-2xs"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Input gửi tin nhắn */}
      <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
        <input
          type="text"
          aria-label="Tin nhắn gửi tới DHT ChatAI"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Nhập câu hỏi, hỏi giá, thời tiết, tính năng..."
          className="flex-1 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-800 transition-all"
        />
        <button 
          onClick={() => handleSend()} 
          disabled={loading || !input.trim()}
          className="w-10 h-10 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl flex items-center justify-center transition-all disabled:opacity-40 disabled:hover:bg-indigo-600 shadow-md shadow-indigo-600/20 active:scale-95 cursor-pointer flex-shrink-0"
          title="Gửi tin nhắn"
          aria-label="Gửi tin nhắn"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>

      {/* Branding Footer */}
      <div className="py-1.5 bg-slate-50 dark:bg-slate-950 text-center text-[10px] text-slate-400 font-medium border-t border-slate-100 dark:border-slate-900">
        Cung cấp bởi <span className="font-bold text-indigo-600 dark:text-indigo-400">DHT ChatAI 2026</span>
      </div>

    </div>
  );
};