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
    this.selectId = select.id;
    this._init();
  }

  _getInputPreview() {
    return document.querySelector(`#${this.selectId} .custom_select__preview`);
  }

  _getInputQuery() {
    return document.querySelector(
      `#${this.selectId} .custom_select__search input[type="search"]`
    );
  }

  _getOptionInputList() {
    return document.querySelectorAll(
      `#${this.selectId} .custom_select__option input`
    );
  }
  _getSelectedValue() {
    return document.querySelector(`#${this.selectId} .custom_select__selected`);
  }

  _getSelectButtonInput() {
    return document.querySelector(
      `#${this.selectId} .custom_select__button input`
    );
  }

  _init() {
    this._selectButtonActions();
    this.filterByInput();
    this._getOptionInputList().forEach((option) =>
      CustomSelectAdapter.defineOption(this.select, option)
    );
  }

  _selectButtonActions() {
    let selectButtonInput = this._getSelectButtonInput();
    selectButtonInput.addEventListener("change", (e) => {
      let inputQuery = this._getInputQuery();

      if (selectButtonInput.checked) {
        let currentSelected = this._getCurrentOptionSelected();
        if (currentSelected) {
          currentSelected.scrollIntoView();
        } else if (inputQuery) {
          inputQuery.focus();
          inputQuery.scrollIntoView();
        }
      }

      CustomSelectAdapter.closeAllOpenSelects(
        getParentByClass(e.target, "custom_select")
      );
    });

    selectButtonInput.addEventListener("input", () => {
      this.select.classList.toggle("open");

      if (!this.select.classList.contains("open")) return;

      const input =
        this._getCurrentOptionSelected() ||
        this.select.querySelector(".custom_select__option input");

      if (input) input.focus();
    });
  }

  _getCurrentOptionSelected() {
    return document.querySelector(".custom_select__option input:checked");
  }

  static defineOption(select = null, optionEl = null) {
    if (!optionEl) throw Error("Option element not found.");
    if (!select && !select.classList.contains("custom_select"))
      throw Error("Select element not found");

    let selectedValue = select.querySelector(".custom_select__selected");
    let selectButtonInput = select.querySelector(
      ".custom_select__button input"
    );

    optionEl.addEventListener("click", (event) => {
      selectedValue.textContent = optionEl.dataset.label;

      const isMouseOrTouch =
        event.pointerType === "mouse" || event.pointerType === "touch";

      isMouseOrTouch && selectButtonInput.click();

      CustomSelectAdapter.showAllSelectOptions(select);
    });

    if (optionEl.checked) {
      optionEl.click();
    }
  }

  _updatePreview(value) {
    let inputPreview = this._getInputPreview();
    if (inputPreview) {
      inputPreview.querySelector("span").textContent = value;
    }
  }

  filterByInput() {
    let inputQuery = this._getInputQuery();
    if (!inputQuery) return;
    inputQuery.addEventListener("input", (e) => {
      this._updatePreview(e.target.value);
      let optionInputList = this._getOptionInputList();

      optionInputList.forEach((option) => {
        if (
          !option.dataset.label
            .toLowerCase()
            .includes(inputQuery.value.toLowerCase()) &&
          !option.checked
        ) {
          option.parentNode.style.display = "none"; // hide element
        } else {
          option.parentNode.style.display = ""; // back to default
        }
      });
    });
  }

  static close(select = null) {
    if (select && select.classList.contains("custom_select")) {
      if (select.classList.contains("open")) {
        select.classList.toggle("open");
      }
      select.querySelector(".custom_select__button input").checked = false;
      CustomSelectAdapter.showAllSelectOptions(select);
    }
  }

  static closeAllOpenSelects(parent = null) {
    const openSelects = document.querySelectorAll(".custom_select");

    for (let select of openSelects) {
      if (select != parent) {
        CustomSelectAdapter.close(select);
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

  static addOption(select = null, { name, value, label, labelView = null }) {
    if (select && select.classList.contains("custom_select")) {
      const optionEl = document.createElement("li");
      optionEl.classList.add("custom_select__option");
      optionEl.innerHTML = `
        <input
            type="radio"
            name="${name}"
            value="${value}"
            data-label="${label}"
        />
        <span>${labelView || label}</span>
      `;

      CustomSelectAdapter.defineOption(
        select,
        optionEl.querySelector(`input[type="radio"]`)
      );
      select.querySelector(".custom_select__option_list").appendChild(optionEl);

      return optionEl;
    }
  }

  static removeOptionByValue(select = null, value) {
    if (select && select.classList.contains("custom_select")) {
      select
        .querySelectorAll(
          `.custom_select__option input[type="radio"][value="${value}"]`
        )
        .forEach((e) => e.parentNode.remove());
    }
  }

  static removeAllOptions(select = null) {
    if (select && select.classList.contains("custom_select")) {
      select
        .querySelectorAll(".custom_select__option")
        .forEach((e) => e.remove());
    }
  }

  static copyAndRemoveAllOptions(select = null)
  {
    const nodeList = [];
    if (select && select.classList.contains("custom_select")) {
      select
        .querySelectorAll(".custom_select__option")
        .forEach((e) => {
          nodeList.push(e.cloneNode(true));
          e.remove();
        });
    }
    return nodeList;
  }

  static defineKeyboardSelect() {
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

  static closeSelectWhenToClickOutside() {
    document.addEventListener("click", function (event) {
      if (!event.target.closest(".custom_select")) {
        CustomSelectAdapter.closeAllOpenSelects();
      }
    });
  }

  static initiliazeConfigs() {
    document
      .querySelectorAll(".custom_select")
      .forEach((select) => new CustomSelectAdapter(select));
  }

  static enable() {
    CustomSelectAdapter.initiliazeConfigs();
    CustomSelectAdapter.defineKeyboardSelect();
    CustomSelectAdapter.closeSelectWhenToClickOutside();
  }
}

CustomSelectAdapter.enable();

// CustomSelectAdapter.removeOptionByValue(
//   document.querySelector("#perfilSelect2"),
//   "organizador"
// );

CustomSelectAdapter.addOption(document.querySelector("#perfilSelect2"), {
  name: "perfil2",
  label: "Caramujo",
  value: "caramujo",
});



const nodeList = CustomSelectAdapter.copyAndRemoveAllOptions(document.querySelector("#perfilSelect2"));

// nodeList.forEach((n) => {
//   document.querySelector('#perfilSelect2 .custom_select__option_list').appendChild(n);
// })

function newPerfil(e) {
  const select = getParentByClass(e.target, "custom_select");
  let content = e.target.querySelector("span").textContent;

  const optionEl = CustomSelectAdapter.addOption(select, {
    name: select.querySelector('.custom_select__option input[type="radio"]')
      .name,
    value: content.toLowerCase(),
    label: content,
  });

  optionEl.querySelector('input[type="radio"]').click();

  CustomSelectAdapter.close(select);
}
