// =============================================================
//  Einkaufsliste — App-Logik (originalgetreu zum Claude-Design)
//  Reines Vanilla-JS, kein Framework. State -> render() -> innerHTML.
// =============================================================

// ---------- Stammdaten ----------
const CATS = {
  'Obst & Gemüse':    { icon: 'ti-leaf',      keys: ['apfel','äpfel','banane','tomate','salat','karotte','zwiebel','knoblauch','kartoffel','paprika','gurke','spinat','zucchini','erdbeere','orange','birne','traube','weintraube','frühlingszwiebel'] },
  'Milch & Käse':     { icon: 'ti-droplet',   keys: ['milch','käse','joghurt','butter','sahne','quark','topfen','obers','rahm','mozarella','mozzarella','hafermilch','ei','eier'] },
  'Fleisch & Fisch':  { icon: 'ti-fish',      keys: ['fleisch','huhn','hähnchen','rind','schwein','fisch','lachs','thunfisch','wurst','schinken','steak','hack','putenfilet','faschiertes'] },
  'Getränke':         { icon: 'ti-glass-full',keys: ['wasser','saft','bier','wein','cola','limo','tee','kaffee','espresso','mineralwasser','limonade','energy'] },
  'Brot & Backwaren': { icon: 'ti-bread',     keys: ['brot','semmel','brötchen','toast','croissant','kuchen','gebäck','weckerl'] },
  'Süßes & Snacks':   { icon: 'ti-candy',     keys: ['schokolade','chips','keks','kekse','bonbons','gummibärchen','eis','riegel','müsliriegel'] },
  'Drogerie':         { icon: 'ti-heart',     keys: ['shampoo','zahnpasta','seife','deo','creme','toilettenpapier','klopapier','küchenrolle','taschentücher','waschmittel','spülmittel','rasierer','pflaster'] },
  'Sonstiges':        { icon: 'ti-package',   keys: [] }
};
const CAT_KEYS = Object.keys(CATS);

const CATALOG = {
  'Obst & Gemüse': [
    { name: 'Frühlingszwiebel', spec: '1 Bund' }, { name: 'Äpfel', spec: '1 kg' },
    { name: 'Bananen', spec: '5 Stück' }, { name: 'Tomaten', spec: '500 g' },
    { name: 'Karotten', spec: '1 kg' }, { name: 'Kartoffeln', spec: '2 kg' }, { name: 'Salat', spec: '1 Kopf' }
  ],
  'Milch & Käse': [
    { name: 'Milch', spec: '1 L' }, { name: 'Hafermilch', spec: '1 L' },
    { name: 'Vegane Sahne', spec: '200 ml' }, { name: 'Butter', spec: '250 g' },
    { name: 'Joghurt', spec: '500 g' }, { name: 'Gouda', spec: '200 g' }, { name: 'Eier', spec: '10 Stück' }
  ],
  'Fleisch & Fisch': [
    { name: 'Faschiertes', spec: '500 g' }, { name: 'Hähnchenbrust', spec: '600 g' },
    { name: 'Lachs', spec: '2 Filets' }, { name: 'Schinken', spec: '200 g' }
  ],
  'Getränke': [
    { name: 'Mineralwasser', spec: '6er Pack' }, { name: 'Orangensaft', spec: '1 L' },
    { name: 'Kaffee', spec: '500 g' }, { name: 'Bier', spec: '6er Träger' }
  ],
  'Brot & Backwaren': [
    { name: 'Vollkornbrot', spec: '1 Laib' }, { name: 'Semmeln', spec: '6 Stück' }, { name: 'Toast', spec: '1 Pkg' }
  ],
  'Süßes & Snacks': [
    { name: 'Schokolade', spec: '100 g' }, { name: 'Chips', spec: '1 Pkg' }, { name: 'Kekse', spec: '1 Pkg' }
  ],
  'Drogerie': [
    { name: 'Klopapier', spec: '10 Rollen' }, { name: 'Küchenrolle', spec: '4 Rollen' },
    { name: 'Taschentücher', spec: '10er Pack' }, { name: 'Zahnpasta', spec: '1 Tube' },
    { name: 'Shampoo', spec: '300 ml' }, { name: 'Spülmittel', spec: '500 ml' }
  ]
};

const INITIAL = [
  { n: 'Äpfel, 1 kg',          c: 'Obst & Gemüse',    done: false, q: 1, by: 'M' },
  { n: 'Bananen, 5 Stück',     c: 'Obst & Gemüse',    done: false, q: 1, by: 'L' },
  { n: 'Frühlingszwiebel, 1 Bund', c: 'Obst & Gemüse', done: false, q: 1, by: 'J' },
  { n: 'Milch, 1 L',           c: 'Milch & Käse',     done: false, q: 2, by: 'L' },
  { n: 'Butter, 250 g',        c: 'Milch & Käse',     done: false, q: 1, by: 'M' },
  { n: 'Eier, 10 Stück',       c: 'Milch & Käse',     done: false, q: 1, by: 'L' },
  { n: 'Vollkornbrot, 1 Laib', c: 'Brot & Backwaren', done: false, q: 1, by: 'J' },
  { n: 'Klopapier, 10 Rollen', c: 'Drogerie',         done: false, q: 1, by: 'M' }
];

