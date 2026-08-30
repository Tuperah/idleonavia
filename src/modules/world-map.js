import ka from '../data/mapData.js';

// 世界地图相关函数
function shouldDisplayMap(mapName) {
  return (
    mapName !== "Z" &&
    mapName !== "NOTHINGLOL" &&
    mapName !== "Miningg1" &&
    mapName !== "Miningg2" &&
    mapName !== "uAquaA13" &&
    mapName !== "uAquaA14" &&
    !mapName.toLowerCase().includes("tutorial") &&
    !mapName.toLowerCase().includes("filler") &&
    !mapName.toLowerCase().includes("junglex") &&
    !mapName.toLowerCase().includes("junglez") &&
    !mapName.toLowerCase().includes("playerselect")
  );
}

function displayWorldData(
  worldIndex,
  mapNames,
  mapDispNames
) {
  const container = document.getElementById("world-container");
  const startIndex = (worldIndex - 1) * 50;
  const endIndex = Math.min(startIndex + 50, mapNames.length);

  const worldData = [];
  for (let i = startIndex; i < endIndex; i++) {
    if (
      i < mapNames.length &&
      shouldDisplayMap(mapDispNames[i]) &&
      shouldDisplayMap(mapNames[i])
    ) {
      worldData.push({
        index: i,
        mapName: mapNames[i],
        mapDispName: mapDispNames[i].replace(/_/g, " "),
      });
    }
  }

  container.innerHTML = `
        <h3>World ${worldIndex} (${startIndex + 1}-${endIndex})</h3>
        <div class="world-content-wrapper">
            <div class="world-table-container">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>MapId</th>
                            <th>Display Name</th>
                            <th>Map Name</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${worldData
                          .map(
                            (data) => `
                                    <tr data-map-index="${data.index}">
                                        <td>${data.index}</td>
                                        <td>${data.mapDispName}</td>
                                        <td>${data.mapName}</td>
                                    </tr>
                                `
                          )
                          .join("")}
                    </tbody>
                </table>
            </div>
            <div class="world-right-panel">
                <div class="flash-points-container"></div>
                <img src="/images/world-map/w1.png" alt="World 1" class="world-map-image" data-world="1">
                <img src="/images/world-map/w2.png" alt="World 2" class="world-map-image" data-world="2">
                <img src="/images/world-map/w3.png" alt="World 3" class="world-map-image" data-world="3">
                <img src="/images/world-map/w4.png" alt="World 4" class="world-map-image" data-world="4">
                <img src="/images/world-map/w5.png" alt="World 5" class="world-map-image" data-world="5">
                <img src="/images/world-map/w6.png" alt="World 6" class="world-map-image" data-world="6">
                <img src="/images/world-map/w7.png" alt="World 7" class="world-map-image" data-world="7">
                <div class="coordinates-display"></div>
            </div>
        </div>
    `;

  // 为表格行添加点击事件（替代内联 onclick）
  const tableBody = container.querySelector("tbody");
  if (tableBody) {
    tableBody.removeEventListener("click", tableBody._rowClickHandler);
    tableBody._rowClickHandler = function (e) {
      const row = e.target.closest("tr");
      if (row && row.dataset.mapIndex !== undefined) {
        updateFlashPoint(parseInt(row.dataset.mapIndex));
      }
    };
    tableBody.addEventListener("click", tableBody._rowClickHandler);
  }

  document.querySelectorAll(".world-tab").forEach((tab) => {
    tab.classList.remove("active");
  });
  document
    .querySelector(`[data-world="world${worldIndex}"]`)
    .classList.add("active");

  document.querySelectorAll(".world-map-image").forEach((img) => {
    img.style.display = img.getAttribute("data-world") === worldIndex.toString() ? "block" : "none";
  });
}

