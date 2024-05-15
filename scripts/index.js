// control panel toggle
const controlToggle = document.getElementById("control-toggle");
const controlPanel = document.getElementById("controls");
controlToggle.onclick = () => {
    if (controlToggle.classList.contains("nav-toggle--active")) {
        controlToggle.classList.remove("nav-toggle--active");
        controlPanel.classList.remove("controls--active");
    } else {
        controlToggle.classList.add("nav-toggle--active");
        controlPanel.classList.add("controls--active");
    }
}
const infoToggle = document.getElementById("info-toggle");
const infoPanel = document.getElementById("info");
infoToggle.onclick = () => {
    if (infoToggle.classList.contains("nav-toggle--active")) {
        infoToggle.classList.remove("nav-toggle--active");
        infoPanel.classList.remove("info--active");
    } else {
        infoToggle.classList.add("nav-toggle--active");
        infoPanel.classList.add("info--active");
    }
}

// print content styles
const printContentStyleSheet = new CSSStyleSheet();
var printContentStyleSheetRules = {};
document.adoptedStyleSheets = [...document.adoptedStyleSheets, printContentStyleSheet];

// control panel
for (let slider of document.getElementsByClassName("slider")) {
    let sliderText;
    for (let formElement of slider.parentElement.children) {
        if (formElement.id === slider.id + "-text") {
            sliderText = formElement;
            sliderText.value = slider.value;
        }
    }
    if (slider.id == 'checkbox-width' || slider.id == 'checkbox-height' || slider.id == 'hspacing' || slider.id == 'vspacing') {
        if (slider.value == slider.getAttribute("max")) {
            sliderText.value = "MAX";
        } else {
            sliderText.value = slider.value;
        }
        slider.oninput = () => {
            if (slider.value == slider.getAttribute("max")) {
                sliderText.value = "MAX";
            } else {
                sliderText.value = slider.value;
            }
            loadControlsState();
            updateControlLayout();
            regeneratePrintContent();
        }
        sliderText.oninput = () => {
            if (isNaN(sliderText.value)) {
                slider.value = slider.getAttribute("max");
            } else {
                slider.value = sliderText.value;
            }
            loadControlsState();
            updateControlLayout();
            regeneratePrintContent();
        }
    } else {
        slider.oninput = () => {
            sliderText.value = slider.value;
            loadControlsState();
            updateControlLayout();
            regeneratePrintContent();
        }
        sliderText.oninput = () => {
            slider.value = sliderText.value;
            loadControlsState();
            updateControlLayout();
            regeneratePrintContent();
        }
    }
}

for (let radioChoice of document.querySelectorAll('#controls input[type="radio"]')) {
    radioChoice.onchange = (evt) => {
        loadControlsState();
        regeneratePrintContent();
        updateControlLayout();
    }
}

for (let jsonInput of document.getElementsByClassName("json-input")) {
    jsonInput.oninput = () => {
        loadControlsState();
        regeneratePrintContent();
    }
}

var controlState = {}

const sliderControlIds = ["col-count", "row-count", "hspacing", "vspacing", "checkbox-width", "checkbox-height"];
const radioGroupIds = ["direction", "checklist-type"];
function loadControlsState() {
    controlState = {}
    let controls = document.getElementById("controls");
    for (controlId of sliderControlIds) {
        loadSliderControlValue(controls, controlId);
    }
    if (controlState["checkbox-width"] == document.getElementById("checkbox-width").getAttribute("max")) {
        controlState["checkbox-width"] = 'max';
    }
    if (controlState["checkbox-height"] == document.getElementById("checkbox-height").getAttribute("max")) {
        controlState["checkbox-height"] = 'max';
    }
    if (controlState["vspacing"] == document.getElementById("vspacing").getAttribute("max")) {
        controlState["vspacing"] = 'max';
    }
    if (controlState["hspacing"] == document.getElementById("hspacing").getAttribute("max")) {
        controlState["hspacing"] = 'max';
    }
    for (let radioGroup of radioGroupIds) {
        controlState[radioGroup] = controls.querySelector(`input[name="${radioGroup}"]:checked`).value;
    }
    gridLabelInput = controls.querySelector("#grid-labels-json");
    try {
        controlState["grid-json"] = cleanGridLabelsJson(JSON.parse(gridLabelInput.value));
    } catch (e) {
        console.log(e);
    }
    treeLabelInput = controls.querySelector("#tree-labels-json");
    try {
        let rawParse = JSON.parse(gridLabelInput.value)
        controlState["tree-json"] = rawParse
    } catch (e) {
        console.log(e);
    }
    // console.log(controlState)
}

function loadSliderControlValue(controlsElement, controlId) {
    controlState[controlId] = controlsElement.querySelector("#" + controlId).value;
}

