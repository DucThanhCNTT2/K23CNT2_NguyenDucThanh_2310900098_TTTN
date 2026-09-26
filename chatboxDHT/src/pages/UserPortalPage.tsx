import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Send, 
  Bot, 
  User, 
  Crown, 
  CheckCircle2, 
  LogOut, 
  Zap, 
  MessageSquare, 
  RefreshCw, 
  ShieldCheck, 
  ShoppingBag,
  ExternalLink,
  ChevronRight,
  UserCircle2,
  SmilePlus,
  BarChart3
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { apiService } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { UserBillingAnalytics } from '../components/user/UserBillingAnalytics';

export const UserPortalPage: React.FC = () => {
  const { currentUser } = useApp();
  const navigate = useNavigate();

  const [messages, setMessages] = useState<any[]>([]);
  const [inputVal, setInputVal] = useState('');
  const [loading, setLoading] = useState(false);
  const [convId, setConvId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [portalTab, setPortalTab] = useState<'chat' | 'billing'>('chat');

  // Dung lượng tin nhắn thực tế
  const [usage, setUsage] = useState<{
    usedMessages: number;
    maxMessages: number;
    percentage: number;
    remainingMessages: number;
  }>({
    usedMessages: 0,
    maxMessages: 2500,
    percentage: 0,
    remainingMessages: 2500
  });

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const isUserScrollingRef = useRef<boolean>(false);

  const quickPrompts = [
    'Báo giá chi tiết các gói',
    'Tích hợp Web, Fanpage & Zalo',
    'Đăng ký tư vấn 1-1 với chuyên gia',
    'Kích hoạt dùng thử 14 ngày'
  ];

  // 1. Định danh Conversation ID
  useEffect(() => {
    const initUserConv = async () => {
      if (!currentUser || !currentUser.id) return;
      const expectedConvId = `conv_user_${currentUser.id}`;
      setConvId(expectedConvId);

      const conv = await apiService.getOrCreateUserConversation(
        currentUser.id,
        currentUser.name || 'User',
        currentUser.email || 'user@chatai.vn'
      );
      if (conv && conv.id) setConvId(conv.id);
    };
    void initUserConv();
  }, [currentUser]);

  // 2. Tải tin nhắn & cập nhật dung lượng thực tế
  const fetchMessages = async () => {
    if (!convId) return;
    try {
      const data = await apiService.getMessages(convId);
      if (data) {
        setMessages(data);
      }
    } catch (err) {
      console.error('Lỗi tải tin nhắn:', err);
    }
  };

  const fetchUsageData = async () => {
    try {
      const usageRes = await apiService.getUserUsage();
      if (usageRes) {
        setUsage({
          usedMessages: usageRes.usedMessages,
          maxMessages: usageRes.maxMessages,
          percentage: usageRes.percentage,
          remainingMessages: usageRes.remainingMessages
        });
      } else {
        // Fallback tính trên số tin nhắn hiện tại
        const planLimit = currentUser?.plan === 'Starter' ? 500 : currentUser?.plan === 'Enterprise' ? 10000 : 2500;
        const count = messages.length;
        setUsage({
          usedMessages: count,
          maxMessages: planLimit,
percentage: Math.min(100, Math.round((count / planLimit) * 100)),
          remainingMessages: Math.max(0, planLimit - count)
        });
      }
    } catch (err) {
      console.error('Lỗi tải dung lượng:', err);
    }
  };

  useEffect(() => {
    if (!convId) return;
    void fetchMessages();
    void fetchUsageData();

    const interval = setInterval(() => {
      void fetchMessages();
      void fetchUsageData();
    }, 3000);

    return () => clearInterval(interval);
  }, [convId]);

  // 3. Xử lý cuộn thông minh
  const handleScroll = () => {
    const container = chatContainerRef.current;
    if (!container) return;
    const isAtBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100;
    isUserScrollingRef.current = !isAtBottom;
  };

  useEffect(() => {
    const container = chatContainerRef.current;
    if (!container || isUserScrollingRef.current) return;
    container.scrollTop = container.scrollHeight;
  }, [messages, loading]);

  // 4. Gửi tin nhắn với Optimistic UI
  const handleSend = async (textToSend?: string, e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const content = (textToSend || inputVal).trim();
    if (!content || !convId || loading) return;

    const optimisticMessage = {
      id: `temp_${Date.now()}`,
      conversationId: convId,
      sender: 'user',
      senderName: currentUser?.name || 'Bạn',
      content,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'sending'
    };

    setMessages((prev) => [...prev, optimisticMessage]);
    setInputVal('');
    setLoading(true);
    isUserScrollingRef.current = false;

    try {
      await apiService.sendConversationMessage(convId, content, 'user');
      await fetchMessages();
      await fetchUsageData();
    } catch (err) {
      console.error('Lỗi gửi tin nhắn:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([fetchMessages(), fetchUsageData()]);
    setTimeout(() => setIsRefreshing(false), 500);
  };

  return (
    <div className="h-[100dvh] w-screen bg-slate-100/80 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors overflow-hidden">
      {/* Top Navbar */}
      <header className="h-16 flex-shrink-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800/80 px-4 sm:px-6 flex items-center justify-between z-50 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 transition-transform hover:rotate-6">
            <Sparkles className="w-5 h-5 text-pink-200 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-black text-base tracking-tight bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-800 dark:from-white dark:via-indigo-200 dark:to-slate-200 bg-clip-text text-transparent">
                DHT ChatAI
              </h1>
<span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 border border-indigo-200/80 dark:border-indigo-800/60 uppercase tracking-wider">
                User Portal
              </span>
            </div>
            <p className="text-[11px] text-slate-400 dark:text-slate-500">Trung tâm hỗ trợ khách hàng & quản lý dịch vụ</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Nút Xem Bảng Giá */}
          <button
            onClick={() => navigate('/pricing')}
            className="flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/25 active:scale-95 cursor-pointer group"
          >
            <ShoppingBag className="w-4 h-4 transition-transform group-hover:scale-110" />
            <span className="hidden sm:inline">Bảng Giá Các Gói</span>
            <span className="sm:hidden">Gói Cước</span>
          </button>

          {/* NÚT TÊN USER DẪN TỚI TRANG PROFILE */}
          <button
            onClick={() => navigate('/profile')}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-2xl bg-slate-100 hover:bg-indigo-50 dark:bg-slate-800 dark:hover:bg-slate-700/80 border border-slate-200 hover:border-indigo-300 dark:border-slate-700 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer shadow-xs group"
            title="Nhấn để xem và chỉnh sửa thông tin cá nhân"
          >
            <div className="relative">
              <img
                src={currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                alt=""
                className="w-7 h-7 rounded-xl object-cover ring-2 ring-indigo-500/40 group-hover:ring-indigo-600 transition-all"
              />
              <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 ring-1 ring-white dark:ring-slate-900" />
            </div>

            <div className="text-xs text-left hidden md:block">
              <div className="flex items-center gap-1 font-bold text-slate-800 dark:text-slate-200 leading-none group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                <span>{currentUser?.name || 'Khách hàng'}</span>
                <ChevronRight className="w-3 h-3 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </div>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium mt-0.5 truncate max-w-[120px]">
                {currentUser?.email || 'user@chatai.vn'}
              </p>
            </div>
          </button>

          {/* Nút Đăng xuất */}
          <button
            onClick={() => navigate('/logout')}
className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-2xl transition-all cursor-pointer active:scale-95 border border-transparent hover:border-rose-200 dark:hover:border-rose-800"
            title="Đăng xuất tài khoản"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Sub Navbar: Chuyển Đổi Tab Trực Quan */}
      <div className="flex-shrink-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 px-4 sm:px-6 py-2.5 z-40 shadow-xs">
        <div className="max-w-7xl w-full mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPortalTab('chat')}
              className={`flex items-center gap-2 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                portalTab === 'chat'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25 active:scale-95'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>Trò Chuyện & CSKH</span>
            </button>

            <button
              onClick={() => setPortalTab('billing')}
              className={`flex items-center gap-2 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer relative ${
                portalTab === 'billing'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-600/25 active:scale-95'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <BarChart3 className="w-4 h-4 text-amber-300" />
              <span>Dung Lượng & Tài Chính</span>
              <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-amber-400 text-slate-950 uppercase tracking-tight ml-1 animate-pulse">
                MỚI
              </span>
            </button>
          </div>

          {/* Quick usage pill on the right */}
          <div 
            onClick={() => setPortalTab('billing')}
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100/90 dark:bg-slate-800/90 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 border border-slate-200/80 dark:border-slate-700/80 text-xs cursor-pointer transition-all group"
            title="Nhấn để xem phân tích chi tiêu & mua thêm gói"
          >
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-slate-500 dark:text-slate-400">Dung lượng:</span>
            <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
              {usage.usedMessages.toLocaleString()} / {usage.maxMessages.toLocaleString()}
            </span>
            <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold underline group-hover:translate-x-0.5 transition-transform">
              Xem báo cáo →
            </span>
          </div>
        </div>
      </div>

      {portalTab === 'chat' ? (
      /* Main Container */
      <main className="flex-1 min-h-0 p-3 sm:p-5 max-w-7xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-5 overflow-hidden">
        
        {/* ==================================================== */}
        {/* CỘT TRÁI: THÔNG TIN GÓI, DUNG LƯỢNG THỰC TẾ & PROFILE */}
        {/* ==================================================== */}
        <div className="hidden lg:flex lg:col-span-5 h-full space-y-4 flex-col overflow-y-auto pr-1">
          {/* Card Thông Tin Gói Dịch Vụ Với Animation Glow */}
          <div className="relative p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-950 text-white shadow-2xl border border-indigo-500/30 overflow-hidden group hover:border-indigo-400/50 transition-all duration-300 flex-shrink-0">
            {/* Hiệu ứng ánh sáng nền chuyển động */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none group-hover:scale-125 transition-transform duration-700" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/15 rounded-full blur-2xl pointer-events-none" />

            <div className="relative z-10 space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full bg-indigo-500/20 backdrop-blur-md border border-indigo-400/30 text-[11px] font-bold text-indigo-300 flex items-center gap-1.5 shadow-inner">
                  <Crown className="w-3.5 h-3.5 text-amber-400 fill-amber-400 animate-bounce" />
                  <span>Gói {currentUser?.plan || 'Pro'} Đa Kênh</span>
                </span>
                <span className="text-[11px] text-indigo-300/80 font-mono bg-white/10 px-2 py-0.5 rounded-lg border border-white/10">
                  ID: {currentUser?.id ? currentUser.id.slice(-6) : '43ab5c'}
                </span>
              </div>

              <div>
                <h2 className="text-xl font-black text-white tracking-tight">
                  Trợ Lý DHT AI Thông Minh
                </h2>
                <p className="text-xs text-indigo-200/80 mt-1 leading-relaxed">
                  Tự động hóa chăm sóc khách hàng 24/7 trên Website, Fanpage Messenger & Zalo OA.
                </p>
              </div>

              {/* DUNG LƯỢNG TIN NHẮN THỰC TẾ (REALTIME USAGE) */}
              <div className="space-y-2 pt-2 border-t border-white/10">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-indigo-200 font-semibold flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Dung lượng tin nhắn thực tế</span>
                  </span>
                  <span className="font-mono font-bold text-white bg-indigo-500/30 px-2 py-0.5 rounded-lg border border-indigo-400/20">
                    {usage.usedMessages.toLocaleString()} / {usage.maxMessages.toLocaleString()}
                  </span>
                </div>

                {/* Thanh tiến trình với animation chuyển động */}
                <div className="w-full h-2.5 rounded-full bg-white/10 overflow-hidden p-0.5 border border-white/10">
                  <div 
                    className="h-full bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 rounded-full transition-all duration-700 ease-out shadow-sm"
                    style={{ width: `${Math.max(3, usage.percentage)}%` }}
                  />
                </div>

                <div className="flex justify-between items-center text-[10px] text-indigo-200/80">
                  <span>Còn lại: <strong className="text-white font-mono">{usage.remainingMessages.toLocaleString()}</strong> tin nhắn</span>
                  <span className="font-bold text-amber-300">{usage.percentage}% đã dùng</span>
                </div>
              </div>

              {/* Chỉ số tốc độ & Uptime */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors backdrop-blur border border-white/10">
                  <div className="flex items-center gap-1.5 text-amber-400 mb-1">
                    <Zap className="w-4 h-4" />
                    <span className="text-[10px] text-indigo-200/80 uppercase font-bold">Phản hồi</span>
                  </div>
                  <div className="text-base font-black">~ 1.8 giây</div>
                  <div className="text-[10px] text-indigo-200/60">Tốc độ sinh câu trả lời</div>
                </div>

                <div className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors backdrop-blur border border-white/10">
                  <div className="flex items-center gap-1.5 text-emerald-400 mb-1">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="text-[10px] text-indigo-200/80 uppercase font-bold">Hệ thống</span>
                  </div>
                  <div className="text-base font-black text-emerald-300">Trực Tuyến</div>
                  <div className="text-[10px] text-indigo-200/60">SLA 99.9% Uptime</div>
                </div>
              </div>

              {/* Nút Xem Phân Tích & Mua Thêm Gói Phụ */}
              <button
                onClick={() => setPortalTab('billing')}
                className="w-full py-2.5 px-3.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold transition-all flex items-center justify-between cursor-pointer group/btn active:scale-98 shadow-sm"
              >
                <span className="flex items-center gap-2 text-indigo-200 group-hover/btn:text-white">
                  <BarChart3 className="w-4 h-4 text-amber-400" />
                  <span>Xem Báo Cáo & Mua Thêm Dung Lượng</span>
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-indigo-300 group-hover/btn:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* Card Đường Dẫn Đến Trang Profile & Quản Lý Cá Nhân */}
          <div 
            onClick={() => navigate('/profile')}
            className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-indigo-400 dark:hover:border-indigo-600 transition-all cursor-pointer group flex items-center justify-between flex-shrink-0"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <UserCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-extrabold text-xs text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors flex items-center gap-1.5">
                  <span>Hồ Sơ Cá Nhân & Đổi Ảnh/Mật Khẩu</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </h4>
                <p className="text-[11px] text-slate-400 dark:text-slate-500">
                  Cập nhật họ tên, số điện thoại, ảnh đại diện doanh nhân
                </p>
              </div>
            </div>

            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 group-hover:text-indigo-600 transition-all" />
          </div>

          {/* Quyền lợi thành viên */}
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 flex-shrink-0">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Quyền Lợi Gói Thành Viên</span>
            </h3>

            <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <span>Tiếp nhận tin nhắn tư vấn và chuyển giao CSKH 24/7.</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <span>Huấn luyện AI với bộ dữ liệu tài liệu FAQ riêng.</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <span>Tùy chỉnh kịch bản giao tiếp & danh mục sản phẩm thông minh.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* ==================================================== */}
        {/* CỘT PHẢI: KHUNG TRÒ CHUYỆN TRỰC TUYẾN CSKH & BOT AI */}
        {/* ==================================================== */}
        <div className="col-span-1 lg:col-span-7 h-full bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl flex flex-col overflow-hidden min-h-0">
          {/* Header Chat */}
          <div className="flex-shrink-0 p-4 bg-gradient-to-r from-indigo-600 via-indigo-600 to-purple-600 text-white flex items-center justify-between shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center border border-white/20 shadow-inner">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-sm tracking-tight flex items-center gap-2">
                  <span>Trung Tâm Tư Vấn Trực Tuyến</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </h3>
                <p className="text-[11px] text-indigo-100 flex items-center gap-1.5">
                  <span>Trợ lý DHT AI & Chuyên viên CSKH sẵn sàng phục vụ</span>
                </p>
              </div>
            </div>

            <button
              onClick={handleManualRefresh}
              className={`p-2 rounded-2xl hover:bg-white/15 transition-all active:scale-95 cursor-pointer ${
                isRefreshing ? 'animate-spin' : ''
              }`}
              title="Làm mới tin nhắn"
            >
              <RefreshCw className="w-4 h-4 text-indigo-100" />
            </button>
          </div>

          {/* Vùng Tin Nhắn: cuộn độc lập bên trong */}
          <div 
            ref={chatContainerRef} 
            onScroll={handleScroll}
            className="flex-1 min-h-0 p-4 sm:p-5 overflow-y-auto space-y-4 bg-slate-50/70 dark:bg-slate-950/40 text-xs scroll-smooth"
          >
            {messages.length === 0 && (
              <div className="text-center py-10 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 mx-auto flex items-center justify-center">
                  <SmilePlus className="w-6 h-6" />
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Hãy gửi câu hỏi bất kỳ, Trợ lý DHT AI và CSKH sẽ phản hồi ngay!
                </p>
              </div>
            )}

            {messages.map((m, idx) => {
              const isUser = m.sender === 'user';
              const isBot = m.sender === 'bot';

              return (
                <div 
                  key={m.id || idx} 
                  className={`flex ${isUser ? 'justify-end' : 'justify-start'} transition-all duration-300 animate-in fade-in slide-in-from-bottom-2`}
                >
                  <div className="flex items-start gap-2.5 max-w-[85%] sm:max-w-[78%]">
                    {!isUser && (
                      <div className={`w-8 h-8 rounded-2xl flex items-center justify-center text-white text-xs mt-0.5 shadow-md flex-shrink-0 ${
                        isBot 
                          ? 'bg-gradient-to-tr from-indigo-600 to-purple-600 shadow-indigo-500/20' 
                          : 'bg-gradient-to-tr from-emerald-600 to-teal-600 shadow-emerald-500/20'
                      }`}>
                        {isBot ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                      </div>
                    )}

                    <div className="space-y-1.5">
                      <div className="text-[10px] font-bold text-slate-400 px-1 flex items-center gap-1.5">
                        <span>{!isUser ? (isBot ? '🤖 Trợ lý DHT AI' : `👨‍💼 CSKH (${m.senderName || 'Hỗ trợ'})`) : 'Bạn'}</span>
                        <span className="text-[9px] font-mono text-slate-400/80">{m.timestamp}</span>
                      </div>

                      <div className={`p-3.5 rounded-3xl leading-relaxed shadow-xs transition-all ${
                        isUser
                          ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-tr-xs font-medium shadow-indigo-600/10'
                          : isBot
                          ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200/80 dark:border-slate-700/80 rounded-tl-xs shadow-sm'
                          : 'bg-emerald-600 text-white rounded-tl-xs font-medium'
                      }`}>
                        <p className="whitespace-pre-wrap">{m.content}</p>

                        {/* Thẻ sản phẩm / dịch vụ đính kèm nếu có */}
                        {m.cards && m.cards.length > 0 && (
                          <div className="mt-3 p-3 bg-gradient-to-br from-indigo-900 to-purple-900 text-white rounded-2xl shadow-lg border border-white/10 space-y-2">
                            {m.cards[0].image && (
                              <img src={m.cards[0].image} alt={m.cards[0].title} className="w-full h-28 object-cover rounded-xl" />
                            )}
                            <h4 className="font-extrabold text-xs">{m.cards[0].title}</h4>
                            <p className="text-amber-300 font-black text-xs">{m.cards[0].price}</p>
                            <p className="text-[10px] text-indigo-200/80 leading-relaxed">{m.cards[0].description}</p>
                            <button
                              onClick={() => navigate('/pricing')}
                              className="w-full mt-2 py-1.5 rounded-xl bg-white text-indigo-900 font-bold text-[11px] shadow-sm hover:bg-indigo-50 transition-all cursor-pointer"
                            >
                              Xem Bảng Giá Ngay
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Quick replies đính kèm nếu có */}
                      {!isUser && m.quickReplies && m.quickReplies.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-0.5">
                          {m.quickReplies.map((qr: any) => (
                            <button
                              key={qr.id || qr.label}
                              type="button"
                              onClick={() => { void handleSend(qr.label); }}
                              className="px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-[10.5px] font-semibold transition-all cursor-pointer shadow-2xs active:scale-95"
                            >
                              {qr.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Hiệu ứng đang gõ tin nhắn */}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-2.5 rounded-2xl text-slate-500 dark:text-slate-400 text-xs flex items-center gap-2.5 shadow-sm">
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  <span className="text-[11px] font-medium">Trợ lý DHT AI đang phản hồi...</span>
                </div>
              </div>
            )}
          </div>

          {/* Quick Prompts Gợi Ý Nhanh */}
          <div className="flex-shrink-0 px-3 py-2 bg-slate-100/80 dark:bg-slate-900/80 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center gap-2 overflow-x-auto no-scrollbar">
            <span className="text-[10px] font-bold text-slate-400 uppercase flex-shrink-0 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-indigo-500" />
              <span>Gợi ý:</span>
            </span>
            {quickPrompts.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => { void handleSend(prompt); }}
                className="px-3 py-1 bg-white dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 hover:text-indigo-600 dark:hover:text-indigo-400 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-full text-[11px] font-medium transition-all flex-shrink-0 cursor-pointer active:scale-95 shadow-xs"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Form Nhập Tin Nhắn */}
          <form onSubmit={(e) => { void handleSend(undefined, e); }} className="flex-shrink-0 p-3 sm:p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2">
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="Nhập câu hỏi, thắc mắc hoặc yêu cầu tư vấn..."
              className="flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-2xl text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 transition-all placeholder:text-slate-400"
            />
            <button
              type="submit"
              disabled={!inputVal.trim() || loading}
              className="w-11 h-11 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-2xl flex items-center justify-center transition-all disabled:opacity-40 shadow-lg shadow-indigo-600/20 active:scale-95 cursor-pointer flex-shrink-0"
              title="Gửi tin nhắn"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

      </main>
      ) : (
        <main className="flex-1 min-h-0 p-4 sm:p-6 max-w-7xl w-full mx-auto overflow-y-auto">
          <UserBillingAnalytics onNavigateToPricing={() => navigate('/pricing')} />
        </main>
      )}
    </div>
  );
};

export default UserPortalPage;
