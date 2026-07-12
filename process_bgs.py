import os
import glob
from PIL import Image

src_dir = "/home/arun/.gemini/antigravity-ide/brain/e92e9200-3374-4265-b882-e30d940e3f3c"
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
    pattern = os.path.join(src_dir, f"{name}_*.png")
    matches = glob.glob(pattern)
    if matches:
        latest = sorted(matches)[-1] # get the latest if multiple
        img = Image.open(latest).convert("RGB")
        out_path = os.path.join(dst_dir, f"{name}.webp")
        img.save(out_path, "webp", quality=80)
        print(f"Saved {out_path}")
    else:
        print(f"Missing {name}")
