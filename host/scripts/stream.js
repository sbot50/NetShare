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
const quality = localStorage.getItem("quality") || "1080";

let connectedUsers = new Map();

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("id").textContent = "ID: " + id;

    let websocket = new WebSocket("ws://127.0.0.1:6731");
    websocket.onerror = errorNotif;

    const peer = new Peer("fireshare-" + id);

    document.querySelector("#stop").addEventListener("click", () => stopStreaming(peer, websocket));
    initializeStreaming(peer, websocket);
});

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
        client.on("data", (data) => handleClientData(websocket, client, data));
        client.on("close", () => handleClientClose(websocket, client));
        startHeartbeat(websocket, client);
    });
}

function handleClientClose(websocket, client) {
    removeUser(client.label);
}

function handleClientData(websocket, client, data) {
    if (data.rtype === "connect") addUser(client, client.label, data.nickname);
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

function addUser(connection, userId, nickname) {
    nickname = nickname || "Anonymous";
    connectedUsers.set(userId, { nickname,  connection, properDisconnect: false });
    updateUsersList();
}

function handleDisconnect(websocket, client) {
    connectedUsers.get(client.label).properDisconnect = true;
    removeUser(client.label);
}

function removeUser(userId) {
    if (connectedUsers.has(userId)) {
        clearInterval(connectedUsers.get(userId).interval);
        clearTimeout(connectedUsers.get(userId).timeout);
        if (connectedUsers.get(userId).properDisconnect) {
            const notif = new Notification("User " + connectedUsers.get(userId).nickname + " disconnected", NotifType.INFO, 5, NotifPlacement.BOTTOM_RIGHT);
            notif.show();
        } else {
            const notif = new Notification("Connection with user " + connectedUsers.get(userId).nickname + " lost", NotifType.ERROR, 5, NotifPlacement.TOP_MIDDLE);
            notif.show();
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