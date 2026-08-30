import { v } from './random.js';

// Copy lines 1-6 from app.js (the global state variables for spike display)
let currentState = {
  round: 1,
};
let allRoundsData = [];
let currentPredictionHour = null;
let currentRoundsData = [];
let safetyFormatData = [];
let mobileSafetyFormatData = [];
let nonMobileSafetyFormatData = [];

// Then copy lines 269-1367 from app.js EXACTLY as-is
function initSpikeDisplay() {
  updateTimeDisplay();
  const now = new Date();
  let predictionDate = new Date(now);
  if (now.getMinutes() >= 10) {
    predictionDate.setHours(predictionDate.getHours() + 1);
  }
  predictionDate.setMinutes(0);
  predictionDate.setSeconds(0);
  predictionDate.setMilliseconds(0);
  const predictionTimestamp = Math.floor(predictionDate.getTime() / 1000);
  const predictionHour = Math.floor(predictionTimestamp / 3600);
  setPredictionHour(predictionHour);

  updateSpikeDisplay();
  setupEventListeners();
  updateMobileRoundInfo();
  setupMobileModeToggle();
  setupTabs();
  updateMinOpTable();

  console.log("=== 生成所有15个回合的数据 ===");
  for (let round = 1; round <= 15; round++) {
    getSpikeDistributionWithDetails(round, predictionHour);
  }
  console.log("=== 数据生成完毕 ===");
}

function getSpikeDistributionWithDetails(round, predictionHour) {
  if (round > 15) round = 15;

  const now = new Date();

  let predictionDate = new Date(now);
  predictionDate.setTime(predictionHour * 3600 * 1000);

  const predictionTimestamp = predictionHour * 3600;

  const randomPart = generateRandomPart(predictionHour);

  const actualRound = round;

  const len = randomPart.length;
  let posCalc = len - (actualRound - Math.floor(actualRound / len) * len);
  let position = Math.floor(posCalc) % len;
  if (position < 0) position += len;

  let firstDummyNumber = 0;
  if (position < randomPart.length) {
    const charAtPos = randomPart.charAt(position);
    if (!isNaN(parseInt(charAtPos))) {
      firstDummyNumber = parseInt(charAtPos);
    }
  }

  if (actualRound > len) {
    const extra = Math.floor(actualRound / len);
    firstDummyNumber += extra;
  }

  if (firstDummyNumber > 9) {
    firstDummyNumber = firstDummyNumber - 9 * Math.floor(firstDummyNumber / 9);
  }

  if (firstDummyNumber > 6) {
    if (randomPart.length > 0) {
      const firstChar = randomPart.charAt(0);
      const firstDigit = !isNaN(parseInt(firstChar)) ? parseInt(firstChar) : 0;
      const adjustment = Math.floor(firstDigit / 4);
      firstDummyNumber = firstDummyNumber - 6 + adjustment;
    }
  }

  let firstTriggerText = "";
  if (firstDummyNumber % 3 === 0) {
    firstTriggerText = "Top";
  } else if (firstDummyNumber % 3 === 1) {
    firstTriggerText = "Mid";
  } else {
    firstTriggerText = "Bot";
  }

  if (firstDummyNumber % 2 === 1) {
    firstTriggerText += "Right";
  } else {
    firstTriggerText += "Left";
  }

  let secondTriggerText = null;
  if (actualRound > 6) {
    let secondDummyNumber = firstDummyNumber + 1;

    if (secondDummyNumber > 9) {
      secondDummyNumber =
        secondDummyNumber - 9 * Math.floor(secondDummyNumber / 9);
    }

    if (secondDummyNumber > 6) {
      if (randomPart.length > 0) {
        const firstChar = randomPart.charAt(0);
        const firstDigit = !isNaN(parseInt(firstChar))
          ? parseInt(firstChar)
          : 0;
        const adjustment = Math.floor(firstDigit / 4);
        secondDummyNumber = secondDummyNumber - 6 + adjustment;
      }
    }

    secondTriggerText = "";
    if (secondDummyNumber % 3 === 0) {
      secondTriggerText = "Top";
    } else if (secondDummyNumber % 3 === 1) {
      secondTriggerText = "Mid";
    } else {
      secondTriggerText = "Bot";
    }

    if (secondDummyNumber % 2 === 1) {
      secondTriggerText += "Right";
    } else {
      secondTriggerText += "Left";
    }
  }

  const grid = triggerTextToGridSeparate(
    firstTriggerText,
    secondTriggerText,
    actualRound > 3,
  );

  console.log(`回合 ${round}:`);
  console.log(
    `  预测时间: ${predictionDate.getFullYear()}-${String(predictionDate.getMonth() + 1).padStart(2, "0")}-${String(predictionDate.getDate()).padStart(2, "0")} ${String(predictionDate.getHours()).padStart(2, "0")}:${String(predictionDate.getMinutes()).padStart(2, "0")}:${String(predictionDate.getSeconds()).padStart(2, "0")}`,
  );
  console.log(`  时间戳: ${predictionTimestamp}`);
  console.log(`  小时数: ${predictionHour}`);
  console.log(`  随机数部分: ${randomPart}`);
  console.log(`  First TriggerText: ${firstTriggerText}`);
  console.log(`  Second TriggerText: ${secondTriggerText || "null"}`);
  console.log(`  RightLeft: ${actualRound > 3 ? "是" : "否"}`);

  return {
    top: grid[0].join(""),
    mid: grid[1].join(""),
    bot: grid[2].join(""),
  };
}

