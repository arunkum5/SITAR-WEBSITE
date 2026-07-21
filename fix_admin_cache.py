import sys

with open("admin.html", "r") as f:
    html = f.read()

html = html.replace('<script src="admin.js"></script>', '<script src="admin.js?v=3"></script>')

with open("admin.html", "w") as f:
    f.write(html)

print("Busted admin cache.")
