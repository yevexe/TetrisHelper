
let players = { 1: null, 2: null };
let lastLeaderboardNum = 0;
let latestLeaderboardRequest = 0;
//Same order as the stats in COMPARISON_STATS
const LEADERBOARD_COLUMNS = ["TopTime", "WorstTime", "DaysPlayed", "GamesPlayed", "AvgTime"];
const MODE_BUTTON_LABELS = {
    sprint:   { "40L/10L": "40L", "20L/18L": "20L", "100L": "100L", "1000L": "1000L" },
    cheese:   { "40L/10L": "10L", "20L/18L": "18L", "100L": "100L" },
    survival: { "40L/10L": "SURVIVAL" },
    ultra:    { "40L/10L": "ULTRA" }
};
const DAYS_AND_GAMES = [{ label: "Days Played", key: "days", higherIsBetter: true }, { label: "Games Played", key: "games", higherIsBetter: true }];
//Sprint and Cheese are timed races, so the lowest time is best (min is the top time)
const RACE_STATS = [
    { label: "Top Time", key: "min", unit: "s" },
    { label: "Worst Time", key: "max", unit: "s" },
    ...DAYS_AND_GAMES,
    { label: "Average Time", key: "avg", unit: "s" }
];
const COMPARISON_STATS = {
    sprint: RACE_STATS,
    cheese: RACE_STATS,
    //Survival is how long the player lasted, so the highest time is best (max is the top time)
    survival: [
        { label: "Top Time", key: "max", unit: "s", higherIsBetter: true },
        { label: "Worst Time", key: "min", unit: "s", higherIsBetter: true },
        ...DAYS_AND_GAMES,
        { label: "Average Time", key: "avg", unit: "s", higherIsBetter: true }
    ],
    //Ultra is a points score, not a time, so the highest score is best (max is the top score)
    ultra: [
        { label: "Top Score", key: "max", higherIsBetter: true },
        { label: "Worst Score", key: "min", higherIsBetter: true },
        ...DAYS_AND_GAMES,
        { label: "Average Score", key: "avg", higherIsBetter: true, round: true }
    ]
};
console.log("Connecting to main server.....");

//CONNECTING TO THE SERVER
LoadLeaderboard().then(loaded => {
    if(!loaded && confirm("Connection to the server failed. Please try again later. \n\nWould you like to refresh the page?\n\n (If you choose not you, you will lose leaderboard functionality)")){
        window.location.reload();
    }
});

  //regardless of if the user can connect to the server or not, they should still be able to use the website
  document.querySelectorAll(".submitButton").forEach(submitButton => submitButton.onclick = (event) => (event.preventDefault(), SubmitButtonClick(submitButton)));

async function DeleteEntry(username) {
  const res = await fetch(
    `/api/backendProxy?endpoint=leaderboard/${username.toLowerCase()}`,
    { method: 'DELETE' }
  );

  if (res.status === 200) {
    console.log("Deleted successfully");
    window.location.reload();
  } else {
    console.error(`Failed: ${res.status}`);
  }
}

function createDeleteBtn(username) {
    let td = document.createElement("td");
    let btn = document.createElement("button");
    btn.innerHTML = "×";
    btn.classList.add("delete-btn");
    btn.onclick = async function(e) {
        e.stopPropagation();
        if (confirm("Delete " + username + " from the leaderboard?")) {
            await DeleteEntry(username);
        }
    };
    td.appendChild(btn);
    return td;
}

//Fetches every player in one request, so a player that can't be looked up by name can't drop out of the table
//Always shows what the highlighted tab and button say, whichever one of them was just clicked
async function LoadLeaderboard(){
    const requestId = ++latestLeaderboardRequest;
    const mode = document.querySelector(".ld-GameModeName.activeTableGMToggleOn").textContent.toLowerCase();
    const type = SelectedLeaderboardButton().id;
    document.getElementById("daBody").innerHTML = "";
    SetLeaderboardHeaders(mode);
    try {
        const res = await fetch(`/api/backendProxy?endpoint=leaderboard`);
        if(!res.ok) throw new Error(`Status code: ${res.status}`);
        const data = await res.json();
        //a slower response from an earlier click should not replace what the user just asked for
        if(requestId === latestLeaderboardRequest){
            console.log('Leaderboard:', data);
            UpdateLeaderboardWithDatabaseInformation(data, mode, type);
        }
        return true;
    } catch(err) {
        console.error('Error loading leaderboard:', err);
        return false;
    }
}

