let clientId = "sx61yzxsizn8bhjdnvxk7w2bttz3ax";
let token;
let id;
let container = document.getElementById("container");
let strWindowFeatures =
    "location=yes,height=700,width=520,scrollbars=yes,status=yes";
let authenticateUserURL = "https://id.twitch.tv/oauth2/authorize?client_id=sx61yzxsizn8bhjdnvxk7w2bttz3ax&redirect_uri=http://localhost&response_type=token&scope=user:read:follows%20user:read:email";

document.getElementById("auth").addEventListener("click", function () {
    window.open(authenticateUserURL, "_blank", strWindowFeatures);
});

if (document.location.hash != "") {
    token = document.location.hash.split("#access_token=")[1].split("&")[0];

    fetch("https://api.twitch.tv/helix/users", {
        headers: {
            'Client-Id': `${clientId}`,
            'Authorization': `Bearer ${token}`
        },
    })
        .then((response) => {
            return response.json();
        })
        .then((res) => {
            WriteToDb(res.data[0].login)
        })
}

GetToken();

function WriteToDb(login) {
    // const autoId = database.ref("/users/").push().key;
    firebase.database().ref("/users/" + login).set({
        "token": document.location.hash.split("#access_token=")[1].split("&")[0]
    }, (error) => {
        if (error) {
            console.log("Failed to write token to db");
        }
        window.close();
    });
}

function GetToken() {
    let username = document.getElementById("twitchname").value;

    if (username !== "") {
        localStorage.setItem("username", username);
    }
    else {

        if (localStorage.getItem("username") === null) {
            return;
        }

        document.getElementById("twitchname").value = localStorage.getItem("username");
        username = localStorage.getItem("username");
    }

    firebase.database().ref("users").orderByKey().equalTo(username).on("value", snapshot => {
        let obj = snapshot.val();
        GetLivestreams(obj[Object.keys(obj)[0]].token);
    });
}

function GetLivestreams(token) {
    fetch("https://api.twitch.tv/helix/users", {
        headers: {
            'Client-Id': `${clientId}`,
            'Authorization': `Bearer ${token}`
        },
    })
        .then((response) => {
            return response.json();
        })
        .then((res) => {
            id = res.data[0].id;
        })
        .then(() => {
            fetch(`https://api.twitch.tv/helix/streams/followed?user_id=${id}`, {
                headers: {
                    'Client-Id': `${clientId}`,
                    'Authorization': `Bearer ${token}`
                },
            })
                .then((response) => {
                    return response.json();
                })
                .then((res) => {

                    //reset
                    container.innerHTML = "";

                    // console.log(res);
                    // let streamLinks = res.data.map(x => `https://www.twitch.tv/${x.user_login}`);

                    // let container = document.querySelector(".streams");

                    // for (const item of streamLinks) {
                    //     let anchor = document.createElement("a");
                    //     anchor.setAttribute("href", item);
                    //     anchor.innerHTML = item;
                    //     container.appendChild(anchor);
                    // }
                    // Get Streamer's name
                    let liveStreams = res.data.map((stream) => stream.user_name);
                    console.log("response ", res);
                    console.log("livestreams: ", liveStreams);

                    // Get Game's name
                    let gameName = res.data.map((user) => user.game_name);
                    console.log("game name: ", gameName);

                    // Get viewer counter
                    let viewCounter = res.data.map((user) => user.viewer_count);
                    console.log("view count: ", viewCounter);

                    // Get Stream's thumbnail
                    let streamImage = res.data.map((image) => image.thumbnail_url);
                    console.warn("streams image: ", streamImage[0]);
                    console.warn(
                        "streams edit image: ",
                        streamImage[0].replace("{width}x{height}", "80x40")
                    );

                    // Display Stream info
                    // create HTML elements
                    for (let i = 0; i < liveStreams.length; i++) {
                        let firstDiv = document.createElement("div"); // container div for each new user isChildof hardcoded DIV CONTAINER
                        firstDiv.setAttribute("id", "firstDiv");
                        let anchor = document.createElement("a"); // link to redirect to stream
                        anchor.setAttribute("id", "clickable-container");
                        anchor.setAttribute(
                            "href",
                            `http://www.twitch.tv/${liveStreams[i]}`
                        ); // `http://www.twitch.tv/${liveStreams[i]}`
                        anchor.setAttribute("target", "_blank"); // delete if extension runs fine without it
                        let secondDiv = document.createElement("div"); // contains 2 divs (streamer+game names) and view count
                        secondDiv.setAttribute("id", "secondDiv");
                        let thirdDiv = document.createElement("div"); // contains 2 divs with username and game name
                        thirdDiv.setAttribute("id", "thirdDiv");
                        let fourthDiv = document.createElement("div"); // contains viewer counter
                        fourthDiv.setAttribute("id", "fourthDiv");
                        let fifthDiv = document.createElement("div"); // username
                        fifthDiv.setAttribute("id", "fifthDiv");
                        let sixthDiv = document.createElement("div"); // game name
                        sixthDiv.setAttribute("id", "sixthDiv");
                        let displayStreamer = document.createElement("p");
                        displayStreamer.setAttribute("id", "streamer");
                        let displayGame = document.createElement("p");
                        displayGame.setAttribute("id", "game");
                        let displayViewers = document.createElement("p");
                        // RED DOT TO INDICATE ONLINE STATUS
                        displayViewers.setAttribute("id", "viewer");
                        let viewerDot = document.createElement("span");
                        viewerDot.setAttribute("id", "viewer-dot");
                        // IMAGE CODE HERE
                        // ADDED NEW DIV FOR EASE OF USE
                        let insertedDiv = document.createElement("div");
                        insertedDiv.setAttribute("id", "insertedDiv");
                        let insertedDiv2 = document.createElement("div");
                        insertedDiv2.setAttribute("id", "insertedDiv2");
                        let image = document.createElement("img");
                        // replace image dimensions from recevied URL
                        image.src = streamImage[i].replace("{width}x{height}", "100x50");

                        displayViewers.innerHTML = viewCounter[i];
                        displayGame.innerHTML = gameName[i];
                        displayStreamer.innerHTML = liveStreams[i];

                        fourthDiv.appendChild(viewerDot);
                        fourthDiv.appendChild(displayViewers);

                        fifthDiv.appendChild(displayStreamer);
                        sixthDiv.appendChild(displayGame);
                        thirdDiv.appendChild(image);
                        thirdDiv.appendChild(fifthDiv);
                        thirdDiv.appendChild(sixthDiv);
                        insertedDiv2.appendChild(image);
                        insertedDiv.appendChild(insertedDiv2);
                        insertedDiv.appendChild(thirdDiv);
                        secondDiv.appendChild(insertedDiv);
                        secondDiv.appendChild(fourthDiv);
                        anchor.appendChild(secondDiv);
                        firstDiv.appendChild(anchor);
                        container.appendChild(firstDiv);
                    }
                })
        })
}