const SEED_HISTORY = [
  { id: 1, week: 25, weekLabel: 'KW 25 · 15. Juni–21. Juni', dateLabel: 'Samstag, 21. Juni', by: 'L',
    items: [
      { n: 'Milch, 1 L', c: 'Milch & Käse', q: 2 }, { n: 'Butter, 250 g', c: 'Milch & Käse', q: 1 },
      { n: 'Bananen, 5 Stück', c: 'Obst & Gemüse', q: 1 }, { n: 'Klopapier, 10 Rollen', c: 'Drogerie', q: 1 },
      { n: 'Vollkornbrot, 1 Laib', c: 'Brot & Backwaren', q: 1 }, { n: 'Hafermilch, 1 L', c: 'Milch & Käse', q: 1 },
      { n: 'Faschiertes, 500 g', c: 'Fleisch & Fisch', q: 1 }
    ] },
  { id: 2, week: 24, weekLabel: 'KW 24 · 8. Juni–14. Juni', dateLabel: 'Sonntag, 14. Juni', by: 'M',
    items: [
      { n: 'Milch, 1 L', c: 'Milch & Käse', q: 1 }, { n: 'Klopapier, 10 Rollen', c: 'Drogerie', q: 1 },
      { n: 'Bananen, 5 Stück', c: 'Obst & Gemüse', q: 2 }, { n: 'Joghurt, 500 g', c: 'Milch & Käse', q: 3 },
      { n: 'Kaffee, 500 g', c: 'Getränke', q: 1 }
    ] },
  { id: 3, week: 23, weekLabel: 'KW 23 · 1. Juni–7. Juni', dateLabel: 'Samstag, 7. Juni', by: 'L',
    items: [
      { n: 'Milch, 1 L', c: 'Milch & Käse', q: 2 }, { n: 'Butter, 250 g', c: 'Milch & Käse', q: 1 },
      { n: 'Klopapier, 10 Rollen', c: 'Drogerie', q: 1 }, { n: 'Küchenrolle, 4 Rollen', c: 'Drogerie', q: 1 },
      { n: 'Vollkornbrot, 1 Laib', c: 'Brot & Backwaren', q: 1 }, { n: 'Hafermilch, 1 L', c: 'Milch & Käse', q: 1 }
    ] }
];

// ---------- Helfer ----------
const label = (p) => p.spec ? `${p.name}, ${p.spec}` : p.name;
const escH = (s) => String(s).replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
const escA = (s) => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function getWeekInfo() {
  const now = new Date();
  const onejan = new Date(now.getFullYear(), 0, 1);
  const week = Math.ceil(((now - onejan) / 86400000 + onejan.getDay() + 1) / 7);
  const start = new Date(now); start.setDate(now.getDate() - now.getDay() + 1);
  const end = new Date(start); end.setDate(start.getDate() + 6);
  const fmt = d => d.toLocaleDateString('de-AT', { day: 'numeric', month: 'long' });
  return { week, label: `KW ${week} · ${fmt(start)}–${fmt(end)}`, date: now };
}

function detect(name) {
  const nl = name.toLowerCase();
  for (const [cat, { keys }] of Object.entries(CATS)) {
    if (cat === 'Sonstiges') continue;
    if (keys.some(k => nl.includes(k))) return cat;
  }
  return 'Sonstiges';
}

// ---------- State ----------
const SHARED_KEYS = ['items', 'history', 'customProducts', 'removedLabels'];
const USER_KEY = 'einkauf:user';

let state = {
  screen: 'login',          // 'login' | 'app' | 'complete'
  tab: 'liste',             // 'liste' | 'auswahl' | 'uebersicht'
  user: '',
  items: [],
  qty: {},                  // transient: gewählte Stückzahl je Katalog-Label
  sessionFreq: {},          // transient: Adds dieser Sitzung
  justAdded: null,
  editCatalog: false,
  customProducts: [],
  removedLabels: [],
  history: [],
  finishedCount: 0,
  _t: null
};

const root = document.getElementById('root');
let pendingFocus = null;

function persistShared() {
  const data = {};
  SHARED_KEYS.forEach(k => data[k] = state[k]);
  if (window.Store) window.Store.push(data);
}

function setState(patch, opts = {}) {
  Object.assign(state, patch);
  if (!opts.fromRemote && Object.keys(patch).some(k => SHARED_KEYS.includes(k))) {
    persistShared();
  }
  if (opts.focus) pendingFocus = opts.focus;
  render();
}

// Fremd-Änderung von einem anderen Gerät übernehmen (ohne erneut zu pushen).
function applyRemote(data) {
  const patch = {};
  SHARED_KEYS.forEach(k => { if (data[k] !== undefined) patch[k] = data[k]; });
  setState(patch, { fromRemote: true });
}

// ---------- Aktionen ----------
function addToList(itemLabel, cat, qty) {
  const initial = (state.user || 'G').trim().charAt(0).toUpperCase() || 'G';
  const items = [...state.items];
  const existing = items.findIndex(it => it.n === itemLabel && !it.done);
  if (existing >= 0) {
    items[existing] = { ...items[existing], q: (items[existing].q || 1) + qty };
  } else {
    items.push({ n: itemLabel, c: cat, done: false, q: qty, by: initial });
  }
  const sessionFreq = { ...state.sessionFreq, [itemLabel]: (state.sessionFreq[itemLabel] || 0) + 1 };
  setState({ items, sessionFreq });
}

