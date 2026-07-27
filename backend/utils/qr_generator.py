"""
qr_generator.py
----------------
Generates a deterministic square "tracking code" pattern image for a
donation ID, rendered with PIL.

NOTE (documented honestly): this offline environment has no internet
access to install a standards-compliant QR library (python-qrcode /
segno). Rather than fake a real scannable QR code, this generates a
deterministic, hash-derived module grid that visually communicates the
"scan to track" concept for the demo/UI, with three PNG finder squares
in the corners similar to real QR codes for visual familiarity. The
donation_code text is also rendered underneath so status can always be
looked up manually or via the donation code search field. Swapping in
`qrcode` or `segno` for a real scannable code is a one-line change
once package installation is available (see README "Future Scope").
"""

import hashlib
import os
from PIL import Image, ImageDraw, ImageFont

GRID_SIZE = 21          # QR-like module grid dimension
MODULE_PX = 10           # pixels per module
QUIET_ZONE = 2           # modules of white border
FINDER_SIZE = 7


def _bit_grid_from_code(code: str):
    digest = hashlib.sha256(code.encode()).digest()
    bits = []
    for byte in digest:
        for i in range(8):
            bits.append((byte >> i) & 1)
    grid = [[0] * GRID_SIZE for _ in range(GRID_SIZE)]
    idx = 0
    for r in range(GRID_SIZE):
        for c in range(GRID_SIZE):
            grid[r][c] = bits[idx % len(bits)]
            idx += 1
    return grid


def _stamp_finder(grid, top, left):
    for r in range(FINDER_SIZE):
        for c in range(FINDER_SIZE):
            on_border = r == 0 or r == FINDER_SIZE - 1 or c == 0 or c == FINDER_SIZE - 1
            inner = 2 <= r <= 4 and 2 <= c <= 4
            grid[top + r][left + c] = 1 if (on_border or inner) else 0


def generate_tracking_code_image(code: str, save_path: str):
    grid = _bit_grid_from_code(code)
    _stamp_finder(grid, 0, 0)
    _stamp_finder(grid, 0, GRID_SIZE - FINDER_SIZE)
    _stamp_finder(grid, GRID_SIZE - FINDER_SIZE, 0)

    dim = (GRID_SIZE + 2 * QUIET_ZONE) * MODULE_PX
    label_height = 40
    img = Image.new("RGB", (dim, dim + label_height), "white")
    draw = ImageDraw.Draw(img)

    for r in range(GRID_SIZE):
        for c in range(GRID_SIZE):
            if grid[r][c]:
                x0 = (c + QUIET_ZONE) * MODULE_PX
                y0 = (r + QUIET_ZONE) * MODULE_PX
                draw.rectangle([x0, y0, x0 + MODULE_PX, y0 + MODULE_PX], fill="#065f46")

    try:
        font = ImageFont.load_default()
    except Exception:
        font = None
    text = code
    bbox = draw.textbbox((0, 0), text, font=font)
    tw = bbox[2] - bbox[0]
    draw.text(((dim - tw) / 2, dim + 10), text, fill="#065f46", font=font)

    os.makedirs(os.path.dirname(save_path), exist_ok=True)
    img.save(save_path)
    return save_path
