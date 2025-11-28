import {
    Notification,
    NotifPlacement,
    NotifType
} from "../../res/util/notif.js";

if (!localStorage.getItem("host-id")) localStorage.setItem("host-id", Math.random().toFixed(6).substring(2));
const id = localStorage.getItem("host-id");
const stream = localStorage.getItem("stream") === "true";
const audio = localStorage.getItem("audio") === "true";
const fps = localStorage.getItem("fps") || "60";
const quality = localStorage.getItem("quality") || "1920x1080";
const width = quality.split("x")[0];
const height = quality.split("x")[1];

let connectedUsers = new Map();
let removedUsers = [];
let hostStream;
let audioTracks = [];

window.addEventListener("beforeunload", () => {
    audioTracks.forEach(t => t.stop());
});

document.addEventListener("DOMContentLoaded", async () => {
    document.getElementById("id").textContent = "ID: " + id;

    let websocket = new WebSocket("ws://127.0.0.1:6731");
    websocket.onerror = errorNotif;

    const peer = new Peer("fireshare-" + id);

    document.querySelector("#stop").addEventListener("click", () => stopStreaming(peer, websocket));

    const startButton = document.getElementById("start-stream");

    if (stream) {
        document.getElementById("placeholder-text").style.display = "none";
        startButton.style.display = "block";
        startButton.addEventListener("click", () => getStream(peer));
    }

    initializeStreaming(peer, websocket);
});

async function getStream(peer) {
    try {
        if (audio) {
            let audioStream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    autoGainControl: false,
                    channelCount: 2,
                    echoCancellation: false,
                    latency: 0,
                    noiseSuppression: false,
                    sampleRate: 48000,
                    sampleSize: 16,
                    volume: 1.0,
                },
            });
            audioTracks = audioStream.getAudioTracks();
        }

        const videoConstraints = {
            displaySurface: "monitor"
        };
        if (quality !== "source") {
            videoConstraints.width = { ideal: width };
            videoConstraints.height = { ideal: height };
        }
        if (fps !== "source") {
            videoConstraints.fps = { ideal: fps };
        }
        const constraints = {
            video: videoConstraints,
            audio: true,
            systemAudio: "include",
            windowAudio: "include"
        };

        hostStream = await navigator.mediaDevices.getDisplayMedia(constraints);
        for (let track of audioTracks) {
            hostStream.addTrack(track);
        }

        const videoElement = document.getElementById("localStream");
        videoElement.srcObject = hostStream;

        document.querySelector(".stream-placeholder").style.display = "none";
        document.getElementById("localStream").style.display = "block";
        await sendStream(peer);
    } catch (error) {
        console.error("Error accessing media devices:", error);
        const notif = new Notification("Couldn't access camera", NotifType.ERROR, 5, NotifPlacement.TOP_MIDDLE);
        notif.show();
    }
}

async function sendStream(peer) {
    for (let user of connectedUsers) {
        user = user[1];
        peer.call(user.connection.peer, hostStream)
    }
}

function errorNotif() {
    const notif = new Notification("Couldn't connect to websocket", NotifType.ERROR, 5, NotifPlacement.TOP_MIDDLE);
    notif.show();
}

async function stopStreaming(peer, websocket) {
    await Promise.all(
        Array.from(connectedUsers.entries()).map(async ([userId, user]) => {
            if (user.connection) {
                try {
                    user.connection.send({
                        rtype: "disconnect",
                        stopped: true
                    });
                    await new Promise(resolve => setTimeout(resolve, 100));
                    user.connection.close();
                } catch (error) {
                    console.error(`Error disconnecting user ${userId}:`, error);
                }
            }
        })
    );

    if (peer) {
        peer.destroy();
    }

    if (websocket && websocket.readyState === WebSocket.OPEN) {
        websocket.close();
    }

    window.location.href = "/host";
}

function initializeStreaming(peer, websocket) {
    peer.on("connection", (client) => {
        client.on("data", (data) => handleClientData(peer, websocket, client, data));
        client.on("close", () => handleClientClose(websocket, client));
        startHeartbeat(websocket, client);
    });
}

function handleClientClose(websocket, client) {
    removeUser(client.label);
}

function handleClientData(peer, websocket, client, data) {
    if (data.rtype === "connect") addUser(peer, client, client.label, data.nickname);
    else if (data.rtype === "disconnect") handleDisconnect(websocket, client);
    else if (data.rtype === "controls") handleControls(websocket, client.label, data.controls);
    else if (data.rtype === "pong") handlePong(client.label);
}

function startHeartbeat(websocket, client) {
    const userId = client.label;

    const interval = setInterval(() => {
        if (!connectedUsers.has(userId)) {
            clearInterval(interval);
            return;
        }

        client.send({ rtype: "ping" });

        const timeout = setTimeout(() => {
            handleClientClose(websocket, client);
        }, 2000);

        if (connectedUsers.has(userId)) {
            connectedUsers.get(userId).timeout = timeout;
        }
    }, 1000);

    connectedUsers.get(userId).interval = interval;
}

function handlePong(userId) {
    if (connectedUsers.has(userId)) {
        clearTimeout(connectedUsers.get(userId).timeout);
    }
}

function addUser(peer, connection, userId, nickname) {
    if (hostStream) {
        peer.call(connection.peer, hostStream);
    }
    nickname = nickname || "Anonymous";
    connectedUsers.set(userId, { nickname,  connection, properDisconnect: false });
    updateUsersList();
}

function handleDisconnect(websocket, client) {
    if (removedUsers.includes(client.label)) return;
    connectedUsers.get(client.label).properDisconnect = true;
    removeUser(client.label);
}

function removeUser(userId, noNotif) {
    if (connectedUsers.has(userId)) {
        clearInterval(connectedUsers.get(userId).interval);
        clearTimeout(connectedUsers.get(userId).timeout);
        if (noNotif !== true) {
            if (connectedUsers.get(userId).properDisconnect) {
                const notif = new Notification("User " + connectedUsers.get(userId).nickname + " disconnected", NotifType.INFO, 5, NotifPlacement.BOTTOM_RIGHT);
                notif.show();
            } else {
                const notif = new Notification("Connection with user " + connectedUsers.get(userId).nickname + " lost", NotifType.ERROR, 5, NotifPlacement.TOP_MIDDLE);
                notif.show();
            }
        }
        connectedUsers.delete(userId);
        updateUsersList();
    }
}

function handleControls(websocket, userId, controls) {
    // TODO
}

function updateUsersList() {
    const usersList = document.querySelector("#users-list");

    if (connectedUsers.size === 0) {
        usersList.innerHTML = '<p class="no-users">No users connected yet</p>';
        return;
    }

    usersList.innerHTML = Array.from(connectedUsers.entries())
        .map(([userId, user]) => `
            <div class="user-item">
                <div class="user-info">
                    <div class="user-name">${user.nickname}</div>
                    <div class="user-id">${userId}</div>
                </div>
                <button class="disconnect-button" onclick="disconnectUser('${userId}')">
                    Disconnect
                </button>
            </div>
        `).join("");
}

window.disconnectUser = async (userId) => {
    removedUsers.push(userId);
    const user = connectedUsers.get(userId);
    if (user && user.connection) {
        user.connection.send({
            rtype: "disconnect"
        });
        await new Promise((resolve) => setTimeout(resolve, 100));
        user.connection.close();
    }
    removeUser(userId);
}