function addProduct(itemLabel, cat) {
  const q = state.qty[itemLabel] || 1;
  addToList(itemLabel, cat, q);
  setState({ qty: { ...state.qty, [itemLabel]: 1 }, justAdded: itemLabel });
  clearTimeout(state._t);
  state._t = setTimeout(() => setState({ justAdded: null }), 1000);
}

function addManual() {
  const el = document.getElementById('manualInput');
  const v = (el ? el.value : '').trim();
  if (!v) return;
  addToList(v, detect(v), 1);
  setState({}, { focus: 'manualInput' });
}

function addCustomProduct() {
  const nameEl = document.getElementById('prodName');
  const specEl = document.getElementById('prodSpec');
  const name = (nameEl ? nameEl.value : '').trim();
  if (!name) return;
  const spec = (specEl ? specEl.value : '').trim();
  const cat = detect(name);
  const lbl = spec ? `${name}, ${spec}` : name;
  const removedLabels = state.removedLabels.filter(l => l !== lbl);
  const exists = state.customProducts.some(p => label(p) === lbl);
  const customProducts = exists ? state.customProducts : [...state.customProducts, { name, spec, cat }];
  setState({ customProducts, removedLabels }, { focus: 'prodName' });
}

function removeProduct(lbl) {
  const customProducts = state.customProducts.filter(p => label(p) !== lbl);
  const removedLabels = customProducts.length !== state.customProducts.length
    ? state.removedLabels
    : [...state.removedLabels, lbl];
  setState({ customProducts, removedLabels });
}

function incQty(lbl) { setState({ qty: { ...state.qty, [lbl]: Math.min(99, (state.qty[lbl] || 1) + 1) } }); }
function decQty(lbl) { setState({ qty: { ...state.qty, [lbl]: Math.max(1, (state.qty[lbl] || 1) - 1) } }); }

function login() {
  const el = document.getElementById('loginInput');
  const name = (el ? el.value : '').trim() || 'Gast';
  try { localStorage.setItem(USER_KEY, name); } catch (_) {}
  setState({ user: name, screen: 'app', tab: 'liste' });
}

function logout() {
  try { localStorage.removeItem(USER_KEY); } catch (_) {}
  setState({ screen: 'login', user: '' });
}

function finish() {
  const doneItems = state.items.filter(x => x.done);
  if (doneItems.length === 0) return;
  const wi = getWeekInfo();
  const entry = {
    id: Date.now(), week: wi.week, weekLabel: wi.label,
    dateLabel: wi.date.toLocaleDateString('de-AT', { weekday: 'long', day: 'numeric', month: 'long' }),
    by: (state.user || 'G').trim().charAt(0).toUpperCase() || 'G',
    count: doneItems.length,
    items: doneItems.map(it => ({ n: it.n, c: it.c, q: it.q || 1, by: it.by }))
  };
  setState({
    screen: 'complete', finishedCount: doneItems.length,
    history: [entry, ...state.history], items: state.items.filter(x => !x.done)
  });
}

// ---------- Render ----------
const HEADER = (title, sub) =>
  `<div style="background:#1b1f3b;padding:56px 20px 20px;flex-shrink:0">${title}${sub}</div>`;

function render() {
  let html = '';
  if (state.screen === 'login') html = renderLogin();
  else if (state.screen === 'complete') html = renderComplete();
  else html = renderApp();
  root.innerHTML = html;

  if (pendingFocus) {
    const el = document.getElementById(pendingFocus);
    if (el) { el.focus(); }
    pendingFocus = null;
  }
}

function renderLogin() {
  return `
  <div style="min-height:100dvh;background:#1b1f3b;display:flex;flex-direction:column;justify-content:center;align-items:center;padding:24px;max-width:430px;margin:0 auto">
    <div style="width:72px;height:72px;border-radius:20px;background:rgba(255,255,255,.1);display:flex;align-items:center;justify-content:center;margin-bottom:24px">
      <i class="ti ti-shopping-cart" aria-hidden="true" style="font-size:34px;color:#4ade80"></i>
    </div>
    <h1 style="color:#fff;font-size:28px;font-weight:600;letter-spacing:-.5px;margin-bottom:6px">Einkaufsliste</h1>
    <p style="color:rgba(255,255,255,.45);font-size:14px;margin-bottom:34px;text-align:center;line-height:1.4">Gemeinsam einkaufen — melde dich an,<br>um loszulegen.</p>
    <div style="width:100%;max-width:320px;display:flex;flex-direction:column;gap:12px">
      <input id="loginInput" class="login-input" type="text" placeholder="Dein Name" autocomplete="off"
        style="width:100%;border:1.5px solid rgba(255,255,255,.18);border-radius:12px;padding:14px 16px;font-size:16px;font-family:inherit;background:rgba(255,255,255,.06);color:#fff;outline:none;transition:border-color .15s">
      <button data-act="login" data-press style="width:100%;background:#4ade80;border:none;border-radius:12px;padding:15px;font-size:16px;font-weight:600;color:#0b3b1f;cursor:pointer;font-family:inherit;display:flex;align-items:center;justify-content:center;gap:8px">
        Anmelden <i class="ti ti-arrow-right" aria-hidden="true" style="font-size:18px"></i>
      </button>
    </div>
  </div>`;
}

