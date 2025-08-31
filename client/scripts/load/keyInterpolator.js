import init from "../init/controls.js"; //Dependency
import buttons from "../../../res/util/buttons.js";
const inputs = await fetch("../res/data/inputs.json").then((response) => response.json());

let DOMButtons;

init.then(async () => {
    DOMButtons = document.body.querySelectorAll("#controls .inputButton");
    setInterval(() => {
        const activeInputs = buttons.get();
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
            let value = button.dataset.value;
            const keys = value.match(/\${(.*?)}/g) || [];
            for (let key of keys) {
                key = key.replace("${", "").replace("}", "");
                let keyValue = 0;
                if (Object.keys(activeInputs.keyboard).includes(key)) keyValue = activeInputs.keyboard[key];
                else if (Object.keys(activeInputs.mouse).includes(key)) keyValue = activeInputs.mouse[key];
                else if (Object.keys(activeInputs.controller).includes(key)) keyValue = activeInputs.controller[key];
                value = value.replace("${" + key + "}", keyValue.toString());
            }
            value = window.math.evaluate(value);
            const node = document.querySelector(`#${inputs[button.dataset.key].id}`);
            const sectionTitle = button.parentNode.parentNode.firstElementChild.textContent;
            const buttonTitle = button.parentNode.previousElementSibling.textContent;
            if (sectionTitle === "Left Stick") {
                value *= 0.5;
                stickLeft.stick = document.querySelector(`#${inputs[button.dataset.key].id}`);

                const buttonLabel = button.parentNode.previousElementSibling.textContent;
                if (buttonLabel.includes("Down") || buttonLabel.includes("Stick Left")) value *= -1;
                if (buttonLabel.includes("Up") || buttonLabel.includes("Down")) stickLeft.y -= value;
                else stickLeft.x += value;
            } else if (sectionTitle === "Right Stick") {
                value *= 0.5;
                stickRight.stick = document.querySelector(`#${inputs[button.dataset.key].id}`);

                const buttonLabel = button.parentNode.previousElementSibling.textContent;
                if (buttonLabel.includes("Down") || buttonLabel.includes("Stick Left")) value *= -1;
                if (buttonLabel.includes("Up") || buttonLabel.includes("Down")) stickRight.y -= value;
                else stickRight.x += value;
            } else if (buttonTitle === "Left Trigger" || buttonTitle === "Right Trigger") {
                node.style.fillOpacity = `${value}`;
                node.classList.add("pressed");
            } else {
                if (value > 0.75) node.classList.add("pressed");
                else node.classList.remove("pressed");
            }
        });
        stickLeft.stick.style.transform = `translate(${stickLeft.x}vh, ${stickLeft.y}vh)`;
        stickRight.stick.style.transform = `translate(${stickRight.x}vh, ${stickRight.y}vh)`;
    },1);
});