import {initializeApp} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import {getAuth,signInAnonymously} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
import {getDatabase,ref,onValue,update,remove} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js";
import {firebaseConfig} from "./firebase-config.js";

const app=initializeApp(firebaseConfig),auth=getAuth(app),db=getDatabase(app);
const code=(new URLSearchParams(location.search).get("room")||"").toUpperCase();
const $=id=>document.getElementById(id);
$("roomCode").textContent=code||"------";
let uid=null,isHost=false,currentRoom=null,resetLock=false;
const chars=["🧑‍🚀","🦊","🐼","🐯","🐸","🐵","🐨","🐱","🦁","🐰","🐻","🐲","🧙","🥷","🤖","👾","👻","🎮","⭐","🔥","⚡","🌟","🍀","🎲","🦄","🐙","🦉","🐺","🦖","🐹","🐻‍❄️","🐯"];

const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
const msg=(s,e=false)=>{$("status").textContent=s;$("status").style.color=e?"#ff4650":"#cbd4d8"};

function allRed(players){
  const list=Object.values(players||{}).filter(p=>p.online!==false);
  return list.length>0 && list.every(p=>p.flex==="red");
}

async function autoResetIfNeeded(room){
  if(!isHost||resetLock||!allRed(room.players))return;
  resetLock=true;
  try{
    const changes={};
    Object.keys(room.players).forEach(id=>changes[`rooms/${code}/players/${id}/flex`]="green");
    changes[`rooms/${code}/lastResetAt`]=Date.now();
    await update(ref(db),changes);
  }finally{setTimeout(()=>resetLock=false,400)}
}

function render(room){
  currentRoom=room;
  const players=Object.entries(room.players||{});
  const max=Math.max(2,Math.min(32,Number(room.maxPlayers)||8));
  $("count").textContent=players.filter(([,p])=>p.online!==false).length;
  $("max").textContent=max;
  $("players").innerHTML="";

  players.forEach(([id,p],i)=>{
    const online=p.online!==false, red=p.flex==="red", character=p.character||chars[i%chars.length];
    $("players").insertAdjacentHTML("beforeend",`
      <article class="player ${red?"red":""} ${online?"":"offline"}">
        <span class="online-dot"></span>
        <div class="character">${esc(character)}</div>
        <div class="pname">${esc(p.name)}</div>
        <div class="host">${p.host?"★ HOST":online?"ONLINE":"OFFLINE"}</div>
        <div class="flex-card ${red?"red":"green"}">${red?"×":"✓"}</div>
        <button class="toggle" data-id="${esc(id)}" ${!online?"disabled":""}>
          ${id===uid?"UBAH KARTU SAYA":"KARTU FLEX"}
        </button>
      </article>`);
  });

  for(let i=players.length;i<max;i++){
    $("players").insertAdjacentHTML("beforeend",`<article class="player offline"><div class="character">?</div><div class="pname">Menunggu pemain...</div><div class="host">SLOT KOSONG</div></article>`);
  }

  $("hostPanel").hidden=!isHost;
  $("maxPlayers").value=max;
  autoResetIfNeeded(room);
}

$("players").onclick=async e=>{
  const b=e.target.closest(".toggle");if(!b||b.dataset.id!==uid)return;
  const p=currentRoom?.players?.[uid];if(!p)return;
  await update(ref(db,`rooms/${code}/players/${uid}`),{flex:p.flex==="red"?"green":"red"});
};

$("saveMax").onclick=async()=>{
  if(!isHost)return;
  let n=Math.max(2,Math.min(32,Number($("maxPlayers").value)||8));
  const online=Object.values(currentRoom?.players||{}).filter(p=>p.online!==false).length;
  if(n<online){msg(`Minimal ${online} karena pemain sedang ada di room.`,true);return}
  await update(ref(db,`rooms/${code}`),{maxPlayers:n});
};

$("leave").onclick=async()=>{
  if(uid&&code)try{await remove(ref(db,`rooms/${code}/players/${uid}`))}catch(e){}
  location.href="index.html";
};

async function start(){
  if(!code){msg("Kode room tidak ada.",true);return}
  try{
    const u=(await signInAnonymously(auth)).user;uid=u.uid;
    const roomRef=ref(db,`rooms/${code}`);
    const snap=await new Promise((resolve,reject)=>{
      onValue(roomRef,s=>resolve(s),{onlyOnce:true});
    });
    if(!snap.exists()){msg("Room tidak ditemukan.",true);return}
    isHost=snap.val().hostId===uid;

    onValue(roomRef,s=>{
      if(!s.exists()){msg("Room sudah tidak tersedia.",true);return}
      render(s.val());msg("Terhubung realtime.");
    });
    await update(ref(db,`rooms/${code}/players/${uid}`),{online:true});
  }catch(e){console.error(e);msg("Gagal terhubung ke Firebase.",true)}
}
start();