function renderApp() {
  const initial = (state.user || 'G').trim().charAt(0).toUpperCase() || 'G';
  let body = '';
  if (state.tab === 'liste') body = renderListe(initial);
  else if (state.tab === 'auswahl') body = renderAuswahl();
  else body = renderUebersicht();

  const navBtn = (act, icon, lbl, active) =>
    `<button data-act="${act}" data-press style="flex:1;display:flex;flex-direction:column;align-items:center;gap:3px;background:none;border:none;cursor:pointer;font-family:inherit;padding:4px 0;transition:color .15s;color:${active ? '#1b1f3b' : '#aeaea8'}">
      <i class="ti ${icon}" aria-hidden="true" style="font-size:23px"></i>
      <span style="font-size:10.5px;font-weight:600;letter-spacing:.2px">${lbl}</span>
    </button>`;

  return `
  <div style="max-width:430px;margin:0 auto;min-height:100dvh;display:flex;flex-direction:column;padding-bottom:calc(76px + env(safe-area-inset-bottom));background:#f2f1ed">
    ${body}
  </div>
  <div style="position:fixed;bottom:0;left:50%;transform:translateX(-50%);width:100%;max-width:430px;background:#fff;border-top:.5px solid #e5e4e0;display:flex;padding:8px 6px calc(8px + env(safe-area-inset-bottom))">
    ${navBtn('goListe', 'ti-list-check', 'Liste', state.tab === 'liste')}
    ${navBtn('goAuswahl', 'ti-circle-plus', 'Auswählen', state.tab === 'auswahl')}
    ${navBtn('goUebersicht', 'ti-history', 'Übersicht', state.tab === 'uebersicht')}
  </div>`;
}

function renderListe(initial) {
  const wi = getWeekInfo();
  const items = state.items;
  const grouped = {};
  items.forEach((item, i) => { (grouped[item.c] = grouped[item.c] || []).push({ ...item, i }); });

  const doneCount = items.filter(x => x.done).length;
  const totalCount = items.length;
  const pct = totalCount > 0 ? Math.round(doneCount / totalCount * 100) : 0;
  const allDone = totalCount > 0 && doneCount === totalCount;

  const header = `
    <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px">
      <div>
        <h1 style="color:#fff;font-size:28px;font-weight:600;letter-spacing:-.5px;margin-bottom:3px">Einkaufsliste</h1>
        <p style="color:rgba(255,255,255,.45);font-size:13px">${escH(wi.label)}</p>
      </div>
      <button data-act="logout" data-press title="Abmelden" style="flex-shrink:0;width:38px;height:38px;border-radius:50%;border:none;background:#4ade80;color:#0b3b1f;font-size:15px;font-weight:700;cursor:pointer;font-family:inherit;display:flex;align-items:center;justify-content:center">${escH(initial)}</button>
    </div>
    <div style="background:rgba(255,255,255,.12);border-radius:100px;height:6px;overflow:hidden;margin-top:16px">
      <div style="background:#4ade80;height:100%;border-radius:100px;width:${pct}%;transition:width .3s ease"></div>
    </div>
    <div style="display:flex;justify-content:space-between;margin-top:7px;font-size:12px;color:rgba(255,255,255,.4)">
      <span><strong style="color:#fff;font-weight:600">${doneCount}</strong> von <strong style="color:#fff;font-weight:600">${totalCount}</strong> erledigt</span>
      <span>${pct} %</span>
    </div>`;

  let content;
  if (totalCount === 0) {
    content = `
      <div style="text-align:center;padding:60px 24px 24px;color:#9a9a95">
        <i class="ti ti-basket" aria-hidden="true" style="font-size:42px;color:#cfcfca"></i>
        <p style="font-size:15px;margin-top:12px;color:#1a1a18;font-weight:600">Deine Liste ist leer</p>
        <p style="font-size:13.5px;margin-top:4px;line-height:1.45">Wähle Artikel über den Tab<br>„Auswählen“ aus.</p>
        <button data-act="goAuswahl" data-press style="margin-top:18px;background:#1b1f3b;border:none;border-radius:10px;padding:11px 18px;color:#fff;font-size:14px;font-weight:600;cursor:pointer;font-family:inherit;display:inline-flex;align-items:center;gap:7px">
          <i class="ti ti-plus" aria-hidden="true" style="font-size:16px"></i> Artikel auswählen
        </button>
      </div>`;
  } else {
    const groupsHtml = CAT_KEYS.filter(c => grouped[c]).map(cat => {
      const gi = grouped[cat];
      const rows = gi.map(({ n, done, q, i, by }, idx) => {
        const isLast = idx === gi.length - 1;
        const qq = q || 1;
        const rowStyle = `display:flex;align-items:center;gap:11px;padding:13px 14px;cursor:pointer;transition:background .1s;-webkit-tap-highlight-color:transparent;border-bottom:${isLast ? 'none' : '.5px solid #eeede9'}`;
        const chkStyle = `width:22px;height:22px;border-radius:50%;flex-shrink:0;display:flex;align-items:center;justify-content:center;transition:all .15s;border:1.5px solid ${done ? '#4ade80' : '#e5e4e0'};background:${done ? '#4ade80' : 'transparent'}`;
        const nameStyle = `font-size:15.5px;flex:1;transition:all .15s;text-decoration:${done ? 'line-through' : 'none'};color:${done ? '#888882' : '#1a1a18'}`;
        const qtyPart = qq > 1 ? `<span style="font-weight:700;color:#1b1f3b;font-variant-numeric:tabular-nums">${qq}× </span>` : '';
        return `
          <div data-act="toggle" data-i="${i}" data-press-bg style="${rowStyle}">
            <div style="${chkStyle}">${done ? '<i class="ti ti-check" aria-hidden="true" style="font-size:12px;color:#166534;font-weight:700"></i>' : ''}</div>
            <span title="Hinzugefügt von" style="flex-shrink:0;width:20px;height:20px;border-radius:50%;background:transparent;color:#b4b4ae;font-size:12px;font-weight:600;display:flex;align-items:center;justify-content:center">${escH(by || '·')}</span>
            <span style="${nameStyle}">${qtyPart}${escH(n)}</span>
            <button data-act="remove" data-i="${i}" class="remove-x" aria-label="Entfernen" style="flex-shrink:0;border:none;background:none;color:#c9c9c4;font-size:17px;cursor:pointer;padding:2px 4px;line-height:1"><i class="ti ti-x" aria-hidden="true"></i></button>
          </div>`;
      }).join('');
      return `
        <p style="font-size:10.5px;font-weight:600;text-transform:uppercase;letter-spacing:.75px;color:#888882;margin:0 3px 6px;display:flex;align-items:center;gap:5px">
          <i class="ti ${CATS[cat].icon}" aria-hidden="true" style="font-size:12px"></i>${escH(cat)}
        </p>
        <div style="background:#fff;border-radius:14px;border:.5px solid #e5e4e0;overflow:hidden;margin-bottom:12px">${rows}</div>`;
    }).join('');

    const finishBtn = allDone ? `
      <button data-act="finish" data-press style="width:100%;margin:2px 0 14px;padding:15px;background:#4ade80;border:none;border-radius:14px;color:#0b3b1f;font-size:15.5px;font-weight:600;cursor:pointer;font-family:inherit;display:flex;align-items:center;justify-content:center;gap:8px">
        <i class="ti ti-circle-check" aria-hidden="true" style="font-size:19px"></i> Einkauf abschließen
      </button>` : '';

    content = groupsHtml + finishBtn;
  }

  return HEADER(header, '') + `<div style="flex:1;padding:14px 14px 0">${content}</div>`;
}

