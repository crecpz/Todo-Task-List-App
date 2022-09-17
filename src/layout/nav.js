import { modeSwitcher } from "../utils/mode.js";
import { createUniqueId, getStorage, setStorage } from "../utils/function.js";
import { DATA } from "../utils/function.js";

const navContent = document.querySelector(".nav__content");

/**
 * 注意:
 * 下面這個 renderCustomList() 會有一個問題。
 * 
 * 具體問題為何，可以試試看:
 * 1.先增加幾個自訂清單
 * 2.隨意點擊清單，可以看到 active 與網址都沒有問題
 * 3.此時隨意點擊「除了最後一個以外的任意一個」，ex: 置頂。
 * 4.F5 刷新，可以看到雖然網址沒有變化，但是 active 已經跑到最後了
 * 5.這樣的問題就出在 renderCustomList() 內，我直接把 DATA.custom[DATA.custom.length - 1].id
 *   賦值給 latestListId，也就是說，在下面結構進行比較時，它必定會讓 active 變成 DATA.custom 的最後一位，
 *   這也是為什麼怎麼刷新都始終卡在最下面。
 * 
 * 關鍵概念:
 * - 以上行為的動作(指「無論如何都讓 active 套用在最後一個元素」這個行為)固然需要，但是並不適用於「平常載入時的渲染」，
 *   意思是說，如果要做為單純頁面載入時的渲染，不應該包含 "nav.js:33 ~ nav.js:35" 那段。應該只有在使用者按下「新增
 *   自訂清單」按鈕之後，才會出現那樣的判斷，否則其他時候應該是靜默無聲才對。
 * 
 * - 具體來說可能是條件下錯，可以看 :35 的條件: DATA.custom.length，這不就代表只要 DATA.custom 內有東西，
 *   active 就一定會在最後面嗎 ?
 * 
 * - 下次先想想看要怎麼換條件，或是要用什麼方法，讓頁面載入時的渲染就只是單純渲染出來，而只有在新增新的清單時，
 *   才加入判斷來控制 active。
 * 
 * - 所有的 active 應該是根據網址列來決定的，那是單一來源。(目前開始把 currentPageInfo 撤掉了，因為根本沒有什麼
 *   好存的，我所需要的東西網址列就有了)
 */


/**
 * 渲染 customList 至頁面中
 */
export function renderCustomList() {
  // 從 DATA.custom 的最後一位取得目前最新的 list 的 Id，若不存在則設為 null。
  // 下方的結構中將會使用此值與當前頁面 id 做比對，只有在當前 list.id 與 最新的
  // list.id 相同的元素需要加上 active
  const latestListId = DATA.custom.length !== 0 
    ? DATA.custom[DATA.custom.length - 1].id 
    : null;
    console.log(latestListId)

  let lists = DATA.custom.map(list => {
    return `<li id="${list.id}" 
                class="custom-list__item nav__list-item 
                ${list.id === latestListId ? "nav__list-item--active" : ""}">
              <a class="nav__list-link nav__list-link--custom-list" 
                  href="#/customlist/${list.id}">
                  <div class="custom-list__color"></div>
                  ${list.name}
              </a>
            </li>`;
  });

  customList.innerHTML = lists.join("");
}

/**
 * nav 側邊欄展開時所需套用的行為
 */
export function navSwitcher() {
  const wrapper = document.querySelector("#wrapper"),
    nav = document.querySelector("#nav"),
    main = document.querySelector("#main"),
    mainHeader = document.querySelector("#main__header");
  // 加上 nav-open class
  [wrapper, nav, main, mainHeader].forEach((elem) => {
    elem.classList.toggle("nav-open");
  });
}

/**
 * 清除在 nav內選單的 active
 */
function removeNavActive() {
  navContent
    .querySelectorAll(".nav__list-item")
    .forEach((i) => i.classList.remove("nav__list-item--active"));
}

// nav 中所有的選單點擊切換行為
document.querySelectorAll(".nav__list").forEach((i) => {
  i.addEventListener("click", (e) => {
    if (e.target.classList.contains("nav__list-link")) {
      // 清除在選單上的 active
      removeNavActive();
      // 更新 active
      e.target.closest("li").classList.add("nav__list-item--active");
    }
  });
});

/**
 * 接收一個 Array 作為參數，該 Array 包含所有目前的 「未命名清單」。
 * 提取出所有「未命名清單」後的數字，並將數字排序後並返回一個數字陣列
 * @param {*} listArr 所有「未命名清單」陣列
 * @returns 返回一個經過大小排序的數字陣列。
 */
function extractUnnamedNumber(listArr) {
  return (
    listArr
      // 匹配開頭為「未命名清單(X)」及頭尾名為 「未命名清單」的元素
      .filter((list) => /^未命名清單(?=\(\d+\)$)|^未命名清單$/.test(list))
      .map((list) => {
        // 取出數字部分 (如果遇到「未命名清單」純文字，將其設為 0)
        if (list.match(/\d+/)) {
          return Number(list.match(/\d+/)[0]);
        } else if (list.match(/\d+/) === null && list === "未命名清單") {
          return 0;
        }
      })
      // 排序
      .sort((a, b) => a - b)
  );
}

