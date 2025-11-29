import init from "../init/controls.js"; //Dependency
import interpolate from "../../../res/util/interpolator.js";
const inputs = await fetch("../res/data/inputs.json").then((response) => response.json());

let DOMButtons;

init.then(async () => {
    DOMButtons = document.body.querySelectorAll("#controls .inputButton");
    setInterval(() => {
        const inputMap = interpolate();
        const stickLeft = {
            stick: null,
            x: 0,
            y: 0
        };
        const stickRight = {
            stick: null,
            x: 0,
            y: 0
        };
        DOMButtons.forEach((button) => {
            let value = inputMap[button.dataset.key];
            const node = document.querySelector(`#${inputs[button.dataset.key].id}`);
            const sectionTitle = button.parentNode.parentNode.firstElementChild.textContent;
            const buttonTitle = button.parentNode.previousElementSibling.textContent;
            if (sectionTitle === "Left Stick" || sectionTitle === "Right Stick") {
                const isLeft = sectionTitle === "Left Stick";
                const stick = isLeft ? stickLeft : stickRight;

                stick.stick = document.querySelector(`#${inputs[button.dataset.key].id}`);
                value = Math.abs(value) * 0.5;

                const buttonLabel = button.parentNode.previousElementSibling.textContent;
                if (buttonLabel.includes("Down") || buttonLabel.includes("Stick Left")) value *= -1;
                if (buttonLabel.includes("Up") || buttonLabel.includes("Down")) stick.y -= value;
                else stick.x += value;
            } else if (buttonTitle === "Left Trigger" || buttonTitle === "Right Trigger") {
                if (button.dataset.negative === "true" && button.hidden === false) value *= -1;
                node.style.fillOpacity = `${value}`;
                node.classList.add("pressed");
            } else {
                if (value > 0.75 && ((button.dataset.negative === "false" && button.hidden === false) || true)) node.classList.add("pressed");
                else if (value < -0.75 && ((button.dataset.negative === "true" && button.hidden === false) || true)) node.classList.add("pressed");
                else node.classList.remove("pressed");
            }
        });
        stickLeft.stick.style.transform = `translate(${stickLeft.x}vh, ${stickLeft.y}vh)`;
        stickRight.stick.style.transform = `translate(${stickRight.x}vh, ${stickRight.y}vh)`;
    },10);
});