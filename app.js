// Elements
const form = document.getElementById('entry-form');
const tbody = document.getElementById('entries-tbody');

const dateInput = document.getElementById('date');
const checkin1Input = document.getElementById('checkin1');
const checkout1Input = document.getElementById('checkout1');
const checkin2Input = document.getElementById('checkin2');
const checkout2Input = document.getElementById('checkout2');

let entries = JSON.parse(localStorage.getItem('jobEntries') || '[]');
let editIndex = -1;

// Utility: Format date as YYYY-MM-DD (input date format)
function formatDateToInput(date) {
  return date.toISOString().slice(0, 10);
}

// Utility: Calculate total hours between time strings (HH:mm)
function diffTime(start, end) {
  if (!start || !end) return 0;
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  let startMinutes = sh * 60 + sm;
  let endMinutes = eh * 60 + em;
  let diff = endMinutes - startMinutes;
  if(diff < 0) diff = 0; // no negative time
  return diff;
}

// Convert minutes to 'Xh Ym' string
function minutesToHoursMins(mins) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h}h ${m}m`;
}

// Calculate total hours string for one entry
function calculateTotalHours(entry) {
  const firstSession = diffTime(entry.checkin1, entry.checkout1);
  const secondSession = diffTime(entry.checkin2, entry.checkout2);
  return minutesToHoursMins(firstSession + secondSession);
}

// Render entries table rows
function renderEntries() {
  tbody.innerHTML = '';

  entries.forEach((entry, index) => {
    const tr = document.createElement('tr');

    tr.innerHTML = `
      <td data-label="Date">${entry.date}</td>
      <td data-label="Check-in 1">${entry.checkin1 || '--:--'}</td>
      <td data-label="Check-out 1">${entry.checkout1 || '--:--'}</td>
      <td data-label="Check-in 2">${entry.checkin2 || '--:--'}</td>
      <td data-label="Check-out 2">${entry.checkout2 || '--:--'}</td>
      <td data-label="Total Hours">${calculateTotalHours(entry)}</td>
      <td data-label="Actions">
        <button class="edit-btn" onclick="editEntry(${index})" aria-label="Edit Entry">✏️</button>
        <button class="delete-btn" onclick="deleteEntry(${index})" aria-label="Delete Entry">🗑️</button>
      </td>
    `;

    tbody.appendChild(tr);
  });
}

// Add or update entry from form data
form.addEventListener('submit', e => {
  e.preventDefault();

  const newEntry = {
    date: dateInput.value,
    checkin1: checkin1Input.value,
    checkout1: checkout1Input.value,
    checkin2: checkin2Input.value,
    checkout2: checkout2Input.value,
  };

  // Simple validation: check-in < check-out
  if (newEntry.checkin1 >= newEntry.checkout1) {
    alert('Check-out 1 time must be after Check-in 1 time');
    return;
  }
  if (newEntry.checkin2 && newEntry.checkout2 && newEntry.checkin2 >= newEntry.checkout2) {
    alert('Check-out 2 time must be after Check-in 2 time');
    return;
  }

  if (editIndex === -1) {
    // Add new
    entries.push(newEntry);
  } else {
    // Update existing
    entries[editIndex] = newEntry;
    editIndex = -1;
  }

  localStorage.setItem('jobEntries', JSON.stringify(entries));
  renderEntries();
  form.reset();
  setTodayDate();
  form.querySelector('button[type="submit"]').textContent = 'Add Entry';
});

// Delete entry
function deleteEntry(index) {
  if (confirm('Are you sure you want to delete this entry?')) {
    entries.splice(index, 1);
    localStorage.setItem('jobEntries', JSON.stringify(entries));
    renderEntries();
  }
}

// Edit entry
function editEntry(index) {
  const entry = entries[index];
  dateInput.value = entry.date;
  checkin1Input.value = entry.checkin1;
  checkout1Input.value = entry.checkout1;
  checkin2Input.value = entry.checkin2;
  checkout2Input.value = entry.checkout2;

  editIndex = index;
  form.querySelector('button[type="submit"]').textContent = 'Update Entry';
}

// Set date input to today's date
function setTodayDate() {
  const today = new Date();
  dateInput.value = formatDateToInput(today);
}

// Initialize
setTodayDate();
renderEntries();
