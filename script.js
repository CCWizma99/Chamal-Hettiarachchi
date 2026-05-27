/* ============================================================
   Portfolio Script — Watercolor Pipeline Theme
   ============================================================ */

const PIPE_STEPS = [
    { id: 'think',  icon: 'fa-lightbulb',  label: 'Think',  color: 'navy',   caption: 'Understand the problem before touching code.' },
    { id: 'design', icon: 'fa-pen-ruler',  label: 'Design', color: 'blue',   caption: 'Architect a solution that scales and makes sense.' },
    { id: 'build',  icon: 'fa-code',       label: 'Build',  color: 'lblue',  caption: 'Write clean, purposeful code.' },
    { id: 'ship',   icon: 'fa-rocket',     label: 'Ship',   color: 'yellow', caption: 'Deploy, deliver, and put work into the world.' },
    { id: 'learn',  icon: 'fa-book-open',  label: 'Learn',  color: 'blue',   caption: 'Reflect, iterate, and carry lessons forward.' },
];

document.addEventListener('DOMContentLoaded', () => {

    /* ---------- THEME ---------- */
    const themeToggle = document.getElementById('themeToggle');
    const themeIcon   = document.getElementById('themeIcon');

    const saved = localStorage.getItem('wc-theme') || 'light';
    if (saved === 'dark') applyDark();
    themeToggle.addEventListener('click', () => {
        if (document.body.classList.contains('dark')) {
            document.body.classList.remove('dark');
            themeIcon.className = 'fa-solid fa-moon';
            localStorage.setItem('wc-theme', 'light');
            updateBadgeTheme('light');
        } else {
            applyDark();
        }
    });

    function applyDark() {
        document.body.classList.add('dark');
        themeIcon.className = 'fa-solid fa-sun';
        localStorage.setItem('wc-theme', 'dark');
        updateBadgeTheme('dark');
    }

    function updateBadgeTheme(theme) {
        const badgeContainer = document.getElementById('linkedin-badge-container');
        if (badgeContainer) {
            badgeContainer.innerHTML = `<div id="my-li-badge" class="badge-base LI-profile-badge" data-locale="en_US" data-size="medium" data-theme="${theme}" data-type="VERTICAL" data-vanity="chamal-hettiarachchi" data-version="v1"><a class="badge-base__link LI-simple-link" href="https://lk.linkedin.com/in/chamal-hettiarachchi?trk=profile-badge">Chamal Hettiarachchi</a></div>
            <script>
                (function() {
                    const savedTheme = localStorage.getItem('wc-theme');
                    if (savedTheme === 'dark') {
                        document.getElementById('my-li-badge').setAttribute('data-theme', 'dark');
                    }
                })();
            </script>`;
            if (typeof window.LIRenderAll === 'function') {
                try { window.LIRenderAll(); } catch(e) {}
            }
        }
    }

    /* ---------- NAV — IntersectionObserver ---------- */
    const sections  = document.querySelectorAll('section[id]');
    const navItems  = document.querySelectorAll('.nav-item[data-section]');

    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.id;
                navItems.forEach(item => {
                    const active = item.dataset.section === id;
                    item.classList.toggle('active', active);
                    item.querySelector('.nav-dot')?.classList.toggle('active', active);
                    item.querySelector('.nav-label')?.classList.toggle('active', active);
                });
            }
        });
    }, { threshold: 0.45 });

    sections.forEach(s => sectionObserver.observe(s));

    /* Nav click → smooth scroll */
    navItems.forEach(item => {
        item.addEventListener('click', e => {
            e.preventDefault();
            const target = document.getElementById(item.dataset.section);
            if (target) target.scrollIntoView({ behavior: 'smooth' });
        });
    });

    /* ---------- PIPELINE ---------- */
    buildPipeline();
    initPipelineObserver();

    /* ---------- TIMELINE CARDS ---------- */
    document.querySelectorAll('.tl-card').forEach(card => {
        card.addEventListener('click', () => {
            const body = card.querySelector('.tl-body');
            if (!body) return;
            const open = body.style.display === 'block';
            body.style.display = open ? 'none' : 'block';
            card.classList.toggle('expanded', !open);
        });
    });
    
    /* ---------- FLUID TUBE SCROLL TIMELINE ---------- */
    const pageScroll = document.querySelector('.page-scroll');
    const timeline   = document.querySelector('.timeline');
    const tlFluid    = document.querySelector('.tl-fluid');
    const tlBubble   = document.querySelector('.tl-indicator-bubble');

    if (pageScroll && timeline && tlFluid && tlBubble) {
        const updateTimelineFluid = () => {
            const rect = timeline.getBoundingClientRect();
            const viewHeight = window.innerHeight;
            
            const start = viewHeight * 0.70;
            const totalDistance = rect.height;
            const currentProgress = start - rect.top;

            let percentage = (currentProgress / totalDistance) * 100;
            percentage = Math.max(0, Math.min(100, percentage));

            tlFluid.style.height = `${percentage}%`;

            if (percentage > 0 && percentage < 100) {
                tlBubble.style.opacity = '1';
                const topPos = (percentage / 100) * totalDistance;
                tlBubble.style.top = `${topPos}px`;
                tlBubble.textContent = `${Math.round(percentage)}%`;
            } else if (percentage >= 100) {
                tlBubble.style.opacity = '1';
                tlBubble.style.top = `${totalDistance}px`;
                tlBubble.textContent = '100%';
            } else {
                tlBubble.style.opacity = '0';
            }
        };

        pageScroll.addEventListener('scroll', updateTimelineFluid);
        updateTimelineFluid();
    }

    /* ---------- FADE IN ---------- */
    const fadeEls = document.querySelectorAll('.section-header, .hero-inner, .pipeline-strip, .proj-group, .skill-group, .about-inner, .contact-inner');
    fadeEls.forEach(el => el.classList.add('fade-in'));

    const fadeObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                fadeObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12 });
    fadeEls.forEach(el => fadeObserver.observe(el));

});

