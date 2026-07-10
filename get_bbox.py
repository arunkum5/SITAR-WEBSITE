import xml.etree.ElementTree as ET
import re

tree = ET.parse('new-header-text.svg')
root = tree.getroot()

min_x, max_x = float('inf'), float('-inf')
min_y, max_y = float('inf'), float('-inf')

def extract_coords(path_d):
    coords = re.findall(r'-?\d+\.?\d*', path_d)
    return [float(c) for c in coords]

# Simplified bounding box: just looking at coordinates in paths and applying transforms
# We assume the user's transforms are simple translates/scales
# Actually it's easier to just find the current viewBox and adjust it manually.
