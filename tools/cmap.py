"""Render a screenshot as color-quantized ASCII (ground-truth visual QA).
W=white surface, T=surface-2 tint, U=surface-3, S=sage bg, D=dark, K=brand deep,
G=green accent, g=green soft, A=amber, a=amber soft, R=red, r=red soft,
B=blue, b=blue soft, M=mint, X=text-dominant (ink glyphs), .=light/empty
"""
import sys
from PIL import Image

PALETTE = [
    ("W", (250, 250, 250)), ("T", (236, 237, 238)), ("U", (224, 226, 228)),
    ("N", (163, 165, 169)), ("D", (33, 37, 41)), ("X", (5, 5, 5)),
    ("G", (47, 206, 79)), ("g", (217, 243, 221)), ("A", (236, 165, 28)), ("a", (246, 231, 184)),
    ("R", (224, 82, 73)), ("r", (248, 220, 215)), ("B", (91, 150, 246)), ("b", (221, 232, 251)),
    ("M", (124, 239, 176)), ("K", (11, 59, 50)),
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
