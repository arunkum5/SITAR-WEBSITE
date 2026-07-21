document.addEventListener('DOMContentLoaded', () => {
  
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
      tr.innerHTML = `
        <td>${new Date(lead.created_at).toLocaleDateString() || '-'}</td>
        <td>${lead.account_id || '-'}</td>
        <td>${lead.sector || '-'}</td>
        <td>${lead.term_years || '-'}</td>
        <td>₹ ${lead.amount || '0'}</td>
        <td style="color: #4ade80;">+ ₹ ${lead.projected_profit || '0'}</td>
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
          <td style="font-size: 11px;">${inv.transaction_id.substring(0,8)}</td>
          <td>${inv.account_id || '-'}</td>
          <td style="text-transform: capitalize;">${inv.sector || '-'}</td>
          <td>${inv.term_years || '-'} Yrs</td>
          <td>₹ ${inv.invested_amount || '0'}</td>
          <td>${inv.applied_interest_rate || '0'}%</td>
          <td>${inv.maturity_date || '-'}</td>
          <td><span class="status-badge status-active">${inv.status || 'Active'}</span></td>
        `;
        invTbody.appendChild(tr);
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
