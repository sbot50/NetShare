const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
            if (node.classList) node.classList.contains("hover") ? addHover(node) : null;
            if (node.querySelectorAll) {
                const hoverChildren = node.querySelectorAll(".hover");
                hoverChildren.forEach((child) => addHover(child));
            }
        });
        if (mutation.attributeName === 'data-hover-text' && mutation.target === currentHover) {
            startHover(mutation.target);
        }
    });
});

let hover;
let currentHover;

document.addEventListener("DOMContentLoaded", () => {
    observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ["data-hover-text"]
    });

    hover = document.querySelector("#hover");

    const elements = document.body.querySelectorAll(".hover");
    elements.forEach((element) => addHover(element));
});

function addHover(element) {
    element.addEventListener("mouseover", () => startHover(element));
    element.addEventListener("mouseout", endHover);
}

function startHover(element) {
    currentHover = element;
    if (element.classList.contains("disabled")) return;
    hover.style.display = "block";
    hover.innerHTML = element.dataset.hoverText || "";
    hover.style.left = element.getBoundingClientRect().left + "px";
    hover.style.top = element.getBoundingClientRect().bottom + "px";
}

function endHover() {
    currentHover = null;
    hover.style.display = "none";
    hover.innerHTML = "";
    hover.style.left = "";
    hover.style.top = "";
}