/* ============================================================
   PIPELINE BUILD + ANIMATION  (Agile Arc Edition)
   ============================================================ */

let pipeNodeEls     = [];
let pipeConnectors  = [];
let pipeRunning     = false;
let pipeLoopTimer   = null;

function buildPipeline() {
    const row     = document.getElementById('pipelineRow');
    if (!row) return;
    row.innerHTML = '';
    pipeNodeEls   = [];
    pipeConnectors = [];

    PIPE_STEPS.forEach((step, i) => {
        /* Node */
        const node = document.createElement('div');
        node.className = 'pipe-node';
        node.dataset.color = step.color;
        node.id = 'pn-' + step.id;
        node.innerHTML = `
            <div class="pipe-box" id="pb-${step.id}">
                <i class="fa-solid ${step.icon}"></i>
                <span>${step.label}</span>
            </div>`;
        row.appendChild(node);
        pipeNodeEls.push(node);

        /* Connector (except after last) */
        if (i < PIPE_STEPS.length - 1) {
            const conn = document.createElement('div');
            conn.className = 'pipe-connector';
            conn.innerHTML = `<div class="pipe-track"></div><div class="pipe-fill" id="pf-${i}"></div><div class="pipe-pkt" id="pp-${i}"></div>`;
            row.appendChild(conn);
            pipeConnectors.push({
                fill: conn.querySelector(`#pf-${i}`),
                pkt:  conn.querySelector(`#pp-${i}`),
            });
        }
    });

    /* Draw agile arcs once layout is stable */
    requestAnimationFrame(() => requestAnimationFrame(drawAgileArcs));
}

/* ---- Agile arc drawing ---- */
let arcPaths = [];   /* { el, len } for each animated segment */

