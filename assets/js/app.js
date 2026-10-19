/*
 * IT System — DEMO statis (tanpa PHP/MySQL), untuk GitHub Pages.
 * Semua data disimpan di browser pengunjung (localStorage). Tidak ada data
 * yang dikirim ke server mana pun.
 */
(function () {
  'use strict';

  // ------------------------------------------------------------------
  // Penyimpanan
  // ------------------------------------------------------------------
  const DB_KEY = 'itsys_demo_db_v1';
  const SESSION_KEY = 'itsys_demo_session_v1';
  const clone = (o) => JSON.parse(JSON.stringify(o));
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* mode privat: data hanya di memori */ } },
    del(k) { try { localStorage.removeItem(k); } catch (e) { /* abaikan */ } },
  };

  let db;
  function loadDb() {
    const raw = store.get(DB_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.version === window.DEMO_SEED.version) return parsed;
      } catch (e) { /* data rusak -> pakai data awal */ }
    }
    return clone(window.DEMO_SEED);
  }
  db = loadDb();
  db.upgradeLogs = db.upgradeLogs || [];
  const save = () => store.set(DB_KEY, JSON.stringify(db));
  function resetDemo() {
    store.del(DB_KEY);
    db = clone(window.DEMO_SEED);
    save();
  }

  let sessionUserId = parseInt(store.get(SESSION_KEY) || '0', 10) || null;
  const currentUser = () => db.users.find((u) => u.id === sessionUserId) || null;
  const isAdmin = () => (currentUser() || {}).role === 'admin';

  // ------------------------------------------------------------------
  // Helper umum
  // ------------------------------------------------------------------
  const esc = (v) => String(v == null ? '' : v).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const nextId = (arr) => arr.reduce((m, x) => Math.max(m, x.id || 0), 0) + 1;
  const DASH = '-';
  const COPYRIGHT = '© Copyright by ASKER';
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  const pad = (n) => String(n).padStart(2, '0');
  function fmtDate(iso) {
    if (!iso) return DASH;
    const d = new Date(iso.length === 10 ? iso + 'T00:00:00' : iso);
    return `${pad(d.getDate())} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
  }
  function fmtDateTime(iso) {
    if (!iso) return DASH;
    const d = new Date(iso);
    return `${fmtDate(iso)} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }
  const todayStr = () => { const d = new Date(); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; };
  const localDay = (iso) => { const d = new Date(iso); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; };

  const ICONS = {
    dashboard: '<rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/>',
    laptop: '<path d="M20 16V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v9m16 0H4m16 0 1.28 2.55a1 1 0 0 1-.9 1.45H3.62a1 1 0 0 1-.9-1.45L4 16"/>',
    tag: '<path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z"/><circle cx="7.5" cy="7.5" r="1" fill="currentColor"/>',
    users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
    ticket: '<path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M13 5v2"/><path d="M13 17v2"/><path d="M13 11v2"/>',
    monitor: '<rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8"/><path d="M12 17v4"/>',
    clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
    logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/>',
    settings: '<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>',
    x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
    alert: '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
    printer: '<path d="M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8" rx="1"/>',
    'file-text': '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/><path d="M12 15V3"/>',
    pencil: '<path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z"/>',
    package: '<path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z"/><path d="M12 22V12"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="m7.5 4.27 9 5.15"/>',
    plus: '<path d="M12 5v14"/><path d="M5 12h14"/>',
    minus: '<path d="M5 12h14"/>',
    trash: '<path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
    eye: '<path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/>',
    search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
    refresh: '<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/>',
    pc: '<rect x="5" y="2" width="14" height="20" rx="2"/><path d="M9 6h6"/><path d="M9 10h6"/><path d="M15 17h.01"/>',
    mouse: '<rect x="5" y="2" width="14" height="20" rx="7"/><path d="M12 6v4"/>',
    tablet: '<rect width="16" height="20" x="4" y="2" rx="2"/><path d="M12 18h.01"/>',
    up: '<path d="m5 12 7-7 7 7"/><path d="M12 19V5"/>',
    transfer: '<path d="M8 3 4 7l4 4"/><path d="M4 7h16"/><path d="m16 21 4-4-4-4"/><path d="M20 17H4"/>',
    sheet: '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M8 13h2"/><path d="M14 13h2"/><path d="M8 17h2"/><path d="M14 17h2"/>',
    key: '<path d="m15.5 7.5 2.3 2.3a1 1 0 0 0 1.4 0l2.1-2.1a1 1 0 0 0 0-1.4L19 4"/><path d="m21 2-9.6 9.6"/><circle cx="7.5" cy="15.5" r="5.5"/>',
    mail: '<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',
    lock: '<rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
    upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m17 8-5-5-5 5"/><path d="M12 3v12"/>',
  };
  function icon(name, cls = 'w-4 h-4') {
    return `<svg class="shrink-0 ${cls}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] || ICONS.pc}</svg>`;
  }
  function categoryIcon(cat, cls = 'w-6 h-6') {
    const c = String(cat || '').toLowerCase();
    let n = 'pc';
    if (c.includes('laptop')) n = 'laptop';
    else if (c.includes('printer')) n = 'printer';
    else if (c.includes('monitor')) n = 'monitor';
    else if (c.includes('tablet')) n = 'tablet';
    else if (c.includes('aksesoris')) n = 'mouse';
    return icon(n, cls);
  }

  const ASSET_STATUS = { 'Digunakan': 'Digunakan', 'Stok': 'Stok', 'Tidak Digunakan': 'Tidak Digunakan' };
  const ASSET_STATUS_BADGE = { 'Digunakan': 'bg-green-100 text-green-700', 'Stok': 'bg-slate-100 text-slate-600', 'Tidak Digunakan': 'bg-red-100 text-red-600' };
  const TICKET_BADGE = { 'Menunggu': 'bg-amber-100 text-amber-700', 'Proses': 'bg-blue-100 text-blue-700', 'Selesai': 'bg-green-100 text-green-700', 'Dibatalkan': 'bg-slate-200 text-slate-600' };

  // ------------------------------------------------------------------
  // Query data
  // ------------------------------------------------------------------
  const userById = (id) => db.users.find((u) => u.id === id);
  const assetById = (id) => db.assets.find((a) => a.id === id);
  const ownersOf = (assetId) => db.assetOwners.filter((o) => o.asset_id === assetId).map((o) => userById(o.user_id)).filter(Boolean);
  const assetsOfUser = (userId) => db.assetOwners.filter((o) => o.user_id === userId).map((o) => assetById(o.asset_id)).filter(Boolean);
  const isCancelled = (t) => db.cancellations.some((c) => c.ticket_id === t.id);
  const ticketStatus = (t) => (isCancelled(t) ? 'Dibatalkan' : t.status);
  const workOf = (ticketId) => db.workDetails.find((w) => w.ticket_id === ticketId) || null;
  const prefix = () => db.settings.asset_prefix || 'AST';
  const appName = () => db.settings.app_name || 'IT Asset Management';

  function deptAbbr(dept) {
    dept = String(dept || '').trim();
    if (!dept) return 'STOK';
    const words = dept.split(/[\s/\-_]+/).filter(Boolean);
    if (words.length <= 1) { const w = words[0] || dept; return w.slice(0, w.length <= 5 ? w.length : 3).toUpperCase(); }
    return words.map((w) => w[0]).join('').slice(0, 4).toUpperCase();
  }
  function nextAssetNumber(category, dept, location, excludeId) {
    const p = prefix();
    const exists = (n) => db.assets.some((a) => a.asset_number === n && a.id !== excludeId);
    if (/tablet/i.test(category)) {
      const line = String(location || '').replace(/[^A-Za-z0-9]/g, '').toUpperCase();
      if (!line) return null;
      const base = `${p}/${deptAbbr(dept)}/${line}/`;
      let max = 0;
      db.assets.forEach((a) => { if (a.id !== excludeId && a.asset_number.startsWith(base)) { const m = a.asset_number.slice(base.length).match(/^(\d+)$/); if (m) max = Math.max(max, +m[1]); } });
      let n = max + 1; while (exists(base + String(n).padStart(3, '0'))) n++;
      return base + String(n).padStart(3, '0');
    }
    const cat = db.categories.find((c) => c.name === category);
    const abbr = cat ? cat.abbr : 'AST';
    let max = 0;
    const re = new RegExp('^' + p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '/[^/]+/' + abbr + '/(\\d+)$', 'i');
    db.assets.forEach((a) => { const m = a.asset_number.match(re); if (m) max = Math.max(max, +m[1]); });
    let n = max + 1;
    let cand;
    do { cand = `${p}/${deptAbbr(dept)}/${abbr}/${String(n).padStart(3, '0')}`; n++; } while (exists(cand));
    return cand;
  }

  // Semua jenis aset yang berstatus "Stok" otomatis dihitung sebagai stok perangkat.
  const isDeviceStockCategory = () => true;
  function deviceStock() {
    const cats = db.categories.filter((c) => isDeviceStockCategory(c.name)).sort((a, b) => a.sort_order - b.sort_order);
    const rows = cats.map((c) => {
      const all = db.assets.filter((a) => a.category === c.name);
      return { name: c.name, stok: all.filter((a) => a.status === 'Stok').length, used: all.filter((a) => a.status === 'Digunakan').length, unused: all.filter((a) => a.status === 'Tidak Digunakan').length };
    });
    const items = db.assets.filter((a) => isDeviceStockCategory(a.category) && a.status === 'Stok' && (!stockUi.devCat || a.category === stockUi.devCat)).sort((a, b) => a.category.localeCompare(b.category) || a.asset_number.localeCompare(b.asset_number));
    const total = rows.reduce((n, r) => n + r.stok, 0);
    return { rows, items, total };
  }

  // Stok per barang (kategori + nama/merk) dari Barang Masuk dikurangi Barang Keluar
  const normItem = (v) => String(v || '').trim().toLowerCase();
  function itemStockOf(catId, item, exceptId) {
    return db.stockTransactions.filter((t) => t.category_id === +catId && normItem(t.item_name) === normItem(item) && t.id !== exceptId)
      .reduce((s, t) => s + (t.type === 'in' ? t.qty : -t.qty), 0);
  }
  // Barang yang pernah dicatat lewat Barang Masuk untuk 1 kategori (penulisan nama seperti saat masuk)
  function itemsIn(catId) {
    const m = new Map();
    db.stockTransactions.filter((t) => t.type === 'in' && t.category_id === +catId).forEach((t) => { if (!m.has(normItem(t.item_name))) m.set(normItem(t.item_name), (t.item_name || '').trim()); });
    return [...m.values()];
  }
  function stockOf(catId) {
    return db.stockTransactions.filter((t) => t.category_id === catId).reduce((s, t) => s + (t.type === 'in' ? t.qty : -t.qty), 0);
  }

  function upgradeAssets() {
    const kw = 'harus upgrade';
    const rows = [];
    const seen = new Set();
    [...db.tickets].sort((a, b) => b.created_at.localeCompare(a.created_at)).forEach((t) => {
      if (isCancelled(t) || !t.asset_id) return;
      const w = workOf(t.id) || {};
      const hit = [t.problem_detail, w.work_detail, w.asset_check].some((x) => String(x || '').toLowerCase().includes(kw));
      if (!hit || seen.has(t.asset_id)) return;
      if (db.upgradeAck.some((k) => k.asset_id === t.asset_id && k.ticket_id === t.id)) return;
      seen.add(t.asset_id);
      rows.push({ asset: assetById(t.asset_id), ticket: t, text: w.asset_check || w.work_detail || t.problem_detail });
    });
    return rows.filter((r) => r.asset);
  }

  // ------------------------------------------------------------------
  // UI umum: toast, modal
  // ------------------------------------------------------------------
  function toast(msg, ok = true) {
    const el = document.createElement('div');
    el.className = `fixed bottom-4 right-4 z-[70] max-w-sm rounded-lg px-4 py-3 text-sm shadow-lg ${ok ? 'bg-slate-800 text-white' : 'bg-red-600 text-white'}`;
    el.textContent = msg;
    document.body.appendChild(el);
    setTimeout(() => { el.style.transition = 'opacity .3s'; el.style.opacity = '0'; }, 2600);
    setTimeout(() => el.remove(), 3000);
  }

  function openModal(title, bodyHtml, { wide = false, onMount } = {}) {
    closeModal();
    const wrap = document.createElement('div');
    wrap.id = 'modal';
    wrap.className = 'fixed inset-0 z-[60] flex items-start justify-center bg-black/40 p-3 overflow-y-auto';
    wrap.innerHTML = `
      <div class="bg-white rounded-xl shadow-xl w-full ${wide ? 'max-w-3xl' : 'max-w-lg'} my-auto">
        <div class="flex items-center justify-between px-5 py-4 border-b">
          <h3 class="font-semibold text-slate-700">${esc(title)}</h3>
          <button type="button" data-close class="text-slate-400 hover:text-slate-600">${icon('x', 'w-5 h-5')}</button>
        </div>
        <div class="p-5">${bodyHtml}</div>
      </div>`;
    wrap.addEventListener('click', (e) => { if (e.target === wrap || e.target.closest('[data-close]')) closeModal(); });
    document.body.appendChild(wrap);
    if (onMount) onMount(wrap);
    const first = wrap.querySelector('input:not([type=hidden]):not([readonly]), select, textarea');
    if (first) setTimeout(() => first.focus(), 30);
  }
  function closeModal() { const m = $('#modal'); if (m) m.remove(); }

  // Dialog konfirmasi di dalam halaman (pengganti confirm()/prompt() bawaan browser).
  function dialog(message, { okLabel = 'Ya, lanjutkan', input = null, danger = false } = {}) {
    return new Promise((resolve) => {
      const wrap = document.createElement('div');
      wrap.className = 'fixed inset-0 z-[80] flex items-center justify-center bg-black/40 p-4';
      wrap.innerHTML = `<div class="bg-white rounded-xl shadow-xl w-full max-w-sm p-5" role="dialog" aria-modal="true">
        <p class="text-sm text-slate-700">${esc(message)}</p>
        ${input !== null ? `<input id="dlgInput" placeholder="${esc(input)}" class="mt-3 w-full border border-slate-300 rounded-lg px-3 py-2 text-sm">` : ''}
        <div class="flex justify-end gap-2 mt-5">
          <button type="button" data-dlg="0" class="bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg px-4 py-2 text-sm font-medium">Batal</button>
          <button type="button" data-dlg="1" class="${danger ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'} text-white rounded-lg px-4 py-2 text-sm font-medium">${esc(okLabel)}</button>
        </div></div>`;
      const done = (ok) => {
        const val = input !== null ? (wrap.querySelector('#dlgInput').value || '') : true;
        wrap.remove(); document.removeEventListener('keydown', onKey, true);
        resolve(ok ? val : (input !== null ? null : false));
      };
      const onKey = (e) => { if (e.key === 'Escape') { e.stopPropagation(); done(false); } if (e.key === 'Enter') { e.preventDefault(); done(true); } };
      wrap.addEventListener('click', (e) => { const b = e.target.closest('[data-dlg]'); if (b) done(b.dataset.dlg === '1'); else if (e.target === wrap) done(false); });
      document.addEventListener('keydown', onKey, true);
      document.body.appendChild(wrap);
      setTimeout(() => (wrap.querySelector('#dlgInput') || wrap.querySelector('[data-dlg="1"]')).focus(), 20);
    });
  }
  const ask = (msg, okLabel) => dialog(msg, { okLabel: okLabel || 'Ya, lanjutkan', danger: /hapus|reset|kembalikan/i.test(msg) });
  const askText = (msg, placeholder) => dialog(msg, { okLabel: 'Batalkan Tiket', input: placeholder, danger: true });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

  const inputCls = 'w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500';
  const btnPrimary = 'inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 text-sm font-medium';
  const btnGhost = 'inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg px-4 py-2 text-sm font-medium';
  const field = (label, inner, cls = '') => `<div class="${cls}"><label class="block text-sm font-medium text-slate-600 mb-1">${label}</label>${inner}</div>`;
  const options = (list, selected, withEmpty) => (withEmpty ? `<option value="">${esc(withEmpty)}</option>` : '') + list.map((o) => {
    const v = typeof o === 'object' ? o.value : o;
    const l = typeof o === 'object' ? o.label : o;
    return `<option value="${esc(v)}" ${String(v) === String(selected) ? 'selected' : ''}>${esc(l)}</option>`;
  }).join('');
  const formData = (form) => Object.fromEntries(new FormData(form).entries());

  function downloadCsv(filename, rows) {
    const csv = rows.map((r) => r.map((c) => `"${String(c == null ? '' : c).replace(/"/g, '""')}"`).join(',')).join('\r\n');
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 100);
  }

  // ------------------------------------------------------------------
  // Routing
  // ------------------------------------------------------------------
  const ADMIN_NAV = [
    ['dashboard', 'dashboard', 'Dashboard'],
    ['assets', 'laptop', 'Aset'],
    ['categories', 'tag', 'Kategori Aset'],
    ['users', 'users', 'Management User'],
    ['tickets', 'ticket', 'Ticketing IT'],
    ['stock', 'package', 'Stok Barang'],
    ['mutations', 'transfer', 'Mutasi Aset'],
    ['damages', 'alert', 'Aset Rusak'],
    ['audit', 'sheet', 'Export Audit'],
    ['pcpw', 'key', 'Ganti Password PC'],
    ['my-asset', 'monitor', 'Aset Saya'],
    ['signature', 'mail', 'Signature Email'],
    ['settings', 'settings', 'Pengaturan Sistem'],
  ];
  const USER_NAV = [
    ['my-asset', 'monitor', 'Aset Saya'],
    ['tickets', 'ticket', 'Ticketing IT'],
    ['queue', 'clock', 'Antrian Ticket'],
    ['signature', 'mail', 'Signature Email'],
  ];
  const PAGES = {};
  // Mode artifact (dibuka di claude.ai): tanpa hash URL, cetak & unduh file dimatikan.
  const ARTIFACT = !!window.DEMO_ARTIFACT;
  const hashRoute = () => (location.hash.replace(/^#\/?/, '').split('?')[0] || '');
  let currentRoute = ARTIFACT ? '' : hashRoute();
  const route = () => currentRoute;
  function go(r) {
    closeModal();
    if (!ARTIFACT && hashRoute() !== r) { location.hash = '#/' + r; return; } // hashchange -> render()
    currentRoute = r;
    render();
    const main = document.querySelector('main'); if (main) main.scrollTop = 0;
  }
  // Semua link menu (href="#/...") ditangani di sini
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#/"]');
    if (!a) return;
    e.preventDefault();
    go(a.getAttribute('href').slice(2));
  });
  const uiState = { sidebarCollapsed: false };

  function render() {
    const app = $('#app');
    const u = currentUser();
    document.title = appName() + ' — Demo';
    if (!u) { app.innerHTML = renderLogin(); bindLogin(); return; }
    const nav = isAdmin() ? ADMIN_NAV : USER_NAV;
    let r = route();
    if (!nav.some((n) => n[0] === r)) { r = nav[0][0]; currentRoute = r; if (!ARTIFACT) history.replaceState(null, '', '#/' + r); }
    const page = PAGES[r];
    const title = (nav.find((n) => n[0] === r) || [])[2] || '';
    app.innerHTML = renderShell(nav, r, title, page.render());
    bindShell();
    if (page.bind) page.bind();
  }
  window.addEventListener('hashchange', () => { if (ARTIFACT) return; currentRoute = hashRoute(); closeModal(); render(); });

  function logoHtml(size, textCls) {
    if (db.settings.logo) return `<img src="${esc(db.settings.logo)}" class="${size} object-contain bg-white p-0.5" alt="">`;
    const initials = appName().split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase() || 'IT';
    return `<div class="${size} ${textCls} flex items-center justify-center">${esc(initials)}</div>`;
  }

  function renderShell(nav, current, title, content) {
    const u = currentUser();
    const items = nav.map(([r, ic, label]) => {
      const active = r === current;
      return `<a href="#/${r}" class="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${active ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-300 hover:bg-slate-700/60 hover:text-white'}">
        <span class="w-5 flex justify-center">${icon(ic, 'w-5 h-5')}</span><span class="sidebar-label flex-1">${esc(label)}</span></a>`;
    }).join('');
    return `
<div class="flex h-screen overflow-hidden">
  <div id="sidebarOverlay" class="fixed inset-0 bg-black/40 z-30 hidden lg:hidden"></div>
  <aside id="sidebar" class="fixed lg:static z-40 h-full w-64 bg-slate-800 text-white flex flex-col transition-all duration-200 -translate-x-full lg:translate-x-0 ${uiState.sidebarCollapsed ? 'sidebar-collapsed' : ''}">
    <div class="flex items-center justify-between px-4 h-16 border-b border-slate-700 shrink-0">
      <div class="flex items-center gap-2 overflow-hidden">
        ${logoHtml('w-8 h-8 rounded-lg', 'bg-brand-500 text-white font-bold text-sm')}
        <span class="font-semibold sidebar-label text-sm leading-tight line-clamp-2">${esc(appName())}</span>
      </div>
      <button id="btnCloseSidebar" class="lg:hidden text-slate-300 hover:text-white">${icon('x', 'w-5 h-5')}</button>
    </div>
    <nav class="flex-1 overflow-y-auto py-4 px-3 space-y-1">
      ${items}
      <div class="border-t border-slate-700 my-3"></div>
      <a href="#" id="btnLogout" class="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-red-300 hover:bg-red-500/20 hover:text-red-200">
        <span class="w-5 flex justify-center">${icon('logout', 'w-5 h-5')}</span><span class="sidebar-label">Logout</span></a>
    </nav>
    <div class="px-4 py-3 border-t border-slate-700 text-xs text-slate-400 sidebar-label">
      Masuk sebagai<br><span class="text-white font-medium">${esc(u.full_name)}</span> (${esc(u.role)})
    </div>
  </aside>
  <div class="flex-1 flex flex-col min-w-0">
    <div class="bg-amber-400 text-amber-950 text-xs sm:text-sm px-4 py-1.5 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-center">
      <span><b>MODE DEMO</b> — data contoh, perubahan hanya tersimpan di browser Anda.</span>
      <button id="btnResetDemo" class="underline font-semibold">Reset data demo</button>
    </div>
    <header class="h-16 bg-white border-b flex items-center justify-between px-4 shrink-0">
      <div class="flex items-center gap-3 min-w-0">
        <button id="btnHamburger" class="p-2 rounded-lg hover:bg-slate-100 text-slate-600" aria-label="Menu">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 6h16M4 12h16M4 18h16" stroke-linecap="round"/></svg>
        </button>
        <h1 class="font-semibold text-lg text-slate-700 truncate">${esc(title)}</h1>
      </div>
      <div class="flex items-center gap-3 text-sm">
        <button id="btnSwitchRole" class="hidden sm:inline-flex items-center gap-1 text-xs font-medium text-brand-700 bg-brand-50 hover:bg-brand-100 rounded-full px-3 py-1">
          ${icon('refresh', 'w-3.5 h-3.5')} Coba sebagai ${isAdmin() ? 'User' : 'Admin'}
        </button>
        <div class="relative" id="userMenuWrap">
          <button type="button" id="btnUserMenu" aria-haspopup="true" aria-expanded="false" class="flex items-center gap-2 rounded-full pl-1 pr-2 py-1 hover:bg-slate-100 transition">
            <span class="w-8 h-8 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-semibold">${esc(u.full_name[0].toUpperCase())}</span>
            <span class="hidden md:inline text-slate-600 max-w-[12rem] truncate">${esc(u.full_name)}</span>
            <svg id="userMenuChevron" class="w-4 h-4 text-slate-400 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M6 9l6 6 6-6" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>
          <div id="userMenu" role="menu" class="hidden absolute right-0 mt-2 w-60 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-40">
            <div class="px-4 pb-2 mb-1 border-b border-slate-100">
              <p class="font-semibold text-slate-800 truncate">${esc(u.full_name)}</p>
              <p class="text-xs text-slate-500 truncate">${esc(u.username)} &middot; ${u.role === 'admin' ? 'Admin' : 'User'}</p>
              <dl class="mt-2 space-y-1 text-xs">${[['Jabatan', u.position], ['Departement', u.department], ['Email', u.email]].map(([k, v]) => `<div class="flex gap-2"><dt class="w-20 shrink-0 text-slate-400">${k}</dt><dd class="min-w-0 break-words font-medium text-slate-700">${esc(v || DASH)}</dd></div>`).join('')}</dl>
            </div>
            <button type="button" id="btnChangePw" role="menuitem" class="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">${icon('lock')} Ganti Password</button>
            <button type="button" id="btnSwitchRole2" class="sm:hidden w-full flex items-center gap-2 px-4 py-2 text-sm text-brand-700 hover:bg-brand-50">${icon('refresh')} Coba sebagai ${isAdmin() ? 'User' : 'Admin'}</button>
            <button type="button" id="btnLogoutMenu" role="menuitem" class="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50">${icon('logout')} Logout</button>
          </div>
        </div>
      </div>
    </header>
    <main class="flex-1 overflow-y-auto p-4 lg:p-6">${content}
      <footer class="mt-10 pt-4 border-t border-slate-200 text-center text-xs text-slate-400">${esc(COPYRIGHT)}</footer>
    </main>
  </div>
</div>`;
  }

  function login(userId) {
    sessionUserId = userId;
    store.set(SESSION_KEY, String(userId));
    go(userById(userId).role === 'admin' ? 'dashboard' : 'my-asset');
  }
  function logout() {
    sessionUserId = null;
    store.del(SESSION_KEY);
    currentRoute = '';
    if (!ARTIFACT) history.replaceState(null, '', location.pathname);
    render();
  }

  function bindShell() {
    const sb = $('#sidebar');
    const ov = $('#sidebarOverlay');
    const closeMobile = () => { sb.classList.add('-translate-x-full'); ov.classList.add('hidden'); };
    $('#btnHamburger').onclick = () => {
      if (window.innerWidth < 1024) { sb.classList.remove('-translate-x-full'); ov.classList.remove('hidden'); }
      else { uiState.sidebarCollapsed = !uiState.sidebarCollapsed; sb.classList.toggle('sidebar-collapsed', uiState.sidebarCollapsed); }
    };
    $('#btnCloseSidebar').onclick = closeMobile;
    ov.onclick = closeMobile;
    $$('#sidebar nav a[href^="#/"]').forEach((a) => a.addEventListener('click', closeMobile));
    $('#btnLogout').onclick = async (e) => { e.preventDefault(); if (await ask('Yakin ingin keluar?', 'Logout')) logout(); };
    $('#btnResetDemo').onclick = async () => {
      if (!(await ask('Kembalikan semua data demo ke kondisi awal? Perubahan Anda akan hilang.'))) return;
      const uid = sessionUserId;
      resetDemo();
      sessionUserId = userById(uid) ? uid : null;
      render();
      toast('Data demo sudah dikembalikan ke kondisi awal.');
    };
    $('#btnSwitchRole').onclick = () => login(isAdmin() ? db.users.find((u) => u.username === 'user').id : db.users.find((u) => u.username === 'admin').id);
    // Menu akun (klik ikon user di pojok kanan atas): nama, role, Logout
    const um = $('#userMenu'), umBtn = $('#btnUserMenu'), umWrap = $('#userMenuWrap');
    const setUm = (open) => { if (!um.isConnected) return; um.classList.toggle('hidden', !open); $('#userMenuChevron').classList.toggle('rotate-180', open); umBtn.setAttribute('aria-expanded', String(open)); };
    umBtn.onclick = (e) => { e.stopPropagation(); setUm(um.classList.contains('hidden')); };
    document.onclick = (e) => { if (umWrap && umWrap.isConnected && !umWrap.contains(e.target)) setUm(false); };
    $('#btnLogoutMenu').onclick = async () => { setUm(false); if (await ask('Yakin ingin keluar?', 'Logout')) logout(); };
    $('#btnSwitchRole2').onclick = () => $('#btnSwitchRole').click();
    $('#btnChangePw').onclick = () => { setUm(false); changePasswordModal(); };
  }

  // ------------------------------------------------------------------
  // Login
  // ------------------------------------------------------------------
  function renderLogin() {
    return `
<div class="min-h-screen flex flex-col gap-6 items-center justify-center bg-gradient-to-br from-slate-100 to-blue-50 px-4 py-10">
  <div class="w-full max-w-sm bg-white rounded-2xl shadow-lg p-8">
    <div class="text-center mb-6">
      <div class="flex justify-center">${logoHtml('w-14 h-14 rounded-2xl', 'bg-blue-600 text-white font-bold text-xl')}</div>
      <h1 class="mt-3 text-xl font-bold text-slate-800">${esc(appName())}</h1>
      <p class="text-sm text-slate-500">Inventaris Aset IT &amp; Ticketing</p>
      <span class="inline-block mt-2 text-[11px] font-semibold tracking-wide bg-amber-100 text-amber-800 rounded-full px-2.5 py-0.5">VERSI DEMO</span>
    </div>
    <div class="space-y-2 mb-5">
      <button data-quick="admin" class="w-full flex items-center gap-3 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50 px-4 py-3 text-left transition">
        <span class="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center">${icon('dashboard', 'w-5 h-5')}</span>
        <span><span class="block text-sm font-semibold text-slate-800">Masuk sebagai Admin</span><span class="block text-xs text-slate-500">Aset, ticketing, stok, CCTV, jaringan, ext telepon, audit</span></span>
      </button>
      <button data-quick="user" class="w-full flex items-center gap-3 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50 px-4 py-3 text-left transition">
        <span class="w-9 h-9 rounded-full bg-green-100 text-green-700 flex items-center justify-center">${icon('monitor', 'w-5 h-5')}</span>
        <span><span class="block text-sm font-semibold text-slate-800">Masuk sebagai User</span><span class="block text-xs text-slate-500">Aset saya, tiket, checklist CCTV, ext telepon</span></span>
      </button>
    </div>
    <div class="flex items-center gap-3 text-xs text-slate-400 mb-4"><div class="flex-1 border-t"></div>atau login manual<div class="flex-1 border-t"></div></div>
    <div id="loginError" class="hidden mb-4 text-sm bg-red-50 text-red-600 border border-red-200 rounded-lg px-3 py-2"></div>
    <form id="loginForm" class="space-y-4">
      ${field('Username', `<input name="username" required autocomplete="off" class="${inputCls}">`)}
      ${field('Password', `<input name="password" type="password" required class="${inputCls}">`)}
      <button class="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg py-2.5 text-sm transition">Login</button>
    </form>
    <p class="mt-4 text-xs text-slate-400 text-center">Akun demo: <b>admin</b> / <b>admin123</b> · <b>user</b> / <b>user123</b></p>
    ${ARTIFACT ? '' : '<p class="mt-3 text-xs text-center"><a href="unduh.html" class="font-medium text-blue-600 hover:underline">Unduh aplikasi ini (gratis, open source) →</a></p>'}
  </div>
  <p class="text-xs text-slate-400 text-center">${esc(COPYRIGHT)}</p>
</div>`;
  }
  function bindLogin() {
    $$('[data-quick]').forEach((b) => (b.onclick = () => login(db.users.find((u) => u.username === b.dataset.quick).id)));
    $('#loginForm').onsubmit = (e) => {
      e.preventDefault();
      const { username, password } = formData(e.target);
      const u = db.users.find((x) => x.username === username.trim() && x.is_active);
      const ok = u && password === (u.demo_password || defaultPassword(u));
      if (!ok) { const el = $('#loginError'); el.textContent = 'Username atau password salah.'; el.classList.remove('hidden'); return; }
      login(u.id);
    };
  }

  // ------------------------------------------------------------------
  // Dashboard (admin)
  // ------------------------------------------------------------------
  PAGES.dashboard = {
    render() {
      const total = db.assets.length;
      const queue = db.tickets.filter((t) => !isCancelled(t) && (t.status === 'Menunggu' || t.status === 'Proses')).length;
      const fixedList = db.tickets.filter((t) => doneAt(t) && localDay(doneAt(t)) === todayStr());
      const fixedToday = fixedList.length;
      const low = db.stockCategories.map((c) => ({ ...c, stock: stockOf(c.id) })).filter((c) => c.stock <= c.min_stock);
      const colors = ['#3b6ff2', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#84cc16'];
      const breakdown = db.categories.map((c, i) => ({ name: c.name, total: db.assets.filter((a) => a.category === c.name).length, color: colors[i % colors.length] })).filter((b) => b.total);
      let acc = 0;
      const grad = breakdown.map((b) => { const s = acc; acc += (b.total / (total || 1)) * 100; return `${b.color} ${s}% ${acc}%`; }).join(', ');
      const ups = upgradeAssets();
      const recent = [...db.tickets].sort((a, b) => b.created_at.localeCompare(a.created_at)).slice(0, 6);

      return `
<div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
  <button type="button" id="btnBreakdown" class="text-left bg-white rounded-xl shadow-sm p-5 border-l-4 border-blue-500 hover:bg-slate-50 transition">
    <div class="flex items-center justify-between"><p class="text-sm text-slate-500">Total Aset</p><span class="text-xs text-slate-400">klik untuk rincian ▾</span></div>
    <p class="text-3xl font-bold text-slate-800 mt-1">${total}</p>
  </button>
  <a href="#/tickets" class="bg-white rounded-xl shadow-sm p-5 border-l-4 border-amber-500 hover:bg-slate-50">
    <p class="text-sm text-slate-500">Antrian Tiket</p><p class="text-3xl font-bold text-slate-800 mt-1">${queue}</p>
  </a>
  <button type="button" id="btnFixed" class="text-left bg-white rounded-xl shadow-sm p-5 border-l-4 border-green-500 hover:bg-slate-50 transition">
    <div class="flex items-center justify-between"><p class="text-sm text-slate-500">Perbaikan Selesai Hari Ini</p><span class="text-xs text-slate-400">klik untuk rincian ▾</span></div>
    <p class="text-3xl font-bold text-slate-800 mt-1">${fixedToday}</p>
  </button>
</div>

<div id="fixedPanel" class="hidden bg-white rounded-xl shadow-sm p-5 mb-4">
  <h3 class="font-semibold text-slate-700 mb-1">Tiket yang diselesaikan hari ini</h3>
  <p class="text-xs text-slate-400 mb-3">Dihitung dari tanggal tiket diselesaikan, bukan tanggal dibuat.</p>
  ${fixedList.length ? `<div class="overflow-x-auto"><table class="w-full text-sm"><thead><tr class="text-left text-slate-500 border-b"><th class="py-2 pr-3">No. Tiket</th><th class="py-2 pr-3">Pelapor</th><th class="py-2 pr-3">Dibuat</th><th class="py-2 pr-3">Selesai</th></tr></thead>
  <tbody>${fixedList.map((t) => `<tr class="border-b last:border-0"><td class="py-2 pr-3 font-medium whitespace-nowrap">${esc(t.ticket_number)}</td><td class="py-2 pr-3">${esc((userById(t.reported_by) || {}).full_name)}</td><td class="py-2 pr-3 text-slate-500 whitespace-nowrap">${fmtDateTime(t.created_at)}</td><td class="py-2 pr-3 text-green-700 whitespace-nowrap">${fmtDateTime(doneAt(t))}</td></tr>`).join('')}</tbody></table></div>` : '<p class="text-sm text-slate-400">Belum ada tiket yang diselesaikan hari ini.</p>'}
</div>

<div id="breakdownPanel" class="hidden bg-white rounded-xl shadow-sm p-5 mb-4">
  <h3 class="font-semibold text-slate-700 mb-3">Rincian per Jenis Aset</h3>
  <div class="flex flex-col sm:flex-row items-center sm:items-start gap-6">
    <div class="relative shrink-0" style="width:170px;height:170px">
      <div class="rounded-full w-full h-full" style="background:conic-gradient(${grad})"></div>
      <div class="absolute inset-0 m-auto rounded-full bg-white flex flex-col items-center justify-center" style="width:100px;height:100px">
        <span class="text-2xl font-bold text-slate-800">${total}</span><span class="text-[11px] text-slate-400">Total Aset</span>
      </div>
    </div>
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full">
      ${breakdown.map((b) => `<div class="flex items-center gap-2 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
        <span class="w-3 h-3 rounded-full shrink-0" style="background:${b.color}"></span>
        <span class="text-sm text-slate-600 truncate flex-1">${esc(b.name)}</span>
        <span class="text-sm font-semibold text-slate-800">${b.total}</span>
        <span class="text-xs text-slate-400 w-12 text-right">${((b.total / total) * 100).toFixed(1)}%</span></div>`).join('')}
    </div>
  </div>
</div>

${low.length ? `<a href="#/stock" class="flex flex-wrap items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-5 py-3 mb-4 hover:bg-amber-100/60 transition">
  <span class="w-9 h-9 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">${icon('package', 'w-5 h-5')}</span>
  <div class="flex-1 min-w-0"><p class="font-semibold text-amber-800">${low.length} barang stok menipis</p>
  <p class="text-xs text-amber-700 truncate">${esc(low.map((s) => `${s.name} (${s.stock} ${s.unit})`).join(', '))}</p></div>
  <span class="text-xs font-medium text-amber-700">Buka Stok Barang →</span></a>` : ''}

${ups.length ? `<div class="bg-red-50 border border-red-200 rounded-xl shadow-sm mb-6 overflow-hidden">
  <button type="button" id="btnUpgrade" class="w-full text-left px-5 py-4 flex items-center gap-3 hover:bg-red-100/50">
    <span class="w-9 h-9 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">${icon('alert', 'w-5 h-5')}</span>
    <div class="flex-1"><p class="font-semibold text-red-700">${ups.length} aset perlu di-upgrade</p>
    <p class="text-xs text-red-500">Dari histori tiket yang mengandung kata "harus upgrade". Klik untuk lihat.</p></div>
  </button>
  <div id="upgradePanel" class="hidden border-t border-red-200 bg-white overflow-x-auto">
    <table class="w-full text-sm"><thead><tr class="text-left text-slate-500 border-b bg-slate-50">
      <th class="py-2 px-4">Aset</th><th class="py-2 px-4">Jenis</th><th class="py-2 px-4">Departement</th><th class="py-2 px-4">No. Tiket</th><th class="py-2 px-4">Catatan</th><th class="py-2 px-4">Tanggal</th><th class="py-2 px-4"></th></tr></thead>
    <tbody>${ups.map((u) => `<tr class="border-b last:border-0 hover:bg-slate-50">
      <td class="py-2 px-4 font-medium"><a href="#" data-asset-detail="${u.asset.id}" class="text-blue-600 hover:underline">${esc(u.asset.device_name || u.asset.asset_number)}</a></td>
      <td class="py-2 px-4">${esc(u.asset.category)}</td><td class="py-2 px-4">${esc(u.asset.department || DASH)}</td>
      <td class="py-2 px-4">${esc(u.ticket.ticket_number)}</td><td class="py-2 px-4 text-slate-500 max-w-xs truncate" title="${esc(u.text)}">${esc(u.text)}</td>
      <td class="py-2 px-4 text-slate-500 whitespace-nowrap">${fmtDate(u.ticket.created_at)}</td>
      <td class="py-2 px-4 text-right"><div class="flex justify-end items-center gap-2">
        <button data-upgrade="${u.asset.id}:${u.ticket.id}" class="inline-flex items-center gap-1 bg-brand-600 hover:bg-brand-700 text-white rounded-lg px-3 py-1.5 text-xs font-medium whitespace-nowrap">${icon('up', 'w-3.5 h-3.5')} Proses Upgrade</button>
        <button data-ack="${u.asset.id}:${u.ticket.id}" title="Tandai selesai tanpa mencatat apa yang di-upgrade" class="inline-flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg px-3 py-1.5 text-xs font-medium whitespace-nowrap">${icon('check', 'w-3.5 h-3.5')} Tandai Selesai</button></div></td>
    </tr>`).join('')}</tbody></table>
  </div>
</div>` : ''}

<div class="bg-white rounded-xl shadow-sm p-5">
  <h2 class="font-semibold text-slate-700 mb-3">Tiket Terbaru</h2>
  <div class="overflow-x-auto"><table class="w-full text-sm">
    <thead><tr class="text-left text-slate-500 border-b"><th class="py-2 pr-3">No. Tiket</th><th class="py-2 pr-3">Pelapor</th><th class="py-2 pr-3">Masalah</th><th class="py-2 pr-3">Status</th><th class="py-2 pr-3">Tanggal</th></tr></thead>
    <tbody>${recent.map((t) => { const st = ticketStatus(t); return `<tr class="border-b last:border-0">
      <td class="py-2 pr-3 font-medium whitespace-nowrap">${esc(t.ticket_number)}</td><td class="py-2 pr-3 whitespace-nowrap">${esc((userById(t.reported_by) || {}).full_name)}</td>
      <td class="py-2 pr-3 max-w-xs truncate">${esc(t.problem_detail)}</td>
      <td class="py-2 pr-3"><span class="px-2 py-0.5 rounded-full text-xs font-medium ${TICKET_BADGE[st]}">${st}</span></td>
      <td class="py-2 pr-3 text-slate-500 whitespace-nowrap">${fmtDateTime(t.created_at)}</td></tr>`; }).join('')}</tbody>
  </table></div>
</div>`;
    },
    bind() {
      $('#btnBreakdown').onclick = () => $('#breakdownPanel').classList.toggle('hidden');
      $('#btnFixed').onclick = () => $('#fixedPanel').classList.toggle('hidden');
      const bu = $('#btnUpgrade'); if (bu) bu.onclick = () => $('#upgradePanel').classList.toggle('hidden');
      $$('[data-upgrade]').forEach((b) => (b.onclick = () => { const [a, t] = b.dataset.upgrade.split(':').map(Number); upgradeForm(a, t); }));
      $$('[data-ack]').forEach((b) => (b.onclick = async () => {
        if (!(await ask('Tandai aset ini sudah selesai di-upgrade?'))) return;
        const [a, t] = b.dataset.ack.split(':').map(Number);
        db.upgradeAck.push({ asset_id: a, ticket_id: t }); save(); render(); toast('Aset ditandai sudah di-upgrade.');
      }));
      $$('[data-asset-detail]').forEach((a) => (a.onclick = (e) => { e.preventDefault(); showAssetDetail(+a.dataset.assetDetail); }));
    },
  };

  // ------------------------------------------------------------------
  // Kartu detail aset (dipakai di Aset Saya & modal detail)
  // ------------------------------------------------------------------
  function assetCard(a) {
    const rows = (pairs) => `<dl class="divide-y divide-slate-100">${pairs.map(([k, v]) => `<div class="asset-field-row"><dt>${k}</dt><dd>${v === '' || v == null ? DASH : v}</dd></div>`).join('')}</dl>`;
    const owners = ownersOf(a.id);
    const history = db.tickets.filter((t) => t.asset_id === a.id).sort((x, y) => y.created_at.localeCompare(x.created_at));
    const sw = (a.software || []).map((s) => `<div>${esc(s.name)}${s.serial ? ' (' + esc(s.serial) + ')' : ''} — ${s.status === 'Original' ? 'Original' : 'Belum Original'}</div>`).join('');
    const isTablet = /tablet/i.test(a.category);
    return `
<div class="bg-white rounded-2xl shadow-sm overflow-hidden">
  <div class="bg-gradient-to-r from-brand-600 to-brand-700 px-5 py-5 text-white flex items-center justify-between gap-4 flex-wrap">
    <div class="flex items-center gap-3 min-w-0">
      <div class="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center shrink-0">${categoryIcon(a.category)}</div>
      <div class="min-w-0"><h2 class="font-semibold text-lg truncate">${esc(a.device_name || a.asset_number)}</h2><p class="text-brand-100 text-sm truncate">${esc(a.asset_number)}</p></div>
    </div>
    <span class="px-3 py-1 rounded-full text-xs font-semibold ${ASSET_STATUS_BADGE[a.status]}">${esc(a.status)}</span>
  </div>
  <div class="flex justify-end gap-2 px-4 pt-3">
    ${isAdmin() ? `<button data-upgrade-asset="${a.id}" class="inline-flex items-center gap-1 bg-brand-50 hover:bg-brand-100 text-brand-700 rounded-lg px-3 py-1.5 text-xs font-medium">${icon('up', 'w-3.5 h-3.5')} Catat Upgrade</button>` : ''}
    ${ARTIFACT ? '' : `<button data-print-asset="${a.id}" class="inline-flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg px-3 py-1.5 text-xs font-medium">${icon('printer', 'w-3.5 h-3.5')} Print</button>`}
  </div>
  <div class="px-4 pt-3"><div class="flex gap-1 overflow-x-auto">
    ${[['General', 'tGeneral'], ['Hardware', 'tHardware'], ['Network', 'tNetwork'], ['System', 'tSystem'], ['Riwayat', 'tHistory']].map(([l, id], i) => `<button type="button" class="asset-tab-btn ${i === 0 ? 'asset-tab-active' : ''}" data-tab="${id}">${l}</button>`).join('')}
  </div></div>
  <div class="p-5">
    <div data-panel="tGeneral">${rows([
      ['Nomor Aset', esc(a.asset_number)], ['Jenis Aset', esc(a.category)], ['Nama Perangkat', esc(a.device_name)],
      ['Pengguna', esc(owners.map((o) => o.full_name).join(', '))], ['Departement', esc(a.department)], ['Jabatan', esc(positionsOf(a.id))], ['Email Pengguna', esc(a.owner_email)],
      ['Lokasi', esc(a.location)], ['Serial Number', esc(a.serial_number)], [isTablet ? 'Received Date' : 'Tanggal Pembelian', a.purchase_date ? fmtDate(a.purchase_date) : ''],
      ...(isTablet ? [['ID Tablet', esc(a.tablet_id)], ['Kondisi', esc(a.tablet_condition)]] : []),
    ])}</div>
    <div data-panel="tHardware" class="hidden">${rows([['Processor', esc(a.processor)], ['Motherboard / Brand', esc(a.motherboard_brand)], ['RAM', esc(a.ram)], ['Storage', esc(a.storage)], ['Monitor', esc(a.monitor_info)], ['Printer', esc(a.printer_info)], ['Aksesoris', esc(accText(a))]])}</div>
    <div data-panel="tNetwork" class="hidden">${rows([['IP Address', esc(a.ip_address)], ['Hostname', esc(a.hostname)]])}</div>
    <div data-panel="tSystem" class="hidden">${rows([['Sistem Operasi', esc(a.os_name)], ['Status Lisensi OS', a.os_status === 'Original' ? 'Original' : 'Belum Original'], ['Software Terpasang', sw ? `<div class="space-y-1">${sw}</div>` : ''], ['Tanggal Input', fmtDate(a.created_at)]])}</div>
    <div data-panel="tHistory" class="hidden">${upgradeHistoryHtml(a.id)}${upgradesOf(a.id).length ? '<p class="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Riwayat Tiket</p>' : ''}${history.length ? `<div class="space-y-3">${history.map((t) => { const w = workOf(t.id); const st = ticketStatus(t); return `
      <div class="rounded-xl border border-slate-100 bg-slate-50 p-3">
        <div class="flex items-center justify-between gap-2 mb-1"><span class="text-sm font-medium text-slate-700">${esc(t.ticket_number)}</span>
        <span class="text-xs px-2 py-0.5 rounded-full ${TICKET_BADGE[st]}">${st}</span></div>
        <p class="text-xs text-slate-400 mb-1">${fmtDateTime(t.created_at)}</p>
        <p class="text-xs text-slate-600"><b>Masalah:</b> ${esc(t.problem_detail)}</p>
        ${w && w.work_detail ? `<p class="text-xs text-slate-600 mt-1"><b>Pengerjaan:</b> ${esc(w.work_detail)}</p>` : ''}
        ${w && w.asset_check ? `<p class="text-xs text-slate-600 mt-1"><b>Hasil Pengecekan:</b> ${esc(w.asset_check)}</p>` : ''}
      </div>`; }).join('')}</div>` : '<p class="text-sm text-slate-400 text-center py-6">Belum ada riwayat perbaikan.</p>'}</div>
  </div>
</div>`;
  }
  function bindAssetCard(root) {
    $$('.asset-tab-btn', root).forEach((b) => (b.onclick = () => {
      $$('.asset-tab-btn', root).forEach((x) => x.classList.toggle('asset-tab-active', x === b));
      $$('[data-panel]', root).forEach((p) => p.classList.toggle('hidden', p.dataset.panel !== b.dataset.tab));
    }));
    $$('[data-print-asset]', root).forEach((b) => (b.onclick = () => printAsset(+b.dataset.printAsset)));
    $$('[data-upgrade-asset]', root).forEach((b) => (b.onclick = () => upgradeForm(+b.dataset.upgradeAsset, null)));
  }
  function showAssetDetail(id, startTab) {
    const a = assetById(id);
    if (!a) return;
    openModal('Detail Aset', assetCard(a), { wide: true, onMount(root) {
      bindAssetCard(root);
      if (startTab) { const b = $(`.asset-tab-btn[data-tab="${startTab}"]`, root); if (b) b.click(); }
    } });
  }
  function printAsset(id) {
    const a = assetById(id);
    const w = window.open('', '_blank');
    if (!w) { toast('Pop-up diblokir browser. Izinkan pop-up untuk mencetak.', false); return; }
    const row = (k, v) => `<tr><td style="padding:4px 8px;color:#555;width:40%">${k}</td><td style="padding:4px 8px">${esc(v || DASH)}</td></tr>`;
    w.document.write(`<!DOCTYPE html><html><head><title>${esc(a.asset_number)}</title><meta charset="utf-8"></head>
      <body style="font-family:Arial,sans-serif;font-size:13px;max-width:700px;margin:24px auto">
      <div style="font-size:17px;font-weight:bold;color:#1F3DD1">${esc(appName())}</div><div style="color:#777;margin-bottom:12px">Detail Aset IT</div>
      <table style="width:100%;border-collapse:collapse;border:1px solid #ddd">
      ${row('Nomor Aset', a.asset_number)}${row('Jenis', a.category)}${row('Nama Perangkat', a.device_name)}${row('Pengguna', ownersOf(a.id).map((o) => o.full_name).join(', '))}
      ${row('Departement', a.department)}${row('Lokasi', a.location)}${row('IP Address', a.ip_address)}${row('Hostname', a.hostname)}
      ${row('Processor', a.processor)}${row('RAM', a.ram)}${row('Storage', a.storage)}${row('OS', a.os_name)}${row('Serial Number', a.serial_number)}${row('Status', a.status)}
      </table>
      ${upgradesOf(a.id).length ? `<div style="font-weight:bold;margin:16px 0 6px">Riwayat Upgrade</div><table style="width:100%;border-collapse:collapse;border:1px solid #ddd;font-size:12px">
        ${upgradesOf(a.id).map((l) => `<tr><td style="padding:4px 8px;border-bottom:1px solid #eee;width:22%;vertical-align:top">${fmtDate(l.date)}</td>
        <td style="padding:4px 8px;border-bottom:1px solid #eee">${l.items.map((i) => `${esc(i.label)}: ${i.before ? esc(i.before) + ' &rarr; ' : ''}<b>${esc(i.after)}</b>`).join('<br>')}${l.notes ? `<div style="color:#666">${esc(l.notes)}</div>` : ''}</td>
        <td style="padding:4px 8px;border-bottom:1px solid #eee;width:22%;vertical-align:top">${esc(l.by)}</td></tr>`).join('')}</table>` : ''}<p style="color:#999;font-size:11px;margin-top:16px">Dokumen ini dibuat otomatis oleh ${esc(appName())} (demo).<br>${esc(COPYRIGHT)}</p>
      <script>window.onload=function(){window.print()}<\/script></body></html>`);
    w.document.close();
  }

  // ------------------------------------------------------------------
  // Upgrade Aset: isi apa yang di-upgrade, data aset ikut berubah, riwayat tercatat
  // ------------------------------------------------------------------
  const UPGRADE_FIELDS = [
    { key: 'ram', label: 'RAM' }, { key: 'storage', label: 'Storage' }, { key: 'processor', label: 'Processor' },
    { key: 'motherboard_brand', label: 'Motherboard / Brand' }, { key: 'monitor_info', label: 'Monitor' },
    { key: 'printer_info', label: 'Printer' }, { key: 'accessories', label: 'Aksesoris' }, { key: 'os_name', label: 'Sistem Operasi' },
    { key: 'os_status', label: 'Status Lisensi OS', options: ['Original', 'Belum Original'] },
    { key: '__software', label: 'Software baru (ditambahkan ke daftar software)' },
    { key: '__other', label: 'Lainnya, mis. PSU (dicatat di riwayat)' },
  ];
  const upgradesOf = (assetId) => db.upgradeLogs.filter((l) => l.asset_id === assetId).sort((x, y) => y.date.localeCompare(x.date) || y.id - x.id);
  function upgradeHistoryHtml(assetId, highlightId) {
    const logs = upgradesOf(assetId);
    if (!logs.length) return '';
    return `<p class="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Riwayat Upgrade</p><div class="space-y-3 mb-5">${logs.map((l) => {
      const t = l.ticket_id ? db.tickets.find((x) => x.id === l.ticket_id) : null;
      return `<div class="rounded-xl border border-brand-200 bg-brand-50/60 p-3 ${l.id === highlightId ? 'ring-2 ring-brand-300' : ''}">
        <div class="flex items-center justify-between gap-2 mb-1 flex-wrap"><span class="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700">${icon('up')} Upgrade</span><span class="text-xs text-slate-500">${fmtDate(l.date)}</span></div>
        <ul class="text-xs text-slate-700 space-y-0.5 my-2">${l.items.map((i) => `<li><b>${esc(i.label)}:</b> ${i.before ? `<span class="text-slate-400 line-through">${esc(i.before)}</span> &rarr; ` : ''}<span class="font-semibold text-slate-800">${esc(i.after)}</span></li>`).join('')}</ul>
        ${l.notes ? `<p class="text-xs text-slate-600"><b>Keterangan:</b> ${esc(l.notes)}</p>` : ''}
        <p class="text-xs text-slate-400 mt-1">Oleh ${esc(l.by)} &middot; ${t ? 'dari tiket ' + esc(t.ticket_number) : 'tanpa tiket'}</p></div>`;
    }).join('')}</div>`;
  }
  // Saran isian dari catatan tiket, mis. "RAM 4 GB ... harus upgrade ke 8 GB" -> RAM: 8 GB
  function suggestUpgrade(text) {
    const t = ' ' + String(text || '').toLowerCase() + ' ';
    const m = String(text || '').match(/\bke\s+([^.,;\n]+)/i);
    const after = m ? m[1].trim() : '';
    const rows = [];
    if (/\bram\b|memori/.test(t)) { const g = after.match(/(\d+)\s*gb/i); rows.push({ key: 'ram', after: g ? g[1] + ' GB' : after }); }
    if (/\bssd\b|\bhdd\b|storage|hardisk|nvme/.test(t)) { let v = after; if (v && !/ssd|hdd|nvme/i.test(v) && t.includes('ssd')) v = 'SSD ' + v; rows.push({ key: 'storage', after: v.replace(/\s*gb\b/i, ' GB') }); }
    if (/windows|lisensi|\bos\b/.test(t)) {
      const w = after.match(/windows[^.,;\n]*/i); if (w) rows.push({ key: 'os_name', after: w[0].trim() });
      if (/original|lisensi/.test(t)) rows.push({ key: 'os_status', after: 'Original' });
    }
    if (/\bpsu\b|power supply/.test(t)) rows.push({ key: '__other', label: 'PSU', after: '' });
    return rows;
  }
  function upgradeForm(assetId, ticketId) {
    const a = assetById(assetId);
    if (!a) return;
    const t = ticketId ? db.tickets.find((x) => x.id === ticketId) : null;
    const w = t ? (workOf(t.id) || {}) : {};
    const note = t ? ([w.asset_check, w.work_detail, t.problem_detail].find((x) => String(x || '').toLowerCase().includes('harus upgrade')) || w.asset_check || t.problem_detail) : '';
    const seed = (note && suggestUpgrade(note)) || [];
    if (!seed.length) seed.push({ key: 'ram', after: '' });
    const cur = (k) => (k.startsWith('__') ? '' : String(a[k] || ''));
    const body = `<form id="upForm" class="space-y-4">
      <div class="rounded-xl bg-slate-50 border border-slate-100 p-3 text-sm"><p class="font-semibold text-slate-800">${esc(a.device_name || a.asset_number)} <span class="font-normal text-slate-400">${esc(a.asset_number)}</span></p>
        <p class="text-xs text-slate-500">${esc([a.processor, a.ram, a.storage, a.os_name].filter(Boolean).join(' / '))}</p></div>
      ${t ? `<div class="rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-xs text-red-700"><b>${esc(t.ticket_number)}</b> &middot; ${esc(note)}</div>` : ''}
      <div><div class="flex items-center justify-between mb-2"><p class="text-sm font-semibold text-slate-700">Yang di-upgrade</p>
        <button type="button" id="upAdd" class="text-xs font-medium text-blue-600 inline-flex items-center gap-1">${icon('plus', 'w-3.5 h-3.5')} Tambah komponen</button></div>
        <div class="hidden sm:grid grid-cols-12 gap-2 text-[11px] uppercase tracking-wider text-slate-400 font-semibold px-1 mb-1"><span class="col-span-4">Komponen</span><span class="col-span-3">Sebelum</span><span class="col-span-4">Sesudah</span></div>
        <div id="upRows" class="space-y-2"></div>
        <p class="text-xs text-slate-400 mt-2">"Sebelum" diambil dari data aset. Nilai "Sesudah" menggantikan data aset saat disimpan.</p></div>
      <div class="grid sm:grid-cols-2 gap-3">
        ${field('Tanggal Upgrade', `<input type="date" id="upDate" value="${todayStr()}" class="${inputCls}">`)}
        ${field('Dikerjakan oleh', `<input value="${esc(currentUser().full_name)}" readonly class="${inputCls} bg-slate-50 text-slate-500">`)}
      </div>
      ${field('Keterangan', `<textarea id="upNotes" rows="2" class="${inputCls}" placeholder="Contoh: RAM lama disimpan di gudang IT sebagai cadangan"></textarea>`)}
      ${t ? `<label class="flex items-start gap-2 text-sm text-slate-600"><input type="checkbox" id="upDone" checked class="mt-0.5"><span>Tandai tiket <b>${esc(t.ticket_number)}</b> selesai di-upgrade (hilang dari daftar Dashboard)</span></label>` : ''}
      <p id="upErr" class="hidden text-sm bg-red-50 text-red-700 rounded-lg px-3 py-2"></p>
      <div class="modal-actions flex justify-end gap-2 pt-2 border-t"><button type="button" data-close class="${btnGhost}">Batal</button><button class="${btnPrimary}">${icon('check')} Simpan Upgrade</button></div>
    </form>`;
    openModal(t ? 'Proses Upgrade Aset' : 'Catat Upgrade Aset', body, {
      wide: true,
      onMount(root) {
        const rows = $('#upRows', root);
        const addRow = (init = {}) => {
          const div = document.createElement('div');
          div.className = 'up-row grid grid-cols-12 gap-2 items-start rounded-lg sm:rounded-none bg-slate-50 sm:bg-transparent p-2 sm:p-0';
          div.innerHTML = `<div class="col-span-12 sm:col-span-4 space-y-1"><select data-k class="${inputCls}">${UPGRADE_FIELDS.map((f) => `<option value="${f.key}">${esc(f.label)}</option>`).join('')}</select>
              <input data-l placeholder="Nama komponen, mis. PSU" class="${inputCls}"></div>
            <div class="col-span-12 sm:col-span-3" data-b></div><div class="col-span-10 sm:col-span-4" data-a></div>
            <div class="col-span-2 sm:col-span-1 flex justify-end"><button type="button" data-del class="p-2 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600">${icon('x')}</button></div>`;
          rows.appendChild(div);
          const sel = $('[data-k]', div);
          if (init.key) sel.value = init.key;
          const sync = (first) => {
            const f = UPGRADE_FIELDS.find((x) => x.key === sel.value);
            const other = f.key === '__other', sw = f.key === '__software';
            $('[data-l]', div).style.display = other ? '' : 'none';
            if (first && other) $('[data-l]', div).value = init.label || '';
            $('[data-b]', div).innerHTML = sw ? `<select data-sws class="${inputCls}"><option>Original</option><option>Belum Original</option></select>`
              : `<input data-bv class="${inputCls} ${other ? '' : 'bg-slate-50 text-slate-500'}" ${other ? 'placeholder="Kondisi sebelum"' : 'readonly'} value="${esc(other ? '' : cur(f.key) || '-')}">`;
            const prev = first ? init.after || '' : '';
            $('[data-a]', div).innerHTML = f.options ? `<select data-av class="${inputCls}">${options(f.options, prev || f.options[0])}</select>`
              : `<input data-av class="${inputCls}" placeholder="${sw ? 'Nama software baru' : 'Nilai baru'}" value="${esc(prev)}">`;
          };
          sel.onchange = () => sync(false);
          sync(true);
          $('[data-del]', div).onclick = () => { if (rows.children.length > 1) div.remove(); };
        };
        seed.forEach(addRow);
        $('#upAdd', root).onclick = () => addRow({ key: 'storage' });
        $('#upForm', root).onsubmit = (e) => {
          e.preventDefault();
          const err = (m) => { const el = $('#upErr', root); el.textContent = m; el.classList.remove('hidden'); };
          const items = [];
          const seen = {};
          for (const div of $$('.up-row', root)) {
            const key = $('[data-k]', div).value, f = UPGRADE_FIELDS.find((x) => x.key === key);
            const after = $('[data-av]', div).value.trim();
            let label = f.label, before = cur(key);
            if (key === '__other') { label = $('[data-l]', div).value.trim(); before = $('[data-bv]', div).value.trim(); if (!label) return err('Isi nama komponen untuk baris "Lainnya".'); }
            if (key === '__software') { label = 'Software'; before = ''; }
            if (!after) return err(`Isi nilai "Sesudah" untuk ${label}.`);
            if (after === before) return err(`Nilai baru ${label} sama dengan sebelumnya.`);
            if (!key.startsWith('__')) { if (seen[key]) return err(`${label} dipilih dua kali.`); seen[key] = 1; }
            items.push({ key, label, before, after, sws: key === '__software' ? $('[data-sws]', div).value : '' });
          }
          items.forEach((i) => {
            if (i.key === '__software') a.software = [...(a.software || []), { name: i.after, serial: '', status: i.sws }];
            else if (!i.key.startsWith('__')) a[i.key] = i.after;
          });
          const log = { id: nextId(db.upgradeLogs), asset_id: a.id, ticket_id: t ? t.id : null, date: $('#upDate', root).value || todayStr(),
            notes: $('#upNotes', root).value.trim(), by: currentUser().full_name, items: items.map(({ key, label, before, after }) => ({ key, label, before, after })) };
          db.upgradeLogs.push(log);
          if (t && $('#upDone', root).checked && !db.upgradeAck.some((k) => k.asset_id === a.id && k.ticket_id === t.id)) db.upgradeAck.push({ asset_id: a.id, ticket_id: t.id });
          save(); closeModal(); render();
          toast(`Upgrade ${a.device_name || a.asset_number} tersimpan. Data aset sudah diperbarui.`);
          showAssetDetail(a.id, 'tHistory');
        };
      },
    });
  }

  // ------------------------------------------------------------------
  // Aset (admin)
  // ------------------------------------------------------------------
  const assetFilter = { q: '', cat: '', dept: '', status: '', page: 1 };
  const PER_PAGE = 15;
  function filteredAssets() {
    const q = assetFilter.q.toLowerCase();
    return db.assets.filter((a) => {
      if (assetFilter.cat && a.category !== assetFilter.cat) return false;
      if (assetFilter.dept && a.department !== assetFilter.dept) return false;
      if (assetFilter.status && a.status !== assetFilter.status) return false;
      if (!q) return true;
      const hay = [a.asset_number, a.device_name, a.hostname, a.ip_address, a.serial_number, a.location, a.department, ownersOf(a.id).map((o) => o.full_name).join(' ')].join(' ').toLowerCase();
      return hay.includes(q);
    }).sort((a, b) => b.id - a.id);
  }
  function assetRows() {
    const list = filteredAssets();
    const pages = Math.max(1, Math.ceil(list.length / PER_PAGE));
    assetFilter.page = Math.min(assetFilter.page, pages);
    const slice = list.slice((assetFilter.page - 1) * PER_PAGE, assetFilter.page * PER_PAGE);
    const body = slice.map((a) => {
      const owners = ownersOf(a.id);
      const spec = [a.processor, a.ram, a.storage].filter(Boolean).join(' / ');
      return `<tr class="border-b last:border-0 hover:bg-slate-50">
        <td class="asset-col-no py-2 px-3 font-medium whitespace-nowrap"><a href="#" data-detail="${a.id}" class="text-blue-600 hover:underline">${esc(a.asset_number)}</a><div class="text-xs text-slate-400 font-normal">${esc(a.device_name || '')}</div></td>
        <td class="py-2 px-3 whitespace-nowrap">${esc(a.category)}</td>
        <td class="py-2 px-3 whitespace-nowrap">${esc(owners.map((o) => o.full_name).join(', ') || DASH)}</td>
        <td class="py-2 px-3 whitespace-nowrap">${esc(a.department || DASH)}</td>
        <td class="py-2 px-3 whitespace-nowrap">${esc(positionsOf(a.id) || DASH)}</td>
        <td class="py-2 px-3 whitespace-nowrap">${esc(a.ip_address || DASH)}</td>
        <td class="py-2 px-3 whitespace-nowrap">${esc(a.hostname || DASH)}</td>
        <td class="py-2 px-3 whitespace-nowrap">${esc(a.location || DASH)}</td>
        <td class="py-2 px-3 min-w-[12rem] text-xs text-slate-600">${esc(spec || DASH)}</td>
        <td class="py-2 px-3 whitespace-nowrap">${esc(a.os_name || DASH)}${a.os_name ? `<div class="text-xs ${a.os_status === 'Original' ? 'text-green-600' : 'text-red-500'}">${a.os_status}</div>` : ''}</td>
        <td class="py-2 px-3"><span class="px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${ASSET_STATUS_BADGE[a.status]}">${esc(a.status)}</span></td>
        <td class="py-2 px-3 whitespace-nowrap text-right">
          <button data-edit="${a.id}" class="p-1.5 rounded-lg text-slate-500 hover:bg-blue-50 hover:text-blue-600" title="Edit">${icon('pencil')}</button>
          <button data-upg="${a.id}" class="p-1.5 rounded-lg text-slate-500 hover:bg-brand-50 hover:text-brand-600" title="Catat Upgrade">${icon('up')}</button>
          ${ARTIFACT ? '' : `<button data-print="${a.id}" class="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100" title="Print">${icon('printer')}</button>`}
          <button data-del="${a.id}" class="p-1.5 rounded-lg text-slate-500 hover:bg-red-50 hover:text-red-600" title="Hapus">${icon('trash')}</button>
        </td></tr>`;
    }).join('') || `<tr><td colspan="12" class="py-8 text-center text-slate-400">Tidak ada aset yang cocok.</td></tr>`;
    const pager = `<div class="flex items-center justify-between gap-2 px-4 py-3 text-sm text-slate-500 border-t">
      <span>${list.length} aset</span>
      <div class="flex items-center gap-1">
        <button data-page="${assetFilter.page - 1}" ${assetFilter.page <= 1 ? 'disabled' : ''} class="px-3 py-1 rounded-lg border disabled:opacity-40">‹</button>
        <span class="px-2">${assetFilter.page} / ${pages}</span>
        <button data-page="${assetFilter.page + 1}" ${assetFilter.page >= pages ? 'disabled' : ''} class="px-3 py-1 rounded-lg border disabled:opacity-40">›</button>
      </div></div>`;
    return { body, pager };
  }
  PAGES.assets = {
    render() {
      const { body, pager } = assetRows();
      const sel = (id, list, val, empty) => `<select id="${id}" class="border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white">${options(list, val, empty)}</select>`;
      return `
<div class="bg-white rounded-xl shadow-sm mb-4 p-3 flex flex-wrap items-center gap-2">
  <div class="relative flex-1 min-w-[12rem]">
    <span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">${icon('search')}</span>
    <input id="fQ" value="${esc(assetFilter.q)}" placeholder="Cari no. aset, nama, IP, hostname, pengguna…" class="w-full border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-sm">
  </div>
  ${sel('fCat', db.categories.map((c) => c.name), assetFilter.cat, 'Semua Jenis')}
  ${sel('fDept', db.departments, assetFilter.dept, 'Semua Departement')}
  ${sel('fStatus', Object.keys(ASSET_STATUS), assetFilter.status, 'Semua Status')}
  ${ARTIFACT ? '' : `<button id="btnExport" class="${btnGhost}">${icon('download')} Export CSV</button>`}
  <button id="btnImportAU" class="${btnGhost}">${icon('upload')} Import Aset + User</button>
  <button id="btnAddAsset" class="${btnPrimary}">${icon('plus')} Tambah Aset</button>
</div>
<div class="bg-white rounded-xl shadow-sm">
  <div class="asset-table-wrap"><table class="w-full text-sm">
    <thead><tr class="text-left text-slate-500">
      <th class="asset-col-no py-2.5 px-3">No. Aset</th><th class="py-2.5 px-3">Jenis</th><th class="py-2.5 px-3">Pengguna</th><th class="py-2.5 px-3">Departement</th><th class="py-2.5 px-3">Jabatan</th>
      <th class="py-2.5 px-3">IP</th><th class="py-2.5 px-3">Hostname</th><th class="py-2.5 px-3">Lokasi</th><th class="py-2.5 px-3">Spesifikasi</th><th class="py-2.5 px-3">OS</th><th class="py-2.5 px-3">Status</th><th class="py-2.5 px-3 text-right">Aksi</th>
    </tr></thead>
    <tbody id="assetBody">${body}</tbody>
  </table></div>
  <div id="assetPager">${pager}</div>
</div>`;
    },
    bind() {
      const refresh = () => { const { body, pager } = assetRows(); $('#assetBody').innerHTML = body; $('#assetPager').innerHTML = pager; bindRows(); };
      const bindRows = () => {
        $$('[data-detail]').forEach((a) => (a.onclick = (e) => { e.preventDefault(); showAssetDetail(+a.dataset.detail); }));
        $$('[data-edit]').forEach((b) => (b.onclick = () => assetForm(+b.dataset.edit)));
        $$('[data-upg]').forEach((b) => (b.onclick = () => upgradeForm(+b.dataset.upg, null)));
        $$('[data-print]').forEach((b) => (b.onclick = () => printAsset(+b.dataset.print)));
        $$('[data-del]').forEach((b) => (b.onclick = async () => {
          const a = assetById(+b.dataset.del);
          if (!(await ask(`Hapus aset ${a.asset_number}?`))) return;
          db.assets = db.assets.filter((x) => x.id !== a.id);
          db.assetOwners = db.assetOwners.filter((o) => o.asset_id !== a.id);
          db.tickets.forEach((t) => { if (t.asset_id === a.id) t.asset_id = null; });
          save(); refresh(); toast('Aset dihapus.');
        }));
        $$('[data-page]').forEach((b) => (b.onclick = () => { assetFilter.page = +b.dataset.page; refresh(); }));
      };
      $('#fQ').oninput = (e) => { assetFilter.q = e.target.value; assetFilter.page = 1; refresh(); };
      $('#fCat').onchange = (e) => { assetFilter.cat = e.target.value; assetFilter.page = 1; refresh(); };
      $('#fDept').onchange = (e) => { assetFilter.dept = e.target.value; assetFilter.page = 1; refresh(); };
      $('#fStatus').onchange = (e) => { assetFilter.status = e.target.value; assetFilter.page = 1; refresh(); };
      $('#btnAddAsset').onclick = () => assetForm(null);
      $('#btnImportAU').onclick = () => importAssetUserModal();
      if ($('#btnExport')) $('#btnExport').onclick = () => {
        const rows = [['No. Aset', 'Jenis', 'Nama Perangkat', 'Pengguna', 'Jabatan', 'Departement', 'Email', 'IP', 'Hostname', 'Lokasi', 'Processor', 'RAM', 'Storage', 'OS', 'Status OS', 'Serial Number', 'Tanggal Pembelian', 'Status']];
        filteredAssets().forEach((a) => rows.push([a.asset_number, a.category, a.device_name, ownersOf(a.id).map((o) => o.full_name).join(', '), positionsOf(a.id), a.department, a.owner_email, a.ip_address, a.hostname, a.location, a.processor, a.ram, a.storage, a.os_name, a.os_status, a.serial_number, a.purchase_date, a.status]));
        downloadCsv('aset_it_demo.csv', rows);
      };
      bindRows();
    },
  };

  function assetForm(id) {
    const a = id ? clone(assetById(id)) : { category: db.categories[0].name, status: 'Stok', os_status: 'Belum Original', software: [], tablet_condition: 'Bagus' };
    const owners = id ? ownersOf(id).map((u) => u.id) : [];
    const activeUsers = db.users.filter((u) => u.is_active).sort((x, y) => x.full_name.localeCompare(y.full_name));
    const inp = (name, extra = '') => `<input name="${name}" value="${esc(a[name] || '')}" class="${inputCls}" ${extra}>`;
    const swRow = (s = {}) => `<div class="sw-row grid grid-cols-12 gap-2">
      <input data-sw="name" value="${esc(s.name || '')}" placeholder="Nama software" class="${inputCls} col-span-5">
      <input data-sw="serial" value="${esc(s.serial || '')}" placeholder="Serial" class="${inputCls} col-span-3">
      <select data-sw="status" class="${inputCls} col-span-3">${options(['Original', 'Belum Original'], s.status || 'Original')}</select>
      <button type="button" data-sw-del class="col-span-1 text-slate-400 hover:text-red-600 flex items-center justify-center">${icon('x')}</button></div>`;
    const accRow = (x = {}) => `<div class="acc-row grid grid-cols-12 gap-2">
      <input data-acc="name" value="${esc(x.name || '')}" placeholder="Nama, mis. Charger" class="${inputCls} col-span-5">
      <input data-acc="brand" value="${esc(x.brand || '')}" placeholder="Brand / Type, mis. ASUS 45W" class="${inputCls} col-span-6">
      <button type="button" data-acc-del class="col-span-1 text-slate-400 hover:text-red-600 flex items-center justify-center">${icon('x')}</button></div>`;
    const body = `
<form id="assetForm" class="space-y-4">
  <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
    ${field('Jenis Aset', `<select name="category" id="fmCat" class="${inputCls}">${options(db.categories.map((c) => c.name), a.category)}</select>`)}
    ${field('Status', `<select name="status" class="${inputCls}">${options(Object.keys(ASSET_STATUS), a.status)}</select>`)}
    ${field('Pengguna', `<select name="owner" id="fmOwner" class="${inputCls}">${options(activeUsers.map((u) => ({ value: u.id, label: `${u.full_name} (${u.department || '-'})` })), owners[0] || '', '— Tidak ada (Stok) —')}</select>`)}
    ${field('Departement', `<select name="department" id="fmDept" class="${inputCls}">${options(db.departments, a.department, '—')}</select>`)}
    ${field('Lokasi', inp('location', 'id="fmLoc" placeholder="mis. Lantai 2 / Line 1"'))}
    ${field('Nomor Aset', id ? `<div class="flex gap-2"><input name="asset_number" id="fmNo" value="${esc(a.asset_number || '')}" class="${inputCls}"><button type="button" id="btnGen" class="shrink-0 bg-slate-100 hover:bg-slate-200 rounded-lg px-3 text-xs font-medium">Buatkan Otomatis</button></div>
      <p class="text-xs text-slate-400 mt-1">Boleh diubah. Kosongkan untuk tetap memakai nomor lama.</p>` : `<input name="asset_number" id="fmNo" readonly tabindex="-1" placeholder="Otomatis saat disimpan" class="${inputCls} bg-slate-50 text-slate-500 cursor-not-allowed">
      <p class="text-xs text-slate-400 mt-1">Dibuat otomatis saat Simpan: ${esc(prefix())}/Departement/Jenis/Urutan</p>`)}
    ${field('Nama Perangkat', inp('device_name'))}
    ${field('Email Pengguna', inp('owner_email', 'id="fmEmail" type="email"'))}
    ${field('IP Address', inp('ip_address'))}
    ${field('Hostname', inp('hostname'))}
    ${field('Processor', inp('processor'))}
    ${field('Motherboard / Brand Type', inp('motherboard_brand'))}
    ${field('RAM', inp('ram'))}
    ${field('Storage', inp('storage'))}
    ${field('Sistem Operasi', inp('os_name'))}
    ${field('Status OS', `<select name="os_status" class="${inputCls}">${options(['Original', 'Belum Original'], a.os_status)}</select>`)}
    ${field('Serial Number', inp('serial_number'))}
    ${field('Tanggal Pembelian', `<input type="date" name="purchase_date" value="${esc(a.purchase_date || '')}" class="${inputCls}">`)}
    ${field('Monitor', inp('monitor_info'))}
    ${field('Printer', inp('printer_info'))}
  </div>
  <div id="tabletBox" class="${/tablet/i.test(a.category) ? '' : 'hidden'} grid grid-cols-1 sm:grid-cols-2 gap-3 rounded-lg bg-blue-50 p-3">
    ${field('ID Tablet', inp('tablet_id', 'maxlength="50"'))}
    ${field('Status Condition', `<select name="tablet_condition" class="${inputCls}">${options(['Bagus', 'Rusak'], a.tablet_condition || 'Bagus')}</select>`)}
  </div>
  <div>
    <div class="flex items-center justify-between mb-1"><label class="text-sm font-medium text-slate-600">Software Terpasang</label>
    <button type="button" id="btnSwAdd" class="text-xs font-medium text-blue-600 inline-flex items-center gap-1">${icon('plus', 'w-3.5 h-3.5')} Tambah</button></div>
    <div id="swList" class="space-y-2">${(a.software || []).map(swRow).join('')}</div>
  </div>
  <div>
    <div class="flex items-center justify-between mb-1"><label class="text-sm font-medium text-slate-600">Aksesoris</label>
    <button type="button" id="btnAccAdd" class="text-xs font-medium text-blue-600 inline-flex items-center gap-1">${icon('plus', 'w-3.5 h-3.5')} Tambah</button></div>
    <div id="accList" class="space-y-2">${(accItems(a).length ? accItems(a) : (a.accessories ? [{ name: a.accessories, brand: '' }] : [])).map(accRow).join('')}</div>
  </div>
  <div class="modal-actions flex justify-end gap-2 pt-2 border-t">
    <button type="button" data-close class="${btnGhost}">Batal</button>
    <button class="${btnPrimary}">${icon('check')} Simpan</button>
  </div>
</form>`;
    openModal(id ? 'Edit Aset' : 'Tambah Aset', body, {
      wide: true,
      onMount(root) {
        const f = $('#assetForm', root);
        $('#fmOwner', root).onchange = (e) => {
          const u = userById(+e.target.value);
          if (u) { $('#fmDept', root).value = u.department || ''; if (!$('#fmEmail', root).value) $('#fmEmail', root).value = u.email || ''; f.status.value = 'Digunakan'; }
        };
        $('#fmCat', root).onchange = (e) => $('#tabletBox', root).classList.toggle('hidden', !/tablet/i.test(e.target.value));
        $('#btnAccAdd', root).onclick = () => { $('#accList', root).insertAdjacentHTML('beforeend', accRow()); };
        $('#accList', root).onclick = (e) => { const b = e.target.closest('[data-acc-del]'); if (b) b.closest('.acc-row').remove(); };
        if ($('#btnGen', root)) $('#btnGen', root).onclick = () => {
          const n = nextAssetNumber(f.category.value, f.department.value, f.location.value, id);
          if (!n) { toast('Untuk Tablet, isi Lokasi (Line) dulu.', false); return; }
          $('#fmNo', root).value = n;
        };
        $('#btnSwAdd', root).onclick = () => { $('#swList', root).insertAdjacentHTML('beforeend', swRow()); };
        $('#swList', root).onclick = (e) => { const b = e.target.closest('[data-sw-del]'); if (b) b.closest('.sw-row').remove(); };
        f.onsubmit = (e) => {
          e.preventDefault();
          const d = formData(f);
          let no = (d.asset_number || '').trim();
          if (!id) { // aset baru: nomor selalu dibuat otomatis saat disimpan
            no = nextAssetNumber(d.category, d.department, d.location, null);
            if (!no) { toast('Untuk Tablet, isi Lokasi (Line) dulu supaya nomor aset bisa dibuat.', false); return; }
          } else if (!no) { no = assetById(id).asset_number; }
          if (db.assets.some((x) => x.asset_number === no && x.id !== id)) { toast('Nomor Aset sudah dipakai aset lain.', false); return; }
          const accessory_items = $$('.acc-row', root).map((r) => ({ name: $('[data-acc=name]', r).value.trim(), brand: $('[data-acc=brand]', r).value.trim() })).filter((x) => x.name);
          const software = $$('.sw-row', root).map((r) => ({ name: $('[data-sw=name]', r).value.trim(), serial: $('[data-sw=serial]', r).value.trim(), status: $('[data-sw=status]', r).value })).filter((s) => s.name);
          const rec = Object.assign(id ? assetById(id) : { id: nextId(db.assets), created_at: new Date().toISOString() }, {
            asset_number: no, category: d.category, device_name: d.device_name.trim(), department: d.department, owner_email: d.owner_email.trim(),
            ip_address: d.ip_address.trim(), hostname: d.hostname.trim(), os_name: d.os_name.trim(), os_status: d.os_status, motherboard_brand: d.motherboard_brand.trim(),
            processor: d.processor.trim(), ram: d.ram.trim(), storage: d.storage.trim(), serial_number: d.serial_number.trim(), purchase_date: d.purchase_date,
            location: d.location.trim(), status: d.status, printer_info: d.printer_info.trim(), monitor_info: d.monitor_info.trim(), accessory_items, accessories: accessory_items.map((x) => x.name + (x.brand ? ' (' + x.brand + ')' : '')).join(', '),
            software, tablet_id: /tablet/i.test(d.category) ? (d.tablet_id || '').trim() : '', tablet_condition: /tablet/i.test(d.category) ? d.tablet_condition : '',
          });
          if (!id) db.assets.push(rec);
          db.assetOwners = db.assetOwners.filter((o) => o.asset_id !== rec.id);
          if (d.owner) {
            db.assetOwners.push({ asset_id: rec.id, user_id: +d.owner });
            const u = userById(+d.owner);
            if (/pc|laptop/i.test(rec.category)) { rec.pc_username = u.pc_username; rec.pc_password = u.pc_password; }
          }
          save(); closeModal(); render(); toast(id ? 'Aset diperbarui.' : `Aset ditambahkan dengan nomor ${rec.asset_number}.`);
        };
      },
    });
  }

  // ------------------------------------------------------------------
  // Import Excel Aset + User sekaligus (SheetJS dimuat saat dibutuhkan)
  // ------------------------------------------------------------------
  const AU_COLS = [
    ['Nama Lengkap', 'full_name', 'user'], ['Username', 'username', 'user'], ['Email', 'email', 'user'], ['Departement', 'department', 'user'],
    ['Password', 'password', 'user'], ['Username PC', 'pc_username', 'user'], ['Password PC', 'pc_password', 'user'], ['Role', 'role', 'user'], ['Status User', 'user_status', 'user'],
    ['ID Aset', 'asset_number', 'asset'], ['Kategori', 'category', 'asset'], ['Nama Perangkat', 'device_name', 'asset'], ['Status Aset', 'status', 'asset'],
    ['Lokasi', 'location', 'asset'], ['Serial Number', 'serial_number', 'asset'], ['Tanggal Pembelian', 'purchase_date', 'asset'], ['IP Address', 'ip_address', 'asset'],
    ['Hostname', 'hostname', 'asset'], ['Processor', 'processor', 'asset'], ['RAM', 'ram', 'asset'], ['Penyimpanan', 'storage', 'asset'],
    ['Motherboard/Brand', 'motherboard_brand', 'asset'], ['Monitor', 'monitor_info', 'asset'], ['Printer', 'printer_info', 'asset'], ['Aksesoris', 'accessories', 'asset'],
    ['OS', 'os_name', 'asset'], ['Status OS', 'os_status', 'asset'], ['Software', 'software', 'asset'], ['Serial Number Software', 'software_serial', 'asset'],
    ['Status Software', 'software_status', 'asset'], ['ID Tablet', 'tablet_id', 'asset'], ['Kondisi Tablet', 'tablet_condition', 'asset'],
  ];
  let xlsxPromise = null;
  function loadXlsx() {
    if (window.XLSX) return Promise.resolve(window.XLSX);
    if (!xlsxPromise) {
      xlsxPromise = new Promise((resolve, reject) => {
        const s = document.createElement('script');
        s.src = 'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js';
        s.onload = () => resolve(window.XLSX);
        s.onerror = () => { xlsxPromise = null; reject(new Error('Library Excel gagal dimuat. Periksa koneksi internet.')); };
        document.head.appendChild(s);
      });
    }
    return xlsxPromise;
  }
  async function downloadAssetUserTemplate() {
    const X = await loadXlsx();
    const ex = [
      ['Rina Kartika', 'rina.k', 'rina.k@contoh.co.id', 'HRD', 'Rina#2026', 'rina.pc', 'PcRina123', 'user', 'Aktif', '', 'Laptop', 'ASUS VivoBook 14', '', 'Lantai 2', 'SNDEMO9001', '2025-03-14', '192.168.10.201', 'LT-HRD-01', 'Intel Core i5-1235U', '8 GB', 'SSD 512 GB', 'ASUS VivoBook 14', '', '', 'Mouse Logitech B100', 'Windows 11 Pro', 'Original', 'Microsoft Office 2021; Anydesk', 'XXXX-7788; -', 'Original; Original', '', ''],
      ['Doni Saputra', 'doni', 'doni@contoh.co.id', 'Produksi', 'Doni#2026', '', '', 'user', 'Aktif', '', 'Tablet', 'Samsung Galaxy Tab A9+', '', 'Line 2', 'SNDEMO9002', '2025-01-10', '192.168.10.202', '', '', '4 GB', '64 GB', 'Samsung Galaxy Tab A9+', '', '', '', 'Android 14', 'Original', '', '', '', 'TAB-DEMO-01', 'Bagus'],
      ['', '', '', 'IT', '', '', '', '', '', '', 'Monitor', 'Dell E2222H', 'Stok', 'Gudang IT', 'SNDEMO9003', '2025-06-02', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
    ];
    const ws = X.utils.aoa_to_sheet([AU_COLS.map((c) => c[0]), ...ex]);
    ws['!cols'] = AU_COLS.map((c) => ({ wch: Math.max(12, c[0].length + 4) }));
    const help = X.utils.aoa_to_sheet([
      ['Petunjuk Import Aset + User'], [''],
      ['1. Satu baris = satu aset beserta satu penggunanya. Kolom A-I = data USER, kolom J dst. = data ASET.'],
      ['2. USER dicocokkan lewat Username. User baru wajib diisi Nama Lengkap, Username, dan Password.'],
      ['3. ASET dicocokkan lewat ID Aset (kalau kosong: lewat Serial Number). ID Aset kosong -> nomor dibuat otomatis (' + prefix() + '/Departement/Jenis/Urutan).'],
      ['4. Kategori harus sama dengan daftar Kategori Aset: ' + db.categories.map((c) => c.name).join(', ') + '.'],
      ['5. Status Aset: Digunakan / Stok / Tidak Digunakan. Kosong -> Digunakan jika ada user, Stok jika tanpa user.'],
      ['6. Satu aset dipakai beberapa user: tulis beberapa baris dengan ID Aset yang sama.'],
      ['7. Software lebih dari satu dipisah titik koma (;). Tanggal: 2025-03-14 atau 14/03/2025.'],
      ['8. Kolom kosong tidak menghapus data lama. Baris hanya berisi user -> hanya user yang disimpan.'],
    ]);
    help['!cols'] = [{ wch: 120 }];
    const wb = X.utils.book_new();
    X.utils.book_append_sheet(wb, ws, 'Aset & User');
    X.utils.book_append_sheet(wb, help, 'Petunjuk');
    X.writeFile(wb, 'template_aset_user.xlsx');
  }
  function parseDateCell(v) {
    const s = String(v || '').trim();
    if (!s) return null;
    let m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/); if (m) return `${m[1]}-${pad(+m[2])}-${pad(+m[3])}`;
    m = s.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})$/); if (m) return `${m[3]}-${pad(+m[2])}-${pad(+m[1])}`;
    return false;
  }
  function importAssetUserRows(rows) {
    const out = { usersNew: 0, usersUpd: 0, assetsNew: 0, assetsUpd: 0, skipped: 0, notes: [] };
    const header = (rows[0] || []).map((h) => String(h || '').trim().toLowerCase());
    const idx = {};
    AU_COLS.forEach(([title, key]) => { const i = header.indexOf(title.toLowerCase()); if (i >= 0) idx[key] = i; });
    if (idx.username === undefined && idx.full_name === undefined) throw new Error('Kolom "Username"/"Nama Lengkap" tidak ditemukan. Pakai Template Aset + User.');
    const userCache = {}, ownersByAsset = {}, statusGiven = {}, touched = {};
    rows.slice(1).forEach((row, n) => {
      const r = n + 2, g = (k) => (idx[k] === undefined ? '' : String(row[idx[k]] == null ? '' : row[idx[k]]).trim());
      const hasUser = g('username') || g('full_name'), hasAsset = g('category') || g('asset_number');
      if (!hasUser && !hasAsset) return;
      let user = null;
      if (hasUser) {
        const key = g('username') ? 'u:' + g('username').toLowerCase() : 'n:' + g('full_name').toLowerCase();
        user = userCache[key] || (g('username') ? db.users.find((u) => u.username.toLowerCase() === g('username').toLowerCase()) : db.users.find((u) => u.full_name.toLowerCase() === g('full_name').toLowerCase())) || null;
        const role = ['admin', 'user'].includes(g('role').toLowerCase()) ? g('role').toLowerCase() : null;
        const st = g('user_status').toLowerCase(), active = /^(nonaktif|tidak aktif|inactive|0|no)$/.test(st) ? 0 : (st ? 1 : null);
        if (user && !userCache[key]) {
          ['full_name', 'email', 'department', 'pc_username', 'pc_password'].forEach((k) => { if (g(k)) user[k] = g(k); });
          if (role) user.role = role; if (active !== null) user.is_active = active; if (g('password')) user.demo_password = g('password');
          out.usersUpd++;
        } else if (!user) {
          if (!g('full_name') || !g('username') || !g('password')) out.notes.push(`Baris ${r}: user baru ${g('full_name') || g('username')} dilewati (wajib isi Nama Lengkap, Username, Password).`);
          else {
            user = { id: nextId(db.users), full_name: g('full_name'), username: g('username'), email: g('email'), department: g('department'), role: role || 'user', is_active: active === null ? 1 : active,
              pc_username: g('pc_username'), pc_password: g('pc_password'), demo_password: g('password'), created_at: new Date().toISOString() };
            db.users.push(user); out.usersNew++;
            if (user.department && !db.departments.includes(user.department)) db.departments.push(user.department);
          }
        }
        if (user) userCache[key] = user;
      }
      if (!hasAsset) return;
      let a = g('asset_number') ? db.assets.find((x) => x.asset_number === g('asset_number')) : null;
      if (!a && !g('asset_number') && g('serial_number')) a = db.assets.find((x) => x.serial_number === g('serial_number')) || null;
      const cat = g('category') ? db.categories.find((c) => c.name.toLowerCase() === g('category').toLowerCase()) : null;
      if (g('category') && !cat) { out.notes.push(`Baris ${r}: Kategori "${g('category')}" tidak dikenal, aset dilewati.`); out.skipped++; return; }
      if (!a && !cat) { out.notes.push(`Baris ${r}: aset baru wajib diisi Kategori, aset dilewati.`); out.skipped++; return; }
      const dept = g('department') || (user ? user.department : '') || '';
      if (!a) {
        const no = g('asset_number') || nextAssetNumber(cat.name, dept, g('location'), null);
        if (!no) { out.notes.push(`Baris ${r}: Tablet tanpa ID Aset wajib diisi Lokasi (Line), aset dilewati.`); out.skipped++; return; }
        a = { id: nextId(db.assets), asset_number: no, category: cat.name, device_name: '', department: user ? '' : dept, owner_email: '', ip_address: '', hostname: '', os_name: '', os_status: 'Belum Original',
          motherboard_brand: '', processor: '', ram: '', storage: '', serial_number: '', purchase_date: '', location: '', status: user ? 'Digunakan' : 'Stok', printer_info: '', monitor_info: '', accessories: '',
          pc_username: '', pc_password: '', software: [], tablet_id: '', tablet_condition: '', created_at: new Date().toISOString() };
        db.assets.push(a); out.assetsNew++;
      } else if (!touched[a.id]) out.assetsUpd++;
      touched[a.id] = true;
      if (cat) a.category = cat.name;
      ['device_name', 'location', 'serial_number', 'ip_address', 'hostname', 'processor', 'ram', 'storage', 'motherboard_brand', 'monitor_info', 'printer_info', 'accessories', 'os_name'].forEach((k) => { if (g(k)) a[k] = g(k); });
      const stMap = { digunakan: 'Digunakan', stok: 'Stok', 'tidak digunakan': 'Tidak Digunakan' };
      if (g('status')) { if (stMap[g('status').toLowerCase()]) { a.status = stMap[g('status').toLowerCase()]; statusGiven[a.id] = true; } else out.notes.push(`Baris ${r}: Status Aset "${g('status')}" tidak dikenal, diabaikan.`); }
      if (g('os_status')) a.os_status = g('os_status').toLowerCase() === 'original' ? 'Original' : 'Belum Original';
      const pd = parseDateCell(g('purchase_date'));
      if (pd === false) out.notes.push(`Baris ${r}: Tanggal Pembelian tidak dikenali, diabaikan.`); else if (pd) a.purchase_date = pd;
      if (g('software')) {
        const names = g('software').split(';').map((s) => s.trim()), ser = g('software_serial').split(';').map((s) => s.trim()), sts = g('software_status').split(';').map((s) => s.trim());
        a.software = names.map((nm, i) => ({ name: nm, serial: ser[i] && ser[i] !== '-' ? ser[i] : '', status: (sts[i] || '').toLowerCase() === 'original' ? 'Original' : 'Belum Original' })).filter((s) => s.name);
      }
      if (/tablet/i.test(a.category)) {
        if (g('tablet_id')) a.tablet_id = g('tablet_id');
        const c = g('tablet_condition').toLowerCase();
        if (c) a.tablet_condition = /rusak|damaged|bad/.test(c) ? 'Rusak' : 'Bagus'; else a.tablet_condition = a.tablet_condition || 'Bagus';
      }
      if (user) (ownersByAsset[a.id] = ownersByAsset[a.id] || []).push(user.id);
    });
    Object.entries(ownersByAsset).forEach(([aid, uids]) => {
      const a = assetById(+aid);
      db.assetOwners = db.assetOwners.filter((o) => o.asset_id !== a.id);
      [...new Set(uids)].forEach((uid) => db.assetOwners.push({ asset_id: a.id, user_id: uid }));
      const first = ownersOf(a.id)[0];
      if (first) Object.assign(a, { department: first.department || '', owner_email: first.email || '' }, /pc|laptop/i.test(a.category) ? { pc_username: first.pc_username || '', pc_password: first.pc_password || '' } : {});
      if (!statusGiven[a.id] && a.status === 'Stok') a.status = 'Digunakan';
    });
    return out;
  }
  function importAssetUserModal() {
    openModal('Import Aset + User sekaligus', `<div class="space-y-4 text-sm">
      <p class="text-slate-600">Satu baris Excel berisi <b>1 aset beserta penggunanya</b>, lengkap seperti form Tambah Aset &amp; Tambah User. User baru ikut dibuat otomatis dan langsung terhubung ke asetnya.</p>
      ${ARTIFACT ? '' : `<button type="button" id="auTpl" class="${btnGhost}">${icon('download')} Download Template Aset + User</button>`}
      <div class="rounded-lg border border-dashed border-slate-300 p-4">
        <label class="block text-sm font-medium text-slate-600 mb-2">Upload file Excel yang sudah diisi</label>
        <input type="file" id="auFile" accept=".xlsx,.xls" class="block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-sm file:font-medium">
      </div>
      <p id="auMsg" class="hidden rounded-lg px-3 py-2"></p>
      <div class="modal-actions flex justify-end gap-2 pt-2 border-t"><button type="button" data-close class="${btnGhost}">Tutup</button><button type="button" id="auGo" class="${btnPrimary}">${icon('upload')} Import</button></div>
    </div>`, {
      onMount(root) {
        const msg = (ok, html) => { const el = $('#auMsg', root); el.className = 'rounded-lg px-3 py-2 ' + (ok ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-700'); el.innerHTML = html; };
        if ($('#auTpl', root)) $('#auTpl', root).onclick = () => downloadAssetUserTemplate().catch((e) => msg(false, esc(e.message)));
        $('#auGo', root).onclick = async () => {
          const file = $('#auFile', root).files[0];
          if (!file) { msg(false, 'Pilih file Excel dulu.'); return; }
          try {
            const X = await loadXlsx();
            const wb = X.read(await file.arrayBuffer(), { type: 'array', cellDates: true });
            const rows = X.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1, raw: false, dateNF: 'yyyy-mm-dd', defval: '' });
            const res = importAssetUserRows(rows);
            save(); render(); importAssetUserModal();
            const again = $('#modal');
            if (again) { const el = $('#auMsg', again); el.className = 'rounded-lg px-3 py-2 bg-green-50 text-green-800';
              el.innerHTML = `<b>Import selesai:</b> ${res.assetsNew} aset baru, ${res.assetsUpd} aset diperbarui, ${res.usersNew} user baru, ${res.usersUpd} user diperbarui, ${res.skipped} baris aset dilewati.`
                + (res.notes.length ? `<ul class="list-disc pl-5 mt-1 text-xs text-amber-800">${res.notes.slice(0, 8).map((n) => `<li>${esc(n)}</li>`).join('')}</ul>` : ''); }
          } catch (e) { msg(false, esc(e.message || 'File tidak bisa dibaca.')); }
        };
      },
    });
  }

  // ------------------------------------------------------------------
  // Kategori aset
  // ------------------------------------------------------------------
  PAGES.categories = {
    render() {
      const rows = [...db.categories].sort((a, b) => a.sort_order - b.sort_order).map((c) => {
        const used = db.assets.filter((a) => a.category === c.name).length;
        return `<tr class="border-b last:border-0 hover:bg-slate-50">
          <td class="py-2.5 px-4"><div class="flex items-center gap-2 text-slate-700">${categoryIcon(c.name, 'w-5 h-5 text-slate-400')} <span class="font-medium">${esc(c.name)}</span></div></td>
          <td class="py-2.5 px-4"><span class="font-mono text-xs bg-slate-100 rounded px-2 py-0.5">${esc(c.abbr)}</span></td>
          <td class="py-2.5 px-4">${c.sort_order}</td><td class="py-2.5 px-4">${used}</td>
          <td class="py-2.5 px-4 text-right whitespace-nowrap">
            <button data-edit="${c.id}" class="p-1.5 rounded-lg text-slate-500 hover:bg-blue-50 hover:text-blue-600">${icon('pencil')}</button>
            <button data-del="${c.id}" class="p-1.5 rounded-lg text-slate-500 hover:bg-red-50 hover:text-red-600">${icon('trash')}</button></td></tr>`;
      }).join('');
      return `<div class="max-w-3xl">
<div class="flex flex-wrap items-center justify-between gap-2 mb-4"><p class="text-sm text-slate-500">Jenis aset yang bisa dipilih saat menambah aset. Singkatan dipakai di Nomor Aset otomatis, contoh: ${esc(prefix())}/FIN/PC/001.</p>
<button id="btnAddCat" class="${btnPrimary}">${icon('plus')} Tambah Kategori</button></div>
<div class="bg-white rounded-xl shadow-sm overflow-x-auto"><table class="w-full text-sm">
<thead><tr class="text-left text-slate-500 border-b bg-slate-50"><th class="py-2.5 px-4">Nama</th><th class="py-2.5 px-4">Singkatan</th><th class="py-2.5 px-4">Urutan</th><th class="py-2.5 px-4">Jumlah Aset</th><th class="py-2.5 px-4"></th></tr></thead>
<tbody>${rows}</tbody></table></div></div>`;
    },
    bind() {
      const form = (c) => openModal(c ? 'Edit Kategori' : 'Tambah Kategori', `<form id="catForm" class="space-y-3">
        ${field('Nama Kategori', `<input name="name" value="${esc(c ? c.name : '')}" required maxlength="50" class="${inputCls}">`)}
        ${field('Singkatan', `<input name="abbr" value="${esc(c ? c.abbr : '')}" required maxlength="10" class="${inputCls} uppercase">`)}
        ${field('Urutan Tampil', `<input name="sort_order" type="number" min="0" value="${c ? c.sort_order : db.categories.length + 1}" class="${inputCls}">`)}
        <div class="flex justify-end gap-2 pt-2"><button type="button" data-close class="${btnGhost}">Batal</button><button class="${btnPrimary}">${icon('check')} Simpan</button></div></form>`, {
        onMount(root) {
          $('#catForm', root).onsubmit = (e) => {
            e.preventDefault();
            const d = formData(e.target);
            const name = d.name.trim();
            if (db.categories.some((x) => x.name.toLowerCase() === name.toLowerCase() && (!c || x.id !== c.id))) { toast('Nama kategori sudah ada.', false); return; }
            if (c) { db.assets.forEach((a) => { if (a.category === c.name) a.category = name; }); Object.assign(c, { name, abbr: d.abbr.trim().toUpperCase(), sort_order: +d.sort_order || 0 }); }
            else db.categories.push({ id: nextId(db.categories), name, abbr: d.abbr.trim().toUpperCase(), sort_order: +d.sort_order || 0 });
            save(); closeModal(); render(); toast('Kategori disimpan.');
          };
        },
      });
      $('#btnAddCat').onclick = () => form(null);
      $$('[data-edit]').forEach((b) => (b.onclick = () => form(db.categories.find((c) => c.id === +b.dataset.edit))));
      $$('[data-del]').forEach((b) => (b.onclick = async () => {
        const c = db.categories.find((x) => x.id === +b.dataset.del);
        if (db.assets.some((a) => a.category === c.name)) { toast('Kategori masih dipakai aset, tidak bisa dihapus.', false); return; }
        if (!(await ask(`Hapus kategori ${c.name}?`))) return;
        db.categories = db.categories.filter((x) => x !== c); save(); render(); toast('Kategori dihapus.');
      }));
    },
  };

  // ------------------------------------------------------------------
  // Management User
  // ------------------------------------------------------------------
  const userFilter = { q: '' };
  PAGES.users = {
    render() {
      const q = userFilter.q.toLowerCase();
      const list = db.users.filter((u) => !q || [u.full_name, u.username, u.email, u.department, u.position].join(' ').toLowerCase().includes(q));
      const rows = list.map((u) => `<tr class="border-b last:border-0 hover:bg-slate-50">
        <td class="py-2.5 px-4"><div class="font-medium text-slate-700">${esc(u.full_name)}</div><div class="text-xs text-slate-400">${esc(u.email || '')}</div></td>
        <td class="py-2.5 px-4">${esc(u.username)}</td><td class="py-2.5 px-4">${esc(u.department || DASH)}</td><td class="py-2.5 px-4">${esc(u.position || DASH)}</td>
        <td class="py-2.5 px-4 text-xs">${u.pc_username ? `${esc(u.pc_username)} / <span data-pw="${esc(u.pc_password)}" class="font-mono">••••••</span> <button data-showpw class="text-slate-400 hover:text-slate-600 align-middle">${icon('eye', 'w-3.5 h-3.5')}</button>` : DASH}</td>
        <td class="py-2.5 px-4"><span class="px-2 py-0.5 rounded-full text-xs font-medium ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-600'}">${u.role}</span></td>
        <td class="py-2.5 px-4">${u.is_active ? '<span class="text-green-600 text-xs font-medium">Aktif</span>' : '<span class="text-slate-400 text-xs">Nonaktif</span>'}</td>
        <td class="py-2.5 px-4">${assetsOfUser(u.id).length}</td>
        <td class="py-2.5 px-4 text-right whitespace-nowrap">
          <button data-edit="${u.id}" class="p-1.5 rounded-lg text-slate-500 hover:bg-blue-50 hover:text-blue-600">${icon('pencil')}</button>
          <button data-del="${u.id}" class="p-1.5 rounded-lg text-slate-500 hover:bg-red-50 hover:text-red-600">${icon('trash')}</button></td></tr>`).join('');
      return `
<div class="bg-white rounded-xl shadow-sm mb-4 p-3 flex flex-wrap items-center gap-2">
  <div class="relative flex-1 min-w-[12rem]"><span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">${icon('search')}</span>
  <input id="uQ" value="${esc(userFilter.q)}" placeholder="Cari nama, username, departement…" class="w-full border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-sm"></div>
  <button id="btnAddUser" class="${btnPrimary}">${icon('plus')} Tambah User</button>
</div>
<div class="bg-white rounded-xl shadow-sm overflow-x-auto"><table class="w-full text-sm">
<thead><tr class="text-left text-slate-500 border-b bg-slate-50"><th class="py-2.5 px-4">Nama</th><th class="py-2.5 px-4">Username</th><th class="py-2.5 px-4">Departement</th><th class="py-2.5 px-4">Jabatan</th><th class="py-2.5 px-4">Login PC</th><th class="py-2.5 px-4">Role</th><th class="py-2.5 px-4">Status</th><th class="py-2.5 px-4">Aset</th><th class="py-2.5 px-4"></th></tr></thead>
<tbody>${rows || '<tr><td colspan="9" class="py-8 text-center text-slate-400">Tidak ada user.</td></tr>'}</tbody></table></div>`;
    },
    bind() {
      const q = $('#uQ');
      q.oninput = (e) => { userFilter.q = e.target.value; render(); const n = $('#uQ'); n.focus(); n.setSelectionRange(n.value.length, n.value.length); };
      $$('[data-showpw]').forEach((b) => (b.onclick = () => { const s = b.previousElementSibling; s.textContent = s.textContent.startsWith('•') ? s.dataset.pw : '••••••'; }));
      const form = (u) => openModal(u ? 'Edit User' : 'Tambah User', `<form id="userForm" class="space-y-3">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          ${field('Nama Lengkap', `<input name="full_name" value="${esc(u ? u.full_name : '')}" required class="${inputCls}">`)}
          ${field('Username', `<input name="username" value="${esc(u ? u.username : '')}" required class="${inputCls}">`)}
          ${field('Email', `<input name="email" type="email" value="${esc(u ? u.email : '')}" class="${inputCls}">`)}
          ${field('Departement', `<select name="department" class="${inputCls}">${options(db.departments, u ? u.department : '', '—')}</select>`)}
          ${field('Jabatan', `<input name="position" list="posList" maxlength="100" value="${esc(u ? u.position || '' : '')}" placeholder="Contoh: Staff, Supervisor, Manager" class="${inputCls}"><datalist id="posList">${[...new Set(db.users.map((x) => x.position).filter(Boolean))].sort().map((p) => `<option value="${esc(p)}"></option>`).join('')}</datalist>`)}
          ${field('Password Login' + (u ? ' <span class="text-xs text-slate-400">(kosongkan jika tidak diubah)</span>' : ''), `<input name="password" type="password" ${u ? '' : 'required'} class="${inputCls}">`)}
          ${field('Role', `<select name="role" class="${inputCls}">${options([{ value: 'user', label: 'User' }, { value: 'admin', label: 'Admin' }], u ? u.role : 'user')}</select>`)}
          ${field('Username PC', `<input name="pc_username" value="${esc(u ? u.pc_username : '')}" class="${inputCls}">`)}
          ${field('Password PC', `<div class="flex gap-2"><input name="pc_password" id="uPcPw" value="${esc(u ? u.pc_password : '')}" class="${inputCls} font-mono"><button type="button" id="btnGenPcPw" class="shrink-0 bg-slate-100 hover:bg-slate-200 rounded-lg px-3 text-xs font-medium">Generate</button></div>
            <p class="text-xs text-slate-400 mt-1">Pola otomatis: 3 huruf + angka + 1 simbol, mis. kMa249$. Boleh diketik sendiri.</p>`)}
        </div>
        <label class="inline-flex items-center gap-2 text-sm"><input type="checkbox" name="is_active" value="1" ${!u || u.is_active ? 'checked' : ''} class="rounded"> Aktif</label>
        <div class="modal-actions flex justify-end gap-2 pt-2 border-t"><button type="button" data-close class="${btnGhost}">Batal</button><button class="${btnPrimary}">${icon('check')} Simpan</button></div></form>`, {
        wide: true,
        onMount(root) {
          $('#btnGenPcPw', root).onclick = () => { $('#uPcPw', root).value = genPcPassword(7); };
          $('#userForm', root).onsubmit = (e) => {
            e.preventDefault();
            const d = formData(e.target);
            const uname = d.username.trim();
            if (db.users.some((x) => x.username === uname && (!u || x.id !== u.id))) { toast('Username sudah dipakai.', false); return; }
            if (u && u.id === sessionUserId && d.role !== 'admin') { toast('Tidak bisa menurunkan role akun yang sedang dipakai.', false); return; }
            const rec = Object.assign(u || { id: nextId(db.users), created_at: new Date().toISOString() }, {
              full_name: d.full_name.trim(), username: uname, email: d.email.trim(), department: d.department, position: (d.position || '').trim(), role: d.role,
              pc_username: d.pc_username.trim(), pc_password: d.pc_password.trim(), is_active: d.is_active ? 1 : 0,
            });
            if (d.password) rec.demo_password = d.password;
            if (!u) db.users.push(rec);
            // Departement & email user ikut ke aset yang dipakainya
            assetsOfUser(rec.id).forEach((a) => { a.department = rec.department; a.owner_email = rec.email; });
            save(); closeModal(); render(); toast('User disimpan.');
          };
        },
      });
      $('#btnAddUser').onclick = () => form(null);
      $$('[data-edit]').forEach((b) => (b.onclick = () => form(userById(+b.dataset.edit))));
      $$('[data-del]').forEach((b) => (b.onclick = async () => {
        const u = userById(+b.dataset.del);
        if (u.id === sessionUserId) { toast('Tidak bisa menghapus akun yang sedang dipakai.', false); return; }
        if (u.username === 'user' || u.username === 'admin') { toast('Akun demo utama tidak bisa dihapus.', false); return; }
        if (!(await ask(`Hapus user ${u.full_name}?`))) return;
        db.users = db.users.filter((x) => x !== u);
        assetsOfUser(u.id).forEach((a) => { a.department = ''; });
        db.assetOwners = db.assetOwners.filter((o) => o.user_id !== u.id);
        save(); render(); toast('User dihapus.');
      }));
    },
  };

  // ------------------------------------------------------------------
  // Ticketing
  // ------------------------------------------------------------------
  const ticketFilter = { tab: 'all', q: '' };
  function newTicketNumber() {
    const d = todayStr().replace(/-/g, '');
    const n = db.tickets.filter((t) => t.ticket_number.includes('-' + d + '-')).length + 1;
    let num; let i = n;
    do { num = `TCK-${d}-${String(i).padStart(4, '0')}`; i++; } while (db.tickets.some((t) => t.ticket_number === num));
    return num;
  }
  function ticketDetailModal(t) {
    const w = workOf(t.id) || { work_detail: '', asset_check: '' };
    const logs = db.ticketLogs.filter((l) => l.ticket_id === t.id).sort((a, b) => a.changed_at.localeCompare(b.changed_at));
    const a = assetById(t.asset_id);
    const canEdit = isAdmin() && !isCancelled(t);
    const cancel = db.cancellations.find((c) => c.ticket_id === t.id);
    openModal('Tiket ' + t.ticket_number, `
      <div class="space-y-4 text-sm">
        <div class="grid grid-cols-2 gap-3">
          <div><p class="text-xs text-slate-400">Pelapor</p><p class="font-medium">${esc((userById(t.reported_by) || {}).full_name || DASH)}</p></div>
          <div><p class="text-xs text-slate-400">Aset</p><p class="font-medium">${a ? esc(a.asset_number) : DASH}</p></div>
          <div><p class="text-xs text-slate-400">Status</p><span class="px-2 py-0.5 rounded-full text-xs font-medium ${TICKET_BADGE[ticketStatus(t)]}">${ticketStatus(t)}</span></div>
          <div><p class="text-xs text-slate-400">Dibuat</p><p>${fmtDateTime(t.created_at)}</p></div>
        </div>
        <div><p class="text-xs text-slate-400 mb-1">Rincian Masalah</p><p class="bg-slate-50 rounded-lg p-3">${esc(t.problem_detail)}</p></div>
        ${cancel ? `<div class="bg-slate-100 rounded-lg p-3 text-slate-600">Dibatalkan oleh user${cancel.reason ? ': ' + esc(cancel.reason) : ''}</div>` : ''}
        <form id="workForm" class="space-y-3">
          ${field('Rincian Pengerjaan', `<textarea name="work_detail" rows="3" ${canEdit ? '' : 'readonly'} class="${inputCls}" placeholder="Apa yang sudah dikerjakan IT">${esc(w.work_detail || '')}</textarea>`)}
          ${field('Hasil Pengecekan & Kesimpulan', `<textarea name="asset_check" rows="3" ${canEdit ? '' : 'readonly'} class="${inputCls}" placeholder='Tulis "harus upgrade" agar aset muncul di notifikasi Dashboard'>${esc(w.asset_check || '')}</textarea>`)}
          ${canEdit ? `<div class="flex justify-end"><button class="${btnPrimary}">${icon('check')} Simpan Rincian</button></div>` : ''}
        </form>
        <div><p class="text-xs text-slate-400 mb-2">Riwayat Status</p><ol class="border-l-2 border-slate-200 pl-4 space-y-2">
          ${logs.map((l) => `<li><span class="font-medium">${esc(l.status)}</span> <span class="text-xs text-slate-400">${fmtDateTime(l.changed_at)}</span><div class="text-xs text-slate-500">${esc(l.note || '')}</div></li>`).join('')}
        </ol></div>
      </div>`, {
      wide: true,
      onMount(root) {
        const f = $('#workForm', root);
        if (!canEdit) return;
        f.onsubmit = (e) => {
          e.preventDefault();
          const d = formData(f);
          const ex = workOf(t.id);
          if (ex) Object.assign(ex, { work_detail: d.work_detail.trim(), asset_check: d.asset_check.trim() });
          else db.workDetails.push({ ticket_id: t.id, work_detail: d.work_detail.trim(), asset_check: d.asset_check.trim() });
          save(); closeModal(); render(); toast('Rincian pengerjaan disimpan.');
        };
      },
    });
  }

  PAGES.tickets = {
    render() { return isAdmin() ? renderAdminTickets() : renderUserTickets(); },
    bind() { if (isAdmin()) bindAdminTickets(); else bindUserTickets(); },
  };

  function renderAdminTickets() {
    const all = [...db.tickets].sort((a, b) => b.created_at.localeCompare(a.created_at));
    const counts = { all: all.length };
    ['Menunggu', 'Proses', 'Selesai', 'Dibatalkan'].forEach((s) => (counts[s] = all.filter((t) => ticketStatus(t) === s).length));
    const q = ticketFilter.q.toLowerCase();
    const list = all.filter((t) => (ticketFilter.tab === 'all' || ticketStatus(t) === ticketFilter.tab) && (!q || [t.ticket_number, t.problem_detail, (userById(t.reported_by) || {}).full_name, (assetById(t.asset_id) || {}).asset_number].join(' ').toLowerCase().includes(q)));
    const tabs = [['all', 'Semua'], ['Menunggu', 'Menunggu'], ['Proses', 'Proses'], ['Selesai', 'Selesai'], ['Dibatalkan', 'Dibatalkan']].map(([k, l]) =>
      `<button data-tab="${k}" class="px-3 py-1.5 rounded-lg text-sm font-medium ${ticketFilter.tab === k ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50 border'}">${l} <span class="opacity-70">${counts[k]}</span></button>`).join('');
    const rows = list.map((t) => {
      const st = ticketStatus(t); const rep = userById(t.reported_by) || {}; const a = assetById(t.asset_id); const h = userById(t.handled_by);
      return `<tr class="border-b last:border-0 hover:bg-slate-50 align-top">
        <td class="py-2.5 px-4 font-medium whitespace-nowrap"><a href="#" data-open="${t.id}" class="text-blue-600 hover:underline">${esc(t.ticket_number)}</a><div class="text-xs text-slate-400 font-normal">Dibuat: ${fmtDateTime(t.created_at)}</div>${doneAt(t) ? `<div class="text-xs text-green-700 font-normal">Selesai: <b>${fmtDateTime(doneAt(t))}</b></div><div class="text-xs text-slate-400 font-normal">Lama: ${durationLabel(t.created_at, doneAt(t))}</div>` : ''}</td>
        <td class="py-2.5 px-4 whitespace-nowrap">${esc(rep.full_name || DASH)}<div class="text-xs text-slate-400">${esc(rep.department || '')}</div>${a && a.location ? `<div class="text-xs text-slate-400">Lokasi: ${esc(a.location)}</div>` : ''}</td>
        <td class="py-2.5 px-4 whitespace-nowrap">${a ? `<a href="#" data-asset="${a.id}" class="hover:underline">${esc(a.asset_number)}</a>` : DASH}</td>
        <td class="py-2.5 px-4 min-w-[14rem]">${esc(t.problem_detail)}${ticketHistoryHtml(t)}</td>
        <td class="py-2.5 px-4 whitespace-nowrap">${esc(h ? h.full_name : DASH)}</td>
        <td class="py-2.5 px-4">${st === 'Dibatalkan' ? `<span class="px-2 py-0.5 rounded-full text-xs font-medium ${TICKET_BADGE[st]}">${st}</span>` :
          `<select data-status="${t.id}" class="border rounded-lg px-2 py-1 text-xs font-medium ${TICKET_BADGE[st]}">${options(['Menunggu', 'Proses', 'Selesai'], st)}</select>`}</td>
        <td class="py-2.5 px-4 text-right"><button data-open="${t.id}" class="inline-flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg px-3 py-1.5 text-xs font-medium whitespace-nowrap">${icon('file-text', 'w-3.5 h-3.5')} Rincian</button></td></tr>`;
    }).join('');
    return `
<div class="flex flex-wrap items-center gap-2 mb-4">${tabs}
  <div class="relative flex-1 min-w-[12rem] sm:max-w-xs sm:ml-auto"><span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">${icon('search')}</span>
  <input id="tQ" value="${esc(ticketFilter.q)}" placeholder="Cari tiket…" class="w-full border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-sm bg-white"></div>
  ${ARTIFACT ? '' : `<button id="btnExportT" class="${btnGhost}">${icon('download')} Export CSV</button>`}
</div>
<div class="bg-white rounded-xl shadow-sm overflow-x-auto"><table class="w-full text-sm">
<thead><tr class="text-left text-slate-500 border-b bg-slate-50"><th class="py-2.5 px-4">No. Tiket</th><th class="py-2.5 px-4">Pelapor</th><th class="py-2.5 px-4">Aset</th><th class="py-2.5 px-4">Rincian Masalah</th><th class="py-2.5 px-4">Ditangani</th><th class="py-2.5 px-4">Status</th><th class="py-2.5 px-4"></th></tr></thead>
<tbody>${rows || '<tr><td colspan="7" class="py-8 text-center text-slate-400">Tidak ada tiket.</td></tr>'}</tbody></table></div>`;
  }
  function bindAdminTickets() {
    $$('[data-tab]').forEach((b) => (b.onclick = () => { ticketFilter.tab = b.dataset.tab; render(); }));
    $('#tQ').oninput = (e) => { ticketFilter.q = e.target.value; render(); const n = $('#tQ'); n.focus(); n.setSelectionRange(n.value.length, n.value.length); };
    $$('[data-open]').forEach((a) => (a.onclick = (e) => { e.preventDefault(); ticketDetailModal(db.tickets.find((t) => t.id === +a.dataset.open)); }));
    $$('[data-asset]').forEach((a) => (a.onclick = (e) => { e.preventDefault(); showAssetDetail(+a.dataset.asset); }));
    $$('[data-status]').forEach((s) => (s.onchange = () => {
      const t = db.tickets.find((x) => x.id === +s.dataset.status);
      t.status = s.value; t.handled_by = sessionUserId; t.resolved_at = s.value === 'Selesai' ? new Date().toISOString() : null;
      db.ticketLogs.push({ ticket_id: t.id, status: s.value, note: 'Status diperbarui oleh admin', changed_by: sessionUserId, changed_at: new Date().toISOString() });
      save(); render(); toast(`Status ${t.ticket_number} → ${s.value}`);
    }));
    if ($('#btnExportT')) $('#btnExportT').onclick = () => {
      const rows = [['No. Tiket', 'Tanggal Dibuat', 'Tanggal Selesai', 'Pelapor', 'Departement', 'Aset', 'Rincian Masalah', 'Rincian Pengerjaan', 'Hasil Pengecekan', 'Ditangani', 'Status']];
      db.tickets.forEach((t) => { const r = userById(t.reported_by) || {}; const w = workOf(t.id) || {}; rows.push([t.ticket_number, fmtDateTime(t.created_at), doneAt(t) ? fmtDateTime(doneAt(t)) : '', r.full_name, r.department, (assetById(t.asset_id) || {}).asset_number, t.problem_detail, w.work_detail, w.asset_check, (userById(t.handled_by) || {}).full_name, ticketStatus(t)]); });
      downloadCsv('tiket_it_demo.csv', rows);
    };
  }

  function renderUserTickets() {
    const me = currentUser();
    const mine = db.tickets.filter((t) => t.reported_by === me.id).sort((a, b) => b.created_at.localeCompare(a.created_at));
    const myAssets = assetsOfUser(me.id);
    return `
<div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
  <div class="bg-white rounded-xl shadow-sm p-5 h-fit">
    <h2 class="font-semibold text-slate-700 mb-3">Buat Tiket Baru</h2>
    <form id="newTicket" class="space-y-3">
      ${field('Aset Bermasalah', `<select name="asset_id" class="${inputCls}">${options(myAssets.map((a) => ({ value: a.id, label: `${a.asset_number} — ${a.device_name || a.category}` })), '', '— Tidak terkait aset —')}</select>`)}
      ${field('Rincian Masalah', `<textarea name="problem_detail" rows="4" required class="${inputCls}" placeholder="Jelaskan masalahnya, mis. printer tidak bisa print"></textarea>`)}
      <button class="${btnPrimary} w-full justify-center">${icon('plus')} Kirim Tiket</button>
    </form>
  </div>
  <div class="lg:col-span-2 bg-white rounded-xl shadow-sm p-5">
    <h2 class="font-semibold text-slate-700 mb-3">Tiket Saya</h2>
    ${mine.length ? `<div class="space-y-3">${mine.map((t) => { const st = ticketStatus(t); const w = workOf(t.id); return `
      <div class="rounded-xl border border-slate-100 p-4">
        <div class="flex flex-wrap items-center justify-between gap-2"><a href="#" data-open="${t.id}" class="font-medium text-blue-600 hover:underline">${esc(t.ticket_number)}</a>
        <span class="px-2 py-0.5 rounded-full text-xs font-medium ${TICKET_BADGE[st]}">${st}</span></div>
        <p class="text-xs text-slate-400 mt-0.5">${fmtDateTime(t.created_at)}${t.asset_id && assetById(t.asset_id) ? ' · ' + esc(assetById(t.asset_id).asset_number) : ''}</p>
        <p class="text-sm text-slate-700 mt-2">${esc(t.problem_detail)}</p>
        ${w && w.work_detail ? `<p class="text-xs text-slate-500 mt-2"><b>Pengerjaan IT:</b> ${esc(w.work_detail)}</p>` : ''}
        ${st === 'Menunggu' ? `<div class="mt-3 text-right"><button data-cancel="${t.id}" class="text-xs font-medium text-red-600 hover:underline">Batalkan tiket</button></div>` : ''}
      </div>`; }).join('')}</div>` : '<p class="text-sm text-slate-400 py-6 text-center">Anda belum pernah membuat tiket.</p>'}
  </div>
</div>`;
  }
  function bindUserTickets() {
    $('#newTicket').onsubmit = (e) => {
      e.preventDefault();
      const d = formData(e.target);
      const t = { id: nextId(db.tickets), ticket_number: newTicketNumber(), asset_id: d.asset_id ? +d.asset_id : null, reported_by: sessionUserId, handled_by: null, problem_detail: d.problem_detail.trim(), status: 'Menunggu', created_at: new Date().toISOString(), resolved_at: null };
      db.tickets.push(t);
      db.ticketLogs.push({ ticket_id: t.id, status: 'Menunggu', note: 'Tiket dibuat oleh user', changed_by: sessionUserId, changed_at: t.created_at });
      save(); render(); toast(`Tiket ${t.ticket_number} terkirim. Coba login sebagai Admin untuk memprosesnya.`);
    };
    $$('[data-open]').forEach((a) => (a.onclick = (e) => { e.preventDefault(); ticketDetailModal(db.tickets.find((t) => t.id === +a.dataset.open)); }));
    $$('[data-cancel]').forEach((b) => (b.onclick = async () => {
      const t = db.tickets.find((x) => x.id === +b.dataset.cancel);
      const reason = await askText('Batalkan tiket ' + t.ticket_number + '?', 'Alasan pembatalan (opsional)');
      if (reason === null) return;
      db.cancellations.push({ ticket_id: t.id, reason: reason.trim(), cancelled_by: sessionUserId, cancelled_at: new Date().toISOString() });
      t.status = 'Selesai'; t.resolved_at = null;
      db.ticketLogs.push({ ticket_id: t.id, status: 'Selesai', note: 'Dibatalkan oleh user' + (reason.trim() ? ': ' + reason.trim() : ''), changed_by: sessionUserId, changed_at: new Date().toISOString() });
      save(); render(); toast('Tiket dibatalkan.');
    }));
  }

  // Antrian (user)
  PAGES.queue = {
    render() {
      const q = db.tickets.filter((t) => !isCancelled(t) && (t.status === 'Menunggu' || t.status === 'Proses')).sort((a, b) => a.created_at.localeCompare(b.created_at));
      const me = sessionUserId;
      return `<div class="max-w-3xl">
<p class="text-sm text-slate-500 mb-4">Urutan tiket yang sedang menunggu atau sedang dikerjakan tim IT. Tiket Anda ditandai biru.</p>
<div class="bg-white rounded-xl shadow-sm overflow-x-auto"><table class="w-full text-sm">
<thead><tr class="text-left text-slate-500 border-b bg-slate-50"><th class="py-2.5 px-4">#</th><th class="py-2.5 px-4">No. Tiket</th><th class="py-2.5 px-4">Departement</th><th class="py-2.5 px-4">Status</th><th class="py-2.5 px-4">Dibuat</th></tr></thead>
<tbody>${q.map((t, i) => `<tr class="border-b last:border-0 ${t.reported_by === me ? 'bg-blue-50' : ''}">
  <td class="py-2.5 px-4 font-semibold">${i + 1}</td><td class="py-2.5 px-4">${esc(t.ticket_number)}${t.reported_by === me ? ' <span class="text-xs text-blue-600 font-medium">(Anda)</span>' : ''}</td>
  <td class="py-2.5 px-4">${esc((userById(t.reported_by) || {}).department || DASH)}</td>
  <td class="py-2.5 px-4"><span class="px-2 py-0.5 rounded-full text-xs font-medium ${TICKET_BADGE[t.status]}">${t.status}</span></td>
  <td class="py-2.5 px-4 text-slate-500">${fmtDateTime(t.created_at)}</td></tr>`).join('') || '<tr><td colspan="5" class="py-8 text-center text-slate-400">Tidak ada antrian. 🎉</td></tr>'}</tbody></table></div></div>`;
    },
  };

  // ------------------------------------------------------------------
  // Aset Saya
  // ------------------------------------------------------------------
  let myAssetIdx = 0;
  PAGES['my-asset'] = {
    render() {
      // Komputer (PC/Laptop) ditampilkan paling depan
      const rank = (a) => (/laptop|pc/i.test(a.category) ? 0 : 1);
      const list = assetsOfUser(sessionUserId).sort((a, b) => rank(a) - rank(b) || a.id - b.id);
      if (!list.length) {
        return `<div class="max-w-xl mx-auto bg-white rounded-xl shadow-sm p-8 text-center">
          <div class="w-12 h-12 mx-auto rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mb-3">${icon('monitor', 'w-6 h-6')}</div>
          <p class="font-medium text-slate-700">Belum ada aset yang terdaftar atas nama Anda.</p>
          <p class="text-sm text-slate-500 mt-1">${isAdmin() ? 'Klik "Coba sebagai User" di kanan atas untuk melihat tampilan Aset Saya milik user.' : 'Hubungi tim IT.'}</p></div>`;
      }
      myAssetIdx = Math.min(myAssetIdx, list.length - 1);
      return `<div class="max-w-3xl mx-auto">
        ${list.length > 1 ? `<div class="flex gap-2 mb-3 overflow-x-auto">${list.map((a, i) => `<button data-idx="${i}" class="px-3 py-1.5 rounded-lg text-sm whitespace-nowrap ${i === myAssetIdx ? 'bg-blue-600 text-white' : 'bg-white border text-slate-600'}">${esc(a.device_name || a.asset_number)}</button>`).join('')}</div>` : ''}
        <div id="myCard">${assetCard(list[myAssetIdx])}</div>
        ${!isAdmin() ? `<div class="mt-4 text-center"><a href="#/tickets" class="${btnPrimary}">${icon('ticket')} Laporkan Masalah</a></div>` : ''}
      </div>`;
    },
    bind() {
      bindAssetCard($('#myCard') || document);
      $$('[data-idx]').forEach((b) => (b.onclick = () => { myAssetIdx = +b.dataset.idx; render(); }));
    },
  };

  // ------------------------------------------------------------------
  // Stok Barang
  // ------------------------------------------------------------------
  const stockUi = { tab: 'recap', devCat: '' };
  PAGES.stock = {
    render() {
      const month = todayStr().slice(0, 7);
      const trxMonth = db.stockTransactions.filter((t) => t.trx_date.startsWith(month));
      const inM = trxMonth.filter((t) => t.type === 'in').reduce((s, t) => s + t.qty, 0);
      const outM = trxMonth.filter((t) => t.type === 'out').reduce((s, t) => s + t.qty, 0);
      const cats = db.stockCategories.map((c) => {
        const trx = db.stockTransactions.filter((t) => t.category_id === c.id);
        return { ...c, in: trx.filter((t) => t.type === 'in').reduce((s, t) => s + t.qty, 0), out: trx.filter((t) => t.type === 'out').reduce((s, t) => s + t.qty, 0), stock: stockOf(c.id) };
      });
      const low = cats.filter((c) => c.stock <= c.min_stock);
      const dev = deviceStock();
      const card = (label, val, sub, color) => `<div class="bg-white rounded-xl shadow-sm p-4 border-l-4 ${color}"><p class="text-xs text-slate-500">${label}</p><p class="text-2xl font-bold text-slate-800 mt-1">${val}</p><p class="text-xs text-slate-400">${sub}</p></div>`;
      const tabs = [['recap', 'Rekap Stok'], ['devices', `Aset IT Stok <span class="ml-1 text-xs rounded-full px-1.5 ${stockUi.tab === 'devices' ? 'bg-white/25' : 'bg-blue-100 text-blue-700'}">${dev.total}</span>`], ['history', 'Riwayat Transaksi'], ['user', 'Diberikan ke User']].map(([k, l]) => `<button data-stab="${k}" class="px-3 py-1.5 rounded-lg text-sm font-medium ${stockUi.tab === k ? 'bg-blue-600 text-white' : 'bg-white border text-slate-600'}">${l}</button>`).join('');
      const deviceRecap = `
        <div class="border-t-4 border-slate-100">
          <div class="flex flex-wrap items-center justify-between gap-2 px-4 pt-4 pb-2">
            <p class="font-semibold text-slate-700 text-sm">Aset IT per Jenis <span class="ml-1 text-[11px] font-semibold uppercase tracking-wide bg-blue-100 text-blue-700 rounded-full px-2 py-0.5">Otomatis dari menu Aset</span></p>
            <button data-stab-go="devices" class="text-xs font-medium text-blue-600 hover:underline">Lihat daftar unit →</button>
          </div>
          <table class="w-full text-sm"><thead><tr class="text-left text-slate-500 border-b bg-slate-50"><th class="py-2.5 px-4">Jenis Aset</th><th class="py-2.5 px-4 text-right">Stok (siap pakai)</th><th class="py-2.5 px-4 text-right">Digunakan</th><th class="py-2.5 px-4 text-right">Tidak Digunakan</th><th class="py-2.5 px-4">Ketersediaan</th></tr></thead>
          <tbody>${dev.rows.map((r) => `<tr class="border-b last:border-0"><td class="py-2.5 px-4 font-medium"><button data-devcat-go="${esc(r.name)}" class="inline-flex items-center gap-2 hover:text-blue-600">${categoryIcon(r.name, 'w-4 h-4 text-slate-400')} ${esc(r.name)}</button></td>
            <td class="py-2.5 px-4 text-right font-semibold">${r.stok} unit</td><td class="py-2.5 px-4 text-right text-slate-500">${r.used}</td><td class="py-2.5 px-4 text-right text-slate-500">${r.unused}</td>
            <td class="py-2.5 px-4">${r.stok > 0 ? '<span class="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">Tersedia</span>' : '<span class="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">Habis</span>'}</td></tr>`).join('')}</tbody></table>
          <p class="px-4 py-3 text-xs text-slate-400">Jumlah ini dihitung langsung dari aset berstatus <b>Stok</b>. Saat aset diberikan ke user (status jadi Digunakan), jumlahnya otomatis berkurang.</p>
        </div>`;
      let content = '';
      if (stockUi.tab === 'recap') {
        content = `<table class="w-full text-sm"><thead><tr class="text-left text-slate-500 border-b bg-slate-50"><th class="py-2.5 px-4">Kategori</th><th class="py-2.5 px-4 text-right">Total Masuk</th><th class="py-2.5 px-4 text-right">Total Keluar</th><th class="py-2.5 px-4 text-right">Stok Sekarang</th><th class="py-2.5 px-4 text-right">Min.</th><th class="py-2.5 px-4">Ketersediaan</th></tr></thead>
        <tbody>${cats.map((c) => `<tr class="border-b last:border-0"><td class="py-2.5 px-4 font-medium">${esc(c.name)}</td><td class="py-2.5 px-4 text-right text-green-600">+${c.in}</td><td class="py-2.5 px-4 text-right text-red-500">−${c.out}</td>
          <td class="py-2.5 px-4 text-right font-semibold">${c.stock} ${esc(c.unit)}</td><td class="py-2.5 px-4 text-right text-slate-500">${c.min_stock}</td>
          <td class="py-2.5 px-4">${c.stock <= 0 ? '<span class="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">Habis</span>' : c.stock <= c.min_stock ? '<span class="px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">Menipis</span>' : '<span class="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">Aman</span>'}</td></tr>`).join('')}</tbody></table>${deviceRecap}`;
      } else if (stockUi.tab === 'devices') {
        content = `<div class="px-4 py-3 text-sm text-slate-500 bg-blue-50 border-b border-blue-100">Semua aset berstatus <b>Stok</b> di menu Aset (PC, laptop, printer, monitor, aksesoris, tablet, dll.) otomatis tampil di sini. Klik <b>Serahkan ke User</b> untuk memberikan unit ke karyawan — statusnya berubah jadi Digunakan dan unit keluar dari stok.
          <div class="mt-2 flex flex-wrap gap-1.5">${[{ name: '', stok: dev.total, label: 'Semua' }, ...dev.rows.filter((r) => r.stok)].map((r) => `<button data-devcat="${esc(r.name)}" class="px-2.5 py-1 rounded-full text-xs font-medium ${stockUi.devCat === r.name ? 'bg-blue-600 text-white' : 'bg-white border text-slate-600'}">${esc(r.label || r.name)} ${r.stok}</button>`).join('')}</div></div>
        <table class="w-full text-sm"><thead><tr class="text-left text-slate-500 border-b bg-slate-50"><th class="py-2.5 px-4">No. Aset</th><th class="py-2.5 px-4">Jenis</th><th class="py-2.5 px-4">Spesifikasi</th><th class="py-2.5 px-4">Serial Number</th><th class="py-2.5 px-4">Lokasi</th><th class="py-2.5 px-4">Tgl Pembelian</th><th class="py-2.5 px-4"></th></tr></thead>
        <tbody>${dev.items.map((a) => `<tr class="border-b last:border-0 hover:bg-slate-50">
          <td class="py-2.5 px-4 whitespace-nowrap"><a href="#" data-dev-detail="${a.id}" class="font-medium text-blue-600 hover:underline">${esc(a.asset_number)}</a><div class="text-xs text-slate-400">${esc(a.device_name || '')}</div></td>
          <td class="py-2.5 px-4 whitespace-nowrap">${esc(a.category)}</td>
          <td class="py-2.5 px-4 text-xs text-slate-600 min-w-[12rem]">${esc([a.processor, a.ram, a.storage].filter(Boolean).join(' / ') || DASH)}</td>
          <td class="py-2.5 px-4 whitespace-nowrap">${esc(a.serial_number || DASH)}</td><td class="py-2.5 px-4 whitespace-nowrap">${esc(a.location || DASH)}</td>
          <td class="py-2.5 px-4 whitespace-nowrap">${a.purchase_date ? fmtDate(a.purchase_date) : DASH}</td>
          <td class="py-2.5 px-4 text-right"><button data-handover="${a.id}" class="inline-flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-3 py-1.5 text-xs font-medium whitespace-nowrap">${icon('users', 'w-3.5 h-3.5')} Serahkan ke User</button></td></tr>`).join('') || '<tr><td colspan="7" class="py-8 text-center text-slate-400">Tidak ada aset berstatus Stok.</td></tr>'}</tbody></table>`;
      } else if (stockUi.tab === 'history') {
        const trx = [...db.stockTransactions].sort((a, b) => b.trx_date.localeCompare(a.trx_date) || b.id - a.id);
        content = `<table class="w-full text-sm"><thead><tr class="text-left text-slate-500 border-b bg-slate-50"><th class="py-2.5 px-4">Tanggal</th><th class="py-2.5 px-4">Jenis</th><th class="py-2.5 px-4">Kategori</th><th class="py-2.5 px-4">Nama/Merk</th><th class="py-2.5 px-4 text-right">Jumlah</th><th class="py-2.5 px-4">Diberikan kepada</th><th class="py-2.5 px-4">Catatan</th><th class="py-2.5 px-4"></th></tr></thead>
        <tbody>${trx.map((t) => { const c = db.stockCategories.find((x) => x.id === t.category_id) || {}; return `<tr class="border-b last:border-0">
          <td class="py-2.5 px-4 whitespace-nowrap">${fmtDate(t.trx_date)}</td>
          <td class="py-2.5 px-4">${t.type === 'in' ? '<span class="text-green-600 font-medium">Masuk</span>' : '<span class="text-red-500 font-medium">Keluar</span>'}</td>
          <td class="py-2.5 px-4">${esc(c.name || DASH)}</td><td class="py-2.5 px-4">${esc(t.item_name || DASH)}</td>
          <td class="py-2.5 px-4 text-right font-medium">${t.qty} ${esc(c.unit || '')}</td>
          <td class="py-2.5 px-4">${t.type === 'out' ? esc(t.recipient_name) + `<div class="text-xs text-slate-400">${esc(t.recipient_department || '')}</div>` : DASH}</td>
          <td class="py-2.5 px-4 text-slate-500">${esc(t.note || '')}</td>
          <td class="py-2.5 px-4 text-right"><button data-trx-del="${t.id}" class="p-1.5 rounded-lg text-slate-500 hover:bg-red-50 hover:text-red-600">${icon('trash')}</button></td></tr>`; }).join('')}</tbody></table>`;
      } else {
        const outs = db.stockTransactions.filter((t) => t.type === 'out');
        const byUser = {};
        outs.forEach((t) => { const k = t.recipient_name || '-'; (byUser[k] = byUser[k] || { dept: t.recipient_department, items: {} }); const c = (db.stockCategories.find((x) => x.id === t.category_id) || {}).name || '-'; byUser[k].items[c] = (byUser[k].items[c] || 0) + t.qty; });
        content = `<table class="w-full text-sm"><thead><tr class="text-left text-slate-500 border-b bg-slate-50"><th class="py-2.5 px-4">Nama</th><th class="py-2.5 px-4">Departement</th><th class="py-2.5 px-4">Barang Diterima</th></tr></thead>
        <tbody>${Object.entries(byUser).map(([n, v]) => `<tr class="border-b last:border-0"><td class="py-2.5 px-4 font-medium">${esc(n)}</td><td class="py-2.5 px-4">${esc(v.dept || DASH)}</td><td class="py-2.5 px-4">${Object.entries(v.items).map(([c, q]) => `<span class="inline-block bg-slate-100 rounded px-2 py-0.5 text-xs mr-1 mb-1">${esc(c)} × ${q}</span>`).join('')}</td></tr>`).join('') || '<tr><td colspan="3" class="py-8 text-center text-slate-400">Belum ada barang keluar.</td></tr>'}</tbody></table>`;
      }
      return `
<div class="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-4">
  <button data-stab-go="devices" class="text-left">${card('Aset IT Stok', dev.total + ' unit', esc(dev.rows.filter((r) => r.stok).map((r) => `${r.name}: ${r.stok}`).join(' · ') || 'tidak ada'), 'border-indigo-500')}</button>
  ${card('Jenis Barang', cats.length, 'kategori terdaftar', 'border-blue-500')}
  ${card('Masuk Bulan Ini', inM, 'unit', 'border-green-500')}
  ${card('Keluar Bulan Ini', outM, 'unit', 'border-red-400')}
  ${card('Stok Menipis', low.length, low.length ? esc(low.map((l) => l.name).join(', ')) : 'semua aman', 'border-amber-500')}
</div>
<div class="flex flex-wrap items-center gap-2 mb-4">${tabs}
  <div class="flex gap-2 sm:ml-auto">
    <button id="btnCatStock" class="${btnGhost}">${icon('tag')} Kategori</button>
    <button id="btnIn" class="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white rounded-lg px-4 py-2 text-sm font-medium">${icon('plus')} Barang Masuk</button>
    <button id="btnOut" class="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white rounded-lg px-4 py-2 text-sm font-medium">${icon('minus')} Barang Keluar</button>
  </div>
</div>
<div class="bg-white rounded-xl shadow-sm overflow-x-auto">${content}</div>`;
    },
    bind() {
      $$('[data-stab]').forEach((b) => (b.onclick = () => { stockUi.tab = b.dataset.stab; render(); }));
      $$('[data-devcat-go]').forEach((b) => (b.onclick = () => { stockUi.devCat = b.dataset.devcatGo; stockUi.tab = 'devices'; render(); }));
      $$('[data-devcat]').forEach((b) => (b.onclick = () => { stockUi.devCat = b.dataset.devcat; render(); }));
      $$('[data-stab-go]').forEach((b) => (b.onclick = () => { stockUi.tab = b.dataset.stabGo; stockUi.devCat = ''; render(); }));
      $$('[data-dev-detail]').forEach((a) => (a.onclick = (e) => { e.preventDefault(); showAssetDetail(+a.dataset.devDetail); }));
      $$('[data-handover]').forEach((b) => (b.onclick = () => {
        const a = assetById(+b.dataset.handover);
        const users = db.users.filter((u) => u.is_active).sort((x, y) => x.full_name.localeCompare(y.full_name));
        openModal('Serahkan ke User', `<form id="hoForm" class="space-y-3">
          <div class="rounded-lg bg-slate-50 p-3 text-sm"><p class="font-medium text-slate-700">${esc(a.asset_number)}</p><p class="text-slate-500">${esc(a.device_name || a.category)} · ${esc([a.processor, a.ram].filter(Boolean).join(' / '))}</p></div>
          ${field('Diberikan kepada', `<select name="user_id" required class="${inputCls}">${options(users.map((u) => ({ value: u.id, label: `${u.full_name} (${u.department || '-'})` })), '', '— Pilih user —')}</select>`)}
          ${field('Lokasi baru <span class="text-xs text-slate-400">(opsional)</span>', `<input name="location" value="${esc(a.location || '')}" class="${inputCls}">`)}
          <p class="text-xs text-slate-500">Status aset akan berubah menjadi <b>Digunakan</b>; Departement &amp; email ikut data user.</p>
          <div class="modal-actions flex justify-end gap-2 pt-2 border-t"><button type="button" data-close class="${btnGhost}">Batal</button><button class="${btnPrimary}">${icon('check')} Serahkan</button></div></form>`, {
          onMount(root) {
            $('#hoForm', root).onsubmit = (e) => {
              e.preventDefault();
              const d = formData(e.target);
              const u = userById(+d.user_id);
              const m = recordMutation(a, u.id, { reason: 'handover', location: d.location.trim() }); // riwayatnya masuk ke menu Mutasi Aset
              save(); closeModal(); render(); toast(`${a.asset_number} diserahkan ke ${u.full_name} (${m.number}).`);
            };
          },
        });
      }));
      $$('[data-trx-del]').forEach((b) => (b.onclick = async () => {
        const t = db.stockTransactions.find((x) => x.id === +b.dataset.trxDel);
        if (t.type === 'in' && (stockOf(t.category_id) - t.qty < 0 || itemStockOf(t.category_id, t.item_name, t.id) < 0)) { toast(`Tidak bisa dihapus: "${t.item_name || 'barang ini'}" sudah sebagian diserahkan ke user. Hapus dulu Barang Keluar-nya.`, false); return; }
        if (!(await ask('Hapus transaksi ini?'))) return;
        db.stockTransactions = db.stockTransactions.filter((x) => x !== t); save(); render(); toast('Transaksi dihapus.');
      }));
      const trxForm = (type) => {
        const users = db.users.filter((u) => u.is_active).sort((a, b) => a.full_name.localeCompare(b.full_name));
        // Barang Keluar: kategori yang punya stok dipilih lebih dulu
        const firstCat = type === 'out' ? (db.stockCategories.find((c) => stockOf(c.id) > 0) || db.stockCategories[0] || {}).id : '';
        openModal(type === 'in' ? 'Barang Masuk' : 'Barang Keluar', `<form id="trxForm" class="space-y-3">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            ${field('Kategori', `<select name="category_id" id="trxCat" class="${inputCls}">${options(db.stockCategories.map((c) => ({ value: c.id, label: `${c.name} (stok: ${stockOf(c.id)} ${c.unit})` })), firstCat)}</select>`)}
            ${field(type === 'in' ? 'Tanggal Masuk' : 'Tanggal Keluar', `<input type="date" name="trx_date" value="${todayStr()}" required class="${inputCls}">`)}
            ${type === 'in'
              ? field('Nama / Merk <span class="text-xs text-slate-400">(opsional)</span>', `<input name="item_name" list="trxItemList" autocomplete="off" placeholder="mis. Logitech B100" class="${inputCls}"><datalist id="trxItemList"></datalist><p class="text-xs text-slate-400 mt-1">Nama yang pernah dipakai muncul sebagai saran.</p>`, 'sm:col-span-2')
              : field('Pilih barang (dari Barang Masuk)', `<select name="item_name" id="trxPick" class="${inputCls}"></select><p id="trxPickInfo" class="text-xs text-amber-700 mt-1"></p>`, 'sm:col-span-2')}
            ${field('Jumlah', `<input type="number" name="qty" min="1" value="1" required class="${inputCls}">`)}
            ${type === 'out' ? field('Diberikan kepada', `<select name="user_id" required class="${inputCls}">${options(users.map((u) => ({ value: u.id, label: `${u.full_name} (${u.department || '-'})` })), '', '— Pilih user —')}</select>`) : '<div></div>'}
            ${field('Catatan <span class="text-xs text-slate-400">(opsional)</span>', `<input name="note" class="${inputCls}">`, 'sm:col-span-2')}
          </div>
          <p id="trxErr" class="hidden text-sm bg-red-50 text-red-700 rounded-lg px-3 py-2"></p>
          <div class="modal-actions flex justify-end gap-2 pt-2 border-t"><button type="button" data-close class="${btnGhost}">Batal</button><button class="${btnPrimary}">${icon('check')} Simpan</button></div></form>`, {
          wide: true,
          onMount(root) {
            const cat = $('#trxCat', root);
            const refreshItems = () => {
              const c = db.stockCategories.find((x) => x.id === +cat.value) || {};
              if (type === 'in') {
                $('#trxItemList', root).innerHTML = itemsIn(cat.value).filter(Boolean).map((i) => `<option value="${esc(i)}"></option>`).join('');
                return;
              }
              const list = itemsIn(cat.value).map((i) => ({ item: i, s: itemStockOf(cat.value, i) })).filter((r) => r.s > 0);
              const pick = $('#trxPick', root);
              pick.innerHTML = list.length ? list.map((r) => `<option value="${esc(r.item)}">${esc(r.item || '(tanpa nama barang)')} — tersedia ${r.s} ${esc(c.unit || '')}</option>`).join('')
                : '<option value="">Tidak ada barang dengan stok</option>';
              pick.disabled = !list.length;
              $('#trxPickInfo', root).textContent = list.length ? '' : 'Belum ada stok barang untuk kategori ini. Catat Barang Masuk dulu.';
            };
            cat.onchange = refreshItems;
            refreshItems();
            $('#trxForm', root).onsubmit = (e) => {
              e.preventDefault();
              const err = (m) => { const el = $('#trxErr', root); el.textContent = m; el.classList.remove('hidden'); };
              const d = formData(e.target);
              const qty = parseInt(d.qty, 10);
              const catId = +d.category_id;
              if (!(qty > 0)) return err('Jumlah harus lebih dari 0.');
              let item = (d.item_name || '').trim();
              if (type === 'out') {
                if ($('#trxPick', root).disabled) return err('Tidak ada barang yang bisa dikeluarkan untuk kategori ini. Catat Barang Masuk dulu.');
                item = $('#trxPick', root).value;
                const s = itemStockOf(catId, item);
                if (qty > s) return err(`Stok "${item || '(tanpa nama barang)'}" tidak cukup. Tersedia hanya ${s}.`);
                if (!d.user_id) return err('Pilih user yang menerima barang.');
              } else {
                const same = itemsIn(catId).find((i) => normItem(i) === normItem(item));
                if (same !== undefined) item = same;   // samakan penulisan dengan nama yang sudah ada
              }
              const u = userById(+d.user_id);
              db.stockTransactions.push({ id: nextId(db.stockTransactions), category_id: catId, type, qty, trx_date: d.trx_date, item_name: item, user_id: u ? u.id : null, recipient_name: u ? u.full_name : '', recipient_department: u ? u.department : '', note: d.note.trim(), created_at: new Date().toISOString() });
              save(); closeModal(); render(); toast(type === 'in' ? 'Barang masuk dicatat.' : `${qty} ${item || 'barang'} diserahkan ke ${u.full_name}.`);
            };
          },
        });
      };
      $('#btnIn').onclick = () => trxForm('in');
      $('#btnOut').onclick = () => trxForm('out');
      $('#btnCatStock').onclick = () => {
        const list = () => db.stockCategories.map((c) => `<tr class="border-b last:border-0"><td class="py-2 pr-3">${esc(c.name)}</td><td class="py-2 pr-3">${esc(c.unit)}</td><td class="py-2 pr-3">${c.min_stock}</td>
          <td class="py-2 text-right"><button data-scdel="${c.id}" class="p-1 text-slate-400 hover:text-red-600">${icon('trash')}</button></td></tr>`).join('');
        openModal('Kategori Stok', `<table class="w-full text-sm mb-4"><thead><tr class="text-left text-slate-500 border-b"><th class="py-2 pr-3">Nama</th><th class="py-2 pr-3">Satuan</th><th class="py-2 pr-3">Min. Stok</th><th></th></tr></thead><tbody id="scList">${list()}</tbody></table>
          <form id="scForm" class="grid grid-cols-12 gap-2 items-end">
            <div class="col-span-5">${field('Nama', `<input name="name" required class="${inputCls}">`)}</div>
            <div class="col-span-3">${field('Satuan', `<input name="unit" value="pcs" required class="${inputCls}">`)}</div>
            <div class="col-span-2">${field('Min.', `<input name="min_stock" type="number" min="0" value="0" class="${inputCls}">`)}</div>
            <div class="col-span-2"><button class="${btnPrimary} w-full justify-center px-2">${icon('plus')}</button></div></form>`, {
          onMount(root) {
            const bindDel = () => $$('[data-scdel]', root).forEach((b) => (b.onclick = () => {
              const id = +b.dataset.scdel;
              if (db.stockTransactions.some((t) => t.category_id === id)) { toast('Kategori masih punya transaksi.', false); return; }
              db.stockCategories = db.stockCategories.filter((c) => c.id !== id); save(); $('#scList', root).innerHTML = list(); bindDel();
            }));
            bindDel();
            $('#scForm', root).onsubmit = (e) => {
              e.preventDefault();
              const d = formData(e.target);
              if (db.stockCategories.some((c) => c.name.toLowerCase() === d.name.trim().toLowerCase())) { toast('Kategori sudah ada.', false); return; }
              db.stockCategories.push({ id: nextId(db.stockCategories), name: d.name.trim(), unit: d.unit.trim(), min_stock: +d.min_stock || 0 });
              save(); e.target.reset(); $('#scList', root).innerHTML = list(); bindDel();
            };
            root.addEventListener('click', (e) => { if (e.target === root || e.target.closest('[data-close]')) render(); });
          },
        });
      };
    },
  };

  // ------------------------------------------------------------------
  // Pengaturan Sistem
  // ------------------------------------------------------------------
  PAGES.settings = {
    render() {
      return `<div class="max-w-2xl"><p class="text-sm text-slate-500 mb-4">Ubah nama sistem, logo, dan prefix Nomor Aset. Di versi demo, pengaturan hanya tersimpan di browser Anda.</p>
<form id="setForm" class="bg-white rounded-xl shadow-sm divide-y">
  <div class="p-5"><p class="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-3">Pratinjau</p>
    <div class="flex items-center gap-3 bg-slate-800 rounded-lg px-4 h-16 max-w-xs">${logoHtml('w-8 h-8 rounded-lg', 'bg-brand-500 text-white font-bold text-sm')}<span id="pvName" class="font-semibold text-white truncate">${esc(appName())}</span></div></div>
  <div class="p-5">${field('Nama Sistem', `<input name="app_name" id="setName" maxlength="60" value="${esc(db.settings.app_name)}" class="${inputCls}">`)}</div>
  <div class="p-5">${field('Prefix Nomor Aset', `<input name="asset_prefix" maxlength="10" value="${esc(prefix())}" class="${inputCls} w-40 uppercase">`)}<p class="text-xs text-slate-400 mt-1">Contoh hasil: ${esc(prefix())}/IT/PC/001. Nomor aset lama tidak berubah.</p></div>
  <div class="p-5">${field('Logo', `<input type="file" name="logo" accept="image/png,image/jpeg,image/webp,image/gif" class="block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-sm file:font-medium">`)}
    <p class="text-xs text-slate-400 mt-1">PNG/JPG/WEBP/GIF, maks. 300 KB (batas versi demo).</p>
    ${db.settings.logo ? '<label class="inline-flex items-center gap-2 text-sm text-red-600 mt-2"><input type="checkbox" name="remove_logo" value="1"> Hapus logo</label>' : ''}</div>
  <div class="p-5 flex flex-wrap justify-between gap-3">
    <button type="button" id="btnFullReset" class="text-sm text-slate-500 hover:text-red-600">Reset semua data demo</button>
    <button class="${btnPrimary}">${icon('check')} Simpan</button></div>
</form></div>`;
    },
    bind() {
      $('#setName').oninput = (e) => ($('#pvName').textContent = e.target.value.trim() || 'IT Asset Management');
      $('#btnFullReset').onclick = () => $('#btnResetDemo').click();
      $('#setForm').onsubmit = (e) => {
        e.preventDefault();
        const f = e.target;
        const finish = (logo) => {
          db.settings.app_name = f.app_name.value.trim().slice(0, 60);
          db.settings.asset_prefix = f.asset_prefix.value.replace(/[^A-Za-z0-9_-]/g, '').toUpperCase().slice(0, 10) || 'AST';
          if (logo !== undefined) db.settings.logo = logo;
          save(); render(); toast('Pengaturan disimpan.');
        };
        if (f.remove_logo && f.remove_logo.checked) return finish('');
        const file = f.logo.files[0];
        if (!file) return finish(undefined);
        if (file.size > 300 * 1024) { toast('Logo terlalu besar (maks. 300 KB di demo).', false); return; }
        const rd = new FileReader();
        rd.onload = () => finish(rd.result);
        rd.readAsDataURL(file);
      };
    },
  };

  // ==================================================================
  // FITUR BARU (Okt 2026): Jabatan, Mutasi Aset, Aset Rusak, Export Audit,
  // Ganti Password PC, Signature Email, Ganti Password login
  // ==================================================================
  const positionsOf = (assetId) => {
    const list = ownersOf(assetId).map((o) => o.position || '');
    return list.some(Boolean) ? list.map((p) => p || DASH).join(', ') : '';
  };
  const accItems = (a) => (a.accessory_items || []);
  const accText = (a) => (accItems(a).length ? accItems(a).map((x) => x.name + (x.brand ? ' (' + x.brand + ')' : '')).join(', ') : (a.accessories || ''));
  const logsOf = (ticketId) => db.ticketLogs.filter((l) => l.ticket_id === ticketId).sort((x, y) => x.changed_at.localeCompare(y.changed_at));
  // Waktu selesai = saat tiket pertama kali menjadi Selesai sejak terakhir berstatus lain.
  function doneAt(t) {
    if (isCancelled(t) || t.status !== 'Selesai') return '';
    let at = '';
    logsOf(t.id).forEach((l) => { if (l.status !== 'Selesai') at = ''; else if (!at) at = l.changed_at; });
    return at || t.resolved_at || '';
  }
  function durationLabel(from, to) {
    const sec = Math.max(0, (new Date(to) - new Date(from)) / 1000);
    const d = Math.floor(sec / 86400), h = Math.floor((sec % 86400) / 3600), m = Math.floor((sec % 3600) / 60);
    if (d > 0) return d + ' hari' + (h ? ' ' + h + ' jam' : '');
    if (h > 0) return h + ' jam' + (m ? ' ' + m + ' menit' : '');
    return Math.max(1, m) + ' menit';
  }

  // ---- Generator Password PC: 3 huruf (ada besar & kecil) + angka + 1 simbol di akhir, mis. kMa249$
  const PCPW_LENGTHS = [6, 7, 8, 10, 12];
  function genPcPassword(len) {
    len = Math.max(6, len || 7);
    const up = 'ABCDEFGHJKMNPQRSTUVWXYZ', lo = 'abcdefghijkmnpqrstuvwxyz', dg = '23456789', sy = '!@#$%&*?';
    const pick = (s) => s[Math.floor(Math.random() * s.length)];
    let letters;
    do { letters = [0, 1, 2].map(() => pick(Math.random() < 0.5 ? up : lo)).join(''); } while (!/[A-Z]/.test(letters) || !/[a-z]/.test(letters));
    let digits = ''; for (let i = 0; i < len - 4; i++) digits += pick(dg);
    return letters + digits + pick(sy);
  }
  function genUniquePcPassword(len, used) {
    let p; let n = 0;
    do { p = genPcPassword(len); n++; } while (used.has(p) && n < 500);
    used.add(p);
    return p;
  }
  const pcPwOk = (p) => /^[A-Za-z]{3}\d+[^A-Za-z0-9]$/.test(p) && p.length >= 6 && /[A-Z]/.test(p) && /[a-z]/.test(p);

  // ---- Ganti Password login (menu di ikon user pojok kanan atas)
  const defaultPassword = (u) => (u.username === 'admin' ? 'admin123' : u.username === 'user' ? 'user123' : 'demo123');
  function changePasswordModal() {
    const u = currentUser();
    openModal('Ganti Password Login', `<form id="cpForm" class="space-y-3">
      <p class="text-sm text-slate-500">Kosongkan password baru jika ingin tetap memakai password yang diberikan admin.</p>
      ${field('Password sekarang', `<input name="old" type="password" autocomplete="off" class="${inputCls}">`)}
      ${field('Password baru <span class="text-xs text-slate-400">(minimal 6 karakter)</span>', `<input name="new1" type="password" autocomplete="off" class="${inputCls}" placeholder="Kosongkan jika tidak ingin mengganti">`)}
      ${field('Ulangi password baru', `<input name="new2" type="password" autocomplete="off" class="${inputCls}">`)}
      <p class="text-xs text-slate-400">Password akun ini sekarang: <b>${esc(u.demo_password || defaultPassword(u))}</b> (ditampilkan hanya di versi demo).</p>
      <div id="cpErr" class="hidden text-sm bg-red-50 text-red-600 border border-red-200 rounded-lg px-3 py-2"></div>
      <div class="modal-actions flex justify-end gap-2 pt-2 border-t"><button type="button" data-close class="${btnGhost}">Batal</button><button class="${btnPrimary}">${icon('check')} Simpan</button></div></form>`, {
      onMount(root) {
        $('#cpForm', root).onsubmit = (e) => {
          e.preventDefault();
          const d = formData(e.target); const cur = u.demo_password || defaultPassword(u);
          const err = (m) => { const el = $('#cpErr', root); el.textContent = m; el.classList.remove('hidden'); };
          if (!d.new1 && !d.new2) { closeModal(); toast('Tidak ada perubahan. Password tetap seperti semula.'); return; }
          if (d.old !== cur) return err('Password sekarang salah.');
          if (d.new1.length < 6) return err('Password baru minimal 6 karakter.');
          if (d.new1 !== d.new2) return err('Ulangi password baru tidak sama.');
          if (d.new1 === cur) return err('Password baru sama dengan password sekarang.');
          u.demo_password = d.new1; save(); closeModal(); toast('Password login berhasil diganti.');
        };
      },
    });
  }

  // ------------------------------------------------------------------
  // Mutasi Aset
  // ------------------------------------------------------------------
  const MUT_REASONS = { rotation: 'Rotasi / pindah bagian', resign: 'Karyawan resign / keluar', replace: 'Penggantian perangkat', handover: 'Serah terima dari stok', other: 'Lainnya' };
  function newMutationNumber() {
    const ym = todayStr().slice(0, 7).replace('-', '');
    let n = db.mutations.filter((m) => m.number.startsWith('MUT-' + ym)).length + 1; let num;
    do { num = `MUT-${ym}-${String(n).padStart(4, '0')}`; n++; } while (db.mutations.some((m) => m.number === num));
    return num;
  }
  // Catat mutasi + pindahkan kepemilikan aset. toUserId null = dikembalikan ke stok.
  function recordMutation(a, toUserId, { reason = 'rotation', condition = 'Baik', note = '', location } = {}) {
    const from = ownersOf(a.id); const to = toUserId ? userById(toUserId) : null;
    const m = {
      id: nextId(db.mutations), number: newMutationNumber(), date: todayStr(), asset_id: a.id, asset_number: a.asset_number, asset_category: a.category, asset_name: a.device_name || '',
      serial_number: a.serial_number || '', accessories: accText(a),
      from_names: from.map((u) => u.full_name).join(', '), from_department: a.department || '', from_location: a.location || '',
      to_names: to ? to.full_name : '', to_department: to ? (to.department || '') : '', to_location: location !== undefined ? location : (a.location || ''),
      reason, condition, note, by: (currentUser() || {}).full_name || '',
    };
    db.mutations.push(m);
    db.assetOwners = db.assetOwners.filter((o) => o.asset_id !== a.id);
    if (to) {
      db.assetOwners.push({ asset_id: a.id, user_id: to.id });
      Object.assign(a, { status: 'Digunakan', department: to.department || '', owner_email: to.email || '', location: m.to_location });
      if (/laptop|pc/i.test(a.category)) Object.assign(a, { pc_username: to.pc_username || '', pc_password: to.pc_password || '' });
    } else {
      Object.assign(a, { status: 'Stok', department: '', owner_email: '', pc_username: '', pc_password: '', location: m.to_location });
    }
    return m;
  }
  function printMutation(m) {
    const w = window.open('', '_blank');
    if (!w) { toast('Pop-up diblokir browser. Izinkan pop-up untuk mencetak.', false); return; }
    const row = (k, v) => `<tr><td style="padding:5px 8px;border:1px solid #ccc;width:34%;color:#444">${k}</td><td style="padding:5px 8px;border:1px solid #ccc">${esc(v || DASH)}</td></tr>`;
    const isTablet = /tablet/i.test(m.asset_category);
    const sign = (t, n) => `<td style="width:33%;text-align:center;vertical-align:top;padding:0 8px">${t}<div style="height:70px"></div><div style="border-top:1px solid #333;padding-top:4px">${esc(n)}</div></td>`;
    w.document.write(`<!DOCTYPE html><html><head><title>${esc(m.number)}</title><meta charset="utf-8"></head>
      <body style="font-family:Arial,sans-serif;font-size:13px;max-width:720px;margin:24px auto;color:#111">
      <div style="text-align:center;font-size:17px;font-weight:bold">BERITA ACARA MUTASI ASET</div>
      <div style="text-align:center;color:#555;margin-bottom:14px">${esc(appName())} · No. ${esc(m.number)} · ${fmtDate(m.date)}</div>
      <div style="font-weight:bold;margin:10px 0 4px">Data Aset</div>
      <table style="width:100%;border-collapse:collapse">${row('Nomor Aset', m.asset_number)}${row('Jenis Aset', m.asset_category)}${row('Nama Perangkat', m.asset_name)}
      ${isTablet ? row('Serial Number', m.serial_number) : ''}${row('Aksesoris', m.accessories)}${row('Kondisi', m.condition)}</table>
      <table style="width:100%;border-collapse:collapse;margin-top:12px"><tr>
        <td style="width:50%;vertical-align:top;padding-right:6px"><div style="font-weight:bold;margin-bottom:4px">Dari</div><table style="width:100%;border-collapse:collapse">${row('Pengguna', m.from_names || 'Stok IT')}${row('Departement', m.from_department)}${row('Lokasi', m.from_location)}</table></td>
        <td style="width:50%;vertical-align:top;padding-left:6px"><div style="font-weight:bold;margin-bottom:4px">Kepada</div><table style="width:100%;border-collapse:collapse">${row('Pengguna', m.to_names || 'Stok IT')}${row('Departement', m.to_department)}${row('Lokasi', m.to_location)}</table></td>
      </tr></table>
      <p><b>Alasan:</b> ${esc(MUT_REASONS[m.reason] || m.reason)}${m.note ? '<br><b>Catatan:</b> ' + esc(m.note) : ''}</p>
      <table style="width:100%;margin-top:28px"><tr>${sign('Yang Menyerahkan,', m.from_names || 'IT Support')}${sign('Yang Menerima,', m.to_names || 'IT Support')}${sign('Mengetahui,', 'Manager HR-GA')}</tr></table>
      <p style="color:#999;font-size:11px;margin-top:24px">Dokumen ini dibuat otomatis oleh ${esc(appName())} (demo). ${esc(COPYRIGHT)}</p>
      <script>window.onload=function(){window.print()}<\/script></body></html>`);
    w.document.close();
  }
  function mutationForm(presetAssetId) {
    const list = db.assets.filter((a) => a.status !== 'Tidak Digunakan').sort((x, y) => x.asset_number.localeCompare(y.asset_number));
    const users = db.users.filter((u) => u.is_active).sort((x, y) => x.full_name.localeCompare(y.full_name));
    openModal('Buat Mutasi Aset', `<form id="mutForm" class="space-y-3">
      ${field('Aset', `<select name="asset_id" id="mutAsset" required class="${inputCls}">${options(list.map((a) => ({ value: a.id, label: `${a.asset_number} — ${a.device_name || a.category} (${ownersOf(a.id).map((o) => o.full_name).join(', ') || 'Stok'})` })), presetAssetId || '', '— Pilih aset —')}</select>`)}
      <div id="mutFrom" class="rounded-lg bg-slate-50 p-3 text-sm text-slate-600"></div>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        ${field('Dipindahkan kepada', `<select name="to" class="${inputCls}">${options(users.map((u) => ({ value: u.id, label: `${u.full_name} (${u.department || '-'})` })), '', '— Kembalikan ke Stok IT —')}</select>`)}
        ${field('Alasan', `<select name="reason" class="${inputCls}">${options(Object.keys(MUT_REASONS).filter((k) => k !== 'handover').map((k) => ({ value: k, label: MUT_REASONS[k] })), 'rotation')}</select>`)}
        ${field('Lokasi baru', `<input name="location" id="mutLoc" class="${inputCls}">`)}
        ${field('Kondisi aset', `<select name="condition" class="${inputCls}">${options(['Baik', 'Baik dengan catatan', 'Perlu perbaikan'], 'Baik')}</select>`)}
      </div>
      ${field('Catatan', `<textarea name="note" rows="2" class="${inputCls}" placeholder="mis. Karyawan resign, aset dikembalikan ke IT"></textarea>`)}
      <p class="text-xs text-slate-500">Kepemilikan di menu Aset ikut berubah otomatis, dan Berita Acara bisa dicetak dari daftar mutasi.</p>
      <div class="modal-actions flex justify-end gap-2 pt-2 border-t"><button type="button" data-close class="${btnGhost}">Batal</button><button class="${btnPrimary}">${icon('check')} Simpan Mutasi</button></div></form>`, {
      wide: true,
      onMount(root) {
        const sel = $('#mutAsset', root);
        const info = () => {
          const a = assetById(+sel.value);
          $('#mutFrom', root).innerHTML = a ? `<b>Dari:</b> ${esc(ownersOf(a.id).map((o) => o.full_name).join(', ') || 'Stok IT')} · ${esc(a.department || DASH)} · ${esc(a.location || DASH)}<br><b>Aksesoris:</b> ${esc(accText(a) || DASH)}` : 'Pilih aset untuk melihat pengguna sekarang.';
          if (a) $('#mutLoc', root).value = a.location || '';
        };
        sel.onchange = info; info();
        $('#mutForm', root).onsubmit = (e) => {
          e.preventDefault();
          const d = formData(e.target); const a = assetById(+d.asset_id);
          if (!a) return;
          const cur = ownersOf(a.id).map((o) => o.id);
          if (d.to && cur.length === 1 && cur[0] === +d.to) { toast('Aset ini sudah dipakai user tersebut.', false); return; }
          if (!d.to && !cur.length) { toast('Aset ini sudah berada di Stok IT.', false); return; }
          const m = recordMutation(a, d.to ? +d.to : null, { reason: d.reason, condition: d.condition, note: d.note.trim(), location: d.location.trim() });
          save(); closeModal(); render(); toast(`Mutasi ${m.number} tersimpan.`);
        };
      },
    });
  }
  PAGES.mutations = {
    render() {
      const list = [...db.mutations].sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id);
      const month = todayStr().slice(0, 7);
      const card = (l, v, c) => `<div class="bg-white rounded-xl shadow-sm p-4 border-l-4 ${c}"><p class="text-xs text-slate-500">${l}</p><p class="text-2xl font-bold text-slate-800 mt-1">${v}</p></div>`;
      return `<p class="text-sm text-slate-500 mb-4 max-w-3xl">Catat pemindahan aset dari pengguna lama ke pengguna baru (atau dikembalikan ke Stok IT). Setiap mutasi punya nomor dan Berita Acara yang bisa dicetak.</p>
<div class="flex flex-wrap gap-2 mb-4"><button id="btnAddMut" class="${btnPrimary}">${icon('transfer')} Buat Mutasi</button>
  ${ARTIFACT ? '' : `<button id="btnExportMut" class="${btnGhost}">${icon('download')} Export CSV</button>`}</div>
<div class="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
  ${card('Total mutasi', list.length, 'border-blue-500')}${card('Mutasi bulan ini', list.filter((m) => m.date.startsWith(month)).length, 'border-green-500')}
  ${card('Dipindahkan ke user', list.filter((m) => m.to_names).length, 'border-amber-500')}${card('Dikembalikan ke stok', list.filter((m) => !m.to_names).length, 'border-slate-400')}</div>
<div class="bg-white rounded-xl shadow-sm table-sticky overflow-x-auto"><table class="w-full text-sm">
<thead><tr class="text-left text-slate-500 border-b bg-slate-50"><th class="py-2.5 px-4">No. Mutasi</th><th class="py-2.5 px-4">Tanggal</th><th class="py-2.5 px-4">Aset</th><th class="py-2.5 px-4">Dari</th><th class="py-2.5 px-4">Kepada</th><th class="py-2.5 px-4">Alasan</th><th class="py-2.5 px-4 text-right">Berita Acara</th></tr></thead>
<tbody>${list.map((m) => `<tr class="border-b last:border-0 hover:bg-slate-50 align-top">
  <td class="py-2.5 px-4 font-medium whitespace-nowrap text-blue-700">${esc(m.number)}</td>
  <td class="py-2.5 px-4 whitespace-nowrap">${fmtDate(m.date)}<div class="text-xs text-slate-400">${esc(m.by)}</div></td>
  <td class="py-2.5 px-4"><div class="font-medium whitespace-nowrap">${esc(m.asset_number)}</div><div class="text-xs text-slate-400">${esc(m.asset_category)} · ${esc(m.asset_name)}</div></td>
  <td class="py-2.5 px-4">${esc(m.from_names || 'Stok IT')}<div class="text-xs text-slate-400">${esc([m.from_department, m.from_location].filter(Boolean).join(' · '))}</div></td>
  <td class="py-2.5 px-4">${m.to_names ? esc(m.to_names) : '<span class="italic text-slate-500">Stok IT</span>'}<div class="text-xs text-slate-400">${esc([m.to_department, m.to_location].filter(Boolean).join(' · '))}</div></td>
  <td class="py-2.5 px-4"><span class="px-2 py-0.5 rounded-full text-xs font-medium ${m.reason === 'resign' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}">${esc(MUT_REASONS[m.reason] || m.reason)}</span>${m.note ? `<div class="text-xs text-slate-500 mt-1 max-w-xs">${esc(m.note)}</div>` : ''}</td>
  <td class="py-2.5 px-4 text-right">${ARTIFACT ? '<span class="text-xs text-slate-400">cetak tersedia di demo web</span>' : `<button data-print-mut="${m.id}" class="inline-flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg px-3 py-1.5 text-xs font-medium">${icon('printer', 'w-3.5 h-3.5')} Cetak</button>`}</td></tr>`).join('') || '<tr><td colspan="7" class="py-8 text-center text-slate-400">Belum ada mutasi.</td></tr>'}</tbody></table></div>`;
    },
    bind() {
      $('#btnAddMut').onclick = () => mutationForm(null);
      $$('[data-print-mut]').forEach((b) => (b.onclick = () => printMutation(db.mutations.find((m) => m.id === +b.dataset.printMut))));
      if ($('#btnExportMut')) $('#btnExportMut').onclick = () => downloadCsv('mutasi_aset_demo.csv', [['No. Mutasi', 'Tanggal', 'No. Aset', 'Jenis', 'Nama Perangkat', 'Dari', 'Dept. Asal', 'Kepada', 'Dept. Tujuan', 'Alasan', 'Kondisi', 'Catatan']].concat(db.mutations.map((m) => [m.number, m.date, m.asset_number, m.asset_category, m.asset_name, m.from_names || 'Stok IT', m.from_department, m.to_names || 'Stok IT', m.to_department, MUT_REASONS[m.reason] || m.reason, m.condition, m.note])));
    },
  };

  // ------------------------------------------------------------------
  // Aset Rusak
  // ------------------------------------------------------------------
  const DMG_STATES = { broken: ['Rusak', 'bg-red-100 text-red-700'], repair: ['Sedang diperbaiki', 'bg-amber-100 text-amber-700'], fixed: ['Selesai diperbaiki', 'bg-green-100 text-green-700'], disposed: ['Dihapus / dibuang', 'bg-slate-200 text-slate-600'] };
  function damageForm() {
    const openIds = db.damages.filter((d) => d.state === 'broken' || d.state === 'repair').map((d) => d.asset_id);
    const list = db.assets.filter((a) => !openIds.includes(a.id)).sort((x, y) => x.asset_number.localeCompare(y.asset_number));
    openModal('Tandai Aset Rusak', `<form id="dmgForm" class="space-y-3">
      ${field('Aset', `<select name="asset_id" required class="${inputCls}">${options(list.map((a) => ({ value: a.id, label: `${a.asset_number} — ${a.device_name || a.category}` })), '', '— Pilih aset —')}</select>`)}
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        ${field('Tanggal rusak', `<input type="date" name="date" value="${todayStr()}" required class="${inputCls}">`)}
        ${field('Lokasi penyimpanan', `<input name="storage" class="${inputCls}" placeholder="mis. Gudang IT">`)}
      </div>
      ${field('Kerusakan', `<textarea name="issue" rows="3" required class="${inputCls}" placeholder="mis. Motherboard mati total setelah listrik padam"></textarea>`)}
      <p class="text-xs text-slate-500">Aset dilepas dari penggunanya dan statusnya menjadi <b>Tidak Digunakan</b> sampai selesai diperbaiki.</p>
      <div class="modal-actions flex justify-end gap-2 pt-2 border-t"><button type="button" data-close class="${btnGhost}">Batal</button><button class="${btnPrimary}">${icon('check')} Simpan</button></div></form>`, {
      onMount(root) {
        $('#dmgForm', root).onsubmit = (e) => {
          e.preventDefault();
          const d = formData(e.target); const a = assetById(+d.asset_id); if (!a) return;
          db.damages.push({ id: nextId(db.damages), asset_id: a.id, asset_number: a.asset_number, asset_category: a.category, asset_name: a.device_name || '', date: d.date, issue: d.issue.trim(), storage: d.storage.trim(),
            last_user: ownersOf(a.id).map((o) => o.full_name).join(', '), last_department: a.department || '', prev_status: a.status, state: 'broken', note: '' });
          db.assetOwners = db.assetOwners.filter((o) => o.asset_id !== a.id);
          Object.assign(a, { status: 'Tidak Digunakan', department: '', owner_email: '', pc_username: '', pc_password: '' });
          save(); closeModal(); render(); toast(`${a.asset_number} dicatat sebagai aset rusak.`);
        };
      },
    });
  }
  PAGES.damages = {
    render() {
      const list = [...db.damages].sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id);
      const count = (s) => list.filter((d) => d.state === s).length;
      const card = (l, v, c) => `<div class="bg-white rounded-xl shadow-sm p-4 border-l-4 ${c}"><p class="text-xs text-slate-500">${l}</p><p class="text-2xl font-bold text-slate-800 mt-1">${v}</p></div>`;
      return `<p class="text-sm text-slate-500 mb-4 max-w-3xl">Daftar aset yang rusak, tempat penyimpanannya, dan perkembangan perbaikannya. Aset rusak dipisahkan dari daftar aset yang dipakai.</p>
<div class="flex flex-wrap gap-2 mb-4"><button id="btnAddDmg" class="${btnPrimary}">${icon('alert')} Tandai Aset Rusak</button></div>
<div class="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">${card('Rusak', count('broken'), 'border-red-500')}${card('Sedang diperbaiki', count('repair'), 'border-amber-500')}${card('Selesai diperbaiki', count('fixed'), 'border-green-500')}${card('Dihapus / dibuang', count('disposed'), 'border-slate-400')}</div>
<div class="bg-white rounded-xl shadow-sm table-sticky overflow-x-auto"><table class="w-full text-sm">
<thead><tr class="text-left text-slate-500 border-b bg-slate-50"><th class="py-2.5 px-4">Aset</th><th class="py-2.5 px-4">Tanggal Rusak</th><th class="py-2.5 px-4">Kerusakan</th><th class="py-2.5 px-4">Lokasi Simpan</th><th class="py-2.5 px-4">Pengguna Terakhir</th><th class="py-2.5 px-4">Status</th></tr></thead>
<tbody>${list.map((d) => `<tr class="border-b last:border-0 hover:bg-slate-50 align-top">
  <td class="py-2.5 px-4"><div class="font-medium whitespace-nowrap">${esc(d.asset_number)}</div><div class="text-xs text-slate-400">${esc(d.asset_category)} · ${esc(d.asset_name)}</div></td>
  <td class="py-2.5 px-4 whitespace-nowrap">${fmtDate(d.date)}</td><td class="py-2.5 px-4 min-w-[14rem]">${esc(d.issue)}</td>
  <td class="py-2.5 px-4">${esc(d.storage || DASH)}</td><td class="py-2.5 px-4">${esc(d.last_user || DASH)}<div class="text-xs text-slate-400">${esc(d.last_department || '')}</div></td>
  <td class="py-2.5 px-4"><select data-dmg="${d.id}" class="border rounded-lg px-2 py-1 text-xs font-medium ${DMG_STATES[d.state][1]}">${options(Object.keys(DMG_STATES).map((k) => ({ value: k, label: DMG_STATES[k][0] })), d.state)}</select></td></tr>`).join('') || '<tr><td colspan="6" class="py-8 text-center text-slate-400">Tidak ada aset rusak.</td></tr>'}</tbody></table></div>`;
    },
    bind() {
      $('#btnAddDmg').onclick = () => damageForm();
      $$('[data-dmg]').forEach((s) => (s.onchange = () => {
        const d = db.damages.find((x) => x.id === +s.dataset.dmg); const a = assetById(d.asset_id);
        d.state = s.value;
        if (a) a.status = s.value === 'fixed' ? 'Stok' : 'Tidak Digunakan';
        save(); render(); toast(s.value === 'fixed' ? 'Aset selesai diperbaiki dan kembali ke Stok.' : 'Status aset rusak diperbarui.');
      }));
    },
  };

  // ------------------------------------------------------------------
  // Export Audit: pilih data & kolom sendiri
  // ------------------------------------------------------------------
  const col = (label, get, def = true, sensitive = false) => ({ label, get, def, sensitive });
  const AUDIT = {
    assets: { label: 'Aset', rows: () => db.assets, filters: true, cols: {
      asset_number: col('ID Aset', (a) => a.asset_number), category: col('Jenis Aset', (a) => a.category), device_name: col('Nama Perangkat', (a) => a.device_name),
      owners: col('Pemilik / Pengguna', (a) => ownersOf(a.id).map((o) => o.full_name).join(', ')), position: col('Jabatan', (a) => positionsOf(a.id)),
      department: col('Departement', (a) => a.department), email: col('Email Pengguna', (a) => a.owner_email, false), ip: col('IP Address', (a) => a.ip_address),
      hostname: col('Hostname', (a) => a.hostname, false), location: col('Lokasi', (a) => a.location), status: col('Status', (a) => a.status),
      serial: col('Serial Number', (a) => a.serial_number, false), processor: col('Processor', (a) => a.processor, false), ram: col('RAM', (a) => a.ram, false), storage: col('Penyimpanan', (a) => a.storage, false),
      os: col('OS', (a) => a.os_name, false), os_status: col('Status OS', (a) => a.os_status, false), software: col('Software', (a) => (a.software || []).map((s) => s.name).join(', '), false),
      accessories: col('Aksesoris', (a) => accText(a), false), purchase: col('Tanggal Pembelian', (a) => a.purchase_date, false),
      pc_username: col('Username PC', (a) => a.pc_username, false, true), pc_password: col('Password PC', (a) => a.pc_password, false, true),
    } },
    users: { label: 'User', rows: () => db.users, cols: {
      full_name: col('Nama Lengkap', (u) => u.full_name), username: col('Username', (u) => u.username), email: col('Email', (u) => u.email), department: col('Departement', (u) => u.department),
      position: col('Jabatan', (u) => u.position || ''), role: col('Role', (u) => (u.role === 'admin' ? 'Admin' : 'User')), active: col('Aktif', (u) => (u.is_active ? 'Ya' : 'Tidak')),
      asset_count: col('Jumlah Aset', (u) => assetsOfUser(u.id).length), asset_list: col('Daftar Aset', (u) => assetsOfUser(u.id).map((a) => a.asset_number).join(', ')),
      pc_username: col('Username PC', (u) => u.pc_username, false, true), pc_password: col('Password PC', (u) => u.pc_password, false, true),
    } },
    tickets: { label: 'Ticketing IT', rows: () => [...db.tickets].sort((a, b) => b.created_at.localeCompare(a.created_at)), cols: {
      number: col('No. Tiket', (t) => t.ticket_number), created: col('Tanggal Dibuat', (t) => fmtDateTime(t.created_at)), done: col('Tanggal Selesai', (t) => (doneAt(t) ? fmtDateTime(doneAt(t)) : '')),
      reporter: col('Pelapor', (t) => (userById(t.reported_by) || {}).full_name), department: col('Departement', (t) => (userById(t.reported_by) || {}).department),
      asset: col('Aset', (t) => (assetById(t.asset_id) || {}).asset_number), problem: col('Rincian Masalah', (t) => t.problem_detail), work: col('Rincian Pengerjaan', (t) => (workOf(t.id) || {}).work_detail, false),
      check: col('Hasil Pengecekan', (t) => (workOf(t.id) || {}).asset_check, false), handler: col('Ditangani', (t) => (userById(t.handled_by) || {}).full_name), status: col('Status', (t) => ticketStatus(t)),
    } },
    mutations: { label: 'Mutasi Aset', rows: () => db.mutations, cols: {
      number: col('No. Mutasi', (m) => m.number), date: col('Tanggal', (m) => m.date), asset: col('No. Aset', (m) => m.asset_number), category: col('Jenis', (m) => m.asset_category),
      from: col('Dari', (m) => m.from_names || 'Stok IT'), from_dept: col('Dept. Asal', (m) => m.from_department), to: col('Kepada', (m) => m.to_names || 'Stok IT'), to_dept: col('Dept. Tujuan', (m) => m.to_department),
      reason: col('Alasan', (m) => MUT_REASONS[m.reason] || m.reason), condition: col('Kondisi', (m) => m.condition, false), note: col('Catatan', (m) => m.note, false),
    } },
    damages: { label: 'Aset Rusak', rows: () => db.damages, cols: {
      asset: col('No. Aset', (d) => d.asset_number), category: col('Jenis', (d) => d.asset_category), name: col('Nama Perangkat', (d) => d.asset_name), date: col('Tanggal Rusak', (d) => d.date),
      issue: col('Kerusakan', (d) => d.issue), storage: col('Lokasi Simpan', (d) => d.storage), last_user: col('Pengguna Terakhir', (d) => d.last_user), state: col('Status', (d) => DMG_STATES[d.state][0]),
    } },
    stock: { label: 'Stok Barang (Masuk / Keluar)', rows: () => [...db.stockTransactions].sort((a, b) => b.trx_date.localeCompare(a.trx_date)), cols: {
      date: col('Tanggal', (t) => t.trx_date), type: col('Jenis', (t) => (t.type === 'in' ? 'Masuk' : 'Keluar')), category: col('Kategori', (t) => (db.stockCategories.find((c) => c.id === t.category_id) || {}).name),
      item: col('Nama Barang', (t) => t.item_name), qty: col('Jumlah', (t) => t.qty), recipient: col('Diberikan Kepada', (t) => t.recipient_name), dept: col('Departement', (t) => t.recipient_department), note: col('Catatan', (t) => t.note, false),
    } },
  };
  const auditUi = { ds: 'assets', cols: {}, cats: [], depts: [], status: '' };
  const auditCols = () => { const ds = auditUi.ds; if (!auditUi.cols[ds]) auditUi.cols[ds] = Object.keys(AUDIT[ds].cols).filter((k) => AUDIT[ds].cols[k].def); return auditUi.cols[ds]; };
  function auditData() {
    const def = AUDIT[auditUi.ds]; let rows = def.rows();
    if (def.filters) rows = rows.filter((a) => (!auditUi.cats.length || auditUi.cats.includes(a.category)) && (!auditUi.depts.length || auditUi.depts.includes(a.department)) && (!auditUi.status || a.status === auditUi.status));
    const keys = Object.keys(def.cols).filter((k) => auditCols().includes(k));
    return { head: keys.map((k) => def.cols[k].label), rows: rows.map((r) => keys.map((k) => { const v = def.cols[k].get(r); return v == null ? '' : v; })) };
  }
  PAGES.audit = {
    render() {
      const def = AUDIT[auditUi.ds]; const chosen = auditCols();
      const tabs = Object.keys(AUDIT).map((k) => `<button data-ds="${k}" class="px-3 py-1.5 rounded-lg text-sm font-medium ${auditUi.ds === k ? 'bg-blue-600 text-white' : 'bg-white border text-slate-600'}">${esc(AUDIT[k].label)}</button>`).join('');
      const chk = (name, val, on, label, extra = '') => `<label class="flex items-center gap-2 text-sm"><input type="checkbox" data-${name}="${esc(val)}" ${on ? 'checked' : ''} class="rounded"> <span>${esc(label)}</span>${extra}</label>`;
      const data = auditData(); const hasSens = Object.keys(def.cols).some((k) => def.cols[k].sensitive && chosen.includes(k));
      return `<p class="text-sm text-slate-500 mb-4 max-w-3xl">Pilih sumber data, centang kolom yang dibutuhkan auditor, lalu export. Fitur ini hanya membaca data dan tidak mengubah apa pun.</p>
<div class="flex flex-wrap gap-2 mb-4">${tabs}</div>
<div class="bg-white rounded-xl shadow-sm p-5 mb-4">
  <div class="flex flex-wrap items-center justify-between gap-2 mb-3"><h3 class="font-semibold text-slate-700">1. Pilih kolom <span class="text-xs font-normal text-slate-400">(${chosen.length} / ${Object.keys(def.cols).length})</span></h3>
    <span class="flex gap-3 text-xs"><button id="audAll" class="text-blue-600 hover:underline">Pilih semua</button><button id="audNone" class="text-blue-600 hover:underline">Kosongkan</button></span></div>
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">${Object.keys(def.cols).map((k) => chk('col', k, chosen.includes(k), def.cols[k].label, def.cols[k].sensitive ? ' <span class="text-[10px] font-semibold bg-amber-100 text-amber-800 rounded px-1.5">Sensitif</span>' : '')).join('')}</div>
  ${hasSens ? '<p class="mt-3 text-xs bg-amber-50 border border-amber-200 text-amber-800 rounded-lg px-3 py-2">Kolom sensitif (login PC) ikut dipilih. Pastikan file hasil export hanya diberikan kepada pihak yang berwenang.</p>' : ''}
</div>
${def.filters ? `<div class="bg-white rounded-xl shadow-sm p-5 mb-4"><h3 class="font-semibold text-slate-700 mb-1">2. Saring data <span class="text-xs font-normal text-slate-400">(opsional, kosong = semua)</span></h3>
  <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-3">
    <div><p class="text-xs text-slate-500 mb-1">Jenis Aset</p><div class="space-y-1">${db.categories.map((c) => chk('cat', c.name, auditUi.cats.includes(c.name), c.name)).join('')}</div></div>
    <div><p class="text-xs text-slate-500 mb-1">Departement</p><div class="space-y-1 max-h-40 overflow-y-auto">${db.departments.map((d) => chk('dept', d, auditUi.depts.includes(d), d)).join('')}</div></div>
    <div><p class="text-xs text-slate-500 mb-1">Status</p><select id="audStatus" class="border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white">${options(Object.keys(ASSET_STATUS), auditUi.status, 'Semua')}</select></div>
  </div></div>` : ''}
<div class="bg-white rounded-xl shadow-sm p-5">
  <div class="flex flex-wrap items-center justify-between gap-2 mb-3"><h3 class="font-semibold text-slate-700">Pratinjau <span class="text-xs font-normal text-slate-400">(${data.rows.length} baris, tampil 8 pertama)</span></h3>
    ${ARTIFACT ? '<span class="text-xs text-slate-400">Unduh file tersedia di demo web</span>' : `<button id="audExport" class="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white rounded-lg px-4 py-2 text-sm font-medium">${icon('sheet')} Export (CSV)</button>`}</div>
  ${data.head.length ? `<div class="overflow-x-auto border rounded-lg"><table class="w-full text-xs whitespace-nowrap"><thead><tr class="bg-green-700 text-white text-left">${data.head.map((h) => `<th class="py-2 px-3">${esc(h)}</th>`).join('')}</tr></thead>
  <tbody>${data.rows.slice(0, 8).map((r) => `<tr class="border-t">${r.map((v) => `<td class="py-1.5 px-3">${esc(v)}</td>`).join('')}</tr>`).join('') || `<tr><td colspan="${data.head.length}" class="py-6 text-center text-slate-400">Tidak ada data yang cocok.</td></tr>`}</tbody></table></div>` : '<p class="text-sm text-slate-400">Pilih minimal satu kolom.</p>'}
  <p class="text-xs text-slate-400 mt-2">Di aplikasi asli hasilnya berupa file Excel (.xlsx).</p>
</div>`;
    },
    bind() {
      const keep = () => { const m = document.querySelector('main'); const y = m ? m.scrollTop : 0; render(); const n = document.querySelector('main'); if (n) n.scrollTop = y; };
      $$('[data-ds]').forEach((b) => (b.onclick = () => { auditUi.ds = b.dataset.ds; render(); }));
      const toggle = (arr, v, on) => { const i = arr.indexOf(v); if (on && i < 0) arr.push(v); if (!on && i >= 0) arr.splice(i, 1); };
      $$('[data-col]').forEach((c) => (c.onchange = () => { toggle(auditCols(), c.dataset.col, c.checked); keep(); }));
      $$('[data-cat]').forEach((c) => (c.onchange = () => { toggle(auditUi.cats, c.dataset.cat, c.checked); keep(); }));
      $$('[data-dept]').forEach((c) => (c.onchange = () => { toggle(auditUi.depts, c.dataset.dept, c.checked); keep(); }));
      if ($('#audStatus')) $('#audStatus').onchange = (e) => { auditUi.status = e.target.value; keep(); };
      $('#audAll').onclick = () => { auditUi.cols[auditUi.ds] = Object.keys(AUDIT[auditUi.ds].cols); keep(); };
      $('#audNone').onclick = () => { auditUi.cols[auditUi.ds] = []; keep(); };
      if ($('#audExport')) $('#audExport').onclick = () => { const d = auditData(); if (!d.head.length) { toast('Pilih minimal satu kolom.', false); return; } downloadCsv(`audit_${auditUi.ds}_demo.csv`, [d.head].concat(d.rows)); };
    },
  };

  // ------------------------------------------------------------------
  // Ganti Password PC: tiap aset mendapat password sendiri (tidak ada yang sama)
  // ------------------------------------------------------------------
  const pcpwUi = { cats: ['Desktop PC', 'Laptop'], dept: '', len: 7, sel: {} };
  const pcpwAssets = () => db.assets.filter((a) => pcpwUi.cats.includes(a.category) && a.status === 'Digunakan' && (!pcpwUi.dept || a.department === pcpwUi.dept)).sort((x, y) => x.category.localeCompare(y.category) || x.asset_number.localeCompare(y.asset_number));
  PAGES.pcpw = {
    render() {
      const list = pcpwAssets(); const draft = db.pcDraft || {};
      const nDraft = list.filter((a) => draft[a.id]).length;
      return `<p class="text-sm text-slate-500 mb-4 max-w-3xl">Bantu pergantian Password PC semua Desktop PC / Laptop. Setiap aset mendapat password sendiri. Password di sistem baru berubah setelah Anda klik <b>Terapkan ke sistem</b>.</p>
<div class="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4 text-sm">
  <div class="bg-white rounded-xl shadow-sm p-3"><b>1. Buat password baru</b>, otomatis atau ketik sendiri.</div>
  <div class="bg-white rounded-xl shadow-sm p-3"><b>2. Export</b> sebagai daftar kerja saat mengganti password di tiap PC.</div>
  <div class="bg-white rounded-xl shadow-sm p-3"><b>3. Terapkan ke sistem</b> untuk aset yang password PC-nya sudah diganti.</div>
</div>
<div class="bg-white rounded-xl shadow-sm p-4 mb-4 flex flex-wrap items-end gap-4">
  <div><p class="text-xs text-slate-500 mb-1">Jenis Aset</p><div class="flex flex-wrap gap-x-4 gap-y-1">${db.categories.map((c) => `<label class="flex items-center gap-2 text-sm"><input type="checkbox" data-pcat="${esc(c.name)}" ${pcpwUi.cats.includes(c.name) ? 'checked' : ''} class="rounded"> ${esc(c.name)}</label>`).join('')}</div></div>
  <div><p class="text-xs text-slate-500 mb-1">Departement</p><select id="pcDept" class="border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white">${options(db.departments, pcpwUi.dept, 'Semua')}</select></div>
</div>
<div class="bg-white rounded-xl shadow-sm">
  <div class="list-toolbar flex flex-wrap items-center gap-2 p-3 border-b">
    <span class="text-sm font-semibold text-slate-700 mr-auto">Daftar aset <span class="font-normal text-slate-400">(${list.length} aset, ${nDraft} punya password baru)</span></span>
    <label class="text-xs text-slate-500 flex items-center gap-1">Panjang <select id="pcLen" class="border rounded-lg px-2 py-1.5 text-sm bg-white">${options(PCPW_LENGTHS, pcpwUi.len)}</select></label>
    <button id="pcGen" class="${btnGhost}">${icon('key')} Buat password baru</button>
    ${ARTIFACT ? '' : `<button id="pcExport" class="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white rounded-lg px-4 py-2 text-sm font-medium">${icon('sheet')} Export (CSV)</button>`}
    <button id="pcApply" class="${btnPrimary}">${icon('check')} Terapkan ke sistem</button>
    <button id="pcClear" class="text-xs text-slate-500 hover:text-red-600">Hapus password baru</button>
  </div>
  <p class="px-4 py-2 text-xs text-slate-400 border-b">Tombol bekerja pada baris yang dicentang. Bila tidak ada yang dicentang, berlaku untuk semua baris yang tampil.</p>
  <div class="overflow-x-auto"><table class="w-full text-sm">
  <thead><tr class="text-left text-slate-500 border-b bg-slate-50"><th class="py-2.5 px-3 w-8"><input type="checkbox" id="pcAll" class="rounded"></th><th class="py-2.5 px-3">Jenis Aset</th><th class="py-2.5 px-3">ID Aset</th><th class="py-2.5 px-3">Pengguna</th><th class="py-2.5 px-3">Departement</th><th class="py-2.5 px-3">IP Address</th><th class="py-2.5 px-3">Username PC</th><th class="py-2.5 px-3">Password Lama</th><th class="py-2.5 px-3">Password Baru</th></tr></thead>
  <tbody>${list.map((a) => `<tr class="border-b last:border-0 hover:bg-slate-50">
    <td class="py-2 px-3"><input type="checkbox" data-pcsel="${a.id}" ${pcpwUi.sel[a.id] ? 'checked' : ''} class="rounded"></td>
    <td class="py-2 px-3 whitespace-nowrap">${esc(a.category)}</td><td class="py-2 px-3 font-medium whitespace-nowrap">${esc(a.asset_number)}</td>
    <td class="py-2 px-3 whitespace-nowrap">${esc(ownersOf(a.id).map((o) => o.full_name).join(', ') || DASH)}</td><td class="py-2 px-3 whitespace-nowrap">${esc(a.department || DASH)}</td>
    <td class="py-2 px-3 whitespace-nowrap">${esc(a.ip_address || DASH)}</td><td class="py-2 px-3 whitespace-nowrap">${esc(a.pc_username || DASH)}</td>
    <td class="py-2 px-3 font-mono text-xs whitespace-nowrap">${esc(a.pc_password || DASH)}</td>
    <td class="py-2 px-3"><input data-pcnew="${a.id}" value="${esc(draft[a.id] || '')}" placeholder="belum dibuat" class="border border-slate-300 rounded-lg px-2 py-1 text-sm font-mono w-32"></td></tr>`).join('') || '<tr><td colspan="9" class="py-8 text-center text-slate-400">Tidak ada aset yang cocok dengan saringan.</td></tr>'}</tbody></table></div>
</div>`;
    },
    bind() {
      if (!db.pcDraft) db.pcDraft = {};
      const target = () => { const list = pcpwAssets(); const sel = list.filter((a) => pcpwUi.sel[a.id]); return sel.length ? sel : list; };
      $$('[data-pcat]').forEach((c) => (c.onchange = () => { const i = pcpwUi.cats.indexOf(c.dataset.pcat); if (c.checked && i < 0) pcpwUi.cats.push(c.dataset.pcat); if (!c.checked && i >= 0) pcpwUi.cats.splice(i, 1); render(); }));
      $('#pcDept').onchange = (e) => { pcpwUi.dept = e.target.value; render(); };
      $('#pcLen').onchange = (e) => { pcpwUi.len = +e.target.value; };
      $('#pcAll').onchange = (e) => { pcpwAssets().forEach((a) => { if (e.target.checked) pcpwUi.sel[a.id] = 1; else delete pcpwUi.sel[a.id]; }); render(); };
      $$('[data-pcsel]').forEach((c) => (c.onchange = () => { if (c.checked) pcpwUi.sel[c.dataset.pcsel] = 1; else delete pcpwUi.sel[c.dataset.pcsel]; }));
      $$('[data-pcnew]').forEach((i) => (i.onchange = () => { const v = i.value.trim(); if (v) db.pcDraft[i.dataset.pcnew] = v; else delete db.pcDraft[i.dataset.pcnew]; save(); }));
      $('#pcGen').onclick = () => {
        const t = target(); const ids = t.map((a) => String(a.id));
        // password tidak boleh sama dengan password aset lain, baik yang lama maupun yang baru
        const used = new Set(db.assets.map((a) => a.pc_password).filter(Boolean).concat(Object.keys(db.pcDraft).filter((k) => !ids.includes(k)).map((k) => db.pcDraft[k])));
        t.forEach((a) => { db.pcDraft[a.id] = genUniquePcPassword(pcpwUi.len, used); });
        save(); render(); toast(`${t.length} password baru dibuat, semuanya berbeda.`);
      };
      $('#pcClear').onclick = () => { target().forEach((a) => delete db.pcDraft[a.id]); save(); render(); };
      $('#pcApply').onclick = async () => {
        const t = target().filter((a) => db.pcDraft[a.id]);
        if (!t.length) { toast('Belum ada password baru pada baris yang dipilih.', false); return; }
        const vals = t.map((a) => db.pcDraft[a.id]);
        if (new Set(vals).size !== vals.length) { toast('Ada password baru yang sama. Tiap aset harus berbeda.', false); return; }
        if (!(await ask(`Terapkan password baru ke ${t.length} aset? Password lama di sistem akan diganti.`, 'Terapkan'))) return;
        t.forEach((a) => { a.pc_password = db.pcDraft[a.id]; delete db.pcDraft[a.id]; delete pcpwUi.sel[a.id]; });
        save(); render(); toast(`Password PC ${t.length} aset diperbarui.`);
      };
      if ($('#pcExport')) $('#pcExport').onclick = () => downloadCsv('ganti_password_pc_demo.csv', [['Jenis Aset', 'ID Aset', 'Pengguna', 'Departement', 'IP Address', 'Lokasi', 'Username PC', 'Password Lama', 'Password Baru', 'Selesai (paraf)']].concat(target().map((a) => [a.category, a.asset_number, ownersOf(a.id).map((o) => o.full_name).join(', '), a.department, a.ip_address, a.location, a.pc_username, a.pc_password, db.pcDraft[a.id] || '', ''])));
    },
  };

  // ------------------------------------------------------------------
  // Signature Email: gambar digambar di browser, warna mengikuti logo perusahaan
  // ------------------------------------------------------------------
  const sigSet = () => (db.settings.signature = db.settings.signature || { company: '', t1: '', t2: '', addr1: '', addr2: '', logo: '' });
  const sigUi = { phone: '', name: null, dept: null, pos: null };
  PAGES.signature = {
    render() {
      const u = currentUser(); const s = sigSet(); const admin = isAdmin();
      const val = (k, d) => (sigUi[k] === null ? d : sigUi[k]);
      const row = (id, label, k, d) => `<div><div class="flex items-baseline justify-between gap-2 mb-1"><label class="text-sm font-medium text-slate-600" for="${id}">${label}</label><button type="button" data-sig-reset="${k}" class="text-xs text-blue-600 hover:underline">Pakai data akun</button></div><input id="${id}" data-sig="${k}" value="${esc(val(k, d))}" class="${inputCls}"></div>`;
      return `<p class="text-sm text-slate-500 mb-4 max-w-3xl">Buat gambar signature email perusahaan. Nama, departemen dan jabatan terisi otomatis dari akun Anda dan boleh diketik manual.</p>
<div class="grid gap-5 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] items-start">
  <div class="bg-white rounded-xl shadow-sm p-5 space-y-4">
    ${row('sigName', 'Nama', 'name', u.full_name)}${row('sigDept', 'Departemen', 'dept', u.department || '')}${row('sigPos', 'Jabatan', 'pos', u.position || '')}
    <div><label class="block text-sm font-medium text-slate-600 mb-1" for="sigPhone">Nomor handphone (tampil setelah M)</label><input id="sigPhone" data-sig="phone" value="${esc(sigUi.phone)}" inputmode="tel" placeholder="0812 3456 7890" class="${inputCls}">
    <p class="text-xs text-slate-400 mt-1">Otomatis diubah ke format +62. Kosongkan jika tidak ingin ditampilkan.</p></div>
    <div class="rounded-lg border border-dashed border-slate-300 px-3 py-2 text-xs text-slate-500 space-y-0.5"><div>Diatur admin, tidak bisa diubah:</div>
      <div><b class="text-slate-700">T1</b> ${esc(s.t1 || DASH)} &nbsp; <b class="text-slate-700">T2</b> ${esc(s.t2 || DASH)}</div><div><b class="text-slate-700">A</b> ${esc([s.addr1, s.addr2].filter(Boolean).join(' ') || DASH)}</div></div>
  </div>
  <div class="space-y-5 min-w-0">
    <div class="bg-white rounded-xl shadow-sm p-5 min-w-0">
      <div class="text-sm text-slate-500 mb-2">Pratinjau (berubah saat Anda mengetik):</div>
      <canvas id="sigCanvas" width="1248" height="378" class="block w-full h-auto border border-slate-200 rounded bg-white" style="max-width:624px"></canvas>
      <div class="flex flex-wrap items-center gap-3 mt-4">${ARTIFACT ? '<span class="text-xs text-slate-400">Unduh JPG tersedia di demo web.</span>' : `<button id="sigDownload" class="${btnPrimary}">${icon('download')} Download JPG</button>`}<span id="sigInfo" class="text-xs text-slate-500"></span></div>
      <p class="text-xs text-slate-400 mt-3">Nama dan jabatan otomatis ditulis huruf besar. <span id="sigColorNote"></span></p>
    </div>
    ${admin ? `<form id="sigSetForm" class="bg-white rounded-xl shadow-sm p-5 space-y-4">
      <div><h3 class="font-semibold text-slate-700">Pengaturan Signature (khusus admin)</h3><p class="text-xs text-slate-500 mt-0.5">Berlaku untuk signature semua user. Pratinjau langsung mengikuti isian di sini; klik Simpan untuk menerapkannya.</p></div>
      <div class="grid gap-3 sm:grid-cols-3">${field('Nama perusahaan', `<input name="company" data-sigset maxlength="40" value="${esc(s.company)}" class="${inputCls}">`)}${field('T1', `<input name="t1" data-sigset maxlength="30" value="${esc(s.t1)}" class="${inputCls}">`)}${field('T2', `<input name="t2" data-sigset maxlength="30" value="${esc(s.t2)}" class="${inputCls}">`)}</div>
      ${field('Alamat perusahaan (A) <span class="text-xs font-normal text-slate-400">(maksimal 2 baris)</span>', `<textarea name="address" data-sigset rows="2" class="${inputCls}">${esc([s.addr1, s.addr2].filter(Boolean).join('\n'))}</textarea>`)}
      ${field('Logo perusahaan untuk signature', `<input type="file" name="logo" id="sigLogo" accept="image/png,image/jpeg" class="block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-sm file:font-medium">`)}
      <p class="text-xs text-slate-400 -mt-2">PNG atau JPG, maks. 300 KB (batas versi demo). Warna hiasan dan teks otomatis mengikuti warna logo ini.</p>
      <div class="flex flex-wrap items-center gap-2"><span class="text-xs text-slate-500">Coba logo contoh:</span>${[['#1d6fd8', 'biru'], ['#c62828', 'merah'], ['#1e8e4e', 'hijau'], ['#e07a10', 'oranye'], ['#111111', 'hitam']].map(([c, n]) => `<button type="button" data-sig-sample="${c}" class="inline-flex items-center gap-1.5 border rounded-lg px-2.5 py-1 text-xs"><span class="w-2.5 h-2.5 rounded-full" style="background:${c}"></span>${n}</button>`).join('')}</div>
      <div class="flex justify-end pt-2 border-t"><button class="${btnPrimary}">${icon('check')} Simpan</button></div></form>` : ''}
  </div>
</div>`;
    },
    bind() {
      const u = currentUser(); const s = sigSet(); const c = $('#sigCanvas'); const W = 1248, H = 378, S = 2;
      const FONT = '"Segoe UI", system-ui, -apple-system, Roboto, "Helvetica Neue", Arial, sans-serif';
      const NEUTRAL = { auto: false, dark: '#1f2937', accent: '#64748b', light: '#cbd5e1' };
      let logo = null, pal = NEUTRAL, logoData = s.logo || '';
      const rgb2hsl = (r, g, b) => { r /= 255; g /= 255; b /= 255; const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn; let h = 0, sa = 0; const l = (mx + mn) / 2;
        if (d) { sa = d / (1 - Math.abs(2 * l - 1)); h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; h *= 60; if (h < 0) h += 360; } return [h, sa, l]; };
      const hsl = (h, sa, l) => `hsl(${Math.round(h)},${Math.round(sa * 100)}%,${Math.round(l * 100)}%)`;
      // Warna dominan logo: abaikan piksel transparan, putih, hitam dan abu-abu.
      const palette = (img) => { try {
        const t = document.createElement('canvas'); t.width = 80; t.height = 80; const g = t.getContext('2d'); g.drawImage(img, 0, 0, 80, 80);
        const d = g.getImageData(0, 0, 80, 80).data; const bins = []; for (let i = 0; i < 36; i++) bins.push({ w: 0, x: 0, y: 0, s: 0 });
        for (let i = 0; i < d.length; i += 4) { if (d[i + 3] < 128) continue; const q = rgb2hsl(d[i], d[i + 1], d[i + 2]); if (q[1] < 0.25 || q[2] > 0.92 || q[2] < 0.08) continue;
          const b = bins[Math.floor(q[0] / 10) % 36]; b.w += q[1]; b.s += q[1] * q[1]; b.x += Math.cos(q[0] * Math.PI / 180) * q[1]; b.y += Math.sin(q[0] * Math.PI / 180) * q[1]; }
        const best = bins.reduce((a, n) => (n.w > a.w ? n : a)); if (best.w < 8) return NEUTRAL;
        let h = Math.atan2(best.y, best.x) * 180 / Math.PI; if (h < 0) h += 360; const sa = Math.min(0.85, best.s / best.w);
        return { auto: true, dark: hsl(h, Math.min(sa, 0.6), 0.2), accent: hsl(h, sa, 0.48), light: hsl(h, Math.min(sa, 0.7), 0.78) };
      } catch (e) { return NEUTRAL; } };
      const fmtPhone = (v) => { let d = String(v).replace(/\D/g, ''); if (!d) return ''; if (d.indexOf('62') === 0) d = d.slice(2); else if (d[0] === '0') d = d.slice(1); return '+62 ' + [d.slice(0, 3), d.slice(3, 7), d.slice(7)].filter(Boolean).join(' '); };
      const setVal = (name, key) => { const el = $(`#sigSetForm [name="${name}"]`); return el ? el.value : (s[key] || ''); };
      const draw = () => {
        const g = c.getContext('2d'); g.globalAlpha = 1; g.fillStyle = '#fff'; g.fillRect(0, 0, W, H);
        g.save(); g.beginPath(); g.rect(0, 0, W, H); g.clip();
        [[0, 1, pal.accent], [1, 0.75, pal.accent], [2, 1, pal.light], [3, 0.7, pal.light], [4, 0.4, pal.light]].forEach((b) => {
          const x = W - (40 + b[0] * 34) * S, wd = 20 * S, len = (150 - b[0] * 22) * S; g.globalAlpha = b[1]; g.fillStyle = b[2];
          g.beginPath(); g.moveTo(x, 0); g.lineTo(x + wd, 0); g.lineTo(x + wd - len * 0.55, len); g.lineTo(x - len * 0.55, len); g.closePath(); g.fill(); });
        g.restore(); g.globalAlpha = 1; g.strokeStyle = '#e6e6e6'; g.lineWidth = 2; g.strokeRect(1, 1, W - 2, H - 2);
        if (logo) { const lw = logo.naturalWidth || logo.width, lh = logo.naturalHeight || logo.height, k = Math.min(200 * S / lw, 46 * S / lh); g.drawImage(logo, 22 * S, 18 * S + (46 * S - lh * k) / 2, lw * k, lh * k); }
        const x0 = 22 * S, y = 78 * S; g.textBaseline = 'alphabetic';
        g.fillStyle = pal.dark; g.font = `700 ${15 * S}px ${FONT}`; g.fillText($('#sigName').value.trim().toUpperCase(), x0, y + 15 * S);
        g.fillStyle = '#333'; g.font = `400 ${12 * S}px ${FONT}`;
        g.fillText([setVal('company', 'company').trim(), $('#sigDept').value.trim(), $('#sigPos').value.trim().toUpperCase()].filter(Boolean).join('   |   '), x0, y + 37 * S);
        let x = x0; const yy = y + 63 * S;
        [['T1', setVal('t1', 't1').trim()], ['T2', setVal('t2', 't2').trim()], ['M', fmtPhone($('#sigPhone').value)]].forEach((p) => { if (!p[1]) return;
          g.fillStyle = pal.dark; g.font = `700 ${12 * S}px ${FONT}`; g.fillText(p[0], x, yy); x += g.measureText(p[0] + ' ').width;
          g.fillStyle = '#333'; g.font = `400 ${12 * S}px ${FONT}`; g.fillText(p[1], x, yy); x += g.measureText(p[1]).width + 16 * S; });
        const adEl = $('#sigSetForm [name="address"]'); const ad = adEl ? adEl.value.split(/\r\n|\r|\n/) : [s.addr1, s.addr2];
        const a1 = (ad[0] || '').trim(), a2 = (ad[1] || '').trim();
        if (a1 || a2) { g.fillStyle = pal.dark; g.font = `700 ${12 * S}px ${FONT}`; g.fillText('A', x0, y + 85 * S); const ax = x0 + g.measureText('A ').width;
          g.fillStyle = '#333'; g.font = `400 ${12 * S}px ${FONT}`; g.fillText(a1 || a2, ax, y + 85 * S); if (a1 && a2) g.fillText(a2, x0, y + 101 * S); }
        $('#sigColorNote').textContent = pal.auto ? 'Warna mengikuti logo perusahaan.' : 'Logo belum ada atau tidak berwarna, jadi dipakai warna netral.';
        $('#sigInfo').textContent = '';
      };
      const loadLogo = (src) => { if (!src) { logo = null; pal = NEUTRAL; draw(); return; } const img = new Image(); img.onload = () => { if (!c.isConnected) return; logo = img; pal = palette(img); draw(); }; img.onerror = () => { logo = null; pal = NEUTRAL; draw(); }; img.src = src; };
      const sampleLogo = (color) => { const t = document.createElement('canvas'); t.width = 360; t.height = 120; const g = t.getContext('2d'); g.fillStyle = color;
        g.beginPath(); g.arc(60, 60, 50, 0, 6.3); g.fill(); g.fillStyle = '#fff'; g.beginPath(); g.arc(60, 60, 22, 0, 6.3); g.fill();
        g.fillStyle = color; g.font = '700 54px ' + FONT; g.textBaseline = 'middle'; g.fillText('LOGO', 135, 64); return t.toDataURL('image/png'); };
      $$('[data-sig]').forEach((i) => (i.oninput = () => { sigUi[i.dataset.sig] = i.value; draw(); }));
      $$('[data-sig-reset]').forEach((b) => (b.onclick = () => { const k = b.dataset.sigReset; sigUi[k] = null; $(`[data-sig="${k}"]`).value = { name: u.full_name, dept: u.department || '', pos: u.position || '' }[k]; draw(); }));
      $$('[data-sigset]').forEach((i) => (i.oninput = draw));
      $$('[data-sig-sample]').forEach((b) => (b.onclick = () => { logoData = sampleLogo(b.dataset.sigSample); loadLogo(logoData); toast('Logo contoh dipasang di pratinjau. Klik Simpan untuk menerapkannya.'); }));
      if ($('#sigLogo')) $('#sigLogo').onchange = (e) => { const f = e.target.files[0]; if (!f) return;
        if (!/^image\/(png|jpeg)$/.test(f.type)) { toast('Logo harus berformat PNG atau JPG.', false); return; }
        if (f.size > 300 * 1024) { toast('Logo terlalu besar (maks. 300 KB di demo).', false); return; }
        const rd = new FileReader(); rd.onload = () => { logoData = rd.result; loadLogo(logoData); }; rd.readAsDataURL(f); };
      if ($('#sigSetForm')) $('#sigSetForm').onsubmit = (e) => { e.preventDefault(); const f = e.target; const ad = f.address.value.split(/\r\n|\r|\n/);
        Object.assign(s, { company: f.company.value.trim().slice(0, 40), t1: f.t1.value.trim().slice(0, 30), t2: f.t2.value.trim().slice(0, 30), addr1: (ad[0] || '').trim(), addr2: (ad[1] || '').trim(), logo: logoData });
        save(); render(); toast('Pengaturan signature disimpan.'); };
      if ($('#sigDownload')) $('#sigDownload').onclick = () => { const name = $('#sigName').value.trim(); if (!name) { $('#sigInfo').textContent = 'Nama belum diisi.'; return; }
        const file = 'signature_' + (name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '') || 'email') + '.jpg';
        c.toBlob((blob) => { const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = file; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 200); $('#sigInfo').textContent = `File ${file} sudah diunduh.`; }, 'image/jpeg', 0.92); };
      draw(); loadLogo(logoData);
    },
  };

  // Riwayat update status + detail pengerjaan pada daftar tiket admin
  function ticketHistoryHtml(t) {
    const logs = logsOf(t.id); const w = workOf(t.id) || {}; const cancelled = isCancelled(t);
    const items = logs.map((l, i) => {
      const st = cancelled && i === logs.length - 1 && l.status === 'Selesai' ? 'Dibatalkan' : l.status;
      const who = (userById(l.changed_by) || {}).full_name || DASH;
      return `<li class="flex flex-wrap items-center gap-x-2 gap-y-0.5"><span class="inline-block text-[11px] font-semibold rounded-full px-2 py-px ${TICKET_BADGE[st]}">${st}</span><span class="text-slate-700">${fmtDateTime(l.changed_at)}</span><span class="text-slate-500">· ${i === 0 && l.status === 'Menunggu' ? 'Tiket dibuat oleh ' : 'Diubah oleh '}${esc(who)}</span></li>`;
    }).join('');
    const hasWork = w.work_detail || w.asset_check;
    return `${items ? `<div class="mt-2 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2 text-xs"><div class="text-[11px] font-semibold uppercase tracking-wide text-slate-500 mb-1.5">Riwayat Update</div><ul class="space-y-1">${items}</ul>${!cancelled && t.status === 'Selesai' && !hasWork ? '<div class="mt-1.5 italic text-slate-400">Detail pengerjaan belum diisi — klik "Rincian".</div>' : ''}</div>` : ''}
      ${!cancelled && hasWork ? `<div class="mt-2 rounded-lg border border-green-100 bg-green-50/60 px-2.5 py-2 text-xs space-y-1">${w.work_detail ? `<div><span class="font-semibold text-green-800">Rincian Pengerjaan:</span> ${esc(w.work_detail)}</div>` : ''}${w.asset_check ? `<div><span class="font-semibold text-green-800">Hasil Pengecekan dan Kesimpulan:</span> ${esc(w.asset_check)}</div>` : ''}</div>` : ''}`;
  }

  // ------------------------------------------------------------------
  // CCTV (demo): monitoring NVR, checklist, List View, rekap, log, pengaturan
  // Status kamera disimulasikan di browser; aplikasi asli membacanya dari NVR.
  // ------------------------------------------------------------------
  ICONS.camera = '<path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/>';
  ICONS.phone = '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>';
  const MIN = 60000;
  const dstr = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const hhmm = (iso) => { const d = new Date(iso); return `${pad(d.getHours())}:${pad(d.getMinutes())}`; };
  const durText = (ms) => { const m = Math.max(0, Math.round(ms / MIN)); if (m < 60) return m + ' menit'; const h = Math.floor(m / 60); return h < 24 ? `${h} jam ${m % 60} menit` : `${Math.floor(h / 24)} hari ${h % 24} jam`; };

  function cctvSeed() {
    let s = 7310; const r = () => ((s = (s * 1103515245 + 12345) % 2147483648) / 2147483648);
    const nvrs = [
      { id: 1, name: 'NVR 1', brand: 'Hikvision', ip: '192.168.10.201', location: 'Ruang Server' },
      { id: 2, name: 'NVR 2', brand: 'Dahua', ip: '192.168.10.202', location: 'Pos Security' },
    ];
    const spots = [
      ['Lobby Utama', 'Gedung Kantor'], ['Resepsionis', 'Gedung Kantor'], ['Koridor Lt. 1', 'Gedung Kantor'], ['Koridor Lt. 2', 'Gedung Kantor'],
      ['Ruang Meeting', 'Gedung Kantor'], ['Ruang Server', 'Gedung Kantor'], ['Kantin', 'Area Umum'], ['Parkir Motor', 'Area Luar'],
      ['Parkir Mobil', 'Area Luar'], ['Gerbang Depan', 'Area Luar'], ['Gerbang Belakang', 'Area Luar'], ['Tangga Darurat', 'Gedung Kantor'],
      ['Gudang Bahan', 'Gudang'], ['Gudang Jadi', 'Gudang'], ['Loading Dock', 'Gudang'], ['Line Produksi 1', 'Produksi'],
      ['Line Produksi 2', 'Produksi'], ['Line Produksi 3', 'Produksi'], ['QC Room', 'Produksi'], ['Ruang Panel', 'Produksi'],
      ['Pos Security', 'Area Luar'], ['Pagar Timur', 'Area Luar'], ['Pagar Barat', 'Area Luar'], ['Area Limbah', 'Area Luar'],
      ['Gudang Sparepart', 'Gudang'], ['Mushola', 'Area Umum'], ['Klinik', 'Area Umum'], ['Lapangan', 'Area Luar'],
    ];
    const types = ['Dome 2MP', 'Bullet 2MP', 'Bullet 4MP', 'Dome 4MP', 'PTZ 2MP'];
    const cams = spots.map((sp, i) => {
      const nvr = i < 16 ? 1 : 2; const ch = nvr === 1 ? i + 1 : i - 15;
      return { id: i + 1, nvr_id: nvr, channel: ch, name: `CAM ${pad(i + 1)} ${sp[0]}`, location: sp[1], ip: `192.168.10.${100 + i + 1}`, type: types[Math.floor(r() * types.length)] };
    });
    const now = Date.now();
    const events = [];
    // Riwayat kamera mati 60 hari terakhir (sudah pulih)
    for (let k = 0; k < 14; k++) {
      const cam = cams[Math.floor(r() * cams.length)];
      const start = new Date(now - (2 + Math.floor(r() * 58)) * 86400000); start.setHours(6 + Math.floor(r() * 12), Math.floor(r() * 60), 0, 0);
      const dur = (10 + Math.floor(r() * 170)) * MIN;
      events.push({ id: k + 1, cam_id: cam.id, start: start.toISOString(), end: new Date(start.getTime() + dur).toISOString() });
    }
    // Saat ini: 1 kamera mati 47 menit (email sudah terkirim), 1 kamera mati 9 menit (belum)
    events.push({ id: 15, cam_id: 8, start: new Date(now - 47 * MIN).toISOString(), end: null });
    events.push({ id: 16, cam_id: 22, start: new Date(now - 9 * MIN).toISOString(), end: null });
    const y = new Date().getFullYear();
    return {
      nvrs, cams, events, checklists: {}, snapshots: {}, last_check: new Date(now).toISOString(),
      settings: { email_after_min: 30, email_to: 'it@contoh.co.id', off_weekdays: [6, 0], snapshot_schedule: 'first_monday' },
      holidays: [
        { date: `${y}-01-01`, name: 'Tahun Baru Masehi' }, { date: `${y}-08-17`, name: 'HUT Kemerdekaan RI' },
        { date: `${y}-12-25`, name: 'Hari Natal' }, { date: `${y}-12-26`, name: 'Cuti bersama perusahaan' },
      ],
    };
  }
  function extSeed() {
    const rows = [
      ['101', 'Resepsionis', 'General Affair', 'Lobby'], ['102', 'Security', 'General Affair', 'Pos Security'], ['110', 'Admin Demo', 'IT', 'Ruang IT'],
      ['111', 'Joko Susilo', 'IT', 'Ruang IT'], ['120', 'Budi Santoso', 'Finance', 'Lt. 2'], ['121', 'Fitri Handayani', 'Finance', 'Lt. 2'],
      ['130', 'Siti Rahmawati', 'HRD', 'Lt. 2'], ['131', 'Rina Kartika', 'HRD', 'Lt. 2'], ['140', 'Dewi Lestari', 'Purchasing', 'Lt. 1'],
      ['150', 'Rizky Hidayat', 'Marketing', 'Lt. 1'], ['160', 'Andi Pratama', 'Produksi', 'Office Produksi'], ['161', 'Hendra Wijaya', 'Produksi', 'Office Produksi'],
      ['170', 'Agus Setiawan', 'Gudang', 'Gudang'], ['180', 'Nur Aisyah', 'Quality Control', 'QC Room'], ['190', 'Ruang Meeting', 'Umum', 'Lt. 2'],
    ];
    return rows.map((x, i) => ({ id: i + 1, ext: x[0], name: x[1], department: x[2], location: x[3] }));
  }
  if (!db.cctv) { db.cctv = cctvSeed(); save(); }
  if (!db.phoneExt) { db.phoneExt = extSeed(); save(); }
  const _origReset = resetDemo;
  resetDemo = function () { _origReset(); db.cctv = cctvSeed(); db.phoneExt = extSeed(); save(); };

  const C = () => db.cctv;
  const nvrById = (id) => C().nvrs.find((n) => n.id === id) || {};
  const openEvent = (camId) => C().events.find((e) => e.cam_id === camId && !e.end);
  const camOnline = (cam) => !openEvent(cam.id);
  const holidayOf = (ds) => C().holidays.find((h) => h.date === ds);
  const isOffDay = (ds) => { const d = new Date(ds + 'T00:00:00'); return C().settings.off_weekdays.includes(d.getDay()) || !!holidayOf(ds); };
  const offLabel = (ds) => { const h = holidayOf(ds); if (h) return h.name; return ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'][new Date(ds + 'T00:00:00').getDay()]; };
  const CCTV_TABS = [['monitor', 'Monitoring'], ['checklist', 'Checklist'], ['listview', 'List View'], ['report', 'Rekap Bulanan'], ['log', 'Log CCTV Mati'], ['settings', 'Pengaturan']];
  const cctvUi = { tab: 'monitor', nvr: 0, date: '', shift: '', month: '', lvNvr: 1 };
  let cctvTimer = null;

  // Status checklist 1 kamera di 1 tanggal: data checklist bila ada, selain itu (hari lalu) dari log kamera mati
  function dayStatus(cam, ds) {
    const today = todayStr();
    if (ds > today) return '';
    if (isOffDay(ds)) return 'L';
    const rec = C().checklists[ds];
    if (rec) { const sh = Object.values(rec); const items = sh.map((x) => x.items[cam.id]).filter(Boolean); if (items.length) return items.every((it) => it.ok) ? 'ok' : 'bad'; }
    if (ds === today) return '';
    const hit = C().events.some((e) => e.cam_id === cam.id && localDay(e.start) <= ds && (e.end ? localDay(e.end) : today) >= ds);
    return hit ? 'bad' : 'ok';
  }

  // Gambar snapshot contoh (SVG) per kamera
  function snapshotSvg(cam, iso) {
    const online = camOnline(cam);
    const h = (cam.id * 47) % 360;
    const ts = iso ? `${localDay(iso)} ${hhmm(iso)}:0${cam.id % 10}` : '';
    const body = online
      ? `<defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(${h},18%,62%)"/><stop offset="1" stop-color="hsl(${h},12%,32%)"/></linearGradient></defs>
        <rect width="320" height="180" fill="url(#g)"/><polygon points="0,180 120,95 200,95 320,180" fill="hsl(${h},8%,24%)"/>
        <rect x="${30 + (cam.id * 13) % 60}" y="52" width="46" height="58" fill="hsl(${h},10%,45%)"/><rect x="${200 + (cam.id * 7) % 50}" y="40" width="60" height="70" fill="hsl(${(h + 40) % 360},10%,40%)"/>
        <rect x="140" y="70" width="40" height="25" fill="hsl(${h},20%,75%)" opacity=".5"/>`
      : '<rect width="320" height="180" fill="#0f172a"/><text x="160" y="96" fill="#94a3b8" font-family="Arial" font-size="20" font-weight="bold" text-anchor="middle">NO SIGNAL</text>';
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 180">${body}
      <text x="8" y="16" fill="#fff" font-family="monospace" font-size="11">${ts}</text>
      <text x="312" y="172" fill="#fff" font-family="Arial" font-size="11" text-anchor="end">${esc(cam.name)}</text></svg>`;
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  }

  function cctvTabs() {
    if (!isAdmin()) return '';
    return `<div class="flex gap-1 overflow-x-auto bg-white rounded-xl shadow-sm p-1.5 mb-4">${CCTV_TABS.map(([k, l]) => `<button type="button" data-ctab="${k}" class="asset-tab-btn ${cctvUi.tab === k ? 'asset-tab-active' : ''}">${l}</button>`).join('')}</div>`;
  }
  const demoNote = (t) => `<p class="text-xs text-slate-500 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2 mb-4">${t}</p>`;

  function cctvMonitor() {
    const c = C(); const now = Date.now(); const thr = c.settings.email_after_min;
    const cams = c.cams.filter((x) => !cctvUi.nvr || x.nvr_id === cctvUi.nvr);
    const off = cams.filter((x) => !camOnline(x));
    const card = (label, val, cls) => `<div class="bg-white rounded-xl shadow-sm p-4 border-l-4 ${cls}"><p class="text-sm text-slate-500">${label}</p><p class="text-2xl font-bold text-slate-800 mt-1">${val}</p></div>`;
    const camCard = (x) => {
      const ev = openEvent(x.id);
      let st = '<span class="inline-flex items-center gap-1 text-xs font-semibold text-green-700"><span class="w-2 h-2 rounded-full bg-green-500"></span>Online</span>';
      let extra = '';
      if (ev) {
        const ms = now - new Date(ev.start).getTime();
        st = '<span class="inline-flex items-center gap-1 text-xs font-semibold text-red-600"><span class="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>Mati</span>';
        const sent = ms >= thr * MIN;
        extra = `<p class="text-xs text-red-600 mt-1">Mati sejak ${hhmm(ev.start)} · <span data-dur="${esc(ev.start)}">${durText(ms)}</span></p>
          <p class="text-[11px] mt-1 ${sent ? 'text-amber-700' : 'text-slate-400'}">${sent ? `${icon('mail', 'w-3 h-3 inline')} Email terkirim ${hhmm(new Date(new Date(ev.start).getTime() + thr * MIN).toISOString())}` : `Email dikirim jika masih mati ${thr - Math.floor(ms / MIN)} menit lagi`}</p>`;
      }
      return `<div class="bg-white rounded-xl shadow-sm p-3 ${ev ? 'ring-2 ring-red-200' : ''}">
        <div class="flex items-start justify-between gap-2"><p class="font-semibold text-sm text-slate-700 leading-tight">${esc(x.name)}</p>${st}</div>
        <p class="text-xs text-slate-500 mt-1">${esc(x.location)} · ${esc(nvrById(x.nvr_id).name)} CH ${x.channel}</p>
        <p class="text-xs text-slate-400">${esc(x.ip)} · ${esc(x.type)}</p>${extra}</div>`;
    };
    return `${demoNote('Di demo ini status kamera disimulasikan. Di aplikasi asli, status dibaca langsung dari NVR Hikvision/Dahua (atau IP kamera) setiap 1 menit oleh Task Scheduler, dan email dikirim otomatis bila kamera mati lebih dari ' + thr + ' menit.')}
<div class="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
  ${card('Total Kamera', cams.length, 'border-blue-500')}${card('Online', cams.length - off.length, 'border-green-500')}${card('Mati', off.length, 'border-red-500')}${card('NVR Online', c.nvrs.length + ' / ' + c.nvrs.length, 'border-slate-400')}
</div>
<div class="bg-white rounded-xl shadow-sm p-3 mb-4 flex flex-wrap items-center gap-2">
  <select id="cNvr" class="border border-slate-300 rounded-lg px-3 py-2 text-sm">${options([{ value: 0, label: 'Semua NVR' }, ...c.nvrs.map((n) => ({ value: n.id, label: `${n.name} (${n.brand} · ${n.ip})` }))], cctvUi.nvr)}</select>
  <button id="cCheck" class="${btnPrimary}">${icon('refresh')} Cek Sekarang</button>
  <button id="cSimDown" class="${btnGhost}">${icon('alert')} Simulasikan kamera mati</button>
  <span id="cctvLive" class="text-xs text-slate-500 ml-auto">Cek terakhir: ${fmtDateTime(c.last_check)} · halaman diperbarui otomatis</span>
</div>
${off.length ? `<h3 class="font-semibold text-red-600 mb-2">Kamera mati (${off.length})</h3><div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 mb-5">${off.map(camCard).join('')}</div>` : ''}
<h3 class="font-semibold text-slate-700 mb-2">Semua kamera</h3>
<div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">${cams.filter(camOnline).map(camCard).join('')}</div>`;
  }

  function cctvChecklist() {
    const c = C(); const ds = cctvUi.date || todayStr();
    const hour = new Date().getHours(); const shift = cctvUi.shift || (hour < 13 ? 'Pagi' : 'Sore');
    const rec = (c.checklists[ds] || {})[shift];
    const off = isOffDay(ds);
    const done = ['Pagi', 'Sore'].map((s) => { const r = (c.checklists[ds] || {})[s]; return `<span class="text-xs rounded-full px-2.5 py-1 ${r ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}">${s}: ${r ? `sudah oleh ${esc(r.by)} ${hhmm(r.at)}` : 'belum'}</span>`; }).join(' ');
    const rows = c.cams.map((x, i) => {
      const it = rec ? rec.items[x.id] : { ok: camOnline(x), note: camOnline(x) ? '' : 'Tidak ada gambar' };
      return `<tr class="border-b last:border-0"><td class="py-2 px-3 text-slate-400">${i + 1}</td><td class="py-2 px-3 font-medium">${esc(x.name)}</td><td class="py-2 px-3 text-slate-500 hidden md:table-cell">${esc(nvrById(x.nvr_id).name)} CH ${x.channel}</td>
        <td class="py-2 px-3 whitespace-nowrap"><label class="mr-3 text-sm"><input type="radio" name="ok_${x.id}" value="1" ${it.ok ? 'checked' : ''}> <span class="text-green-700">Normal</span></label><label class="text-sm"><input type="radio" name="ok_${x.id}" value="0" ${it.ok ? '' : 'checked'}> <span class="text-red-600">Bermasalah</span></label></td>
        <td class="py-2 px-3"><input name="note_${x.id}" value="${esc(it.note || '')}" placeholder="Keterangan" class="${inputCls} !py-1"></td></tr>`;
    }).join('');
    return `${isAdmin() ? '' : demoNote('Menu ini muncul untuk user yang diberi akses <b>Checklist CCTV</b> (misalnya Security) di Management User.')}
<div class="bg-white rounded-xl shadow-sm p-4 mb-4 flex flex-wrap items-end gap-3">
  ${field('Tanggal', `<input type="date" id="clDate" value="${ds}" max="${todayStr()}" class="${inputCls}">`)}
  ${field('Shift', `<select id="clShift" class="${inputCls}">${options(['Pagi', 'Sore'], shift)}</select>`)}
  <div class="flex flex-wrap gap-2 pb-1">${done}</div>
</div>
${off ? `<div class="bg-slate-50 border border-slate-200 rounded-xl p-6 text-center text-slate-600"><p class="font-semibold">Hari libur (${esc(offLabel(ds))})</p><p class="text-sm mt-1">Checklist tidak perlu diisi. Hari libur diatur di tab Pengaturan.</p></div>` : `
<form id="clForm" class="bg-white rounded-xl shadow-sm overflow-hidden">
  <div class="px-4 py-3 border-b flex flex-wrap items-center justify-between gap-2"><p class="font-semibold text-slate-700">Checklist ${shift} — ${fmtDate(ds)}</p><p class="text-xs text-slate-400">Status awal diisi otomatis dari monitoring; ubah bila hasil pengecekan berbeda.</p></div>
  <div class="overflow-x-auto"><table class="w-full text-sm"><thead><tr class="text-left text-slate-500 bg-slate-50 border-b"><th class="py-2 px-3">No</th><th class="py-2 px-3">Nama CCTV</th><th class="py-2 px-3 hidden md:table-cell">NVR</th><th class="py-2 px-3">Kondisi</th><th class="py-2 px-3">Keterangan</th></tr></thead><tbody>${rows}</tbody></table></div>
  <div class="px-4 py-3 border-t flex justify-end"><button class="${btnPrimary}">${icon('check')} Simpan Checklist</button></div>
</form>`}`;
  }

  function cctvListView() {
    const c = C(); const nvr = cctvUi.lvNvr;
    const cams = c.cams.filter((x) => x.nvr_id === nvr);
    return `${demoNote('Snapshot diambil otomatis setiap <b>Senin pertama tiap bulan jam 09:00</b> (bisa diubah di Pengaturan), atau manual dengan tombol di bawah. Snapshot lama tertimpa agar tidak memenuhi disk server. Di demo ini gambarnya ilustrasi.')}
<div class="bg-white rounded-xl shadow-sm p-3 mb-4 flex flex-wrap items-center gap-2">
  ${c.nvrs.map((n) => `<button type="button" data-lvnvr="${n.id}" class="asset-tab-btn ${n.id === nvr ? 'asset-tab-active' : ''}">${esc(n.name)}</button>`).join('')}
  <button id="lvSnap" class="${btnPrimary} ml-auto">${icon('camera')} Ambil Snapshot ${esc(nvrById(nvr).name)}</button>
  <button id="lvCsv" class="${btnGhost}">${icon('download')} Export</button>
</div>
<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">${cams.map((x) => {
      const snap = c.snapshots[x.id]; const on = camOnline(x);
      return `<div class="bg-white rounded-xl shadow-sm overflow-hidden"><img src="${snapshotSvg(x, snap || c.last_check)}" alt="" class="w-full aspect-video object-cover bg-slate-900">
      <div class="p-3"><div class="flex items-start justify-between gap-2"><p class="font-semibold text-sm text-slate-700">${esc(x.name)}</p><span class="text-[11px] font-semibold rounded-full px-2 py-0.5 ${on ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}">${on ? 'Online' : 'Offline'}</span></div>
      <p class="text-xs text-slate-500 mt-1">${esc(x.location)} · CH ${x.channel} · ${esc(x.type)}</p><p class="text-xs text-slate-400">${esc(x.ip)} · Snapshot: ${snap ? fmtDateTime(snap) : 'contoh'}</p></div></div>`;
    }).join('')}</div>`;
  }

  function monthDays(ym) { const [y, m] = ym.split('-').map(Number); const n = new Date(y, m, 0).getDate(); return Array.from({ length: n }, (_, i) => `${ym}-${pad(i + 1)}`); }
  function cctvReport() {
    const c = C(); const ym = cctvUi.month || todayStr().slice(0, 7); const days = monthDays(ym);
    const months = []; const d0 = new Date(); for (let i = 0; i < 6; i++) { const d = new Date(d0.getFullYear(), d0.getMonth() - i, 1); months.push({ value: `${d.getFullYear()}-${pad(d.getMonth() + 1)}`, label: `${MONTHS[d.getMonth()]} ${d.getFullYear()}` }); }
    const cell = (s) => ({ ok: '<span class="text-green-600 font-bold">✓</span>', bad: '<span class="text-red-600 font-bold">✗</span>', L: '<span class="text-slate-400">L</span>' }[s] || '');
    const tables = c.nvrs.map((n) => {
      const cams = c.cams.filter((x) => x.nvr_id === n.id);
      const log = c.events.filter((e) => cams.some((x) => x.id === e.cam_id) && e.start.slice(0, 7) === ym).sort((a, b) => a.start.localeCompare(b.start));
      return `<div class="bg-white rounded-xl shadow-sm mb-5 overflow-hidden">
  <div class="px-4 py-3 border-b flex flex-wrap items-center justify-between gap-2"><p class="font-semibold text-slate-700">Rekap ${esc(n.name)} — ${esc(months.find((m) => m.value === ym)?.label || ym)}</p><button data-csv="${n.id}" class="${btnGhost} !py-1.5">${icon('download')} Export ${esc(n.name)}</button></div>
  <div class="overflow-x-auto"><table class="text-xs border-collapse"><thead><tr class="bg-slate-50 text-slate-500"><th class="sticky left-0 bg-slate-50 py-2 px-2 text-left border-b min-w-[11rem]">Nama CCTV</th>${days.map((ds) => `<th class="py-2 px-1 border-b w-6 ${isOffDay(ds) ? 'bg-slate-100' : ''}" title="${isOffDay(ds) ? esc(offLabel(ds)) : ''}">${+ds.slice(8)}</th>`).join('')}</tr></thead>
  <tbody>${cams.map((x) => `<tr class="border-b last:border-0"><td class="sticky left-0 bg-white py-1.5 px-2 font-medium whitespace-nowrap">${esc(x.name)}</td>${days.map((ds) => { const s = dayStatus(x, ds); return `<td class="text-center px-1 ${s === 'L' ? 'bg-slate-50' : ''}">${cell(s)}</td>`; }).join('')}</tr>`).join('')}</tbody></table></div>
  <div class="px-4 py-3 border-t bg-slate-50/60"><p class="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">Log CCTV mati ${esc(n.name)} (halaman 2 di file Excel)</p>
  ${log.length ? `<table class="w-full text-xs"><tbody>${log.map((e) => { const x = c.cams.find((k) => k.id === e.cam_id); return `<tr class="border-b last:border-0"><td class="py-1 pr-3 font-medium">${esc(x.name)}</td><td class="py-1 pr-3">${fmtDateTime(e.start)}</td><td class="py-1 pr-3">${e.end ? fmtDateTime(e.end) : '<span class="text-red-600">masih mati</span>'}</td><td class="py-1">${durText((e.end ? new Date(e.end) : new Date()) - new Date(e.start))}</td></tr>`; }).join('')}</tbody></table>` : '<p class="text-xs text-slate-400">Tidak ada kamera mati bulan ini.</p>'}</div></div>`;
    }).join('');
    return `${demoNote('Di aplikasi asli, Export Excel menghasilkan 1 file: sheet cover <b>VIEW NVR</b> (multi-view snapshot), lalu sheet <b>Rekap per NVR</b> yang muat 1 lembar A4, dengan log CCTV mati di halaman 2. Demo ini mengekspor CSV. ✓ = normal, ✗ = bermasalah, L = libur.')}
<div class="bg-white rounded-xl shadow-sm p-3 mb-4 flex items-center gap-2"><label class="text-sm text-slate-600">Bulan</label><select id="rpMonth" class="border border-slate-300 rounded-lg px-3 py-2 text-sm">${options(months, ym)}</select></div>${tables}`;
  }

  function cctvLog() {
    const c = C(); const thr = c.settings.email_after_min;
    const rows = [...c.events].sort((a, b) => b.start.localeCompare(a.start)).map((e) => {
      const x = c.cams.find((k) => k.id === e.cam_id); const ms = (e.end ? new Date(e.end) : new Date()) - new Date(e.start);
      return `<tr class="border-b last:border-0"><td class="py-2 px-3 font-medium">${esc(x.name)}</td><td class="py-2 px-3 text-slate-500">${esc(nvrById(x.nvr_id).name)} CH ${x.channel}</td><td class="py-2 px-3 whitespace-nowrap">${fmtDateTime(e.start)}</td>
        <td class="py-2 px-3 whitespace-nowrap">${e.end ? fmtDateTime(e.end) : '<span class="text-red-600 font-semibold">Masih mati</span>'}</td><td class="py-2 px-3 whitespace-nowrap">${durText(ms)}</td>
        <td class="py-2 px-3">${ms >= thr * MIN ? '<span class="text-[11px] rounded-full px-2 py-0.5 bg-amber-100 text-amber-700">Terkirim</span>' : '<span class="text-[11px] text-slate-400">Tidak perlu</span>'}</td></tr>`;
    }).join('');
    return `<div class="bg-white rounded-xl shadow-sm overflow-hidden"><div class="px-4 py-3 border-b flex items-center justify-between"><p class="font-semibold text-slate-700">Log CCTV Mati</p><button id="logCsv" class="${btnGhost} !py-1.5">${icon('download')} Export</button></div>
<div class="overflow-x-auto"><table class="w-full text-sm"><thead><tr class="text-left text-slate-500 bg-slate-50 border-b"><th class="py-2 px-3">Nama CCTV</th><th class="py-2 px-3">NVR</th><th class="py-2 px-3">Mati</th><th class="py-2 px-3">Pulih</th><th class="py-2 px-3">Durasi</th><th class="py-2 px-3">Email</th></tr></thead><tbody>${rows}</tbody></table></div></div>`;
  }

  function cctvSettings() {
    const s = C().settings; const dayNames = [[1, 'Senin'], [2, 'Selasa'], [3, 'Rabu'], [4, 'Kamis'], [5, 'Jumat'], [6, 'Sabtu'], [0, 'Minggu']];
    const hol = [...C().holidays].sort((a, b) => a.date.localeCompare(b.date));
    return `<form id="csForm" class="bg-white rounded-xl shadow-sm p-5 mb-4 grid sm:grid-cols-2 gap-4">
  <p class="sm:col-span-2 font-semibold text-slate-700">Notifikasi &amp; jadwal</p>
  ${field('Kirim email jika kamera mati lebih dari', `<select name="email_after_min" class="${inputCls}">${options([5, 10, 15, 30, 60].map((m) => ({ value: m, label: m + ' menit' })), s.email_after_min)}</select>`)}
  ${field('Email penerima', `<input name="email_to" value="${esc(s.email_to)}" class="${inputCls}">`)}
  ${field('Jadwal snapshot List View', `<select name="snapshot_schedule" class="${inputCls}">${options([{ value: 'first_monday', label: 'Senin pertama tiap bulan, 09:00' }, { value: 'daily', label: 'Setiap hari, 09:00' }, { value: 'off', label: 'Manual saja' }], s.snapshot_schedule)}</select>`)}
  ${field('Libur mingguan (checklist tidak perlu diisi)', `<div class="flex flex-wrap gap-3 pt-2">${dayNames.map(([v, l]) => `<label class="text-sm"><input type="checkbox" name="off_${v}" ${s.off_weekdays.includes(v) ? 'checked' : ''}> ${l}</label>`).join('')}</div>`)}
  <div class="sm:col-span-2 flex justify-end"><button class="${btnPrimary}">${icon('check')} Simpan</button></div>
</form>
<div class="bg-white rounded-xl shadow-sm p-5">
  <p class="font-semibold text-slate-700 mb-1">Libur nasional &amp; cuti bersama</p><p class="text-xs text-slate-500 mb-3">Diisi manual. Tanggal ini ditandai L di rekap dan checklist tidak perlu diisi.</p>
  <form id="hForm" class="flex flex-wrap gap-2 mb-3"><input type="date" name="date" required class="border border-slate-300 rounded-lg px-3 py-2 text-sm"><input name="name" required placeholder="Keterangan (mis. Cuti bersama)" class="flex-1 min-w-[12rem] border border-slate-300 rounded-lg px-3 py-2 text-sm"><button class="${btnPrimary}">${icon('plus')} Tambah</button></form>
  <ul class="divide-y">${hol.map((h) => `<li class="py-2 flex items-center justify-between text-sm"><span><b>${fmtDate(h.date)}</b> · ${esc(h.name)}</span><button data-hdel="${h.date}" class="text-red-500 hover:text-red-700">${icon('trash')}</button></li>`).join('')}</ul>
</div>`;
  }

  PAGES.cctv = {
    render() {
      if (!isAdmin()) cctvUi.tab = 'checklist';
      const body = { monitor: cctvMonitor, checklist: cctvChecklist, listview: cctvListView, report: cctvReport, log: cctvLog, settings: cctvSettings }[cctvUi.tab]();
      return cctvTabs() + body;
    },
    bind() {
      const rr = () => { render(); };
      $$('[data-ctab]').forEach((b) => (b.onclick = () => { cctvUi.tab = b.dataset.ctab; rr(); }));
      if (cctvTimer) { clearInterval(cctvTimer); cctvTimer = null; }
      const c = C();
      if (cctvUi.tab === 'monitor') {
        $('#cNvr').onchange = (e) => { cctvUi.nvr = +e.target.value; rr(); };
        $('#cCheck').onclick = () => {
          const open = c.events.filter((e) => !e.end);
          if (open.length && Math.random() < 0.5) { const e = open[0]; e.end = new Date().toISOString(); toast(`${c.cams.find((x) => x.id === e.cam_id).name} kembali online.`); }
          else toast('Pengecekan selesai: tidak ada perubahan status.');
          c.last_check = new Date().toISOString(); save(); rr();
        };
        $('#cSimDown').onclick = () => {
          const on = c.cams.filter(camOnline); if (!on.length) return;
          const x = on[Math.floor(Math.random() * on.length)];
          c.events.push({ id: nextId(c.events), cam_id: x.id, start: new Date(Date.now() - (c.settings.email_after_min + 1) * MIN).toISOString(), end: null });
          save(); rr(); toast(`${x.name} mati lebih dari ${c.settings.email_after_min} menit — di aplikasi asli email notifikasi terkirim.`, false);
        };
        cctvTimer = setInterval(() => {
          if (!$('#cctvLive')) { clearInterval(cctvTimer); cctvTimer = null; return; }
          $$('[data-dur]').forEach((el) => (el.textContent = durText(Date.now() - new Date(el.dataset.dur).getTime())));
        }, 20000);
      }
      if (cctvUi.tab === 'checklist') {
        $('#clDate').onchange = (e) => { cctvUi.date = e.target.value; rr(); };
        $('#clShift').onchange = (e) => { cctvUi.shift = e.target.value; rr(); };
        if ($('#clForm')) $('#clForm').onsubmit = (e) => {
          e.preventDefault(); const f = formData(e.target); const ds = $('#clDate').value; const sh = $('#clShift').value;
          const items = {}; c.cams.forEach((x) => { items[x.id] = { ok: f['ok_' + x.id] === '1', note: (f['note_' + x.id] || '').trim() }; });
          c.checklists[ds] = c.checklists[ds] || {}; c.checklists[ds][sh] = { by: currentUser().full_name, at: new Date().toISOString(), items };
          save(); rr(); toast(`Checklist ${sh} ${fmtDate(ds)} tersimpan.`);
        };
      }
      if (cctvUi.tab === 'listview') {
        $$('[data-lvnvr]').forEach((b) => (b.onclick = () => { cctvUi.lvNvr = +b.dataset.lvnvr; rr(); }));
        $('#lvSnap').onclick = () => { const t = new Date().toISOString(); c.cams.filter((x) => x.nvr_id === cctvUi.lvNvr).forEach((x) => (c.snapshots[x.id] = t)); save(); rr(); toast('Snapshot diambil (menimpa snapshot sebelumnya).'); };
        $('#lvCsv').onclick = () => { const n = nvrById(cctvUi.lvNvr); downloadCsv(`list_view_${n.name.replace(/\s+/g, '_')}.csv`, [['No', 'Nama CCTV', 'Lokasi', 'Type', 'Channel', 'IP Address', 'Status'], ...c.cams.filter((x) => x.nvr_id === n.id).map((x, i) => [i + 1, x.name, x.location, x.type, x.channel, x.ip, camOnline(x) ? 'Online' : 'Offline'])]); };
      }
      if (cctvUi.tab === 'report') {
        $('#rpMonth').onchange = (e) => { cctvUi.month = e.target.value; rr(); };
        $$('[data-csv]').forEach((b) => (b.onclick = () => {
          const n = nvrById(+b.dataset.csv); const ym = cctvUi.month || todayStr().slice(0, 7); const days = monthDays(ym);
          const sym = { ok: 'V', bad: 'X', L: 'L' };
          downloadCsv(`rekap_${n.name.replace(/\s+/g, '_')}_${ym}.csv`, [['Nama CCTV', ...days.map((d) => +d.slice(8))], ...c.cams.filter((x) => x.nvr_id === n.id).map((x) => [x.name, ...days.map((d) => sym[dayStatus(x, d)] || '')])]);
        }));
      }
      if (cctvUi.tab === 'log') {
        $('#logCsv').onclick = () => downloadCsv('log_cctv_mati.csv', [['Nama CCTV', 'NVR', 'Mati', 'Pulih', 'Durasi'], ...c.events.map((e) => { const x = c.cams.find((k) => k.id === e.cam_id); return [x.name, nvrById(x.nvr_id).name, fmtDateTime(e.start), e.end ? fmtDateTime(e.end) : 'Masih mati', durText((e.end ? new Date(e.end) : new Date()) - new Date(e.start))]; })]);
      }
      if (cctvUi.tab === 'settings') {
        $('#csForm').onsubmit = (e) => {
          e.preventDefault(); const f = formData(e.target);
          Object.assign(c.settings, { email_after_min: +f.email_after_min, email_to: f.email_to.trim(), snapshot_schedule: f.snapshot_schedule, off_weekdays: [0, 1, 2, 3, 4, 5, 6].filter((d) => f['off_' + d]) });
          save(); rr(); toast('Pengaturan CCTV disimpan.');
        };
        $('#hForm').onsubmit = (e) => { e.preventDefault(); const f = formData(e.target); c.holidays = c.holidays.filter((h) => h.date !== f.date); c.holidays.push({ date: f.date, name: f.name.trim() }); save(); rr(); toast('Hari libur ditambahkan.'); };
        $$('[data-hdel]').forEach((b) => (b.onclick = async () => { if (!(await ask('Hapus hari libur ini?', 'Hapus'))) return; c.holidays = c.holidays.filter((h) => h.date !== b.dataset.hdel); save(); rr(); }));
      }
    },
  };

  // Banner kamera mati di Dashboard admin
  const _dashRender = PAGES.dashboard.render;
  PAGES.dashboard.render = function () {
    const off = C().cams.filter((x) => !camOnline(x));
    const banner = off.length ? `<a href="#/cctv" data-cctv-mon class="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-4 hover:bg-red-100">${icon('camera', 'w-5 h-5')}<span class="text-sm"><b>${off.length} CCTV mati:</b> ${off.map((x) => esc(x.name)).join(', ')}</span><span class="ml-auto text-xs font-semibold whitespace-nowrap">Lihat Monitoring →</span></a>` : '';
    return banner + _dashRender.call(this);
  };
  document.addEventListener('click', (e) => { if (e.target.closest('[data-cctv-mon]')) cctvUi.tab = 'monitor'; }, true);

  // ------------------------------------------------------------------
  // Ext Telepon
  // ------------------------------------------------------------------
  const extUi = { q: '' };
  PAGES['phone-ext'] = {
    render() {
      const q = extUi.q.toLowerCase();
      const rows = [...db.phoneExt].sort((a, b) => a.ext.localeCompare(b.ext, undefined, { numeric: true }))
        .filter((x) => !q || [x.ext, x.name, x.department, x.location].join(' ').toLowerCase().includes(q));
      return `<div class="bg-white rounded-xl shadow-sm p-3 mb-4 flex flex-wrap items-center gap-2">
  <div class="relative flex-1 min-w-[12rem]"><span class="absolute left-3 top-2.5 text-slate-400">${icon('search')}</span><input id="extQ" value="${esc(extUi.q)}" placeholder="Cari nomor, nama, departemen…" class="${inputCls} pl-9"></div>
  ${isAdmin() ? `<button id="extAdd" class="${btnPrimary}">${icon('plus')} Tambah</button>` : ''}
  <button id="extCsv" class="${btnGhost}">${icon('download')} Export</button>
</div>
<div class="bg-white rounded-xl shadow-sm overflow-hidden"><div class="overflow-x-auto"><table class="w-full text-sm"><thead><tr class="text-left text-slate-500 bg-slate-50 border-b"><th class="py-2 px-3">Ext</th><th class="py-2 px-3">Nama</th><th class="py-2 px-3">Departemen</th><th class="py-2 px-3">Lokasi</th>${isAdmin() ? '<th class="py-2 px-3 w-24"></th>' : ''}</tr></thead>
<tbody>${rows.map((x) => `<tr class="border-b last:border-0"><td class="py-2 px-3 font-bold text-brand-700">${esc(x.ext)}</td><td class="py-2 px-3 font-medium">${esc(x.name)}</td><td class="py-2 px-3 text-slate-500">${esc(x.department)}</td><td class="py-2 px-3 text-slate-500">${esc(x.location)}</td>
${isAdmin() ? `<td class="py-2 px-3 whitespace-nowrap text-right"><button data-extedit="${x.id}" class="text-blue-600 hover:text-blue-800 mr-2">${icon('pencil')}</button><button data-extdel="${x.id}" class="text-red-500 hover:text-red-700">${icon('trash')}</button></td>` : ''}</tr>`).join('') || `<tr><td colspan="5" class="py-6 text-center text-slate-400">Tidak ada data.</td></tr>`}</tbody></table></div></div>`;
    },
    bind() {
      const q = $('#extQ'); q.oninput = () => { extUi.q = q.value; const pos = q.selectionStart; render(); const n = $('#extQ'); n.focus(); n.setSelectionRange(pos, pos); };
      $('#extCsv').onclick = () => downloadCsv('ext_telepon.csv', [['Ext', 'Nama', 'Departemen', 'Lokasi'], ...db.phoneExt.map((x) => [x.ext, x.name, x.department, x.location])]);
      const formModal = (x) => openModal(x ? 'Edit Ext Telepon' : 'Tambah Ext Telepon', `<form id="extForm" class="space-y-3">
        ${field('Nomor Ext', `<input name="ext" required value="${esc(x ? x.ext : '')}" class="${inputCls}">`)}${field('Nama / Ruangan', `<input name="name" required value="${esc(x ? x.name : '')}" class="${inputCls}">`)}
        ${field('Departemen', `<input name="department" value="${esc(x ? x.department : '')}" class="${inputCls}">`)}${field('Lokasi', `<input name="location" value="${esc(x ? x.location : '')}" class="${inputCls}">`)}
        <div class="flex justify-end"><button class="${btnPrimary}">${icon('check')} Simpan</button></div></form>`, {
        onMount: (w) => { $('#extForm', w).onsubmit = (e) => { e.preventDefault(); const f = formData(e.target); const d = { ext: f.ext.trim(), name: f.name.trim(), department: f.department.trim(), location: f.location.trim() };
          if (db.phoneExt.some((y) => y.ext === d.ext && (!x || y.id !== x.id))) { toast('Nomor ext sudah dipakai.', false); return; }
          if (x) Object.assign(x, d); else db.phoneExt.push({ id: nextId(db.phoneExt), ...d }); save(); closeModal(); render(); toast('Ext telepon disimpan.'); }; } });
      if ($('#extAdd')) $('#extAdd').onclick = () => formModal(null);
      $$('[data-extedit]').forEach((b) => (b.onclick = () => formModal(db.phoneExt.find((x) => x.id === +b.dataset.extedit))));
      $$('[data-extdel]').forEach((b) => (b.onclick = async () => { if (!(await ask('Hapus ext telepon ini?', 'Hapus'))) return; db.phoneExt = db.phoneExt.filter((x) => x.id !== +b.dataset.extdel); save(); render(); }));
    },
  };
  ADMIN_NAV.splice(ADMIN_NAV.findIndex((n) => n[0] === 'pcpw') + 1, 0, ['cctv', 'camera', 'CCTV'], ['phone-ext', 'phone', 'Ext Telepon']);
  USER_NAV.push(['cctv', 'camera', 'Checklist CCTV'], ['phone-ext', 'phone', 'Ext Telepon']);

  // ------------------------------------------------------------------
  // Jaringan (demo): cek koneksi, topologi (kotak per lokasi, warna kabel, geser bebas), scan subnet, data koneksi.
  // Kode topologi sama dengan aplikasi asli; ping & scan disimulasikan di browser, data tersimpan di localStorage.
  // ------------------------------------------------------------------
  ICONS.network = '<rect x="16" y="16" width="6" height="6" rx="1"/><rect x="2" y="16" width="6" height="6" rx="1"/><rect x="9" y="2" width="6" height="6" rx="1"/><path d="M5 16v-3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3"/><path d="M12 12V8"/>';
  function netSeed() {
    const D = [];
    // [id, nama, jenis, lokasi, ip, induk, port induk, port sendiri, perangkat jaringan, brand/type, kondisi demo, semua IP]
    const add = (id, name, type, loc, ip, parent, port, own, isNet, brand, cond, ips) => D.push({ id, number: 'DEMO/NET/' + String(id).padStart(3, '0'), type, name, loc, ip: ip || '', is_net: !!isNet, parent: parent || null, port: port || '', own_port: own || '', brand: brand || '', cond: cond || 'ok', ips: ips || [] });
    add(9001, 'ISP Gateway', 'Router', 'Ruang Server', '203.0.113.9', null, '', '', 1, 'MikroTik CCR2004-16G-2S+', 'ok', ['203.0.113.9', '203.0.113.10', '203.0.113.11']);
    add(9002, 'Firewall', 'Firewall', 'Ruang Server', '203.0.113.12', 9001, 'eth1', 'eth2', 1, 'Fortinet FortiGate 100E', 'ok', ['203.0.113.12', '192.168.30.1/24']);
    add(9003, 'Core Router', 'Router', 'Ruang Server', '192.168.10.1', 9002, 'eth1', 'eth1', 1, 'MikroTik RB5009UG', 'ok', ['192.168.10.1/24', '192.168.20.1/24', '192.168.50.1/24']);
    add(9004, 'Main Switch Lokal', 'Switch', 'Ruang Server', '', 9003, 'eth2', 'eth1', 1, 'D-Link DGS-1210');
    add(9005, 'Main Switch FO', 'Switch', 'Ruang Server', '', null, '', '', 1, 'TP-Link MC220L');
    add(9006, 'NVR 1', 'NVR', 'Ruang Server', '192.168.20.2', 9004, 'eth5', 'eth1');
    add(9007, 'Server NAS', 'Server', 'Ruang Server', '192.168.10.8');
    add(9008, 'Server Email', 'Server', 'RUANG SERVER', '192.168.10.4');
    add(9009, 'Server Inventory', 'Server', 'Ruang Server', '192.168.10.12', null, '', '', 0, '', 'slow');
    add(9010, 'Switch PoE CCTV Gudang', 'Switch', 'Gudang', '', 9004, 'eth8', 'eth1', 1, 'Hikvision DS-3E0318P');
    add(9011, 'CCTV Gudang A1', 'CCTV', 'Gudang', '192.168.20.141', 9010, 'eth2');
    add(9012, 'CCTV Gudang A2', 'CCTV', 'Gudang', '192.168.20.142', 9010, 'eth3');
    add(9013, 'CCTV Gudang B1', 'CCTV', 'Gudang', '192.168.20.161', 9010, 'eth4', '', 0, '', 'down');
    add(9014, 'Switch Office Lt.2', 'Switch', 'Office Lt.2', '', 9004, 'eth10', 'eth1', 1, 'TP-Link TL-SG1016D');
    add(9015, 'PC Budi Santoso', 'Desktop PC', 'Office Lt.2', '192.168.10.31', 9014, 'eth2');
    add(9016, 'PC Dewi Lestari', 'Desktop PC', 'Office Lt.2', '192.168.10.32', 9014, 'eth3');
    add(9017, 'Laptop Rina Kartika', 'Laptop', 'Office Lt.2', '192.168.10.33', 9014, 'eth4', '', 0, '', 'down');
    add(9018, 'Printer Office', 'Printer', 'Office Lt.2', '192.168.10.40', 9014, 'eth5');
    add(9019, 'AP Kantin', 'Access Point', 'Kantin', '192.168.10.60', 9004, 'eth12', 'eth1', 1, 'Ubiquiti UniFi U6 Lite');
    add(9020, 'CCTV Pos Satpam', 'CCTV', 'Pos Satpam', '192.168.20.120', 9010, 'eth6');
    add(9021, 'CCTV Kantin', 'CCTV', 'Kantin', '192.168.20.121');
    add(9022, 'Switch PoE Parkiran', 'Switch', 'Parkiran', '', null, '', '', 1, 'Hikvision DS-3E0105P');
    add(9023, 'CCTV Parkiran Motor', 'CCTV', 'Parkiran', '192.168.20.130', 9022, 'eth1');
    return {
      devices: D,
      extra: [{ id: 1, a: 9010, b: 9005, port_a: 'sfp1', port_b: 'eth3, eth4' }, { id: 2, a: 9022, b: 9005, port_a: 'sfp1', port_b: 'eth7' }, { id: 3, a: 9006, b: 9010, port_a: 'eth2', port_b: 'eth16' }],
      status: {}, checks: [], pos: {}, scans: {}, subnets: ['192.168.10.0/24', '192.168.20.0/24'],
    };
  }
  if (!db.net) { db.net = netSeed(); save(); }
  const _origReset2 = resetDemo;
  resetDemo = function () { _origReset2(); db.net = netSeed(); save(); };
  const N = () => db.net;
  const netUi = { tab: 'topo' };
  const NET_TABS = [['check', 'Cek jaringan'], ['topo', 'Topologi'], ['scan', 'Scan jaringan'], ['links', 'Data koneksi']];
  const nowSql = () => { const d = new Date(); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`; };
  const netAssets = () => N().devices.map((d) => { const s = N().status[d.id] || {}; return Object.assign({ asset_status: 'Digunakan', ports: d.is_net ? (/Switch/.test(d.type) ? (/Parkiran/.test(d.name) ? 8 : 24) : 8) : 0, sfp: d.is_net ? 2 : 0, state: s.state || null, ms: s.ms != null ? s.ms : null, loss: s.loss != null ? s.loss : null, method: s.method || '', detail: s.detail || '', checked_at: s.checked_at || null }, d); });
  // Hasil ping simulasi: kondisi demo + sedikit acak supaya terasa hidup.
  function netPing(d) {
    if (!d.ip) return null;
    const r = Math.random();
    if (d.cond === 'down') return { state: 'err', ms: null, loss: 100, method: 'ping', detail: 'Tidak membalas ping maupun port TCP' };
    if (d.cond === 'slow') return { state: 'warn', ms: 120 + Math.round(r * 80), loss: 0, method: 'ping', detail: '4/4 balasan ping, rata-rata tinggi' };
    const ms = 1 + Math.round(r * 6);
    return { state: 'ok', ms, loss: 0, method: 'ping', detail: `4/4 balasan ping, maks ${ms + 2} ms` };
  }
  function netSuspects() {
    const A = netAssets(), out = [];
    A.filter((a) => a.is_net && !a.ip).forEach((sw) => {
      const desc = []; const st = [sw.id]; while (st.length) { const c = st.pop(); A.forEach((k) => { if (k.parent === c) { desc.push(k); st.push(k.id); } }); }
      const kids = desc.filter((k) => k.ip && k.state);
      if (kids.length >= 2 && kids.every((k) => k.state === 'err')) out.push({ name: sw.name, down: kids.length, total: kids.length });
    });
    return out;
  }
  const suspectsHtml = () => `<div id="netSuspects">${netSuspects().map((s) => `<div class="bg-red-50 border border-red-200 text-red-800 rounded-xl px-4 py-3 mb-3 text-sm"><b>Kemungkinan ${esc(s.name)} mati atau kabel uplink-nya putus</b> (${s.down} dari ${s.total} aset di bawahnya tidak merespons).</div>`).join('')}</div>`;
  // Hubungkan / ubah / lepas koneksi dari topologi + riwayat & batalkan (aturan sama dengan server).
  const netLogOut = () => { let first = true; return (N().log || []).map((x) => { const c = !x.undone && !!x.snap && first; if (c) first = false; return { id: x.id, at: x.at, user: x.user, action: x.action, detail: x.detail, undone: x.undone, can_undo: c }; }); };
  function netConn(fd) {
    const D = N(), act = fd.get('action'), by = {}; D.devices.forEach((d) => { by[d.id] = d; });
    const eth = (p) => { p = String(p || '').trim(); const m = p.match(/^(?:ether|port|eth)?\s*(\d+)$/i); return m ? 'eth' + m[1] : p; };
    const nm = (id) => (by[id] ? by[id].name : '#' + id), pl = (x, y) => (x || y ? ` (${x || '-'} ⇄ ${y || '-'})` : '');
    const snap = JSON.stringify({ links: D.devices.map((d) => [d.id, d.parent, d.port, d.own_port]), extra: D.extra });
    const log = (action, detail, s) => { D.log = D.log || []; D.log.unshift({ id: (D.log[0] ? D.log[0].id : 0) + 1, at: nowSql(), user: currentUser().full_name, action, detail, undone: false, snap: s }); D.log = D.log.slice(0, 30); };
    if (act === 'topo_undo') {
      const L = (D.log || []).find((x) => !x.undone && x.snap); if (!L) return 'Tidak ada perubahan yang bisa dibatalkan.';
      const o = JSON.parse(L.snap); o.links.forEach(([id, p, port, own]) => { if (by[id]) Object.assign(by[id], { parent: p, port, own_port: own }); }); D.extra = o.extra;
      L.undone = true; log('undo', 'Dibatalkan: ' + L.detail, null);
    } else if (act === 'topo_unlink') {
      const u = by[+fd.get('id')]; if (u) { const was = u.parent; Object.assign(u, { parent: null, port: '', own_port: '' }); log('unlink', `${u.name} dilepas dari ${nm(was)}`, snap); }
    } else if (act === 'topo_extra_del') {
      const l = D.extra.find((x) => x.id === +fd.get('id')); D.extra = D.extra.filter((x) => x.id !== +fd.get('id'));
      if (l) log('extra_del', `Koneksi tambahan dihapus: ${nm(l.a)} ⇄ ${nm(l.b)}${pl(l.port_a, l.port_b)}`, snap);
    } else if (act === 'topo_extra_upd') {
      const l = D.extra.find((x) => x.id === +fd.get('id')); if (!l) return 'Koneksi tidak ditemukan.';
      l.port_a = eth(fd.get('port_a')); l.port_b = eth(fd.get('port_b')); log('extra_upd', `Port koneksi tambahan diubah: ${nm(l.a)} ⇄ ${nm(l.b)}${pl(l.port_a, l.port_b)}`, snap);
    } else {
      const a = by[+fd.get('a')], b = by[+fd.get('b')], pa = eth(fd.get('port_a')), pb = eth(fd.get('port_b'));
      if (!a || !b || a === b) return 'Pilih dua perangkat yang berbeda.';
      if (fd.get('kind') === 'extra') {
        if (!a.is_net && !b.is_net) return 'Salah satu sisi harus switch / router / AP / firewall';
        if (D.extra.some((l) => l.a === a.id && l.b === b.id && l.port_a === pa && l.port_b === pb)) return 'Koneksi ini sudah ada (perangkat & port sama)';
        D.extra.push({ id: nextId(D.extra), a: a.id, b: b.id, port_a: pa, port_b: pb }); log('extra_add', `Koneksi tambahan: ${a.name} ⇄ ${b.name}${pl(pa, pb)}`, snap);
      } else {
        for (let x = b; x; x = by[x.parent]) if (x.id === a.id) return 'Ditolak: sambungan melingkar (perangkat atas berada di bawah perangkat ini).';
        const prev = a.parent; Object.assign(a, { parent: b.id, port: pb, own_port: pa });
        log('main', `${a.name} terhubung ke ${b.name}${pl(pb, pa)}${prev && prev !== b.id ? ' (sebelumnya ke ' + nm(prev) + ')' : ''}`, snap);
      }
    }
    save(); return '';
  }
  function netPost(fd) {
    const act = fd.get('action'), ok = (d) => Promise.resolve({ ok: true, json: () => Promise.resolve(Object.assign({ ok: true }, d || {})) });
    const delay = (ms, v) => new Promise((res) => setTimeout(() => res(v), ms));
    if (act === 'check') {
      const ids = fd.getAll('ids[]').map(Number), at = nowSql();
      const results = ids.map((id) => { const d = N().devices.find((x) => x.id === id); const p = d && netPing(d); if (!p) return null; const r = Object.assign({ id, checked_at: at }, p); N().status[id] = r; return r; }).filter(Boolean);
      save(); return delay(450, null).then(() => ok({ results }));
    }
    if (act === 'check_done') {
      const ids = fd.getAll('ids[]').map(Number), A = netAssets().filter((a) => ids.includes(a.id) && a.state);
      const bad = A.filter((a) => a.state !== 'ok');
      N().checks.unshift({ at: nowSql(), by: currentUser().full_name, n: A.length, ok: A.filter((a) => a.state === 'ok').length, warn: A.filter((a) => a.state === 'warn').length, err: A.filter((a) => a.state === 'err').length,
        detail: netSuspects().map((s) => 'Diduga mati: ' + s.name).concat(bad.map((a) => `${a.name} (${a.ip}) ${a.state === 'err' ? 'MATI' : 'LAMBAT ' + a.ms + ' ms / ' + a.loss + '%'}`)).join('\n') });
      N().checks = N().checks.slice(0, 8); save(); return ok({ suspects: netSuspects() });
    }
    if (act === 'scan_chunk') {
      const net = fd.get('subnet'), pre = net.split('.').slice(0, 3).join('.') + '.', from = +fd.get('from'), to = +fd.get('to'), found = {};
      const extras = { '192.168.10.': [[77, 'Xiaomi Communications', 'android-hp-tamu'], [91, 'Apple, Inc.', 'iPhone']], '192.168.20.': [[188, 'Hangzhou Hikvision', '']] };
      N().devices.forEach((d) => { if (d.cond !== 'down' && d.ip.startsWith(pre)) { const o = +d.ip.slice(pre.length); if (o >= from && o <= to) found[d.ip] = { ms: 1 + (o % 5), mac: '02:00:5E:' + pad(o % 100) + ':' + pad(d.id % 100) + ':01', vendor: '', host: '' }; } });
      (extras[pre] || []).forEach(([o, v, h]) => { if (o >= from && o <= to) found[pre + o] = { ms: 3, mac: 'A4:' + pad(o % 100) + ':7C:3B:9E:' + pad((o * 7) % 100), vendor: v, host: h }; });
      return delay(260, null).then(() => ok({ found }));
    }
    if (act === 'scan_finish') {
      const net = fd.get('subnet'), pre = net.split('.').slice(0, 3).join('.') + '.', found = JSON.parse(fd.get('found') || '{}');
      const byIp = {}; N().devices.forEach((d) => { (d.ip ? [d.ip] : []).concat(d.ips.map((x) => x.split('/')[0])).forEach((ip) => { if (!byIp[ip]) byIp[ip] = d; }); });
      const rows = Object.keys(found).sort((a, b) => +a.split('.')[3] - +b.split('.')[3]).map((ip) => { const f = found[ip], d = byIp[ip]; return { ip, ms: f.ms, mac: f.mac, vendor: f.vendor, host: f.host, asset_id: d ? d.id : null, asset_name: d ? d.name : '', asset_number: d ? d.number : '' }; });
      const missing = N().devices.filter((d) => d.ip.startsWith(pre) && !found[d.ip]).map((d) => `${d.name} (${d.ip})`);
      const res = { subnet: net, scanned_at: nowSql(), rows, missing }; N().scans[net] = res; save(); return ok(res);
    }
    if (/^topo_(conn|unlink|extra_del|extra_upd|undo)$/.test(act)) {
      const err = netConn(fd);
      return ok({ ok: err === '', error: err, assets: netAssets(), extra: N().extra.map((x) => Object.assign({}, x)), log: netLogOut() });
    }
    if (act === 'topo_pos') { N().pos = JSON.parse(fd.get('pos') || '{}'); save(); return ok(); }
    if (act === 'topo_pos_reset') { N().pos = {}; save(); return ok(); }
    return ok();
  }
  // Kode asli menu Jaringan (topologi, cek, scan), dibungkus supaya memakai data demo.
  function netInit(cfg) {

    var ASSETS = cfg.assets;
    var EXTRA = cfg.extra;
    var TOPO_POS = cfg.pos;
    var LOG = cfg.log;
    var CSRF = "demo";
    var SAVED = cfg.saved;
    var T = {"ok":"Normal","warn":"Lambat","err":"Mati","na":"Belum dicek","recheck":"Cek ulang","checking":"Mengecek…","of":"dari","assets":"aset","done":"Selesai","none":"Tidak ada aset yang cocok.","notLinked":"Belum dihubungkan","dev":"perangkat","connPickA":"Klik perangkat pertama. Tekan Esc untuk keluar.","connPickB":"%s dipilih. Klik perangkat tujuan. Batal: klik %s lagi atau tekan Esc.","connTitle":"Hubungkan","connTo":"terhubung ke","connMain":"Koneksi utama (\"Terhubung ke\")","connReplace":"menggantikan","connExtra":"Koneksi tambahan","connExtraSub":"Kabel ke-2 \/ LAN ke-2 \/ uplink cadangan (garis biru putus-putus)","portOn":"Port di","connHint":"Port boleh dikosongkan. Ketik atau pilih dari daftar; port yang sudah dipakai diberi keterangan.","cancel":"Batal","save":"Simpan","used":"terpakai","connSaved":"Koneksi disimpan.","connStart":"Hubungkan ke perangkat lain","unlink":"Lepas dari","unlinkQ":"Lepas koneksi %s dari %s?","unlinked":"Koneksi dilepas.","delExtra":"Hapus koneksi ke","delExtraQ":"Hapus koneksi tambahan ini?","extraDeleted":"Koneksi tambahan dihapus.","clickLine":"Klik untuk mengubah port \/ melepas koneksi","delExtraShort":"Hapus koneksi","clash":"%p di %d sudah dipakai %w.","clashTitle":"Port bentrok","clashHint":"Ganti port-nya, atau klik \"Tetap simpan\" bila memang benar (mis. dipasang hub\/switch kecil).","saveAnyway":"Tetap simpan","portMap":"Peta port","portUsed":"terpakai","portFree":"kosong","portNone":"Jumlah port belum diisi. Isi \"Jumlah port LAN\" & \"Port SFP\" di data aset untuk melihat port yang kosong.","logTitle":"Riwayat perubahan koneksi","logEmpty":"Belum ada perubahan.","undo":"Batalkan perubahan terakhir","undoQ":"Batalkan perubahan ini?","undone":"Perubahan dibatalkan.","orderSaved":"Posisi topologi disimpan.","orderReset":"Topologi kembali ke susunan otomatis.","orderResetQ":"Hapus semua posisi yang diatur manual dan kembali ke susunan otomatis?","orderDiscard":"Perubahan posisi belum disimpan. Batalkan perubahan?","noIp":"tanpa IP","suspect":"diduga mati","inferred":"disimpulkan","below":"Di bawahnya","extra":"Koneksi tambahan","connected":"Terhubung ke","result":"Hasil cek","loss":"paket hilang","scanning":"Memeriksa","reading":"Membaca tabel ARP & nama host…","registered":"Terdaftar","unregistered":"Tidak terdaftar","active":"perangkat aktif","notReg":"tidak terdaftar di menu Aset","missing":"Aset terdaftar yang tidak ditemukan","register":"Daftarkan","lastScan":"Hasil scan terakhir","failed":"Gagal"};
    var byId = {}; ASSETS.forEach(function (a) { byId[a.id] = a; });
    // ---- Pilihan dengan kotak cari (selalu membuka ke BAWAH), menggantikan <select data-combo> yang panjang ----
    [].forEach.call(document.querySelectorAll('select[data-combo]'), function (sel) {
        var wrap = document.createElement('div'); wrap.className = 'relative'; wrap.style.minWidth = '220px';
        var inp = document.createElement('input'); inp.type = 'text'; inp.autocomplete = 'off';
        inp.className = 'w-full border border-slate-300 rounded-lg px-2 py-1.5 bg-white text-sm pr-7';
        inp.placeholder = 'Ketik untuk mencari…';
        var caret = document.createElement('span'); caret.className = 'absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-xs'; caret.textContent = '▼';
        var list = document.createElement('div');
        list.className = 'hidden absolute left-0 top-full mt-1 z-50 w-full min-w-[280px] max-h-72 overflow-y-auto bg-white border border-slate-300 rounded-lg shadow-lg text-sm';
        sel.parentNode.insertBefore(wrap, sel); wrap.appendChild(inp); wrap.appendChild(caret); wrap.appendChild(list); wrap.appendChild(sel);
        sel.style.display = 'none';
        var items = [], active = -1;
        [].forEach.call(sel.children, function (ch) {
            var opts = ch.tagName === 'OPTGROUP' ? [].slice.call(ch.children) : [ch];
            if (ch.tagName === 'OPTGROUP') items.push({group: ch.label});
            opts.forEach(function (o) { items.push({value: o.value, text: o.textContent, q: o.textContent.toLowerCase()}); });
        });
        var label = function () { var o = sel.options[sel.selectedIndex]; return o ? o.textContent : ''; };
        inp.value = label();
        var render = function (q) {
            var w = (q || '').toLowerCase().trim().split(/\s+/).filter(Boolean), html = '', pend = null, n = 0;
            items.forEach(function (it, i) {
                if (it.group !== undefined) { pend = it.group; return; }
                if (!w.every(function (x) { return it.q.indexOf(x) >= 0; })) return;
                if (pend !== null) { html += '<div class="px-3 pt-2 pb-1 text-xs font-semibold text-slate-500 bg-slate-50 sticky top-0">' + esc(pend) + '</div>'; pend = null; }
                html += '<div class="cb-opt px-3 py-1.5 cursor-pointer hover:bg-blue-50' + (it.value === sel.value ? ' font-semibold text-blue-700' : '') + '" data-i="' + i + '">' + esc(it.text) + '</div>'; n++;
            });
            list.innerHTML = html || '<div class="px-3 py-2 text-slate-400">Tidak ditemukan</div>';
            active = -1;
        };
        var open = function () { render(inp.value === label() ? '' : inp.value); list.classList.remove('hidden'); };
        var close = function () { list.classList.add('hidden'); inp.value = label(); };
        var choose = function (i) { sel.value = items[i].value; sel.dispatchEvent(new Event('change', {bubbles: true})); close(); };
        inp.addEventListener('focus', function () { inp.select(); open(); });
        inp.addEventListener('input', function () { render(inp.value); list.classList.remove('hidden'); });
        inp.addEventListener('keydown', function (e) {
            var opts = list.querySelectorAll('.cb-opt');
            if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                e.preventDefault(); if (list.classList.contains('hidden')) open();
                active = Math.max(0, Math.min(opts.length - 1, active + (e.key === 'ArrowDown' ? 1 : -1)));
                [].forEach.call(opts, function (o, k) { o.classList.toggle('bg-blue-100', k === active); });
                if (opts[active]) opts[active].scrollIntoView({block: 'nearest'});
            } else if (e.key === 'Enter') { e.preventDefault(); var t = opts[active >= 0 ? active : 0]; if (t) choose(+t.dataset.i); }
            else if (e.key === 'Escape') { close(); inp.blur(); }
        });
        list.addEventListener('mousedown', function (e) { var t = e.target.closest('.cb-opt'); if (t) { e.preventDefault(); choose(+t.dataset.i); } });
        inp.addEventListener('blur', function () { setTimeout(close, 120); });
    });
    function plabel(up, own) { up = (up || '').trim(); own = (own || '').trim(); return up && own ? up + ' ⇄ ' + own : (up || (own ? '⇄ ' + own : '')); }
    // Pilihan port mengikuti perangkat yang dipilih (datalist "pl_<id>").
    [].forEach.call(document.querySelectorAll('select.port-src'), function (sel) {
        var inp = document.getElementById(sel.dataset.port); if (!inp) return;
        var sync = function () { if (sel.value && sel.value !== '0') inp.setAttribute('list', 'pl_' + sel.value); else inp.removeAttribute('list'); };
        sel.addEventListener('change', sync); sync();
    });
    // ---- Data koneksi: cari, filter, pilih beberapa / semua, aksi massal ----
    (function () {
        var bar = document.getElementById('linksBar'); if (!bar) return;
        var rowsL = [].slice.call(document.querySelectorAll('tr.lk-row')), q = document.getElementById('lkQ'), ft = document.getElementById('lkType'), fl = document.getElementById('lkLoc');
        var all = document.getElementById('lkAll'), bulk = document.getElementById('lkBulk'), selN = document.getElementById('lkSelN'), cnt = document.getElementById('lkCount');
        var setH = function () { document.documentElement.style.setProperty('--lsb-h', bar.offsetHeight + 'px'); };
        var picked = function () { return rowsL.filter(function (r) { return r.querySelector('.lk-pick').checked; }); };
        var sync = function () { var n = picked().length; selN.textContent = n; bulk.classList.toggle('hidden', !n); setH(); };
        var filter = function () {
            var t = (q.value || '').toLowerCase().trim().split(/\s+/).filter(Boolean), shown = 0;
            rowsL.forEach(function (r) {
                var ok = (!ft.value || r.dataset.type === ft.value) && (!fl.value || r.dataset.loc === fl.value) && t.every(function (w) { return r.dataset.q.indexOf(w) >= 0; });
                r.classList.toggle('hidden', !ok); if (ok) shown++;
            });
            cnt.textContent = shown + ' / ' + rowsL.length + ' aset';
            all.checked = false;
        };
        [q, ft, fl].forEach(function (el) { el.addEventListener('input', filter); el.addEventListener('change', filter); });
        q.addEventListener('keydown', function (e) { if (e.key === 'Enter') e.preventDefault(); });   // Enter tidak menyimpan form
        all.addEventListener('change', function () { rowsL.forEach(function (r) { if (!r.classList.contains('hidden')) r.querySelector('.lk-pick').checked = all.checked; }); sync(); });
        rowsL.forEach(function (r) { r.querySelector('.lk-pick').addEventListener('change', sync); });
        document.getElementById('lkClear').onclick = function () { rowsL.forEach(function (r) { r.querySelector('.lk-pick').checked = false; }); all.checked = false; sync(); };
        var send = function (to) {
            var ids = picked().map(function (r) { return r.querySelector('.lk-pick').value; }); if (!ids.length) return;
            var f = document.getElementById('lkBulkForm'); document.getElementById('lkBulkTo').value = to;
            [].forEach.call(f.querySelectorAll('input[name="ids[]"]'), function (x) { x.remove(); });
            ids.forEach(function (id) { var i = document.createElement('input'); i.type = 'hidden'; i.name = 'ids[]'; i.value = id; f.appendChild(i); });
            f.submit();
        };
        document.getElementById('lkApply').onclick = function () { var sel = document.getElementById('lkTo'); if (confirm('Hubungkan aset yang dicentang ke ' + sel.options[sel.selectedIndex].text + '?')) send(sel.value); };
        document.getElementById('lkUnlink').onclick = function () { if (confirm('Lepas koneksi aset yang dicentang?')) send(0); };
        // Checkbox centang tidak dihitung sebagai "perubahan belum disimpan".
        filter(); setH(); window.addEventListener('resize', setH);
    })();
    (function () {
        var f = document.querySelector('input[name="action"][value="links_save"]'), dirty = document.getElementById('linksDirty');
        if (!f || !dirty) return;
        var isEdit = function (e) { var t = e.target; return t && (t.name || '').match(/^(parent|port|own_port)\[/); };
        f.form.addEventListener('input', function (e) { if (isEdit(e)) { dirty.classList.remove('hidden'); document.documentElement.style.setProperty('--lsb-h', document.getElementById('linksBar').offsetHeight + 'px'); } });
        f.form.addEventListener('change', function (e) { if (isEdit(e)) dirty.classList.remove('hidden'); });
    })();
    function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return {'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]; }); }
    function badge(s) { var c = {ok: 'bg-green-100 text-green-700', warn: 'bg-amber-100 text-amber-700', err: 'bg-red-100 text-red-700', na: 'bg-slate-100 text-slate-600'}[s || 'na'];
        return '<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap ' + c + '"><span class="w-1.5 h-1.5 rounded-full bg-current"></span>' + esc(T[s || 'na']) + '</span>'; }
    function hm(d) { if (!d) return '-'; var x = new Date(String(d).replace(' ', 'T')); return ('0' + x.getHours()).slice(-2) + ':' + ('0' + x.getMinutes()).slice(-2); }
    function post(data) {
        var fd = new FormData(); fd.append('csrf_token', CSRF);
        Object.keys(data).forEach(function (k) { [].concat(data[k]).forEach(function (v) { fd.append(Array.isArray(data[k]) ? k + '[]' : k, v); }); });
        return cfg.post(fd).then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); });
    }
    function toast(msg, bad) { var box = document.getElementById('netToast'); if (!box) return; var d = document.createElement('div');
        d.className = 'bg-white border-l-4 ' + (bad ? 'border-red-500' : 'border-green-500') + ' shadow-lg rounded-lg px-4 py-3 text-sm text-slate-700'; d.textContent = msg; box.prepend(d); setTimeout(function () { d.remove(); }, 7000); }
    function descendants(id) { var out = [], st = [id]; while (st.length) { var c = st.pop(); ASSETS.forEach(function (a) { if (a.parent === c) { out.push(a); st.push(a.id); } }); } return out; }
    function stateOf(a) { if (a.ip) return a.state || 'na';
        var kids = descendants(a.id).filter(function (k) { return k.ip && k.state; });
        return kids.length >= 2 && kids.every(function (k) { return k.state === 'err'; }) ? 'err' : 'na'; }

    /* ---------- Cek jaringan ---------- */
    var rows = document.getElementById('netRows');
    function shown() {
        var ft = val('fType'), fl = val('fLoc'), fs = val('fState'), q = val('fQ').toLowerCase();
        return ASSETS.filter(function (a) { return a.ip && (!ft || a.type === ft) && (!fl || a.loc === fl) && (!fs || (a.state || 'na') === fs) && (!q || (a.name + ' ' + a.number + ' ' + a.ip).toLowerCase().indexOf(q) >= 0); });
    }
    function val(id) { var e = document.getElementById(id); return e ? e.value : ''; }
    function renderRows() {
        if (!rows) return;
        var order = {err: 0, warn: 1, ok: 2, na: 3};
        var list = shown().sort(function (x, y) { return order[x.state || 'na'] - order[y.state || 'na'] || x.name.localeCompare(y.name); });
        rows.innerHTML = list.map(function (a) { var p = byId[a.parent], s = a.state || 'na';
            return '<tr class="border-t ' + (s === 'err' ? 'bg-red-50/60' : s === 'warn' ? 'bg-amber-50/60' : '') + '"><td class="px-3 py-2"><input type="checkbox" class="pick w-4 h-4" value="' + a.id + '"></td>'
                + '<td class="px-3 py-2"><div class="font-medium text-slate-800">' + esc(a.name) + '</div><div class="text-xs text-slate-500">' + esc(a.number) + '</div></td>'
                + '<td class="px-3 py-2">' + esc(a.type) + '</td><td class="px-3 py-2">' + esc(a.loc) + '</td><td class="px-3 py-2 font-mono text-xs">' + esc(a.ip) + '</td>'
                + '<td class="px-3 py-2 text-xs">' + (p ? esc(p.name) + (plabel(a.port, a.own_port) ? ' <span class="text-slate-400">' + esc(plabel(a.port, a.own_port)) + '</span>' : '') : '<span class="text-slate-400">-</span>') + '</td>'
                + '<td class="px-3 py-2">' + badge(s) + (a.detail && s !== 'ok' ? '<div class="text-xs text-slate-500 mt-0.5">' + esc(a.detail) + '</div>' : '') + '</td>'
                + '<td class="px-3 py-2 text-right tabular-nums ' + (a.ms >= 100 ? 'text-amber-600 font-semibold' : '') + '">' + (a.ms == null ? '-' : a.ms + ' ms') + (a.method && a.method.indexOf('tcp ') === 0 ? '<div class="text-[10px] text-slate-400">' + esc(a.method) + '</div>' : '') + '</td>'
                + '<td class="px-3 py-2 text-right tabular-nums ' + (s === 'err' ? 'text-red-600 font-semibold' : a.loss >= 5 ? 'text-amber-600 font-semibold' : '') + '">' + (a.loss == null ? '-' : a.loss + '%') + '</td>'
                + '<td class="px-3 py-2 text-xs text-slate-500 tabular-nums">' + hm(a.checked_at) + '</td>'
                + '<td class="px-3 py-2"><button type="button" class="recheck text-xs px-2 py-1 rounded-lg border border-slate-300 hover:bg-slate-50 text-blue-600 whitespace-nowrap" data-id="' + a.id + '">' + esc(T.recheck) + '</button></td></tr>';
        }).join('') || '<tr><td colspan="11" class="px-3 py-6 text-center text-slate-500">' + esc(T.none) + '</td></tr>';
        [].forEach.call(rows.querySelectorAll('.recheck'), function (b) { b.onclick = function () { b.disabled = true; b.textContent = T.checking; run([+b.dataset.id]); }; });
        var all = document.getElementById('chkAll'); if (all) all.checked = false;
    }
    var busy = false;
    function run(ids) {
        if (busy || !ids.length) return; busy = true;
        var btn = document.getElementById('btnCheck'), prog = document.getElementById('prog'); if (btn) btn.disabled = true; if (prog) prog.classList.remove('hidden');
        var i = 0, CH = 8, okAll = true;
        (function next() {
            if (i >= ids.length) {
                post({action: 'check_done', ids: ids}).then(function () { cfg.reload(); }).catch(function () { cfg.reload(); });
                return;
            }
            var part = ids.slice(i, i + CH);
            document.getElementById('progTxt').textContent = T.checking + ' ' + Math.min(ids.length, i + part.length) + ' ' + T.of + ' ' + ids.length + ' ' + T.assets;
            post({action: 'check', ids: part}).then(function (d) {
                (d.results || []).forEach(function (r) { var a = byId[r.id]; if (a) { a.state = r.state; a.ms = r.ms; a.loss = r.loss; a.method = r.method; a.detail = r.detail; a.checked_at = r.checked_at; } });
            }).catch(function (e) { okAll = false; toast(T.failed + ': ' + e.message, true); }).then(function () {
                i += part.length; document.getElementById('progBar').style.width = (i / ids.length * 100) + '%'; renderRows(); next();
            });
        })();
    }
    if (rows) {
        ['fType', 'fLoc', 'fState'].forEach(function (id) { document.getElementById(id).onchange = renderRows; });
        document.getElementById('fQ').oninput = renderRows;
        document.getElementById('chkAll').onchange = function (e) { [].forEach.call(rows.querySelectorAll('.pick'), function (c) { c.checked = e.target.checked; }); };
        document.getElementById('btnCheck').onclick = function () {
            var picked = [].map.call(rows.querySelectorAll('.pick:checked'), function (c) { return +c.value; });
            run(picked.length ? picked : shown().map(function (a) { return a.id; }));
        };
        var KEY = 'netAutoPage', ap = document.getElementById('autoPage'), timer = null;
        function setAuto(on) { clearInterval(timer); timer = null; if (on) timer = setInterval(function () { if (!document.hidden) run(shown().map(function (a) { return a.id; })); }, 60000); }
        try { ap.checked = sessionStorage.getItem(KEY) === '1'; } catch (e) {}
        ap.onchange = function () { try { sessionStorage.setItem(KEY, ap.checked ? '1' : '0'); } catch (e) {} setAuto(ap.checked); };
        setAuto(ap.checked);
        renderRows();
    }

    /* ---------- Topologi ---------- */
    var topo = document.getElementById('topo');
    // ---- Geser bebas (seperti Visio): posisi X/Y tiap kotak disimpan; tanpa posisi = susunan otomatis ----
    var XY = {}, XY0 = {}, EDIT = false, DIRTY = false, NW_ = 190, POSG = {}, LISTG = [];
    Object.keys(TOPO_POS).forEach(function (k) { XY[k] = {x: TOPO_POS[k][0], y: TOPO_POS[k][1]}; XY0[k] = {x: TOPO_POS[k][0], y: TOPO_POS[k][1]}; });
    function setDirty(on) { DIRTY = on; document.getElementById('tArrDirty').classList.toggle('hidden', !on); }
    // Tahan klik & geser kotak ke mana saja (snap 10 px). Shift = ikut memindahkan seluruh cabang di bawahnya.
    function startDrag(e, id) {
        if (e.button > 0) return;
        e.preventDefault();
        var svg = topo.querySelector('svg'), r0 = svg.getBoundingClientRect(), sc = svg.viewBox.baseVal.width / r0.width;
        // Area yang di-scroll: <main> aplikasi (bila bisa di-scroll), selain itu jendela browser.
        var SC = topo.closest('main'); if (SC && SC.scrollHeight <= SC.clientHeight + 2 && getComputedStyle(SC).overflowY === 'visible') SC = null;
        var gy = function () { return SC ? SC.scrollTop : window.scrollY; }, sby = function (d) { if (SC) SC.scrollTop += d; else window.scrollBy(0, d); };
        var sx = e.clientX, sy = e.clientY, sl = topo.scrollLeft, wy = gy(), moved = false, raf = 0, last = e;
        var ids = [id];
        if (e.shiftKey && id > 0) descendants(id).forEach(function (k) { if (POSG[k.id]) ids.push(k.id); });
        var start = {}; ids.forEach(function (k) { start[k] = {x: POSG[k].x, y: POSG[k].y}; });
        function apply() {
            raf = 0;
            var dx = (last.clientX - sx + topo.scrollLeft - sl) * sc, dy = (last.clientY - sy + gy() - wy) * sc;
            if (!moved && Math.abs(dx) + Math.abs(dy) < 4) return;
            moved = true;
            var minX = Math.min.apply(null, ids.map(function (k) { return start[k].x; })), minY = Math.min.apply(null, ids.map(function (k) { return start[k].y; }));
            dx = Math.max(dx, 4 - minX); dy = Math.max(dy, 4 - minY);   // tidak keluar dari kiri / atas
            ids.forEach(function (k) { XY[k] = {x: Math.round((start[k].x + dx) / 10) * 10, y: Math.round((start[k].y + dy) / 10) * 10}; });
            renderTopo();
            var n = topo.querySelector('.node[data-id="' + id + '"]'); if (n) n.classList.add('dragging');
        }
        function mv(ev) { last = ev; if (!raf) raf = requestAnimationFrame(apply); }
        var tick = setInterval(function () {   // gulir otomatis di tepi layar / tepi diagram
            var tr = topo.getBoundingClientRect(), s = 0;
            var top = SC ? SC.getBoundingClientRect().top : 0, bot = SC ? SC.getBoundingClientRect().bottom : window.innerHeight;
            if (last.clientY < top + 60) { sby(-16); s = 1; } else if (last.clientY > bot - 40) { sby(16); s = 1; }
            if (last.clientX > tr.right - 40) { topo.scrollLeft += 16; s = 1; } else if (last.clientX < tr.left + 40) { topo.scrollLeft -= 16; s = 1; }
            if (s && moved && !raf) raf = requestAnimationFrame(apply);
        }, 30);
        function up() {
            clearInterval(tick); window.removeEventListener('pointermove', mv); window.removeEventListener('pointerup', up); window.removeEventListener('pointercancel', up);
            if (raf) { cancelAnimationFrame(raf); apply(); }
            if (moved) {
                // Simpan juga posisi semua kotak lain yang tampil, supaya susunan tidak bergeser bila data berubah.
                LISTG.forEach(function (k) { if (!XY[k] && POSG[k]) XY[k] = {x: POSG[k].x, y: POSG[k].y}; });
                setDirty(true);
            }
            renderTopo(); topoSearch(false);
        }
        window.addEventListener('pointermove', mv); window.addEventListener('pointerup', up); window.addEventListener('pointercancel', up);
    }
    // ---- Hubungkan dari topologi: klik perangkat A, lalu perangkat B -> pilih jenis koneksi & port ----
    var CONN = false, CONN_A = null, CONN_DLG = false;
    // Esc: batalkan perangkat pertama yang dipilih; Esc lagi = keluar dari mode Hubungkan (dialog terbuka: Esc menutup dialog saja).
    document.addEventListener('keydown', function (e) {
        if (e.key !== 'Escape' || !CONN || CONN_DLG) return;
        if (CONN_A) { CONN_A = null; connTxt(); renderTopo(); topoSearch(false); } else setConnect(false);
    });
    function connTxt() {
        var t = document.getElementById('tConnTxt'); if (!t) return;
        t.innerHTML = CONN_A ? T.connPickB.split('%s').join('<b>' + esc(byId[CONN_A].name) + '</b>') : esc(T.connPickA);
    }
    function setConnect(on, a) {
        CONN = on; CONN_A = on ? (a || null) : null;
        if (on && EDIT) setArrange(false);
        document.getElementById('tConnBar').classList.toggle('hidden', !on);
        document.getElementById('tConnect').classList.toggle('bg-indigo-100', on);
        connTxt(); renderTopo(); topoSearch(false);
    }
    // Nama port perangkat (eth1..N, sfp1..M) + keterangan port yang sudah terpakai.
    function portOpts(d) {
        var names = [], used = {};
        for (var i = 1; i <= Math.min(d.ports || 0, 128); i++) names.push('eth' + i);
        for (var j = 1; j <= Math.min(d.sfp || 0, 16); j++) names.push('sfp' + j);
        var put = function (dev, port, to) { if (dev !== d.id) return; String(port || '').split(/\s*[,\/;]\s*/).forEach(function (p) { if (p) used[p.toLowerCase()] = to; }); };
        ASSETS.forEach(function (x) { var pp = byId[x.parent]; if (!pp) return; put(x.parent, x.port, x.name); put(x.id, x.own_port, pp.name); });
        EXTRA.forEach(function (l) { var A = byId[l.a], B = byId[l.b]; if (!A || !B) return; put(l.a, l.port_a, B.name); put(l.b, l.port_b, A.name); });
        return names.map(function (n) { return '<option value="' + n + '">' + (used[n] ? esc(T.used + ': ' + used[n]) : '') + '</option>'; }).join('');
    }
    function applyNet(d) {   // data terbaru dari server -> gambar ulang tanpa memuat ulang halaman
        ASSETS.length = 0; [].push.apply(ASSETS, d.assets || []);
        Object.keys(byId).forEach(function (k) { delete byId[k]; }); ASSETS.forEach(function (x) { byId[x.id] = x; });
        EXTRA.length = 0; [].push.apply(EXTRA, d.extra || []);
        if (d.log) { LOG.length = 0; [].push.apply(LOG, d.log); }
        renderTopo(); topoSearch(false); renderLog();
        var cur = document.getElementById('nodeInfo').dataset.id; if (cur && byId[cur]) info(byId[cur]);
    }
    function netAction(data, okMsg) {
        return post(data).then(function (d) {
            if (!d.ok) { toast(d.error || T.failed, true); return false; }
            applyNet(d); toast(okMsg); return true;
        }).catch(function (e) { toast(T.failed + ': ' + e.message, true); return false; });
    }
    function connDialog(aId, bId) {
        var A = byId[aId], B = byId[bId]; if (!A || !B) return;
        var pa = byId[A.parent], pb = byId[B.parent];
        var def = A.is_net && !B.is_net ? 'ba' : (!A.is_net && B.is_net ? 'ab' : (A.is_net && B.is_net ? (A.parent ? (B.parent ? 'extra' : 'ba') : 'ab') : 'ab'));
        var opt = function (v, title, sub, dis) { return '<label class="flex gap-2 items-start rounded-lg border border-slate-200 px-3 py-2 cursor-pointer hover:bg-slate-50 has-[:checked]:border-indigo-400 has-[:checked]:bg-indigo-50' + (dis ? ' opacity-50' : '') + '"><input type="radio" name="ck" value="' + v + '" class="mt-1"' + (v === def ? ' checked' : '') + (dis ? ' disabled' : '') + '><span><b class="text-slate-800">' + title + '</b>' + (sub ? '<span class="block text-xs text-slate-500">' + sub + '</span>' : '') + '</span></label>'; };
        var dl = dialog('<h3 class="font-semibold text-slate-800 text-base">' + esc(T.connTitle) + ': ' + esc(A.name) + ' &#8644; ' + esc(B.name) + '</h3>'
            + '<div class="space-y-2">'
            + opt('ab', esc(A.name) + ' ' + esc(T.connTo) + ' ' + esc(B.name), esc(T.connMain) + (pa && pa.id !== B.id ? ' · ' + esc(T.connReplace) + ': ' + esc(pa.name) : ''))
            + opt('ba', esc(B.name) + ' ' + esc(T.connTo) + ' ' + esc(A.name), esc(T.connMain) + (pb && pb.id !== A.id ? ' · ' + esc(T.connReplace) + ': ' + esc(pb.name) : ''))
            + opt('extra', esc(T.connExtra), esc(T.connExtraSub), !A.is_net && !B.is_net)
            + '</div><div class="grid grid-cols-2 gap-3">'
            + '<label class="flex flex-col gap-1"><span class="text-xs text-slate-500">' + esc(T.portOn) + ' ' + esc(A.name) + '</span><input name="pa" list="cdlA" autocomplete="off" placeholder="eth1" class="border border-slate-300 rounded-lg px-2 py-1.5 font-mono"><datalist id="cdlA">' + portOpts(A) + '</datalist></label>'
            + '<label class="flex flex-col gap-1"><span class="text-xs text-slate-500">' + esc(T.portOn) + ' ' + esc(B.name) + '</span><input name="pb" list="cdlB" autocomplete="off" placeholder="eth1" class="border border-slate-300 rounded-lg px-2 py-1.5 font-mono"><datalist id="cdlB">' + portOpts(B) + '</datalist></label>'
            + '</div><p class="text-xs text-slate-500">' + esc(T.connHint) + '</p>'
            + '<div class="flex justify-end gap-2"><button type="button" data-x class="border border-slate-300 rounded-lg px-4 py-2">' + esc(T.cancel) + '</button><button data-save class="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 font-semibold">' + esc(T.save) + '</button></div>');
        var f = dl.f, close = dl.close;
        resetClash(f); f.pa.focus();
        f.onsubmit = function (e) {
            e.preventDefault();
            var k = (f.querySelector('input[name=ck]:checked') || {}).value, a = aId, b = bId, x = f.pa.value.trim(), y = f.pb.value.trim();
            if (k === 'ba') { a = bId; b = aId; var t = x; x = y; y = t; }
            var ign = k === 'extra' ? {} : {main: a};
            if (!clashGate(f, [{dev: a, port: x, ign: ign}, {dev: b, port: y, ign: ign}])) return;
            netAction({action: 'topo_conn', kind: k === 'extra' ? 'extra' : 'main', a: a, b: b, port_a: x, port_b: y}, T.connSaved).then(function (ok) {
                if (!ok) return; close(); CONN_A = null; connTxt(); renderTopo(); topoSearch(false);
                var n = topo.querySelector('.node[data-id="' + bId + '"]'); if (n) { n.classList.add('dragging'); setTimeout(function () { n.classList.remove('dragging'); }, 900); }
            });
        };
    }
    // Area klik lebar (transparan) di atas garis koneksi: klik untuk mengubah port / melepas.
    function hitPath(d, kind, id, ok) { return ok ? '<path class="lk-hit" data-lk="' + kind + '" data-id="' + id + '" d="' + d + '" fill="none" stroke="transparent" stroke-width="12"><title>' + esc(T.clickLine) + '</title></path>' : ''; }
    function ethN(p) { p = String(p || '').trim(); var m = p.match(/^(?:ether|port|eth)?\s*(\d+)$/i); return (m ? 'eth' + m[1] : p).toLowerCase(); }
    function isMulti(d) { return /\bFO\b|fib(er|re)|opti[ck]|[ck]onverter/i.test((d.name || '') + ' ' + (d.type || '')); }
    // Port di perangkat dev yang sudah dipakai koneksi lain (selain koneksi yang sedang diubah / diganti). Return nama pemakai atau ''.
    function portClash(devId, port, ign) {
        var d = byId[devId]; port = ethN(port); if (!d || !port || isMulti(d)) return '';
        var hit = '', has = function (s) { return String(s || '').split(/\s*[,\/;]\s*/).some(function (x) { return x && ethN(x) === port; }); };
        ASSETS.forEach(function (x) {
            if (hit || +ign.main === x.id || !byId[x.parent]) return;
            if (x.parent === devId && has(x.port)) hit = x.name;
            else if (x.id === devId && has(x.own_port)) hit = byId[x.parent].name;
        });
        EXTRA.forEach(function (l) {
            if (hit || +ign.extra === l.id) return;
            if (l.a === devId && has(l.port_a) && byId[l.b] && !isMulti(byId[l.b])) hit = byId[l.b].name;
            else if (l.b === devId && has(l.port_b) && byId[l.a] && !isMulti(byId[l.a])) hit = byId[l.a].name;
        });
        return hit;
    }
    // Cek bentrok sebelum simpan: tampilkan peringatan sekali, klik simpan lagi = tetap simpan.
    function clashGate(f, checks) {
        var msgs = checks.map(function (c) { var who = portClash(c.dev, c.port, c.ign || {}); return who ? T.clash.replace('%p', ethN(c.port)).replace('%d', byId[c.dev].name).replace('%w', who) : ''; }).filter(Boolean);
        var box = f.querySelector('[data-clash]');
        if (!msgs.length || f.dataset.force === '1') return true;
        box.innerHTML = '<b>' + esc(T.clashTitle) + '</b><br>' + msgs.map(esc).join('<br>') + '<br><span class="text-xs">' + esc(T.clashHint) + '</span>';
        box.classList.remove('hidden'); f.dataset.force = '1';
        f.querySelector('[data-save]').textContent = T.saveAnyway;
        return false;
    }
    function resetClash(f) { [].forEach.call(f.querySelectorAll('input[name=pa],input[name=pb],input[name=ck]'), function (i) { i.addEventListener('input', function () { f.dataset.force = ''; f.querySelector('[data-clash]').classList.add('hidden'); f.querySelector('[data-save]').textContent = T.save; }); i.addEventListener('change', function () { i.dispatchEvent(new Event('input')); }); }); }
    // Kerangka dialog (Esc / klik di luar = tutup).
    function dialog(html) {
        var w = document.createElement('div');
        w.className = 'fixed inset-0 z-[70] bg-black/40 flex items-center justify-center p-4';
        w.innerHTML = '<form class="bg-white rounded-xl shadow-xl w-full max-w-lg p-5 space-y-4 text-sm max-h-[90vh] overflow-y-auto">' + html
            + '<div data-clash class="hidden rounded-lg border border-amber-300 bg-amber-50 text-amber-900 px-3 py-2"></div></form>';
        document.body.appendChild(w); CONN_DLG = true;
        var f = w.querySelector('form'), esc1 = function (e) { if (e.key === 'Escape') close(); },
            close = function () { w.remove(); document.removeEventListener('keydown', esc1); setTimeout(function () { CONN_DLG = false; }, 0); };
        document.addEventListener('keydown', esc1);
        w.addEventListener('mousedown', function (e) { if (e.target === w) close(); });
        [].forEach.call(w.querySelectorAll('[data-x]'), function (b) { b.onclick = close; });
        return {f: f, close: close};
    }
    // Klik garis: ubah port koneksi utama / tambahan, atau lepas / hapus.
    function linkDialog(kind, id) {
        var A, B, pa, pb, title, delTxt;
        if (kind === 'main') { A = byId[id]; B = A && byId[A.parent]; if (!B) return; pa = A.own_port; pb = A.port; title = T.connMain; delTxt = T.unlink + ' ' + B.name; }
        else { var l = EXTRA.filter(function (x) { return x.id === id; })[0]; if (!l) return; A = byId[l.a]; B = byId[l.b]; if (!A || !B) return; pa = l.port_a; pb = l.port_b; title = T.connExtra; delTxt = T.delExtraShort; }
        var dl = dialog('<h3 class="font-semibold text-slate-800 text-base">' + esc(title) + ': ' + esc(A.name) + ' &#8644; ' + esc(B.name) + '</h3>'
            + (kind === 'main' ? '<p class="text-xs text-slate-500">' + esc(A.name) + ' ' + esc(T.connTo) + ' ' + esc(B.name) + '</p>' : '')
            + '<div class="grid grid-cols-2 gap-3">'
            + '<label class="flex flex-col gap-1"><span class="text-xs text-slate-500">' + esc(T.portOn) + ' ' + esc(A.name) + '</span><input name="pa" value="' + esc(pa || '') + '" list="edlA" autocomplete="off" class="border border-slate-300 rounded-lg px-2 py-1.5 font-mono"><datalist id="edlA">' + portOpts(A) + '</datalist></label>'
            + '<label class="flex flex-col gap-1"><span class="text-xs text-slate-500">' + esc(T.portOn) + ' ' + esc(B.name) + '</span><input name="pb" value="' + esc(pb || '') + '" list="edlB" autocomplete="off" class="border border-slate-300 rounded-lg px-2 py-1.5 font-mono"><datalist id="edlB">' + portOpts(B) + '</datalist></label></div>'
            + '<div class="flex flex-wrap justify-between gap-2"><button type="button" data-del class="border border-red-300 text-red-700 hover:bg-red-50 rounded-lg px-3 py-2">' + esc(delTxt) + '</button>'
            + '<span class="flex gap-2"><button type="button" data-x class="border border-slate-300 rounded-lg px-4 py-2">' + esc(T.cancel) + '</button><button data-save class="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 font-semibold">' + esc(T.save) + '</button></span></div>');
        var f = dl.f; resetClash(f); f.pa.focus();
        f.querySelector('[data-del]').onclick = function () {
            if (!confirm(kind === 'main' ? T.unlinkQ.replace('%s', A.name).replace('%s', B.name) : T.delExtraQ)) return;
            netAction(kind === 'main' ? {action: 'topo_unlink', id: A.id} : {action: 'topo_extra_del', id: id}, kind === 'main' ? T.unlinked : T.extraDeleted).then(function (ok) { if (ok) dl.close(); });
        };
        f.onsubmit = function (e) {
            e.preventDefault();
            var ign = kind === 'main' ? {main: A.id} : {extra: id};
            if (!clashGate(f, [{dev: A.id, port: f.pa.value, ign: ign}, {dev: B.id, port: f.pb.value, ign: ign}])) return;
            netAction(kind === 'main' ? {action: 'topo_conn', kind: 'main', a: A.id, b: B.id, port_a: f.pa.value.trim(), port_b: f.pb.value.trim()}
                : {action: 'topo_extra_upd', id: id, port_a: f.pa.value.trim(), port_b: f.pb.value.trim()}, T.connSaved).then(function (ok) { if (ok) dl.close(); });
        };
    }
    // Peta port switch / router: kotak per port (hijau = terpakai, merah = perangkatnya mati, abu-abu = kosong).
    function portMap(a) {
        if (!a.is_net) return '';
        var names = [], use = {};
        for (var i = 1; i <= Math.min(a.ports || 0, 128); i++) names.push('eth' + i);
        for (var j = 1; j <= Math.min(a.sfp || 0, 16); j++) names.push('sfp' + j);
        var put = function (port, dev) { String(port || '').split(/\s*[,\/;]\s*/).forEach(function (x) { x = ethN(x); if (!x || !dev) return; (use[x] = use[x] || []).push(dev); if (names.indexOf(x) < 0) names.push(x); }); };
        ASSETS.forEach(function (x) { if (x.parent === a.id) put(x.port, x); if (x.id === a.id && byId[x.parent]) put(x.own_port, byId[x.parent]); });
        EXTRA.forEach(function (l) { if (l.a === a.id) put(l.port_a, byId[l.b]); if (l.b === a.id) put(l.port_b, byId[l.a]); });
        var head = '<p class="font-semibold text-slate-700 mb-2">' + esc(T.portMap) + ' <span class="font-normal text-xs text-slate-500">' + Object.keys(use).length + ' ' + esc(T.portUsed) + (a.ports || a.sfp ? ' · ' + Math.max(0, names.length - Object.keys(use).length) + ' ' + esc(T.portFree) : '') + '</span></p>';
        if (!names.length) return '<div class="mt-3 pt-3 border-t">' + head + '<p class="text-xs text-slate-500">' + esc(T.portNone) + '</p></div>';
        var order = function (n) { var m = n.match(/^(eth|sfp)(\d+)$/); return m ? (m[1] === 'eth' ? 0 : 1000) + +m[2] : 5000; };
        names.sort(function (x, y) { return order(x) - order(y) || x.localeCompare(y); });
        return '<div class="mt-3 pt-3 border-t">' + head + '<div class="flex flex-wrap gap-1.5">' + names.map(function (n) {
            var d = use[n], dev = d && d[0], st = dev ? stateOf(dev) : '', cls = !dev ? 'border-dashed border-slate-300 bg-slate-50 text-slate-400' : (st === 'err' ? 'border-red-400 bg-red-50 text-red-800' : 'border-green-400 bg-green-50 text-green-900');
            var who = d ? d.map(function (x) { return x.name; }).join(', ') : T.portFree;
            return '<button type="button" ' + (dev ? 'data-pm="' + dev.id + '"' : 'disabled') + ' title="' + esc(n + ' · ' + who) + '" class="w-[4.6rem] rounded-md border px-1.5 py-1 text-left leading-tight ' + cls + (dev ? ' hover:shadow' : '') + '">'
                + '<span class="block font-mono text-[11px] font-semibold">' + esc(n) + (d && d.length > 1 ? ' ×' + d.length : '') + '</span><span class="block text-[10px] truncate">' + esc(dev ? dev.name : '—') + '</span></button>';
        }).join('') + '</div></div>';
    }
    // Riwayat perubahan koneksi + batalkan perubahan terakhir.
    function renderLog() {
        var box = document.getElementById('netLog'); if (!box) return;
        var first = LOG.filter(function (x) { return x.can_undo; })[0];
        box.innerHTML = '<div class="flex flex-wrap items-center gap-2 mb-2"><p class="font-semibold text-slate-800">' + esc(T.logTitle) + '</p>'
            + '<button type="button" id="netUndo" ' + (first ? '' : 'disabled') + ' class="ml-auto inline-flex items-center gap-1 border border-slate-300 hover:bg-slate-50 rounded-lg px-3 py-1.5 text-xs disabled:opacity-40">&#8630; ' + esc(T.undo) + '</button></div>'
            + (LOG.length ? '<ul class="divide-y">' + LOG.slice(0, 15).map(function (x) {
                return '<li class="py-1.5 flex gap-3' + (x.undone ? ' text-slate-400 line-through' : '') + '"><span class="tabular-nums text-xs text-slate-500 whitespace-nowrap">' + esc(x.at.slice(8, 10) + '/' + x.at.slice(5, 7) + ' ' + x.at.slice(11, 16)) + '</span><span class="min-w-0 flex-1">' + esc(x.detail) + '</span><span class="text-xs text-slate-500 whitespace-nowrap">' + esc(x.user) + '</span></li>';
            }).join('') + '</ul>' : '<p class="text-xs text-slate-500">' + esc(T.logEmpty) + '</p>');
        var u = document.getElementById('netUndo');
        if (u && first) u.onclick = function () { if (!confirm(T.undoQ + '\n' + first.detail)) return; netAction({action: 'topo_undo'}, T.undone); };
    }
    // Simpan topologi sebagai gambar PNG (2x lebih tajam, dibatasi 16.000 px).
    function topoPng() {
        var svg = topo.querySelector('svg'); if (!svg) return;
        var c = svg.cloneNode(true), w = +svg.getAttribute('width'), h = +svg.getAttribute('height'), sc = Math.min(2, 16000 / Math.max(w, h));
        [].forEach.call(c.querySelectorAll('.lk-hit,.mv'), function (x) { x.remove(); });
        [].forEach.call(c.querySelectorAll('.node'), function (x) { x.removeAttribute('style'); x.classList.remove('dragging', 'conn-a', 'opacity-30', 'topo-hit'); });
        c.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
        c.insertAdjacentHTML('afterbegin', '<style>text{font-family:"Segoe UI",Arial,Helvetica,sans-serif}</style><rect width="100%" height="100%" fill="#ffffff"/>');
        var img = new Image(), url = URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(c)], {type: 'image/svg+xml;charset=utf-8'}));
        img.onload = function () {
            var cv = document.createElement('canvas'); cv.width = Math.round(w * sc); cv.height = Math.round(h * sc);
            var ctx = cv.getContext('2d'); ctx.scale(sc, sc); ctx.drawImage(img, 0, 0, w, h); URL.revokeObjectURL(url);
            cv.toBlob(function (b) { var a = document.createElement('a'), d = new Date(), pad = function (n) { return ('0' + n).slice(-2); };
                a.href = URL.createObjectURL(b); a.download = 'Topologi_Jaringan_' + d.getFullYear() + pad(d.getMonth() + 1) + pad(d.getDate()) + '_' + pad(d.getHours()) + pad(d.getMinutes()) + '.png';
                document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500); }, 'image/png');
        };
        img.onerror = function () { toast(T.failed, true); };
        img.src = url;
    }
    function setArrange(on) {
        if (on && CONN) setConnect(false);
        EDIT = on; document.getElementById('tArrBar').classList.toggle('hidden', !on);
        document.getElementById('tArrange').classList.toggle('bg-amber-100', on);
        renderTopo(); topoSearch(false);
    }
    function renderTopo() {
        // Kotak per lokasi aktif: anak yang lokasinya sama dengan induknya didahulukan, lalu dikelompokkan per lokasi.
        function GRP_ON() { return !!(document.getElementById('tGroup') || {}).checked; }
        // Lokasi dibandingkan tanpa beda huruf besar/kecil & spasi ("Ruang Server" = "RUANG SERVER").
        // Label kotak memakai penulisan yang paling banyak dipakai.
        function LK(s) { return (s || '').trim().replace(/\s+/g, ' ').toLowerCase(); }
        var LCNT = {}, LNAME = {};
        ASSETS.forEach(function (a) { var k = LK(a.loc), t = (a.loc || '').trim().replace(/\s+/g, ' '); if (!k) return; LCNT[k] = LCNT[k] || {}; LCNT[k][t] = (LCNT[k][t] || 0) + 1; });
        Object.keys(LCNT).forEach(function (k) { LNAME[k] = Object.keys(LCNT[k]).sort(function (x, y) { return LCNT[k][y] - LCNT[k][x] || x.localeCompare(y); })[0]; });
        // Cabang yang seluruh isinya 1 lokasi didahulukan, supaya aset satu lokasi tidak terpotong cabang lokasi lain.
        function pure(k) { var L = LK(k.loc); return descendants(k.id).every(function (d) { return LK(d.loc) === L; }) ? 0 : 1; }
        var fl = val('tLoc'), list = [], VIRT_NET = {id: -1, name: 'Internet / Router ISP', type: '', ip: '', virtual: true}, VIRT_NL = {id: -2, name: T.notLinked, type: '', ip: '', virtual: true};
        function keep(a) { if (!fl) return true; if (a.loc === fl) return true; return descendants(a.id).some(function (k) { return k.loc === fl; }); }
        var roots = ASSETS.filter(function (a) { return !a.parent; });
        var netRoots = roots.filter(function (a) { return a.is_net || descendants(a.id).length; }), loose = roots.filter(function (a) { return netRoots.indexOf(a) < 0; });
        function walk(a, d, pid) { if (!keep(a)) return; list.push({a: a, d: d, pid: pid}); ASSETS.filter(function (k) { return k.parent === a.id; }).sort(function (x, y) { return (GRP_ON() ? (LK(x.loc) === LK(a.loc) ? 0 : 1) - (LK(y.loc) === LK(a.loc) ? 0 : 1) || LK(x.loc).localeCompare(LK(y.loc)) || pure(x) - pure(y) : 0) || (y.is_net - x.is_net) || x.name.localeCompare(y.name); }).forEach(function (k) { walk(k, d + 1, a.id); }); }
        // Urutan perangkat paling atas sama dengan versi cetak; dengan kotak per lokasi, yang lokasinya sama dibuat
        // berdampingan (urutan lokasi mengikuti kemunculan pertama) dan yang tanpa cabang lokasi lain didahulukan.
        netRoots.sort(function (x, y) { return (y.is_net - x.is_net) || x.name.localeCompare(y.name); });
        if (GRP_ON()) {
            var rk = [], rg = {};
            netRoots.forEach(function (a, i) { var k = LK(a.loc); if (!rg[k]) { rg[k] = []; rk.push(k); } rg[k].push([a, i]); });
            netRoots = [];
            rk.forEach(function (k) { rg[k].sort(function (x, y) { return (k ? pure(x[0]) - pure(y[0]) : 0) || x[1] - y[1]; }).forEach(function (x) { netRoots.push(x[0]); }); });
        }
        if (netRoots.length) { list.push({a: VIRT_NET, d: 0}); netRoots.forEach(function (a) { walk(a, 1, -1); }); }
        var looseKept = loose.filter(keep);
        if (GRP_ON()) looseKept.sort(function (x, y) { return LK(x.loc).localeCompare(LK(y.loc)) || x.name.localeCompare(y.name); });
        // Kotak per lokasi: aset yang belum dihubungkan ikut ditaruh di kotak lokasinya (di bawah perangkat pertama
        // berlokasi sama), digambar bergaris putus-putus tanpa garis koneksi. Sisanya tetap di "Belum dihubungkan".
        if (GRP_ON() && looseKept.length) {
            var anchor = {}, ins = {};
            // Utamakan switch/router berlokasi sama yang punya cabang, lalu perangkat jaringan, lalu baris pertama.
            var rank = {};
            list.forEach(function (r, i) {
                var k = r.a.virtual ? '' : LK(r.a.loc); if (!k) return;
                var sc = r.a.is_net ? ((list[i + 1] && list[i + 1].d > r.d) ? 2 : 1) : 0;
                if (anchor[k] === undefined || sc > rank[k]) { anchor[k] = i; rank[k] = sc; }
            });
            looseKept = looseKept.filter(function (a) { var i = anchor[LK(a.loc)]; if (i === undefined) return true; (ins[i] = ins[i] || []).push(a); return false; });
            Object.keys(ins).map(Number).sort(function (x, y) { return y - x; }).forEach(function (i) {
                var d = list[i].d + 1;
                list.splice.apply(list, [i + 1, 0].concat(ins[i].map(function (a) { return {a: a, d: d, float: true, pid: null}; })));
            });
        }
        if (looseKept.length) { list.push({a: VIRT_NL, d: 0}); looseKept.forEach(function (a) { list.push({a: a, d: 1, pid: -2}); }); }
        if (!list.length) { topo.innerHTML = '<p class="p-6 text-sm text-slate-500">' + esc(T.none) + '</p>'; return; }
        var NW = 190, NH = 40, GX = 150, GY = 50, P = 14, maxD = Math.max.apply(null, list.map(function (r) { return r.d; }));
        // Router/switch/hub/AP yang punya Brand/Type: kotak lebih tinggi (baris ke-3 = brand type).
        var GAP = GY - NH, yy = P, pos = {};
        // Semua IP terdaftar tampil 1 per baris (IP utama paling atas); kotak bertambah tinggi 14px per IP tambahan.
        function ipLines(a) {
            if (a.virtual) return [];
            var l = (a.ips || []).slice();
            if (!l.length) return a.ip ? [a.ip] : [];
            var k = -1; l.forEach(function (x, i) { if (k < 0 && x.split('/')[0] === a.ip) k = i; });
            if (k > 0) l.unshift(l.splice(k, 1)[0]);
            return l;
        }
        // Kotak lokasi: baris berurutan dengan lokasi sama dibungkus 1 kotak berwarna + label lokasi di atasnya.
        var GRP = !!(document.getElementById('tGroup') || {}).checked, LBL = 24, prevLoc = null;
        function locOf(a) { return a.virtual ? '' : LK(a.loc); }
        list.forEach(function (r) { var L = locOf(r.a); if (GRP && L && L !== prevLoc) yy += LBL; prevLoc = L; var nIp = Math.max(1, ipLines(r.a).length), h = r.a.virtual ? NH : NH + (nIp - 1) * 14 + ((r.a.is_net && (r.a.brand || '').trim()) ? 14 : 0); pos[r.a.id] = {x: P + r.d * GX, y: yy, h: h, d: r.d, ips: ipLines(r.a)}; yy += h + GAP; });
        var W = P * 2 + maxD * GX + NW + (EXTRA.length ? 70 + EXTRA.length * 14 : 0), H = yy - GAP + P;
        // Warna kabel: tiap switch / router yang punya perangkat di bawahnya mendapat 1 warna; semua garis koneksi
        // utama dari perangkat itu memakai warnanya, dan kotaknya diberi strip warna yang sama. Merah tetap = putus.
        var CAB_ON = !!(document.getElementById('tCable') || {}).checked, CAB = {}, nCab = 0;
        var CAB_PAL = ['#0d9488', '#7c3aed', '#ea580c', '#92400e', '#65a30d', '#db2777', '#ca8a04', '#475569', '#059669', '#9333ea', '#c2410c', '#0f766e', '#a16207', '#be185d', '#15803d', '#6d28d9'];
        if (CAB_ON) list.forEach(function (r) { if (r.pid > 0 && !r.float && CAB[r.pid] === undefined) CAB[r.pid] = CAB_PAL[nCab++ % CAB_PAL.length]; });
        function cab(r) { return (CAB_ON && r.pid > 0 && CAB[r.pid]) || '#94a3b8'; }
        // Geser bebas: kotak yang punya posisi tersimpan dipindah ke posisinya; garis digambar ulang (siku).
        var FREE = EDIT || Object.keys(XY).length > 0;
        if (FREE) {
            list.forEach(function (r) { var q = XY[r.a.id]; if (q) { pos[r.a.id].x = q.x; pos[r.a.id].y = q.y; } });
            list.forEach(function (r) { var p = pos[r.a.id]; W = Math.max(W, p.x + NW + 60); H = Math.max(H, p.y + p.h + 40); });
            if (EDIT) { W += 300; H += 200; }   // ruang kosong untuk menggeser
        }
        // Garis siku antar 2 kotak (gaya Visio): atas-bawah bila berjauhan vertikal, kiri-kanan bila sejajar.
        function elbow(A, B, off, tree) {
            off = off || 0;
            var acx = A.x + NW / 2, bcx = B.x + NW / 2, bmy = B.y + Math.min(B.h, NH) / 2 + off;
            // Induk -> anak di kanan-bawah / kiri-bawah: garis "L" seperti tampilan pohon (turun dari tepi induk, belok ke anak).
            if (tree && B.y >= A.y + A.h - 4 && (B.x >= A.x + 40 || B.x + NW <= A.x + NW - 40)) {
                var rgt = B.x >= A.x + 40, tx = (rgt ? A.x + 18 : A.x + NW - 18) + off, ex = rgt ? B.x : B.x + NW;
                return {d: 'M' + tx + ',' + (A.y + A.h) + ' V' + bmy + ' H' + ex, lx: rgt ? tx + 6 : ex + 6, ly: bmy - 4, ax: tx + 4, ay: A.y + A.h + 12};
            }
            if (B.y >= A.y + A.h + 16 || A.y >= B.y + B.h + 16) {
                var down = B.y > A.y, y1 = down ? A.y + A.h : A.y, y2 = down ? B.y : B.y + B.h, my = Math.round((y1 + y2) / 2) + off;
                var ax = acx + off, bx = bcx + off;
                return {d: 'M' + ax + ',' + y1 + ' V' + my + ' H' + bx + ' V' + y2, lx: bx + 4, ly: down ? y2 - 4 : y2 + 12, ax: ax + 4, ay: down ? y1 + 12 : y1 - 4};
            }
            var right = B.x > A.x, x1 = right ? A.x + NW : A.x, x2 = right ? B.x : B.x + NW, mx = Math.round((x1 + x2) / 2) + off;
            var ay = A.y + Math.min(A.h, 40) / 2 + off, by = B.y + Math.min(B.h, 40) / 2 + off;
            if (Math.abs(x2 - x1) < 20) { mx = Math.max(A.x, B.x) + NW + 30 + off; x1 = A.x + NW; x2 = B.x + NW; }   // bertumpuk: lewat sisi kanan
            return {d: 'M' + x1 + ',' + ay + ' H' + mx + ' V' + by + ' H' + x2, lx: x2 + (x2 > mx ? -60 : 4), ly: by - 4, ax: x1 + (x1 < mx ? 4 : -60), ay: ay - 4};
        }
        var COL = {ok: ['#ecfdf3', '#15803d'], warn: ['#fffbeb', '#b45309'], err: ['#fef2f2', '#b91c1c'], na: ['#ffffff', '#cbd5e1']};
        var lines = '', nodes = '', boxes = '';
        if (GRP) {
            var PAL = [['#eff6ff', '#3b82f6', '#1d4ed8'], ['#f0fdf4', '#22c55e', '#15803d'], ['#fff7ed', '#f97316', '#c2410c'], ['#faf5ff', '#a855f7', '#7e22ce'], ['#ecfeff', '#06b6d4', '#0e7490'], ['#fdf2f8', '#ec4899', '#be185d'], ['#fefce8', '#eab308', '#a16207']];
            var locIdx = {}, nLoc = 0, runs = [], cur = null;
            if (FREE) {   // satu kotak per lokasi = batas luar semua perangkat di lokasi itu
                var byL = {};
                list.forEach(function (r) {
                    var L = locOf(r.a), p = pos[r.a.id]; if (!L) return;
                    if (locIdx[L] === undefined) locIdx[L] = nLoc++;
                    var g = byL[L]; if (!g) { g = byL[L] = {loc: L, x1: p.x, x2: p.x + NW, y1: p.y, y2: p.y + p.h, n: 0}; runs.push(g); }
                    g.x1 = Math.min(g.x1, p.x); g.x2 = Math.max(g.x2, p.x + NW); g.y1 = Math.min(g.y1, p.y); g.y2 = Math.max(g.y2, p.y + p.h); g.n++;
                });
            } else list.forEach(function (r) {
                var L = locOf(r.a), p = pos[r.a.id];
                if (!L) { cur = null; return; }
                if (cur && cur.loc === L) { cur.x1 = Math.min(cur.x1, p.x); cur.x2 = Math.max(cur.x2, p.x + NW); cur.y2 = p.y + p.h; cur.n++; }
                else { if (locIdx[L] === undefined) locIdx[L] = nLoc++; cur = {loc: L, x1: p.x, x2: p.x + NW, y1: p.y, y2: p.y + p.h, n: 1}; runs.push(cur); }
            });
            runs.forEach(function (g) {
                var c = PAL[locIdx[g.loc] % PAL.length], x = g.x1 - 8, y = g.y1 - LBL + 4, w = g.x2 - g.x1 + 16, hh = g.y2 - y + 6;
                var lbl = (LNAME[g.loc] || g.loc) + ' · ' + g.n + ' ' + T.dev, lw = Math.min(w - 4, lbl.length * 7 + 16);
                boxes += '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + hh + '" rx="10" fill="' + c[0] + '" fill-opacity=".75" stroke="' + c[1] + '" stroke-width="1.2" stroke-dasharray="6 3"/>'
                    + '<rect x="' + (x + 8) + '" y="' + (y - 8) + '" width="' + lw + '" height="17" rx="8.5" fill="' + c[1] + '"/>'
                    + '<text x="' + (x + 16) + '" y="' + (y + 4) + '" font-size="10.5" font-weight="600" fill="#fff">' + esc(lbl) + '</text>';
            });
        }
        list.forEach(function (r, i) {
            var a = r.a, p = pos[a.id], st = a.virtual ? 'na' : stateOf(a), pp = null;
            if (FREE) {
                pp = (r.pid !== null && r.pid !== undefined) ? pos[r.pid] : null;
                if (pp) { var el = elbow(pp, p, 0, true);
                    lines += '<path d="' + el.d + '" fill="none" stroke="' + (st === 'err' ? '#b91c1c' : cab(r)) + '" stroke-width="' + (st === 'err' ? 2 : (CAB_ON && r.pid > 0 ? 1.8 : 1.2)) + '"' + (st === 'err' ? ' stroke-dasharray="5 4"' : '') + '/>' + hitPath(el.d, 'main', a.id, byId[a.parent] && r.pid === a.parent);
                    if (plabel(a.port, a.own_port)) lines += '<text x="' + el.lx + '" y="' + el.ly + '" font-size="10" fill="' + (CAB_ON && r.pid > 0 ? cab(r) : '#64748b') + '" font-family="monospace">' + esc(plabel(a.port, a.own_port)) + '</text>'; }
                pp = null;
            } else if (r.d > 0 && !r.float) { for (var j = i - 1; j >= 0; j--) if (list[j].d === r.d - 1) { pp = pos[list[j].a.id]; break; } }
            if (pp) { var x1 = pp.x + 18, y1 = pp.y + pp.h, y2 = p.y + NH / 2; lines += '<path d="M' + x1 + ',' + y1 + ' V' + y2 + ' H' + p.x + '" fill="none" stroke="' + (st === 'err' ? '#b91c1c' : cab(r)) + '" stroke-width="' + (st === 'err' ? 2 : (CAB_ON && r.pid > 0 ? 1.8 : 1.2)) + '"' + (st === 'err' ? ' stroke-dasharray="5 4"' : '') + '/>' + hitPath('M' + x1 + ',' + y1 + ' V' + y2 + ' H' + p.x, 'main', a.id, byId[a.parent] && r.pid === a.parent);
                if (plabel(a.port, a.own_port)) lines += '<text x="' + (x1 + 6) + '" y="' + (y2 - 4) + '" font-size="10" fill="' + (CAB_ON && r.pid > 0 ? cab(r) : '#64748b') + '" font-family="monospace">' + esc(plabel(a.port, a.own_port)) + '</text>'; }
            var c = COL[st], subs = a.virtual ? [] : (p.ips.length ? p.ips : [T.noIp + ' · ' + (st === 'err' ? T.suspect : T.inferred)]), sub = subs.length, nm = a.name.length > 22 ? a.name.slice(0, 21) + '…' : a.name;
            var bt = (!a.virtual && a.is_net) ? (a.brand || '').trim() : ''; if (bt.length > 30) bt = bt.slice(0, 29) + '…';
            nodes += '<g class="node" data-id="' + a.id + '" tabindex="0" role="button" style="cursor:' + (a.virtual ? 'default' : 'pointer') + '"><rect x="' + p.x + '" y="' + p.y + '" width="' + NW + '" height="' + p.h + '" rx="8" fill="' + c[0] + '" stroke="' + c[1] + '" stroke-width="1.5"' + (a.virtual || r.float ? ' stroke-dasharray="4 3"' : '') + '/>'
                + (CAB[a.id] ? '<rect x="' + (p.x + 3) + '" y="' + (p.y + 6) + '" width="4" height="' + (p.h - 12) + '" rx="2" fill="' + CAB[a.id] + '"/>' : '')
                + '<text x="' + (p.x + 10) + '" y="' + (p.y + (sub ? 17 : 25)) + '" font-size="12" font-weight="600" fill="#1e293b">' + esc(nm) + '</text>'
                + subs.map(function (t, n) { return '<text x="' + (p.x + 10) + '" y="' + (p.y + 32 + n * 14) + '" font-size="10.5" fill="#64748b" font-family="monospace">' + esc(t.length > 28 ? t.slice(0, 27) + '…' : t) + '</text>'; }).join('')
                + (bt ? '<text x="' + (p.x + 10) + '" y="' + (p.y + 33 + Math.max(1, subs.length) * 14) + '" font-size="10.5" fill="#4338ca" font-weight="500">' + esc(bt) + '</text>' : '') + '</g>';
        });
        // Koneksi tambahan: lengkung putus-putus biru di sisi kanan kedua kotak.
        var pairSeen = {};
        EXTRA.forEach(function (l, k) {
            var A = pos[l.a], B = pos[l.b]; if (!A || !B) return;
            var pk = Math.min(l.a, l.b) + '-' + Math.max(l.a, l.b), pi = pairSeen[pk] = (pairSeen[pk] === undefined ? 0 : pairSeen[pk] + 1);   // kabel ke-2, ke-3 antar perangkat yang sama digeser
            if (FREE) {
                // Lengkung putus-putus seperti tampilan awal: bila bertumpuk, melengkung di sisi kanan;
                // bila berjauhan ke samping, lengkung S dari sisi yang saling berhadapan.
                var o2 = pi * 10 - (pi ? 4 : 0), ay2 = A.y + Math.min(A.h, NH) / 2 + o2, by2 = B.y + Math.min(B.h, NH) / 2 + o2, x1, x2, d;
                if (B.x >= A.x + NW + 20 || A.x >= B.x + NW + 20) {
                    var r2 = B.x > A.x; x1 = r2 ? A.x + NW : A.x; x2 = r2 ? B.x : B.x + NW;
                    var mx2 = (x1 + x2) / 2;
                    d = 'M' + x1 + ',' + ay2 + ' C' + mx2 + ',' + ay2 + ' ' + mx2 + ',' + by2 + ' ' + x2 + ',' + by2;
                } else {
                    x1 = A.x + NW; x2 = B.x + NW;
                    var X2 = Math.max(A.x, B.x) + NW + 40 + (k % 12) * 14;
                    d = 'M' + x1 + ',' + ay2 + ' C' + X2 + ',' + ay2 + ' ' + X2 + ',' + by2 + ' ' + x2 + ',' + by2;
                }
                lines += '<path d="' + d + '" fill="none" stroke="#2563eb" stroke-width="1.6" stroke-dasharray="6 4"/>' + hitPath(d, 'extra', l.id, 1);
                // label port di luar kotak, di sisi tempat garis keluar (kiri kotak = ditulis ke kiri)
                var ax2 = x1 === A.x ? x1 - 4 - String(l.port_a || '').length * 6 : x1 + 4, bx2 = x2 === B.x ? x2 - 4 - String(l.port_b || '').length * 6 : x2 + 4;
                if (l.port_a) lines += '<text x="' + ax2 + '" y="' + (ay2 - 4) + '" font-size="10" fill="#2563eb" font-family="monospace">' + esc(l.port_a) + '</text>';
                if (l.port_b) lines += '<text x="' + bx2 + '" y="' + (by2 - 4) + '" font-size="10" fill="#2563eb" font-family="monospace">' + esc(l.port_b) + '</text>';
                return;
            }
            var off = pi * 10 - (pi ? 4 : 0), ay = A.y + A.h / 2 + off, by = B.y + B.h / 2 + off, X = Math.max(A.x, B.x) + NW + 40 + k * 14;
            lines += '<path d="M' + (A.x + NW) + ',' + ay + ' C' + X + ',' + ay + ' ' + X + ',' + by + ' ' + (B.x + NW) + ',' + by + '" fill="none" stroke="#2563eb" stroke-width="1.6" stroke-dasharray="6 4"/>' + hitPath('M' + (A.x + NW) + ',' + ay + ' C' + X + ',' + ay + ' ' + X + ',' + by + ' ' + (B.x + NW) + ',' + by, 'extra', l.id, 1);
            if (l.port_a) lines += '<text x="' + (A.x + NW + 4) + '" y="' + (ay - 4) + '" font-size="10" fill="#2563eb" font-family="monospace">' + esc(l.port_a) + '</text>';
            if (l.port_b) lines += '<text x="' + (B.x + NW + 4) + '" y="' + (by - 4) + '" font-size="10" fill="#2563eb" font-family="monospace">' + esc(l.port_b) + '</text>';
        });
        POSG = pos; LISTG = list.map(function (r) { return r.a.id; }); topo.classList.toggle('arr', EDIT);
        topo.innerHTML = '<svg width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '" role="img">' + boxes + lines + nodes + '</svg>';
        [].forEach.call(topo.querySelectorAll('.lk-hit'), function (h) { h.onclick = function (e) { e.stopPropagation(); if (EDIT || CONN) return; linkDialog(h.dataset.lk, +h.dataset.id); }; });
        [].forEach.call(topo.querySelectorAll('.node'), function (n) { if (EDIT) { n.style.cursor = 'grab'; n.onpointerdown = function (e) { startDrag(e, +n.dataset.id); }; } var a = byId[n.dataset.id]; if (!a) return; var go = function () { info(a); }; n.onclick = function () {
                if (CONN) { var id = +n.dataset.id; if (id < 0) return; if (!CONN_A) { CONN_A = id; connTxt(); renderTopo(); topoSearch(false); } else if (id === CONN_A) { CONN_A = null; connTxt(); renderTopo(); topoSearch(false); } else connDialog(CONN_A, id); return; }
                if (!EDIT) go();
            };
            if (CONN && CONN_A === +n.dataset.id) n.classList.add('conn-a'); n.onkeydown = function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } }; });
    }
    function info(a) {
        var kids = descendants(a.id), p = byId[a.parent], st = stateOf(a);
        document.getElementById('nodeInfo').innerHTML = '<div class="flex flex-wrap items-center gap-2 mb-2"><b class="text-slate-800">' + esc(a.name) + '</b>' + badge(st) + '</div>'
            + '<dl class="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1"><dt class="text-slate-500">No. aset</dt><dd>' + esc(a.number) + '</dd><dt class="text-slate-500">Jenis</dt><dd>' + esc(a.type) + '</dd>' + (a.is_net && (a.brand || '').trim() ? '<dt class="text-slate-500">Brand / Type</dt><dd>' + esc(a.brand) + '</dd>' : '') + '<dt class="text-slate-500">Lokasi</dt><dd>' + esc(a.loc || '-') + '</dd><dt class="text-slate-500">IP</dt><dd class="font-mono text-xs">' + esc(a.ip || '-') + (a.ips && a.ips.length > 1 ? '<div class="text-slate-500">' + esc(a.ips.join(', ')) + '</div>' : '') + '</dd>'
            + '<dt class="text-slate-500">' + esc(T.connected) + '</dt><dd>' + (p ? esc(p.name) + (plabel(a.port, a.own_port) ? ' (' + esc(plabel(a.port, a.own_port)) + ')' : '') : '-') + '</dd>'
            + (a.ip ? '<dt class="text-slate-500">' + esc(T.result) + '</dt><dd>' + (a.state ? (a.state === 'err' ? esc(a.detail || T.err) : a.ms + ' ms, ' + esc(T.loss) + ' ' + a.loss + '%') + ' · ' + hm(a.checked_at) : '-') + '</dd>' : '')
            + (function () { var ex = EXTRA.filter(function (l) { return l.a === a.id || l.b === a.id; }).map(function (l) { var o = byId[l.a === a.id ? l.b : l.a]; var mine = l.a === a.id, lb = plabel(mine ? l.port_b : l.port_a, mine ? l.port_a : l.port_b); return o ? esc(o.name) + (lb ? ' <span class="text-slate-400">(' + esc(lb) + ')</span>' : '') : ''; }).filter(Boolean);
                return ex.length ? '<dt class="text-slate-500">' + esc(T.extra) + '</dt><dd class="text-blue-700">' + ex.join('; ') + '</dd>' : ''; })()
            + '<dt class="text-slate-500">' + esc(T.below) + '</dt><dd>' + (kids.length ? kids.length + ' (' + kids.filter(function (k) { return k.state === 'err'; }).length + ' ' + esc(T.err.toLowerCase()) + ')' : '-') + '</dd></dl>'
            // Kelola koneksi langsung dari sini: lepas koneksi utama, hapus koneksi tambahan, hubungkan ke perangkat lain.
            + '<div class="mt-3 pt-3 border-t flex flex-wrap items-center gap-2">'
            + '<button type="button" data-conn-start class="inline-flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-3 py-1.5 text-xs font-semibold">&#128279; ' + esc(T.connStart) + '</button>'
            + (p ? '<button type="button" data-unlink class="border border-slate-300 hover:bg-slate-50 rounded-lg px-3 py-1.5 text-xs">' + esc(T.unlink) + ' ' + esc(p.name) + '</button>' : '')
            + EXTRA.filter(function (l) { return l.a === a.id || l.b === a.id; }).map(function (l) { var o = byId[l.a === a.id ? l.b : l.a]; return o ? '<button type="button" data-xdel="' + l.id + '" class="border border-red-200 text-red-700 hover:bg-red-50 rounded-lg px-3 py-1.5 text-xs">' + esc(T.delExtra) + ' ' + esc(o.name) + ' (' + esc((l.a === a.id ? l.port_a : l.port_b) || '-') + ')</button>' : ''; }).join('')
            + '</div>';
        var box = document.getElementById('nodeInfo');
        box.dataset.id = a.id;
        box.insertAdjacentHTML('beforeend', portMap(a));
        [].forEach.call(box.querySelectorAll('[data-pm]'), function (b) { b.onclick = function () { var d = byId[b.dataset.pm]; if (d) { info(d); var n = topo.querySelector('.node[data-id="' + d.id + '"]'); if (n) { n.scrollIntoView({block: 'center', inline: 'center'}); n.classList.add('dragging'); setTimeout(function () { n.classList.remove('dragging'); }, 900); } } }; });
        box.querySelector('[data-conn-start]').onclick = function () { setConnect(true, a.id); topo.scrollIntoView({block: 'start'}); };
        var ul = box.querySelector('[data-unlink]');
        if (ul) ul.onclick = function () { if (!confirm(T.unlinkQ.replace('%s', a.name).replace('%s', p.name))) return; netAction({action: 'topo_unlink', id: a.id}, T.unlinked).then(function (ok) { if (ok) info(byId[a.id]); }); };
        [].forEach.call(box.querySelectorAll('[data-xdel]'), function (b) { b.onclick = function () { if (!confirm(T.delExtraQ)) return; netAction({action: 'topo_extra_del', id: +b.dataset.xdel}, T.extraDeleted).then(function (ok) { if (ok) info(byId[a.id]); }); }; });
    }
    // Cari di topologi: kotak yang cocok diberi bingkai biru tebal, yang lain diredupkan, lalu digulir ke hasil pertama.
    function topoSearch(scroll) {
        var q = (val('tQ') || '').toLowerCase().trim(), n = 0, first = null;
        [].forEach.call(topo.querySelectorAll('g.node'), function (g) {
            var a = byId[g.dataset.id], r = g.querySelector('rect');
            if (!r.dataset.st) { r.dataset.st = r.getAttribute('stroke'); r.dataset.sw = r.getAttribute('stroke-width'); }
            var hit = !!(q && a && (a.name + ' ' + a.number + ' ' + a.ip + ' ' + (a.ips || []).join(' ') + ' ' + a.type + ' ' + a.loc + ' ' + (a.brand || '')).toLowerCase().indexOf(q) >= 0);
            r.setAttribute('stroke', hit ? '#2563eb' : r.dataset.st); r.setAttribute('stroke-width', hit ? '3.5' : r.dataset.sw);
            g.style.opacity = q && !hit ? '0.35' : '';
            if (hit) { n++; if (!first) first = g; }
        });
        document.getElementById('tQn').textContent = q ? (n ? n + ' ditemukan' : 'tidak ditemukan') : '';
        if (first && scroll) { first.scrollIntoView({block: 'center', inline: 'center', behavior: 'smooth'}); info(byId[first.dataset.id]); }
    }
    if (topo) {
        document.getElementById('tLoc').onchange = function () { renderTopo(); topoSearch(false); };
        document.getElementById('tGroup').onchange = function () { renderTopo(); topoSearch(false); };
        document.getElementById('tCable').onchange = function () { renderTopo(); topoSearch(false); };
        document.getElementById('tArrange').onclick = function () { setArrange(!EDIT); };
        document.getElementById('tConnect').onclick = function () { setConnect(!CONN); };
        document.getElementById('btnTopoPng').onclick = topoPng;
        renderLog();
        document.getElementById('tConnOff').onclick = function () { setConnect(false); };
        document.getElementById('tArrSave').onclick = function () {
            if (!DIRTY) { toast(T.orderSaved); return; }
            var out = {}; Object.keys(XY).forEach(function (k) { out[k] = [XY[k].x, XY[k].y]; });
            post({action: 'topo_pos', pos: JSON.stringify(out)}).then(function () {
                XY0 = {}; Object.keys(XY).forEach(function (k) { XY0[k] = {x: XY[k].x, y: XY[k].y}; });
                setDirty(false); toast(T.orderSaved);
            }).catch(function (e) { toast(e.message, true); });
        };
        document.getElementById('tArrCancel').onclick = function () {
            if (DIRTY && !confirm(T.orderDiscard)) return;
            XY = {}; Object.keys(XY0).forEach(function (k) { XY[k] = {x: XY0[k].x, y: XY0[k].y}; });
            setDirty(false); setArrange(false);
        };
        document.getElementById('tArrReset').onclick = function () {
            if (!confirm(T.orderResetQ)) return;
            post({action: 'topo_pos_reset'}).then(function () {
                XY = {}; XY0 = {}; setDirty(false);
                renderTopo(); topoSearch(false); toast(T.orderReset);
            }).catch(function (e) { toast(e.message, true); });
        };
        window.addEventListener('beforeunload', function (e) { if (DIRTY) { e.preventDefault(); e.returnValue = ''; } });
        var tq = document.getElementById('tQ'), tqT = null;
        tq.addEventListener('input', function () { clearTimeout(tqT); tqT = setTimeout(function () { topoSearch(true); }, 250); });
        tq.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); topoSearch(true); } });
        renderTopo();
        var topoUrl = function (pdf) { return 'network_topo_print.php?' + new URLSearchParams({loc: val('tLoc'), net: val('pNet'), orient: val('pOrient'), grp: document.getElementById('tGroup').checked ? '1' : '', cable: document.getElementById('tCable').checked ? '1' : ''}).toString() + (pdf ? '&out=pdf' : ''); };
        document.getElementById('btnTopoPrint').onclick = function () { cfg.printNote(); };
        document.getElementById('btnTopoPdf').onclick = function () { cfg.printNote(); };
    }

    /* ---------- Scan ---------- */
    var sBtn = document.getElementById('btnScan');
    if (sBtn) sBtn.onclick = function () {
        var net = val('sNet'), pre = net.split('.').slice(0, 3).join('.') + '.', found = {}, from = 1, CH = 32;
        sBtn.disabled = true; document.getElementById('sProg').classList.remove('hidden'); document.getElementById('sSum').innerHTML = '';
        (function next() {
            if (from > 254) {
                document.getElementById('sTxt').textContent = T.reading;
                post({action: 'scan_finish', subnet: net, found: JSON.stringify(found)}).then(showScan).catch(function (e) { toast(T.failed + ': ' + e.message, true); }).then(function () { sBtn.disabled = false; });
                return;
            }
            var to = Math.min(254, from + CH - 1);
            document.getElementById('sTxt').textContent = T.scanning + ' ' + pre + from + '–' + to;
            post({action: 'scan_chunk', subnet: net, from: from, to: to}).then(function (d) { if (d.found) Object.keys(d.found).forEach(function (ip) { found[ip] = d.found[ip]; }); })
                .catch(function (e) { toast(T.failed + ': ' + e.message, true); }).then(function () { document.getElementById('sBar').style.width = (to / 254 * 100) + '%'; from = to + 1; next(); });
        })();
    };
    function showScan(d, old) {
        if (!d || (!old && !d.ok)) { toast((d && d.error) || T.failed, true); return; }
        var un = d.rows.filter(function (r) { return !r.asset_id; });
        if (!old) document.getElementById('sTxt').textContent = T.done + ': ' + d.rows.length + ' ' + T.active + ' · ' + d.subnet;
        document.getElementById('sSum').innerHTML = '<div class="mb-3 text-sm rounded-lg px-4 py-3 ' + (un.length ? 'bg-amber-50 border border-amber-200 text-amber-900' : 'bg-blue-50 border border-blue-100 text-slate-700') + '">' + (old ? esc(T.lastScan) + ' (' + esc(d.scanned_at) + '): ' : '') + '<b>' + d.rows.length + ' ' + esc(T.active) + ', ' + un.length + ' ' + esc(T.notReg) + '.</b>'
            + (d.missing && d.missing.length ? ' ' + esc(T.missing) + ': ' + esc(d.missing.join(', ')) + '.' : '') + '</div>';
        document.getElementById('sRows').innerHTML = d.rows.map(function (r) {
            return '<tr class="border-t ' + (r.asset_id ? '' : 'bg-amber-50/60') + '"><td class="px-3 py-2 font-mono text-xs">' + esc(r.ip) + '</td><td class="px-3 py-2 font-mono text-xs">' + esc(r.mac || '-') + '</td><td class="px-3 py-2">' + esc(r.vendor || '-') + '</td><td class="px-3 py-2 text-xs">' + esc(r.host || '-') + '</td><td class="px-3 py-2 text-right tabular-nums">' + r.ms + ' ms</td>'
                + '<td class="px-3 py-2">' + (r.asset_id ? '<span class="text-xs font-semibold text-green-700">' + esc(T.registered) + '</span> ' + esc(r.asset_name) : '<span class="text-xs font-semibold text-amber-700">' + esc(T.unregistered) + '</span> <a class="ml-2 text-xs text-blue-600 hover:underline" href="#/assets">' + esc(T.register) + ' &rarr;</a>') + '</td></tr>';
        }).join('') || '<tr><td colspan="6" class="px-3 py-6 text-center text-slate-500">-</td></tr>';
    }
    var sNet = document.getElementById('sNet');
    if (sNet) { var showSaved = function () { if (SAVED[sNet.value]) showScan(SAVED[sNet.value], true); }; sNet.onchange = function () { document.getElementById('sSum').innerHTML = ''; document.getElementById('sRows').innerHTML = ''; showSaved(); }; showSaved(); }

  }
  const TPL = { topo: `@@SUSPECTS@@

<div class="bg-white rounded-xl shadow-sm p-3 mb-3 flex flex-wrap items-center gap-3 text-sm">
    <label class="flex items-center gap-2">Lokasi        <select id="tLoc" class="border border-slate-300 rounded-lg px-2 py-1.5">@@LOCOPTS@@</select></label>
    <label class="flex items-center gap-2 cursor-pointer"><input type="checkbox" id="tGroup" checked class="rounded"> Kotak per lokasi</label>
    <label class="flex items-center gap-2 cursor-pointer"><input type="checkbox" id="tCable" checked class="rounded"> Warna kabel per switch / router</label>
    <button type="button" id="tConnect" class="inline-flex items-center gap-1 border border-slate-300 rounded-lg px-3 py-1.5 hover:bg-slate-50">&#128279; Hubungkan</button>
    <button type="button" id="tArrange" class="inline-flex items-center gap-1 border border-slate-300 rounded-lg px-3 py-1.5 hover:bg-slate-50">&#10021; Geser bebas</button>
    <label class="flex items-center gap-2"><input type="search" id="tQ" placeholder="Cari perangkat / aset…" class="border border-slate-300 rounded-lg px-3 py-1.5 w-56"><span id="tQn" class="text-xs text-slate-500"></span></label>
    <span class="flex flex-wrap gap-2 text-xs"><span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap bg-green-100 text-green-700"><span class="w-1.5 h-1.5 rounded-full bg-current"></span>Normal</span><span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap bg-amber-100 text-amber-700"><span class="w-1.5 h-1.5 rounded-full bg-current"></span>Lambat</span><span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700"><span class="w-1.5 h-1.5 rounded-full bg-current"></span>Mati / diduga mati</span><span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600"><span class="w-1.5 h-1.5 rounded-full bg-current"></span>Tanpa IP / belum dicek</span><span class="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold text-blue-700"><svg width="22" height="6"><line x1="0" y1="3" x2="22" y2="3" stroke="#2563eb" stroke-width="2" stroke-dasharray="5 3"/></svg>Koneksi tambahan</span><span class="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold text-slate-600"><svg width="18" height="12"><rect x="1" y="1" width="16" height="10" rx="3" fill="#fff" stroke="#64748b" stroke-width="1.2" stroke-dasharray="3 2"/></svg>Belum dihubungkan (ditaruh di kotak lokasinya)</span></span>
</div>
<style>#topo.arr .node { cursor: grab !important; touch-action: none; user-select: none; } #topo .lk-hit { cursor: pointer; pointer-events: stroke; } #topo .lk-hit:hover { stroke: rgba(79, 70, 229, .28); } #topo .node.conn-a > rect:first-child { stroke: #4f46e5 !important; stroke-width: 3.5 !important; } #topo .node.dragging > rect:first-child { stroke: #f59e0b !important; stroke-width: 3 !important; } #topo .node.dragging { filter: drop-shadow(0 6px 10px rgba(15,23,42,.3)); } #topo.arr svg { background-image: radial-gradient(#cbd5e1 1px, transparent 1px); background-size: 20px 20px; }</style>
<div id="tConnBar" style="top: calc(-1 * var(--main-pad, 0px));" class="hidden sticky z-20 bg-indigo-50 border border-indigo-300 rounded-xl shadow-md p-3 mb-3 flex flex-wrap items-center gap-2 text-sm">
    <span class="font-semibold text-indigo-800">&#128279; Mode hubungkan</span>
    <span id="tConnTxt" class="text-indigo-800"></span>
    <button type="button" id="tConnOff" class="ml-auto border border-slate-300 bg-white rounded-lg px-3 py-1.5">Selesai</button>
</div>
<div id="tArrBar" style="top: calc(-1 * var(--main-pad, 0px));" class="hidden sticky z-20 bg-amber-50 border border-amber-300 rounded-xl shadow-md p-3 mb-3 flex flex-wrap items-center gap-2 text-sm">
    <span class="font-semibold text-amber-800">&#10021; Mode geser bebas</span>
    <span class="text-amber-800">Tahan klik pada kotak lalu geser ke mana saja; garis koneksi ikut menyesuaikan. Tahan Shift saat menggeser untuk ikut memindahkan seluruh cabang di bawahnya.</span>
    <span id="tArrDirty" class="hidden text-xs font-semibold text-amber-700">&#9679; Belum disimpan</span>
    <span class="ml-auto flex flex-wrap gap-2">
        <button type="button" id="tArrSave" class="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-1.5 font-semibold">Simpan posisi</button>
        <button type="button" id="tArrCancel" class="border border-slate-300 bg-white rounded-lg px-3 py-1.5">Selesai / batal</button>
        <button type="button" id="tArrReset" class="border border-red-300 text-red-700 bg-white rounded-lg px-3 py-1.5">Kembali ke susunan otomatis</button>
    </span>
</div>
<div class="bg-white rounded-xl shadow-sm p-3 mb-3 flex flex-wrap items-end gap-3 text-sm">
    <label class="flex flex-col gap-1"><span class="text-xs text-slate-500">Isi cetakan</span>
        <select id="pNet" class="border border-slate-300 rounded-lg px-2 py-1.5"><option value="0">Semua aset ber-IP &amp; perangkat jaringan</option><option value="1">Perangkat jaringan saja (lebih ringkas)</option></select></label>
    <label class="flex flex-col gap-1"><span class="text-xs text-slate-500">Kertas</span>
        <select id="pOrient" class="border border-slate-300 rounded-lg px-2 py-1.5"><option value="portrait">A4 tegak</option><option value="landscape">A4 mendatar</option></select></label>
    <button type="button" id="btnTopoPrint" class="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 font-medium"><svg class="shrink-0 w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8" rx="1"/></svg> Cetak</button>
    <button type="button" id="btnTopoPdf" class="inline-flex items-center gap-2 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg px-4 py-2 font-medium"><svg class="shrink-0 w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/><path d="M12 15V3"/></svg> Simpan PDF</button>
    <button type="button" id="btnTopoPng" class="inline-flex items-center gap-2 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg px-4 py-2 font-medium"><svg class="shrink-0 w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/><path d="M12 15V3"/></svg> Simpan gambar (PNG)</button>
    <span class="text-xs text-slate-500 pb-2">Memakai kop surat &amp; filter lokasi di atas. Topologi panjang otomatis dipotong per halaman.</span>
</div>
<div id="topo" class="bg-slate-50 border border-slate-200 rounded-xl overflow-x-auto mb-3"></div>
<div id="nodeInfo" class="bg-white rounded-xl shadow-sm p-4 text-sm text-slate-600">Klik kotak perangkat untuk melihat detail &amp; peta port-nya. Klik garis koneksi untuk mengubah port atau melepasnya.</div>
<div id="netLog" class="bg-white rounded-xl shadow-sm p-4 text-sm mt-3"></div>
<p class="text-xs text-slate-500 mt-2">Topologi disusun otomatis dari kolom &quot;Terhubung ke&quot; (tab Data koneksi). Aset yang belum dihubungkan tampil di bawah &quot;Belum dihubungkan&quot;. Switch biasa (tanpa IP) berwarna merah bila semua aset di bawahnya mati pada pengecekan terakhir.</p>

`, check: `@@SUSPECTS@@

@@STATS@@

<div class="bg-white rounded-xl shadow-sm p-3 mb-3 flex flex-wrap items-end gap-3 text-sm">
    <label class="flex flex-col gap-1"><span class="text-xs text-slate-500">Jenis</span>
        <select id="fType" class="border border-slate-300 rounded-lg px-2 py-1.5">@@TYPEOPTS@@</select></label>
    <label class="flex flex-col gap-1"><span class="text-xs text-slate-500">Lokasi</span>
        <select id="fLoc" class="border border-slate-300 rounded-lg px-2 py-1.5">@@LOCOPTS@@</select></label>
    <label class="flex flex-col gap-1"><span class="text-xs text-slate-500">Status</span>
        <select id="fState" class="border border-slate-300 rounded-lg px-2 py-1.5"><option value="">Semua</option><option value="err">Mati</option><option value="warn">Lambat</option><option value="ok">Normal</option><option value="na">Belum dicek</option></select></label>
    <label class="flex flex-col gap-1 flex-1 min-w-[160px]"><span class="text-xs text-slate-500">Cari</span>
        <input id="fQ" type="search" placeholder="Nama, no aset, IP" class="border border-slate-300 rounded-lg px-2 py-1.5"></label>
    <button id="btnCheck" class="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 font-medium disabled:opacity-50"><svg class="shrink-0 w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/></svg> Cek sekarang</button>
    <label class="flex items-center gap-2 pb-2"><input type="checkbox" id="autoPage" class="w-4 h-4"> Pantau selama halaman dibuka (tiap 1 menit)</label>
</div>
<div id="prog" class="hidden mb-3 flex items-center gap-3 text-sm text-slate-600"><span id="progTxt"></span><div class="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden"><div id="progBar" class="h-full bg-blue-600 transition-all" style="width:0"></div></div></div>

<div class="bg-white rounded-xl shadow-sm overflow-x-auto mb-4">
    <table class="w-full text-sm">
        <thead class="bg-slate-50 text-slate-500 text-xs"><tr>
            <th class="px-3 py-2 w-8"><input type="checkbox" id="chkAll" class="w-4 h-4" title="Pilih semua"></th>
            <th class="text-left px-3 py-2">Aset</th><th class="text-left px-3 py-2">Jenis</th>
            <th class="text-left px-3 py-2">Lokasi</th><th class="text-left px-3 py-2">IP</th>
            <th class="text-left px-3 py-2">Terhubung ke</th><th class="text-left px-3 py-2">Status</th>
            <th class="text-right px-3 py-2">Ping</th><th class="text-right px-3 py-2">Paket hilang</th>
            <th class="text-left px-3 py-2">Dicek</th><th class="px-3 py-2"></th>
        </tr></thead>
        <tbody id="netRows"></tbody>
    </table>
</div>
<p class="text-xs text-slate-500 mb-4">Centang beberapa aset untuk mengecek sebagian saja; tanpa centang, semua aset yang tampil ikut dicek. Lambat = ping rata-rata ≥ 100 ms atau paket hilang ≥ 5%. Bila ping diblokir firewall, sistem mencoba port TCP (PC 445/3389, printer 9100, CCTV/NVR 80/554).</p>

<h2 class="font-semibold text-slate-800 mb-2">Riwayat pengecekan</h2>
<div class="bg-white rounded-xl shadow-sm overflow-x-auto"><table class="w-full text-sm">
    <thead class="bg-slate-50 text-slate-500 text-xs"><tr><th class="text-left px-3 py-2">Waktu</th><th class="text-left px-3 py-2">Oleh</th><th class="text-right px-3 py-2">Dicek</th><th class="text-right px-3 py-2">Normal</th><th class="text-right px-3 py-2">Lambat</th><th class="text-right px-3 py-2">Mati</th><th class="text-left px-3 py-2">Bermasalah</th></tr></thead>
    <tbody>@@HIST@@</tbody>
</table></div>

`, scan: `
<div class="bg-white rounded-xl shadow-sm p-3 mb-3 flex flex-wrap items-end gap-3 text-sm">
    <label class="flex flex-col gap-1"><span class="text-xs text-slate-500">Subnet</span>
        <select id="sNet" class="border border-slate-300 rounded-lg px-2 py-1.5 font-mono">@@NETOPTS@@</select></label>
    <button id="btnScan" class="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 font-medium disabled:opacity-50"><svg class="shrink-0 w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg> Mulai scan</button>
    <span class="text-xs text-slate-500">Ping 1 paket ke 254 alamat, lalu membaca tabel ARP server. Demo: hasil scan disimulasikan.</span>
</div>
<div id="sProg" class="hidden mb-3 flex items-center gap-3 text-sm text-slate-600"><span id="sTxt"></span><div class="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden"><div id="sBar" class="h-full bg-blue-600 transition-all" style="width:0"></div></div></div>
<div id="sSum"></div>
<div class="bg-white rounded-xl shadow-sm overflow-x-auto"><table class="w-full text-sm">
    <thead class="bg-slate-50 text-slate-500 text-xs"><tr><th class="text-left px-3 py-2">IP</th><th class="text-left px-3 py-2">MAC</th><th class="text-left px-3 py-2">Perkiraan merek</th><th class="text-left px-3 py-2">Nama host</th><th class="text-right px-3 py-2">Ping</th><th class="text-left px-3 py-2">Di menu Aset</th></tr></thead>
    <tbody id="sRows"><tr><td colspan="6" class="px-3 py-6 text-center text-slate-500">Pilih subnet lalu klik Mulai scan. Hasil scan terakhir tiap subnet disimpan.</td></tr></tbody>
</table></div>
<p class="text-xs text-slate-500 mt-1">MAC hanya terbaca untuk perangkat di subnet yang sama dengan server; subnet lain dilewati router sehingga MAC-nya tidak terlihat.</p>

` };
  const optList = (arr) => '<option value="">Semua</option>' + arr.map((x) => `<option>${esc(x)}</option>`).join('');
  function netTabs() {
    return `<div class="flex gap-1 overflow-x-auto border-b border-slate-200 mb-4 text-sm">${NET_TABS.map(([k, l]) => `<button type="button" data-ntab="${k}" class="px-4 py-2.5 whitespace-nowrap border-b-2 ${netUi.tab === k ? 'border-blue-600 text-blue-700 font-semibold' : 'border-transparent text-slate-500 hover:text-slate-700'}">${l}</button>`).join('')}</div>`;
  }
  function netCheckPage() {
    const A = netAssets().filter((a) => a.ip), cnt = (s) => A.filter((a) => a.state === s).length, last = N().checks[0];
    const card = (l, v, cls) => `<div class="bg-white rounded-xl shadow-sm p-4"><p class="text-xs text-slate-500">${l}</p><p class="text-2xl font-semibold tabular-nums ${cls}">${v}</p></div>`;
    const stats = `<div class="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-4">${card('Aset ber-IP', A.length, 'text-slate-800')}${card('Normal', cnt('ok'), 'text-green-700')}${card('Lambat', cnt('warn'), 'text-amber-600')}${card('Mati', cnt('err'), 'text-red-600')}${card('Cek terakhir', last ? last.at.slice(8, 10) + '/' + last.at.slice(5, 7) + ' ' + last.at.slice(11, 16) : '-', 'text-slate-800')}</div>`;
    const hist = N().checks.map((h) => `<tr class="border-t align-top"><td class="px-3 py-2 whitespace-nowrap tabular-nums">${esc(h.at.slice(0, 16))}</td><td class="px-3 py-2">${esc(h.by)}</td><td class="px-3 py-2 text-right tabular-nums">${h.n}</td><td class="px-3 py-2 text-right tabular-nums text-green-700">${h.ok}</td><td class="px-3 py-2 text-right tabular-nums text-amber-600">${h.warn}</td><td class="px-3 py-2 text-right tabular-nums text-red-600">${h.err}</td><td class="px-3 py-2 text-xs text-slate-600 whitespace-pre-line">${esc(h.detail)}</td></tr>`).join('') || '<tr><td colspan="7" class="px-3 py-6 text-center text-slate-400">Belum ada riwayat. Klik Cek sekarang.</td></tr>';
    const types = [...new Set(A.map((a) => a.type))].sort(), locs = [...new Set(A.map((a) => a.loc))].sort();
    return TPL.check.replace('@@SUSPECTS@@', suspectsHtml()).replace('@@STATS@@', stats).replace('@@TYPEOPTS@@', optList(types)).replace('@@LOCOPTS@@', optList(locs)).replace('@@HIST@@', hist);
  }
  function netTopoPage() {
    const locs = [...new Set(N().devices.map((a) => a.loc))].sort();
    return TPL.topo.replace('@@SUSPECTS@@', suspectsHtml()).replace('@@LOCOPTS@@', optList(locs));
  }
  function netScanPage() { return TPL.scan.replace('@@NETOPTS@@', N().subnets.map((s) => `<option>${esc(s)}</option>`).join('')); }
  // Data koneksi (versi demo, lebih ringkas dari aplikasi asli): pilih induk & port, koneksi tambahan.
  function netLinksPage() {
    const D = N().devices, nets = D.filter((d) => d.is_net), nameOf = (id) => (D.find((x) => x.id === id) || {}).name || '';
    const rows = D.map((d) => `<tr class="border-t"><td class="px-3 py-2"><b class="text-slate-800">${esc(d.name)}</b><div class="text-xs text-slate-500">${esc(d.type)} · ${esc(d.loc)}${d.ip ? ' · ' + esc(d.ip) : ''}</div></td>
      <td class="px-3 py-2"><select data-lpar="${d.id}" class="border border-slate-300 rounded-lg px-2 py-1.5 text-sm w-full min-w-[12rem]"><option value="">— paling atas / belum dihubungkan —</option>${nets.filter((n) => n.id !== d.id).map((n) => `<option value="${n.id}" ${d.parent === n.id ? 'selected' : ''}>${esc(n.name)}</option>`).join('')}</select></td>
      <td class="px-3 py-2"><input data-lport="${d.id}" value="${esc(d.port)}" placeholder="eth1" class="border border-slate-300 rounded-lg px-2 py-1.5 text-sm w-24 font-mono"></td>
      <td class="px-3 py-2"><input data-lown="${d.id}" value="${esc(d.own_port)}" placeholder="eth1" class="border border-slate-300 rounded-lg px-2 py-1.5 text-sm w-24 font-mono"></td></tr>`).join('');
    const ex = N().extra.map((l) => `<li class="flex items-center justify-between gap-2 border-t py-2"><span><b>${esc(nameOf(l.a))}</b> <span class="font-mono text-xs">${esc(l.port_a)}</span> ⇄ <b>${esc(nameOf(l.b))}</b> <span class="font-mono text-xs">${esc(l.port_b)}</span></span><button data-exdel="${l.id}" class="text-red-500 hover:text-red-700">${icon('trash')}</button></li>`).join('') || '<li class="text-slate-400 py-2">Belum ada.</li>';
    const opt = D.map((d) => `<option value="${d.id}">${esc(d.name)}</option>`).join('');
    return `${demoNote('Versi demo yang diringkas. Di aplikasi asli tersedia pencarian, pilih banyak + Terapkan, isi massal per lokasi, daftar port dengan keterangan "terpakai", dan import Excel perangkat jaringan.')}
<div class="bg-white rounded-xl shadow-sm p-4 mb-4"><h2 class="font-semibold text-slate-800 mb-2">Koneksi tambahan</h2><p class="text-xs text-slate-500 mb-2">Untuk perangkat yang tersambung ke lebih dari satu switch/router (mis. NVR dengan 2 LAN, uplink fiber). Digambar garis biru putus-putus di topologi.</p>
<ul class="text-sm mb-3">${ex}</ul>
<form id="exForm" class="flex flex-wrap items-end gap-2 text-sm"><select name="a" class="border border-slate-300 rounded-lg px-2 py-1.5">${opt}</select><input name="port_a" placeholder="port" class="border border-slate-300 rounded-lg px-2 py-1.5 w-24 font-mono"><span class="pb-2">⇄</span><select name="b" class="border border-slate-300 rounded-lg px-2 py-1.5">${opt}</select><input name="port_b" placeholder="port" class="border border-slate-300 rounded-lg px-2 py-1.5 w-24 font-mono"><button class="${btnPrimary}">${icon('plus')} Tambah</button></form></div>
<div class="bg-white rounded-xl shadow-sm overflow-x-auto"><div class="flex items-center justify-between px-4 py-3 border-b"><p class="font-semibold text-slate-700">Terhubung ke (koneksi utama)</p><button id="lkSave" class="${btnPrimary}">${icon('check')} Simpan</button></div>
<table class="w-full text-sm"><thead class="bg-slate-50 text-slate-500 text-xs"><tr><th class="text-left px-3 py-2">Perangkat / aset</th><th class="text-left px-3 py-2">Terhubung ke</th><th class="text-left px-3 py-2">Port di perangkat atas</th><th class="text-left px-3 py-2">Port di perangkat ini</th></tr></thead><tbody>${rows}</tbody></table></div>`;
  }
  PAGES.network = {
    render() {
      const body = { check: netCheckPage, topo: netTopoPage, scan: netScanPage, links: netLinksPage }[netUi.tab]();
      return netTabs() + (netUi.tab !== 'links' ? demoNote('Demo: ping dan scan disimulasikan di browser. Di aplikasi asli, server menjalankan ping & arp sungguhan hanya saat tombol ditekan.') : '') + body
        + '<div id="netToast" class="fixed right-4 bottom-4 z-50 flex flex-col gap-2 max-w-sm"></div>';
    },
    bind() {
      $$('[data-ntab]').forEach((b) => (b.onclick = () => { netUi.tab = b.dataset.ntab; render(); }));
      if (netUi.tab === 'links') {
        $('#lkSave').onclick = () => {
          const D = N().devices, kids = (id) => { const o = []; const st = [id]; while (st.length) { const c = st.pop(); D.forEach((k) => { if (k.parent === c) { o.push(k.id); st.push(k.id); } }); } return o; };
          let bad = '';
          $$('[data-lpar]').forEach((s) => { const d = D.find((x) => x.id === +s.dataset.lpar), p = s.value ? +s.value : null; if (p && kids(d.id).includes(p)) { bad = `${d.name}: sambungan melingkar ditolak.`; return; } d.parent = p; });
          $$('[data-lport]').forEach((i) => { D.find((x) => x.id === +i.dataset.lport).port = i.value.trim(); });
          $$('[data-lown]').forEach((i) => { D.find((x) => x.id === +i.dataset.lown).own_port = i.value.trim(); });
          save(); render(); toast(bad || 'Data koneksi disimpan.', !bad);
        };
        $('#exForm').onsubmit = (e) => { e.preventDefault(); const f = formData(e.target); if (f.a === f.b) { toast('Pilih dua perangkat yang berbeda.', false); return; }
          N().extra.push({ id: nextId(N().extra), a: +f.a, b: +f.b, port_a: f.port_a.trim(), port_b: f.port_b.trim() }); save(); render(); toast('Koneksi tambahan disimpan.'); };
        $$('[data-exdel]').forEach((b) => (b.onclick = () => { N().extra = N().extra.filter((x) => x.id !== +b.dataset.exdel); save(); render(); }));
        return;
      }
      netInit({
        assets: netAssets(), extra: N().extra.map((x) => Object.assign({}, x)), pos: Object.assign({}, N().pos), saved: N().scans, log: netLogOut(),
        post: netPost, reload: () => render(), printNote: () => toast('Cetak & Simpan PDF topologi (berkop surat) tersedia di aplikasi asli.'),
      });
    },
  };
  ADMIN_NAV.splice(ADMIN_NAV.findIndex((n) => n[0] === 'cctv') + 1, 0, ['network', 'network', 'Jaringan']);

  // ------------------------------------------------------------------
  render();
})();
