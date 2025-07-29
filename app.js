// Select elements
const form = document.getElementById("entry-form");
const dateInput = document.getElementById("date-input");
const checkin1Input = document.getElementById("checkin1-input");
const checkout1Input = document.getElementById("checkout1-input");
const checkin2Input = document.getElementById("checkin2-input");
const checkout2Input = document.getElementById("checkout2-input");
const entriesTableBody = document.getElementById("entries-table-body");
const monthlyTotalDisplay = document.getElementById("monthly-total");

let entries = [];

// Initialize form date input to today
function setTodayDate() {
  const today = new Date().toISOString().slice(0, 10);
  dateInput.value = today;
}

// Calculate difference in minutes between two time strings "HH:MM"
function timeDiffInMinutes(start, end) {
  if (!start || !end) return 0;
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  let startMinutes = sh * 60 + sm;
  let endMinutes = eh * 60 + em;
  // Handle if end is before start (assume next day)
  if (endMinutes < startMinutes) endMinutes += 24 * 60;
  return Math.max(0, endMinutes - startMinutes);
}

// Format minutes to "Xh Ym"
function formatMinutes(totalMinutes) {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${h}h ${m}m`;
}

// Calculate total hours from two check-in/out pairs
function calculateTotalHours(entry) {
  const session1 = timeDiffInMinutes(entry.checkin1, entry.checkout1);
  const session2 = timeDiffInMinutes(entry.checkin2, entry.checkout2);
  return session1 + session2;
}

// Render entries in the table
function renderEntries() {
  entriesTableBody.innerHTML = "";
  entries.forEach((entry, index) => {
    const totalMinutes = calculateTotalHours(entry);
    const totalFormatted = formatMinutes(totalMinutes);

    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${entry.date}</td>
      <td>${entry.checkin1 || ""}</td>
      <td>${entry.checkout1 || ""}</td>
      <td>${entry.checkin2 || ""}</td>
      <td>${entry.checkout2 || ""}</td>
      <td>${totalFormatted}</td>
      <td>
        <button class="edit-btn" data-index="${index}">✏️</button>
        <button class="delete-btn" data-index="${index}">🗑️</button>
      </td>
    `;

    entriesTableBody.appendChild(tr);
  });

  updateMonthlyTotal();
}

// Update the total hours for current month
function updateMonthlyTotal() {
  const thisMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
  let totalMins = 0;

  entries.forEach((entry) => {
    if (entry.date.startsWith(thisMonth)) {
      totalMins += calculateTotalHours(entry);
    }
  });

  monthlyTotalDisplay.textContent = formatMinutes(totalMins);
}

// Clear form inputs (except date, keep it today)
function clearForm() {
  checkin1Input.value = "";
  checkout1Input.value = "";
  checkin2Input.value = "";
  checkout2Input.value = "";
}

// Add new entry from form
form.addEventListener("submit", (e) => {
  e.preventDefault();

  // Validate required fields
  if (!dateInput.value || !checkin1Input.value || !checkout1Input.value) {
    alert("Please fill date, first check-in and check-out times.");
    return;
  }

  const newEntry = {
    date: dateInput.value,
    checkin1: checkin1Input.value,
    checkout1: checkout1Input.value,
    checkin2: checkin2Input.value || "",
    checkout2: checkout2Input.value || "",
  };

  entries.push(newEntry);
  renderEntries();
  clearForm();
});

// Handle edit and delete clicks
entriesTableBody.addEventListener("click", (e) => {
  if (e.target.classList.contains("edit-btn")) {
    const index = e.target.dataset.index;
    const entry = entries[index];

    // Fill form with existing entry data for editing
    dateInput.value = entry.date;
    checkin1Input.value = entry.checkin1;
    checkout1Input.value = entry.checkout1;
    checkin2Input.value = entry.checkin2;
    checkout2Input.value = entry.checkout2;

    // Remove the entry from array to update on submit
    entries.splice(index, 1);
    renderEntries();

  } else if (e.target.classList.contains("delete-btn")) {
    const index = e.target.dataset.index;
    entries.splice(index, 1);
    renderEntries();
  }
});

// Initialize
setTodayDate();
renderEntries();
