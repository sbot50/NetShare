import init from "../init/inputView.js"; //Dependency
import buttons from "../../../res/util/buttons.js";

setInterval(() => {
    const inputs = buttons.get();
    for (const type of Object.keys(inputs)) {
        for (const input of Object.keys(inputs[type])) {
            if (document.querySelector("#state_" + input) == null) {
                const element = document.createElement("p");
                element.classList.add("key");
                element.innerText = input;
                element.id = "state_" + input;

                if (input.startsWith("key_")) document.querySelector(".keyboard").appendChild(element);
                else if (input.startsWith("mouse_")) document.querySelector(".mouse").appendChild(element);
                else document.querySelector(".controller").appendChild(element);
            }
            document.querySelector("#state_" + input).style.backgroundColor = (inputs[type][input] === 0) ? "white" : (inputs[type][input] > 0) ? "rgba(0,255,0," + Math.abs(inputs[type][input]) + ")" : "rgba(255,0,0," + Math.abs(inputs[type][input]) + ")";
        }
    }
}, 1);