/**
 * 計算目前最新的未命名清單後的編號應該為多少。
 * 此函數接收一個 `Array` 作為參數，該 Array 必須包含目前所有的未命名清單的編號。
 * @param {*} numList
 * @returns 返回應該新增在「未命名清單」後的內容，且是 `String`。
 */
function listCounter(numList) {
  // 過濾掉 arr 內空無一物的狀況
  if (numList.length === 0) {
    return; // 這個 undefined 後續必續用它來判斷文字後是否要加數字
  }

  let i = 0;
  while (true) {
    if (numList.indexOf(i) === -1) {
      break;
    }
    i++;
  }
  return `(${i})`;
}

// window.addEventListener('hashchange',()=> console.log(window.location.hash))

// todo: 將新增的清單更新至 localStorage

// // 頁面完全載入後，根據 currentPageInfo.pageId 為何來決定哪個 item 要被 active。
// // *註: 使用 `load` 是因為使用 DOMContentLoaded 會讀取不到後續才渲染的 customList
// window.addEventListener("load", navListItemActive);

// function navListItemActive() {
//   const navListItems = document.querySelectorAll(".nav__list-item");
//   // 比對目前現有 navListItem 是否有任何一個元素的 id 跟 currentPageInfo.pageId 相同，
//   // 並將其存進 activedItem 變量中
//   let activedItem = Array.from(navListItems).find((item) => {
//     return item.id === DATA.currentPageInfo.pageId;
//   });

//   // 刪除所有現有 active，並將 activedItem 加上 active
//   removeNavActive();
//   activedItem.classList.add("nav__list-item--active");
// }

// --------------------------[ 新增自訂列表 ]--------------------------

const addBtn = document.querySelector("#add-list-btn");
const customList = document.querySelector(".custom-list");

addBtn.addEventListener("click", addCustomList);

/**
 * 此函數代表整個 customList 從新建並儲存到渲染的動作。
 * 會先使用 `setCustomList()` 將新的自訂清單加入到 DATA，
 * 接著使用 `renderCustomList()` 渲染 customList 至頁面中。
 * @param {*} e
 */
function addCustomList() {
  setCustomList();

  // 按下新增按鈕後，將頁面導向到當前最新新增的頁
  window.location.hash = `/customlist/${
    DATA.custom[DATA.custom.length - 1].id
  }`;

  // 清除在選單上的 active
  removeNavActive();

  renderCustomList();
}

// console.log(DATA.custom)

/**
 * 將新的自訂清單加入到 DATA
 */
function setCustomList() {
  // 獲取現有清單
  const allCustomListName = DATA.custom.map((i) => i.name);
  const numberList = extractUnnamedNumber(allCustomListName);
  const newNumber = listCounter(numberList);

  DATA.custom.push({
    id: createUniqueId(),
    name: `未命名清單${newNumber}`,
    color: "",
    content: [
      // ↓ 示意格式
      // {
      //   checked: false,
      //   content: "this is todo A.",
      //   pin: false,
      // },
    ],
  });
  setStorage(DATA);
}

// --------------------------[ 監聽當前點擊頁面 ]--------------------------

// 設定在 DATA 中的 currentPageInfo.pageId
// navContent.addEventListener("click", setCurrentPageId);

// 設定在 DATA 中的 currentPageInfo.path
// window.addEventListener("hashchange", setCurrentPath);

// /**
//  * 取得 e.target 的 ID，並更新在 DATA 中的 currentPageInfo.pageId
//  * @param {*} e
//  */
// export function setCurrentPageId(e) {
//   if (e.target.classList.contains("nav__list-link")) {
//     const currentPageId = e.target.closest("li").id;
//     DATA.currentPageInfo.pageId = currentPageId;
//     console.log('pageId update: ', DATA.currentPageInfo.pageId)
//   }
// }

// /**
//  * 設定在 DATA 中的 currentPageInfo.path
//  * @param {*} e
//  */
// export function setCurrentPath() {
//   const currentPath = location.hash.slice(1).toLowerCase();
//   DATA.currentPageInfo.path = currentPath;
// }

const wrapper = document.querySelector(".wrapper");
wrapper.addEventListener("click", (e) => {
  // 光線模式切換
  modeSwitcher(e);

  // 點擊漢堡鈕來開啟 nav
  if (e.target.id === "main-hamburger" || e.target.id === "nav-hamburger") {
    navSwitcher();
  }

  // 如果點按 body-overlay 時 nav 是開啟的狀態，則調用 navSwitcher() 來關閉 nav
  if (
    e.target.classList.contains("body-overlay") &&
    document.querySelector("#wrapper").classList.contains("nav-open")
  ) {
    // 切換 nav 展開與收合
    navSwitcher();
  }
});
