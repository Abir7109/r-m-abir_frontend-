/**
 * laptop-loader.js
 * GLB laptop replacing helmet. Appears after scrolling past about section.
 * Constant spin + scroll-driven speed/direction. Fits within frame.
 */
(function () {
  'use strict';

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    setTimeout(init, 100);
  }

  function init() {
    if (typeof THREE === 'undefined' || !THREE.GLTFLoader) {
      console.warn('[laptop-loader] THREE or GLTFLoader missing');
      return;
    }

    var stage = document.querySelector('[data-helmet-stage]');
    if (!stage) return;

    console.log('[laptop-loader] Init');

    var MODEL_PATH = 'assets/models/laptop.glb';
    var BASE_SPIN_SPEED = 0.005;
    var SCROLL_MULTIPLIER = 3;
    var CAMERA_Z = 5;
    var MODEL_SCALE = 2.2;

    // Scene
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.z = CAMERA_Z;

    // Renderer
    var renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    stage.appendChild(renderer.domElement);

    // Lighting
    scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    var dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(5, 5, 5);
    scene.add(dirLight);
    var rimLight = new THREE.DirectionalLight(0xfed60a, 0.4);
    rimLight.position.set(-3, 2, -3);
    scene.add(rimLight);

    // Load model
    var loader = new THREE.GLTFLoader();
    var model = null;
    var rotationY = 0;
    var lastScrollY = window.scrollY;
    var scrollSpeed = 0;

    loader.load(
      MODEL_PATH,
      function (gltf) {
        console.log('[laptop-loader] Model loaded');
        model = gltf.scene;

        // Center the model at origin
        var box = new THREE.Box3().setFromObject(model);
        var center = box.getCenter(new THREE.Vector3());
        model.position.sub(center);

        // Scale to fit — use the largest dimension to ensure it fits when rotated
        var size = box.getSize(new THREE.Vector3());
        var maxDim = Math.max(size.x, size.y, size.z);
        model.scale.setScalar(MODEL_SCALE / maxDim);

        scene.add(model);
      },
      undefined,
      function (error) {
        console.error('[laptop-loader] GLB error:', error);
      }
    );

    // Resize — match helmet_div size
    function onResize() {
      var rect = stage.getBoundingClientRect();
      var w = rect.width || 544;
      var h = rect.height || w * 0.75;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
    window.addEventListener('resize', onResize);
    onResize();

    // Scroll speed
    function updateScrollSpeed() {
      var currentY = window.scrollY;
      scrollSpeed = currentY - lastScrollY;
      lastScrollY = currentY;
    }
    window.addEventListener('scroll', updateScrollSpeed, { passive: true });

    // Animate
    var scrollSection = document.querySelector('[data-helmet-section]');
    var currentOpacity = 0;
    var targetOpacity = 0;
    var canvas = renderer.domElement;

    function animate() {
      requestAnimationFrame(animate);

      // Calculate target opacity based on section position
      if (scrollSection) {
        var rect = scrollSection.getBoundingClientRect();
        var sectionTop = rect.top;
        var sectionBottom = rect.bottom;
        var viewH = window.innerHeight;

        if (sectionBottom < 0 || sectionTop > viewH) {
          // Section completely out of view
          targetOpacity = 0;
        } else if (sectionTop > viewH * 0.4) {
          // Section entering from bottom — fade in
          targetOpacity = 1 - ((sectionTop - viewH * 0.4) / (viewH * 0.4));
        } else if (sectionBottom < viewH * 0.6) {
          // Section leaving from top — fade out
          targetOpacity = sectionBottom / (viewH * 0.6);
        } else {
          // Section fully in view
          targetOpacity = 1;
        }
        targetOpacity = Math.max(0, Math.min(1, targetOpacity));
      }

      // Smooth lerp
      currentOpacity += (targetOpacity - currentOpacity) * 0.06;
      if (currentOpacity < 0.01) currentOpacity = 0;
      if (currentOpacity > 0.99) currentOpacity = 1;
      canvas.style.opacity = currentOpacity;

      if (model && currentOpacity > 0) {
        var spinDelta = BASE_SPIN_SPEED + (scrollSpeed * SCROLL_MULTIPLIER * 0.001);
        rotationY += spinDelta;
        model.rotation.y = rotationY;
      }

      scrollSpeed *= 0.95;
      renderer.render(scene, camera);
    }
    animate();
    console.log('[laptop-loader] Running');
  }
})();
