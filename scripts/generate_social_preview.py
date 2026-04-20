#!/usr/bin/env python3

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "social-preview.png"

W = 1280
H = 640

COLORS = {
    "black": (0, 0, 0),
    "white": (255, 255, 255),
    "red": (215, 0, 0),
    "yellow": (215, 215, 0),
    "green": (0, 215, 0),
    "cyan": (0, 215, 215),
}


def load_font(size: int, bold: bool = False):
    candidates = [
        "/System/Library/Fonts/Supplemental/Courier New Bold.ttf" if bold else "/System/Library/Fonts/Supplemental/Courier New.ttf",
        "/System/Library/Fonts/SFNSMono.ttf",
        "/System/Library/Fonts/Menlo.ttc",
    ]
    for candidate in candidates:
        try:
            return ImageFont.truetype(candidate, size=size)
        except OSError:
            continue
    return ImageFont.load_default()


def main():
    im = Image.new("RGB", (W, H), COLORS["black"])
    draw = ImageDraw.Draw(im)

    title_font = load_font(104, bold=True)
    subtitle_font = load_font(40, bold=True)

    draw.text((118, 178), "SCUMM Adventure", font=title_font, fill=COLORS["white"])
    draw.text((122, 306), "theme for eXeLearning", font=subtitle_font, fill=COLORS["white"])

    y = 448
    x = 122
    width = 180
    gap = 14
    for color in (COLORS["red"], COLORS["yellow"], COLORS["green"], COLORS["cyan"]):
        draw.rectangle((x, y, x + width, y + 22), fill=color)
        x += width + gap

    im.save(OUT)
    print(OUT.name)


if __name__ == "__main__":
    main()
