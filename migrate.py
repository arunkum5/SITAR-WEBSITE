import re

with open('index-backup.html', 'r', encoding='utf-8') as f:
    backup_html = f.read()

with open('index.html', 'r', encoding='utf-8') as f:
    new_html = f.read()

# 1. Extract Modal CSS
css_match = re.search(r'(\.animate-spin \{.*?\.modal-close:hover \{.*?\n    \})', backup_html, re.DOTALL)
if css_match:
    modal_css = "\n    /* --- Modal CSS --- */\n    " + css_match.group(1).strip() + "\n"
    new_html = new_html.replace('</style>', modal_css + '</style>')

# 2. Extract CDN Links
cdn_links = """
  <!-- External Dependencies -->
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.31/jspdf.plugin.autotable.min.js"></script>
"""
new_html = new_html.replace('</head>', cdn_links + '</head>')

# 3. Extract Modals HTML and Scripts
modals_and_scripts_start = backup_html.find('<!-- Auth Modal -->')
modals_and_scripts = backup_html[modals_and_scripts_start:backup_html.find('</html>')]

# Clean up modals_and_scripts by removing </body> tag from it, we'll place it right before </body> in new_html
modals_and_scripts = modals_and_scripts.replace('</body>', '')

new_html = new_html.replace('</body>', modals_and_scripts + '\n</body>')

# 4. Update Navigation
# Replace Get Started button
get_started_re = r'<a href="#login"[^>]*>Get Started</a>|<a href="page-1.html"[^>]*>Get Started</a>'
new_html = re.sub(get_started_re, '<a href="#login" id="nav-login-btn">Login / Signup</a>\n      <a href="#profile" id="nav-profile-btn" class="nav-profile-trigger" style="display: none; align-items: center; justify-content: center; width: 40px; height: 40px; background: var(--ink); border-radius: 50%; color: var(--bg); font-weight: 700; font-size: 16px; margin-left: 12px; text-decoration: none;">U</a>', new_html)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(new_html)

print("Migration completed successfully.")
