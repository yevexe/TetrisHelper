document.getElementById("submitButton").onclick = function(){

                //Getting the username from the input in the main page
                //first ever ternary statement, if the username has a value then let username equal to that value, anything else (meaning it's empty) throw an alert.
                let username = (document.getElementById("username").value) ? document.getElementById("username").value : alert("You Wrote the Wrong Input?!");

                console.log(username);

                //Only run the code if the username is a valid input
                if(username!== undefined){

                    //edit the datadump with the info I already have (only the username)
                    document.getElementById("USERNAME").innerHTML = username;

                    //What game you want 1 = sprint, 3 = cheese, 4 = survival, 5 = ultra, 7 = 20TSD, 8 = PC Mode
                    let SprintInfo = ObtainGameInformation(username, 1);
                    let CheeseInfo = ObtainGameInformation(username, 3);
                    let SurvivalInfo = ObtainGameInformation(username, 4);
                    let UltraInfo = ObtainGameInformation(username, 5);
                    let TwentyInfo = ObtainGameInformation(username, 7);
                    let PCMODEInfo = ObtainGameInformation(username, 8);

                    AddInfoToFrontend(SprintInfo);
                    AddInfoToFrontend(CheeseInfo);
                    AddInfoToFrontend(SurvivalInfo);
                    AddInfoToFrontend(UltraInfo);
                    AddInfoToFrontend(TwentyInfo);
                    AddInfoToFrontend(PCMODEInfo);

                    //Show the result
                    //final ternary statement, if the username is not undefined (meaning the user actually typed something), then actually print the result, only if it equals undefined will it "do nothing".
                    (username !== undefined) ? document.getElementById("result").style.opacity = "1" : console.log("donothing");
                }

}
document.addEventListener("keypress", function(event){
    if (event.key === "Enter"){
        document.getElementById("submitButton").click();
    }
})
/*
<p> ************************************************
                    USERNAME: <span id="USERNAME">[USERNAME]</span>
                    
                    
                    GAME_TYPE: <span id="GAME_TYPE">[GAME_TYPE]</span>  
                    GAME_MODE: <span id="GAME_MODE">[GAME_MODE]</span>  
                    TOP_TIME: <span id="TOP_TIME">[TOP_TIME]</span>
                    MAX_TIME: <span id="MAX_TIME">[MAX_TIME]</span>
                    DAYS_PLAYED: <span id="DAYS_PLAYED">[DAYS_PLAYED]</span>
                    GAMES_PLAYED: <span id="GAMES_PLAYED">[GAMES_PLAYED]</span>
                    AVG_TIME: <span id="AVG_TIME">[AVG_BLOCKS]</span>    
                    LEADERBOARD_TIMESTAMP: <span id="LEADERBOARD_TIMESTAMP">[LEADERBOARD_TIMESTAMP]</span>

<p> ************************************************
*/

function AddInfoToFrontend(dataArray){
    console.log(dataArray);

    //document.getElementById("resultPara").innerHTML+=`GAME_TYPE: <span id="GAME_TYPE">fart</span>`;
}


function ObtainGameInformation(username, game){
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
                  
                    //This is some fuck-ass solution for our fetch request, CORS is a bitch and doesn't allow this to be easy so we are using a 3rd party proxy to help us
                    //we SHOULD later convert to vercel and write our own proxy later.
                    fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(`https://jstris.jezevec10.com/api/u/${username}/records/${game}?mode=${d}&best`)}`)
                    .then(response => response.text())
                    .then(result => {
                
                        let data = [];
                        data.push(JSON.parse(result));  
                        data[0].GameMode = Name;
                        data[0].Type = ModeInTheMode;
                        ResultArray.push(data[0]);
                    })
                    .catch(error => console.log('error', error));
                }
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
                fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(`https://jstris.jezevec10.com/api/u/${username}/records/${game}?mode=1&best`)}`)
                .then(response => response.text())
                .then(result => {
             
                    let data = [];
                    data.push(JSON.parse(result));  
                    data[0].GameMode = Name;

                    ResultArray.push(data[0]);
                })
                .catch(error => console.log('error', error));

                break;

        }

    //Return the result array (every information has been obtained and sorted)
    return ResultArray;
        
}
