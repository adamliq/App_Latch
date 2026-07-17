#!/usr/bin/env python3
"""One-time generator for the app's placeholder Splunkbase icon/logo assets.

Not part of the production build. Produces flat, dependency-free PNGs (a
simple "L" mark on the app's brand navy) sized to Splunk's required
dimensions. Replace with real branded artwork before a public Splunkbase
submission -- see static/README/ for the required file list.
"""
import struct
import zlib
import os

BRAND_BG = (15, 32, 52)      # #0f2034 - matches the app's header color
BRAND_MARK = (255, 255, 255)

# 5x7 pixel-grid glyph for "L"
GLYPH_L = [
    "1000",
    "1000",
    "1000",
    "1000",
    "1000",
    "1000",
    "1111",
]


def render_glyph(width, height, glyph, scale, offset_x, offset_y, bg, fg):
    pixels = [[bg for _ in range(width)] for _ in range(height)]
    for row_index, row in enumerate(glyph):
        for col_index, cell in enumerate(row):
            if cell != "1":
                continue
            for dy in range(scale):
                for dx in range(scale):
                    y = offset_y + row_index * scale + dy
                    x = offset_x + col_index * scale + dx
                    if 0 <= x < width and 0 <= y < height:
                        pixels[y][x] = fg
    return pixels


def write_png(path, width, height, pixels):
    def chunk(tag, data):
        return (
            struct.pack("!I", len(data))
            + tag
            + data
            + struct.pack("!I", zlib.crc32(tag + data) & 0xFFFFFFFF)
        )

    raw = bytearray()
    for row in pixels:
        raw.append(0)  # no filter
        for (r, g, b) in row:
            raw.extend((r, g, b))

    signature = b"\x89PNG\r\n\x1a\n"
    ihdr = struct.pack("!IIBBBBB", width, height, 8, 2, 0, 0, 0)
    idat = zlib.compress(bytes(raw), 9)
    png = signature + chunk(b"IHDR", ihdr) + chunk(b"IDAT", idat) + chunk(b"IEND", b"")

    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "wb") as fh:
        fh.write(png)


def make_icon(path, size):
    scale = max(1, size // 12)
    glyph_width = len(GLYPH_L[0]) * scale
    glyph_height = len(GLYPH_L) * scale
    offset_x = (size - glyph_width) // 2
    offset_y = (size - glyph_height) // 2
    pixels = render_glyph(size, size, GLYPH_L, scale, offset_x, offset_y, BRAND_BG, BRAND_MARK)
    write_png(path, size, size, pixels)


def make_logo(path, width, height):
    scale = max(1, height // 10)
    glyph_width = len(GLYPH_L[0]) * scale
    glyph_height = len(GLYPH_L) * scale
    offset_x = (height - glyph_height) // 2
    offset_y = (height - glyph_height) // 2
    pixels = render_glyph(width, height, GLYPH_L, scale, offset_x, offset_y, BRAND_BG, BRAND_MARK)
    write_png(path, width, height, pixels)


if __name__ == "__main__":
    base = os.path.join(os.path.dirname(__file__), "..", "splunk-app", "latch", "static")
    make_icon(os.path.join(base, "appIcon.png"), 36)
    make_icon(os.path.join(base, "appIcon_2x.png"), 72)
    make_logo(os.path.join(base, "appLogo.png"), 160, 40)
    make_logo(os.path.join(base, "appLogo_2x.png"), 320, 80)
    print("Generated placeholder icons in", base)
