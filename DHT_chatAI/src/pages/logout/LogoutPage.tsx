import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, CheckCircle2, ArrowRight, Home } from 'lucide-react';

export const LogoutPage: React.FC = () => {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(4);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate('/login');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 font-sans text-slate-900 dark:text-slate-100">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 text-center space-y-6 animate-scale-up">
        <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center ring-8 ring-emerald-50/50 dark:ring-emerald-950/30">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <div>
          <h2 className="text-2xl font-black tracking-tight">Đăng Xuất Thành Công</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
            Phiên làm việc của bạn đã được đóng an toàn. Hệ thống sẽ tự động chuyển về trang Đăng nhập sau <span className="font-bold text-indigo-600 dark:text-indigo-400">{countdown} giây</span>.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <Link
            to="/login"
            className="py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
          >
            <span>Đăng nhập lại</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            to="/"
            className="py-2.5 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            <Home className="w-4 h-4" />
            <span>Trang chủ</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
