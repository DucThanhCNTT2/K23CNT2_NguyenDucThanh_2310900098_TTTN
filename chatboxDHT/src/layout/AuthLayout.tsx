import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Bot, ShieldCheck, Zap, Sun, Moon, ArrowLeft } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface Props {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

export const AuthLayout: React.FC<Props> = ({ children, title, subtitle }) => {
  const { theme, toggleTheme } = useApp();

  return (
    <div className="min-h-screen w-screen flex bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors">
      {/* Left Feature Showcase Panel (hidden on small screens) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-900 via-indigo-800 to-purple-900 p-12 text-white flex-col justify-between relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl"></div>

        {/* Top Logo */}
        <div className="relative z-10 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur border border-white/20 flex items-center justify-center text-white shadow-lg">
              <Sparkles className="w-6 h-6 text-pink-400" />
            </div>
            <div>
              <h2 className="font-black text-xl tracking-tight leading-none">DHT ChatAI</h2>
              <span className="text-xs text-indigo-200">Omnichannel AI Chatbot Platform</span>
            </div>
          </Link>
          <Link
            to="/"
            className="flex items-center gap-1.5 text-xs text-indigo-200 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Về trang chủ</span>
          </Link>
        </div>

        {/* Middle Value Props */}
        <div className="relative z-10 my-auto py-12 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur border border-white/20 text-xs font-semibold text-pink-300">
            <Bot className="w-4 h-4" />
            <span>Đột Phá Chăm Sóc Khách Hàng 2026</span>
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight leading-tight">
            Một Nền Tảng Chatbot AI <br />
            <span className="bg-gradient-to-r from-pink-400 via-purple-300 to-indigo-200 bg-clip-text text-transparent">
              Hội Tụ Website, FB & Zalo
            </span>
          </h1>

          <p className="text-indigo-100 text-sm leading-relaxed max-w-lg">
            Huấn luyện AI từ tài liệu doanh nghiệp chỉ trong 30 giây. Hỗ trợ nhân viên tiếp quản 1 chạm (1-Click Switch) và tự động đồng bộ CRM khách hàng tức thì.
          </p>

          <div className="grid grid-cols-2 gap-4 pt-4">
            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur border border-white/10">
              <Zap className="w-5 h-5 text-amber-400 mb-2" />
              <div className="text-2xl font-bold">84.6%</div>
              <div className="text-xs text-indigo-200">Tỷ lệ Bot giải quyết tự động</div>
            </div>

            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur border border-white/10">
              <ShieldCheck className="w-5 h-5 text-emerald-400 mb-2" />
              <div className="text-2xl font-bold">8.4 giây</div>
              <div className="text-xs text-indigo-200">Thời gian phản hồi trung bình</div>
            </div>
          </div>
        </div>

        {/* Bottom Testimonial */}
        <div className="relative z-10 p-4 rounded-2xl bg-white/5 backdrop-blur border border-white/10">
          <p className="text-xs italic text-indigo-100">
            "Từ khi tích hợp DHT AI cho cả Fanpage và Zalo OA, doanh thu chốt đơn của chúng tôi tăng 45% và tỷ lệ phản hồi khách luôn dưới 10 giây!"
          </p>
          <div className="mt-2 flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-pink-500 flex items-center justify-center text-[10px] font-bold">
              MP
            </div>
            <span className="text-xs font-semibold">Mai Phương - CEO Fashion Brand</span>
          </div>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="w-full lg:w-1/2 flex flex-col justify-between p-6 sm:p-12 overflow-y-auto">
        <div className="flex items-center justify-between">
          <div className="lg:hidden flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="font-bold text-sm">DHT ChatAI</span>
          </div>

          <button
            onClick={toggleTheme}
            className="ml-auto p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Đổi màu giao diện"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>

        <div className="w-full max-w-md mx-auto my-auto py-8">
          <div className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
              {title}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
              {subtitle}
            </p>
          </div>

          {children}
        </div>

        <div className="text-center text-xs text-slate-400 py-4">
          © 2026 DHT AI Solution Corp • Bảo mật đa lớp SSL & OAuth2
        </div>
      </div>
    </div>
  );
};
