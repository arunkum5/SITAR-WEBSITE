
    document.addEventListener('DOMContentLoaded', () => {
      const authModal = document.getElementById('auth-modal');
      const profileModal = document.getElementById('profile-modal');
      
      const navLoginBtn = document.getElementById('nav-login-btn');
      const navProfileBtn = document.getElementById('nav-profile-btn');
      const mobileNavLoginBtn = document.getElementById('mobile-nav-login-btn');
      const mobileNavProfileBtn = document.getElementById('mobile-nav-profile-btn');

      const btnSendOtp = document.getElementById('auth-send-otp');
      const btnVerifyOtp = document.getElementById('auth-verify-otp');
      const step1 = document.getElementById('auth-step-1');
      const step2 = document.getElementById('auth-step-2');
      const btnLogout = document.getElementById('auth-logout-btn');
      const btnDashboard = document.getElementById('view-dashboard-btn');

      function openModal(modal) {
        modal.style.display = 'flex';
        // force reflow
        void modal.offsetWidth;
        modal.classList.add('show');
      }

      function closeModal(modal) {
        modal.classList.remove('show');
        setTimeout(() => {
          modal.style.display = 'none';
        }, 300);
      }

      function updateNavState() {
        const isLoggedIn = localStorage.getItem('sitar_logged_in') === 'true';
        if (isLoggedIn) {
          if (navLoginBtn) navLoginBtn.style.display = 'none';
          if (navProfileBtn) navProfileBtn.style.display = 'flex';
          if (mobileNavLoginBtn) mobileNavLoginBtn.style.display = 'none';
          if (mobileNavProfileBtn) mobileNavProfileBtn.style.display = 'block';
        } else {
          if (navLoginBtn) navLoginBtn.style.display = 'flex';
          if (navProfileBtn) navProfileBtn.style.display = 'none';
          if (mobileNavLoginBtn) mobileNavLoginBtn.style.display = 'block';
          if (mobileNavProfileBtn) mobileNavProfileBtn.style.display = 'none';
        }
      }

      // Initialize nav state
      updateNavState();

      // Open Auth Modal
      const loginTriggers = document.querySelectorAll('a[href="#login"]');
      loginTriggers.forEach(t => {
        t.addEventListener('click', (e) => {
          e.preventDefault();
          step1.style.display = 'block';
          step2.style.display = 'none';
          document.getElementById('auth-phone-input').value = '';
          document.getElementById('auth-phone-error').style.display = 'none';
          document.getElementById('auth-otp-input').value = '';
          openModal(authModal);
        });
      });

      // Open Profile Modal
      const profileTriggers = document.querySelectorAll('.nav-profile-trigger');
      profileTriggers.forEach(t => {
        t.addEventListener('click', (e) => {
          e.preventDefault();
          openModal(profileModal);
        });
      });

      // Close buttons
      document.getElementById('close-auth-modal').addEventListener('click', () => closeModal(authModal));
      document.getElementById('close-profile-modal').addEventListener('click', () => closeModal(profileModal));

      // Listen for successful auth from Firebase
      window.addEventListener('auth-success', () => {
        updateNavState();
        closeModal(authModal);
      });

      // Logout
      btnLogout.addEventListener('click', () => {
        localStorage.removeItem('sitar_logged_in');
        closeModal(profileModal);
        updateNavState();
      });

      // Dashboard
      btnDashboard.addEventListener('click', () => {
        closeModal(profileModal);
        // Custom logic here later
      });
      // Profile Edit Logic
      window.toggleProfileEdit = function(showEdit) {
        document.getElementById('profile-view-mode').style.display = showEdit ? 'none' : 'block';
        document.getElementById('profile-edit-mode').style.display = showEdit ? 'block' : 'none';
        document.getElementById('view-dashboard-btn').style.display = showEdit ? 'none' : 'block';
        document.getElementById('auth-logout-btn').style.display = showEdit ? 'none' : 'block';
      };

      window.saveProfileDetails = function() {
        const aadharInput = document.getElementById('edit-aadhar').value;
        const aadharClean = aadharInput.replace(/\s/g, '');
        if (aadharClean && !/^\d{12}$/.test(aadharClean)) {
          alert("Please enter a valid 12-digit Aadhar number.");
          return;
        }

        const nomPhoneInput = document.getElementById('edit-nominee-phone').value;
        const nomPhoneClean = nomPhoneInput.replace(/\D/g, '');
        if (nomPhoneInput && nomPhoneClean.length < 10) {
          alert("Please enter a valid 10-digit phone number for the nominee.");
          return;
        }

        const btn = document.getElementById('save-profile-btn');
        btn.innerHTML = `<svg class="animate-spin" style="width: 18px; height: 18px; margin-right: 8px; color: white;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Saving...`;
        btn.disabled = true;

        // Call Backend API
        try {
          const res = await fetch('/api/updateProfile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              phone: localStorage.getItem('user_phone') || '',
              name: document.getElementById('edit-full-name').value,
              email: document.getElementById('edit-email').value,
              pan: document.getElementById('edit-pan').value,
              aadhar: document.getElementById('edit-aadhar').value,
              nomineeName: document.getElementById('edit-nominee-name').value,
              nomineeRel: document.getElementById('edit-nominee-rel').value,
              nomineePhone: document.getElementById('edit-nominee-phone').value,
              bankAcc: document.getElementById('edit-bank-acc').value,
              bankIfsc: document.getElementById('edit-bank-ifsc').value,
              bankType: document.getElementById('edit-bank-type').value
            })
          });

          const result = await res.json();
          
          if (result.error) {
            alert("Failed to save profile: " + result.error);
          } else {
            const rawAadhar = document.getElementById('edit-aadhar').value.replace(/\s/g, '');
            const maskedAadhar = rawAadhar.length >= 4 ? `XXXX-XXXX-${rawAadhar.slice(-4)}` : (rawAadhar ? 'Invalid' : '-');
            
            const newName = document.getElementById('edit-full-name').value || 'Investor';
            document.getElementById('view-full-name').textContent = newName;
            
            const nameParts = newName.trim().split(' ');
            let initials = 'U';
            if (nameParts.length > 0 && nameParts[0].length > 0) {
              initials = nameParts[0][0];
              if (nameParts.length > 1 && nameParts[nameParts.length - 1].length > 0) {
                initials += nameParts[nameParts.length - 1][0];
              }
            }
            document.getElementById('view-initials').textContent = initials.toUpperCase();
            
            document.getElementById('view-email').textContent = document.getElementById('edit-email').value || 'Email not added';
            document.getElementById('view-pan').textContent = document.getElementById('edit-pan').value || '-';
            
            if (rawAadhar) {
              document.getElementById('view-aadhar').innerHTML = `${maskedAadhar} <span style="font-size: 10px; color: #10b981; background: #d1fae5; padding: 2px 6px; border-radius: 4px; margin-left: 4px;">Verified</span>`;
            } else {
              document.getElementById('view-aadhar').innerHTML = '-';
            }
            
            const nomineeName = document.getElementById('edit-nominee-name').value || '-';
            const nomineeRel = document.getElementById('edit-nominee-rel').value || '-';
            document.getElementById('view-nominee-name').innerHTML = `${nomineeName} <span style="color: #64748b; font-weight: 400; font-size: 13px;">(${nomineeRel})</span>`;
            document.getElementById('view-nominee-phone').textContent = document.getElementById('edit-nominee-phone').value || '-';
            
            const rawAcc = document.getElementById('edit-bank-acc').value;
            const maskedAcc = rawAcc.length >= 4 ? `XXXX XXXX ${rawAcc.slice(-4)}` : rawAcc;
            document.getElementById('view-bank-acc').textContent = maskedAcc || '-';
            document.getElementById('view-bank-ifsc').textContent = document.getElementById('edit-bank-ifsc').value || '-';
            document.getElementById('view-bank-type').textContent = document.getElementById('edit-bank-type').value || '-';

            toggleProfileEdit(false);
          }

          btn.innerHTML = originalText;
          btn.disabled = false;
        } catch (err) {
          alert("Connection error while saving profile.");
          btn.innerHTML = "Save Changes";
          btn.disabled = false;
        }
      };

      // TABS LOGIC
      const tabProfile = document.getElementById('tab-profile-details');
      const tabPortfolio = document.getElementById('tab-portfolio');
      const viewProfileMode = document.getElementById('profile-view-mode');
      const viewPortfolio = document.getElementById('portfolio-view');
      const editProfileMode = document.getElementById('profile-edit-mode');

      tabProfile.addEventListener('click', () => {
        tabProfile.style.fontWeight = '700'; tabProfile.style.color = '#1A2980'; tabProfile.style.borderBottom = '2px solid #1A2980';
        tabPortfolio.style.fontWeight = '600'; tabPortfolio.style.color = '#64748b'; tabPortfolio.style.borderBottom = 'none';
        viewPortfolio.style.display = 'none';
        viewProfileMode.style.display = 'block';
        editProfileMode.style.display = 'none';
      });

      let portfolioData = [];

      tabPortfolio.addEventListener('click', async () => {
        tabPortfolio.style.fontWeight = '700'; tabPortfolio.style.color = '#1A2980'; tabPortfolio.style.borderBottom = '2px solid #1A2980';
        tabProfile.style.fontWeight = '600'; tabProfile.style.color = '#64748b'; tabProfile.style.borderBottom = 'none';
        viewProfileMode.style.display = 'none';
        editProfileMode.style.display = 'none';
        viewPortfolio.style.display = 'block';

        const listEl = document.getElementById('portfolio-list');
        listEl.innerHTML = '<div style="text-align: center; color: #64748b; padding: 24px; background: #f8fafc; border-radius: 12px;">Loading portfolio...</div>';

        const phone = localStorage.getItem('user_phone');
        if (!phone) {
          listEl.innerHTML = '<div style="text-align: center; color: #ef4444; padding: 24px;">Please login to view portfolio.</div>';
          return;
        }

        try {
          const res = await fetch(`/api/getInvestments?phone=${encodeURIComponent(phone)}`);
          portfolioData = await res.json();

          if (portfolioData.error) throw new Error();
          
          if (portfolioData.length === 0) {
            listEl.innerHTML = '<div style="text-align: center; color: #64748b; padding: 24px; background: #f8fafc; border-radius: 12px;">You do not have any active investments yet.</div>';
            return;
          }

          listEl.innerHTML = '';
          portfolioData.forEach(inv => {
            const el = document.createElement('div');
            el.style = 'background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin-bottom: 12px;';
            el.innerHTML = `
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                <div style="font-size: 14px; font-weight: 700; color: #0f172a; text-transform: capitalize;">${inv.sector} Plan</div>
                <div style="font-size: 12px; color: #10b981; background: #d1fae5; padding: 2px 8px; border-radius: 12px; font-weight: 600;">Active</div>
              </div>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                <div>
                  <div style="font-size: 11px; color: #64748b; text-transform: uppercase;">Invested</div>
                  <div style="font-size: 14px; color: #0f172a; font-weight: 600;">₹ ${inv.invested_amount.toLocaleString('en-IN')}</div>
                </div>
                <div>
                  <div style="font-size: 11px; color: #64748b; text-transform: uppercase;">Maturity Value</div>
                  <div style="font-size: 14px; color: #0f172a; font-weight: 600;">₹ ${inv.maturity_amount.toLocaleString('en-IN')}</div>
                </div>
                <div>
                  <div style="font-size: 11px; color: #64748b; text-transform: uppercase;">Interest Rate</div>
                  <div style="font-size: 13px; color: #0f172a; font-weight: 600;">${inv.applied_interest_rate}% p.a.</div>
                </div>
                <div>
                  <div style="font-size: 11px; color: #64748b; text-transform: uppercase;">Maturity Date</div>
                  <div style="font-size: 13px; color: #0f172a; font-weight: 600;">${inv.maturity_date}</div>
                </div>
              </div>
            `;
            listEl.appendChild(el);
          });
        } catch (err) {
          listEl.innerHTML = '<div style="text-align: center; color: #ef4444; padding: 24px; background: #fef2f2; border-radius: 12px;">Failed to load portfolio.</div>';
        }
      });

      window.downloadPassbook = function() {
        if (!portfolioData || portfolioData.length === 0) {
          alert('No active investments to download.');
          return;
        }

        let csvContent = "Transaction ID,Sector,Term (Years),Invested Amount,Rate (%),Maturity Value,Maturity Date,Status\n";
        portfolioData.forEach(inv => {
          csvContent += `"${inv.transaction_id}","${inv.sector}","${inv.term_years}","${inv.invested_amount}","${inv.applied_interest_rate}","${inv.maturity_amount}","${inv.maturity_date}","${inv.status}"\n`;
        });

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `SITAR_Passbook_${localStorage.getItem('user_phone')}.csv`;
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      };
    });
  