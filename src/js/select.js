/**
 * @description Fecha todos os selects customizados. (Precisa ser adicionado ao document.onclick)
 * @param [string] [identifier] - Identificador do select customizado.
 * @param [string] [value] - Valor do option a ser selecionado.
 *
 * @returns { setValue, getValue, setError, getSelectedOption, selector } - Retorna um objeto com as funções de controle do select customizado.
 */
function useCustomSelectState(identifier, initialValue = undefined) {
  let selector = document.querySelector(identifier);
  if (!selector.classList.contains("custom_select")) {
    console.error("Element is not a custom select");
    return;
  }

  const getValue = () => {
    return selector.querySelector(
      '.custom_select__option input[type="radio"]:checked'
    ).value;
  };

  const setValue = (optionValue) => {
    const option = selector.querySelector(
      `.custom_select__option input[type="radio"][value=${optionValue}]`
    );

    if (option) {
      option.click();
    } else {
      console.error(`Option not found for the value ${optionValue}`);
    }
  };

  const hasInputBox = () => {
    if (selector.parentNode.classList.contains("input_box")) {
      return true;
    }
    console.error(`input box not found for ${identifier}`);
    return false;
  };

  const setError = (error) => {
    if (hasInputBox()) {
      let inputBox = selector.parentNode;
      let errorBox = inputBox.querySelector(".input_box__error");
      if (!errorBox) {
        console.error(`input box error (p) not found for ${identifier}`);
        return;
      }
      if (error) {
        inputBox.dataset.error = true;
        errorBox.innerHTML = error;
        return;
      } else {
        inputBox.dataset.error = false;
        errorBox.innerHTML = "";
        return;
      }
    }
  };

  if (initialValue) {
    setValue(initialValue);
  }

  return {
    getValue,
    setValue,
    setError,
    selector,
  };
}

// --------------- CONFIGURATIONS ---------------

function getParentByClass(target, className) {
  if (!target) return;

  if (target.parentNode.classList.contains(className)) return target.parentNode;
  if (target.nodeName.toLowerCase() == "body") {
    return null;
  }

  return getParentByClass(target.parentNode, className);
}

class CustomSelectAdapter {
  /**
   *
   * @param {HTMLDivElement} select
   */
  constructor(select) {
    if (!select && select.classList.contains("custom_select"))
      throw Error("Select not found!");
    this.select = select;

    this.selectedValue = select.querySelector(".custom_select__selected");
    this.selectButtonInput = select.querySelector(
      ".custom_select__button input"
    );
    this.optionInputList = select.querySelectorAll(
      ".custom_select__option input"
    );

    this.inputQuery = select.querySelector(
      `.custom_select__search input[type="search"]`
    );

    this._init();
  }

  _init() {
    this._selectButtonActions();
    this.filterByInput();
    this.optionInputList.forEach((option) => this._defineOption(option));
  }

  _selectButtonActions() {
    this.selectButtonInput.addEventListener("change", (e) => {
      CustomSelectAdapter.closeAllOpenSelects(getParentByClass(e.target, "custom_select"));
    });

    this.selectButtonInput.addEventListener("input", () => {
      this.select.classList.toggle("open");

      if (!this.select.classList.contains("open")) return;

      const input =
        this.select.querySelector(".custom_select__option input:checked") ||
        this.select.querySelector(".custom_select__option input");

      input.focus();
    });
  }

  _defineOption(optionEl = null) {
    if (!optionEl) throw Error("Option element not found.");

    optionEl.addEventListener("click", (event) => {
      this.selectedValue.textContent = optionEl.dataset.label;

      const isMouseOrTouch =
        event.pointerType === "mouse" || event.pointerType === "touch";

      isMouseOrTouch && this.selectButtonInput.click();

      CustomSelectAdapter.showAllSelectOptions(this.select);
    });

    if (optionEl.checked) {
      optionEl.click();
    }
  }

  filterByInput() {
    if (!this.inputQuery) return;
    this.inputQuery.addEventListener("input", () => {
      this.optionInputList.forEach((option) => {
        if (
          !option.dataset.label
            .toLowerCase()
            .includes(this.inputQuery.value.toLowerCase()) &&
          !option.checked
        ) {
          option.parentNode.style.display = "none"; // hide element
        } else {
          option.parentNode.style.display = ""; // back to default
        }
      });
    });
  }

