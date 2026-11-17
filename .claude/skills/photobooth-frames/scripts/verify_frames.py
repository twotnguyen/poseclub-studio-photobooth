"""Check an original frame against its RGBA overlay.

Reports dimensions, how much of the slot is transparent, and whether
non-grey decorations (e.g. a red heart) survived.

Usage:
    python verify_frames.py --original <file.png> --alpha <file.png>
"""

import argparse
from collections import Counter
from PIL import Image


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--original", required=True)
    ap.add_argument("--alpha", required=True)
    args = ap.parse_args()

    a = Image.open(args.original).convert("RGB")
    b = Image.open(args.alpha).convert("RGBA")
    print("dimensions:", a.size, b.size)

    px = b.load()
    w, h = b.size
    transparent = sum(1 for y in range(0, h, 2) for x in range(0, w, 2)
                      if px[x, y][3] == 0)
    total = len(range(0, h, 2)) * len(range(0, w, 2))
    print(f"transparent: {transparent}/{total} = {transparent / total:.1%}")

    colours = Counter(px[x, y][:3] for y in range(0, h, 2) for x in range(0, w, 2)
                      if px[x, y][3] > 0)
    non_grey = [(c, n) for c, n in colours.most_common(20)
                if max(c) - min(c) > 20]
    print("top non-grey surviving colours:", non_grey[:6])


if __name__ == "__main__":
    main()
