export default new Promise(resolve => {
    document.addEventListener("DOMContentLoaded", async () => {
        const lastChild = document.querySelector("#config").lastElementChild;
        Object.keys(localStorage).forEach((key) => {
            if (key.startsWith("config_")) {
                const option = document.createElement("option");
                option.value = key.replace("config_", "");
                option.textContent = key.replace("config_", "");
                document.querySelector("#config").insertBefore(option, lastChild);
            }
        });

        document.querySelector("#config").value = localStorage.getItem("lastConfig") || "Default";
        document.querySelector("#nickname").value = localStorage.getItem("nickname") || "";

        const inputs = await fetch("../res/data/inputs.json").then((response) => response.json());
        const categories = await fetch("../res/data/categories.json").then((response) => response.json());

        const container = document.querySelector("#controls");
        let index = 0;
        for (const key in categories) {
            const categoryContainer = document.createElement("div");
            categoryContainer.classList.add("container", "padded");
            categoryContainer.style.gridArea = "sec" + categories[key].section;

            const container2 = document.createElement("div");
            container2.classList.add("controlsContainer");

            const header = document.createElement("h2");
            header.style.gridArea = "header";
            header.textContent = key;

            container2.appendChild(header);
            container2.style.gridTemplateAreas = '"header header"';

            for (const inputKey in categories[key].buttons) {
                container2.style.gridTemplateAreas += `"label${inputKey} input${inputKey}"`;

                const label = document.createElement("label");
                label.classList.add("inputLabel");
                label.style.gridArea = "label" + inputKey;
                label.textContent = inputs[categories[key].buttons[inputKey]].label;

                const inputContainer = document.createElement("div");
                inputContainer.classList.add("inputContainer");
                inputContainer.style.gridArea = "input" + inputKey;

                const input = document.createElement("button");
                input.classList.add("inputButton");
                input.dataset.key = categories[key].buttons[inputKey];

                const advanced = document.createElement("input");
                advanced.type = "text";
                advanced.hidden = true;
                advanced.classList.add("advancedInput");

                const toggleAdvanced = document.createElement("button");
                toggleAdvanced.classList.add("toggleAdvancedButton");
                toggleAdvanced.classList.add("imageButton");
                toggleAdvanced.classList.add("hover");
                toggleAdvanced.dataset.hoverText = "Advanced";

                const advancedImg = document.createElement("img");
                advancedImg.src = "../res/images/advanced.svg";
                toggleAdvanced.appendChild(advancedImg);

                const unbind = document.createElement("button");
                unbind.classList.add("unbindButton");
                unbind.classList.add("imageButton");
                unbind.classList.add("hover");
                unbind.dataset.hoverText = "Unbind";

                const img = document.createElement("img");
                img.src = "../res/images/delete.svg";
                unbind.appendChild(img);

                inputContainer.appendChild(input);
                inputContainer.appendChild(advanced);
                inputContainer.appendChild(toggleAdvanced);
                inputContainer.appendChild(unbind);

                container2.appendChild(label);
                container2.appendChild(inputContainer);
            }

            if (key === "Left Stick" || key === "Right Stick") {
                const label = document.createElement("label");
                label.classList.add("inputLabel");
                label.style.gridArea = "labeldeadzone";
                label.textContent = "Deadzone";

                const input = document.createElement("input");
                input.id = (key === "Left Stick") ? "leftStickDeadzone" : "rightStickDeadzone";
                input.classList.add("deadzoneInput");
                input.classList.add("hover");
                input.type = "range";
                input.min = "0";
                input.max = "1";
                input.step = "0.01";
                input.value = "0.1";
                input.dataset.hoverText = "10%";
                input.addEventListener("input", () => {
                    input.value = parseFloat(input.value).toFixed(2);
                    input.dataset.hoverText = `${(input.value * 100).toFixed(0)}%`;
                });

                const inputContainer = document.createElement("div");
                inputContainer.classList.add("inputContainer");
                inputContainer.classList.add("deadzoneContainer");
                inputContainer.style.gridArea = "inputdeadzone";
                inputContainer.appendChild(input);

                container2.appendChild(label);
                container2.appendChild(inputContainer);

                container2.style.gridTemplateAreas += `"labeldeadzone inputdeadzone"`;
            }

            categoryContainer.appendChild(container2);
            container.appendChild(categoryContainer);

            index++;
        }

        resolve();
    });
});