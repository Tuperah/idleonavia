import { loadMapData } from './world-map.js';
import { loadTalentContent, applyFilters, prevPage, nextPage, activeFilters, setSearchTerm } from './talent-tool.js';

export function initNavigation() {
  const navItems = document.querySelectorAll(".nav-item");
  const pages = document.querySelectorAll(".page");
  const menuToggle = document.getElementById("menuToggle");
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("overlay");

  navItems.forEach((item) => {
    item.addEventListener("click", function () {
      const targetPage = this.getAttribute("data-page");

      navItems.forEach((nav) => nav.classList.remove("active"));
      this.classList.add("active");

      pages.forEach((page) => {
        page.classList.remove("active");
        if (page.id === targetPage) {
          page.classList.add("active");
        }
      });

      if (targetPage === "world-map") {
        console.log("正在加载地图数据...");
        loadMapData();
      }

      if (targetPage === "talent-tool") {
        console.log("正在加载天赋数据...");
        loadTalentContent();
      }

      closeSidebar();
    });
  });

  menuToggle.addEventListener("click", function () {
    sidebar.classList.toggle("active");
    menuToggle.classList.toggle("active");
    overlay.classList.toggle("active");
  });

  overlay.addEventListener("click", function () {
    closeSidebar();
  });

  document.getElementById("prev-page").addEventListener("click", prevPage);
  document.getElementById("next-page").addEventListener("click", nextPage);

  document.querySelectorAll(".filter-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      const type = this.getAttribute("data-type");
      if (activeFilters.has(type)) {
        activeFilters.delete(type);
        this.classList.remove("active");
      } else {
        activeFilters.add(type);
        this.classList.add("active");
      }
      applyFilters();
    });
  });

  document.getElementById("talent-search").addEventListener("input", function () {
    setSearchTerm(this.value);
  });

  function closeSidebar() {
    sidebar.classList.remove("active");
    menuToggle.classList.remove("active");
    overlay.classList.remove("active");
  }
}