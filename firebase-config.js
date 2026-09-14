// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyA4iB_gL7aZfw_mo0jqiy9LZSgzhCMdFfM",
    authDomain: "project-1a1b8162-b905-4fc0-b2b.firebaseapp.com",
    databaseURL: "https://project-1a1b8162-b905-4fc0-b2b-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "project-1a1b8162-b905-4fc0-b2b",
    storageBucket: "project-1a1b8162-b905-4fc0-b2b.firebasestorage.app",
    messagingSenderId: "919755455649",
    appId: "1:919755455649:web:bffb68dd64f2493f1f84e0"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
