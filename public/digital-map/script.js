/* ===== St. Lorenzo Ruiz Parish – Digital Map =====
   All coordinates are in "map pixels" of digitalmap.png (1288 x 816).
   Everything (objects, trees, routes, pins) lives inside one .map-world element,
   so it all moves and zooms together and stays fixed in place. */

(function () {
  'use strict';

  const MAP_W = 1288;
  const MAP_H = 816;
  const MAX_ZOOM_FACTOR = 6;       // max zoom = fit zoom x 6

  /* ---------------------------------------------------------------
     DATA
  --------------------------------------------------------------- */

  // Where visitors start (the entrance at the bottom of the road)
  const GATE = { x: 776, y: 807 };

  // Lane waypoints just above the road (left lane / right lane of the cobbled path)
  const L = [[748, 756], [703, 695], [691, 637], [707, 539], [723, 462]];
  const R = [[809, 756], [858, 695], [870, 646], [846, 531], [846, 462]];

  // Place objects (x, y, w, h = where each PNG sits on the map, in map pixels)
  // poly  = hover/click shape in % of the image (so only the real shape reacts)
  // pin   = where the small pin's tip touches the object
  // side  = which side of the pin its name is written on
  // back  = true keeps the object behind everything else (Mt. Baklas)
  const PLACES = [
    {
      id: 'mtbaklas', name: 'Mt. Baklas', pinName: 'Mt. Baklas', color: '#7ee07a',
      desc: 'The mountain behind the parish',
      img: 'images/mtbaklas.png',
      back: true,
      x: 365.7, y: -31.1, w: 735.8, h: 254.6,
      poly: [[0.9, 91.8], [99.8, 87.7], [99.8, 57.5], [80.1, 28.1], [69.7, 21.9], [60.4, 30.1], [55.2, 18.5], [46.9, 13.0], [38.9, 39.0], [34.4, 44.5], [31.0, 54.8]],
      pin: { x: 771, y: 46 }, side: 'left',
      route: [[776, 807]].concat([[748, 756], [703, 695], [691, 637], [707, 539], [723, 462]], [[654, 400], [588, 327], [588, 245], [637, 180], [665, 125], [705, 86], [742, 64], [771, 58]])
    },
    {
      id: 'court', name: 'Court', pinName: 'Basketball Court', color: '#ff6a3d',
      desc: 'Basketball court',
      img: 'images/court.png',
      x: 35.5, y: 393.8, w: 604.0, h: 228.0,
      poly: [[1.1, 89.4], [96.0, 91.4], [99.1, 18.7], [93.3, 17.9], [91.6, 3.4], [90.6, 17.9], [22.1, 17.8], [21.3, 3.2], [15.5, 20.8], [15.5, 33.7]],
      pin: { x: 369, y: 518 }, side: 'left',
      route: [[776, 807], [748, 756], [690, 700], [646, 640], [590, 578], [500, 550], [420, 540], [372, 538]]
    },
    {
      id: 'forecourt', name: 'Forecourt', pinName: 'Forecourt', color: '#b388ff',
      desc: 'Plaza with the parish statue',
      img: 'images/foreocourt.png',
      x: 648.4, y: 251.7, w: 235.4, h: 117.0,
      poly: [[86.5, 62.2], [83.1, 54.1], [68.5, 43.5], [66.4, 45.0], [67.1, 41.2], [61.8, 36.0], [52.6, 36.9], [53.2, 30.4], [50.4, 20.5], [48.0, 30.0], [48.8, 38.1], [47.5, 40.5], [46.6, 36.0], [44.0, 34.2], [39.7, 37.8], [36.5, 37.2], [31.8, 44.6], [26.2, 43.7], [26.0, 46.6], [22.5, 47.7], [14.9, 56.8], [13.9, 68.9], [18.6, 77.5], [28.1, 82.7], [63.2, 84.7], [82.6, 77.7], [86.2, 71.6]],
      pin: { x: 768, y: 274 }, side: 'right',
      route: [[776, 807]].concat([[748, 756], [703, 695], [691, 637], [707, 539], [723, 462]], [[735, 410], [752, 372], [766, 338]])
    },
    {
      id: 'bathroom', name: 'Bathroom', pinName: 'Bathroom', color: '#35d9ff',
      desc: 'Restrooms',
      img: 'images/bathroom.png',
      x: 934.2, y: 204.3, w: 257.6, h: 143.6,
      poly: [[14.4, 21.8], [18.9, 25.7], [18.9, 36.6], [14.4, 42.6], [64.4, 86.1], [78.9, 80.2], [86.7, 74.3], [84.4, 71.3], [86.1, 53.5], [87.8, 51.5], [79.4, 43.6], [32.2, 10.9]],
      pin: { x: 1073, y: 247 }, side: 'right',
      route: [[776, 807]].concat([[809, 756], [858, 695], [870, 646], [846, 531], [846, 462]], [[895, 413], [960, 376], [1017, 350], [1050, 332]])
    },
    {
      id: 'belltower', name: 'Belltower', pinName: 'Bell Tower', color: '#ff5fa8',
      desc: 'Parish bell tower',
      img: 'images/belltower.png',
      x: 882.4, y: 35.5, w: 137.7, h: 198.4,
      poly: [[49.6, 2.4], [46.1, 7.2], [33.0, 16.3], [35.7, 18.1], [35.7, 33.1], [31.3, 59.6], [30.4, 90.4], [27.8, 92.2], [40.9, 97.0], [73.0, 94.6], [70.4, 90.4], [70.4, 71.1], [67.0, 56.0], [67.0, 42.8], [64.3, 41.6], [63.5, 18.1], [66.1, 16.3], [51.3, 6.0]],
      pin: { x: 961, y: 56 }, side: 'right',
      route: [[776, 807]].concat([[809, 756], [858, 695], [870, 646], [846, 531], [846, 462]], [[887, 396], [924, 335], [952, 278], [963, 238]])
    },
    {
      id: 'church', name: 'Church', pinName: 'Church', color: '#ffe14a',
      desc: 'St. Lorenzo Ruiz Parish Church',
      img: 'images/church.png',
      x: 618.8, y: 74.0, w: 296.1, h: 199.9,
      poly: [[8.7, 33.3], [12.7, 36.3], [11.5, 43.3], [6.8, 45.5], [5.4, 50.9], [8.4, 51.1], [5.9, 66.4], [9.1, 67.2], [8.9, 80.8], [25.2, 82.2], [0.0, 92.7], [0.0, 99.8], [99.8, 99.8], [99.8, 86.9], [75.8, 82.0], [76.3, 67.9], [82.0, 79.8], [83.4, 70.8], [87.8, 71.0], [90.9, 79.3], [91.1, 66.2], [94.2, 65.5], [89.5, 58.9], [89.6, 49.1], [93.1, 49.1], [82.0, 41.1], [71.2, 26.5], [47.0, 12.4], [33.6, 19.0], [36.4, 15.6], [33.6, 15.1], [33.1, 10.5], [32.8, 14.8], [29.7, 15.8], [32.6, 20.0]],
      pin: { x: 768, y: 124 }, side: 'right',
      route: [[776, 807]].concat([[748, 756], [703, 695], [691, 637], [707, 539], [723, 462]], [[654, 404], [639, 335], [678, 292], [715, 268], [742, 262]])
    },
    {
      id: 'foodstall', name: 'Food Stall (Left)', pinName: 'Food Stall', color: '#5b8cff', legendName: 'Food Stall (Left)',
      desc: 'Food stalls beside the court',
      img: 'images/foodstall.png',
      x: 365.7, y: 565.5, w: 205.8, h: 164.3,
      poly: [[5.1, 40.0], [5.1, 43.6], [8.0, 46.4], [9.4, 67.3], [63.8, 68.2], [64.5, 66.4], [67.4, 66.4], [68.1, 68.2], [94.9, 68.2], [95.7, 65.5], [99.3, 62.7], [97.1, 60.9], [95.7, 24.5], [43.5, 25.5], [23.2, 22.7], [13.8, 26.4], [13.0, 30.9]],
      pin: { x: 503, y: 597 }, side: 'left',
      route: [[776, 807], [745, 776], [690, 738], [610, 708], [540, 695], [474, 690]]
    },
    {
      id: 'foodstall2', name: 'Food Stall (Right)', pinName: 'Food Stall', color: '#5b8cff', legendName: 'Food Stall (Right)',
      desc: 'Food stalls beside the palms',
      img: 'images/foodstall.png',
      x: 935.7, y: 550.7, w: 205.8, h: 164.3,
      poly: [[5.1, 40.0], [5.1, 43.6], [8.0, 46.4], [9.4, 67.3], [63.8, 68.2], [64.5, 66.4], [67.4, 66.4], [68.1, 68.2], [94.9, 68.2], [95.7, 65.5], [99.3, 62.7], [97.1, 60.9], [95.7, 24.5], [43.5, 25.5], [23.2, 22.7], [13.8, 26.4], [13.0, 30.9]],
      pin: { x: 1073, y: 579 }, side: 'right',
      route: [[776, 807], [815, 778], [880, 745], [965, 712], [1030, 692], [1044, 680]]
    }
  ];

  // The 8 trees (same tree.png, placed as in final6.png)
  const TREES = [
    { x: 1052.6, y: 347.9, w: 213.2, h: 177.7 },
    { x: 130.3, y: 268.0, w: 192.5, h: 160.4 },
    { x: 485.6, y: 125.8, w: 142.1, h: 118.4 },
    { x: 355.3, y: 262.0, w: 192.5, h: 160.4 },
    { x: 879.4, y: 293.1, w: 192.5, h: 160.4 },
    { x: 914.9, y: 421.9, w: 192.5, h: 160.4 },
    { x: 226.5, y: 161.4, w: 223.5, h: 186.3 },
    { x: 988.9, y: 127.3, w: 127.3, h: 106.1 }
  ];

  // Road name painted on the asphalt (map pixels; moves and scales with the map)
  const ROAD_LABEL = { text: 'TAYSAN - LOBO ROAD', x: 608.5, baseline: 769, width: 304, size: 17, lineY: 771, lineH: 3 };

  /* ---------------------------------------------------------------
     ELEMENTS
  --------------------------------------------------------------- */
  const $ = (id) => document.getElementById(id);
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const routeMasks = {};
  const panel = $('mapPanel');
  const viewport = $('viewport');
  const world = $('world');
  const tooltip = $('tooltip');
  const legendList = $('legendList');
  const legendStatus = $('legendStatus');

  const NS = 'http://www.w3.org/2000/svg';
  const svgEl = (name, attrs) => {
    const el = document.createElementNS(NS, name);
    for (const k in attrs) el.setAttribute(k, attrs[k]);
    return el;
  };
  const pct = (v, total) => (v / total * 100) + '%';

  /* ---------------------------------------------------------------
     BUILD THE MAP (layers back -> front)
     1. base map  2. trees + places (sorted by their bottom edge)
     3. routes    4. pins (always on top)
  --------------------------------------------------------------- */
  const objEls = {};   // id -> .obj element
  const pinEls = {};   // id -> .pin element
  const routeEls = {}; // id -> <g>

  function buildRoadLabel() {
    const r = ROAD_LABEL;
    const svg = svgEl('svg', { class: 'road-label', viewBox: '0 0 ' + MAP_W + ' ' + MAP_H, 'aria-hidden': 'true' });
    svg.style.zIndex = '0';
    const t = svgEl('text', { x: r.x + r.width / 2, y: r.baseline, 'font-size': r.size, 'text-anchor': 'middle' });
    t.textContent = r.text;
    svg.appendChild(t);
    world.appendChild(svg);
  }

  /* ---------------------------------------------------------------
     SKY LIFE: soft drifting clouds + small flying birds.
     Added inside the map world (map pixels), so they zoom and pan with
     the map and never stay fixed on screen. Pure CSS animation, no
     pointer events, and kept to the sky so the view is never blocked.
  --------------------------------------------------------------- */
  const CLOUDS = [
    // y = top (map px), w = width, o = opacity, dur = seconds to cross, delay (negative = already in flight)
    { y: 6,   w: 260, o: 0.30, dur: 190, delay: -20  },
    { y: 52,  w: 190, o: 0.24, dur: 150, delay: -95  },
    { y: 14,  w: 320, o: 0.22, dur: 230, delay: -150 },
    { y: 96,  w: 220, o: 0.18, dur: 200, delay: -60  },
    { y: 30,  w: 150, o: 0.26, dur: 170, delay: -130 }
  ];
  const BIRDS = [
    // y/y2 = start/end height (map px), dur = seconds to cross, left = flies right-to-left
    { y: 70,  y2: 40,  dur: 34, delay: -6,  size: 1,    bob: 2.6, flap: 0.5 },
    { y: 48,  y2: 78,  dur: 42, delay: -27, size: 0.8,  bob: 3.1, flap: 0.6, left: true },
    { y: 100, y2: 64,  dur: 50, delay: -14, size: 0.65, bob: 2.3, flap: 0.45 },
    { y: 28,  y2: 52,  dur: 38, delay: -33, size: 0.75, bob: 2.9, flap: 0.55, left: true }
  ];

  function cloudSvg() {
    return '<svg viewBox="0 0 200 70" preserveAspectRatio="none" aria-hidden="true">' +
      '<g fill="#ffffff"><ellipse cx="60" cy="46" rx="48" ry="17"/><ellipse cx="108" cy="38" rx="44" ry="22"/>' +
      '<ellipse cx="146" cy="48" rx="40" ry="16"/><ellipse cx="86" cy="30" rx="28" ry="16"/></g></svg>';
  }
  function birdSvg() {
    return '<svg viewBox="0 0 26 14" aria-hidden="true">' +
      '<path class="wing l" d="M13 9 Q8 1 1 4"/><path class="wing r" d="M13 9 Q18 1 25 4"/>' +
      '<ellipse class="body" cx="13" cy="9.5" rx="2.6" ry="1.8"/></svg>';
  }

  function buildSky() {
    const clouds = document.createElement('div');
    clouds.className = 'sky-layer sky-clouds';
    clouds.setAttribute('aria-hidden', 'true');
    CLOUDS.forEach((c, i) => {
      const el = document.createElement('div');
      el.className = 'cloud';
      el.style.width = c.w + 'px';
      el.style.height = (c.w * 0.35) + 'px';
      el.style.setProperty('--y', c.y + 'px');
      el.style.setProperty('--o', c.o);
      el.style.setProperty('--dur', c.dur + 's');
      el.style.setProperty('--delay', c.delay + 's');
      el.style.setProperty('--x0', (80 + i * 230) + 'px');
      el.innerHTML = cloudSvg();
      clouds.appendChild(el);
    });

    const birds = document.createElement('div');
    birds.className = 'sky-layer sky-birds';
    birds.setAttribute('aria-hidden', 'true');
    BIRDS.forEach((b) => {
      const el = document.createElement('div');
      el.className = 'bird' + (b.left ? ' to-left' : '');
      el.style.width = (26 * b.size) + 'px';
      el.style.height = (14 * b.size) + 'px';
      el.style.setProperty('--y', b.y + 'px');
      el.style.setProperty('--y2', b.y2 + 'px');
      el.style.setProperty('--dur', b.dur + 's');
      el.style.setProperty('--delay', b.delay + 's');
      el.style.setProperty('--bob', b.bob + 's');
      el.style.setProperty('--flap', b.flap + 's');
      el.innerHTML = '<span class="bird-bob">' + birdSvg() + '</span>';
      birds.appendChild(el);
    });

    world.appendChild(clouds);
    world.appendChild(birds);
  }

  function buildObjects() {
    buildRoadLabel();
    buildSky();
    const items = [];
    TREES.forEach((t) => items.push({ kind: 'tree', data: t, bottom: t.y + t.h }));
    PLACES.forEach((p) => items.push({ kind: 'place', data: p, bottom: p.back ? -1 : p.y + p.h }));
    items.sort((a, b) => a.bottom - b.bottom);

    items.forEach((it, i) => {
      const d = it.data;
      const box = document.createElement('div');
      box.style.left = pct(d.x, MAP_W);
      box.style.top = pct(d.y, MAP_H);
      box.style.width = pct(d.w, MAP_W);
      box.style.height = pct(d.h, MAP_H);
      box.style.zIndex = String(i + 1);
      box.style.setProperty('--reveal-delay', (80 + i * 45) + 'ms');

      if (it.kind === 'tree') {
        box.className = 'tree';
        box.innerHTML = '<img data-map-src="images/tree.png" alt="" draggable="false">';
      } else {
        box.className = 'obj';
        box.dataset.place = d.id;
        box.style.setProperty('--c', d.color);
        box.innerHTML = '<img data-map-src="' + d.img + '" alt="' + d.name + '" draggable="false">';
        const svg = svgEl('svg', { class: 'hit', viewBox: '0 0 100 100', preserveAspectRatio: 'none' });
        const poly = svgEl('polygon', { points: d.poly.map((p) => p.join(',')).join(' ') });
        poly.dataset.place = d.id;
        svg.appendChild(poly);
        box.appendChild(svg);
        objEls[d.id] = box;
      }
      world.appendChild(box);
    });
  }

  // Smooth path through points (Catmull-Rom -> cubic Bezier)
  function smoothPath(pts) {
    let d = 'M' + pts[0][0] + ' ' + pts[0][1];
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i - 1] || pts[i];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[i + 2] || p2;
      const c1x = p1[0] + (p2[0] - p0[0]) / 6;
      const c1y = p1[1] + (p2[1] - p0[1]) / 6;
      const c2x = p2[0] - (p3[0] - p1[0]) / 6;
      const c2y = p2[1] - (p3[1] - p1[1]) / 6;
      d += ' C' + [c1x, c1y, c2x, c2y, p2[0], p2[1]].map((n) => n.toFixed(1)).join(' ');
    }
    return d;
  }

  function buildRoutes() {
    const svg = svgEl('svg', { class: 'routes', viewBox: '0 0 ' + MAP_W + ' ' + MAP_H });
    svg.style.zIndex = '100';
    const defs = svgEl('defs', {});
    svg.appendChild(defs);
    PLACES.forEach((p) => {
      const g = svgEl('g', { visibility: 'hidden' });
      g.style.setProperty('--rc', p.color);
      const d = smoothPath(p.route);
      const mask = svgEl('mask', { id: 'trace-' + p.id, maskUnits: 'userSpaceOnUse', x: -50, y: -50, width: MAP_W + 100, height: MAP_H + 100 });
      const reveal = svgEl('path', { class: 'route-reveal', d, pathLength: 1 });
      mask.appendChild(reveal);
      defs.appendChild(mask);
      routeMasks[p.id] = reveal;
      const lines = svgEl('g', { mask: 'url(#trace-' + p.id + ')' });
      lines.appendChild(svgEl('path', { class: 'route-under', d }));
      lines.appendChild(svgEl('path', { class: 'route-line', d }));
      g.appendChild(lines);
      const end = p.route[p.route.length - 1];
      g.appendChild(svgEl('circle', { class: 'route-ring', cx: GATE.x, cy: GATE.y, r: 9 }));
      g.appendChild(svgEl('circle', { class: 'route-start', cx: GATE.x, cy: GATE.y, r: 8 }));
      g.appendChild(svgEl('circle', { class: 'route-ring', cx: end[0], cy: end[1], r: 9 }));
      g.appendChild(svgEl('circle', { class: 'route-end', cx: end[0], cy: end[1], r: 8 }));
      svg.appendChild(g);
      routeEls[p.id] = g;
    });
    world.appendChild(svg);
  }

  function pinMarkup(name, color) {
    return (
      '<div class="pin-inner">' +
        '<svg viewBox="0 0 44 58" aria-hidden="true">' +
          '<path d="M22 57C22 57 3 36 3 21a19 19 0 0 1 38 0c0 15-19 36-19 36Z" fill="' + color + '" stroke="#fff" stroke-width="3" stroke-linejoin="round"/>' +
          '<circle cx="22" cy="21" r="7.5" fill="#fff"/>' +
          '<circle cx="22" cy="21" r="3.4" fill="#0a1d1e"/>' +
        '</svg>' +
        '<span class="pin-label">' + name + '</span>' +
      '</div>'
    );
  }

  function buildPins() {
    PLACES.forEach((p, i) => {
      const pin = document.createElement('div');
      pin.className = 'pin side-' + (p.side || 'top');
      pin.dataset.place = p.id;
      pin.style.left = pct(p.pin.x, MAP_W);
      pin.style.top = pct(p.pin.y, MAP_H);
      pin.style.zIndex = '200';
      pin.style.setProperty('--c', p.color);
      pin.innerHTML = pinMarkup(p.pinName, p.color);
      pin.style.setProperty('--pin-delay', (650 + i * 90) + 'ms');
      const target = pin.querySelector('.pin-inner');
      target.tabIndex = 0;
      target.setAttribute('role', 'button');
      target.setAttribute('aria-label', 'Show route to ' + (p.legendName || p.pinName));
      target.setAttribute('aria-pressed', 'false');
      target.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          e.stopPropagation();
          select(p.id);
        }
      });
      target.addEventListener('focus', () => setHover(p.id));
      target.addEventListener('blur', () => setHover(null));
      pin.querySelectorAll('*').forEach((n) => (n.dataset.place = p.id));
      world.appendChild(pin);
      pinEls[p.id] = pin;
    });

    pinEls.gate = { style: {}, classList: { toggle() {} } };   // no gate label: the pulsing start dot marks it
  }

  function buildLegend() {
    const order = ['church', 'forecourt', 'belltower', 'court', 'bathroom', 'foodstall', 'foodstall2', 'mtbaklas'];
    const iconPaths = {
      church: 'M12 2v6m-3-3h6M4 21V11l8-5 8 5v10H4Zm5 0v-7h6v7',
      forecourt: 'M3 21h18M5 18V9h14v9M3 9l9-6 9 6M9 12v4m6-4v4',
      belltower: 'M7 21h10M8 21V9l4-5 4 5v12M8 10h8M10 16h4m-2-6v4',
      court: 'M3 5h18v14H3V5Zm9 0v14M3 10h4v4H3m18-4h-4v4h4M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6',
      bathroom: 'M12 3v18M5 4h1m-1 4h1M3 12l2-4 2 4m-2 0v8m12-16h1m-1 4h1m-3 6 3-6 3 6h-6Zm3 0v6',
      foodstall: 'M4 10v11h16V10M3 10l2-6h14l2 6H3Zm5 4v7m6-7h3m-6-10v6',
      foodstall2: 'M4 10v11h16V10M3 10l2-6h14l2 6H3Zm5 4v7m6-7h3m-6-10v6',
      mtbaklas: 'M2 20 10 5l5 9 3-5 5 11H2Zm5-9 3 2 3-2'
    };
    const icon = (id) => '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="' + iconPaths[id] + '"/></svg>';
    const subtitles = { church: 'A place for prayer', forecourt: 'Gather & connect', belltower: 'A parish landmark', court: 'Play & come together', bathroom: 'Comfort facilities', foodstall: 'A little refreshment', foodstall2: 'A little refreshment', mtbaklas: 'Nature on the horizon' };
    order.map((id) => PLACES.find((q) => q.id === id)).forEach((p) => {
      const li = document.createElement('li');
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'legend-btn';
      btn.dataset.place = p.id;
      btn.setAttribute('aria-pressed', 'false');
      btn.style.setProperty('--c', p.color);
      btn.innerHTML = '<span class="swatch" aria-hidden="true">' + icon(p.id) + '</span><span class="destination-copy">' + (p.legendName || p.pinName) + '<small>' + subtitles[p.id] + '</small></span><span class="destination-arrow" aria-hidden="true">↗</span>';
      btn.addEventListener('pointerenter', () => setHover(p.id));
      btn.addEventListener('pointerleave', () => setHover(null));
      btn.addEventListener('focus', () => setHover(p.id));
      btn.addEventListener('blur', () => setHover(null));
      btn.addEventListener('click', () => select(p.id));
      li.appendChild(btn);
      legendList.appendChild(li);
    });
  }

  /* ---------------------------------------------------------------
     VIEW (pan + zoom)
  --------------------------------------------------------------- */
  const view = { s: 1, x: 0, y: 0 };
  let minS = 0.3, maxS = 3, vw = 0, vh = 0;
  let anim = null;

  function measure() {
    vw = viewport.clientWidth;
    vh = viewport.clientHeight;
    const contain = Math.min(vw / MAP_W, vh / MAP_H);
    // phones: never show empty bars above/below the map
    minS = vw < 640 ? Math.max(contain, vh / MAP_H) : contain;
    maxS = Math.max(contain * MAX_ZOOM_FACTOR, 1.5);
  }

  function initialScale() {
    // desktop: whole map visible; phones: closer, so pins stay readable
    return vw < 640 ? Math.max(minS * 1.9, vh / MAP_H) : minS;
  }

  function clampView() {
    view.s = Math.min(maxS, Math.max(minS, view.s));
    const mw = MAP_W * view.s;
    const mh = MAP_H * view.s;
    view.x = mw <= vw ? (vw - mw) / 2 : Math.min(0, Math.max(vw - mw, view.x));
    view.y = mh <= vh ? (vh - mh) / 2 : Math.min(0, Math.max(vh - mh, view.y));
  }

  function apply() {
    clampView();
    world.style.transform = 'translate(' + view.x + 'px,' + view.y + 'px) scale(' + view.s + ')';
    // keep pins the same screen size while the map zooms
    world.style.setProperty('--inv', String(1 / view.s));
    $('zoomLevel').textContent = Math.round(view.s / minS * 100) + '%';
  }

  function zoomAt(cx, cy, factor) {
    const ns = Math.min(maxS, Math.max(minS, view.s * factor));
    const k = ns / view.s;
    view.x = cx - (cx - view.x) * k;
    view.y = cy - (cy - view.y) * k;
    view.s = ns;
    apply();
  }

  function resetView() {
    measure();
    view.s = initialScale();
    const focus = vw < 640 ? { x: 785, y: 392 } : { x: MAP_W / 2, y: MAP_H / 2 };
    view.x = vw / 2 - focus.x * view.s;
    view.y = vh / 2 - focus.y * view.s;
    apply();
  }

  function animateTo(target, ms) {
    cancelAnimationFrame(anim);
    if (reducedMotion.matches) {
      Object.assign(view, target);
      apply();
      return;
    }
    const from = { s: view.s, x: view.x, y: view.y };
    const t0 = performance.now();
    const ease = (t) => 1 - Math.pow(1 - t, 3);
    (function step(now) {
      const t = Math.min(1, (now - t0) / ms);
      const e = ease(t);
      view.s = from.s + (target.s - from.s) * e;
      view.x = from.x + (target.x - from.x) * e;
      view.y = from.y + (target.y - from.y) * e;
      apply();
      if (t < 1) anim = requestAnimationFrame(step);
    })(t0);
  }

  // If the route is not fully on screen, glide so it is.
  function frameRoute(p) {
    const pts = p.route.concat([[p.pin.x, p.pin.y - 70]]);
    const xs = pts.map((q) => q[0]), ys = pts.map((q) => q[1]);
    const x0 = Math.min.apply(null, xs), x1 = Math.max.apply(null, xs);
    const y0 = Math.min.apply(null, ys), y1 = Math.max.apply(null, ys);
    const pad = 70;
    const sx0 = x0 * view.s + view.x, sx1 = x1 * view.s + view.x;
    const sy0 = y0 * view.s + view.y, sy1 = y1 * view.s + view.y;
    if (sx0 >= pad / 2 && sy0 >= pad / 2 && sx1 <= vw - pad / 2 && sy1 <= vh - pad / 2) return;
    const s = Math.min(view.s, Math.min((vw - pad * 2) / (x1 - x0), (vh - pad * 2) / (y1 - y0)));
    const ns = Math.max(minS, s);
    const target = {
      s: ns,
      x: vw / 2 - ((x0 + x1) / 2) * ns,
      y: vh / 2 - ((y0 + y1) / 2) * ns
    };
    // clamp target the same way apply() would
    const mw = MAP_W * ns, mh = MAP_H * ns;
    target.x = mw <= vw ? (vw - mw) / 2 : Math.min(0, Math.max(vw - mw, target.x));
    target.y = mh <= vh ? (vh - mh) / 2 : Math.min(0, Math.max(vh - mh, target.y));
    animateTo(target, 600);
  }

  /* ---------------------------------------------------------------
     SELECTION (legend / pins / objects)
  --------------------------------------------------------------- */
  let activeId = null;

  function select(id) {
    const next = activeId === id ? null : id;
    activeId = next;

    PLACES.forEach((p) => {
      const on = p.id === next;
      routeEls[p.id].setAttribute('visibility', on ? 'visible' : 'hidden');
      objEls[p.id].classList.toggle('is-active', on);
      pinEls[p.id].classList.toggle('is-active', on);
      pinEls[p.id].querySelector('.pin-inner').setAttribute('aria-pressed', String(on));
      routeMasks[p.id].classList.remove('is-tracing');
      if (on) {
        routeMasks[p.id].getBoundingClientRect();
        routeMasks[p.id].classList.add('is-tracing');
      }
    });
    
    legendList.querySelectorAll('.legend-btn').forEach((b) => {
      b.setAttribute('aria-pressed', String(b.dataset.place === next));
    });

    if (next) {
      const p = PLACES.find((q) => q.id === next);
      $('routeTitle').textContent = p.legendName || p.pinName;
      legendStatus.innerHTML = 'Follow the highlighted path from the <strong>main gate</strong>.';
      $('clearRoute').hidden = false;
      if (!panel.classList.contains('map-unavailable')) frameRoute(p);
    } else {
      $('routeTitle').textContent = 'Your journey starts here';
      legendStatus.textContent = 'Every route begins at the main gate.';
      $('clearRoute').hidden = true;
    }
  }

  /* ---------------------------------------------------------------
     HOVER + TOOLTIP
  --------------------------------------------------------------- */
  let hoverId = null;

  function setHover(id, ev) {
    if (id !== hoverId) {
      if (hoverId) {
        objEls[hoverId].classList.remove('is-hover');
        pinEls[hoverId].classList.remove('is-hover');
      }
      hoverId = id;
      if (id) {
        objEls[id].classList.add('is-hover');
        pinEls[id].classList.add('is-hover');
        const p = PLACES.find((q) => q.id === id);
        tooltip.innerHTML = p.pinName + '<small>' + p.desc + '</small>';
      }
    }
    tooltip.classList.toggle('show', !!id && !!ev);
    if (id && ev) {
      const r = viewport.getBoundingClientRect();
      tooltip.style.left = Math.min(r.width - 110, Math.max(110, ev.clientX - r.left)) + 'px';
      tooltip.style.top = Math.max(60, ev.clientY - r.top) + 'px';
    }
  }

  /* ---------------------------------------------------------------
     POINTER INPUT: drag, pinch, wheel, keyboard
  --------------------------------------------------------------- */
  const pointers = new Map();
  let drag = null;       // { sx, sy, vx, vy, moved, placeId }
  let pinch = null;      // { dist, s }

  viewport.addEventListener('pointerdown', (e) => {
    if (e.target.closest('.map-controls')) return;
    cancelAnimationFrame(anim);
    viewport.setPointerCapture(e.pointerId);
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (pointers.size === 1) {
      const hit = e.target.closest('[data-place]');
      drag = { sx: e.clientX, sy: e.clientY, vx: view.x, vy: view.y, moved: 0, placeId: hit ? hit.dataset.place : null };
      viewport.classList.add('is-dragging');
      setHover(null);
    } else if (pointers.size === 2) {
      const [a, b] = [...pointers.values()];
      pinch = { dist: Math.hypot(a.x - b.x, a.y - b.y), s: view.s };
      drag = null;
    }
  });

  viewport.addEventListener('pointermove', (e) => {
    if (pointers.has(e.pointerId)) pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (pinch && pointers.size === 2) {
      const [a, b] = [...pointers.values()];
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      const r = viewport.getBoundingClientRect();
      const cx = (a.x + b.x) / 2 - r.left;
      const cy = (a.y + b.y) / 2 - r.top;
      zoomAt(cx, cy, (pinch.s * dist / pinch.dist) / view.s);
      return;
    }

    if (drag && pointers.size === 1) {
      const dx = e.clientX - drag.sx;
      const dy = e.clientY - drag.sy;
      drag.moved = Math.max(drag.moved, Math.hypot(dx, dy));
      if (drag.moved > 4) {
        view.x = drag.vx + dx;
        view.y = drag.vy + dy;
        apply();
      }
      return;
    }

    // plain hover (mouse only)
    if (e.pointerType === 'mouse' && pointers.size === 0) {
      const hit = e.target.closest('[data-place]');
      setHover(hit && objEls[hit.dataset.place] ? hit.dataset.place : null, e);
    }
  });

  function endPointer(e) {
    if (drag && pointers.size === 1 && e.type === 'pointerup' && drag.moved <= 4 && drag.placeId) {
      select(drag.placeId);
    }
    pointers.delete(e.pointerId);
    if (pointers.size < 2) pinch = null;
    if (pointers.size === 0) {
      drag = null;
      viewport.classList.remove('is-dragging');
    } else if (pointers.size === 1) {
      const [p] = [...pointers.values()];
      drag = { sx: p.x, sy: p.y, vx: view.x, vy: view.y, moved: 99, placeId: null };
    }
  }
  viewport.addEventListener('pointerup', endPointer);
  viewport.addEventListener('pointercancel', endPointer);
  viewport.addEventListener('pointerleave', (e) => { if (e.pointerType === 'mouse' && !drag) setHover(null); });

  viewport.addEventListener('wheel', (e) => {
    e.preventDefault();
    cancelAnimationFrame(anim);
    const r = viewport.getBoundingClientRect();
    const unit = e.deltaMode === 1 ? 16 : 1;
    zoomAt(e.clientX - r.left, e.clientY - r.top, Math.exp(-e.deltaY * unit * 0.0016));
  }, { passive: false });

  viewport.addEventListener('dblclick', (e) => {
    const r = viewport.getBoundingClientRect();
    zoomAt(e.clientX - r.left, e.clientY - r.top, 1.8);
  });

  viewport.addEventListener('keydown', (e) => {
    if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', '+', '=', '-', '_', '0'].includes(e.key)) {
      e.preventDefault();
      cancelAnimationFrame(anim);
    }
    const step = 60;
    const cx = vw / 2, cy = vh / 2;
    switch (e.key) {
      case 'ArrowLeft':  view.x += step; break;
      case 'ArrowRight': view.x -= step; break;
      case 'ArrowUp':    view.y += step; break;
      case 'ArrowDown':  view.y -= step; break;
      case '+': case '=': zoomAt(cx, cy, 1.25); return;
      case '-': case '_': zoomAt(cx, cy, 1 / 1.25); return;
      case '0': resetView(); return;
      default: return;
    }
    e.preventDefault();
    apply();
  });

  $('zoomIn').addEventListener('click', () => zoomAt(vw / 2, vh / 2, 1.35));
  $('zoomOut').addEventListener('click', () => zoomAt(vw / 2, vh / 2, 1 / 1.35));
  $('zoomReset').addEventListener('click', () => { cancelAnimationFrame(anim); resetView(); });

  /* ---------------------------------------------------------------
     OPEN / CLOSE + RESPONSIVE
  --------------------------------------------------------------- */
  $('helpBtn').addEventListener('click', () => {
    const opening = $('helpPanel').hidden;
    $('helpPanel').hidden = !opening;
    $('helpBtn').setAttribute('aria-expanded', String(opening));
  });
  function toggleExpanded(force) {
    const expanded = typeof force === 'boolean' ? force : !panel.classList.contains('is-expanded');
    panel.classList.toggle('is-expanded', expanded);
    document.body.classList.toggle('workspace-expanded', expanded);
    $('fullscreenBtn').setAttribute('aria-label', expanded ? 'Exit expanded map workspace' : 'Expand map workspace');
    $('fullscreenBtn').setAttribute('aria-pressed', String(expanded));
    $('fullscreenBtn').title = expanded ? 'Exit expanded map workspace' : 'Expand map workspace';
    requestAnimationFrame(() => {
      measure();
      if (activeId) frameRoute(PLACES.find((p) => p.id === activeId));
      else resetView();
    });
  }
  $('fullscreenBtn').addEventListener('click', () => toggleExpanded());
  $('clearRoute').addEventListener('click', () => { if (activeId) select(activeId); });
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (panel.classList.contains('is-expanded')) {
      toggleExpanded(false);
      $('fullscreenBtn').focus();
    } else if (activeId) select(activeId);
  });

  let lastW = 0, lastH = 0;
  new ResizeObserver(() => {
    if (panel.hidden) return;
    const w = viewport.clientWidth, h = viewport.clientHeight;
    if (w === lastW && h === lastH) return;
    const first = lastW === 0;
    // keep the same map point at the centre when the size changes
    const cxMap = (lastW / 2 - view.x) / view.s;
    const cyMap = (lastH / 2 - view.y) / view.s;
    const ratio = view.s / (minS || 1);
    measure();
    if (first) {
      resetView();
    } else {
      view.s = Math.max(minS, ratio * minS);
      view.x = w / 2 - cxMap * view.s;
      view.y = h / 2 - cyMap * view.s;
      apply();
    }
    lastW = w; lastH = h;
  }).observe(viewport);

  /* ---------------------------------------------------------------
     GO
  --------------------------------------------------------------- */
  buildObjects();
  buildRoutes();
  buildPins();
  buildLegend();
  resetView();

  // Load the original layers only after the base image is available.
  const base = $('mapBase');
  let baseHandled = false;
  function mapReady() {
    if (baseHandled) return;
    baseHandled = true;
    world.querySelectorAll('[data-map-src]').forEach((img) => {
      img.src = img.dataset.mapSrc;
      img.addEventListener('error', () => {
        $('mapState').textContent = 'Some map layers are missing';
      }, { once: true });
    });
    const images = [...world.querySelectorAll('img')];
    Promise.all(images.map((img) => img.decode().catch(() => {}))).then(() => {
      world.classList.add('scene-enter');
      setTimeout(() => world.classList.remove('scene-enter'), 2100);
    });
  }
  function mapMissing() {
    if (baseHandled) return;
    baseHandled = true;
    panel.classList.add('map-unavailable');
    $('assetNotice').hidden = false;
    $('mapState').textContent = 'Map images needed';
    ['zoomIn', 'zoomOut', 'zoomReset'].forEach((id) => { $(id).disabled = true; });
    viewport.setAttribute('aria-label', 'Map preview unavailable. Original PNG files need to be added to the images folder.');
  }
  base.addEventListener('load', mapReady, { once: true });
  base.addEventListener('error', mapMissing, { once: true });
  if (base.complete) {
    if (base.naturalWidth) mapReady();
    else mapMissing();
  }
})();
