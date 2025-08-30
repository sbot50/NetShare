export default new Promise(resolve => {
    document.addEventListener("DOMContentLoaded", () => {
        document.querySelector("#id").value = localStorage.getItem("id") || Math.random().toFixed(6).substring(2);
        localStorage.setItem("id", document.querySelector("#id").value);
        resolve();
    });
});