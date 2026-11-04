
let player1 = [];
let player2 = [];

let comparison = false;
let lastLeaderboardNum = 0;
let latestLeaderboardRequest = 0;
const LEADERBOARD_COLUMNS = [["min", "TopTime"], ["max", "WorstTime"], ["days", "DaysPlayed"], ["games", "GamesPlayed"], ["avg", "AvgTime"]];
const LEADERBOARD_BUTTON_LABELS = {
    sprint:   { "40L/10L": "40L", "20L/18L": "20L", "100L": "100L", "1000L": "1000L" },
    cheese:   { "40L/10L": "10L", "20L/18L": "18L", "100L": "100L" },
    survival: { "40L/10L": "SURVIVAL" },
    ultra:    { "40L/10L": "ULTRA" }
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

function UpdateLeaderboardWithDatabaseInformation(data, mode, type){
    lastLeaderboardNum = 0;

    for (const player of data){
        lastLeaderboardNum++;
        const name = player.sprint.find(game => game.Type === "40L/10L")?.name || player.username.trim();
        //survival and ultra only have one type, sprint and cheese have to match the selected one
        const game = player[mode].find(game => typeof game !== "string" && (mode === "survival" || mode === "ultra" || game.Type === type));
        document.getElementById("daBody").appendChild(CreateLeaderboardRow(lastLeaderboardNum, name, game));
    }
}

function CreateLeaderboardRow(num, playerName, game){
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

    for(const [key, column] of LEADERBOARD_COLUMNS){
        if(game?.[key] !== undefined && game[key] !== 0){
            let cell = document.createElement("td");
            cell.innerHTML = `${game[key]}`;
            cell.id = column;
            newEntry.appendChild(cell);
        }
    }
    newEntry.appendChild(createDeleteBtn(playerName));
    return newEntry;
}

function ClearResultFields(type, player){
    let resultPara = document.querySelector(`.resultPara.${type}${player}`);
    for(const field of ["TopTime", "WorstTime", "DaysPlayed", "GamesPlayed", "AverageTime"]){
        resultPara.querySelector(`#${field}${player}`).innerHTML = ` `;
    }
}

[["username", 1], ["username1", 2]].forEach(([inputId, player]) => {
    document.getElementById(inputId).addEventListener('input', function() {
        if (this.value.trim() === '') {
            ClearResultFields("sprint", player);
            RemoveComparison();
        }
    });
});
async function SubmitButtonClick(submitButton){
                /*
                DANIEL YURSKIY 07/29/25
                    TWO PLAYER COMPARISON UPDATE:
                        1. CHECK IF THE PLAYER 1 THING IS EMPTY/ HAS AN OUTPUT
                         A. IF IT HAS AN OUTPUT THAT MEANS THE USER IS CHECKING PLAYER 2, SO CHECK PLAYER 2
                         B. IF IT HAS NO OUTPUT THAT MEANS WE ARE ALLOWED TO ASSUME THE USER WANTS TO CHECK PLAYER 1.
                        2. IF THERE IS INPUTS ON BOTH AND OUTPUTS ON NEITHER THAN CHECK PLAYER 1.
                        3. IF THERE IS NO INPUT ON PLAYER 1 AND THERE IS ONE ON PLAYER 2, THEN JUST RUN PLAYER 2.
                        
                */

                //Getting the username from the input in the main page
                let username;
                let whereToOutput;
                RemoveComparison();

                if(submitButton.id === "submitButton1"){
                    username = document.getElementById("username1").value.trim();
                    whereToOutput = 2;
                    player2 = [];
                    //check if there is aleady an output for player 1, if there is then start comparing player 2 with them.
                    //take sprint1, the first sprint output (this 'should' always be correct as everyone would have played sprint in their lives), 
                    // if there's no hiddenToggleOn then that means there is no output for player 1.
                    if((!document.querySelector(".sprint1").classList.contains("hiddenToggleOn")) || ((!document.querySelector(".sprint2").classList.contains("hiddenToggleOn")) && (!document.querySelector(".sprint1").classList.contains("hiddenToggleOn")))){
                        console.log("STARTING COMPARISON");
                        //here we will increment a variable that will be used for after the data is obtained to compare the two players.
                        comparison = true;

                    }
                }
                else{
                    username = document.getElementById("username").value.trim();
                    whereToOutput = 1;
                    player1 = [];

                }
                    document.querySelectorAll(".para"+whereToOutput).forEach(para => {  
                        para.innerHTML = "";
                        para.classList.remove("scoreGreenHigh");
                    });

                console.log(username);

                //Only run the code if the username is a valid input and if there actually was any info
                if(username !== ""){
                   let type;
                  
                    //What game you want 1 = sprint, 3 = cheese, 4 = survival, 5 = ultra, 7 = 20TSD, 8 = PC Mode
                    const SprintInfo = await ObtainGameInformation(username, 1);
                    type = "sprint";
                    SprintInfo.push(type);
                    AddInfoToFrontend(SprintInfo, whereToOutput,type);
                    (!(SprintInfo[0].error))?document.getElementById("sprint"+whereToOutput).classList.remove("hiddenToggleOn") :alert("Your input returned nothing! \n\nThis search should NOT be case sensitive, but maybe try retyping it with Case in mind!");

                    const CheeseInfo = await ObtainGameInformation(username, 3);
                    type = "cheese"
                    CheeseInfo.push(type);
                    AddInfoToFrontend(CheeseInfo, whereToOutput,type);

                    const SurvivalInfo = await ObtainGameInformation(username, 4);
                    type = "surv"
                    SurvivalInfo.push(type);
                    AddInfoToFrontend(SurvivalInfo, whereToOutput,type);

                    const UltraInfo = await ObtainGameInformation(username, 5);
                    type = "ultra"
                    UltraInfo.push(type);
                    AddInfoToFrontend(UltraInfo, whereToOutput,type);


                    if(!(SprintInfo[0].error)){
                        const player = whereToOutput === 1 ? player1 : player2;
                        player.push(SprintInfo, CheeseInfo, SurvivalInfo, UltraInfo);
                        await PostToLeaderboardDatabase(player, username);
                    }

                    if(comparison){
                        // Only run comparison if both player1 and player2 have 4 game arrays (Sprint, Cheese, Survival, Ultra)
                        if (player1.length >= 4 && player2.length >= 4) {
                            let allResults = document.querySelectorAll(`.datadump.result`);
                            for(const result of allResults){
                                if(!result.classList.contains("hiddenToggleOn")){   
                                    type = result.querySelector("h4").textContent.toLowerCase();
                                }
                            }
                            Comparison(player1, player2, type);
                        } else {
                            // Wait for both players to be loaded before comparing
                            console.log("Waiting for both players' data before running comparison...");
                        }
                    }
                }
                else{
                    alert("You Wrote nothing in the Input!");
                }
}

//functions for using the buttons on the leaderboard
document.querySelectorAll(".ld-GameModeName").forEach(modeTab => modeTab.onclick = () => GameModeClick(modeTab))

function GameModeClick(modeTab){
    document.querySelectorAll(".ld-GameModeName").forEach(btn => btn.classList.remove("activeTableGMToggleOn"));
    modeTab.classList.add("activeTableGMToggleOn");

    const labels = LEADERBOARD_BUTTON_LABELS[modeTab.innerHTML.toLowerCase()];
    for(const button of buttons.querySelectorAll("button")) {
        if(labels[button.id]) button.innerHTML = labels[button.id];
        button.style.opacity = labels[button.id] ? "1" : "0";
        button.style.pointerEvents = labels[button.id] ? "auto" : "none";
    }

    //a button this mode doesn't have can't stay selected
    if(!labels[SelectedLeaderboardButton().id]){
        SelectedLeaderboardButton().classList.remove("buttonActivatedToggleOn");
        buttons.querySelector(`[id="40L/10L"]`).classList.add("buttonActivatedToggleOn");
    }
    LoadLeaderboard();
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
        sprint:   player[0],
        cheese:   player[1],
        survival: player[2],
        ultra:    player[3]
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
function Comparison(player1, player2, GameMode){
    console.log("RUNNING COMPARISON")
    //if there is no output for either player then just return
    if(!player1 || !player2) return;

    /*
        Comparison(player1, player2, GameMode) will be a function that compares the two players and outputs the results.
        GameMode = the GameMode of game we are comparing (sprint, cheese, survival, ultra, 20TSD, PC Mode)
    */


    let comparisonPlayer1;
    let comparisonPlayer2;

    //find the GameMode we are looking for in player 1 and player 2,
    //they could maybe be in differnet indexes??????
    for(const game of player1){
        if(game.includes(GameMode)){
            comparisonPlayer1 = game;
        }
    }

    for (const game of player2){
        if(game.includes(GameMode)){
            comparisonPlayer2 = game;
        }
    }


    //now we need to check which of the buttons are highlighted
    //get all buttons from the divider of that GameMode
    let buttons = document.getElementById(`${GameMode}1`).querySelectorAll('button');
    let type; 
    buttons.forEach(button => {
        if(button.classList.contains("buttonActivatedToggleOn")){ 
           type = button.id;
        }
    });


    //Search through each comparisonPlayer to find the specific type we are looking for
    for(const game of comparisonPlayer1){
        if(game.Type === type){
            comparisonPlayer1 = game;
        }
    }

    for (const game of comparisonPlayer2){
        if(game.Type === type){
            comparisonPlayer2 = game;
        }
    }   


    //how we will calculate the difference:
    //just do player1 - player2,
    //if the number is negative then player 2 is better,
    //and depending on how negative the number is, that will be shade of green
    //0-2 seconds is small gap, 5-8 seconds is medium gap, anything bigger is big gap.

    for(const [key, field, moreIsBetter] of [
        ["min", "TopTime", false],
        ["max", "WorstTime", false],
        ["days", "DaysPlayed", true],
        ["games", "GamesPlayed", true],
        ["avg", "AverageTime", false]
    ]){
        let difference = comparisonPlayer1[key] - comparisonPlayer2[key];
        //first check if they are negative, if negative then winner is player 1, unless more is better
        let winner = ((difference < 0) === moreIsBetter) ? "2" : "1";

        //now we know who is the winner, all we need is to find out how big of a gap.
        let wheretoOut = document.querySelector(`.resultPara.${GameMode}${winner}`);
        let winnerEl = wheretoOut.querySelector("#"+field+winner);
        if (Math.abs(difference) > 0) winnerEl.classList.add("scoreGreenHigh");
    }

    
    


    
}

function RemoveComparison(){
    //if the comparison is true, then we need to remove the comparison

        document.querySelectorAll(".resultPara").forEach(para => {
            para.querySelectorAll("span").forEach(span => span.classList.remove("scoreGreenLow", "scoreGreenMedium", "scoreGreenHigh"));
        });

        
    
}

function AddInfoToFrontend(dataArray, whereToOutput,type){

    if(!(dataArray[0].error)){


        var forty;
        var twenty;
        var hundred;
        var thousand;

        for(const game of dataArray){
            if (typeof game === "string") continue; // Skip the string element

                if(game.GameMode === "Sprint" || game.GameMode === "Cheese"){

                    switch(game.Type){
                        case "40L/10L":
                            forty = game;
                            break;
                        case "20L/18L":
                            twenty = game;
                            break;
                        case "100L":
                            hundred = game;
                            break;
                        case "1000L":
                            thousand = game;
                            break;
                    }

                }
                else{
                    forty = game;
                }
                

        }

        if (forty) ACTUALLYPushToFrontEnd(forty, whereToOutput,type,false);
        let wheretoNotOutput = whereToOutput === 1 ? "2" : "1";
        
        const gamesByType = { "40L/10L": forty, "20L/18L": twenty, "100L": hundred, "1000L": thousand };
        let buttons = document.querySelector(`.buttonGroupContainer.${type}${whereToOutput}`).querySelectorAll('button');
        for (const button of buttons){

            button.onclick = function(){
                ClearResultFields(type, whereToOutput);
                ClearResultFields(type, wheretoNotOutput);

                for(const output of [whereToOutput, wheretoNotOutput]){
                    document.querySelector(`.buttonGroupContainer.${type}${output}`).querySelectorAll('button').forEach(button => button.classList.remove("buttonActivatedToggleOn"));
                }

                for(const output of [whereToOutput, wheretoNotOutput]){
                    document.querySelector(`.buttonGroupContainer.${type}${output}`).querySelectorAll(`[id="${button.id}"]`).forEach(button => button.classList.add("buttonActivatedToggleOn"));
                }

                if (player1.length > 0 && player2.length > 0){
                    //find the object with the game and the object with the type
                    for(const [player, output] of [[player1, 1], [player2, 2]]){
                        for (const game of player){
                            if(game.includes(type)){
                                for (const entry of game){
                                    if(entry.Type === button.id){
                                        ACTUALLYPushToFrontEnd(entry, output,type,true);
                                    }
                                }
                            }
                        }
                    }

                    RemoveComparison();
                    Comparison(player1, player2, type);
                }
                else{
                    ACTUALLYPushToFrontEnd(gamesByType[button.id], whereToOutput,type,true);
                }
            }

        }
        
        
    
    

    }
    
}


function ACTUALLYPushToFrontEnd(game, whereToOutput, type, alreadyPushed) {

    let wheretoOut = document.querySelector(`.resultPara.${type}${whereToOutput}`);

    for(const [key, field, unit] of [["min", "TopTime", "s"], ["max", "WorstTime", "s"], ["days", "DaysPlayed", ""], ["games", "GamesPlayed", ""], ["avg", "AverageTime", "s"]]){
        if(game[key] !== undefined && game[key] !== 0){
            wheretoOut.querySelector(`#${field}${whereToOutput}`).innerHTML = `${game[key]}${unit}`;
        }
    }

    if(game.Type === "40L/10L" && game.GameMode === "Sprint" && !alreadyPushed){
        // Check for duplicate before updating anything
        const names = document.querySelectorAll("#name");
        const alreadyExists = Array.from(names).some(name => game.name === name.innerHTML);
        if (alreadyExists) {
            alert("This user has already been added to the leaderboard, please check the leaderboard for more information.");
            return; // Exit the function immediately
        }

        lastLeaderboardNum++;
        //create new leaderboard entry and put it there (sorting will be done later)
        document.getElementById("daBody").appendChild(CreateLeaderboardRow(lastLeaderboardNum, game.name, game));
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






