"""Detect transparent photo slots in RGBA frame PNGs.

Slots are enclosed transparent regions inside the frame art. The outer
transparent background touches the image border; slots do not (after
morphologically closing dashed-border gaps).
"""
import argparse
import json
from pathlib import Path

import numpy as np
from PIL import Image
from scipy import ndimage

APP_DIRS = (
    'style-1-polaroid-alpha',
    'style-2-strip-1x2',
    'style-3-grid-2x2',
    'style-4-classic-2x4',
    'style-5-grid-2x3',
    'style-6-collage-3x3',
)
MIN_SLOT_FRAC = 0.02  # slot must be >= 2% of image area

def detect(path: Path):
    im = Image.open(path).convert('RGBA')
    w, h = im.size
    alpha = np.asarray(im)[:, :, 3]
    trans = alpha < 10
    # close dashed borders / small gaps so slot interiors become enclosed
    closed = ndimage.binary_closing(trans, structure=np.ones((13, 13)))
    labels, n = ndimage.label(closed)
    slots = []
    for i in range(1, n + 1):
        mask = labels == i
        area = mask.sum()
        if area < w * h * MIN_SLOT_FRAC:
            continue
        ys, xs = np.where(mask)
        x1, y1, x2, y2 = int(xs.min()), int(ys.min()), int(xs.max()) + 1, int(ys.max()) + 1
        # fill ratio inside bbox: real slots are near-solid rectangles
        fill = area / max(1, (x2 - x1) * (y2 - y1))
        slots.append({'box': [x1, y1, x2, y2], 'fill': round(float(fill), 2)})
    # reading order: row-major by (y center, x center)
    slots.sort(key=lambda s: ((s['box'][1] + s['box'][3]) / 2 // (h * 0.25), s['box'][0]))
    return {'size': [w, h], 'slots': slots}

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--root', type=Path, default=Path('public/exported-frames'))
    ap.add_argument('--out', type=Path, default=Path(__file__).resolve().parents[1] / 'slots.json')
    args = ap.parse_args()
    out = {}
    for name in APP_DIRS:
        for p in sorted((args.root / name).glob('*.png'), key=lambda x: int(x.stem)):
            r = detect(p)
            out[f'{name}/{p.name}'] = r
            boxes = ', '.join(f"[{b['box'][0]},{b['box'][1]},{b['box'][2]},{b['box'][3]}] f{b['fill']}" for b in r['slots'])
            print(f"{name}/{p.name} {r['size']} n={len(r['slots'])}: {boxes}")
    args.out.write_text(json.dumps(out, indent=1), encoding='utf-8')
    print(f'Wrote {len(out)} frames to {args.out}')

if __name__ == '__main__':
    main()
