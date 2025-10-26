    const CONFIG = {
      count: 10,                // number of circles
      baseSize: 18,             // typical radius in px
      sizeVariance: 28,         // how much sizes can vary
      speed: 0.2,               // upward speed multiplier
      drift: 0.5,               // horizontal drift multiplier
      colors: [                 // palette (can be CSS colors or rgba)
        "rgba(255,255,255,0.07)",
        "rgba(173,216,230,0.06)",
        "rgba(255,182,193,0.05)",
        "rgba(144,238,144,0.04)"
      ],
      blur: 20,                 // glow blur applied to each circle (higher = softer)
      mouseParallax: 0.02      // how much circles shift with mouse (0 to disable)
    };

    (function start() {
      const canvas = document.getElementById('floatingCircles');
      const ctx = canvas.getContext('2d', { alpha: true });

      let width = 0, height = 0, dpr = Math.max(1, window.devicePixelRatio || 1);
      let circles = [];
      let pointer = { x: 0, y: 0 };

      // Respect reduced motion: if user prefers reduced motion, we'll pause animation but still draw static circles
      const reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      function resize() {
        width = canvas.clientWidth;
        height = canvas.clientHeight;
        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(height * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0); // match CSS pixels

        // regenerate circles proportionally if screen drastically changes
        initCircles();
      }

      function rand(min, max) { return Math.random() * (max - min) + min; }

      function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

      function initCircles() {
        circles = [];
        const areaFactor = (width * height) / (1366 * 768); // scale by screen real estate
        const targetCount = Math.max(8, Math.round(CONFIG.count * Math.sqrt(areaFactor)));

        for (let i = 0; i < targetCount; i++) {
          const radius = Math.max(2, CONFIG.baseSize + rand(-CONFIG.sizeVariance, CONFIG.sizeVariance));
          const x = rand(-radius, width + radius);
          const y = rand(-height * 0.5, height + height * 0.5); // start some above/below so distribution looks natural
          const vy = rand(0.08, 0.8) * CONFIG.speed * (0.6 + Math.random()); // upward speed
          const vx = rand(-0.4, 0.4) * CONFIG.drift; // horizontal drift
          const color = pick(CONFIG.colors);
          const alpha = rand(0.02, 0.18);
          const twinkle = Math.random() < 0.06 ? rand(0.2, 0.7) : 0; // some circles gently pulse
          circles.push({ x, y, vx, vy, radius, color, alpha, twinkle, twPhase: Math.random() * Math.PI * 2 });
        }
      }

      function drawStatic() {
        // draw static layout (used for reduced-motion preference)
        ctx.clearRect(0, 0, width, height);
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        for (const c of circles) {
          ctx.beginPath();
          ctx.fillStyle = c.color.replace(/rgba\(([\d\s,]+)\)/, `rgba($1,${c.alpha})`);
          ctx.filter = `blur(${CONFIG.blur}px)`;
          ctx.arc(c.x, c.y, c.radius, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      function render(now) {
        ctx.clearRect(0, 0, width, height);

        // subtle parallax based on mouse
        const px = (pointer.x / width - 0.5) * width * CONFIG.mouseParallax;
        const py = (pointer.y / height - 0.5) * height * CONFIG.mouseParallax;

        ctx.save();
        ctx.globalCompositeOperation = 'lighter';

        for (const c of circles) {
          // animation pulse
          if (c.twinkle) {
            c.twPhase += 0.016 * (0.6 + Math.random() * 0.8);
            c.currentAlpha = c.alpha * (0.7 + 0.6 * Math.sin(c.twPhase));
          } else {
            c.currentAlpha = c.alpha;
          }

          // draw with blur glow
          ctx.beginPath();
          ctx.fillStyle = c.color.replace(/rgba\(([\d\s,]+)\)/, `rgba($1,${c.currentAlpha})`);
          ctx.filter = `blur(${CONFIG.blur}px)`;
          const drawX = c.x + px * (c.radius / (CONFIG.baseSize + 1));
          const drawY = c.y + py * (c.radius / (CONFIG.baseSize + 1));
          ctx.arc(drawX, drawY, c.radius, 0, Math.PI * 2);
          ctx.fill();

          // thin crisp core (no blur) for subtle definition
          ctx.beginPath();
          ctx.filter = 'none';
          ctx.globalAlpha = Math.min(1, c.currentAlpha * 6);
          ctx.arc(drawX, drawY, Math.max(0.6, c.radius * 0.25), 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 1;
        }

        ctx.restore();

        // update physics (unless reduced motion)
        if (!reducedMotion) {
          for (const c of circles) {
            c.x += c.vx;
            c.y -= c.vy; // moving up
            // gentle horizontal oscillation for organic movement
            c.vx += Math.sin((c.x + now * 0.0002) * 0.002) * 0.0005;

            // recycle off-screen circles to bottom
            if (c.y + c.radius < -50 || c.x < -200 || c.x > width + 200) {
              // place back near bottom
              c.x = rand(-50, width + 50);
              c.y = height + rand(10, height * 0.5);
              c.vy = rand(0.08, 0.8) * CONFIG.speed;
              c.vx = rand(-0.4, 0.4) * CONFIG.drift;
            }
          }
          requestAnimationFrame(render);
        }
      }

      // mouse tracking — only for parallax, not required
      function onPointerMove(e) {
        const ev = (e.touches && e.touches[0]) || e;
        pointer.x = ev.clientX;
        pointer.y = ev.clientY;
      }

      // init
      function init() {
        resize();
        if (reducedMotion) {
          drawStatic();
          return;
        }
        requestAnimationFrame(render);
      }

      // good practice: debounce resize
      let resizeTimer = null;
      window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(resize, 120);
      }, { passive: true });

      // pointer events
      window.addEventListener('mousemove', onPointerMove, { passive: true });
      window.addEventListener('touchmove', onPointerMove, { passive: true });

      // Handle page visibility: pause animation when tab hidden to save CPU
      let wasRunning = false;
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          wasRunning = true;
        } else if (wasRunning && !reducedMotion) {
          requestAnimationFrame(render);
          wasRunning = false;
        }
      });

      // make sure the canvas fills fully when CSS changes
      // use MutationObserver only if you embed canvas in dynamic layout — omitted for simplicity

      // create initial circles and start
      initCircles();
      init();
    })();