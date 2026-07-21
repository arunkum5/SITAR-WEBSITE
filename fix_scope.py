import sys

with open("admin.js", "r") as f:
    js = f.read()

# Replace the specific closing block at line ~520
# It looks like:
#     });
#   }
# 
# });
# 
#   // VERIFIED INVESTORS
# We need to replace the single `});` before VERIFIED INVESTORS with nothing.

old_part = """    });
  }

});

  // VERIFIED INVESTORS"""

new_part = """    });
  }

  // VERIFIED INVESTORS"""

js = js.replace(old_part, new_part)

# Now append `});` to the end of the file
js = js.strip() + "\n\n});\n"

with open("admin.js", "w") as f:
    f.write(js)

print("Fixed scope.")
