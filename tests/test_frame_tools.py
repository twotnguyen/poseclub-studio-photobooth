"""Regression checks for frame metadata and green-edge cleanup."""
import sys
import unittest
from pathlib import Path
import json
import numpy as np
from PIL import Image
sys.path.insert(0, str(Path(__file__).resolve().parents[1] / '.claude' / 'skills' / 'photobooth-frames' / 'scripts'))
from green_to_alpha import pale_edge_mask  # noqa: E402
from clean_green_edges import clean, edge_mask  # noqa: E402


class GreenEdgeCleanupTest(unittest.TestCase):
    def setUp(self):
        self.a = np.zeros((20, 20, 4), dtype=np.uint8)
        self.a[..., 3] = 255
        self.a[4:6, 4:6, 3] = 0              # transparent slot interior
        self.a[6, 5] = (221, 239, 219, 255)  # pale anti-aliased slot edge
        self.a[6, 6] = (87, 190, 172, 255)   # saturated teal decoration
        self.a[6, 4] = (158, 187, 136, 255)  # olive-green leaf art near slot
        self.a[8, 8] = (221, 239, 219, 255)  # pale green far from slot edge
        self.a[15, 15] = (221, 239, 219, 255)  # pale green outside slot box

    def test_clears_only_pale_green_touching_the_slot(self):
        boxes = [(4, 4, 9, 9)]
        mask = edge_mask(self.a, boxes, 2)
        self.assertTrue(mask[6, 5], 'pale slot edge must be selected')
        self.assertFalse(mask[6, 4], 'green decoration must be preserved')
        self.assertFalse(mask[8, 8], 'pale green away from slot edge must be preserved')
        self.assertFalse(mask[15, 15], 'green outside the slot box must be preserved')

    def test_clean_keeps_all_other_pixels_untouched(self):
        before = self.a.copy()
        out = clean(self.a, [(4, 4, 9, 9)], 2)
        self.assertEqual(tuple(out[6, 5]), (0, 0, 0, 0))
        self.assertEqual(tuple(out[6, 6]), tuple(before[6, 6]))
        self.assertEqual(tuple(out[6, 7]), tuple(before[6, 7]))
        self.assertEqual(tuple(out[8, 8]), tuple(before[8, 8]))
        self.assertEqual(tuple(out[15, 15]), tuple(before[15, 15]))


class GreenKeyMaskTest(unittest.TestCase):
    def test_key_mask_excludes_olive_decoration(self):
        a = np.zeros((3, 3, 4), dtype=np.uint8)
        a[..., 3] = 255
        a[0, 0] = (221, 239, 219, 255)  # anti-aliased green-screen edge
        a[0, 1] = (158, 187, 136, 255)  # olive decoration
        mask = pale_edge_mask(a)
        self.assertTrue(mask[0, 0])
        self.assertFalse(mask[0, 1])





class SlotsManifestTest(unittest.TestCase):
    def test_manifest_matches_all_shipped_frame_files(self):
        root = Path(__file__).resolve().parents[1]
        data = json.loads((root / '.claude/skills/photobooth-frames/slots.json').read_text(encoding='utf-8'))
        expected = {
            'style-1-polaroid-alpha': (23, 1),
            'style-2-strip-1x2': (9, 2),
            'style-3-grid-2x2': (10, 4),
            'style-4-classic-2x4': (10, 8),
            'style-5-grid-2x3': (15, 6),
            'style-6-collage-3x3': (5, 9),
        }
        self.assertEqual(len(data), 72)
        by_dir = {}
        for rel, meta in data.items():
            folder = rel.split('/')[0]
            by_dir[folder] = by_dir.get(folder, 0) + 1
            path = root / 'public/exported-frames' / rel
            self.assertTrue(path.exists(), f'missing frame: {rel}')
            with Image.open(path) as im:
                self.assertEqual(list(im.size), meta['size'], f'wrong size: {rel}')
            self.assertEqual(len(meta['slots']), expected[folder][1], f'wrong slot count: {rel}')
            for slot in meta['slots']:
                x1, y1, x2, y2 = slot['box']
                self.assertTrue(0 <= x1 < x2 <= meta['size'][0], f'bad box: {rel}')
                self.assertTrue(0 <= y1 < y2 <= meta['size'][1], f'bad box: {rel}')
        self.assertEqual(by_dir, {k: v[0] for k, v in expected.items()})

if __name__ == '__main__':
    unittest.main()
