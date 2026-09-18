import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  UserCheck, 
  Send, 
  Paperclip, 
  Smile, 
  Image as ImageIcon, 
  Bookmark, 
  CheckCircle2, 
  MoreVertical, 
  ShieldAlert, 
  Check, 
  CheckCheck,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CannedResponsesModal } from './CannedResponsesModal';

export const ChatArea: React.FC = () => {
  const { 
    activeConversation, 
    messages, 
    sendMessage, 
    toggleBotSwitch, 
    updateConversationStatus,
    currentUser 
  } = useApp();

  const [inputVal, setInputVal] = useState('');
  const [showCannedModal, setShowCannedModal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const convMessages = activeConversation ? (messages[activeConversation.id] || []) : [];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [convMessages, activeConversation]);

  if (!activeConversation) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950/60 p-6 text-center text-slate-400">
        <Bot className="w-12 h-12 stroke-1 text-slate-300 dark:text-slate-700 mb-2" />
        <h3 className="text-base font-semibold text-slate-600 dark:text-slate-300">Chưa chọn cuộc hội thoại</h3>
        <p className="text-xs">Vui lòng chọn một cuộc trò chuyện từ danh sách bên trái để bắt đầu hỗ trợ.</p>
      </div>
    );
  }

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputVal.trim()) return;

    // Khi nhân viên gửi tin nhắn trực tiếp, nếu bot đang xử lý thì có thể tự động chuyển tiếp quản
    sendMessage(activeConversation.id, inputVal.trim(), 'agent');
    setInputVal('');
  };

  const handleSelectCannedResponse = (content: string) => {
    setInputVal(content);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      sendMessage(activeConversation.id, `📎 [Đã gửi tài liệu]: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`, 'agent');
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50/50 dark:bg-slate-950/40 min-w-0">
      {/* Top Console Header */}
      <div className="h-16 px-4 sm:px-6 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative flex-shrink-0">
            <img
              src={activeConversation.customer.avatar}
              alt={activeConversation.customer.name}
              className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700"
            />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-white dark:ring-slate-900"></span>
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-sm sm:text-base text-slate-900 dark:text-slate-100 truncate">
                {activeConversation.customer.name}
              </h3>
              <span className="text-xs text-slate-400 hidden sm:inline">
                ({activeConversation.customer.phone})
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <span>Nguồn: <strong className="capitalize">{activeConversation.channel}</strong></span>
              <span>•</span>
              <span>Hoạt động: {activeConversation.customer.lastActive}</span>
            </p>
          </div>
        </div>

        {/* Action Switch & Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* 1-Click Bot / Human Switch */}
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => {
                if (!activeConversation.isBotHandling) {
                  toggleBotSwitch(activeConversation.id);
                }
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeConversation.isBotHandling
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
              title="Để Bot AI tự động phản hồi theo tri thức và kịch bản"
            >
              <Bot className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Bot AI Xử Lý</span>
            </button>

            <button
              onClick={() => {
                if (activeConversation.isBotHandling) {
                  toggleBotSwitch(activeConversation.id);
                }
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                !activeConversation.isBotHandling
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
              title="Nhân viên CSKH tiếp quản cuộc trò chuyện ngay lập tức"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span className="hidden md:inline">CSKH Tiếp Quản</span>
            </button>
          </div>

          {/* Resolve Button */}
          <button
            onClick={() => updateConversationStatus(activeConversation.id, 'resolved')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium transition-colors"
            title="Đánh dấu đã giải quyết"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span className="hidden lg:inline">Giải quyết</span>
          </button>
        </div>
      </div>

      {/* Bot Handling Status Bar */}
      <div className={`px-4 py-2 text-xs flex items-center justify-between border-b transition-colors ${
        activeConversation.isBotHandling 
          ? 'bg-indigo-50/80 dark:bg-indigo-950/40 border-indigo-100 dark:border-indigo-900 text-indigo-800 dark:text-indigo-300'
          : 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-100 dark:border-emerald-900 text-emerald-800 dark:text-emerald-300'
      }`}>
        <div className="flex items-center gap-2">
          {activeConversation.isBotHandling ? (
            <>
              <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400 animate-pulse" />
              <span>Chế độ tự động: <strong>Bot AI</strong> đang phản hồi thông minh dựa trên dữ liệu doanh nghiệp.</span>
            </>
          ) : (
            <>
              <UserCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Chế độ thủ công: Tư vấn viên <strong>{activeConversation.assignedAgent?.name || currentUser.name}</strong> đang trực tiếp chat với khách.</span>
            </>
          )}
        </div>
        <button
          onClick={() => toggleBotSwitch(activeConversation.id)}
          className="underline font-semibold cursor-pointer hover:opacity-80"
        >
          {activeConversation.isBotHandling ? 'Chuyển sang CSKH' : 'Kích hoạt lại Bot AI'}
        </button>
      </div>

      {/* Messages List Area */}
      <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
        {convMessages.map((msg) => {
          const isUser = msg.sender === 'user';
          const isBot = msg.sender === 'bot';
          const isAgent = msg.sender === 'agent';

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? 'items-start' : 'items-end'} animate-fade-in`}
            >
              <div className="flex items-start gap-2 max-w-[80%]">
                {isUser && (
                  <img
                    src={activeConversation.customer.avatar}
                    alt=""
                    className="w-8 h-8 rounded-full object-cover mt-0.5 border border-slate-200 dark:border-slate-700"
                  />
                )}

                <div>
                  <div className="flex items-center gap-1.5 mb-1 px-1">
                    <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                      {isUser ? activeConversation.customer.name : (isBot ? 'Bot AI (Tự động)' : (msg.senderName || 'CSKH'))}
                    </span>
                    <span className="text-[10px] text-slate-400">{msg.timestamp}</span>
                  </div>

                  <div
                    className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-xs ${
                      isUser
                        ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-tl-none'
                        : isBot
                        ? 'bg-indigo-600 text-white rounded-tr-none shadow-indigo-500/10'
                        : 'bg-emerald-600 text-white rounded-tr-none shadow-emerald-500/10'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.content}</p>

                    {/* Cards Carousel if available */}
                    {msg.cards && msg.cards.length > 0 && (
                      <div className="mt-3 flex gap-3 overflow-x-auto pb-1">
                        {msg.cards.map((card) => (
                          <div
                            key={card.id}
                            className="w-44 flex-shrink-0 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-xl overflow-hidden shadow-md border border-slate-200 dark:border-slate-800"
                          >
                            <img src={card.image} alt="" className="w-full h-24 object-cover" />
                            <div className="p-2.5">
                              <h5 className="font-semibold text-xs truncate">{card.title}</h5>
                              <p className="font-bold text-xs text-indigo-600 dark:text-indigo-400 mt-1">{card.price}</p>
                              <p className="text-[10px] text-slate-500 line-clamp-2 mt-1">{card.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Status Indicator */}
                  {!isUser && (
                    <div className="flex items-center justify-end gap-1 mt-1 text-[10px] text-slate-400 px-1">
                      {msg.status === 'sent' && <Check className="w-3 h-3 text-slate-400" />}
                      {msg.status === 'delivered' && <CheckCheck className="w-3 h-3 text-slate-400" />}
                      {msg.status === 'seen' && <CheckCheck className="w-3 h-3 text-emerald-500" />}
                      <span>{msg.status === 'seen' ? 'Đã xem' : 'Đã gửi'}</span>
                    </div>
                  )}
                </div>

                {!isUser && (
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs mt-0.5 shadow-xs ${
                    isBot ? 'bg-indigo-600' : 'bg-emerald-600'
                  }`}>
                    {isBot ? <Bot className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                  </div>
                )}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Editor & Actions Footer */}
      <div className="p-3 sm:p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowCannedModal(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 text-xs font-semibold transition-colors"
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>Tin nhắn mẫu (/m)</span>
            </button>

            <span className="text-[11px] text-slate-400 hidden sm:inline">
              Gõ <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-indigo-500">/baogia</code> hoặc <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-indigo-500">/chao</code>
            </span>
          </div>

          <div className="text-[11px] text-slate-400">
            Enter để gửi • Shift+Enter xuống dòng
          </div>
        </div>

        <form onSubmit={handleSend} className="flex items-end gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Đính kèm file"
          >
            <Paperclip className="w-4 h-4" />
          </button>

          <div className="flex-1 relative">
            <textarea
              rows={2}
              placeholder="Nhập phản hồi gửi tới khách hàng..."
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              className="w-full px-3.5 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 text-xs sm:text-sm rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 border border-transparent resize-none transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={!inputVal.trim()}
            className={`p-3 rounded-xl text-white font-medium transition-all shadow-md ${
              inputVal.trim()
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-95 active:scale-95'
                : 'bg-slate-300 dark:bg-slate-700 cursor-not-allowed text-slate-400'
            }`}
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Canned Responses Modal */}
      <CannedResponsesModal
        isOpen={showCannedModal}
        onClose={() => setShowCannedModal(false)}
        onSelect={handleSelectCannedResponse}
      />
    </div>
  );
};
