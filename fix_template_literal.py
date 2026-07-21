import sys

with open("admin.js", "r") as f:
    js = f.read()

# Replace the single quotes with backticks around the error message so the template literal actually works
js = js.replace("invBody.innerHTML = '<tr><td colspan=\"7\" style=\"text-align: center; color: #ef4444;\">Error: ${err.message}</td></tr>';", "invBody.innerHTML = `<tr><td colspan=\"7\" style=\"text-align: center; color: #ef4444;\">Error: ${err.message}</td></tr>`;")

js = js.replace("usersBody.innerHTML = '<tr><td colspan=\"4\" style=\"text-align: center; color: #ef4444;\">Error: ${err.message}</td></tr>';", "usersBody.innerHTML = `<tr><td colspan=\"4\" style=\"text-align: center; color: #ef4444;\">Error: ${err.message}</td></tr>`;")

js = js.replace("leadsTbody.innerHTML = '<tr><td colspan=\"7\" style=\"text-align: center; color: #ef4444;\">Error: ${err.message}</td></tr>';", "leadsTbody.innerHTML = `<tr><td colspan=\"7\" style=\"text-align: center; color: #ef4444;\">Error: ${err.message}</td></tr>`;")

# Also, I must undo the terrible accidental code injection in fetchInvestments!
# Let's restore fetchInvestments properly.
js = js.replace("""      globalVerifiedCount = data.length;
      globalInvestedVerifiedCount = 0;
      data.forEach(inv => {
        let activeCount = 0;
        let totalVal = 0;
        if (inv.transactions && inv.transactions.length > 0) {
            const activeTxs = inv.transactions.filter(t => t.status === 'Active' || t.status === 'Approved');
            activeCount = activeTxs.length;
            totalVal = activeTxs.reduce((sum, t) => sum + parseFloat(t.invested_amount || 0), 0);
        }

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
          <td><span class="status-badge status-${inv.status.toLowerCase()}">${inv.status}</span></td>
        `;
        if (activeCount > 0) globalInvestedVerifiedCount++;
        invBody.appendChild(tr);
      });""", """      data.forEach(inv => {
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
          <td><span class="status-badge status-${inv.status.toLowerCase()}">${inv.status}</span></td>
        `;
        invTbody.appendChild(tr);
      });""")

with open("admin.js", "w") as f:
    f.write(js)

print("Fixed syntax issues.")
