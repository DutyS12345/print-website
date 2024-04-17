const printContentStyleSheet = new CSSStyleSheet();
var printContentStyleSheetRules = {};
document.adoptedStyleSheets = [...document.adoptedStyleSheets, printContentStyleSheet];
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

for (let radioChoice of document.querySelectorAll('#controls input[type="radio"]')) {
    radioChoice.onclick = () => {
        regeneratePrintContent();
        updateControlLayout()
    }
}

function regeneratePrintContent() {
    loadControlsState();
    content = document.getElementById("print-content");
    content.innerHTML = "";
    resetPrintContentStyles();
    switch (controlState["checklist-type"]) {
        case "dual-flex": {
            let checklistSecondary = document.createElement("div");
            checklistSecondary.classList.add("checklist-secondary");
            printContentStyleSheetRules["checklist-secondary"] = `.checklist-secondary {
                display:flex;
                flex-flow:column nowrap;
                justify-content:space-between;
                justify-item:start;
            }`

            for (let rowN = 0; rowN < controlState["row-count"]; rowN++) {
                let checklistPrimary = document.createElement("div");
                checklistPrimary.classList.add("checklist-primary");
                printContentStyleSheetRules["checklist-primary"] = `.checklist-primary {
                    display:flex;
                    flex-flow:row nowrap;
                    justify-content:space-between;
                    justify-item:start;
                }`
                for (let colN = 0; colN < controlState["col-count"]; colN++) {
                    let checkBox = document.createElement("div");
                    checkBox.classList.add("checkbox");
                    checklistPrimary.appendChild(checkBox);
                }
                checklistSecondary.appendChild(checklistPrimary);
            }
            content.appendChild(checklistSecondary);
            break;
        }
        case "grid": {
            switch (controlState["checkbox-type"]) {
                case "fixed-rect": {
                    let checklistGrid = document.createElement("div");
                    checklistGrid.classList.add("checklist-grid");
                    printContentStyleSheetRules["checklist-grid"] = `.checklist-grid {
                        display:grid;
                        grid-template:auto ${controlState["row-count"] > 1 ? `repeat(${controlState["row-count"] - 1}, auto) ` : ''}/ auto ${controlState["col-count"] > 1 ? `repeat(${controlState["col-count"] - 1}, 1fr auto)` : ''};
                        justify-content:space-between;
                        justify-items:start;
                        row-gap:${controlState["vspacing"]}px;
                    }`
                    totalCheckBoxCount = controlState["row-count"] * controlState["col-count"];
                    for (let checkN = 0; checkN < totalCheckBoxCount; checkN++) {
                        let checkBox = document.createElement("div");
                        checkBox.classList.add("checkbox");
                        printContentStyleSheetRules["checkbox"] = `.checkbox {
                            width:${controlState["checkbox-width"]}px;
                            height:${controlState["checkbox-height"]}px;
                            border:2px solid black;
                        }`
                        if (checkN % controlState["col-count"] != 0) {
                            checklistGrid.appendChild(document.createElement("div"))
                        }
                        checklistGrid.appendChild(checkBox);
                    }
                    content.appendChild(checklistGrid);
                    break;
                }
                case "wide-rect": {
                    let checklistSecondary = document.createElement("div");
                    checklistSecondary.classList.add("checklist-secondary");
                    printContentStyleSheetRules["checklist-secondary"] = `.checklist-secondary {
                        display: grid;
                        grid-template: auto ${controlState["row-count"] > 1 ? `repeat(${controlState["row-count"] - 1}, auto) ` : ''}/ auto;
                        justify-items:stretch;
                        row-gap:${controlState["vspacing"]}px;
                    }`
                    for (let checkRow = 0; checkRow < controlState["row-count"]; checkRow++) {
                        let checklistPrimary = document.createElement("table");
                        checklistPrimary.classList.add("checklist-primary");
                        printContentStyleSheetRules["checklist-primary"] = `.checklist-primary{
                            border-collapse:collapse;
                            border:2px solid black;
                        }`
                        let checklistPrimaryInner = document.createElement("tr");
                        checklistPrimary.appendChild(checklistPrimaryInner);
                        for (let checkCol = 0; checkCol < controlState["col-count"]; checkCol++) {
                            let checkBox = document.createElement("td");
                            checkBox.classList.add("checkbox")
                            printContentStyleSheetRules["checkbox"] = `.checkbox {
                                width:${controlState["checkbox-width"]}px;
                                height:${controlState["checkbox-height"]}px;
                                border:2px solid black;
                            }`
                            checklistPrimaryInner.appendChild(checkBox);
                        }
                        checklistSecondary.appendChild(checklistPrimary);
                    }
                    content.appendChild(checklistSecondary);
                    break;
                }
                case "tall-rect": {
                    break;
                }
                default: {
                    break;
                }
            }
            break;
        }
    }
    updatePrintContentStyles();
}

var controlState = {}

const sliderControlIds = ["col-count", "row-count", "hspacing", "vspacing", "checkbox-width", "checkbox-height"];
const radioGroupIds = ["checklist-type", "checkbox-type", "direction"];
function loadControlsState() {
    controlState = {}
    let controls = document.getElementById("controls");
    for (controlId of sliderControlIds) {
        loadControlValue(controls, controlId);
    }
    for (let radioGroup of radioGroupIds) {
        controlState[radioGroup] = controls.querySelector(`input[name="${radioGroup}"]:checked`).value;
    }
    console.log(controlState)
}

function loadControlValue(controlsElement, controlId) {
    controlState[controlId] = controlsElement.querySelector("#" + controlId).value;
}

regeneratePrintContent()

function updateControlLayout() {
    let controls = document.getElementById("controls");
    switch (controlState["checklist-type"]) {
        case "grid": {
            controls.querySelector("#hspacing-group").style.display = "none";
            controls.querySelector("#vspacing-group").style.display = "block";
            break;
        }
        case "dual-flex": {
            controls.querySelector("#hspacing-group").style.display = "none";
            controls.querySelector("#vspacing-group").style.display = "none";
            break;
        }
        default: {
            controls.querySelector("#hspacing-group").style.display = "block";
            controls.querySelector("#vspacing-group").style.display = "block";
            break;
        }
    }
}
updateControlLayout()

function resetPrintContentStyles() {
    delete printContentStyleSheetRules;
    printContentStyleSheetRules = {};
}
function updatePrintContentStyles() {
    var newRules = Object.values(printContentStyleSheetRules).filter((rule) => rule !== undefined).join(' ')
    newRules = newRules.replaceAll(/\n\s*/g, "");
    console.log(newRules);
    printContentStyleSheet.replaceSync(newRules);
}

// check if array Array.isArray(json[key])
// check if object typeof json[key] === 'object'