document.addEventListener("DOMContentLoaded", () => {
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