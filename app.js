import { db } from './firebase-config.js';
import { ref, set, get } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-database.js";

// ==========================================
const MAX_PLAYERS = 8; // BISA DIUBAH MENJADI 12, 16, DLL
// ==========================================

const savedSession = sessionStorage.getItem('unoFlexSession');
if (savedSession) {
    const sessionData = JSON.parse(savedSession);
    window.location.href = `room.html?id=${sessionData.room}`;
}

function showToast(msg) {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = 'toast'; toast.innerText = msg;
    container.appendChild(toast);
    setTimeout(() => { toast.style.opacity='0'; setTimeout(()=>toast.remove(), 400); }, 2000);
}

function generateRoomCode() {
    let res = '', chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    for (let i = 0; i < 5; i++) res += chars.charAt(Math.floor(Math.random() * chars.length));
    return res;
}

document.getElementById('btn-create-room').addEventListener('click', async () => {
    let myName = document.getElementById('player-name').value.trim();
    if (!myName) return showToast("Masukkan Nama Kamu!");
    
    let myPlayerId = 'player_' + Date.now() + Math.random().toString(36).substr(2, 5);
    let newCode = generateRoomCode();

    try {
        await set(ref(db, `rooms/${newCode}`), { hostId: myPlayerId, createdAt: Date.now() });
        sessionStorage.setItem('unoFlexSession', JSON.stringify({ id: myPlayerId, name: myName, room: newCode }));
        window.location.href = `room.html?id=${newCode}`;
    } catch(e) { showToast("Gagal Membuat Room"); }
});

document.getElementById('btn-join-room').addEventListener('click', async () => {
    let myName = document.getElementById('player-name').value.trim();
    let code = document.getElementById('room-code').value.trim().toUpperCase();
    
    if (!myName || !code) return showToast("Lengkapi Nama & Kode!");
    
    let myPlayerId = 'player_' + Date.now() + Math.random().toString(36).substr(2, 5);

    try {
        const snap = await get(ref(db, `rooms/${code}`));
        if (snap.exists()) {
            const players = snap.val().players || {};
            if (Object.keys(players).length >= MAX_PLAYERS) return showToast(`Room Penuh (Maks ${MAX_PLAYERS})`);
            
            sessionStorage.setItem('unoFlexSession', JSON.stringify({ id: myPlayerId, name: myName, room: code }));
            window.location.href = `room.html?id=${code}`;
        } else { showToast("Room Tidak Ditemukan"); }
    } catch(e) { showToast("Error Jaringan"); }
});
