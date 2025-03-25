// control panel toggle
const controlToggle = document.getElementById("control-toggle");
const controlPanel = document.getElementById("controls");
if (controlToggle === null) {
    console.error("controlToggle not found");
}
if (controlPanel === null) {
    console.error("controlPanel not found");
}
if (controlToggle !== null && controlPanel !== null) {
    controlToggle.onclick = () => {
        if (controlToggle.classList.contains("nav-toggle--active")) {
            controlToggle.classList.remove("nav-toggle--active");
            controlPanel.classList.remove("controls--active");
        } else {
            controlToggle.classList.add("nav-toggle--active");
            controlPanel.classList.add("controls--active");
        }
    }
}

// info panel toggle
const infoToggle = document.getElementById("info-toggle");
const infoPanel = document.getElementById("info");
if (infoToggle === null) {
    console.error("infoToggle not found");
}
if (infoPanel === null) {
    console.error("infoPanel not found");
}
if (infoToggle !== null && infoPanel !== null) {
    infoToggle.onclick = () => {
        if (infoToggle.classList.contains("nav-toggle--active")) {
            infoToggle.classList.remove("nav-toggle--active");
            infoPanel.classList.remove("info--active");
        } else {
            infoToggle.classList.add("nav-toggle--active");
            infoPanel.classList.add("info--active");
        }
    }
}

type NumericSliderControlId = "col-count" | "row-count";
type MaxNumericSliderControlId = "hspacing" | "vspacing" | "checkbox-width" | "checkbox-height";
type SliderControlId = NumericSliderControlId | MaxNumericSliderControlId;
const numericSliderControlIds: NumericSliderControlId[] = ["col-count", "row-count"];
const maxNumericSliderControlIds: MaxNumericSliderControlId[] = ["hspacing", "vspacing", "checkbox-width", "checkbox-height"];
type RadioControlId = "direction" | "checklist-type";
const radioControlIds: RadioControlId[] = ["direction", "checklist-type"];
type SliderControlValue = number | 'max';
type ControlState = {
    [key in MaxNumericSliderControlId]: SliderControlValue;
} & {
    [key in NumericSliderControlId]: number;
} & {
    [key in RadioControlId]: string;
} & {
    'grid-json-labels'?: string[];
    'tree-json-labels'?: LabelTree;
}

