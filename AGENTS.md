# AGENTS.md — Developer & Agent Guidelines

This document defines core architectural principles, behavioral rules, design guidelines, and code conventions for developers and AI agents working on **poseclub studio**.

---

## 🏛️ 1. Project Context & Brand Identity

* **Brand Name**: `poseclub studio`
* **Brand Vibe**: Timeless Monochrome, Minimalist Editorial, Luxury Fashion Photobooth.
* **Physical Location**: 1327 S Harbor Blvd, Fullerton, CA 92832, United States.
* **Official Instagram**: `@poseclub.photobooth` (https://www.instagram.com/poseclub.photobooth).
* **Reference Sources**:
  * Canva Design concept ("Flow Frame"): Cream background (`#FAF8F5`), calligraphy signature `Poseclub`, double-line pill buttons (`✦ START`, `✦ CONFIRM`), overlapping frame mockups, circular navigation buttons (`BACK ←`, `VOUCHER 🎫`).
  * `mysketchbooth.com`: 10 distinct frame themes (Stars, Hearts, Cutout, Valentine, Birthday, Brand, etc.), custom strip text, individual photo card exports, camera/upload duality, direct print formatting.

---

## 📐 2. Core Architectural Invariants

### 🚫 Non-Negotiable Rule 1: Zero-Scroll Single-Screen Layout (`h-[100dvh]`)
* Every tab and view MUST fit comfortably inside the screen height (`h-[100dvh] overflow-hidden`).
* **NEVER** introduce vertical scrollbars to the outer body or main tab containers.
* Use proportional sizing, compact paddings, and flex/grid distribution to ensure all interactive elements remain visible without scrolling on standard screens (720px - 1080px height).

### 🔒 Non-Negotiable Rule 2: 100% Client-Side Processing & Privacy
* All camera streams, image cropping, filter application, and canvas exports run strictly on the user's browser.
* **NEVER** upload user photos or faces to an external server or database.
* The application requires **zero backend infrastructure** and incurs **$0 hosting cost**.

### 🌐 Non-Negotiable Rule 3: Strict Bilingual Parity (`vi` & `en`)
* Any new UI string, label, button, or notification MUST be added to both `vi` and `en` in `src/i18n/translations.ts`.
* The application must support instant 1-click language toggling via the `[ VI | EN ]` switcher on the navigation bar.

---

## 📁 3. Project Directory Map

```
src/
├── App.tsx                     # Main layout & React Router v7 routes
├── main.tsx                    # ReactDOM root wrapped with BrowserRouter
├── index.css                   # Tailwind base, typography & keyframes
├── config/
│   └── studio.ts               # Single source of truth for physical studio information
├── i18n/
│   └── translations.ts         # Type-safe bilingual dictionary (VI / EN)
├── components/
│   ├── Navigation.tsx          # Top tab navigation bar, language switcher & audio toggle
│   ├── icons/
│   │   └── InstagramIcon.tsx   # Pixel-perfect minimal Instagram SVG icon
│   ├── Photobooth/
│   │   ├── types.ts            # Core types (FilterType, LayoutType, FrameTheme, etc.)
│   │   ├── FrameThemes.ts      # 10 Frame themes configuration and metadata
│   │   ├── FrameMockup.tsx     # Overlapping photostrip mockups for Step 1
│   │   ├── ThemedFramePreview.tsx # Centered preview with < > carousel for Step 2
│   │   ├── SoundEffects.ts     # Web Audio API shutter click and countdown beeps
│   │   └── CanvasExporter.ts   # 300 DPI high-res canvas renderer & print helper
│   └── tabs/
│       ├── HomeTab.tsx         # Route / & /home (Canva Slide 1 replica)
│       ├── BoothTab.tsx        # Route /photobooth & /booth (4-step interactive booth)
│       ├── StudioTab.tsx       # Route /studio (Fullerton showroom & Google Maps)
│       └── GuideTab.tsx        # Route /how-to-use & /guide (3-step user guide)
```

---

## 🎨 4. Design & Styling System

* **Color Palette**:
  * Background: `#FAF8F5` (Warm Cream Ivory)
  * Dark Accent: `#0C0C0C` / `#111111` (Deep Noir)
  * Hairline Borders: `border-black/10`, `border-black/20`, `border-[#C5A880]/50` (Champagne Gold)
  * Pastel Photo Slots: `#FDEEC8` (Soft Butter Yellow)
* **Typography Scale**:
  * Script / Calligraphy: `font-script` (`"Alex Brush"`, `"Pinyon Script"`, cursive) — used for brand name `Poseclub` and signature marks.
  * Luxury Serif: `font-serif` (`"Playfair Display"`) & `font-editorial` (`"Cormorant Garamond"`) — used for headlines and titles.
  * Modern Sans: `font-sans` (`"Inter"`) — used for body copy and descriptions.
  * Monospace: `font-mono` — used for buttons, metadata, and timestamps.
* **Component Patterns**:
  * Buttons: Pill-shaped (`rounded-full`), double border or bold border, uppercase tracking.
  * Circular controls: `w-13 h-13` or `w-14 h-14` rounded-full buttons for `BACK ←`, `VOUCHER 🎫`, and `< >` carousel arrows.

---

## 📸 5. Photobooth Engine Specifications

1. **Camera Stream**:
   * Request constraints: `video: { width: { ideal: 1920 }, height: { ideal: 1440 }, facingMode: 'user' }`.
   * **Do not request audio/microphone permissions** (camera only) to minimize browser permission friction.
   * Mirror Mode: Mặc định bật `transform: scaleX(-1)` để người chụp selfie tự nhiên.
2. **Step 3 (Take Photos) Two-Column View**:
   * **Left Column**: Live Photostrip Progress Preview displaying the exact chosen style and theme. When a shot is taken, the photo immediately appears in the corresponding slot with the active filter.
   * **Right Column**: Live video viewfinder with countdown overlay, white flash animation (220ms), and shutter sound.
3. **Canvas 300 DPI Export**:
   * Dải ảnh dọc 1x4 (2x6 inches): 1200 x 3600 px.
   * Khung lưới 2x2 (4x6 inches): 1800 x 2400 px.
   * Card ảnh đơn lẻ: 1200 x 1500 px.
   * In ấn qua `@media print { @page { size: auto; margin: 0; } }`.

---

## ✍️ 6. Git Commit & Attribution Policy (Mandatory)

* **Sole Attributed Author**: The user must be the sole attributed author on all commits.
* **Prohibited Trailers**:
  * **NEVER** add `Co-Authored-By:` trailers to commit messages.
  * **NEVER** add AI signatures, notices, or badges (e.g. `🤖 Generated with Claude Code`, `Generated by Claude`, etc.).
* **Commit Conventions**: Use Conventional Commits with concise, lowercase descriptions:
  * `feat: ...` for new features
  * `fix: ...` for bug fixes
  * `refactor: ...` for code refactoring
  * `style: ...` for visual styling adjustments
  * `docs: ...` for documentation updates
