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
* Mọi breakpoint đều cố định vừa khít màn hình (`h-[100dvh]` + `main overflow-hidden`); bố cục mobile thu gọn card, ảnh và controls để không phát sinh thanh cuộn dọc.
* Bố cục tối giản sang trọng theo phong cách thời trang cao cấp (Monochrome Editorial), kết hợp nền kem ấm (`#FAF8F5`), viền đen tuyền (`#0C0C0C`) và font chữ thư pháp cổ điển `Poseclub`.

### 🧭 2. Hệ thống Định tuyến Tab riêng biệt (Distinct URL Routing)
Mỗi chức năng hoạt động trên một đường dẫn URL độc lập, hỗ trợ chia sẻ link trực tiếp và nút Back/Forward của trình duyệt:
* `/` hoặc `/home`: **✦ HOME / TRANG CHỦ** — Màn hình chào đón theo thiết kế Canva Flow Frame (chữ ký `Poseclub`, camera doodle, nút `✦ START`).
* `/photobooth`: **✦ PHOTOBOOTH / BUỒNG CHỤP** — redirect tới `/photobooth/frame`; 4 bước là 4 route riêng: `/frame` (chọn bố cục), `/theme` (khung + filter + chữ), `/capture` (camera/upload), `/confirm` (xác nhận + in/tải). `/booth` và `/booth/*` redirect về bước đầu. Trạng thái (khung, ảnh đã chụp, chữ tùy biến) được giữ qua `BoothProvider` khi đổi route.
* `/studio`: **✦ FULLERTON STUDIO** — Thông tin địa chỉ showroom 1327 S Harbor Blvd, bản đồ Google Maps, giờ mở cửa.
* `/how-to-use` (alias `/guide`): **✦ HOW TO USE / HƯỚNG DẪN** — 3 bước hướng dẫn trải nghiệm. `/guide` là alias trỏ tới cùng nội dung; navigation vẫn highlight `/how-to-use`.

### 🌐 3. Hỗ trợ Song ngữ tức thời (Instant Bilingual VI / EN)
* Nút chuyển đổi nhanh `[ VI | EN ]` tại thanh điều hướng trên cùng.
* Dịch đầy đủ nội dung tab, điều khiển và thông báo ở VI/EN; catalog khung PNG dùng tiếng Việt.
* Ghi nhớ ngôn ngữ ưu tiên của người dùng qua `localStorage`.

### Studio gallery & frame catalog
* Trang chủ có 6 ảnh studio hiển thị đầy đủ màu; bấm vào ảnh để phóng to, dùng phím trái/phải để chuyển ảnh và `Esc` để đóng.
* Catalog tải 23 khung PNG và ZIP: `/exported-frames/index.html` (23 khung Style 1 custom). App dùng tổng cộng 72 khung PNG qua 6 style.
* Catalog/ZIP đang phát hành là snapshot 23 khung Style 1 custom. `scripts/export_all_frames.py` chỉ tạo mẫu legacy 60 khung (6 style × 10 theme) vào `scratch/export_all_frames/` để tham khảo; script **không bao giờ ghi đè** các khung đã phát hành trong `public/exported-frames/`.
* Các thư mục `all/`, `all-alpha/`, `6-frame/`, `6-frame-alpha/`, `frame/` là archive giữ locally và nằm trong `.gitignore`; clone mới chỉ cần `public/exported-frames/` (chứa toàn bộ khung app dùng).

### 📸 4. Quy trình Buồng chụp Photobooth 4 bước chuyên sâu
* **Bước 1 — Chọn kiểu bố cục (Select Frame Layout)**: 
* 6 kiểu khung PNG (72 thiết kế): Style 1 — Polaroid 1 ảnh; Style 2 — dải 1×2; Style 3 — lưới 2×2; Style 4 — lưới 2×4 (8 ảnh); Style 5 — khung ngang 3×2 (6 ảnh); Style 6 — lưới 3×3 (9 ảnh).
* Mỗi thiết kế là overlay PNG trong suốt: ảnh của khách được vẽ vào các ô đã đo, sau đó khung được vẽ lên trên để giữ sticker/tim/logo.
* **Bước 2 — Chọn thiết kế khung (Design)**:
  * Khung ảnh đặt ngay **chính giữa màn hình**, tự động thay đổi theo Style đã chọn ở Bước 1.
  * Đổi khung bằng 2 nút **`<` / `>`** trên preview (23 khung Style 1 + 49 khung cho Style 2–6); danh sách chip `FRAME DESIGNS` đã được bỏ để gọn giao diện.
  * Ô nhập chữ in tùy biến (Custom Strip Text): chữ căn giữa trong khoảng trống bên dưới các ô ảnh, hiển thị ngay trên preview và được khắc vào ảnh export; màu chữ tự đổi theo nền khung.
* **Bước 3 — Chụp ảnh trực tiếp (Live Camera & Real-time Progress)**:
  * **Khung dải ảnh bên trái**: Mỗi khi chụp xong một shot, ảnh vừa chụp xuất hiện ngay lập tức vào ô tương ứng trên khung để người chụp xem lại theo thời gian thực.
  * Hỗ trợ bấm chụp lại riêng từng tấm (Single-Shot Retake) trực tiếp trên dải ảnh bên trái.
  * Chọn bộ lọc ngay trên màn hình chụp: *B&W Contrast* (đen trắng điện ảnh tương phản cao), *B&W Film Grain* (hạt film hoài niệm), *Clean Natural* (màu trong sáng tự nhiên). Filter áp dụng cho video, preview và ảnh export.
  * Hỗ trợ tải ảnh có sẵn từ máy tính / điện thoại (Upload fallback) — phải chọn đúng số ảnh của khung, thứ tự ảnh được giữ nguyên.
* **Bước 4 — Xác nhận, In & Xuất ảnh độ phân giải cao (Confirm & Export)**:
  * Tùy chọn số lượng bản in `- 1 +`.
  * **✦ Tải dải ảnh High-Res (PNG) ✦**: Render bằng Canvas — tất cả 72 khung đã đăng ký đều có overlay PNG và ảnh xuất dùng đúng kích thước pixel gốc của PNG đó (ví dụ 1240×1844 px). Mọi PNG đều mang metadata 300 DPI (chunk `pHYs`); khổ giấy vẫn do người dùng chọn trong hộp thoại in.
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
* **Bắt buộc**: Node.js >= 22.18 cho **mọi npm script** (dev, build, test — kể cả `node --test` chạy file `.ts`). Bun >= 1.4 chỉ là tiện ích chạy nhanh, **không** thay thế được Node khi dùng npm script; bản 1.2 không đọc được `bun.lock` lockfileVersion 2.

### Các bước cài đặt
```bash
# 1. Clone repository
git clone https://github.com/twotnguyen/poseclub-studio-photobooth.git
cd poseclub-studio-photobooth

# 2. Cài đặt dependencies (npm là chuẩn; bun chỉ để tiện)
npm install
# hoặc (tiện ích): bun install

# 3. Chạy môi trường phát triển (Dev server)
npm run dev
# hoặc (tiện ích): bun run dev

# 4. Mở trình duyệt tại:
# http://localhost:5173/
```

### Build cho môi trường Production
```bash
npm run build
# hoặc (tiện ích): bun run build
```
Thư mục `dist/` sẵn sàng triển khai lên Vercel. Với Netlify/Cloudflare Pages/GitHub Pages phải thêm SPA rewrite/fallback tương ứng.

---

## 📄 Bản quyền (License)

Dự án phát triển cho thương hiệu **poseclub studio**. Mọi quyền được bảo lưu.
