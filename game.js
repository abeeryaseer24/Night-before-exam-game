/* =========================================================
   Night Before Exam
   A one-night survival game. 9 PM -> 9 AM. Good luck.
   ========================================================= */
(() => {
  'use strict';

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
    };
  })();

  // ---------- content ----------
  const CHAPTERS = [
    {
      name: 'Motion & Force', bn: 'গতি ও বল', ico: '🚀',
      text: "A body stays at rest or keeps moving uniformly unless an external force acts on it. This property is called inertia, and it is Newton's first law. The second law says force equals mass times acceleration, F = ma, and force is measured in newtons. Momentum is mass times velocity. The third law: for every action there is an equal and opposite reaction. Near Earth's surface, g is about 9.8 m/s². The slope of a velocity–time graph gives acceleration.",
      gold: ['inertia', 'newtons', 'momentum', 'reaction', '9.8', 'acceleration'],
      qs: [
        ['SI unit of force?', 'Newton', 'Joule', 'Watt', 'Pascal'],
        ['Acceleration due to gravity on Earth is about…', '9.8 m/s²', '3.0 m/s²', '98 m/s²', '1.6 m/s²'],
        ["Newton's third law is about…", 'Action and reaction', 'Inertia', 'F = ma', 'Gravitation'],
        ['Momentum equals…', 'Mass × velocity', 'Mass × acceleration', 'Force × distance', 'Velocity ÷ time'],
        ['A body at rest wants to stay at rest. This is…', 'Inertia', 'Friction', 'Impulse', 'Power'],
        ['Slope of a velocity–time graph gives…', 'Acceleration', 'Displacement', 'Distance', 'Momentum'],
      ],
    },
    {
      name: 'Waves & Sound', bn: 'তরঙ্গ ও শব্দ', ico: '🔊',
      text: "Sound is a mechanical wave, so it needs a medium and cannot travel through a vacuum. In air, sound waves are longitudinal, made of compressions and rarefactions. Frequency is measured in hertz. Humans hear roughly 20 Hz to 20 kHz; below is infrasound, above is ultrasound. Sound travels at about 340 m/s in air, faster in water, and fastest in solids. A reflected sound heard after a short delay is called an echo.",
      gold: ['vacuum', 'longitudinal', 'hertz', '340', 'echo', 'medium'],
      qs: [
        ['Sound cannot travel through…', 'Vacuum', 'Water', 'Steel', 'Air'],
        ['Unit of frequency?', 'Hertz', 'Decibel', 'Newton', 'Tesla'],
        ['Speed of sound in air is about…', '340 m/s', '3×10⁸ m/s', '34 m/s', '3400 km/s'],
        ['Human audible range?', '20 Hz – 20 kHz', '2 Hz – 200 Hz', '20 kHz – 200 kHz', '0 – 20 Hz'],
        ['A reflected sound heard after a delay is…', 'An echo', 'Resonance', 'Pitch', 'Timbre'],
        ['Sound waves in air are…', 'Longitudinal', 'Transverse', 'Electromagnetic', 'Circular'],
      ],
    },
    {
      name: 'Current Electricity', bn: 'চল বিদ্যুৎ', ico: '⚡',
      text: "Electric current is the flow of charge, measured in amperes. Ohm's law states V = IR, and resistance is measured in ohms. Metals like copper are good conductors, while rubber, glass and wood are insulators. When resistors are connected in series, their resistances add up. The electricity bill counts energy in kilowatt-hours: 1 kWh is a unit of energy, not power.",
      gold: ['charge', 'ohms', 'copper', 'series', 'kilowatt-hours', 'V = IR'],
      qs: [
        ["Ohm's law: V = ?", 'IR', 'I / R', 'R / I', 'I²R'],
        ['Unit of resistance?', 'Ohm', 'Ampere', 'Volt', 'Coulomb'],
        ['Resistors in series — total resistance…', 'Adds up', 'Decreases', 'Equals the smallest', 'Becomes zero'],
        ['1 kWh is a unit of…', 'Energy', 'Power', 'Current', 'Charge'],
        ['Which is a good conductor?', 'Copper', 'Rubber', 'Glass', 'Wood'],
        ['Electric current is the flow of…', 'Charge', 'Heat', 'Light', 'Mass'],
      ],
    },
    {
      name: 'Heat & Temperature', bn: 'তাপ ও তাপমাত্রা', ico: '🔥',
      text: "Heat is a form of energy, so its SI unit is the joule. Heat moves by conduction, convection and radiation — only radiation works without any medium, which is how sunlight reaches Earth. Absolute zero, 0 K, equals −273 °C. Pure water boils at 100 °C at sea level and ice melts at 0 °C. A thermos flask works by reducing all three modes of heat transfer.",
      gold: ['joule', 'radiation', '−273', '100', 'thermos', 'conduction'],
      qs: [
        ['Pure water boils at sea level at…', '100 °C', '0 °C', '50 °C', '212 °C'],
        ['Heat transfer that needs no medium?', 'Radiation', 'Conduction', 'Convection', 'Diffusion'],
        ['SI unit of heat?', 'Joule', 'Calorie', 'Kelvin', 'Watt'],
        ['0 K is equal to…', '−273 °C', '0 °C', '−100 °C', '273 °C'],
        ['A thermos flask reduces…', 'All heat transfer', 'Only radiation', 'Only convection', 'Only pressure'],
        ['Ice melts at…', '0 °C', '4 °C', '−10 °C', '32 °C'],
      ],
    },
    {
      name: 'Light & Optics', bn: 'আলো', ico: '💡',
      text: "Light travels at about 3×10⁸ m/s in vacuum. When light passes from air into water it bends — this is refraction. A prism splits white light into colours by dispersion. A convex lens is a converging lens; a concave lens diverges light. A plane mirror forms a virtual, erect image. The sky looks blue because air molecules scatter blue light more than red — this is scattering.",
      gold: ['3×10⁸', 'refraction', 'dispersion', 'converging', 'virtual', 'scattering'],
      qs: [
        ['Speed of light in vacuum is about…', '3×10⁸ m/s', '3×10⁵ m/s', '340 m/s', '3×10¹² m/s'],
        ['Splitting white light into colours is…', 'Dispersion', 'Reflection', 'Diffraction', 'Polarisation'],
        ['A convex lens is also called a…', 'Converging lens', 'Diverging lens', 'Plane lens', 'Concave mirror'],
        ['Image in a plane mirror is…', 'Virtual and erect', 'Real and inverted', 'Real and erect', 'Magnified'],
        ['Light bending as it enters water is…', 'Refraction', 'Reflection', 'Dispersion', 'Scattering'],
        ['The sky looks blue because of…', 'Scattering', 'Refraction', 'Reflection', 'Absorption'],
      ],
    },
  ];

  const NOTIFS = [
    ['💬', 'Class group', '47 new messages: "bhai kichu porsos??"'],
    ['📸', 'Insta', 'Your crush just posted a story 👀'],
    ['🎬', 'YouTube', '"I studied ONE night and got A+" — new video'],
    ['👩', 'Ammu', 'Ghumai ja, onek raat hoise.'],
    ['🎮', 'BattleZone', 'Your squad is waiting! One match only 🔥'],
    ['🛵', 'FoodDash', 'Midnight craving? 50% off kacchi 🍛'],
    ['💬', 'Messenger', 'Rafi: "dosto suggestion ase??"'],
    ['📺', 'StreamFlix', 'Your show just dropped a new season.'],
    ['🧑‍🏫', 'Sir', 'Reminder: 9:00 sharp. No late entry.'],
    ['🔥', 'Trending', '#ExamPostponed (source: trust me)'],
    ['🎵', 'Music', 'Lo-fi beats to panic/study to'],
    ['📶', 'Telco', 'Your data pack expires in 2 hours!'],
    ['🌸', 'Family group', 'Fupi sent 12 "Good Night" flowers'],
    ['🏏', 'Cricket', 'Bangladesh need 12 off 6 balls!!'],
    ['💸', 'Wallet', 'You received ৳0.00 cashback 🎉'],
    ['👻', 'Unknown', 'Hi. Are you awake? 🙂'],
  ];

  const FRIENDS = ['Rafi', 'Nusrat', 'Tanvir', 'Mim', 'Shakil', 'Tasnim', 'Arnob', 'Priya'];

  // ---------- state ----------
  let S;
  const fresh = () => ({
    t: 0, energy: 78, stress: 32, ch: [0, 0, 0, 0, 0],
    cups: 0, crashes: [], meals: 0, breaths: 0, skims: 0,
    powerOff: false, powerOnAt: 0, musicUntil: -1, raining: false,
    sugg: null, used: new Set(), loadshed: 0,
    slept: 0, phone: 0, swiped: 0, distracted: 0, passouts: 0,
    bestFocus: 0, candleStudy: false, awakeSunrise: false, late: false,
    markers: new Set(), over: false, busy: false, mosquitoWin: false, catPet: false,
  });

  // ---------- DOM refs ----------
  const screens = { title: $('#screen-title'), game: $('#screen-game'), exam: $('#screen-exam'), result: $('#screen-result') };
  const showScreen = (k) => { Object.values(screens).forEach((s) => s.classList.remove('active')); screens[k].classList.add('active'); window.scrollTo(0, 0); };

  // ---------- time formatting ----------
  const clockOf = (t) => { const m = (21 * 60 + Math.round(t)) % 1440; return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`; };
  const prettyTime = (t) => { const m = (21 * 60 + Math.round(t)) % 1440; let h = Math.floor(m / 60); const ap = h >= 12 ? 'PM' : 'AM'; h = h % 12 || 12; return `${h}:${String(m % 60).padStart(2, '0')} ${ap}`; };
  const dur = (m) => `${Math.floor(m / 60)}h ${String(Math.round(m % 60)).padStart(2, '0')}m`;
  const left = (t) => { const r = Math.max(0, TOTAL - t); return `${Math.floor(r / 60)}h ${String(r % 60).padStart(2, '0')}m`; };

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

  // ---------- diary ----------
  function log(text, cls = '') {
    const li = document.createElement('li');
    if (cls) li.className = cls;
    li.innerHTML = `<span class="lt">${clockOf(S.t)}</span>${text}`;
    const ol = $('#log'); ol.prepend(li);
    while (ol.children.length > 40) ol.lastChild.remove();
  }

  function toast(msg, ms = 2200) {
    const el = $('#toast'); el.textContent = msg; el.classList.add('show');
    clearTimeout(toast._t); toast._t = setTimeout(() => el.classList.remove('show'), ms);
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
      // caffeine crash
      S.crashes = S.crashes.filter((c) => {
        if (now >= c) { S.energy = clamp(S.energy - 10, 0, 100); if (!asleep) logAt(c, 'Caffeine crash. Eyelids heavy. 🥱', 'bad'); return false; }
        return true;
      });
      // power returns
      if (S.powerOff && now >= S.powerOnAt) {
        S.powerOff = false; logAt(S.powerOnAt, 'Current eseche! ⚡ Power is back.', 'good'); Sfx.powerOn();
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
  function logAt(t, text, cls) { const keep = S.t; S.t = t; log(text, cls); S.t = keep; }

  async function animateClock(from, to) {
    const el = $('#clock');
    const dur = clamp((to - from) * 9, 250, 1300);
    const start = performance.now();
    let lastMin = -1;
    return new Promise((res) => {
      const frame = (now) => {
        const k = clamp((now - start) / dur, 0, 1);
        const t = Math.round(lerp(from, to, 1 - Math.pow(1 - k, 3)));
        el.textContent = clockOf(t);
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
        if (c.disabled) { b.disabled = true; b.style.opacity = .4; }
        b.addEventListener('click', () => { Sfx.click(); $('#modal').classList.add('hidden'); resolve(c.value !== undefined ? c.value : i); }, { once: true });
        wrap.appendChild(b);
      });
      $('#modal').classList.remove('hidden');
      setTimeout(() => wrap.querySelector('button:not(:disabled)')?.focus(), 50);
    });
  }

  // ---------- render ----------
  const SKY = [
    [0, '#0a0f2c', '#1b2456'],
    [300, '#070a1f', '#121a42'],
    [480, '#0d1235', '#2a2a66'],
    [525, '#28306e', '#a0567c'],
    [580, '#4f74bd', '#f2a07b'],
    [650, '#7fb3f0', '#ffd6a0'],
    [720, '#8cc4ff', '#ffe9bf'],
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
    const sf = clamp((t - 530) / 190, 0, 1);
    sun.style.top = `${lerp(105, 18, sf)}%`;
    sun.style.opacity = t > 520 ? 1 : 0;
  }

  function setBar(stat, val, txt) {
    const el = $(`.bar[data-stat="${stat}"]`);
    el.querySelector('.bar-fill').style.width = `${clamp(val, 0, 100)}%`;
    el.querySelector('.bar-val').textContent = txt ?? Math.round(val);
    el.classList.toggle('low', (stat === 'energy' && val < 20) || (stat === 'stress' && val > 80));
  }

  function renderChapters() {
    const ul = $('#chapter-list'); ul.innerHTML = '';
    CHAPTERS.forEach((c, i) => {
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
    $('#rain').classList.toggle('on', S.raining);
    const cups = $('#cups');
    if (cups.children.length !== Math.min(S.cups, 7)) {
      cups.innerHTML = '';
      for (let i = 0; i < Math.min(S.cups, 7); i++) {
        const c = document.createElement('div'); c.className = 'cup' + (i === Math.min(S.cups, 7) - 1 ? ' fresh' : ''); cups.appendChild(c);
      }
    }
    const chips = [];
    if (S.powerOff) chips.push(`<span class="chip warn">🕯️ Load shedding till ~${clockOf(S.powerOnAt)}</span>`);
    if (S.crashes.length) chips.push(`<span class="chip">☕ Caffeine: crash at ${clockOf(Math.min(...S.crashes))}</span>`);
    if (S.musicUntil > S.t) chips.push('<span class="chip warn">🔊 Neighbour\'s DJ night</span>');
    if (S.raining) chips.push('<span class="chip">🌧️ Raining</span>');
    if (S.sugg && S.sugg.believed) chips.push(`<span class="chip ok">📩 Suggestion: ${CHAPTERS[S.sugg.ch].name}</span>`);
    $('#room-status').innerHTML = chips.join('');
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
    { id: 'study', ico: '📖', name: 'Study a chapter', time: '60m', meta: 'Focus session minigame' },
    { id: 'skim', ico: '📑', name: 'Skim everything', time: '30m', meta: 'A little of every chapter' },
    { id: 'cha', ico: '☕', name: 'Make cha', time: '10m', meta: '+Energy, crashes later' },
    { id: 'snack', ico: '🍜', name: 'Cook noodles', time: '20m', meta: '+Energy, −Stress' },
    { id: 'phone', ico: '📱', name: '"Quick" phone check', time: '30m', meta: '−Stress… and chaos' },
    { id: 'nap', ico: '😴', name: 'Power nap', time: '20–90m', meta: 'Recharge (risky)' },
    { id: 'friend', ico: '📞', name: 'Call a friend', time: '20m', meta: 'Group study? Gossip?' },
    { id: 'breathe', ico: '🧘', name: 'Deep breaths', time: '5m', meta: '−Stress' },
  ];

  function renderActions() {
    const wrap = $('#actions'); wrap.innerHTML = '';
    const list = [...ACTIONS];
    if (S.t < SLEEP_ALARM) list.push({ id: 'sleep', ico: '🛏️', name: 'Sleep until 7:30 AM', time: dur(SLEEP_ALARM - S.t), meta: 'Rest up — wake for the exam', wide: true, cls: 'sleep' });
    if (S.t >= 600) list.push({ id: 'go', ico: '🏃', name: 'Leave for the exam hall', time: 'now', meta: 'Arrive early, calm down', wide: true, cls: 'exam' });
    list.forEach((a) => {
      const b = document.createElement('button');
      b.className = `action${a.wide ? ' wide' : ''}${a.cls ? ' ' + a.cls : ''}`;
      b.dataset.id = a.id;
      b.innerHTML = `<span class="a-ico">${a.ico}</span><span class="a-name">${a.name}</span><span class="a-meta">${a.meta}</span><span class="a-time">${a.time}</span>`;
      b.disabled = S.busy;
      wrap.appendChild(b);
    });
  }

  function render() {
    if (!S) return;
    $('#clock').textContent = clockOf(S.t);
    $('#clock').classList.toggle('urgent', S.t >= 660);
    $('#countdown').textContent = S.t >= TOTAL ? 'EXAM TIME' : `Exam in ${left(S.t)}`;
    setBar('energy', S.energy);
    setBar('stress', S.stress);
    const k = avgKnow(); setBar('know', k, `${Math.round(k)}%`);
    $('#mood').textContent = moodText();
    renderChapters(); renderRoom(); renderSky(); renderActions();
  }

  // ---------- actions ----------
  const Act = {
    async study() {
      const choice = await modal({
        icon: '📖', title: 'Which chapter?',
        body: `Current focus efficiency: <b>${Math.round(efficiency() * 100)}%</b>${S.powerOff ? ' (studying by candlelight)' : ''}`,
        choices: [
          ...CHAPTERS.map((c, i) => ({ label: `${c.ico} ${c.name}`, sub: `${Math.round(S.ch[i])}% prepared · ${c.bn}${S.sugg && S.sugg.believed && S.sugg.ch === i ? ' · "suggestion" 🔥' : ''}`, value: i })),
          { label: 'Never mind', value: -1 },
        ],
      });
      if (choice < 0) return false;
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
      await advance(60);
      const cls = gained >= 20 ? 'good' : gained < 8 ? 'bad' : '';
      log(`Studied ${CHAPTERS[choice].name}: +${gained}%${result.progress >= 95 ? ' — locked in!' : ''}${result.distracted ? ` (got distracted ${result.distracted}×)` : ''}`, cls);
      return true;
    },
    async skim() {
      S.skims++;
      const e = efficiency() * Math.max(0.35, 1 - (S.skims - 1) * 0.2);
      let total = 0;
      S.ch.forEach((_, i) => { total += addKnow(i, 5.5 * e * (1 - S.ch[i] / 120)); });
      addEnergy(-4);
      await advance(30);
      log(`Skimmed all chapters. +${total}% total. Highlighters were used.`);
      return true;
    },
    async cha() {
      S.cups++; Sfx.sip();
      let gain = S.cups <= 3 ? 20 : S.cups <= 5 ? 11 : 4;
      addEnergy(gain);
      addStress(S.cups > 5 ? 9 : 3);
      S.crashes.push(S.t + 150);
      await advance(10);
      const lines = ['Cha number one. The ritual begins. ☕', 'Second cup. Ada beshi, chini kom.', 'Third cup. Now we\'re talking.', 'Fourth cup. Is this still cha or just hope?', 'Fifth cup. Your heart is doing drum solos.', 'Cup #' + S.cups + '. Hands shaking. Vision… colourful.'];
      log(lines[Math.min(S.cups, 6) - 1], S.cups > 5 ? 'bad' : '');
      return true;
    },
    async snack() {
      S.meals++;
      const g = S.meals <= 2 ? 1 : 0.5;
      addEnergy(14 * g); addStress(-9 * g);
      await advance(20);
      log(pick(['Cooked noodles at 1 AM energy. Delicious.', 'Instant noodles + egg. Chef\'s kiss.', 'Ate straight from the pot. No regrets.', 'Found leftover biryani. Jackpot. 🍛']), 'good');
      return true;
    },
    async phone() {
      S.phone++;
      if (S.powerOff) {
        addStress(-4);
        await advance(30);
        log('No WiFi, data finished. Stared at the offline dinosaur for 30 minutes. 🦖');
        return true;
      }
      const r = Math.random();
      if (!S.sugg && r < 0.32) {
        await advance(30, { animate: true });
        await Events.suggestion.run();
      } else if (r < 0.52) {
        addStress(14);
        await advance(30);
        log('Saw the class topper post: "Revised everything 3 times 😌". Pain.', 'bad');
      } else if (r < 0.68) {
        const w = weakest(); const g = addKnow(w, 9 * efficiency());
        await advance(30);
        log(`Found a 10-minute explainer on ${CHAPTERS[w].name}. +${g}%! Phone was useful for once.`, 'good');
      } else {
        addStress(-12); addEnergy(-3);
        const extra = chance(0.45) ? 20 : 0;
        await advance(30 + extra);
        log(extra ? 'Reels. 30 minutes became 50. Where did it go?!' : 'Doomscrolled reels. Weirdly calming.', extra ? 'bad' : '');
      }
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
        await advance(20, { asleep: true });
        addEnergy(10);
        log('20-minute power nap. Fresh-ish. 😌', 'good');
      } else {
        const over = chance(0.28);
        await advance(over ? 140 : 90, { asleep: true });
        addEnergy(12); addStress(over ? 10 : -6);
        log(over ? 'Hit snooze. Twice. Woke up 50 minutes late. 😱' : 'Full sleep cycle. Brain rebooted.', over ? 'bad' : 'good');
        if (over) document.getElementById('room').classList.add('shake');
      }
      return true;
    },
    async friend() {
      const name = pick(FRIENDS);
      const r = Math.random();
      if (r < 0.4) {
        const w = weakest(); const g = addKnow(w, 12 * efficiency());
        await advance(20);
        log(`${name} explained ${CHAPTERS[w].name} like a genius. +${g}%. Treat them to fuchka after.`, 'good');
      } else if (r < 0.7) {
        addStress(11);
        await advance(20);
        log(`${name}: "Dosto ami KICHU pori nai 😭". Now you're both panicking.`, 'bad');
      } else {
        addStress(-16); addEnergy(-4);
        await advance(40);
        log(`Called ${name} to study. Gossiped for 40 minutes instead. Very healing.`);
      }
      return true;
    },
    async breathe() {
      S.breaths++;
      const v = [13, 10, 7, 5, 4, 3][Math.min(S.breaths - 1, 5)];
      addStress(-v);
      await advance(5);
      log(`Breathed in 4, held 7, out 8. −${v} stress.`, 'good');
      return true;
    },
    async sleep() {
      const hrs = ((SLEEP_ALARM - S.t) / 60).toFixed(1);
      const ok = await modal({
        icon: '🛏️', title: 'Go to sleep?',
        body: `You'll get about <b>${hrs} hours</b> of sleep. Alarm at 7:30 AM.<br/>No more studying after this — well-rested brains read questions better.`,
        choices: [{ label: 'Lights off. Alarm set.', value: true, primary: true }, { label: 'Not yet', value: false }],
      });
      if (!ok) return false;
      S.busy = true; render();
      const overslept = S.energy < 20 && chance(0.3);
      Sfx.snore();
      log(`Went to bed. Prepared: ${Math.round(avgKnow())}%. Dua por, ghum.`);
      await advance(SLEEP_ALARM - S.t, { asleep: true });
      if (overslept) {
        await advance(55, { asleep: true });
        S.late = true;
        log('ALARM DIDN\'T WAKE YOU. It\'s 8:25!!! 😱', 'bad');
        await modal({ icon: '⏰', title: 'You overslept!', body: 'It\'s 8:25. No breakfast. No revision. You run out with one shoe half on.<br/><span class="quote">"Rickshaw mama, joldi!"</span>You\'ll arrive late — less time per question.', choices: [{ label: 'RUN', primary: true }] });
      } else {
        await morning();
      }
      await toExam();
      return 'exam';
    },
    async go() {
      await morning(true);
      await toExam();
      return 'exam';
    },
  };

  async function morning(early = false) {
    const w = weakest();
    const c = await modal({
      icon: '🌅', title: early ? 'Leaving early' : 'Good morning!',
      body: early ? 'You pack your admit card, two pens, and the confidence of someone who studied.' : 'Ammu made paratha and dim bhaji. The exam is at 9.<br/><span class="quote">"Admit card nisos?"</span>',
      choices: [
        { label: `Revise ${CHAPTERS[w].name} on the rickshaw`, sub: '+ a little to your weakest chapter', value: 'rev', primary: true },
        { label: 'Eat properly, breathe, stay calm', sub: '+energy, −stress', value: 'calm' },
      ],
    });
    if (c === 'rev') { const g = addKnow(w, 7); log(`Last-minute revision on the rickshaw: +${g}% ${CHAPTERS[w].name}.`); }
    else { addEnergy(12); addStress(-14); log('Ate breakfast. Breathed. Ready-ish.', 'good'); }
  }

  // ---------- events ----------
  const Events = {
    loadshed: {
      w: 3, cond: () => !S.powerOff && S.loadshed < 2 && S.t < 600,
      async run() {
        S.loadshed++; S.powerOff = true; S.powerOnAt = S.t + ri(60, 110);
        Sfx.power(); render();
        const c = await modal({
          icon: '🕯️', title: 'LOAD SHEDDING!',
          body: `The fan dies. The lamp dies. The whole para goes dark.<br/>Power returns around <b>${clockOf(S.powerOnAt)}</b> (allegedly).`,
          choices: [
            { label: 'Light a candle and keep going', sub: 'Studying is harder by candlelight', value: 'candle', primary: true },
            { label: 'Lie down until it comes back', sub: 'Rest in the dark (+energy, time passes)', value: 'rest' },
          ],
        });
        log('Load shedding. Of course. Tonight of all nights.', 'bad');
        if (c === 'rest') { await advance(S.powerOnAt - S.t, { asleep: true }); log('Rested in the dark until the fan spun back.'); }
      },
    },
    ammu: {
      w: 4, cond: () => S.t >= 40 && S.t <= 200,
      async run() {
        const c = await modal({
          icon: '👩', title: 'Ammu is calling',
          body: '<span class="quote">"Khaite ay! Bhaat thanda hoye jacche!"</span>',
          choices: [
            { label: 'Go eat dinner', sub: '20 min · +energy, −stress', value: 'eat', primary: true },
            { label: '"Ektu pore, Ammu!"', sub: 'Keep working… she will remember this', value: 'later' },
          ],
        });
        if (c === 'eat') { addEnergy(16); addStress(-10); await advance(20); log('Dinner with family. Ammu gave extra fish. 🐟', 'good'); }
        else { addStress(6); addEnergy(-4); log('Skipped dinner. Stomach is filing a complaint.', 'bad'); }
      },
    },
    suggestion: {
      w: 2, cond: () => !S.sugg && S.t < 600,
      async run() {
        const ch = ri(0, 4);
        S.sugg = { ch, real: chance(0.5), believed: false };
        Sfx.ping();
        const c = await modal({
          icon: '📩', title: 'SUGGESTION LEAKED?!',
          body: `Class group chat is exploding:<span class="quote">"BRO 100% CONFIRMED — question will come from <u>${CHAPTERS[ch].name}</u> 🔥🔥"</span>Forwarded many times. Source: "someone's cousin's coaching sir".`,
          choices: [
            { label: 'Believe it!', sub: `Studying ${CHAPTERS[ch].name} feels extra motivating`, value: true, primary: true },
            { label: 'Fake news. Ignore.', value: false },
          ],
        });
        S.sugg.believed = c;
        log(c ? `Got a "suggestion": ${CHAPTERS[ch].name}. Believing it. 🙏` : 'Ignored the "suggestion". Big brain or big mistake?');
      },
    },
    music: {
      w: 2, cond: () => S.t < 420 && S.musicUntil < S.t,
      async run() {
        const c = await modal({
          icon: '🔊', title: 'Gaye holud next door',
          body: 'The neighbours have a holud night. A speaker the size of a fridge is blasting remixes at full volume.',
          choices: [
            { label: 'Earphones in, suffer quietly', sub: 'Focus −15% for 2 hours', value: 'endure', primary: true },
            { label: 'Go join the dance for a bit', sub: '30 min · −stress, −energy', value: 'dance' },
          ],
        });
        if (c === 'dance') { addStress(-22); addEnergy(-10); await advance(30); log('Danced at the holud. 30 minutes of pure joy. 💃', 'good'); S.musicUntil = S.t + 60; }
        else { S.musicUntil = S.t + 120; addStress(5); log('Neighbour\'s DJ is playing the same song for the 9th time.', 'bad'); }
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
        if (c === 'coil') { await advance(5); log('Lit a mosquito coil. Room smells like victory and smoke.'); }
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
        if (c === 'cha') { await Act.cha(); log('Rain + cha. Poetic. Physics can wait 5 minutes.'); }
        else { addEnergy(-8); log('Rain is making everything so… cozy… must… stay… awake.'); }
      },
    },
    cat: {
      w: 1, cond: () => true,
      async run() {
        const c = await modal({
          icon: '🐈', title: 'A cat appears',
          body: 'The neighbour\'s cat jumps through the window and sits exactly on the page you were reading.',
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
        await modal({ icon: '📄', title: 'Senior bhai to the rescue', body: `A senior sends their handwritten notes for <b>${CHAPTERS[w].name}</b>. Neat diagrams. Highlighted formulas. Angel.<br/><br/>+${g}% ${CHAPTERS[w].name}` });
        log(`Senior's notes for ${CHAPTERS[w].name}: +${g}%. Legend.`, 'good');
      },
    },
    spiral: {
      w: 1, cond: () => S.t > 240,
      async run() {
        const c = await modal({
          icon: '🌀', title: '3 AM thoughts',
          body: 'Why physics? Why exams? What even is a "newton"? Will any of this matter in 10 years?',
          choices: [
            { label: 'Snap out of it', sub: '+a bit of stress', value: 'snap', primary: true },
            { label: 'Spiral deeper', sub: '20 min · existential crisis', value: 'spiral' },
          ],
        });
        if (c === 'snap') { addStress(4); log('Slapped own face (gently). Back to work.'); }
        else { addStress(10); addEnergy(-5); await advance(20); log('Spent 20 minutes contemplating the universe. The universe did not reply.', 'bad'); }
      },
    },
  };

  async function randomEvent() {
    const pool = Object.entries(Events).filter(([id, e]) => (id === 'loadshed' || !S.used.has(id)) && e.cond());
    if (!pool.length) return;
    // dinner is basically guaranteed early
    let chosen = pool.find(([id]) => id === 'ammu' && S.t >= 60);
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
    await modal({
      icon: '💤', title: 'You blinked…',
      body: `…for one second. You wake up with your face on the textbook and ink on your cheek.<br/><b>${Math.floor(lost / 60)}h ${lost % 60}m</b> have vanished.`,
      choices: [{ label: 'NOOOO', primary: true }],
    });
    await advance(lost, { asleep: true });
    addEnergy(8);
    log(`Passed out on the desk. Lost ${lost} minutes. 💀`, 'bad');
  }

  async function panic() {
    $('#room').classList.add('shake');
    const c = await modal({
      icon: '😱', title: 'PANIC ATTACK',
      body: 'Heart racing. Nothing makes sense. You re-read the same line 14 times.',
      choices: [
        { label: 'Breathe 4-7-8', sub: '10 min · −25 stress', value: 'b', primary: true },
        { label: 'Call Ammu from the next room', sub: '20 min · −40 stress', value: 'a' },
      ],
    });
    if (c === 'b') { addStress(-25); await advance(10); log('Panic attack. Breathed through it.', 'bad'); }
    else { addStress(-40); await advance(20); log('Ammu: "Ja pari likhbi. Allah bhorsha." Feeling better.', 'good'); }
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
      if (!S.over) { S.busy = false; render(); }
    }
  }

  async function afterAction() {
    if (S.t >= TOTAL) return timeUp();
    if (S.energy <= 0) await passOut();
    if (S.t >= TOTAL) return timeUp();
    if (S.stress >= 100) await panic();
    if (S.t >= TOTAL) return timeUp();
    if (S.t < 690 && chance(0.4)) await randomEvent();
    if (S.t >= TOTAL) return timeUp();
    if (S.energy <= 0) await passOut();
    if (S.t >= TOTAL) return timeUp();
    $('#room').classList.remove('shake');
  }

  async function timeUp() {
    Sfx.bell();
    await modal({ icon: '⏰', title: 'IT\'S 9:00 AM!', body: 'No time for anything. Grab the admit card and RUN.<br/><span class="quote">"Pen! Where is my pen?!"</span>', choices: [{ label: 'Run to the exam hall', primary: true }] });
    await toExam();
  }

  // ---------- focus minigame ----------
  const Focus = {
    run(chIdx) {
      return new Promise((resolve) => {
        const ch = CHAPTERS[chIdx];
        const el = $('#focus'), page = $('#focus-page'), textEl = $('#focus-text'), layer = $('#focus-layer'), drowsy = $('#drowsy');
        const DURATION = 15;
        let progress = 0, reading = false, timeLeft = DURATION, last = performance.now(), raf = 0;
        let nextNotif = 1.2, nextGold = 2.5, drowse = 0, drowsing = false, distracted = 0, ended = false;
        const notifs = [];

        // build text
        const words = ch.text.split(/\s+/);
        textEl.innerHTML = `<h4>${ch.ico} ${ch.name}</h4>` + words.map((w) => `<span class="w">${w}</span>`).join(' ');
        const spans = $$('.w', textEl);
        const goldIdx = spans.map((s, i) => [s, i]).filter(([s]) => ch.gold.some((g) => s.textContent.toLowerCase().replace(/[.,:;'"()]/g, '').includes(g.toLowerCase().split(' ')[0]))).map(([, i]) => i);
        $('#focus-chapter').textContent = `${ch.name} · ${ch.bn}`;
        $('#focus-instr').style.opacity = 1;
        page.classList.toggle('blurred', false);
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
          const [ico, app, msg] = pick(NOTIFS);
          const n = document.createElement('div'); n.className = 'notif';
          n.innerHTML = `<span class="n-ico">${ico}</span><div><div class="n-app">${app}</div><div class="n-msg">${msg}</div></div><button class="n-x" aria-label="Dismiss">✕</button>`;
          const W = window.innerWidth, H = window.innerHeight;
          n.style.left = `${rand(8, Math.max(10, W - Math.min(300, W * 0.8) - 8))}px`;
          n.style.top = `${rand(H * 0.16, H * 0.82)}px`;
          layer.appendChild(n);
          const obj = { n, age: 0 };
          notifs.push(obj);
          Sfx.ping();
          $('.phone-obj')?.classList.add('ping');
          n.addEventListener('pointerdown', (e) => {
            e.stopPropagation(); e.preventDefault();
            S.swiped++; Sfx.pop(); kill(obj); floatTxt(e.clientX, e.clientY - 10, 'swiped!', '#7aa2ff');
          });
        }
        function kill(obj) {
          const i = notifs.indexOf(obj); if (i >= 0) notifs.splice(i, 1);
          obj.n.classList.add('out'); setTimeout(() => obj.n.remove(), 260);
          if (!notifs.length) $('.phone-obj')?.classList.remove('ping');
        }

        $('#btn-wake').onclick = () => { drowsing = false; drowse = 0; Sfx.splash(); drowsy.style.opacity = 0; drowsy.classList.remove('on'); addEnergy(2); };

        const drowsyChance = () => (S.energy < 45 ? ((45 - S.energy) / 45) * 0.22 : 0) + (S.raining ? 0.03 : 0);

        function frame(now) {
          const dt = Math.min(0.1, (now - last) / 1000); last = now;
          if (ended) return;
          timeLeft -= dt;

          // notifications
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

          // gold words
          nextGold -= dt;
          if (nextGold <= 0 && goldIdx.length) {
            const i = pick(goldIdx); const s = spans[i];
            if (!s.classList.contains('gold-word')) { s.classList.add('gold-word'); setTimeout(() => s.classList.remove('gold-word'), 2600); }
            nextGold = rand(2.8, 4.2);
          }

          // drowsiness
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

          // reading
          if (reading) {
            const slow = Math.pow(0.4, notifs.length);
            progress = Math.min(100, progress + (100 / 11.5) * dt * slow);
          }
          page.classList.toggle('blurred', notifs.length >= 2);

          // ui
          const p = Math.round(progress);
          $('#focus-fill').style.width = `${progress}%`;
          $('#focus-pct').textContent = `${p}%`;
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
            $('.phone-obj')?.classList.remove('ping');
            resolve({ progress, distracted });
          }, progress >= 100 ? 500 : 250);
        }

        raf = requestAnimationFrame((t) => { last = t; frame(t); });
      });
    },
  };

  // ---------- exam ----------
  const GLYPHS = '░▒▓#%&@?*~§¤';
  function garble(str, p) {
    let out = '';
    for (const ch of str) {
      if (/[\p{L}\p{N}]/u.test(ch) && Math.random() < p) out += `<span class="garble">${GLYPHS[Math.floor(Math.random() * GLYPHS.length)]}</span>`;
      else out += ch.replace(/&/g, '&amp;').replace(/</g, '&lt;');
    }
    return out;
  }

  let E = null;
  async function toExam() {
    S.over = true; S.busy = true;
    // build paper
    const counts = [2, 2, 2, 2, 2];
    let suggNote = '';
    if (S.sugg) {
      if (S.sugg.real) {
        counts.fill(1); counts[S.sugg.ch] = 4;
        const others = shuffle([0, 1, 2, 3, 4].filter((i) => i !== S.sugg.ch)).slice(0, 2);
        others.forEach((i) => counts[i]++);
        suggNote = S.sugg.believed ? `The suggestion was REAL 😱 — ${CHAPTERS[S.sugg.ch].name} is all over the paper!` : `Wait… the suggestion was REAL. ${CHAPTERS[S.sugg.ch].name} everywhere. 🫠`;
      } else {
        suggNote = S.sugg.believed ? 'The "suggestion" was fake. Classic. 💀' : 'The suggestion was fake. Good call ignoring it. 😎';
        if (S.sugg.believed) S.stress = clamp(S.stress + 12, 0, 100);
      }
    }
    const qs = [];
    counts.forEach((n, ci) => {
      shuffle([...CHAPTERS[ci].qs]).slice(0, n).forEach((q) => qs.push({ ci, q }));
    });
    shuffle(qs);
    const penalty = (S.stress > 75 ? 0.12 : 0) + (S.energy < 25 ? 0.1 : 0);
    E = {
      i: 0, score: 0, qs,
      timePer: clamp(8 + S.energy * 0.095, 8, 17.5) * (S.late ? 0.72 : 1),
      items: qs.map(({ ci, q }) => {
        const clarity = clamp(S.ch[ci] / 80 - penalty, 0.04, 1);
        const opts = shuffle(q.slice(1).map((txt, k) => ({ txt, correct: k === 0 })));
        return {
          ci, clarity,
          qHtml: garble(q[0], (1 - clarity) * 0.75),
          opts: opts.map((o) => ({ ...o, html: garble(o.txt, (1 - clarity) * 0.92) })),
        };
      }),
      log: [],
    };
    showScreen('exam');
    $('.exam-paper').classList.toggle('stressed', S.stress > 75);
    Sfx.bell();
    if (suggNote) setTimeout(() => toast(suggNote, 3600), 500);
    else if (S.late) setTimeout(() => toast('You arrived 25 minutes late. Less time per question!', 3200), 500);
    await sleep(700);
    showQuestion();
  }

  let examTimer = 0, examKey = null;
  function showQuestion() {
    const it = E.items[E.i];
    $('#exam-q').textContent = `Q ${E.i + 1} / ${E.items.length}`;
    $('#exam-score').textContent = `${E.score} correct`;
    $('#exam-chapter').textContent = `${CHAPTERS[it.ci].ico} ${CHAPTERS[it.ci].name}${it.clarity < 0.35 ? ' · never seen this' : it.clarity > 0.85 ? ' · you know this!' : ''}`;
    $('#exam-question').innerHTML = it.qHtml;
    $('#exam-hint').textContent = '';
    const wrap = $('#exam-options'); wrap.innerHTML = '';
    it.opts.forEach((o, k) => {
      const b = document.createElement('button'); b.className = 'opt';
      b.innerHTML = `<span class="k">${k + 1}</span><span>${o.html}</span>`;
      b.addEventListener('click', () => answer(k));
      wrap.appendChild(b);
    });
    const start = performance.now(), total = E.timePer * 1000;
    let answered = false;
    E.answered = () => answered;
    E.mark = () => { answered = true; };
    cancelAnimationFrame(examTimer);
    const tick = (now) => {
      if (answered) return;
      const k = clamp(1 - (now - start) / total, 0, 1);
      $('#exam-timer-fill').style.width = `${k * 100}%`;
      if (k <= 0) { answer(-1); return; }
      examTimer = requestAnimationFrame(tick);
    };
    examTimer = requestAnimationFrame(tick);
  }

  function answer(k) {
    if (!E || E.answered()) return;
    E.mark();
    const it = E.items[E.i];
    const btns = $$('.opt');
    btns.forEach((b, i) => {
      b.disabled = true;
      if (it.opts[i].correct) { b.classList.add('correct'); b.querySelector('span:last-child').textContent = it.opts[i].txt; }
    });
    const right = k >= 0 && it.opts[k].correct;
    if (k >= 0 && !right) btns[k].classList.add('wrong');
    if (right) { E.score++; Sfx.good(); } else Sfx.bad();
    let hint;
    if (k < 0) hint = 'Time\'s up! Pen still in the air. ⌛';
    else if (right && it.clarity < 0.4) hint = pick(['Pure guess. Pure luck. 🍀', 'Eeny meeny miny… correct?!', 'The universe owed you one.']);
    else if (right) hint = pick(['Easy. You actually read this!', 'Remembered it from last night. 😎', 'That candle-light studying paid off.']);
    else if (it.clarity < 0.4) hint = pick(['You have never seen this chapter in your life.', 'Was this even in the syllabus?!', 'Looked at the friend\'s paper. They didn\'t know either.']);
    else hint = pick(['ARGH. You knew this one!', 'Silly mistake. It will haunt you tonight.', 'So close. Brain.exe stopped working.']);
    $('#exam-hint').textContent = hint;
    $('#exam-score').textContent = `${E.score} correct`;
    E.log.push(right);
    setTimeout(() => {
      E.i++;
      if (E.i >= E.items.length) finishExam(); else showQuestion();
    }, 1500);
  }

  document.addEventListener('keydown', (e) => {
    if (!screens.exam.classList.contains('active') || !E) return;
    const n = parseInt(e.key, 10);
    if (n >= 1 && n <= 4) answer(n - 1);
  });

  // ---------- result ----------
  const GRADES = [
    [80, 'A+', 'g-top', 'GOLDEN A+! Your relatives will hear about this at every dawat for 10 years. One night. Legend.'],
    [70, 'A', 'g-top', 'An A! Not bad for someone who opened the book at 9 PM. Ammu is making payesh.'],
    [60, 'A-', 'g-mid', 'A-minus. Respectable. You\'ll tell people it was "just one night" and they won\'t believe you.'],
    [50, 'B', 'g-mid', 'A solid B. Abbu says "hmm". That\'s it. Just "hmm".'],
    [40, 'C', 'g-mid', 'A C. You passed! Barely, but a pass is a pass. Treat yourself to fuchka.'],
    [33, 'D', 'g-low', 'D — saved by grace marks. Sir looked at your paper, sighed, and gave you 3 numbers out of pity.'],
    [0, 'F', 'g-low', 'F. The paper looked like a foreign language. Next time… maybe start at 8 PM? 💀'],
  ];

  function finishExam() {
    let marks = E.score * 10;
    let grace = false;
    if (marks === 30) { marks = 33; grace = true; }
    const g = GRADES.find(([min]) => marks >= min);
    showScreen('result');
    const gEl = $('#grade');
    gEl.textContent = g[1]; gEl.className = `grade ${g[2]}`;
    setTimeout(() => Sfx.stamp(), 400);
    $('#result-marks').textContent = `${E.score}/10 correct · ${marks} marks${grace ? ' (incl. 3 grace)' : ''} · prepared ${Math.round(avgKnow())}%`;
    $('#result-epilogue').textContent = g[3];
    const hrs = (S.slept / 60).toFixed(1);
    $('#result-stats').innerHTML = [
      [S.cups, 'cups of cha'], [hrs, 'hours slept'], [S.swiped, 'notifs swiped'], [S.phone, 'phone checks'],
    ].map(([v, l]) => `<div class="stat"><b>${v}</b><span>${l}</span></div>`).join('');

    const ach = [];
    if (S.cups >= 5) ach.push('☕ Cha-holic');
    if (S.candleStudy) ach.push('🕯️ Candlelight scholar');
    if (S.awakeSunrise) ach.push('🌅 Watched the sunrise');
    if (S.slept >= 240) ach.push('😴 Actually slept');
    if (S.phone >= 3) ach.push('📱 Doomscroller');
    if (S.bestFocus >= 99) ach.push('🔥 Locked in');
    if (S.ch.every((v) => v >= 70)) ach.push('🧠 Syllabus complete');
    if (S.sugg && S.sugg.believed && !S.sugg.real) ach.push('🤡 Fell for the fake suggestion');
    if (S.sugg && S.sugg.believed && S.sugg.real) ach.push('📩 Trusted the leak');
    if (S.passouts) ach.push('💀 Desk pillow');
    if (S.mosquitoWin) ach.push('🦟 Mosquito slayer');
    if (S.catPet) ach.push('🐈 Cat therapy');
    if (S.late) ach.push('⏰ Late entry');
    if (E.score === 10) ach.push('💯 Perfect paper');
    $('#achievements').innerHTML = ach.map((a, i) => `<span class="ach" style="animation-delay:${0.6 + i * 0.08}s">${a}</span>`).join('');

    const best = parseInt(store.get('nbe-best') || '-1', 10);
    if (marks > best) { store.set('nbe-best', String(marks)); store.set('nbe-best-grade', g[1]); }
    E.result = { grade: g[1], marks };
  }

  // ---------- title / wiring ----------
  function renderBest() {
    const b = store.get('nbe-best-grade');
    $('#best-score').textContent = b ? `Your best: ${b} (${store.get('nbe-best')} marks)` : '';
  }

  function start() {
    S = fresh();
    E = null;
    $('#log').innerHTML = '';
    $('#cups').innerHTML = '';
    $('#room').classList.remove('shake');
    showScreen('game');
    render();
    log('Realised the exam is TOMORROW. Not next week. Tomorrow. 😨', 'bad');
    setTimeout(() => toast('Tip: sleep matters — tired brains read questions worse.', 3200), 700);
  }

  async function howTo() {
    await modal({
      icon: '📚', title: 'How to play',
      body: `<ul class="how">
        <li>You have <b>12 hours</b> (9 PM → 9 AM). Every action costs time.</li>
        <li><b>Study</b> a chapter in a 15-second focus session: hold the page to read, tap notifications away, grab golden words, and splash water when you get sleepy.</li>
        <li>Low <b>energy</b> or high <b>stress</b> make studying less effective. Cha, food, naps and deep breaths help — but cost time.</li>
        <li>Random things happen. Load shedding. Ammu. Fake "suggestions". Mosquitoes.</li>
        <li>In the exam, chapters you didn't study look <b>scrambled</b>. Sleeping before the exam gives you more time per question.</li>
      </ul>`,
      choices: [{ label: 'Got it — let\'s go', primary: true, value: true }],
    });
  }

  async function share() {
    const r = E && E.result;
    const text = r ? `I got ${r.grade} (${r.marks} marks) in Night Before Exam after ${S.cups} cups of cha 📚☕ Can you survive the night?` : 'Night Before Exam — can you survive the night?';
    const url = location.href.split('#')[0];
    try {
      if (navigator.share) { await navigator.share({ title: 'Night Before Exam', text, url }); return; }
      await navigator.clipboard.writeText(`${text} ${url}`);
      toast('Copied to clipboard! Paste it in the group chat.');
    } catch (e) { toast('Could not share — screenshot it instead! 📸'); }
  }

  function syncMute() { $$('[data-mute]').forEach((b) => { b.textContent = Sfx.muted ? '🔇' : '🔊'; }); }

  $('#btn-start').addEventListener('click', () => { Sfx.click(); start(); });
  $('#btn-how').addEventListener('click', () => { Sfx.click(); howTo(); });
  $('#btn-again').addEventListener('click', () => { Sfx.click(); start(); });
  $('#btn-share').addEventListener('click', share);
  $$('[data-mute]').forEach((b) => b.addEventListener('click', () => { Sfx.toggle(); syncMute(); }));
  $('#actions').addEventListener('click', (e) => { const b = e.target.closest('.action'); if (b && !b.disabled) doAction(b.dataset.id); });

  syncMute();
  renderBest();
})();
