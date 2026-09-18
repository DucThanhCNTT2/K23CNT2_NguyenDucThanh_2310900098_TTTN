import React, { useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Bot, 
  Clock, 
  Star, 
  Calendar, 
  ArrowUpRight, 
  Sparkles,
  Globe,
  MessageCircle
} from 'lucide-react';
import { analyticsData } from '../../mock/data';

export const AnalyticsPage: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('7d');

  const maxDailyCount = Math.max(...analyticsData.dailyStats.map(d => d.website + d.facebook + d.zalo));

  return (
    <div className="h-full w-full flex flex-col bg-slate-50 dark:bg-slate-950 overflow-hidden font-sans select-none">
      {/* Top Header */}
      <div className="h-16 px-6 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-white flex items-center justify-center shadow-sm">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span>Báo Cáo & Thống Kê Hiệu Suất (Analytics)</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-bold">
                Cập nhật Realtime
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Đo lường mức độ hài lòng khách hàng và hiệu quả tự động hóa của Chatbot AI
            </p>
          </div>
        </div>

        {/* Time Filter */}
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setTimeRange('7d')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              timeRange === '7d' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs' : 'text-slate-500'
            }`}
          >
            7 ngày qua
          </button>
          <button
            onClick={() => setTimeRange('30d')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              timeRange === '30d' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs' : 'text-slate-500'
            }`}
          >
            30 ngày qua
          </button>
          <button
            onClick={() => setTimeRange('90d')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              timeRange === '90d' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs' : 'text-slate-500'
            }`}
          >
            Quý này
          </button>
        </div>
      </div>

      {/* Main Stats Body */}
      <div className="flex-1 p-6 overflow-y-auto max-w-6xl mx-auto w-full space-y-6">
        {/* KPI Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Tổng Hội Thoại</span>
              <Users className="w-5 h-5 text-indigo-500" />
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-slate-100">
              {analyticsData.kpis.totalConversations}
            </div>
            <div className="mt-2 flex items-center gap-1 text-xs text-emerald-600 font-semibold">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+18.4% so với tuần trước</span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Bot Giải Quyết Tự Động</span>
              <Bot className="w-5 h-5 text-purple-500" />
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-slate-100">
              {analyticsData.kpis.botResolutionRate}
            </div>
            <div className="mt-2 flex items-center gap-1 text-xs text-emerald-600 font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Không cần can thiệp CSKH</span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Thời Gian Phản Hồi TB</span>
              <Clock className="w-5 h-5 text-amber-500" />
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-slate-100">
              {analyticsData.kpis.avgResponseTime}
            </div>
            <div className="mt-2 flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 font-semibold">
              <span>Nhanh hơn 85% nhân viên</span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Chỉ Số Hài Lòng (CSAT)</span>
              <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-slate-100">
              {analyticsData.kpis.csatScore}
            </div>
            <div className="mt-2 flex items-center gap-1 text-xs text-amber-500 font-semibold">
              <span>⭐ 96% Đánh giá 5 sao</span>
            </div>
          </div>
        </div>

        {/* Visual Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Daily Bar Chart */}
          <div className="lg:col-span-2 p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-slate-100">
                  Lượng Tin Nhắn Theo Ngày & Kênh Tiếp Nhận
                </h3>
                <p className="text-xs text-slate-400">Website Widget, FB Messenger và Zalo OA</p>
              </div>

              {/* Legend */}
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                  <span className="w-2.5 h-2.5 rounded bg-purple-500"></span>
                  Website
                </span>
                <span className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                  <span className="w-2.5 h-2.5 rounded bg-blue-500"></span>
                  Facebook
                </span>
                <span className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                  <span className="w-2.5 h-2.5 rounded bg-cyan-500"></span>
                  Zalo
                </span>
              </div>
            </div>

            {/* Custom Bar Graph */}
            <div className="h-64 flex items-end justify-between gap-3 pt-8 pb-2 border-b border-slate-200 dark:border-slate-800">
              {analyticsData.dailyStats.map((item, idx) => {
                const total = item.website + item.facebook + item.zalo;
                const totalHeightPct = (total / maxDailyCount) * 100;

                const webPct = (item.website / total) * 100;
                const fbPct = (item.facebook / total) * 100;
                const zaloPct = (item.zalo / total) * 100;

                return (
                  <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group">
                    {/* Tooltip on hover */}
                    <div className="text-[10px] font-bold text-slate-500 group-hover:text-indigo-600 mb-1 transition-colors">
                      {total}
                    </div>

                    <div 
                      style={{ height: `${totalHeightPct}%` }}
                      className="w-full max-w-[36px] rounded-t-lg overflow-hidden flex flex-col-reverse shadow-xs transition-all group-hover:opacity-90"
                    >
                      <div style={{ height: `${webPct}%` }} className="bg-purple-500 w-full" title={`Web: ${item.website}`} />
                      <div style={{ height: `${fbPct}%` }} className="bg-blue-500 w-full" title={`FB: ${item.facebook}`} />
                      <div style={{ height: `${zaloPct}%` }} className="bg-cyan-500 w-full" title={`Zalo: ${item.zalo}`} />
                    </div>

                    <span className="text-[11px] text-slate-500 font-medium mt-2">
                      {item.day}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Channel Breakdown Donut / List */}
          <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-slate-100">
                Tỷ Trọng Kênh Tiếp Nhận
              </h3>
              <p className="text-xs text-slate-400">Phân bổ lưu lượng hội thoại đa kênh</p>
            </div>

            <div className="space-y-4 my-auto py-2">
              {analyticsData.channelBreakdown.map((ch, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      {ch.name.includes('Website') && <Globe className="w-3.5 h-3.5 text-purple-500" />}
                      {ch.name.includes('Facebook') && <MessageCircle className="w-3.5 h-3.5 text-blue-500" />}
                      {ch.name.includes('Zalo') && <span className="text-xs font-bold text-cyan-500">Z</span>}
                      <span>{ch.name}</span>
                    </span>
                    <span className="font-bold text-slate-900 dark:text-slate-100">
                      {ch.count} ({ch.percentage}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${ch.percentage}%`, backgroundColor: ch.color }}
                      className="h-full rounded-full transition-all duration-500"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs text-slate-500 dark:text-slate-400">
              💡 <strong>Nhận định AI:</strong> Kênh Website Widget chiếm tỷ lệ cao nhất (48%), Zalo OA đang có tốc độ tăng trưởng nhanh nhất (+26%/tháng).
            </div>
          </div>
        </div>

        {/* CSAT Star Ratings Breakdown */}
        <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-slate-100">
            Phân Tích Chi Tiết Đánh Giá Hài Lòng Khách Hàng (CSAT Ratings)
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            {analyticsData.ratingBreakdown.map((r) => (
              <div key={r.stars} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-center space-y-1">
                <div className="flex items-center justify-center gap-0.5">
                  {Array.from({ length: r.stars }).map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <div className="text-base font-extrabold text-slate-900 dark:text-slate-100">
                  {r.count} lượt
                </div>
                <div className="text-xs text-slate-400 font-medium">
                  {r.percentage}% phản hồi
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
