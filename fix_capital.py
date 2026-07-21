import sys

# Fix admin.js missing globalInvestments assignment
with open("admin.js", "r") as f:
    js = f.read()

old_code = """      const data = await response.json();
      
      if (data.error) {
        globalInvestments = [];"""

new_code = """      const data = await response.json();
      
      if (data.error) {
        globalInvestments = [];"""

# Actually, let's just insert globalInvestments = data; AFTER the error check block!
js = js.replace("      invTbody.innerHTML = '';\n      if (data.length === 0)", "      globalInvestments = data;\n      invTbody.innerHTML = '';\n      if (data.length === 0)")

with open("admin.js", "w") as f:
    f.write(js)


# Fix CSS in admin.html for the change text
with open("admin.html", "r") as f:
    html = f.read()

old_css = ".metric-card .change { font-size: 10px; color: #64748b; font-weight: 500; }"
new_css = ".metric-card .change { font-size: 13px; color: #64748b; font-weight: 600; }"
html = html.replace(old_css, new_css)

with open("admin.html", "w") as f:
    f.write(html)

print("Fixed capital metric and increased font size.")
