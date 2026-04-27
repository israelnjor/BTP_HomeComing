// firebase.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyAYuv_OYNjX1AA3JLdWhpEqhJiGvJZ5YvE",
  authDomain: "btp-accra.firebaseapp.com",
  projectId: "btp-accra",
  storageBucket: "btp-accra.firebasestorage.app",
  messagingSenderId: "306348033779",
  appId: "1:306348033779:web:ff32de777ece5d87ac9986",
  measurementId: "G-57S1P914GE"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);