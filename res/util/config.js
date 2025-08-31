const defaultConfig = await fetch("../res/data/default.json").then((res) => res.json());

function createConfig(name) {
    localStorage.setItem("config_" + name, JSON.stringify(defaultConfig));
    localStorage.setItem("lastConfig", name);
}

function setCurrentConfig(name) {
    if (!configExists(name) && name !== "Default") return;
    localStorage.setItem("lastConfig", name);
}

function currentConfig() {
    return localStorage.getItem("lastConfig") || "Default";
}

function setConfigData(key, value) {
    if (currentConfig() === "Default") return;
    const config = getConfig();
    config[key] = value;
    localStorage.setItem("config_" + currentConfig(), JSON.stringify(config));
}

function configExists(name) {
    return localStorage.getItem("config_" + name) !== null;
}

function renameConfig(name) {
    if (currentConfig() === "Default" || configExists(name)) return;
    const config = JSON.parse(localStorage.getItem("config_" + currentConfig()));
    localStorage.setItem("config_" + name, JSON.stringify(config));
    localStorage.removeItem("config_" + currentConfig());
    localStorage.setItem("lastConfig", name);
}

function importConfig(name, config) {
    if (name === "Default") return;
    localStorage.setItem("config_" + name, config);
    localStorage.setItem("lastConfig", name);
}

function getConfigTxt(name = currentConfig()) {
    if (name === "Default") return JSON.stringify(defaultConfig);
    return localStorage.getItem("config_" + name);
}

function getConfig(name = currentConfig()) {
    return JSON.parse(getConfigTxt(name));
}

function deleteConfig() {
    if (currentConfig() === "Default") return;
    localStorage.removeItem("config_" + currentConfig());
    localStorage.setItem("lastConfig", "Default");
}

export default {
    create: createConfig,
    setCurrent: setCurrentConfig,
    current: currentConfig,
    set: setConfigData,
    exists: configExists,
    rename: renameConfig,
    import: importConfig,
    getTxt: getConfigTxt,
    get: getConfig,
    delete: deleteConfig
}