function renderAuswahl() {
  const editing = state.editCatalog;
  const removedSet = new Set(state.removedLabels);

  const listQty = {};
  state.items.forEach(it => { listQty[it.n] = (listQty[it.n] || 0) + (it.q || 1); });

  const merged = {}; CAT_KEYS.forEach(cat => merged[cat] = []);
  Object.entries(CATALOG).forEach(([cat, ps]) => { ps.forEach(p => { if (!removedSet.has(label(p))) merged[cat].push(p); }); });
  state.customProducts.forEach(p => {
    const cat = CAT_KEYS.includes(p.cat) ? p.cat : 'Sonstiges';
    if (!removedSet.has(label(p))) merged[cat].push({ name: p.name, spec: p.spec, custom: true });
  });

  const byLabel = {};
  const catalogHtml = CAT_KEYS.filter(cat => merged[cat].length).map(cat => {
    const rows = merged[cat].map((p, idx, arr) => {
      const lbl = label(p);
      byLabel[lbl] = { ...p, cat };
      const isLast = idx === arr.length - 1;
      const onListQty = listQty[lbl] || 0;
      const just = state.justAdded === lbl;
      const qty = state.qty[lbl] || 1;
      const rowStyle = `display:flex;align-items:center;gap:10px;padding:11px 14px;border-bottom:${isLast ? 'none' : '.5px solid #eeede9'}`;
      const onListBadge = onListQty > 0
        ? `<span style="display:inline-flex;align-items:center;gap:2px;color:#22a45d;font-size:11.5px;font-weight:700"><i class="ti ti-check" aria-hidden="true" style="font-size:12px"></i>${onListQty}</span>` : '';
      const right = editing
        ? `<button data-act="delProd" data-lbl="${escA(lbl)}" data-press aria-label="Aus Katalog entfernen" style="width:34px;height:34px;border-radius:9px;border:none;background:#fdecea;color:#d6442a;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0"><i class="ti ti-trash" aria-hidden="true" style="font-size:17px"></i></button>`
        : `<div style="display:flex;align-items:center;gap:8px;flex-shrink:0">
             <div style="display:flex;align-items:center;border:1px solid #e5e4e0;border-radius:9px;overflow:hidden">
               <button data-act="dec" data-lbl="${escA(lbl)}" data-press-soft aria-label="Weniger" style="width:30px;height:30px;border:none;background:#fff;color:#1b1f3b;font-size:17px;cursor:pointer;display:flex;align-items:center;justify-content:center;font-family:inherit"><i class="ti ti-minus" aria-hidden="true" style="font-size:15px"></i></button>
               <span style="min-width:26px;text-align:center;font-size:14px;font-weight:600;color:#1a1a18;font-variant-numeric:tabular-nums">${qty}</span>
               <button data-act="inc" data-lbl="${escA(lbl)}" data-press-soft aria-label="Mehr" style="width:30px;height:30px;border:none;background:#fff;color:#1b1f3b;font-size:17px;cursor:pointer;display:flex;align-items:center;justify-content:center;font-family:inherit"><i class="ti ti-plus" aria-hidden="true" style="font-size:15px"></i></button>
             </div>
             <button data-act="addProd" data-lbl="${escA(lbl)}" data-cat="${escA(cat)}" data-press aria-label="Zur Liste" style="width:34px;height:34px;border-radius:9px;border:none;color:#0b3b1f;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-family:inherit;transition:background .15s;background:${just ? '#22a45d' : '#4ade80'}"><i class="ti ${just ? 'ti-check' : 'ti-plus'}" aria-hidden="true" style="font-size:18px"></i></button>
           </div>`;
      return `
        <div style="${rowStyle}">
          <div style="flex:1;min-width:0">
            <div style="display:flex;align-items:center;gap:7px">
              <span style="font-size:15px;font-weight:500;color:#1a1a18">${escH(p.name)}</span>${onListBadge}
            </div>
            <div style="font-size:12.5px;color:#9a9a95;margin-top:1px">${escH(p.spec || '')}</div>
          </div>
          ${right}
        </div>`;
    }).join('');
    return `
      <p style="font-size:10.5px;font-weight:600;text-transform:uppercase;letter-spacing:.75px;color:#888882;margin:0 3px 6px;display:flex;align-items:center;gap:5px">
        <i class="ti ${CATS[cat].icon}" aria-hidden="true" style="font-size:12px"></i>${escH(cat)}
      </p>
      <div style="background:#fff;border-radius:14px;border:.5px solid #e5e4e0;overflow:hidden;margin-bottom:12px">${rows}</div>`;
  }).join('');

  // Häufig gebraucht
  const freqCount = {};
  state.history.forEach(entry => {
    const seen = new Set();
    entry.items.forEach(it => { if (!seen.has(it.n)) { freqCount[it.n] = (freqCount[it.n] || 0) + 1; seen.add(it.n); } });
  });
  Object.entries(state.sessionFreq).forEach(([lbl, c]) => { freqCount[lbl] = (freqCount[lbl] || 0) + c; });
  const freqItems = Object.entries(freqCount)
    .filter(([lbl, c]) => c > 0 && byLabel[lbl])
    .sort((a, b) => b[1] - a[1]).slice(0, 6)
    .map(([lbl]) => ({ lbl, ...byLabel[lbl] }));

  const freqHtml = (freqItems.length && !editing) ? `
    <p style="font-size:10.5px;font-weight:600;text-transform:uppercase;letter-spacing:.75px;color:#888882;margin:0 3px 8px;display:flex;align-items:center;gap:5px">
      <i class="ti ti-star" aria-hidden="true" style="font-size:12px;color:#e0a93a"></i>Häufig gebraucht
    </p>
    <div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:18px">
      ${freqItems.map(f => `
        <button data-act="addProd" data-lbl="${escA(f.lbl)}" data-cat="${escA(f.cat)}" class="freq-chip" style="display:inline-flex;align-items:center;gap:7px;background:#fff;border:.5px solid #e5e4e0;border-radius:100px;padding:8px 13px;font-size:13.5px;color:#1a1a18;cursor:pointer;font-family:inherit">
          <span style="font-weight:500">${escH(f.name)}</span>
          <span style="color:#9a9a95;font-size:12px">${escH(f.spec || '')}</span>
          <i class="ti ti-plus" aria-hidden="true" style="font-size:15px;color:#22a45d"></i>
        </button>`).join('')}
    </div>` : '';

  const manualHtml = !editing ? `
    <div style="display:flex;gap:8px;align-items:center;margin-bottom:18px">
      <input id="manualInput" class="add-input" type="text" placeholder="Eigenen Artikel eingeben…" autocomplete="off" autocorrect="off"
        style="flex:1;border:1.5px solid #e5e4e0;border-radius:10px;padding:11px 14px;font-size:16px;font-family:inherit;background:#fff;color:#1a1a18;outline:none;transition:border-color .15s">
      <button data-act="addManual" data-press aria-label="Hinzufügen" style="width:44px;height:44px;background:#1b1f3b;border:none;border-radius:10px;color:#fff;font-size:20px;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0"><i class="ti ti-plus" aria-hidden="true"></i></button>
    </div>` : '';

  const editPanel = editing ? `
    <div style="background:#fff;border:1px solid #e5e4e0;border-radius:14px;padding:14px;margin-bottom:18px">
      <p style="font-size:13px;font-weight:600;color:#1a1a18;margin-bottom:10px;display:flex;align-items:center;gap:6px"><i class="ti ti-pencil-plus" aria-hidden="true" style="font-size:16px;color:#1b1f3b"></i>Eigenes Produkt anlegen</p>
      <div style="display:flex;gap:8px;margin-bottom:8px">
        <input id="prodName" class="add-input" type="text" placeholder="Name, z.B. Faschiertes vom Rind" autocomplete="off" style="flex:2;min-width:0;border:1.5px solid #e5e4e0;border-radius:10px;padding:10px 12px;font-size:15px;font-family:inherit;background:#f9f9f7;color:#1a1a18;outline:none">
        <input id="prodSpec" class="add-input" type="text" placeholder="Menge" autocomplete="off" style="flex:1;min-width:0;width:80px;border:1.5px solid #e5e4e0;border-radius:10px;padding:10px 12px;font-size:15px;font-family:inherit;background:#f9f9f7;color:#1a1a18;outline:none">
      </div>
      <button data-act="addCustom" data-press style="width:100%;display:flex;align-items:center;justify-content:center;gap:6px;background:#1b1f3b;border:none;border-radius:10px;padding:11px;color:#fff;font-size:14px;font-weight:600;cursor:pointer;font-family:inherit;transition:background .15s">
        <i class="ti ti-plus" aria-hidden="true" style="font-size:17px"></i> Zum Katalog hinzufügen
      </button>
    </div>
    <p style="font-size:12.5px;color:#9a9a95;margin:0 3px 14px;line-height:1.4">Tippe das <i class="ti ti-trash" aria-hidden="true" style="font-size:13px"></i> bei einem Artikel, um ihn aus dem Katalog zu entfernen.</p>` : '';

  const header = `
    <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px">
      <div>
        <h1 style="color:#fff;font-size:28px;font-weight:600;letter-spacing:-.5px">Auswählen</h1>
        <p style="color:rgba(255,255,255,.45);font-size:13px;margin-top:3px">Tippe Artikel an — sie landen sofort auf der aktuellen Liste.</p>
      </div>
      <button data-act="toggleEdit" data-press style="flex-shrink:0;display:inline-flex;align-items:center;gap:5px;background:rgba(255,255,255,.1);border:none;border-radius:100px;padding:8px 13px;color:#fff;font-size:12.5px;font-weight:600;cursor:pointer;font-family:inherit">
        <i class="ti ${editing ? 'ti-check' : 'ti-pencil'}" aria-hidden="true" style="font-size:15px"></i>${editing ? 'Fertig' : 'Bearbeiten'}
      </button>
    </div>`;

  return HEADER(header, '') + `<div style="flex:1;padding:14px 14px 0">${manualHtml}${editPanel}${freqHtml}${catalogHtml}</div>`;
}

