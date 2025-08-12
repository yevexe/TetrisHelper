
let SprintInfo = [];
let CheeseInfo = [];
let SurvivalInfo = [];
let UltraInfo = [];

let player1 = [];
let player2 = [];

let EnterKeyCliked = false;
let comparison = false;
let lastLeaderboardNum = 0;

console.log("Trying to connect to the server....");
//CONNECTING TO THE SERVER
fetch(`https://3140-projects-repo.vercel.app/api/backendProxy?endpoint=connect`)
    .then(response => {
    console.log('Status code:', response.status); // e.g., 200

    return response.text(); // read response as plain text
  })
    .then(data => {
    console.log(data); 
    if(data === "Connection successful!") {
        fetch(`https://https://3140-projects-repo.vercel.app/api/backendProxy?endpoint=leaderboard`)
        .then(res => res.json())
        .then(data => {
            console.log('Leaderboard:', data);
            UpdateLeaderboardWithDatabaseInformation(data);
        });

    }
    else{
        alert("Connection to the server failed. Please try again later.");
    }
  })
  .catch(err => console.error("Connection failed:", err));

      document.querySelectorAll(".submitButton").forEach(butt => butt.onclick = () => ButtClick(butt));



function UpdateLeaderboardWithDatabaseInformation(data){
    console.log(data);
    for (const player of data){

        //create new leaderboard entry and put it there
        let newEntry = document.createElement("tr");
        newEntry.classList.add("leaderboard-entry");
        let number = document.createElement("td");
        number.innerHTML = player.id
        number.id = player.id

        newEntry.appendChild(number);
        let name = document.createElement("td");
        name.innerHTML = player.username;
        name.id = "name";
        newEntry.appendChild(name);

        //CREATING ONLY DEFAULT CASE, WHEN THE USER CLICKS ON THE BUTTON, IT WILL ONLY FETCH THE SPECIFIC STATS AND UPDATE THEM 
        //ALL IN ANOTHER FUNCTION LATER.
    
            for(const game of player.sprint){
                if(game.Type === "40L/10L"){
                    console.log(game)
                    if((game.min !== undefined && game.min !== 0 ) ){
                        let TopTime = document.createElement("td");
                        TopTime.innerHTML = `${game.min}`
                        TopTime.id = `TopTime`;
                        newEntry.appendChild(TopTime);
                    }
                    if((game.max !== undefined && game.max !== 0)){
                        let WorstTime = document.createElement("td");
                        WorstTime.innerHTML = `${game.max}`
                        WorstTime.id = `WorstTime`;
                        newEntry.appendChild(WorstTime);
                    }

                    
                    if((game.days !== undefined && game.days !== 0)){
                        let DaysPlayed = document.createElement("td");   
                        DaysPlayed.innerHTML = `${game.days}`
                        DaysPlayed.id = `DaysPlayed`;
                        newEntry.appendChild(DaysPlayed);       
                    }

                    
                    if((game.games !== undefined && game.games !== 0)){  
                        let GamesPlayed = document.createElement("td");   
                        GamesPlayed.innerHTML = `${game.games}`
                        GamesPlayed.id = `GamesPlayed`;
                        newEntry.appendChild(GamesPlayed);
                    }

                    
                    if((game.avg !== undefined && game.avg !== 0)){
                        let AverageTime = document.createElement("td");
                        AverageTime.innerHTML = `${game.avg}`
                        AverageTime.id = `AvgTime`;
                        newEntry.appendChild(AverageTime);  
                    }
                }
            }
            
        document.getElementById("daBody").appendChild(newEntry);
    }
        
}
document.getElementById('username').addEventListener('input', function() {
        if (this.value.trim() === '') {
                    let wheretoOut = document.querySelector(`.resultPara.sprint1`);

                    wheretoOut.querySelector(`#TopTime1`).innerHTML=` `
                    wheretoOut.querySelector(`#WorstTime1`).innerHTML =` ` 
                    wheretoOut.querySelector(`#DaysPlayed1`).innerHTML =` ` 
                    wheretoOut.querySelector(`#GamesPlayed1`).innerHTML =` ` 
                    wheretoOut.querySelector(`#AverageTime1`).innerHTML = ` `
                    RemoveComparison();
            // Perform actions when the input becomes empty
        } else {

        }
    });

