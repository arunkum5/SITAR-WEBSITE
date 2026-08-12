
    document.addEventListener("DOMContentLoaded", () => {
      const sectorInput = document.getElementById("calc-sector");
      const termInput = document.getElementById("calc-term");
      const amountInput = document.getElementById("calc-amount");
      
      const rateDisplay = document.getElementById("calc-rate-display");
      const profitDisplay = document.getElementById("calc-profit-display");
      const profitWordsDisplay = document.getElementById("calc-profit-words");
      const totalDisplay = document.getElementById("calc-total-display");
      const totalWordsDisplay = document.getElementById("calc-total-words");
      const amountWordsDisplay = document.getElementById("calc-amount-words");

      function formatCurrency(num) {
        return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(num);
      }

      function numberToWords(num) {
        if (num === 0) return "";
        const a = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
        const b = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
        
        function convertLessThanOneThousand(n) {
          if (n === 0) return "";
          if (n < 20) return a[n];
          if (n < 100) return b[Math.floor(n / 10)] + (n % 10 !== 0 ? " " + a[n % 10] : "");
          return a[Math.floor(n / 100)] + " Hundred" + (n % 100 !== 0 ? " and " + convertLessThanOneThousand(n % 100) : "");
        }

        let res = "";
        let temp = num;
        if (Math.floor(temp / 10000000) > 0) {
          res += convertLessThanOneThousand(Math.floor(temp / 10000000)) + " Crore ";
          temp %= 10000000;
        }
        if (Math.floor(temp / 100000) > 0) {
          res += convertLessThanOneThousand(Math.floor(temp / 100000)) + " Lakh ";
          temp %= 100000;
        }
        if (Math.floor(temp / 1000) > 0) {
          res += convertLessThanOneThousand(Math.floor(temp / 1000)) + " Thousand ";
          temp %= 1000;
        }
        if (temp > 0) {
          res += convertLessThanOneThousand(temp);
        }
        return res.trim() + " Rupees Only";
      }

      function calculate() {
        if (!sectorInput || !termInput || !amountInput) return;
        
        const sector = sectorInput.value;
        const term = parseInt(termInput.value);
        const rawAmountStr = amountInput.value.replace(/,/g, '');
        const amount = parseFloat(rawAmountStr) || 0;

        const rateKey = `${sector}_${term}`;
        const rate = typeof investmentRates !== 'undefined' ? (investmentRates[rateKey] || 12) : 12;

        rateDisplay.textContent = rate.toFixed(1);
        amountWordsDisplay.textContent = amount > 0 ? numberToWords(amount) : "";

        if (amount <= 0) {
          profitDisplay.textContent = "0";
          totalDisplay.textContent = "0";
          return;
        }

        const decimalRate = rate / 100;
        const maturityValue = amount * Math.pow(1 + decimalRate, term);
        const profit = maturityValue - amount;

        const roundedProfit = Math.round(profit);
        const roundedMaturity = Math.round(maturityValue);

        profitDisplay.textContent = formatCurrency(roundedProfit);
        totalDisplay.textContent = formatCurrency(roundedMaturity);
        
        profitWordsDisplay.textContent = roundedProfit > 0 ? numberToWords(roundedProfit) : "";
        totalWordsDisplay.textContent = roundedMaturity > 0 ? numberToWords(roundedMaturity) : "";
        
        totalDisplay.parentElement.classList.remove("blink-anim");
        void totalDisplay.parentElement.offsetWidth;
        totalDisplay.parentElement.classList.add("blink-anim");
      }

      if(sectorInput) {
        sectorInput.addEventListener("change", calculate);
        termInput.addEventListener("change", calculate);
        
        amountInput.addEventListener("input", (e) => {
          let val = e.target.value.replace(/[^0-9]/g, '');
          if (val) {
            e.target.value = new Intl.NumberFormat('en-IN').format(parseInt(val, 10));
          } else {
            e.target.value = '';
          }
          calculate();
        });

        // Initialize
        calculate();
      }
    });
  