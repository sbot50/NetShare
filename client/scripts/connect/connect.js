import init from "../init/controls.js"; //Dependency
import interpolate from "../../../res/util/interpolator.js";
let oldControls = {};

init.then(() => {
    document.querySelector("#connect").addEventListener("click", () => connect());
});

function connect() {
    document.querySelector("#body").style.display = "none";
    document.querySelector(".sidebar").style.display = "none";
    document.querySelector("#streamContainer").classList.add("open");

    const peer = webrtc();
    peer.on("open", () => clientOpen(peer));
    peer.on("call", (call) => clientCall(call));
}

function webrtc() {
    const hash = Math.random().toFixed(6).substring(2);
    const id = encodeURIComponent(localStorage.getItem("clientID"));
    return new Peer('fireshare-' + hash + "-" + id);
}

function clientOpen(local) {
    const id = encodeURIComponent(localStorage.getItem("clientID"));
    const remote = local.connect("fireshare-" + id);
    remote.on("open", () => hostOpen(remote));
    remote.on("data", (data) => hostData(remote, data));
    remote.on("close", () => hostClose());
    remote.on("error", (err) => {
        console.log(err);
        hostClose();
    });
}

function clientCall(call) {
    const vid = document.querySelector("#remoteVideo");
    vid.style.display = "block";

    call.on("stream", (stream) => vid.srcObject = stream);
    call.answer();
}

function hostOpen(remote) {
    const nickname = localStorage.getItem("nickname");
    remote.send({
        rtype: "connect",
        nickname: nickname
    });

    setInterval(() => controlsData(remote), 10);
}

function hostData(remote, data) {
    if (data.type === "ping") {
        const ping = Date.now() - data.timestamp;
        console.log("Ping: " + ping + "ms");
    }
}

function hostClose() {
    location.reload();
}

function controlsData(remote) {
    const controls = interpolate();
    controls["left_y"] = controls["left_up"] + controls["left_down"] * -1;
    controls["left_x"] = controls["left_left"] + controls["left_right"] * -1;
    controls["right_y"] = controls["right_up"] + controls["right_down"] * -1;
    controls["right_x"] = controls["right_left"] + controls["right_right"] * -1;
    delete controls["left_up"];
    delete controls["left_down"];
    delete controls["left_left"];
    delete controls["left_right"];
    delete controls["right_up"];
    delete controls["right_down"];
    delete controls["right_left"];
    delete controls["right_right"];

    const data = {};
    for (const key of Object.keys(controls)) {
        if (controls[key] !== oldControls[key]) {
            data[key] = controls[key];
        }
    }
    oldControls = controls;

    if (Object.keys(data).length > 0) {
        remote.send({
            rtype: "controls",
            data: data
        });
    }
}