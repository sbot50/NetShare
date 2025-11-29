import config from "./config.js";
import buttons from "./buttons.js";
export default function interpolate() {
    const inputMap = {};
    const currentConfig = config.get();
    const activeInputs = buttons.get();
    for (const button of Object.keys(currentConfig)) {
        let value = currentConfig[button].advanced ? currentConfig[button].input : "${" + currentConfig[button].key + "}";
        const keys = value.match(/\${(.*?)}/g) || [];
        for (let key of keys) {
            key = key.replace("${", "").replace("}", "");
            let keyValue = 0;
            if (Object.keys(activeInputs.keyboard).includes(key)) keyValue = activeInputs.keyboard[key];
            else if (Object.keys(activeInputs.mouse).includes(key)) {
                keyValue = activeInputs.mouse[key];
            }
            else if (Object.keys(activeInputs.controller).includes(key)) keyValue = activeInputs.controller[key];
            value = value.replace("${" + key + "}", keyValue.toString());
        }
        value = window.math.evaluate(value);
        if (!currentConfig[button].advanced) {
            if (currentConfig[button].negative && value > 0) value = 0;
            if (!currentConfig[button].negative && value < 0) value = 0;
            if (currentConfig[button].deadzone) {
                if (currentConfig[button].negative && value > currentConfig[button].deadzone*-1) value = 0;
                if (!currentConfig[button].negative && value < currentConfig[button].deadzone) value = 0;
            }
        }
        inputMap[button] = value;
    }
    return inputMap;
}