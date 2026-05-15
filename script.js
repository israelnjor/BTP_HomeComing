import { db } from "./firebase.js";

import {
    collection,
    addDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const form = document.getElementById("homecomingForm");
const submitBtn = document.getElementById("submitBtn");

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    submitBtn.disabled = true;
    submitBtn.textContent = "Submitting...";

    try {

        // Meal options
        const selectedMeals = [];

        document.querySelectorAll(".meal-option:checked").forEach(option => {
            selectedMeals.push(option.value);
        });

        // Form data
        const data = {
            name: document.getElementById("name").value.trim(),
            contact: document.getElementById("contact").value.trim(),
            email: document.getElementById("email").value.trim(),
            country: document.getElementById("country").value,
            accommodation: document.getElementById("accommodation").value,

            checkInDate:
                document.getElementById("accommodation").value === "Yes"
                    ? document.getElementById("checkInDate").value
                    : "",

            checkOutDate:
                document.getElementById("accommodation").value === "Yes"
                    ? document.getElementById("checkOutDate").value
                    : "",

            mealPlanRequired:
                document.getElementById("accommodation").value === "Yes"
                    ? document.getElementById("mealPlanRequired").value
                    : "No",

            mealOptions:
                document.getElementById("mealPlanRequired").value === "Yes"
                    ? selectedMeals
                    : [],

            comments:
                document.getElementById("accommodation").value === "Yes"
                    ? document.getElementById("comments").value.trim()
                    : "",

            consent: document.getElementById("consent").checked,

            timestamp: new Date()
        };

        await addDoc(collection(db, "registrations"), data);

        alert("Registration submitted successfully 🙌");

        form.reset();

        window.location.reload();

    } catch (error) {
        console.error(error);
        alert("Something went wrong. Please try again.");
    }

    submitBtn.disabled = false;
    submitBtn.textContent = "Submit Registration ✓";
});