function renderUebersicht() {
  const history = state.history;
  const tripsLabel = history.length === 1 ? '1 Einkauf' : history.length + ' Einkäufe';

  const header = `
    <h1 style="color:#fff;font-size:28px;font-weight:600;letter-spacing:-.5px">Übersicht</h1>
    <p style="color:rgba(255,255,255,.45);font-size:13px;margin-top:3px">Vergangene Einkäufe · ${tripsLabel}</p>`;

  let content;
  if (history.length === 0) {
    content = `
      <div style="text-align:center;padding:60px 24px 24px;color:#9a9a95">
        <i class="ti ti-history" aria-hidden="true" style="font-size:42px;color:#cfcfca"></i>
        <p style="font-size:15px;margin-top:12px;color:#1a1a18;font-weight:600">Noch keine Einkäufe</p>
        <p style="font-size:13.5px;margin-top:4px;line-height:1.45">Schließe einen Einkauf ab,<br>dann erscheint er hier.</p>
      </div>`;
  } else {
    content = history.map(entry => {
      const countLabel = entry.items.length === 1 ? '1 Artikel' : entry.items.length + ' Artikel';
      const itemsHtml = entry.items.map(it => {
        const qq = it.q || 1;
        const qtyPart = qq > 1 ? `<span style="font-weight:700;color:#1b1f3b;font-variant-numeric:tabular-nums">${qq}× </span>` : '';
        return `<div style="display:flex;align-items:center;gap:8px;padding:5px 0;font-size:14px;color:#52524d">
          <i class="ti ti-check" aria-hidden="true" style="font-size:14px;color:#22a45d;flex-shrink:0"></i>
          <span>${qtyPart}${escH(it.n)}</span></div>`;
      }).join('');
      return `
        <div style="background:#fff;border-radius:14px;border:.5px solid #e5e4e0;overflow:hidden;margin-bottom:12px">
          <div style="display:flex;align-items:center;gap:11px;padding:13px 14px;border-bottom:.5px solid #eeede9">
            <div style="flex-shrink:0;width:34px;height:34px;border-radius:50%;background:#1b1f3b;color:#fff;font-size:14px;font-weight:700;display:flex;align-items:center;justify-content:center">${escH(entry.by || '·')}</div>
            <div style="flex:1;min-width:0">
              <div style="font-size:14.5px;font-weight:600;color:#1a1a18">${escH(entry.weekLabel)}</div>
              <div style="font-size:12.5px;color:#9a9a95;margin-top:1px">${escH(entry.dateLabel)} · ${countLabel}</div>
            </div>
            <i class="ti ti-circle-check" aria-hidden="true" style="font-size:20px;color:#4ade80;flex-shrink:0"></i>
          </div>
          <div style="padding:6px 14px 10px">${itemsHtml}</div>
        </div>`;
    }).join('') + `<p style="text-align:center;font-size:12px;color:#b4b4ae;margin:6px 0 14px;line-height:1.4">Diese Einkäufe bilden die Basis<br>für „Häufig gebraucht“.</p>`;
  }

  return HEADER(header, '') + `<div style="flex:1;padding:14px 14px 0">${content}</div>`;
}