//Only changes the header's text, so the sorting arrow inside it stays
function SetLeaderboardHeaders(mode){
    COMPARISON_STATS[mode].forEach((stat, i) => {
        document.querySelector(`th#${LEADERBOARD_COLUMNS[i]}`).firstChild.nodeValue = stat.label.replace("Average", "Avg.") + (stat.unit ? ` (${stat.unit})` : "");
    });
}

//survival and ultra only have one type, sprint and cheese have to match the selected one
function FindGame(games, mode, type){
    return games.find(game => typeof game !== "string" && (mode === "survival" || mode === "ultra" || game.Type === type));
}

function UpdateLeaderboardWithDatabaseInformation(data, mode, type){
    lastLeaderboardNum = 0;

    for (const player of data){
        lastLeaderboardNum++;
        const name = player.sprint.find(game => game.Type === "40L/10L")?.name || player.username.trim();
        const game = FindGame(player[mode], mode, type);
        document.getElementById("daBody").appendChild(CreateLeaderboardRow(lastLeaderboardNum, name, game, mode));
    }
}

function CreateLeaderboardRow(num, playerName, game, mode){
    let newEntry = document.createElement("tr");
    newEntry.classList.add("leaderboard-entry");

    let number = document.createElement("td");
    number.innerHTML = num;
    number.id = "num";
    newEntry.appendChild(number);

    let name = document.createElement("td");
    name.innerHTML = playerName;
    name.id = "name";
    newEntry.appendChild(name);

    COMPARISON_STATS[mode].forEach((stat, i) => {
        const value = game?.[stat.key];
        if(value !== undefined && value !== 0){
            let cell = document.createElement("td");
            cell.innerHTML = `${stat.round ? Math.round(value) : value}`;
            cell.id = LEADERBOARD_COLUMNS[i];
            newEntry.appendChild(cell);
        }
    });
    newEntry.appendChild(createDeleteBtn(playerName));
    return newEntry;
}

[["username", 1], ["username1", 2]].forEach(([inputId, slot]) => {
    document.getElementById(inputId).addEventListener('input', function() {
        if (this.value.trim() === '') {
            players[slot] = null;
            RenderComparison();
        }
    });
});

async function SubmitButtonClick(submitButton){
    const slot = submitButton.id === "submitButton1" ? 2 : 1;
    const username = document.getElementById(slot === 2 ? "username1" : "username").value.trim();
    console.log(username);

    if(username === ""){
        alert("You Wrote nothing in the Input!");
        return;
    }

    players[slot] = null;
    RenderComparison();

    //What game you want 1 = sprint, 3 = cheese, 4 = survival, 5 = ultra, 7 = 20TSD, 8 = PC Mode
    const sprint = await ObtainGameInformation(username, 1);
    if(!sprint[0] || sprint[0].error){
        alert("Your input returned nothing! \n\nThis search should NOT be case sensitive, but maybe try retyping it with Case in mind!");
        return;
    }
    const cheese = await ObtainGameInformation(username, 3);
    const survival = await ObtainGameInformation(username, 4);
    const ultra = await ObtainGameInformation(username, 5);

    const player = { name: sprint.find(game => game.Type === "40L/10L")?.name || username, sprint, cheese, survival, ultra };
    players[slot] = player;
    RenderComparison();

    if(Array.from(document.querySelectorAll("#daBody #name")).some(name => name.innerHTML === player.name)){
        alert("This user has already been added to the leaderboard, please check the leaderboard for more information.");
    }
    await PostToLeaderboardDatabase(player, username);
    await LoadLeaderboard();
}

