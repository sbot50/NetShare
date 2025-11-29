document.addEventListener("DOMContentLoaded", () => {
   document.querySelector(".stream-preview").addEventListener("click", () => {
       document.querySelector(".stream-preview").requestPointerLock();
   });
});