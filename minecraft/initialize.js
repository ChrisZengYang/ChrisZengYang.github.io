//Just put some basic stuff in every page that I'm too lazy to write out everytime

document.addEventListener("DOMContentLoaded", () => {
    //So clicked links don't annoying replace your tab 😭😭😭
    document.querySelectorAll('a').forEach(link => {
        link.setAttribute('target', '_blank');
    });


    //Element stuff
    document.body.insertAdjacentHTML("beforeend", `
        <hr>
        <footer>
            <center><small>Chris Yang ${new Date().getFullYear()}&copy</small></center>
        </footer>
    `);

    //Put the back links (to go back to main page)
    document.body.querySelector("h1").insertAdjacentHTML("beforebegin", `
        <a href="./" class="back-button"><small>Back</small></a>
    `);

    //Put a nice horizontal bar for the heck of it after the title
    document.body.querySelector("h1").insertAdjacentHTML("afterend", `
        <em><small>By: Chris Yang</small></em>
        <hr>
    `);
});
