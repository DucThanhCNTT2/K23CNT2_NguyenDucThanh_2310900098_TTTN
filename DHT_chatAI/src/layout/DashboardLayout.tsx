import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Inbox, 
  Bot, 
  Database, 
  Share2, 
  BarChart3, 
  Settings, 
  LogOut, 
  Sun, 
  Moon, 
  Menu, 
  X, 
  Bell, 
  Search, 
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Zap,
  Globe
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { theme, toggleTheme, currentUser, isAgentOnline, setIsAgentOnline } = useApp();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    {
      label: 'Hộp thư Đa kênh',
      path: '/dashboard/inbox',
      icon: Inbox,
      badge: '3'
    },
    {
      label: 'Kịch bản Bot AI',
      path: '/dashboard/bot-builder',
      icon: Bot,
      badge: 'Flow'
    },
    {
      label: 'Kho Dữ liệu & FAQ',
      path: '/dashboard/knowledge',
      icon: Database
    },
    {
      label: 'Tích hợp Đa kênh',
      path: '/dashboard/integrations',
      icon: Share2,
      badge: 'FB • Zalo'
    },
    {
      label: 'Báo cáo & Thống kê',
      path: '/dashboard/analytics',
      icon: BarChart3
    }
  ];

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-100 dark:bg-slate-950 font-sans">
      {/* Sidebar Desktop */}
      <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex-col justify-between hidden md:flex z-20">
        <div>
          {/* Logo & Brand */}
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center text-white shadow-md">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h1 className="font-extrabold text-sm tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-1">
                  <span>DHT</span>
                  <span className="text-indigo-600 dark:text-indigo-400">ChatAI</span>
                </h1>
                <span className="text-[10px] text-slate-400 font-medium">Omnichannel Platform</span>
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname.startsWith(item.path);
              const Icon = item.icon;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/30'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Profile & Utilities */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 space-y-3">
          {/* Agent Online / Offline Toggle */}
          <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 text-xs">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${isAgentOnline ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}></span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                {isAgentOnline ? 'CSKH Trực tuyến' : 'Tạm vắng'}
              </span>
            </div>
            <button
              onClick={() => setIsAgentOnline(!isAgentOnline)}
              className={`text-[10px] font-bold px-2 py-0.5 rounded-md transition-colors ${
                isAgentOnline 
                  ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
              }`}
            >
              {isAgentOnline ? 'BẬT' : 'TẮT'}
            </button>
          </div>

          {/* Theme Toggle & User Info */}
          <div className="flex items-center justify-between px-2 pt-1">
            <div className="flex items-center gap-2 min-w-0">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-700"
              />
              <div className="min-w-0">
                <p className="font-semibold text-xs text-slate-800 dark:text-slate-200 truncate">
                  {currentUser.name}
                </p>
                <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-medium">
                  {currentUser.plan} Plan
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={toggleTheme}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Đổi giao diện sáng/tối"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
              </button>
              <button
                onClick={() => navigate('/logout')}
                className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                title="Đăng xuất"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Mobile Header Bar */}
        <div className="h-14 md:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="font-bold text-sm text-slate-900 dark:text-slate-100">DHT ChatAI</span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-lg text-slate-600 dark:text-slate-400"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 rounded-lg text-slate-600 dark:text-slate-400"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Drawer Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-4 space-y-2 z-30 shadow-xl">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between p-2.5 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <div className="flex items-center gap-3">
                  <item.icon className="w-4 h-4 text-indigo-600" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 font-bold">
                    {item.badge}
                  </span>
                )}
              </Link>
            ))}
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
              <Link
                to="/logout"
                className="flex items-center gap-2 p-2 text-sm text-rose-500 font-semibold"
              >
                <LogOut className="w-4 h-4" />
                <span>Đăng xuất</span>
              </Link>
            </div>
          </div>
        )}

        {/* Page Content Outlet */}
        <main className="flex-1 overflow-hidden relative">
          {children}
        </main>
      </div>
    </div>
  );
};
