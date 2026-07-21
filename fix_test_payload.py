import sys

with open("tests/backend_tests.html", "r") as f:
    html = f.read()

old_payload = """                        const investPayload = {
                            phone: passbookPhone,
                            amount: amount,
                            rate: 14.5,
                            sector: sec,
                            term_years: 3
                        };"""

new_payload = """                        const investPayload = {
                            phone: passbookPhone,
                            amount: amount,
                            rate: 14.5,
                            sector: sec,
                            term: 3,
                            maturity_date: "2029-07-21",
                            maturity_amount: Math.round(amount * Math.pow(1 + (14.5 / 100), 3))
                        };"""

html = html.replace(old_payload, new_payload)

# Also fix the error log to output the actual error so I don't have to guess next time!
old_err = "throw new Error(`Test 14 FAILED: Could not create investment in ${sec}.`);"
new_err = "throw new Error(`Test 14 FAILED: Could not create investment in ${sec}. API said: ${invData.error || invData.message || 'Unknown'}`);"
html = html.replace(old_err, new_err)


with open("tests/backend_tests.html", "w") as f:
    f.write(html)

print("Fixed Test 14 payload.")
