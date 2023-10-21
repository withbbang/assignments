"use strict";

/******************************************************************************
 *                                   변수 선언                                  *
 *****************************************************************************/
let tempTableValues; // 임시 테이블 값 저장 변수
let idInputValue; // 값 추가 id
let valueInputValue; // 값 추가 value
let advancedText = `[]`; // 고급 편집 텍스트

/**
 * 실제 값 관련 클로저
 */
const values = (function () {
  let values = [];

  return function () {
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
        try {
          if (
            handleCheckIsValidIdWithoutZero(id) &&
            handleCheckIsValidValueWithoutZero(value) &&
            handleIdValidCheck(id)
          ) {
            values.push({ id, value });
            tempTableValues = [...values];
            return values;
          } else {
            throw Error("올바른 값을 입력하시오");
          }
        } catch (err) {
          console.error(err);
          alert(err.message);
        }
      },
      // values 배열 임시 삭제
      delete: function (id) {
        try {
          if (handleCheckIsValidIdWithoutZero(id)) {
            const idx = tempTableValues.findIndex((value) => value.id === id);
            if (idx > -1) tempTableValues.splice(idx, 1);
          } else {
            throw Error("올바른 값을 입력하시오");
          }
        } catch (err) {
          console.error(err);
          alert(err.message);
        }
      },
      // values 배열 중 일부 값 임시 갱신
      update: function (id, value) {
        try {
          if (handleCheckIsValidIdWithoutZero(id)) {
            const idx = tempTableValues.findIndex((value) => value.id === id);
            if (idx > -1) tempTableValues[idx].value = value;
          } else {
            throw Error("올바른 값을 입력하시오");
          }
        } catch (err) {
          console.error(err);
          alert(err.message);
        }
      },
    };
  };
})();

/******************************************************************************
 *                                화면 초기 실행                                 *
 *****************************************************************************/
// 모든 DOM 로드 후 실행할 로직
document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("textarea").value = advancedText;
  handleSetCanvas();
});
// img, video 로드 후 실행할 로직
window.onload = function () {};

/******************************************************************************
 *                                  콜백 함수                                   *
 *****************************************************************************/
/**
 * 값 편집 - 값 blur 콜백 함수
 * @param {HTMLElement} el
 */
function handleOnBlurValue(el) {
  const {
    value,
    dataset: { id },
  } = el;

  values().update(id, value);
}

/**
 * 값 편집 - 삭제 버튼 콜백 함수
 * @param {HTMLElement} el
 */
function handleDeleteValue(el) {
  values().delete(el.dataset.id);
  handleSetUl(document.getElementById("ul"), tempTableValues);
}

/**
 * 값 편집 - Apply 버튼 콜백 함수
 */
function handleApplyDeleteValue() {
  values().set(tempTableValues);
  handleRender();
}

/**
 * 값 추가 - id input 콜백 함수
 * @param {HTMLElement} el
 */
function handleOnInputId(el) {
  idInputValue = el.value;
}

/**
 * 값 추가 - value input 콜백 함수
 * @param {HTMLElement} el
 */
function handleOnInputValue(el) {
  valueInputValue = +el.value;
}

/**
 * 값 추가 - Add 버튼 콜백 함수
 */
function handleAddValue() {
  values().add({ id: idInputValue, value: valueInputValue });
  handleRender();
}

/**
 * 값 고급 편집 - textarea oninput 콜백 함수
 * @param {HTMLElement} el
 */
function handleOnInputTextarea(el) {
  advancedText = el.value;
}

/**
 * 값 고급 편집 - textarea onblur 콜백 함수
 * @param {HTMLElement} el
 */
function handleOnBlurTextarea(el) {
  if (el.value === "") {
    advancedText = `[]`;
    el.value = `[]`;
  }
}

/**
 * 값 고급 편집 - Apply 버튼 콜백 함수
 */
function handleApplyAdvancedValue() {
  try {
    const vals = [...JSON.parse(advancedText)];

    vals.forEach(({ value }) => {
      handleCheckIsValidValueWithoutZero(value);
    });

    values().set(vals);
    handleRender();
  } catch (err) {
    console.error(err);
    let message = "올바른 값을 입력하시오.";
    if (err.name === "Error") {
      message = err.message;
    }
    alert(message);
  }
}

/******************************************************************************
 *                                    렌더링                                    *
 *****************************************************************************/
/**
 * 그래프 - 재렌더링
 */
