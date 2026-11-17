# Preparing frames in Canva

The site composites a customer photo into each frame. The frame PNG must be a
**transparent overlay with stickers left in place**.

## The mistake to avoid
Exporting a PNG with a drawn checkerboard element. The checkerboard is only an
editor indicator; if it is a real element (or the page has a background), the
checkerboard gets baked into the PNG and covers the customer's photo.

## Correct setup
1. Delete the checkerboard element. Leave the photo area **literally empty**.
2. Keep logos, signatures and stickers as separate layers **above** the empty
   area. A sticker that overlaps the photo slot must stay in the PNG — the site
   draws the PNG on top of the photo, so it will sit on the customer's face/shirt
   exactly as designed.
3. Download as PNG with **Transparent background** enabled.
4. If a frame needs a coloured border (e.g. navy #10), put the colour only in
   the top/bottom bands — do not fill the whole page, or the slot is not a hole.

## What the site does with the PNG
- `renderPhotostripToCanvas` draws the photo first, then draws the frame PNG on
  top. Transparent pixels show the photo; opaque stickers stay visible.
- Live preview uses the same order.
- `photoBox` in `FrameThemes.ts` is the pixel rectangle of the (former)
  checkerboard. It is used to place the photo and to size the camera viewfinder.

## Verifying a new frame
Run `verify_frames.py` on the original and the alpha version. You want roughly
70–85% transparent pixels and the sticker's colour (e.g. red `(153,4,4)`) still
present in the surviving colours list.
