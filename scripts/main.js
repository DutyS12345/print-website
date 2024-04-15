for (let tabber of document.getElementsByClassName("tabber")) {
    let tabberNav;
    let tabberTabs = [];
    for (let tabElement of tabber.children) {
        if (tabElement.classList.contains("tabber__nav")) {
            tabberNav = tabElement;
        } else if (tabElement.classList.contains("tabber__content")) {
            for (let tabberTab of tabElement.children) {
                if (tabberTab.classList.contains("tabber__tab")) {
                    tabberTabs.push(tabberTab);
                }
            }
        }
    }
    if (tabberNav !== undefined) {
        for (let button of tabberNav.children) {
            if (button.tagName.toUpperCase() == 'button'.toUpperCase() && button.classList.contains("tabber__nav__button")) {
                button.onclick = (event) => {
                    for (let tab of tabberTabs) {
                        tab.classList.remove("selected");
                        if (tab.dataset.tabName == button.dataset.tabName) {
                            tab.classList.add("selected");
                        }
                    }
                    for (let buttontemp of tabberNav.children) {
                        buttontemp.classList.remove("selected")
                        if (buttontemp == button) {
                            buttontemp.classList.add("selected");
                        }
                    }
                }
            }
        }
    }
}

for (let slider of document.getElementsByClassName("slider")) {
    let sliderText;
    for (let formElement of slider.parentElement.children) {
        if (formElement.id === slider.id + "-text") {
            sliderText = formElement;
            sliderText.value = slider.value;
        }
    }
    slider.oninput = () => {
        sliderText.value = slider.value;
        regeneratePrintContent();
    }
    sliderText.oninput = () => {
        slider.value = sliderText.value;
        regeneratePrintContent();
    }
}

function regeneratePrintContent() {
    loadControlsState();
    content = document.getElementById("print-content");
    content.innerHTML = "";

    switch (controlState["checklist-type"]) {
        case "dual-flex": {
            let checklistRows = document.createElement("div");
            checklistRows.style.display = "flex";
            checklistRows.style.flexFlow = "column nowrap";
            checklistRows.style.justifyContent = "space-between";
            checklistRows.style.justifyItems = "start";

            for (let rowN = 0; rowN < controlState["row-count"]; rowN++) {
                let checklistCols = document.createElement("div");
                checklistCols.style.display = "flex";
                checklistCols.style.flexFlow = "row nowrap";
                checklistCols.style.justifyContent = "space-between";
                checklistCols.style.justifyItems = "start";
                for (let colN = 0; colN < controlState["col-count"]; colN++) {
                    let checkBox = document.createElement("div");
                    checkBox.classList.add("checkbox");
                    checklistCols.appendChild(checkBox);
                }
                checklistRows.appendChild(checklistCols);
            }
            content.appendChild(checklistRows);
            break;
        }
        case "grid": {
            var checklistRows = document.createElement("div");
            checklistRows.style.display = "grid";
            checklistRows.style.gridTemplate = `auto ${controlState["row-count"] > 1 ? `repeat(${controlState["row-count"] - 1}, auto) ` : ''}/ auto ${controlState["col-count"] > 1 ? `repeat(${controlState["col-count"] - 1}, 1fr auto)` : ''}`;
            checklistRows.style.justifyContent = "space-between";
            checklistRows.style.justifyItems = "start";
            checklistRows.style.rowGap = `${controlState["vspacing"]}px`;
            totalCheckBoxCount = controlState["row-count"] * controlState["col-count"];
            for (let checkN = 0; checkN < totalCheckBoxCount; checkN++) {
                let checkBox = document.createElement("div");
                checkBox.classList.add("checkbox");
                if (checkN % controlState["col-count"] != 0) {
                    checklistRows.appendChild(document.createElement("div"))
                }

                checklistRows.appendChild(checkBox);

            }
            content.appendChild(checklistRows);
            break;
        }
    }
}


var controlState = {}

const controlIds = ["col-count", "row-count", "hspacing", "vspacing"]
function loadControlsState() {
    controlState = {}
    let controls = document.getElementById("controls");
    for (controlId of controlIds) {
        loadControlValue(controls, controlId);
    }
    controlState["checklist-type"] = controls.querySelector('input[name=checklist-type]:checked').value;
    console.log(controlState)
}

function loadControlValue(controlsElement, controlId) {
    controlState[controlId] = controlsElement.querySelector("#" + controlId).value;
}

regeneratePrintContent()

function updateControlLayout() {
    let controls = document.getElementById("controls");
    controls.querySelectorAll(".control-group").display = true;
    switch (controlState["checklist-type"]) {
        case "grid":
            {
                controls.querySelector("#hspacing-group").display = false;
                break;
            }
    }
}
updateControlLayout()