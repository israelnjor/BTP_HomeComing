import { auth } from "./firebase.js";

import {
    signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const loginBtn = document.getElementById("loginBtn");
const message = document.getElementById("message");

loginBtn.addEventListener("click", loginAdmin);

passwordInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        loginAdmin();
    }
});

function showMessage(text) {
    if (message) {
        message.textContent = text;
    } else {
        alert(text);
    }
}

async function loginAdmin() {
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    if (!email || !password) {
        showMessage("Please enter email and password.");
        return;
    }

    loginBtn.disabled = true;
    loginBtn.textContent = "Checking...";
    showMessage("");

    try {
        await signInWithEmailAndPassword(auth, email, password);

        localStorage.setItem("btp_admin_login_time", Date.now().toString());

        window.location.href = "admin.html";

    } catch (error) {
        console.error("Login error:", error);

        showMessage("Invalid login details.");

        loginBtn.disabled = false;
        loginBtn.textContent = "Login to Dashboard";
    }
}