function renderComplete() {
  const summary = state.finishedCount === 1
    ? '1 Artikel erfolgreich erledigt. Gut gemacht!'
    : `${state.finishedCount} Artikel erfolgreich erledigt. Gut gemacht!`;
  return `
  <div style="min-height:100dvh;background:#1b1f3b;display:flex;flex-direction:column;justify-content:center;align-items:center;padding:24px;max-width:430px;margin:0 auto;text-align:center">
    <div style="width:92px;height:92px;border-radius:50%;background:#4ade80;display:flex;align-items:center;justify-content:center;margin-bottom:26px;animation:popIn .4s ease both">
      <i class="ti ti-check" aria-hidden="true" style="font-size:46px;color:#0b3b1f;font-weight:700"></i>
    </div>
    <h1 style="color:#fff;font-size:26px;font-weight:600;letter-spacing:-.5px;margin-bottom:8px">Einkauf abgeschlossen!</h1>
    <p style="color:rgba(255,255,255,.5);font-size:15px;margin-bottom:34px;line-height:1.5">${escH(summary)}</p>
    <button data-act="startNew" data-press style="width:100%;max-width:320px;background:#4ade80;border:none;border-radius:12px;padding:15px;font-size:16px;font-weight:600;color:#0b3b1f;cursor:pointer;font-family:inherit;display:flex;align-items:center;justify-content:center;gap:8px">
      <i class="ti ti-arrow-right" aria-hidden="true" style="font-size:18px"></i> Weiter
    </button>
  </div>`;
}

