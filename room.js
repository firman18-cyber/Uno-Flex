// room.js
import { db } from './firebase-config.js';
import { ref, set, update, onValue, onDisconnect, remove } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-database.js";

function showToast(msg) {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = 'toast'; toast.innerText = msg;
    container.appendChild(toast);
    setTimeout(() => { toast.style.opacity='0'; setTimeout(()=>toast.remove(), 400); }, 2000);
}

// Ambil data sesi dari URL & Browser Memory
const urlParams = new URLSearchParams(window.location.search);
const currentRoom = urlParams.get('id');
const savedSession = sessionStorage.getItem('unoFlexSession');

if (!currentRoom || !savedSession) {
    window.location.href = 'index.html'; // Usir ke halaman depan jika ilegal
}

const { id: myPlayerId, name: myName } = JSON.parse(savedSession);
let isHost = false;
let myIsActive = true; 

document.getElementById('display-room-code').textContent = currentRoom;

// Koneksi Status
const connIndicator = document.getElementById('conn-indicator');
onValue(ref(db, ".info/connected"), (snap) => {
    if (snap.val() === true) {
        connIndicator.className = "luckiest online-pill"; 
        connIndicator.innerHTML = '<span class="dot"></span> ONLINE';
        const myPlayerRef = ref(db, `rooms/${currentRoom}/players/${myPlayerId}`);
        set(myPlayerRef, { id: myPlayerId, name: myName, isActive: myIsActive });
        onDisconnect(myPlayerRef).remove();
    } else {
        connIndicator.className = "luckiest online-pill offline-pill"; 
        connIndicator.innerHTML = '<span class="dot"></span> OFFLINE';
    }
});

// Fitur Copy
document.getElementById('btn-copy-room').addEventListener('click', () => {
    navigator.clipboard.writeText(currentRoom);
    showToast("ID Room Disalin!");
});

// Fitur Keluar
document.getElementById('btn-leave-room').addEventListener('click', async () => {
    if(confirm("Yakin ingin keluar dari game?")) {
        sessionStorage.removeItem('unoFlexSession');
        await remove(ref(db, `rooms/${currentRoom}/players/${myPlayerId}`));
        window.location.href = 'index.html';
    }
});

// Flip Kartu
document.getElementById('my-card-trigger').addEventListener('click', () => {
    update(ref(db, `rooms/${currentRoom}/players/${myPlayerId}`), { isActive: !myIsActive });
});

// Listener Data Realtime Room
onValue(ref(db, `rooms/${currentRoom}`), (snapshot) => {
    if (!snapshot.exists()) { 
        showToast("Room Ditutup"); 
        sessionStorage.removeItem('unoFlexSession');
        setTimeout(() => window.location.href = 'index.html', 2000); 
        return; 
    }
    
    const data = snapshot.val();
    const players = data.players || {};
    
    // Host Migration
    if (!players[data.hostId] && Object.keys(players).length > 0) {
        const newHostId = Object.keys(players)[0];
        if (myPlayerId === newHostId) { isHost = true; update(ref(db, `rooms/${currentRoom}`), { hostId: newHostId }); }
    } else isHost = (myPlayerId === data.hostId);

    renderPlayers(players, data.hostId);
    checkAllRedRule(players);
});

function getAvatarUrl(name) {
    return `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(name)}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffdfbf,ffd5dc`;
}

function escapeHTML(str) { return str.replace(/[&<>'"]/g, tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)); }

function renderPlayers(players, hostId) {
    const colLeft = document.getElementById('col-left');
    const colRight = document.getElementById('col-right');
    colLeft.innerHTML = ''; colRight.innerHTML = '';
    
    const playerArray = Object.values(players);
    document.getElementById('player-count-display').textContent = playerArray.length;

    const me = playerArray.find(p => p.id === myPlayerId);
    if (me) {
        myIsActive = me.isActive;
        const card = document.getElementById('my-power-card');
        const label = document.getElementById('my-card-status');
        if (me.isActive) {
            card.classList.remove('flipped');
            label.textContent = "KARTU AKTIF";
            label.style.background = "var(--uno-yellow)";
        } else {
            card.classList.add('flipped');
            label.textContent = "NONAKTIF";
            label.style.background = "#fff";
        }
    }

    const opps = playerArray.filter(p => p.id !== myPlayerId);
    opps.forEach((p, index) => {
        const isHostIcon = p.id === hostId ? '<div class="host-crown">👑</div>' : '';
        const ringClass = p.isActive ? 'ring-green' : 'ring-red';
        const miniClass = p.isActive ? 'mini-g' : 'mini-r';
        const svgIcon = p.isActive 
            ? '<polyline points="20 6 9 17 4 12" fill="none" stroke="#fff" stroke-width="4"></polyline>'
            : '<line x1="18" y1="6" x2="6" y2="18" stroke="#fff" stroke-width="4"></line><line x1="6" y1="6" x2="18" y2="18" stroke="#fff" stroke-width="4"></line>';
        
        const oppHtml = `
            <div class="opp-box">
                <div class="opp-avatar ${ringClass}">
                    ${isHostIcon}
                    <img src="${getAvatarUrl(p.name)}" alt="Avatar">
                </div>
                <div class="opp-name">${escapeHTML(p.name)}</div>
                <div class="opp-minicard ${miniClass}"><svg viewBox="0 0 24 24" width="16" height="16">${svgIcon}</svg></div>
            </div>`;

        if (index % 2 === 0) colLeft.innerHTML += oppHtml;
        else colRight.innerHTML += oppHtml;
    });
}

let isResetting = false;
function checkAllRedRule(players) {
    const arr = Object.values(players);
    if (arr.length === 0) return;
    if (arr.every(p => p.isActive === false) && !isResetting) {
        isResetting = true;
        showToast("Semua Merah! Reset Otomatis...");
        if (isHost) {
            setTimeout(() => {
                const updates = {};
                arr.forEach(p => updates[`rooms/${currentRoom}/players/${p.id}/isActive`] = true);
                update(ref(db), updates).then(() => { isResetting = false; }).catch(() => { isResetting = false; });
            }, 1200); 
        } else setTimeout(() => { isResetting = false; }, 1800);
    }
}
