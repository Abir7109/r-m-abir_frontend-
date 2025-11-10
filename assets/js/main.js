/* Main JS for R.M.Abir71 Portfolio */
(function () {
  const qs = (s, el=document) => el.querySelector(s);
  const qsa = (s, el=document) => [...el.querySelectorAll(s)];

  // Theme toggle
  const themeToggle = qs('#themeToggle');
  const root = document.documentElement;
  const storedTheme = localStorage.getItem('theme');
  if (storedTheme) root.setAttribute('data-theme', storedTheme);
  themeToggle.checked = root.getAttribute('data-theme') !== 'dark' ? false : true;
  themeToggle.addEventListener('change', () => {
    const theme = themeToggle.checked ? 'dark' : 'light';
    root.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  });

  // Sticky header
  const header = qs('.site-header');
  const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 10);
  document.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Mobile nav
  const navToggle = qs('.nav-toggle');
  const navLinks = qs('.nav-links');
  navToggle.addEventListener('click', () => {
    const open = !navLinks.classList.contains('open');
    navLinks.classList.toggle('open', open);
    navToggle.setAttribute('aria-expanded', String(open));
  });

  // Smooth scroll
  qsa('a[href^="#"]').forEach(a => a.addEventListener('click', (e) => {
    const id = a.getAttribute('href');
    if (id.length > 1) {
      e.preventDefault();
      qs(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      history.replaceState(null, '', id);
    }
  }));

  // Typewriter
  const phrases = [
    'Visionary Developer',
    'Creative Architect',
    'Digital Connector'
  ];
  const twEl = qs('#typewriter');
  let pi = 0, ci = 0, del = false;
  function tick() {
    const p = phrases[pi % phrases.length];
    twEl.textContent = p.slice(0, ci);
    if (!del && ci < p.length) ci++;
    else if (del && ci > 0) ci--;
    else if (!del && ci === p.length) del = true;
    else if (del && ci === 0) { del = false; pi++; }
    setTimeout(tick, del ? 50 : 100);
  }
  tick();

  // Project filters
  const chips = qsa('.chip');
  const cards = qsa('.project-card');
  chips.forEach(ch => ch.addEventListener('click', () => {
    chips.forEach(c => c.classList.remove('active'));
    ch.classList.add('active');
    const f = ch.dataset.filter;
    cards.forEach(card => {
      const show = f === 'all' || card.dataset.tech === f;
      card.style.display = show ? '' : 'none';
    });
  }));

  // Case study buttons to open <details>
  qsa('[data-case]').forEach(btn => btn.addEventListener('click', () => {
    const id = 'case-' + btn.dataset.case;
    qs('#' + id)?.setAttribute('open', 'open');
    qs('#' + id)?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }));

  // Skills tilt interaction
  const skillTiles = qsa('.skills-grid .tile');
  const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (skillTiles.length) {
    skillTiles.forEach(tile => {
      if (reduceMotion) {
        tile.addEventListener('mouseenter', () => tile.classList.add('hover'));
        tile.addEventListener('mouseleave', () => tile.classList.remove('hover'));
        return;
      }
      tile.addEventListener('pointermove', (e) => {
        const r = tile.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        const rx = (py - 0.5) * 10; // tilt X
        const ry = (0.5 - px) * 10; // tilt Y
        tile.style.setProperty('--rx', rx.toFixed(2) + 'deg');
        tile.style.setProperty('--ry', ry.toFixed(2) + 'deg');
      });
      tile.addEventListener('pointerleave', () => {
        tile.style.removeProperty('--rx');
        tile.style.removeProperty('--ry');
      });
    });
  }

  // Journey route animation and checkpoints
  const routeEl = qs('#journeyRoute');
  function getActivePath() {
    const dSvg = qs('#journeySvgDesktop');
    const mSvg = qs('#journeySvgMobile');
    const dVisible = dSvg && getComputedStyle(dSvg).display !== 'none';
    if (dVisible) return { path: qs('#routeProgress'), base: qs('#routeBase'), dot: qs('#routeDot') };
    return { path: qs('#routeProgressMobile'), base: qs('#routeBaseMobile'), dot: qs('#routeDotMobile') };
  }
  if (routeEl) {
    const cps = [
      { pos: 0.05, year: '2016', text: 'Start Coding 💻' },
      { pos: 0.35, year: '2020', text: '1st Successful Website 🌐' },
      { pos: 0.65, year: '2022', text: '1st Income 💰' },
      { pos: 0.95, year: '2025', text: 'Professional Coder 🚀' },
    ];

    function setupCheckpoints(pathEl) {
      const len = pathEl.getTotalLength();
      cps.forEach(cp => {
        const p = pathEl.getPointAtLength(cp.pos * len);
        const el = document.createElement('div');
        el.className = 'checkpoint ' + (cp.pos < 0.5 ? 'above' : 'below');
        el.style.left = (p.x / pathEl.ownerSVGElement.viewBox.baseVal.width * 100) + '%';
        el.style.top = (p.y / pathEl.ownerSVGElement.viewBox.baseVal.height * 100) + '%';
        el.innerHTML = `<div class=\"dot\"></div><span class=\"pill\">${cp.year}</span><div class=\"card\"><strong>${cp.year}</strong><br/>${cp.text}</div>`;
        routeEl.appendChild(el);
        cp._el = el; cp._abs = cp.pos * len;
      });
      return len;
    }

    let { path: prog, base, dot } = getActivePath();
    let totalLen = setupCheckpoints(base);

    // initialize dash arrays
    function initPath(p) {
      const L = p.getTotalLength();
      p.style.strokeDasharray = String(L);
      p.style.strokeDashoffset = String(L);
    }
    initPath(prog);

    function onResize() {
      // Recompute for current visible SVG
      const active = getActivePath();
      if (active.path !== prog) {
        // clear old checkpoints
        cps.forEach(cp => cp._el && cp._el.remove());
        prog = active.path; base = active.base; dot = active.dot;
        totalLen = setupCheckpoints(base);
        initPath(prog);
        update();
      }
    }
    window.addEventListener('resize', () => requestAnimationFrame(onResize));

    function computeScrollProgress() {
      const rect = routeEl.getBoundingClientRect();
      const vh = window.innerHeight;
      // Immediate edge cases
      if (rect.bottom <= 0) return 1;           // completely passed
      if (rect.top >= vh) return 0;            // not entered yet
      // Map from when the section top enters the viewport bottom (vh)
      // to slightly before the bottom leaves the top, so it finishes earlier
      const span = vh + rect.height * 0.4;     // finish ~60% into leaving
      const y = vh - rect.top;                 // distance travelled through the viewport
      const r = Math.min(1, Math.max(0, y / span));
      return r;
    }

    function update() {
      const r = computeScrollProgress();
      const L = prog.getTotalLength();
      prog.style.strokeDashoffset = String(L * (1 - r));
      const pt = base.getPointAtLength(r * totalLen);
      dot.setAttribute('cx', pt.x);
      dot.setAttribute('cy', pt.y);
      // activate checkpoints
      cps.forEach(cp => {
        const hit = r * totalLen >= cp._abs - 2;
        cp._el?.classList.toggle('hit', hit);
        cp._el?.classList.toggle('active', Math.abs(r * totalLen - cp._abs) < 8);
      });
    }

    const io = new IntersectionObserver((entries) => {
      if (entries.some(e => e.isIntersecting)) {
        const loop = () => { update(); raf = requestAnimationFrame(loop); };
        if (!raf) loop();
      } else if (raf) { cancelAnimationFrame(raf); raf = null; }
    }, { threshold: 0.05 });
    let raf = null; io.observe(routeEl);
    document.addEventListener('scroll', () => raf || update(), { passive: true });
  }

  // Blog posts (sample data)
  const posts = [
    { title: 'Designing with Motion', tags: ['design'], date: '2025-10-01', excerpt: 'Principles for tasteful animation.' },
    { title: 'DevOps for Solo Devs', tags: ['devops'], date: '2025-09-20', excerpt: 'CI/CD without the pain.' },
    { title: 'Cultural UX Insights', tags: ['culture', 'design'], date: '2025-08-15', excerpt: 'Cross‑cultural design notes.' }
  ];
  const blogList = qs('#blogList');
  const blogSearch = qs('#blogSearch');
  const tagBtns = qsa('.tag');
  let activeTag = 'all';
  function renderPosts() {
    blogList.innerHTML = '';
    const q = blogSearch.value.trim().toLowerCase();
    posts.filter(p => (activeTag === 'all' || p.tags.includes(activeTag)) &&
                      (p.title.toLowerCase().includes(q) || p.excerpt.toLowerCase().includes(q)))
         .forEach(p => {
           const li = document.createElement('li');
           li.innerHTML = `<strong>${p.title}</strong> · <em>${p.date}</em><br/>${p.excerpt}`;
           blogList.appendChild(li);
         });
  }
  blogSearch.addEventListener('input', renderPosts);
  tagBtns.forEach(b => b.addEventListener('click', () => {
    tagBtns.forEach(x => x.classList.remove('active'));
    b.classList.add('active');
    activeTag = b.dataset.tag;
    renderPosts();
  }));
  renderPosts();

  // About: counters and tabs + avatar parallax
  const about = qs('#about');
  if (about) {
    // animated counters
    const nums = qsa('.stat .num', about).filter(n => n.hasAttribute('data-to'));
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          nums.forEach(n => {
            if (n.dataset.done) return;
            n.dataset.done = '1';
            const to = parseInt(n.getAttribute('data-to'), 10) || 0;
            const suf = n.getAttribute('data-suffix') || '';
            const t0 = performance.now();
            const dur = 1200;
            function tick(ts){
              const p = Math.min(1, (ts - t0) / dur);
              n.textContent = Math.round(to * p) + suf;
              if (p < 1) requestAnimationFrame(tick);
            }
            requestAnimationFrame(tick);
          });
          io.disconnect();
        }
      });
    }, { threshold: 0.3 });
    io.observe(about);

    // tabs
    const tabs = qsa('.about-tabs .tab', about);
    const panes = qsa('.about-tabpanes .pane', about);
    tabs.forEach(tab => tab.addEventListener('click', () => {
      const id = tab.dataset.tab;
      tabs.forEach(t => { t.classList.toggle('active', t===tab); t.setAttribute('aria-selected', t===tab ? 'true' : 'false'); });
      panes.forEach(p => p.classList.toggle('active', p.id === 'tab-' + id));
    }));

    // avatar parallax
    const av = qs('.avatar.large', about);
    if (av) {
      av.addEventListener('pointermove', (e) => {
        const r = av.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        const x = (px - 0.5) * 4; // minor shift
        const y = (py - 0.5) * 4;
        av.style.backgroundPosition = `calc(50% + ${x}%) calc(52% + ${y}%)`;
      });
      av.addEventListener('pointerleave', () => {
        av.style.backgroundPosition = '50% 52%';
      });
    }
  }

  // Skills animation (bars + circles)
  const skills = qs('#skills');
  if (skills) {
    const run = () => {
      qsa('.bar-fill', skills).forEach(b => {
        const p = Number(b.dataset.p || '0');
        b.style.width = p + '%';
      });
      qsa('.circle-progress', skills).forEach(c => {
        const p = Number(c.dataset.p || '0');
        const r = c.r.baseVal.value; const C = 2 * Math.PI * r;
        c.style.strokeDasharray = String(C);
        c.style.strokeDashoffset = String(C);
        // animate dashoffset
        const start = performance.now(); const dur = 1400; 
        function anim(ts){
          const t = Math.min(1, (ts - start)/dur);
          c.style.strokeDashoffset = String(C * (1 - (p/100)*t));
          if (t < 1) requestAnimationFrame(anim);
        }
        requestAnimationFrame(anim);
        // numeric value in center
        const wrap = c.closest('.circle');
        if (wrap) {
          let v = wrap.querySelector('.circle-val');
          if (!v) { v = document.createElement('div'); v.className = 'circle-val';
            const meta = wrap.querySelector('.circle-meta');
            if (meta) wrap.insertBefore(v, meta); else wrap.appendChild(v);
          }
          const nstart = performance.now(); const ndur = 900; 
          function num(ts){
            const t = Math.min(1, (ts - nstart)/ndur);
            v.textContent = Math.round(p*t) + '%';
            if (t < 1) requestAnimationFrame(num);
          }
          requestAnimationFrame(num);
        }
      });
    };
    const io = new IntersectionObserver((entries) => {
      if (entries.some(e => e.isIntersecting)) { run(); io.disconnect(); }
    }, { threshold: 0.25 });
    io.observe(skills);
  }

  // Simple i18n (EN/JA)
  const strings = {
    en: { home: 'Home', about: 'About', projects: 'Projects', resume: 'Resume', blog: 'Blog', contact: 'Contact', explore: 'Explore My Work' },
    ja: { home: 'ホーム', about: '自己紹介', projects: '制作物', resume: '履歴書', blog: 'ブログ', contact: '連絡', explore: '作品を見る' }
  };
  const langSelect = qs('#langSelect');
  function applyLang(lang) {
    qsa('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (strings[lang] && strings[lang][key]) el.textContent = strings[lang][key];
    });
    localStorage.setItem('lang', lang);
  }
  const savedLang = localStorage.getItem('lang') || 'en';
  langSelect.value = savedLang; applyLang(savedLang);
  langSelect.addEventListener('change', () => applyLang(langSelect.value));

  // Contact form (client-only demo)
  const form = qs('#contactForm');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    if (!data.name || !data.email || !data.message) {
      alert('Please fill all required fields.');
      return;
    }
    // Demo: log and fake success; integrate backend or service later
    console.log('Contact submission', data);
    localStorage.setItem('lastContact', JSON.stringify({ ...data, ts: Date.now() }));
    alert('Thanks! I will get back to you.');
    form.reset();
  });

  // Contrast toggle for accessibility
  qs('#contrastToggle').addEventListener('click', () => {
    root.classList.toggle('contrast');
    localStorage.setItem('contrast', root.classList.contains('contrast') ? '1' : '0');
  });
  if (localStorage.getItem('contrast') === '1') root.classList.add('contrast');

  // Bot assistant (toy)
  const botToggle = qs('#botToggle');
  const botPanel = qs('#botPanel');
  const botBody = qs('#botBody');
  const botForm = qs('#botForm');
  const botInput = qs('#botInput');
  const botClose = qs('.bot-header .close');

  function botSay(txt) {
    const div = document.createElement('div');
    div.className = 'bot-msg';
    div.textContent = txt;
    botBody.appendChild(div);
    botBody.scrollTop = botBody.scrollHeight;
  }
  function botReply(q) {
    const s = q.toLowerCase();
    if (s.includes('mess')) return 'Mess Manager: full-stack app with billing and analytics.';
    if (s.includes('vault')) return 'Cousins Vault: family‑first knowledge base with RBAC.';
    if (s.includes('japanese')) return 'Japanese Coaching: JLPT practice with SRS and voice.';
    if (s.includes('contact')) return 'Use the Contact section or email me — happy to connect!';
    return 'Ask about projects, blog, or resume. Type "projects" to jump there.';
  }
  botToggle.addEventListener('click', () => {
    const open = !botPanel.classList.contains('open');
    botPanel.classList.toggle('open', open);
    botToggle.setAttribute('aria-expanded', String(open));
    if (open && botBody.childElementCount === 0) botSay('Hi! I\'m your guide.');
  });
  botClose.addEventListener('click', () => botPanel.classList.remove('open'));
  botForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const q = botInput.value.trim(); if (!q) return;
    botSay('You: ' + q);
    const r = botReply(q);
    botSay('Bot: ' + r);
    if (q.toLowerCase().includes('project')) qs('#projects')?.scrollIntoView({ behavior: 'smooth' });
    botInput.value = '';
  });

  // Local analytics (basic)
  const analytics = JSON.parse(localStorage.getItem('analytics') || '{}');
  analytics.visits = (analytics.visits || 0) + 1;
  analytics.lastVisit = Date.now();
  function trackClick(e) {
    const key = 'clicks';
    analytics[key] = (analytics[key] || 0) + 1;
    localStorage.setItem('analytics', JSON.stringify(analytics));
  }
  document.addEventListener('click', trackClick);
  localStorage.setItem('analytics', JSON.stringify(analytics));

  // Footer year
  qs('#year').textContent = new Date().getFullYear();

  // PWA registration
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/service-worker.js').catch(console.error);
    });
  }
})();
