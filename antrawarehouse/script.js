let path = window.location.pathname.split("/");
let currentPath = "/" + path.slice(1, path.length-1).join("/") + "/";
let navLinks = document.querySelectorAll("nav ul li a");

navLinks.forEach(link => {
    if(link.pathname === currentPath) {
        link.parentElement.classList.add("active-link");
    }
});