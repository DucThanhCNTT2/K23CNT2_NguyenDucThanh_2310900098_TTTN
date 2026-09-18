import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, 
  Bot, 
  MessageSquare, 
  Globe, 
  Share2, 
  Zap, 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle2, 
  Layers, 
  BarChart3, 
  Sun, 
  Moon,
  ExternalLink,
  ChevronRight,
  Star
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { LiveChatWidget } from '../components/widget/LiveChatWidget';

export const LandingPage: React.FC = () => {
  const { theme, toggleTheme, setWidgetOpen } = useApp();

  return (
    <div className="min-h-screen w-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-indigo-500 selection:text-white transition-colors">
      {/* Navigation Bar */}
      <header className="fixed top-0 inset-x-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center text-white shadow-md">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="font-black text-lg tracking-tight">DHT ChatAI</span>
              <span className="text-[10px] block text-slate-400 font-medium -mt-1">Omnichannel Platform</span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600 dark:text-slate-300">
            <a href="#features" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Tính năng nổi bật</a>
            <a href="#widget-demo" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Live Chat Widget</a>
            <a href="#omnichannel" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Hộp thư tập trung</a>
            <a href="#pricing" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Bảng giá</a>
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Đổi giao diện sáng/tối"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>

            <Link
              to="/login"
              className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-indigo-600 transition-colors hidden sm:block"
            >
              Đăng nhập
            </Link>

            <Link
              to="/dashboard/inbox"
              className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-95 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-indigo-500/20 transition-all flex items-center gap-1.5"
            >
              <span>Vào Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 relative overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-indigo-500/15 dark:bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-5xl mx-auto text-center space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-800 text-xs font-semibold text-indigo-700 dark:text-indigo-300">
            <Sparkles className="w-3.5 h-3.5 text-pink-500" />
            <span>Nền tảng Chatbot AI Đa Kênh Thế Hệ Mới 2026</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight">
            Xây Dựng Chatbot AI Đa Kênh <br />
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 bg-clip-text text-transparent">
              Website • Messenger • Zalo OA
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
            Hội tụ toàn bộ tin nhắn đa kênh về một màn hình duy nhất. Huấn luyện Bot bằng tài liệu doanh nghiệp trong 30 giây và tiếp quản hội thoại chỉ với 1-Click Switch.
          </p>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            <button
              onClick={() => setWidgetOpen(true)}
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-2xl text-sm font-bold shadow-lg shadow-indigo-500/25 transition-all flex items-center gap-2 hover:scale-105 active:scale-95"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Thử Ngay Live Chat Widget</span>
            </button>

            <Link
              to="/dashboard/inbox"
              className="px-6 py-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-2xl text-sm font-bold shadow-xs transition-all flex items-center gap-2"
            >
              <span>Xem Dashboard Quản Trị</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Trust badges */}
          <div className="pt-10 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Không cần biết code</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Đồng bộ 2 chiều Zalo & FB</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Lưu lịch sử LocalStorage</span>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Showcase 1: Live Chat Widget */}
      <section id="widget-demo" className="py-16 px-4 sm:px-6 bg-white dark:bg-slate-900 border-y border-slate-200 dark:border-slate-800">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              1. Live Chat Widget (Giao Diện Khách Hàng)
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Trải nghiệm người dùng mượt mà, hỗ trợ đa phương tiện và đánh giá CSAT trực tiếp.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base">UI/UX Hiện Đại & Animation</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Floating Action Button nhỏ gọn góc dưới, hiệu ứng mở đóng mượt mà, hỗ trợ tự động cả Light mode và Dark mode trên mọi thiết bị di động hay máy tính.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base">Đa Phương Tiện & Carousel</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Gửi thẻ sản phẩm (Carousel Cards) cuộn ngang có giá, nút bấm nhanh (Quick Replies), đính kèm file, hình ảnh và hiển thị trạng thái đã gửi / đã xem / đang gõ.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Star className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base">Đánh Giá CSAT & LocalStorage</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Tích hợp khung đánh giá sao (1-5 sao) sau phiên hỗ trợ. Lưu lịch sử trò chuyện cục bộ giúp khách không bị mất tin nhắn khi F5 trang.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Showcase 2: Omnichannel Inbox & Live Agent */}
      <section id="omnichannel" className="py-16 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              2. Dashboard / Admin Panel Tập Trung
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Màn hình Single View kết nối Website, Facebook Messenger và Zalo OA với công cụ hỗ trợ CSKH chuyên sâu.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
                <h4 className="font-bold text-sm text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                  <Globe className="w-4 h-4" />
                  <span>Hộp Thư Tập Trung (Omnichannel Single View)</span>
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Gộp tin nhắn từ 3 kênh về một giao diện. Bộ lọc thông minh theo kênh, mức độ ưu tiên, nhãn tag và nhân viên phụ trách.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
                <h4 className="font-bold text-sm text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                  <Zap className="w-4 h-4" />
                  <span>1-Click Switch: Tiếp Quản Bot Ngay Tức Thì</span>
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Khi khách hàng gặp vấn đề phức tạp, tư vấn viên bấm 1 nút để tiếp quản trực tiếp. Bot sẽ tự động dừng phản hồi để nhân viên trò chuyện.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
                <h4 className="font-bold text-sm text-purple-600 dark:text-purple-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Cột CRM Khách Hàng & Kho Tin Nhắn Mẫu</span>
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Xem ngay SĐT, email, lịch sử đơn hàng, hành trình đa kênh và sử dụng phím tắt <code className="bg-slate-100 dark:bg-slate-800 px-1 rounded">/baogia</code> để trả lời siêu tốc.
                </p>
              </div>
            </div>

            {/* Visual Preview Graphic */}
            <div className="p-6 rounded-3xl bg-gradient-to-tr from-indigo-900 to-purple-900 text-white shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                  <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                  <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                </div>
                <span className="text-xs font-mono text-indigo-200">DHT Omnichannel Console v2.0</span>
              </div>

              <div className="p-4 rounded-2xl bg-white/10 backdrop-blur space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold">Trạng thái điều khiển:</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-white font-bold text-[10px]">
                    1-Click Switch Hoạt động
                  </span>
                </div>
                <p className="text-xs text-indigo-100 leading-relaxed">
                  "Bot AI đã giải quyết 84.6% câu hỏi tự động từ kho tài liệu RAG doanh nghiệp."
                </p>
              </div>

              <div className="pt-2 text-center">
                <Link
                  to="/dashboard/inbox"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-pink-300 hover:text-white transition-colors"
                >
                  <span>Mở Trực Tiếp Hộp Thư Quản Trị</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-16 px-4 sm:px-6 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-5xl mx-auto text-center mb-12 space-y-2">
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            Gói Dịch Vụ Phù Hợp Mọi Doanh Nghiệp
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Dùng thử đầy đủ tính năng trong 14 ngày, không cần thẻ tín dụng
          </p>
        </div>

        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <h4 className="font-bold text-lg">Gói Starter</h4>
              <div className="text-3xl font-black">499.000 ₫<span className="text-xs font-normal text-slate-400">/tháng</span></div>
              <p className="text-xs text-slate-500">Tối ưu cho website cá nhân hoặc shop bán lẻ nhỏ.</p>
              <ul className="text-xs space-y-2 text-slate-600 dark:text-slate-300 pt-2">
                <li>✓ Live Chat Widget Website</li>
                <li>✓ Huấn luyện 5 tài liệu AI</li>
                <li>✓ 2.000 tin nhắn/tháng</li>
              </ul>
            </div>
            <Link to="/signup" className="w-full py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 font-semibold text-xs text-center block hover:bg-slate-100">
              Chọn Starter
            </Link>
          </div>

          <div className="p-6 rounded-3xl bg-gradient-to-b from-indigo-50 to-white dark:from-indigo-950/60 dark:to-slate-900 border-2 border-indigo-600 relative flex flex-col justify-between space-y-6 shadow-xl">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[10px] font-extrabold uppercase px-3 py-1 rounded-full">
              Khuyên Dùng Nhiều Nhất
            </span>
            <div className="space-y-3 pt-2">
              <h4 className="font-bold text-lg text-indigo-600 dark:text-indigo-400">Gói Pro Đa Kênh</h4>
              <div className="text-3xl font-black">1.490.000 ₫<span className="text-xs font-normal text-slate-400">/tháng</span></div>
              <p className="text-xs text-slate-500">Đồng bộ Website + FB Messenger + Zalo OA.</p>
              <ul className="text-xs space-y-2 text-slate-600 dark:text-slate-300 pt-2">
                <li>✓ Tích hợp cả 3 kênh: Web, FB, Zalo</li>
                <li>✓ Huấn luyện 50 tài liệu RAG & URL</li>
                <li>✓ Không giới hạn tin nhắn</li>
                <li>✓ 1-Click Switch cho CSKH</li>
              </ul>
            </div>
            <Link to="/signup" className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs text-center block shadow-md">
              Bắt Đầu Dùng Thử
            </Link>
          </div>

          <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <h4 className="font-bold text-lg">Gói Enterprise</h4>
              <div className="text-3xl font-black">Liên hệ</div>
              <p className="text-xs text-slate-500">Hạ tầng AI riêng biệt cho chuỗi doanh nghiệp lớn.</p>
              <ul className="text-xs space-y-2 text-slate-600 dark:text-slate-300 pt-2">
                <li>✓ Hạ tầng Dedicated AI Server</li>
                <li>✓ Tích hợp API ERP & CRM tùy biến</li>
                <li>✓ Cam kết SLA Uptime 99.9%</li>
                <li>✓ Kỹ sư trực hỗ trợ 24/7 riêng</li>
              </ul>
            </div>
            <button onClick={() => setWidgetOpen(true)} className="w-full py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 font-semibold text-xs text-center block hover:bg-slate-100">
              Nhắn Tư Vấn Enterprise
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 sm:px-6 bg-slate-100 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400">
        <p>© 2026 DHT ChatAI Solution Corp • Thiết kế hệ thống Chatbot AI Đa Kênh Website, Facebook Messenger & Zalo OA</p>
      </footer>

      {/* Client Floating Live Chat Widget */}
      <LiveChatWidget />
    </div>
  );
};
