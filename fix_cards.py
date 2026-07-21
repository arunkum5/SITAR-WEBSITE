import sys

# 1. Update HTML
with open("admin.html", "r") as f:
    html = f.read()

old_css = """    .metric-card .title { font-size: 11px; color: var(--cream-dim); text-transform: uppercase; letter-spacing: 1px; font-weight: 600; }
    .metric-card .value { font-family: 'IBM Plex Mono', monospace; font-size: 24px; color: var(--cream); font-weight: 500; }
    .metric-card .change { font-size: 11px; color: #16a34a; font-weight: 500; }"""

new_css = """    .metric-card .title { font-size: 10px; color: var(--cream-dim); text-transform: uppercase; letter-spacing: 1px; font-weight: 600; }
    .metric-card .value { font-family: 'IBM Plex Mono', monospace; font-size: 18px; color: var(--cream); font-weight: 500; }
    .metric-row { display: flex; align-items: baseline; justify-content: space-between; gap: 8px; margin-top: 4px; }
    .metric-card .change { font-size: 10px; color: #64748b; font-weight: 500; }"""
html = html.replace(old_css, new_css)

html = html.replace("grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));", "grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));")

old_cards = """    <div class="metrics-grid">
      <div class="metric-card">
        <span class="title">Total Active Investors</span>
        <span class="value" id="metric-investors">0</span>
        <span class="change">+12% this month</span>
      </div>
      <div class="metric-card">
        <span class="title">Total Capital Invested</span>
        <span class="value" id="metric-capital">₹ 0</span>
        <span class="change">+8% this month</span>
      </div>
      <div class="metric-card">
        <span class="title">Hot Calculator Leads</span>
        <span class="value" id="metric-leads">0</span>
        <span class="change warning">Require follow-up</span>
      </div>
    </div>"""

new_cards = """    <div class="metrics-grid">
      <div class="metric-card">
        <span class="title">Registered Users</span>
        <div class="metric-row">
          <span class="value" id="metric-users">0</span>
          <span class="change">Total signups</span>
        </div>
      </div>
      <div class="metric-card">
        <span class="title">Verified Investors</span>
        <div class="metric-row">
          <span class="value" id="metric-verified">0</span>
          <span class="change" id="metric-verified-context">0 inv / 0 non</span>
        </div>
      </div>
      <div class="metric-card">
        <span class="title">Active Plans</span>
        <div class="metric-row">
          <span class="value" id="metric-investors">0</span>
          <span class="change" style="color: #16a34a">+12% mo</span>
        </div>
      </div>
      <div class="metric-card">
        <span class="title">Total Capital</span>
        <div class="metric-row">
          <span class="value" id="metric-capital">₹ 0</span>
          <span class="change" style="color: #16a34a">+8% mo</span>
        </div>
      </div>
      <div class="metric-card">
        <span class="title">Calc Leads</span>
        <div class="metric-row">
          <span class="value" id="metric-leads">0</span>
          <span class="change warning">Pending calls</span>
        </div>
      </div>
    </div>"""

html = html.replace(old_cards, new_cards)

with open("admin.html", "w") as f:
    f.write(html)

# 2. Update JS
with open("admin.js", "r") as f:
    js = f.read()

# I will update updateDashboardMetrics
old_metrics = """  // Dashboard Metrics Update
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
  }"""

new_metrics = """  // Dashboard Metrics Update
  let globalUsersCount = 0;
  let globalVerifiedCount = 0;
  let globalInvestedVerifiedCount = 0;
  
  function updateDashboardMetrics() {
    // Registered Users
    const mUsers = document.getElementById('metric-users');
    if (mUsers) mUsers.textContent = globalUsersCount;

    let activeInvestments = [];
    if (typeof globalInvestments !== 'undefined') {
      activeInvestments = globalInvestments.filter(i => i.status === 'Active' || i.status === 'Approved');
      const totalCapital = activeInvestments.reduce((sum, i) => sum + parseFloat(i.invested_amount || 0), 0);
      const metricCapital = document.getElementById('metric-capital');
      if (metricCapital) metricCapital.textContent = '₹ ' + Math.round(totalCapital).toLocaleString('en-IN');
      
      const uniqueInvestors = new Set(activeInvestments.map(i => i.account_id));
      const metricInvestors = document.getElementById('metric-investors');
      if (metricInvestors) metricInvestors.textContent = activeInvestments.length;
      
      // Update Verified Investor context
      const metricVerified = document.getElementById('metric-verified');
      if (metricVerified) metricVerified.textContent = globalVerifiedCount;
      const mContext = document.getElementById('metric-verified-context');
      if (mContext) mContext.textContent = `${globalInvestedVerifiedCount} inv / ${globalVerifiedCount - globalInvestedVerifiedCount} non`;
    }
    
    if (typeof globalLeads !== 'undefined') {
      const metricLeads = document.getElementById('metric-leads');
      if (metricLeads) metricLeads.textContent = globalLeads.length;
    }
  }"""

js = js.replace(old_metrics, new_metrics)

# Hook into fetchUsers
js = js.replace("usersBody.appendChild(tr);\n      });\n    } catch", "usersBody.appendChild(tr);\n      });\n      globalUsersCount = data.length;\n      updateDashboardMetrics();\n    } catch")
js = js.replace("No users found.</td></tr>';\n        return;", "No users found.</td></tr>';\n        globalUsersCount = 0;\n        updateDashboardMetrics();\n        return;")

# Hook into fetchInvestors
old_inv_loop = """      data.forEach(inv => {
        let activeCount = 0;"""

new_inv_loop = """      globalVerifiedCount = data.length;
      globalInvestedVerifiedCount = 0;
      data.forEach(inv => {
        let activeCount = 0;"""

js = js.replace(old_inv_loop, new_inv_loop)

old_inv_render2 = """          <td>${activeCount}</td>
          <td>₹ ${Math.round(totalVal).toLocaleString('en-IN')}</td>
        `;
        invBody.appendChild(tr);
      });"""

new_inv_render2 = """          <td>${activeCount}</td>
          <td>₹ ${Math.round(totalVal).toLocaleString('en-IN')}</td>
        `;
        if (activeCount > 0) globalInvestedVerifiedCount++;
        invBody.appendChild(tr);
      });
      updateDashboardMetrics();"""
      
js = js.replace(old_inv_render2, new_inv_render2)

js = js.replace("No investors found.</td></tr>';\n        return;", "No investors found.</td></tr>';\n        globalVerifiedCount = 0;\n        updateDashboardMetrics();\n        return;")


with open("admin.js", "w") as f:
    f.write(js)

print("Updated cards.")