//functions for using the buttons on the leaderboard
document.querySelectorAll(".ld-GameModeName").forEach(modeTab => modeTab.onclick = () => GameModeClick(modeTab))

function GameModeClick(modeTab){
    document.querySelectorAll(".ld-GameModeName").forEach(btn => btn.classList.remove("activeTableGMToggleOn"));
    modeTab.classList.add("activeTableGMToggleOn");
    SetModeButtons(document.querySelector(".buttonGroupContainer.leaderboard"), modeTab.innerHTML.toLowerCase());
    LoadLeaderboard();
}

//Shows only the buttons a mode has, a button this mode doesn't have can't stay selected
function SetModeButtons(buttonGroup, mode){
    const labels = MODE_BUTTON_LABELS[mode];
    for(const button of buttonGroup.querySelectorAll("button")) {
        if(labels[button.id]) button.innerHTML = labels[button.id];
        button.style.opacity = labels[button.id] ? "1" : "0";
        button.style.pointerEvents = labels[button.id] ? "auto" : "none";
    }

    const selected = buttonGroup.querySelector(".buttonActivatedToggleOn");
    if(!labels[selected.id]){
        selected.classList.remove("buttonActivatedToggleOn");
        buttonGroup.querySelector(`[id="40L/10L"]`).classList.add("buttonActivatedToggleOn");
    }
}

let buttons = document.querySelector(".buttonGroupContainer.leaderboard");
        for(const button of buttons.querySelectorAll("button")) {
            button.onclick = () => GameTypeClick(button, buttons.querySelectorAll("button"))
        }

function SelectedLeaderboardButton(){
    return document.querySelector(".buttonGroupContainer.leaderboard .buttonActivatedToggleOn");
}

