import sys

# 1. Update getInvestors.js
with open("functions/api/admin/getInvestors.js", "r") as f:
    code = f.read()

code = code.replace("select=*&order=folio_number.desc", "select=*,transactions(invested_amount,status)&order=folio_number.desc")

with open("functions/api/admin/getInvestors.js", "w") as f:
    f.write(code)

# 2. Update admin.js to use the new data and fix globalInvestments
with open("admin.js", "r") as f:
    admin_code = f.read()

# Add globalInvestments declaration if not present
if "let globalInvestments =" not in admin_code:
    admin_code = admin_code.replace("let globalLeads = [];", "let globalInvestments = [];\n  let globalLeads = [];")

# Set globalInvestments in fetchInvestments
admin_code = admin_code.replace("const data = await response.json();\n\n      if (data.error)", "const data = await response.json();\n      globalInvestments = data;\n\n      if (data.error)")

# Fix the render of Investors
old_inv_render = """          <td>-</td>
          <td>-</td>"""

new_inv_render = """          <td>${activeCount}</td>
          <td>₹ ${Math.round(totalVal).toLocaleString('en-IN')}</td>"""

admin_code = admin_code.replace(old_inv_render, new_inv_render)

# Add activeCount and totalVal calculation
old_inv_loop = """      data.forEach(inv => {
        const tr = document.createElement('tr');"""

new_inv_loop = """      data.forEach(inv => {
        let activeCount = 0;
        let totalVal = 0;
        if (inv.transactions && inv.transactions.length > 0) {
            const activeTxs = inv.transactions.filter(t => t.status === 'Active' || t.status === 'Approved');
            activeCount = activeTxs.length;
            totalVal = activeTxs.reduce((sum, t) => sum + parseFloat(t.invested_amount || 0), 0);
        }
        
        const tr = document.createElement('tr');"""

admin_code = admin_code.replace(old_inv_loop, new_inv_loop)

with open("admin.js", "w") as f:
    f.write(admin_code)

print("Updated getInvestors and admin.js successfully.")
