//Router
import { Router } from "./routes/Router.js";
import { updateMode } from "./utils/mode.js";
import { appHeight, getStorage, setStorage } from "./utils/function.js";
import { renderCustomList, activeWhenLoad } from "./layout/nav.js";


// 監聽 hash 變化 & 加載完畢事件
window.addEventListener("hashchange", Router);
window.addEventListener("load", Router);

// 監聽 DOM 載入完畢，並更新光線模式
window.addEventListener("DOMContentLoaded", updateMode);

// 監聽使用者系統光線模式是否被改變
window
  .matchMedia("(prefers-color-scheme: dark)")
  .addEventListener("change", updateMode);
  
// 初次載入從資料中渲染出 customList 
window.addEventListener("DOMContentLoaded", renderCustomList);

// 初次載入時將 nav active 
window.addEventListener('load', activeWhenLoad)
  
// 解決手機瀏覽器無法剛好只占滿整版的問題
window.addEventListener("resize", appHeight);
window.addEventListener("DOMContentLoaded", appHeight);

// 關閉瀏覽器 or 重新整理時，將資料存進 localStorage 中 (先禁用!)
// window.addEventListener('unload', () => setStorage(DATA));