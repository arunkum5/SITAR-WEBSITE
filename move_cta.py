import re
import sys

# The exact CTA HTML to remove (using regex to match flexible whitespaces if needed)
cta_regex = re.compile(
    r'<!-- Talk to Advisor CTA -->\s*<a href="tel:\+918660108612" class="advisor-action"[\s\S]*?</a>',
    re.DOTALL
)

cta_html = """<!-- Talk to Advisor CTA -->
        <a href="tel:+918660108612" class="advisor-action" style="display: flex; align-items: center; gap: 8px; background: linear-gradient(135deg, #d4fc79, #96e6a1); padding: 4px 12px 4px 4px; border-radius: 40px; border: none; box-shadow: 0 4px 12px rgba(150, 230, 161, 0.3); text-decoration: none; transition: all 0.3s ease; height: fit-content;" onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 8px 24px rgba(150, 230, 161, 0.5)';" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 12px rgba(150, 230, 161, 0.3)';">
          <div style="width: 24px; height: 24px; border-radius: 50%; background: #ffffff; display: flex; align-items: center; justify-content: center; color: #111;">
            <svg class="advisor-icon-animated" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 18v-6a9 9 0 0 1 18 0v6"></path>
              <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"></path>
              <path d="M14 21h-2a4 4 0 0 1-4-4"></path>
            </svg>
          </div>
          <div style="display: flex; flex-direction: column;">
            <span style="font-size: 11px; font-weight: 700; color: #111; line-height: 1;">Talk to Advisor</span>
          </div>
        </a>"""

def process_file(filename):
    with open(filename, 'r') as f:
        content = f.read()

    # 1. Remove from hero sections
    content = cta_regex.sub('', content)

    # 2. Add to nav-cta. We will replace the nav-text-link block with a wrapper block
    # Find the nav-text-link
    nav_text_regex = re.compile(
        r'(<a href="#" class="nav-text-link"[\s\S]*?Signup\s*</a>)',
        re.DOTALL
    )
    
    # Check if we already wrapped it (in case this script is run multiple times)
    if 'flex-direction: column; align-items: flex-end; gap: 8px;' not in content:
        content = nav_text_regex.sub(
            r'<div style="display: flex; flex-direction: column; align-items: flex-end; gap: 8px;">\n      \1\n      ' + cta_html + r'\n      </div>',
            content
        )

    with open(filename, 'w') as f:
        f.write(content)

process_file("invest.html")
process_file("services.html")

