
                const vidBtn = document.getElementById('heroVideoPlayBtn');
                const vid = document.getElementById('heroVideo');
                const playVid = () => {
                  if (vid.paused) {
                    vid.play();
                    vid.setAttribute('controls', 'true');
                    vid.style.cursor = 'default';
                    vidBtn.style.display = 'none';
                  }
                };
                vidBtn.addEventListener('click', playVid);
                vid.addEventListener('click', playVid);
              