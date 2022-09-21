import { createUniqueId, DATA, getCurrentPageId, getCurrentCustomPage, getCurrentTodo } from "../utils/function.js";
import { setStorage } from "../utils/function.js";

export const CustomList = {
  state: {},

  mount: function () {},

  render: function (props) {
    const pageData = DATA.custom.find((page) => page.id === props.id);
    const { name, content } = pageData;

    const todoContent = content.map((li) => {
      
      return `
                <li id="${li.id}" class="todo__item">
                    <label class="todo__label">
                        <input type="checkbox" class="todo__checkbox" 
                        ${
                          li.checked ? "checked" : ""
                        }>
                        <span class="todo__checkmark"></span>
                        <p class="todo__content">${li.content}</p>
                    </label>
                    <i class="todo__top ${li.top ? "fa-solid" : "fa-regular"} fa-star"></i> 
                </li>
        `;
    });

    return `
        <!-- 主內容區 header -->
        <div class="main__content-header">
            <div class="container">
                <h2 class="main__title">
                    <div class="main__color-block"></div>
                    ${name}
                </h2>
                <!-- 清單選單按鈕 -->
                <button class="btn btn--list-option"><i class="fa-solid fa-ellipsis"></i></button>
                <!-- 清單選單 -->
                <ul class="list-option">
                    <li class="list-option__item">
                        <a href="#" class="list-option__link">重新命名</a>
                    </li>
                    <li class="list-option__item">
                        <a href="#" class="list-option__link">編輯</a>
                    </li>
                    <li class="list-option__item">
                        <a href="#" class="list-option__link">排序</a>
                    </li>
                    <li class="list-option__item">
                        <a href="#" class="list-option__link">刪除清單</a>
                    </li>
                </ul>
            </div>
        </div>


        <!-- main content list -->
        <div class="main__content-list">
            <div class="container">
                <ul id="todo" class="todo">
                ${todoContent.join("")}
                </ul>
            </div>
        </div>
    `;
  },

  listener: {
    click: (e) => {
      
      if(e.target.classList.contains('todo__top')){ 
        // 取得當前 todo
        const currentTodo = getCurrentTodo(e);
        currentTodo.top = !currentTodo.top;
        e.target.classList.toggle("fa-solid")
        e.target.classList.toggle("fa-regular")
        // 存進 localStorage
        setStorage(DATA);
      }
    },

    change: function(e){
      if (e.target.classList.contains("todo__checkbox")) {
        // 取得當前 todo
        const currentTodo = getCurrentTodo(e);
        // 反轉 checked 值
        currentTodo.checked = !currentTodo.checked;
        // 存進 localStorage
        setStorage(DATA);
      }
    },
  },
};
