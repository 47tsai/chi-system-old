/* chi-system sidebar.js — 側邊欄邏輯唯一來源（SYSTEM.md 第 8 節、第 15 節第 6 步）
 *
 * 作法取自 shadcn/ui sidebar：收合開關（SidebarTrigger）放在頁面標頭，不在側邊欄內；
 * 同一顆按鈕在手機版開抽屜、桌面版收合為圖示列；Cmd／Ctrl＋B 也可切換。
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
 *   為抽屜或底部列，皆不讀收合狀態。CSS 以媒體查詢守住範圍，此檔不判斷寬度來套用收合。
 * - 收合狀態 key 為 chi-<站點>-sidebar-collapsed，值 "1" 為收合、"0" 或無值為展開；
 *   未設定 data-chi-sidebar-key 時只切換當次，不寫入 localStorage。
 * - 抽屜：頁面標頭的開關按鈕 [data-chi-sidebar-toggle] 開，遮罩 [data-chi-sidebar-scrim]
 *   點按與 Escape 關；開啟時鎖住背景捲動，關閉時焦點回到開關按鈕；視窗放大到 >=768px
 *   時自動關抽屜。底部列版式（.chi-sidebar--bottombar）不用抽屜，開關不綁定抽屜。
 * - 對外 API（供框架薄包裝與除錯用）：window.ChiSidebar = { isCollapsed, setCollapsed,
 *   toggleCollapsed, openMobile, closeMobile }；收合改變時在 window 派發
 *   chi-sidebar-change 事件，detail 為 { collapsed }。
 */
(function () {
  'use strict';

  var COLLAPSED = '1';
  var MOBILE_MAX = 768;
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
  var trigger = null;
  var scrim = null;
  var lastTrigger = null;

  function isMobile() {
    return window.innerWidth < MOBILE_MAX;
  }

  function isCollapsed() {
    return root.getAttribute('data-chi-sidebar-collapsed') === COLLAPSED;
  }

  function isBottombar() {
    return !!sidebar && sidebar.classList.contains('chi-sidebar--bottombar');
  }

  function updateTriggerLabel() {
    if (!trigger) return;
    if (isMobile()) {
      var open = !!sidebar && sidebar.classList.contains('mobile-open');
      trigger.setAttribute('aria-expanded', open ? 'true' : 'false');
      trigger.setAttribute('aria-label', open ? '關閉導覽選單' : '開啟導覽選單');
      trigger.setAttribute('title', open ? '關閉導覽選單' : '開啟導覽選單');
    } else {
      var collapsed = isCollapsed();
      trigger.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
      trigger.setAttribute('aria-label', collapsed ? '展開側邊欄' : '收合側邊欄');
      trigger.setAttribute('title', collapsed ? '展開側邊欄' : '收合側邊欄');
    }
  }

  function setCollapsed(collapsed) {
    var next = !!collapsed;
    if (next === isCollapsed()) return;
    if (next) {
      root.setAttribute('data-chi-sidebar-collapsed', COLLAPSED);
    } else {
      root.removeAttribute('data-chi-sidebar-collapsed');
    }
    writeCollapsed(next);
    updateTriggerLabel();
    window.dispatchEvent(new CustomEvent('chi-sidebar-change', { detail: { collapsed: next } }));
  }

  function toggleCollapsed() {
    setCollapsed(!isCollapsed());
  }

  function openMobile() {
    if (!sidebar || isBottombar()) return;
    lastTrigger = document.activeElement;
    sidebar.classList.add('mobile-open');
    if (scrim) scrim.classList.add('visible');
    root.classList.add('chi-sidebar-open');
    updateTriggerLabel();
    var firstLink = sidebar.querySelector('.chi-sidebar__nav a');
    if (firstLink) firstLink.focus();
  }

  function closeMobile() {
    if (!sidebar) return;
    if (!sidebar.classList.contains('mobile-open')) return;
    sidebar.classList.remove('mobile-open');
    if (scrim) scrim.classList.remove('visible');
    root.classList.remove('chi-sidebar-open');
    updateTriggerLabel();
    if (lastTrigger && lastTrigger.focus) lastTrigger.focus();
    lastTrigger = null;
  }

  function onTriggerClick() {
    if (isMobile()) {
      if (sidebar.classList.contains('mobile-open')) {
        closeMobile();
      } else {
        openMobile();
      }
    } else {
      toggleCollapsed();
    }
  }

  function bind() {
    sidebar = document.querySelector('.chi-sidebar');
    if (!sidebar) return;
    if (!key) {
      key = sidebar.getAttribute('data-chi-sidebar-key');
    }
    trigger = document.querySelector('[data-chi-sidebar-toggle]');
    if (trigger) {
      trigger.addEventListener('click', onTriggerClick);
    }
    updateTriggerLabel();
    if (!isBottombar()) {
      scrim = document.querySelector('[data-chi-sidebar-scrim]');
      if (scrim) {
        scrim.addEventListener('click', closeMobile);
      }
      document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape') closeMobile();
      });
      window.addEventListener('resize', function () {
        if (!isMobile()) closeMobile();
        updateTriggerLabel();
      });
      document.addEventListener('keydown', function (event) {
        if ((event.metaKey || event.ctrlKey) && (event.key === 'b' || event.key === 'B')) {
          var target = event.target;
          if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT' || target.isContentEditable)) return;
          event.preventDefault();
          onTriggerClick();
        }
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
