import os
import zipfile
from PIL import Image, ImageDraw, ImageFont

# 10 Frame Themes
THEMES = [
    {
        "id": "classic-black",
        "name": "Classic Black",
        "bg": "#0C0C0C",
        "text": "#FFFFFF",
        "border": "#1E1E1E",
        "slot_border": "#2A2A2A",
        "bar_text": None,
        "decor": "none"
    },
    {
        "id": "classic-white",
        "name": "Classic White",
        "bg": "#FAF9F6",
        "text": "#0C0C0C",
        "border": "#E5E5E5",
        "slot_border": "#D4D4D8",
        "bar_text": None,
        "decor": "none"
    },
    {
        "id": "stars",
        "name": "Gold Stars",
        "bg": "#18171A",
        "text": "#E5C158",
        "border": "#E5C158",
        "slot_border": "#E5C158",
        "bar_text": None,
        "decor": "stars"
    },
    {
        "id": "doodle",
        "name": "Doodle Hearts",
        "bg": "#2D282A",
        "text": "#E11D48",
        "border": "#E11D48",
        "slot_border": "#E11D48",
        "bar_text": None,
        "decor": "doodle"
    },
    {
        "id": "cutout",
        "name": "Cutout Hearts",
        "bg": "#FCE7ED",
        "text": "#9F1239",
        "border": "#BE123C",
        "slot_border": "#E11D48",
        "bar_text": None,
        "decor": "cutout"
    },
    {
        "id": "hearts",
        "name": "Hearts & Ribbons",
        "bg": "#383335",
        "text": "#FDA4AF",
        "border": "#FB7185",
        "slot_border": "#FDA4AF",
        "bar_text": None,
        "decor": "hearts"
    },
    {
        "id": "valentine",
        "name": "Happy Valentine",
        "bg": "#FBCFE8",
        "text": "#831843",
        "border": "#F472B6",
        "slot_border": "#9D174D",
        "bar_text": "HAPPY VALENTINE'S DAY",
        "decor": "valentine"
    },
    {
        "id": "be-valentine",
        "name": "Be My Valentine",
        "bg": "#FCE7F3",
        "text": "#9D174D",
        "border": "#F472B6",
        "slot_border": "#BE185D",
        "bar_text": "BE MY VALENTINE? \u2665",
        "decor": "be-valentine"
    },
    {
        "id": "birthday",
        "name": "Happy Birthday",
        "bg": "#E5DFD5",
        "text": "#44403C",
        "border": "#A8A29E",
        "slot_border": "#78716C",
        "bar_text": "HAPPY BIRTHDAY",
        "decor": "birthday"
    },
    {
        "id": "brand",
        "name": "Poseclub Signature",
        "bg": "#D6D3D1",
        "text": "#1C1917",
        "border": "#78716C",
        "slot_border": "#44403C",
        "bar_text": "POSECLUB STUDIO",
        "decor": "brand"
    }
]

# 6 Layout Styles
STYLES = [
    {"id": 1, "slug": "style-1-polaroid", "name": "Style 1: 1 Photo Polaroid", "w": 1200, "h": 1500, "rows": 1, "cols": 1, "slots": 1},
    {"id": 2, "slug": "style-2-strip-1x2", "name": "Style 2: 2 Photos Strip (1x2)", "w": 1200, "h": 3600, "rows": 2, "cols": 1, "slots": 2},
    {"id": 3, "slug": "style-3-grid-2x2", "name": "Style 3: 4 Photos Grid (2x2)", "w": 1800, "h": 2400, "rows": 2, "cols": 2, "slots": 4},
    {"id": 4, "slug": "style-4-classic-1x4", "name": "Style 4: 4 Photos Classic (1x4)", "w": 1200, "h": 3600, "rows": 4, "cols": 1, "slots": 4},
    {"id": 5, "slug": "style-5-grid-2x3", "name": "Style 5: 6 Photos Grid (2x3)", "w": 1800, "h": 2400, "rows": 3, "cols": 2, "slots": 6},
    {"id": 6, "slug": "style-6-collage-3x3", "name": "Style 6: 9 Photos Collage (3x3)", "w": 1800, "h": 2400, "rows": 3, "cols": 3, "slots": 9},
]

def hex_to_rgb(hex_str, alpha=255):
    hex_str = hex_str.lstrip('#')
    return (int(hex_str[0:2], 16), int(hex_str[2:4], 16), int(hex_str[4:6], 16), alpha)

def get_fonts(scale=1.0):
    try:
        font_serif = ImageFont.truetype('C:/Windows/Fonts/georgia.ttf', int(52 * scale))
        font_sans = ImageFont.truetype('C:/Windows/Fonts/arial.ttf', int(24 * scale))
        font_bar = ImageFont.truetype('C:/Windows/Fonts/arial.ttf', int(32 * scale))
        font_symbol = ImageFont.truetype('C:/Windows/Fonts/seguiemj.ttf', int(48 * scale))
    except Exception:
        font_serif = font_sans = font_bar = font_symbol = ImageFont.load_default()
    return font_serif, font_sans, font_bar, font_symbol