document.getElementById('username1').addEventListener('input', function() {
        if (this.value.trim() === '') {
                    let wheretoOut = document.querySelector(`.resultPara.sprint2`);

                    wheretoOut.querySelector(`#TopTime2`).innerHTML=` `
                    wheretoOut.querySelector(`#WorstTime2`).innerHTML =` ` 
                    wheretoOut.querySelector(`#DaysPlayed2`).innerHTML =` ` 
                    wheretoOut.querySelector(`#GamesPlayed2`).innerHTML =` ` 
                    wheretoOut.querySelector(`#AverageTime2`).innerHTML = ` `
                    RemoveComparison();
            // Perform actions when the input becomes empty
        } else {

        }
    });
async function ButtClick(butt){
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

                if(butt.id === "submitButton1"){
                    username = document.getElementById("username1").value;
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
                    username = document.getElementById("username").value;
                    whereToOutput = 1;
                    player1 = [];

                }
                    document.querySelectorAll(".para"+whereToOutput).forEach(para => {  
                        para.innerHTML = "";
                        para.classList.remove("scoreGreenLow", "scoreGreenMedium", "scoreGreenHigh");
                    });
                /*
                //runs when the user clicks on the button but not from a enter key press, meaning they clicked on a specific button.
                if(!EnterKeyCliked){
                    console.log(document.getElementById("username"));
                    console.log(document.getElementById("username1"));

                    (butt.id.includes("2") 
                    ? (username = document.getElementById("username1").value, whereToOutput = "2") 
                    : (username = document.getElementById("username").value, whereToOutput = "1"));

                }
                //only runs if the enter key is clicked
                else{

                    //checks if player 1's output is empty => if the last element in the resultPara is the username, that means there was nothing added onto it.
                    (document.getElementById("result").lastElementChild.lastElementChild.id === "USERNAME" 
                    ?(username = document.getElementById("username").value, whereToOutput = "1")
                    :(username = document.getElementById("username1").value, whereToOutput = "2"));

                }
                */
                /* REMOVED AS OF 07/29/25 FOR THE TWO PLAYER COMPARISON UPDATE.
                //first ever ternary statement, if the username has a value then let username equal to that value, anything else (meaning it's empty) throw an alert.
                let username = (document.getElementById("username").value) ? document.getElementById("username").value : alert("You Wrote the Wrong Input?!");
                */

                console.log(username);

                //Only run the code if the username is a valid input
                if(username !== undefined && !(username === "")){
                   let type;
                  
                    //What game you want 1 = sprint, 3 = cheese, 4 = survival, 5 = ultra, 7 = 20TSD, 8 = PC Mode
                    SprintInfo = await ObtainGameInformation(username, 1);
                    type = "sprint";
                    SprintInfo.push(type);
                    AddInfoToFrontend(SprintInfo, whereToOutput,type);
                    document.getElementById("sprint"+whereToOutput).classList.remove("hiddenToggleOn");

                    CheeseInfo = await ObtainGameInformation(username, 3);
                    type = "cheese"
                    CheeseInfo.push(type);
                    AddInfoToFrontend(CheeseInfo, whereToOutput,type);
                    //document.getElementById("cheese"+whereToOutput).classList.remove("hiddenToggleOn");

                    SurvivalInfo = await ObtainGameInformation(username, 4);
                    type = "surv"
                    SurvivalInfo.push(type);
                    AddInfoToFrontend(SurvivalInfo, whereToOutput,type);
                    //document.getElementById("Surv").classList.remove("hiddenToggleOn");

                    UltraInfo = await ObtainGameInformation(username, 5);
                    type = "ultra"
                    UltraInfo.push(type);
                    AddInfoToFrontend(UltraInfo, whereToOutput,type);

                    //TwentyInfo = await ObtainGameInformation(username, 7);
                    //AddInfoToFrontend(TwentyInfo, whereToOutput,type);

                    //PCMODEInfo = await ObtainGameInformation(username, 8);
                    //AddInfoToFrontend(PCMODEInfo, whereToOutput,type);

                    if(whereToOutput === 1){
                        player1.push(SprintInfo);
                        player1.push(CheeseInfo);
                        player1.push(SurvivalInfo);
                        player1.push(UltraInfo);
                        //player1.push(TwentyInfo);
                        //player1.push(PCMODEInfo);
                        await PostToLeaderboardDatabase(player1,username)

                    }
                    else{
                        player2.push(SprintInfo);
                        player2.push(CheeseInfo);
                        player2.push(SurvivalInfo);
                        player2.push(UltraInfo);
                        await PostToLeaderboardDatabase(player2,username)
                        //player2.push(TwentyInfo);
                        //player2.push(PCMODEInfo);
                    }

                    if(comparison){
                        // Only run comparison if both player1 and player2 have 4 game arrays (Sprint, Cheese, Survival, Ultra)
                        if (player1.length >= 4 && player2.length >= 4) {
                            console.log(player1);
                            console.log(player2);
                            let allResults = document.querySelectorAll(`.datadump.result`);
                            for(const result of allResults){
                                if(!result.classList.contains("hiddenToggleOn")){   
                                    type = result.querySelector("h4").textContent.toLowerCase();
                                    console.log("COMPARNG GAMEMODE: "+type);
                                }
                            }
                            //console.log(player1);
                            //console.log(player2);
                            Comparison(player1, player2, type);
                        } else {
                            // Wait for both players to be loaded before comparing
                            console.log("Waiting for both players' data before running comparison...");
                        }
                    }
                }
                else{
                    alert("You Wrote the Wrong Input?!");
                }
}
async function PostToLeaderboardDatabase(player,username){
    console.log(player);
    
    fetch('http://localhost:3000/leaderboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            username: username,
            sprint: player[0],
            cheese: player[1],
            survival: player[2],
            ultra: player[3]
        })
        })
        .then(res => res.json())
        .then(data => {
        console.log('POST success:', data);
})
.catch(err => console.error('Error posting leaderboard:', err));

}
function ClearBothPlayersInfo(){
    document.querySelectorAll(".para").forEach(para => {
        para.innerHTML = "";
        para.classList.remove("scoreGreenLow", "scoreGreenMedium", "scoreGreenHigh");
     });
}
function Comparison(player1, player2, GameMode){
    console.log("RUNNING COMPARISON")
    //if there is no output for player 1 then just return
    if(!player1 || !player2) return;

    //if there is no output for player 2 then just return
    if(!player2) return;

    //if there is no output for player 1 then just return
    if(!player1) return;

    //if there is no output for player 1 then just return
    if(!player2) return;

    /*
        Comparison(player1, player2, GameMode) will be a function that compares the two players and outputs the results.
        GameMode = the GameMode of game we are comparing (sprint, cheese, survival, ultra, 20TSD, PC Mode)
    */

    //console.log(player1);
    //console.log(player2);

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
       // console.log(game);
       // console.log(GameMode);
        if(game.includes(GameMode)){
            comparisonPlayer2 = game;
        }
    }

    //console.log(comparisonPlayer1);
    //console.log(comparisonPlayer2);

    //now we need to check which of the buttons are highlighted
    //get all buttons from the divider of that GameMode
    let buttons = document.getElementById(`${GameMode}1`).querySelectorAll('button');
    let type; 
    buttons.forEach(butt => {
        if(butt.classList.contains("buttonActivatedToggleOn")){ 
           type = butt.id;
        }
    });

    console.log("TYPE: "+type);

    //Search through each comparisonPlayer to find the specific type we are looking for
    for(const game of comparisonPlayer1){
        //console.log(game);
        if(game.Type === type){
            comparisonPlayer1 = game;
        }
    }

    for (const game of comparisonPlayer2){
        //console.log(game);
        if(game.Type === type){
            comparisonPlayer2 = game;
        }
    }   

   // console.log(comparisonPlayer1);
   // console.log(comparisonPlayer2);

    //how we will calculate the difference:
    //just do player1 - player2,
    //if the number is negative then player 2 is better,
    //and depending on how negative the number is, that will be shade of green
    //0-2 seconds is small gap, 5-8 seconds is medium gap, anything bigger is big gap.

    let differenceTopTime = comparisonPlayer1.min - comparisonPlayer2.min;
    let differenceWorstTime = comparisonPlayer1.max - comparisonPlayer2.max;
    let differenceDaysPlayed = comparisonPlayer1.days - comparisonPlayer2.days; 
    let differenceGamesPlayed = comparisonPlayer1.games - comparisonPlayer2.games;
    let differenceAverageTime = comparisonPlayer1.avg - comparisonPlayer2.avg;
    
    //first check if they are negative, if negative then winner is player 2, blah blah
    let winnerTopTime = (differenceTopTime < 0) ? "1" : "2";
    let winnerWorstTime = (differenceWorstTime < 0) ? "1" : "2";
    //the more days played the better
    let winnerDaysPlayed = (differenceDaysPlayed < 0) ? "2" : "1";
    //the more games played the better
    let winnerGamesPlayed = (differenceGamesPlayed < 0) ? "2" : "1";
    let winnerAverageTime = (differenceAverageTime < 0) ? "1" : "2";

   
    //now we know who is the winner, all we need is to find out how big of a gap.
    let wheretoOut = document.querySelector(`.resultPara.${GameMode}${winnerTopTime}`);
    let wheretofart = wheretoOut.querySelector("#TopTime"+winnerTopTime);
    differenceTopTime = Math.abs(differenceTopTime);
    if (differenceTopTime > 5) {
        wheretofart.classList.add("scoreGreenLow");
    } else if (differenceTopTime > 2) {
        wheretofart.classList.add("scoreGreenMedium");
    } else if (differenceTopTime > 0) {
        wheretofart.classList.add("scoreGreenHigh");
    }


    wheretoOut = document.querySelector(`.resultPara.${GameMode}${winnerWorstTime}`);
    wheretofart = wheretoOut.querySelector("#WorstTime"+winnerWorstTime);
    differenceWorstTime = Math.abs(differenceWorstTime);
    if (differenceWorstTime > 5) {
        wheretofart.classList.add("scoreGreenLow");
    } else if (differenceWorstTime > 2) {
        wheretofart.classList.add("scoreGreenMedium");
    } else if (differenceWorstTime > 0) {
        wheretofart.classList.add("scoreGreenHigh");
    }
    

    wheretoOut = document.querySelector(`.resultPara.${GameMode}${winnerDaysPlayed}`);
    wheretofart = wheretoOut.querySelector("#DaysPlayed"+winnerDaysPlayed);
    differenceDaysPlayed = Math.abs(differenceDaysPlayed);
    if (differenceDaysPlayed > 30) {
        wheretofart.classList.add("scoreGreenLow");
    } else if (differenceDaysPlayed > 10) {
        wheretofart.classList.add("scoreGreenMedium");
    } else if (differenceDaysPlayed > 0) {
        wheretofart.classList.add("scoreGreenHigh");
    }

    wheretoOut = document.querySelector(`.resultPara.${GameMode}${winnerGamesPlayed}`);
    wheretofart = wheretoOut.querySelector("#GamesPlayed"+winnerGamesPlayed);
    differenceGamesPlayed = Math.abs(differenceGamesPlayed);
    if (differenceGamesPlayed > 30) {
        wheretofart.classList.add("scoreGreenLow");
    } else if (differenceGamesPlayed > 10) {
        wheretofart.classList.add("scoreGreenMedium");
    } else if (differenceGamesPlayed > 0) {
        wheretofart.classList.add("scoreGreenHigh");
    }
    
    wheretoOut = document.querySelector(`.resultPara.${GameMode}${winnerAverageTime}`);
    wheretofart = wheretoOut.querySelector("#AverageTime"+winnerAverageTime);
    differenceAverageTime = Math.abs(differenceAverageTime);
    if (differenceAverageTime > 5) {
        wheretofart.classList.add("scoreGreenLow");
    } else if (differenceAverageTime > 2) {
        wheretofart.classList.add("scoreGreenMedium");
    } else if (differenceAverageTime > 0) {
        wheretofart.classList.add("scoreGreenHigh");
    }

    
    


    
}

