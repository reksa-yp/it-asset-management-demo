/*
 * Data contoh untuk DEMO. Semua nama, IP, dan nomor seri FIKTIF.
 * Data dibuat ulang setiap kali pengunjung menekan "Reset Data Demo".
 */
(function () {
  // Random dengan seed tetap -> data contoh selalu sama untuk semua pengunjung.
  let seed = 20260926;
  const rnd = () => ((seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648);
  const pick = (arr) => arr[Math.floor(rnd() * arr.length)];
  const int = (a, b) => a + Math.floor(rnd() * (b - a + 1));

  const pad = (n, l = 2) => String(n).padStart(l, '0');
  const today = new Date();
  const daysAgo = (d, h = 9, m = 0) => {
    const x = new Date(today);
    x.setDate(x.getDate() - d);
    x.setHours(h, m, 0, 0);
    return x.toISOString();
  };
  const dateOnly = (iso) => iso.slice(0, 10);

  const departments = ['IT', 'Finance', 'HRD', 'Produksi', 'Purchasing', 'Marketing', 'Gudang', 'Quality Control'];
  // Aturan singkatan sama dengan aplikasi asli (generateDeptAbbr)
  const abbrOf = (d) => { const w = d.split(/[\s/\-_]+/).filter(Boolean); if (w.length <= 1) return d.slice(0, d.length <= 5 ? d.length : 3).toUpperCase(); return w.map((x) => x[0]).join('').slice(0, 4).toUpperCase(); };
  const deptAbbr = Object.fromEntries(departments.map((d) => [d, abbrOf(d)]));

  const categories = [
    { id: 1, name: 'Desktop PC', abbr: 'PC', sort_order: 1 },
    { id: 2, name: 'Laptop', abbr: 'LT', sort_order: 2 },
    { id: 3, name: 'Printer', abbr: 'PRN', sort_order: 3 },
    { id: 4, name: 'Monitor', abbr: 'MN', sort_order: 4 },
    { id: 5, name: 'Aksesoris', abbr: 'AKS', sort_order: 5 },
    { id: 6, name: 'Tablet', abbr: 'TAB', sort_order: 6 },
  ];

  const people = [
    ['Admin Demo', 'admin', 'IT', 'admin'],
    ['Budi Santoso', 'budi', 'Finance', 'user'],
    ['Siti Rahmawati', 'siti', 'HRD', 'user'],
    ['Andi Pratama', 'andi', 'Produksi', 'user'],
    ['Dewi Lestari', 'dewi', 'Purchasing', 'user'],
    ['Rizky Hidayat', 'rizky', 'Marketing', 'user'],
    ['Fitri Handayani', 'fitri', 'Finance', 'user'],
    ['Agus Setiawan', 'agus', 'Gudang', 'user'],
    ['Nur Aisyah', 'aisyah', 'Quality Control', 'user'],
    ['Hendra Wijaya', 'hendra', 'Produksi', 'user'],
    ['Maya Sari', 'maya', 'Marketing', 'user'],
    ['Joko Susilo', 'joko', 'IT', 'admin'],
    ['Rina Kartika', 'rina', 'HRD', 'user'],
    ['Yusuf Maulana', 'yusuf', 'Purchasing', 'user'],
    ['User Demo', 'user', 'Finance', 'user'],
  ];
  const users = people.map((p, i) => ({
    id: i + 1,
    full_name: p[0],
    username: p[1],
    email: p[1] + '@contoh.co.id',
    department: p[2],
    role: p[3],
    is_active: 1,
    pc_username: p[3] === 'admin' ? '' : p[1],
    pc_password: p[3] === 'admin' ? '' : 'Demo#' + (1000 + i * 37),
    created_at: daysAgo(200 - i * 5),
  }));

  const cpus = ['Intel Core i3-10100', 'Intel Core i5-10400', 'Intel Core i5-12400', 'Intel Core i7-12700', 'AMD Ryzen 5 5600G', 'Intel Core i5-1135G7', 'AMD Ryzen 7 5700U'];
  const rams = ['4 GB', '8 GB', '8 GB', '16 GB', '16 GB', '32 GB'];
  const storages = ['SSD 256 GB', 'SSD 512 GB', 'SSD 512 GB', 'HDD 1 TB', 'SSD 1 TB'];
  const oses = ['Windows 10 Pro', 'Windows 11 Pro', 'Windows 11 Pro', 'Windows 10 Home'];
  const boards = { 'Desktop PC': ['ASUS PRIME H510M', 'Gigabyte B660M', 'MSI PRO H610M', 'Dell OptiPlex 3080'], 'Laptop': ['Lenovo ThinkPad E14', 'ASUS VivoBook 14', 'HP ProBook 440 G8', 'Acer Aspire 5', 'Dell Latitude 3420'], 'Printer': ['Epson L3210', 'Canon G2010', 'HP LaserJet M211dw', 'Brother HL-L2360D'], 'Monitor': ['LG 22MK430', 'Samsung S24R350', 'Dell E2220H', 'AOC 24B2XH'], 'Aksesoris': ['Logitech MK270', 'UPS APC BX650', 'Webcam Logitech C270', 'Scanner Epson DS-410'], 'Tablet': ['Samsung Galaxy Tab A8', 'Lenovo Tab M10', 'Samsung Galaxy Tab A9+'] };
  const softwarePool = [['Microsoft Office 2019', 'Original'], ['Microsoft Office 2021', 'Original'], ['Adobe Acrobat Reader', 'Original'], ['AutoCAD LT 2022', 'Original'], ['WinRAR', 'Belum Original'], ['Accurate 5', 'Original'], ['Google Chrome', 'Original'], ['Anydesk', 'Original']];

  const plan = [['Desktop PC', 14], ['Laptop', 12], ['Printer', 6], ['Monitor', 8], ['Aksesoris', 5], ['Tablet', 5]];
  const assets = [];
  const assetOwners = [];
  const seq = {};
  let id = 1;
  const usersNoAdmin = users.filter((u) => u.role === 'user');

  plan.forEach(([cat, count]) => {
    for (let i = 0; i < count; i++) {
      const catRow = categories.find((c) => c.name === cat);
      const isComputer = cat === 'Desktop PC' || cat === 'Laptop';
      const statusRoll = rnd();
      const status = statusRoll < 0.72 ? 'Digunakan' : statusRoll < 0.9 ? 'Stok' : 'Tidak Digunakan';
      const owner = status === 'Digunakan' ? (cat === 'Printer' ? null : pick(usersNoAdmin)) : null;
      const dept = owner ? owner.department : (status === 'Digunakan' ? pick(departments) : '');
      let number;
      if (cat === 'Tablet') {
        const line = 'LINE' + int(1, 3);
        const key = (deptAbbr[dept] || 'PRO') + line;
        seq[key] = (seq[key] || 0) + 1;
        number = `AST/${deptAbbr[dept] || 'PRO'}/${line}/${pad(seq[key], 3)}`;
      } else {
        seq[catRow.abbr] = (seq[catRow.abbr] || 0) + 1;
        number = `AST/${dept ? deptAbbr[dept] : 'STOK'}/${catRow.abbr}/${pad(seq[catRow.abbr], 3)}`;
      }
      const brand = pick(boards[cat]);
      const a = {
        id: id,
        asset_number: number,
        category: cat,
        device_name: isComputer ? (cat === 'Laptop' ? brand : 'PC-' + (dept ? deptAbbr[dept] : 'STK') + '-' + pad(i + 1)) : brand,
        department: cat === 'Tablet' && !dept ? 'Produksi' : dept,
        owner_email: owner ? owner.email : '',
        ip_address: isComputer || cat === 'Printer' || cat === 'Tablet' ? `192.168.10.${20 + id}` : '',
        hostname: isComputer ? ('WS-' + (dept ? deptAbbr[dept] : 'STK') + '-' + pad(id, 3)) : '',
        os_name: isComputer ? pick(oses) : (cat === 'Tablet' ? 'Android 13' : ''),
        os_status: isComputer ? (rnd() < 0.8 ? 'Original' : 'Belum Original') : 'Original',
        motherboard_brand: isComputer || cat === 'Tablet' ? brand : '',
        processor: isComputer ? pick(cpus) : '',
        ram: isComputer ? pick(rams) : (cat === 'Tablet' ? '4 GB' : ''),
        storage: isComputer ? pick(storages) : (cat === 'Tablet' ? '64 GB' : ''),
        serial_number: 'SN' + (100000 + Math.floor(rnd() * 899999)),
        purchase_date: dateOnly(daysAgo(int(60, 1400))),
        location: cat === 'Tablet' ? 'Line ' + int(1, 3) : pick(['Lantai 1', 'Lantai 2', 'Ruang Meeting', 'Gudang', 'Kantor Produksi']),
        status: status,
        printer_info: cat === 'Desktop PC' && rnd() < 0.3 ? 'Epson L3210' : '',
        monitor_info: cat === 'Desktop PC' ? pick(boards['Monitor']) : '',
        accessories: isComputer && rnd() < 0.5 ? 'Keyboard + Mouse Logitech' : '',
        pc_username: owner && isComputer ? owner.pc_username : '',
        pc_password: owner && isComputer ? owner.pc_password : '',
        software: isComputer ? softwarePool.filter(() => rnd() < 0.4).slice(0, 3).map(([n, s]) => ({ name: n, serial: s === 'Original' ? 'XXXX-' + int(1000, 9999) : '', status: s })) : [],
        tablet_id: cat === 'Tablet' ? 'TAB-' + pad(id, 3) : '',
        tablet_condition: cat === 'Tablet' ? (rnd() < 0.85 ? 'Bagus' : 'Rusak') : '',
        created_at: daysAgo(int(10, 300)),
      };
      assets.push(a);
      if (owner) assetOwners.push({ asset_id: a.id, user_id: owner.id });
      id++;
    }
  });

  // Pastikan "User Demo" punya laptop supaya menu Aset Saya berisi.
  const demoUser = users.find((u) => u.username === 'user');
  const demoLaptop = assets.find((a) => a.category === 'Laptop' && a.status === 'Stok') || assets.find((a) => a.category === 'Laptop');
  Object.assign(demoLaptop, {
    status: 'Digunakan', department: demoUser.department, owner_email: demoUser.email,
    asset_number: 'AST/FIN/LT/' + pad(99, 3), device_name: 'Lenovo ThinkPad E14',
    hostname: 'WS-FIN-099', ip_address: '192.168.10.199', os_name: 'Windows 11 Pro', os_status: 'Original',
    processor: 'Intel Core i5-1135G7', ram: '4 GB', storage: 'SSD 256 GB', motherboard_brand: 'Lenovo ThinkPad E14',
    pc_username: demoUser.pc_username, pc_password: demoUser.pc_password,
    software: [{ name: 'Microsoft Office 2021', serial: 'XXXX-4821', status: 'Original' }, { name: 'Accurate 5', serial: 'XXXX-1190', status: 'Original' }],
  });
  for (let i = assetOwners.length - 1; i >= 0; i--) if (assetOwners[i].asset_id === demoLaptop.id) assetOwners.splice(i, 1);
  assetOwners.push({ asset_id: demoLaptop.id, user_id: demoUser.id });

  // Beberapa PC/Laptop baru yang belum dibagikan (status Stok) -> tampil di menu Stok Barang
  [['Laptop', 'Lenovo ThinkPad E14 Gen 5', 'Intel Core i5-1335U', '16 GB', 'SSD 512 GB'],
   ['Laptop', 'ASUS VivoBook 14', 'Intel Core i3-1215U', '8 GB', 'SSD 512 GB'],
   ['Laptop', 'HP ProBook 440 G10', 'Intel Core i5-1335U', '16 GB', 'SSD 512 GB'],
   ['Desktop PC', 'Dell OptiPlex 3000', 'Intel Core i5-12500', '16 GB', 'SSD 512 GB']].forEach(([cat, name, cpu, ram, sto]) => {
    const abbr = categories.find((c) => c.name === cat).abbr;
    seq[abbr] = (seq[abbr] || 0) + 1;
    assets.push({
      id: id++, asset_number: `AST/STOK/${abbr}/${pad(seq[abbr], 3)}`, category: cat, device_name: name, department: '', owner_email: '',
      ip_address: '', hostname: '', os_name: 'Windows 11 Pro', os_status: 'Original', motherboard_brand: name, processor: cpu, ram, storage: sto,
      serial_number: 'SN' + (100000 + Math.floor(rnd() * 899999)), purchase_date: dateOnly(daysAgo(int(5, 40))), location: 'Gudang IT', status: 'Stok',
      printer_info: '', monitor_info: '', accessories: '', pc_username: '', pc_password: '', software: [], tablet_id: '', tablet_condition: '', created_at: daysAgo(int(1, 5)),
    });
  });

  // Tiket
  const problems = [
    ['Laptop lambat saat membuka Excel, sering not responding.', 'Bersihkan temp file, disable startup apps, cek kesehatan disk.', 'RAM 4 GB sudah tidak cukup, harus upgrade ke 8 GB.'],
    ['Printer tidak bisa print, muncul error paper jam.', 'Membersihkan roller dan mengeluarkan kertas yang tersangkut.', 'Printer normal kembali.'],
    ['Tidak bisa login email kantor.', 'Reset password akun email dan konfigurasi ulang Outlook.', 'Email sudah bisa diakses.'],
    ['Monitor berkedip-kedip.', 'Ganti kabel VGA ke HDMI.', 'Normal setelah ganti kabel.'],
    ['Internet putus-putus di ruang Finance.', 'Cek switch dan kabel LAN, ganti konektor RJ45.', 'Koneksi stabil.'],
    ['PC mati sendiri saat dipakai.', 'Bersihkan debu dan ganti thermal paste.', 'Suhu CPU masih tinggi, PSU harus upgrade.'],
    ['Minta install aplikasi AutoCAD.', 'Install AutoCAD LT 2022 dan aktivasi lisensi.', 'Aplikasi berjalan normal.'],
    ['Keyboard beberapa tombol tidak berfungsi.', 'Ganti keyboard baru dari stok.', 'Keyboard lama rusak.'],
    ['Windows minta aktivasi.', 'Cek lisensi Windows.', 'OS belum original, harus upgrade lisensi ke Windows 11 Pro.'],
    ['Tablet produksi tidak bisa konek WiFi.', 'Forget network dan konek ulang, update firmware.', 'Tablet normal.'],
    ['Scanner tidak terdeteksi.', 'Install ulang driver scanner.', 'Scanner terdeteksi.'],
    ['Laptop tidak bisa charge.', 'Cek adaptor dengan multimeter.', 'Adaptor rusak, diganti baru.'],
  ];
  const tickets = [];
  const ticketLogs = [];
  const workDetails = [];
  const cancellations = [];
  const admin = users[0];
  const statusPlan = ['Selesai', 'Selesai', 'Selesai', 'Selesai', 'Selesai', 'Selesai', 'Selesai', 'Selesai', 'Selesai', 'Selesai', 'Proses', 'Proses', 'Proses', 'Menunggu', 'Menunggu', 'Menunggu', 'Menunggu', 'Selesai', 'Selesai', 'Selesai'];
  const withOwner = assets.filter((a) => assetOwners.some((o) => o.asset_id === a.id));
  statusPlan.forEach((st, i) => {
    const age = st === 'Menunggu' ? 0 : st === 'Proses' ? int(0, 1) : (i >= 17 ? 0 : int(2, 45));
    const created = daysAgo(age, 8 + (i % 8), (i * 7) % 60);
    let asset = pick(withOwner);
    if (i === 0) asset = demoLaptop;
    const owner = users.find((u) => u.id === (assetOwners.find((o) => o.asset_id === asset.id) || {}).user_id) || pick(usersNoAdmin);
    const prob = problems[i % problems.length];
    const t = {
      id: i + 1,
      ticket_number: 'TCK-' + created.slice(0, 10).replace(/-/g, '') + '-' + pad(i + 1, 4),
      asset_id: asset.id,
      reported_by: owner.id,
      handled_by: st === 'Menunggu' ? null : admin.id,
      problem_detail: prob[0],
      status: st,
      created_at: created,
      resolved_at: st === 'Selesai' ? new Date(new Date(created).getTime() + int(1, 5) * 3600000).toISOString() : null,
    };
    tickets.push(t);
    ticketLogs.push({ ticket_id: t.id, status: 'Menunggu', note: 'Tiket dibuat oleh user', changed_at: created, changed_by: owner.id });
    if (st !== 'Menunggu') ticketLogs.push({ ticket_id: t.id, status: 'Proses', note: 'Status diperbarui oleh admin', changed_at: new Date(new Date(created).getTime() + 1800000).toISOString(), changed_by: admin.id });
    if (st === 'Selesai') {
      ticketLogs.push({ ticket_id: t.id, status: 'Selesai', note: 'Status diperbarui oleh admin', changed_at: t.resolved_at, changed_by: admin.id });
      workDetails.push({ ticket_id: t.id, work_detail: prob[1], asset_check: prob[2] });
    } else if (st === 'Proses') {
      workDetails.push({ ticket_id: t.id, work_detail: prob[1], asset_check: '' });
    }
  });
  // Satu tiket dibatalkan user
  tickets.push({ id: tickets.length + 1, ticket_number: 'TCK-' + dateOnly(daysAgo(3)).replace(/-/g, '') + '-0099', asset_id: demoLaptop.id, reported_by: demoUser.id, handled_by: null, problem_detail: 'Mouse wireless tidak terdeteksi.', status: 'Selesai', created_at: daysAgo(3, 10), resolved_at: null });
  cancellations.push({ ticket_id: tickets.length, reason: 'Sudah normal setelah ganti baterai', cancelled_at: daysAgo(3, 11), cancelled_by: demoUser.id });

  // Stok barang
  const stockCategories = [
    { id: 1, name: 'Mouse', unit: 'pcs', min_stock: 5 },
    { id: 2, name: 'Keyboard', unit: 'pcs', min_stock: 3 },
    { id: 3, name: 'Toner Printer', unit: 'pcs', min_stock: 3 },
    { id: 4, name: 'Kabel LAN', unit: 'roll', min_stock: 1 },
    { id: 5, name: 'Flashdisk', unit: 'pcs', min_stock: 3 },
    { id: 6, name: 'Tinta Epson 003', unit: 'botol', min_stock: 4 },
    { id: 7, name: 'RAM', unit: 'pcs', min_stock: 1 },
  ];
  const stockTransactions = [];
  let sid = 1;
  const addTrx = (cat, type, qty, age, extra = {}) => stockTransactions.push(Object.assign({ id: sid++, category_id: cat, type, qty, trx_date: dateOnly(daysAgo(age)), item_name: '', user_id: null, recipient_name: '', recipient_department: '', note: '', created_at: daysAgo(age) }, extra));
  addTrx(1, 'in', 25, 90, { item_name: 'Logitech B100' });
  addTrx(2, 'in', 10, 90, { item_name: 'Logitech K120' });
  addTrx(3, 'in', 10, 60, { item_name: 'HP 136A' });
  addTrx(4, 'in', 3, 60, { item_name: 'Belden Cat6 305m' });
  addTrx(5, 'in', 15, 45, { item_name: 'Sandisk 32 GB' });
  addTrx(6, 'in', 12, 30, { item_name: 'Epson 003 Black' });
  addTrx(7, 'in', 5, 25, { item_name: 'DDR4 8GB Kingston' });
  addTrx(7, 'in', 2, 25, { item_name: 'DDR4 4GB' });
  // Barang Keluar selalu memilih barang dari Barang Masuk -> nama barang sama
  const itemOfCat = { 1: 'Logitech B100', 2: 'Logitech K120', 3: 'HP 136A', 4: 'Belden Cat6 305m', 5: 'Sandisk 32 GB', 6: 'Epson 003 Black', 7: 'DDR4 8GB Kingston' };
  const outs = [[1, 3], [1, 4], [2, 2], [3, 2], [3, 2], [5, 4], [6, 5], [6, 4], [1, 2], [2, 1], [5, 3], [4, 1], [7, 2]];
  outs.forEach(([cat, qty], i) => {
    const u = usersNoAdmin[i % usersNoAdmin.length];
    addTrx(cat, 'out', qty, 40 - i * 3, { item_name: itemOfCat[cat], user_id: u.id, recipient_name: u.full_name, recipient_department: u.department, note: i % 3 === 0 ? 'Pengganti yang rusak' : '' });
  });

  window.DEMO_SEED = {
    version: 5,
    settings: { app_name: 'IT Asset Management', asset_prefix: 'AST' },
    departments,
    categories,
    users,
    assets,
    assetOwners,
    tickets,
    ticketLogs,
    workDetails,
    cancellations,
    upgradeAck: [],
    // Contoh riwayat upgrade (fitur Proses Upgrade Aset)
    upgradeLogs: [
      { id: 1, asset_id: demoLaptop.id, ticket_id: null, date: dateOnly(daysAgo(120)), notes: 'HDD lama bad sector, diganti SSD. Data dipindah ke SSD baru.', by: 'Admin Demo',
        items: [{ key: 'storage', label: 'Storage', before: 'HDD 500 GB', after: 'SSD 256 GB' }] },
    ],
    stockCategories,
    stockTransactions,
  };
})();
