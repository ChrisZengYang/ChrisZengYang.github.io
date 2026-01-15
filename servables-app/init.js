let host;

if(window.location.protocol === "file:") {
    host = "file://" + "C:/users/chris%20yang/source/repos/ChrisZengYang.github.io/servables%20app";
} else{
    host = window.location.hostname + "/servables-app/";
}

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
            <button onclick="window.location.href='${host}/sign-up/'">Sign Up</button>
            <button class="accent1" onclick="window.location.href='${host}/log-in/'">Log In</button>
        </ul>
    </nav>
`;

document.body.insertAdjacentHTML("afterbegin", nav);