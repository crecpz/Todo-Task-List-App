import { Router } from "../routes/Router.js";
import {
  createUniqueId,
  getAllPage,
  getCurrentPage,
  getCurrentPageId,
  getCurrentTodo,
  getPage,
  unhide,
} from "./helper.js";
import {
  closeEditModal,
  closeModalOverlay,
  getEditNameResult,
  nameIsEditing,
} from "./modal.js";
import { activeNavLists, renderCustomList } from "./ui.js";

// 初次載入時取得 localStorage 中的資料並存進變量中
export const DATA = getStorage();

// 取得 localStorage 的資料
export function getStorage() {
  // 如果取得的 localStorage 資料為空，則返回一個基本的初始資料
  return (
    JSON.parse(localStorage.getItem("todoLocalData")) || {
      default: [
        {
          id: "all",
          name: "全部",
          color: "",
          content: [],
        },
        {
          id: "top",
          name: "重要",
          color: "", // @ 這其實用不到，除非 dropdown 會放 top 的內容，那就需要顏色
          content: [
            //   {
            //     checked: false,
            //     content: "this is todo A.",
            //     top: true, // 凡是在 top 內的都是 true
            //   },
          ],
        },
      ],

      custom: [
        // {
        //   id: "",
        //   name: "未命名清單",
        //   color: "",
        //   content: [
        // {
        //   checked: false,
        //   content: "this is todo A.",
        //   top: false,
        // },
        // ],
        // },
      ],
    }
  );
}

/**
 * * 設定 localStorage 的資料
 * @param {*} data 欲存至 localStorage 的物件
 */
export function setStorage(data) {
  localStorage.setItem("todoLocalData", JSON.stringify(data));
}

/**
 * * 建立新的 todo 資料，並加進當前頁面中
 */
export function setTodo() {
  const todoInput = document.querySelector("#todo-input");
  if (todoInput.value.trim() !== "") {
    // 存放使用者輸入的文字內容
    const todoValue = todoInput.value.trim();

    // 取得目前頁面的所在位置(取得頁面ID)
    const currentPageId = getCurrentPageId();

    // 建構 todo Obecjt
    const todo = {
      id: createUniqueId(),
      checked: false,
      content: todoValue,
      top: currentPageId === "top", // 凡是在 top 內的都是 true
      srcId: getCurrentPageId(),
      srcName: getCurrentPage().name,
    };

    // 取得所有的頁面資料，並找出與目前頁面 id 相匹配的資料，
    // 在 content 內加入新 todo
    const allPage = getAllPage();
    allPage.find((i) => i.id === currentPageId).content.unshift(todo);

    setStorage(DATA);
    todoInput.value = "";
  }
  Router();
}

/**
 * * 接收一個在「重要」被取消的 todo 物件，將該物件從「top」移動至「all」
 * 1.判斷被取消重要的 todo 是否來自於 Top.js 本身
 * 2.若來自於 Top.js 本身，將該 todo 資料移動到 DATA.default 的 all 物件中
 * 3.移動過去之前，將 srcId、srcName 更改成屬於 all
 * 4.移動過去之後，該項 todo 將不再屬於 top，而是屬於 all 物件
 * @param {*} moveTodoObj 被取消重要的 todo Object
 */
export function moveTopToAll(moveTodoObj) {
  // 取得 DATA 中的 top 物件後，過濾掉與 moveTodoObj
  const top = getPage("top");
  top.content = top.content.filter((todoObj) => todoObj !== moveTodoObj);
  // 將 srcId、srcName 做更改
  moveTodoObj.srcName = "全部";
  moveTodoObj.srcId = "all";
  // 取得 DATA.default 中的 all 物件，並將 moveTodoObj 放入 all 物件中的 content Array 中
  const all = getPage("all");
  all.content.unshift(moveTodoObj);
  // 取消重要後及時更新頁面
  Router();
  // 儲存變更至 localStorage
  setStorage(DATA);
}

//@ 以下的函數會放到 changeTopByTodoItem 、changeTopByEditModal 兩個函數中，放置位置: 在取得到他們各自的 ID 、獲取到 todoObj 之後
export function pinTodo(todoId, todoObj) {
  // 取得該 todo 的原始 Array:
  const { srcId } = todoObj;
  const allPages = getAllPage();
  // 在所有頁面中尋找與 srcId 符合的頁面，找到之後，取得 content 屬性
  const currentTodoOriginPage = allPages.find(({ id }) => id === srcId);
  const currentTodoArray = currentTodoOriginPage.content;
  // todo - 更該順序: 將點擊到的 todo 放到第一個，其餘的順序不更改
  // todo - 利用 todoId，將 currentTodoArray 做 filter， 過濾掉該項 todo
  // todo - 創建一個新的 []，使用 spread operator 放入重要的元素跟剩下的元素
  const filteredArray = currentTodoArray.filter(({ id }) => id !== todoId);
  const topTodo = currentTodoArray.find(({ id }) => id === todoId);
  const newArr = [topTodo, ...filteredArray];

  currentTodoOriginPage.content = newArr;

  Router();
}

/**
 * * 儲存已編輯的 todo 內容，並將頁面更新。
 */
export function saveEditedTodo(e) {
  // 透過傳入的參數 e 取得 textarea 的 value
  const editedValue = e.target.value;
  // 透過傳入的參數 e 取得該項 todo 資料
  const todoId = e.target.closest(".modal__form").dataset.id;
  const currentTodo = getCurrentTodo(todoId);
  // 改變 todo 資料的 content 屬性內容
  currentTodo.content = editedValue;
  // re-render
  Router();
  // 存至 localStorage
  setStorage(DATA);
}

