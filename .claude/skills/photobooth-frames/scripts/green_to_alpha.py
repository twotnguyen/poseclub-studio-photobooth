"""Turn green-slot Canva frame PNGs into RGBA overlays.

The solid green photo slot (e.g. #00B140) becomes transparent so the customer
photo can be drawn underneath. Borders, stickers and logos stay opaque. The
slot is detected per image, so the grainy/gemstone decorations outside it are
never touched.

Usage:
    python green_to_alpha.py --src <folder-with-green-frames> --out <destination>
"""

import argparse
from pathlib import Path

import numpy as np
from PIL import Image


def slot_green_mask(a):
    """Bright slot green, excluding dark-green/teal borders and decorations."""
    r, g, b = a[..., 0].astype(int), a[..., 1].astype(int), a[..., 2].astype(int)
    return (g >= 150) & (g - r >= 60) & (g - b >= 50) & (r <= 100)


def find_slot_box(a, green):
    """Locate the solid slot rectangle from rows/cols dense in the exact key."""
    colors, counts = np.unique(a[green][:, :3], axis=0, return_counts=True)
    key = colors[counts.argmax()]
    exact = np.all(a[..., :3] == key, axis=2)
    rows = np.where(exact.mean(axis=1) > 0.5)[0]
    cols = np.where(exact.mean(axis=0) > 0.5)[0]
    if not len(rows) or not len(cols):
        raise ValueError("no solid green slot detected")
    return cols.min(), rows.min(), cols.max(), rows.max()


def convert(src_file, out_file, pad=2):
    a = np.asarray(Image.open(src_file).convert("RGBA")).copy()
    green = slot_green_mask(a)
    x1, y1, x2, y2 = find_slot_box(a, green)

    region = np.zeros(green.shape, dtype=bool)
    region[max(0, y1 - pad):y2 + 1 + pad, max(0, x1 - pad):x2 + 1 + pad] = True
    clear = green & region
    a[clear] = (0, 0, 0, 0)

    Image.fromarray(a).save(out_file, optimize=True)
    return (x1, y1, x2, y2), int(clear.sum())


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--src", required=True, help="folder containing the green-slot PNGs")
    ap.add_argument("--out", required=True, help="destination folder for RGBA PNGs")
    ap.add_argument("--pad", type=int, default=2, help="extra pixels to clear around the slot")
    args = ap.parse_args()

    src, out = Path(args.src), Path(args.out)
    out.mkdir(parents=True, exist_ok=True)
    for f in sorted(src.glob("*.png"), key=lambda p: (len(p.stem), p.stem)):
        box, cleared = convert(f, out / f.name, args.pad)
        print(f"{f.name}: box={box} cleared={cleared}")


if __name__ == "__main__":
    main()
