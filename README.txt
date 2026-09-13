UNO FLEX 3D — GitHub Pages + Firebase

FILES: index.html, room.html, style.css, app.js, room.js, firebase-config.js

Firebase:
1. Authentication > Sign-in providers > Anonymous = Enabled.
2. Realtime Database dibuat.
3. Edit firebase-config.js dengan Web App config dari Firebase Console.
4. GitHub Settings > Pages > Deploy from branch > main > /(root).

Gameplay:
- Kartu besar tengah adalah kartu FLEX pemain yang sedang login.
- TAP kartu untuk flip hijau ✓ / merah ×.
- Semua perubahan pemain tersinkron realtime lewat Realtime Database.
- Jika semua pemain ONLINE merah, sistem otomatis mengubah semuanya menjadi hijau dan menampilkan notifikasi.
- Default maksimal 8 pemain.