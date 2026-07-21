import sys

with open("admin.js", "r") as f:
    js = f.read()

# 1. Remove from bottom
js = js.replace("  let globalInvestments = [];\n  let globalLeads = [];\n", "")

# 2. Add to top
old_top = """  // Dashboard Metrics Update
  let globalUsersCount = 0;
  let globalVerifiedCount = 0;
  let globalInvestedVerifiedCount = 0;"""

new_top = """  // Global Data State
  let globalInvestments = [];
  let globalLeads = [];
  
  // Dashboard Metrics Update
  let globalUsersCount = 0;
  let globalVerifiedCount = 0;
  let globalInvestedVerifiedCount = 0;"""

js = js.replace(old_top, new_top)

with open("admin.js", "w") as f:
    f.write(js)

print("Fixed TDZ ReferenceError.")
