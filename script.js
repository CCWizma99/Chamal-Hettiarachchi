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
        } else {
            applyDark();
        }
    });

    function applyDark() {
        document.body.classList.add('dark');
        themeIcon.className = 'fa-solid fa-sun';
        localStorage.setItem('wc-theme', 'dark');
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
   PIPELINE BUILD + ANIMATION
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
}

function resetPipeline() {
    pipeNodeEls.forEach(n => n.classList.remove('active', 'done'));
    pipeConnectors.forEach(c => {
        c.fill.style.width = '0%';
        c.pkt.classList.remove('go');
    });
    document.getElementById('pipelineCaption').textContent = '— watch the flow —';
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function runPipeline() {
    if (pipeRunning) return;
    pipeRunning = true;
    resetPipeline();

    for (let i = 0; i < PIPE_STEPS.length; i++) {
        const step = PIPE_STEPS[i];
        pipeNodeEls[i].classList.add('active');
        document.getElementById('pipelineCaption').textContent = step.caption;
        await sleep(900);

        if (i < PIPE_STEPS.length - 1) {
            pipeNodeEls[i].classList.remove('active');
            pipeNodeEls[i].classList.add('done');

            const { fill, pkt } = pipeConnectors[i];
            pkt.classList.remove('go');
            void pkt.offsetWidth;
            pkt.classList.add('go');
            setTimeout(() => { fill.style.width = '100%'; }, 150);
            await sleep(600);
        } else {
            pipeNodeEls[i].classList.remove('active');
            pipeNodeEls[i].classList.add('done');
            document.getElementById('pipelineCaption').textContent = '✦  That\'s how it ships.';
        }
    }

    pipeRunning = false;

    /* Auto-restart loop after a pause */
    pipeLoopTimer = setTimeout(() => {
        resetPipeline();
        setTimeout(runPipeline, 600);
    }, 3000);
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
}