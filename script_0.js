
          (function () {
            var wrapper = document.getElementById('tickerWrapper');
            var coinContainer = document.getElementById('coinContainer');
            var coinInterval;
            var emojis = ['💰', '🪙', '💸'];

            if (wrapper && coinContainer) {
              wrapper.addEventListener('mouseenter', function () {
                coinInterval = setInterval(function () {
                  var coin = document.createElement('div');
                  coin.className = 'falling-coin';
                  coin.innerText = emojis[Math.floor(Math.random() * emojis.length)];
                  coin.style.left = Math.random() * 100 + '%';
                  coin.style.animationDuration = (0.8 + Math.random() * 0.8) + 's';
                  coinContainer.appendChild(coin);

                  // Cleanup after animation
                  setTimeout(function () {
                    if (coin.parentNode) coin.parentNode.removeChild(coin);
                  }, 1600);
                }, 150); // Spawn a new coin every 150ms while hovering
              });

              wrapper.addEventListener('mouseleave', function () {
                clearInterval(coinInterval);
              });
            }
          })();
        