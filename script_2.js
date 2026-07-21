
    // Scroll Indicator & Scroll To Top
    const scrollBar = document.getElementById('scrollBar');
    const scrollTopBtn = document.getElementById('scrollTopBtn');

    window.addEventListener('scroll', () => {
      const scrollPx = document.documentElement.scrollTop;
      const winHeightPx = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrollLen = (scrollPx / winHeightPx) * 100;
      if (scrollBar) scrollBar.style.width = scrollLen + '%';

      if (scrollPx > 300) {
        scrollTopBtn.classList.add('visible');
      } else {
        scrollTopBtn.classList.remove('visible');
      }
    });

    scrollTopBtn?.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // --- Word-by-Word Animation for Hero Subtitle ---
    const heroSub = document.querySelector('.hero-sub');
    if (heroSub) {
      const childNodes = Array.from(heroSub.childNodes);
      heroSub.innerHTML = '';
      let wordDelay = 0;

      childNodes.forEach(node => {
        if (node.nodeType === Node.TEXT_NODE) {
          const chars = node.textContent.split('');
          chars.forEach(char => {
            if (char === ' ' || char === '\n') {
              heroSub.appendChild(document.createTextNode(char));
            } else {
              const span = document.createElement('span');
              span.className = 'char';
              span.style.animationDelay = `${wordDelay * 0.02}s`;
              span.textContent = char;
              heroSub.appendChild(span);
              wordDelay++;
            }
          });
        } else if (node.nodeType === Node.ELEMENT_NODE) {
          const newEl = document.createElement(node.tagName);
          // Copy all attributes (href, style, onmouseover, etc.)
          Array.from(node.attributes).forEach(attr => {
            newEl.setAttribute(attr.name, attr.value);
          });

          if (node.classList.contains('typewriter-line')) {
            let localDelay = 0;
            const innerChars = node.textContent.split('');
            innerChars.forEach(char => {
              if (char === ' ' || char === '\n') {
                newEl.appendChild(document.createTextNode(char));
              } else {
                const span = document.createElement('span');
                span.className = 'char';
                span.style.animationDelay = `${localDelay * 0.02}s`;
                span.textContent = char;
                newEl.appendChild(span);
                localDelay++;
              }
            });

            let isTyping = false;
            newEl.addEventListener('mouseenter', () => {
              if (isTyping) return;
              isTyping = true;
              const chars = newEl.querySelectorAll('.char');
              chars.forEach(c => {
                c.style.animationName = 'none';
              });

              // Force a reflow on the parent to ensure the animation resets
              void newEl.offsetWidth;

              chars.forEach(c => {
                c.style.animationName = ''; // Restores the CSS class animation name
              });

              setTimeout(() => {
                isTyping = false;
              }, innerChars.length * 20 + 100);
            });
          } else {
            newEl.innerHTML = node.innerHTML;
          }
          heroSub.appendChild(newEl);
        }
      });
    }
    // Build the ticker from the sector + plan rates, duplicated for a seamless loop.
    const rates = [
      { sym: "VILLAS", rate: "12.0%", dot: "#C1694A" },
      { sym: "APARTMENTS", rate: "11.0%", dot: "#6E86A6" },
      { sym: "LAYOUT DEV.", rate: "13.0%", dot: "#C9A227" },
      { sym: "COMMERCIAL", rate: "11.5%", dot: "#A370A1" },
      { sym: "HOTELS & RESORTS", rate: "12.5%", dot: "#3E8E85" },
      { sym: "1YR PLAN", rate: "9.5%", dot: "#E6C37C" },
      { sym: "2YR PLAN", rate: "10.5%", dot: "#E6C37C" },
      { sym: "3YR PLAN", rate: "11.5%", dot: "#E6C37C" },
      { sym: "5YR PLAN", rate: "12.0%", dot: "#E6C37C" },
    ];

    const track = document.getElementById('tickerTrack');
    function buildItems() {
      return rates.map(r => `
      <div class="ticker-item">
        <span class="ticker-dot" style="background:${r.dot}"></span>
        <span class="sym" style="color:${r.dot}">${r.sym}</span>
        <span class="rate" style="color:${r.dot}">▲ ${r.rate}</span>
      </div>
    `).join('');
    }
    // duplicate the set so the -50% translateX loop is seamless
    track.innerHTML = buildItems() + buildItems();

    // mobile menu (toggle of a simplified flat dropdown)
    const toggle = document.querySelector('.menu-toggle');
    const mobileLinks = document.querySelector('.mobile-nav-links');
    toggle.addEventListener('click', () => {
      mobileLinks.classList.toggle('open');
    });

    // Close mobile menu when a link is clicked
    document.querySelectorAll('.mobile-nav-links a').forEach(link => {
      link.addEventListener('click', () => {
        mobileLinks.classList.remove('open');
      });
    });

    // --- Timeline "appear one by one" ---
    const tlObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const items = entry.target.querySelectorAll('.tl-item');
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          items.forEach((item, idx) => {
            setTimeout(() => {
              if (entry.isIntersecting) {
                item.classList.add('visible');
              }
            }, idx * 350);
          });
        } else {
          entry.target.classList.remove('visible');
          items.forEach(item => {
            item.classList.remove('visible');
          });
        }
      });
    }, { threshold: 0.1, rootMargin: "0px 0px -100px 0px" });

    const timelineEl = document.querySelector('.timeline');
    if (timelineEl) tlObserver.observe(timelineEl);

    // Re-run timeline card animation on hover
    document.querySelectorAll('.tl-item').forEach(item => {
      let isAnimating = false;
      item.addEventListener('mouseenter', () => {
        if (isAnimating) return;
        isAnimating = true;
        item.style.transition = 'none';
        item.classList.remove('visible');
        void item.offsetWidth; // Force reflow
        item.style.transition = '';
        item.classList.add('visible');
        setTimeout(() => {
          isAnimating = false;
        }, 1400); // Wait for the 1.4s transition to finish
      });
    });

    // --- Background Graph Intersection Observer ---
    const graphObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const graph = document.querySelector('.about-bg-graph');
        if (graph) {
          if (entry.isIntersecting) {
            graph.classList.add('animate');
          } else {
            graph.classList.remove('animate');
          }
        }
      });
    }, { threshold: 0.1 });

    const aboutSection = document.getElementById('about');
    if (aboutSection) graphObserver.observe(aboutSection);

    // --- Running numbers on stats ---
    function animateValue(obj, start, end, duration, prefix = '', suffix = '') {
      let startTimestamp = null;
      const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const current = Math.floor(progress * (end - start) + start);
        obj.innerHTML = prefix + current + suffix;
        if (progress < 1) {
          window.requestAnimationFrame(step);
        }
      };
      window.requestAnimationFrame(step);
    }

    const stats = document.querySelectorAll('.stat');
    function triggerStatAnimation(stat) {
      const numEl = stat.querySelector('.num');
      const target = parseInt(stat.getAttribute('data-target'), 10);
      const prefix = stat.getAttribute('data-prefix') || '';
      const suffix = stat.getAttribute('data-suffix') || '';

      if (stat.classList.contains('animating')) return;
      stat.classList.add('animating');

      animateValue(numEl, 0, target, 1200, prefix, suffix);

      setTimeout(() => {
        stat.classList.remove('animating');
      }, 1200);
    }

    const statObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          triggerStatAnimation(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    stats.forEach(stat => {
      statObserver.observe(stat);
      stat.addEventListener('mouseenter', () => {
        triggerStatAnimation(stat);
      });
    });



    // --- Hero Content Slider ---
    const slides = document.querySelectorAll('.hero-slide');
    const dots = document.querySelectorAll('.slider-dots .dot');
    const arrowLeft = document.querySelector('.arrow-left');
    const arrowRight = document.querySelector('.arrow-right');
    let currentSlide = 0;
    let slideInterval;

    const navLinkAbout = document.getElementById('navLinkAbout');
    const navDropdownServices = document.getElementById('navDropdownServices');
    const navDropdownInvest = document.getElementById('navDropdownInvest');

    function showSlide(idx) {
      slides.forEach((slide, i) => {
        slide.classList.toggle('active', i === idx);
      });
      dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === idx);
      });
      currentSlide = idx;

      // Dynamically highlight header nav links/dropdowns based on active hero slide
      if (navLinkAbout && navDropdownServices && navDropdownInvest) {
        if (idx === 0) {
          navLinkAbout.classList.add('active');
          navDropdownServices.classList.remove('active');
          navDropdownInvest.classList.remove('active');

          // Re-trigger running counter animation for stats on active slide
          const heroStats = document.querySelectorAll('.hero-stats .stat');
          heroStats.forEach(stat => {
            triggerStatAnimation(stat);
          });

          // Trigger growth graph animation
          const heroGraph = document.getElementById('heroGraph');
          if (heroGraph) {
            heroGraph.classList.add('animate-in');
          }
        } else {
          navLinkAbout.classList.remove('active');
          if (idx === 1) {
            navDropdownServices.classList.add('active');
            navDropdownInvest.classList.remove('active');
          } else if (idx === 2) {
            navDropdownServices.classList.remove('active');
            navDropdownInvest.classList.add('active');
          }

          // Reset growth graph animation so it replays when switching back
          const heroGraph = document.getElementById('heroGraph');
          if (heroGraph) {
            heroGraph.classList.remove('animate-in');
          }
        }
      }

      // Update the sliding nav pill position
      setTimeout(updateNavPill, 10);
    }

    function updateNavPill() {
      const pill = document.getElementById('navActivePill');
      if (!pill) return;

      // Find the currently active link or dropdown trigger
      let activeEl = document.querySelector('.nav-links a.active');
      if (!activeEl) {
        const activeDropdown = document.querySelector('.nav-item-dropdown.active');
        if (activeDropdown) {
          activeEl = activeDropdown.querySelector('.nav-dropdown-trigger');
        }
      }

      if (activeEl) {
        const navLinks = document.querySelector('.nav-links');
        const navLinksRect = navLinks.getBoundingClientRect();
        const activeRect = activeEl.getBoundingClientRect();

        // Set color to match active element
        const activeColor = activeEl.style.getPropertyValue('--nav-c') || 'var(--gold)';
        pill.style.background = activeColor;
        pill.style.borderColor = activeColor;

        // Adjust size and position based on absolute client rects
        pill.style.width = activeRect.width + 'px';
        pill.style.height = activeRect.height + 'px';
        pill.style.left = (activeRect.left - navLinksRect.left) + 'px';
        pill.style.top = (activeRect.top - navLinksRect.top) + 'px';
        pill.style.opacity = '1';
      } else {
        pill.style.opacity = '0';
      }
    }

    window.addEventListener('resize', updateNavPill);

    // Hover graph to restart animation from 2016 to 2021+
    const heroGraphEl = document.getElementById('heroGraph');
    if (heroGraphEl) {
      heroGraphEl.addEventListener('mouseenter', () => {
        heroGraphEl.classList.remove('animate-in');
        void heroGraphEl.offsetWidth; // trigger reflow
        heroGraphEl.classList.add('animate-in');
      });
    }

    function nextSlide() {
      const nextIdx = (currentSlide + 1) % slides.length;
      showSlide(nextIdx);
    }

    function prevSlide() {
      const nextIdx = (currentSlide - 1 + slides.length) % slides.length;
      showSlide(nextIdx);
    }

    function startAutoPlay() {
      clearInterval(slideInterval);
      // slideInterval = setInterval(nextSlide, 10000); // Disabled slider
    }

    if (arrowLeft && arrowRight) {
      arrowLeft.addEventListener('click', () => {
        prevSlide();
        startAutoPlay();
      });
      arrowRight.addEventListener('click', () => {
        nextSlide();
        startAutoPlay();
      });
    }

    dots.forEach((dot, idx) => {
      dot.addEventListener('click', () => {
        showSlide(idx);
        startAutoPlay();
      });
    });

    // Dynamic header shrink on scroll
    const header = document.querySelector('header');
    window.addEventListener('scroll', () => {
      const wasScrolled = header.classList.contains('scrolled');
      if (window.scrollY > 40) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
      const isScrolled = header.classList.contains('scrolled');

      if (wasScrolled !== isScrolled) {
        const navLinks = document.querySelector('.nav-links');
        if (navLinks) {
          navLinks.classList.add('header-transitioning');
        }

        const duration = 300; // ms (matches CSS transition duration)
        const startTime = performance.now();

        function animatePill(currentTime) {
          const elapsed = currentTime - startTime;
          updateNavPill();
          if (elapsed < duration) {
            requestAnimationFrame(animatePill);
          } else {
            if (navLinks) {
              navLinks.classList.remove('header-transitioning');
            }
            updateNavPill();
          }
        }
        requestAnimationFrame(animatePill);
      }
    });

    // Initialize with a slight delay to trigger CSS transitions on page load
    setTimeout(() => {
      showSlide(0);
      startAutoPlay();
    }, 50);



    // Scroll animation for How it Works cards and content
    const scrollObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        } else {
          entry.target.classList.remove('visible');
        }
      });
    }, { threshold: 0.1 });

    // 0. Observe About lead paragraphs and stats
    document.querySelectorAll('#about .about-lead p, .fade-in-p').forEach(el => scrollObserver.observe(el));
    document.querySelectorAll('#about .stat').forEach((el, index) => {
      el.style.transitionDelay = `${index * 0.15 + 0.3}s`;
      scrollObserver.observe(el);
    });

    // 1. Observe the How it Works half-cards
    document.querySelectorAll('.how-half').forEach((el, index) => {
      el.style.transitionDelay = `${index * 0.15}s`;
      scrollObserver.observe(el);

      // 2. Observe the inner step items
      const steps = el.querySelectorAll('.step');
      steps.forEach((step, stepIndex) => {
        step.classList.add('stagger-fade');
        // Delay factors in which half it's in, plus the step's order
        step.style.transitionDelay = `${(index * 0.2) + (stepIndex * 0.15) + 0.2}s`;
        scrollObserver.observe(step);
      });
    });

    // 3. Observe the Why Choose Us items
    document.querySelectorAll('.why-item').forEach((el, index) => {
      // Delay sequentially for single column list (slow load)
      el.style.animationDelay = `${index * 0.4}s`;
      scrollObserver.observe(el);
    });

    // 4. Observe CTA section lines
    document.querySelectorAll('.cta-line').forEach((el, index) => {
      el.classList.add('stagger-fade');
      el.style.transitionDelay = `${index * 0.3}s`;
      scrollObserver.observe(el);
    });

    // --- Typewriter Word-by-Word logic ---
    const twWordsObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          if (!entry.target.dataset.animated) {
            entry.target.dataset.animated = "true";

            if (!entry.target.dataset.initialized) {
              entry.target.dataset.initialized = "true";
              const text = entry.target.innerText;
              const words = text.split(' ');
              entry.target.innerHTML = '';

              words.forEach((word) => {
                if (!word) return;
                const span = document.createElement('span');
                span.innerText = word;
                span.style.opacity = '0';
                span.style.transition = 'opacity 0.25s ease-in-out';
                entry.target.appendChild(span);
                entry.target.appendChild(document.createTextNode(' '));
              });

              const cursor = document.createElement('span');
              cursor.innerText = '|';
              cursor.style.display = 'inline-block';
              cursor.style.color = '#ccc'; // Light cursor color
              cursor.style.animation = 'blink 1s step-end infinite';
              cursor.style.opacity = '0';
              cursor.style.transition = 'opacity 0.25s';
              cursor.classList.add('tw-cursor');
              entry.target.appendChild(cursor);
            }

            let delay = 0;
            const spans = entry.target.querySelectorAll('span:not(.tw-cursor)');
            spans.forEach(span => {
              span.style.transitionDelay = `${delay}s`;
              void span.offsetWidth; // force reflow
              span.style.opacity = '1';
              delay += 0.15; // 150ms per word
            });

            const cursor = entry.target.querySelector('.tw-cursor');
            if (cursor) {
              cursor.style.transitionDelay = `${delay}s`;
              setTimeout(() => cursor.style.opacity = '1', 10);
            }
          }
        } else {
          // Reset animation state when scrolled out of view
          if (entry.target.dataset.animated) {
            entry.target.dataset.animated = "";
            const spans = entry.target.querySelectorAll('span');
            spans.forEach(span => {
              span.style.transitionDelay = '0s';
              span.style.opacity = '0';
            });
          }
        }
      });
    }, { threshold: 0.5 });

    document.querySelectorAll('.typewriter-words').forEach(el => {
      twWordsObserver.observe(el);
    });

    // --- Investment Process Flow: staggered scroll-in ---
    const investFlow = document.getElementById('investFlow');
    if (investFlow) {
      const iflowSteps = investFlow.querySelectorAll('.iflow-step');
      const iflowObs = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            // Activate each step with a stagger delay
            iflowSteps.forEach((step, i) => {
              setTimeout(() => {
                step.classList.add('active');
              }, i * 280);
            });
            iflowObs.disconnect();
          }
        });
      }, { threshold: 0.15 });
      iflowObs.observe(investFlow);
    }

    // --- Loan Steps: staggered scroll-in from left ---
    const loanSteps = document.getElementById('loanSteps');
    if (loanSteps) {
      const lSteps = loanSteps.querySelectorAll('.loan-step');
      const loanObs = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            lSteps.forEach((step, i) => {
              setTimeout(() => {
                step.classList.add('active');
              }, i * 200);
            });
            loanObs.disconnect();
          }
        });
      }, { threshold: 0.15 });
      loanObs.observe(loanSteps);
    }

    // --- Sector thumb click interactivity ---
    document.querySelectorAll('.sector-thumb').forEach(thumb => {
      thumb.addEventListener('click', () => {
        document.querySelectorAll('.sector-thumb').forEach(t => t.classList.remove('selected'));
        thumb.classList.add('selected');
      });
    });

    // --- Plan pill click interactivity ---
    document.querySelectorAll('.plan-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        document.querySelectorAll('.plan-pill').forEach(p => p.classList.remove('selected'));
        pill.classList.add('selected');
      });
    });
    // Preloader Logic (5 seconds with trust counter)
    const preloader = document.getElementById('sitePreloader');
    const counterEl = document.getElementById('preloaderCounter');
    const barEl = document.getElementById('preloaderBar');
    if (preloader) {
      if (!sessionStorage.getItem('sitarLoaded')) {
        sessionStorage.setItem('sitarLoaded', 'true');
        let count = 0;
        // The counter fades in at 1.2s, so we wait 1.2s then count to 100 over ~3.5s
        setTimeout(() => {
          const interval = setInterval(() => {
            count += Math.floor(Math.random() * 2) + 1; // random increment for realism
            if (count > 100) count = 100;
            if (counterEl) {
              counterEl.innerText = `${count}%`;
            }
            if (barEl) {
              barEl.style.width = `${count}%`;
            }
            if (count >= 100) {
              clearInterval(interval);
            }
          }, 35); // 35ms tick
        }, 1200);

        setTimeout(() => {
          preloader.classList.add('fade-out');
          document.body.classList.remove('loading');
        }, 5000);
      } else {
        // Immediately hide preloader if already loaded in this session
        preloader.style.display = 'none';
        document.body.classList.remove('loading');
      }
    }

    // --- Hero Stat Counters Animation ---
    const statCounters = document.querySelectorAll('.stat-counter');
    statCounters.forEach(counter => {
      const target = +counter.getAttribute('data-target');
      const duration = 2000; // 2 seconds
      const increment = target / (duration / 16); // 60fps
      let isAnimating = false;

      const runCounter = () => {
        if (isAnimating) return;
        isAnimating = true;
        let current = 0;
        counter.innerText = '0';

        const updateCounter = () => {
          current += increment;
          if (current < target) {
            counter.innerText = Math.ceil(current);
            requestAnimationFrame(updateCounter);
          } else {
            counter.innerText = target;
            isAnimating = false;
          }
        };

        requestAnimationFrame(updateCounter);
      };

      // Initial run on page load
      setTimeout(runCounter, 600);
    });

    // --- Floating Social Proof Alerts ---
    const alertMessages = [
      { text: "13+ New Investors this month", icon: '<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>', color: '#3E8E85' },
      { text: "16+ Gold Loans delivered this month", icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>', color: '#B8860B' }
    ];

    const heroSection = document.querySelector('.hero');
    if (heroSection) {
      const alertContainer = document.createElement('div');
      alertContainer.className = 'floating-alert-container';
      heroSection.appendChild(alertContainer);

      let lastMsgIndex = -1;

      const burstConfetti = (alertEl, color) => {
        for (let i = 0; i < 14; i++) {
          const particle = document.createElement('div');
          particle.className = 'confetti-particle';
          particle.style.background = color;
          const angle = Math.random() * Math.PI * 2;
          const velocity = 25 + Math.random() * 45;
          const tx = Math.cos(angle) * velocity;
          const ty = Math.sin(angle) * velocity - 10;
          particle.style.setProperty('--tx', `${tx}px`);
          particle.style.setProperty('--ty', `${ty}px`);
          const dur = 0.5 + Math.random() * 0.4;
          particle.style.animation = `confettiBurst ${dur}s ease-out forwards`;
          particle.style.left = '50%';
          particle.style.top = '50%';
          alertEl.appendChild(particle);
          setTimeout(() => particle.remove(), dur * 1000);
        }
      };

      const spawnAlert = () => {
        // Pick the next message sequentially to ensure both show up
        lastMsgIndex = (lastMsgIndex + 1) % alertMessages.length;
        const msg = alertMessages[lastMsgIndex];

        const alert = document.createElement('div');
        alert.className = 'floating-alert';
        alert.innerHTML = `
        <div style="width:28px;height:28px;border-radius:50%;background:${msg.color}15;display:flex;align-items:center;justify-content:center;color:${msg.color};">
          ${msg.icon}
        </div>
        <span>${msg.text}</span>
      `;
        alertContainer.appendChild(alert);

        // Fire confetti burst right after it pops up
        setTimeout(() => burstConfetti(alert, msg.color), 600);

        // Remove after animation completes (6s)
        setTimeout(() => {
          alert.remove();
        }, 6000);
      };

      // Start spawning
      setTimeout(() => {
        spawnAlert();
        setInterval(spawnAlert, 7500); // Spawn sequentially every 7.5 seconds
      }, 2500);
    }

    // --- HOW IT WORKS TABS INTERACTIVITY ---
    const howTabs = document.querySelectorAll('.how-tab');
    const howContents = document.querySelectorAll('.how-content');

    howTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        // Remove active from all tabs
        howTabs.forEach(t => t.classList.remove('active'));
        // Add active to clicked tab
        tab.classList.add('active');

        // Hide all contents
        howContents.forEach(c => c.classList.remove('active'));

        // Show the target content
        const targetId = tab.getAttribute('data-target');
        document.getElementById(targetId).classList.add('active');
      });
    });
  