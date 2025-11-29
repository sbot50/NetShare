export default new Promise(resolve => {
    document.addEventListener("DOMContentLoaded", () => {
        document.querySelector("#nickname").value = localStorage.getItem("nickname") || "";
        resolve();
    });
});