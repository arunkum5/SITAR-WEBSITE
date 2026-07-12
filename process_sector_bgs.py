import os
import glob
from PIL import Image, ImageEnhance

src_dir = "/home/arun/.gemini/antigravity-ide/brain/e92e9200-3374-4265-b882-e30d940e3f3c"
dst_dir = "/home/arun/SITAR-NEW"
names = [
    "bg_sector_villas",
    "bg_sector_apartments",
    "bg_sector_resorts",
    "bg_sector_commercial",
    "bg_sector_layouts"
]

for name in names:
    pattern = os.path.join(src_dir, f"{name}_*.png")
    matches = glob.glob(pattern)
    if matches:
        latest = sorted(matches)[-1]
        img = Image.open(latest).convert("RGB")
        
        # Increase contrast heavily
        enhancer = ImageEnhance.Contrast(img)
        img = enhancer.enhance(3.0) 
        
        # Darken overall so the lines are more visible
        enhancer = ImageEnhance.Brightness(img)
        img = enhancer.enhance(0.85)
        
        out_path = os.path.join(dst_dir, f"{name}.webp")
        img.save(out_path, "webp", quality=90)
        print(f"Enhanced and saved {out_path}")
    else:
        print(f"Missing {name}")