def render_frame(style, theme):
    W, H = style["w"], style["h"]
    scale = W / 1200.0

    # Base Canvas with Theme Background
    img = Image.new("RGBA", (W, H), hex_to_rgb(theme["bg"]))
    draw = ImageDraw.Draw(img)

    # Outer border
    draw.rectangle([(8, 8), (W - 9, H - 9)], outline=hex_to_rgb(theme["border"]), width=int(6 * scale))

    font_serif, font_sans, font_bar, font_symbol = get_fonts(scale)

    # Compute Slots Geometry
    cols = style["cols"]
    rows = style["rows"]

    if style["id"] == 1:
        # Polaroid
        pad_x = int(100 * scale)
        pad_top = int(100 * scale)
        bottom_h = int(380 * scale)
        slot_w = W - pad_x * 2
        slot_h = slot_w
        slots_coords = [(pad_x, pad_top, pad_x + slot_w, pad_top + slot_h)]
    elif style["id"] in [2, 4]:
        # Vertical strip
        pad_x = int(80 * scale)
        pad_top = int(90 * scale)
        bottom_h = int(420 * scale)
        gap = int(45 * scale)
        available_h = H - pad_top - bottom_h - gap * (rows - 1)
        slot_h = available_h / rows
        slot_w = W - pad_x * 2
        slots_coords = []
        for r in range(rows):
            sy = pad_top + r * (slot_h + gap)
            slots_coords.append((pad_x, int(sy), pad_x + slot_w, int(sy + slot_h)))
    else:
        # Grids 2x2, 2x3, 3x3
        pad_x = int(90 * scale)
        pad_top = int(90 * scale)
        bottom_h = int(360 * scale)
        gap_x = int(45 * scale)
        gap_y = int(45 * scale)
        available_w = W - pad_x * 2 - gap_x * (cols - 1)
        available_h = H - pad_top - bottom_h - gap_y * (rows - 1)
        slot_w = available_w / cols
        slot_h = available_h / rows
        slots_coords = []
        for r in range(rows):
            for c in range(cols):
                sx = pad_x + c * (slot_w + gap_x)
                sy = pad_top + r * (slot_h + gap_y)
                slots_coords.append((int(sx), int(sy), int(sx + slot_w), int(sy + slot_h)))

    # Draw Theme Banner / Header if present
    if theme["bar_text"]:
        draw.text(
            (W // 2, int(45 * scale)),
            theme["bar_text"],
            font=font_bar,
            fill=hex_to_rgb(theme["text"]),
            anchor="mm"
        )

    # Cutout each slot (Transparent with slot border)
    radius = int(30 * scale) if theme["id"] == "cutout" else 0
    for idx, (x1, y1, x2, y2) in enumerate(slots_coords):
        # Transparent cutout
        if radius > 0:
            draw.rounded_rectangle([(x1, y1), (x2, y2)], radius=radius, fill=(0, 0, 0, 0), outline=hex_to_rgb(theme["slot_border"]), width=int(5 * scale))
        else:
            draw.rectangle([(x1, y1), (x2, y2)], fill=(0, 0, 0, 0), outline=hex_to_rgb(theme["slot_border"]), width=int(5 * scale))

        # Small slot label in corner
        slot_label = f"0{idx + 1}"
        draw.text((x2 - int(25 * scale), y2 - int(25 * scale)), slot_label, font=font_sans, fill=hex_to_rgb(theme["text"], 120), anchor="rb")

    # Draw Footer & Watermark
    footer_y = H - bottom_h
    brand_text = theme["bar_text"] if theme["bar_text"] else "POSECLUB STUDIO"
    draw.text((W // 2, footer_y + int(120 * scale)), brand_text, font=font_serif, fill=hex_to_rgb(theme["text"]), anchor="mm")

    # Subtle separator line
    line_w = int(220 * scale)
    draw.line(
        [(W // 2 - line_w, footer_y + int(175 * scale)), (W // 2 + line_w, footer_y + int(175 * scale))],
        fill=hex_to_rgb(theme["text"], 60),
        width=int(2 * scale)
    )

    # Subtitle
    sub_text = "FULLERTON, CA  \u2022  ORIGINAL PHOTO ARCHIVE"
    draw.text((W // 2, footer_y + int(225 * scale)), sub_text, font=font_sans, fill=hex_to_rgb(theme["text"], 180), anchor="mm")

    # Theme Decors
    if theme["decor"] == "stars":
        draw.text((int(50 * scale), int(60 * scale)), "\u2726 \u2726", font=font_symbol, fill=hex_to_rgb(theme["text"]), anchor="lt")
        draw.text((W - int(50 * scale), int(60 * scale)), "\u2726", font=font_symbol, fill=hex_to_rgb(theme["text"]), anchor="rt")
        draw.text((int(50 * scale), footer_y + int(40 * scale)), "\u2726", font=font_symbol, fill=hex_to_rgb(theme["text"]), anchor="lb")
        draw.text((W - int(50 * scale), footer_y + int(40 * scale)), "\u2726 \u2726", font=font_symbol, fill=hex_to_rgb(theme["text"]), anchor="rb")
    elif theme["decor"] == "doodle":
        draw.text((W // 2, int(45 * scale)), "\u2665 \u2665 \u2665", font=font_symbol, fill=hex_to_rgb(theme["text"]), anchor="mm")
    elif theme["decor"] == "hearts":
        draw.text((int(45 * scale), int(55 * scale)), "\u2665", font=font_symbol, fill=hex_to_rgb(theme["text"]), anchor="lt")
        draw.text((W - int(45 * scale), int(55 * scale)), "\u2665", font=font_symbol, fill=hex_to_rgb(theme["text"]), anchor="rt")

    return img

def main():
    base_out = "exported-frames"
    public_out = "public/exported-frames"
    os.makedirs(base_out, exist_ok=True)
    os.makedirs(public_out, exist_ok=True)

    generated_files = []

    print(f"Starting export for {len(STYLES)} Styles x {len(THEMES)} Themes = {len(STYLES) * len(THEMES)} Frames...")

    for style in STYLES:
        style_dir = os.path.join(base_out, style["slug"])
        public_style_dir = os.path.join(public_out, style["slug"])
        os.makedirs(style_dir, exist_ok=True)
        os.makedirs(public_style_dir, exist_ok=True)

        for theme in THEMES:
            filename = f"{theme['id']}.png"
            path1 = os.path.join(style_dir, filename)
            path2 = os.path.join(public_style_dir, filename)

            frame_img = render_frame(style, theme)
            frame_img.save(path1, "PNG")
            frame_img.save(path2, "PNG")

            generated_files.append((style, theme, path1, path2))
            print(f"  [OK] {style['slug']} / {filename} ({style['w']}x{style['h']})")

    # Create ZIP Archive of all 60 frames
    zip_path = os.path.join(public_out, "poseclub-all-60-frames.zip")
    with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zipf:
        for style, theme, p1, p2 in generated_files:
            arcname = f"{style['slug']}/{theme['id']}.png"
            zipf.write(p1, arcname)

    print(f"\nCreated ZIP archive: {zip_path} ({os.path.getsize(zip_path) // 1024} KB)")

    # Generate Interactive HTML Catalog
    html_content = generate_html_catalog(STYLES, THEMES)
    html_path = os.path.join(public_out, "index.html")
    with open(html_path, "w", encoding="utf-8") as f:
        f.write(html_content)

    print(f"Created HTML Catalog: {html_path}")
    print("Done! All 60 frames exported successfully.")

def generate_html_catalog(styles, themes):
    cards_html = ""
    for style in styles:
        for theme in themes:
            img_rel = f"{style['slug']}/{theme['id']}.png"
            cards_html += f"""
            <div class="card" data-style="{style['id']}" data-theme="{theme['id']}">
                <div class="card-preview" style="background-color: {theme['bg']};">
                    <img src="{img_rel}" alt="{style['name']} - {theme['name']}" loading="lazy" />
                </div>
                <div class="card-info">
                    <h4>{theme['name']}</h4>
                    <p>{style['name']}</p>
                    <span class="dim">{style['w']} &times; {style['h']} px &bull; 300 DPI</span>
                    <a href="{img_rel}" download="{style['slug']}-{theme['id']}.png" class="dl-btn">&#x2913; Tải ảnh PNG</a>
                </div>
            </div>
            """

    return f"""<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Poseclub Studio &mdash; Catalog 60 Khung &Aacute;nh (All Styles &amp; Themes)</title>
    <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;1,400&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
    <style>
        * {{ box-sizing: border-box; margin: 0; padding: 0; }}
        body {{
            font-family: 'Inter', system-ui, sans-serif;
            background-color: #FAF8F5;
            color: #0C0C0C;
            padding: 32px 20px 80px 20px;
        }}
        .header {{
            max-width: 1200px;
            margin: 0 auto 32px auto;
            text-align: center;
        }}
        .header h1 {{
            font-family: 'Playfair Display', serif;
            font-size: 38px;
            font-weight: 600;
            margin-bottom: 8px;
        }}
        .header p {{
            color: #666;
            font-size: 14px;
            margin-bottom: 20px;
        }}
        .zip-bar {{
            display: inline-flex;
            align-items: center;
            gap: 12px;
            background: #0C0C0C;
            color: #FFF;
            padding: 12px 28px;
            border-radius: 999px;
            text-decoration: none;
            font-size: 13px;
            font-weight: 600;
            letter-spacing: 0.05em;
            text-transform: uppercase;
            box-shadow: 0 10px 25px rgba(0,0,0,0.15);
            transition: transform 0.2s, background 0.2s;
        }}
        .zip-bar:hover {{
            background: #333;
            transform: translateY(-2px);
        }}
        .filters {{
            max-width: 1200px;
            margin: 28px auto;
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            justify-content: center;
        }}
        .filter-btn {{
            border: 1px solid rgba(0,0,0,0.15);
            background: #FFF;
            color: #333;
            padding: 8px 16px;
            border-radius: 999px;
            font-size: 12px;
            cursor: pointer;
            transition: all 0.2s;
        }}
        .filter-btn.active, .filter-btn:hover {{
            background: #0C0C0C;
            color: #FFF;
            border-color: #0C0C0C;
        }}
        .grid {{
            max-width: 1400px;
            margin: 0 auto;
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
            gap: 24px;
        }}
        .card {{
            background: #FFF;
            border: 1px solid rgba(0,0,0,0.1);
            border-radius: 16px;
            padding: 16px;
            display: flex;
            flex-col;
            flex-direction: column;
            box-shadow: 0 4px 15px rgba(0,0,0,0.04);
            transition: transform 0.2s, box-shadow 0.2s;
        }}
        .card:hover {{
            transform: translateY(-4px);
            box-shadow: 0 12px 30px rgba(0,0,0,0.08);
        }}
        .card-preview {{
            width: 100%;
            height: 340px;
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
            border: 1px solid rgba(0,0,0,0.08);
            margin-bottom: 14px;
            position: relative;
        }}
        .card-preview img {{
            max-width: 90%;
            max-height: 90%;
            object-fit: contain;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        }}
        .card-info h4 {{
            font-size: 15px;
            font-weight: 600;
            margin-bottom: 4px;
        }}
        .card-info p {{
            font-size: 12px;
            color: #666;
            margin-bottom: 6px;
        }}
        .card-info .dim {{
            display: block;
            font-size: 10px;
            color: #999;
            font-family: monospace;
            margin-bottom: 12px;
        }}
        .dl-btn {{
            display: inline-block;
            text-align: center;
            width: 100%;
            padding: 9px;
            background: #FAF8F5;
            border: 1px solid rgba(0,0,0,0.15);
            border-radius: 8px;
            color: #0C0C0C;
            text-decoration: none;
            font-size: 12px;
            font-weight: 500;
            transition: all 0.2s;
        }}
        .dl-btn:hover {{
            background: #0C0C0C;
            color: #FFF;
        }}
    </style>
</head>
<body>
    <div class="header">
        <h1>Bộ Khung Ảnh Poseclub Studio</h1>
        <p>Tất cả 60 khung &aacute;nh xuất chuẩn độ ph&acirc;n giải cao 300 DPI &bull; 6 Styles &times; 10 Themes &bull; &Ocirc; ảnh trong suốt (Alpha Cutout)</p>
        <a href="poseclub-all-60-frames.zip" download class="zip-bar">&#x2913; Tải Trọn Bộ 60 Khung (.ZIP)</a>
    </div>

    <div class="filters" id="style-filters">
        <button class="filter-btn active" data-style-filter="all">Tất cả Style (6)</button>
        <button class="filter-btn" data-style-filter="1">Style 1: Polaroid</button>
        <button class="filter-btn" data-style-filter="2">Style 2: Strip 1x2</button>
        <button class="filter-btn" data-style-filter="3">Style 3: Grid 2x2</button>
        <button class="filter-btn" data-style-filter="4">Style 4: Classic 1x4</button>
        <button class="filter-btn" data-style-filter="5">Style 5: Grid 2x3</button>
        <button class="filter-btn" data-style-filter="6">Style 6: Collage 3x3</button>
    </div>

    <div class="grid" id="cards-container">
        {cards_html}
    </div>

    <script>
        const buttons = document.querySelectorAll('#style-filters .filter-btn');
        const cards = document.querySelectorAll('.card');

        buttons.forEach(btn => {{
            btn.addEventListener('click', () => {{
                buttons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const filter = btn.getAttribute('data-style-filter');
                cards.forEach(card => {{
                    if (filter === 'all' || card.getAttribute('data-style') === filter) {{
                        card.style.display = 'flex';
                    }} else {{
                        card.style.display = 'none';
                    }}
                }});
            }});
        }});
    </script>
</body>
</html>
"""

if __name__ == "__main__":
    main()
