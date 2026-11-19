"""Clear pale anti-aliased green left at slot borders by green-screen keying.

Usage:
    python clean_green_edges.py --dry-run
    python clean_green_edges.py --write
"""
import argparse
import json
from pathlib import Path

import numpy as np
from scipy import ndimage
from PIL import Image

ROOT = Path('public/exported-frames')
SLOTS = Path(__file__).resolve().parents[1] / 'slots.json'


def edge_mask(a, boxes, pad=3):
    """Pale green pixels immediately around the transparent slot interior."""
    r, g, b, alpha = (a[..., i].astype(float) for i in range(4))
    # Anti-aliased #00B140 over white lies near this blend line; genuine
    # olive/teal decorations are much darker than the blend predicts.
    expected_g = 177 + 78 * r / 255
    expected_b = 64 + 191 * r / 255
    pale = ((alpha > 0) & (r >= 100) & (g >= 150)
            & ((g - r) >= 8) & ((g - b) >= 8)
            & (abs(g - expected_g) <= 25) & (abs(b - expected_b) <= 30))
    h, w = a.shape[:2]
    interior = np.zeros((h, w), dtype=bool)
    for x1, y1, x2, y2 in boxes:
        interior[max(0, y1):min(h, y2), max(0, x1):min(w, x2)] = True
    boundary = ndimage.binary_dilation(interior & (alpha < 10),
                                       structure=np.ones((3, 3)), iterations=pad)
    return pale & boundary


def clean(a, boxes, pad=3):
    out = a.copy()
    out[edge_mask(a, boxes, pad)] = (0, 0, 0, 0)
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--root', type=Path, default=ROOT)
    ap.add_argument('--slots', type=Path, default=SLOTS)
    ap.add_argument('--pad', type=int, default=3)
    ap.add_argument('--write', action='store_true', help='save cleaned PNGs in place')
    ap.add_argument('--dry-run', action='store_true', help='only report pixel counts')
    args = ap.parse_args()
    if args.write == args.dry_run:
        ap.error('pass exactly one of --write or --dry-run')

    slots = json.loads(args.slots.read_text(encoding='utf-8'))
    total = 0
    touched = 0
    for rel, meta in slots.items():
        path = args.root / rel
        if not path.exists():
            raise FileNotFoundError(path)
        a = np.asarray(Image.open(path).convert('RGBA')).copy()
        boxes = [s['box'] for s in meta['slots']]
        count = int(edge_mask(a, boxes, args.pad).sum())
        if count:
            touched += 1
            total += count
            print(f'{rel}: {count} pixels')
            if args.write:
                Image.fromarray(clean(a, boxes, args.pad)).save(path, optimize=True)
    print(f'total={total} files={touched} mode={"write" if args.write else "dry-run"}')


if __name__ == '__main__':
    main()
