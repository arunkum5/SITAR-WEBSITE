import sys

with open("admin.js", "r") as f:
    js = f.read()

old_str = "`${globalInvestedVerifiedCount} inv / ${globalVerifiedCount - globalInvestedVerifiedCount} non`"
new_str = "`${globalInvestedVerifiedCount} Invested / ${globalVerifiedCount - globalInvestedVerifiedCount} Uninvested`"

js = js.replace(old_str, new_str)

with open("admin.js", "w") as f:
    f.write(js)

print("Elaborated text.")
