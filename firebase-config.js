// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyAsUmrDn3pI8J4q1XnTU4KcnFeUgHgByZY",
    authDomain: "uno-flex-f36e8.firebaseapp.com",
    databaseURL: "https://uno-flex-f36e8-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "uno-flex-f36e8",
    storageBucket: "uno-flex-f36e8.firebasestorage.app",
    messagingSenderId: "878978021695",
    appId: "1:878978021695:web:3995ae12c7575016497b8a"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
