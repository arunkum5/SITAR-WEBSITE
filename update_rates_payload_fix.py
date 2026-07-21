import sys

# FIX admin.js
with open("admin.js", "r") as f:
    admin_code = f.read()

old_admin_loop = """      inputs.forEach(input => {
        updates.push({
          id: parseInt(input.getAttribute('data-id')),
          interest_rate_pa: parseFloat(input.value)
        });
      });"""

new_admin_loop = """      inputs.forEach(input => {
        const id = parseInt(input.getAttribute('data-id'));
        const orig = currentRates.find(r => r.id === id);
        updates.push({
          id: id,
          interest_rate_pa: parseFloat(input.value),
          sector: orig.sector,
          term_years: orig.term_years,
          is_active: orig.is_active
        });
      });"""

admin_code = admin_code.replace(old_admin_loop, new_admin_loop)
with open("admin.js", "w") as f:
    f.write(admin_code)

# FIX backend_tests.html
with open("tests/backend_tests.html", "r") as f:
    test_code = f.read()

old_test_map = """                // Add 0.5% to all rates to test
                const updatedPayload = currentRates.map(r => ({
                    id: r.id,
                    interest_rate_pa: parseFloat(r.interest_rate_pa) + 0.5
                }));"""

new_test_map = """                // Add 0.5% to all rates to test
                const updatedPayload = currentRates.map(r => ({
                    id: r.id,
                    sector: r.sector,
                    term_years: r.term_years,
                    is_active: r.is_active,
                    interest_rate_pa: parseFloat(r.interest_rate_pa) + 0.5
                }));"""

test_code = test_code.replace(old_test_map, new_test_map)

# Also fix the original backup payload in the test
old_orig_map = """                // Keep track of originals to restore later
                const originalPayload = currentRates.map(r => ({ id: r.id, interest_rate_pa: r.interest_rate_pa }));"""

new_orig_map = """                // Keep track of originals to restore later
                const originalPayload = currentRates.map(r => ({ 
                    id: r.id, 
                    sector: r.sector,
                    term_years: r.term_years,
                    is_active: r.is_active,
                    interest_rate_pa: r.interest_rate_pa 
                }));"""

test_code = test_code.replace(old_orig_map, new_orig_map)

with open("tests/backend_tests.html", "w") as f:
    f.write(test_code)

print("Fixed admin.js and backend_tests.html payloads.")
