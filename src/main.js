import { initNavigation } from './modules/navigation.js';
import { initWeeklyBoss } from './modules/weekly-boss.js';
import { initSpikeDisplay } from './modules/spike-display.js';
import { initPetMarket } from './modules/pet-market.js';

document.addEventListener("DOMContentLoaded", function () {
  initNavigation();
  initWeeklyBoss();
  initSpikeDisplay();
  initPetMarket();
});