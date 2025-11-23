export default new Promise(resolve => {
    document.addEventListener("DOMContentLoaded", () => {
        document.querySelector(".sidebar > img").addEventListener("click", () => document.querySelector(".sidebar").classList.toggle("open"));
        resolve();
    });
});