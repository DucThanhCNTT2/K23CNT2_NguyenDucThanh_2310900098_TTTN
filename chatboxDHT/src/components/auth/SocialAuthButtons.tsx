import React, { useEffect, useState } from 'react';
import { Code2 } from 'lucide-react';
import { apiService, type OAuthProvider } from '../../services/api';

type SocialAuthButtonsProps = {
  intent: 'login' | 'signup';
};

const providers: Array<{ id: OAuthProvider; label: string }> = [
  { id: 'google', label: 'Google' },
  { id: 'facebook', label: 'Facebook' },
  { id: 'github', label: 'GitHub' }
];

export const SocialAuthButtons: React.FC<SocialAuthButtonsProps> = ({ intent }) => {
  const [availableProviders, setAvailableProviders] = useState<Record<OAuthProvider, boolean> | null>(null);
  const [configurationError, setConfigurationError] = useState(false);
  const [pendingProvider, setPendingProvider] = useState<OAuthProvider | null>(null);
  const actionLabel = intent === 'login' ? 'Đăng nhập' : 'Đăng ký';

  useEffect(() => {
    let active = true;
    void apiService.getOAuthProviders()
      .then((available) => {
        if (active) setAvailableProviders(available);
      })
      .catch(() => {
        if (active) {
          setAvailableProviders({ google: false, facebook: false, github: false });
          setConfigurationError(true);
        }
      });
    return () => {
      active = false;
    };
  }, []);

  const startSocialAuth = (provider: OAuthProvider) => {
    setPendingProvider(provider);
    window.location.assign(apiService.getOAuthStartUrl(provider));
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2">
        {providers.map(({ id, label }) => {
          const enabled = availableProviders?.[id] === true;
          const accessibleLabel = `${actionLabel} bằng ${label}`;
          return (
            <button
              key={id}
              type="button"
              disabled={!enabled || pendingProvider !== null}
              onClick={() => startSocialAuth(id)}
              className="auth-social-button flex min-h-11 items-center justify-center gap-2 rounded-xl px-2 text-xs font-bold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50 dark:text-slate-200"
              aria-label={accessibleLabel}
              title={enabled ? accessibleLabel : `${label} OAuth chưa được cấu hình`}
            >
              {id === 'google' ? (
                <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.09-1.92 3.27-4.75 3.27-8.1Z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.65l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.15v2.84A11 11 0 0 0 12 23Z" />
                  <path fill="#FBBC05" d="M5.84 14.11a6.6 6.6 0 0 1 0-4.22V7.05H2.15a11 11 0 0 0 0 9.9l3.69-2.84Z" />
                  <path fill="#EA4335" d="M12 4.36c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 1.09 14.97 0 12 0a11 11 0 0 0-9.85 7.05l3.69 2.84C6.71 7.29 9.14 4.36 12 4.36Z" />
                </svg>
              ) : id === 'facebook' ? (
                <span aria-hidden="true" className="flex h-4 w-4 items-center justify-center rounded-full bg-[#1877f2] text-[11px] font-black text-white">f</span>
              ) : (
                <Code2 className="h-4 w-4" aria-hidden="true" />
              )}
              <span className="auth-provider-label">
                {pendingProvider === id ? 'Đang mở' : label}
              </span>
            </button>
          );
        })}
      </div>
      {configurationError ? (
        <p role="status" className="text-center text-[11px] text-amber-700 dark:text-amber-300">
          Không tải được cấu hình đăng nhập xã hội. Bạn vẫn có thể tiếp tục bằng email.
        </p>
      ) : availableProviders && !Object.values(availableProviders).some(Boolean) ? (
        <p className="text-center text-[11px] text-slate-400">
          Đăng nhập xã hội sẽ khả dụng sau khi cấu hình OAuth trên máy chủ.
        </p>
      ) : null}
    </div>
  );
};
