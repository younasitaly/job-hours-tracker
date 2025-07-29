const entryForm = document.getElementById('entryForm');
const dateInput = document.getElementById('date');
const checkInInput = document.getElementById('checkIn');
const checkOutInput = document.getElementById('checkOut');
const breakInput = document.getElementById('breakTime');
const entriesTableBody = document.getElementById('entriesTableBody');
const monthlyTotalEl = document.getElementById('monthlyTotal');
const exportPdfBtn = document.getElementById('exportPdfBtn');
const themeToggleBtn = document.getElementById('themeToggle');

let entries = JSON.parse(localStorage.getItem('jobEntries') || '[]');
let editingIndex = null;

function parseTimeToMinutes(timeStr) {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
}

function formatMinutesToHours(mins) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h}h ${m}m`;
}

function calculateTotalHours(checkIn, checkOut, breakTime) {
  const checkInMins = parseTimeToMinutes(checkIn);
  const checkOutMins = parseTimeToMinutes(checkOut);
  const breakMins = parseTimeToMinutes(breakTime);
  let total = checkOutMins - checkInMins - breakMins;
  if (total < 0) total = 0;
  return total;
}

function renderEntries() {
  entriesTableBody.innerHTML = '';
  entries.forEach((entry, i) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${entry.date}</td>
      <td>${entry.checkIn}</td>
      <td>${entry.checkOut}</td>
      <td>${entry.breakTime}</td>
      <td>${formatMinutesToHours(entry.totalMinutes)}</td>
      <td>
        <button class="edit-btn" data-index="${i}">✏️</button>
        <button class="delete-btn" data-index="${i}">🗑️</button>
      </td>
    `;
    entriesTableBody.appendChild(tr);
  });
  renderMonthlyTotal();
}

function renderMonthlyTotal() {
  const now = new Date();
  const thisMonth = now.getMonth();
  const thisYear = now.getFullYear();

  const totalMins = entries.reduce((acc, entry) => {
    const [year, month] = entry.date.split('-').map(Number);
    if (year === thisYear && month === thisMonth + 1) {
      return acc + entry.totalMinutes;
    }
    return acc;
  }, 0);

  monthlyTotalEl.textContent = `Total hours this month: ${formatMinutesToHours(totalMins)}`;
}

entryForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const date = dateInput.value;
  const checkIn = checkInInput.value;
  const checkOut = checkOutInput.value;
  const breakTime = breakInput.value || '00:00';

  if (!date || !checkIn || !checkOut) {
    alert("Please fill in all required fields.");
    return;
  }

  const totalMinutes = calculateTotalHours(checkIn, checkOut, breakTime);

  const entry = { date, checkIn, checkOut, breakTime, totalMinutes };

  if (editingIndex !== null) {
    entries[editingIndex] = entry;
    editingIndex = null;
  } else {
    entries.push(entry);
  }

  localStorage.setItem('jobEntries', JSON.stringify(entries));
  entryForm.reset();
  renderEntries();
});

entriesTableBody.addEventListener('click', (e) => {
  const index = e.target.dataset.index;
  if (e.target.classList.contains('edit-btn')) {
    const entry = entries[index];
    dateInput.value = entry.date;
    checkInInput.value = entry.checkIn;
    checkOutInput.value = entry.checkOut;
    breakInput.value = entry.breakTime;
    editingIndex = index;
  } else if (e.target.classList.contains('delete-btn')) {
    if (confirm("Delete this entry?")) {
      entries.splice(index, 1);
      localStorage.setItem('jobEntries', JSON.stringify(entries));
      renderEntries();
    }
  }
});

// Initial render
renderEntries();
// Theme toggle
const isDark = localStorage.getItem('theme') === 'dark';

if (isDark) document.body.classList.add('dark');

themeToggleBtn.textContent = isDark ? '☀️' : '🌙';

themeToggleBtn.addEventListener('click', () => {
  document.body.classList.toggle('dark');
  const isNowDark = document.body.classList.contains('dark');
  localStorage.setItem('theme', isNowDark ? 'dark' : 'light');
  themeToggleBtn.textContent = isNowDark ? '☀️' : '🌙';
});

