//Just put some basic stuff in every page that I'm too lazy to write out everytime

document.addEventListener("DOMContentLoaded", () => {
    //Put the back links (to go back to main page)
    let path = window.location.pathname.split(/\/+/);


    //So clicked links don't annoying replace your tab 😭😭😭
    document.querySelectorAll('a').forEach(link => {
        if(link.href.replace(/https?:\/+/, "").split(/\/+/)[0] !== window.location.hostname)
            link.setAttribute('target', '_blank');
    });


    //Element stuff
    document.body.insertAdjacentHTML("beforeend", `
        <hr>
        <footer>
            <center><small>Chris Yang ${new Date().getFullYear()}&copy</small></center>
        </footer>
    `);

    if(path[path.length-1] !== "index.html" || path[path.length-1] !== "") { //NO BACK LINKS NEEDED FOR HOME PAGE!!!!! (except the other index.html)
        document.body.querySelector("h1").insertAdjacentHTML("beforebegin", `
            <a href="./" class="back-button"><small>Back</small></a>
        `);
    } else{
        document.body.querySelector("h1").insertAdjacentHTML("beforebegin", `
            <a href=".." class="back-button"><small>Back to chriszengyang.github.io</small></a>
        `);
    }

    //Put a nice horizontal bar for the heck of it after the title
    document.body.querySelector("h1").insertAdjacentHTML("afterend", `
        <em><small>By: Chris Yang</small></em>
        <hr>
    `);
});
