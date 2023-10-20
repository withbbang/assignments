"use strict";

let tempTableValues; // 임시 테이블 값 저장 변수
let idInputValue; // 값 추가 id
let valueInputValue; // 값 추가 value
let advancedText = `[]`; // 고급 편집 텍스트

/**
 * 실제 값 관련 클로져
 */
const values = (function () {
  let values = [];

  return {
    // values 배열 반환
    get: function () {
      return values;
    },
    // values 배열 할당
    set: function (array) {
      if (Array.isArray(array)) values = [...array];
      else alert("올바른 값을 입력하시오.");

      return values;
    },
    // values 배열 추가
    add: function ({ id, value }) {
      if (
        handleValidCheckWithoutZero(id) &&
        handleValidCheckWithoutZero(value) &&
        !handleIdValidCheck(id)
      ) {
        values.push({ id, value });
        tempTableValues = [...values];
        return values;
      } else {
        alert("올바른 값을 입력하시오.");
      }
    },
    // values 배열 임시 삭제
    delete: function (id) {
      if (handleValidCheckWithoutZero(id) && handleIdValidCheck(id)) {
        const idx = tempTableValues.findIndex((value) => value.id === id);
        if (idx > -1) tempTableValues.splice(idx, 1);
      } else {
        alert("올바른 값을 입력하시오.");
      }
    },
    // values 배열 삭제 적용
    applyDelete: function () {
      values = [...tempTableValues];
    },
    // values 배열 고급 편집 적용
    applyAdvanced: function () {
      values = [...JSON.parse(advancedText)];
    },
  };
})();

/**
 * 모든 DOM 로드 후 실행할 로직
 */
document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("textarea").value = advancedText;
});

/**
 * img, video 로드 후 실행할 로직
 */
window.onload = function () {};

/**
 * 값 편집 삭제 버튼 콜백 함수
 * @param {HTMLElement} el
 */
function handleDeleteValue(el) {
  const id = el.dataset.id;

  values.delete(id);

  const ul = document.getElementById("ul");

  handleInitUl(ul);

  tempTableValues.forEach(({ id, value }, idx) => {
    ul.insertAdjacentHTML(
      "beforeend",
      `
        <li class="li li-${idx % 2 === 0 ? "even" : "odd"}">
            <div class="ul-id-div">${id}</div>&nbsp;
            <div class="ul-value-div">${value}</div>&nbsp;
            <div class="ul-delete-div"><button data-id="${id}" onclick="handleDeleteValue(this)">삭제</button></div>
        </li>
        <div class="crossbar"></div>
      `
    );
  });
}

/**
 * 값 편집 Apply 버튼 콜백 함수
 */
function handleApplyDeleteValue() {
  values.set(tempTableValues);
  handleRender();
}

/**
 * 값 편집 input 콜백 함수
 * @param {HTMLElement} el
 */
function handleOnInputId(el) {
  idInputValue = el.value;
}

/**
 * 값 편집 input 콜백 함수
 * @param {HTMLElement} el
 */
function handleOnInputValue(el) {
  valueInputValue = el.value;
}

/**
 * 값 추가 Add 버튼 콜백 함수
 */
function handleAddValue() {
  if (
    handleValidCheckWithoutZero(idInputValue) &&
    handleValidCheckWithoutZero(valueInputValue) &&
    !handleIdValidCheck(idInputValue)
  ) {
    values.add({ id: idInputValue, value: valueInputValue });
    handleRender();
  } else {
    alert("올바른 값을 입력하시오.");
  }
}

/**
 * 값 고급 편집 textarea oninput 콜백 함수
 * @param {HTMLElement} el
 */
function handleOnInputTextarea(el) {
  advancedText = el.value;
}

/**
 * 값 고급 편집 textarea onblur 콜백 함수
 * @param {HTMLElement} el
 */
function handleOnBlurTextarea(el) {
  if (el.value === "") {
    advancedText = `[]`;
    el.value = `[]`;
  }
}

/**
 * 값 고급 편집 Apply 버튼 콜백 함수
 */
function handleApplyAdvancedValue() {
  try {
    const newValues = JSON.parse(advancedText);
    values.set([...newValues]);
    handleRender();
  } catch (err) {
    console.error(err);
    alert("올바른 값을 입력하시오.");
  }
}

function handleSetCanvas() {}

function handleSetTable() {
  tempTableValues = [...values.get()];
  const ul = document.getElementById("ul");

  handleInitUl(ul);

  values.get().forEach(({ id, value }, idx) => {
    ul.insertAdjacentHTML(
      "beforeend",
      `
        <li class="li li-${idx % 2 === 0 ? "even" : "odd"}">
            <div class="ul-id-div">${id}</div>&nbsp;
            <div class="ul-value-div">${value}</div>&nbsp;
            <div class="ul-delete-div"><button data-id="${id}" onclick="handleDeleteValue(this)">삭제</button></div>
        </li>
        <div class="crossbar"></div>
      `
    );
  });
}

function handleSetAddInput() {
  const idInput = document.getElementById("idInput");
  const valueInput = document.getElementById("valueInput");

  idInput.value = "";
  valueInput.value = "";

  idInputValue = "";
  valueInputValue = "";
}

function handleSetAdvancedTextarea() {
  const textarea = document.getElementById("textarea");

  textarea.value = JSON.stringify(values.get());
}

/**
 * 화면 반영
 */
function handleRender() {
  handleSetCanvas();
  handleSetTable();
  handleSetAddInput();
  handleSetAdvancedTextarea();
}

/**
 * 변수 유효성 검증 함수
 * @param {string | undefined | null} value
 * @returns {boolean}
 */
function handleValidCheckWithoutZero(value) {
  return (
    (typeof value === "string" || typeof value === "number") &&
    value !== "" &&
    value !== undefined &&
    value !== null
  );
}

/**
 * 중복 ID 검증 함수
 * @param {number} id
 * @returns {boolean}
 */
function handleIdValidCheck(id) {
  return typeof values.get().find((value) => value.id === id) === "object";
}

/**
 * ul 초기화
 * @param {HTMLElement} ul
 */
function handleInitUl(ul) {
  ul.innerHTML = `
    <li class="li li-header">
        <div class="ul-id-div">ID</div>
        &nbsp;
        <div class="ul-value-div">값</div>
        &nbsp;
        <div class="ul-delete-div"></div>
    </li>
    <div class="crossbar"></div>
  `;
}
