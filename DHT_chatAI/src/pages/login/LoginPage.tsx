import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck, UserCheck } from 'lucide-react';
import { AuthLayout } from '../../layout/AuthLayout';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate('/dashboard/inbox');
    }, 600);
  };

  const handleDemoAdmin = () => {
    setEmail('admin@chatai.vn');
    setPassword('admin123456');
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate('/dashboard/inbox');
    }, 400);
  };

  const handleDemoAgent = () => {
    setEmail('agent.hieu@chatai.vn');
    setPassword('agent123456');
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate('/dashboard/inbox');
    }, 400);
  };

  return (
    <AuthLayout
      title="Đăng Nhập Quản Trị"
      subtitle="Truy cập Dashboard điều khiển Chatbot AI và Hộp thư Omnichannel"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Quick Demo Credentials */}
        <div className="p-3 bg-indigo-50/80 dark:bg-indigo-950/40 rounded-xl border border-indigo-200 dark:border-indigo-900 space-y-2">
          <span className="text-[11px] font-bold text-indigo-900 dark:text-indigo-300 uppercase tracking-wider block">
            ⚡ Trải nghiệm nhanh (1-Click Login):
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleDemoAdmin}
              className="py-1.5 px-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin Toàn Quyền</span>
            </button>
            <button
              type="button"
              onClick={handleDemoAgent}
              className="py-1.5 px-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Tư Vấn CSKH</span>
            </button>
          </div>
        </div>

        {/* Email Field */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Email Doanh Nghiệp
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="email"
              required
              placeholder="tenban@congty.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-800 transition-all"
            />
          </div>
        </div>

        {/* Password Field */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Mật khẩu
            </label>
            <Link
              to="/forget-password"
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Quên mật khẩu?
            </Link>
          </div>
          <div className="relative">
            <Lock className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type={showPassword ? 'text' : 'password'}
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-800 transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Remember me */}
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 dark:border-slate-700"
            />
            <span className="text-xs text-slate-600 dark:text-slate-400">Duy trì đăng nhập trong 30 ngày</span>
          </label>
        </div>

        {/* Submit button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-bold text-sm shadow-md hover:shadow-indigo-500/25 transition-all flex items-center justify-center gap-2"
        >
          {loading ? (
            <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
          ) : (
            <>
              <span>Đăng Nhập Vào Hệ Thống</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

        {/* Signup Redirect */}
        <div className="text-center pt-2">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Chưa có tài khoản doanh nghiệp?{' '}
            <Link to="/signup" className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
              Đăng ký dùng thử miễn phí
            </Link>
          </p>
        </div>
      </form>
    </AuthLayout>
  );
};
