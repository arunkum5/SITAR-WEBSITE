import sys

with open("admin.js", "r") as f:
    js = f.read()

old_listener = """  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Remove active from all
      tabBtns.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));

      // Add active to clicked
      btn.classList.add('active');
      const targetId = btn.getAttribute('data-tab');
      document.getElementById(targetId).classList.add('active');
    });
  });"""

new_listener = """  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Remove active from all
      tabBtns.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));

      // Add active to clicked
      btn.classList.add('active');
      const targetId = btn.getAttribute('data-tab');
      document.getElementById(targetId).classList.add('active');
      
      // Auto-refresh the tab's data dynamically!
      if (targetId === 'tab-leads') fetchLeads();
      if (targetId === 'tab-investments') fetchInvestments();
      if (targetId === 'tab-investors') fetchInvestors();
      if (targetId === 'tab-users') fetchUsers();
      if (targetId === 'tab-rates') fetchRates();
    });
  });"""

if old_listener in js:
    js = js.replace(old_listener, new_listener)
    with open("admin.js", "w") as f:
        f.write(js)
    print("Fixed tab listener!")
else:
    print("Could not find the listener to replace.")

