// hero-3d-setup.js — local copy with tuned fluid config
// Original from https://slater.app/20545/63349.js
(() => {
  "use strict";

  const CONFIG = {
    stageSelector: '[data-trail="stage"]',
    layerSelector: '[data-trail="layer"]',
    depthMapSelector: "[data-depth-map]",
    depthAssign: { 0: "driver", 1: "car", 2: "background" },
    depthRange: { 0: [0, 1], 1: [0, 1], 2: [0, 1] },
    depthFill: { 0: 0.4, 1: 0.1, 2: 0.03 },
    parallax: 0.015,
    focus: 0.0,
    inertia: 0.025,
    brushSize: 2.8,
    force: 3,
    dyeAmount: 0.65,
    curl: 4,
    velocityFade: 0.906,
    trailFade: 0.90,
    pressureIters: 12,
    depthBlock: 0.33,
    depthCling: 0.6,
    depthBias: 0.9,
    threshold: 0.55,
    edgeHardness: 0.90,
    graySaturation: 0.0,
    grayBrightness: 0.92,
    simScale: 0.4,
    maxPixelRatio: 1.5,
  };

  const SIM_VERT = `
    varying vec2 vUv;
    varying vec2 vL, vR, vT, vB;
    uniform vec2 u_texel;
    void main () {
      vUv = uv;
      vL = vUv - vec2(u_texel.x, 0.);
      vR = vUv + vec2(u_texel.x, 0.);
      vT = vUv + vec2(0., u_texel.y);
      vB = vUv - vec2(0., u_texel.y);
      gl_Position = vec4(position.xy, 0., 1.);
    }
  `;

  const FRAG_SPLAT = `
    precision highp float;
    varying vec2 vUv;
    uniform sampler2D u_input;
    uniform float u_ratio;
    uniform vec3 u_value;
    uniform vec2 u_point;
    uniform float u_size;
    void main () {
      vec2 p = vUv - u_point;
      p.x *= u_ratio;
      vec3 splat = pow(2., -dot(p, p) / u_size) * u_value;
      vec3 base = texture2D(u_input, vUv).xyz;
      gl_FragColor = vec4(base + splat, 1.);
    }
  `;

  const FRAG_CURL = `
    precision highp float;
    varying vec2 vUv, vL, vR, vT, vB;
    uniform sampler2D u_velocity;
    void main () {
      float L = texture2D(u_velocity, vL).y;
      float R = texture2D(u_velocity, vR).y;
      float T = texture2D(u_velocity, vT).x;
      float B = texture2D(u_velocity, vB).x;
      gl_FragColor = vec4(.5 * (R - L - T + B), 0., 0., 1.);
    }
  `;

  const FRAG_VORTICITY = `
    precision highp float;
    varying vec2 vUv, vL, vR, vT, vB;
    uniform sampler2D u_velocity;
    uniform sampler2D u_curl;
    uniform float u_strength;
    uniform float u_dt;
    void main () {
      float L = texture2D(u_curl, vL).x;
      float R = texture2D(u_curl, vR).x;
      float T = texture2D(u_curl, vT).x;
      float B = texture2D(u_curl, vB).x;
      float C = texture2D(u_curl, vUv).x;
      vec2 force = .5 * vec2(abs(T) - abs(B), abs(R) - abs(L));
      force /= length(force) + .0001;
      force *= u_strength * C;
      force.y *= -1.;
      vec2 vel = texture2D(u_velocity, vUv).xy + force * u_dt;
      gl_FragColor = vec4(clamp(vel, -1000., 1000.), 0., 1.);
    }
  `;

  const FRAG_DIVERGENCE = `
    precision highp float;
    varying vec2 vUv, vL, vR, vT, vB;
    uniform sampler2D u_velocity;
    void main () {
      float L = texture2D(u_velocity, vL).x;
      float R = texture2D(u_velocity, vR).x;
      float T = texture2D(u_velocity, vT).y;
      float B = texture2D(u_velocity, vB).y;
      gl_FragColor = vec4(.6 * (R - L + T - B), 0., 0., 1.);
    }
  `;

  const FRAG_PRESSURE = `
    precision highp float;
    varying vec2 vUv, vL, vR, vT, vB;
    uniform sampler2D u_pressure;
    uniform sampler2D u_divergence;
    uniform sampler2D u_sceneDepth;
    uniform float u_depthBlock;
    void main () {
      float L = texture2D(u_pressure, vL).x;
      float R = texture2D(u_pressure, vR).x;
      float T = texture2D(u_pressure, vT).x;
      float B = texture2D(u_pressure, vB).x;
      float div = texture2D(u_divergence, vUv).x;
      float pressure = (L + R + B + T - div) * .25;
      pressure += u_depthBlock * texture2D(u_sceneDepth, vUv).r;
      gl_FragColor = vec4(pressure, 0., 0., 1.);
    }
  `;

  const FRAG_GRADIENT = `
    precision highp float;
    varying vec2 vUv, vL, vR, vT, vB;
    uniform sampler2D u_pressure;
    uniform sampler2D u_velocity;
    void main () {
      float L = texture2D(u_pressure, vL).x;
      float R = texture2D(u_pressure, vR).x;
      float T = texture2D(u_pressure, vT).x;
      float B = texture2D(u_pressure, vB).x;
      vec2 vel = texture2D(u_velocity, vUv).xy - vec2(R - L, T - B);
      gl_FragColor = vec4(vel, 0., 1.);
    }
  `;

  const FRAG_ADVECTION = `
    precision highp float;
    varying vec2 vUv;
    uniform sampler2D u_velocity;
    uniform sampler2D u_input;
    uniform sampler2D u_sceneDepth;
    uniform vec2 u_texel;
    uniform float u_dt;
    uniform float u_dissipation;
    uniform float u_cling;
    vec4 bilerp (sampler2D sam, vec2 uv, vec2 tsize) {
      vec2 st = uv / tsize - .5;
      vec2 iuv = floor(st);
      vec2 fuv = fract(st);
      vec4 a = texture2D(sam, (iuv + vec2(.5, .5)) * tsize);
      vec4 b = texture2D(sam, (iuv + vec2(1.5, .5)) * tsize);
      vec4 c = texture2D(sam, (iuv + vec2(.5, 1.5)) * tsize);
      vec4 d = texture2D(sam, (iuv + vec2(1.5, 1.5)) * tsize);
      return mix(mix(a, b, fuv.x), mix(c, d, fuv.x), fuv.y);
    }
    void main () {
      vec2 coord = vUv - u_dt * bilerp(u_velocity, vUv, u_texel).xy * u_texel;
      float diss = mix(u_dissipation, .998, texture2D(u_sceneDepth, vUv).r * u_cling);
      gl_FragColor = diss * bilerp(u_input, coord, u_texel);
      gl_FragColor.a = 1.;
    }
  `;

  const FRAG_COMBINE = `
    precision highp float;
    varying vec2 vUv;
    uniform sampler2D u_map;
    uniform vec4 u_cover;
    uniform vec2 u_range;
    uniform float u_fill;
    uniform float u_base;
    void main () {
      vec2 uv = u_cover.zw * (1. - u_cover.xy) + vUv * u_cover.xy;
      vec4 ds = texture2D(u_map, uv);
      float d = u_range.x + ds.r * (u_range.y - u_range.x);
      float v = mix(u_fill, d, ds.a);
      gl_FragColor = vec4(vec3(v), max(u_base, ds.a));
    }
  `;

  const LAYER_VERT = `
    varying vec2 vUv;
    varying vec2 vStage;
    void main () {
      vUv = uv;
      vec4 p = projectionMatrix * modelViewMatrix * vec4(position, 1.);
      vStage = p.xy * .5 + .5;
      gl_Position = p;
    }
  `;

  const LAYER_FRAG = `
    precision highp float;
    varying vec2 vUv;
    varying vec2 vStage;
    uniform sampler2D uMap;
    uniform sampler2D uDepthMap;
    uniform sampler2D uDye;
    uniform vec4  uCoverP;
    uniform vec4  uCoverD;
    uniform vec2  uMouse;
    uniform float uParallax;
    uniform float uFocus;
    uniform float uZoom;
    uniform vec2  uDepthRange;
    uniform float uFillDepth;
    uniform float uThreshold;
    uniform float uEdge;
    uniform float uDepthBias;
    uniform float uGraySat;
    uniform float uGrayBright;
    uniform vec4  uClip;

    float readDepth (vec2 uvD) {
      vec4 ds = texture2D(uDepthMap, uvD);
      float mapD = uDepthRange.x + ds.r * (uDepthRange.y - uDepthRange.x);
      return mix(uFillDepth, mapD, ds.a);
    }

    void main () {
      vec2 Sp = uCoverP.xy / uZoom;
      vec2 baseP = uCoverP.zw * (1. - Sp) + vUv * Sp;
      vec2 Sd = uCoverD.xy / uZoom;
      vec2 baseD = uCoverD.zw * (1. - Sd) + vUv * Sd;

      vec2 shift = uMouse * uParallax * (readDepth(baseD) - uFocus);
      for (int i = 0; i < 3; i++) {
        vec2 target = uMouse * uParallax *
          (readDepth(clamp(baseD + shift, 0., 1.)) - uFocus);
        shift = mix(shift, target, .6);
      }

      vec4 texel = texture2D(uMap, clamp(baseP + shift, 0., 1.));
      float d = readDepth(clamp(baseD + shift, 0., 1.));

      float dye = texture2D(uDye, vStage).r;
      float t = uThreshold * (1. - uDepthBias * d);
      float m = smoothstep(t - uEdge, t + uEdge, dye);

      float lum = dot(texel.rgb, vec3(.299, .587, .114));
      vec3 gray = mix(vec3(lum), texel.rgb, uGraySat) * uGrayBright;
      vec3 col = mix(gray, texel.rgb, m);

      float inside =
        step(uClip.x, vStage.x) * step(vStage.x, uClip.z) *
        step(uClip.y, vStage.y) * step(vStage.y, uClip.w);

      gl_FragColor = vec4(col * texel.a, texel.a) * inside;
    }
  `;

  const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isTouch = (navigator.maxTouchPoints || 0) > 0 || "ontouchstart" in window;

  let running = false;
  let visible = true;
  let rafId = null;
  let io = null;
  let listeners = [];
  let resizeObserver = null;

  let stageEl = null;
  let canvas = null;
  let renderer = null;
  let rtType = null;

  let simScene, simMesh, simCam;
  let layerScene, layerCam;
  let materials = {};
  let layers = [];
  let hiddenDepthWrappers = [];
  let hiddenImgs = [];

  let velocity, dyeFBO, divergence, pressure, curlRT, sceneDepthRT;
  let combineItems = [];

  const pm = { tx: 0, ty: 0, sx: 0, sy: 0 };
  const pointer = { x: 0, y: 0, dx: 0, dy: 0, moved: false, inside: false, has: false };
  let stageRect = null;

  let lastSplatAt = -1e9;
  let fluidCleared = true;
  let lastPlacementSig = "";
  let forceRenderFrames = 0;

  function fluidSleepMs() {
    const effFade = CONFIG.trailFade + (0.998 - CONFIG.trailFade) * CONFIG.depthCling;
    const frames = Math.log(0.0025) / Math.log(Math.min(effFade, 0.9975));
    return Math.min(30000, Math.max(2000, (frames / 60) * 1000 + 500));
  }
  const SLEEP_MS = fluidSleepMs();

  function willApplyHeroFluid() {
    if (isTouch || !canHover || reducedMotion) return false;
    if (typeof THREE === "undefined") return false;
    return !!(
      document.querySelector(CONFIG.stageSelector) &&
      document.querySelector(CONFIG.layerSelector) &&
      document.querySelector(CONFIG.depthMapSelector)
    );
  }

  function restoreColorFallback() {
    document
      .querySelectorAll(CONFIG.layerSelector + " img")
      .forEach((img) => {
        if (img.classList.contains('portrait-special')) return;
        const cs = getComputedStyle(img).filter;
        if (!cs || cs === "none") return;
        const neutral = cs
          .replace(/(grayscale|invert|sepia)\(([^)]*)\)/g, "$1(0)")
          .replace(/(saturate|brightness|contrast|opacity)\(([^)]*)\)/g, "$1(1)")
          .replace(/blur\(([^)]*)\)/g, "blur(0px)")
          .replace(/hue-rotate\(([^)]*)\)/g, "hue-rotate(0deg)");
        if (typeof gsap !== "undefined") {
          gsap.to(img, {
            filter: neutral,
            duration: 1.2,
            ease: "expo.out",
            onComplete() { img.style.filter = "none"; },
          });
        } else {
          img.style.filter = "none";
        }
      });
  }

  function loadImage(src, cb) {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => cb(img);
    img.onerror = () => cb(null);
    img.src = src;
  }

  function makeTexture(image) {
    const t = new THREE.Texture(image);
    t.minFilter = THREE.LinearFilter;
    t.magFilter = THREE.LinearFilter;
    t.generateMipmaps = false;
    t.needsUpdate = true;
    return t;
  }

  function setCover(target, texAspect, boxAspect, posX, posY) {
    if (boxAspect > texAspect) {
      target.x = 1;
      target.y = texAspect / boxAspect;
    } else {
      target.x = boxAspect / texAspect;
      target.y = 1;
    }
    target.z = posX;
    target.w = posY;
  }

  function pctPos(el) {
    const op = (getComputedStyle(el).objectPosition || "50% 50%").split(" ");
    const pct = (s) => (s && s.indexOf("%") > -1 ? parseFloat(s) / 100 : 0.5);
    return [pct(op[0]), 1 - pct(op[1] !== undefined ? op[1] : "50%")];
  }

  function computeCover(l) {
    const w = l.imgEl.offsetWidth;
    const h = l.imgEl.offsetHeight;
    if (!w || !h) return;
    const boxAspect = w / h;
    setCover(l.uniforms.uCoverP.value, l.aspectP, boxAspect, l.posP[0], l.posP[1]);
    setCover(l.uniforms.uCoverD.value, l.aspectD, boxAspect, l.posD[0], l.posD[1]);
  }

  function makeRT(w, h) {
    return new THREE.WebGLRenderTarget(w, h, {
      minFilter: THREE.NearestFilter,
      magFilter: THREE.NearestFilter,
      format: THREE.RGBAFormat,
      type: rtType,
      depthBuffer: false,
      stencilBuffer: false,
    });
  }

  function makeDoubleRT(w, h) {
    let a = makeRT(w, h), b = makeRT(w, h);
    return {
      width: w, height: h,
      texelX: 1 / w, texelY: 1 / h,
      read: () => a, write: () => b,
      swap() { const t = a; a = b; b = t; },
      dispose() { a.dispose(); b.dispose(); },
    };
  }

  function pickRTType() {
    const gl = renderer.getContext();
    const test = new THREE.WebGLRenderTarget(4, 4, {
      minFilter: THREE.NearestFilter,
      magFilter: THREE.NearestFilter,
      format: THREE.RGBAFormat,
      type: THREE.FloatType,
      depthBuffer: false,
      stencilBuffer: false,
    });
    renderer.setRenderTarget(test);
    const ok = gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE;
    renderer.setRenderTarget(null);
    test.dispose();
    return ok ? THREE.FloatType : THREE.HalfFloatType;
  }

  function simMaterial(frag, uniforms) {
    return new THREE.ShaderMaterial({
      vertexShader: SIM_VERT,
      fragmentShader: frag,
      uniforms: uniforms,
      depthTest: false,
      depthWrite: false,
    });
  }

  function runSim(mat, target) {
    simMesh.material = mat;
    renderer.setRenderTarget(target);
    renderer.render(simScene, simCam);
  }

  function initHeroFluid() {
    if (running) return;
    if (isTouch || !canHover || reducedMotion) return;
    if (typeof THREE === "undefined") {
      console.warn("[heroFluid] THREE not found");
      restoreColorFallback();
      return;
    }
    stageEl = document.querySelector(CONFIG.stageSelector);
    const layerEls = document.querySelectorAll(CONFIG.layerSelector);
    const depthEls = document.querySelectorAll(CONFIG.depthMapSelector);
    if (!stageEl || !layerEls.length || !depthEls.length) return;

    running = true;

    canvas = document.createElement("canvas");
    Object.assign(canvas.style, {
      position: "absolute",
      inset: "0",
      width: "100%",
      height: "100%",
      pointerEvents: "none",
    });
    if (getComputedStyle(stageEl).position === "static") {
      stageEl.style.position = "relative";
    }
    stageEl.appendChild(canvas);

    try {
      renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false });
    } catch (err) {
      console.warn("[heroFluid] WebGL unavailable", err);
      cleanupDom();
      running = false;
      restoreColorFallback();
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, CONFIG.maxPixelRatio));
    renderer.setClearColor(0x000000, 0);
    renderer.autoClear = true;
    rtType = pickRTType();

    simCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    simScene = new THREE.Scene();
    simMesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2));
    simScene.add(simMesh);

    layerCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 10);
    layerCam.position.z = 1;
    layerScene = new THREE.Scene();

    buildSimMaterials();

    const depthByKey = {};
    depthEls.forEach((el) => {
      depthByKey[el.getAttribute("data-depth-map")] = { el, img: null, loaded: false };
    });
    const whenDepthReady = (key, cb) => {
      const entry = depthByKey[key];
      if (!entry) { cb(null, null); return; }
      if (entry.loaded) { cb(entry.img, entry.el); return; }
      (entry.cbs = entry.cbs || []).push(cb);
      if (entry.loading) return;
      entry.loading = true;
      const start = () => loadImage(entry.el.currentSrc || entry.el.src, (img) => {
        entry.img = img;
        entry.loaded = true;
        entry.cbs.forEach((f) => f(img, entry.el));
        entry.cbs = [];
      });
      entry.el.complete && entry.el.naturalWidth ?
        start() :
        entry.el.addEventListener("load", start, { once: true });
    };

    layerEls.forEach((wrapper) => {
      const imgEl = wrapper.querySelector("img");
      if (!imgEl || wrapper.dataset.fluidInit) return;
      wrapper.dataset.fluidInit = "1";
      const order = parseInt(wrapper.getAttribute("data-trail-order") || "0", 10);
      const key = CONFIG.depthAssign[order];
      const range = CONFIG.depthRange[order] || [0, 1];
      const fill = CONFIG.depthFill[order] !== undefined ? CONFIG.depthFill[order] : 0;

      const build = () => {
        loadImage(imgEl.currentSrc || imgEl.src, (photoImg) => {
          if (!photoImg) { delete wrapper.dataset.fluidInit; return; }
          whenDepthReady(key, (depthImg, depthEl) => {
            if (!depthImg) {
              console.warn("[heroFluid] depth map missing for order", order);
              delete wrapper.dataset.fluidInit;
              return;
            }
            try {
              addLayer(wrapper, imgEl, photoImg, depthImg, depthEl, order, range, fill);
            } catch (err) {
              console.warn("[heroFluid] layer init failed.", err);
              imgEl.style.opacity = "";
            }
          });
        });
      };
      imgEl.complete && imgEl.naturalWidth ?
        build() :
        imgEl.addEventListener("load", build, { once: true });
    });

    hiddenDepthWrappers = Array.from(
      document.querySelectorAll('[data-trail="depth-map"]')
    ).map((el) => {
      const prev = el.style.visibility;
      el.style.visibility = "hidden";
      return { el, prev };
    });

    io = new IntersectionObserver((entries) => {
      visible = entries[0].isIntersecting;
      if (visible) {
        forceRenderFrames = 2;
        startLoop();
      }
    });
    io.observe(stageEl);

    resizeObserver = new ResizeObserver(() => resize());
    resizeObserver.observe(stageEl);
    resize();

    window.addEventListener("pointermove", onPointerMove);
    listeners.push(["pointermove", onPointerMove]);
    window.addEventListener("pointerout", onPointerOut);
    listeners.push(["pointerout", onPointerOut]);

    startLoop();
  }

  function buildSimMaterials() {
    const texel = { value: new THREE.Vector2(1, 1) };
    materials.splat = simMaterial(FRAG_SPLAT, {
      u_texel: texel, u_input: { value: null }, u_ratio: { value: 1 },
      u_value: { value: new THREE.Vector3() }, u_point: { value: new THREE.Vector2() },
      u_size: { value: 0.001 },
    });
    materials.curl = simMaterial(FRAG_CURL, { u_texel: texel, u_velocity: { value: null } });
    materials.vorticity = simMaterial(FRAG_VORTICITY, {
      u_texel: texel, u_velocity: { value: null }, u_curl: { value: null },
      u_strength: { value: CONFIG.curl }, u_dt: { value: 1 / 60 },
    });
    materials.divergence = simMaterial(FRAG_DIVERGENCE, { u_texel: texel, u_velocity: { value: null } });
    materials.pressure = simMaterial(FRAG_PRESSURE, {
      u_texel: texel, u_pressure: { value: null }, u_divergence: { value: null },
      u_sceneDepth: { value: null }, u_depthBlock: { value: CONFIG.depthBlock },
    });
    materials.gradient = simMaterial(FRAG_GRADIENT, {
      u_texel: texel, u_pressure: { value: null }, u_velocity: { value: null },
    });
    materials.advection = simMaterial(FRAG_ADVECTION, {
      u_texel: texel, u_velocity: { value: null }, u_input: { value: null },
      u_sceneDepth: { value: null }, u_dt: { value: 1 / 60 },
      u_dissipation: { value: CONFIG.velocityFade }, u_cling: { value: 0 },
    });
    materials.combine = simMaterial(FRAG_COMBINE, {
      u_texel: texel, u_map: { value: null },
      u_cover: { value: new THREE.Vector4(1, 1, 0.5, 0.5) },
      u_range: { value: new THREE.Vector2(0, 1) },
      u_fill: { value: 0 }, u_base: { value: 0 },
    });
    materials.combine.transparent = true;
    materials.simTexel = texel;
  }

  function addLayer(wrapper, imgEl, photoImg, depthImg, depthEl, order, range, fill) {
    const photoTex = makeTexture(photoImg);
    const depthTex = makeTexture(depthImg);

    const uniforms = {
      uMap: { value: photoTex }, uDepthMap: { value: depthTex }, uDye: { value: null },
      uCoverP: { value: new THREE.Vector4(1, 1, 0.5, 0.5) },
      uCoverD: { value: new THREE.Vector4(1, 1, 0.5, 0.5) },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uParallax: { value: CONFIG.parallax }, uFocus: { value: CONFIG.focus },
      uZoom: { value: 1 },
      uDepthRange: { value: new THREE.Vector2(range[0], range[1]) },
      uFillDepth: { value: fill },
      uThreshold: { value: CONFIG.threshold },
      uEdge: { value: Math.max((1 - CONFIG.edgeHardness) * 0.35, 0.0015) },
      uDepthBias: { value: CONFIG.depthBias },
      uGraySat: { value: CONFIG.graySaturation },
      uGrayBright: { value: CONFIG.grayBrightness },
      uClip: { value: new THREE.Vector4(0, 0, 1, 1) },
    };

    const material = new THREE.ShaderMaterial({
      vertexShader: LAYER_VERT,
      fragmentShader: LAYER_FRAG,
      uniforms: uniforms,
      transparent: true,
      depthTest: false,
      depthWrite: false,
    });
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), material);
    mesh.renderOrder = 10 - order;
    layerScene.add(mesh);

    const prevOpacity = imgEl.style.opacity;
    imgEl.style.opacity = "0";
    hiddenImgs.push({ el: imgEl, prev: prevOpacity });

    const wov = getComputedStyle(wrapper);
    const wrapperClips = /(hidden|clip)/.test(
      (wov.overflow || "") + (wov.overflowX || "") + (wov.overflowY || "")
    );

    const layer = {
      wrapper, imgEl, depthEl, mesh, material, uniforms, photoTex, depthTex,
      aspectP: photoImg.naturalWidth / photoImg.naturalHeight || 1.5,
      aspectD: depthImg.naturalWidth / depthImg.naturalHeight || 1.5,
      order, range, fill, clips: wrapperClips,
      posP: pctPos(imgEl), posD: pctPos(depthEl),
    };
    computeCover(layer);
    layers.push(layer);

    combineItems = layers
      .slice()
      .sort((a, b) => b.order - a.order)
      .map((l, i) => ({ layer: l, base: i === 0 ? 1 : 0 }));

    buildSceneDepth();
    forceRenderFrames = 2;
    startLoop();
  }

  function buildSceneDepth() {
    if (!sceneDepthRT || !combineItems.length || !stageRect) return;
    const stageAspect = stageRect.width / stageRect.height;
    renderer.setRenderTarget(sceneDepthRT);
    renderer.setClearColor(0x000000, 1);
    renderer.clear();
    renderer.autoClear = false;
    combineItems.forEach(({ layer, base }) => {
      const u = materials.combine.uniforms;
      u.u_map.value = layer.depthTex;
      const pos = pctPos(layer.depthEl);
      setCover(u.u_cover.value, layer.aspectD, stageAspect, pos[0], pos[1]);
      u.u_range.value.set(layer.range[0], layer.range[1]);
      u.u_fill.value = layer.fill;
      u.u_base.value = base;
      simMesh.material = materials.combine;
      renderer.render(simScene, simCam);
    });
    renderer.autoClear = true;
    renderer.setRenderTarget(null);
    materials.pressure.uniforms.u_sceneDepth.value = sceneDepthRT.texture;
    materials.advection.uniforms.u_sceneDepth.value = sceneDepthRT.texture;
  }

  function resize() {
    if (!running || !stageEl) return;
    stageRect = stageEl.getBoundingClientRect();
    if (!stageRect.width || !stageRect.height) return;
    renderer.setSize(stageRect.width, stageRect.height, false);

    const w = Math.max(64, Math.floor(CONFIG.simScale * stageRect.width));
    const h = Math.max(64, Math.floor(CONFIG.simScale * stageRect.height));
    if (velocity) {
      velocity.dispose(); dyeFBO.dispose(); divergence.dispose();
      pressure.dispose(); curlRT.dispose();
    }
    if (sceneDepthRT) sceneDepthRT.dispose();
    velocity = makeDoubleRT(w, h);
    dyeFBO = makeDoubleRT(w, h);
    divergence = makeRT(w, h);
    pressure = makeDoubleRT(w, h);
    curlRT = makeRT(w, h);
    sceneDepthRT = new THREE.WebGLRenderTarget(w, h, {
      minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter,
      format: THREE.RGBAFormat, depthBuffer: false, stencilBuffer: false,
    });
    materials.simTexel.value.set(1 / w, 1 / h);
    layers.forEach(computeCover);
    fluidCleared = false;
    forceRenderFrames = 2;
    buildSceneDepth();
  }

  function onPointerMove(e) {
    pm.tx = (e.clientX / window.innerWidth) * 2 - 1;
    pm.ty = -((e.clientY / window.innerHeight) * 2 - 1);

    if (stageRect) {
      const x = e.clientX - stageRect.left;
      const y = e.clientY - stageRect.top;
      const inside = x >= 0 && y >= 0 && x <= stageRect.width && y <= stageRect.height;
      if (inside) {
        if (!pointer.has || !pointer.inside) {
          pointer.x = x; pointer.y = y; pointer.has = true;
        }
        pointer.dx = CONFIG.force * (x - pointer.x);
        pointer.dy = CONFIG.force * (y - pointer.y);
        pointer.x = x; pointer.y = y;
        pointer.moved = true;
        lastSplatAt = performance.now();
      }
      pointer.inside = inside;
    }
    startLoop();
  }

  function onPointerOut(e) {
    if (!e.relatedTarget) {
      pm.tx = 0; pm.ty = 0;
      startLoop();
    }
  }

  function startLoop() {
    if (!running || rafId !== null || !visible) return;
    rafId = requestAnimationFrame(loop);
  }

  function clearFluid() {
    [velocity.read(), velocity.write(), dyeFBO.read(), dyeFBO.write(),
      pressure.read(), pressure.write()
    ].forEach((rt) => {
      renderer.setRenderTarget(rt);
      renderer.clear();
    });
    renderer.setRenderTarget(null);
  }

  function loop() {
    rafId = null;
    if (!running || !visible) return;

    stageRect = stageEl.getBoundingClientRect();

    const now = performance.now();
    const fluidAwake = velocity && layers.length && now - lastSplatAt < SLEEP_MS;

    if (fluidAwake) {
      const dt = 1 / 60;

      if (pointer.moved) {
        pointer.moved = false;
        const px = pointer.x / stageRect.width;
        const py = 1 - pointer.y / stageRect.height;
        const u = materials.splat.uniforms;
        u.u_ratio.value = stageRect.width / stageRect.height;
        u.u_point.value.set(px, py);
        u.u_size.value = CONFIG.brushSize / 1000;

        u.u_input.value = velocity.read().texture;
        u.u_value.value.set(pointer.dx, -pointer.dy, 0);
        runSim(materials.splat, velocity.write());
        velocity.swap();

        u.u_input.value = dyeFBO.read().texture;
        u.u_value.value.set(CONFIG.dyeAmount, 0, 0);
        runSim(materials.splat, dyeFBO.write());
        dyeFBO.swap();
      }

      if (CONFIG.curl > 0) {
        materials.curl.uniforms.u_velocity.value = velocity.read().texture;
        runSim(materials.curl, curlRT);
        const v = materials.vorticity.uniforms;
        v.u_velocity.value = velocity.read().texture;
        v.u_curl.value = curlRT.texture;
        v.u_strength.value = CONFIG.curl;
        v.u_dt.value = dt;
        runSim(materials.vorticity, velocity.write());
        velocity.swap();
      }

      materials.divergence.uniforms.u_velocity.value = velocity.read().texture;
      runSim(materials.divergence, divergence);

      const pu = materials.pressure.uniforms;
      pu.u_divergence.value = divergence.texture;
      pu.u_depthBlock.value = CONFIG.depthBlock;
      for (let i = 0; i < CONFIG.pressureIters; i++) {
        pu.u_pressure.value = pressure.read().texture;
        runSim(materials.pressure, pressure.write());
        pressure.swap();
      }

      const gu = materials.gradient.uniforms;
      gu.u_pressure.value = pressure.read().texture;
      gu.u_velocity.value = velocity.read().texture;
      runSim(materials.gradient, velocity.write());
      velocity.swap();

      const au = materials.advection.uniforms;
      au.u_dt.value = dt;
      au.u_cling.value = 0;
      au.u_dissipation.value = CONFIG.velocityFade;
      au.u_velocity.value = velocity.read().texture;
      au.u_input.value = velocity.read().texture;
      runSim(materials.advection, velocity.write());
      velocity.swap();

      au.u_cling.value = CONFIG.depthCling;
      au.u_dissipation.value = CONFIG.trailFade;
      au.u_velocity.value = velocity.read().texture;
      au.u_input.value = dyeFBO.read().texture;
      runSim(materials.advection, dyeFBO.write());
      dyeFBO.swap();

      renderer.setRenderTarget(null);
      fluidCleared = false;
    } else if (velocity && !fluidCleared) {
      clearFluid();
      fluidCleared = true;
      forceRenderFrames = 2;
    }

    pm.sx += (pm.tx - pm.sx) * CONFIG.inertia;
    pm.sy += (pm.ty - pm.sy) * CONFIG.inertia;
    const mag = Math.min(1, Math.hypot(pm.sx, pm.sy));
    const zoom = 1 / (1 - Math.min(0.4, 2 * CONFIG.parallax * mag));
    const settled =
      Math.abs(pm.tx - pm.sx) < 0.0005 && Math.abs(pm.ty - pm.sy) < 0.0005;

    let sig = "";
    layers.forEach((l) => {
      const r = l.imgEl.getBoundingClientRect();
      if (!r.width || !r.height) return;
      sig += (r.left - stageRect.left).toFixed(1) + "," +
        (r.top - stageRect.top).toFixed(1) + "," +
        r.width.toFixed(1) + "," + r.height.toFixed(1) + ";";
      const cx = (r.left + r.width / 2 - stageRect.left) / stageRect.width;
      const cy = (r.top + r.height / 2 - stageRect.top) / stageRect.height;
      l.mesh.position.set(cx * 2 - 1, (1 - cy) * 2 - 1, 0);
      l.mesh.scale.set((r.width / stageRect.width) * 2, (r.height / stageRect.height) * 2, 1);

      if (l.clips) {
        const wr = l.wrapper.getBoundingClientRect();
        l.uniforms.uClip.value.set(
          (wr.left - stageRect.left) / stageRect.width,
          1 - (wr.bottom - stageRect.top) / stageRect.height,
          (wr.right - stageRect.left) / stageRect.width,
          1 - (wr.top - stageRect.top) / stageRect.height
        );
      } else {
        l.uniforms.uClip.value.set(0, 0, 1, 1);
      }
    });

    const placementChanged = sig !== lastPlacementSig;
    lastPlacementSig = sig;

    const needRender = fluidAwake || !settled || placementChanged || forceRenderFrames > 0;
    if (needRender && layers.length) {
      if (forceRenderFrames > 0) forceRenderFrames--;
      layers.forEach((l) => {
        l.uniforms.uMouse.value.set(pm.sx, pm.sy);
        l.uniforms.uZoom.value = zoom;
        l.uniforms.uDye.value = dyeFBO ? dyeFBO.read().texture : null;
      });
      renderer.render(layerScene, layerCam);
    }

    rafId = requestAnimationFrame(loop);
  }

  function cleanupDom() {
    if (canvas && canvas.parentNode) canvas.parentNode.removeChild(canvas);
    canvas = null;
  }

  function destroyHeroFluid() {
    running = false;
    if (rafId !== null) { cancelAnimationFrame(rafId); rafId = null; }
    if (io) { io.disconnect(); io = null; }
    if (resizeObserver) { resizeObserver.disconnect(); resizeObserver = null; }
    listeners.forEach(([ev, fn]) => window.removeEventListener(ev, fn));
    listeners = [];

    layers.forEach((l) => {
      l.material.dispose(); l.photoTex.dispose(); l.depthTex.dispose();
      layerScene && layerScene.remove(l.mesh);
    });
    layers = [];
    combineItems = [];
    hiddenImgs.forEach(({ el, prev }) => { el.style.opacity = prev; });
    hiddenImgs = [];
    hiddenDepthWrappers.forEach(({ el, prev }) => { el.style.visibility = prev; });
    hiddenDepthWrappers = [];
    document.querySelectorAll("[data-fluid-init]").forEach((el) => delete el.dataset.fluidInit);

    if (velocity) {
      velocity.dispose(); dyeFBO.dispose(); divergence.dispose();
      pressure.dispose(); curlRT.dispose();
    }
    if (sceneDepthRT) sceneDepthRT.dispose();
    velocity = dyeFBO = divergence = pressure = curlRT = sceneDepthRT = null;
    Object.keys(materials).forEach((k) => materials[k] && materials[k].dispose && materials[k].dispose());
    materials = {};
    if (renderer) { renderer.dispose(); renderer = null; }
    cleanupDom();
    pm.tx = pm.ty = pm.sx = pm.sy = 0;
    pointer.has = false; pointer.moved = false;
    lastSplatAt = -1e9; fluidCleared = true;
    lastPlacementSig = ""; forceRenderFrames = 0;
  }

  window.heroFluid = {
    init: initHeroFluid,
    destroy: destroyHeroFluid,
    willApply: willApplyHeroFluid,
  };

  initHeroFluid();
})();
