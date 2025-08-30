import init from "../init/id.js"; //Dependency
init.then(() => {
    document.querySelector("#id").onchange = () => {
        if (document.querySelector("#id").value === "") {
            document.querySelector("#id").value = Math.random().toFixed(6).substring(2);
        }
        localStorage.setItem("id", document.querySelector("#id").value);
    };
});