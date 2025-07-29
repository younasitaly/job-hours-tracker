// Firebase setup
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDwlEQZJmI3AEDJWCRtpKgBXBr1qD-4-Ow",
  authDomain: "jobhourstracker.firebaseapp.com",
  projectId: "jobhourstracker",
  storageBucket: "jobhourstracker.firebasestorage.app",
  messagingSenderId: "401383939095",
  appId: "1:401383939095:web:e5e5c056a12fc47fd99052"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const entriesRef = collection(db, "entries");

// Format date to dd/mm/yyyy
function formatDate(dateStr) {
  const [yyyy, mm, dd] = dateStr.split("-");
  return `${dd}/${mm}/${yyyy}`;
}

// Calculate total time from check-ins and outs
function calculateTotalHours(ci1, co1, ci2, co2) {
  const toMin = t => {
    if (!t) return 0;
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
  };
  const diff1 = toMin(co1) - toMin(ci1);
  const diff2 = toMin(co2) - toMin(ci2);
  const total = diff1 + diff2;
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `${h}h ${m}m`;
}

function renderEntry(docSnap, id) {
  const { date, checkin1, checkout1, checkin2, checkout2 } = docSnap;
  const tr = document.createElement("tr");

  tr.innerHTML = `
    <td>${formatDate(date)}</td>
    <td>${checkin1 || ""}</td>
    <td>${checkout1 || ""}</td>
    <td>${checkin2 || ""}</td>
    <td>${checkout2 || ""}</td>
    <td>${calculateTotalHours(checkin1, checkout1, checkin2, checkout2)}</td>
    <td>
      <button onclick="deleteEntry('${id}')">🗑️</button>
    </td>
  `;

  document.querySelector("tbody").appendChild(tr);
}

async function loadEntries() {
  document.querySelector("tbody").innerHTML = "";
  const snapshot = await getDocs(entriesRef);
  snapshot.forEach(doc => {
    renderEntry(doc.data(), doc.id);
  });
}

document.getElementById("hoursForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const date = document.getElementById("date").value;
  const checkin1 = document.getElementById("checkin1").value;
  const checkout1 = document.getElementById("checkout1").value;
  const checkin2 = document.getElementById("checkin2").value;
  const checkout2 = document.getElementById("checkout2").value;

  await addDoc(entriesRef, {
    date,
    checkin1,
    checkout1,
    checkin2,
    checkout2
  });

  await loadEntries();
  e.target.reset();
  document.getElementById("date").valueAsDate = new Date();
});

window.deleteEntry = async (id) => {
  await deleteDoc(doc(entriesRef, id));
  loadEntries();
};

// Set today's date on load
document.getElementById("date").valueAsDate = new Date();
loadEntries();

// Dark mode toggle
const toggleBtn = document.getElementById("theme-toggle");

function applyTheme(theme) {
  document.body.classList.toggle("dark", theme === "dark");
  localStorage.setItem("theme", theme);
}

toggleBtn.addEventListener("click", () => {
  const newTheme = document.body.classList.contains("dark") ? "light" : "dark";
  applyTheme(newTheme);
});

applyTheme(localStorage.getItem("theme") || "light");
