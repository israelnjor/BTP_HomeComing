import { auth } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import { db } from "./firebase.js";
import { collection, onSnapshot } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
onAuthStateChanged(auth, (user) => {
    if (!user) {
        window.location.href = "login.html";
    }
});



const tableBody = document.querySelector("#dataTable tbody");
const filter = document.getElementById("countryFilter");

let allData = [];

function loadData() {
    onSnapshot(collection(db, "registrations"), (snapshot) => {

        allData = [];

        snapshot.forEach((doc) => {
            allData.push(doc.data());
        });

        // sort newest first
        allData.sort((a, b) => b.timestamp.toDate() - a.timestamp.toDate());

        populateFilter();
        displayData(allData);
        updateStats();
    });
}
function populateFilter() {
    const countries = [...new Set(allData.map(d => d.country))];

    countries.forEach(country => {
        const option = document.createElement("option");
        option.value = country;
        option.textContent = country;
        filter.appendChild(option);
    });
}

function displayData(data) {
    tableBody.innerHTML = "";

    data.forEach(d => {
        const row = `
            <tr>
                <td>${d.name}</td>
                <td>${d.contact}</td>
                <td>${d.email}</td>
                <td>${d.country}</td>
                <td>${d.days}</td>
                <td>${d.accommodation}</td>
                <td>${timeAgo(d.timestamp)}</td>
            </tr>
        `;
        tableBody.innerHTML += row;
    });
}

filter.addEventListener("change", () => {
    const value = filter.value;

    if (value === "all") {
        displayData(allData);
    } else {
        const filtered = allData.filter(d => d.country === value);
        displayData(filtered);
    }
    // updateStats();
});

loadData();

function updateStats() {
    document.getElementById("total").textContent = allData.length;

    const accommodationCount = allData.filter(d => d.accommodation === "Yes").length;
    document.getElementById("accommodationCount").textContent = accommodationCount;

    const countries = new Set(allData.map(d => d.country));
    document.getElementById("countriesCount").textContent = countries.size;
}

function timeAgo(timestamp) {
    if (!timestamp) return "N/A";

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