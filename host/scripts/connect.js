document.addEventListener("DOMContentLoaded", () => {
    document.querySelector("#script").addEventListener("change", selectScript);
    document.querySelector("#stream").addEventListener("change", toggleStreamSettings);

    document.querySelector("#connect").addEventListener("click", () => {
        const websocket = new WebSocket("ws://127.0.0.1:6731");
        const peer = new Peer("fireshare-host");
        peer.on("connection", (remote) => hostConnection(peer, remote, websocket));
    });
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
}