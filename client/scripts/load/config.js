import init from "../init/controls.js"; //Dependency
import translate from "../../../res/util/translate.js";
import configUtils from "../../../res/util/config.js";
import buttons from "../../../res/util/buttons.js";
let clickedButton;
let ignore = false;
let mouse_x;
let mouse_y;
let gamepadDefaults = {};

document.addEventListener("keydown", (event) => keyPressed(event));
document.addEventListener("mousemove", (event) => mouseMoved(event));
document.addEventListener("mousedown", (event) => mouseClicked(event));
document.addEventListener("contextmenu", (event) => event.preventDefault());
document.body.addEventListener("click", (event) => cancelBind(event));
init.then(async () => {
    const buttons = document.body.querySelectorAll("#controls .inputButton");
    buttons.forEach((button) => {
        button.addEventListener("click", () => changeButton(button));
        button.nextElementSibling.addEventListener("input", () => updateInput(button));
        button.nextElementSibling.nextElementSibling.addEventListener("click", () => advancedButton(button));
        button.nextElementSibling.nextElementSibling.nextElementSibling.addEventListener("click", () => unbindButton(button));
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
    document.querySelector("#leftStickDeadzone").addEventListener("change", (event) => editDeadzone(event.target));
    document.querySelector("#rightStickDeadzone").addEventListener("change", (event) => editDeadzone(event.target));

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
        const config = configUtils.get();
        const configData = config[button.dataset.key];
        configData.key = `mouse_left`;
        configData.negative = false;
        setButton(button, value);
        return;
    }
    ignore = true;
    clickedButton = button;
    button.textContent = "...";
}

async function advancedButton(button) {
    if (button.disabled) return;
    if (clickedButton != null && button !== clickedButton) cancelBind();
    const config = configUtils.get();
    const configData = config[button.dataset.key];
    configData.advanced = !configData.advanced;

    button.hidden = !button.hidden;
    button.nextElementSibling.hidden = !button.nextElementSibling.hidden;

    if ((configData.input === "" || configData.input === null || configData.input === undefined) && button.dataset.value !== null && button.dataset.value !== "0") {
        const section = button.parentNode.parentNode.firstElementChild.textContent;
        if (section === "Left Stick" || section === "Right Stick") {
            const key = button.dataset.value;
            console.log(configData.negative);
            let value = `(max(abs(\${${key}})-${configData.deadzone}, 0) + ${configData.deadzone} * sign(max(abs(\${${key}})-${configData.deadzone},0))) * sign(max(\${${key}}${configData.negative === true ? "*-1" : ""},0))`;
            button.nextElementSibling.value = value;
            configData.input = value;
        } else {
            const key = button.dataset.value;
            const negative = button.dataset.negative;
            let value = `\${${key}}`;
            if (negative === "true") value = `abs(${value})`;
            button.nextElementSibling.value = value;
            configData.input = value;
        }
    }
    button.nextElementSibling.value = configData.input;

    configUtils.set(button.dataset.key, configData);

    if (button.hidden === false) {
        setButton(button, configData);
    }
}

async function updateInput(button) {
    if (button.disabled) return;
    const config = configUtils.get();
    const configData = config[button.dataset.key];
    configData.input = button.nextElementSibling.value;
    configUtils.set(button.dataset.key, configData);
}

async function unbindButton(button) {
    if (button.disabled) return;
    const config = configUtils.get();
    const configData = config[button.dataset.key];
    configData.key = null;
    configData.negative = false;
    setButton(button, configData);
}

function loadConfig() {
    if (configUtils.current() === "Default") {
        document.querySelectorAll("#controls .imageButton").forEach((img) => img.classList.add("disabled"));
        document.querySelector("#rename").classList.add("disabled");
        document.querySelector("#import").classList.add("disabled");
        document.querySelector("#delete").classList.add("disabled");
        document.querySelector("#rightStickDeadzone").classList.add("disabled");
        document.querySelector("#leftStickDeadzone").classList.add("disabled");
        document.querySelector("#rightStickDeadzone").disabled = true;
        document.querySelector("#leftStickDeadzone").disabled = true;
    } else {
        document.querySelectorAll("#controls .imageButton").forEach((img) => img.classList.remove("disabled"));
        document.querySelector("#rename").classList.remove("disabled");
        document.querySelector("#import").classList.remove("disabled");
        document.querySelector("#delete").classList.remove("disabled");
        document.querySelector("#rightStickDeadzone").classList.remove("disabled");
        document.querySelector("#leftStickDeadzone").classList.remove("disabled");
        document.querySelector("#rightStickDeadzone").disabled = false;
        document.querySelector("#leftStickDeadzone").disabled = false;
    }

    const config = configUtils.get();
    const buttons = document.body.querySelectorAll("#controls .inputButton");
    buttons.forEach((button) => {
        button.disabled = configUtils.current() === "Default";
        const key = button.dataset.key;
        const value = config[key];
        setButton(button, value);
    });
    document.querySelector("#leftStickDeadzone").value = config["left_up"].deadzone;
    document.querySelector("#leftStickDeadzone").dataset.hoverText = (config["left_up"].deadzone * 100) + "%"
    document.querySelector("#rightStickDeadzone").value = config["right_up"].deadzone;
    document.querySelector("#rightStickDeadzone").dataset.hoverText = (config["right_up"].deadzone * 100) + "%"
}

function setButton(button, value) {
    const configData = {
        key: value.key,
        negative: value.negative,
        deadzone: value.deadzone,
        input: value.input,
        advanced: value.advanced,
    };
    if ((value.key === "0" || value.key === null) && !value.advanced) {
        button.textContent = "Unbound";
        button.dataset.value = "0";
        button.dataset.negative = "false";
    } else {
        const splitKey = value.key
            .split("-");
        let controllerKey = splitKey[0];
        let buttonKey = splitKey[splitKey.length - 1];
        if (buttonKey.startsWith("btn")) {
            const controllerNum = controllerKey.split("ctrl_")[1];
            const translated = translate.keyToButton(buttonKey);
            if (translated && translated.label) {
                button.textContent = translated.label + " (" + controllerNum + ")";
            } else {
                button.textContent = buttonKey + " (" + controllerNum + ")";
            }
        } else if (buttonKey.startsWith("axis_")) {
            const controllerNum = controllerKey.split("ctrl_")[1];
            const translated = translate.keyToButton(buttonKey);
            if (translated && translated.label) {
                button.textContent = translated.label + " (" + controllerNum + ")";
            } else {
                button.textContent = buttonKey + " (" + controllerNum + ")";
            }

            if (!value.negative) {
                button.textContent = button.textContent
                    .replace("Stick Up", "Stick Down")
                    .replace("Stick Left", "Stick Right");
            }
        } else if (buttonKey.startsWith("key")) {
            const keyText = buttonKey.replace("key_", "");
            button.textContent = keyText.charAt(0).toUpperCase() + keyText.slice(1).toLowerCase() + " Key";
        } else if (buttonKey.startsWith("mouse_")) {
            const keyText = buttonKey.replace("mouse_", "");
            button.textContent = "Mouse " + keyText.charAt(0).toUpperCase() + keyText.slice(1).toLowerCase();
            if (buttonKey.includes("mouse_x") || buttonKey.includes("mouse_y")) button.textContent += value.negative ? "-" : "+";
        }
        button.dataset.value = value.key;
        button.dataset.negative = value.negative;

        if (configData.advanced) {
            button.hidden = true;
            button.nextElementSibling.hidden = false;
            button.nextElementSibling.value = value.input || "";
        } else {
            button.hidden = false;
            button.nextElementSibling.hidden = true;
        }
    }

    if (configUtils.current() !== "Default") {
        configData.key = button.dataset.value;
        configUtils.set(button.dataset.key, configData);
    }
}

function keyPressed(event) {
    if (!clickedButton) return;
    const key = "key_" + event.code.replace("Key", "");
    const config = configUtils.get();
    const configData = config[clickedButton.dataset.key];
    configData.key = `${key}`;
    configData.negative = false;
    setButton(clickedButton, configData);
    clickedButton = null;
}

function mouseMoved(event) {
    if (!clickedButton) return;

    const x = (event.clientX - window.innerWidth/2)/(window.innerWidth/2);
    const y = (event.clientY - window.innerHeight/2)/(window.innerHeight/2);
    const x_movement = Math.abs(Math.abs(mouse_x) - Math.abs(x));
    const y_movement = Math.abs(Math.abs(mouse_y) - Math.abs(y));

    const config = configUtils.get();
    const value = config[clickedButton.dataset.key];
    if (x_movement > 0.1) {
        value.negative = x < mouse_x;
        value.key = `mouse_x`;
        setButton(clickedButton, value);
        clickedButton = null;
    } else if (y_movement > 0.1) {
        value.negative = y < mouse_y;
        value.key = `mouse_y`;
        setButton(clickedButton, value);
        clickedButton = null;
    }
}

function mouseClicked(event) {
    if (!clickedButton) return;
    event.preventDefault();
    if (event.button === 1) {
        const config = configUtils.get();
        const configData = config[button.dataset.key];
        configData.key = `mouse_middle`;
        configData.negative = false;
        setButton(clickedButton, value);
        clickedButton = null;
    } else if (event.button === 2) {
        const config = configUtils.get();
        const configData = config[button.dataset.key];
        configData.key = `mouse_right`;
        configData.negative = false;
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
    if (configUtils.current() === "Default") return;
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
    if (name === "Default") return;
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
    if (!clickedButton) return;
    const gamepadButtons = buttons.get()["controller"];
    for (const key of Object.keys(gamepadButtons)) {
        if (!Object.keys(gamepadDefaults).includes(key)) {
            gamepadDefaults[key] = gamepadButtons[key];
        }
        if ((gamepadButtons[key] > 0.75 || gamepadButtons[key] < -0.75) && gamepadButtons[key] !== gamepadDefaults[key]) {
            const config = configUtils.get();
            const configData = config[clickedButton.dataset.key];
            configData.key = key;
            configData.negative = gamepadButtons[key] < 0;
            setButton(clickedButton, configData);
            clickedButton = null;
            break;
        }
    }
}

function editDeadzone(slider) {
    const value = parseFloat(slider.value);
    if (slider.id === "leftStickDeadzone") {
        configUtils.setDeadzone("left", value);
    } else {
        configUtils.setDeadzone("right", value);
    }
}