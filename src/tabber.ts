
// tabber.js
for (let tabber of document.getElementsByClassName("tabber")) {
    let tabberNav: HTMLElement | undefined;
    let tabberTabs: HTMLElement[] = [];
    for (let tabElement of tabber.children) {
        if (tabElement.classList.contains("tabber__nav")) {
            tabberNav = tabElement as HTMLElement;
        } else if (tabElement.classList.contains("tabber__content")) {
            for (let tabberTab of tabElement.children) {
                if (tabberTab.classList.contains("tabber__tab")) {
                    tabberTabs.push(tabberTab as HTMLElement);
                }
            }
        }
    }
    if (tabberNav !== undefined) {
        for (let buttonElement of tabberNav.children) {
            let button = buttonElement as HTMLElement;
            if (button.tagName.toUpperCase() == 'BUTTON'.toUpperCase() && button.classList.contains("tabber__nav__button")) {
                button.onclick = (event) => {
                    let wasSelected = button.classList.contains("tab--active");
                    for (let tabElement of tabberTabs) {
                        let tab = tabElement as HTMLElement;
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