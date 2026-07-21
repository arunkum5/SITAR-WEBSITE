import sys

with open("firebase-auth.js", "r") as f:
    js = f.read()

# Call setupRecaptcha immediately on DOMContentLoaded
js = js.replace("document.addEventListener('DOMContentLoaded', () => {", "document.addEventListener('DOMContentLoaded', () => {\n    setupRecaptcha(); // Pre-initialize invisible reCAPTCHA to eliminate latency")

with open("firebase-auth.js", "w") as f:
    f.write(js)

print("Pre-initialized reCAPTCHA.")
