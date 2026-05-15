import { auth, db } from "./firebase.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
    collection,
    onSnapshot
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const tableBody = document.querySelector("#dataTable tbody");

const countryFilter = document.getElementById("countryFilter");
const accommodationFilter = document.getElementById("accommodationFilter");
const mealPlanFilter = document.getElementById("mealPlanFilter");

const SESSION_LIMIT = 15 * 60 * 1000; // 15 minutes
// const loginTime = Number(localStorage.getItem("btp_admin_login_time"));

let allData = [];
let unsubscribe = null;

// Protect dashboard and control session
onAuthStateChanged(auth, async (user) => {
    if (!user) {
        window.location.href = "login.html";
        return;
    }

    const loginTime = Number(localStorage.getItem("btp_admin_login_time"));
    const sessionExpired = !loginTime || Date.now() - loginTime > SESSION_LIMIT;

    if (sessionExpired) {
        localStorage.removeItem("btp_admin_login_time");

        if (unsubscribe) {
            unsubscribe();
        }

        await signOut(auth);
        window.location.href = "login.html";
        return;
    }

    loadData();
});;

// Load live Firestore data
function loadData() {
    unsubscribe = onSnapshot(
        collection(db, "registrations"),
        (snapshot) => {
            allData = [];

            snapshot.forEach((doc) => {
                allData.push({
                    id: doc.id,
                    ...doc.data()
                });
            });

            allData.sort((a, b) => {
                const timeA = a.timestamp?.toDate ? a.timestamp.toDate() : new Date(0);
                const timeB = b.timestamp?.toDate ? b.timestamp.toDate() : new Date(0);
                return timeB - timeA;
            });

            populateCountryFilter();
            updateStats();
            applyFilters();
        },
        (error) => {
            console.error("Firestore error:", error);

            tableBody.innerHTML = `
                <tr>
                    <td colspan="12" style="text-align:center; padding:24px; color:#e85c1a;">
                        Unable to load registrations. Please check your login session or Firestore rules.
                    </td>
                </tr>
            `;
        }
    );
}

// Populate country filter
function populateCountryFilter() {
    const selectedValue = countryFilter.value || "all";

    countryFilter.innerHTML = `<option value="all">All</option>`;

    const countries = [...new Set(
        allData.map(d => d.country).filter(Boolean)
    )].sort();

    countries.forEach(country => {
        const option = document.createElement("option");
        option.value = country;
        option.textContent = country;
        countryFilter.appendChild(option);
    });

    countryFilter.value = selectedValue;
}

// Apply filters
function applyFilters() {
    const countryValue = countryFilter.value;
    const accommodationValue = accommodationFilter.value;
    const mealPlanValue = mealPlanFilter.value;

    let filteredData = [...allData];

    if (countryValue !== "all") {
        filteredData = filteredData.filter(d => d.country === countryValue);
    }

    if (accommodationValue !== "all") {
        filteredData = filteredData.filter(d => d.accommodation === accommodationValue);
    }

    if (mealPlanValue !== "all") {
        filteredData = filteredData.filter(d => d.mealPlanRequired === mealPlanValue);
    }

    displayData(filteredData);
}

// Display table
function displayData(data) {
    tableBody.innerHTML = "";

    if (data.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="12" style="text-align:center; padding:24px;">
                    No registrations found.
                </td>
            </tr>
        `;
        return;
    }

    data.forEach(d => {
        const meals = Array.isArray(d.mealOptions) && d.mealOptions.length
            ? d.mealOptions.join(", ")
            : "N/A";

        const days = calculateDays(d.checkInDate, d.checkOutDate);
        const comments = d.comments || "N/A";

        const row = `
            <tr>
                <td>${escapeHTML(d.name || "N/A")}</td>
                <td>${escapeHTML(d.contact || "N/A")}</td>
                <td>${escapeHTML(d.email || "N/A")}</td>
                <td>${escapeHTML(d.country || "N/A")}</td>
                <td>${escapeHTML(d.accommodation || "N/A")}</td>
                <td>${escapeHTML(d.checkInDate || "N/A")}</td>
                <td>${escapeHTML(d.checkOutDate || "N/A")}</td>
                <td>${escapeHTML(days)}</td>
                <td>${escapeHTML(d.mealPlanRequired || "No")}</td>
                <td>${escapeHTML(meals)}</td>
                <td class="comment-cell" title="${escapeHTML(comments)}">${escapeHTML(comments)}</td>
                <td>${timeAgo(d.timestamp)}</td>
            </tr>
        `;

        tableBody.innerHTML += row;
    });
}

// Update stats
function updateStats() {
    document.getElementById("total").textContent = allData.length;

    const accommodationCount = allData.filter(d => d.accommodation === "Yes").length;
    document.getElementById("accommodationCount").textContent = accommodationCount;

    const mealPlanCount = allData.filter(d => d.mealPlanRequired === "Yes").length;
    document.getElementById("mealPlanCount").textContent = mealPlanCount;
}

// Calculate days from check-in/check-out
function calculateDays(checkInDate, checkOutDate) {
    if (!checkInDate || !checkOutDate) return "N/A";

    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);

    const diffTime = checkOut - checkIn;
    const diffDays = diffTime / (1000 * 60 * 60 * 24);

    if (diffDays <= 0) return "Invalid";

    return diffDays;
}

// Convert timestamp to readable relative time
function timeAgo(timestamp) {
    if (!timestamp || !timestamp.toDate) return "N/A";

    const date = timestamp.toDate();
    const now = new Date();

    const seconds = Math.floor((now - date) / 1000);

    if (seconds < 60) return "Just now";

    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} min(s) ago`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour(s) ago`;

    const days = Math.floor(hours / 24);
    return `${days} day(s) ago`;
}

// Prevent HTML injection
function escapeHTML(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

// Filter event listeners
countryFilter.addEventListener("change", applyFilters);
accommodationFilter.addEventListener("change", applyFilters);
mealPlanFilter.addEventListener("change", applyFilters);