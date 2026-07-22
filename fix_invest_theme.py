import re

with open('invest-today.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Replace fonts link
html = re.sub(
    r'<link href="https://fonts.googleapis.com/css2\?family=Fraunces.*?" rel="stylesheet">',
    r"<link href=\"https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap\" rel=\"stylesheet\">",
    html
)

# Update root variables
old_root = r':root \{.*?\}'
new_root = """:root {
    --ink: #001122;
    --bg: #F4F1EA;
    --card: #FFFFFF;
    --muted: #666666;
    --gold: #E6C37C;
    --villas: #C1694A;
    --apartments: #6E86A6;
    --layouts: #C9A227;
    --commercial: #A370A1;
    --resorts: #3E8E85;
    
    --success: #10b981;
    --error: #ef4444;
  }"""
html = re.sub(old_root, new_root, html, flags=re.DOTALL)

# Font family replacements
html = html.replace("'Fraunces', serif", "'Inter', sans-serif")
html = html.replace("'Work Sans', sans-serif", "'Inter', sans-serif")

# Color replacements
html = html.replace("color: var(--cream)", "color: var(--ink)")
html = html.replace("color: var(--cream-dim)", "color: var(--muted)")
html = html.replace("var(--bg-panel)", "var(--card)")
html = html.replace("rgba(243,236,221,0.1)", "rgba(0,17,34,0.1)")
html = html.replace("rgba(243,236,221,0.2)", "rgba(0,17,34,0.2)")
html = html.replace("rgba(255,255,255,0.05)", "var(--card)")
html = html.replace("rgba(255,255,255,0.08)", "rgba(0,17,34,0.03)")

# Button styling adjustment (gold button to black button to match 'Invest Now')
# Originally: background: var(--gold); color: var(--ink);
# We can keep gold, or change to --ink background and white text. Let's keep gold as it's accent, or change it to ink. 
html = html.replace("background: var(--gold);\n    color: var(--ink);", "background: var(--ink);\n    color: var(--bg);")
html = html.replace("background: #d4b26c;", "background: #333333;")

# In step-2 bond cert
# background: rgba(255,255,255,0.03); -> #ffffff
html = html.replace("rgba(255,255,255,0.03)", "var(--card)")
html = html.replace("border: 1px solid rgba(255,255,255,0.1);", "border: 1px solid rgba(0,0,0,0.1);")

with open('invest-today.html', 'w', encoding='utf-8') as f:
    f.write(html)

print("Theme updated.")
