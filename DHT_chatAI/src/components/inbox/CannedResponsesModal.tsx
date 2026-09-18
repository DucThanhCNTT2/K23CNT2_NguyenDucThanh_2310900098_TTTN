import React, { useState } from 'react';
import { Search, X, MessageSquare, Tag } from 'lucide-react';
import { CannedResponse } from '../../types';
import { cannedResponses } from '../../mock/data';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (content: string) => void;
}

export const CannedResponsesModal: React.FC<Props> = ({ isOpen, onClose, onSelect }) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  if (!isOpen) return null;

  const categories = [
    { id: 'all', label: 'Tất cả mẫu' },
    { id: 'chao_hoi', label: 'Chào hỏi' },
    { id: 'bao_gia', label: 'Báo giá dịch vụ' },
    { id: 'ho_tro', label: 'Hỗ trợ kỹ thuật' },
    { id: 'chinh_sach', label: 'Chính sách & SLA' },
  ];

  const filtered = cannedResponses.filter(item => {
    const matchCat = selectedCategory === 'all' || item.category === selectedCategory;
    const matchSearch = item.title.toLowerCase().includes(search.toLowerCase()) || 
                        item.content.toLowerCase().includes(search.toLowerCase()) ||
                        item.shortcut.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-scale-up">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <MessageSquare className="w-4 h-4" />
            </div>
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-sm sm:text-base">
              Kho Tin Nhắn Mẫu (Canned Responses)
            </h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Tabs */}
        <div className="p-4 space-y-3 bg-slate-50/50 dark:bg-slate-950/30 border-b border-slate-100 dark:border-slate-800">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm kiếm mẫu theo tiêu đề, nội dung hoặc phím tắt (/baogia)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {categories.map(c => (
              <button
                key={c.id}
                onClick={() => setSelectedCategory(c.id)}
                className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === c.id
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* List of responses */}
        <div className="p-4 max-h-80 overflow-y-auto space-y-2.5">
          {filtered.length === 0 ? (
            <p className="text-center text-xs text-slate-400 py-6">Không tìm thấy tin nhắn mẫu phù hợp.</p>
          ) : (
            filtered.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  onSelect(item.content);
                  onClose();
                }}
                className="group p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600 bg-white dark:bg-slate-800/80 hover:bg-indigo-50/40 dark:hover:bg-indigo-950/30 cursor-pointer transition-all"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-semibold text-xs sm:text-sm text-slate-800 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                    {item.title}
                  </span>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-mono font-medium">
                    {item.shortcut}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                  {item.content}
                </p>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 text-right">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 font-medium"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
