import { weeklyData, TRANSLATOR, BOSS_PIC } from '../data/weekly-boss.js';

function initWeeklyBoss() {
  const weekSelect = document.getElementById("weekSelect");
  const bossNameElement = document.getElementById("bossName");
  const reqAll = document.getElementById("boss-reqAll");
  const skullsRun = document.getElementById("boss-skullsRun");
  const miscRun = document.getElementById("boss-miscRun");
  const trophiesCount = document.getElementById("trophiesCount");
  const helpText = document.getElementById("helpText");
  const helpModal = document.getElementById("helpModal");
  const closeBtn = document.querySelector(".boss-close");

  function getCurrentWeek() {
    const now = Date.now();
    for (const data of weeklyData) {
      if (now >= data.startTimestamp && now < data.endTimestamp) {
        return data.week;
      }
    }
    for (let i = weeklyData.length - 1; i >= 0; i--) {
      if (now >= weeklyData[i].startTimestamp) {
        return weeklyData[i].week;
      }
    }
    return weeklyData[0].week;
  }

  function createTableFromText(text) {
    if (!text) return "";

    const lines = text.replace(/\n/g, "\n").split("\n");
    let tableHTML =
      '<table style="width:100%;border-collapse:collapse;font-size:20px;line-height:1.8;font-weight:500;margin-top:20px;">';

    lines.forEach((line, index) => {
      const rowClass = index % 2 === 0 ? "even-row" : "odd-row";
      const content = line.trim() === "" ? "&nbsp;" : line;
      tableHTML += `<tr class="${rowClass}"><td style="padding:5px;border:none;text-align:center;">${content}</td></tr>`;
    });

    tableHTML += "</table>";

    tableHTML += `
            <style>
                .even-row td { background-color: #2d2d2d; }
                .odd-row td { background-color: #3a3a3a; }
            </style>
        `;

    return tableHTML;
  }

  function updateBossData() {
    const selectedWeek = parseInt(weekSelect.value);
    const selectedData = weeklyData.find((d) => d.week === selectedWeek);
    const toggle11c = document.getElementById("boss11cToggle");
    const hint11c = document.getElementById("boss11cHint");

    if (selectedData) {
      // 检查是否有10人和11人数据
      const has10c = selectedData.characterRequirements !== undefined || selectedData.trophies !== undefined;
      const has11c = selectedData.characterRequirements11c !== undefined || selectedData.trophies11c !== undefined;

      // 根据数据情况设置开关状态
      if (!has10c && has11c) {
        // 只有11人数据
        toggle11c.disabled = true;
        toggle11c.checked = true;
        hint11c.textContent = "当前只有11个角色数据";
      } else if (has10c && !has11c) {
        // 只有10人数据
        toggle11c.disabled = true;
        toggle11c.checked = false;
        hint11c.textContent = "当前只有10个角色数据";
      } else if (has10c && has11c) {
        // 同时有10人和11人数据
        toggle11c.disabled = false;
        if (toggle11c.checked) {
          hint11c.textContent = "当前为11个角色数据";
        } else {
          hint11c.textContent = "当前为10个角色数据";
        }
      } else {
        // 没有数据（异常情况）
        toggle11c.disabled = true;
        toggle11c.checked = false;
        hint11c.textContent = "当前无数据";
      }

      const use11c = toggle11c.checked;

      const bossNameText = selectedData.bossName;
      const characterReqs = use11c && selectedData.characterRequirements11c ? selectedData.characterRequirements11c : selectedData.characterRequirements;
      const skullsRunText = use11c && selectedData.fiveSkullsRun11c ? selectedData.fiveSkullsRun11c : selectedData.fiveSkullsRun;
      let miscRunText = use11c && selectedData.miscTrophyRun11c ? selectedData.miscTrophyRun11c : selectedData.miscTrophyRun;
      const trophies = use11c && selectedData.trophies11c ? selectedData.trophies11c : selectedData.trophies;

      // 如果使用11c数据且奖杯数量比10角色少，添加红色提醒
      if (use11c && selectedData.trophies !== undefined && selectedData.trophies11c !== undefined && parseInt(selectedData.trophies) > parseInt(selectedData.trophies11c)) {
        const diff = parseInt(selectedData.trophies) - parseInt(selectedData.trophies11c);
        miscRunText += `\n<span style="color: #ff6b6b; font-weight: bold;">当前方案比10角色少${diff}个奖杯，请切换为10角色版本</span>`;
      }

      bossNameElement.innerHTML = bossNameText;

      if (typeof BOSS_PIC !== "undefined" && BOSS_PIC[bossNameText]) {
        bossNameElement.innerHTML += BOSS_PIC[bossNameText];
      }

      let translatedReqs = characterReqs || "";
      let translatedSkullRun = skullsRunText || "";
      let translatedMiscRun = miscRunText || "";

      if (typeof TRANSLATOR !== "undefined") {
        // 按key长度降序排序，先匹配长的短语，再匹配短的单词
        const keys = Object.keys(TRANSLATOR).sort((a, b) => b.length - a.length);
        for (const key of keys) {
          const translatedTerm = TRANSLATOR[key];
          const regex = new RegExp(key, "gi");  // 大小写不敏感
          translatedReqs = translatedReqs.replace(regex, translatedTerm);
          translatedSkullRun = translatedSkullRun.replace(
            regex,
            translatedTerm,
          );
          translatedMiscRun = translatedMiscRun.replace(regex, translatedTerm);
        }
      }

      reqAll.innerHTML = translatedReqs.replace(/\n/g, "<br>");
      skullsRun.innerHTML = createTableFromText(translatedSkullRun);
      miscRun.innerHTML = createTableFromText(translatedMiscRun);
      trophiesCount.textContent = `🏆 ${trophies || "-"}`;
    }
  }

  if (typeof weeklyData !== "undefined") {
    weeklyData.forEach((data) => {
      const option = document.createElement("option");
      option.value = data.week;
      option.textContent = `${data.dateStart}至${data.dateEnd}`;
      weekSelect.appendChild(option);
    });

    weekSelect.addEventListener("change", updateBossData);

    const toggle11c = document.getElementById("boss11cToggle");
    toggle11c.addEventListener("change", updateBossData);

    const currentWeek = getCurrentWeek();
    const option = Array.from(weekSelect.options).find(
      (opt) => parseInt(opt.value) === currentWeek,
    );

    if (option) {
      weekSelect.value = currentWeek;
      updateBossData();
    }
  }

  helpText.addEventListener("click", function () {
    helpModal.style.display = "block";
  });

  closeBtn.addEventListener("click", function () {
    helpModal.style.display = "none";
  });

  window.addEventListener("click", function (event) {
    if (event.target === helpModal) {
      helpModal.style.display = "none";
    }
  });
}

export { initWeeklyBoss };