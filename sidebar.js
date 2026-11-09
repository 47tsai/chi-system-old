/* chi-system sidebar.js — 側邊欄邏輯唯一來源（SYSTEM.md 第 8 節、第 15 節第 6 步）
 *
 * 用法：在每頁 <head> 以同步方式引入，放在 theme.js 之後、樣式表之前。
 * <script> 標籤須帶本站的收合 key，例如：
 *   <script src="./sidebar.js" data-chi-sidebar-key="chi-merch-sidebar-collapsed"></script>
 * 收合狀態在首次繪製前寫入 <html> 的 data-chi-sidebar-collapsed 屬性，不會閃爍；
 * 按鈕綁定在 DOMContentLoaded 後進行。若該站無法同步引入，改把下方 <head> 內嵌
 * 片段貼進 <head>（把 key 換成本站的），它只做讀取與套用，不綁按鈕：
 *   <script>try{var c=localStorage.getItem('chi-<站點>-sidebar-collapsed');if(c==='1'){document.documentElement.setAttribute('data-chi-sidebar-collapsed','1');}}catch(e){}</script>
 *
 * 規則（皆來自 SYSTEM.md 第 8 節）：
 * - 收合只在桌面（>=1024px）有效；平板（768–1023px）強制圖示列，手機（<768px）
 *   為抽屜或底部列，皆不讀收合狀態。CSS 以媒體查詢守住範圍，此檔不判斷寬度。
 * - 收合狀態 key 為 chi-<站點>-sidebar-collapsed，值 "1" 為收合、"0" 或無值為展開；
 *   未設定 data-chi-sidebar-key 時只切換當次，不寫入 localStorage。
 * - 抽屜：漢堡按鈕 [data-chi-sidebar-menu] 開，遮罩 [data-chi-sidebar-scrim] 點按
 *   與 Escape 關；視窗放大到 >=768px 時自動關抽屜。底部列版式（.chi-sidebar--bottombar）
 *   不用抽屜，漢堡與遮罩皆不綁定。
 * - 對外 API（供框架薄包裝與除錯用）：window.ChiSidebar = { isCollapsed, setCollapsed,
 *   toggleCollapsed, openMobile, closeMobile }；收合改變時在 window 派發
 *   chi-sidebar-change 事件，detail 為 { collapsed }。
 */
(function () {
  'use strict';

  var COLLAPSED = '1';
  var root = document.documentElement;

  // <head> 同步引入時，從自身 <script> 標籤讀本站的 key，先套用收合狀態。
  var currentScript = document.currentScript;
  var key = currentScript ? currentScript.getAttribute('data-chi-sidebar-key') : null;

  function readCollapsed() {
    if (!key) return false;
    try {
      return localStorage.getItem(key) === COLLAPSED;
    } catch (e) {
      return false;
    }
  }

  function writeCollapsed(value) {
    if (!key) return;
    try {
      localStorage.setItem(key, value ? COLLAPSED : '0');
    } catch (e) { /* 忽略：無痕或停用儲存時只切換當次 */ }
  }

  // 首次繪製前套用：只寫 <html> 屬性，CSS 以此守住收合外觀，不碰尚未解析的 DOM。
  if (readCollapsed()) {
    root.setAttribute('data-chi-sidebar-collapsed', COLLAPSED);
  }

  var sidebar = null;
  var content = null;
  var toggle = null;
  var menuButton = null;
  var scrim = null;

  function isCollapsed() {
    return root.getAttribute('data-chi-sidebar-collapsed') === COLLAPSED;
  }

  function applyCollapsed(collapsed) {
    if (collapsed) {
      root.setAttribute('data-chi-sidebar-collapsed', COLLAPSED);
    } else {
      root.removeAttribute('data-chi-sidebar-collapsed');
    }
    if (sidebar) {
      if (collapsed) {
        sidebar.classList.add('is-collapsed');
      } else {
        sidebar.classList.remove('is-collapsed');
      }
    }
    if (toggle) {
      toggle.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
      toggle.setAttribute('aria-label', collapsed ? '展開側邊欄' : '收合側邊欄');
      toggle.setAttribute('title', collapsed ? '展開側邊欄' : '收合側邊欄');
    }
  }

  function setCollapsed(collapsed) {
    var next = !!collapsed;
    if (next === isCollapsed()) return;
    applyCollapsed(next);
    writeCollapsed(next);
    window.dispatchEvent(new CustomEvent('chi-sidebar-change', { detail: { collapsed: next } }));
  }

  function toggleCollapsed() {
    setCollapsed(!isCollapsed());
  }

  function isBottombar() {
    return !!sidebar && sidebar.classList.contains('chi-sidebar--bottombar');
  }

  function openMobile() {
    if (!sidebar || isBottombar()) return;
    sidebar.classList.add('mobile-open');
    if (scrim) scrim.classList.add('visible');
    if (menuButton) menuButton.setAttribute('aria-expanded', 'true');
  }

  function closeMobile() {
    if (!sidebar) return;
    sidebar.classList.remove('mobile-open');
    if (scrim) scrim.classList.remove('visible');
    if (menuButton) menuButton.setAttribute('aria-expanded', 'false');
  }

  function bind() {
    sidebar = document.querySelector('.chi-sidebar');
    if (!sidebar) return;
    content = document.querySelector('.chi-content');
    if (!key) {
      key = sidebar.getAttribute('data-chi-sidebar-key');
    }
    // 以 <html> 屬性為準，同步 class（屬性可能由 <head> 片段寫入）。
    applyCollapsed(isCollapsed());
    toggle = document.querySelector('[data-chi-sidebar-toggle]');
    if (toggle) {
      toggle.addEventListener('click', toggleCollapsed);
    }
    if (!isBottombar()) {
      menuButton = document.querySelector('[data-chi-sidebar-menu]');
      if (menuButton) {
        menuButton.addEventListener('click', function () {
          if (sidebar.classList.contains('mobile-open')) {
            closeMobile();
          } else {
            openMobile();
          }
        });
      }
      scrim = document.querySelector('[data-chi-sidebar-scrim]');
      if (scrim) {
        scrim.addEventListener('click', closeMobile);
      }
      document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape') closeMobile();
      });
      window.addEventListener('resize', function () {
        if (window.innerWidth >= 768) closeMobile();
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bind);
  } else {
    bind();
  }

  window.ChiSidebar = {
    isCollapsed: isCollapsed,
    setCollapsed: setCollapsed,
    toggleCollapsed: toggleCollapsed,
    openMobile: openMobile,
    closeMobile: closeMobile,
  };
})();
