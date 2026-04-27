// script.js

import { db } from "./firebase.js";
import { collection, addDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const form = document.getElementById("homecomingForm");
const submitBtn = document.getElementById("submitBtn");

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Disable button + show loading
    submitBtn.disabled = true;
    submitBtn.textContent = "Submitting...";

    try {
        await addDoc(collection(db, "registrations"), {
            name: document.getElementById('name').value,
            contact: document.getElementById('contact').value,
            email: document.getElementById('email').value,
            country: document.getElementById('country').value,
            days: document.getElementById('days').value,
            accommodation: document.getElementById('accommodation').value,
            comments: document.getElementById('comments').value,
            consent: document.getElementById('consent').checked,
            timestamp: new Date()
        });

        // Success message
        submitBtn.textContent = "Registration Submitted ✅";

        setTimeout(() => {
            form.reset();
            submitBtn.disabled = false;
            submitBtn.textContent = "Submit Registration";
        }, 2000);

    } catch (error) {
        submitBtn.textContent = "Error ❌";
        alert(error.message);

        submitBtn.disabled = false;
        submitBtn.textContent = "Submit Registration";
    }
});