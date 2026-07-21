import sys

with open("admin.js", "r") as f:
    js = f.read()

# Fix 1: Reload page on Clean DB
old_clean = """        if (result.success) {
          alert("Database cleaned successfully.");
          fetchLeads(); // Refresh table
        }"""
new_clean = """        if (result.success) {
          alert("Database cleaned successfully.");
          window.location.reload(); // Refresh the entire page to reset all data
        }"""
js = js.replace(old_clean, new_clean)

# Fix 2: Refresh data on Tab Switch
# Tab switching logic is around line 150
old_tabs = """  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));

      btn.classList.add('active');
      document.getElementById(btn.dataset.tab).classList.add('active');
    });
  });"""

new_tabs = """  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));

      btn.classList.add('active');
      const targetTab = btn.dataset.tab;
      document.getElementById(targetTab).classList.add('active');
      
      // Refresh data dynamically based on the tab clicked
      if (targetTab === 'tab-leads') fetchLeads();
      if (targetTab === 'tab-investments') fetchInvestments();
      if (targetTab === 'tab-investors') fetchInvestors();
      if (targetTab === 'tab-users') fetchUsers();
      if (targetTab === 'tab-rates') fetchRates();
    });
  });"""

js = js.replace(old_tabs, new_tabs)

with open("admin.js", "w") as f:
    f.write(js)

print("Added page reload and tab refresh.")
