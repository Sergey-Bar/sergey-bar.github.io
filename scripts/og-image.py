"""
Renders public/og.png (1200x630) for link previews, on the site's theme: a
near-black ground with the LinkedIn-blue glow low on the right, the portrait
in a blue ring, the name, the role and the headline. Run after changing the
portrait or the copy:

    python scripts/og-image.py

It reads the copy from src/content/site.ts and src/content/hero.ts so the
preview cannot say something the page does not.
"""

import re
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
W, H = 1200, 630

PAPER = (5, 6, 8)
INK = (255, 255, 255)
MUTED = (163, 172, 184)
BLUE = (10, 102, 194)
SKY = (45, 140, 255)
LINE = (54, 61, 72)


def read_const(path: Path, key: str) -> str:
    text = path.read_text(encoding="utf-8")
    match = re.search(rf'{key}:\s*"([^"]+)"', text)
    if not match:
        raise SystemExit(f"{key} not found in {path}")
    return match.group(1)


def font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont:
    fonts = Path("C:/Windows/Fonts")
    for name in (["segoeuib.ttf", "arialbd.ttf"] if bold else ["segoeui.ttf", "arial.ttf"]):
        if (fonts / name).exists():
            return ImageFont.truetype(str(fonts / name), size)
    return ImageFont.load_default(size)


def radial(size: int, colour: tuple[int, int, int], alpha: int) -> Image.Image:
    """A soft disc: the glow the page paints with a radial gradient. PIL's
    gradient reaches 255 at the corners, so it is rescaled to fade out at the
    inscribed circle and the disc has no visible edge."""
    grad = Image.radial_gradient("L").resize((size, size))
    mask = grad.point(lambda v: int(alpha * max(0.0, 1 - (v * 1.4142) / 255) ** 1.8))
    layer = Image.new("RGBA", (size, size), colour + (0,))
    layer.putalpha(mask)
    return layer


def main() -> None:
    name = read_const(ROOT / "src/content/site.ts", "name")
    role = read_const(ROOT / "src/content/site.ts", "role")
    headline = read_const(ROOT / "src/content/hero.ts", "headline")
    domain = read_const(ROOT / "src/content/site.ts", "domain").replace("https://", "")

    img = Image.new("RGBA", (W, H), PAPER + (255,))

    glow = radial(1100, (29, 95, 217), 170)
    img.alpha_composite(glow, (W - 620, H - 560))
    glow2 = radial(700, BLUE, 70)
    img.alpha_composite(glow2, (W - 520, -420))

    # Portrait in a blue ring, right of centre like the intro screen.
    size = 300
    cx, cy = 930, 300
    ring = Image.new("RGBA", (size + 16, size + 16), (0, 0, 0, 0))
    ImageDraw.Draw(ring).ellipse((0, 0, size + 15, size + 15), fill=SKY + (255,))
    img.alpha_composite(ring, (cx - size // 2 - 8, cy - size // 2 - 8))
    photo = Image.open(ROOT / "public/portrait.webp").convert("RGB").resize((size, size), Image.LANCZOS)
    mask = Image.new("L", (size * 4, size * 4), 0)
    ImageDraw.Draw(mask).ellipse((0, 0, size * 4 - 1, size * 4 - 1), fill=255)
    mask = mask.resize((size, size), Image.LANCZOS)
    img.paste(photo, (cx - size // 2, cy - size // 2), mask)

    # Open-to-work badge under the portrait.
    draw = ImageDraw.Draw(img)
    badge_font = font(20, bold=True)
    label = "Open to work"
    tw = draw.textlength(label, font=badge_font)
    bx0, by0 = cx - (tw + 56) / 2, cy + size // 2 - 6
    draw.rounded_rectangle((bx0, by0, bx0 + tw + 56, by0 + 44), radius=22, fill=(20, 23, 28), outline=LINE, width=2)
    draw.ellipse((bx0 + 18, by0 + 17, bx0 + 28, by0 + 27), fill=SKY)
    draw.text((bx0 + 40, by0 + 9), label, font=badge_font, fill=INK)

    # Copy.
    x = 80
    draw.rounded_rectangle((x, 92, x + 112, 128), radius=18, fill=(20, 23, 28), outline=LINE, width=2)
    draw.ellipse((x + 14, 100, x + 34, 120), fill=SKY)
    draw.text((x + 42, 98), "Hello!", font=font(20, bold=True), fill=INK)

    title_font = font(84, bold=True)
    first = name.split(" ")[0]
    draw.text((x - 4, 160), "I'm ", font=title_font, fill=INK)
    draw.text((x - 4 + draw.textlength("I'm ", font=title_font), 160), f"{first},", font=title_font, fill=SKY)
    draw.text((x - 4, 252), "QA Tech Lead", font=title_font, fill=INK)

    sub_font = font(28)
    draw.text((x, 372), "& AI Automation Engineer", font=font(28, bold=True), fill=INK)
    draw.text((x, 412), headline, font=sub_font, fill=MUTED)

    draw.line((x, 486, x + 560, 486), fill=LINE, width=2)
    small = font(22)
    draw.text((x, 506), f"{name}  ·  {role}", font=small, fill=MUTED)
    draw.text((x, 540), domain, font=small, fill=SKY)

    out = ROOT / "public/og.png"
    img.convert("RGB").save(out, optimize=True)
    print(f"wrote {out} ({out.stat().st_size} bytes)")


if __name__ == "__main__":
    main()
