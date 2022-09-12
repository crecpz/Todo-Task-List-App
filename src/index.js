//Router
import { Router } from "./routes/Router.js";
import { updateMode } from "./utils/mode.js";
import { appHeight } from "./utils/function.js";

// 解決手機瀏覽器無法剛好只占滿整版的問題
window.addEventListener("resize", appHeight);
window.addEventListener("DOMContentLoaded", appHeight);

// 監聽 hash 變化 & 加載完畢事件
window.addEventListener("hashchange", Router);
window.addEventListener("load", Router);

// 監聽 DOM 載入完畢，並更新光線模式
window.addEventListener("DOMContentLoaded", updateMode);
// 監聽使用者系統光線模式是否被改變
window
  .matchMedia("(prefers-color-scheme: dark)")
  .addEventListener("change", updateMode);


// 基本物件資料
export const localData = {
  currentPageData: {
    pageId: "",
    path: "",
  },

  pin: [],

  custom: [
    // {
    //   listId: "",
    //   listName: "未命名清單",
    //   listColor: "",
    //   listContent: [
    //     // {
    //     //   checked: false,
    //     //   content: "this is todo A.",
    //     //   pin: false,
    //     // },
    //   ],
    // },
  ],
};