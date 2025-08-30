import init from "../init/controls.js"; //Dependency
import translate from "../util/translate.js";
import configUtils from "../util/config.js";
let clickedButton;
let ignore = false;
let mouse_x;
let mouse_y;

document.addEventListener("keydown", (event) => keyPressed(event));
document.addEventListener("mousemove", (event) => mouseMoved(event));
document.addEventListener("mousedown", (event) => mouseClicked(event));
document.addEventListener("contextmenu", (event) => event.preventDefault());
document.body.addEventListener("click", (event) => cancelBind(event));
init.then(async () => {
    const buttons = document.body.querySelectorAll("#controls .inputButton");
    buttons.forEach((button) => {
        button.addEventListener("click", () => changeButton(button));
        button.nextElementSibling.addEventListener("click", () => unbindButton(button));
    });

    loadConfig();

    document.querySelector("#config").addEventListener("change", async () => {
        if (document.querySelector("#config").value === "New") {
            await showAlert();
            loadConfig();
        } else {
            configUtils.setCurrent(document.querySelector("#config").value);
            loadConfig();
        }
    });
    document.querySelector("#rename").addEventListener("click", () => renameConfig());
    document.querySelector("#import_new").addEventListener("click", () => importNewConfig());
    document.querySelector("#import").addEventListener("click", () => importConfig(configUtils.current()));
    document.querySelector("#export").addEventListener("click", () => exportConfig(configUtils.current()));
    document.querySelector("#delete").addEventListener("click", () => deleteConfig());

    setInterval(() => checkGamepads(), 1);
});

async function showAlert() {
    const name = prompt("Enter config name");
    if (name) {
        configUtils.create(name);

        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        document.querySelector("#config").insertBefore(option, document.querySelector("#config").lastElementChild);
        document.querySelector("#config").value = name;
    } else {
        document.querySelector("#config").value = configUtils.current();
    }
}

async function changeButton(button) {
    if (button.disabled) return;
    if (clickedButton != null && button !== clickedButton) cancelBind();
    if (button === clickedButton) {
        clickedButton = null;
        const value = {
            input: `\${mouse_left}`,
            negative: false,
            advanced: false,
        }
        setButton(button, value);
        return;
    }
    ignore = true;
    clickedButton = button;
    button.textContent = "...";
}

async function unbindButton(button) {
    if (button.disabled) return;
    setButton(button, {
        input: null,
        negative: false,
        advanced: false,
    });
}

function loadConfig() {
    const config = configUtils.get();
    const buttons = document.body.querySelectorAll("#controls .inputButton");
    buttons.forEach((button) => {
        button.disabled = configUtils.current() === "Default";
        const key = button.dataset.key;
        const value = config[key];
        setButton(button, value);
    });
}

function setButton(button, value) {
    const configData = {
        input: value.input,
        negative: value.negative,
        advanced: value.advanced,
    };
    if (!value.input || (!value.input.match(/^\${.*?}$/) && !value.input.match(/^abs\(min\(0,\${.*?}\)\)$/) && !value.input.match(/^max\(0,\${.*?}\)$/) && !value.advanced)) {
        button.textContent = "Unbound";
        button.dataset.value = "0";
    } else if (!value.advanced) {
        const splitKey = value.input
            .replace("${", "")
            .replace("}", "")
            .split("-");
        let buttonKey = splitKey[splitKey.length - 1];
        if (buttonKey.startsWith("btn") || buttonKey.startsWith("axis")) {
            const translated = translate.keyToButton(buttonKey);
            button.textContent = translated.label;
            button.dataset.value = value.input;
            if (buttonKey.startsWith("axis") && value.negative)
                button.textContent = translated.label
                    .replace("Up", "Down")
                    .replace("Left", "Right");
        } else if (buttonKey.startsWith("key")) {
            const keyText = buttonKey.replace("key_", "");
            button.textContent = keyText.charAt(0).toUpperCase() + keyText.slice(1).toLowerCase() + " Key";
            button.dataset.value = value.input;
        } else if (value.input.startsWith(`abs(min(0,\${mouse`) || value.input.startsWith(`max(0,\${mouse`) || value.input.startsWith(`\${mouse_`)) {
            value.input = removeFluff(value.input);
            buttonKey = removeFluff(buttonKey);
            const keyText = buttonKey.replace("mouse_", "");
            button.textContent = "Mouse " + keyText.charAt(0).toUpperCase() + keyText.slice(1).toLowerCase();
            if (buttonKey.includes("mouse_x") || buttonKey.includes("mouse_y")) button.textContent += value.negative ? "-" : "+";
            button.dataset.value = (value.negative) ? "abs(min(0," + value.input + "))" : "max(0," + value.input + ")";
        }
    }
    if (configUtils.current() !== "Default") {
        configData.input = button.dataset.value;
        configUtils.set(button.dataset.key, configData);
    }
}

