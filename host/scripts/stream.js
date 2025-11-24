import {
    Notification,
    NotifPlacement,
    NotifType
} from "../../res/util/notif.js";
let peer;
let websocket;
let connectedUsers = new Map();

const stream = localStorage.getItem("stream") === "true";
const audio = localStorage.getItem("audio") === "true";
const fps = localStorage.getItem("fps") || "60";
const quality = localStorage.getItem("quality") || "1080";

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("id").textContent = "ID: " + localStorage.getItem("host-id");
    document.querySelector("#stop").addEventListener("click", stopStreaming);

    let websocket = new WebSocket("ws://127.0.0.1:6731");
    websocket.onerror = errorNotif;
    const peer = new Peer("fireshare-host");
    // peer.on("connection", (remote) => hostConnection(peer, remote, websocket));
});

function errorNotif() {
    const notif = new Notification("Couldn't connect to websocket", NotifType.ERROR, 5, NotifPlacement.TOP_MIDDLE);
    notif.show();
}

function initializeStreaming(peerInstance, websocketInstance) {
    peer = peerInstance;
    websocket = websocketInstance;

    // Listen for incoming calls (client streams)
    peer.on("call", (call) => {
        call.answer();
        call.on("stream", (stream) => {
            // Handle incoming stream if needed
        });
    });

    // Listen for incoming connections (control data)
    peer.on("connection", (conn) => {
        const userId = conn.peer;

        conn.on("data", (data) => {
            if (data.rtype === "connect") {
                addUser(userId, data.nickname || "Anonymous");
            }
        });

        conn.on("close", () => {
            removeUser(userId);
        });

        conn.on("error", () => {
            removeUser(userId);
        });

        connectedUsers.set(userId, { connection: conn, nickname: data?.nickname || "Anonymous" });
    });
}

function addUser(userId, nickname) {
    if (connectedUsers.has(userId)) return;

    connectedUsers.set(userId, { nickname, connection: null });
    updateUsersList();
}

function removeUser(userId) {
    connectedUsers.delete(userId);
    updateUsersList();
}

function disconnectUser(userId) {
    const user = connectedUsers.get(userId);
    if (user && user.connection) {
        user.connection.close();
    }
    removeUser(userId);
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

function stopStreaming() {
    // Close all connections
    connectedUsers.forEach((user, userId) => {
        if (user.connection) {
            user.connection.close();
        }
    });

    // Close peer
    if (peer) {
        peer.destroy();
    }

    // Close websocket
    if (websocket && websocket.readyState === WebSocket.OPEN) {
        websocket.close();
    }

    // Redirect back to host page
    window.location.href = "/host";
}