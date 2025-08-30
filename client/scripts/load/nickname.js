import init from "../init/nickname.js"; //Dependency
init.then(() => {
    document.querySelector("#nickname").onchange = () => {
        localStorage.setItem("nickname", document.querySelector("#nickname").value);
    };
});