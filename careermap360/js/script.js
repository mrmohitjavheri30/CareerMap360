const loginForm = document.getElementById("loginForm");

loginForm.addEventListener("submit", function (event) {

    event.preventDefault();

    const username = document.getElementById("username").value.trim();

    if (username === "") {
        alert("Please enter your username.");
        return;
    }

    window.location.href = "pages/home.html";
});