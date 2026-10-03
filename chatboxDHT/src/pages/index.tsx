import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Check,
  ChevronRight,
  Menu,
  MessageCircle,
  Moon,
  ShieldCheck,
  Sparkles,
  Sun,
  X
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { LiveChatWidget } from '../components/widget/LiveChatWidget';

const featureCards = [
  {
    index: '01',
    title: 'Một hộp thư. Mọi kênh.',
    description: 'Website, Messenger và Zalo hội tụ trong một luồng làm việc rõ ràng cho cả đội ngũ.',
    icon: MessageCircle
  },
  {
    index: '02',
    title: 'AI hiểu doanh nghiệp bạn.',
    description: 'Quản lý kiến thức và kịch bản trả lời để trợ lý luôn bám sát thông tin thương hiệu.',
    icon: Sparkles
  },
  {
    index: '03',
    title: 'Con người luôn làm chủ.',
    description: 'Nhân viên có thể tiếp quản hội thoại khi khách cần tư vấn trực tiếp.',
    icon: ShieldCheck
  },
  {
    index: '04',
    title: 'Theo dõi trong một nơi.',
    description: 'Xem hoạt động, mức sử dụng và lịch sử trao đổi ngay trong không gian làm việc.',
    icon: BarChart3
  }
];

const plans = [
  {
    name: 'Starter',
    price: '490.000',
    detail: 'Bắt đầu gọn nhẹ với kênh website và bộ công cụ chăm sóc khách hàng cơ bản.',
    features: ['Website Live Chat', '500 tin nhắn AI / tháng', '5 tài liệu kiến thức'],
    featured: false
  },
  {
    name: 'Pro',
    price: '1.490.000',
    detail: 'Kết nối các kênh chính trong cùng một quy trình chăm sóc khách hàng.',
    features: ['Website, Messenger, Zalo', '2.500 tin nhắn AI / tháng', 'Báo cáo và bàn giao cho nhân viên'],
    featured: true
  },
  {
    name: 'Enterprise',
    price: 'Liên hệ',
    detail: 'Không gian linh hoạt cho doanh nghiệp có quy trình và nhu cầu tích hợp riêng.',
    features: ['Hỗ trợ triển khai', 'Tích hợp theo nhu cầu', 'Đồng hành cùng đội ngũ'],
    featured: false
  }
];

