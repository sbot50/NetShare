export default new Promise(resolve => {
    document.addEventListener("DOMContentLoaded", () => {
        document.querySelector("#id").value = localStorage.getItem("clientID") || Math.random().toFixed(6).substring(2);
        localStorage.setItem("clientID", document.querySelector("#id").value);
        resolve();
    });
});