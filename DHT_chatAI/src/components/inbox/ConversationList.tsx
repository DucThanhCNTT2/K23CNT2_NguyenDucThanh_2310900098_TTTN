import React from 'react';
import { 
  Search, 
  Globe, 
  MessageCircle, 
  Filter, 
  Bot, 
  UserCheck, 
  Clock, 
  CheckCircle2, 
  AlertCircle
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ChannelType, ConversationStatus } from '../../types';

export const ConversationList: React.FC = () => {
  const {
    conversations,
    activeConversationId,
    setActiveConversationId,
    filterChannel,
    setFilterChannel,
    filterStatus,
    setFilterStatus,
    searchQuery,
    setSearchQuery
  } = useApp();

  const getChannelBadge = (channel: ChannelType) => {
    switch (channel) {
      case 'facebook':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900">
            <MessageCircle className="w-3 h-3 fill-blue-600 dark:fill-blue-400" />
            <span>FB Messenger</span>
          </span>
        );
      case 'zalo':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-900">
            <span className="w-2 h-2 rounded-full bg-cyan-500"></span>
            <span>Zalo OA</span>
          </span>
        );
      case 'website':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-900">
            <Globe className="w-3 h-3" />
            <span>Web Widget</span>
          </span>
        );
    }
  };

  const getStatusBadge = (status: ConversationStatus) => {
    switch (status) {
      case 'bot_active':
        return (
          <span className="flex items-center gap-1 text-[11px] text-indigo-600 dark:text-indigo-400 font-medium">
            <Bot className="w-3 h-3" />
            <span>Bot phản hồi</span>
          </span>
        );
      case 'assigned':
        return (
          <span className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
            <UserCheck className="w-3 h-3" />
            <span>CSKH hỗ trợ</span>
          </span>
        );
      case 'resolved':
        return (
          <span className="flex items-center gap-1 text-[11px] text-slate-400 font-medium">
            <CheckCircle2 className="w-3 h-3" />
            <span>Đã xử lý</span>
          </span>
        );
      case 'pending':
      default:
        return (
          <span className="flex items-center gap-1 text-[11px] text-amber-500 font-medium">
            <Clock className="w-3 h-3 animate-spin" />
            <span>Chờ xử lý</span>
          </span>
        );
    }
  };

  // Filter conversations
  const filteredConversations = conversations.filter(conv => {
    const matchChannel = filterChannel === 'all' || conv.channel === filterChannel;
    const matchStatus = filterStatus === 'all' || conv.status === filterStatus;
    const matchSearch = 
      conv.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.customer.phone.includes(searchQuery) ||
      conv.lastMessage.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.customer.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchChannel && matchStatus && matchSearch;
  });

  return (
    <div className="w-full md:w-80 lg:w-96 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col h-full select-none">
      {/* Top Header & Search */}
      <div className="p-3.5 border-b border-slate-200 dark:border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <span>Hộp Thư Đa Kênh</span>
            <span className="bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 text-xs px-2 py-0.5 rounded-full font-semibold">
              {filteredConversations.length}
            </span>
          </h2>
          <div className="flex items-center gap-1 text-xs text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Realtime</span>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm tên, SĐT, tag hoặc tin nhắn..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-100 dark:bg-slate-800/80 border border-transparent focus:border-indigo-500 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 outline-none transition-all"
          />
        </div>

        {/* Channel Filter Pills */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 text-xs scrollbar-none">
          <button
            onClick={() => setFilterChannel('all')}
            className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-colors ${
              filterChannel === 'all'
                ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
            }`}
          >
            Tất cả kênh
          </button>
          <button
            onClick={() => setFilterChannel('website')}
            className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-colors ${
              filterChannel === 'website'
                ? 'bg-purple-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-purple-600 dark:text-purple-400 hover:bg-purple-50'
            }`}
          >
            🌐 Website
          </button>
          <button
            onClick={() => setFilterChannel('facebook')}
            className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-colors ${
              filterChannel === 'facebook'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400 hover:bg-blue-50'
            }`}
          >
            💬 Messenger
          </button>
          <button
            onClick={() => setFilterChannel('zalo')}
            className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-colors ${
              filterChannel === 'zalo'
                ? 'bg-cyan-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-50'
            }`}
          >
            📱 Zalo OA
          </button>
        </div>

        {/* Status Tabs */}
        <div className="grid grid-cols-4 gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-[11px] font-medium text-slate-600 dark:text-slate-400">
          <button
            onClick={() => setFilterStatus('all')}
            className={`py-1 text-center rounded-lg transition-colors ${
              filterStatus === 'all' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs' : 'hover:text-slate-900'
            }`}
          >
            Tất cả
          </button>
          <button
            onClick={() => setFilterStatus('pending')}
            className={`py-1 text-center rounded-lg transition-colors ${
              filterStatus === 'pending' ? 'bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 shadow-xs' : 'hover:text-slate-900'
            }`}
          >
            Chờ xử lý
          </button>
          <button
            onClick={() => setFilterStatus('bot_active')}
            className={`py-1 text-center rounded-lg transition-colors ${
              filterStatus === 'bot_active' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs' : 'hover:text-slate-900'
            }`}
          >
            Bot xử lý
          </button>
          <button
            onClick={() => setFilterStatus('assigned')}
            className={`py-1 text-center rounded-lg transition-colors ${
              filterStatus === 'assigned' ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-xs' : 'hover:text-slate-900'
            }`}
          >
            CSKH
          </button>
        </div>
      </div>

      {/* Conversation List Items */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
        {filteredConversations.length === 0 ? (
          <div className="p-8 text-center text-slate-400 space-y-2">
            <Filter className="w-8 h-8 mx-auto stroke-1 text-slate-300 dark:text-slate-700" />
            <p className="text-xs">Không tìm thấy hội thoại phù hợp</p>
          </div>
        ) : (
          filteredConversations.map((conv) => {
            const isActive = conv.id === activeConversationId;

            return (
              <div
                key={conv.id}
                onClick={() => setActiveConversationId(conv.id)}
                className={`p-3.5 flex items-start gap-3 cursor-pointer transition-all border-l-4 ${
                  isActive
                    ? 'bg-indigo-50/70 dark:bg-indigo-950/30 border-l-indigo-600'
                    : 'border-l-transparent hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }`}
              >
                {/* Avatar with Channel Icon */}
                <div className="relative flex-shrink-0">
                  <img
                    src={conv.customer.avatar}
                    alt={conv.customer.name}
                    className="w-11 h-11 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                  />
                  <div className="absolute -bottom-1 -right-1">
                    {conv.channel === 'facebook' && (
                      <span className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[9px] shadow-xs">
                        f
                      </span>
                    )}
                    {conv.channel === 'zalo' && (
                      <span className="w-4 h-4 rounded-full bg-cyan-500 text-white flex items-center justify-center text-[9px] font-bold shadow-xs">
                        Z
                      </span>
                    )}
                    {conv.channel === 'website' && (
                      <span className="w-4 h-4 rounded-full bg-purple-600 text-white flex items-center justify-center text-[9px] shadow-xs">
                        🌐
                      </span>
                    )}
                  </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <h4 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                      {conv.customer.name}
                    </h4>
                    <span className="text-[11px] text-slate-400 whitespace-nowrap ml-1">
                      {conv.lastMessage.timestamp}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 mb-1.5">
                    {getChannelBadge(conv.channel)}
                    {conv.priority === 'high' && (
                      <span className="inline-flex items-center gap-0.5 text-[10px] text-rose-600 dark:text-rose-400 font-semibold bg-rose-50 dark:bg-rose-950/50 px-1 rounded">
                        <AlertCircle className="w-2.5 h-2.5" />
                        Gấp
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 truncate">
                    {conv.lastMessage.content}
                  </p>

                  <div className="mt-2 flex items-center justify-between">
                    {getStatusBadge(conv.status)}
                    {conv.unreadCount > 0 && (
                      <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center shadow-xs">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
