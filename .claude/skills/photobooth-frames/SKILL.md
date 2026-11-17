---
name: photobooth-frames
description: Add, replace or debug custom photo-booth frame designs in this project. Use whenever the user mentions frame PNGs, exported-frames, checkerboard photo slots, frames that cover the customer's photo, stickers/hearts/logos disappearing on export, Canva frame exports, the 23 Custom frames, or asks to "put new frames on the web". Covers converting Canva PNGs to transparent overlays, wiring them into FrameThemes.ts, the catalog, live preview, camera aspect ratio, and end-to-end verification.
---

# Photobooth frames

This project turns Canva PNG frames into transparent overlays. A customer's
photo is composited underneath, while stickers (hearts, ribbons, logos,
signatures) sitting on top of the photo stay visible.

Read `references/canva.md` when explaining how to prepare frames in Canva.

## The core idea

There are two versions of every frame:

| Version | Folder | Role |
|---|---|---|
| Original (checkerboard baked in) | `exported-frames/style-1-polaroid/` | Design source + catalog preview |
| RGBA overlay (checkerboard -> alpha) | `public/exported-frames/style-1-polaroid-alpha/` | What the web app actually draws |

**Draw order matters.** Export and live preview both do:

1. Draw the customer's photo into `photoBox`.
2. Draw the RGBA frame PNG **on top**.

Reversing this order puts the opaque checkerboard over the photo and hides the
customer. Using the `khong-khung` (no-frame) variants is wrong: they delete the
stickers along with the checkerboard.

## Adding or replacing frames

### 1. Get the PNGs
Put the Canva exports in `exported-frames/style-1-polaroid/` named `1.png`,
`2.png`, ... Files must all be the same size (currently 1240x1844).

### 2. Generate transparent overlays
```bash
python .claude/skills/photobooth-frames/scripts/make_alpha_frames.py \
  --src exported-frames/style-1-polaroid \
  --out public/exported-frames/style-1-polaroid-alpha
```
The script auto-detects the checkerboard (rows/columns dense in grey 204),
clears near-grey pixels in that box, and keeps coloured decorations opaque.
It prints one detected box per file — sanity-check those numbers.

Verify one frame:
```bash
python .claude/skills/photobooth-frames/scripts/verify_frames.py \
  --original exported-frames/style-1-polaroid/15.png \
  --alpha public/exported-frames/style-1-polaroid-alpha/15.png
```
Expect ~65–85% transparent and the sticker colour still present.

### 3. Register the frames in code
`src/components/Photobooth/FrameThemes.ts`:
- `CUSTOM_PHOTO_BOXES` — one `[left, top, right, bottom]` per frame, measured
  from the checkerboard. Keep these in sync with the script's detected boxes.
- `CUSTOM_FRAMES` maps those to themes with `id: custom-N`,
  `imagePath: /exported-frames/style-1-polaroid-alpha/N.png`, `imageWidth`/
  `imageHeight` and `photoBox`.
- `ALL_THEMES` is what the UI iterates; `getThemeById` falls back to
  `CUSTOM_FRAMES[0]`.

`src/components/Photobooth/types.ts`: `FrameTheme = \`custom-${number}\``.

### 4. Keep every surface in sync
- **Step 2 picker** (`BoothTab.tsx`): `availableThemes = CUSTOM_FRAMES`.
- **Step 2 preview** (`ThemedFramePreview.tsx`): when `selectedStyle === 1` and
  `imagePath` exists, show just the `<img>` — no extra border, rounded corners
  or shadow. Carousel uses `CUSTOM_FRAMES`.
- **Step 3 live preview** (`BoothTab.tsx`, `renderCustomFrame`): photo absolutely
  positioned at `photoBox` percentages, frame `<img>` layered on top.
- **Camera viewfinder**: `cameraRatio = photoBox.w / photoBox.h` so customers
  can compose in the same shape as the final photo. Other styles stay 4/3.
- **Export** (`CanvasExporter.ts`): photo first, frame PNG on top.
- **Catalog** (`public/exported-frames/index.html`): cards and ZIP must match
  the frame count; preview shows the ORIGINAL checkerboard versions.

### 5. Verify end to end
Build and run the flow in the browser:
```bash
npm test
npm run build
npm run dev
```
Then: Style 1 -> pick a frame -> TAKE PHOTOS -> CAPTURE -> CONFIRM ->
Download High-Res Strip. Check the exported PNG with `eval` in Chrome:

- dimensions equal `imageWidth x imageHeight`
- a sticker pixel keeps its exact colour (heart in #15 is `(153,4,4)`)
- the photo area has many distinct colours, not two checkerboard values

Use the browse MCP tools in the user's Chrome for this; camera works there.

## Gotchas learned the hard way

- A black rounded border around the preview comes from UI CSS, not the PNG.
  Remove `border`, `border-radius` and `box-shadow` rather than editing art.
- `4 Individual Photos` was a hardcoded label; it now uses `{count}` from
  translations and `shots.length`. Keep dynamic counts dynamic.
- Styles 2–6 now have their own multi-slot PNG frames (`public/exported-frames/style-{2..6}-*/`), generated with
  `scripts/detect_slots.py` (transparent-region slot detection) and registered in `FrameThemes.ts` via `STYLE_FRAMES`.
  ThemeConfig carries `style` + `slots[]` (reading order); the single `photoBox` was replaced by `slots` everywhere.
  Style-5 frames are landscape 1844x1240 (files renamed 41–55 to avoid clashing with style-1 numbering).
- The ZIP in the catalog is a static file — regenerate it whenever the frame
  set changes.
