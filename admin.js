document.addEventListener('DOMContentLoaded', async () => {

  // Auth Check
  try {
    const res = await fetch('/api/admin/verify');
    if (res.status === 401) {
      window.location.href = '/admin-login.html';
      return;
    }
  } catch (e) {
    console.error("Auth check failed", e);
  }

  
  // 1. Tab Switching Logic
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Remove active from all
      tabBtns.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));

      // Add active to clicked
      btn.classList.add('active');
      const targetId = btn.getAttribute('data-tab');
      document.getElementById(targetId).classList.add('active');
    });
  });

  // Table CSV Download Logic
  window.downloadTableCSV = function(tbodyId, filename) {
    const tbody = document.getElementById(tbodyId);
    if (!tbody) return;
    
    // Find the corresponding thead for headers
    const table = tbody.closest('table');
    const thead = table.querySelector('thead');
    
    let csvContent = "";
    
    // Extract headers
    if (thead) {
      const headers = Array.from(thead.querySelectorAll('th')).map(th => `"${th.innerText.replace(/"/g, '""')}"`);
      csvContent += headers.join(",") + "\n";
    }
    
    // Extract rows
    const rows = Array.from(tbody.querySelectorAll('tr'));
    rows.forEach(row => {
      // Ignore placeholder loading rows
      if (row.cells.length === 1 && row.cells[0].colSpan > 1) return;
      
      const rowData = Array.from(row.querySelectorAll('td')).map(td => {
        let text = td.innerText.replace(/"/g, '""');
        // Clean up ₹ symbols or newlines if needed, but standard quotes work best
        return `"${text}"`;
      });
      csvContent += rowData.join(",") + "\n";
    });
    
    // Trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 2. Initialize Charts (Chart.js)
  Chart.defaults.color = '#64748b'; // slate 500
  Chart.defaults.font.family = "'Work Sans', sans-serif";

  // Sector Pie Chart
  const ctxSector = document.getElementById('sectorChart').getContext('2d');
  const sectorChart = new Chart(ctxSector, {
    type: 'doughnut',
    data: {
      labels: ['Villas', 'Apartments', 'Layouts', 'Commercial', 'Resorts'],
      datasets: [{
        data: [15000000, 8500000, 5000000, 3200000, 1200000],
        backgroundColor: [
          '#C1694A', // Villas
          '#6E86A6', // Apartments
          '#C9A227', // Layouts
          '#A370A1', // Commercial
          '#3E8E85'  // Resorts
        ],
        borderWidth: 0,
        hoverOffset: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'right' }
      }
    }
  });

  // Monthly Trend Bar Chart
  const ctxTrend = document.getElementById('trendChart').getContext('2d');
  const trendChart = new Chart(ctxTrend, {
    type: 'bar',
    data: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [{
        label: 'Capital Invested (₹)',
        data: [2000000, 3500000, 1500000, 5000000, 4200000, 8000000],
        backgroundColor: '#2563eb', // blue 600
        borderRadius: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: { beginAtZero: true, grid: { color: '#e2e8f0' } }, // slate 200 grid
        x: { grid: { display: false } }
      }
    }
  });

  // 3. Mock Data Rendering (To be replaced with Supabase)
  
  // Render Leads
  const leadsTbody = document.getElementById('table-leads-body');

  function renderLeads(data) {
    leadsTbody.innerHTML = '';
    if (!data || data.length === 0) {
      leadsTbody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: #64748b;">No leads found.</td></tr>';
      return;
    }
    data.forEach(lead => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${new Date(lead.created_at).toLocaleDateString() || '-'}</td>
        <td>${(lead.investors && lead.investors.folio_number) ? lead.investors.folio_number : (lead.account_id || '-')}</td>
        <td>${lead.sector || '-'}</td>
        <td>${lead.term_years || '-'}</td>
        <td>₹ ${Math.round(lead.amount || 0).toLocaleString('en-IN')}</td>
        <td style="color: #4ade80;">+ ₹ ${Math.round(lead.projected_profit || 0).toLocaleString('en-IN')}</td>
        <td><span class="status-badge status-pending">Pending</span></td>
      `;
      leadsTbody.appendChild(tr);
    });
  }

  // Fetch real data from Supabase via Cloudflare API
  let globalLeads = [];
  async function fetchLeads() {
    try {
      leadsTbody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: #64748b;">Loading data...</td></tr>';
      const response = await fetch('/api/admin/getLeads');
      if (response.status === 401) { window.location.href = '/admin-login.html'; return; }
      const data = await response.json();
      
      if (data.error) {
        console.error("Failed to fetch leads:", data.error);
        leadsTbody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: #ef4444;">Error loading data.</td></tr>';
        return;
      }
      
      globalLeads = data;
      renderLeads(data);
    } catch (err) {
      console.error(err);
      leadsTbody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: #ef4444;">Error connecting to server.</td></tr>';
    }
  }

  // Initial fetch
  fetchLeads();

  // DB Cleanup Logic
  const cleanupBtn = document.getElementById('cleanup-db-btn');
  if (cleanupBtn) {
    cleanupBtn.addEventListener('click', async () => {
      const confirmed = confirm("Are you sure you really want to cleanup? It will delete all data permanently.");
      if (!confirmed) return;

      const originalText = cleanupBtn.textContent;
      cleanupBtn.textContent = 'Cleaning...';
      cleanupBtn.disabled = true;

      try {
        const response = await fetch('/api/admin/cleanup', { method: 'POST' });
        const result = await response.json();
        
        if (result.success) {
          alert("Database cleaned successfully.");
          fetchLeads(); // Refresh table
        } else {
          alert("Failed to clean database: " + result.error);
        }
      } catch (err) {
        alert("Error connecting to server.");
      } finally {
        cleanupBtn.textContent = originalText;
        cleanupBtn.disabled = false;
      }
    });
  }

  const filterSector = document.getElementById('filter-sector');
  const filterTerm = document.getElementById('filter-term');

  function applyFilters() {
    if (!filterSector || !filterTerm) return;
    const sVal = filterSector.value.toLowerCase();
    const tVal = filterTerm.value.toLowerCase();

    const filtered = globalLeads.filter(lead => {
      const matchSector = sVal === 'all' || (lead.sector && lead.sector.toLowerCase() === sVal);
      const matchTerm = tVal === 'all' || (lead.term_years && lead.term_years.toString() === tVal);
      return matchSector && matchTerm;
    });
    
    renderLeads(filtered);
  }

  if (filterSector) filterSector.addEventListener('change', applyFilters);
  if (filterTerm) filterTerm.addEventListener('change', applyFilters);

  // INVESTMENTS LOGIC
  const invTbody = document.getElementById('table-investments-body');
  async function fetchInvestments() {
    if (!invTbody) return;
    try {
      const response = await fetch('/api/admin/getInvestments');
      if (response.status === 401) { window.location.href = '/admin-login.html'; return; }
      const data = await response.json();
      
      if (data.error) {
        invTbody.innerHTML = '<tr><td colspan="8" style="text-align: center; color: #ef4444;">Error loading investments.</td></tr>';
        return;
      }

      invTbody.innerHTML = '';
      if (data.length === 0) {
        invTbody.innerHTML = '<tr><td colspan="8" style="text-align: center; color: #64748b;">No investments found.</td></tr>';
        return;
      }

      data.forEach(inv => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td><input type="checkbox" class="row-select" data-id="${inv.transaction_id}"></td>
          <td style="font-size: 11px;">${inv.transaction_id.substring(0,8)}</td>
          <td>${(inv.investors && inv.investors.folio_number) ? inv.investors.folio_number : (inv.account_id || '-')}</td>
          <td style="text-transform: capitalize;">${inv.sector || '-'}</td>
          <td>${inv.term_years || '-'} Yrs</td>
          <td>₹ ${Math.round(inv.invested_amount || 0).toLocaleString('en-IN')}</td>
          <td>${inv.applied_interest_rate || '0'}%</td>
          <td>${inv.maturity_date || '-'}</td>
          <td>
            <select class="status-select" data-id="${inv.transaction_id}" style="padding: 4px; border-radius: 4px; font-size: 12px; font-weight: 600; border: 1px solid #cbd5e1; outline: none; background: ${inv.status === 'Pending' ? '#fef3c7' : inv.status === 'Rejected' ? '#fef2f2' : '#d1fae5'}; color: ${inv.status === 'Pending' ? '#d97706' : inv.status === 'Rejected' ? '#ef4444' : '#10b981'};">
              <option value="Pending" ${inv.status === 'Pending' ? 'selected' : ''}>Pending</option>
              <option value="Approved" ${inv.status === 'Approved' || inv.status === 'Active' ? 'selected' : ''}>Approved</option>
              <option value="Rejected" ${inv.status === 'Rejected' ? 'selected' : ''}>Rejected</option>
            </select>
          </td>
        `;
        invTbody.appendChild(tr);
      });

      document.querySelectorAll('.status-select').forEach(select => {
        select.addEventListener('change', async (e) => {
          const transactionId = e.target.getAttribute('data-id');
          const newStatus = e.target.value;
          
          e.target.style.opacity = '0.5';
          
          try {
            const res = await fetch('/api/admin/updateTransactionStatus', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ transaction_id: transactionId, status: newStatus })
            });
            const result = await res.json();
            
            if (!result.success) {
              alert("Failed to update status: " + result.error);
              fetchInvestments(); // revert
            } else {
              // Update colors
              if (newStatus === 'Pending') {
                e.target.style.background = '#fef3c7';
                e.target.style.color = '#d97706';
              } else if (newStatus === 'Rejected') {
                e.target.style.background = '#fef2f2';
                e.target.style.color = '#ef4444';
              } else {
                e.target.style.background = '#d1fae5';
                e.target.style.color = '#10b981';
              }
            }
          } catch (err) {
            alert("Connection error.");
            fetchInvestments();
          } finally {
            e.target.style.opacity = '1';
          }
        });
      });
    } catch (err) {
      invTbody.innerHTML = '<tr><td colspan="8" style="text-align: center; color: #ef4444;">Connection error.</td></tr>';
    }
  }
  fetchInvestments();

  // RATES CONFIGURATION LOGIC
  const ratesTbody = document.getElementById('table-rates-body');
  let currentRates = [];

  async function fetchRates() {
    if (!ratesTbody) return;
    try {
      const response = await fetch('/api/getRates');
      currentRates = await response.json();
      
      if (currentRates.error) {
        ratesTbody.innerHTML = '<tr><td colspan="4" style="text-align: center; color: #ef4444;">Error loading rates.</td></tr>';
        return;
      }

      ratesTbody.innerHTML = '';
      if (currentRates.length === 0) {
        ratesTbody.innerHTML = '<tr><td colspan="4" style="text-align: center; color: #64748b;">No rates found. (Click populate below if empty)</td></tr>';
        return;
      }

      // Sort by sector then term
      currentRates.sort((a, b) => a.sector.localeCompare(b.sector) || a.term_years - b.term_years);

      currentRates.forEach(rate => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td style="text-transform: capitalize;">${rate.sector}</td>
          <td>${rate.term_years}</td>
          <td><input type="number" step="0.1" value="${rate.interest_rate_pa}" data-id="${rate.id}" class="rate-input" style="width: 80px; padding: 4px; border: 1px solid #cbd5e1; color: #0f172a; border-radius: 4px;"></td>
          <td><span class="status-badge status-active">Active</span></td>
        `;
        ratesTbody.appendChild(tr);
      });

      document.querySelectorAll('.status-select').forEach(select => {
        select.addEventListener('change', async (e) => {
          const transactionId = e.target.getAttribute('data-id');
          const newStatus = e.target.value;
          
          e.target.style.opacity = '0.5';
          
          try {
            const res = await fetch('/api/admin/updateTransactionStatus', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ transaction_id: transactionId, status: newStatus })
            });
            const result = await res.json();
            
            if (!result.success) {
              alert("Failed to update status: " + result.error);
              fetchInvestments(); // revert
            } else {
              // Update colors
              if (newStatus === 'Pending') {
                e.target.style.background = '#fef3c7';
                e.target.style.color = '#d97706';
              } else if (newStatus === 'Rejected') {
                e.target.style.background = '#fef2f2';
                e.target.style.color = '#ef4444';
              } else {
                e.target.style.background = '#d1fae5';
                e.target.style.color = '#10b981';
              }
            }
          } catch (err) {
            alert("Connection error.");
            fetchInvestments();
          } finally {
            e.target.style.opacity = '1';
          }
        });
      });
    } catch (err) {
      ratesTbody.innerHTML = '<tr><td colspan="4" style="text-align: center; color: #ef4444;">Connection error.</td></tr>';
    }
  }
  fetchRates();

  const btnSaveRates = document.getElementById('btn-save-rates');
  if (btnSaveRates) {
    btnSaveRates.addEventListener('click', async () => {
      const inputs = document.querySelectorAll('.rate-input');
      const updates = [];
      inputs.forEach(input => {
        updates.push({
          id: parseInt(input.getAttribute('data-id')),
          interest_rate_pa: parseFloat(input.value)
        });
      });

      const originalText = btnSaveRates.textContent;
      btnSaveRates.textContent = 'Saving...';
      btnSaveRates.disabled = true;

      try {
        const response = await fetch('/api/admin/updateRates', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates)
        });
        const result = await response.json();
        if (result.success) {
          alert('Rates updated successfully!');
        } else {
          alert('Failed to update rates: ' + result.error);
        }
      } catch (err) {
        alert('Connection error.');
      } finally {
        btnSaveRates.textContent = originalText;
        btnSaveRates.disabled = false;
      }
    });
  }

});

  // VERIFIED INVESTORS
  const invBody = document.getElementById('table-investors-body');
  async function fetchInvestors() {
    if (!invBody) return;
    try {
      invBody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: #64748b;">Loading data...</td></tr>';
      const res = await fetch('/api/admin/getInvestors');
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      
      invBody.innerHTML = '';
      if (data.length === 0) {
        invBody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: #64748b;">No investors found.</td></tr>';
        return;
      }
      
      data.forEach(inv => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td><input type="checkbox" class="row-select" data-id="${inv.account_id}"></td>
          <td style="font-size: 12px; font-weight: 600;">${inv.folio_number || '-'}</td>
          <td>${inv.name || '-'}</td>
          <td>${inv.account_id || '-'}</td>
          <td style="font-size: 11px;">PAN: ${inv.pan_number || '-'}<br>AAD: ${inv.aadhar_number || '-'}</td>
          <td>-</td>
          <td>-</td>
        `;
        invBody.appendChild(tr);
      });
    } catch (err) {
      invBody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: #ef4444;">Error connecting to server.</td></tr>';
    }
  }
  fetchInvestors();

  // REGISTERED USERS
  const usersBody = document.getElementById('table-users-body');
  async function fetchUsers() {
    if (!usersBody) return;
    try {
      usersBody.innerHTML = '<tr><td colspan="4" style="text-align: center; color: #64748b;">Loading data...</td></tr>';
      const res = await fetch('/api/admin/getUsers');
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      
      usersBody.innerHTML = '';
      if (data.length === 0) {
        usersBody.innerHTML = '<tr><td colspan="4" style="text-align: center; color: #64748b;">No users found.</td></tr>';
        return;
      }
      
      data.forEach(u => {
        const tr = document.createElement('tr');
        const dateStr = new Date(u.created_at).toLocaleDateString('en-IN', { year:'numeric', month:'short', day:'numeric'});
        const loginStr = new Date(u.last_login).toLocaleDateString('en-IN', { year:'numeric', month:'short', day:'numeric'});
        tr.innerHTML = `
          <td><input type="checkbox" class="row-select" data-id="${u.id}"></td>
          <td>${dateStr}</td>
          <td>${u.phone_number || '-'}</td>
          <td>${loginStr}</td>
        `;
        usersBody.appendChild(tr);
      });
    } catch (err) {
      usersBody.innerHTML = '<tr><td colspan="4" style="text-align: center; color: #ef4444;">Error connecting to server.</td></tr>';
    }
  }
  fetchUsers();

  // BULK DELETION LOGIC
  document.querySelectorAll('.select-all').forEach(selectAll => {
    selectAll.addEventListener('change', (e) => {
      const table = e.target.closest('table');
      const checkboxes = table.querySelectorAll('.row-select');
      checkboxes.forEach(cb => cb.checked = e.target.checked);
    });
  });

  document.querySelectorAll('.btn-delete-selected').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const table = e.target.getAttribute('data-table');
      const idCol = e.target.getAttribute('data-idcol');
      const wrapper = e.target.closest('.tab-content');
      const checkboxes = wrapper.querySelectorAll('.row-select:checked');
      
      const ids = Array.from(checkboxes).map(cb => cb.getAttribute('data-id'));
      if (ids.length === 0) {
        alert("Please select at least one record to delete.");
        return;
      }
      
      if (!confirm(`Are you sure you want to delete ${ids.length} record(s)? This cannot be undone.`)) {
        return;
      }

      const origText = e.target.textContent;
      e.target.textContent = "Deleting...";
      e.target.disabled = true;

      try {
        const res = await fetch('/api/admin/deleteRecords', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ table, ids, id_column: idCol })
        });
        const result = await res.json();

        if (result.success) {
          alert("Records deleted successfully.");
          if (table === 'transactions') fetchInvestments();
          if (table === 'profit_calculator_leads') fetchLeads();
          if (table === 'investors') fetchInvestors();
          if (table === 'registered_users') fetchUsers();
          const selectAll = wrapper.querySelector('.select-all');
          if (selectAll) selectAll.checked = false;
        } else {
          alert("Error: " + result.error);
        }
      } catch (err) {
        alert("Connection error.");
      } finally {
        e.target.textContent = origText;
        e.target.disabled = false;
      }
    });
  });
