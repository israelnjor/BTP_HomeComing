import { db } from "./firebase.js";

import {
    collection,
    addDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const form = document.getElementById("homecomingForm");
const submitBtn = document.getElementById("submitBtn");

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const firstName = document.getElementById("firstName").value.trim();
    const lastName = document.getElementById("lastName").value.trim();
    const contact = document.getElementById("contact").value.trim();
    const email = document.getElementById("email").value.trim();
    const country = document.getElementById("country").value;
    const accommodation = document.getElementById("accommodation").value;

    const checkInDate = document.getElementById("checkInDate").value;
    const checkOutDate = document.getElementById("checkOutDate").value;
    const mealPlanRequired = document.getElementById("mealPlanRequired").value;

    const commentsInput = document.getElementById("comments");
    const consent = document.getElementById("consent").checked;

    const selectedMeals = [];

    document.querySelectorAll(".meal-option:checked").forEach(option => {
        selectedMeals.push(option.value);
    });

    if (!firstName || !lastName || !contact || !email || !country || !accommodation) {
        alert("Please complete all required personal information.");
        return;
    }

    if (!isValidEmail(email)) {
        alert("Please enter a valid email address.");
        return;
    }

    if (!consent) {
        alert("Please accept the consent before submitting.");
        return;
    }

    if (accommodation === "Yes") {
        if (!checkInDate || !checkOutDate || !mealPlanRequired) {
            alert("Please complete your accommodation details.");
            return;
        }

        if (new Date(checkOutDate) <= new Date(checkInDate)) {
            alert("Check-out date must be after check-in date.");
            return;
        }

        if (mealPlanRequired === "Yes" && selectedMeals.length === 0) {
            alert("Please select at least one meal option.");
            return;
        }
    }

    submitBtn.disabled = true;
    submitBtn.textContent = "Submitting...";

    try {
        const data = {
            firstName,
            lastName,
            fullName: `${firstName} ${lastName}`,
            contact,
            email,
            country,
            accommodation,

            checkInDate: accommodation === "Yes" ? checkInDate : "",
            checkOutDate: accommodation === "Yes" ? checkOutDate : "",

            mealPlanRequired: accommodation === "Yes" ? mealPlanRequired : "No",
            mealOptions:
                accommodation === "Yes" && mealPlanRequired === "Yes"
                    ? selectedMeals
                    : [],

            comments:
                accommodation === "Yes"
                    ? commentsInput.value.trim()
                    : "",

            consent,
            timestamp: new Date()
        };

        await addDoc(collection(db, "registrations"), data);

        alert("Registration submitted successfully 🙌");

        form.reset();

        window.location.reload();

    } catch (error) {
        console.error("Submission error:", error);
        alert("Something went wrong. Please try again.");
    }

    submitBtn.disabled = false;
    submitBtn.textContent = "Submit Registration ✓";
});

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}