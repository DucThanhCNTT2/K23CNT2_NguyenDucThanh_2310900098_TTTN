# Vận hành bảo mật

## Cấu hình trước khi chạy production

- Đặt `NODE_ENV=production`.
- Đặt `PUBLIC_URL` là URL HTTPS chính thức của ứng dụng, ví dụ `https://chat.example.com`.
- Đặt `CORS_ALLOWED_ORIGINS` thành danh sách origin HTTPS chính xác của frontend và các trang nhúng widget; không dùng `*`, không thêm path.
- Tạo `JWT_ACCESS_SECRET` và `JWT_REFRESH_SECRET` riêng biệt, ngẫu nhiên, mỗi giá trị tối thiểu 32 ký tự. Chỉ lưu trong secret manager của môi trường chạy, không dùng tiền tố `VITE_`.
- Reverse proxy/TLS termination phải chuyển tiếp `X-Forwarded-Proto` chính xác. Ứng dụng tin cậy một proxy hop và từ chối HTTP trong production.
- Bản build frontend chỉ được chứa cấu hình công khai. Không đưa khóa Gemini, Facebook, SMTP, JWT hoặc database vào biến `VITE_*`.
- Không dùng tài khoản/mật khẩu seed development trên production. Ứng dụng từ chối khởi động production nếu phát hiện mật khẩu seed mẫu còn hiệu lực.

## Đăng nhập Google, Facebook và GitHub

Đăng nhập xã hội dùng OAuth Authorization Code, xác thực email đã xác minh từ nhà cung cấp, dùng `state` chống CSRF và ticket một lần qua cookie HttpOnly để hoàn tất phiên trong SPA. Tài khoản mới từ các nhà cung cấp này luôn được tạo với vai trò `user`; không cấp quyền nhân viên/quản trị qua OAuth.

- Tạo OAuth app riêng cho từng provider; không dùng chung client secret.
- Đặt `OAUTH_GOOGLE_CLIENT_ID`/`OAUTH_GOOGLE_CLIENT_SECRET`, `OAUTH_FACEBOOK_CLIENT_ID`/`OAUTH_FACEBOOK_CLIENT_SECRET` và `OAUTH_GITHUB_CLIENT_ID`/`OAUTH_GITHUB_CLIENT_SECRET` trong secret manager. Để trống cả cặp nếu chưa bật provider.
- Đặt `CLIENT_URL` thành origin frontend và `OAUTH_CALLBACK_BASE_URL` thành origin HTTPS của API khi chạy production.
- Đăng ký callback URI chính xác ở từng nhà cung cấp: `${OAUTH_CALLBACK_BASE_URL}/api/auth/oauth/google/callback`, `${OAUTH_CALLBACK_BASE_URL}/api/auth/oauth/facebook/callback`, `${OAUTH_CALLBACK_BASE_URL}/api/auth/oauth/github/callback`.
- Trong phát triển local, frontend Vite mặc định ở `http://localhost:5173`, API ở `http://localhost:5000`; dùng callback tương ứng ở API local.
- Không đưa client secret vào `VITE_*`, frontend, Git hoặc chat. Giao diện chỉ bật provider khi server có đủ cả client ID và secret.

## Nếu `.env` từng chứa secret thật

File `.env` bị Git ignore, nhưng điều đó không thu hồi secret đã bị dùng hoặc chia sẻ. Hãy thu hồi và tạo lại các khóa API, mật khẩu ứng dụng email, JWT/database credentials còn hiệu lực; cập nhật secret manager; đăng xuất/thu hồi các phiên hiện tại. Nếu file từng được commit hoặc đưa lên nơi chia sẻ, xử lý cả lịch sử Git và coi mọi secret trong đó là đã lộ. Không gửi các giá trị secret qua chat hoặc log.

## Cloudflare / WAF

Cấu hình tại tài khoản DNS/Cloudflare của đơn vị triển khai (không nằm trong repository):

1. Bật proxy Cloudflare cho bản ghi DNS công khai và dùng SSL/TLS **Full (strict)** với chứng chỉ hợp lệ ở origin.
2. Bật chuyển hướng HTTPS ở edge; chỉ bật HSTS sau khi mọi hostname liên quan đều phục vụ HTTPS ổn định.
3. Bật Managed WAF rules và đặt rate limit cho đăng nhập, khôi phục mật khẩu và endpoint widget.
4. Tắt cache cho `/api/*` và `/socket.io/*`; giới hạn truy cập origin để chỉ Cloudflare/reverse proxy được kết nối.
5. Kiểm tra lại luồng webhook và WebSocket sau khi bật các rule.

## Backup và theo dõi lỗi

- Bật backup tự động/PITR tại dịch vụ MongoDB, mã hóa backup, giới hạn quyền truy cập và định nghĩa retention theo yêu cầu vận hành.
- Thử khôi phục backup vào môi trường riêng định kỳ; xác nhận dữ liệu và ứng dụng hoạt động trước khi xem backup là dùng được.
- Cấu hình nền tảng triển khai thu thập log ứng dụng và cảnh báo uptime/HTTP 5xx. Không thu thập request body, mật khẩu, bearer token, cookie hoặc secret; giới hạn người có quyền đọc log.
- Repository hiện không cấu hình tài khoản Cloudflare, lịch backup hay dịch vụ giám sát; các bước này cần được bật trong tài khoản hosting/database tương ứng.

## Upload

Hiện không tìm thấy endpoint upload file trong ứng dụng. Nếu bổ sung, phải validate ở server theo allowlist định dạng và nội dung file, giới hạn dung lượng không quá 100 MB, tạo tên lưu trữ riêng, không thực thi file tải lên và lưu ngoài thư mục web public.
