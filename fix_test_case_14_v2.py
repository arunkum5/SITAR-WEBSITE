import sys

with open("tests/backend_tests.html", "r") as f:
    html = f.read()

# I will append Test Case 14 at the end of the test suite
old_end = "                log('\\n🎉 ALL BACKEND TESTS COMPLETED SUCCESSFULLY!', 'success');"

new_test = """                // TEST CASE 14: Comprehensive Passbook Test (User: 9999999999)
                log("\\n--- TEST CASE 14: Comprehensive Passbook Test (User +919999999999) ---");
                const passbookPhone = "+919999999999";
                log(`Simulating user ${passbookPhone} making 10 investments across all sectors...`);
                
                let passbookTxIds = [];
                // Invest 2 times in each of the 5 sectors
                for (const sec of sectors) {
                    for (let i = 0; i < 2; i++) {
                        const amount = (i + 1) * 500000; // 5 Lakhs, then 10 Lakhs
                        const investPayload = {
                            phone: passbookPhone,
                            amount: amount,
                            rate: 14.5,
                            sector: sec,
                            term_years: 3
                        };
                        const invRes = await fetch('/api/createInvestment', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(investPayload)
                        });
                        const invData = await invRes.json();
                        if (invRes.ok) {
                            passbookTxIds.push(invData.transaction_id);
                        } else {
                            throw new Error(`Test 14 FAILED: Could not create investment in ${sec}.`);
                        }
                    }
                }
                log(`Created 10 investments for ${passbookPhone}. Approving them all...`);
                
                for (const txId of passbookTxIds) {
                    const approveRes = await fetch('/api/admin/updateTransactionStatus', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ transaction_id: txId, status: 'Approved' })
                    });
                    if (!approveRes.ok) {
                         throw new Error(`Test 14 FAILED: Could not approve tx ${txId}.`);
                    }
                }
                log(`Test 14 PASSED: 10 Approved investments successfully injected for ${passbookPhone}.`);

                log('\\n🎉 ALL BACKEND TESTS COMPLETED SUCCESSFULLY!', 'success');"""

html = html.replace(old_end, new_test)

with open("tests/backend_tests.html", "w") as f:
    f.write(html)

print("Added Test Case 14 v2.")
