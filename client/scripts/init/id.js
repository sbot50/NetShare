document.addEventListener("DOMContentLoaded", () => {
    document.querySelector("#id").oninput = () => {
        if (document.querySelector("#id").value === "") document.querySelector("#connect").classList.add("disabled");
        else document.querySelector("#connect").classList.remove("disabled");
        localStorage.setItem("clientID", document.querySelector("#id").value);
    };
    document.querySelector("#id").value = localStorage.getItem("clientID");
    if (document.querySelector("#id").value === "") document.querySelector("#connect").classList.add("disabled");
})