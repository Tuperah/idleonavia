import { v } from './random.js';

const PET_MARKET_START_DATE = new Date('2026-02-19');

function getDayNumber(date) {
  const diffTime = date - PET_MARKET_START_DATE;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return diffDays + 1;
}

function calculateGems(dayNumber, isEvent) {
  v.makeRandom(dayNumber);
  const randomValue = v.getRandom();
  
  const baseGems = 
    Math.min(
      150,
      Math.max(10, 10 + Math.floor(130 * Math.pow(randomValue, 10)) + 10 * randomValue)
    );
  
  const multiplier = isEvent ? 5 : 1;
  return Math.round(Math.min(500, baseGems * multiplier));
}

function initPetMarket() {
  const dateInput = document.getElementById('pet-market-date');
  const eventCheckbox = document.getElementById('pet-market-event');
  const calculateBtn = document.getElementById('pet-market-calculate');
  const tableBody = document.getElementById('pet-market-table-body');
  
  if (!dateInput || !calculateBtn || !tableBody) return;
  
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  dateInput.value = todayStr;
  
  updateFutureDaysTable();
  calculateResult();
  
  calculateBtn.addEventListener('click', function() {
    calculateResult();
  });
  
  eventCheckbox.addEventListener('change', function() {
    updateFutureDaysTable();
    calculateResult();
  });
  
  dateInput.addEventListener('change', function() {
    calculateResult();
  });
}

function calculateResult() {
  const dateInput = document.getElementById('pet-market-date');
  const eventCheckbox = document.getElementById('pet-market-event');
  
  const selectedDate = new Date(dateInput.value);
  const dayNumber = getDayNumber(selectedDate);
  const isEvent = eventCheckbox.checked;
  const gems = calculateGems(dayNumber, isEvent);
  
  v.makeRandom(dayNumber);
  const randomValue = v.getRandom();
  
  document.getElementById('result-date').textContent = dateInput.value;
  document.getElementById('result-random').textContent = randomValue.toString();
  document.getElementById('result-gems').innerHTML = `${gems}`;
}

function updateFutureDaysTable() {
  const tableBody = document.getElementById('pet-market-table-body');
  const eventCheckbox = document.getElementById('pet-market-event');
  
  if (!tableBody) return;
  
  const isEvent = eventCheckbox ? eventCheckbox.checked : false;
  const today = new Date();
  
  tableBody.innerHTML = '';
  
  for (let i = 0; i < 10; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    
    const dayNumber = getDayNumber(date);
    const gems = calculateGems(dayNumber, isEvent);
    
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${date.toISOString().split('T')[0]}</td>
      <td>${gems}</td>
    `;
    tableBody.appendChild(row);
  }
}

export { initPetMarket, calculateResult, updateFutureDaysTable };