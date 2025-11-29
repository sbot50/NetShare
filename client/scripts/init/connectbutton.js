document.addEventListener("DOMContentLoaded", async () => {
    document.querySelector("#connect").addEventListener("click", () => {
        if (document.querySelector("#connect").classList.contains("disabled")) return;
        location.href = "/client/connect";
    });
});