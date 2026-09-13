import {initializeApp} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import {getAuth,signInAnonymously} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
import {getDatabase,ref,get,set,onDisconnect} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js";
import {firebaseConfig} from "./firebase-config.js";

const app=initializeApp(firebaseConfig),auth=getAuth(app),db=getDatabase(app);
const $=id=>document.getElementById(id);
const status=(s,e=false)=>{$("status").textContent=s;$("status").style.color=e?"#ff4650":"#d9e3e8"};
const name=()=> $("playerName").value.trim().replace(/\s+/g," ");
const code=()=> $("roomCode").value.trim().toUpperCase().replace(/[^A-Z0-9]/g,"");
const makeCode=()=>Array.from({length:6},()=> "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"[Math.floor(Math.random()*32)]).join("");

async function authUser(){return (await signInAnonymously(auth)).user}

$("createBtn").onclick=async()=>{
  if(!name()){status("Masukkan nama kamu.",true);return}
  $("createBtn").disabled=true;status("Membuat room...");
  try{
    const u=await authUser(); let c,snap;
    for(let i=0;i<10;i++){c=makeCode();snap=await get(ref(db,`rooms/${c}`));if(!snap.exists())break}
    if(snap?.exists())throw Error("CODE");
    await set(ref(db,`rooms/${c}`),{
      hostId:u.uid,status:"waiting",maxPlayers:8,createdAt:Date.now(),
      players:{[u.uid]:{name:name(),online:true,flex:"green",host:true,joinedAt:Date.now()}}
    });
    const p=ref(db,`rooms/${c}/players/${u.uid}`);
    await onDisconnect(p).update({online:false});
    location.href=`room.html?room=${c}`;
  }catch(e){console.error(e);status("Gagal membuat room.",true)}
  $("createBtn").disabled=false;
};

$("joinBtn").onclick=async()=>{
  if(!name()){status("Masukkan nama kamu.",true);return}
  const c=code();if(c.length<4){status("Kode room tidak valid.",true);return}
  $("joinBtn").disabled=true;status("Mencari room...");
  try{
    const u=await authUser(),r=ref(db,`rooms/${c}`),snap=await get(r);
    if(!snap.exists())throw Error("NOT_FOUND");
    const room=snap.val(),players=room.players||{},onlinePlayers=Object.values(players).filter(p=>p.online!==false).length;
    if(room.status!=="waiting")throw Error("STARTED");
    if(onlinePlayers >= (room.maxPlayers||8))throw Error("FULL");
    await set(ref(db,`rooms/${c}/players/${u.uid}`),{name:name(),online:true,flex:"green",host:false,joinedAt:Date.now()});
    await onDisconnect(ref(db,`rooms/${c}/players/${u.uid}`)).update({online:false});
    location.href=`room.html?room=${c}`;
  }catch(e){
    const m={NOT_FOUND:"Room tidak ditemukan.",STARTED:"Permainan sudah dimulai.",FULL:"Room sudah penuh.",CODE:"Gagal membuat kode room."};
    status(m[e.message]||"Gagal bergabung ke room.",true)
  }
  $("joinBtn").disabled=false;
};
$("roomCode").oninput=()=> $("roomCode").value=code();