function GameTypeClick(typeButton, allButtons){
    allButtons.forEach(btn => btn.classList.remove("buttonActivatedToggleOn"));
    typeButton.classList.add("buttonActivatedToggleOn");
    LoadLeaderboard();
}
async function PostToLeaderboardDatabase(player, username){
    const body = JSON.stringify({
        username: username.toLowerCase(),
        sprint:   player.sprint,
        cheese:   player.cheese,
        survival: player.survival,
        ultra:    player.ultra
    });

    const postRes = await fetch('/api/backendProxy?endpoint=leaderboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body
    }).catch(err => console.error('Error posting leaderboard:', err));

    // If user already exists, update their stats instead
    if (postRes && postRes.status === 400) {
        await fetch(`/api/backendProxy?endpoint=leaderboard/${username.toLowerCase()}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body
        }).catch(err => console.error('Error updating leaderboard:', err));
    }
}
//functions for the comparison window
document.querySelectorAll(".cmp-GameModeName").forEach(modeTab => modeTab.onclick = () => {
    document.querySelectorAll(".cmp-GameModeName").forEach(btn => btn.classList.remove("activeTableGMToggleOn"));
    modeTab.classList.add("activeTableGMToggleOn");
    SetModeButtons(document.querySelector(".buttonGroupContainer.comparison"), modeTab.innerHTML.toLowerCase());
    RenderComparison();
});

document.querySelectorAll(".buttonGroupContainer.comparison button").forEach((button, _, allButtons) => button.onclick = () => {
    allButtons.forEach(btn => btn.classList.remove("buttonActivatedToggleOn"));
    button.classList.add("buttonActivatedToggleOn");
    RenderComparison();
});

function HasPlayed(game){
    return !!game && !game.error && game.games > 0;
}

function RenderComparison(){
    const mode = document.querySelector(".cmp-GameModeName.activeTableGMToggleOn").textContent.toLowerCase();
    const type = document.querySelector(".buttonGroupContainer.comparison .buttonActivatedToggleOn").id;
    const games = { 1: players[1] && FindGame(players[1][mode], mode, type), 2: players[2] && FindGame(players[2][mode], mode, type) };

    document.getElementById("comparisonResults").hidden = !players[1] && !players[2];

    for(const [slot, otherSlot] of [[1, 2], [2, 1]]){
        const side = document.getElementById("playerStats" + slot);
        side.innerHTML = "";
        if(!players[slot]) continue;

        const played = HasPlayed(games[slot]);
        side.classList.toggle("noModeData", !played);

        const name = document.createElement("h4");
        name.textContent = players[slot].name;
        side.appendChild(name);

        for(const stat of COMPARISON_STATS[mode]){
            const row = document.createElement("div");
            row.classList.add("statRow");
            const label = document.createElement("b");
            label.textContent = stat.label + ":";
            row.appendChild(label);

            const value = document.createElement("span");
            if(played){
                const mine = games[slot][stat.key];
                value.textContent = `${stat.round ? Math.round(mine) : mine}${stat.unit || ""}`;

                //whoever played a mode the other player never touched wins every stat in it
                const theirs = HasPlayed(games[otherSlot]) ? games[otherSlot][stat.key] : null;
                const wins = players[otherSlot] && (theirs === null || (stat.higherIsBetter ? mine > theirs : mine < theirs));
                value.classList.toggle("scoreGreenHigh", !!wins);
            }
            row.appendChild(value);
            side.appendChild(row);
        }
    }
}

async function ObtainGameInformation(username, game){
     /*
        ObtainGameInformation(username, game) will be a function that returns the PBs for each mode of that game
        //Programmer uses this function by inputting the username and the game mode 1 = sprint, 3 = cheese, 4 = survival, 5 = ultra, 7 = 20TSD, 8 = PC Mode
        //Depending on the gamemode the fetch request will run multiple or one time to obtain every piece of information in that gamemode (see above for each mode of each game).
        //Result will return an Array/object of the information divided by each game.

        each mode of each game:
         Sprint = 1 = 40L/10L, 2 = 20L/18L, 3 = 100L, 4 = 1000L
         Cheese = 1 = 40L/10L, 2 = 20L/18L, 3 = 100L, 4 = 1000L
         survival = 1 = 40L/10L
         ultra = 1 = 40L/10L
         20TSD = 1 = 40L/10L
         PC Mode = 1 = 40L/10L

         API CALL THAT NEEDS TO BE USED = GET https://jstris.jezevec10.com/api/u/<username>/records/<game>?mode=<mode>rule=<rule>
     */


        //creating the final Array
        let ResultArray = [];
        //creating Name of the game string
        let Name = null;

        //Switch case to check which game it is
        switch(game){    

            //Both Sprint and Cheese use the same code
            case 1:
                //If the game = 1, then the mode we are looking at is Sprint
                Name = "Sprint";
            case 3:
                //If the game has already been initalized as Sprint, then case 1 already ran so dont change the name to cheese, other than that, the case 3 has only ran meaning the game mode we are looking at is cheese.
                (Name !== "Sprint") ? Name = "Cheese" : Name = "Sprint";

                //Store all async promises for Promise.all() to wait for them to finish later
                let promises = [];

                //1 = 40L/10L, 2 = 20L/18L, 3 = 100L, 4 = 1000L
                for (let d = 1; d <= 4; d++){
                    let ModeInTheMode = null;
                    switch(d){
                        case 1:
                            ModeInTheMode = "40L/10L";
                            break;
                        case 2:
                            ModeInTheMode = "20L/18L";
                            break;
                        case 3:
                            ModeInTheMode = "100L";
                            break;
                        case 4:
                            ModeInTheMode = "1000L";
                            break;
                        default:
                            break;
                    }

                   let promise = fetch(`/api/proxy?endpoint=${username}/records/${game}?mode=${d}&best`)
                    .then(response => response.json())
                    .then(result => {

                        result.GameMode = Name;
                        result.Type = ModeInTheMode;

                        ResultArray.push(result);
                    })
                    .catch(error => console.log('error', error));

                    //push this specific fetch call into current promises
                    promises.push(promise);
                }

                //Wait until each promise is finished
                await Promise.all(promises);
                //once all promises finished then finish the case code.
                break;

            //Everything else other than sprint and cheese only use mode 1.
            //4 = survival, 5 = ultra, 7 = 20TSD, 8 = PC Mode
            default:
  
                switch(game){
                    case 4:
                        Name = "survival";
                        break;
                    case 5:
                        Name = "ultra";
                        break;
                    case 7:
                        Name = "20TSD";
                        break;
                    case 8:
                        Name = "PC Mode";
                        break;
                }
                try{
                    const singleApiCall = await fetch(`/api/proxy?endpoint=${username}/records/${game}?mode=1&best`)
                    let response = await singleApiCall.json();


                    response.GameMode = Name;
                    ResultArray.push(response);



                }catch(error){console.log('error', error);}

                break;

        }

    //Return the result array (every information has been obtained and sorted)
    return ResultArray;
        
}

let HowManyTimesClicked = 0;
let LastModeClicked = null;

document.querySelectorAll("th").forEach(header => (header.id !== "num" && header.id !== "deleteCol") ? header.onclick = () => LeaderBoardTableEntrySort(header) : null);
function LeaderBoardTableEntrySort(header){

    for (const ASC of document.querySelectorAll("#ASC")){
        ASC.remove();
    }
    for (const DSC of document.querySelectorAll("#DSC")){
        DSC.remove();
    }

   for (const b of document.querySelectorAll("th")){
    b.style.textDecoration = "none";
   }
    header.style.textDecoration = "underline dotted";
    if (LastModeClicked !== header.id) {
        HowManyTimesClicked = 0;
        LastModeClicked = header.id;
    }
    HowManyTimesClicked++;
    if(HowManyTimesClicked % 2 === 1){
        let ASC = document.createElement("div");
        ASC.id = "ASC";
        ASC.innerHTML = "▲";
        header.appendChild(ASC);

        ActuallySort(header.id,"ASC");
    }
    else{
        let DSC = document.createElement("div");
        DSC.innerHTML = "▼";
        DSC.id = "DSC";
        header.appendChild(DSC);

        ActuallySort(header.id,"DESC");
    }
}

function ActuallySort(Name, type) {
    let rows = Array.from(document.querySelectorAll(".leaderboard-entry"));

    switch (type) {
        case "ASC":
            rows.sort((a, b) => {
                let textA = a.querySelector("#" + Name)?.innerHTML.trim() || "";
                let textB = b.querySelector("#" + Name)?.innerHTML.trim() || "";
                return textA.localeCompare(textB, undefined, { numeric: true });
            });
            break;

        case "DESC":
            rows.sort((a, b) => {
                let textA = a.querySelector("#" + Name)?.innerHTML.trim() || "";
                let textB = b.querySelector("#" + Name)?.innerHTML.trim() || "";
                return textB.localeCompare(textA, undefined, { numeric: true });
            });
            break;
    }

    let parent = document.getElementById("daBody");
    parent.innerHTML = "";
    rows.forEach((row, i) => {
        row.firstElementChild.innerHTML = i + 1;
        parent.appendChild(row);
    });
}

async function RefreshLeaderboard() {
    const refreshLink = document.getElementById('refreshLink');
    refreshLink.textContent = 'Refreshing...';
    refreshLink.style.pointerEvents = 'none';

    const allUsernames = Array.from(document.querySelectorAll('#name'))
        .map(el => el.innerHTML.trim())
        .filter(name => name !== 'Name' && name !== '');

    for (const username of allUsernames) {
        const sprint   = await ObtainGameInformation(username, 1);
        const cheese   = await ObtainGameInformation(username, 3);
        const survival = await ObtainGameInformation(username, 4);
        const ultra    = await ObtainGameInformation(username, 5);

        if (!sprint[0].error) {
            await fetch(`/api/backendProxy?endpoint=leaderboard/${username.toLowerCase()}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sprint, cheese, survival, ultra })
            }).catch(err => console.error('Error refreshing ' + username + ':', err));
        }
    }

    // Re-render leaderboard from Turso
    await LoadLeaderboard();

    refreshLink.textContent = 'Refresh';
    refreshLink.style.pointerEvents = 'auto';
}






