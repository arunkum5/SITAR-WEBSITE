import sys

with open("admin.js", "r") as f:
    code = f.read()

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

# Insert metrics_code right after DOMContentLoaded, async () => {
code = code.replace("document.addEventListener('DOMContentLoaded', async () => {", "document.addEventListener('DOMContentLoaded', async () => {\n" + metrics_code)

with open("admin.js", "w") as f:
    f.write(code)