// control panel init
for (let sliderElement of document.querySelectorAll<HTMLInputElement>(".slider")) {
    let sliderGroup = sliderElement.closest('.slider-group');
    if (sliderGroup !== null) {
        let slider = sliderElement as HTMLInputElement;
        let sliderTextElement = sliderGroup.querySelector<HTMLInputElement>(`#${slider.id}-text`);
        if (sliderTextElement === null) {
            console.error(`sliderText for ${slider.id} not found`);
        }
        else {
            let sliderText = sliderTextElement;
            sliderText.value = slider.value;

            if ((maxNumericSliderControlIds as string[]).includes(slider.id)) {
                if (slider.value === slider.getAttribute("max")) {
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
                    if (isNaN(Number(sliderText.value))) {
                        slider.value = slider.getAttribute("max") || slider.value;
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
    }
}

// print content styles
const printContentStyleSheet = new CSSStyleSheet();
var printContentStyleSheetRules: { [key: string]: string } = {};
document.adoptedStyleSheets = [...document.adoptedStyleSheets, printContentStyleSheet];


for (let radioChoice of document.querySelectorAll('#controls input[type="radio"]')) {
    (radioChoice as HTMLElement).onchange = (evt) => {
        loadControlsState();
        regeneratePrintContent();
        updateControlLayout();
    }
}

for (let jsonInput of document.getElementsByClassName("json-input")) {
    (jsonInput as HTMLElement).oninput = () => {
        loadControlsState();
        regeneratePrintContent();
    }
}

type LabelTree = LabelTreeList | LabelTreeHeaderList;
type LabelTreeHeaderList = {
    header: string;
    children: LabelTree;
}
type LabelTreeList = (string | LabelTree)[];

var controlState: ControlState = {} as ControlState;

function loadControlsState() {
    controlState = {} as ControlState;
    let controls = document.getElementById("controls");
    if (controls === null) {
        throw new Error("controls element not found");
    }
    // slider controls
    for (let controlId of [...numericSliderControlIds, ...maxNumericSliderControlIds]) {
        controlState[controlId] = loadSliderControlValue(controls, controlId);
    }
    // iterate over maxNumericSliderControlIds to set controlState to max if the slider is at max
    for (let controlId of maxNumericSliderControlIds) {
        let slider = document.getElementById(controlId);
        if (slider !== null) {
            let maxValue = slider.getAttribute("max");
            if (maxValue !== null && controlState[controlId] == Number(maxValue)) {
                controlState[controlId] = 'max';
            }
        }
    }

    // radio controls
    for (let radioControlId of radioControlIds) {
        let radioControl = controls.querySelector<HTMLInputElement>(`input[name="${radioControlId}"]:checked`);
        if (radioControl === null) {
            throw new Error(`radioControl ${radioControlId} not found`);
        }
        controlState[radioControlId] = radioControl.value;
    }

    // textarea controls
    let gridLabelInput = controls.querySelector<HTMLTextAreaElement>(".grid-input.labels-json-group .json-input");
    if (gridLabelInput === null) {
        throw new Error("gridLabelInput not found");
    }
    if (gridLabelInput.value === '') {
        controlState["grid-json-labels"] = [];
    } else {
        try {
            controlState["grid-json-labels"] = cleanGridLabelsJson(JSON.parse(gridLabelInput.value));
        } catch (e) {
            console.log(e);
        }
    }
    let treeLabelInput = controls.querySelector<HTMLTextAreaElement>(".tree-input.labels-json-group .json-input");
    if (treeLabelInput === null) {
        throw new Error("treeLabelInput not found");
    }
    if (treeLabelInput.value === '') {
        controlState["tree-json-labels"] = [];
    } else {
        try {
            controlState["tree-json-labels"] = cleanTreeLabelsJson(JSON.parse(treeLabelInput.value));;
        } catch (e) {
            console.log(e);
        }
    }
    // console.log(controlState)
}

function loadSliderControlValue(controlsElement: HTMLElement, controlId: SliderControlId): number {
    if (controlsElement === null) {
        throw new Error("controls element not found");
    }
    if (controlId === null) {
        throw new Error("controlId is null");
    }
    const element = controlsElement.querySelector<HTMLInputElement>("#" + controlId);
    if (element === null) {
        throw new Error(`Control element #${controlId} not found`);
    }
    return Number(element.value);
}

function cleanGridLabelsJson(json: any) {
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

function cleanTreeLabelsJson(json: any): LabelTree {
    let cleaned: LabelTree
    if (Array.isArray(json)) {
        cleaned = [] as LabelTreeList;
        for (let item of json) {
            if (typeof item === 'string') {
                cleaned.push(item);
            } else {
                cleaned.push(cleanTreeLabelsJson(item));
            }
        }
    } else if (typeof json === 'object') {
        cleaned = {} as LabelTreeHeaderList;
        if (json.header && typeof json.header === 'string') {
            cleaned["header"] = json.header;
        }
        if (json.children) {
            cleaned.children = cleanTreeLabelsJson(json.children);
        }
    } else {
        cleaned = [];
    }
    return cleaned;
}



function updateControlLayout() {
    let controls = document.getElementById("controls");
    if (controls === null) {
        throw new Error("controls element not found");
    }
    // grid vs tree
    if (controlState["checklist-type"] == 'grid') {
        controls.querySelectorAll<HTMLElement>(".grid-input").forEach(input => input.style.display = "block");
        controls.querySelectorAll<HTMLElement>(".tree-input").forEach(input => input.style.display = "none");
    } else {
        controls.querySelectorAll<HTMLElement>(".grid-input").forEach(input => input.style.display = "none");
        controls.querySelectorAll<HTMLElement>(".tree-input").forEach(input => input.style.display = "block");
    }
    // grid
    let hspacingGroup = controls.querySelector<HTMLElement>("#hspacing-group");
    if (hspacingGroup !== null) {
        if (controlState["checkbox-width"] == 'max') {
            hspacingGroup.style.display = "none";
        } else {
            hspacingGroup.style.display = "block";
        }
    } else {
        console.error("hspacing-group not found");
    }
    let vspacingGroup = controls.querySelector<HTMLElement>("#vspacing-group");
    if (vspacingGroup !== null) {

        if (controlState["checkbox-height"] == 'max') {
            vspacingGroup.style.display = "none";
        } else {
            vspacingGroup.style.display = "block";
        }
    } else {
        console.error("vspacing-group not found");
    }

}
loadControlsState();
updateControlLayout();

function regeneratePrintContent() {
    const content: HTMLElement | null = document.getElementById("print-content");
    if (content === null) {
        throw new Error("print-content element not found");
    }
    content.innerHTML = "";
    resetPrintContentStyles();

    if (controlState["checklist-type"] === 'grid') { // grid checklist
        createGridContent(content);
    } else if (controlState["checklist-type"] === 'tree') {
        createTreeContent(content);
    }
    updatePrintContentStyles();
}

regeneratePrintContent();

function createGridContent(content: HTMLElement) {
    if (controlState["checkbox-height"] == 'max' && controlState["checkbox-width"] == 'max') { // max size checkbox
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
        }`;
        printContentStyleSheetRules["checklist-table"] = `.checklist-table {
            border-collapse:collapse;
        }`;
        printContentStyleSheetRules["fill-print-content"] = `#print-content {
            display: flex;
        }
        .checklist-table {
            flex: 1 1 auto;
        }`;

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
                checkBox.classList.add("checkbox");
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
                }`;
            printContentStyleSheetRules["checklist-secondary"] = `.checklist-secondary {
                    display:flex;
                    flex-flow:column nowrap;
                    justify-content:space-between;
                }`;
        } else {
            printContentStyleSheetRules["checklist-secondary"] = `.checklist-secondary {
                    display: grid;
                    grid-template: auto ${controlState["row-count"] > 1 ? `repeat(${controlState["row-count"] - 1}, auto) ` : ''}/ auto;
                    grid-auto-flow:row;
                    justify-items:stretch;
                    row-gap:${controlState["vspacing"]}px;
                }`;
        }

        printContentStyleSheetRules["checklist-primary"] = `.checklist-primary {
                border-collapse:collapse;
            }`;
        printContentStyleSheetRules["checkbox"] = `.checkbox {
                height:${controlState["checkbox-height"]}px;
                border:2px solid black;
            }`;

    } else if (controlState["checkbox-height"] == 'max') { // tall rect
        let labels = controlState["grid-json-labels"];
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
                checkBoxWrapper.appendChild(checkBox);
                if (labels && labels.length > 0) {
                    let checkN = (controlState["direction"]) == 'td' ? checkRow + checkCol * controlState["row-count"] : checkRow * controlState["col-count"] + checkCol;
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
            }`;
        if (controlState["hspacing"] == 'max') {
            printContentStyleSheetRules["checklist-secondary"] = `.checklist-secondary {
                    display:grid;
                    grid-template: auto / ${labels && labels.length > 1 ? `repeat(${controlState["col-count"]}, 1fr)` : `auto${controlState["col-count"] > 1 ? ` repeat(${controlState["col-count"] - 1}, 1fr auto)` : ''}`};
                    grid-auto-flow: row;
                    align-items:stretch;
                }`;
        } else {
            printContentStyleSheetRules["checklist-secondary"] = `.checklist-secondary {
                    display:grid;
                    grid-template:auto / auto ${controlState["col-count"] > 1 ? `repeat(${controlState["col-count"] - 1}, auto) ` : ''};
                    grid-auto-flow:row;
                    justify-items:stretch;
                    column-gap:${controlState["hspacing"]}px;
                }`;
        }
        printContentStyleSheetRules["checklist-primary"] = `.checklist-primary {
                border-collapse: collapse;
            }`;
        printContentStyleSheetRules["checkbox"] = `.checkbox {
                width:${controlState["checkbox-width"]}px;
                border:2px solid black;
            }`;
        printContentStyleSheetRules["checkbox-label"] = `.checkbox-label {
                padding-left:5px;
                padding-right:5px;
            }`;

    } else { // fixed size rect
        let labels = controlState["grid-json-labels"];
        printContentStyleSheetRules["checkbox"] = `.checkbox {
            width:${controlState["checkbox-width"]}px;
            height:${controlState["checkbox-height"]}px;
            border:2px solid black;
            flex:0 0 auto;
        }`;
        printContentStyleSheetRules["checkbox-wrapper"] = `.checkbox-wrapper {
            display:flex;
            flex-flow:row nowrap;
            align-items:center;
        }`;
        printContentStyleSheetRules["checkbox-label"] = `.checkbox-label {
            padding-left:5px;
            padding-right:5px;
        }`;
        if (controlState["vspacing"] == 'max' && (!labels || labels.length <= 1)) { // fill vertical with no labels (w/ and w/o fill horizontal)
            printContentStyleSheetRules["fill-print-content"] = `#print-content {
                display: flex;
            }
            .checklist-secondary {
                flex: ${controlState["hspacing"] == 'max' ? '1 1 auto' : '0 0 auto'};
            }`;

            if (controlState["hspacing"] == 'max') {
                printContentStyleSheetRules["checklist-secondary"] = `.checklist-secondary {
                    display: flex;
                    flex-flow: row nowrap;
                    justify-content: space-between;
                }`;
            } else {
                printContentStyleSheetRules["checklist-secondary"] = `.checklist-secondary {
                    display: grid;
                    grid-template: auto / repeat(${controlState["col-count"]}, auto);
                    column-gap:${controlState["hspacing"]}px;
                }`;
            }
            printContentStyleSheetRules["checklist-primary"] = `.checklist-primary {
                display: flex;
                flex-flow: column nowrap;
                justify-content: space-between;
                justify-items: start;
            } `;
            let checklistSecondary = document.createElement("div");
            checklistSecondary.classList.add("checklist-secondary");
            for (let checkCol = 0; checkCol < controlState["col-count"]; checkCol++) {
                let checklistPrimary = document.createElement("div");
                checklistPrimary.classList.add("checklist-primary");
                for (let checkRow = 0; checkRow < controlState["row-count"]; checkRow++) {
                    let checkBoxWrapper = document.createElement("div");
                    if (labels && labels.length > 0) {
                        let checkN = (controlState["direction"]) == 'td' ? checkRow + checkCol * controlState["row-count"] : checkRow * controlState["col-count"] + checkCol;
                        let checkBox = document.createElement("div");
                        checkBox.classList.add("checkbox");
                        checkBoxWrapper.appendChild(checkBox);
                        let checkBoxLabel = document.createElement("span");
                        checkBoxLabel.classList.add("checkbox-label");
                        checkBoxLabel.textContent = labels[checkN % labels.length];
                        checkBoxWrapper.appendChild(checkBoxLabel);
                        checkBoxWrapper.classList.add("checkbox-wrapper");
                        checklistPrimary.appendChild(checkBoxWrapper);
                    } else {
                        checkBoxWrapper.classList.add("checkbox");
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
            }`;
            printContentStyleSheetRules["checklist-grid"] = `.checklist-grid {
                display:grid;
                grid-template: auto ${controlState["row-count"] > 0 ? `repeat(${controlState["row-count"] - 1}, ${controlState["vspacing"] == 'max' ? '1fr ' : ''}auto) ` : ''}/ repeat(${controlState["col-count"]}, auto);
                justify-content:space-between;
                justify-items:start;
                align-items:start;
                row-gap:${controlState["vspacing"]}px;
                column-gap:${controlState["hspacing"]}px;
            }`;

            let checklistGrid = document.createElement("div");
            checklistGrid.classList.add("checklist-grid");
            // let totalCheckBoxCount = controlState["row-count"] * controlState["col-count"];

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

function createTreeContent(content: HTMLElement) {
    let labels = controlState["tree-json-labels"] || [];

    const tileContainer = document.createElement("div");
    tileContainer.classList.add("tile-container");

    printContentStyleSheetRules["tile-container"] = `.tile-container {
        display: grid;
        grid-template-columns: repeat(${controlState["col-count"]}, 1fr);
        grid-template-rows: repeat(${controlState["row-count"]}, 1fr);
    }`;
    printContentStyleSheetRules["checkbox-style"] = `.tile li {
        list-style-type: square;
    }`;
    printContentStyleSheetRules["nested-checkbox"] = `.tile li.nested-checkbox {
        list-style-type: none;
    }`;

    let domTree = recurseLabelTree(document.createElement("div"), labels);
    // add grid template columns and rows
    tileContainer.style.gridTemplateColumns = `repeat(${controlState["col-count"]}, 1fr)`;
    tileContainer.style.gridTemplateRows = `repeat(${controlState["row-count"]}, 1fr)`;
    for (let tileRow = 0; tileRow < controlState["row-count"]; tileRow++) {
        for (let tileCol = 0; tileCol < controlState["col-count"]; tileCol++) {
            let tile = domTree.cloneNode(true) as HTMLElement;
            tile.classList.add("tile");
            tileContainer.appendChild(tile);
        }
    }
    content.appendChild(tileContainer);
}

function resetPrintContentStyles() {
    printContentStyleSheetRules = {};
}

function recurseLabelTree(tile: HTMLElement, tree: LabelTree): HTMLElement {
    if (Array.isArray(tree) && tree.length === 0) {
        let domCheckboxTree = document.createElement("ul");
        domCheckboxTree.appendChild(document.createElement("li"));
        return domCheckboxTree;
    } else {
        return recurseLabelTreeHelper(tile, tree, 0);
    }
}

function recurseLabelTreeHelper(parent: HTMLElement, tree: LabelTree, depth: number): HTMLElement {
    let domCheckboxTree = document.createElement("ul");
    if (Array.isArray(tree)) {
        // [string | LabelTree]
        for (let item of tree) {
            if (item) {
                if (typeof item === 'string') {
                    let itemElement = document.createElement("li");
                    itemElement.textContent = item;
                    domCheckboxTree.appendChild(itemElement);
                } else if (typeof item === 'object') {
                    let itemElement = document.createElement("li");
                    itemElement.classList.add("nested-checkbox");
                    itemElement.appendChild(recurseLabelTreeHelper(itemElement, item, depth + 1));
                    domCheckboxTree.appendChild(itemElement);
                }
            }
        }
    } else if (typeof tree === 'object') {
        //{ header: string, children: [] } 
        let header = tree["header"];
        if (header && typeof header === 'string') {
            let headerDom = document.createElement("h" + depth);
            headerDom.textContent = header;
            domCheckboxTree.appendChild(headerDom);
        }
        let children = tree["children"];
        if (Array.isArray(children)) {
            recurseLabelTreeHelper(parent, children, depth);
        }
    }
    return domCheckboxTree;
}

function updatePrintContentStyles() {
    var newRules = Object.keys(printContentStyleSheetRules).map((rule) => printContentStyleSheetRules[rule]).filter((rule) => rule !== undefined).join(' ')
    newRules = newRules.replace(/\n\s*/g, ""); // basic minification
    // console.log(newRules);
    printContentStyleSheet.replaceSync(newRules);
}


// check if array Array.isArray(json[key])
// check if object typeof json[key] === 'object'