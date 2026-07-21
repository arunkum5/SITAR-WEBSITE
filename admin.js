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
  const mockLeads = [
    { date: '2023-10-24', phone: '+91 9876543210', sector: 'Villas', term: '3 Years', amount: '50,00,000', profit: '22,50,000', status: 'Pending' },
    { date: '2023-10-23', phone: '+91 9123456789', sector: 'Layouts', term: '5 Years', amount: '25,00,000', profit: '18,75,000', status: 'Contacted' },
  ];

  function renderLeads(data) {
    leadsTbody.innerHTML = '';
    data.forEach(lead => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${lead.date}</td>
        <td>${lead.phone}</td>
        <td>${lead.sector}</td>
        <td>${lead.term}</td>
        <td>₹ ${lead.amount}</td>
        <td style="color: #4ade80;">+ ₹ ${lead.profit}</td>
        <td><span class="status-badge status-pending">${lead.status}</span></td>
      `;
      leadsTbody.appendChild(tr);
    });
  }
  renderLeads(mockLeads);

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
