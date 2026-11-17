"""Turn Canva frame PNGs with a baked checkerboard photo slot into RGBA overlays.

Only near-grey checkerboard pixels become transparent. Coloured stickers
(hearts, ribbons, ...), logos and signatures stay opaque, so they can be
drawn on top of the customer's photo.

Usage:
    python make_alpha_frames.py --src <folder-with-frames> --out <destination>
"""

import argparse
from pathlib import Path
from PIL import Image


def is_grey(rgb, lo=195, hi=255):
    r, g, b = rgb[:3]
    return abs(r - g) <= 3 and abs(g - b) <= 3 and lo <= r <= hi


def find_checker_box(im):
    """Locate the checkerboard by rows/columns dense in ~204 grey."""
    px = im.load()
    w, h = im.size
    rows = [y for y in range(0, h, 3)
            if sum(1 for x in range(0, w, 3) if px[x, y][0] == 204) / (w // 3) > 0.12]
    cols = [x for x in range(0, w, 3)
            if sum(1 for y in range(0, h, 3) if px[x, y][0] == 204) / (h // 3) > 0.12]
    if not rows or not cols:
        raise ValueError("no checkerboard detected — is the background transparent already?")
    return min(cols), min(rows), max(cols), max(rows)


def convert(src_file, out_file, pad=5):
    im = Image.open(src_file).convert("RGBA")
    x1, y1, x2, y2 = find_checker_box(im)
    px = im.load()
    cleared = 0
    for y in range(max(0, y1 - pad), min(im.height, y2 + pad)):
        for x in range(max(0, x1 - pad), min(im.width, x2 + pad)):
            if is_grey(px[x, y]):
                px[x, y] = (0, 0, 0, 0)
                cleared += 1
    im.save(out_file, optimize=True)
    return (x1, y1, x2, y2), cleared


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--src", required=True, help="folder containing the Canva PNGs")
    ap.add_argument("--out", required=True, help="destination folder for RGBA PNGs")
    ap.add_argument("--pad", type=int, default=5, help="extra pixels to clear around the slot")
    args = ap.parse_args()

    src, out = Path(args.src), Path(args.out)
    out.mkdir(parents=True, exist_ok=True)
    for f in sorted(src.glob("*.png"), key=lambda p: (len(p.stem), p.stem)):
        box, cleared = convert(f, out / f.name, args.pad)
        print(f"{f.name}: box={box} cleared={cleared}")


if __name__ == "__main__":
    main()