/**
 * * 刪除 todo 在 DATA 中的資料
 */
export function removeTodo(removeTodoId) {
  // @註: 以下註解中的 todo 皆代表要刪除的 todo

  // 取得 todo 物件中的 srcId 屬性 (srcId 屬性表示:「該 todo 是來自於哪一個頁面(id)」)
  const todoObj = getCurrentTodo(removeTodoId);
  const { srcId } = todoObj;

  // 取得該 todo 在 DATA 中的頁面資料
  const pageObjOfRemoveTarget = getPage(srcId);
  // 承上，在頁面資料的 content 屬性做過濾，將該項 todo 剔除掉
  pageObjOfRemoveTarget.content = pageObjOfRemoveTarget.content.filter(
    ({ id }) => id !== removeTodoId
  );

  // 重新 render
  Router();

  // 存至 localStorage
  setStorage(DATA);

  // 關閉編輯視窗與 modalOverlay
  closeEditModal();
  closeModalOverlay();

  // 將原本被隱藏的 editModal 再度切換成顯示狀態(以確保下一次彈出時是可見的)
  unhide("#edit-modal");
}

/**
 *
 * * 反轉 checkbox 值，最後儲存結果至 localStorage
 *
 * 注意: checkbox 可能來自於兩個地方:
 * 1.位於 todoItem 中
 * 2.位於 editModal 中
 *
 * 會根據觸發時哪邊能獲取得到 id ，來決定 currentTodoId 的值
 * @param {*} e event
 */
export function changeCheckbox(e) {
  // 如果 change 事件所觸發的 e.target 包含 .checkbox__input class
  if (e.target.classList.contains("checkbox__input")) {
    // 此變量存放當前 todo id
    let currentTodoId;
    // 此變量用來存取目前事件處發是否來自於 editModal
    let triggerFromEditModal = false;

    // 如果 e.target 向上尋找可以找到 .todo__item (代表目前所點擊)
    if (e.target.closest(".todo__item")) {
      // currentTodoId 將是往上層尋找 .todo__item 的 id
      currentTodoId = e.target.closest(".todo__item").id;
    } else {
      // 否則 currentTodoId 將是來自於 editModal checkbox 的 dataset
      currentTodoId = e.target.closest(".modal__form").dataset.id;
      // 事件處發來自 editModal
      triggerFromEditModal = true;
    }

    // 翻轉 checkbox 值
    getCurrentTodo(currentTodoId).checked =
      !getCurrentTodo(currentTodoId).checked;

    // 若事件觸發來自 editModal
    if (triggerFromEditModal) {
      // 一併更改在 DOM 中顯示的 todoItem checkbox 狀態 (注意: 只是改外觀，沒有存入 localStorage)
      const currentTodoCheckbox = document.querySelector(`#${currentTodoId}`)
        .children[0].children[0];
      currentTodoCheckbox.checked = !currentTodoCheckbox.checked;
    }
  }
  // 儲存變更
  setStorage(DATA);
}

/**
 * * 改變重要星號(top)的狀態，最後儲存結果至 localStorage
 */
export function changeTop(todoObj) {
  todoObj.top = !todoObj.top;
  // 存進 localStorage
  setStorage(DATA);
}

/**
 * * 反轉重要星號的狀態(處理來自 todoItem 所觸發的事件)
 */
export function changeTopByTodoItem(e) {
  // 從 .todo__item 取得 id
  const currentTodoId = e.target.closest(".todo__item").id;

  // 取得當前 todo 資料
  const currentTodo = getCurrentTodo(currentTodoId);

  // 反轉在資料中的 checkbox 值，並儲存
  changeTop(currentTodo);

  // 改變星號的樣式
  e.target.classList.toggle("fa-solid");
  e.target.classList.toggle("fa-regular");

  // 如果此頁位於 top，則 todo 在被按下星號後，立即渲染，讓該項從此頁消失
  if (getCurrentPageId() === "top") {
    Router();
  }

  // 檢查於重要頁面中產生的 todo 當中，已經不再被重要的 todo
  // 將其移至 「all」 資料中
  const currentPageId = getCurrentPageId();

  if (
    currentPageId === "top" && // 如果目前位於重要頁面
    !currentTodo.top && // 且當前 todo 不再是重要狀態(星星被摘除)
    currentTodo.srcId === "top" // 且該項 todo 是在重要頁面被創建出來的話
  ) {
    // 上述條件若符合，代表該項 todo 不該出現在「重要」，必須將其移至資料中的 「all」 內
    moveTopToAll(currentTodo);
  }
}

/**
 * * 反轉重要星號的狀態(處理來自 editModal 所觸發的事件)
 */
export function changeTopByEditModal(e) {
  // 從他們的上層找 dataset.id (我將 todo 的 id 使用 dataset 的方式放在 modal__form)
  const currentTodoId = e.target.closest(".modal__form").dataset.id;
  // 取得當前 todo 資料
  const currentTodo = getCurrentTodo(currentTodoId);
  // 反轉在資料中的 checkbox 值，並儲存
  changeTop(currentTodo);

  // 如果此頁位於 top，則 todo 在被按下星號後，立即渲染，讓該項從此頁消失
  if (getCurrentPageId() === "top") {
    Router();
  }
  
  // 因為 eidtModal 內的星星不是使用 checkbox 來做，所以不會在點擊之後就改變樣式，所以這邊要設定被按下去之後星星的樣式切換。
  e.target.children[0].classList.toggle("fa-solid");
  e.target.children[0].classList.toggle("fa-regular");
}