/*
document.addEventListener("keypress", function(event){
    (event.key === "Enter" ? (EnterKeyCliked = true , ButtClick()) : console.log());
}); 
*/

function RemoveComparison(){
    //if the comparison is true, then we need to remove the comparison

        document.querySelectorAll(".resultPara").forEach(para => {
            para.querySelectorAll("span").forEach(span => span.classList.remove("scoreGreenLow", "scoreGreenMedium", "scoreGreenHigh"));
        });

        
    
}

function AddInfoToFrontend(dataArray, whereToOutput,type){

    let amountThatIs0 = 0;

    //If the data found does not have a best game, that means there was no games played at all.
    //if the user has played a game, no matter what that will be considered the 'best' game
    //if (dataArray[0].mode.length !== 0){
        

        var forty;
        var twenty;
        var hundred;
        var thousand;

        for(const game of dataArray){
            if (typeof game === "string") continue; // Skip the string element
            //if the game does not have a best, that means the user has not played a game in this mode AT ALL.
            //if(game.best.length !== 0){

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
                
            //}   

        }

        if (forty) ACTUALLYPushToFrontEnd(forty, whereToOutput, amountThatIs0,type,false);
        let wheretoNotOutput = whereToOutput === 1 ? "2" : "1";
        
       // console.log(`.buttonGroupContainer.${type}${whereToOutput}`);
        let buttons = document.querySelector(`.buttonGroupContainer.${type}${whereToOutput}`).querySelectorAll('button');
        for (const butt of buttons){

            butt.onclick = function(){
                
                    let wheretoOut = document.querySelector(`.resultPara.${type}${whereToOutput}`);
                    let wheretoNotOut = document.querySelector(`.resultPara.${type}${wheretoNotOutput}`);

                    wheretoOut.querySelector(`#TopTime${whereToOutput}`).innerHTML=` `
                    wheretoOut.querySelector(`#WorstTime${whereToOutput}`).innerHTML =` ` 
                    wheretoOut.querySelector(`#DaysPlayed${whereToOutput}`).innerHTML =` ` 
                    wheretoOut.querySelector(`#GamesPlayed${whereToOutput}`).innerHTML =` ` 
                    wheretoOut.querySelector(`#AverageTime${whereToOutput}`).innerHTML = ` `

                    wheretoNotOut.querySelector(`#TopTime${wheretoNotOutput}`).innerHTML=` `
                    wheretoNotOut.querySelector(`#WorstTime${wheretoNotOutput}`).innerHTML =` ` 
                    wheretoNotOut.querySelector(`#DaysPlayed${wheretoNotOutput}`).innerHTML =` ` 
                    wheretoNotOut.querySelector(`#GamesPlayed${wheretoNotOutput}`).innerHTML =` ` 
                    wheretoNotOut.querySelector(`#AverageTime${wheretoNotOutput}`).innerHTML = ` `

                    document.querySelector(`.buttonGroupContainer.${type}${whereToOutput}`).querySelectorAll('button').forEach(butt => butt.classList.remove("buttonActivatedToggleOn"));
                    document.querySelector(`.buttonGroupContainer.${type}${wheretoNotOutput}`).querySelectorAll('button').forEach(butt => butt.classList.remove("buttonActivatedToggleOn"));


                switch(butt.id){

                    case "40L/10L":

                        document.querySelector(`.buttonGroupContainer.${type}${whereToOutput}`).querySelectorAll(`#\\34 0L\\/10L`).forEach(butt => butt.classList.add("buttonActivatedToggleOn"));
                        document.querySelector(`.buttonGroupContainer.${type}${wheretoNotOutput}`).querySelectorAll(`#\\34 0L\\/10L`).forEach(butt => butt.classList.add("buttonActivatedToggleOn"));
                        
                        if (player1.length > 0 && player2.length > 0){
                            //find the object with the game and the object with the type
                            for (const game of player1){
                                if(game.includes(type)){
                                    for (const fart of game){
                                        if(fart.Type === "40L/10L"){
                                            ACTUALLYPushToFrontEnd(fart, whereToOutput, amountThatIs0,type,true);
                                        }
                                    }
                                }
                            }

                            for (const game of player2){
                                if(game.includes(type)){
                                    for (const fart of game){
                                        if(fart.Type === "40L/10L"){
                                            ACTUALLYPushToFrontEnd(fart, wheretoNotOutput, amountThatIs0,type,true);
                                        }
                                    }
                                }
                            }

                            RemoveComparison();
                            Comparison(player1, player2, type);

                        }
                        else{
                            ACTUALLYPushToFrontEnd(forty, whereToOutput, amountThatIs0,type,true);
                        }

                        break;
                    case "20L/18L":
                        document.querySelector(`.buttonGroupContainer.${type}${whereToOutput}`).querySelectorAll(`#\\32 0L\\/18L`).forEach(butt => butt.classList.add("buttonActivatedToggleOn"));
                        document.querySelector(`.buttonGroupContainer.${type}${wheretoNotOutput}`).querySelectorAll(`#\\32 0L\\/18L`).forEach(butt => butt.classList.add("buttonActivatedToggleOn"));
                        if( player1.length > 0 && player2.length > 0){
                            //find the object with the game and the object with the type
                            for (const game of player1){
                                if(game.includes(type)){
                                    for (const fart of game){
                                        if(fart.Type === "20L/18L"){
                                            ACTUALLYPushToFrontEnd(fart, whereToOutput, amountThatIs0,type,true);
                                        }
                                    }
                                }
                            }

                            for (const game of player2){
                                if(game.includes(type)){
                                    for (const fart of game){
                                        if(fart.Type === "20L/18L"){
                                            ACTUALLYPushToFrontEnd(fart, wheretoNotOutput, amountThatIs0,type,true);
                                        }
                                    }
                                }
                            }

                            RemoveComparison();
                            Comparison(player1, player2, type);
                        }
                        else{
                            ACTUALLYPushToFrontEnd(twenty, whereToOutput, amountThatIs0,type,true);
                        }
                        break;
                    case "100L":
                        document.querySelector(`.buttonGroupContainer.${type}${whereToOutput}`).querySelectorAll(`#\\31 00L`).forEach(butt => butt.classList.add("buttonActivatedToggleOn"));
                        document.querySelector(`.buttonGroupContainer.${type}${wheretoNotOutput}`).querySelectorAll(`#\\31 00L`).forEach(butt => butt.classList.add("buttonActivatedToggleOn"));
                        if (player1.length > 0 && player2.length > 0){
                            //find the object with the game and the object with the type
                            for (const game of player1){
                                if(game.includes(type)){
                                    for (const fart of game){
                                        if(fart.Type === "100L"){
                                            ACTUALLYPushToFrontEnd(fart, whereToOutput, amountThatIs0,type,true);
                                        }
                                    }
                                }
                            }
                            for (const game of player2){
                                if(game.includes(type)){
                                    for (const fart of game){
                                        if(fart.Type === "100L"){
                                            ACTUALLYPushToFrontEnd(fart, wheretoNotOutput, amountThatIs0,type,true);
                                        }
                                    }
                                }
                            }

                            RemoveComparison();
                            Comparison(player1, player2, type);
                        }
                        else{
                            ACTUALLYPushToFrontEnd(hundred, whereToOutput, amountThatIs0,type,true);
                        }
                        break;
                    
                    case "1000L":

                        document.querySelector(`.buttonGroupContainer.${type}${whereToOutput}`).querySelectorAll(`#\\31 000L`).forEach(butt => butt.classList.add("buttonActivatedToggleOn"));
                        document.querySelector(`.buttonGroupContainer.${type}${wheretoNotOutput}`).querySelectorAll(`#\\31 000L`).forEach(butt => butt.classList.add("buttonActivatedToggleOn"));

                        if(player1.length > 0 && player2.length > 0){
                            //find the object with the game and the object with the type    
                            for (const game of player1){
                                if(game.includes(type)){
                                    for (const fart of game){
                                        if(fart.Type === "1000L"){
                                            ACTUALLYPushToFrontEnd(fart, whereToOutput, amountThatIs0,type,true);
                                        }
                                    }
                                }
                            }
                            for (const game of player2){
                                if(game.includes(type)){
                                    for (const fart of game){
                                        if(fart.Type === "1000L"){
                                            ACTUALLYPushToFrontEnd(fart, wheretoNotOutput, amountThatIs0,type,true);
                                        }   
                                    }
                                }
                            }
                            RemoveComparison();
                            Comparison(player1, player2, type);
                        }
                        else{
                            ACTUALLYPushToFrontEnd(thousand, whereToOutput, amountThatIs0,type,true);
                        }
                        
                        break;
                }
            }   
            
        }

        /*
        if (twenty) ACTUALLYPushToFrontEnd(twenty, whereToOutput, amountThatIs0,type);
        if (hundred) ACTUALLYPushToFrontEnd(hundred, whereToOutput, amountThatIs0,type);
        if (thousand) ACTUALLYPushToFrontEnd(thousand, whereToOutput, amountThatIs0,type);
        */
        
        
    
    

}


