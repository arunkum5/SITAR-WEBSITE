import sys

with open("admin.js", "r") as f:
    js = f.read()

# Replace generic error messages with actual error messages to help debugging
js = js.replace("Error connecting to server.</td></tr>", "Error: ${err.message}</td></tr>")
js = js.replace("Error loading data.</td></tr>", "Error loading data: ${data.error}</td></tr>")

# Also fix the globalInvestments assignment to ensure it's always an array
old_inv = """      const data = await response.json();
      globalInvestments = data;

      if (data.error) {"""

new_inv = """      const data = await response.json();
      
      if (data.error) {
        globalInvestments = [];"""

js = js.replace(old_inv, new_inv)

with open("admin.js", "w") as f:
    f.write(js)

print("Fixed error logging.")
