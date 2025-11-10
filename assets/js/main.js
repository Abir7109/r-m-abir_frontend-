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

  // Project filters + reveal + favorites
  const chips = qsa('.chip');
  const cards = qsa('.project-card');
  const FAV_KEY = 'favorites:v1';
  let favs = new Set(JSON.parse(localStorage.getItem(FAV_KEY) || '[]'));
  function applyFavState(card){
    const id = card.getAttribute('data-repo') || card.querySelector('.name')?.textContent?.trim() || card.getAttribute('data-rank');
    const isFav = favs.has(id);
    card.classList.toggle('favorited', isFav);
    const btn = card.querySelector('[data-fav]');
    if (btn) btn.setAttribute('aria-pressed', String(isFav));
  }
  cards.forEach(applyFavState);

  chips.forEach(ch => ch.addEventListener('click', () => {
    chips.forEach(c => c.classList.remove('active'));
    ch.classList.add('active');
    const f = ch.dataset.filter;
    cards.forEach(card => {
      const show = f === 'all' || card.dataset.tech === f || (f === 'fav' && card.classList.contains('favorited'));
      card.style.display = show ? '' : 'none';
      card.setAttribute('aria-hidden', show ? 'false' : 'true');
    });
  }));
  // reveal on scroll
  const projIo = new IntersectionObserver(es => {
    es.forEach(e => { if (e.isIntersecting) e.target.classList.add('reveal'); });
  }, { threshold: 0.2 });
  qsa('.project-card.neo').forEach(c => projIo.observe(c));

  // Favorites toggle + keyboard shortcut (f)
  qsa('.project-card .fav-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const card = e.currentTarget.closest('.project-card');
      const id = card.getAttribute('data-repo') || card.querySelector('.name')?.textContent?.trim() || card.getAttribute('data-rank');
      if (favs.has(id)) favs.delete(id); else favs.add(id);
      localStorage.setItem(FAV_KEY, JSON.stringify([...favs]));
      applyFavState(card);
    });
    const card = btn.closest('.project-card');
    card.setAttribute('tabindex', '0');
    card.addEventListener('keydown', (ev) => {
      if (ev.key.toLowerCase() === 'f') { ev.preventDefault(); btn.click(); }
    });
  });

  // Share buttons
  qsa('.project-card .share-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const card = e.currentTarget.closest('.project-card');
      const title = card.querySelector('.name')?.textContent?.trim() || 'Project';
      const url = card.getAttribute('data-live') || location.href;
      const text = `${title} — ${url}`;
      if (navigator.share) {
        navigator.share({ title, url, text }).catch(() => {/* ignore */});
      } else if (navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(url).then(() => {
          btn.classList.add('ok'); setTimeout(() => btn.classList.remove('ok'), 800);
        });
      } else {
        alert(text);
      }
    });
  });

  // Tilt on hover
  qsa('.project-card.neo').forEach(card => {
    const imgEl = card.querySelector('.shot .img');
    card.addEventListener('pointermove', (e) => {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      const rx = (py) * 6, ry = (-px) * 6;
      card.style.transform = `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-4px)`;
      if (imgEl) imgEl.style.backgroundPosition = `calc(50% + ${px*4}%) calc(50% + ${py*4}%)`;
    });
    card.addEventListener('pointerleave', () => {
      card.style.transform = '';
      if (imgEl) imgEl.style.backgroundPosition = '';
    });
  });

  // Auto set thumbnails from project metadata (Open Graph)
  async function fetchOg(url) {
    try {
      const u = new URL(url);
      const proxy = `https://r.jina.ai/${u.protocol}//${u.host}${u.pathname}`;
      const res = await fetch(proxy, { headers: { 'Accept': 'text/html' } });
      if (!res.ok) throw new Error('fetch failed');
      const txt = await res.text();
      const m = txt.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["'][^>]*>/i)
             || txt.match(/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["'][^>]*>/i);
      if (m && m[1]) {
        const abs = new URL(m[1], url).href; return abs;
      }
    } catch (e) { /* ignore */ }
    return null;
  }
  (async () => {
    const items = qsa('.project-card.neo');
    for (const card of items) {
      if (card.hasAttribute('data-thumb')) continue; // use provided thumbnail
      const live = card.getAttribute('data-live') || card.querySelector('.actions a[href]')?.href;
      if (!live || live === '#') continue;
      const img = await fetchOg(live);
      if (img) {
        const el = card.querySelector('.shot .img');
        if (el) {
          el.style.setProperty('--bg', `url('${img}')`);
          el.style.background = `url('${img}') center/cover no-repeat`;
        }
      }
    }
  })();

  // Project modal
  const modal = qs('#projectModal');
  if (modal) {
    const dialog = qs('.proj-dialog', modal);
    const closeBtn = qs('.proj-close', modal);
    const backdrop = qs('.proj-backdrop', modal);
    const mTitle = qs('.proj-title', modal);
    const mDesc = qs('.proj-desc', modal);
    const mBullets = qs('.proj-bullets', modal);
    const mBadges = qs('.proj-badges', modal);
    const mMedia = qs('.proj-media', modal);
    const mDemo = qs('.proj-demo', modal);
    const mRepo = qs('.proj-repo', modal);

    function openFrom(card){
      const title = card.querySelector('.name')?.textContent || 'Case Study';
      const desc = card.querySelector('.desc')?.textContent || '';
      const bullets = card.querySelector('.bullets')?.innerHTML || '';
      const badges = card.querySelector('.badges')?.innerHTML || '';
      const live = card.getAttribute('data-live') || card.querySelector('.actions a[href]')?.href || '#';
      const repo = card.getAttribute('data-repo') || card.querySelector('.actions a[href*="github.com"]')?.href || '#';
      const bg = getComputedStyle(card.querySelector('.shot .img')).backgroundImage;

      mTitle.textContent = title;
      mDesc.textContent = desc;
      mBullets.innerHTML = bullets;
      mBadges.innerHTML = badges;
      mDemo.href = live; mRepo.href = repo;
      mMedia.style.background = bg;
      modal.classList.add('open');
      modal.setAttribute('aria-hidden','false');
    }
    function close(){ modal.classList.remove('open'); modal.setAttribute('aria-hidden','true'); }

    qsa('.project-card [data-case]').forEach(btn => btn.addEventListener('click', (e) => {
      const card = e.currentTarget.closest('.project-card');
      if (card) openFrom(card);
    }));
    closeBtn?.addEventListener('click', close);
    backdrop?.addEventListener('click', close);
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && modal.classList.contains('open')) close(); });
  }

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
        el.className = 'checkpoint'; // always position above
        el.style.left = (p.x / pathEl.ownerSVGElement.viewBox.baseVal.width * 100) + '%';
        el.style.top = (p.y / pathEl.ownerSVGElement.viewBox.baseVal.height * 100) + '%';
        el.innerHTML = `<div class=\"dot\"></div><span class=\"pill\">${cp.year}</span><div class=\"card\"><strong>${cp.year}</strong><br/>${cp.text}</div>`;
        routeEl.appendChild(el);
        // prevent overflow horizontally
        const card = el.querySelector('.card');
        const rC = routeEl.getBoundingClientRect();
        const rK = card.getBoundingClientRect();
        if (rK.right > rC.right - 8) el.classList.add('align-right');
        else if (rK.left < rC.left + 8) el.classList.add('align-left');
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

  // Blog posts (4 only)
  const posts = [
    { 
      id: 'motion-ux-2025',
      title: 'Why Subtle Motion Improves UX in 2025', 
      tags: ['design'], 
      date: '2025-11-10', 
      excerpt: 'Micro‑interactions guide attention, reduce cognitive load, and create a premium feel—without distracting users.',
      img: '/assets/img/blog/design.svg',
      content: `
        <p>Motion is a language. When used with restraint, it <strong>communicates hierarchy</strong>, 
        <strong>reinforces causality</strong>, and gently <strong>guides attention</strong>.</p>
        <h4>Principles</h4>
        <ul>
          <li>Prefer <em>0.18–0.28s</em> durations and ease-out curves.</li>
          <li>Animate <em>position, opacity, scale</em>—avoid layout thrash.</li>
          <li>Respect <code>prefers-reduced-motion</code> with graceful fallbacks.</li>
        </ul>
        <p>Great motion is invisible: it <em>feels</em> right, then gets out of the way.</p>
      `
    },
    { 
      id: 'actions-matrix-builds',
      title: 'Ship Faster with GitHub Actions Matrix Builds', 
      tags: ['devops'], 
      date: '2025-11-05', 
      excerpt: 'Parallelize tests across Node versions and OSes, cache dependencies smartly, and keep pipelines under 5 minutes.',
      img: '/assets/img/blog/devops.svg',
      content: `
        <p>Matrix builds run jobs in parallel across environments. Combine them with 
        <strong>setup-node cache</strong> and <strong>artifact reuse</strong> for serious speedups.</p>
        <pre><code>strategy:
  matrix:
    node: [18, 20]
    os: [ubuntu-latest, windows-latest]</code></pre>
        <p>Keep logs readable, fail fast, and surface flaky tests early.</p>
      `
    },
    { 
      id: 'dark-mode-contrast',
      title: 'Designing for Dark Mode: Contrast & Color', 
      tags: ['design'], 
      date: '2025-10-28', 
      excerpt: 'Avoid pure black, lean on semantic tokens, and validate contrast for real environments and OLED screens.',
      img: '/assets/img/blog/design.svg',
      content: `
        <p>True black (#000) can cause eye strain and haloing. Prefer deep chroma backgrounds 
        and <strong>semantic color tokens</strong> to theme consistently.</p>
        <ul>
          <li>Check contrast for text and icons, not just body copy.</li>
          <li>Use elevation and subtle borders for separation.</li>
          <li>Test on OLED at low brightness.</li>
        </ul>
      `
    },
    { 
      id: 'cultural-ux-rtl',
      title: 'Cultural UX: RTL, Locales, and Emoji Pitfalls', 
      tags: ['culture','design'], 
      date: '2025-10-12', 
      excerpt: 'Layout mirroring, pluralization, and font fallback can break faster than you think—plan for them upfront.',
      img: '/assets/img/blog/culture.svg',
      content: `
        <p>Localization is more than translation. Arabic/RTL needs <strong>mirrored UI</strong>; 
        languages like Russian change <strong>plural forms</strong>.</p>
        <p>Emoji render differently across platforms—avoid using them as critical UI.</p>
        <p>Bake i18n into design tokens and component APIs early.</p>
      `
    }
  ];
  const blogList = qs('#blogList');
  const blogSearch = qs('#blogSearch');
  const tagBtns = qsa('.tag');
  const viewGrid = qs('#blogViewGrid');
  const viewList = qs('#blogViewList');
  const blogSort = qs('#blogSort');
  const tagLogos = {
    design: '/assets/img/blog/design.svg',
    devops: '/assets/img/blog/devops.svg',
    culture: '/assets/img/blog/culture.svg'
  };
  let activeTag = 'all';
  const state = {
    view: localStorage.getItem('blog:view') || 'grid',
    sort: localStorage.getItem('blog:sort') || 'new'
  };
  function fmtDate(s){ try{ return new Date(s).toLocaleDateString(undefined,{year:'numeric',month:'short',day:'numeric'});}catch{ return s; } }
  function estimateMin(p){ const words = (p.title + ' ' + p.excerpt).split(/\s+/).length; return Math.max(1, Math.round(words/200)); }
  function hueFrom(str){ let h=0; for (let i=0;i<str.length;i++) h=(h+str.charCodeAt(i)*7)%360; return h; }
  function escReg(s){ return s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'); }
  function hi(text,q){ if(!q) return text; const re=new RegExp(escReg(q), 'ig'); return text.replace(re, m=>`<mark class="hl">${m}</mark>`); }
  function sortItems(arr){
    if (state.sort==='az') return [...arr].sort((a,b)=>a.title.localeCompare(b.title));
    if (state.sort==='old') return [...arr].sort((a,b)=>new Date(a.date)-new Date(b.date));
    return [...arr].sort((a,b)=>new Date(b.date)-new Date(a.date));
  }
  function applyView(){ blogList.classList.toggle('list', state.view==='list'); viewGrid.classList.toggle('active', state.view==='grid'); viewList.classList.toggle('active', state.view==='list'); }
  const REMOVED_KEY = 'blog:removed:v1';
  const removed = new Set(JSON.parse(localStorage.getItem(REMOVED_KEY) || '[]'));
  function saveRemoved(){ localStorage.setItem(REMOVED_KEY, JSON.stringify([...removed])); }
  function renderPosts() {
    blogList.innerHTML = '';
    const q = blogSearch?.value?.trim().toLowerCase() || '';
    const filtered = posts.filter(p => !removed.has(p.id) && (activeTag === 'all' || p.tags.includes(activeTag)) &&
                      (p.title.toLowerCase().includes(q) || p.excerpt.toLowerCase().includes(q)));
    const items = sortItems(filtered).slice(0, 4);
    items.forEach((p, idx) => {
      const li = document.createElement('li');
      li.className = 'post-card';
      li.setAttribute('role','listitem');
      li.dataset.index = String(posts.indexOf(p));
      const h = hueFrom(p.title);
      const primary = (p.tags && p.tags[0]) || 'design';
      const img = p.img || tagLogos[primary];
      li.innerHTML = `
        <div class="thumb" style="--h:${h}" role="button" aria-label="Open article: ${p.title}" tabindex="0">
          ${img ? `<img src=\"${img}\" alt=\"${p.title} thumbnail\" class=\"thumb-img\" loading=\"lazy\"/>` : ''}
        </div>
        <div class="pc-body">
          <div class="pc-head">
            <h3 class="pc-title">${hi(p.title, q)}</h3>
            <div class="pc-head-actions">
              <span class="pc-date">${fmtDate(p.date)}</span>
              <button class="icon-btn remove-btn" aria-label="Remove post" title="Remove">✕</button>
            </div>
          </div>
          <p class="pc-excerpt">${hi(p.excerpt, q)}</p>
          <div class="pc-meta">
            <span class="pill">${estimateMin(p)} min</span>
            ${p.tags.map(t=>`<span class=\"pill\">#${t}</span>`).join('')}
          </div>
        </div>`;
      // only the logo/thumbnail opens the article
      const thumb = li.querySelector('.thumb');
      if (thumb) {
        const open = () => openBlogFromIndex(Number(li.dataset.index||'0'));
        thumb.addEventListener('click', open);
        thumb.addEventListener('keydown', (e)=>{ if(e.key==='Enter' || e.key===' ') { e.preventDefault(); open(); } });
      }
      // remove button
      const rm = li.querySelector('.remove-btn');
      if (rm) {
        rm.addEventListener('click', (e)=>{
          e.stopPropagation();
          if (confirm('Remove this post from view?')) {
            const p = posts[Number(li.dataset.index||'0')];
            if (p?.id) { removed.add(p.id); saveRemoved(); renderPosts(); }
          }
        });
      }
      blogList.appendChild(li);
    });
    // reveal animation
    const io = new IntersectionObserver(es => es.forEach(e=> e.isIntersecting && e.target.classList.add('reveal')), { threshold: .15 });
    qsa('.post-card', blogList).forEach(x=>io.observe(x));
  }
  blogSearch?.addEventListener('input', renderPosts);
  tagBtns.forEach(b => b.addEventListener('click', () => {
    tagBtns.forEach(x => x.classList.remove('active'));
    b.classList.add('active');
    activeTag = b.dataset.tag;
    renderPosts();
  }));
  viewGrid?.addEventListener('click', ()=>{ state.view='grid'; localStorage.setItem('blog:view','grid'); applyView(); });
  viewList?.addEventListener('click', ()=>{ state.view='list'; localStorage.setItem('blog:view','list'); applyView(); });
  blogSort?.addEventListener('change', ()=>{ state.sort=blogSort.value; localStorage.setItem('blog:sort', state.sort); renderPosts(); });
  applyView();
  renderPosts();

  // Blog modal (reader)
  const bModal = qs('#blogModal');
  if (bModal) {
    const bDialog = qs('.blog-dialog', bModal);
    const bClose = qs('.blog-close', bModal);
    const bBackdrop = qs('.blog-backdrop', bModal);
    const bTitle = qs('.blog-title', bModal);
    const bDate = qs('.blog-date', bModal);
    const bTags = qs('.blog-tags', bModal);
    const bThumb = qs('.blog-thumb', bModal);
    const bBody = qs('.blog-body', bModal);

    function openBlogFromIndex(i){
      const p = posts[i]; if (!p) return;
      bTitle.textContent = p.title;
      bDate.textContent = fmtDate(p.date);
      bTags.innerHTML = (p.tags||[]).map(t=>`<li>#${t}</li>`).join('');
      bThumb.style.backgroundImage = p.img ? `url('${p.img}')` : '';
      bThumb.classList.toggle('has-img', Boolean(p.img));
      bBody.innerHTML = p.content || `<p>${p.excerpt}</p>`;
      bModal.classList.add('open');
      bModal.setAttribute('aria-hidden','false');
      setTimeout(()=> bClose?.focus(), 0);
    }
    window.openBlogFromIndex = openBlogFromIndex;
    const close = () => { bModal.classList.remove('open'); bModal.setAttribute('aria-hidden','true'); };
    bClose?.addEventListener('click', close);
    bBackdrop?.addEventListener('click', close);
    document.addEventListener('keydown', (e)=>{ if (e.key==='Escape' && bModal.classList.contains('open')) close(); });
  }

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