function loadMapData() {
  if (typeof ka === "undefined") {
    document.getElementById("world-container").innerHTML =
      '<p>错误：无法加载mapData.js，请确保mapData.js文件存在且已正确引入</p>';
    return;
  }

  try {
    const mapNames = ka.MapName();
    const mapDispNames = ka.MapDispName();

    displayWorldData(
      1,
      mapNames,
      mapDispNames
    );

    // 设置世界选项卡点击事件（替代内联 onclick）
    document.querySelectorAll(".world-tab").forEach((tab) => {
      tab.removeEventListener("click", tab._worldClickHandler);
      tab._worldClickHandler = function () {
        const worldIndex = parseInt(this.getAttribute("data-world").replace("world", ""));
        switchWorld(worldIndex);
      };
      tab.addEventListener("click", tab._worldClickHandler);
    });

    setTimeout(() => {
      updateFlashPoint(0);
    }, 100);
  } catch (e) {
    console.error("加载地图数据失败:", e);
    document.getElementById("world-container").innerHTML =
      "<p>无法加载地图数据，请确保mapData.js可用</p>";
  }
}

function switchWorld(worldIndex) {
  try {
    const mapNames = ka.MapName();
    const mapDispNames = ka.MapDispName();

    displayWorldData(
      worldIndex,
      mapNames,
      mapDispNames,
    );

    document.querySelectorAll(".world-tab").forEach((tab) => {
      tab.classList.remove("active");
    });
    document
      .querySelector(`[data-world="world${worldIndex}"]`)
      .classList.add("active");

    const townMapId = (worldIndex - 1) * 50;
    updateFlashPoint(townMapId);
  } catch (e) {
    console.error("切换世界失败:", e);
  }
}

function updateFlashPoint(mapId) {
  const flashPointsContainer = document.querySelector(".flash-points-container");
  if (flashPointsContainer) {
    flashPointsContainer.innerHTML = "";
    const flashPoint = document.createElement("div");
    flashPoint.className = "flash-point";
    
    const worldMapImage = document.querySelector(".world-map-image[style*='display: block']");
    if (worldMapImage) {
      const originalWidth = 807;
      const originalHeight = 427;
      
      const mapDetails = ka.MapDetails();
      const originalX = mapDetails[mapId][2][0];
      const originalY = mapDetails[mapId][2][1];
      
      const imageRect = worldMapImage.getBoundingClientRect();
      const containerRect = document.querySelector(".world-right-panel").getBoundingClientRect();
      
      const scaleX = imageRect.width / originalWidth;
      const scaleY = imageRect.height / originalHeight;
      
      const currentX = originalX * scaleX + (imageRect.left - containerRect.left) - 68 * scaleX;
      const currentY = originalY * scaleY + (imageRect.top - containerRect.top) - 22 * scaleY;
      
      console.log("原图尺寸:", originalWidth, "x", originalHeight);
      console.log("原图坐标:", originalX, originalY);
      console.log("图片实际尺寸:", imageRect.width, "x", imageRect.height);
      console.log("缩放比例:", scaleX, scaleY);
      console.log("图片相对于面板的偏移:", imageRect.left - containerRect.left, imageRect.top - containerRect.top);
      console.log("转换后坐标:", currentX, currentY);
      
      if (currentX < 0 || currentX > imageRect.width || currentY < 0 || currentY > imageRect.height) {
        const coordinatesDisplay = document.querySelector(".coordinates-display");
        if (coordinatesDisplay) {
          coordinatesDisplay.textContent = "隐藏地图";
        }
        return;
      }
      
      flashPoint.style.left = `${currentX}px`;
      flashPoint.style.top = `${currentY}px`;
      flashPoint.style.width = `${10 * scaleX}px`;
      flashPoint.style.height = `${10 * scaleY}px`;
      flashPoint.style.setProperty('--arrow-scale-x', scaleX);
      flashPoint.style.setProperty('--arrow-scale-y', scaleY);
      
      const coordinatesDisplay = document.querySelector(".coordinates-display");
      if (coordinatesDisplay) {
        coordinatesDisplay.textContent = `X: ${Math.round(currentX)}, Y: ${Math.round(currentY)}`;
      }
    } else {
      const coordinatesDisplay = document.querySelector(".coordinates-display");
      if (coordinatesDisplay) {
        coordinatesDisplay.textContent = "无法获取坐标数据";
      }
    }
    
    flashPointsContainer.appendChild(flashPoint);
  }
}

export { loadMapData, switchWorld, updateFlashPoint, displayWorldData };