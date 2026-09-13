UNO FLEX — GitHub + Firebase Realtime Database

Firebase yang diperlukan:
1. Web App
2. Authentication -> Anonymous
3. Realtime Database

Tidak menggunakan Firestore.

Konsep:
- Login hanya Nama + Kode Room.
- Buat Room menghasilkan kode 6 karakter.
- Default maksimal 8 pemain.
- Host dapat mengubah batas pemain dari 2 sampai 32.
- Setiap pemain punya status FLEX sendiri: green (✓) atau red (×).
- Pemain hanya dapat mengubah kartu FLEX miliknya.
- Jika semua pemain yang online berada di merah, HOST otomatis mengubah semuanya kembali hijau.
- Status online memakai Firebase Realtime Database onDisconnect.
- Karakter memakai emoji/ikon sehingga tidak perlu menyimpan gambar eksternal.

Pasang:
1. Isi firebase-config.js dengan konfigurasi Web App.
2. Aktifkan Anonymous Authentication.
3. Buat Realtime Database.
4. Pasang isi database.rules.json ke Rules.
5. Upload semua file ke repository GitHub.
6. Aktifkan GitHub Pages dari branch main / root.
