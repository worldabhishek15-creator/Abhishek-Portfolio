/* Abhishek Kumar | 3D portfolio
   Plain JavaScript, no libraries and no build step.
   The 3D background is a small hand-written WebGL scene. */
(function () {
  'use strict';

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var EMAIL = 'kumarabhishek15620041@gmail.com';

  /* ------------------------------------------------------------------
     Small UI pieces
  ------------------------------------------------------------------ */
  function initBasics() {
    var year = $('#year');
    if (year) year.textContent = new Date().getFullYear();

    var nav = $('#nav');
    var bar = $('.progress');
    var burger = $('#burger');
    var ticking = false;

    function onScroll() {
      ticking = false;
      var y = window.pageYOffset || document.documentElement.scrollTop;
      var max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      if (nav) nav.classList.toggle('scrolled', y > 24);
      if (bar) bar.style.setProperty('--p', Math.min(1, y / max).toFixed(4));
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
    }, { passive: true });
    onScroll();

    if (burger && nav) {
      var setOpen = function (open) {
        nav.classList.toggle('open', open);
        burger.setAttribute('aria-expanded', open ? 'true' : 'false');
        burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      };
      burger.addEventListener('click', function () { setOpen(!nav.classList.contains('open')); });
      $$('#menu a').forEach(function (a) { a.addEventListener('click', function () { setOpen(false); }); });
      window.addEventListener('keydown', function (e) { if (e.key === 'Escape') setOpen(false); });
    }
  }

  function initReveal() {
    var items = $$('.reveal');
    var markIn = function (el) {
      el.classList.add('in');
      if (el.classList.contains('card') && el.hasAttribute('data-tilt')) {
        var d = parseFloat(getComputedStyle(el).getPropertyValue('--d')) || 0;
        setTimeout(function () { el.classList.add('ready'); }, d * 1000 + 950);
      }
    };
    if (!('IntersectionObserver' in window) || reduce) {
      items.forEach(function (el) { markIn(el); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { markIn(en.target); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    items.forEach(function (el) { io.observe(el); });
  }

  function initCounters() {
    var els = $$('[data-count]');
    var run = function (el) {
      var target = parseInt(el.getAttribute('data-count'), 10) || 0;
      if (reduce) { el.textContent = target; return; }
      var start = performance.now(), dur = 1400;
      (function step(now) {
        var p = Math.min(1, (now - start) / dur);
        el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(step);
      })(start);
    };
    if (!('IntersectionObserver' in window)) { els.forEach(run); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { run(en.target); io.unobserve(en.target); } });
    }, { threshold: 0.6 });
    els.forEach(function (el) { io.observe(el); });
  }

  function initTyped() {
    var el = $('#typed');
    if (!el) return;
    var words = ['SOC operations', 'SIEM & threat detection', 'incident response', 'AI-powered security', 'detection engineering'];
    if (reduce) { el.textContent = words[0]; return; }
    var w = 0, c = words[0].length, deleting = false;
    (function tick() {
      var word = words[w];
      el.textContent = word.slice(0, c);
      var delay = deleting ? 38 : 78;
      if (!deleting && c === word.length) { deleting = true; delay = 1600; }
      else if (deleting && c === 0) { deleting = false; w = (w + 1) % words.length; delay = 380; }
      else { c += deleting ? -1 : 1; }
      setTimeout(tick, delay);
    })();
  }

  function initActiveLink() {
    var links = $$('#menu a');
    var map = {};
    links.forEach(function (a) { map[a.getAttribute('href').slice(1)] = a; });
    if (!('IntersectionObserver' in window)) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          links.forEach(function (a) { a.classList.remove('active'); });
          var a = map[en.target.id];
          if (a) a.classList.add('active');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    $$('main section[id]').forEach(function (s) { io.observe(s); });
  }

  function initTilt() {
    if (!finePointer || reduce) return;
    $$('[data-tilt]').forEach(function (el) {
      var isCard = el.classList.contains('card');
      var max = isCard ? 8 : 16;
      var rect = null;
      el.addEventListener('pointerenter', function () { rect = el.getBoundingClientRect(); el.classList.add('moving'); });
      el.addEventListener('pointermove', function (e) {
        if (!rect) rect = el.getBoundingClientRect();
        var px = (e.clientX - rect.left) / rect.width - 0.5;
        var py = (e.clientY - rect.top) / rect.height - 0.5;
        el.style.setProperty('--ry', (px * max).toFixed(2) + 'deg');
        el.style.setProperty('--rx', (-py * max).toFixed(2) + 'deg');
      });
      el.addEventListener('pointerleave', function () {
        rect = null;
        el.classList.remove('moving');
        el.style.setProperty('--rx', '0deg');
        el.style.setProperty('--ry', '0deg');
      });
    });
  }

  function initFilters() {
    var buttons = $$('.filter');
    var items = $$('.tl-item');
    buttons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var f = btn.getAttribute('data-filter');
        buttons.forEach(function (b) {
          var on = b === btn;
          b.classList.toggle('active', on);
          b.setAttribute('aria-pressed', on ? 'true' : 'false');
        });
        items.forEach(function (it) {
          var show = f === 'all' || it.getAttribute('data-cat') === f;
          it.classList.toggle('hide', !show);
          if (show) it.classList.add('in');
        });
      });
    });
  }

  function initForm() {
    var form = $('#mailForm');
    if (!form) return;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var d = new FormData(form);
      var name = String(d.get('name') || '').trim();
      var mail = String(d.get('email') || '').trim();
      var msg = String(d.get('message') || '').trim();
      var subject = 'Portfolio message from ' + name;
      var body = msg + '\n\n' + name + ' (' + mail + ')';
      window.location.href = 'mailto:' + EMAIL + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
    });
  }

  /* ------------------------------------------------------------------
     Draggable 3D skill sphere (DOM based)
  ------------------------------------------------------------------ */
  function initSphere() {
    var root = $('#sphere');
    if (!root) return;
    var tags = $$('.tag', root);
    var n = tags.length;
    var pts = tags.map(function (_, i) {
      var k = (i + 0.5) / n, phi = Math.acos(1 - 2 * k), th = Math.PI * (1 + Math.sqrt(5)) * i;
      return [Math.cos(th) * Math.sin(phi), Math.cos(phi), Math.sin(th) * Math.sin(phi)];
    });
    var baseX = reduce ? 0 : 0.0018, baseY = reduce ? 0 : 0.0058;
    var wx = baseX, wy = baseY, drag = false, lx = 0, ly = 0, visible = true, W = 0, H = 0;

    var outline = document.createElement('span');
    outline.className = 'sphere-ring';
    outline.setAttribute('aria-hidden', 'true');
    root.insertBefore(outline, root.firstChild);
    function radius() {
      var r = Math.min(W * 0.5 - 85, H * 0.5 - 40);
      return r < 70 ? 70 : r;
    }
    function size() {
      W = root.clientWidth; H = root.clientHeight;
      var d = (radius() * 2).toFixed(0) + 'px';
      outline.style.width = d; outline.style.height = d;
    }
    function rotate(ax, ay) {
      var cx = Math.cos(ax), sx = Math.sin(ax), cy = Math.cos(ay), sy = Math.sin(ay);
      for (var i = 0; i < n; i++) {
        var p = pts[i];
        var x = p[0] * cy + p[2] * sy;
        var z = -p[0] * sy + p[2] * cy;
        var y = p[1] * cx - z * sx;
        z = p[1] * sx + z * cx;
        p[0] = x; p[1] = y; p[2] = z;
      }
    }
    function draw() {
      var R = radius();
      var persp = 900;
      for (var i = 0; i < n; i++) {
        var p = pts[i], z = p[2] * R, s = persp / (persp - z);
        var depth = (p[2] + 1) / 2;
        var el = tags[i];
        el.style.transform = 'translate(-50%,-50%) translate(' + (p[0] * R * s).toFixed(1) + 'px,' + (p[1] * R * s).toFixed(1) + 'px) scale(' + (0.7 + 0.52 * depth).toFixed(3) + ')';
        el.style.opacity = (0.42 + 0.58 * depth).toFixed(3);
        el.style.zIndex = Math.round(depth * 100);
      }
    }
    function frame() {
      if (visible && !document.hidden) {
        if (!drag) { wx += (baseX - wx) * 0.035; wy += (baseY - wy) * 0.035; }
        if (!reduce || drag) { rotate(wx, wy); }
        draw();
      }
      requestAnimationFrame(frame);
    }

    root.addEventListener('pointerdown', function (e) {
      drag = true; lx = e.clientX; ly = e.clientY;
      try { root.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
    });
    root.addEventListener('pointermove', function (e) {
      if (!drag) return;
      var dx = e.clientX - lx, dy = e.clientY - ly;
      lx = e.clientX; ly = e.clientY;
      wy = dx * 0.006; wx = -dy * 0.006;
      rotate(wx, wy);
      if (reduce) draw();
    });
    var end = function () { drag = false; };
    root.addEventListener('pointerup', end);
    root.addEventListener('pointercancel', end);

    size();
    window.addEventListener('resize', size);
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (en) { visible = en[0].isIntersecting; }, { threshold: 0 }).observe(root);
    }
    rotate(0.4, 0.6);
    draw();
    requestAnimationFrame(frame);
  }

  /* ------------------------------------------------------------------
     WebGL background scene
  ------------------------------------------------------------------ */
  function initScene() {
    var canvas = $('#scene');
    if (!canvas) return;
    var gl = null;
    try {
      gl = canvas.getContext('webgl', { antialias: true, alpha: true, premultipliedAlpha: true, powerPreference: 'high-performance' }) ||
           canvas.getContext('experimental-webgl');
    } catch (e) { gl = null; }
    if (!gl) { canvas.style.display = 'none'; return; }

    /* ---- shaders ---- */
    var VS = [
      'attribute vec3 a_pos;',
      'uniform mat4 u_mvp;',
      'uniform float u_size;',
      'uniform float u_pscale;',
      'varying float v_depth;',
      'void main(){',
      '  vec4 p = u_mvp * vec4(a_pos, 1.0);',
      '  gl_Position = p;',
      '  v_depth = clamp(1.0 - (p.w - 3.0) / 24.0, 0.0, 1.0);',
      '  gl_PointSize = max(1.0, u_size * u_pscale / max(p.w, 0.1));',
      '}'
    ].join('\n');
    var FS = [
      'precision mediump float;',
      'uniform vec4 u_color;',
      'uniform float u_round;',
      'varying float v_depth;',
      'void main(){',
      '  float a = u_color.a * v_depth;',
      '  if (u_round > 0.5) {',
      '    float d = length(gl_PointCoord - vec2(0.5));',
      '    if (d > 0.5) discard;',
      '    a *= pow(1.0 - d * 2.0, 1.4) * 1.6;',
      '  }',
      '  gl_FragColor = vec4(u_color.rgb * a, a);',
      '}'
    ].join('\n');

    function compile(type, src) {
      var s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
      return s;
    }
    var prog;
    try {
      prog = gl.createProgram();
      gl.attachShader(prog, compile(gl.VERTEX_SHADER, VS));
      gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FS));
      gl.bindAttribLocation(prog, 0, 'a_pos');
      gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog));
    } catch (err) {
      if (window.console) console.warn('3D background disabled:', err.message);
      canvas.style.display = 'none';
      return;
    }
    gl.useProgram(prog);
    gl.enableVertexAttribArray(0);
    var uMvp = gl.getUniformLocation(prog, 'u_mvp');
    var uColor = gl.getUniformLocation(prog, 'u_color');
    var uSize = gl.getUniformLocation(prog, 'u_size');
    var uPscale = gl.getUniformLocation(prog, 'u_pscale');
    var uRound = gl.getUniformLocation(prog, 'u_round');
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE);
    gl.disable(gl.DEPTH_TEST);
    gl.clearColor(0, 0, 0, 0);

    /* ---- matrices (column major) ---- */
    var FOV = 45 * Math.PI / 180;
    function ident() { return new Float32Array([1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1]); }
    function persp(fov, asp, n, f) {
      var t = 1 / Math.tan(fov / 2), nf = 1 / (n - f);
      return new Float32Array([t / asp,0,0,0, 0,t,0,0, 0,0,(f + n) * nf,-1, 0,0,2 * f * n * nf,0]);
    }
    function mul(a, b) {
      var o = new Float32Array(16);
      for (var c = 0; c < 4; c++) for (var r = 0; r < 4; r++) {
        var s = 0;
        for (var k = 0; k < 4; k++) s += a[k * 4 + r] * b[c * 4 + k];
        o[c * 4 + r] = s;
      }
      return o;
    }
    function trans(x, y, z) { var m = ident(); m[12] = x; m[13] = y; m[14] = z; return m; }
    function scal(s) { var m = ident(); m[0] = s; m[5] = s; m[10] = s; return m; }
    function rotX(a) { var c = Math.cos(a), s = Math.sin(a); return new Float32Array([1,0,0,0, 0,c,s,0, 0,-s,c,0, 0,0,0,1]); }
    function rotY(a) { var c = Math.cos(a), s = Math.sin(a); return new Float32Array([c,0,-s,0, 0,1,0,0, s,0,c,0, 0,0,0,1]); }
    function rotZ(a) { var c = Math.cos(a), s = Math.sin(a); return new Float32Array([c,s,0,0, -s,c,0,0, 0,0,1,0, 0,0,0,1]); }

    /* ---- geometry helpers ---- */
    function mkBuf(data, dynamic) {
      var b = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, b);
      gl.bufferData(gl.ARRAY_BUFFER, data, dynamic ? gl.DYNAMIC_DRAW : gl.STATIC_DRAW);
      return b;
    }
    function norm(v) { var l = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]); return [v[0] / l, v[1] / l, v[2] / l]; }
    function icosphere(sub) {
      var t = (1 + Math.sqrt(5)) / 2;
      var v = [[-1,t,0],[1,t,0],[-1,-t,0],[1,-t,0],[0,-1,t],[0,1,t],[0,-1,-t],[0,1,-t],[t,0,-1],[t,0,1],[-t,0,-1],[-t,0,1]].map(norm);
      var f = [[0,11,5],[0,5,1],[0,1,7],[0,7,10],[0,10,11],[1,5,9],[5,11,4],[11,10,2],[10,7,6],[7,1,8],[3,9,4],[3,4,2],[3,2,6],[3,6,8],[3,8,9],[4,9,5],[2,4,11],[6,2,10],[8,6,7],[9,8,1]];
      var cache = {};
      function mid(a, b) {
        var k = a < b ? a + '_' + b : b + '_' + a;
        if (cache[k] !== undefined) return cache[k];
        v.push(norm([(v[a][0] + v[b][0]) / 2, (v[a][1] + v[b][1]) / 2, (v[a][2] + v[b][2]) / 2]));
        cache[k] = v.length - 1;
        return cache[k];
      }
      for (var s = 0; s < sub; s++) {
        var nf = [];
        f.forEach(function (tri) {
          var a = tri[0], b = tri[1], c = tri[2];
          var ab = mid(a, b), bc = mid(b, c), ca = mid(c, a);
          nf.push([a, ab, ca], [b, bc, ab], [c, ca, bc], [ab, bc, ca]);
        });
        f = nf;
      }
      var seen = {}, lines = [];
      f.forEach(function (tri) {
        [[tri[0], tri[1]], [tri[1], tri[2]], [tri[2], tri[0]]].forEach(function (e) {
          var k = e[0] < e[1] ? e[0] + '_' + e[1] : e[1] + '_' + e[0];
          if (!seen[k]) { seen[k] = 1; lines.push(v[e[0]][0], v[e[0]][1], v[e[0]][2], v[e[1]][0], v[e[1]][1], v[e[1]][2]); }
        });
      });
      var pts = [];
      v.forEach(function (p) { pts.push(p[0], p[1], p[2]); });
      return { lines: new Float32Array(lines), points: new Float32Array(pts) };
    }
    function ringData(r, seg) {
      var d = new Float32Array(seg * 3);
      for (var i = 0; i < seg; i++) {
        var a = i / seg * Math.PI * 2;
        d[i * 3] = Math.cos(a) * r; d[i * 3 + 1] = Math.sin(a) * r; d[i * 3 + 2] = 0;
      }
      return d;
    }
    function rnd(a, b) { return a + Math.random() * (b - a); }

    var small = window.innerWidth < 760;
    var ico1 = icosphere(1), ico0 = icosphere(0);
    var ico1L = mkBuf(ico1.lines), ico1P = mkBuf(ico1.points);
    var ico0L = mkBuf(ico0.lines), ico0P = mkBuf(ico0.points);
    var originBuf = mkBuf(new Float32Array([0, 0, 0]));
    var ring = [
      { r: 2.55, n: 140, tz: 0.5, tx: 1.2, w: 0.35, buf: mkBuf(ringData(2.55, 140)), sat: new Float32Array(6), satBuf: null, dir: 1 },
      { r: 3.0, n: 160, tz: -0.9, tx: 0.6, w: -0.27, buf: mkBuf(ringData(3.0, 160)), sat: new Float32Array(6), satBuf: null, dir: -1 },
      { r: 3.45, n: 180, tz: 1.6, tx: 1.0, w: 0.2, buf: mkBuf(ringData(3.45, 180)), sat: new Float32Array(6), satBuf: null, dir: 1 }
    ];
    ring.forEach(function (rg) { rg.satBuf = mkBuf(rg.sat, true); });

    // star field
    var NP = small ? 380 : 900;
    var starsA = new Float32Array(NP * 3), starsB = new Float32Array(NP * 3);
    (function () {
      for (var i = 0; i < NP; i++) {
        var tgt = i % 2 ? starsA : starsB, k = (i >> 1) * 3;
        tgt[k] = rnd(-18, 18); tgt[k + 1] = rnd(-12, 12); tgt[k + 2] = rnd(-10, 2);
      }
    })();
    var starsABuf = mkBuf(starsA.subarray(0, (NP >> 1) * 3 + (NP & 1 ? 3 : 0)));
    var starsBBuf = mkBuf(starsB.subarray(0, (NP >> 1) * 3));
    var starsACount = (NP >> 1) + (NP & 1), starsBCount = NP >> 1;

    // floor grid
    var grid = (function () {
      var a = [], y = -5.4, step = 3, zNear = 2, zFar = -66, xs = 45, i;
      for (i = -xs; i <= xs; i += step) a.push(i, y, zNear, i, y, zFar);
      for (var z = zNear; z >= zFar; z -= step) a.push(-xs, y, z, xs, y, z);
      return new Float32Array(a);
    })();
    var gridBuf = mkBuf(grid), gridCount = grid.length / 3;

    // moving network
    var NN = small ? 34 : 58, NR2 = 4.6 * 4.6;
    var np = new Float32Array(NN * 3), nv = new Float32Array(NN * 3);
    for (var i = 0; i < NN; i++) {
      np[i * 3] = rnd(-13, 13); np[i * 3 + 1] = rnd(-7.5, 7.5); np[i * 3 + 2] = rnd(-20, -6);
      nv[i * 3] = rnd(-.5, .5); nv[i * 3 + 1] = rnd(-.35, .35); nv[i * 3 + 2] = rnd(-.3, .3);
    }
    var netLines = new Float32Array(NN * (NN - 1) * 3);
    var netNodeBuf = mkBuf(np, true), netLineBuf = mkBuf(netLines, true), netCount = 0;
    function updateNet(dt) {
      var i, j, k;
      for (i = 0; i < NN; i++) {
        k = i * 3;
        np[k] += nv[k] * dt; np[k + 1] += nv[k + 1] * dt; np[k + 2] += nv[k + 2] * dt;
        if (np[k] > 13 || np[k] < -13) nv[k] *= -1;
        if (np[k + 1] > 7.5 || np[k + 1] < -7.5) nv[k + 1] *= -1;
        if (np[k + 2] > -6 || np[k + 2] < -20) nv[k + 2] *= -1;
      }
      var c = 0;
      for (i = 0; i < NN; i++) for (j = i + 1; j < NN; j++) {
        var dx = np[i * 3] - np[j * 3], dy = np[i * 3 + 1] - np[j * 3 + 1], dz = np[i * 3 + 2] - np[j * 3 + 2];
        if (dx * dx + dy * dy + dz * dz < NR2) {
          netLines[c++] = np[i * 3]; netLines[c++] = np[i * 3 + 1]; netLines[c++] = np[i * 3 + 2];
          netLines[c++] = np[j * 3]; netLines[c++] = np[j * 3 + 1]; netLines[c++] = np[j * 3 + 2];
        }
      }
      netCount = c / 3;
      gl.bindBuffer(gl.ARRAY_BUFFER, netNodeBuf);
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, np);
      gl.bindBuffer(gl.ARRAY_BUFFER, netLineBuf);
      if (c) gl.bufferSubData(gl.ARRAY_BUFFER, 0, netLines.subarray(0, c));
    }

    /* ---- draw helper ---- */
    var col = new Float32Array(4);
    function draw(buf, count, mode, mvp, r, g, b, a, size) {
      if (!count) return;
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);
      gl.uniformMatrix4fv(uMvp, false, mvp);
      col[0] = r; col[1] = g; col[2] = b; col[3] = a;
      gl.uniform4fv(uColor, col);
      gl.uniform1f(uSize, size || 1);
      gl.uniform1f(uRound, mode === gl.POINTS ? 1 : 0);
      gl.drawArrays(mode, 0, count);
    }

    /* ---- layout keyframes: one per section ---- */
    var IDS = ['home', 'about', 'skills', 'experience', 'projects', 'certifications', 'contact'];
    var K = [
      [0.44, 0.00, 1.00, 1.00],
      [0.50, 0.46, 0.55, 0.85],
      [0.52, -0.02, 0.62, 0.60],
      [-0.52, 0.00, 0.58, 0.55],
      [0.50, 0.04, 0.62, 0.60],
      [-0.50, 0.00, 0.58, 0.55],
      [0.00, -0.30, 1.05, 0.6]
    ];
    var C1 = [[.38,.65,1],[.13,.83,.93],[.38,.65,1],[.2,.83,.6],[.55,.6,1],[.13,.83,.93],[.2,.83,.6]];
    var C2 = [[.13,.83,.93],[.38,.65,1],[.2,.83,.6],[.38,.65,1],[.13,.83,.93],[.55,.6,1],[.38,.65,1]];
    var secEls = IDS.map(function (id) { return document.getElementById(id); });
    var centers = [];
    function computeCenters() {
      centers = secEls.map(function (el) { return el ? el.offsetTop + el.offsetHeight / 2 : 0; });
    }

    var cur = { x: 0.44, y: 0, s: 1, a: 1, c1: [.38,.65,1], c2: [.13,.83,.93] };
    function targetState(scrollY, vh, mobile) {
      var mid = scrollY + vh * 0.5, i = 0;
      while (i < centers.length - 2 && mid > centers[i + 1]) i++;
      var span = Math.max(1, centers[i + 1] - centers[i]);
      var f = Math.min(1, Math.max(0, (mid - centers[i]) / span));
      f = f * f * (3 - 2 * f);
      var a = K[i], b = K[Math.min(i + 1, K.length - 1)];
      function L(p, q) { return p + (q - p) * f; }
      var t = {
        x: L(a[0], b[0]), y: L(a[1], b[1]), s: L(a[2], b[2]), a: L(a[3], b[3]),
        c1: [L(C1[i][0], C1[i + 1][0]), L(C1[i][1], C1[i + 1][1]), L(C1[i][2], C1[i + 1][2])],
        c2: [L(C2[i][0], C2[i + 1][0]), L(C2[i][1], C2[i + 1][1]), L(C2[i][2], C2[i + 1][2])]
      };
      if (mobile) {
        t.x = 0; t.a *= 0.6; t.s *= 0.85;
        t.y = (scrollY < vh * 0.6) ? 0.32 : 0;
      }
      return t;
    }

    /* ---- sizing ---- */
    var dprCap = 1.75, aspect = 1, pscale = 1, mobile = false, lastW = 0, lastH = 0, proj;
    function resize(force) {
      var w = window.innerWidth, h = window.innerHeight;
      if (!force && w === lastW && Math.abs(h - lastH) < 150) return;
      lastW = w; lastH = h;
      var dpr = Math.min(window.devicePixelRatio || 1, dprCap);
      var cw = Math.max(1, Math.floor(w * dpr)), ch = Math.max(1, Math.floor(h * dpr));
      if (canvas.width !== cw || canvas.height !== ch) { canvas.width = cw; canvas.height = ch; }
      gl.viewport(0, 0, cw, ch);
      aspect = cw / ch;
      pscale = ch / (2 * Math.tan(FOV / 2));
      mobile = w < 880;
      proj = persp(FOV, aspect, 0.5, 90);
      computeCenters();
    }

    /* ---- input ---- */
    var mx = 0, my = 0, tmx = 0, tmy = 0;
    window.addEventListener('pointermove', function (e) {
      tmx = (e.clientX / window.innerWidth) * 2 - 1;
      tmy = (e.clientY / window.innerHeight) * 2 - 1;
    }, { passive: true });

    /* ---- render ---- */
    var Z0 = -9;
    function render(t, dt, snap) {
      var sy = window.pageYOffset || document.documentElement.scrollTop;
      var vh = window.innerHeight;
      var tg = targetState(sy, vh, mobile);
      var k = snap ? 1 : 1 - Math.exp(-dt * 3.2);
      cur.x += (tg.x - cur.x) * k; cur.y += (tg.y - cur.y) * k;
      cur.s += (tg.s - cur.s) * k; cur.a += (tg.a - cur.a) * k;
      for (var q = 0; q < 3; q++) {
        cur.c1[q] += (tg.c1[q] - cur.c1[q]) * k;
        cur.c2[q] += (tg.c2[q] - cur.c2[q]) * k;
      }
      var km = snap ? 1 : 1 - Math.exp(-dt * 4);
      mx += (tmx - mx) * km; my += (tmy - my) * km;

      var halfH = Math.tan(FOV / 2) * -Z0, halfW = halfH * aspect;
      var fit = Math.min(1.1, Math.max(0.6, aspect / 1.6));
      var cx = cur.x * halfW + mx * 0.45, cy = -cur.y * -halfH - my * 0.3;
      var sc = cur.s * fit, A = cur.a;
      var c1 = cur.c1, c2 = cur.c2;

      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform1f(uPscale, pscale);

      // floor grid, flowing toward the camera
      var flow = reduce ? 0 : (t * 0.9) % 3;
      draw(gridBuf, gridCount, gl.LINES, mul(proj, trans(-mx * 0.8, 0, flow)), 0.25, 0.5, 1, 0.20 * (mobile ? 0.6 : 1), 1);

      // stars
      var sm = mul(proj, mul(trans(-mx * 0.7, my * 0.4 - sy * 0.0008, Z0 - 2), mul(rotY(Math.sin(t * 0.05) * 0.22), rotX(Math.sin(t * 0.04) * 0.08))));
      draw(starsABuf, starsACount, gl.POINTS, sm, 0.7, 0.85, 1, 0.55 + 0.25 * Math.sin(t * 1.3), 0.075);
      draw(starsBBuf, starsBCount, gl.POINTS, sm, 0.55, 0.95, 0.95, 0.5 + 0.3 * Math.sin(t * 2.1 + 1.0), 0.06);

      // moving network
      if (!reduce) updateNet(dt);
      else if (!netCount) updateNet(0.016);
      var nm = mul(proj, trans(-mx * 0.6, my * 0.35 - sy * 0.0006, 0));
      draw(netLineBuf, netCount, gl.LINES, nm, 0.35, 0.65, 1, 0.34, 1);
      draw(netNodeBuf, NN, gl.POINTS, nm, 0.55, 0.85, 1, 0.9, 0.11);

      // core
      var base = mul(trans(cx, cy, Z0), mul(rotY(t * 0.18 + sy * 0.0007), rotX(t * 0.07 + 0.35)));
      var m1 = mul(proj, mul(base, scal(sc * 2.0)));
      draw(ico1L, ico1.lines.length / 3, gl.LINES, m1, c1[0], c1[1], c1[2], 0.85 * A, 1);
      draw(ico1P, ico1.points.length / 3, gl.POINTS, m1, c1[0], c1[1], c1[2], 1.0 * A, 0.12 * Math.max(0.7, sc));

      var inner = mul(trans(cx, cy, Z0), mul(rotY(-t * 0.35), mul(rotX(-t * 0.22), scal(sc * 1.05))));
      var m2 = mul(proj, inner);
      draw(ico0L, ico0.lines.length / 3, gl.LINES, m2, c2[0], c2[1], c2[2], 1.0 * A, 1);
      draw(ico0P, ico0.points.length / 3, gl.POINTS, m2, c2[0], c2[1], c2[2], 1.0 * A, 0.1 * Math.max(0.7, sc));

      // soft glow in the middle
      draw(originBuf, 1, gl.POINTS, mul(proj, trans(cx, cy, Z0)), c2[0], c2[1], c2[2], 0.5 * A, 2.6 * sc);

      // rings and satellites
      for (var r = 0; r < ring.length; r++) {
        var rg = ring[r];
        var rm = mul(trans(cx, cy, Z0), mul(rotZ(rg.tz), mul(rotX(rg.tx + t * rg.w), scal(sc))));
        var mvp = mul(proj, rm);
        draw(rg.buf, rg.n, gl.LINE_LOOP, mvp, c1[0], c1[1], c1[2], 0.5 * A, 1);
        var a0 = t * 0.9 * rg.dir + r * 2.1;
        rg.sat[0] = Math.cos(a0) * rg.r; rg.sat[1] = Math.sin(a0) * rg.r; rg.sat[2] = 0;
        rg.sat[3] = Math.cos(a0 + Math.PI) * rg.r; rg.sat[4] = Math.sin(a0 + Math.PI) * rg.r; rg.sat[5] = 0;
        gl.bindBuffer(gl.ARRAY_BUFFER, rg.satBuf);
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, rg.sat);
        draw(rg.satBuf, 2, gl.POINTS, mvp, 0.85, 1, 1, 1.0 * A, 0.17);
      }
    }

    /* ---- loop ---- */
    resize(true);
    if ('ResizeObserver' in window) new ResizeObserver(computeCenters).observe(document.body);
    window.addEventListener('load', computeCenters);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(computeCenters);

    var raf = 0;
    canvas.addEventListener('webglcontextlost', function (e) {
      e.preventDefault();
      cancelAnimationFrame(raf);
      canvas.style.display = 'none';
    });

    if (reduce) {
      var pending = false;
      var once = function () {
        if (pending) return;
        pending = true;
        requestAnimationFrame(function () { pending = false; render(3.0, 0.016, true); });
      };
      once();
      window.addEventListener('scroll', once, { passive: true });
      window.addEventListener('resize', function () { resize(false); once(); });
      return;
    }

    var last = performance.now(), t = 0, frames = 0, acc = 0, tuned = false;
    window.addEventListener('resize', function () { resize(false); });
    function loop(now) {
      var dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      t += dt;
      render(t, dt, false);
      if (!tuned) {
        frames++; acc += dt;
        if (frames === 90) {
          tuned = true;
          if (acc / frames > 0.034 && dprCap > 1) { dprCap = 1; resize(true); }
        }
      }
      raf = requestAnimationFrame(loop);
    }
    raf = requestAnimationFrame(loop);
  }

  /* ------------------------------------------------------------------ */
  function boot() {
    initBasics();
    initReveal();
    initCounters();
    initTyped();
    initActiveLink();
    initTilt();
    initFilters();
    initForm();
    try { initSphere(); } catch (e) { if (window.console) console.warn(e); }
    try { initScene(); } catch (e) { if (window.console) console.warn(e); var c = $('#scene'); if (c) c.style.display = 'none'; }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