function drawAgileArcs() {
    const svg  = document.getElementById('pipelineArcSvg');
    const wrap = svg?.parentElement;
    if (!svg || !wrap) return;

    svg.innerHTML = '';
    arcPaths = [];

    const wrapRect  = wrap.getBoundingClientRect();

    /* Measure each node box position relative to wrap */
    const nodeBoxes = pipeNodeEls.map(n => {
        const box = n.querySelector('.pipe-box');
        const r   = box.getBoundingClientRect();
        return {
            cx:  r.left - wrapRect.left + r.width / 2,
            top: r.top  - wrapRect.top,               /* Y of node top in wrap space */
            bottom: r.bottom - wrapRect.top,          /* Y of node bottom in wrap space */
        };
    });

    if (!nodeBoxes.length) return;

    const learnIdx = nodeBoxes.length - 1;
    const learnCx  = nodeBoxes[learnIdx].cx;
    const nodeTopY = Math.min(...nodeBoxes.map(b => b.top));  /* top of tallest node */
    const nodeBottomY = Math.max(...nodeBoxes.map(b => b.bottom)); /* bottom of lowest node */

    /* Arch heights above node tops (px) */
    const ARCH_BASE   = 14;   /* SHIP→LEARN apex height */
    const ARCH_STEP   = 14;   /* extra height per farther step */
    
    // Bottom return arches
    const RETURN_BASE = 14;   
    const RETURN_STEP = 14;   

    const svgH = nodeBottomY + RETURN_BASE + learnIdx * RETURN_STEP + 4;
    svg.setAttribute('viewBox', `0 0 ${wrapRect.width} ${svgH}`);
    svg.style.height = `${svgH}px`;

    const dark  = document.body.classList.contains('dark');
    const muted = dark ? 'rgba(87,123,193,0.18)' : 'rgba(0,9,87,0.09)';
    const lit   = dark ? '#FFEB00'                : '#344CB7';
    const glow  = dark ? 'rgba(255,235,0,0.35)'  : 'rgba(52,76,183,0.25)';

    /* SVG element factory */
    function svgEl(tag, attrs) {
        const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
        Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
        svg.appendChild(el);
        return el;
    }

    /* Static ghost path */
    function ghostPath(d, dashed = false) {
        svgEl('path', {
            d, stroke: muted, 'stroke-width': '1.5', fill: 'none',
            'stroke-linecap': 'round', 'stroke-linejoin': 'round',
            ...(dashed ? { 'stroke-dasharray': '3 5' } : {}),
        });
    }

    /* Animatable lit path (stroke-dashoffset trick) */
    function animPath(d, width = 2) {
        const p = svgEl('path', {
            d, stroke: lit, 'stroke-width': width,
            fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round',
        });
        const len = p.getTotalLength();
        p.style.strokeDasharray  = len;
        p.style.strokeDashoffset = len;
        p.style.transition = 'stroke-dashoffset 0.55s cubic-bezier(0.4,0,0.2,1), stroke 0.3s';
        arcPaths.push({ el: p, len });
        return p;
    }

    /* Build a smooth cubic bezier arch from (x1,y1) to (x2,y2) with apex at apexY */
    function archPath(x1, y1, x2, y2, apexY) {
        return `M ${x1} ${y1} C ${x1} ${apexY} ${x2} ${apexY} ${x2} ${y2}`;
    }

    /* ── Per-step arches: each step i → LEARN (Incoming paths from top) ── */
    for (let i = 0; i < learnIdx; i++) {
        const { cx, top } = nodeBoxes[i];
        const lTop        = nodeBoxes[learnIdx].top;

        /* Farther from LEARN = higher arch. SHIP (i=learnIdx-1) is lowest. */
        const dist    = learnIdx - 1 - i;           /* 0=SHIP, learnIdx-1=THINK */
        const apexH   = ARCH_BASE + dist * ARCH_STEP;
        const apexY   = nodeTopY - apexH;

        const d = archPath(cx, top, learnCx, lTop, apexY);

        /* Ghost (always visible, muted) */
        ghostPath(d, i < learnIdx - 1);

        /* Animated (lit on step completion) */
        const p = animPath(d, 1.8);
        p.dataset.arcStep = i;
    }

    /* ── Return arcs: LEARN → each step (prominent arches from bottom) ── */
    const learnBottom = nodeBoxes[learnIdx].bottom;

    for (let i = 0; i < learnIdx; i++) {
        const { cx, bottom } = nodeBoxes[i];
        
        // dist from LEARN: i=0 (THINK) is furthest, i=learnIdx-1 (SHIP) is closest.
        const dist = learnIdx - 1 - i; 
        const apexH = RETURN_BASE + dist * RETURN_STEP;
        const apexY = nodeBottomY + apexH;

        const retD = archPath(learnCx, learnBottom, cx, bottom, apexY);
        
        /* Ghost return (dashed) */
        ghostPath(retD, true);

        /* Animated return */
        const isThink = (i === 0);
        const ret = animPath(retD, isThink ? 2.2 : 1.8);
        ret.dataset.arcStep = 'return';

        if (isThink) {
            /* Glow duplicate behind prominent return arc (LEARN -> THINK) */
            const gp = svgEl('path', {
                d: retD, stroke: glow, 'stroke-width': '6',
                fill: 'none', 'stroke-linecap': 'round',
            });
            gp.style.cssText = `stroke-dasharray:${ret.getTotalLength()};stroke-dashoffset:${ret.getTotalLength()};transition:stroke-dashoffset 0.55s cubic-bezier(0.4,0,0.2,1)`;
            svg.insertBefore(gp, ret);
            gp.dataset.arcStep = 'return-glow';
            arcPaths.push({ el: gp, len: gp.getTotalLength() });
        }

        /* Arrowhead pointing upward into the bottom of the node */
        const ax = cx, ay = bottom;
        const arrowEl = svgEl('path', {
            d: `M ${ax - 5} ${ay + 8} L ${ax} ${ay} L ${ax + 5} ${ay + 8}`,
            stroke: lit, 'stroke-width': '2', fill: 'none',
            'stroke-linecap': 'round', 'stroke-linejoin': 'round',
        });
        arrowEl.classList.add('arc-arrow');
        arrowEl.style.cssText = 'opacity:0;transition:opacity 0.5s 0.4s';
    }
}

