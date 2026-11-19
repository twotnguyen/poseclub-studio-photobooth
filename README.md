# poseclub studio — Minimalist Online Photobooth & Physical Studio

> **Unfiltered elegance in timeless black & white.**  
> Trải nghiệm buồng chụp photobooth cổ điển trực tuyến miễn phí và showroom studio thực tế tại Fullerton, California.


[![React](https://img.shields.io/badge/React-18.3-black?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-black?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.0-black?logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-black?logo=tailwindcss)](https://tailwindcss.com/)

---

## 🌟 Tổng quan dự án (Overview)

**poseclub studio** là nền tảng web ứng dụng hai mục đích:
1. **Buồng chụp ảnh Photobooth trực tuyến (Free Online Photobooth)**: Cho phép người dùng chụp ảnh webcam hoặc ghép ảnh cá nhân vào các dải photobooth chuẩn phong cách Hàn Quốc & Vintage, tùy biến bộ lọc đen trắng, thêm theme đồ họa và xuất file in ấn độ phân giải cao, sẵn sàng in hoàn toàn miễn phí.
2. **Giới thiệu Studio thực tế (Fullerton Studio Showroom)**: Cung cấp địa chỉ, bản đồ chỉ đường Google Maps, bảng giờ mở cửa và kết nối Instagram để khách hàng ghé thăm phòng chụp trực tiếp tại Fullerton, California, Hoa Kỳ.

---

## ✨ Điểm nổi bật & Tính năng (Key Features)

### 🖥️ 1. Giao diện Đơn màn hình không cuộn (Zero-Scroll Architecture)
* Desktop (`md` trở lên) cố định vừa khít màn hình (`h-[100dvh] overflow-hidden`), không phát sinh thanh cuộn dọc; trên mobile nội dung dài hơn được cuộn bên trong vùng `main`.
* Bố cục tối giản sang trọng theo phong cách thời trang cao cấp (Monochrome Editorial), kết hợp nền kem ấm (`#FAF8F5`), viền đen tuyền (`#0C0C0C`) và font chữ thư pháp cổ điển `Poseclub`.

### 🧭 2. Hệ thống Định tuyến Tab riêng biệt (Distinct URL Routing)
Mỗi chức năng hoạt động trên một đường dẫn URL độc lập, hỗ trợ chia sẻ link trực tiếp và nút Back/Forward của trình duyệt:
* `/` hoặc `/home`: **✦ HOME / TRANG CHỦ** — Màn hình chào đón theo thiết kế Canva Flow Frame (chữ ký `Poseclub`, camera doodle, nút `✦ START`).
* `/photobooth`: **✦ PHOTOBOOTH / BUỒNG CHỤP** — Quy trình chụp ảnh 4 bước toàn diện.
* `/studio`: **✦ FULLERTON STUDIO** — Thông tin địa chỉ showroom 1327 S Harbor Blvd, bản đồ Google Maps, giờ mở cửa.
* `/how-to-use`: **✦ HOW TO USE / HƯỚNG DẪN** — 3 bước hướng dẫn trải nghiệm.

### 🌐 3. Hỗ trợ Song ngữ tức thời (Instant Bilingual VI / EN)
* Nút chuyển đổi nhanh `[ VI | EN ]` tại thanh điều hướng trên cùng.
* Dịch đầy đủ nội dung tab, điều khiển và thông báo ở VI/EN; catalog khung PNG dùng tiếng Việt.
* Ghi nhớ ngôn ngữ ưu tiên của người dùng qua `localStorage`.

### Studio gallery & frame catalog
* Trang chủ có 6 ảnh studio: thumbnail đen trắng, bấm để xem ảnh màu; dùng phím trái/phải để chuyển ảnh và `Esc` để đóng.
* Catalog tải 23 khung PNG và ZIP: `/exported-frames/index.html` (23 khung Style 1 custom). App dùng tổng cộng 72 khung PNG qua 6 style.
* Catalog/ZIP đang phát hành là snapshot 23 khung Style 1 custom. `scripts/export_all_frames.py` chỉ tạo khung mẫu vào `scratch/export_all_frames/` để tham khảo, **không** ghi đè catalog đang dùng.

### 📸 4. Quy trình Buồng chụp Photobooth 4 bước chuyên sâu
* **Bước 1 — Chọn kiểu bố cục (Select Frame Layout)**: 
* 6 kiểu khung PNG (72 thiết kế): Style 1 — Polaroid 1 ảnh; Style 2 — dải 1×2; Style 3 — lưới 2×2; Style 4 — lưới 2×4 (8 ảnh); Style 5 — khung ngang 3×2 (6 ảnh); Style 6 — lưới 3×3 (9 ảnh).
* Mỗi thiết kế là overlay PNG trong suốt: ảnh của khách được vẽ vào các ô đã đo, sau đó khung được vẽ lên trên để giữ sticker/tim/logo.
* **Bước 2 — Chọn thiết kế theme & bộ lọc (Design & Filter)**:
  * Khung ảnh đặt ngay **chính giữa màn hình**, tự động thay đổi theo Style đã chọn ở Bước 1.
  * Chọn khung bằng mũi tên **`<` / `>`** và dải chip: 23 khung Style 1 + 49 khung cho Style 2–6 (`/exported-frames/style-*/`).
  * 3 Bộ lọc màu sắc: *B&W Contrast* (đen trắng điện ảnh tương phản cao), *B&W Film Grain* (hạt film hoài niệm), *Clean Natural* (màu trong sáng tự nhiên).
  * Ô nhập chữ in tùy biến (Custom Strip Text): chữ căn giữa trong khoảng trống bên dưới các ô ảnh, hiển thị ngay trên preview và được khắc vào ảnh export; màu chữ tự đổi theo nền khung.
* **Bước 3 — Chụp ảnh trực tiếp (Live Camera & Real-time Progress)**:
  * **Khung dải ảnh bên trái**: Mỗi khi chụp xong một shot, ảnh vừa chụp xuất hiện ngay lập tức vào ô tương ứng trên khung để người chụp xem lại theo thời gian thực.
  * Hỗ trợ bấm chụp lại riêng từng tấm (Single-Shot Retake) trực tiếp trên dải ảnh bên trái.
  * Khung camera live stream với chế độ lật gương (Mirror Mode), đếm ngược 3s/5s, chớp flash trắng và tiếng màn trập cơ học Web Audio API.
  * Hỗ trợ tải ảnh có sẵn từ máy tính / điện thoại (Upload fallback) — phải chọn đúng số ảnh của khung, thứ tự ảnh được giữ nguyên.
* **Bước 4 — Xác nhận, In & Xuất ảnh độ phân giải cao (Confirm & Export)**:
  * Tùy chọn số lượng bản in `- 1 +`.
  * **✦ Tải dải ảnh High-Res (PNG) ✦**: Render bằng Canvas — xuất theo kích thước gốc của khung PNG đang chọn (ví dụ 1240×1844 px); khi không dùng khung PNG thì dùng bố cục dự phòng 1200×3600 / 1800×2400 px. File PNG không nhét metadata DPI; hãy chọn khổ giấy trong hộp thoại in.
  * **✦ Tải từng ảnh đơn lẻ ✦**: Tải mỗi tấm ảnh thành một card polaroid riêng biệt.
  * **✦ PRINT NGAY ✦**: Mở hộp thoại in riêng với `@page { margin: 0 }`; khổ giấy do người dùng chọn trong trình duyệt.

### 🔒 5. Bảo mật & Chi phí vận hành 0đ (100% Client-Side)
* Toàn bộ thao tác xử lý camera, lọc màu, ghép khung và xuất ảnh chạy 100% trên trình duyệt người dùng qua HTML5 Canvas API.
* Không lưu trữ ảnh người dùng lên máy chủ, đảm bảo quyền riêng tư tuyệt đối.
* Không cần backend, chi phí server $0 khi triển khai lên Vercel (đã có `vercel.json` rewrite cho SPA). Với host tĩnh khác cần tự cấu hình fallback về `index.html`.

---

## 🏛️ Thông tin Thương hiệu & Studio thực tế

* **Tên thương hiệu**: **poseclub studio**
* **Địa chỉ**: `1327 S Harbor Blvd, Fullerton, CA 92832, United States`
* **Google Maps**: [Mở chỉ đường trên Google Maps](https://maps.app.goo.gl/3gNnkCrQ4tVJrsrT7)
* **Instagram**: [@poseclub.photobooth](https://www.instagram.com/poseclub.photobooth)
* **Giờ mở cửa**:
  * Thứ 2 – Thứ 5: 11:00 AM – 10:00 PM
  * Thứ 6 – Thứ 7: 11:00 AM – 11:00 PM
  * Chủ nhật: 11:00 AM – 11:00 PM

---

## 🛠️ Công nghệ sử dụng (Tech Stack)

* **Core**: React 18, TypeScript, Vite
* **Styling**: Tailwind CSS
* **Routing**: React Router DOM (v7)
* **Icons**: Lucide React + Custom SVGs
* **Graphics & Export**: HTML5 Canvas API thuần, Web Audio API
* **Fonts**: Playfair Display, Cormorant Garamond, Alex Brush, Pinyon Script, Inter

---

## 🚀 Hướng dẫn Cài đặt & Chạy cục bộ (Local Development)

### Yêu cầu môi trường
* Node.js >= 22.18 (cần thiết để `node --test` chạy file `.ts`) hoặc Bun >= 1.2

### Các bước cài đặt
```bash
# 1. Clone repository
git clone https://github.com/twotnguyen/poseclub-studio-photobooth.git
cd poseclub-studio-photobooth

# 2. Cài đặt dependencies (sử dụng bun hoặc npm)
bun install
# hoặc: npm install

# 3. Chạy môi trường phát triển (Dev server)
bun run dev
# hoặc: npm run dev

# 4. Mở trình duyệt tại:
# http://localhost:5173/
```

### Build cho môi trường Production
```bash
bun run build
# hoặc: npm run build
```
Thư mục `dist/` sẵn sàng triển khai lên Vercel. Với Netlify/Cloudflare Pages/GitHub Pages phải thêm SPA rewrite/fallback tương ứng.

---

## 📄 Bản quyền (License)

Dự án phát triển cho thương hiệu **poseclub studio**. Mọi quyền được bảo lưu.
