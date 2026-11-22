/* =========================================================
   Night Before Exam
   A one-night survival game. 9 PM -> 9 AM. Good luck.
   ========================================================= */
(() => {
  'use strict';

  const D = window.NBE_DATA;

  // ---------- helpers ----------
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const rand = (a, b) => a + Math.random() * (b - a);
  const ri = (a, b) => Math.floor(rand(a, b + 1));
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const chance = (p) => Math.random() < p;
  const shuffle = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const lerp = (a, b, t) => a + (b - a) * t;
  const val = (v) => (typeof v === 'function' ? v() : v);
  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* ignore */ } },
  };

  const TOTAL = 720;          // minutes from 21:00 to 09:00
  const SLEEP_ALARM = 630;    // 07:30

  // ---------- audio (synthesised, no files) ----------
  const Sfx = (() => {
    let ctx = null;
    let muted = store.get('nbe-muted') === '1';
    const ac = () => {
      if (!ctx) { const C = window.AudioContext || window.webkitAudioContext; if (!C) return null; ctx = new C(); }
      if (ctx.state === 'suspended') ctx.resume();
      return ctx;
    };
    const tone = (freq, dur, type = 'sine', vol = 0.12, when = 0, slide = 0) => {
      if (muted) return; const c = ac(); if (!c) return;
      const t = c.currentTime + when, o = c.createOscillator(), g = c.createGain();
      o.type = type; o.frequency.setValueAtTime(freq, t);
      if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, freq + slide), t + dur);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(vol, t + 0.012);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g).connect(c.destination); o.start(t); o.stop(t + dur + 0.03);
    };
    const noise = (dur, vol = 0.15, when = 0, freq = 900) => {
      if (muted) return; const c = ac(); if (!c) return;
      const t = c.currentTime + when, len = Math.floor(c.sampleRate * dur);
      const buf = c.createBuffer(1, len, c.sampleRate), d = buf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
      const src = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain();
      src.buffer = buf; f.type = 'bandpass'; f.frequency.value = freq; g.gain.value = vol;
      src.connect(f).connect(g).connect(c.destination); src.start(t);
    };
    return {
      get muted() { return muted; },
      toggle() { muted = !muted; store.set('nbe-muted', muted ? '1' : '0'); if (!muted) this.click(); return muted; },
      click() { tone(520, 0.06, 'triangle', 0.07); },
      tick() { tone(1500, 0.025, 'square', 0.02); },
      ping() { tone(880, 0.1, 'sine', 0.09); tone(1320, 0.16, 'sine', 0.07, 0.07); },
      pop() { tone(500, 0.07, 'sine', 0.09, 0, 400); },
      good() { [523, 659, 784].forEach((f, i) => tone(f, 0.2, 'triangle', 0.1, i * 0.07)); },
      bad() { tone(320, 0.3, 'sawtooth', 0.06, 0, -160); },
      power() { tone(200, 0.6, 'sawtooth', 0.08, 0, -160); noise(0.3, 0.12, 0, 300); },
      powerOn() { tone(200, 0.4, 'sawtooth', 0.05, 0, 300); },
      sip() { noise(0.3, 0.1, 0, 1600); },
      bell() { [0, 0.28, 0.56].forEach((w) => { tone(1046, 0.6, 'sine', 0.1, w); tone(1568, 0.45, 'sine', 0.04, w); }); },
      stamp() { noise(0.14, 0.4, 0, 180); tone(90, 0.22, 'sine', 0.25); },
      splash() { noise(0.45, 0.25, 0, 2200); },
      gold() { [880, 1175, 1568].forEach((f, i) => tone(f, 0.12, 'sine', 0.08, i * 0.05)); },
      snore() { tone(110, 0.8, 'sawtooth', 0.04, 0, -40); },
      scribble() { for (let i = 0; i < 8; i++) noise(0.08, 0.08, i * 0.13, 3000); },
      whisper() { noise(0.35, 0.06, 0, 4000); },
    };
  })();

  // ---------- state ----------
  let L = null;     // current level
  let CH = [];      // chapters of current level
  let S = null;     // night state
  let E = null;     // exam state
  let tab = 'study';
  const hall = () => L.setting === 'hall';

  const fresh = () => ({
    t: 0, energy: 78, stress: 32, ch: CH.map(() => 0),
    cups: 0, crashes: [], meals: 0, breaths: 0, prays: 0, skims: 0, pyqs: 0, cleans: 0, games: 0, mirrors: 0, showers: 0,
    pattern: 0, notes: false, packed: false, syllabusChecked: false,
    powerOff: false, powerOnAt: 0, musicUntil: -1, raining: false,
    sugg: null, used: new Set(), loadshed: 0,
    slept: 0, phone: 0, swiped: 0, distracted: 0, passouts: 0,
    bestFocus: 0, candleStudy: false, awakeSunrise: false, late: false, noCalc: false, showerThought: false,
    markers: new Set(), over: false, busy: false, mosquitoWin: false, catPet: false,
  });

  // ---------- DOM ----------
  const screens = {
    title: $('#screen-title'), level: $('#screen-level'), game: $('#screen-game'), exam: $('#screen-exam'), result: $('#screen-result'),
  };
  const showScreen = (k) => { Object.values(screens).forEach((s) => s.classList.remove('active')); screens[k].classList.add('active'); window.scrollTo(0, 0); };

  // ---------- time formatting ----------
  const clockOf = (t) => { const m = (21 * 60 + Math.round(t)) % 1440; return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`; };
  const dur = (m) => `${Math.floor(m / 60)}h ${String(Math.round(m % 60)).padStart(2, '0')}m`;
  const left = (t) => dur(Math.max(0, TOTAL - t));

  // ---------- core numbers ----------
  const avgKnow = () => S.ch.reduce((a, b) => a + b, 0) / S.ch.length;
  function efficiency() {
    let e = 1;
    if (S.energy < 15) e *= 0.45; else if (S.energy < 30) e *= 0.65; else if (S.energy < 50) e *= 0.85;
    if (S.stress > 85) e *= 0.6; else if (S.stress > 65) e *= 0.82; else if (S.stress < 15) e *= 0.9;
    if (S.powerOff) e *= 0.78;
    if (S.musicUntil > S.t) e *= 0.85;
    return e;
  }
  const addEnergy = (v) => { S.energy = clamp(S.energy + v, 0, 100); bump('energy'); };
  const addStress = (v) => { S.stress = clamp(S.stress + v, 0, 100); bump('stress'); };
  const addKnow = (i, v) => { const before = S.ch[i]; S.ch[i] = clamp(S.ch[i] + v, 0, 100); bump('know'); return Math.round(S.ch[i] - before); };
  const weakest = () => S.ch.indexOf(Math.min(...S.ch));

  function bump(stat) {
    const el = $(`.bar[data-stat="${stat}"]`); if (!el) return;
    el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump');
  }

  // ---------- diary & toast ----------
  function log(text, cls = '') {
    const li = document.createElement('li');
    if (cls) li.className = cls;
    li.innerHTML = `<span class="lt">${clockOf(S.t)}</span>${text}`;
    const ol = $('#log'); ol.prepend(li);
    while (ol.children.length > 50) ol.lastChild.remove();
  }
  function logAt(t, text, cls) { const keep = S.t; S.t = t; log(text, cls); S.t = keep; }
  function toast(msg, ms = 2200) {
    const el = $('#toast'); el.textContent = msg; el.classList.add('show');
    clearTimeout(toast._t); toast._t = setTimeout(() => el.classList.remove('show'), ms);
  }

  // ---------- the student (visual) ----------
  const PROPS = { cha: '☕', eat: '🍜', phone: '📱', call: '📱', write: '✏️', pray: '🤲', clean: '🧹' };
  function setStudent(state = 'idle', prop) {
    const st = $('#student');
    st.className = `student st-${state}`;
    $('#s-prop').textContent = prop ?? PROPS[state] ?? '';
    moodFace();
  }
  function moodFace() {
    if (!S) return;
    const st = $('#student');
    st.classList.toggle('tired', S.energy < 30);
    st.classList.toggle('stressed', S.stress > 70);
    st.classList.toggle('m-happy', S.stress < 35);
    st.classList.toggle('m-sad', S.stress > 65);
  }
  function away(text) {
    const sign = $('#away-sign');
    if (text) { sign.textContent = text; sign.classList.add('show'); setStudent('away'); }
    else sign.classList.remove('show');
  }
  let bubbleTimer = 0;
  function think(text, ms = 3200) {
    const b = $('#bubble'); b.textContent = text; b.classList.add('show');
    clearTimeout(bubbleTimer); bubbleTimer = setTimeout(() => b.classList.remove('show'), ms);
  }
  setInterval(() => {
    if (!S || S.busy || S.over || !screens.game.classList.contains('active')) return;
    if (!$('#modal').classList.contains('hidden') || !$('#focus').classList.contains('hidden')) return;
    if (chance(0.55)) think(pick([...D.THOUGHTS.common, ...D.THOUGHTS[L.setting]]));
  }, 8000);

  function activity(ico, text) {
    const a = $('#activity');
    if (!ico) { a.classList.remove('show'); return; }
    $('#activity-ico').textContent = ico; $('#activity-txt').textContent = text;
    $('#activity-fill').style.transition = 'none'; $('#activity-fill').style.width = '0%';
    a.classList.add('show');
  }

  // Do something visually for a while: student pose + caption + clock run.
  async function doing({ state = 'idle', prop, ico, text, awayText }, minutes, opts = {}) {
    if (awayText) away(awayText); else { away(null); setStudent(state, prop); }
    activity(ico, text);
    await advance(minutes, opts);
    activity(null);
    away(null);
    setStudent('idle');
  }

  // ---------- time passing ----------
  const MARKERS = [
    [180, 'Midnight. It is officially exam day.'],
    [360, '3 AM. The hour of regret.'],
    [465, 'Azaan from the mosque. Dawn is coming.'],
    [540, 'Birds are awake. You are… awake-ish.'],
  ];

  async function advance(min, { asleep = false, animate = true } = {}) {
    const from = S.t;
    const to = Math.min(TOTAL, S.t + min);
    for (let t = from; t < to; t += 10) {
      const step = Math.min(10, to - t);
      const f = step / 10;
      const now = t + step;
      if (asleep) {
        S.energy = clamp(S.energy + 2.6 * f, 0, 100);
        S.stress = clamp(S.stress - 1.1 * f, 0, 100);
      } else {
        S.energy = clamp(S.energy - (now > 360 ? 1.6 : 1.15) * f, 0, 100);
        const pressure = 0.35 + (now / TOTAL) * 0.95 - avgKnow() / 100 * 1.1;
        S.stress = clamp(S.stress + pressure * f, 0, 100);
      }
      S.crashes = S.crashes.filter((c) => {
        if (now >= c) { S.energy = clamp(S.energy - 10, 0, 100); if (!asleep) logAt(c, 'Caffeine crash. Eyelids heavy. 🥱', 'bad'); return false; }
        return true;
      });
      if (S.powerOff && now >= S.powerOnAt) {
        S.powerOff = false; logAt(S.powerOnAt, hall() ? 'Hall power is back! The whole floor cheers. ⚡' : 'Current eseche! ⚡ Power is back.', 'good'); Sfx.powerOn();
      }
      if (!asleep) {
        for (const [m, txt] of MARKERS) if (!S.markers.has(m) && now >= m) { S.markers.add(m); logAt(m, txt); }
        if (now >= 510) S.awakeSunrise = true;
      }
    }
    if (asleep) S.slept += (to - from);
    S.t = to;
    if (animate) await animateClock(from, to);
    render();
  }

  async function animateClock(from, to) {
    const el = $('#clock');
    const ms = clamp((to - from) * 14, 500, 2200);
    const start = performance.now();
    const fill = $('#activity-fill');
    requestAnimationFrame(() => { fill.style.transition = `width ${ms}ms linear`; fill.style.width = '100%'; });
    let lastMin = -1;
    return new Promise((res) => {
      const frame = (now) => {
        const k = clamp((now - start) / ms, 0, 1);
        const t = Math.round(lerp(from, to, 1 - Math.pow(1 - k, 2)));
        el.textContent = clockOf(t);
        renderTimeline(t);
        if (t !== lastMin && t % 5 === 0) { Sfx.tick(); lastMin = t; }
        if (k < 1) requestAnimationFrame(frame); else res();
      };
      requestAnimationFrame(frame);
    });
  }

  // ---------- modal ----------
  function modal({ icon = '', title = '', body = '', choices = [{ label: 'Okay', value: true, primary: true }] }) {
    return new Promise((resolve) => {
      $('#modal-icon').textContent = icon;
      $('#modal-title').textContent = title;
      $('#modal-body').innerHTML = body;
      const wrap = $('#modal-choices'); wrap.innerHTML = '';
      choices.forEach((c, i) => {
        const b = document.createElement('button');
        b.className = 'choice' + (c.primary ? ' primary' : '');
        b.innerHTML = `<b>${c.label}</b>${c.sub ? `<small>${c.sub}</small>` : ''}`;
        if (c.disabled) b.disabled = true;
        b.addEventListener('click', () => { Sfx.click(); $('#modal').classList.add('hidden'); resolve(c.value !== undefined ? c.value : i); }, { once: true });
        wrap.appendChild(b);
      });
      $('#modal').classList.remove('hidden');
      setTimeout(() => wrap.querySelector('button:not(:disabled)')?.focus(), 50);
    });
  }

  // ---------- render ----------
  const SKY = [
    [0, '#0a0f2c', '#1b2456'], [300, '#070a1f', '#121a42'], [480, '#0d1235', '#2a2a66'],
    [525, '#28306e', '#a0567c'], [580, '#4f74bd', '#f2a07b'], [650, '#7fb3f0', '#ffd6a0'], [720, '#8cc4ff', '#ffe9bf'],
  ];
  const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const mix = (a, b, k) => { const A = hex(a), B = hex(b); return `rgb(${A.map((v, i) => Math.round(lerp(v, B[i], k))).join(',')})`; };

  function renderSky() {
    const t = S.t;
    let i = 0; while (i < SKY.length - 2 && t > SKY[i + 1][0]) i++;
    const [t0, a0, b0] = SKY[i], [t1, a1, b1] = SKY[i + 1];
    const k = clamp((t - t0) / (t1 - t0), 0, 1);
    $('#sky').style.background = `linear-gradient(${mix(a0, a1, k)}, ${mix(b0, b1, k)})`;
    $('#sky .stars').style.opacity = clamp(1 - (t - 470) / 100, 0, 1);
    const mf = clamp(t / 560, 0, 1);
    const moon = $('#moon');
    moon.style.left = `${lerp(8, 82, mf)}%`;
    moon.style.top = `${55 - Math.sin(Math.PI * mf) * 42}%`;
    moon.style.opacity = clamp(1 - (t - 520) / 60, 0, 1);
    const sun = $('#sun');
    sun.style.top = `${lerp(105, 18, clamp((t - 530) / 190, 0, 1))}%`;
    sun.style.opacity = t > 520 ? 1 : 0;
  }

  function renderTimeline(t) {
    const k = clamp(t / TOTAL, 0, 1);
    $('#tl-fill').style.width = `${k * 100}%`;
    const m = $('#tl-marker');
    m.style.left = `${k * 100}%`;
    m.textContent = t < 450 ? '🌙' : t < 570 ? '🌅' : '☀️';
  }

  function setBar(stat, v, txt) {
    const el = $(`.bar[data-stat="${stat}"]`);
    el.querySelector('.bar-fill').style.width = `${clamp(v, 0, 100)}%`;
    el.querySelector('.bar-val').textContent = txt ?? Math.round(v);
    el.classList.toggle('low', (stat === 'energy' && v < 20) || (stat === 'stress' && v > 80));
  }

  function renderChapters() {
    const ul = $('#chapter-list'); ul.innerHTML = '';
    CH.forEach((c, i) => {
      const li = document.createElement('li'); li.className = 'ch';
      const tag = S.sugg && S.sugg.believed && S.sugg.ch === i ? '<span class="tag">"suggestion" 🔥</span>' : '';
      li.innerHTML = `<span class="ch-ico">${c.ico}</span><span class="ch-name">${c.name}${tag}</span><span class="ch-val">${Math.round(S.ch[i])}%</span>
        <div class="ch-track"><div class="ch-fill" style="width:${S.ch[i]}%"></div></div>`;
      ul.appendChild(li);
    });
  }

  function renderRoom() {
    const room = $('#room');
    room.classList.toggle('blackout', S.powerOff);
    room.classList.toggle('hall', hall());
    $('#rain').classList.toggle('on', S.raining);
    $('#bag').classList.toggle('packed', S.packed);
    const n = Math.min(S.cups, 7), cups = $('#cups');
    if (cups.children.length !== n) {
      cups.innerHTML = '';
      for (let i = 0; i < n; i++) { const c = document.createElement('div'); c.className = 'cup' + (i === n - 1 ? ' fresh' : ''); cups.appendChild(c); }
    }
    const chips = [];
    if (S.powerOff) chips.push(`<span class="chip warn">🕯️ Load shedding till ~${clockOf(S.powerOnAt)}</span>`);
    if (S.crashes.length) chips.push(`<span class="chip">☕ Crash at ${clockOf(Math.min(...S.crashes))}</span>`);
    if (S.musicUntil > S.t) chips.push(`<span class="chip warn">🔊 ${hall() ? 'Roommate noise' : "Neighbour's DJ"}</span>`);
    if (S.raining) chips.push('<span class="chip">🌧️ Raining</span>');
    if (S.sugg && S.sugg.believed) chips.push(`<span class="chip ok">📩 Suggestion: ${CH[S.sugg.ch].name}</span>`);
    if (S.packed) chips.push('<span class="chip ok">🎒 Bag packed</span>');
    $('#room-status').innerHTML = chips.join('');
    moodFace();
  }

  function moodText() {
    const e = efficiency();
    let m;
    if (S.energy < 15) m = 'Zombie mode 🧟';
    else if (S.stress > 85) m = 'Full panic 😱';
    else if (S.energy < 30) m = 'Running on fumes 🥱';
    else if (S.stress > 65) m = 'Anxious 😬';
    else if (S.stress < 15) m = 'Suspiciously chill 😎';
    else if (e >= 0.95) m = 'Locked in 🔥';
    else m = 'Okay-ish 🙂';
    return `${m} · focus ${Math.round(e * 100)}%`;
  }

  const ACTIONS = [
    // study
    { id: 'study', tab: 'study', ico: '📖', name: 'Study a chapter', time: '60m', meta: 'Focus session minigame' },
    { id: 'pyq', tab: 'study', ico: '📝', name: () => (L.uni ? 'Solve previous year questions' : 'Solve board questions'), time: '45m', meta: 'Learn the question pattern' },
    { id: 'youtube', tab: 'study', ico: '▶️', name: 'Tutorial at 2× speed', time: '30m', meta: 'If you stay on track…' },
    { id: 'notes', tab: 'study', ico: '🗒️', name: () => (L.uni ? 'Make a formula sheet' : 'Write short notes'), time: '30m', meta: 'Better morning revision' },
    { id: 'skim', tab: 'study', ico: '📑', name: 'Skim everything', time: '30m', meta: 'A little of every chapter' },
    { id: 'group', tab: 'study', ico: '👥', name: () => (hall() ? 'Group study next door' : 'Call a friend'), time: '20–40m', meta: 'Genius or gossip?' },
    // recharge
    { id: 'cha', tab: 'recharge', ico: '☕', name: 'Make cha', time: '10m', meta: '+Energy, crashes later' },
    { id: 'snack', tab: 'recharge', ico: '🍜', name: () => (hall() ? 'Maggi on the hot plate' : 'Cook noodles'), time: '20m', meta: '+Energy, −Stress' },
    { id: 'nap', tab: 'recharge', ico: '😴', name: 'Power nap', time: '20–90m', meta: 'Recharge (risky)' },
    { id: 'shower', tab: 'recharge', ico: '🚿', name: 'Cold shower', time: '15m', meta: 'Wake up. Shower thoughts?' },
    { id: 'walk', tab: 'recharge', ico: '🌙', name: () => (hall() ? 'Walk around the hall field' : 'Walk on the roof'), time: '15m', meta: 'Fresh air, −Stress' },
    { id: 'breathe', tab: 'recharge', ico: '🧘', name: 'Deep breaths', time: '5m', meta: '−Stress' },
    { id: 'pray', tab: 'recharge', ico: '🤲', name: 'Pray & make dua', time: '10m', meta: 'Peace of mind' },
    // life
    { id: 'phone', tab: 'life', ico: '📱', name: '"Quick" phone check', time: '30m', meta: '−Stress… and chaos' },
    { id: 'game', tab: 'life', ico: '🎮', name: '"Just one" match', time: '30m+', meta: 'Huge −Stress. Huge risk.' },
    { id: 'clean', tab: 'life', ico: '🧹', name: 'Clean desk & make a routine', time: '20m', meta: 'Productive procrastination' },
    { id: 'syllabus', tab: 'life', ico: '📋', name: 'Re-check the syllabus', time: '5m', meta: 'Good news… or not' },
    { id: 'pack', tab: 'life', ico: '🎒', name: () => (L.uni ? 'Pack ID card & calculator' : 'Pack admit card & pens'), time: '10m', meta: () => (S.packed ? 'Already packed ✓' : 'Future you says thanks'), disabled: () => S.packed },
    { id: 'mirror', tab: 'life', ico: '🪞', name: 'Pep talk in the mirror', time: '5m', meta: '"You got this." (?)' },
  ];

  function actionBtn(a) {
    const b = document.createElement('button');
    b.className = `action${a.wide ? ' wide' : ''}${a.cls ? ' ' + a.cls : ''}`;
    b.dataset.id = a.id;
    b.innerHTML = `<span class="a-ico">${a.ico}</span><span class="a-name">${val(a.name)}</span><span class="a-meta">${val(a.meta)}</span><span class="a-time">${a.time}</span>`;
    b.disabled = S.busy || (a.disabled ? a.disabled() : false);
    return b;
  }

  function renderActions() {
    const wrap = $('#actions'); wrap.innerHTML = '';
    ACTIONS.filter((a) => a.tab === tab).forEach((a) => wrap.appendChild(actionBtn(a)));
    $$('.tab').forEach((t) => t.classList.toggle('active', t.dataset.tab === tab));
    const main = $('#actions-main'); main.innerHTML = '';
    if (S.t < SLEEP_ALARM) main.appendChild(actionBtn({ id: 'sleep', ico: '🛏️', name: 'Sleep until 7:30 AM', time: dur(SLEEP_ALARM - S.t), meta: 'Rest up. Wake up for the exam.', wide: true, cls: 'sleep' }));
    if (S.t >= 600) main.appendChild(actionBtn({ id: 'go', ico: '🏃', name: 'Leave for the exam hall', time: 'now', meta: 'Arrive early, calm down', wide: true, cls: 'exam' }));
  }

  function render() {
    if (!S) return;
    $('#clock').textContent = clockOf(S.t);
    $('#clock').classList.toggle('urgent', S.t >= 660);
    $('#countdown').textContent = S.t >= TOTAL ? 'EXAM TIME' : `${L.tag} exam in ${left(S.t)}`;
    setBar('energy', S.energy);
    setBar('stress', S.stress);
    const k = avgKnow(); setBar('know', k, `${Math.round(k)}%`);
    $('#mood').textContent = moodText();
    renderTimeline(S.t);
    renderChapters(); renderRoom(); renderSky(); renderActions();
  }

  // ---------- actions ----------
  const Act = {
    async study() {
      const choice = await modal({
        icon: '📖', title: 'Which chapter?',
        body: `Focus efficiency right now: <b>${Math.round(efficiency() * 100)}%</b>${S.powerOff ? ' (by candlelight)' : ''}`,
        choices: [
          ...CH.map((c, i) => ({ label: `${c.ico} ${c.name}`, sub: `${Math.round(S.ch[i])}% prepared · ${c.bn}${S.sugg && S.sugg.believed && S.sugg.ch === i ? ' · "suggestion" 🔥' : ''}`, value: i })),
          { label: 'Never mind', value: -1 },
        ],
      });
      if (choice < 0) return false;
      setStudent('study');
      const result = await Focus.run(choice);
      const e = efficiency();
      const boost = S.sugg && S.sugg.believed && S.sugg.ch === choice ? 1.15 : 1;
      const raw = (result.progress / 100) * 44 * e * (1 - S.ch[choice] / 150) * boost;
      const gained = addKnow(choice, raw);
      if (S.powerOff) S.candleStudy = true;
      S.bestFocus = Math.max(S.bestFocus, result.progress);
      addEnergy(-9);
      addStress(result.progress >= 80 ? -7 : result.progress < 40 ? 6 : 1);
      S.distracted += result.distracted;
      await doing({ state: 'study', ico: CH[choice].ico, text: `Studying ${CH[choice].name}…` }, 60);
      const cls = gained >= 20 ? 'good' : gained < 8 ? 'bad' : '';
      log(`Studied ${CH[choice].name}: +${gained}%${result.progress >= 95 ? ' — locked in!' : ''}${result.distracted ? ` (got distracted ${result.distracted}×)` : ''}`, cls);
      think(gained >= 20 ? 'Wait… I actually get this?! 🤯' : gained < 8 ? 'I read it. I absorbed nothing.' : 'Okay. Some of it went in.');
      return true;
    },
    async pyq() {
      S.pyqs++;
      const e = efficiency() * Math.max(0.4, 1 - (S.pyqs - 1) * 0.25);
      let total = 0;
      S.ch.forEach((_, i) => { total += addKnow(i, 4 * e * (1 - S.ch[i] / 130)); });
      S.pattern = Math.min(2, S.pattern + 1);
      addEnergy(-6); addStress(S.pyqs === 1 ? 4 : -3);
      await doing({ state: 'write', ico: '📝', text: L.uni ? 'Solving previous year questions…' : 'Solving board questions…' }, 45);
      log(S.pyqs === 1
        ? `Solved past papers. +${total}% total. Same questions keep repeating… 👀`
        : `More past papers. +${total}%. You now recognise the pattern.`, 'good');
      think('Wait, this question came in 2019, 2021 AND 2023?!');
      return true;
    },
    async youtube() {
      const w = weakest();
      const off = chance(0.35);
      const g = addKnow(w, (off ? 5 : 11) * efficiency());
      addEnergy(-3);
      await doing({ state: 'phone', prop: '💻', ico: '▶️', text: off ? 'Watching… something?' : `Tutorial: ${CH[w].name} at 2×` }, off ? 55 : 30);
      log(off
        ? `Opened a ${CH[w].name} tutorial. Ended up watching "${pick(['how cement is made', 'top 10 cricket fights', 'cat vs cucumber compilation', 'a man restoring a rusty knife', 'mukbang: 50 fuchkas'])}". +${g}%.`
        : `Watched a ${CH[w].name} tutorial at 2× speed. A random YouTube bhaiya saved you. +${g}%`, off ? 'bad' : 'good');
      return true;
    },
    async notes() {
      let total = 0;
      S.ch.forEach((_, i) => { total += addKnow(i, 2.5 * efficiency()); });
      S.notes = true; addStress(-5); addEnergy(-4);
      await doing({ state: 'write', ico: '🗒️', text: L.uni ? 'Writing the formula sheet…' : 'Writing short notes…' }, 30);
      log(`Wrote ${L.uni ? 'a formula sheet' : 'short notes'} in 4 colours of pen. +${total}%. Morning revision will be faster.`, 'good');
      return true;
    },
    async skim() {
      S.skims++;
      const e = efficiency() * Math.max(0.35, 1 - (S.skims - 1) * 0.2);
      let total = 0;
      S.ch.forEach((_, i) => { total += addKnow(i, 5.5 * e * (1 - S.ch[i] / 120)); });
      addEnergy(-4);
      await doing({ state: 'study', ico: '📑', text: 'Skimming everything…' }, 30);
      log(`Skimmed every chapter. +${total}% total. The highlighter is dry.`);
      return true;
    },
    async group() {
      const name = pick(D.FRIENDS);
      const r = Math.random();
      const vis = hall() ? { awayText: `👥 At ${name}'s room`, ico: '👥', text: `Group study with ${name}…` } : { state: 'call', ico: '📞', text: `On a call with ${name}…` };
      if (r < 0.4) {
        const w = weakest(); const g = addKnow(w, 12 * efficiency());
        await doing(vis, 20);
        log(`${name} explained ${CH[w].name} like a genius. +${g}%. Treat them to fuchka after.`, 'good');
      } else if (r < 0.7) {
        addStress(11);
        await doing(vis, 20);
        log(`${name}: "Dosto ami KICHU pori nai 😭". Now you're both panicking.`, 'bad');
      } else {
        addStress(-16); addEnergy(-4);
        await doing({ ...vis, text: 'Gossiping…' }, 40);
        log(`"Group study" with ${name}. Gossiped for 40 minutes. Very healing. Zero studying.`);
      }
      return true;
    },
    async cha() {
      S.cups++; Sfx.sip();
      addEnergy(S.cups <= 3 ? 20 : S.cups <= 5 ? 11 : 4);
      addStress(S.cups > 5 ? 9 : 3);
      S.crashes.push(S.t + 150);
      await doing({ state: 'cha', ico: '☕', text: hall() ? 'Making cha with the immersion rod…' : 'Making cha…' }, 10);
      const lines = ['Cha number one. The ritual begins. ☕', 'Second cup. Ada beshi, chini kom.', "Third cup. Now we're talking.", 'Fourth cup. Is this cha or just hope?', 'Fifth cup. Your heart is doing drum solos.', `Cup #${S.cups}. Hands shaking. Vision… colourful.`];
      log(lines[Math.min(S.cups, 6) - 1], S.cups > 5 ? 'bad' : '');
      return true;
    },
    async snack() {
      S.meals++;
      const g = S.meals <= 2 ? 1 : 0.5;
      addEnergy(14 * g); addStress(-9 * g);
      await doing({ state: 'eat', ico: '🍜', text: hall() ? 'Maggi on the forbidden hot plate…' : 'Cooking noodles…' }, 20);
      log(hall()
        ? pick(['Maggi on the hot plate. If the provost asks, this never happened.', 'Shared Maggi with the whole floor. Got two spoons back.', 'Dry biscuits + chanachur. The engineering diet.'])
        : pick(['Instant noodles + egg. Chef’s kiss.', 'Ate straight from the pot. No regrets.', 'Found leftover biryani in the fridge. Jackpot. 🍛']), 'good');
      return true;
    },
    async nap() {
      const c = await modal({
        icon: '😴', title: 'Power nap',
        body: 'Set an alarm and lie down "just for a bit".',
        choices: [
          { label: '20-minute nap', sub: '+15 energy, safe', value: 20, primary: true },
          { label: '90-minute sleep cycle', sub: '+35 energy, −stress, but… the snooze button', value: 90 },
          { label: 'Actually, no', value: 0 },
        ],
      });
      if (!c) return false;
      Sfx.snore();
      if (c === 20) {
        await doing({ state: 'sleep', ico: '😴', text: 'Power nap…' }, 20, { asleep: true });
        addEnergy(10);
        log('20-minute power nap. Fresh-ish. 😌', 'good');
      } else {
        const over = chance(0.28);
        await doing({ state: 'sleep', ico: '💤', text: over ? 'Snooze… snooze… snooze…' : 'Sleeping one cycle…' }, over ? 140 : 90, { asleep: true });
        addEnergy(12); addStress(over ? 10 : -6);
        log(over ? 'Hit snooze. Twice. Woke up 50 minutes late. 😱' : 'Full sleep cycle. Brain rebooted.', over ? 'bad' : 'good');
        if (over) { $('#room').classList.add('shake'); think('WHAT TIME IS IT?!'); }
      }
      return true;
    },
    async shower() {
      S.showers++;
      const g = S.showers === 1 ? 1 : 0.5;
      addEnergy(11 * g); addStress(-8 * g);
      let thought = '';
      if (chance(0.3)) { const i = ri(0, CH.length - 1); const k = addKnow(i, 6); S.showerThought = true; thought = ` Shower thought: suddenly understood ${CH[i].name}! +${k}% 🧠`; }
      await doing({ awayText: hall() ? '🚿 In the common bathroom' : '🚿 In the shower', ico: '🚿', text: 'Cold shower…' }, 15);
      log(`Cold shower at ${clockOf(S.t)}. Screamed a little. Awake now.${thought}`, 'good');
      return true;
    },
    async walk() {
      addStress(-11); addEnergy(4);
      const meet = chance(0.3);
      await doing({ awayText: hall() ? '🌙 Walking around the field' : '🌙 On the roof', ico: '🌙', text: hall() ? 'Walking around the hall field…' : 'Walking on the roof…' }, 15);
      log(meet
        ? (hall() ? 'Met three other students also "taking a break". Nobody is studying. Comforting.' : 'Met the neighbour uncle on the roof. He asked about your GPA. Ran back down.')
        : 'Fresh air. City lights. Briefly felt like the main character.', meet && !hall() ? 'bad' : 'good');
      if (meet && !hall()) addStress(8);
      return true;
    },
    async breathe() {
      S.breaths++;
      const v = [13, 10, 7, 5, 4, 3][Math.min(S.breaths - 1, 5)];
      addStress(-v);
      await doing({ state: 'breathe', ico: '🧘', text: 'In… hold… out…' }, 5);
      log(`Breathed in 4, held 7, out 8. −${v} stress.`, 'good');
      return true;
    },
    async pray() {
      S.prays++;
      const v = [15, 11, 8, 6, 4][Math.min(S.prays - 1, 4)];
      addStress(-v);
      await doing({ state: 'pray', ico: '🤲', text: 'Praying…' }, 10);
      log(pick(['Prayed for an easy paper. And for the examiner to be in a good mood.', 'Made dua. Felt lighter. 🤲', 'Promised to start studying from day one next time. (Sure.)']), 'good');
      return true;
    },
    async phone() {
      S.phone++;
      if (S.powerOff) {
        addStress(-4);
        await doing({ state: 'phone', ico: '🦖', text: 'No internet…' }, 30);
        log('No WiFi, data finished. Played the offline dinosaur game for 30 minutes. 🦖');
        return true;
      }
      const r = Math.random();
      if (!S.sugg && r < 0.32) {
        await doing({ state: 'phone', ico: '📱', text: 'Checking the group chat…' }, 30);
        await Events.suggestion.run();
      } else if (r < 0.52) {
        addStress(14);
        await doing({ state: 'phone', ico: '📱', text: 'Scrolling…' }, 30);
        log(L.uni ? 'The batch topper posted: "Done with 3 revisions, going to sleep 😌". Pain.' : 'The class topper posted: "Revised everything 3 times 😌". Pain.', 'bad');
      } else if (r < 0.68) {
        const w = weakest(); const g = addKnow(w, 9 * efficiency());
        await doing({ state: 'phone', ico: '📱', text: 'Found something useful?!' }, 30);
        log(`Found a short explainer on ${CH[w].name}. +${g}%! The phone was useful for once.`, 'good');
      } else {
        addStress(-12); addEnergy(-3);
        const extra = chance(0.45) ? 20 : 0;
        await doing({ state: 'phone', ico: '📱', text: 'Reels…' }, 30 + extra);
        log(extra ? 'Reels. 30 minutes became 50. Where did it go?!' : 'Doomscrolled reels. Weirdly calming.', extra ? 'bad' : '');
      }
      return true;
    },
    async game() {
      S.games++;
      const r = Math.random();
      const mins = r < 0.4 ? 30 : r < 0.8 ? 60 : 100;
      addStress(-22); addEnergy(-6);
      await doing({ state: 'phone', prop: '🎮', ico: '🎮', text: mins === 30 ? 'Just one match…' : 'Okay, ONE more…' }, mins);
      log(mins === 30 ? 'Played exactly one match. Won. Discipline. 🏆' : mins === 60 ? 'One match became two. Lost both. Rage.' : `"One match" lasted ${mins} minutes. Ranked up, academically down. 💀`, mins === 30 ? 'good' : 'bad');
      if (mins > 30) addStress(6);
      return true;
    },
    async clean() {
      S.cleans++;
      addStress(S.cleans === 1 ? -7 : -2);
      await doing({ state: 'clean', ico: '🧹', text: S.cleans === 1 ? 'Cleaning the desk…' : 'Cleaning it… again…' }, 20);
      log(S.cleans === 1
        ? 'Cleaned the desk and made a perfect hour-by-hour routine. Already 20 minutes behind it.'
        : 'Cleaned the desk AGAIN. It was already clean. Productive procrastination: expert level.', S.cleans === 1 ? '' : 'bad');
      return true;
    },
    async syllabus() {
      const good = !S.syllabusChecked ? chance(0.5) : chance(0.3);
      S.syllabusChecked = true;
      addStress(good ? -12 : 12);
      await doing({ state: 'study', ico: '📋', text: 'Reading the syllabus…' }, 5);
      log(good ? 'Re-checked the syllabus. One topic is NOT included! Bless. 🙏' : 'Re-checked the syllabus. It has a page 2. Nobody told you about page 2.', good ? 'good' : 'bad');
      return true;
    },
    async pack() {
      S.packed = true;
      await doing({ state: 'clean', prop: '🎒', ico: '🎒', text: 'Packing the exam bag…' }, 10);
      log(L.uni ? 'Packed: ID card, calculator (battery checked!), 3 pens, 1 scale.' : 'Packed: admit card, registration card, 3 pens, pencil, eraser, scale.', 'good');
      return true;
    },
    async mirror() {
      S.mirrors++;
      const ok = S.mirrors === 1 || chance(0.4);
      addStress(ok ? -8 : 4);
      await doing({ awayText: '🪞 At the mirror', ico: '🪞', text: 'Pep talk…' }, 5);
      log(ok ? '"You are a SCHOLAR. You are a GENIUS." The mirror nodded back. −8 stress.' : `${hall() ? 'Your roommate' : 'Ammu'} walked in mid-speech. Just stared. Left. +4 stress.`, ok ? 'good' : 'bad');
      return true;
    },
    async sleep() {
      const hrs = ((SLEEP_ALARM - S.t) / 60).toFixed(1);
      const ok = await modal({
        icon: '🛏️', title: 'Go to sleep?',
        body: `You'll get about <b>${hrs} hours</b> of sleep. Alarm at 7:30 AM.<br/>No more studying after this. A rested brain gets more time per question.${S.packed ? '' : '<br/><br/>⚠️ Your exam bag is <b>not packed</b>.'}`,
        choices: [{ label: 'Lights off. Alarm set.', value: true, primary: true }, { label: 'Not yet', value: false }],
      });
      if (!ok) return false;
      S.busy = true; render();
      const overslept = S.energy < 20 && chance(0.3);
      Sfx.snore();
      log(`Went to bed. Prepared: ${Math.round(avgKnow())}%. Good night.`);
      await doing({ state: 'sleep', ico: '🌙', text: 'Sleeping…' }, SLEEP_ALARM - S.t, { asleep: true });
      if (overslept) {
        await doing({ state: 'sleep', ico: '⏰', text: 'Alarm ringing… ringing…' }, 55, { asleep: true });
        S.late = true;
        log("ALARM DIDN'T WAKE YOU. It's 8:25!!! 😱", 'bad');
        await modal({ icon: '⏰', title: 'You overslept!', body: `It's 8:25. No breakfast. No revision. You run out with one shoe half on.<span class="quote">"${hall() ? 'Mama, engineering building, joldi!' : 'Rickshaw mama, joldi!'}"</span>You'll arrive late, so you get less time per question.`, choices: [{ label: 'RUN', primary: true }] });
        await bagCheck();
      } else {
        await bagCheck();
        await morning();
      }
      await toExam();
      return 'exam';
    },
    async go() {
      await bagCheck();
      await morning(true);
      await toExam();
      return 'exam';
    },
  };

  async function bagCheck() {
    if (S.packed) return;
    const c = await modal({
      icon: '😱', title: L.uni ? 'Where is my ID card?!' : 'Where is my admit card?!',
      body: L.uni ? 'You never packed. ID card? Calculator? Somewhere under three days of laundry.' : 'You never packed your bag. The admit card is… somewhere. Maybe inside a book?',
      choices: [
        { label: 'Turn the room upside down', sub: 'Find it, but arrive late', value: 'search', primary: true },
        { label: 'Leave without it and beg the invigilator', sub: L.uni ? 'No calculator either. +stress' : 'Lots of stress', value: 'beg' },
      ],
    });
    if (c === 'search') { S.late = true; addStress(10); log(`Found ${L.uni ? 'the ID card inside a sock' : 'the admit card inside the Bangla book'}. Now you're late.`, 'bad'); }
    else { addStress(22); if (L.uni) S.noCalc = true; log('Left without it. The invigilator gave you the Look™ but let you in.', 'bad'); }
  }

  async function morning(early = false) {
    if (S.late) return;
    const w = weakest();
    const rev = S.notes ? 14 : 7;
    const c = await modal({
      icon: '🌅', title: early ? 'Leaving early' : 'Good morning!',
      body: early
        ? `You pack ${L.uni ? 'your ID card, a calculator' : 'your admit card, two pens'} and the confidence of someone who studied.`
        : hall()
          ? 'The hall canteen has paratha and dal. Your roommate is still asleep. Lucky.<span class="quote">"Calculator nisos?"</span>'
          : 'Ammu made paratha and dim bhaji. The exam is at 9.<span class="quote">"Admit card nisos?"</span>',
      choices: [
        { label: `Revise ${CH[w].name} on the way`, sub: `+${rev}% to your weakest chapter${S.notes ? ' (your notes help!)' : ''}`, value: 'rev', primary: true },
        { label: 'Eat properly, breathe, stay calm', sub: '+energy, −stress', value: 'calm' },
      ],
    });
    if (c === 'rev') { const g = addKnow(w, rev); log(`Last-minute revision on the rickshaw: +${g}% ${CH[w].name}.`); }
    else { addEnergy(12); addStress(-14); log('Ate breakfast. Breathed. Ready-ish.', 'good'); }
  }

  // ---------- events ----------
  const Events = {
    loadshed: {
      w: 3, cond: () => !S.powerOff && S.loadshed < 2 && S.t < 600,
      async run() {
        S.loadshed++; S.powerOff = true; S.powerOnAt = S.t + ri(60, 110);
        Sfx.power(); render(); think('NOOOO not now!!');
        const c = await modal({
          icon: '🕯️', title: 'LOAD SHEDDING!',
          body: hall()
            ? `The whole hall goes dark. Someone on the 3rd floor screams. The generator only runs the corridor lights.<br/>Power returns around <b>${clockOf(S.powerOnAt)}</b> (allegedly).`
            : `The fan dies. The lamp dies. The whole para goes dark.<br/>Power returns around <b>${clockOf(S.powerOnAt)}</b> (allegedly).`,
          choices: [
            { label: 'Light a candle and keep going', sub: 'Studying is harder by candlelight', value: 'candle', primary: true },
            { label: 'Lie down until it comes back', sub: 'Rest in the dark (+energy, time passes)', value: 'rest' },
          ],
        });
        log('Load shedding. Of course. Tonight of all nights.', 'bad');
        if (c === 'rest') { await doing({ state: 'sleep', ico: '🌑', text: 'Resting in the dark…' }, S.powerOnAt - S.t, { asleep: true }); log('Rested in the dark until the fan spun back.'); }
      },
    },
    ammu: {
      only: 'home', w: 4, cond: () => S.t >= 40 && S.t <= 200,
      async run() {
        const c = await modal({
          icon: '👩', title: 'Ammu is calling',
          body: '<span class="quote">"Khaite ay! Bhaat thanda hoye jacche!"</span>',
          choices: [
            { label: 'Go eat dinner', sub: '20 min · +energy, −stress', value: 'eat', primary: true },
            { label: '"Ektu pore, Ammu!"', sub: 'Keep working… she will remember this', value: 'later' },
          ],
        });
        if (c === 'eat') { addEnergy(16); addStress(-10); await doing({ awayText: '🍛 At the dinner table', ico: '🍛', text: 'Dinner with family…' }, 20); log('Dinner with family. Ammu gave you the extra piece of fish. 🐟', 'good'); }
        else { addStress(6); addEnergy(-4); log('Skipped dinner. Your stomach is filing a complaint.', 'bad'); }
      },
    },
    ammuCall: {
      only: 'hall', w: 3, cond: () => S.t >= 30 && S.t <= 240,
      async run() {
        const c = await modal({
          icon: '📞', title: 'Ammu is calling',
          body: '<span class="quote">"Kheyecho baba? Porashona kemon cholche? Beshi raat jego na."</span>',
          choices: [
            { label: 'Talk for a bit', sub: '15 min · big −stress', value: 'talk', primary: true },
            { label: '"Ammu, exam, pore call dei!"', sub: 'Quick hang up. Guilt +', value: 'quick' },
          ],
        });
        if (c === 'talk') { addStress(-18); await doing({ state: 'call', ico: '📞', text: 'Talking to Ammu…' }, 15); log('Talked to Ammu. Lied that you ate properly. Felt better anyway. 💛', 'good'); }
        else { addStress(5); log('Hung up quickly. Ammu said "accha". That "accha" will haunt you.', 'bad'); }
      },
    },
    abbu: {
      only: 'home', w: 2, cond: () => S.t >= 60 && S.t <= 300,
      async run() {
        const c = await modal({
          icon: '👨', title: 'Abbu walks in',
          body: '<span class="quote">"Ki, porchis? Naki mobile?"</span>He looks at the desk. He looks at you.',
          choices: [
            { label: 'Hold the book up high', sub: 'Acting skills: 100', value: 'act', primary: true },
            { label: 'Be honest: "Kichu pari na, Abbu"', sub: 'Risky. Could go either way.', value: 'honest' },
          ],
        });
        if (c === 'act') { addStress(4); log('Held the book upside down. Abbu said "hmm" and left. Close call.'); }
        else if (chance(0.6)) { addStress(-15); log('Abbu: "Ja pari likhbi. Result jai hok." Unexpected emotional damage (the good kind).', 'good'); }
        else { addStress(12); await advance(15); log('Abbu gave a 15-minute lecture about his own exam days. "Amra hariken e portam!"', 'bad'); }
      },
    },
    relative: {
      only: 'home', w: 1, cond: () => S.t < 300,
      async run() {
        await modal({ icon: '☎️', title: 'A relative calls', body: `<span class="quote">"${L.id === 'ssc' ? 'Golden A+ pabe to? Amar meye to paise.' : 'Medical e chance pabe to? Amar chele BUET e.'}"</span>`, choices: [{ label: '"Dua koiren, Khala." (dies inside)', primary: true }] });
        addStress(10); log('Khala called to compare you with her kids. Classic.', 'bad');
      },
    },
    roommate: {
      only: 'hall', w: 3, cond: () => S.t < 480 && S.musicUntil < S.t,
      async run() {
        const c = await modal({
          icon: '🎧', title: 'Roommate chaos',
          body: '<span class="quote">"PUSH! PUSH! Bhai revive kor!!"</span>Your roommate is gaming with a headset and yelling at full volume.',
          choices: [
            { label: 'Ask nicely to keep it down', sub: '50/50', value: 'ask', primary: true },
            { label: 'Join for one match', sub: '30 min · −stress, −time', value: 'join' },
          ],
        });
        if (c === 'join') { S.games++; addStress(-20); addEnergy(-6); await doing({ state: 'phone', prop: '🎮', ico: '🎮', text: 'Gaming with the roommate…' }, 30); log('Joined the match. Got MVP. Lost the semester (maybe). 🎮'); }
        else if (chance(0.5)) { addStress(-3); log('Roommate: "Sorry bhai!" and switched to whispering "push…". Respect.', 'good'); }
        else { S.musicUntil = S.t + 120; addStress(7); log('Roommate nodded and got LOUDER. Focus −15% for 2 hours.', 'bad'); }
      },
    },
    tong: {
      only: 'hall', w: 2, cond: () => S.t < 420,
      async run() {
        const c = await modal({
          icon: '🫖', title: 'Tong invitation',
          body: 'Friends knock: <span class="quote">"Tong e cholo, ek cup cha kheye ashi. 10 minute!"</span>It is never 10 minutes.',
          choices: [
            { label: 'Go to the tong', sub: '30–50 min · cha + adda', value: 'go', primary: true },
            { label: '"Exam, bhai. Pore."', value: 'no' },
          ],
        });
        if (c === 'go') { const m = chance(0.5) ? 50 : 30; S.cups++; S.crashes.push(S.t + 150); addEnergy(14); addStress(-20); await doing({ awayText: '🫖 At the tong', ico: '🫖', text: 'Cha and adda at the tong…' }, m); log(`Tong er cha + adda for ${m} minutes. Discussed cricket, life and everything except the exam.`, 'good'); }
        else { addStress(3); log('Said no to the tong. They sent a photo of the cha. Cruel.'); }
      },
    },
    cr: {
      only: 'hall', w: 2, cond: () => S.t > 60 && S.t < 600,
      async run() {
        const c = await modal({
          icon: '📢', title: 'CR in the batch group',
          body: '<span class="quote">"EXAM POSTPONED!!! 🎉🎉"</span>47 people reacted 😍 in 30 seconds.',
          choices: [
            { label: 'CELEBRATE! 🎉', sub: 'Trust the CR', value: 'yay', primary: true },
            { label: 'Wait for confirmation', sub: 'Suspicious…', value: 'wait' },
          ],
        });
        if (c === 'yay') { addStress(14); log('Celebrated for 2 minutes. CR: "sorry wrong group 🙏". Pain multiplied.', 'bad'); }
        else { log('2 minutes later, CR: "sorry, wrong group 🙏". You knew it. Smug. 😏', 'good'); addStress(-3); }
      },
    },
    music: {
      only: 'home', w: 2, cond: () => S.t < 420 && S.musicUntil < S.t,
      async run() {
        const c = await modal({
          icon: '🔊', title: 'Gaye holud next door',
          body: 'The neighbours are having a holud night. A speaker the size of a fridge is blasting remixes at full volume.',
          choices: [
            { label: 'Earphones in, suffer quietly', sub: 'Focus −15% for 2 hours', value: 'endure', primary: true },
            { label: 'Go join the dance for a bit', sub: '30 min · −stress, −energy', value: 'dance' },
          ],
        });
        if (c === 'dance') { addStress(-22); addEnergy(-10); await doing({ awayText: '💃 Dancing at the holud', ico: '💃', text: 'Dancing at the holud…' }, 30); log('Danced at the holud. 30 minutes of pure joy. 💃', 'good'); S.musicUntil = S.t + 60; }
        else { S.musicUntil = S.t + 120; addStress(5); log('The DJ is playing the same song for the 9th time.', 'bad'); }
      },
    },
    suggestion: {
      w: 2, cond: () => !S.sugg && S.t < 600,
      async run() {
        const ch = ri(0, CH.length - 1);
        S.sugg = { ch, real: chance(0.5), believed: false };
        Sfx.ping();
        const c = await modal({
          icon: '📩', title: L.uni ? '"IMPORTANT TOPICS" LEAKED?!' : 'SUGGESTION LEAKED?!',
          body: L.uni
            ? `A senior forwards a voice message:<span class="quote">"Sir always gives <u>${CH[ch].name}</u> in the final. 100%. Trust me bro."</span>The same senior got a C in this course.`
            : `The class group chat is exploding:<span class="quote">"BRO 100% CONFIRMED — questions will come from <u>${CH[ch].name}</u> 🔥🔥"</span>Source: "someone's cousin's coaching sir".`,
          choices: [
            { label: 'Believe it!', sub: `Studying ${CH[ch].name} feels extra motivating`, value: true, primary: true },
            { label: 'Fake news. Ignore.', value: false },
          ],
        });
        S.sugg.believed = c;
        log(c ? `Got a "suggestion": ${CH[ch].name}. Believing it. 🙏` : 'Ignored the "suggestion". Big brain or big mistake?');
      },
    },
    mosquito: {
      w: 2, cond: () => true,
      async run() {
        const c = await modal({
          icon: '🦟', title: 'Mosquito squad attack',
          body: S.powerOff ? 'No fan = open buffet. They brought friends.' : 'A high-pitched whine near your ear. Then another. Then a whole air force.',
          choices: [
            { label: 'Light a coil', sub: '5 min · they retreat', value: 'coil', primary: true },
            { label: 'Fight them by hand', sub: 'Risky. Honourable.', value: 'fight' },
          ],
        });
        if (c === 'coil') { await advance(5); log('Lit a mosquito coil. The room smells like victory and smoke.'); }
        else if (chance(0.5)) { S.mosquitoWin = true; addStress(-6); log('Clapped one mid-air! 🦟💥 Legendary.', 'good'); }
        else { addStress(9); await advance(10); log('Lost the war. 7 bites. Itching intensifies.', 'bad'); }
      },
    },
    rain: {
      w: 1, cond: () => !S.raining && S.t < 560,
      async run() {
        S.raining = true; render();
        const c = await modal({
          icon: '🌧️', title: 'It starts to rain',
          body: 'Tin roofs drumming. Cool breeze. Smell of wet soil. <i>Perfect</i> sleeping weather.',
          choices: [
            { label: 'Fight the sleepiness', sub: '−energy', value: 'fight', primary: true },
            { label: 'Make cha to celebrate', sub: 'Brishti + cha = tradition', value: 'cha' },
          ],
        });
        if (c === 'cha') { await Act.cha(); log('Rain + cha. Poetic. The exam can wait 5 minutes.'); }
        else { addEnergy(-8); log('Rain is making everything so… cozy… must… stay… awake.'); }
      },
    },
    cat: {
      w: 1, cond: () => true,
      async run() {
        const c = await modal({
          icon: '🐈', title: 'A cat appears',
          body: hall() ? 'One of the hall cats walks in like it pays rent and sits exactly on your notes.' : "The neighbour's cat jumps through the window and sits exactly on the page you were reading.",
          choices: [
            { label: 'Pet the cat', sub: '10 min · big −stress', value: 'pet', primary: true },
            { label: '"Shoo!"', value: 'shoo' },
          ],
        });
        if (c === 'pet') { S.catPet = true; addStress(-18); await advance(10); log('Petted the cat. It purred. Everything is okay for a moment. 🐾', 'good'); }
        else { log('Shooed the cat. It knocked your pen off the desk on the way out.'); }
      },
    },
    senior: {
      w: 1, cond: () => avgKnow() < 85,
      async run() {
        const w = weakest(); const g = addKnow(w, 8);
        Sfx.good();
        await modal({
          icon: '📄', title: hall() ? 'Senior bhai to the rescue' : 'Coaching bhaiya to the rescue',
          body: hall()
            ? `A senior shares a Drive folder: "<b>${CH[w].name}</b> — solved + slides". Organised. Labelled. An angel in a hoodie.<br/><br/>+${g}% ${CH[w].name}`
            : `Your coaching bhaiya sends handwritten notes for <b>${CH[w].name}</b>. Neat diagrams. Highlighted formulas. Angel.<br/><br/>+${g}% ${CH[w].name}`,
        });
        log(`${hall() ? "Senior's Drive folder" : "Bhaiya's notes"} for ${CH[w].name}: +${g}%. Legend.`, 'good');
      },
    },
    spiral: {
      w: 1, cond: () => S.t > 240,
      async run() {
        const c = await modal({
          icon: '🌀', title: '3 AM thoughts',
          body: L.uni ? 'Why engineering? Why not BBA? Why not a tea stall? Will any of this matter in 10 years?' : 'Why science? Why exams? What even is a "newton"? Will any of this matter in 10 years?',
          choices: [
            { label: 'Snap out of it', sub: '+a bit of stress', value: 'snap', primary: true },
            { label: 'Spiral deeper', sub: '20 min · existential crisis', value: 'spiral' },
          ],
        });
        if (c === 'snap') { addStress(4); log('Slapped own face (gently). Back to work.'); }
        else { addStress(10); addEnergy(-5); await doing({ state: 'idle', ico: '🌀', text: 'Contemplating the universe…' }, 20); log('Spent 20 minutes contemplating the universe. The universe did not reply.', 'bad'); }
      },
    },
  };

  async function randomEvent() {
    const pool = Object.entries(Events).filter(([id, e]) => (!e.only || e.only === L.setting) && (id === 'loadshed' || !S.used.has(id)) && e.cond());
    if (!pool.length) return;
    let chosen = pool.find(([id]) => (id === 'ammu' && S.t >= 60) || (id === 'ammuCall' && S.t >= 90));
    if (!chosen) {
      const total = pool.reduce((a, [, e]) => a + e.w, 0);
      let r = Math.random() * total;
      for (const p of pool) { r -= p[1].w; if (r <= 0) { chosen = p; break; } }
      chosen = chosen || pool[0];
    }
    S.used.add(chosen[0]);
    await chosen[1].run();
  }

  async function passOut() {
    S.passouts++;
    Sfx.snore();
    const lost = ri(90, 140);
    setStudent('sleep');
    await modal({
      icon: '💤', title: 'You blinked…',
      body: `…for one second. You wake up with your face on the book and ink on your cheek.<br/><b>${Math.floor(lost / 60)}h ${lost % 60}m</b> have vanished.`,
      choices: [{ label: 'NOOOO', primary: true }],
    });
    await doing({ state: 'sleep', ico: '💤', text: 'Passed out on the desk…' }, lost, { asleep: true });
    addEnergy(8);
    log(`Passed out on the desk. Lost ${lost} minutes. 💀`, 'bad');
  }

  async function panic() {
    $('#room').classList.add('shake');
    setStudent('panic');
    const c = await modal({
      icon: '😱', title: 'PANIC ATTACK',
      body: 'Heart racing. Nothing makes sense. You re-read the same line 14 times.',
      choices: [
        { label: 'Breathe 4-7-8', sub: '10 min · −25 stress', value: 'b', primary: true },
        { label: hall() ? 'Call Ammu' : 'Go talk to Ammu', sub: '20 min · −40 stress', value: 'a' },
      ],
    });
    if (c === 'b') { addStress(-25); await doing({ state: 'breathe', ico: '🧘', text: 'Breathing through it…' }, 10); log('Panic attack. Breathed through it.', 'bad'); }
    else { addStress(-40); await doing({ state: 'call', ico: '💛', text: 'Talking to Ammu…' }, 20); log('Ammu: "Ja pari likhbi. Allah bhorsha." Feeling better.', 'good'); }
  }

  async function doAction(id) {
    if (S.busy || S.over || !Act[id]) return;
    Sfx.click();
    S.busy = true; render();
    try {
      const done = await Act[id]();
      if (done === 'exam' || S.over) return;
      if (done) await afterAction();
    } finally {
      if (!S.over) { S.busy = false; setStudent('idle'); render(); }
    }
  }

  async function afterAction() {
    const checks = [
      async () => { if (S.energy <= 0) await passOut(); },
      async () => { if (S.stress >= 100) await panic(); },
      async () => { if (S.t < 690 && chance(0.42)) await randomEvent(); },
      async () => { if (S.energy <= 0) await passOut(); },
    ];
    for (const c of checks) {
      if (S.t >= TOTAL) return timeUp();
      await c();
    }
    if (S.t >= TOTAL) return timeUp();
    $('#room').classList.remove('shake');
  }

  async function timeUp() {
    Sfx.bell();
    setStudent('panic');
    await modal({ icon: '⏰', title: "IT'S 9:00 AM!", body: `No time for anything. Grab ${L.uni ? 'the ID card' : 'the admit card'} and RUN.<span class="quote">"Pen! Where is my pen?!"</span>`, choices: [{ label: 'Run to the exam hall', primary: true }] });
    if (!S.packed) await bagCheck();
    S.late = true;
    await toExam();
  }

  // ---------- focus minigame ----------
  const norm = (s) => s.toLowerCase().replace(/[.,:;'"()]/g, '');
  const Focus = {
    run(chIdx) {
      return new Promise((resolve) => {
        const ch = CH[chIdx];
        const el = $('#focus'), page = $('#focus-page'), textEl = $('#focus-text'), layer = $('#focus-layer'), drowsy = $('#drowsy');
        const DURATION = 15;
        let progress = 0, reading = false, timeLeft = DURATION, last = performance.now(), raf = 0;
        let nextNotif = 1.2, nextGold = 2.5, drowse = 0, drowsing = false, distracted = 0, ended = false;
        const notifs = [];
        const pool = [...D.NOTIFS.common, ...D.NOTIFS[L.setting]];

        const words = ch.text.split(/\s+/);
        textEl.innerHTML = `<h4>${ch.ico} ${ch.name}</h4>` + words.map((w) => `<span class="w">${esc(w)}</span>`).join(' ');
        const spans = $$('.w', textEl);
        const golds = ch.gold.map(norm);
        const goldIdx = spans.map((s, i) => (golds.includes(norm(s.textContent)) ? i : -1)).filter((i) => i >= 0);
        $('#focus-chapter').textContent = `${L.tag} · ${ch.name} · ${ch.bn}`;
        $('#focus-instr').style.opacity = 1;
        page.classList.remove('blurred');
        page.style.filter = S.powerOff ? 'brightness(.72) sepia(.4)' : '';
        el.classList.remove('hidden');
        document.body.style.overflow = 'hidden';

        const setReading = (v) => { reading = v && !drowsing; page.classList.toggle('reading', reading); if (reading) $('#focus-instr').style.opacity = 0; };
        const onDown = (e) => {
          if (e.target.classList.contains('gold-word')) { collectGold(e.target, e); return; }
          e.preventDefault(); setReading(true);
        };
        const onUp = () => setReading(false);
        const onKey = (e) => { if (e.code === 'Space') { e.preventDefault(); setReading(e.type === 'keydown'); } };
        page.addEventListener('pointerdown', onDown);
        window.addEventListener('pointerup', onUp);
        window.addEventListener('pointercancel', onUp);
        window.addEventListener('keydown', onKey);
        window.addEventListener('keyup', onKey);

        const floatTxt = (x, y, txt, color) => {
          const f = document.createElement('div'); f.className = 'float-txt'; f.textContent = txt; f.style.left = x + 'px'; f.style.top = y + 'px'; f.style.color = color;
          document.body.appendChild(f); setTimeout(() => f.remove(), 1000);
        };
        function collectGold(span, e) {
          span.classList.remove('gold-word'); progress = Math.min(100, progress + 8); Sfx.gold();
          floatTxt(e.clientX, e.clientY - 10, '+8 ✨', '#ffd25e');
        }
        function spawnNotif() {
          const [ico, app, msg] = pick(pool);
          const n = document.createElement('div'); n.className = 'notif';
          n.innerHTML = `<span class="n-ico">${ico}</span><div><div class="n-app">${app}</div><div class="n-msg">${msg}</div></div><button class="n-x" aria-label="Dismiss">✕</button>`;
          const W = window.innerWidth, H = window.innerHeight;
          n.style.left = `${rand(8, Math.max(10, W - Math.min(300, W * 0.8) - 8))}px`;
          n.style.top = `${rand(H * 0.16, H * 0.82)}px`;
          layer.appendChild(n);
          const obj = { n, age: 0 };
          notifs.push(obj);
          Sfx.ping();
          n.addEventListener('pointerdown', (e) => {
            e.stopPropagation(); e.preventDefault();
            S.swiped++; Sfx.pop(); kill(obj); floatTxt(e.clientX, e.clientY - 10, 'swiped!', '#7aa2ff');
          });
        }
        function kill(obj) {
          const i = notifs.indexOf(obj); if (i >= 0) notifs.splice(i, 1);
          obj.n.classList.add('out'); setTimeout(() => obj.n.remove(), 260);
        }

        $('#btn-wake').onclick = () => { drowsing = false; drowse = 0; Sfx.splash(); drowsy.style.opacity = 0; drowsy.classList.remove('on'); addEnergy(2); };
        const drowsyChance = () => (S.energy < 45 ? ((45 - S.energy) / 45) * 0.22 : 0) + (S.raining ? 0.03 : 0);

        function frame(now) {
          const dt = Math.min(0.1, (now - last) / 1000); last = now;
          if (ended) return;
          timeLeft -= dt;

          nextNotif -= dt;
          const notifRate = 1 + S.stress / 120;
          if (nextNotif <= 0 && notifs.length < 4) { spawnNotif(); nextNotif = rand(1.3, 2.6) / notifRate; }
          for (const o of [...notifs]) {
            o.age += dt;
            if (o.age > 3 && !o.n.classList.contains('angry')) o.n.classList.add('angry');
            if (o.age > 5) {
              distracted++; progress = Math.max(0, progress - 7); Sfx.bad(); kill(o);
              floatTxt(window.innerWidth / 2 - 60, window.innerHeight * 0.3, 'Got distracted −7', '#ff5d73');
            }
          }

          nextGold -= dt;
          if (nextGold <= 0 && goldIdx.length) {
            const s = spans[pick(goldIdx)];
            if (!s.classList.contains('gold-word')) { s.classList.add('gold-word'); setTimeout(() => s.classList.remove('gold-word'), 2600); }
            nextGold = rand(2.8, 4.2);
          }

          if (!drowsing && Math.random() < drowsyChance() * dt) { drowsing = true; drowse = 0; setReading(false); }
          if (drowsing) {
            drowse += dt / 2.6;
            drowsy.style.opacity = drowse;
            if (drowse > 0.25) drowsy.classList.add('on');
            if (drowse >= 1) {
              drowsing = false; drowse = 0; drowsy.style.opacity = 0; drowsy.classList.remove('on');
              progress = Math.max(0, progress - 14); timeLeft -= 2; Sfx.snore();
              floatTxt(window.innerWidth / 2 - 50, window.innerHeight * 0.4, 'Dozed off −14', '#ff5d73');
            }
          }

          if (reading) progress = Math.min(100, progress + (100 / 11.5) * dt * Math.pow(0.4, notifs.length));
          page.classList.toggle('blurred', notifs.length >= 2);

          $('#focus-fill').style.width = `${progress}%`;
          $('#focus-pct').textContent = `${Math.round(progress)}%`;
          $('#focus-time').textContent = Math.max(0, Math.ceil(timeLeft));
          const nRead = Math.floor((progress / 100) * spans.length);
          spans.forEach((s, i) => s.classList.toggle('read', i < nRead));

          if (timeLeft <= 0 || progress >= 100) return finish();
          raf = requestAnimationFrame(frame);
        }

        function finish() {
          ended = true; cancelAnimationFrame(raf);
          page.removeEventListener('pointerdown', onDown);
          window.removeEventListener('pointerup', onUp);
          window.removeEventListener('pointercancel', onUp);
          window.removeEventListener('keydown', onKey);
          window.removeEventListener('keyup', onKey);
          notifs.slice().forEach(kill);
          drowsy.style.opacity = 0; drowsy.classList.remove('on');
          setReading(false);
          if (progress >= 100) Sfx.good();
          setTimeout(() => {
            el.classList.add('hidden'); layer.innerHTML = ''; document.body.style.overflow = '';
            resolve({ progress, distracted });
          }, progress >= 100 ? 500 : 250);
        }

        raf = requestAnimationFrame((t) => { last = t; frame(t); });
      });
    },
  };

  // ---------- exam ----------
  const STRIKE_NOTES = ['nah', 'lol no', 'definitely not', 'not this', 'sir said no', 'trap!', 'nope'];
  const EXAM_EVENTS = [
    { txt: '👀 The invigilator is standing RIGHT behind you.', pen: 2, stare: true },
    { txt: '🖊️ Your pen died. Borrowed one from the front bench.', pen: 3 },
    { txt: '📄 The topper asked for extra paper. Already.', pen: 0, stress: 6 },
    { txt: "📱 Someone's phone rang. The invigilator took it. Pin-drop silence.", pen: 1 },
    { txt: '🥵 The fan stopped. Sweat on the answer script.', pen: 1 },
    { txt: '⏰ "Last 10 minutes!" shouts the invigilator. (It has been 20 minutes.)', pen: 0, stress: 8 },
    { txt: '🧮 Calculator: LOW BATTERY. Shake it. Pray.', pen: 2, uni: true },
    { txt: '🤧 The guy behind you is coughing in Morse code. Is it… answers?', pen: 0 },
  ];

  let inviTimer = 0;
  function moveInvigilator(toYou) {
    const inv = $('#invigilator');
    inv.style.left = toYou ? '41%' : `${rand(4, 90)}%`;
    inv.classList.toggle('staring', !!toYou);
  }

  async function toExam() {
    S.over = true; S.busy = true;
    activity(null); away(null);
    const counts = CH.map(() => 2);
    let suggNote = '';
    if (S.sugg) {
      if (S.sugg.real) {
        counts.fill(1); counts[S.sugg.ch] = 4;
        shuffle(CH.map((_, i) => i).filter((i) => i !== S.sugg.ch)).slice(0, 2).forEach((i) => counts[i]++);
        suggNote = S.sugg.believed ? `The suggestion was REAL 😱 ${CH[S.sugg.ch].name} is all over the paper!` : `Wait… the suggestion was REAL. ${CH[S.sugg.ch].name} everywhere. 🫠`;
      } else {
        suggNote = S.sugg.believed ? 'The "suggestion" was fake. Classic. 💀' : 'The suggestion was fake. Good call ignoring it. 😎';
        if (S.sugg.believed) S.stress = clamp(S.stress + 12, 0, 100);
      }
    }
    const qs = [];
    counts.forEach((n, ci) => shuffle([...CH[ci].qs]).slice(0, n).forEach((q) => qs.push({ ci, q })));
    shuffle(qs);
    const penalty = (S.stress > 75 ? 0.12 : 0) + (S.energy < 25 ? 0.1 : 0);
    const jokes = shuffle([...D.JOKE_OPTIONS[L.setting]]);
    E = {
      i: 0, score: 0, eventsLeft: 3, log: [], written: 0,
      timePer: clamp(9 + S.energy * 0.09, 9, 18) * (S.late ? 0.75 : 1) * (S.noCalc ? 0.88 : 1),
      items: qs.map(({ ci, q }) => {
        const clarity = clamp(S.ch[ci] / 85 + S.pattern * 0.06 - penalty, 0, 1);
        const opts = shuffle(q.slice(1).map((txt, k) => ({ txt, correct: k === 0 })));
        const wrong = shuffle(opts.filter((o) => !o.correct));
        const strikes = clarity > 0.75 ? 2 : clarity > 0.45 ? 1 : 0;
        wrong.slice(0, strikes).forEach((o) => { o.struck = pick(STRIKE_NOTES); });
        if (clarity < 0.35 && chance(0.55) && jokes.length) { const o = wrong[wrong.length - 1]; o.txt = jokes.pop(); o.joke = true; }
        let whisper = null;
        if (clarity < 0.5 && chance(0.45)) {
          whisper = chance(0.45) ? opts.findIndex((o) => o.correct) : opts.indexOf(pick(wrong.filter((o) => !o.struck)));
        }
        return { ci, clarity, q: q[0], opts, whisper };
      }),
    };
    $('#exam-school').textContent = L.paperHead;
    $('#exam-subject').textContent = L.subject;
    $('#exam-mcq').classList.remove('hidden');
    $('#exam-written').classList.add('hidden');
    banner(null);
    showScreen('exam');
    $('.exam-paper').classList.toggle('stressed', S.stress > 75);
    clearInterval(inviTimer);
    inviTimer = setInterval(() => { if (!$('#invigilator').classList.contains('staring')) moveInvigilator(false); }, 2600);
    moveInvigilator(false);
    Sfx.bell();
    if (suggNote) setTimeout(() => toast(suggNote, 3800), 500);
    else if (S.late) setTimeout(() => toast('You arrived late. Less time per question!', 3200), 500);
    await sleep(700);
    showQuestion();
  }

  let examRaf = 0;
  function banner(text) {
    const b = $('#exam-banner');
    if (!text) { b.classList.remove('show'); return; }
    b.textContent = text; b.classList.remove('show'); void b.offsetWidth; b.classList.add('show');
  }

  function showQuestion() {
    const it = E.items[E.i];
    let pen = 0;
    banner(null);
    moveInvigilator(false);
    if (E.i > 0 && E.eventsLeft > 0 && chance(0.3)) {
      const ev = pick(EXAM_EVENTS.filter((x) => !x.uni || L.uni));
      E.eventsLeft--;
      pen = ev.pen;
      if (ev.stress) { S.stress = clamp(S.stress + ev.stress, 0, 100); $('.exam-paper').classList.toggle('stressed', S.stress > 75); }
      if (ev.stare) moveInvigilator(true);
      banner(ev.txt + (pen ? ` (−${pen}s)` : ''));
      Sfx.bad();
    }
    $('#exam-q').textContent = `Q ${E.i + 1} / ${E.items.length}`;
    $('#exam-score').textContent = `${E.score} correct`;
    const fam = it.clarity < 0.3 ? 'never seen this 😶' : it.clarity < 0.6 ? 'looks familiar 🤔' : 'you know this 😎';
    $('#exam-chapter').textContent = `${CH[it.ci].ico} ${CH[it.ci].name} · ${fam}`;
    const qEl = $('#exam-question');
    qEl.textContent = it.q;
    qEl.classList.toggle('foggy', it.clarity < 0.3);
    $('#exam-hint').textContent = '';
    const wrap = $('#exam-options'); wrap.innerHTML = '';
    it.opts.forEach((o, k) => {
      const b = document.createElement('button');
      b.className = 'opt' + (o.struck ? ' struck' : '') + (o.joke ? ' joke' : '');
      if (o.struck) b.dataset.note = o.struck;
      b.innerHTML = `<span class="k">${k + 1}</span><span class="t">${esc(o.txt)}</span>`;
      b.addEventListener('click', () => answer(k));
      wrap.appendChild(b);
    });
    const wh = $('#whisper');
    wh.classList.remove('show');
    if (it.whisper !== null) {
      setTimeout(() => {
        if (E && E.items[E.i] === it && !E.answered()) { wh.textContent = pick(['Psst… ', 'Oi… ', 'Bro… ']) + `it's ${it.whisper + 1}!`; wh.classList.add('show'); Sfx.whisper(); }
      }, 1200);
    }

    const start = performance.now(), total = Math.max(4, E.timePer - pen) * 1000;
    let answered = false;
    E.answered = () => answered;
    E.mark = () => { answered = true; };
    cancelAnimationFrame(examRaf);
    const tick = (now) => {
      if (answered) return;
      const k = clamp(1 - (now - start) / total, 0, 1);
      $('#exam-timer-fill').style.width = `${k * 100}%`;
      if (k <= 0) { answer(-1); return; }
      examRaf = requestAnimationFrame(tick);
    };
    examRaf = requestAnimationFrame(tick);
  }

  function answer(k) {
    if (!E || !E.answered || E.answered()) return;
    E.mark();
    const it = E.items[E.i];
    const btns = $$('.opt');
    btns.forEach((b, i) => { b.disabled = true; if (it.opts[i].correct) b.classList.add('correct'); });
    const right = k >= 0 && it.opts[k].correct;
    if (k >= 0 && !right) btns[k].classList.add('wrong');
    if (right) { E.score++; Sfx.good(); } else Sfx.bad();
    const followedWhisper = it.whisper !== null && k === it.whisper;
    let hint;
    if (k < 0) hint = "Time's up! Pen still in the air. ⌛";
    else if (it.opts[k].joke) hint = pick(['You picked the joke option. The examiner laughed. Then cut marks.', 'Bold choice. Wrong, but bold.']);
    else if (followedWhisper && right) hint = 'The whisper was right! Buy that friend a fuchka. 🙏';
    else if (followedWhisper) hint = 'Trusted the whisper. The whisper lied. Friendship over. 💔';
    else if (right && it.clarity < 0.4) hint = pick(['Pure guess. Pure luck. 🍀', 'Eeny meeny miny… correct?!', 'The universe owed you one.', 'Closed eyes, pointed, nailed it.']);
    else if (right) hint = pick(['Easy. You actually read this!', 'Remembered it from last night. 😎', 'The late-night studying paid off.', 'Too easy. Suspiciously easy.']);
    else if (it.clarity < 0.4) hint = pick(['You have never seen this in your life.', 'Was this even in the syllabus?!', "Looked at the friend's paper. They didn't know either.", 'Brain.exe has stopped working.']);
    else hint = pick(['ARGH. You knew this one!', 'Silly mistake. It will haunt you tonight.', 'So close. Brain lag.']);
    $('#exam-hint').textContent = hint;
    $('#exam-score').textContent = `${E.score} correct`;
    $('#whisper').classList.remove('show');
    E.log.push(right);
    setTimeout(() => {
      E.i++;
      if (E.i >= E.items.length) startWritten(); else showQuestion();
    }, 1500);
  }

  document.addEventListener('keydown', (e) => {
    if (!screens.exam.classList.contains('active') || !E || $('#exam-mcq').classList.contains('hidden')) return;
    const n = parseInt(e.key, 10);
    if (n >= 1 && n <= 4) answer(n - 1);
  });

  // ---------- written part ----------
  function startWritten() {
    banner(null); moveInvigilator(false); $('#whisper').classList.remove('show');
    $('#exam-mcq').classList.add('hidden');
    $('#exam-written').classList.remove('hidden');
    $('#exam-q').textContent = 'Part B';
    const ch = CH[weakest()];
    $('#written-q').textContent = `Q11. Explain "${ch.name}" in detail, with diagrams. (30 marks)`;
    $('#written-note').textContent = 'Your weakest chapter, of course. Your hand hurts. Choose your strategy:';
    $('#written-result').textContent = '';
    $('#written-scribble').classList.add('hidden');
    $('#btn-submit').classList.add('hidden');
    const k = avgKnow() / 100;
    const tiredHand = S.energy < 35;
    const strategies = [
      { label: 'Draw HUGE diagrams 📐', sub: 'Examiners love diagrams. Allegedly.', f: () => 0.3 + 0.6 * k + rand(-0.05, 0.12),
        say: (m) => (m > 18 ? 'Examiner: "Beautiful diagram." (It was a circle with arrows.)' : 'Your diagram was so confusing the examiner turned the page sideways.') },
      { label: 'Write so much the examiner gives up 📝', sub: tiredHand ? 'Your hand is already shaking…' : 'Ask for 3 extra sheets', f: () => (tiredHand ? 0.2 + 0.45 * k : 0.25 + 0.7 * k + rand(0, 0.1)),
        say: (m) => (m > 18 ? 'The examiner got tired after page 4 and just gave marks.' : tiredHand ? 'Your handwriting turned into an ECG graph by page 2.' : 'Lots of pages, very little content. The examiner noticed.') },
      { label: 'Rewrite the question in fancy words 🤡', sub: 'Works best when you know nothing', f: () => 0.3 + rand(0, 0.08),
        say: () => 'You wrote the question again with "therefore" and "hence". Some marks for confidence.' },
      { label: 'Heartfelt note to the examiner 🥺', sub: '"Sir, my nani was sick…"', f: () => { const r = Math.random(); return r < 0.15 ? 0.95 : r < 0.55 ? 0.35 : 0.05; },
        say: (m) => (m > 25 ? 'The examiner CRIED. Full marks. This should not have worked.' : m > 8 ? 'The examiner gave pity marks and a long sigh.' : 'The examiner wrote "See me" in red ink. 💀') },
    ];
    const box = $('#written-options'); box.innerHTML = '';
    box.classList.remove('hidden');
    strategies.forEach((s) => {
      const b = document.createElement('button'); b.className = 'w-opt';
      b.innerHTML = `<b>${s.label}</b><small>${s.sub}</small>`;
      b.addEventListener('click', async () => {
        Sfx.click(); box.classList.add('hidden');
        $('#written-scribble').classList.remove('hidden');
        Sfx.scribble();
        await sleep(2000);
        const m = Math.round(30 * clamp(s.f(), 0, 1));
        E.written = m;
        $('#written-result').textContent = `${s.say(m)}  → ${m}/30`;
        $('#btn-submit').classList.remove('hidden');
      }, { once: true });
      box.appendChild(b);
    });
  }

  // ---------- result ----------
  const GPA = [[80, 'A+', '5.00'], [70, 'A', '4.00'], [60, 'A-', '3.50'], [50, 'B', '3.00'], [40, 'C', '2.00'], [33, 'D', '1.00'], [0, 'F', '0.00']];
  const CGPA = [[80, 'A+', '4.00'], [75, 'A', '3.75'], [70, 'A-', '3.50'], [65, 'B+', '3.25'], [60, 'B', '3.00'], [55, 'B-', '2.75'], [50, 'C+', '2.50'], [45, 'C', '2.25'], [40, 'D', '2.00'], [0, 'F', '0.00']];
  const passMark = () => (L.scale === 'gpa' ? 33 : 40);
  function epilogue(marks) {
    const fail = marks < passMark();
    if (hall()) {
      if (marks >= 80) return "A+! Seniors are asking YOU for notes now. Dean's list energy. 🏆";
      if (marks >= 70) return 'Solid! Your CGPA survives another semester. The CR wants your formula sheet.';
      if (marks >= 55) return '"CGPA is just a number," you whisper. Convincingly. Almost.';
      if (!fail) return "Passed! No retake! Honestly, that's a win. Tong er cha is on you.";
      return 'F. Retake form time. See you next semester: same course, same night. 💀';
    }
    if (marks >= 80) return 'GOLDEN A+! Your relatives will hear about this at every dawat for 10 years. One night. Legend.';
    if (marks >= 60) return "Respectable! Ammu is making payesh. Abbu is pretending he isn't proud.";
    if (marks >= 40) return 'You passed! Abbu said "hmm". Just "hmm". Treat yourself to fuchka.';
    if (!fail) return 'Passed by a thread. Sir looked at your script, sighed, and let it go.';
    return 'F. The paper looked like a foreign language. Next time… start at 8 PM? 💀';
  }

  function finishExam() {
    clearInterval(inviTimer);
    const mcq = E.score * 7;
    const written = E.written || 0;
    const marks = mcq + written;
    const g = (L.scale === 'gpa' ? GPA : CGPA).find(([min]) => marks >= min);
    const cls = marks >= 70 ? 'g-top' : marks >= passMark() ? 'g-mid' : 'g-low';
    showScreen('result');
    $('#result-eyebrow').textContent = `${L.title} · Result published`;
    const gEl = $('#grade');
    gEl.textContent = g[1]; gEl.className = `grade ${cls}`;
    setTimeout(() => Sfx.stamp(), 400);
    $('#result-gpa').textContent = L.scale === 'gpa' ? `GPA ${g[2]} · ${marks}/100 marks` : `Grade point ${g[2]} · ${marks}/100 marks`;
    $('#result-breakdown').innerHTML = [
      ['MCQ', `${mcq}/70`, `${E.score}/10 correct`],
      ['Written', `${written}/30`, 'creative writing'],
      ['Prepared', `${Math.round(avgKnow())}%`, 'by exam time'],
    ].map(([a, b, c]) => `<div><span>${a}</span><b>${b}</b><small>${c}</small></div>`).join('');
    $('#result-epilogue').textContent = epilogue(marks);
    const hrs = (S.slept / 60).toFixed(1);
    $('#result-stats').innerHTML = [[S.cups, 'cups of cha'], [hrs, 'hours slept'], [S.swiped, 'notifs swiped'], [S.phone + S.games, 'phone / games']]
      .map(([v, l]) => `<div class="stat"><b>${v}</b><span>${l}</span></div>`).join('');

    const ach = [];
    if (S.cups >= 5) ach.push('☕ Cha-holic');
    if (S.candleStudy) ach.push('🕯️ Candlelight scholar');
    if (S.awakeSunrise) ach.push('🌅 Watched the sunrise');
    if (S.slept >= 240) ach.push('😴 Actually slept');
    if (S.phone >= 3) ach.push('📱 Doomscroller');
    if (S.games >= 2) ach.push('🎮 "Just one more"');
    if (S.bestFocus >= 99) ach.push('🔥 Locked in');
    if (S.ch.every((v) => v >= 70)) ach.push('🧠 Syllabus complete');
    if (S.pyqs >= 2) ach.push('📝 Pattern recogniser');
    if (S.packed) ach.push('🎒 Responsible adult');
    if (S.showerThought) ach.push('🚿 Shower genius');
    if (S.cleans >= 2) ach.push('🧹 Procrastination pro');
    if (S.sugg && S.sugg.believed && !S.sugg.real) ach.push('🤡 Fell for the fake suggestion');
    if (S.sugg && S.sugg.believed && S.sugg.real) ach.push('📩 Trusted the leak');
    if (S.passouts) ach.push('💀 Desk pillow');
    if (S.mosquitoWin) ach.push('🦟 Mosquito slayer');
    if (S.catPet) ach.push('🐈 Cat therapy');
    if (S.late) ach.push('⏰ Late entry');
    if (E.score === 10) ach.push('💯 Perfect MCQ');
    if (written >= 28) ach.push('✍️ Creative genius');
    $('#achievements').innerHTML = ach.map((a, i) => `<span class="ach" style="animation-delay:${0.6 + i * 0.07}s">${a}</span>`).join('');

    const best = bestOf(L.id);
    if (!best || marks > best.marks) store.set(`nbe-best-${L.id}`, JSON.stringify({ grade: g[1], marks }));
    E.result = { grade: g[1], marks };
  }

  // ---------- level select ----------
  const TOP = [
    { id: 'ssc', ico: '🎒', title: 'SSC', sub: 'Class 10 · Physics' },
    { id: 'hsc', ico: '📘', title: 'HSC', sub: 'Physics 1st Paper' },
    { id: 'uni', ico: '🎓', title: 'University', sub: 'Engineering semester final' },
  ];
  function bestOf(id) { try { return JSON.parse(store.get(`nbe-best-${id}`) || 'null'); } catch (e) { return null; } }

  function levelCard({ id, ico, title, sub, blurb, setting }) {
    const b = document.createElement('button'); b.className = 'level-card'; b.dataset.id = id;
    const best = id === 'uni' ? null : bestOf(id);
    b.innerHTML = `<span class="lc-ico">${ico}</span><b class="lc-title">${title}</b><span class="lc-sub">${sub}</span>${blurb ? `<span class="lc-blurb">${blurb}</span>` : ''}
      <span class="lc-foot"><span>${setting === 'hall' ? '🏢 Hall room' : '🏠 Home'}</span>${best ? `<em>Best: ${best.grade}</em>` : ''}</span>`;
    return b;
  }

  function showLevels(step = 1) {
    showScreen('level');
    const grid = $('#level-grid'); grid.innerHTML = '';
    grid.dataset.step = step;
    if (step === 1) {
      $('#level-eyebrow').textContent = 'Choose your exam';
      $('#level-title').textContent = 'Which exam is tomorrow?';
      $('#level-sub').textContent = 'Pick your suffering.';
      TOP.forEach((t) => {
        const lv = D.LEVELS[t.id];
        grid.appendChild(levelCard({ ...t, blurb: lv ? lv.blurb : 'EEE, CSE or Mechanical. Hall life. CGPA on the line.', setting: lv ? lv.setting : 'hall' }));
      });
    } else {
      $('#level-eyebrow').textContent = 'University';
      $('#level-title').textContent = 'Which department?';
      $('#level-sub').textContent = 'Same night, different pain.';
      ['eee', 'cse', 'me'].forEach((id) => {
        const lv = D.LEVELS[id];
        grid.appendChild(levelCard({ id, ico: lv.ico, title: lv.title, sub: lv.subject, blurb: lv.blurb, setting: 'hall' }));
      });
    }
  }

  $('#level-grid').addEventListener('click', (e) => {
    const c = e.target.closest('.level-card'); if (!c) return;
    Sfx.click();
    if (c.dataset.id === 'uni') showLevels(2);
    else start(c.dataset.id);
  });
  $('#btn-level-back').addEventListener('click', () => {
    Sfx.click();
    if ($('#level-grid').dataset.step === '2') showLevels(1); else { showScreen('title'); renderBest(); }
  });

  // ---------- title / wiring ----------
  function renderBest() {
    const parts = Object.values(D.LEVELS).map((lv) => { const b = bestOf(lv.id); return b ? `${lv.tag} ${b.grade}` : null; }).filter(Boolean);
    $('#best-score').textContent = parts.length ? `Your best: ${parts.join(' · ')}` : '';
  }

  function start(levelId) {
    L = D.LEVELS[levelId];
    CH = L.chapters;
    S = fresh();
    E = null;
    tab = 'study';
    $('#log').innerHTML = '';
    $('#cups').innerHTML = '';
    $('#room').classList.remove('shake');
    $('#poster-main').textContent = L.poster[0];
    $('#poster-sub').textContent = L.poster[1];
    $('#routine').innerHTML = `<b>EXAM</b><br/>${esc(L.tag)}${L.uni ? ' Final' : ''}<br/>9:00 AM<br/><span>${L.uni ? esc(L.poster[0]) : 'Room 304'}</span>`;
    $('#syllabus-sub').textContent = `— ${L.subject}`;
    showScreen('game');
    setStudent('idle');
    render();
    log(L.uni ? 'Realised the final is TOMORROW. The semester went by in a blink. 😨' : 'Realised the exam is TOMORROW. Not next week. Tomorrow. 😨', 'bad');
    setTimeout(() => think(L.uni ? 'Okay. 12 hours. One semester. Easy. 🙂' : 'Okay. 12 hours. I can do this. Probably.'), 900);
    setTimeout(() => toast('Tip: sleep matters. Tired brains get less time per question.', 3200), 700);
  }

  async function howTo() {
    await modal({
      icon: '📚', title: 'How to play',
      body: `<ul class="how">
        <li>Pick an exam: <b>SSC, HSC</b>, or a <b>university final</b> (EEE, CSE, ME).</li>
        <li>You have <b>12 hours</b> (9 PM → 9 AM). Every action costs time.</li>
        <li><b>Study</b> in a 15-second focus session: hold the page to read, tap notifications away, grab golden words, and splash water when you get sleepy.</li>
        <li>Low <b>energy</b> or high <b>stress</b> make studying worse. Cha, food, naps, showers and prayer help, but they cost time.</li>
        <li><b>Pack your bag</b>, or the morning will be chaos.</li>
        <li>In the exam, chapters you studied help you <s>cross out</s> wrong answers. Chapters you skipped… good luck. Trust the whisper from the next bench?</li>
      </ul>`,
      choices: [{ label: "Got it. Let's go", primary: true, value: true }],
    });
  }

  async function share() {
    const r = E && E.result;
    const text = r ? `I got ${r.grade} (${r.marks}/100) in my ${L.title} on Night Before Exam after ${S.cups} cups of cha 📚☕ Can you survive the night?` : 'Night Before Exam: can you survive the night?';
    const url = location.href.split('#')[0];
    try {
      if (navigator.share) { await navigator.share({ title: 'Night Before Exam', text, url }); return; }
      await navigator.clipboard.writeText(`${text} ${url}`);
      toast('Copied! Paste it in the group chat.');
    } catch (e) { toast('Could not share. Screenshot it instead! 📸'); }
  }

  function syncMute() { $$('[data-mute]').forEach((b) => { b.textContent = Sfx.muted ? '🔇' : '🔊'; }); }

  $('#btn-start').addEventListener('click', () => { Sfx.click(); showLevels(1); });
  $('#btn-how').addEventListener('click', () => { Sfx.click(); howTo(); });
  $('#btn-again').addEventListener('click', () => { Sfx.click(); start(L.id); });
  $('#btn-other').addEventListener('click', () => { Sfx.click(); showLevels(1); });
  $('#btn-share').addEventListener('click', share);
  $('#btn-submit').addEventListener('click', () => { Sfx.click(); finishExam(); });
  $$('[data-mute]').forEach((b) => b.addEventListener('click', () => { Sfx.toggle(); syncMute(); }));
  $$('.tab').forEach((t) => t.addEventListener('click', () => { Sfx.click(); tab = t.dataset.tab; renderActions(); }));
  const onAction = (e) => { const b = e.target.closest('.action'); if (b && !b.disabled) doAction(b.dataset.id); };
  $('#actions').addEventListener('click', onAction);
  $('#actions-main').addEventListener('click', onAction);

  syncMute();
  renderBest();
})();
