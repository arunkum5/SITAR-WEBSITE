import sys

with open("admin.js", "r") as f:
    code = f.read()

# I will add a function at the very top (after DOMContentLoaded)
# Then call it inside renderInvestments, renderLeads, etc.

metrics_code = """
  // Dashboard Metrics Update
  function updateDashboardMetrics() {
    // Total Capital Invested (Sum of Active/Approved investments)
    if (typeof globalInvestments !== 'undefined') {
      const activeInvestments = globalInvestments.filter(i => i.status === 'Active' || i.status === 'Approved');
      const totalCapital = activeInvestments.reduce((sum, i) => sum + parseFloat(i.invested_amount || 0), 0);
      const metricCapital = document.getElementById('metric-capital');
      if (metricCapital) metricCapital.textContent = '₹ ' + Math.round(totalCapital).toLocaleString('en-IN');
      
      // Total Active Investors (Unique accounts with active investments)
      const uniqueInvestors = new Set(activeInvestments.map(i => i.account_id));
      const metricInvestors = document.getElementById('metric-investors');
      if (metricInvestors) metricInvestors.textContent = uniqueInvestors.size;
    }
    
    // Hot Calculator Leads
    if (typeof globalLeads !== 'undefined') {
      const metricLeads = document.getElementById('metric-leads');
      if (metricLeads) metricLeads.textContent = globalLeads.length;
    }
  }
"""

# Insert metrics_code right after DOMContentLoaded
code = code.replace("document.addEventListener('DOMContentLoaded', () => {", "document.addEventListener('DOMContentLoaded', () => {\n" + metrics_code)

# Add updateDashboardMetrics() at the end of renderInvestments
code = code.replace("  function renderInvestments(data) {", "  function renderInvestments(data) {")
code = code.replace("invTbody.appendChild(tr);\n    });\n  }", "invTbody.appendChild(tr);\n    });\n    updateDashboardMetrics();\n  }")

# Add updateDashboardMetrics() at the end of renderLeads
code = code.replace("leadsTbody.appendChild(tr);\n    });\n  }", "leadsTbody.appendChild(tr);\n    });\n    updateDashboardMetrics();\n  }")

# Handle empty state for renderInvestments
code = code.replace("invTbody.innerHTML = '<tr><td colspan=\"8\" style=\"text-align: center; color: #64748b;\">No investments found.</td></tr>';\n        return;", "invTbody.innerHTML = '<tr><td colspan=\"8\" style=\"text-align: center; color: #64748b;\">No investments found.</td></tr>';\n        updateDashboardMetrics();\n        return;")

# Handle empty state for renderLeads
code = code.replace("leadsTbody.innerHTML = '<tr><td colspan=\"8\" style=\"text-align: center; color: #64748b;\">No leads found.</td></tr>';\n      return;", "leadsTbody.innerHTML = '<tr><td colspan=\"8\" style=\"text-align: center; color: #64748b;\">No leads found.</td></tr>';\n      updateDashboardMetrics();\n      return;")


with open("admin.js", "w") as f:
    f.write(code)
print("Updated admin.js with metrics.")
