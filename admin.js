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
  Chart.defaults.color = 'rgba(243, 236, 221, 0.62)';
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
        backgroundColor: '#B8860B',
        borderRadius: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: { beginAtZero: true, grid: { color: 'rgba(243, 236, 221, 0.1)' } },
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
        <td>${lead.date || '-'}</td>
        <td>${lead.phone || '-'}</td>
        <td>${lead.sector || '-'}</td>
        <td>${lead.term || '-'}</td>
        <td>₹ ${lead.amount || '0'}</td>
        <td style="color: #4ade80;">+ ₹ ${lead.profit || '0'}</td>
        <td><span class="status-badge status-pending">${lead.status || 'Pending'}</span></td>
      `;
      leadsTbody.appendChild(tr);
    });
  }

  // Fetch real data from Supabase via Cloudflare API
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

  // 4. Filtering Logic
  const filterSector = document.getElementById('filter-sector');
  const filterTerm = document.getElementById('filter-term');

  function applyFilters() {
    const sVal = filterSector.value.toLowerCase();
    const tVal = filterTerm.value.toLowerCase();

    const filtered = mockLeads.filter(lead => {
      const matchSector = sVal === 'all' || lead.sector.toLowerCase() === sVal;
      const matchTerm = tVal === 'all' || lead.term.charAt(0) === tVal;
      return matchSector && matchTerm;
    });
    
    renderLeads(filtered);
  }

  filterSector.addEventListener('change', applyFilters);
  filterTerm.addEventListener('change', applyFilters);

});
