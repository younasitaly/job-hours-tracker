// Job Hours Tracker app.js

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
  if(total < 0) total = 0;
  return total;
}

function renderEntries() {
  entriesTableBody.innerHTML = '';
  entries.forEach((entry, i) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td data-label="Date">${entry.date}</td>
      <td data-label="Check-in">${entry.checkIn}</td>
      <td data-label="Check-out">${entry.checkOut}</td>
      <td data-label="Break">${entry.breakTime}</td>
      <td data-label="Total Hours">${formatMinutesToHours(entry.totalMinutes)}</td>
      <td data-label="Actions">
        <button class="edit-btn" aria-label="Edit entry on ${entry.date}" data-index="${i}">✏️</button>
        <button class="delete-btn" aria-label="Delete entry on ${entry.date}" data-index="${i}">🗑️</button>
      </td>
    `;
    entriesTableBody.appendChild(tr);
  });
  renderMonthlyTotal();
}

function renderMonthlyTotal() {
  if(entries.length === 0){
    monthlyTotalEl.textContent = 'Total hours this month: 0';
    return;
  }
  const now = new Date();
  const thisMonth = now.getMonth();
  const thisYear = now.getFullYear();
  const totalMins = entries.reduce((acc, entry) => {
    const [year, month] = entry.date.split('-').map(Number);
    if(year === thisYear && month === thisMonth + 1) {
      return acc + entry