// ---------- Event-Delegation ----------
const ACTIONS = {
  login, logout, finish, addManual, addCustom: addCustomProduct,
  toggleEdit: () => setState({ editCatalog: !state.editCatalog }),
  goListe: () => setState({ tab: 'liste' }),
  goAuswahl: () => setState({ tab: 'auswahl' }),
  goUebersicht: () => setState({ tab: 'uebersicht' }),
  startNew: () => setState({ screen: 'app', tab: 'liste' }),
  toggle: (el) => {
    const i = +el.dataset.i;
    setState({ items: state.items.map((it, j) => j === i ? { ...it, done: !it.done } : it) });
  },
  remove: (el) => {
    const i = +el.dataset.i;
    setState({ items: state.items.filter((_, j) => j !== i) });
  },
  addProd: (el) => addProduct(el.dataset.lbl, el.dataset.cat),
  delProd: (el) => removeProduct(el.dataset.lbl),
  inc: (el) => incQty(el.dataset.lbl),
  dec: (el) => decQty(el.dataset.lbl)
};

root.addEventListener('click', (e) => {
  const el = e.target.closest('[data-act]');
  if (!el) return;
  const fn = ACTIONS[el.dataset.act];
  if (fn) { e.preventDefault(); fn(el); }
});

root.addEventListener('keydown', (e) => {
  if (e.key !== 'Enter') return;
  const id = e.target.id;
  if (id === 'loginInput') login();
  else if (id === 'manualInput') addManual();
  else if (id === 'prodName' || id === 'prodSpec') addCustomProduct();
});

// ---------- Online/Offline-Banner ----------
const banner = document.getElementById('sync-banner');
function showStatus(kind) {
  if (!window.Store || window.Store.mode !== 'shared') return;
  if (kind === 'online') {
    banner.className = 'show online'; banner.textContent = 'Geteilte Liste · synchronisiert';
    setTimeout(() => banner.classList.remove('show'), 1800);
  } else if (kind === 'offline') {
    banner.className = 'show offline'; banner.textContent = 'Offline · Änderungen werden lokal gespeichert';
  } else {
    banner.className = 'show online'; banner.textContent = 'Verbinde…';
  }
}

// ---------- Start ----------
(async function init() {
  let savedUser = '';
  try { savedUser = localStorage.getItem(USER_KEY) || ''; } catch (_) {}

  if (window.Store) window.Store.onStatus(showStatus);
  const data = window.Store ? await window.Store.start(applyRemote) : null;

  if (data && data.items) {
    state.items = data.items;
    state.history = data.history || [];
    state.customProducts = data.customProducts || [];
    state.removedLabels = data.removedLabels || [];
  } else {
    // Erststart: Demo-Daten, damit die App lebendig wirkt
    state.items = INITIAL.map(it => ({ ...it }));
    state.history = SEED_HISTORY.map(h => ({ ...h }));
    if (window.Store) persistShared();
  }

  if (savedUser) { state.user = savedUser; state.screen = 'app'; }
  render();
})();
