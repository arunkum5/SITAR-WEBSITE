import sys

with open("tests/backend_tests.html", "r") as f:
    html = f.read()

# We need to fetch the newly created transactions to get their IDs, since createInvestment doesn't return it
old_approve_loop = """                log(`Created 10 investments for ${passbookPhone}. Approving them all...`);

                for (const txId of passbookTxIds) {
                    const approveRes = await fetch('/api/admin/updateTransactionStatus', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ transaction_id: txId, status: 'Approved' })
                    });
                    if (!approveRes.ok) {
                         throw new Error(`Test 14 FAILED: Could not approve tx ${txId}.`);
                    }
                }"""

new_approve_loop = """                log(`Created 10 investments for ${passbookPhone}. Fetching IDs to approve them all...`);
                
                const getInvRes = await fetch('/api/admin/getInvestments');
                const allInvestments = await getInvRes.json();
                
                // Find all pending investments for this test user
                const pendingTxs = allInvestments.filter(i => i.account_id === passbookPhone && i.status === 'Pending');
                
                for (const inv of pendingTxs) {
                    const approveRes = await fetch('/api/admin/updateTransactionStatus', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ transaction_id: inv.transaction_id, status: 'Approved' })
                    });
                    if (!approveRes.ok) {
                         throw new Error(`Test 14 FAILED: Could not approve tx ${inv.transaction_id}.`);
                    }
                }"""

html = html.replace(old_approve_loop, new_approve_loop)

with open("tests/backend_tests.html", "w") as f:
    f.write(html)

print("Fixed Test 14 txid.")
