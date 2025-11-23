//Highlight current page in navigation bar
let path = window.location.pathname.split("/");
let currentPath = "/" + path.slice(1, path.length-1).join("/") + "/";
let navLinks = document.querySelectorAll("nav ul li a");

navLinks.forEach(link => {
    if(link.pathname === currentPath) {
        link.parentElement.classList.add("active-link");
    }
});


//Add cool fade-in effect to landing page headers
function fadeInOnScroll() {
    const elements = document.querySelectorAll('.product-card, h1, p');
    elements.forEach(element => {
        const rect = element.getBoundingClientRect();
        
        if (window.scrollY + window.innerHeight > rect.top + window.scrollY) {
            element.style.opacity = "1";
            element.style.animation = 'fadeIn 1s ease forwards';
        } else {
            element.style.opacity = "0";
            element.style.animation = 'none';
        }
    });
}

window.addEventListener('DOMContentLoaded', fadeInOnScroll); //First initial scroll check
window.addEventListener('scroll', fadeInOnScroll);
console.log(3);