function removeFluff(input) {
    return input.replace("abs(min(0,", "").replace("))", "").replace("max(0,", "").replace(")", "");
}

function keyPressed(event) {
    if (!clickedButton) return;
    const key = "key_" + event.code.replace("Key", "");
    const value = {
        input: `\${${key}}`,
        negative: false,
        advanced: false,
    }
    setButton(clickedButton, value);
    clickedButton = null;
}

function mouseMoved(event) {
    if (!clickedButton) return;

    const x = (event.clientX - window.innerWidth/2)/(window.innerWidth/2);
    const y = (event.clientY - window.innerHeight/2)/(window.innerHeight/2);
    const x_movement = Math.abs(Math.abs(mouse_x) - Math.abs(x));
    const y_movement = Math.abs(Math.abs(mouse_y) - Math.abs(y));

    const value = {
        negative: false,
        advanced: false,
    }
    if (x_movement > 0.2) {
        value.negative = x < mouse_x;
        value.input = `\${mouse_x}`;
        setButton(clickedButton, value);
        clickedButton = null;
    } else if (y_movement > 0.2) {
        value.negative = y < mouse_y;
        value.input = `\${mouse_y}`;
        setButton(clickedButton, value);
        clickedButton = null;
    }
}

function mouseClicked(event) {
    if (!clickedButton) return;
    event.preventDefault();
    if (event.button === 1) {
        const value = {
            input: `\${mouse_middle}`,
            negative: false,
            advanced: false,
        }
        setButton(clickedButton, value);
        clickedButton = null;
    } else if (event.button === 2) {
        const value = {
            input: `\${mouse_right}`,
            negative: false,
            advanced: false,
        }
        setButton(clickedButton, value);
        clickedButton = null;
    }
}

function cancelBind(event) {
    if (!ignore && clickedButton) {
        setButton(clickedButton, JSON.parse(clickedButton.dataset.value));
        clickedButton = null;
    } else {
        mouse_x = (event.clientX - window.innerWidth/2)/(window.innerWidth/2);
        mouse_y = (event.clientY - window.innerHeight/2)/(window.innerHeight/2);
        ignore = false;
    }
}

async function renameConfig() {
    const name = prompt("Enter new config name");
    const option = document.querySelector(`#config option[value="${configUtils.current()}"]`);
    option.value = name;
    option.textContent = name;
    document.querySelector("#config").value = name;
    configUtils.rename(name);
}

async function importNewConfig() {
    const name = prompt("Enter config name");
    if (!name || name === "Default" || configUtils.exists(name)) return;
    await importConfig(name);
}

async function importConfig(name) {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.addEventListener("change", async () => {
        const file = input.files[0];
        const reader = new FileReader();
        reader.addEventListener("load", async () => {
            const result = reader.result;
            if (typeof result != "string") return;
            const configSelect = document.querySelector("#config");
            if (!configSelect.querySelector(`option[value="${name}"]`)) {
                const option = document.createElement("option");
                option.value = name;
                option.textContent = name;
                configSelect.insertBefore(option, document.querySelector("#config").lastElementChild);
            }
            configSelect.value = name;
            configUtils.import(name, result);
            loadConfig();
        });
        reader.readAsText(file);
    });
    input.click();
}

async function exportConfig() {
    const json = JSON.stringify(configUtils.get(), null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "config.json";
    link.click();
    URL.revokeObjectURL(url);
}

async function deleteConfig() {
    if (configUtils.current() === "Default") return;
    if (confirm("Are you sure you want to delete this config?")) {
        const configSelect = document.querySelector("#config");
        const option = configSelect.querySelector(`option[value="${configUtils.current()}"]`);
        const previousOption = option.previousElementSibling;
        option.remove();
        configSelect.value = previousOption.value;
        configUtils.delete();
        configUtils.setCurrent(previousOption.value);
        loadConfig();
    }
}

function checkGamepads() {

}