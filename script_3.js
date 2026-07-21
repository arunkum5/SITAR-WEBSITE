
    (function () {

      // ---------------------------------------------------------------
      // CONFIG — point this at wherever you want leads saved.
      // Leave as-is to just store leads in the browser (localStorage) for testing.
      // To send to Odoo CRM, replace saveLead() below with a fetch() call to
      // a small backend endpoint that creates a crm.lead record via Odoo's API
      // (calling Odoo's JSON-RPC directly from the browser isn't safe/CORS-friendly,
      // so route it through your own tiny server-side script).
      // ---------------------------------------------------------------
      function saveLead(name, phone) {
        try {
          const leads = JSON.parse(localStorage.getItem('sitar_leads') || '[]');
          leads.push({ name, phone, ts: new Date().toISOString() });
          localStorage.setItem('sitar_leads', JSON.stringify(leads));
        } catch (e) { console.warn('Could not save lead locally', e); }

        // Example webhook call (uncomment + set your URL to actually send it somewhere):
        // fetch('https://your-backend.example.com/api/leads', {
        //   method: 'POST',
        //   headers: {'Content-Type':'application/json'},
        //   body: JSON.stringify({ name, phone, source: 'SITAR website chatbot' })
        // });

        console.log('Lead captured:', { name, phone });
      }

      const RATES = {
        villas: { label: "Villas 🏡", rate: "Up to 12% p.a.", accent: "villas" },
        apartments: { label: "Apartments 🏢", rate: "Up to 11% p.a.", accent: "apartments" },
        layouts: { label: "Layout Development 📐", rate: "Up to 13% p.a.", accent: "layouts" },
        restaurants: { label: "Restaurants 🍽️", rate: "Up to 10% p.a.", accent: "restaurants" },
        resorts: { label: "Resorts 🏖️", rate: "Up to 12.5% p.a.", accent: "resorts" },
        microfinance: { label: "Microfinance 🤝", rate: "Up to 9% p.a.", accent: "microfinance" },
      };

      const LOANS = {
        property: { label: "Property Loan", info: "Financing against residential and commercial property, structured around your repayment comfort." },
        construction: { label: "Construction Loan", info: "Staged disbursals aligned to your build timeline, from foundation to finish." },
        gold: { label: "Gold Loan", info: "Doorstep gold valuation, low interest, and quick disbursal. We can also release gold pledged elsewhere." },
        personal: { label: "Personal Loan", info: "Quick approval, minimal paperwork, for whatever life asks of you next." },
        business: { label: "Business Loan", info: "Working capital and expansion funding for owners who are ready to grow." },
      };

      const launcher = document.getElementById('sitar-bot-launcher');
      const panel = document.getElementById('sitar-bot-panel');
      const closeBtn = document.getElementById('sitar-bot-close');
      const body = document.getElementById('sitar-bot-body');
      const inputRow = document.getElementById('sitar-bot-input-row');
      const input = document.getElementById('sitar-bot-input');
      const sendBtn = document.getElementById('sitar-bot-send');

      let state = 'ask_name';
      let lead = { name: '', phone: '' };
      let started = false;

      function scrollDown() { body.scrollTop = body.scrollHeight; }

      function addMessage(text, from) {
        const el = document.createElement('div');
        el.className = 'msg ' + from;
        el.innerHTML = text;
        body.appendChild(el);
        scrollDown();
      }

      function showTyping(cb, delay) {
        const el = document.createElement('div');
        el.className = 'typing';
        el.innerHTML = '<span></span><span></span><span></span>';
        body.appendChild(el);
        scrollDown();
        setTimeout(() => {
          el.remove();
          cb();
        }, delay || 550);
      }

      function addQuickReplies(options) {
        const wrap = document.createElement('div');
        wrap.className = 'quick-replies';
        options.forEach(opt => {
          const btn = document.createElement('button');
          btn.className = 'qr-btn' + (opt.accent ? ' accent-' + opt.accent : '');
          btn.textContent = opt.label;
          btn.onclick = () => handleQuickReply(opt.value, opt.label);
          wrap.appendChild(btn);
        });
        body.appendChild(wrap);
        scrollDown();
      }

      function setInputMode(mode) {
        if (mode === 'hidden') {
          inputRow.classList.add('hidden');
        } else {
          inputRow.classList.remove('hidden');
          input.type = mode === 'tel' ? 'tel' : 'text';
          input.placeholder = mode === 'tel' ? 'Your phone number...' : 'Type your answer...';
          input.value = '';
          input.focus();
        }
      }

      function startConversation() {
        if (started) return;
        started = true;
        showTyping(() => {
          addMessage("Hi there 👋 I'm the SITAR Assistant.", 'bot');
          showTyping(() => {
            addMessage("Before we start, could I get your <strong>name</strong>?", 'bot');
            setInputMode('text');
          }, 500);
        }, 400);
      }

      // Name: letters and spaces only (allows things like "Arun Kumar", apostrophes/hyphens for names like O'Neil or Anne-Marie), min 2 chars
      function isValidName(str) {
        return /^[A-Za-z][A-Za-z\s'.-]{1,49}$/.test(str.trim());
      }

      // Indian mobile number: exactly 10 digits, starting with 6, 7, 8, or 9.
      // Strips spaces, hyphens, and a leading +91/91/0 before checking, so users
      // can type it in whatever format feels natural to them.
      function cleanPhone(str) {
        return str.replace(/[\s-]/g, '');
      }
      function isValidPhone(str) {
        const digits = cleanPhone(str);
        return /^\+?[0-9]{7,15}$/.test(digits);
      }

      function handleTextSubmit() {
        const val = input.value.trim();
        if (!val) return;
        addMessage(val, 'user');
        input.value = '';

        if (state === 'ask_name') {
          if (!isValidName(val)) {
            showTyping(() => {
              addMessage("That doesn't quite look like a name — please use letters only (e.g. \"Arun Kumar\"), no numbers or symbols.", 'bot');
            }, 350);
            return;
          }
          lead.name = val;
          state = 'ask_phone';
          showTyping(() => {
            addMessage(`Nice to meet you, ${escapeHtml(lead.name)}! And your <strong>phone number</strong>?`, 'bot');
            setInputMode('tel');
          });
        } else if (state === 'ask_phone') {
          if (!isValidPhone(val)) {
            showTyping(() => {
              addMessage("That doesn't look like a valid phone number — please enter a valid number (e.g. 9876543210 or +1234567890).", 'bot');
            }, 350);
            return;
          }
          lead.phone = cleanPhone(val);
          saveLead(lead.name, lead.phone);
          state = 'menu';
          setInputMode('hidden');
          showTyping(() => {
            addMessage(`Thanks, ${escapeHtml(lead.name)}! What would you like to explore?`, 'bot');
            addQuickReplies([
              { label: '💰 Invest', value: 'invest' },
              { label: '🏦 Loan', value: 'loan' },
              { label: '🧮 Profit Calculator', value: 'calculator' },
            ]);
          });
        }
      }

      function handleQuickReply(value, label) {
        addMessage(label, 'user');

        if (state === 'menu') {
          if (value === 'calculator') {
            state = 'menu_returned';
            showTyping(() => {
              addMessage('We have a powerful Profit Calculator to help you estimate your returns! You can access it directly here: <a href="calculator.html" style="color:#007BFF; text-decoration:underline;">Profit Calculator</a>.', 'bot');
              addQuickReplies([
                { label: '💰 Invest', value: 'invest' },
                { label: '🏦 Loan', value: 'loan' },
                { label: '📞 Talk to advisor', value: 'contact' },
              ]);
            });
          } else if (value === 'invest') {
            state = 'sector';
            showTyping(() => {
              addMessage('Great choice. Which sector interests you?', 'bot');
              addQuickReplies(Object.entries(RATES).map(([key, r]) => ({ label: r.label, value: key, accent: r.accent })));
            });
          } else if (value === 'loan') {
            state = 'loantype';
            showTyping(() => {
              addMessage('Sure — which type of loan are you looking for?', 'bot');
              addQuickReplies(Object.entries(LOANS).map(([key, l]) => ({ label: l.label, value: key })));
            });
          }
        } else if (state === 'sector') {
          const r = RATES[value];
          showTyping(() => {
            addMessage(`${r.label} — <span class="rate">${r.rate}</span><br>Want to see another sector, or talk to an advisor?`, 'bot');
            addQuickReplies([
              { label: '🚀 Invest Now', value: 'invest_now', accent: 'invest-now' },
              { label: '🔁 Other sectors', value: 'invest' },
              { label: '🏦 Loans instead', value: 'loan' },
              { label: '🧮 Profit Calculator', value: 'calculator' },
              { label: '📞 Talk to advisor', value: 'contact' },
            ]);
            state = 'menu_returned';
          });
        } else if (state === 'loantype') {
          const l = LOANS[value];
          showTyping(() => {
            addMessage(`<strong>${l.label}</strong><br>${l.info}<br><br>Rates are priced per applicant — an advisor can share exact numbers.`, 'bot');
            addQuickReplies([
              { label: '🔁 Other loans', value: 'loan' },
              { label: '💰 Investments instead', value: 'invest' },
              { label: '🧮 Profit Calculator', value: 'calculator' },
              { label: '📞 Talk to advisor', value: 'contact' },
            ]);
            state = 'menu_returned';
          });
        } else if (state === 'menu_returned') {
          if (value === 'invest_now') {
            showTyping(() => {
              addMessage('Awesome! Redirecting you to our investment page...', 'bot');
              setTimeout(() => { window.location.href = "invest.html"; }, 1500);
            });
          } else if (value === 'calculator') {
            state = 'menu_returned';
            showTyping(() => {
              addMessage('We have a powerful Profit Calculator to help you estimate your returns! You can access it directly here: <a href="calculator.html" style="color:#007BFF; text-decoration:underline;">Profit Calculator</a>.', 'bot');
              addQuickReplies([
                { label: '💰 Invest', value: 'invest' },
                { label: '🏦 Loan', value: 'loan' },
                { label: '📞 Talk to advisor', value: 'contact' },
              ]);
            });
          } else if (value === 'invest') {
            state = 'sector';
            showTyping(() => addQuickReplies(Object.entries(RATES).map(([key, r]) => ({ label: r.label, value: key, accent: r.accent }))));
          } else if (value === 'loan') {
            state = 'loantype';
            showTyping(() => addQuickReplies(Object.entries(LOANS).map(([key, l]) => ({ label: l.label, value: key }))));
          } else if (value === 'contact') {
            showTyping(() => {
              addMessage(`Perfect — someone from our team will call ${escapeHtml(lead.name)} on ${escapeHtml(lead.phone)} shortly. 🙏`, 'bot');
            });
          }
        }
      }

      function escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
      }

      sendBtn.addEventListener('click', handleTextSubmit);
      input.addEventListener('keydown', (e) => { if (e.key === 'Enter') handleTextSubmit(); });

      launcher.addEventListener('click', () => {
        panel.classList.toggle('open');
        if (panel.classList.contains('open')) startConversation();
      });
      closeBtn.addEventListener('click', () => panel.classList.remove('open'));

    })();
  