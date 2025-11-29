document.addEventListener("DOMContentLoaded", () => {
    const id = localStorage.getItem("host-id") || Math.random().toFixed(6).substring(2);
    const stream = localStorage.getItem("stream") === "true";
    const audio = localStorage.getItem("audio") === "true";
    const fps = localStorage.getItem("fps") || "60";
    const quality = localStorage.getItem("quality") || "1080";
    localStorage.setItem("host-id", id);
    localStorage.setItem("quality", quality);
    localStorage.setItem("fps", fps);
    localStorage.setItem("audio", audio);
    localStorage.setItem("stream", stream);

    document.querySelector("#id").value = id;
    document.querySelector("#stream").checked = stream;
    toggleStreamSettings();
    document.querySelector("#audio").checked = audio;
    document.querySelector(`#fps option[value="${fps}"]`).selected = true;
    document.querySelector(`#quality option[value="${quality}"]`).selected = true;

    document.querySelector("#script").addEventListener("change", selectScript);
    document.querySelector("#stream").addEventListener("change", toggleStreamSettings);
    document.querySelector("#audio").addEventListener("change", toggleAudio);
    document.querySelector("#fps").addEventListener("change", setFPS);
    document.querySelector("#quality").addEventListener("change", setQuality);
    document.querySelector("#id").addEventListener("change", setID);
    document.querySelector("#connect").addEventListener("click", () => location.href = "/host/stream");
    document.querySelector(".back-link").addEventListener("click", () => location.href = "/");
});

function hostConnection(local, remote, websocket) {
    remote.on("data", (data) => remoteData(data, websocket));
}

function remoteData(data, websocket) {
    let json = data;
    json.id = 1;
    if (websocket.readyState === WebSocket.OPEN) {
        websocket.send(JSON.stringify(json));
    }
}

function selectScript() {
    const script = document.querySelector("#script").value;
    const link = document.createElement("a");
    if (script === "windows") {
        link.href = "/res/scripts/fireshare-host-script.exe";
        link.download = "fireshare-host-script.exe";
        document.body.appendChild(link);
    } else if (script === "linux") {
        link.href = "/res/scripts/fireshare-host-script";
        link.download = "fireshare-host-script";
        document.body.appendChild(link);
    }
    link.click();
    document.body.removeChild(link);
    document.querySelector("#script").value = "";
}

function toggleStreamSettings() {
    const stream = document.querySelector("#stream").checked;
    document.querySelector("#audio").disabled = !stream;
    document.querySelector("#fps").disabled = !stream;
    document.querySelector("#quality").disabled = !stream;

    localStorage.setItem("stream", document.querySelector("#stream").checked);
}

function toggleAudio() {
    localStorage.setItem("audio", document.querySelector("#audio").checked);
}

function setFPS() {
    localStorage.setItem("fps", document.querySelector("#fps").value);
}

function setQuality() {
    localStorage.setItem("quality", document.querySelector("#quality").value);
}

function setID() {
    if (document.querySelector("#id").value === "") {
        document.querySelector("#id").value = Math.random().toFixed(6).substring(2);
    }
    localStorage.setItem("host-id", document.querySelector("#id").value);
}