function ACTUALLYPushToFrontEnd(game, whereToOutput, amountThatIs0, type, alreadyPushed) {


    let wheretoOut = document.querySelector(`.resultPara.${type}${whereToOutput}`);

   // console.log(`#TopTime${whereToOutput}`);

    (game.min !== undefined && game.min !== 0 ) 
        ? wheretoOut.querySelector(`#TopTime${whereToOutput}`).innerHTML = `${game.min}s` 
        : amountThatIs0++;

    (game.max !== undefined && game.max !== 0) 
        ? wheretoOut.querySelector(`#WorstTime${whereToOutput}`).innerHTML = `${game.max}s` 
        : amountThatIs0++;

    (game.days !== undefined && game.days !== 0) 
        ? wheretoOut.querySelector(`#DaysPlayed${whereToOutput}`).innerHTML = `${game.days}` 
        : amountThatIs0++;

    (game.games !== undefined && game.games !== 0) 
        ? wheretoOut.querySelector(`#GamesPlayed${whereToOutput}`).innerHTML = `${game.games}` 
        : amountThatIs0++;

    (game.avg !== undefined && game.avg !== 0) 
        ? wheretoOut.querySelector(`#AverageTime${whereToOutput}`).innerHTML = `${game.avg}s` 
        : amountThatIs0++;


    if(game.Type === "40L/10L" && game.GameMode === "Sprint" && !alreadyPushed){
        // Check for duplicate before updating anything
        const names = document.querySelectorAll("#name");
        const alreadyExists = Array.from(names).some(name => game.name === name.innerHTML);
        if (alreadyExists) {
            alert("This user has already been added to the leaderboard, please check the leaderboard for more information.");
            return; // Exit the function immediately
        }

        alreadyPushed = true;
       // console.log("Pushing Sprint 40L/10L to Frontend");
        lastLeaderboardNum++;
        //create new leaderboard entry and put it there (sorting will be done later)
        let newEntry = document.createElement("tr");
        newEntry.classList.add("leaderboard-entry");
        let number = document.createElement("td");
        number.innerHTML = lastLeaderboardNum;
        number.id = "num";

        newEntry.appendChild(number);
        let name = document.createElement("td");
        name.innerHTML = game.name;
        name.id = "name";
        newEntry.appendChild(name);

        
        
        if((game.min !== undefined && game.min !== 0 ) ){
            let TopTime = document.createElement("td");
            TopTime.innerHTML = `${game.min}`
            TopTime.id = `TopTime`;
            newEntry.appendChild(TopTime);
        }

        
        if((game.max !== undefined && game.max !== 0)){
            let WorstTime = document.createElement("td");
            WorstTime.innerHTML = `${game.max}`
            WorstTime.id = `WorstTime`;
            newEntry.appendChild(WorstTime);
        }

        
        if((game.days !== undefined && game.days !== 0)){
            let DaysPlayed = document.createElement("td");   
            DaysPlayed.innerHTML = `${game.days}`
            DaysPlayed.id = `DaysPlayed`;
            newEntry.appendChild(DaysPlayed);       
        }

        
        if((game.games !== undefined && game.games !== 0)){  
            let GamesPlayed = document.createElement("td");   
            GamesPlayed.innerHTML = `${game.games}`
            GamesPlayed.id = `GamesPlayed`;
            newEntry.appendChild(GamesPlayed);
        }

        
        if((game.avg !== undefined && game.avg !== 0)){
            let AverageTime = document.createElement("td");
            AverageTime.innerHTML = `${game.avg}`
            AverageTime.id = `AvgTime`;
            newEntry.appendChild(AverageTime);  
        }


        document.getElementById("daBody").appendChild(newEntry);
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

                   let promise = fetch(`https://3140-projects-repo.vercel.app/api/proxy?endpoint=${username}/records/${game}?mode=${d}&best`, 
                    {method: 'GET',
                    headers:{
                        'Access-Control-Allow-Origin' : '*',
                        'Access-Control-Allow-Headers' : '*',
                    }})
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
                    const singleApiCall = await fetch(`https://3140-projects-repo.vercel.app/api/proxy?endpoint=${username}/records/${game}?mode=1&best`)
                    let response = await singleApiCall.json();


                    response.GameMode = Name;
                    ResultArray.push(response);



                }catch(error){console.log('error', error);}

                break;

        }

        //console.log(ResultArray);
    //Return the result array (every information has been obtained and sorted)
    return ResultArray;
        
}

