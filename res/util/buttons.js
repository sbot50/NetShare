const kb_keys = {};
const mouse = {};

document.addEventListener("keydown", (event) => keyDown(event));
document.addEventListener("keyup", (event) => keyUp(event));
document.addEventListener("mousemove", (event) => mouseMoved(event));
document.addEventListener("mousedown", (event) => mouseDown(event));
document.addEventListener("mouseup", (event) => mouseUp(event));

setInterval(mouseDecay, 10);

function get() {
    return {
        "keyboard": kb_keys,
        "mouse": mouse,
        "controller": getControllers()
    }
}

function getControllers() {
    const buttons = {};
    navigator.getGamepads().forEach((gamepad) => {
        if (gamepad) {
            let index = 0;
            for (const button of gamepad.buttons) {
                buttons[`ctrl_${gamepad.index}-btn_${index}`] = button.value;
                index++;
            }
            index = 0;
            for (const axis of gamepad.axes) {
                buttons[`ctrl_${gamepad.index}-axis_${index}`] = axis;
                index++;
            }
        }
    });
    return buttons;
}

function keyDown(event) {
    const key = "key_" + event.code.replace("Key", "");
    kb_keys[key] = 1;
}

function keyUp(event) {
    const key = "key_" + event.code.replace("Key", "");
    kb_keys[key] = 0;
}

function mouseMoved(event) {
    if (document.pointerLockElement !== null) {
        mouse["mouse_x"] += event.movementX * 0.005;
        mouse["mouse_y"] += event.movementY * 0.005;
        mouse["mouse_x"] = Math.max(-1, Math.min(1, mouse["mouse_x"]));
        mouse["mouse_y"] = Math.max(-1, Math.min(1, mouse["mouse_y"]));
    } else {
        mouse["mouse_x"] = (event.clientX - window.innerWidth / 2) / (window.innerWidth / 2);
        mouse["mouse_y"] = (event.clientY - window.innerHeight / 2) / (window.innerHeight / 2);
    }
}

function mouseDecay() {
    if (document.pointerLockElement !== null) {
        mouse["mouse_x"] *= 0.9;
        mouse["mouse_y"] *= 0.9;
    }
}

function mouseDown(event) {
    if (event.button === 0) mouse["mouse_left"] = 1;
    if (event.button === 1) mouse["mouse_middle"] = 1;
    if (event.button === 2) mouse["mouse_right"] = 1;
}

function mouseUp(event) {
    if (event.button === 0) mouse["mouse_left"] = 0;
    if (event.button === 1) mouse["mouse_middle"] = 0;
    if (event.button === 2) mouse["mouse_right"] = 0;
}

export default {
    get
}