function setPredictionHour(predictionHour) {
  currentPredictionHour = predictionHour;
  currentRoundsData = [];

  v.makeRandom(Math.round(predictionHour));
  const randomValue = v.getRandom();
  const strValue = randomValue.toString();
  const randomPart = strValue.includes(".") ? strValue.split(".")[1] : strValue;

  for (let round = 1; round <= 15; round++) {
    const spikeData = getSpikeDistributionWithRandomPart(round, randomPart);
    currentRoundsData.push(spikeData);
  }

  mobileSafetyFormatData = calculateSafetyFormatData(true);
  nonMobileSafetyFormatData = calculateSafetyFormatData(false);

  const isMobileMode = localStorage.getItem("mobileMode") === "true";
  safetyFormatData = isMobileMode
    ? mobileSafetyFormatData
    : nonMobileSafetyFormatData;
}

function updateTimeDisplay() {
  const now = new Date();
  document.getElementById("current-time").textContent =
    `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;

  let predictionDate = new Date(now);
  if (now.getMinutes() >= 10) {
    predictionDate.setHours(predictionDate.getHours() + 1);
  }

  predictionDate.setMinutes(0);
  predictionDate.setSeconds(0);
  predictionDate.setMilliseconds(0);

  document.getElementById("prediction-time").textContent =
    `${predictionDate.getFullYear()}-${String(predictionDate.getMonth() + 1).padStart(2, "0")}-${String(predictionDate.getDate()).padStart(2, "0")} ${String(predictionDate.getHours()).padStart(2, "0")}:${String(predictionDate.getMinutes()).padStart(2, "0")}:${String(predictionDate.getSeconds()).padStart(2, "0")}`;

  const predictionTimestamp = Math.floor(predictionDate.getTime() / 1000);
  const expectedPredictionHour = Math.floor(predictionTimestamp / 3600);

  if (currentPredictionHour !== expectedPredictionHour) {
    setPredictionHour(expectedPredictionHour);
    updateSpikeDisplay();
    updateMinOpTable();
    console.log("已更新到下一个小时的尖刺分布: " + expectedPredictionHour);
  }

  document.getElementById("current-round").textContent = currentState.round;
  document.getElementById("round-number").textContent = currentState.round;
}

function generateRandomPart(hour) {
  v.makeRandom(Math.round(hour));
  const randomValue = v.getRandom();
  const strValue = randomValue.toString();
  return strValue.includes(".") ? strValue.split(".")[1] : strValue;
}

function getSpikeDistribution(round) {
  if (currentRoundsData.length > 0 && round <= currentRoundsData.length) {
    return currentRoundsData[round - 1];
  }

  if (round > 15) round = 15;

  const predictionHour = currentPredictionHour;

  const randomPart = generateRandomPart(predictionHour);

  const actualRound = round;

  const len = randomPart.length;
  let posCalc = len - (actualRound - Math.floor(actualRound / len) * len);
  let position = Math.floor(posCalc) % len;
  if (position < 0) position += len;

  let firstDummyNumber = 0;
  if (position < randomPart.length) {
    const charAtPos = randomPart.charAt(position);
    if (!isNaN(parseInt(charAtPos))) {
      firstDummyNumber = parseInt(charAtPos);
    }
  }

  if (actualRound > len) {
    const extra = Math.floor(actualRound / len);
    firstDummyNumber += extra;
  }

  if (firstDummyNumber > 9) {
    firstDummyNumber = firstDummyNumber - 9 * Math.floor(firstDummyNumber / 9);
  }

  if (firstDummyNumber > 6) {
    if (randomPart.length > 0) {
      const firstChar = randomPart.charAt(0);
      const firstDigit = !isNaN(parseInt(firstChar)) ? parseInt(firstChar) : 0;
      const adjustment = Math.floor(firstDigit / 4);
      firstDummyNumber = firstDummyNumber - 6 + adjustment;
    }
  }

  let firstTriggerText = "";
  if (firstDummyNumber % 3 === 0) {
    firstTriggerText = "Top";
  } else if (firstDummyNumber % 3 === 1) {
    firstTriggerText = "Mid";
  } else {
    firstTriggerText = "Bot";
  }

  if (firstDummyNumber % 2 === 1) {
    firstTriggerText += "Right";
  } else {
    firstTriggerText += "Left";
  }

  let secondTriggerText = null;
  if (actualRound > 6) {
    let secondDummyNumber = firstDummyNumber + 1;

    if (secondDummyNumber > 9) {
      secondDummyNumber =
        secondDummyNumber - 9 * Math.floor(secondDummyNumber / 9);
    }

    if (secondDummyNumber > 6) {
      if (randomPart.length > 0) {
        const firstChar = randomPart.charAt(0);
        const firstDigit = !isNaN(parseInt(firstChar))
          ? parseInt(firstChar)
          : 0;
        const adjustment = Math.floor(firstDigit / 4);
        secondDummyNumber = secondDummyNumber - 6 + adjustment;
      }
    }

    secondTriggerText = "";
    if (secondDummyNumber % 3 === 0) {
      secondTriggerText = "Top";
    } else if (secondDummyNumber % 3 === 1) {
      secondTriggerText = "Mid";
    } else {
      secondTriggerText = "Bot";
    }

    if (secondDummyNumber % 2 === 1) {
      secondTriggerText += "Right";
    } else {
      secondTriggerText += "Left";
    }
  }

  const grid = triggerTextToGridSeparate(
    firstTriggerText,
    secondTriggerText,
    actualRound > 3,
  );

  console.log(`回合 ${round}:`);
  console.log(
    `  预测时间: ${predictionDate.getFullYear()}-${String(predictionDate.getMonth() + 1).padStart(2, "0")}-${String(predictionDate.getDate()).padStart(2, "0")} ${String(predictionDate.getHours()).padStart(2, "0")}:${String(predictionDate.getMinutes()).padStart(2, "0")}:${String(predictionDate.getSeconds()).padStart(2, "0")}`,
  );
  console.log(`  时间戳: ${predictionTimestamp}`);
  console.log(`  小时数: ${predictionHour}`);
  console.log(`  随机数部分: ${randomPart}`);
  console.log(`  First TriggerText: ${firstTriggerText}`);
  console.log(`  Second TriggerText: ${secondTriggerText || "null"}`);
  console.log(`  RightLeft: ${actualRound > 3 ? "是" : "否"}`);

  return {
    top: grid[0].join(""),
    mid: grid[1].join(""),
    bot: grid[2].join(""),
  };
}

function processRightLeft(grid, affectedRows) {
  for (let i = 0; i < 3; i++) {
    if (affectedRows[i]) {
      const leftHasSpikes = grid[i].slice(0, 10).some((cell) => cell === "↑");

      const rightHasSpikes = grid[i].slice(10, 20).some((cell) => cell === "↑");

      if (!leftHasSpikes) {
        setSpikes(grid, i, 0, 10);
      }

      if (!rightHasSpikes) {
        setSpikes(grid, i, 10, 20);
      }
    }
  }
}

function triggerTextToGridSeparate(
  firstTriggerText,
  secondTriggerText,
  hasRightLeft,
) {
  const grid = [Array(20).fill("_"), Array(20).fill("_"), Array(20).fill("_")];

  if (firstTriggerText) {
    if (firstTriggerText.indexOf("Top") !== -1) {
      if (firstTriggerText.indexOf("Left") !== -1) {
        setSpikes(grid, 0, 0, 10);
      }
      if (firstTriggerText.indexOf("Right") !== -1) {
        setSpikes(grid, 0, 10, 20);
      }
    } else if (firstTriggerText.indexOf("Mid") !== -1) {
      if (firstTriggerText.indexOf("Left") !== -1) {
        setSpikes(grid, 1, 0, 10);
      }
      if (firstTriggerText.indexOf("Right") !== -1) {
        setSpikes(grid, 1, 10, 20);
      }
    } else if (firstTriggerText.indexOf("Bot") !== -1) {
      if (firstTriggerText.indexOf("Left") !== -1) {
        setSpikes(grid, 2, 0, 10);
      }
      if (firstTriggerText.indexOf("Right") !== -1) {
        setSpikes(grid, 2, 10, 20);
      }
    }

    if (hasRightLeft) {
      if (firstTriggerText.indexOf("Top") !== -1) {
        processRightLeft(grid, [true, false, false]);
      } else if (firstTriggerText.indexOf("Mid") !== -1) {
        processRightLeft(grid, [false, true, false]);
      } else if (firstTriggerText.indexOf("Bot") !== -1) {
        processRightLeft(grid, [false, false, true]);
      }
    }
  }

  if (secondTriggerText) {
    if (secondTriggerText.indexOf("Top") !== -1) {
      if (secondTriggerText.indexOf("Left") !== -1) {
        setSpikes(grid, 0, 0, 10);
      }
      if (secondTriggerText.indexOf("Right") !== -1) {
        setSpikes(grid, 0, 10, 20);
      }
    } else if (secondTriggerText.indexOf("Mid") !== -1) {
      if (secondTriggerText.indexOf("Left") !== -1) {
        setSpikes(grid, 1, 0, 10);
      }
      if (secondTriggerText.indexOf("Right") !== -1) {
        setSpikes(grid, 1, 10, 20);
      }
    } else if (secondTriggerText.indexOf("Bot") !== -1) {
      if (secondTriggerText.indexOf("Left") !== -1) {
        setSpikes(grid, 2, 0, 10);
      }
      if (secondTriggerText.indexOf("Right") !== -1) {
        setSpikes(grid, 2, 10, 20);
      }
    }
  }

  return grid;
}

function setSpikes(grid, row, startCol, endCol) {
  for (let j = startCol; j < endCol; j++) {
    grid[row][j] = "↑";
  }
}

function updateSpikeDisplay() {
  const spikeData = getSpikeDistribution(currentState.round);
  const safePositions = findSafePositions(currentRoundsData);

  updateRow("top", spikeData.top, safePositions.top);
  updateRow("mid", spikeData.mid, safePositions.mid);
  updateRow("bot", spikeData.bot, safePositions.bot);
}

function updateRow(rowId, rowData, safePositions) {
  for (let i = 0; i < 20; i++) {
    const cell = document.getElementById(`${rowId}-${i}`);
    if (rowData[i] === "↑") {
      cell.textContent = "↑";
      cell.className = "spike-cell spike-active";
    } else {
      if (safePositions.includes(i)) {
        cell.textContent = "★";
        cell.className = "spike-cell spike-safe";
      } else {
        cell.textContent = " ";
        cell.className = "spike-cell spike-inactive";
      }
    }
  }
}

function setupEventListeners() {
  document.getElementById("prev-round").addEventListener("click", function () {
    currentState.round = Math.max(1, currentState.round - 1);
    updateAll();
  });

  document.getElementById("next-round").addEventListener("click", function () {
    currentState.round = Math.min(15, currentState.round + 1); // 限制到15回合
    updateAll();
  });
}

function updateAll() {
  updateTimeDisplay();
  updateSpikeDisplay();
  updateMobileRoundInfo();
}

function updateMobileRoundInfo() {
  const roundNumber = currentState.round;
  const roundDisplayElement = document.getElementById("round-display");
  const mobileDisplayElement = document.getElementById("mobile-display");
  const isMobileMode = localStorage.getItem("mobileMode") === "true"; // 默认为false（非移动端模式）

  if (isMobileMode) {
    // 移动端模式
    roundDisplayElement.style.display = "none";
    mobileDisplayElement.style.display = "block";
    if (roundNumber === 1) {
      mobileDisplayElement.textContent = "移动端从下一回合开始";
    } else {
      mobileDisplayElement.textContent = `移动端第 ${roundNumber - 1} 回合`;
    }
  } else {
    // 非移动端模式
    roundDisplayElement.style.display = "block";
    mobileDisplayElement.style.display = "none";
    roundDisplayElement.innerHTML = `第 <span id="round-number">${roundNumber}</span> 回合`;
  }
}

function setupMobileModeToggle() {
  const nonMobileBtn = document.getElementById("non-mobile-btn");
  const mobileBtn = document.getElementById("mobile-btn");

  // 从localStorage获取当前模式，如果不存在则默认为非移动端模式（false）
  let isMobileMode = localStorage.getItem("mobileMode");
  if (isMobileMode === null) {
    isMobileMode = "false"; // 默认为非移动端模式
    localStorage.setItem("mobileMode", isMobileMode);
  } else {
    isMobileMode = isMobileMode === "true";
  }

  // 根据当前模式设置按钮状态和安全位置数据
  updateButtonStates(isMobileMode);

  // 为非移动端按钮添加点击事件
  nonMobileBtn.addEventListener("click", function () {
    isMobileMode = false;

    // 更新localStorage
    localStorage.setItem("mobileMode", isMobileMode);

    // 更新按钮状态和安全位置数据
    updateButtonStates(isMobileMode);

    // 更新显示信息
    updateMobileRoundInfo();

    // 更新表格数据
    updateMinOpTable();
  });

  // 为移动端按钮添加点击事件
  mobileBtn.addEventListener("click", function () {
    isMobileMode = true;

    // 更新localStorage
    localStorage.setItem("mobileMode", isMobileMode);

    // 更新按钮状态和安全位置数据
    updateButtonStates(isMobileMode);

    // 更新显示信息
    updateMobileRoundInfo();

    // 更新表格数据
    updateMinOpTable();
  });
}

// 设置tab切换功能
function setupTabs() {
  const tabBtns = document.querySelectorAll(".spike-tab-btn");

  tabBtns.forEach((btn) => {
    btn.addEventListener("click", function () {
      const tabId = this.getAttribute("data-tab");

      // 移除所有激活状态
      document.querySelectorAll(".spike-tab-btn").forEach((b) => {
        b.classList.remove("active");
      });
      document.querySelectorAll(".spike-tab-pane").forEach((pane) => {
        pane.classList.remove("active");
      });

      // 激活当前tab
      this.classList.add("active");
      document.getElementById(tabId).classList.add("active");

      // 如果切换到懒人tab，更新表格
      if (tabId === "lazy-tab") {
        updateMinOpTable();
      }
    });
  });
}

// 更新最少操作策略表格
function updateMinOpTable() {
  const tableBody = document.querySelector("#min-op-table tbody");
  if (!tableBody) return;

  // 清空表格
  tableBody.innerHTML = "";

  // 获取计算结果
  const strategy = getMinOpStrategy();

  // 填充表格
  strategy.forEach((item) => {
    const row = document.createElement("tr");

    const roundCell = document.createElement("td");
    roundCell.textContent = item[0];

    const positionCell = document.createElement("td");
    positionCell.textContent = item[1];

    row.appendChild(roundCell);
    row.appendChild(positionCell);

    tableBody.appendChild(row);
  });
}

// 更新所有数据（当时间更新时调用）
function updateAllData() {
  updateTimeDisplay();
  updateSpikeDisplay();
  updateMobileRoundInfo();
  updateMinOpTable(); // 更新表格数据
}

function updateButtonStates(isMobileMode) {
  const nonMobileBtn = document.getElementById("non-mobile-btn");
  const mobileBtn = document.getElementById("mobile-btn");

  if (isMobileMode) {
    // 移动端模式
    nonMobileBtn.classList.remove("active");
    mobileBtn.classList.add("active");
    safetyFormatData = mobileSafetyFormatData;
  } else {
    // 非移动端模式
    nonMobileBtn.classList.add("active");
    mobileBtn.classList.remove("active");
    safetyFormatData = nonMobileSafetyFormatData;
  }
}

setInterval(updateTimeDisplay, 1000);

// 根据模式计算安全位置格式数据
function calculateSafetyFormatData(isMobileMode) {
  const result = [];

  if (isMobileMode) {
    // 移动端模式：计算第2-15回合（索引1-14）
    for (let round = 1; round < 15; round++) {
      const roundData = currentRoundsData[round];
      const safePositions = [];

      // 检查顶部行的安全位置
      for (let col = 0; col < 20; col++) {
        if (roundData.top[col] !== "↑") {
          // 如果不是尖刺，就是安全位置
          if (col < 10) {
            // 左侧
            if (!safePositions.includes(1)) {
              safePositions.push(1); // 左上
            }
          } else {
            // 右侧
            if (!safePositions.includes(2)) {
              safePositions.push(2); // 右上
            }
          }
        }
      }

      // 检查中部行的安全位置
      for (let col = 0; col < 20; col++) {
        if (roundData.mid[col] !== "↑") {
          // 如果不是尖刺，就是安全位置
          if (col < 10) {
            // 左侧
            if (!safePositions.includes(3)) {
              safePositions.push(3); // 左中
            }
          } else {
            // 右侧
            if (!safePositions.includes(4)) {
              safePositions.push(4); // 右中
            }
          }
        }
      }

      // 检查底部行的安全位置
      for (let col = 0; col < 20; col++) {
        if (roundData.bot[col] !== "↑") {
          // 如果不是尖刺，就是安全位置
          if (col < 10) {
            // 左侧
            if (!safePositions.includes(5)) {
              safePositions.push(5); // 左下
            }
          } else {
            // 右侧
            if (!safePositions.includes(6)) {
              safePositions.push(6); // 右下
            }
          }
        }
      }

      // 对安全位置进行排序
      safePositions.sort((a, b) => a - b);
      result.push(safePositions);
    }
  } else {
    // 非移动端模式：计算第1-15回合（索引0-14）
    for (let round = 0; round < 15; round++) {
      const roundData = currentRoundsData[round];
      const safePositions = [];

      // 检查顶部行的安全位置
      for (let col = 0; col < 20; col++) {
        if (roundData.top[col] !== "↑") {
          // 如果不是尖刺，就是安全位置
          if (col < 10) {
            // 左侧
            if (!safePositions.includes(1)) {
              safePositions.push(1); // 左上
            }
          } else {
            // 右侧
            if (!safePositions.includes(2)) {
              safePositions.push(2); // 右上
            }
          }
        }
      }

      // 检查中部行的安全位置
      for (let col = 0; col < 20; col++) {
        if (roundData.mid[col] !== "↑") {
          // 如果不是尖刺，就是安全位置
          if (col < 10) {
            // 左侧
            if (!safePositions.includes(3)) {
              safePositions.push(3); // 左中
            }
          } else {
            // 右侧
            if (!safePositions.includes(4)) {
              safePositions.push(4); // 右中
            }
          }
        }
      }

      // 检查底部行的安全位置
      for (let col = 0; col < 20; col++) {
        if (roundData.bot[col] !== "↑") {
          // 如果不是尖刺，就是安全位置
          if (col < 10) {
            // 左侧
            if (!safePositions.includes(5)) {
              safePositions.push(5); // 左下
            }
          } else {
            // 右侧
            if (!safePositions.includes(6)) {
              safePositions.push(6); // 右下
            }
          }
        }
      }

      // 对安全位置进行排序
      safePositions.sort((a, b) => a - b);
      result.push(safePositions);
    }
  }

  return result;
}

function convertToSafetyFormat(roundsData) {
  // 返回当前模式下的安全位置数据
  return safetyFormatData;
}

// 使用SafeZoneSolver计算最少操作策略并转换位置编号为区域名称
function getMinOpStrategy() {
  // 获取当前安全位置数据
  const currentSafetyData = convertToSafetyFormat(currentRoundsData);

  // 使用SafeZoneSolver计算最少操作策略
  const rawResult = new SafeZoneSolver().solve(currentSafetyData);

  // 定义位置编号到区域名称的映射
  const positionMap = {
    1: "左上",
    2: "右上",
    3: "左中",
    4: "右中",
    5: "左下",
    6: "右下",
  };

  // 转换结果数组，将位置编号转换为区域名称
  const convertedResult = rawResult.map((item) => {
    const roundRange = item[0];
    const positionNumber = parseInt(item[1]);
    const positionName =
      positionMap[positionNumber] || `未知位置${positionNumber}`;

    return [roundRange, positionName];
  });

  return convertedResult;
}

function findSafePositions(roundsData) {
  const safePositions = {
    top: [],
    mid: [],
    bot: [],
  };

  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 20; col++) {
      let hasSpike = false;

      for (const roundData of roundsData) {
        let rowData;
        switch (row) {
          case 0:
            rowData = roundData.top;
            break;
          case 1:
            rowData = roundData.mid;
            break;
          case 2:
            rowData = roundData.bot;
            break;
        }

        if (rowData[col] === "↑") {
          hasSpike = true;
          break;
        }
      }

      if (!hasSpike) {
        switch (row) {
          case 0:
            safePositions.top.push(col);
            break;
          case 1:
            safePositions.mid.push(col);
            break;
          case 2:
            safePositions.bot.push(col);
            break;
        }
      }
    }
  }

  return safePositions;
}

function getSpikeDistributionWithRandomPart(round, randomPart) {
  if (round > 15) round = 15;

  const actualRound = round;

  const len = randomPart.length;
  let posCalc = len - (actualRound - Math.floor(actualRound / len) * len);
  let position = Math.floor(posCalc) % len;
  if (position < 0) position += len;

  let firstDummyNumber = 0;
  if (position < randomPart.length) {
    const charAtPos = randomPart.charAt(position);
    if (!isNaN(parseInt(charAtPos))) {
      firstDummyNumber = parseInt(charAtPos);
    }
  }

  if (actualRound > len) {
    const extra = Math.floor(actualRound / len);
    firstDummyNumber += extra;
  }

  if (firstDummyNumber > 9) {
    firstDummyNumber = firstDummyNumber - 9 * Math.floor(firstDummyNumber / 9);
  }

  if (firstDummyNumber > 6) {
    if (randomPart.length > 0) {
      const firstChar = randomPart.charAt(0);
      const firstDigit = !isNaN(parseInt(firstChar)) ? parseInt(firstChar) : 0;
      const adjustment = Math.floor(firstDigit / 4);
      firstDummyNumber = firstDummyNumber - 6 + adjustment;
    }
  }

  let firstTriggerText = "";
  if (firstDummyNumber % 3 === 0) {
    firstTriggerText = "Top";
  } else if (firstDummyNumber % 3 === 1) {
    firstTriggerText = "Mid";
  } else {
    firstTriggerText = "Bot";
  }

  if (firstDummyNumber % 2 === 1) {
    firstTriggerText += "Right";
  } else {
    firstTriggerText += "Left";
  }

  let secondTriggerText = null;
  if (actualRound > 6) {
    let secondDummyNumber = firstDummyNumber + 1;

    if (secondDummyNumber > 9) {
      secondDummyNumber =
        secondDummyNumber - 9 * Math.floor(secondDummyNumber / 9);
    }

    if (secondDummyNumber > 6) {
      if (randomPart.length > 0) {
        const firstChar = randomPart.charAt(0);
        const firstDigit = !isNaN(parseInt(firstChar))
          ? parseInt(firstChar)
          : 0;
        const adjustment = Math.floor(firstDigit / 4);
        secondDummyNumber = secondDummyNumber - 6 + adjustment;
      }
    }

    secondTriggerText = "";
    if (secondDummyNumber % 3 === 0) {
      secondTriggerText = "Top";
    } else if (secondDummyNumber % 3 === 1) {
      secondTriggerText = "Mid";
    } else {
      secondTriggerText = "Bot";
    }

    if (secondDummyNumber % 2 === 1) {
      secondTriggerText += "Right";
    } else {
      secondTriggerText += "Left";
    }
  }

  const grid = triggerTextToGridSeparate(
    firstTriggerText,
    secondTriggerText,
    actualRound > 3,
  );

  return {
    top: grid[0].join(""),
    mid: grid[1].join(""),
    bot: grid[2].join(""),
  };
}

class SafeZoneSolver {
  solve(safeCellsInput) {
    const safeCells = safeCellsInput;
    const totalRounds = safeCells.length;

    // 结果数组：每回合应该站的位置
    const positions = new Array(totalRounds).fill(0);

    let currentRound = 0;

    while (currentRound < totalRounds) {
      const currentSafe = safeCells[currentRound];

      // 寻找能安全最久的位置
      let bestPos = -1;
      let maxSafeRounds = 0;

      for (const pos of currentSafe) {
        let safeRounds = 1;

        // 这个位置能安全多久？
        for (
          let nextRound = currentRound + 1;
          nextRound < totalRounds;
          nextRound++
        ) {
          if (safeCells[nextRound].includes(pos)) {
            safeRounds++;
          } else {
            break;
          }
        }

        // 选择能安全最久的位置（优先选择数字小的，如果安全回合数相同）
        if (
          safeRounds > maxSafeRounds ||
          (safeRounds === maxSafeRounds && pos < bestPos)
        ) {
          maxSafeRounds = safeRounds;
          bestPos = pos;
        }
      }

      // 填充这一段时间
      const endRound = currentRound + maxSafeRounds;
      for (let i = currentRound; i < endRound && i < totalRounds; i++) {
        positions[i] = bestPos;
      }

      currentRound = endRound;
    }

    return this.formatToIntervals(positions);
  }

  formatToIntervals(positions) {
    const intervals = [];
    let startRound = 1;
    let currentPos = positions[0];

    for (let t = 1; t <= positions.length; t++) {
      if (t === positions.length || positions[t] !== currentPos) {
        const roundRange =
          startRound === t ? `${startRound}` : `${startRound}-${t}`;

        intervals.push([roundRange, currentPos.toString()]);

        if (t < positions.length) {
          startRound = t + 1;
          currentPos = positions[t];
        }
      }
    }

    return intervals;
  }

  // 输出详细分析
  analyzeResult(result, safeCells) {
    console.log("=== 安全站位分析报告 ===\n");

    // 展开到每回合
    const positions = [];
    for (const [range, pos] of result) {
      const posNum = parseInt(pos);
      if (range.includes("-")) {
        const [start, end] = range.split("-").map(Number);
        for (let i = start; i <= end; i++) {
          positions[i - 1] = posNum;
        }
      } else {
        positions[parseInt(range) - 1] = posNum;
      }
    }

    // 统计
    let moves = 0;
    let currentStreak = 1;
    let maxStreak = 1;
    let currentPos = positions[0];

    console.log("回合  安全格子推荐    连续安全");
    console.log("----  -------------  ---------");

    for (let i = 0; i < positions.length; i++) {
      const round = i + 1;
      const pos = positions[i];
      const safe = safeCells[i].includes(pos);

      // 检查是否移动
      if (i > 0 && pos !== positions[i - 1]) {
        moves++;
        currentStreak = 1;
      } else if (i > 0) {
        currentStreak++;
        maxStreak = Math.max(maxStreak, currentStreak);
      }

      const status = safe ? "✓" : "✗";
      console.log(
        `${round.toString().padStart(3)}    位置 ${pos} ${status}     ${currentStreak}回合`,
      );
    }

    console.log("\n=== 总结 ===");
    console.log(`总移动次数: ${moves}次`);
    console.log(`最长连续安全: ${maxStreak}回合`);
    console.log(
      `平均 ${(positions.length / (moves + 1)).toFixed(1)} 回合移动一次`,
    );

    // 计算容错性分数（连续安全回合越长，容错越高）
    let faultToleranceScore = 0;
    for (let i = 0; i < positions.length; i++) {
      let safeRounds = 0;
      const pos = positions[i];
      for (let j = i; j < positions.length; j++) {
        if (safeCells[j].includes(pos)) {
          safeRounds++;
        } else {
          break;
        }
      }
      faultToleranceScore += safeRounds;
    }

    console.log(`容错性分数: ${faultToleranceScore}（越高越好）`);

    return { positions, moves, maxStreak, faultToleranceScore };
  }
}

export { initSpikeDisplay };