let HowManyTimesClicked = 0;
let LastModeClicked = null;
document.querySelectorAll("th").forEach(butt => (butt.id !== "num") ? butt.onclick = () => LeaderBoardTableEntrySort(butt) : null);

function LeaderBoardTableEntrySort(butt){
   // console.log("CLICKED: "+butt.id);
    butt.style.textDecoration = "underline dotted";
    if (LastModeClicked === null || LastModeClicked !== butt.id) {
        // Reset the click count if a different button is clicked
        HowManyTimesClicked = 0;
        LastModeClicked = butt.id;

    }
    HowManyTimesClicked++;
    if(HowManyTimesClicked ===1){
        let ASC = document.createElement("div");
        ASC.id = "ASC";
        ASC.innerHTML = "ASC.";
        (document.getElementById("DSC") !== null) ? document.getElementById("DSC").remove() : "";
        butt.appendChild(ASC);

        ActuallySort(butt.id,"ASC");
    }
    else if(HowManyTimesClicked === 2){
        let DSC = document.createElement("div");
        DSC.innerHTML = "DESC.";
        DSC.id = "DSC";
        (document.getElementById("ASC") !== null) ? document.getElementById("ASC").remove() : "";
        butt.appendChild(DSC);

        ActuallySort(butt.id,"DESC");
    }
    else{
        HowManyTimesClicked = 0; // Reset after the third click
        LastModeClicked = null; // Reset the last clicked mode
        butt.style.textDecoration = "";
        (document.getElementById("ASC") !== null) ? document.getElementById("ASC").remove() : "";
        (document.getElementById("DSC") !== null) ? document.getElementById("DSC").remove() : "";
        ActuallySort(butt.id,"DEF");
    }
}

function ActuallySort(Name, type) {
    console.log(Name);
    // Get the full rows/containers for each entry
    let rows = Array.from(document.querySelectorAll(".leaderboard-entry"));

    switch (type) {
        case "ASC":
            rows.sort((a, b) => {
                let textA = a.querySelector("#" + Name).innerHTML.trim();
                let textB = b.querySelector("#" + Name).innerHTML.trim();
                return textA.localeCompare(textB, undefined, { numeric: true });
            });
            break;

        case "DESC":
            rows.sort((a, b) => {
                let textA = a.querySelector("#" + Name).innerHTML.trim();
                let textB = b.querySelector("#" + Name).innerHTML.trim();
                return textB.localeCompare(textA, undefined, { numeric: true });
            });
            break;

        default:
            // No sorting
            break;
    }

    // Reattach sorted rows to the tbody
  
    let parent = document.getElementById("daBody");
    parent.innerHTML = ""; 
    rows.forEach(row => parent.appendChild(row));
}





