import React, { useEffect } from 'react';
import { ShieldCheck, Sparkles } from 'lucide-react';
import { apiService } from '../services/api';

export const OAuthCallbackPage: React.FC = () => {
  useEffect(() => {
    let active = true;
    void apiService.exchangeOAuthLogin()
      .then((data) => {
        if (!active) return;
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        window.location.replace(data.user.role === 'user' ? '/portal' : '/dashboard/inbox');
      })
      .catch(() => {
        if (active) window.location.replace('/login?oauth_error=failed');
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <main className="auth-shell page-enter flex min-h-screen items-center justify-center px-5 py-12">
      <section className="auth-card w-full max-w-md rounded-3xl border bg-white p-8 text-center dark:bg-slate-900">
        <div className="auth-emblem mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-[#9a7138] dark:bg-amber-950/40 dark:text-amber-300">
          <ShieldCheck className="h-7 w-7" />
        </div>
        <p className="editorial-eyebrow">Đăng nhập bảo mật</p>
        <h1 className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">Đang xác thực tài khoản</h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Hệ thống đang hoàn tất phiên đăng nhập an toàn của bạn.
        </p>
        <div className="mt-6 flex items-center justify-center gap-2 text-sm font-semibold text-[#102f4d] dark:text-amber-200">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          <Sparkles className="h-4 w-4" />
          <span>Vui lòng chờ</span>
        </div>
      </section>
    </main>
  );
};
