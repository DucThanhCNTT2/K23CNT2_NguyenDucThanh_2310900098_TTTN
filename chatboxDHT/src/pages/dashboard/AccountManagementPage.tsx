import React, { useEffect, useState } from 'react';
import { 
  ShieldCheck, 
  Users, 
  Search, 
  Crown, 
  UserCog, 
  BriefcaseBusiness, 
  Trash2 
} from 'lucide-react';
import { apiService } from '../../services/api';
import { AccountUser, UserRole } from '../../types';
import { useApp } from '../../context/AppContext';

const roleOptions: { value: UserRole; label: string; description: string }[] = [
  { value: 'user', label: 'User', description: 'Người dùng thường' },
  { value: 'agent', label: 'CSKH / Agent', description: 'Xử lý chat' },
  { value: 'supervisor', label: 'Supervisor', description: 'Quản lý đội ngũ' },
  { value: 'admin', label: 'Admin', description: 'Quản trị hệ thống' }
];

export const AccountManagementPage: React.FC = () => {
  const { currentUser } = useApp();
  const [accounts, setAccounts] = useState<AccountUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const loadAccounts = async () => {
    setLoading(true);
    try {
      const data = await apiService.getUsers();
      let list: AccountUser[] = [];
      if (Array.isArray(data)) {
        list = data;
      } else if (data && Array.isArray((data as any).data)) {
        list = (data as any).data;
      } else if (data && Array.isArray((data as any).users)) {
        list = (data as any).users;
      } else if (data && Array.isArray((data as any).accounts)) {
        list = (data as any).accounts;
      }
      setAccounts(list);
    } catch (error) {
      console.error('[AccountPage] ❌ Lỗi khi tải danh sách user:', error);
      setAccounts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadAccounts();
  }, []);

  const handleRoleChange = async (userId: string, role: UserRole) => {
    try {
      const updated = await apiService.updateUserRole(userId, role);
      if (updated && (updated.id || (updated as any)._id)) {
        const updatedId = updated.id || (updated as any)._id;
        setAccounts((prev) => prev.map((item) => ((item.id || (item as any)._id) === updatedId ? updated : item)));
      } else {
        await loadAccounts();
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật quyền!');
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa tài khoản "${userName}" khỏi hệ thống không?`)) {
      try {
        await apiService.deleteUser(userId);
        setAccounts((prev) => prev.filter((account) => (account.id || (account as any)._id) !== userId));
      } catch (error: any) {
        alert(error.response?.data?.message || 'Có lỗi xảy ra khi xóa tài khoản!');
      }
    }
  };

  const filtered = accounts.filter((account) => {
    if (!account) return false;
    const query = search.toLowerCase().trim();
    if (!query) return true;

    const name = (account.name || '').toLowerCase();
    const email = (account.email || '').toLowerCase();
    const company = (account.companyName || '').toLowerCase();
    const role = (account.role || '').toLowerCase();

    return (
      name.includes(query) ||
      email.includes(query) ||
      company.includes(query) ||
      role.includes(query)
    );
  });

  return (
    <div className="w-full h-full min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 font-sans select-none">
      {/* Header Cố Định */}
      <div className="h-16 px-6 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-xs shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#102f4d] to-[#bd9457] text-white flex items-center justify-center shadow-sm">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Quản lý tài khoản</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Phân quyền và quản lý người dùng trong hệ thống</p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 rounded-xl px-3 py-2 text-xs text-slate-500 font-semibold">
          <Users className="w-4 h-4" />
          <span>{accounts.length} tài khoản</span>
        </div>
      </div>

      {/* Main Container Có Thanh Cuộn Tự Động (overflow-y-auto) */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 max-w-6xl mx-auto w-full">
        {/* Search Bar */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-4 sticky top-0 z-10">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm tài khoản theo tên, email hoặc vai trò..."
              className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Account List */}
        {loading ? (
          <div className="text-sm text-slate-500 text-center py-8">Đang tải danh sách tài khoản...</div>
        ) : (
          <div className="space-y-3 pb-8">
            {filtered.map((account, index) => {
              const accountId = account.id || (account as any)._id;
              const isSelf = accountId === currentUser?.id || account.email === currentUser?.email;

              return (
                <div 
                  key={accountId || index} 
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex items-center justify-between gap-4 shadow-xs hover:border-slate-300 transition-all"
                >
                  {/* Left: User Info */}
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={account.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                      alt={account.name || 'Avatar'}
                      className="w-11 h-11 rounded-full object-cover border border-slate-200 dark:border-slate-700 flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-sm text-slate-900 dark:text-slate-100 truncate">{account.name || 'Người dùng'}</p>
                        {isSelf && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-400 font-bold">
                            Bạn
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{account.email || 'Chưa có email'}</p>
                      <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate">{account.companyName || 'DHT AI Solution Corp'}</p>
                    </div>
                  </div>

                  {/* Right: Controls */}
                  <div className="flex items-center gap-3 flex-shrink-0">
                    {/* Badge Current Role */}
                    <div className="w-28 sm:w-32 flex items-center justify-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-xl px-2.5 py-2">
                      {account.role === 'admin' ? (
                        <Crown className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                      ) : account.role === 'agent' ? (
                        <UserCog className="w-3.5 h-3.5 text-cyan-500 flex-shrink-0" />
                      ) : (
                        <BriefcaseBusiness className="w-3.5 h-3.5 text-violet-500 flex-shrink-0" />
                      )}
                      <span className="capitalize font-medium">{account.role || 'user'}</span>
                    </div>

                    {/* Role Dropdown */}
                    <select
                      value={account.role || 'user'}
                      onChange={(e) => handleRoleChange(accountId, e.target.value as UserRole)}
                      className="w-32 sm:w-36 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                    >
                      {roleOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>

                    {/* Trash Button */}
                    <div className="w-8 flex items-center justify-center">
                      {!isSelf && (
                        <button
                          onClick={() => handleDeleteUser(accountId, account.name || 'Tài khoản')}
                          className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors cursor-pointer"
                          title={`Xóa tài khoản ${account.name || ''}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {filtered.length === 0 && (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center text-sm text-slate-500">
                Không tìm thấy tài khoản nào phù hợp.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AccountManagementPage;