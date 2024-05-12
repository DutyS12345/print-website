
// tabber.js
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
                    let wasSelected = button.classList.contains("tab--active");
                    for (let tab of tabberTabs) {
                        tab.classList.remove("tab--active");
                        if (tab.dataset.tabName == button.dataset.tabName && !wasSelected) {
                            tab.classList.add("tab--active");
                        }
                    }
                    for (let buttontemp of tabberNav.children) {
                        buttontemp.classList.remove("tab--active")
                        if (buttontemp == button && !wasSelected) {
                            buttontemp.classList.add("tab--active");
                        }
                    }
                }
            }
        }
    }
}