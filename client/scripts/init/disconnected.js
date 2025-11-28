import { Notification, NotifPlacement, NotifType } from "../../../res/util/notif.js";

document.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);
    const disconnected = params.get("disconnected");
    const nohost = params.get("nohost");
    const proper = params.get("proper");
    const stopped = params.get("stopped");
    if (disconnected) {
        let notif;
        if (proper === "true" && stopped === "true") notif = new Notification("the Host has stopped streaming", NotifType.INFO, 5, NotifPlacement.BOTTOM_RIGHT);
        else if (proper === "true") notif = new Notification("The host has disconnected you", NotifType.INFO, 5, NotifPlacement.BOTTOM_RIGHT);
        else notif = new Notification("Connection with the host has been lost", NotifType.ERROR, 5, NotifPlacement.TOP_MIDDLE);
        notif.show();
    } else if (nohost) {
        let notif = new Notification("No host streaming on this ID", NotifType.INFO, 5, NotifPlacement.BOTTOM_RIGHT);
        notif.show();
    }
    const newUrl = window.location.pathname;
    window.history.replaceState(null, "", newUrl);
})