# IT Asset Management

**Aplikasi web inventaris aset IT, ticketing helpdesk, dan stok barang untuk tim IT perusahaan.**

🔗 **Live demo:** <https://reksa-yp.github.io/it-asset-management-demo/>

> Demo ini berjalan 100% di browser dengan **data contoh fiktif**. Silakan tambah, ubah, atau hapus data —
> perubahan hanya tersimpan di browser Anda dan bisa dikembalikan lewat tombol **Reset data demo**.

---

## Coba Langsung

| Peran | Username | Password |
|---|---|---|
| Admin | `admin` | `admin123` |
| User  | `user`  | `user123`  |

Atau klik **Masuk sebagai Admin / User** di halaman login. Tombol **Coba sebagai User/Admin** di kanan atas
memudahkan berpindah peran — misalnya buat tiket sebagai User, lalu proses tiketnya sebagai Admin.

## Fitur Utama

**Admin**
- **Dashboard** — total aset, antrian tiket, perbaikan selesai hari ini, grafik aset per jenis,
  peringatan aset yang *harus upgrade* dan stok barang menipis.
- **Upgrade Aset** 🆕 — tombol **Proses Upgrade** di Dashboard: isi komponen yang di-upgrade
  (RAM, storage, processor, OS, software, dll.), data aset **otomatis diperbarui**, dan tercatat di
  **Riwayat Upgrade** pada detail aset (sebelum → sesudah, tanggal, teknisi, tiket asal). Ikut tercetak di Print Aset.
- **Manajemen Aset IT** — pencarian & filter (jenis, departement, status), nomor aset otomatis
  (`PREFIX/DEPT/JENIS/001`), banyak software per aset, isian khusus Tablet, detail & cetak.
- **Import Aset + User sekaligus** 🆕 — satu template Excel: satu baris = satu aset beserta penggunanya.
  User baru dibuat otomatis dan langsung terhubung ke asetnya (bisa dicoba di demo: *Download Template* → isi → *Import*).
- **Kategori Aset** yang bisa dikustomisasi.
- **Management User** — departement, role, dan data login PC.
- **Ticketing IT** — status Menunggu → Proses → Selesai, rincian pengerjaan & hasil pengecekan, riwayat status.
- **Stok Barang** — barang masuk/keluar, rekap per kategori & per user, dan **stok aset IT otomatis**:
  aset berstatus *Stok* langsung terhitung dan bisa **diserahkan ke user** dengan satu klik.
  🆕 **Barang Keluar dipilih dari daftar Barang Masuk** (tidak diketik manual) lengkap dengan sisa stok per barang,
  dan tidak bisa mengeluarkan melebihi stok yang tersedia.
- **Pengaturan Sistem** — nama sistem, logo, dan prefix nomor aset.

**User**
- **Aset Saya** — detail perangkat (General, Hardware, Network, System), riwayat perbaikan, dan 🆕 riwayat upgrade.
- **Buat & batalkan tiket**, serta **Antrian Ticket** untuk melihat posisi tiket.

**Umum** 🆕
- **Menu akun di ikon user (pojok kanan atas)** berisi nama, role, dan **Logout**.
- Semua pop-up form punya tombol **X** untuk menutup.

## Teknologi

| Aplikasi asli | Versi demo (repo ini) |
|---|---|
| PHP 8 (native, PDO) · MySQL / MariaDB | HTML + JavaScript (tanpa server) |
| TailwindCSS · PhpSpreadsheet (Excel) · Dompdf (PDF) | TailwindCSS · data di `localStorage` |
| Installer web, multi-bahasa (ID/EN), RBAC admin/user | Di-hosting gratis di GitHub Pages |

Fitur yang hanya ada di aplikasi asli: export Excel/PDF lengkap, backup database otomatis, installer web.
(Import Aset + User di demo memakai SheetJS dari CDN, jadi perlu koneksi internet.)

## Screenshot

*(Opsional — tambahkan gambar ke folder `screenshots/` lalu tampilkan di sini, contoh:)*
<!-- ![Dashboard](screenshots/dashboard.png) -->

---

## Setup GitHub Pages (tanpa install apa pun)

1. Login di <https://github.com> → tombol **+** → **New repository**.
   - Repository name: `it-asset-management-demo`
   - Pilih **Public** → **Create repository**
2. Klik **uploading an existing file**, lalu seret **isi** folder demo ini
   (`index.html`, folder `assets`, `README.md`) → **Commit changes**.
3. **Settings** → **Pages** → Source: **Deploy from a branch** → Branch **main**, folder **/ (root)** → **Save**.
4. Tunggu 1–2 menit. Alamat demo: `https://USERNAME-GITHUB-ANDA.github.io/it-asset-management-demo/`
5. Edit `README.md` ini di GitHub (ikon pensil) dan ganti alamat **Live demo** di bagian atas.
6. Di halaman utama repo, klik ⚙️ di samping **About** → centang **Use your GitHub Pages website**,
   supaya link demo tampil di bagian atas repo.

**Mengubah data contoh:** edit `assets/js/data.js`, lalu naikkan angka `version` supaya pengunjung
lama otomatis mendapat data baru.

---

© Copyright by ASKER