function lightArcForStep(stepIdx) {
    arcPaths.forEach(({ el }) => {
        if (parseInt(el.dataset.arcStep) === stepIdx)
            el.style.strokeDashoffset = '0';
    });
}

function lightReturnArc() {
    arcPaths.forEach(({ el }) => {
        if (el.dataset.arcStep === 'return' || el.dataset.arcStep === 'return-glow')
            el.style.strokeDashoffset = '0';
    });
    document.querySelectorAll('.arc-arrow').forEach(arr => {
        arr.style.opacity = '1';
    });
}

function resetArcs() {
    arcPaths.forEach(({ el, len }) => {
        el.style.transition = 'none';
        el.style.strokeDashoffset = len;
        void el.getBoundingClientRect();
        el.style.transition = 'stroke-dashoffset 0.55s cubic-bezier(0.4,0,0.2,1), stroke 0.3s';
    });
    document.querySelectorAll('.arc-arrow').forEach(arr => {
        arr.style.transition = 'none';
        arr.style.opacity = '0';
        void arr.getBoundingClientRect();
        arr.style.transition = 'opacity 0.5s 0.4s';
    });
}

function resetPipeline() {
    pipeNodeEls.forEach(n => n.classList.remove('active', 'done'));
    pipeConnectors.forEach(c => {
        c.fill.style.width = '0%';
        c.pkt.classList.remove('go');
    });
    document.getElementById('pipelineCaption').textContent = '— watch the flow —';
    resetArcs();
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function runPipeline() {
    if (pipeRunning) return;
    pipeRunning = true;
    resetPipeline();

    const learnIdx = PIPE_STEPS.length - 1;

    for (let i = 0; i < PIPE_STEPS.length; i++) {
        const step = PIPE_STEPS[i];
        pipeNodeEls[i].classList.add('active');
        document.getElementById('pipelineCaption').textContent = step.caption;
        await sleep(900);

        if (i < learnIdx) {
            pipeNodeEls[i].classList.remove('active');
            pipeNodeEls[i].classList.add('done');

            /* forward connector */
            const { fill, pkt } = pipeConnectors[i];
            pkt.classList.remove('go');
            void pkt.offsetWidth;
            pkt.classList.add('go');
            setTimeout(() => { fill.style.width = '100%'; }, 150);

            /* light the arc from this step up to LEARN */
            lightArcForStep(i);
            await sleep(600);
        } else {
            /* LEARN node */
            pipeNodeEls[i].classList.remove('active');
            pipeNodeEls[i].classList.add('done');
            document.getElementById('pipelineCaption').textContent = '↩  Lessons carry forward — cycle restarts.';
            await sleep(500);
            lightReturnArc();
        }
    }

    pipeRunning = false;

    /* Auto-restart loop after a pause */
    pipeLoopTimer = setTimeout(() => {
        resetPipeline();
        setTimeout(runPipeline, 600);
    }, 3500);
}

function initPipelineObserver() {
    const strip = document.getElementById('pipelineStrip');
    if (!strip) return;

    let triggered = false;
    const obs = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !triggered) {
                triggered = true;
                setTimeout(runPipeline, 400);
            }
        });
    }, { threshold: 0.5 });
    obs.observe(strip);

    /* Redraw arcs on resize so positions stay accurate */
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(drawAgileArcs, 200);
    });
}

/* ============================================================
   PROJECT LIGHTBOX
   ============================================================ */

