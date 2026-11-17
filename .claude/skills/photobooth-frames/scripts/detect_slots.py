"""Detect transparent photo slots in RGBA frame PNGs.

Slots are enclosed transparent regions inside the frame art. The outer
transparent background touches the image border; slots do not (after
morphologically closing dashed-border gaps).
"""
import json
import sys
from pathlib import Path

import numpy as np
from PIL import Image
from scipy import ndimage

ROOT = Path(r'D:\Documents\CODE\poseclub-studio-photobooth\frame')
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
    out = {}
    for d in sorted(ROOT.iterdir()):
        if not d.is_dir():
            continue
        for p in sorted(d.glob('*.png'), key=lambda x: int(x.stem)):
            if p.parent.name in ('alpha', 'original'):
                continue
            r = detect(p)
            out[f'{d.name}/{p.name}'] = r
            boxes = ', '.join(f"[{b['box'][0]},{b['box'][1]},{b['box'][2]},{b['box'][3]}] f{b['fill']}" for b in r['slots'])
            print(f"{d.name}/{p.name} {r['size']} n={len(r['slots'])}: {boxes}")
    json.dump(out, open(Path(__file__).with_name('slots.json'), 'w'), indent=1)

if __name__ == '__main__':
    main()