export const LandingPage: React.FC = () => {
  const { theme, toggleTheme, setWidgetOpen } = useApp();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setWidgetOpen(false);
  }, [setWidgetOpen]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="marketing-page min-h-screen overflow-x-hidden">
      <a
        href="#main-content"
        className="sr-only z-50 rounded-md bg-white px-4 py-3 text-sm font-semibold text-slate-900 focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Bỏ qua điều hướng
      </a>

      <header className="marketing-header sticky top-0 z-40 border-b border-[var(--color-line)] bg-[rgba(248,248,245,0.94)] backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] max-w-[1320px] items-center justify-between px-5 sm:px-8 lg:px-12">
          <Link to="/" onClick={closeMenu} className="group flex items-center gap-3" aria-label="DHT ChatAI - Trang chủ">
            <span className="grid h-10 w-10 place-items-center rounded-full border border-[var(--color-ink)] text-[var(--color-ink)] transition-transform group-hover:rotate-[-8deg]">
              <Sparkles aria-hidden="true" className="h-[18px] w-[18px]" strokeWidth={1.5} />
            </span>
            <span>
              <span className="block font-editorial text-[19px] leading-none tracking-[-0.04em] text-[var(--color-ink)]">
                DHT ChatAI
              </span>
              <span className="mt-1 block text-[9px] font-bold uppercase tracking-[0.19em] text-[var(--color-gold)]">
                Omnichannel platform
              </span>
            </span>
          </Link>

          <nav aria-label="Điều hướng chính" className="hidden items-center gap-8 md:flex">
            <a className="editorial-link text-[11px] font-bold uppercase tracking-[0.13em] text-[var(--color-ink-soft)]" href="#firm">Nền tảng</a>
            <a className="editorial-link text-[11px] font-bold uppercase tracking-[0.13em] text-[var(--color-ink-soft)]" href="#features">Tính năng</a>
            <a className="editorial-link text-[11px] font-bold uppercase tracking-[0.13em] text-[var(--color-ink-soft)]" href="#pricing">Bảng giá</a>
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? 'Chuyển sang giao diện sáng' : 'Chuyển sang giao diện tối'}
              className="grid h-10 w-10 place-items-center rounded-full text-[var(--color-ink)] hover:bg-[var(--color-paper-deep)]"
            >
              {theme === 'dark' ? <Sun aria-hidden="true" size={17} /> : <Moon aria-hidden="true" size={17} />}
            </button>
            <Link to="/login" className="text-xs font-semibold text-[var(--color-ink)] hover:text-[var(--color-gold)]">Đăng nhập</Link>
            <Link
              to="/signup"
              className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[var(--color-ink)] px-5 text-xs font-semibold text-white hover:bg-[var(--color-ink-soft)]"
            >
              Bắt đầu <ArrowUpRight aria-hidden="true" size={15} />
            </Link>
          </div>

          <div className="flex items-center gap-1 md:hidden">
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? 'Chuyển sang giao diện sáng' : 'Chuyển sang giao diện tối'}
              className="grid h-11 w-11 place-items-center rounded-full text-[var(--color-ink)]"
            >
              {theme === 'dark' ? <Sun aria-hidden="true" size={18} /> : <Moon aria-hidden="true" size={18} />}
            </button>
            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              aria-expanded={menuOpen}
              aria-label={menuOpen ? 'Đóng menu' : 'Mở menu'}
              className="grid h-11 w-11 place-items-center rounded-full text-[var(--color-ink)]"
            >
              {menuOpen ? <X aria-hidden="true" size={20} /> : <Menu aria-hidden="true" size={20} />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <nav aria-label="Điều hướng di động" className="animate-fade-in border-t border-[var(--color-line)] bg-[var(--color-paper)] px-5 py-4 md:hidden">
            <div className="mx-auto flex max-w-[1320px] flex-col">
              <a onClick={closeMenu} className="flex min-h-12 items-center border-b border-[var(--color-line)] text-sm text-[var(--color-ink)]" href="#firm">Nền tảng</a>
              <a onClick={closeMenu} className="flex min-h-12 items-center border-b border-[var(--color-line)] text-sm text-[var(--color-ink)]" href="#features">Tính năng</a>
              <a onClick={closeMenu} className="flex min-h-12 items-center border-b border-[var(--color-line)] text-sm text-[var(--color-ink)]" href="#pricing">Bảng giá</a>
              <div className="flex gap-5 pt-4">
                <Link onClick={closeMenu} className="flex min-h-11 items-center text-sm font-semibold text-[var(--color-ink)]" to="/login">Đăng nhập</Link>
                <Link onClick={closeMenu} className="flex min-h-11 items-center text-sm font-semibold text-[var(--color-gold)]" to="/signup">Bắt đầu dùng thử <ArrowRight aria-hidden="true" className="ml-2" size={16} /></Link>
              </div>
            </div>
          </nav>
        )}
      </header>

      <main id="main-content">
        <section className="relative overflow-hidden px-5 pb-16 pt-14 sm:px-8 sm:pb-24 sm:pt-20 lg:px-12 lg:pb-28 lg:pt-24">
          <div className="pointer-events-none absolute -right-40 top-20 h-[34rem] w-[34rem] rounded-full border border-[rgba(189,148,87,0.14)]" />
          <div className="pointer-events-none absolute -right-24 top-36 h-[25rem] w-[25rem] rounded-full border border-[rgba(189,148,87,0.16)]" />
          <div className="mx-auto grid max-w-[1320px] items-center gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
            <div data-reveal className="relative z-10 max-w-[590px]">
              <p className="editorial-eyebrow mb-6 flex items-center gap-3">
                <span className="h-px w-8 bg-[var(--color-gold)]" />
                Chăm sóc khách hàng, có chiến lược
              </p>
              <h1 className="max-w-[620px] text-[clamp(3rem,7.1vw,6.7rem)] leading-[0.96] text-[var(--color-ink)]">
                Mọi cuộc hội thoại, <span className="italic text-[var(--color-gold)]">đúng nơi.</span>
              </h1>
              <p className="mt-7 max-w-[490px] text-[15px] leading-7 text-[#526273] sm:text-base">
                Một không gian để AI và đội ngũ của bạn cùng chăm sóc khách hàng—từ website, Messenger đến Zalo.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => setWidgetOpen(true)}
                  className="group inline-flex min-h-12 items-center justify-center gap-3 rounded-full bg-[var(--color-ink)] px-6 text-sm font-semibold text-white hover:bg-[var(--color-ink-soft)]"
                >
                  Trải nghiệm trợ lý AI
                  <ArrowUpRight aria-hidden="true" size={17} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </button>
                <Link
                  to="/pricing"
                  className="inline-flex min-h-12 items-center justify-center gap-3 rounded-full border border-[var(--color-line)] px-6 text-sm font-semibold text-[var(--color-ink)] hover:border-[var(--color-gold)]"
                >
                  Khám phá nền tảng <ArrowRight aria-hidden="true" size={16} />
                </Link>
              </div>
              <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 text-xs font-medium text-[#526273]">
                <span className="flex items-center gap-2"><Check aria-hidden="true" className="text-[var(--color-gold)]" size={15} /> Bắt đầu trong vài phút</span>
                <span className="flex items-center gap-2"><Check aria-hidden="true" className="text-[var(--color-gold)]" size={15} /> Có nhân viên tiếp quản</span>
              </div>
            </div>

            <div data-reveal className="relative mx-auto w-full max-w-[650px] lg:ml-auto">
              <div className="editorial-hero-art relative">
                <div className="absolute -left-5 top-12 z-20 hidden items-center gap-3 rounded-xl border border-white/70 bg-white/90 px-4 py-3 shadow-[0_18px_55px_rgba(16,47,77,0.15)] backdrop-blur sm:flex">
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-[#eef2eb] text-[var(--color-ink)]">
                    <MessageCircle aria-hidden="true" size={17} />
                  </span>
                  <span>
                    <span className="block text-[10px] text-[#74808a]">Tin nhắn mới từ</span>
                    <span className="mt-0.5 block text-xs font-semibold text-[var(--color-ink)]">Website Live Chat</span>
                  </span>
                  <span className="editorial-orbit ml-2 h-2 w-2 rounded-full bg-[#6d9b78]" />
                </div>

                <div className="overflow-hidden rounded-[1.5rem] border border-[rgba(16,47,77,0.12)] bg-white shadow-[0_30px_90px_rgba(16,47,77,0.17)] sm:rounded-[2rem]">
                  <div className="flex h-14 items-center justify-between border-b border-[#e9ece8] px-4 sm:h-[68px] sm:px-6">
                    <div className="flex items-center gap-2">
                      <span className="flex gap-1.5" aria-hidden="true">
                        <i className="h-2 w-2 rounded-full bg-[#d8a09a]" />
                        <i className="h-2 w-2 rounded-full bg-[#dfbf7f]" />
                        <i className="h-2 w-2 rounded-full bg-[#8bb59a]" />
                      </span>
                      <span className="ml-2 text-[10px] font-medium text-[#6c7780] sm:text-xs">Hộp thư DHT</span>
                    </div>
                    <span className="flex items-center gap-2 text-[10px] font-semibold text-[#577b63] sm:text-xs">
                      <i className="h-2 w-2 rounded-full bg-[#6e9b77]" /> Đang hoạt động
                    </span>
                  </div>

                  <div className="grid min-h-[300px] grid-cols-[0.84fr_1.16fr] sm:min-h-[400px]">
                    <div className="border-r border-[#e9ece8] bg-[#f7f8f5] p-3 sm:p-5">
                      <p className="mb-4 text-[9px] font-bold uppercase tracking-[0.16em] text-[#87919a] sm:text-[10px]">Hội thoại gần đây</p>
                      {[
                        ['W', 'Website', 'Cho mình xin bảng giá…', 'bg-[#e8eee7] text-[#54745b]'],
                        ['M', 'Messenger', 'Cảm ơn bạn nhé!', 'bg-[#e7edfa] text-[#5674a2]'],
                        ['Z', 'Zalo OA', 'Bên mình tư vấn thêm…', 'bg-[#e5f1f3] text-[#4c8791]']
                      ].map(([initial, channel, message, color], index) => (
                        <div
                          className={`mb-2 flex gap-2 rounded-xl p-2.5 sm:mb-3 sm:gap-3 sm:p-3 ${index === 0 ? 'bg-white shadow-[0_4px_16px_rgba(16,47,77,0.07)]' : ''}`}
                          key={channel}
                        >
                          <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-[9px] font-bold ${color} sm:h-8 sm:w-8`}>{initial}</span>
                          <span className="min-w-0 pt-0.5">
                            <span className="block text-[9px] font-semibold text-[var(--color-ink)] sm:text-[10px]">{channel}</span>
                            <span className="mt-1 block truncate text-[8px] text-[#89939a] sm:text-[9px]">{message}</span>
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="flex min-w-0 flex-col p-3 sm:p-5">
                      <div className="flex items-center gap-2 border-b border-[#edf0ed] pb-3 sm:gap-3 sm:pb-4">
                        <span className="grid h-8 w-8 place-items-center rounded-full bg-[#e8eee7] text-[10px] font-semibold text-[#54745b] sm:h-9 sm:w-9">AN</span>
                        <span>
                          <span className="block text-[10px] font-semibold text-[var(--color-ink)] sm:text-xs">An Nguyễn</span>
                          <span className="mt-0.5 block text-[8px] text-[#89939a] sm:text-[9px]">Khách hàng · Website</span>
                        </span>
                      </div>

                      <div className="flex flex-1 flex-col justify-center gap-3 py-4 sm:gap-4">
                        <div className="max-w-[90%] self-start rounded-2xl rounded-tl-sm bg-[#f0f2ef] px-3 py-2.5 text-[9px] leading-[1.6] text-[#405265] sm:px-4 sm:py-3 sm:text-[11px]">
                          Mình muốn tìm hiểu giải pháp chăm sóc khách hàng đa kênh.
                        </div>
                        <div className="max-w-[90%] self-end rounded-2xl rounded-tr-sm bg-[var(--color-ink)] px-3 py-2.5 text-[9px] leading-[1.6] text-white sm:px-4 sm:py-3 sm:text-[11px]">
                          Dạ, DHT giúp đội ngũ quản lý tin nhắn từ website, Messenger và Zalo tại một nơi ạ.
                        </div>
                        <div className="flex items-center gap-2 self-end pr-1 text-[8px] text-[#809082] sm:text-[9px]">
                          <span className="flex gap-1" aria-hidden="true"><i className="h-1 w-1 animate-bounce rounded-full bg-[#92a99a]" /><i className="h-1 w-1 animate-bounce rounded-full bg-[#92a99a] [animation-delay:120ms]" /><i className="h-1 w-1 animate-bounce rounded-full bg-[#92a99a] [animation-delay:240ms]" /></span>
                          Trợ lý AI đang hỗ trợ
                        </div>
                      </div>

                      <div className="flex h-9 items-center justify-between rounded-full border border-[#e5e9e5] px-3 text-[8px] text-[#a0a8a7] sm:h-11 sm:px-4 sm:text-[10px]">
                        Nhập tin nhắn…
                        <span className="grid h-6 w-6 place-items-center rounded-full bg-[var(--color-ink)] text-white sm:h-7 sm:w-7">
                          <ArrowRight aria-hidden="true" size={12} />
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="absolute -bottom-5 right-4 z-10 rounded-xl bg-[var(--color-gold)] px-4 py-3 text-[10px] font-semibold text-white shadow-lg sm:right-8 sm:px-5 sm:py-4 sm:text-xs">
                  AI hỗ trợ · Nhân viên làm chủ
                </div>
              </div>
            </div>
          </div>
          <a href="#firm" aria-label="Cuộn đến phần giới thiệu" className="mx-auto mt-12 hidden h-11 w-11 items-center justify-center rounded-full border border-[var(--color-line)] text-[var(--color-ink)] transition-transform hover:translate-y-1 lg:flex">
            <ArrowDown aria-hidden="true" size={17} />
          </a>
        </section>

        <section id="firm" className="scroll-mt-20 bg-[var(--color-ink)] px-5 py-14 text-white sm:px-8 sm:py-20 lg:px-12 lg:py-24">
          <div className="mx-auto max-w-[1320px]">
            <div className="grid gap-10 lg:grid-cols-[0.92fr_1.08fr] lg:gap-16">
              <div data-reveal>
                <p className="editorial-eyebrow mb-5">Nền tảng DHT</p>
                <h2 className="max-w-[600px] text-[clamp(2.1rem,4.2vw,4rem)] leading-[1.02]">
                  Công nghệ tốt tạo chỗ cho những cuộc trò chuyện tốt hơn.
                </h2>
              </div>
              <div data-reveal className="grid grid-cols-2 self-center">
                {[
                  ['01', 'Hộp thư tập trung'],
                  ['03', 'Kênh kết nối'],
                  ['AI', 'Trợ lý luôn sẵn sàng'],
                  ['1:1', 'Bàn giao cho nhân viên']
                ].map(([value, label], index) => (
                  <div
                    className={`py-4 sm:py-6 ${index % 2 === 0 ? 'border-r border-white/15 pr-4 sm:pr-8' : 'pl-4 sm:pl-8'} ${index > 1 ? 'border-t border-white/15' : ''}`}
                    key={label}
                  >
                    <p className="font-editorial text-3xl text-[var(--color-gold-light)] sm:text-5xl">{value}</p>
                    <p className="mt-2 text-[10px] text-[#d4dce3] sm:text-xs">{label}</p>
                  </div>
                ))}
              </div>
            </div>
            <div data-reveal className="mt-9 grid gap-5 border-t border-white/15 pt-7 text-xs leading-6 text-[#cbd4dc] sm:grid-cols-2 sm:gap-10 sm:text-sm sm:leading-7">
              <p>
                Đội ngũ của bạn có thể theo dõi bối cảnh cuộc hội thoại, trả lời từ một hộp thư chung và đưa AI vào đúng những bước cần tự động hóa.
              </p>
              <p>
                Khi cuộc trò chuyện cần sự tinh tế của con người, nhân viên tiếp quản ngay trên cùng luồng làm việc—không để khách phải bắt đầu lại.
              </p>
            </div>
          </div>
        </section>

        <section id="features" className="scroll-mt-20 px-5 py-16 sm:px-8 sm:py-24 lg:px-12 lg:py-28">
          <div className="mx-auto max-w-[1320px]">
            <div data-reveal className="mb-10 flex flex-col justify-between gap-5 sm:mb-14 md:flex-row md:items-end">
              <div>
                <p className="editorial-eyebrow mb-4">Thiết kế quanh trải nghiệm</p>
                <h2 className="max-w-2xl text-[clamp(2.3rem,4.7vw,4.4rem)] leading-[1.02] text-[var(--color-ink)]">
                  Ít rời rạc hơn. <span className="italic text-[var(--color-gold)]">Nhiều kết nối hơn.</span>
                </h2>
              </div>
              <p className="max-w-sm text-sm leading-6 text-[#5c6a75]">
                Từng công cụ được đặt cạnh nhau để đội ngũ không phải ghép nối trải nghiệm của khách từ nhiều nơi.
              </p>
            </div>

            <div className="reveal-group grid gap-px overflow-hidden rounded-2xl border border-[var(--color-line)] bg-[var(--color-line)] sm:grid-cols-2 lg:grid-cols-4">
              {featureCards.map(({ index, title, description, icon: Icon }) => (
                <article data-reveal className="editorial-card min-h-[235px] bg-[var(--color-paper)] p-6 sm:min-h-[270px] sm:p-7" key={index}>
                  <div className="flex items-center justify-between">
                    <span className="font-editorial text-sm text-[var(--color-gold)]">{index}</span>
                    <Icon aria-hidden="true" className="text-[var(--color-ink)]" size={20} strokeWidth={1.5} />
                  </div>
                  <h3 className="mt-9 text-[1.55rem] leading-tight text-[var(--color-ink)]">{title}</h3>
                  <p className="mt-3 text-xs leading-6 text-[#5c6a75]">{description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[#eeefe9] px-5 py-16 sm:px-8 sm:py-24 lg:px-12">
          <div className="mx-auto grid max-w-[1320px] items-center gap-10 lg:grid-cols-[1fr_0.78fr] lg:gap-20">
            <div data-reveal>
              <p className="editorial-eyebrow mb-4">Một nhịp làm việc liền mạch</p>
              <h2 className="max-w-[650px] text-[clamp(2.4rem,5vw,4.8rem)] leading-[0.99] text-[var(--color-ink)]">
                AI bắt đầu cuộc trò chuyện. <span className="italic text-[var(--color-gold)]">Đội ngũ bạn tiếp nối.</span>
              </h2>
              <p className="mt-6 max-w-xl text-sm leading-7 text-[#526273]">
                Từ lời chào đầu tiên đến lúc cần một chuyên viên thực sự, khách hàng luôn nhận được sự hỗ trợ trong cùng một cuộc hội thoại.
              </p>
              <Link to="/login" className="editorial-link mt-7 inline-flex min-h-11 items-center gap-3 text-sm font-semibold text-[var(--color-ink)]">
                Xem không gian làm việc <ArrowRight aria-hidden="true" size={16} />
              </Link>
            </div>

            <div data-reveal className="relative mx-auto w-full max-w-[470px]">
              <div className="absolute -inset-4 rounded-[2rem] border border-[rgba(16,47,77,0.12)] sm:-inset-6" />
              <div className="relative rounded-[1.5rem] bg-[var(--color-ink)] p-6 text-white shadow-[0_24px_60px_rgba(16,47,77,0.16)] sm:rounded-[2rem] sm:p-9">
                <div className="flex items-center justify-between border-b border-white/15 pb-5">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--color-gold-light)]">Luồng hỗ trợ</p>
                    <p className="mt-2 font-editorial text-xl">Từ AI đến chuyên viên</p>
                  </div>
                  <span className="editorial-orbit grid h-11 w-11 place-items-center rounded-full border border-white/20 text-[var(--color-gold-light)]">
                    <Sparkles aria-hidden="true" size={18} />
                  </span>
                </div>
                <ol className="mt-6 space-y-5">
                  {[
                    ['AI lắng nghe', 'Trả lời câu hỏi thường gặp dựa trên kiến thức đã cấu hình.'],
                    ['Nhận biết nhu cầu', 'Giữ mạch trao đổi và chuyển tới đúng người khi cần.'],
                    ['Nhân viên tiếp quản', 'Tiếp tục cuộc hội thoại với đủ bối cảnh trước đó.']
                  ].map(([title, description], index) => (
                    <li key={title} className="flex gap-4">
                      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-white/20 font-editorial text-sm text-[var(--color-gold-light)]">{index + 1}</span>
                      <span>
                        <span className="block text-sm font-semibold">{title}</span>
                        <span className="mt-1.5 block text-xs leading-5 text-[#cbd4dc]">{description}</span>
                      </span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        </section>

        <section id="pricing" className="scroll-mt-20 px-5 py-16 sm:px-8 sm:py-24 lg:px-12 lg:py-28">
          <div className="mx-auto max-w-[1320px]">
            <div data-reveal className="mb-10 flex flex-col justify-between gap-5 sm:mb-14 md:flex-row md:items-end">
              <div>
                <p className="editorial-eyebrow mb-4">Chọn quy mô phù hợp</p>
                <h2 className="text-[clamp(2.5rem,5vw,4.6rem)] leading-none text-[var(--color-ink)]">Bắt đầu từ điều cần thiết.</h2>
              </div>
              <Link to="/pricing" className="editorial-link inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-[var(--color-ink)]">
                Xem chi tiết các gói <ArrowUpRight aria-hidden="true" size={16} />
              </Link>
            </div>

            <div className="reveal-group grid gap-4 lg:grid-cols-3">
              {plans.map((plan) => (
                <article data-reveal key={plan.name} className={`editorial-card flex flex-col rounded-2xl border p-6 sm:p-8 ${plan.featured ? 'border-[var(--color-ink)] bg-[var(--color-ink)] text-white' : 'border-[var(--color-line)] bg-white text-[var(--color-ink)]'}`}>
                  <div className="flex items-center justify-between">
                    <p className={`editorial-eyebrow ${plan.featured ? '!text-[var(--color-gold-light)]' : ''}`}>{plan.name}</p>
                    {plan.featured && <span className="rounded-full border border-white/20 px-3 py-1 text-[9px] font-semibold uppercase tracking-wider text-[var(--color-gold-light)]">Đa kênh</span>}
                  </div>
                  <p className="mt-5 font-editorial text-3xl sm:text-4xl">{plan.price}{plan.price !== 'Liên hệ' && <span className={`ml-2 font-sans text-xs ${plan.featured ? 'text-white/65' : 'text-[#7b858c]'}`}>₫ / tháng</span>}</p>
                  <p className={`mt-3 min-h-[48px] text-xs leading-6 ${plan.featured ? 'text-white/75' : 'text-[#63707a]'}`}>{plan.detail}</p>
                  <ul className={`mt-6 flex-1 space-y-3 border-t pt-5 text-xs ${plan.featured ? 'border-white/15 text-white/85' : 'border-[var(--color-line)] text-[#526273]'}`}>
                    {plan.features.map((feature) => (
                      <li className="flex items-start gap-2.5" key={feature}>
                        <Check aria-hidden="true" className="mt-0.5 shrink-0 text-[var(--color-gold)]" size={14} />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Link
                    to="/pricing"
                    className={`mt-7 inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-5 text-xs font-semibold ${plan.featured ? 'bg-[var(--color-gold)] text-white hover:bg-[#a98042]' : 'border border-[var(--color-line)] hover:border-[var(--color-gold)]'}`}
                  >
                    {plan.name === 'Enterprise' ? 'Trao đổi cùng đội ngũ' : 'Tìm hiểu gói này'}
                    <ChevronRight aria-hidden="true" size={15} />
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="px-5 pb-16 sm:px-8 sm:pb-24 lg:px-12">
          <div data-reveal className="mx-auto flex max-w-[1320px] flex-col justify-between gap-7 rounded-[1.5rem] bg-[#e9e8df] p-7 sm:rounded-[2rem] sm:p-12 lg:flex-row lg:items-center lg:p-16">
            <div>
              <p className="editorial-eyebrow mb-4">Bước tiếp theo</p>
              <h2 className="max-w-2xl font-editorial text-[clamp(2.2rem,4.5vw,4rem)] leading-[1.02] text-[var(--color-ink)]">Dành thời gian cho khách hàng. Để DHT lo phần còn lại.</h2>
            </div>
            <Link to="/signup" className="inline-flex min-h-12 shrink-0 items-center justify-center gap-3 rounded-full bg-[var(--color-ink)] px-6 text-sm font-semibold text-white hover:bg-[var(--color-ink-soft)]">
              Bắt đầu dùng thử <ArrowUpRight aria-hidden="true" size={17} />
            </Link>
          </div>
        </section>
      </main>

      <footer className="bg-[var(--color-ink)] px-5 py-10 text-white sm:px-8 lg:px-12">
        <div className="mx-auto flex max-w-[1320px] flex-col gap-7 border-b border-white/15 pb-8 sm:flex-row sm:items-center sm:justify-between">
          <Link to="/" className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-full border border-white/40">
              <Sparkles aria-hidden="true" size={16} />
            </span>
            <span className="font-editorial text-lg">DHT ChatAI</span>
          </Link>
          <nav aria-label="Liên kết cuối trang" className="flex flex-wrap gap-x-6 gap-y-3 text-xs text-white/75">
            <Link className="hover:text-white" to="/pricing">Bảng giá</Link>
            <Link className="hover:text-white" to="/login">Đăng nhập</Link>
            <Link className="hover:text-white" to="/signup">Tạo tài khoản</Link>
          </nav>
        </div>
        <p className="mx-auto max-w-[1320px] pt-5 text-[10px] text-white/55">© 2026 DHT AI Solution Corp. Xây dựng những cuộc trò chuyện có ý nghĩa.</p>
      </footer>

      <LiveChatWidget />
    </div>
  );
};