(function () {
    let currentIndex = 0;
    let mediaList    = [];

    const overlay  = document.getElementById('lbOverlay');
    const panel    = overlay?.querySelector('.lb-panel');
    const viewer   = document.getElementById('lbViewer');
    const strip    = document.getElementById('lbStrip');
    const prevBtn  = document.getElementById('lbPrev');
    const nextBtn  = document.getElementById('lbNext');
    const caption  = document.getElementById('lbCaption');
    const counter  = document.getElementById('lbCounter');
    const closeBtn = document.getElementById('lbClose');
    const badge    = document.getElementById('lbBadge');
    const title    = document.getElementById('lbTitle');
    const desc     = document.getElementById('lbDesc');
    const techRow  = document.getElementById('lbTech');

    if (!overlay) return;

    /* Open lightbox for a given card element */
    function openLightbox(card) {
        mediaList    = JSON.parse(card.dataset.media || '[]');
        currentIndex = 0;

        /* Info panel */
        const badgeClass = card.dataset.badgeClass || 'badge--web';
        badge.className  = 'lb-badge ' + badgeClass;
        badge.textContent = card.dataset.badge || '';
        title.textContent = card.dataset.title || '';
        desc.innerHTML    = card.dataset.desc  || '';

        techRow.innerHTML = '';
        (card.dataset.tech || '').split(',').forEach(t => {
            const s = document.createElement('span');
            s.className   = 'tech-tag';
            s.textContent = t.trim();
            techRow.appendChild(s);
        });

        /* Thumbnail strip */
        strip.innerHTML = '';
        mediaList.forEach((m, i) => {
            const thumb = document.createElement('div');
            thumb.className = 'lb-thumb' + (m.type === 'video' ? ' lb-thumb--video' : '');
            if (m.type === 'video') {
                const vid = document.createElement('video');
                vid.src = m.src;
                vid.muted = true;
                thumb.appendChild(vid);
            } else {
                const img = document.createElement('img');
                img.src  = m.src;
                img.alt  = m.caption || '';
                img.loading = 'lazy';
                thumb.appendChild(img);
            }
            thumb.addEventListener('click', () => goTo(i));
            strip.appendChild(thumb);
        });

        showMedia(0);

        overlay.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        closeBtn.focus();
    }

    /* Render media at index */
    function showMedia(index) {
        currentIndex = index;
        const m = mediaList[index];
        if (!m) return;

        /* Fade out → swap → fade in */
        viewer.style.opacity = '0';
        setTimeout(() => {
            viewer.innerHTML = '';
            if (m.type === 'video') {
                const vid = document.createElement('video');
                vid.src      = m.src;
                vid.controls = true;
                vid.autoplay = true;
                vid.style.maxHeight = '100%';
                viewer.appendChild(vid);
            } else {
                const img = document.createElement('img');
                img.src = m.src;
                img.alt = m.caption || '';
                viewer.appendChild(img);
            }
            viewer.style.opacity = '1';
        }, 150);

        caption.textContent = m.caption || '';
        counter.textContent = `${index + 1} / ${mediaList.length}`;

        /* Update strip active state */
        strip.querySelectorAll('.lb-thumb').forEach((t, i) => {
            t.classList.toggle('active', i === index);
        });

        prevBtn.disabled = index === 0;
        nextBtn.disabled = index === mediaList.length - 1;
    }

    function goTo(i) {
        if (i < 0 || i >= mediaList.length) return;
        showMedia(i);
    }

    function closeLightbox() {
        /* Pause any playing video */
        const vid = viewer.querySelector('video');
        if (vid) { vid.pause(); vid.src = ''; }
        overlay.style.display = 'none';
        document.body.style.overflow = '';
    }

    /* Wire up events */
    prevBtn.addEventListener('click', () => goTo(currentIndex - 1));
    nextBtn.addEventListener('click', () => goTo(currentIndex + 1));
    closeBtn.addEventListener('click', closeLightbox);

    /* Click outside panel to close */
    overlay.addEventListener('click', e => {
        if (!panel.contains(e.target)) closeLightbox();
    });

    /* Keyboard navigation */
    document.addEventListener('keydown', e => {
        if (overlay.style.display === 'none') return;
        if (e.key === 'Escape')      closeLightbox();
        if (e.key === 'ArrowLeft')   goTo(currentIndex - 1);
        if (e.key === 'ArrowRight')  goTo(currentIndex + 1);
    });

    /* Attach click handler to every project card */
    document.querySelectorAll('.proj-card[data-media]').forEach(card => {
        card.addEventListener('click', () => openLightbox(card));
        card.addEventListener('keydown', e => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openLightbox(card);
            }
        });
    });
}());