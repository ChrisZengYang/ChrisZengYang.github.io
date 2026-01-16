let host;

if(window.location.protocol === "file:") {
    host = "file://" + "C:/users/chris%20yang/source/repos/ChrisZengYang.github.io/servables-app";
} else{
    host = window.location.protocol + "//" + window.location.hostname + "/servables-app";
}

let user = localStorage.getItem("currentUser");

const nav = `
    <nav>
        <ul class="left">
            <li>
                <a href="${host}"><img class="logo" src="${host}/resources/Servables.png" alt="Servables"></a>
            </li>
            <li style="display: flex; flex-direction: column; justify-content: center; align-items: center;">
                <a>Manage Servers</a>
            </li>
        </ul>
        <ul class="right">
        ${
        user ? `
        <a href="${host}/dashboard/account/">
            <img class="circle" src="${host}/resources/user-64.png" alt="Profile">
            <p style="text-align: center;">${user}</p>
        </a>
        <button class="remove" onclick="logOut();">Log Out</button>
        ` : `
            <button onclick="window.location.href='${host}/sign-up/'">Sign Up</button>
            <button class="accent1" onclick="window.location.href='${host}/log-in/'">Log In</button>`
        }
        </ul>
    </nav>
`;

function logOut() {
    localStorage.removeItem("currentUser");
    window.location.href=host;
}

document.body.insertAdjacentHTML("afterbegin", nav);