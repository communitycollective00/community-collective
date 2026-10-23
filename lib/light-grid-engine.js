// Homepage light grid: a honeycomb of LED tubes that covers the whole page and
// scrolls with it. Story words ignite in order. Names fire from the center of
// the screen like bullets, two at a time, burst into place, then float,
// flicker and take electric shocks. Touching the honeycomb fires a name into
// that cell. Everything steers around the page content listed in `avoid`.
//
// startLightGrid(canvas, { words, names, avoid, introSelector }) -> stop()

const CORE = "255,236,190";
const GLOW = "233,185,73";
const NAME_FONT = '"Bebas Neue", "Arial Narrow", "Arial Black", sans-serif';
const WORD_FONT = '"Bebas Neue", "Arial Narrow", "Arial Black", sans-serif';
const MONO_FONT = 'ui-monospace, "SFMono-Regular", Menlo, monospace';

export function startLightGrid(canvas, opts) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return () => {};
  const WORDS = (opts.words || []).map((w) => String(w).toUpperCase()).filter(Boolean);
  const NAMES = (opts.names || []).filter((n) => n && n.name);
  const avoidSel = opts.avoid || "";
  const introSel = opts.introSelector || "";
  const veil = typeof opts.veil === "number" ? opts.veil : 0; // optional dark wash drawn on the canvas itself
  const INTRO = opts.introText ? String(opts.introText).toUpperCase() : ""; // opening line; falls back to the first name
  const showGrid = opts.grid !== false; // draw the honeycomb tubes
  const calm = !!opts.calm; // fewer lights and one pair of names at a time
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let W = 0, H = 0, DPR = 1, R = 60, GH = 0, camY = 0;
  let verts = [], edges = [], adj = [], mids = [], cells = [], edgeCells = [];
  let heat = new Float32Array(0), hold = new Float32Array(0);
  let pulses = [], active = [], spawnQ = [], arcs = [], sparks = [], rings = [];
  let txt = null, nextTxt = 2.5, nextCluster = 1.5, wi = 0, ni = 0, pairId = 0;
  let introPending = opts.intro === false ? false : (!!INTRO || NAMES.length > 0), flash = 0, shake = 0, raf = 0, last = 0, stopped = false;

  const easeOut = (x) => 1 - Math.pow(1 - Math.min(1, Math.max(0, x)), 3);
  const easeIn = (x) => Math.pow(Math.min(1, Math.max(0, x)), 2);
  const ov = (a, b) => a[0] < b[2] && a[2] > b[0] && a[1] < b[3] && a[3] > b[1];
  const pairsOnScreen = () => (calm || W < 760 ? 1 : 2);

  /* ---------- honeycomb ---------- */
  // fresh = true wipes the names and starts over (width changed); false keeps them (page just got taller or shorter)
  function build(fresh = true) {
    W = window.innerWidth; H = window.innerHeight;
    DPR = Math.min(window.devicePixelRatio || 1, W < 760 ? 1.5 : 2);
    canvas.width = Math.round(W * DPR); canvas.height = Math.round(H * DPR);
    R = W < 600 ? 46 : W < 1100 ? 62 : 76;
    GH = Math.max(H, document.documentElement.scrollHeight);
    const hw = Math.sqrt(3) * R, vh = 1.5 * R, vmap = new Map(), emap = new Map();
    verts = []; edges = []; cells = [];
    const vid = (x, y) => { const k = Math.round(x) + "," + Math.round(y); let i = vmap.get(k); if (i === undefined) { i = verts.length; verts.push([x, y]); vmap.set(k, i); } return i; };
    const eid = (a, b) => { const k = a < b ? a + "-" + b : b + "-" + a; let i = emap.get(k); if (i === undefined) { i = edges.length; edges.push([a, b]); emap.set(k, i); } return i; };
    for (let r = -1; (r - 1) * vh < GH + R; r++) for (let c = -1; (c - 1) * hw < W + hw; c++) {
      const cx = c * hw + (r & 1 ? hw / 2 : 0), cy = r * vh, vs = [];
      for (let k = 0; k < 6; k++) { const a = (Math.PI / 180) * (60 * k - 30); vs.push(vid(cx + R * Math.cos(a), cy + R * Math.sin(a))); }
      const es = []; for (let k = 0; k < 6; k++) es.push(eid(vs[k], vs[(k + 1) % 6]));
      cells.push({ cx, cy, es });
    }
    adj = verts.map(() => []); edges.forEach(([a, b], i) => { adj[a].push([b, i]); adj[b].push([a, i]); });
    mids = edges.map(([a, b]) => [(verts[a][0] + verts[b][0]) / 2, (verts[a][1] + verts[b][1]) / 2]);
    edgeCells = edges.map(() => []); cells.forEach((c, ci) => c.es.forEach((e) => edgeCells[e].push(ci)));
    heat = new Float32Array(edges.length); hold = new Float32Array(edges.length);
    camY = window.scrollY;
    const n = showGrid ? Math.max(calm ? 2 : 4, Math.round((W * H) / (calm ? 160000 : 52000))) : 0; pulses = []; for (let i = 0; i < n; i++) pulses.push(spawnPulse());
    if (!fresh) return;
    if (active.some((n) => n.intro)) document.body.classList.remove("cc-intro");
    active = []; arcs = []; sparks = []; rings = []; txt = null; spawnQ = [];
    const k = pairsOnScreen();
    if (introPending) { spawnQ.push(0.6); for (let i = 1; i < k; i++) spawnQ.push(6.6 + i * 0.9); }
    else for (let i = 0; i < k; i++) spawnQ.push(0.3 + i * 0.9);
  }
  function seg(i) { const [a, b] = edges[i], [x1, y1] = verts[a], [x2, y2] = verts[b], g = 0.09; ctx.moveTo(x1 + (x2 - x1) * g, y1 + (y2 - y1) * g); ctx.lineTo(x2 - (x2 - x1) * g, y2 - (y2 - y1) * g); }
  function tubes(f) { ctx.beginPath(); for (let i = 0; i < edges.length; i++) if (f(i)) seg(i); ctx.stroke(); }
  function spawnPulse() {
    let v = 0; for (let k = 0; k < 40; k++) { v = (Math.random() * verts.length) | 0; const y = verts[v][1]; if (y > camY - R && y < camY + H + R) break; }
    const nb = adj[v][(Math.random() * adj[v].length) | 0];
    return { from: v, to: nb[0], e: nb[1], t: Math.random(), spd: 0.55 + Math.random() * 0.7, life: 6 + ((Math.random() * 16) | 0) };
  }
  function stepPulse(p, dt) {
    p.t += p.spd * dt * 1.6;
    heat[p.e] = Math.max(heat[p.e], Math.min(1, p.t + 0.3));
    while (p.t >= 1) {
      p.t -= 1; const prev = p.from; p.from = p.to;
      if (--p.life <= 0) { Object.assign(p, spawnPulse()); return; }
      const o = adj[p.from].filter((x) => x[0] !== prev), nb = o.length ? o[(Math.random() * o.length) | 0] : adj[p.from][0];
      p.to = nb[0]; p.e = nb[1];
      const [x, y] = verts[p.to];
      if (x < -R * 2 || y < camY - R * 2 || x > W + R * 2 || y > camY + H + R * 2) { Object.assign(p, spawnPulse()); return; }
    }
  }
  function grow(start, size, dur) {
    const set = new Set([start]), q = [start];
    while (q.length && set.size < size) { const c = q.shift(); for (const e of cells[c].es) for (const n of edgeCells[e]) if (!set.has(n) && set.size < size && Math.random() < 0.65) { set.add(n); q.push(n); } }
    set.forEach((c) => cells[c].es.forEach((e) => { hold[e] = Math.max(hold[e], dur); }));
  }
  function nearestCell(x, y) { let bi = 0, bd = 1e12; for (let i = 0; i < cells.length; i++) { const c = cells[i], d = (c.cx - x) ** 2 + (c.cy - y) ** 2; if (d < bd) { bd = d; bi = i; } } return bi; }

  /* ---------- page content to steer around (page coordinates) ---------- */
  function avoid() {
    const rs = [];
    if (avoidSel) document.querySelectorAll(avoidSel).forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.width && r.height && r.bottom > -40 && r.top < H + 40) rs.push([r.left - 14, r.top - 14 + camY, r.right + 14, r.bottom + 14 + camY]);
    });
    if (txt) rs.push(txt.box);
    return rs;
  }
  function measure(text, size, font) { ctx.font = `${size}px ${font}`; return ctx.measureText(text).width; }

  /* ---------- story words, igniting in order ---------- */
  function nextWord() {
    if (!WORDS.length) return;
    const text = WORDS[wi % WORDS.length];
    let size = Math.min(W * 0.075, 104), sp = size * 0.12;
    let w = measure(text, size, WORD_FONT) + sp * (text.length - 1);
    if (w > W * 0.62) { size *= (W * 0.62) / w; sp = size * 0.12; w = W * 0.62; }
    const av = avoid(); let x = 0, y = 0, ok = false;
    for (let k = 0; k < 80 && !ok; k++) {
      x = 16 + Math.random() * Math.max(1, W - w - 32); y = camY + size * 0.7 + 70 + Math.random() * Math.max(1, H - size * 1.4 - 160);
      const b = [x - 16, y - size * 0.7, x + w + 16, y + size * 0.7];
      ok = !av.some((r) => ov(b, r)) && !active.some((n) => ov(b, n.box));
    }
    if (!ok) { nextTxt = 0.6; return; }
    wi++;
    txt = { text, size, sp, x, y, t: 0, ign: 1.1, hld: 2.6, out: 1.2, flick: new Float32Array(text.length).fill(1), box: [x - 16, y - size * 0.7, x + w + 16, y + size * 0.7] };
    grow(nearestCell(x + w / 2, y), 3 + ((Math.random() * 3) | 0), txt.ign + txt.hld);
  }
  function drawWord(dt) {
    if (!txt) return; const o = txt; o.t += dt; const T = o.t, len = o.text.length;
    if (T > o.ign + o.hld + o.out) { txt = null; nextTxt = 2 + Math.random() * 2; return; }
    const lit = T < o.ign ? Math.floor((T / o.ign) * len) + 1 : len, fade = T < o.ign + o.hld ? 1 : Math.max(0, 1 - (T - o.ign - o.hld) / o.out);
    ctx.font = `${o.size}px ${WORD_FONT}`; ctx.textBaseline = "middle"; let x = o.x;
    for (let i = 0; i < len; i++) {
      const ch = o.text[i], cw = ctx.measureText(ch).width;
      if (i < lit) {
        if (Math.random() < 0.02) o.flick[i] = 0.25; o.flick[i] += (1 - o.flick[i]) * 0.15; const a = 0.2 * fade * o.flick[i];
        ctx.globalAlpha = a * 0.6; ctx.lineWidth = o.size * 0.09; ctx.strokeStyle = `rgb(${GLOW})`; ctx.strokeText(ch, x, o.y);
        ctx.globalAlpha = a; ctx.lineWidth = Math.max(1.2, o.size * 0.022); ctx.strokeStyle = `rgb(${CORE})`; ctx.strokeText(ch, x, o.y);
      }
      x += cw + o.sp;
    }
    ctx.globalAlpha = 1;
  }

  /* ---------- names: fired two at a time ---------- */
  function newName(p, idx, pair, text, size, x, y, w, room, box, extra) {
    ctx.font = `${size}px ${NAME_FONT}`;
    const cx = []; for (let i = 0; i < text.length; i++) cx.push(ctx.measureText(text.slice(0, i)).width);
    return Object.assign({ p, idx, pair, text, size, x, y, w, room, box, cx, on: 0.95, off: 1, featured: false, intro: false, peak: 0.5,
      dip: 1, f: 1, env: 0, a: 0, ph: Math.random() * 6.28, ld: new Float32Array(text.length).fill(1),
      lr: Float32Array.from(text, () => 2.5 + Math.random() * 4), sh: 0, jx: 0, jy: 0, lastHit: 0 }, extra);
  }
  function detailLine(p) { return [p.age ? "AGE " + p.age : "", (p.place || "").toUpperCase(), p.year || ""].filter(Boolean).join("  ·  "); }
  function detailSize(size) { return Math.max(10, Math.min(12, size * 0.3)); }
  function spawnName(pair, holdFor) {
    if (!NAMES.length) return false;
    const idx = ni % NAMES.length;
    if (introPending) {
      // opening shot: a line (or the first name) swells up big from dead center
      introPending = false;
      const p = INTRO ? { name: INTRO } : NAMES[idx], text = p.name.toUpperCase();
      if (!INTRO) ni++;
      let size = Math.min(W * 0.12, 150); while (size > 14 && measure(text, size, NAME_FONT) > W * 0.88) size *= 0.92;
      const w = measure(text, size, NAME_FONT), x = (W - w) / 2, y = camY + H * 0.44;
      active.push(newName(p, idx, pair, text, size, x, y, w, Math.max(w, Math.min(520, W - 32)), [0, camY, W, camY + H * 0.85],
        { t: -0.9, fly: 0.9, sx: W / 2, sy: y, on: 0.9, hold: 3.4, off: 1.1, featured: !INTRO, intro: true, peak: 1 }));
      if (introSel) document.body.classList.add("cc-intro");
      return true;
    }
    const p = NAMES[idx], text = p.name.toUpperCase();
    let size = Math.min(Math.max(W * 0.03, 18), 46) * (0.85 + Math.random() * 0.4);
    while (size > 12 && measure(text, size, NAME_FONT) > W - 24) size *= 0.9;
    const av = avoid();
    for (let tries = 0; tries < 6; tries++) {
      const w = measure(text, size, NAME_FONT); ctx.font = `500 ${detailSize(size)}px ${MONO_FONT}`;
      const room = Math.min(W - 24, Math.max(w, ctx.measureText(detailLine(p)).width)), extra = Math.max(20, size * 0.8);
      for (let k = 0; k < 140; k++) {
        const x = 12 + Math.random() * Math.max(1, W - room - 24), y = camY + size * 0.7 + 24 + Math.random() * Math.max(1, H - size * 1.4 - extra - 36);
        const box = [x - 12, y - size * 0.75 - 12, x + room + 12, y + size * 0.75 + extra];
        if (box[1] < camY + 40 || box[3] > camY + H - 70) continue;
        if (av.some((r) => ov(box, r)) || active.some((n) => ov(box, n.box))) continue;
        ni++; const fl = 0.22 + Math.random() * 0.13;
        active.push(newName(p, idx, pair, text, size, x, y, w, room, box,
          { t: -fl, fly: fl, sx: W / 2 + (Math.random() - 0.5) * W * 0.06, sy: camY + H * 0.46 + (Math.random() - 0.5) * H * 0.06, hold: holdFor || 3, peak: 0.6 }));
        return true;
      }
      size *= 0.85;
    }
    return false;
  }
  function firePair() {
    if (introPending) { spawnName(++pairId, 0); return; }
    const id = ++pairId, holdFor = 2.4 + Math.random() * 1.2, a = spawnName(id, holdFor), b = spawnName(id, holdFor);
    if (!a && !b) spawnQ.push(0.4);
  }
  function summonName(tx, ty) {
    if (!NAMES.length) return false;
    const idx = ni % NAMES.length, p = NAMES[idx], text = p.name.toUpperCase();
    let size = Math.min(Math.max(W * 0.03, 18), 40); while (size > 12 && measure(text, size, NAME_FONT) > W - 24) size *= 0.9;
    const w = measure(text, size, NAME_FONT); ctx.font = `500 ${detailSize(size)}px ${MONO_FONT}`;
    const room = Math.min(W - 24, Math.max(w, ctx.measureText(detailLine(p)).width)), extra = Math.max(20, size * 0.8), av = avoid();
    for (const dy of [0, -size * 1.8, size * 1.8]) {
      const x = Math.min(Math.max(12, tx - w / 2), W - room - 12), y = ty + dy, box = [x - 12, y - size * 0.75 - 12, x + room + 12, y + size * 0.75 + extra];
      if (box[1] < camY + 40 || box[3] > camY + H - 70) continue;
      if (av.some((r) => ov(box, r)) || active.some((n) => ov(box, n.box))) continue;
      ni++; const fl = 0.2 + Math.random() * 0.08;
      active.push(newName(p, idx, -1, text, size, x, y, w, room, box, { t: -fl, fly: fl, sx: W / 2, sy: camY + H * 0.46, hold: 2.2, peak: 0.6 }));
      return true;
    }
    return false;
  }

  /* ---------- bursts and shocks ---------- */
  function shock(n) {
    n.sh = 0.28; n.jx = (Math.random() - 0.5) * n.size * 0.14; n.jy = (Math.random() - 0.5) * n.size * 0.1;
    const k = (Math.random() * n.text.length) | 0; for (let i = 0; i < n.ld.length; i++) if (Math.abs(i - k) < 3) n.ld[i] = 1.35;
    const sx = n.x + n.cx[k] + n.size * 0.25, sy = n.y, count = 1 + ((Math.random() * 2) | 0);
    for (let c = 0; c < count; c++) {
      const ang = Math.random() * Math.PI * 2, d = n.size * (1.2 + Math.random() * 2.2) + R * 0.4, ex = sx + Math.cos(ang) * d, ey = sy + Math.sin(ang) * d;
      arcs.push({ x1: sx, y1: sy, x2: ex, y2: ey, life: 0.16 + Math.random() * 0.16, max: 0.32 });
      const r2 = (R * 0.9) ** 2; for (let i = 0; i < mids.length; i++) { const dx = mids[i][0] - ex, dy = mids[i][1] - ey; if (dx * dx + dy * dy < r2) heat[i] = Math.max(heat[i], 0.85); }
    }
    for (let i = 0; i < 7 + ((Math.random() * 6) | 0); i++) { const ang = Math.random() * Math.PI * 2, v = 50 + Math.random() * 170; sparks.push({ x: sx, y: sy, vx: Math.cos(ang) * v, vy: Math.sin(ang) * v, life: 0.25 + Math.random() * 0.35, max: 0.6 }); }
  }
  function burst(n) {
    const cx = n.x + n.w / 2, big = n.intro ? 1.3 : 1;
    rings.push({ x: cx, y: n.y, r0: n.size * 0.15, r1: (n.size * 2.4 + 70) * big, life: n.intro ? 1 : 0.32, max: n.intro ? 1 : 0.32 });
    const count = n.intro ? 16 : 26 + ((Math.random() * 14) | 0);
    for (let i = 0; i < count; i++) { const ang = Math.random() * Math.PI * 2, v = n.intro ? 60 + Math.random() * 180 : 220 + Math.random() * 520; sparks.push({ x: cx, y: n.y, vx: Math.cos(ang) * v, vy: Math.sin(ang) * v, life: 0.25 + Math.random() * 0.4, max: 0.65 }); }
    flash = Math.max(flash, n.intro ? 0.07 : 0.16); shake = Math.max(shake, n.intro ? 0 : 0.12);
    const r2 = (R * 1.6 * big) ** 2; for (let i = 0; i < mids.length; i++) { const dx = mids[i][0] - cx, dy = mids[i][1] - n.y; if (dx * dx + dy * dy < r2) heat[i] = 1; }
    grow(nearestCell(cx, n.y), n.intro ? 7 : 3, n.on + n.hold);
    if (!n.intro) shock(n);
  }

  let clashT = 0;
  function stepNames(dt) {
    let clash = null; if ((clashT -= dt) <= 0) { clashT = 0.2; clash = avoid(); }
    for (let i = spawnQ.length - 1; i >= 0; i--) { spawnQ[i] -= dt; if (spawnQ[i] <= 0) { spawnQ.splice(i, 1); firePair(); } }
    for (let i = active.length - 1; i >= 0; i--) {
      const n = active[i];
      if (n.t < 0) { n.t += dt; if (n.t < 0) { n.a = 0; continue; } burst(n); } else n.t += dt;
      const T = n.t, igniting = T < n.on;
      for (let j = 0; j < n.ld.length; j++) { if (Math.random() < dt * (igniting ? 3 : 1.1)) n.ld[j] = Math.min(n.ld[j], 0.05 + Math.random() * 0.55); n.ld[j] += (1 - n.ld[j]) * Math.min(1, dt * n.lr[j]); }
      if (Math.random() < dt * (igniting ? 1.6 : 0.3)) n.dip = Math.min(n.dip, 0.35 + Math.random() * 0.35);
      n.dip += (1 - n.dip) * Math.min(1, dt * 4);
      n.env = T < n.on ? easeOut(T / (n.on * 0.45)) : T < n.on + n.hold ? 1 : 1 - easeIn((T - n.on - n.hold) / n.off);
      n.f = 0.88 + 0.12 * Math.sin(T * 6.1 + n.ph) * Math.sin(T * 1.7 + n.ph * 1.3);
      n.a = n.peak * n.env * n.f * n.dip;
      if (n.intro && T > n.on + n.hold - 0.2) document.body.classList.remove("cc-intro");
      if (clash && !n.intro && T > 0 && T < n.on + n.hold && clash.some((r) => ov(n.box, r))) n.hold = Math.max(0, T - n.on);
      if (n.sh > 0) n.sh -= dt; else if (n.env > 0.5 && Math.random() < dt * (n.intro ? 0.15 : 0.4)) shock(n);
      if (T > n.on + n.hold + n.off) { active.splice(i, 1); if (n.pair > 0 && !active.some((m) => m.pair === n.pair)) spawnQ.push(0.1 + Math.random() * 0.2); }
    }
    flash *= Math.exp(-dt * 9); shake = Math.max(0, shake - dt);
    for (let i = arcs.length - 1; i >= 0; i--) { arcs[i].life -= dt; if (arcs[i].life <= 0) arcs.splice(i, 1); }
    for (let i = rings.length - 1; i >= 0; i--) { rings[i].life -= dt; if (rings[i].life <= 0) rings.splice(i, 1); }
    for (let i = sparks.length - 1; i >= 0; i--) { const p = sparks[i]; p.life -= dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vx *= 0.95; p.vy = p.vy * 0.95 + 60 * dt; if (p.life <= 0) sparks.splice(i, 1); }
  }

  /* ---------- drawing ---------- */
  function bolt(x1, y1, x2, y2, d, pts) { if (d < 3) { pts.push([x2, y2]); return; } const mx = (x1 + x2) / 2 + (Math.random() - 0.5) * d, my = (y1 + y2) / 2 + (Math.random() - 0.5) * d; bolt(x1, y1, mx, my, d / 2, pts); bolt(mx, my, x2, y2, d / 2, pts); }
  function drawShocks() {
    ctx.globalCompositeOperation = "lighter"; ctx.lineJoin = "round";
    arcs.forEach((a) => {
      const k = a.life / a.max, pts = [[a.x1, a.y1]]; bolt(a.x1, a.y1, a.x2, a.y2, Math.hypot(a.x2 - a.x1, a.y2 - a.y1) * 0.35, pts);
      ctx.beginPath(); pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
      ctx.globalAlpha = k * 0.25; ctx.strokeStyle = `rgb(${GLOW})`; ctx.lineWidth = 6; ctx.stroke();
      ctx.globalAlpha = k * 0.9; ctx.strokeStyle = `rgb(${CORE})`; ctx.lineWidth = 1.3; ctx.stroke();
    });
    rings.forEach((r) => {
      const k = r.life / r.max, u = 1 - k, rad = r.r0 + (r.r1 - r.r0) * easeOut(u);
      ctx.globalAlpha = k * 0.5; ctx.strokeStyle = `rgb(${GLOW})`; ctx.lineWidth = 10 * k + 1; ctx.beginPath(); ctx.arc(r.x, r.y, rad, 0, Math.PI * 2); ctx.stroke();
      ctx.globalAlpha = k * 0.9; ctx.strokeStyle = `rgb(${CORE})`; ctx.lineWidth = 1.5; ctx.stroke();
      if (u < 0.25) { const g = ctx.createRadialGradient(r.x, r.y, 0, r.x, r.y, r.r1 * 0.6); g.addColorStop(0, `rgba(${CORE},${(1 - u * 4) * 0.55})`); g.addColorStop(1, `rgba(${GLOW},0)`); ctx.globalAlpha = 1; ctx.fillStyle = g; ctx.beginPath(); ctx.arc(r.x, r.y, r.r1 * 0.6, 0, Math.PI * 2); ctx.fill(); }
    });
    ctx.lineCap = "round";
    sparks.forEach((p) => { ctx.globalAlpha = p.life / p.max; ctx.strokeStyle = `rgb(${CORE})`; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x - p.vx * 0.04, p.y - p.vy * 0.04); ctx.stroke(); });
  }
  function drawBullet(n) {
    const u = 1 + n.t / n.fly, e = n.intro ? u * u : u * u * u, tx = n.x + n.w / 2, px = n.sx + (tx - n.sx) * e, py = n.sy + (n.y - n.sy) * e;
    const pu = Math.max(0, u - 0.22), pe = pu * pu * pu, qx = n.sx + (tx - n.sx) * pe, qy = n.sy + (n.y - n.sy) * pe, r = 2 + n.size * (n.intro ? 0.14 : 0.32) * e;
    ctx.globalCompositeOperation = "lighter"; ctx.lineCap = "round";
    ctx.globalAlpha = 0.35 * u; ctx.strokeStyle = `rgb(${GLOW})`; ctx.lineWidth = r * 1.1; ctx.beginPath(); ctx.moveTo(qx, qy); ctx.lineTo(px, py); ctx.stroke();
    ctx.globalAlpha = 0.8 * u; ctx.strokeStyle = `rgb(${CORE})`; ctx.lineWidth = Math.max(1, r * 0.3); ctx.stroke();
    const g = ctx.createRadialGradient(px, py, 0, px, py, r * 2.4); g.addColorStop(0, `rgba(${CORE},1)`); g.addColorStop(0.3, `rgba(${GLOW},.5)`); g.addColorStop(1, `rgba(${GLOW},0)`);
    ctx.globalAlpha = Math.min(1, 0.4 + u); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(px, py, r * 2.4, 0, Math.PI * 2); ctx.fill();
  }
  function wrapLines(text, maxW) { const words = text.split(" "), lines = []; let cur = ""; words.forEach((w) => { const t = cur ? cur + " " + w : w; if (ctx.measureText(t).width > maxW && cur) { lines.push(cur); cur = w; } else cur = t; }); if (cur) lines.push(cur); return lines.slice(0, 3); }
  function drawNames() {
    const narrow = W < 760;
    active.forEach((n) => {
      if (n.t < 0) { drawBullet(n); return; }
      if (n.a < 0.005) return;
      const T = n.t, jolt = n.sh > 0 ? (n.sh / 0.28) * (Math.random() < 0.5 ? -1 : 1) : 0, ox = n.jx * jolt;
      const y = n.y + n.jy * jolt + Math.sin(T * 1.3 + n.ph) * 3.5;
      const pk = n.intro ? 0.7 : 0.4, po = n.intro ? 0.08 : 0.32, k = T < pk ? 1 + po * (1 - easeOut(T / pk)) : 1 + 0.018 * Math.sin(T * 3.2 + n.ph);
      const len = n.text.length, stag = Math.min(0.03, 0.25 / len), fading = T > n.on + n.hold;
      ctx.globalCompositeOperation = "lighter"; ctx.textBaseline = "middle";
      ctx.save(); ctx.translate(n.x + n.w / 2 + ox, y); ctx.scale(k, k); ctx.font = `${n.size}px ${NAME_FONT}`;
      for (let i = 0; i < len; i++) {
        const ch = n.text[i]; if (ch === " ") continue;
        const lt = T - i * stag, le = fading ? n.env : easeOut(lt / (n.on * 0.45)), la = Math.min(1, n.peak * le * n.f * n.dip * n.ld[i]); if (la < 0.005) continue;
        const x = n.cx[i] - n.w / 2 + (n.sh > 0 ? (Math.random() - 0.5) * n.size * 0.05 : 0);
        ctx.globalAlpha = la * 0.08; ctx.lineWidth = n.size * 0.28; ctx.strokeStyle = `rgb(${GLOW})`; ctx.strokeText(ch, x, 0);
        ctx.globalAlpha = la * 0.35; ctx.lineWidth = n.size * 0.11; ctx.strokeText(ch, x, 0);
        ctx.globalAlpha = la; ctx.lineWidth = Math.max(1, n.size * 0.03); ctx.strokeStyle = `rgb(${CORE})`; ctx.strokeText(ch, x, 0);
      }
      ctx.restore();
      if (n.env < 0.55 || T < 0.25 || (n.intro && !n.featured)) return;
      const ca = Math.min(1, (n.env - 0.55) / 0.45) * Math.min(1, (T - 0.25) / 0.4) * n.dip, p = n.p, det = detailLine(p);
      const fs = n.featured ? (narrow ? 12 : 13.5) : detailSize(n.size), hs = narrow ? 14 : 16;
      ctx.textBaseline = "top"; ctx.globalCompositeOperation = "source-over";
      let lines = []; if (n.featured && p.how) { ctx.font = `400 ${hs}px Inter, system-ui, sans-serif`; lines = wrapLines(p.how, n.room - 28); }
      const top = y + n.size * 0.55, bx = n.intro ? (W - n.room) / 2 : n.x;
      if (n.featured) {
        ctx.font = `500 ${fs}px ${MONO_FONT}`; let bw = ctx.measureText(det).width;
        ctx.font = `400 ${hs}px Inter, system-ui, sans-serif`; lines.forEach((l) => (bw = Math.max(bw, ctx.measureText(l).width)));
        bw = Math.min(bw + 28, W - 24); const bh = 12 + fs + 10 + lines.length * (hs + 6) + 8, bxx = n.intro ? (W - bw) / 2 : bx - 14;
        ctx.globalAlpha = ca * 0.8; ctx.fillStyle = "#070605"; ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(bxx, top, bw, bh, 10); else ctx.rect(bxx, top, bw, bh); ctx.fill();
        ctx.globalAlpha = ca * 0.95; ctx.fillStyle = `rgb(${GLOW})`; ctx.font = `500 ${fs}px ${MONO_FONT}`; ctx.fillText(det, bxx + 14, top + 12);
        ctx.globalAlpha = ca; ctx.fillStyle = "rgb(246,239,227)"; ctx.font = `400 ${hs}px Inter, system-ui, sans-serif`;
        lines.forEach((l, li) => ctx.fillText(l, bxx + 14, top + 12 + fs + 10 + li * (hs + 6)));
      } else {
        ctx.globalAlpha = ca * 0.95; ctx.fillStyle = `rgb(${GLOW})`; ctx.font = `500 ${fs}px ${MONO_FONT}`; ctx.fillText(det, bx, top + 2);
      }
    });
    ctx.textBaseline = "middle"; ctx.globalCompositeOperation = "lighter";
  }
  function render(dt) {
    camY = window.scrollY;
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (veil > 0) { ctx.globalCompositeOperation = "source-over"; ctx.globalAlpha = 1; ctx.fillStyle = `rgba(7,6,5,${veil})`; ctx.fillRect(0, 0, canvas.width, canvas.height); }
    ctx.setTransform(DPR, 0, 0, DPR, 0, -camY * DPR); ctx.lineCap = "round"; ctx.globalCompositeOperation = "source-over";
    const y0 = camY - R, y1 = camY + H + R, vis = (i) => showGrid && mids[i][1] > y0 && mids[i][1] < y1;
    ctx.globalAlpha = 1; ctx.strokeStyle = "rgba(246,239,227,.07)"; ctx.lineWidth = Math.max(1, R * 0.03); tubes(vis);
    ctx.globalCompositeOperation = "lighter";
    for (let lv = 1; lv <= 6; lv++) {
      const lo = (lv - 1) / 6, hi = lv / 6, f = (i) => heat[i] > Math.max(lo, 0.02) && heat[i] <= hi && vis(i);
      ctx.globalAlpha = hi * 0.16; ctx.strokeStyle = `rgb(${GLOW})`; ctx.lineWidth = R * 0.34; tubes(f);
      ctx.globalAlpha = hi * 0.5; ctx.lineWidth = R * 0.13; tubes(f);
      ctx.globalAlpha = hi * 0.95; ctx.strokeStyle = `rgb(${CORE})`; ctx.lineWidth = R * 0.05; tubes(f);
    }
    ctx.globalAlpha = 1;
    pulses.forEach((p) => {
      const [x1, y1p] = verts[p.from], [x2, y2] = verts[p.to], x = x1 + (x2 - x1) * p.t, y = y1p + (y2 - y1p) * p.t;
      const g = ctx.createRadialGradient(x, y, 0, x, y, R * 0.45); g.addColorStop(0, `rgba(${CORE},.9)`); g.addColorStop(0.25, `rgba(${GLOW},.35)`); g.addColorStop(1, `rgba(${GLOW},0)`);
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, R * 0.45, 0, Math.PI * 2); ctx.fill();
    });
    drawWord(dt); drawNames(); drawShocks();
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    if (flash > 0.005) { ctx.globalCompositeOperation = "lighter"; ctx.globalAlpha = flash * 0.45; ctx.fillStyle = `rgb(${CORE})`; ctx.fillRect(0, 0, W, H); }
    canvas.style.transform = shake > 0 ? `translate(${((Math.random() - 0.5) * shake * 34).toFixed(1)}px,${((Math.random() - 0.5) * shake * 34).toFixed(1)}px)` : "";
    ctx.globalCompositeOperation = "source-over"; ctx.globalAlpha = 1;
  }
  function frame(now) {
    if (stopped) return;
    const dt = Math.min(0.05, (now - last) / 1000 || 0); last = now;
    const k = Math.exp(-dt * 1.5);
    for (let i = 0; i < heat.length; i++) { heat[i] *= k; if (hold[i] > 0) { hold[i] -= dt; heat[i] = Math.max(heat[i], Math.min(1, hold[i] * 1.4) * 0.95); } }
    pulses.forEach((p) => stepPulse(p, dt));
    if (showGrid && (nextCluster -= dt) <= 0) { grow(nearestCell(Math.random() * W, camY + Math.random() * H), 3 + ((Math.random() * 5) | 0), 2.2 + Math.random() * 2); nextCluster = (2.2 + Math.random() * 3) * (calm ? 2.5 : 1); }
    if (!txt && (nextTxt -= dt) <= 0) nextWord();
    stepNames(dt);
    render(dt);
    raf = requestAnimationFrame(frame);
  }

  /* ---------- touch: light the tubes, fire a name into the cell, shock a name ---------- */
  let lastCell = -1, lastSummon = 0, lastCheck = 0;
  function overContent(cx, cy) { const el = document.elementFromPoint(cx, cy); if (!el || !el.closest) return false; return !!el.closest((avoidSel ? avoidSel + "," : "") + "a,button,input,textarea,select"); }
  function touchGrid(cx, cy, tap) {
    const now = performance.now(); if (!tap && now - lastCheck < 60) return; lastCheck = now;
    const wx = cx, wy = cy + camY;
    active.forEach((n) => { if (n.t > 0 && n.env > 0.5 && wx > n.box[0] && wx < n.box[2] && wy > n.box[1] && wy < n.box[3] && now - n.lastHit > 700) { n.lastHit = now; shock(n); } });
    if (overContent(cx, cy)) return;
    const c = nearestCell(wx, wy); if (!tap && c === lastCell) return; lastCell = c;
    if (now - lastSummon < (tap ? 250 : 850)) return;
    if (active.filter((n) => n.pair < 0).length >= 3) return;
    if (summonName(cells[c].cx, cells[c].cy)) lastSummon = now;
  }
  function onMove(e) {
    if (!mids.length) return;
    const r2 = (R * 1.3) ** 2, wy = e.clientY + camY;
    for (let i = 0; i < mids.length; i++) { const dx = mids[i][0] - e.clientX, dy = mids[i][1] - wy; if (dx * dx + dy * dy < r2 && heat[i] < 0.7) heat[i] = 0.7; }
    touchGrid(e.clientX, e.clientY, false);
  }
  function onDown(e) { if (mids.length) touchGrid(e.clientX, e.clientY, true); }

  /* ---------- lifecycle ---------- */
  let rt = 0, gt = 0;
  // phones fire resize while scrolling (the address bar hides), so only start over when the width really changes
  function onResize() { clearTimeout(rt); rt = setTimeout(() => { const fresh = window.innerWidth !== W; build(fresh); if (reduced) still(); }, 150); }
  const ro = new ResizeObserver(() => { clearTimeout(gt); gt = setTimeout(() => { if (Math.abs(document.documentElement.scrollHeight - GH) > 60) { build(false); if (reduced) still(); } }, 250); });
  function onVisible() { last = performance.now(); }
  function still() {
    // reduced motion: one composed frame, nothing moving
    introPending = false; document.body.classList.remove("cc-intro");
    for (let i = 0; i < 3; i++) grow(nearestCell(Math.random() * W, camY + Math.random() * H), 5, 1);
    nextWord(); if (txt) txt.t = txt.ign + 0.5;
    spawnQ = []; for (let i = 0; i < pairsOnScreen(); i++) { const id = ++pairId; spawnName(id, 3); spawnName(id, 3); }
    active.forEach((n) => { n.t = n.on + 0.5; n.env = 1; n.f = 1; n.dip = 1; n.a = n.peak; });
    for (let i = 0; i < hold.length; i++) if (hold[i] > 0) heat[i] = 0.8;
    render(0);
  }

  build();
  window.addEventListener("resize", onResize);
  ro.observe(document.body);
  const onScrollStill = () => render(0);
  if (reduced) {
    still();
    window.addEventListener("scroll", onScrollStill, { passive: true });
  } else {
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    document.addEventListener("visibilitychange", onVisible);
    grow(nearestCell(W / 2, camY + H / 2), 5, 3);
    raf = requestAnimationFrame((t) => { last = t; frame(t); });
  }

  return function stop() {
    stopped = true; cancelAnimationFrame(raf); clearTimeout(rt); clearTimeout(gt); ro.disconnect();
    window.removeEventListener("resize", onResize);
    window.removeEventListener("pointermove", onMove);
    window.removeEventListener("pointerdown", onDown);
    window.removeEventListener("scroll", onScrollStill);
    document.removeEventListener("visibilitychange", onVisible);
    document.body.classList.remove("cc-intro");
  };
}
