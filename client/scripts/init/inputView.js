export default new Promise(resolve => {
    document.addEventListener("DOMContentLoaded", () => {
        document.querySelector(".sidebar > .toggle").addEventListener("click", () => document.querySelector(".sidebar").classList.toggle("open"));
        resolve();
    });
});