function cleanGridLabelsJson(json) {
    let cleaned = [];
    if (Array.isArray(json)) {
        for (let item of json) {
            if (typeof item == 'string') {
                cleaned.push(item);
            }
        }
    }
    return cleaned;
}

function cleanTreeLabelsJson(json) {
    return [];
}

function updateControlLayout() {
    let controls = document.getElementById("controls");
    // grid vs tree
    if (controlState["checklist-type"] == 'grid') {
        controls.querySelector("#grid-labels-json-group").style.display = "block";
        controls.querySelector("#tree-labels-json-group").style.display = "none";
    } else {
        controls.querySelector("#grid-labels-json-group").style.display = "none";
        controls.querySelector("#tree-labels-json-group").style.display = "block";
    }
    // grid
    if (controlState["checkbox-width"] == 'max') {
        controls.querySelector("#hspacing-group").style.display = "none";
    } else {
        controls.querySelector("#hspacing-group").style.display = "block";
    }
    if (controlState["checkbox-height"] == 'max') {
        controls.querySelector("#vspacing-group").style.display = "none";
    } else {
        controls.querySelector("#vspacing-group").style.display = "block";
    }

}
loadControlsState();
updateControlLayout();



function regeneratePrintContent() {
    content = document.getElementById("print-content");
    content.innerHTML = "";
    resetPrintContentStyles();

    if (controlState["checklist-type"] == 'grid') { // grid checklist
        if (controlState['checkbox-height'] == 'max' && controlState['checkbox-width'] == 'max') { // max size checkbox
            let checklistTable = document.createElement('table');
            checklistTable.classList.add("checklist-table");
            for (let checkRow = 0; checkRow < controlState["row-count"]; checkRow++) {
                let checklistRow = document.createElement('tr');
                for (let checkCol = 0; checkCol < controlState["col-count"]; checkCol++) {
                    let checkBox = document.createElement('td');
                    checkBox.classList.add("checkbox");
                    checklistRow.appendChild(checkBox);
                }
                checklistTable.appendChild(checklistRow);
            }
            content.appendChild(checklistTable);

            printContentStyleSheetRules["checkbox"] = `.checkbox {
            border:2px solid black;
        }`
            printContentStyleSheetRules["checklist-table"] = `.checklist-table {
            border-collapse:collapse;
        }`
            printContentStyleSheetRules["fill-print-content"] = `#print-content {
            display: flex;
        }
        .checklist-table {
            flex: 1 1 auto;
        }`

        } else if (controlState["checkbox-width"] == 'max') { // wide rect
            let checklistSecondary = document.createElement("div");
            checklistSecondary.classList.add("checklist-secondary");
            for (let checkRow = 0; checkRow < controlState["row-count"]; checkRow++) {
                let checklistPrimary = document.createElement("table");
                checklistPrimary.classList.add("checklist-primary");
                let checklistPrimaryInner = document.createElement("tr");
                checklistPrimary.appendChild(checklistPrimaryInner);
                for (let checkCol = 0; checkCol < controlState["col-count"]; checkCol++) {
                    let checkBox = document.createElement("td");
                    checkBox.classList.add("checkbox")
                    checklistPrimaryInner.appendChild(checkBox);
                }
                checklistSecondary.appendChild(checklistPrimary);
            }
            content.appendChild(checklistSecondary);

            if (controlState["vspacing"] == 'max') {
                printContentStyleSheetRules["fill-print-content"] = `#print-content {
                    display: flex;
                }
                .checklist-secondary {
                    flex: 1 1 auto;
                }`
                printContentStyleSheetRules["checklist-secondary"] = `.checklist-secondary {
                    display:flex;
                    flex-flow:column nowrap;
                    justify-content:space-between;
                }`
            } else {
                printContentStyleSheetRules["checklist-secondary"] = `.checklist-secondary {
                    display: grid;
                    grid-template: auto ${controlState["row-count"] > 1 ? `repeat(${controlState["row-count"] - 1}, auto) ` : ''}/ auto;
                    grid-auto-flow:row;
                    justify-items:stretch;
                    row-gap:${controlState["vspacing"]}px;
                }`
            }

            printContentStyleSheetRules["checklist-primary"] = `.checklist-primary {
                border-collapse:collapse;
            }`
            printContentStyleSheetRules["checkbox"] = `.checkbox {
                height:${controlState["checkbox-height"]}px;
                border:2px solid black;
            }`

        } else if (controlState['checkbox-height'] == 'max') { // tall rect
            let labels = controlState["grid-json"];
            let checklistSecondary = document.createElement("div");
            checklistSecondary.classList.add("checklist-secondary");
            for (let checkCol = 0; checkCol < controlState["col-count"]; checkCol++) {
                let checklistPrimary = document.createElement("table");
                checklistPrimary.classList.add("checklist-primary");
                for (let checkRow = 0; checkRow < controlState["row-count"]; checkRow++) {
                    // let checklistPrimaryInner = document.createElement("tr");
                    // checklistPrimary.appendChild(checklistPrimaryInner);
                    let checkBoxWrapper = document.createElement("tr");
                    let checkBox = document.createElement("td");
                    checkBox.classList.add("checkbox");
                    checkBoxWrapper.appendChild(checkBox)
                    if (labels && labels.length > 0) {
                        let checkN = (controlState["direction"]) == 'td' ? checkRow + checkCol * controlState["row-count"] : checkRow * controlState["col-count"] + checkCol
                        let checkBoxLabel = document.createElement("td");
                        checkBoxLabel.classList.add("checkbox-label");
                        checkBoxLabel.textContent = labels[checkN % labels.length];
                        checkBoxWrapper.appendChild(checkBoxLabel);
                        checkBoxWrapper.classList.add("checkbox-wrapper");
                    }
                    checklistPrimary.appendChild(checkBoxWrapper);
                }
                if (checkCol != 0 && controlState["hspacing"] == 'max' && (!labels || labels.length <= 1)) {
                    checklistSecondary.appendChild(document.createElement("div"));
                }
                checklistSecondary.appendChild(checklistPrimary);
            }
            content.appendChild(checklistSecondary);

            printContentStyleSheetRules["fill-print-content"] = `#print-content {
                display:flex;
            }
            .checklist-secondary {
                flex:${controlState["hspacing"] != 'max' ? '0 0 auto' : '1 1 auto'};
            }`
            if (controlState["hspacing"] == 'max') {
                printContentStyleSheetRules["checklist-secondary"] = `.checklist-secondary {
                    display:grid;
                    grid-template: auto / ${labels && labels.length > 1 ? `repeat(${controlState["col-count"]}, 1fr)` : `auto${controlState["col-count"] > 1 ? ` repeat(${controlState["col-count"] - 1}, 1fr auto)` : ''}`};
                    grid-auto-flow: row;
                    align-items:stretch;
                }`
            } else {
                printContentStyleSheetRules["checklist-secondary"] = `.checklist-secondary {
                    display:grid;
                    grid-template:auto / auto ${controlState["col-count"] > 1 ? `repeat(${controlState["col-count"] - 1}, auto) ` : ''};
                    grid-auto-flow:row;
                    justify-items:stretch;
                    column-gap:${controlState["hspacing"]}px;
                }`
            }
            printContentStyleSheetRules["checklist-primary"] = `.checklist-primary {
                border-collapse: collapse;
            }`
            printContentStyleSheetRules["checkbox"] = `.checkbox {
                width:${controlState["checkbox-width"]}px;
                border:2px solid black;
            }`
            printContentStyleSheetRules["checkbox-label"] = `.checkbox-label {
                padding-left:5px;
                padding-right:5px;
            }`

        } else { // fixed size rect
            let labels = controlState["grid-json"];
            printContentStyleSheetRules["checkbox"] = `.checkbox {
            width:${controlState["checkbox-width"]}px;
            height:${controlState["checkbox-height"]}px;
            border:2px solid black;
            flex:0 0 auto;
        }`
            printContentStyleSheetRules["checkbox-wrapper"] = `.checkbox-wrapper {
            display:flex;
            flex-flow:row nowrap;
            align-items:center;
        }`
            printContentStyleSheetRules["checkbox-label"] = `.checkbox-label {
            padding-left:5px;
            padding-right:5px;
        }`
            if (controlState["vspacing"] == 'max' && (!labels || labels.length <= 1)) { // fill vertical with no labels (w/ and w/o fill horizontal)
                printContentStyleSheetRules["fill-print-content"] = `#print-content {
                display: flex;
            }
            .checklist-secondary {
                flex: ${controlState["hspacing"] == 'max' ? '1 1 auto' : '0 0 auto'};
            }`

                if (controlState["hspacing"] == 'max') {
                    printContentStyleSheetRules["checklist-secondary"] = `.checklist-secondary {
                    display: flex;
                    flex-flow: row nowrap;
                    justify-content: space-between;
                }`
                } else {
                    printContentStyleSheetRules["checklist-secondary"] = `.checklist-secondary {
                    display: grid;
                    grid-template: auto / repeat(${controlState["col-count"]}, auto);
                    column-gap:${controlState["hspacing"]}px;
                }`
                }
                printContentStyleSheetRules["checklist-primary"] = `.checklist-primary {
                display: flex;
                flex-flow: column nowrap;
                justify-content: space-between;
                justify-items: start;
            } `
                let checklistSecondary = document.createElement("div");
                checklistSecondary.classList.add("checklist-secondary");
                for (let checkCol = 0; checkCol < controlState["col-count"]; checkCol++) {
                    let checklistPrimary = document.createElement("div");
                    checklistPrimary.classList.add("checklist-primary");
                    for (let checkRow = 0; checkRow < controlState["row-count"]; checkRow++) {
                        let checkBoxWrapper = document.createElement("div");
                        if (labels && labels.length > 0) {
                            let checkN = (controlState["direction"]) == 'td' ? checkRow + checkCol * controlState["row-count"] : checkRow * controlState["col-count"] + checkCol
                            let checkBox = document.createElement("div");
                            checkBox.classList.add("checkbox");
                            checkBoxWrapper.appendChild(checkBox)
                            let checkBoxLabel = document.createElement("span");
                            checkBoxLabel.classList.add("checkbox-label");
                            checkBoxLabel.textContent = labels[checkN % labels.length];
                            checkBoxWrapper.appendChild(checkBoxLabel);
                            checkBoxWrapper.classList.add("checkbox-wrapper");
                            checklistPrimary.appendChild(checkBoxWrapper);
                        } else {
                            checkBoxWrapper.classList.add("checkbox")
                            checklistPrimary.appendChild(checkBoxWrapper);
                        }
                    }
                    checklistSecondary.appendChild(checklistPrimary);
                }
                content.appendChild(checklistSecondary);
            } else { // labels or fixed vertical (w/ and w/o fill horizontal)
                printContentStyleSheetRules["fill-print-content"] = `#print-content {
                display: flex;
                align-items: ${controlState["vspacing"] == 'max' ? 'stretch' : 'start'};
            }
            .checklist-grid {
                flex: ${controlState["hspacing"] == 'max' ? '1 1 auto' : '0 0 auto'};
            }`
                printContentStyleSheetRules["checklist-grid"] = `.checklist-grid {
                display:grid;
                grid-template: auto ${controlState["row-count"] > 0 ? `repeat(${controlState["row-count"] - 1}, ${controlState["vspacing"] == 'max' ? '1fr ' : ''}auto) ` : ''}/ repeat(${controlState["col-count"]}, auto);
                justify-content:space-between;
                justify-items:start;
                align-items:start;
                row-gap:${controlState["vspacing"]}px;
                column-gap:${controlState["hspacing"]}px;
            }`

                let checklistGrid = document.createElement("div");
                checklistGrid.classList.add("checklist-grid");
                totalCheckBoxCount = controlState["row-count"] * controlState["col-count"];

                for (let checkRow = 0; checkRow < controlState["row-count"]; checkRow++) {
                    if (checkRow != 0 && controlState["vspacing"] == 'max') {
                        for (let spacerN = 0; spacerN < controlState["col-count"]; spacerN++) {
                            checklistGrid.appendChild(document.createElement("div"));
                        }
                    }
                    for (let checkCol = 0; checkCol < controlState["col-count"]; checkCol++) {
                        let checkN = controlState["direction"] == 'td' ? checkRow + checkCol * controlState["row-count"] : checkCol + checkRow * controlState["col-count"];
                        let checkBoxWrapper = document.createElement("div");
                        if (labels && labels.length > 0) {
                            let checkBox = document.createElement("div");
                            checkBox.classList.add("checkbox");
                            checkBoxWrapper.appendChild(checkBox);
                            let checkBoxLabel = document.createElement("span");
                            checkBoxLabel.classList.add("checkbox-label");
                            checkBoxLabel.textContent = labels[checkN % labels.length];
                            checkBoxWrapper.appendChild(checkBoxLabel);
                            checkBoxWrapper.classList.add("checkbox-wrapper");
                            checklistGrid.appendChild(checkBoxWrapper);
                        }
                        else {
                            checkBoxWrapper.classList.add("checkbox");
                            checklistGrid.appendChild(checkBoxWrapper);
                        }
                    }
                }
                content.appendChild(checklistGrid);
            }
        }
    }
    updatePrintContentStyles();
}

regeneratePrintContent()

function resetPrintContentStyles() {
    delete printContentStyleSheetRules;
    printContentStyleSheetRules = {};
}
function updatePrintContentStyles() {
    var newRules = Object.values(printContentStyleSheetRules).filter((rule) => rule !== undefined).join(' ')
    newRules = newRules.replaceAll(/\n\s*/g, "");
    // console.log(newRules);
    printContentStyleSheet.replaceSync(newRules);
}

// check if array Array.isArray(json[key])
// check if object typeof json[key] === 'object'