function handleSetCanvas() {
  const canvas = document.querySelector(".canvas");
  const ctx = canvas.getContext("2d");
  const { width, height } = canvas.getBoundingClientRect();
  canvas.width = width;
  canvas.height = height;
  ctx.clearRect(0, 0, width, height);
  const vals = values().get();
  const max = handleGetMaxValueInArray();
  const paddingDefault = 20;
  const distance = (width - paddingDefault * 2) / (vals.length + 1);

  // 그래프 기본 스타일 설정
  ctx.lineWidth = 1;
  ctx.strokeStyle = "#000";
  ctx.font = "15px";

  // X축 그리기
  ctx.beginPath();
  ctx.moveTo(paddingDefault, height - paddingDefault);
  ctx.lineTo(width - paddingDefault, height - paddingDefault);
  ctx.stroke();

  // Y축 그리기
  ctx.beginPath();
  ctx.moveTo(paddingDefault, height - paddingDefault);
  ctx.lineTo(paddingDefault, paddingDefault);
  ctx.stroke();

  // 원점 표시
  ctx.fillText(0, 0, height - 10);

  // 최대값 표시
  ctx.fillText(max, 0, paddingDefault);

  // 막대 그래프 그리기
  ctx.strokeStyle = "#f00";
  vals.forEach(({ id, value }, idx) => {
    ctx.fillText(id, paddingDefault + distance * (idx + 1), height - 10);
    ctx.beginPath();
    ctx.moveTo(paddingDefault + distance * (idx + 1), height - paddingDefault);
    ctx.lineTo(
      paddingDefault + distance * (idx + 1),
      paddingDefault + ((max - value) * (height - 2 * paddingDefault)) / max
    );
    ctx.stroke();
  });
}

/**
 * 값 편집 - 재렌더링
 */
function handleSetTable() {
  const vals = values().get();
  tempTableValues = [...vals];
  handleSetUl(document.getElementById("ul"), vals);
}

/**
 * 값 추가 - 재렌더링
 */
function handleSetAddInput() {
  document.getElementById("idInput").value = "";
  document.getElementById("valueInput").value = "";

  idInputValue = "";
  valueInputValue = "";
}

/**
 * 값 고급 편집 - 재렌더링
 */
function handleSetAdvancedTextarea() {
  document.getElementById("textarea").value = JSON.stringify(values().get());
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

/******************************************************************************
 *                                   부속함수                                   *
 *****************************************************************************/
/**
 * ID 유효성 검증 함수
 * @param {string | undefined | null} id
 * @returns {boolean}
 */
function handleCheckIsValidIdWithoutZero(id) {
  if (
    (typeof id === "string" || typeof id === "number") &&
    id !== "" &&
    id !== undefined &&
    id !== null
  )
    return true;
  else throw Error("올바른 ID를 입력하시오");
}

/**
 * value 유효성 검증 함수
 * @param {number} value
 * @returns {boolean}
 */
function handleCheckIsValidValueWithoutZero(value) {
  if (!isNaN(+value) && value !== undefined && value !== null) return true;
  else throw Error(`숫자가 아닙니다 - ${value}`);
}

/**
 * 중복 ID 검증 함수
 * @param {number} id
 * @returns {boolean}
 */
function handleIdValidCheck(id) {
  if (
    typeof values()
      .get()
      .find((value) => value.id === id) === "object"
  )
    throw Error("ID가 중복되었습니다.");
  else return true;
}

/**
 * ul 초기화
 * @param {HTMLElement} ul
 * @param {Array<Object>} values
 */
function handleSetUl(ul, values) {
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

  values.forEach(({ id, value }, idx) => {
    ul.insertAdjacentHTML(
      "beforeend",
      `
        <li class="li li-${idx % 2 === 0 ? "even" : "odd"}">
            <div class="ul-id-div">${id}</div>&nbsp;
            <div class="ul-value-div">
              <input data-id="${id}" value="${value}" type="number" onblur="handleOnBlurValue(this);"/>
            </div>&nbsp;
            <div class="ul-delete-div">
              <button data-id="${id}" onclick="handleDeleteValue(this)">삭제</button>
            </div>
        </li>
        <div class="crossbar"></div>
      `
    );
  });
}

/**
 * 최대값 반환
 * @returns {string | number}
 */
function handleGetMaxValueInArray() {
  try {
    const vals = values().get();

    if (!Array.isArray(vals)) throw Error("배열이 아닙니다.");

    if (vals.length < 1) return "∞";

    return Math.max(...vals.map((item) => item.value));
  } catch (err) {
    console.error(err);
    alert("숫자가 아닌 값이 들어가 있습니다.");
  }
}
