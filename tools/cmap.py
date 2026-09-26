"""Render a screenshot as color-quantized ASCII (ground-truth visual QA).
Dark theme letters: K=black canvas (050505), N=Eerie surface (212529),
T=surface-2 (2b3036), U=surface-3 (363c43), W=Seasalt pills/text (fafafa),
E=Cadet text (a3a5a9), G/g=accent + soft, A/a=amber, R/r=red, B/b=blue,
M=mint brand, X=Seasalt alias, .=mid greys/glyph AA (text-dominant cells)
"""
import sys
from PIL import Image

PALETTE = [
    ("K", (5, 5, 5)), ("N", (33, 37, 41)), ("T", (43, 48, 54)), ("U", (54, 60, 67)),
    ("W", (250, 250, 250)), ("E", (163, 165, 169)),
    ("G", (47, 206, 79)), ("g", (217, 243, 221)), ("A", (236, 165, 28)), ("a", (246, 231, 184)),
    ("R", (224, 82, 73)), ("r", (248, 220, 215)), ("B", (91, 150, 246)), ("b", (221, 232, 251)),
    ("M", (124, 239, 176)), ("X", (250, 250, 250)),
]

def nearest(px):
    best, bd = ".", 1e9
    for ch, c in PALETTE:
        d = sum((a - b) ** 2 for a, b in zip(px, c))
        if d < bd:
            best, bd = ch, d
    return best if bd < 2600 else "."

def color_map(path, cols=118, rows=44):
    im = Image.open(path).convert("RGB")
    w, h = im.size
    print(f"==== {path}  {w}x{h}  ({w//2}x{h//2} CSS) ====")
    small = im.resize((cols, rows))
    for y in range(rows):
        print("".join(nearest(small.getpixel((x, y))) for x in range(cols)))

if __name__ == "__main__":
    for p in sys.argv[1:]:
        color_map(p)
        print()