  static closeAllOpenSelects(parent = null) {
    const openSelects = document.querySelectorAll(".custom_select");

    for (let select of openSelects) {
      if (select != parent) {
        if (select.classList.contains("open")) {
          select.classList.toggle("open");
        }
        select.querySelector(".custom_select__button input").checked = false;
        CustomSelectAdapter.showAllSelectOptions(select);
      }
    }
  }

  static showAllSelectOptions(select = null) {
    let inputQuery = select.querySelector(
      '.custom_select__search input[type="search"]'
    );
    if (inputQuery) {
      inputQuery.value = "";
    }

    select.querySelectorAll(".custom_select__option").forEach((option) => {
      option.style.display = "";
    });
  }

  static defineKeyboardSelect() {
    console.log("define key")
    window.addEventListener("keydown", (e) => {
      if (e.target.parentNode.classList.contains("custom_select__option")) {
        const customSelect = getParentByClass(e.target, "custom_select");

        if (customSelect) {
          if (!customSelect.classList.contains("open")) return;

          if (e.key == "Escape" || e.key == " " || e.key == "Enter") {
            customSelect.querySelector(".custom_select__button input").click();
            CustomSelectAdapter.showAllSelectOptions(customSelect);
          }
        }
      }
    });
  }

  static closeSelectWhenToClickOutside()
  {
    document.addEventListener("click", function (event) {
      if (!event.target.closest(".custom_select")) {
        CustomSelectAdapter.closeAllOpenSelects();
      }
    });
  }

  static initiliazeConfigs()
  {
    document.querySelectorAll('.custom_select').forEach((select) => new CustomSelectAdapter(select));
  }

  static enable()
  {
    console.log("enable")
    CustomSelectAdapter.initiliazeConfigs();
    CustomSelectAdapter.defineKeyboardSelect();
    CustomSelectAdapter.closeSelectWhenToClickOutside();
  }
}

CustomSelectAdapter.enable();

// function selectConfig() {
//   document.querySelectorAll(".custom_select").forEach((select) => {
//     const selectedValue = select.querySelector(".custom_select__selected");
//     const selectButton = select.querySelector(".custom_select__button input");
//     const optionList = select.querySelectorAll(".custom_select__option input");

//     const inputQuery = select.querySelector(
//       `.custom_select__search input[type="search"]`
//     );

//     if (inputQuery) {
//       inputQuery.addEventListener("input", (e) => {
//         optionList.forEach((option) => {
//           if (
//             !option.dataset.label
//               .toLowerCase()
//               .includes(inputQuery.value.toLowerCase()) &&
//             !option.checked
//           ) {
//             option.parentNode.style.display = "none";
//           } else {
//             option.parentNode.style.display = "";
//           }
//         });
//       });
//     }

//     // Close all select when a select will open
//     selectButton.addEventListener("change", (e) => {
//       closeAllSelects(getParentByClass(e.target, "custom_select"));
//     });

//     // Insert focus at options when select is open
//     selectButton.addEventListener("input", () => {
//       select.classList.toggle("open");

//       if (!select.classList.contains("open")) return;

//       const input =
//         select.querySelector(".custom_select__option input:checked") ||
//         select.querySelector(".custom_select__option input");

//       input.focus();
//     });

//     // Update selectedValue when a option of select is clicked
//     optionList.forEach((optionEl) => {
//       optionEl.addEventListener("click", (event) => {
//         selectedValue.textContent = optionEl.dataset.label;

//         const isMouseOrTouch =
//           event.pointerType === "mouse" || event.pointerType === "touch";

//         isMouseOrTouch && selectButton.click();

//         showAllSelectOptions(select);
//       });

//       if (optionEl.checked) {
//         optionEl.click();
//       }
//     });
//   });

//   // Check Escape or Enter is pressed while select is open
//   window.addEventListener("keydown", (e) => {
//     if (e.target.parentNode.classList.contains("custom_select__option")) {
//       const customSelect = getParentByClass(e.target, "custom_select");

//       if (customSelect) {
//         if (!customSelect.classList.contains("open")) return;

//         if (e.key == "Escape" || e.key == " " || e.key == "Enter") {
//           customSelect.querySelector(".custom_select__button input").click();
//           showAllSelectOptions(customSelect);
//         }
//       }
//     }
//   });

//   // Close selects when click outside them
//   document.addEventListener("click", function (event) {
//     if (!event.target.closest(".custom_select")) {
//       closeAllSelects();
//     }
//   });
// }

// selectConfig();
