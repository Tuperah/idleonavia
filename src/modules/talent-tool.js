// State variables
import ka from '../data/mapData.js';

let currentPage = 1;
let filteredTalentData = [];
let activeFilters = new Set(["beginner", "warrior", "archer", "mage", "special"]);
let searchTerm = "";
let currentFilteredData = [];

const itemsPerPage = 10;

function loadTalentContent() {
  try {
    const talentOrder = ka.TalentOrder();
    const talentIconNames = ka.TalentIconNames();
    const talentDescriptions = ka.TalentDescriptions();

    filteredTalentData = talentOrder.map((talentId, index) => {
      const talentName = talentIconNames[talentId] || "Unknown";
      const talentDesc = talentDescriptions[talentId] || ["No description available"];

      let descriptionText = "";
      if (Array.isArray(talentDesc[0])) {
        descriptionText = talentDesc[0].join(" ").replace(/_/g, " ");
      } else if (typeof talentDesc[0] === "string") {
        descriptionText = talentDesc[0].replace(/_/g, " ");
      } else {
        descriptionText = "No description available";
      }

      return {
        talentId,
        index,
        talentName: talentName.replace(/_/g, " "),
        descriptionText,
      };
    }).filter(
      (item) => item.talentName !== "_" && item.talentName.trim() !== ""
    );

    applyFilters();
  } catch (error) {
    console.error("Error loading talent content:", error);

    const tableBody = document.getElementById("talent-table-body");
    tableBody.innerHTML = `
                    <tr>
                        <td colspan="4" style="color: #ff6b6b; text-align: center; padding: 20px;">
                            数据加载错误: ${error.message}
                        </td>
                    </tr>
                `;
  }
}

function applyFilters() {
  currentFilteredData = filteredTalentData.filter((item) => {
    let type = "";
    if (item.index >= 0 && item.index <= 74) {
      type = "beginner";
    } else if (item.index >= 75 && item.index <= 254) {
      type = "warrior";
    } else if (item.index >= 255 && item.index <= 434) {
      type = "archer";
    } else if (item.index >= 435 && item.index <= 614) {
      type = "mage";
    } else if (item.index >= 615) {
      type = "special";
    }

    const typeMatch = activeFilters.has(type);
    const searchMatch =
      searchTerm === "" ||
      item.talentId.toString().includes(searchTerm) ||
      item.talentName.toLowerCase().includes(searchTerm.toLowerCase());

    return typeMatch && searchMatch;
  });

  currentPage = 1;
  updatePagination(currentFilteredData);
  displayCurrentPageWithFilteredData(currentFilteredData);
}

function displayCurrentPageWithFilteredData(data) {
  const tableBody = document.getElementById("talent-table-body");
  tableBody.innerHTML = "";

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, data.length);
  const currentPageData = data.slice(startIndex, endIndex);

  currentPageData.forEach((item, index) => {
    const displayIndex = startIndex + index + 1;
    const row = document.createElement("tr");
    row.setAttribute("data-idx", item.index);
    let spriteClass = "sprite";
    if (item.talentId >= 0 && item.talentId <= 249) {
      spriteClass = "sprite0-249";
    } else if (item.talentId >= 250 && item.talentId <= 499) {
      spriteClass = "sprite250-499";
    } else if (item.talentId >= 500 && item.talentId <= 689) {
      spriteClass = "sprite500-689";
    }
    row.innerHTML = `
                    <td class="talent-id">${item.talentId}</td>
                    <td><span class="UISkillIcon${item.talentId} ${spriteClass}"></span></td>
                    <td class="talent-name">${item.talentName}</td>
                    <td class="talent-description">${item.descriptionText}</td>
                `;
    tableBody.appendChild(row);
  });
}

function updatePagination(data) {
  const totalPages = Math.ceil(data.length / itemsPerPage);
  const pageInfo = document.getElementById("page-info");
  const prevButton = document.getElementById("prev-page");
  const nextButton = document.getElementById("next-page");

  pageInfo.textContent = `第 ${currentPage} 页，共 ${totalPages} 页`;
  prevButton.disabled = currentPage <= 1;
  nextButton.disabled = currentPage >= totalPages;
}

function nextPage() {
  const totalPages = Math.ceil(currentFilteredData.length / itemsPerPage);
  if (currentPage < totalPages) {
    currentPage++;
    updatePagination(currentFilteredData);
    displayCurrentPageWithFilteredData(currentFilteredData);
  }
}

function prevPage() {
  if (currentPage > 1) {
    currentPage--;
    updatePagination(currentFilteredData);
    displayCurrentPageWithFilteredData(currentFilteredData);
  }
}

export { loadTalentContent, applyFilters, displayCurrentPageWithFilteredData, updatePagination, nextPage, prevPage, activeFilters, searchTerm, currentPage, filteredTalentData, currentFilteredData, setSearchTerm };

function setSearchTerm(value) {
  searchTerm = value;
  applyFilters();
}