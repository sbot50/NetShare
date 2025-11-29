function isLikelyFullscreen() {
    return (
        window.outerHeight === screen.height &&
        window.outerWidth === screen.width
    );
}

window.addEventListener('resize', () => {
    const disconnectbutton = document.getElementById("disconnect");
    const container = document.querySelector(".container");

    if (window.outerHeight === screen.height && window.outerWidth === screen.width) {
        disconnectbutton.style.display = "none";
        container.classList.add("fullscreen");
    } else {
        disconnectbutton.style.display = "block";
        container.classList.remove("fullscreen");
    }
});