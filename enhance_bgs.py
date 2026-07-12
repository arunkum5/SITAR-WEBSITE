import os
import glob
from PIL import Image, ImageEnhance, ImageOps

dst_dir = "/home/arun/SITAR-NEW"
names = [
    "bg_property_loan",
    "bg_construction_loan",
    "bg_gold_loan",
    "bg_personal_loan",
    "bg_business_loan",
    "bg_talk_loan"
]

for name in names:
    path = os.path.join(dst_dir, f"{name}.webp")
    if os.path.exists(path):
        img = Image.open(path).convert("RGB")
        
        # Increase contrast heavily
        enhancer = ImageEnhance.Contrast(img)
        img = enhancer.enhance(3.0) 
        
        # Darken overall so the lines are more visible
        enhancer = ImageEnhance.Brightness(img)
        img = enhancer.enhance(0.85)
        
        img.save(path, "webp", quality=90)
        print(f"Enhanced {path}")
    else:
        print(f"Missing {path}")
