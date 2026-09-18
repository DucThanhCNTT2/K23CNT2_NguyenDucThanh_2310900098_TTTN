import React, { useState, useRef, useEffect } from 'react';
import { 
  MessageSquare, 
  X, 
  Send, 
  Paperclip, 
  Image as ImageIcon, 
  Smile, 
  Star, 
  RotateCcw, 
  Minimize2, 
  Bot, 
  Check, 
  CheckCheck,
  ChevronRight,
  Sparkles,
  Sun,
  Moon,
  ExternalLink
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const LiveChatWidget: React.FC = () => {
  const { 
    theme,
    toggleTheme,
    widgetOpen, 
    setWidgetOpen, 
    widgetMessages, 
    sendWidgetMessage, 
    isWidgetTyping,
    widgetRatingSubmitted,
    submitWidgetRating,
    clearWidgetHistory
  } = useApp();

  const [inputVal, setInputVal] = useState('');
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [ratingStars, setRatingStars] = useState(5);
  const [ratingFeedback, setRatingFeedback] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (widgetOpen) {
      scrollToBottom();
    }
  }, [widgetMessages, isWidgetTyping, widgetOpen]);

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputVal.trim()) return;
    sendWidgetMessage(inputVal.trim());
    setInputVal('');
  };

  const handleQuickReplyClick = (label: string) => {
    sendWidgetMessage(label);
  };

  const handleAgentTransfer = () => {
    sendWidgetMessage('Tôi muốn được giao cho nhân viên hỗ trợ trực tiếp');
  };

  const handleRatingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitWidgetRating(ratingStars, ratingFeedback);
    setShowRatingModal(false);
    setRatingFeedback('');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      sendWidgetMessage(`📎 [File đính kèm]: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end font-sans">
      {/* Floating Action Button */}
      {!widgetOpen && (
        <div className="relative group animate-fade-in">
          <div className="absolute -top-12 right-0 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg border border-indigo-100 dark:border-slate-700 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-spin" />
            <span>Chatbot AI sẵn sàng hỗ trợ 24/7!</span>
          </div>
          <button
            onClick={() => setWidgetOpen(true)}
            className="w-14 h-14 rounded-full bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 text-white shadow-xl hover:shadow-indigo-500/50 flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95 animate-pulse-glow"
            title="Mở khung trò chuyện"
          >
            <MessageSquare className="w-7 h-7" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full"></span>
          </button>
        </div>
      )}

      {/* Main Chat Widget Container */}
      {widgetOpen && (
        <div 
          className={`bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col transition-all duration-300 animate-scale-up ${
            isMinimized 
              ? 'w-80 h-16' 
              : 'w-[92vw] sm:w-[400px] h-[600px] max-h-[85vh]'
          }`}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 px-4 py-3 text-white flex items-center justify-between shadow-md">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur flex items-center justify-center border border-white/30 text-white">
                  <Bot className="w-6 h-6" />
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-indigo-700 rounded-full"></span>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-semibold text-sm leading-tight">DHT AI Omnichannel</h3>
                  <span className="bg-white/20 text-[10px] px-1.5 py-0.5 rounded-full font-medium">Auto AI</span>
                </div>
                <p className="text-xs text-indigo-100 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Đang hoạt động trên Website, FB & Zalo
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={toggleTheme}
                className="p-1.5 hover:bg-white/10 rounded-lg text-white/90 hover:text-white transition-colors"
                title={theme === 'dark' ? 'Chuyển chế độ sáng' : 'Chuyển chế độ tối'}
              >
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setShowRatingModal(!showRatingModal)}
                className="p-1.5 hover:bg-white/10 rounded-lg text-white/90 hover:text-white transition-colors"
                title="Đánh giá chất lượng hỗ trợ"
              >
                <Star className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1.5 hover:bg-white/10 rounded-lg text-white/90 hover:text-white transition-colors"
                title={isMinimized ? 'Mở rộng' : 'Thu nhỏ'}
              >
                <Minimize2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setWidgetOpen(false)}
                className="p-1.5 hover:bg-white/10 rounded-lg text-white/90 hover:text-white transition-colors"
                title="Đóng chat"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* If minimized */}
          {isMinimized ? (
            <div 
              onClick={() => setIsMinimized(false)}
              className="flex-1 flex items-center justify-between px-4 bg-slate-50 dark:bg-slate-800/60 cursor-pointer text-xs font-medium text-indigo-600 dark:text-indigo-400"
            >
              <span>Nhấn để tiếp tục trò chuyện...</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          ) : (
            <>
              {/* Rating Modal / CSAT Bar */}
              {showRatingModal && (
                <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200 dark:border-amber-900 animate-fade-in text-xs">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-amber-900 dark:text-amber-200 flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                      Đánh giá phản hồi của Chatbot AI
                    </span>
                    <button 
                      onClick={() => setShowRatingModal(false)}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <form onSubmit={handleRatingSubmit} className="space-y-2">
                    <div className="flex items-center gap-1 justify-center py-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          type="button"
                          key={star}
                          onClick={() => setRatingStars(star)}
                          className="p-1 hover:scale-125 transition-transform"
                        >
                          <Star 
                            className={`w-5 h-5 ${
                              star <= ratingStars 
                                ? 'fill-amber-400 text-amber-400' 
                                : 'text-slate-300 dark:text-slate-600'
                            }`} 
                          />
                        </button>
                      ))}
                    </div>
                    <input
                      type="text"
                      placeholder="Nhận xét hoặc góp ý cải thiện (tùy chọn)..."
                      value={ratingFeedback}
                      onChange={(e) => setRatingFeedback(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:ring-1 focus:ring-amber-500 outline-none"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setShowRatingModal(false)}
                        className="px-2.5 py-1 text-slate-500 hover:text-slate-700"
                      >
                        Bỏ qua
                      </button>
                      <button
                        type="submit"
                        className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium shadow-sm"
                      >
                        Gửi đánh giá
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Message List Area */}
              <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/70 dark:bg-slate-950/50">
                {/* Reset or Clear chat history button */}
                <div className="flex items-center justify-center">
                  <button
                    onClick={clearWidgetHistory}
                    className="text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-200/50 dark:bg-slate-800/50 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Làm mới cuộc trò chuyện</span>
                  </button>
                </div>

                {widgetMessages.map((msg) => {
                  const isUser = msg.sender === 'user';

                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} animate-fade-in`}
                    >
                      <div className="flex items-end gap-2 max-w-[85%]">
                        {!isUser && (
                          <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center text-xs shadow-sm flex-shrink-0 mb-1">
                            <Bot className="w-4 h-4" />
                          </div>
                        )}
                        <div
                          className={`px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-sm ${
                            isUser
                              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-br-none'
                              : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200/80 dark:border-slate-700/80 rounded-bl-none'
                          }`}
                        >
                          <p className="whitespace-pre-wrap">{msg.content}</p>

                          {/* Product Cards Carousel */}
                          {msg.cards && msg.cards.length > 0 && (
                            <div className="mt-3 flex gap-3 overflow-x-auto pb-2 pt-1 -mx-1 px-1 scrollbar-none">
                              {msg.cards.map((card) => (
                                <div
                                  key={card.id}
                                  className="w-48 flex-shrink-0 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm flex flex-col"
                                >
                                  <img
                                    src={card.image}
                                    alt={card.title}
                                    className="w-full h-24 object-cover"
                                  />
                                  <div className="p-2.5 flex-1 flex flex-col justify-between">
                                    <div>
                                      <h4 className="font-semibold text-xs text-slate-800 dark:text-slate-100 line-clamp-1">
                                        {card.title}
                                      </h4>
                                      <div className="mt-1 flex items-baseline gap-1.5">
                                        <span className="font-bold text-xs text-indigo-600 dark:text-indigo-400">
                                          {card.price}
                                        </span>
                                        {card.originalPrice && (
                                          <span className="text-[10px] text-slate-400 line-through">
                                            {card.originalPrice}
                                          </span>
                                        )}
                                      </div>
                                      <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                                        {card.description}
                                      </p>
                                    </div>
                                    <button
                                      onClick={() => sendWidgetMessage(`Tôi muốn tư vấn về: ${card.title}`)}
                                      className="mt-2.5 w-full py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[11px] font-medium transition-colors flex items-center justify-center gap-1"
                                    >
                                      <span>Tư vấn gói này</span>
                                      <ExternalLink className="w-3 h-3" />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Quick Replies */}
                      {msg.quickReplies && msg.quickReplies.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2 pl-9">
                          {msg.quickReplies.map((qr) => (
                            <button
                              key={qr.id}
                              onClick={() => handleQuickReplyClick(qr.label)}
                              className="text-xs px-3 py-1.5 rounded-full border border-indigo-200 dark:border-indigo-800 bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950 font-medium transition-colors shadow-xs"
                            >
                              {qr.label}
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Message Status and Timestamp */}
                      <div className="flex items-center gap-1 mt-1 text-[10px] text-slate-400 px-1">
                        <span>{msg.timestamp}</span>
                        {isUser && (
                          <span>
                            {msg.status === 'sending' && <span className="text-slate-300">...</span>}
                            {msg.status === 'sent' && <Check className="w-3 h-3 text-slate-400" />}
                            {msg.status === 'delivered' && <CheckCheck className="w-3 h-3 text-slate-400" />}
                            {msg.status === 'seen' && <CheckCheck className="w-3 h-3 text-emerald-500" />}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Typing Indicator */}
                {isWidgetTyping && (
                  <div className="flex items-center gap-2 animate-fade-in">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center text-xs flex-shrink-0">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3.5 py-2 rounded-2xl rounded-bl-none flex items-center gap-1.5 shadow-sm">
                      <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full dot-1"></span>
                      <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full dot-2"></span>
                      <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full dot-3"></span>
                      <span className="text-[11px] text-slate-400 ml-1">Bot AI đang soạn...</span>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
                <form onSubmit={handleSend} className="flex items-center gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title="Đính kèm file hoặc hình ảnh"
                  >
                    <Paperclip className="w-4 h-4" />
                  </button>

                  <input
                    type="text"
                    placeholder="Nhập tin nhắn..."
                    value={inputVal}
                    onChange={(e) => setInputVal(e.target.value)}
                    className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder-slate-400 text-xs sm:text-sm px-3.5 py-2 rounded-full outline-none focus:ring-2 focus:ring-indigo-500 border border-transparent transition-all"
                  />

                  <button
                    type="submit"
                    disabled={!inputVal.trim()}
                    className={`p-2 rounded-full text-white transition-all shadow-md ${
                      inputVal.trim()
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:scale-105 active:scale-95'
                        : 'bg-slate-300 dark:bg-slate-700 cursor-not-allowed text-slate-400'
                    }`}
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>

                <div className="mt-1.5 text-center">
                  <span className="text-[10px] text-slate-400">
                    ⚡ Cung cấp bởi <span className="font-semibold text-indigo-500">DHT AI Engine</span> • Bảo lưu lịch sử
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};
