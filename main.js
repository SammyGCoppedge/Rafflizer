 /*
 * Rafflizer Source Code
 * 
 * Written by Samuel Coppedge.
 * 
 * Rafflizer is a program written in Node javascript to be used as a prototype of a
 * raffling software. This software was intended to be used by artists in need of a 
 * better, more efficient way to keep track of weighted raffles.
 * 
 * Made for Plu
 */


const fs = require('fs');
const readline = require('readline-sync');

console.log('\x1b[32m%s\x1b[0m', "Welcome to Rafflizer!\n");

// Initial intro loop
while (true)
{
    var enteredNames = [];
    var raffleArray = [];
    var winners = [];
    var totalEntries = 0;

    // Gets initial 1, 2, 3, or 4
    var introChoice = getIntroChoice();
    if (introChoice == 1)
    {
        var inputFile = getExistingFile(readline.question("Enter raffle archive file to select from or type QUIT:\n(If you don't have an archive and want a blank one, hit enter.)\n"), true);
        if (inputFile == "quit")
            continue;

        // Begin new raffle from .json file
        startNewRaffle(inputFile);
    }

    else if (introChoice == 2)
    {
        // Create new .json file with input text file
        var inputFile = getExistingFile(readline.question("Enter input file to read from or type QUIT:\n(If you don't have an input file yet still want a blank archive, hit enter.)\n"), false);
        if (inputFile == "quit")
            continue;

        var flag = false;
        if (inputFile == "")
            flag = true;

        var outputFile = getOverwriteFile(readline.question("Enter name for output archive or type QUIT:\n"), flag);
        if (outputFile == "quit")
            continue;

        if (!flag)
            readInputFile(inputFile, outputFile);
        else
            console.log('\x1b[32m%s\x1b[0m', "New blank raffle archived saved as " + outputFile);
    }

    else if (introChoice == 3)
    {
        // Make changes to existing .json file 
        var inputFile = getExistingFile(readline.question("Enter raffle archive file to select from or type QUIT:\n"));
        if (inputFile == "quit")
            continue;

        changeEntries(inputFile);
    }
    
    else if (introChoice == 4)
    {
        // Quit
        process.exit();
    }
}

 /*
 * getIntoChoice
 *
 * Inputs: None
 * 
 * Outputs: Returns users intro choice of either 1, 2, 3, or 4
 * 
 * 1) Starts new raffle from .json file
 * 2) Reads input text file into new .json file
 * 3) Manages list of users from .json file
 * 4) Quits program
 */

function getIntroChoice()
{
    var introChoice = readline.question("What would you like to do?\n\n\t1) Start new raffle\n\t2) Create new raffle archive\n\t3) Manage user list\n\t4) Quit\n").trim();

    while (introChoice != 1 && introChoice != 2 && introChoice != 3 && introChoice != 4)
    {
        introChoice = readline.question("Select either:\n\n\t1) Start new raffle\n\t2) Create new raffle archive\n\t3) Manage user list\n\t4) Quit\n").trim();
    }

    return introChoice;
}

 /*
 * readLines()
 *
 * Input - Name of file to be parsed
 * 
 * Output - Array of strings delimited by new lines
 */

function readLines(inputFileName)
{
    var lines = require('fs').readFileSync(inputFileName, 'utf-8')
        .split('\n')
        .filter(Boolean);

    return lines;
}

 /*
 * getExistingFile()
 *
 * Input - Name of file passed by user
 * 
 * Output - An existig file, ensuring no file DNE errors occur.
 */

function getExistingFile(filename, flag)
{
    if (filename.length == 0 && flag)
    {
        var tempName = "newRaffle";
        var realName = tempName;
        var count = 0;

        while (fs.existsSync(tempName + ".json"))
        {
            count++;
            tempName = realName + count;
        }

        tempName += ".json";

        fs.openSync(tempName, 'w');
        fs.writeFileSync(tempName, "{}", (err) => {
            if (err)
            {
                console.log('\x1b[31m%s\x1b[0m', 'File failed to save.');
                process.exit();
            }
        })

        return tempName;
    }
    else if (filename.length == 0 && !flag)
    {
        return "";
    }
    else
    {
        while (!fs.existsSync(filename))
        {
            if (filename.toLowerCase() == "quit")
            {
                return "quit";
            }
            filename = readline.question("File not found, enter again or type QUIT: \n").trim();
        }
    }

    return filename;
}

 /*
 * getOverwriteFile()
 *
 * Input - Name of file passed by user
 * 
 * Output - Gets name of new file to write JSON object to. If file exists, ensures user wants it to be overwritten.
 */

function getOverwriteFile(filename, flag)
{
    var overwriteChoice = "";

    while (fs.existsSync(filename + ".json"))
    {
        overwriteChoice = readline.question("File exists, would you like to overwrite it? Y/N\n").trim();
        overwriteChoice = overwriteChoice.toLowerCase();

        while (!(overwriteChoice.startsWith("n") || overwriteChoice.startsWith("y")))
        {
            overwriteChoice = readline.question("Please select Y or N to overwrite file.\n").toLowerCase().trim();
        }
        
        if (overwriteChoice.toLowerCase().startsWith("n"))
        {
            filename = readline.question("Choose a different filename for output archive:\n").toLowerCase().trim();
        }
        else if (filename == "quit" || overwriteChoice == "quit")
        {
            return "quit";
        }
        else
        {
            if (flag)
            {
                fs.openSync(filename + ".json");
                fs.writeFileSync(filename + ".json", "{}", (err) => {
                if (err)
                {
                    console.log('\x1b[31m%s\x1b[0m', 'File failed to save.');
                    process.exit();
                }
                });
                filename += ".json";
            }

            return filename;
        }
    }
    
    if (flag)
    {
        fs.closeSync(fs.openSync(filepath, 'rw'));
        fs.writeFileSync(filename + ".json", "{}", (err) => {
        if (err)
        {
            console.log('\x1b[31m%s\x1b[0m', 'File failed to save.');
            process.exit();
        }
        });
        filename += ".json";
    }

    return filename;
}

 /*
 * readInputFile()
 *
 * Input - Input and Output file names given by user.
 * 
 * Output - JSON object given by parsing input file.
 * 
 * INPUT FILE FORMAT:
 *      name1+
 *      name2+5
 *      name429+12
 *  
 * Should be [NAME]+[DIGIT DENOTING AMOUNT OF ENTRIES]
 * If digit is absent, denotes 1 entry.
 * 
 * JSON OBJECT FORMAT
 * {
 *    "name2" : 
 *    {
 *        "entries" : 5,
 *        "wins" : 0,
 *        "lastEntered" : 5/15/2019,
 *        "suspended" : "false"
 *    },
 *    ...
 * }
 */

function readInputFile(inputFileName, outputFileName)
{
    var entryList = '{\n';
    var lineCount = 1;
    // Parse input line by line
    var parsed = readLines(inputFileName);
    var errorList = [];

    // For each line parsed by input file
    parsed.forEach((element, index, array) => {
        element = element.replace(/\r|\n/, "");

        // Reger for (begins with -->) [NAME]+[0 - INFINITY Digits] (<-- ends with)
        var regex = /^.+\+\d*$/;
        var found = element.match(regex);

        // Didn't match regex, a problem occured
        if (found === null)
        {
            errorList.push("SYNTAX ERROR at line " + lineCount);
        }

        // Regex hit
        else
        {
            var split = element.split("+");
            split[1] = split[1].replace(/\r|\n/, "");

            // If no digits after +
            if (split[1].length == 0)
                split[1] = 1;
            
            // Format into JSON
            if (index === array.length - 1)
                entryList += '\t"' + split[0].toLowerCase() + '" : { "entries" : ' + split[1] + ', "wins" : 0, "lastEntered" : "0/0/0000", "suspended" : "false" }\n';
            else
                entryList += '\t"' + split[0].toLowerCase() + '" : { "entries" : ' + split[1] + ', "wins" : 0, "lastEntered" : "0/0/0000", "suspended" : "false" },\n';
        }

        lineCount++;
    });

    entryList += "}";
    var obj = JSON.parse(entryList);

    // Stats for user
    console.log("\nLogged", Object.keys(obj).length, "successful entries.");
    console.log("Encountered", errorList.length, "syntax errors.\n");

    errorList.forEach((element) => {
        console.log(element);
    });

    console.log("");

    // Write to file specified by user
    fs.writeFileSync(outputFileName + ".json", entryList, (err) => {
        if (err)
        {
            console.log('\x1b[31m%s\x1b[0m', 'File failed to save.');
            process.exit();
        }
    })

    console.log('\x1b[32m%s\x1b[0m', 'File saved successfully.');
    return obj;
}

 /*
 * startNewRaffle()
 *
 * Input - Name of file passed by user
 * 
 * Output - Prints a completed raffle using the .json file passed
 * 
 * 1) Input winner names to confirm one or more winners and make changes to .json file
 * 2) Roll again without changes
 * 3) Make changes to current raffle
 * 4) Quit to menu
 */

function startNewRaffle(filename)
{
    var fileContents = fs.readFileSync(filename, { "encoding" : "utf8"});
    try
    {
        var entries = JSON.parse(fileContents);
    }
    catch (e)
    {
        console.log("File contained JSON formatting errors.");
        return;
    }

    // Set up initial raffle list
    var changedEntries = manageRaffleList(entries);

    // If user quit from previous menu.
    if (changedEntries == -5)
        return;
    
    // Finalize
    var winner = decideWinner(changedEntries);
    if (winner == -5)
        return;
    
    console.log('\x1b[32m%s\x1b[0m', winner.toUpperCase(), "is the winner!");

    var finalized = readline.question("Would you like to confirm this roll?\n\t1) Input winner name(s) and add rolls to non-winners\n\t2) Discard and roll again\n\t3) Discard and modify raffle list\n\t4) Discard and quit to menu (updates to archive will not be made)\n");
    finalized = finalized.toLowerCase();

    // Question prompt loop to ensure proper input
    while (true)
    {
        // Input names
        if (finalized == 1)
        {
            while (true)
            {
                // Confirm proper winners
                winners = confirmWinners(winner);
                var confirmed = readline.question("Confirm these selected winners? Y/N\n").trim();
                confirmed = confirmed.toLowerCase();

                while (!(confirmed.startsWith("n") || confirmed.startsWith("y")))
                {
                    confirmed = readline.question("Please select Y or N to confirm winners.\n").toLowerCase().trim();
                }

                if (confirmed.toLowerCase().startsWith("n"))
                    continue;

                else
                    break;
            }
            
            enteredNames.forEach(element => {

                // If they're a winner, set entries to 1 and add wins
                if (winners.includes(element))
                {

                    changedEntries[element].entries = 1;
                    changedEntries[element].wins += 1;
                    changedEntries[element].lastEntered = formattedDate();

                    console.log(element.toUpperCase() + " set to", 1,"entry and", changedEntries[element].wins, "wins");
                }
                // If they're not a winner, add more entries
                else
                {
                    changedEntries[element].entries += 1;
                    changedEntries[element].lastEntered = formattedDate();

                    console.log(element.toUpperCase() + " set to", changedEntries[element].entries, "entries.");
                }
            });

            // Sort Object
            // var jsonABC = require('jsonabc');
            // var sorted = jsonABC.sortObj((JSON.parse(JSON.stringify(changedEntries))));
            var sorted = sortJSON(changedEntries);

            // Write to file the updated object
            fs.writeFileSync(filename, JSON.stringify(sorted), (err) => {
                console.log("File could not be found.");
            })

            return;
        }

        // Rolls again
        else if (finalized == 2)
        {
            winner = rollForWinner();
            console.log('\x1b[32m%s\x1b[0m', winner.toUpperCase(), "is the winner!");
            finalized = readline.question("\t1) Input winner name(s) and add rolls to non-winners\n\t2) Discard and roll again\n\t3) Discard and modify raffle list\n\t4) Discard and quit to menu\n").trim();
            continue;
        }

        // Make changes to entries for raffle
        else if (finalized == 3)
        {
            changedEntries = manageRaffleList(entries);
            
            if (changedEntries == -5)
                return;

            winner = decideWinner(changedEntries);

            if (winner == -5)
                return;
            
            console.log('\x1b[32m%s\x1b[0m', winner.toUpperCase(), "is the winner!");
            finalized = readline.question("\n\t1) Input winner name(s) and add rolls to non-winners\n\t2) Discard and roll again\n\t3) Discard and modify raffle list\n\t4) Discard and quit to menu\n").trim();
            continue;
        }

        // Quit to menu
        else if (finalized == 4)
        {
            return;
        }

        // Improper input
        else
        {
            finalized = readline.question("\n\t1) Input winner name(s) and add rolls to non-winners\n\t2) Discard and roll again\n\t3) Discard and modify raffle list\n\t4) Discard and quit to menu\n").trim();
        }
    }
}

 /*
 * confirmWinners()
 *
 * Input - The name of the winner chosen by the raffle roll
 * 
 * Output - An array of strings denoting winner names to be set as winners in archive
 */

function confirmWinners(trueWinner)
{
    console.log(enteredNames);
    console.log("Enter winner names to add/remove from list OR type FINISH to confirm winners:");
    var check;

    // Main input loop
    while (check != 2)
    {
        var winnerName = readline.question();
        winnerName = winnerName.toLowerCase().trim();

        var winnerNames = [];
        winnerNames.push(winnerName.trim());

        if (winnerName.includes(','))
        {
            winnerNames = winnerName.split(',');
        }
        
        winnerNames.forEach(element => {

            check = addWinners(element.trim(), trueWinner);
        });
    }

    return winners;
}

function addWinners(winnerName, trueWinner)
{
    if (enteredNames.includes(winnerName))
    {
        // Remove name from selected list
        if (winners.includes(winnerName))
        {
            winners = winners.filter(element => {
    
                return element != winnerName;
            });
            console.log(winnerName.toUpperCase() + " removed.");
        }

        // Add name to selected list
        else
        {
            winners.push(winnerName);
            console.log(winnerName.toUpperCase() + " entered.");
        }
    }
    
    // Confirm names
    else if (winnerName == "finish")
    {
        if (winners.length == 0)
        {
            console.log("No winners entered.");
            return 1;
        }

        // Actual winner is not present in selected list
        else if (!winners.includes(trueWinner))
        {
            console.log("Winners list does not contain the original winner, " + trueWinner.toUpperCase() + ".");
            return 1;
        }

        else
        {
            console.log("Confirmed these winners:")
            console.log(winners);
            return 2;
        }
    }

    // Name not in entry list
    else
    {
        console.log(winnerName + " did not enter raffle!");
    }
}

 /*
 * ,amaheRaffleList()
 *
 * Input - JSON raffle archive object
 * 
 * Output - Returns new JSON object
 * 
 * 1) Shows list of entire names applicable
 * 2) Shows names currently listed
 * 3) Confirms list of names selected
 * 4) Exits to last menu
 */

function manageRaffleList(obj)
{
    var entries = obj;
    var check;

    console.log("Loaded", Object.keys(entries).length, "entries into table.")
    console.log("\nEnter usernames wishing to participate in the raffle -- Enter again to remove from raffle list -- You can enter multiple names separated by commas\n(Names not currently on list can be added too! To skip confirmation, put a * at the end of the name)\n\n\t1) Show table\n\t2) Show current raffle list\n\t3) Confirm the raffle\n\t4) Exit to previous menu");

    // Main input loop
    while (true)
    {
        name = readline.question();
        name = name.toLowerCase().trim();

        if (name.includes(','))
        {
            var names = name.split(',');

            check = names.forEach(element => {
                addName(element.trim(), entries);
            });
        }
        else
        {
            check = addName(name.trim(), entries);
        }

        if (check == 4 || name == 4)
        {
            return -5;
        }
        else if (check == 3)
        {
            break;
        }
        else
        {
            continue;
        }
    }

    console.log("Read", raffleArray.length, "names to list.");
    console.log(raffleArray);
    return entries;
}

/*
 * decideWinner()
 *
 * Input - JSON object of entries
 * 
 * Output - Rolls for a winner, or modifies the entry list.
 * 
 * 1) Rolls for winner
 * 2) Allows user to modify the entry list
 * 3) Quits
 */

function decideWinner(entries)
{
    while (true)
    {
        var roll = readline.question("\t1) Perform raffle\n\t2) Modify raffle list\n\t3) Return to main menu.\n");
        roll = roll.toLowerCase();

        if (roll == 1)
        {
            return rollForWinner();
        }

        else if (roll == 2)
        {
            changedEntries = manageRaffleList(entries);
        }

        else if (roll == 3)
        {
            return -5;
        }

        else
        {
            continue;
        }
    }
}

/*
 * rollForWinner()
 *
 * Input - None
 * 
 * Output - Returns winner from array of actual entries
 */

function rollForWinner()
{
    var randomNum = Math.floor(Math.random() * raffleArray.length);
    winner = raffleArray[randomNum];

    return winner;
}

function changeEntries(filename)
{
    var fileContents = fs.readFileSync(filename, { "encoding" : "utf8"});
    try
    {
        var entries = JSON.parse(fileContents);
    }
    catch (e)
    {
        console.log("File contained JSON formatting errors.");
        return;
    }


    while (true)
    {
        var changeChoice = readline.question("What would you like to change?\n\n\t1) Add/Remove user\n\t2) Edit user's info\n\t3) Suspend/Unsuspend user\n\t4) Show current raffle archive\n\t5) Confirm changes and return to menu\n");
        
        while (changeChoice != 1 && changeChoice != 2 && changeChoice != 3 && changeChoice != 4 && changeChoice != 5)
        {
            changeChoice = readline.question("Select either:\n\n\t1) Add/Remove user\n\t2) Edit user's info\n\t3) Suspend/Unsuspend user\n\t4) Show current raffle archive\n\t5) Confirm changes and return to menu\n");
        }

        if (changeChoice == 1)
        {
            var changeName = readline.question("Enter user to add/remove. Type QUIT at any time to exit.\n");
            changeName = changeName.toLowerCase();

            if (changeName == "quit")
            {
                continue;
            }

            // Name in object, remove
            if (changeName in entries)
            {
                console.log(entries[changeName]);
                var removeConfirm = readline.question("Confirm to remove " + changeName + " from list? Y/N\n")

                while (!(removeConfirm.startsWith("n") || removeConfirm.startsWith("y")))
                {
                    removeConfirm = readline.question("Please select Y or N to remove " + changeName + "to archive or QUIT to exist.\n").toLowerCase();
                }

                if (removeConfirm == "quit")
                {
                    continue;
                }

                if (removeConfirm.startsWith("y"))
                {
                    delete entries[changeName];
                }

                else
                {
                    continue;
                }
            }

            // Name not found, add own
            else
            {
                entries = addEntry(entries, changeName);
            }
        }

        else if (changeChoice == 2)
        {

            var changeName = readline.question("Enter user to edit or type QUIT at any time to exit.\n").trim();
            changeName = changeName.toLowerCase();

            if (changeName == "quit")
            {
                continue;
            }

            // Not in archive
            if (!(changeName in entries))
            {
                var addConfirm = readline.question("Name is not in archive, would you like to add it? Y/N\n");
                addConfirm = addConfirm.toLowerCase();

                while (!(addConfirm.startsWith("n") || addConfirm.startsWith("y")))
                {
                    addConfirm = readline.question("Please select Y or N to adding " + changeName + "to archive or QUIT to exist.\n").toLowerCase();
                }

                if (addConfirm == "quit")
                {
                    continue;
                }

                if (addConfirm.startsWith("y"))
                {
                    entries = addEntry(entries, changeName);
                }
                else
                {
                    continue;
                }
            }

            // In archive
            else
            {

                while(true)
                {
                    
                    console.log("Current user: " + changeName.toUpperCase());
                    console.log(entries[changeName]);
                    console.log();

                    var selectEdit = readline.question("What would you like to edit?\n\n\t1) Name\n\t2) Entries\n\t3) Wins\n\t4) Save and Quit\n");

                    // Edit name
                    if (selectEdit == 1)
                    {
                        var newName = readline.question("What should the new name be?\n").trim();
                        newName = newName.toLowerCase();

                        while (newName in entries && newName != "quit")
                        {
                            newName = readline.question("New name already exists in archive. Select new name not from archive or type QUIT.\n").trim();
                            newName = newName.toLowerCase();
                        }

                        if (newName == "quit")
                        {
                            continue;
                        }

                        var newObj = '{ "entries" : ' + entries[changeName].entries + ', "wins" : ' + entries[changeName].wins + ', "lastEntered" : "' + entries[changeName].lastEntered + '", "suspended" : ' + '"' + entries[changeName].suspended + '"' + '}';
                        delete entries[changeName];
                        entries[newName] = JSON.parse(newObj);

                        console.log(changeName.toLocaleUpperCase() + " changed to " + newName.toUpperCase() + "\n");
                        changeName = newName;
                    }

                    // Edit entries
                    else if (selectEdit == 2)
                    {
                        var newEntries = readline.question("What should the number of entries be?\n").trim();

                        while (newEntries.match(/^[0-9]+$/) == null) 
                        {
                            if ("" + newEntries.toLowerCase() == "quit")
                            {
                                break;
                            }
    
                            newEntries = readline.question("Please enter a valid number or QUIT to exit.\n").trim();
                        }
                    
                        if (newEntries.toLowerCase() == "quit")
                        {
                            continue;
                        }

                        var oldEntries = entries[changeName].entries;
                        entries[changeName].entries = parseInt(newEntries);

                        console.log(oldEntries + " changed to " + newEntries + "\n");
                    }

                    // Edit wins
                    else if (selectEdit == 3)
                    {
                        var newWins = readline.question("What should the number of previous wins be?\n").trim();

                        while (newWins.match(/^[0-9]+$/) == null) 
                        {
                            if ("" + newWins.toLowerCase() == "quit")
                            {
                                break;
                            }
                            newWins = readline.question("Please enter a valid number or QUIT to exit.\n").trim();
                        }
                    
                        if (newWins.toLowerCase() == "quit")
                        {
                            continue;
                        }

                        var oldWins = entries[changeName].wins;
                        entries[changeName].wins = parseInt(newWins);

                        console.log(oldWins + " changed to " + newWins);
                    }

                    else if (selectEdit == 4)
                    {
                        break;
                    }

                    else
                    {
                        selectEdit = readline.question("Please select either\n\n\t1) Name\n\t2) Entries\n\t3) Wins\n\t4) Save and quit\n");
                    }
                }
            }
        }

        else if (changeChoice == 3)
        {
            
            var changeName = readline.question("Enter user to suspend/unsuspend or type QUIT at any time to exit.\n").trim();
            changeName = changeName.toLowerCase();

            if (changeName == "quit")
            {
                continue;
            }

            // Not in archive
            if (!(changeName in entries))
            {
                var suspendConfirm = readline.question("Name is not in archive, would you like to add it? Y/N\n").trim();
                suspendConfirm = suspendConfirm.toLowerCase();

                while (!(suspendConfirm.startsWith("n") || suspendConfirm.startsWith("y")))
                {
                    suspendConfirm = readline.question("Please select Y or N to adding " + changeName + "to archive or QUIT to exist.\n").toLowerCase().trim();

                    if (suspendConfirm == "quit")
                    {
                        break;
                    }
                }

                if (suspendConfirm == "quit")
                {
                    continue;
                }

                if (suspendConfirm.startsWith("y"))
                {
                    entries = addEntry(entries, changeName);
                }
                else
                {
                    continue;
                }
            }

            else
            {
                if (entries[changeName].suspended == "false")
                {
                    // var suspendConfirm = readline.question("Would you like to suspend " + changeName + "? Y/N\n");
                    // suspendConfirm = suspendConfirm.toLowerCase();

                    // while (!(suspendConfirm.startsWith("n") || suspendConfirm.startsWith("y")))
                    // {
                    //     suspendConfirm = readline.question("Please select Y or N to confirm suspendeding " + changeName + " or type QUIT to exit.\n").toLowerCase();

                    //     if (suspendConfirm == "quit")
                    //     {
                    //         break;
                    //     }
                    // }

                    // if (suspendConfirm == "quit")
                    // {
                    //     continue;
                    // }

                    // if (suspendConfirm.startsWith("y"))
                    // {
                        entries[changeName].suspended = "true";
                        console.log(entries[changeName]);
                        console.log(changeName.toUpperCase() + " is now suspended.\n");
                    // }

                    // else
                    // {
                    //     continue;
                    // }
                }
                else
                {
                    // var suspendConfirm = readline.question("Would you like to unsuspend " + changeName + "? Y/N\n");
                    // suspendConfirm = suspendConfirm.toLowerCase();

                    // while (!(suspendConfirm.startsWith("n") || suspendConfirm.startsWith("y")))
                    // {
                    //     suspendConfirm = readline.question("Please select Y or N to confirm unsuspendeding + " + changeName + " or type QUIT to exit.\n").toLowerCase();

                    //     if (suspendConfirm == "quit")
                    //     {
                    //         break;
                    //     }
                    // }

                    // if (suspendConfirm == "quit")
                    // {
                    //     continue;
                    // }

                    // if (suspendConfirm.startsWith("y"))
                    // {
                        entries[changeName].suspended = "false";
                        console.log(entries[changeName]);
                        console.log(changeName.toUpperCase() + " is now unsuspended.\n");
                    // }

                    // else
                    // {
                    //     break;
                    // }
                }
            }
        }

        else if (changeChoice == 4)
        {
            Object.keys(entries).forEach(element => {

                var string = element + "    ";
                for (i = 0 ; i < 28 - element.length ; i++)
                    string += "-";

                string += "    ";

                console.log(string, entries[element]);
            });

        }
        
        else if (changeChoice == 5)
        {
            // Sort Object
            // var jsonABC = require('jsonabc');
            // var sorted = jsonABC.sortObj((JSON.parse(JSON.stringify(entries))));
            var sorted = sortJSON(entries);

            // Write to file the updated object
            fs.writeFileSync(filename, JSON.stringify(sorted), (err) => {
                console.log("File could not be found.");
            })

            return;
        }
    }
    
}

function addName(name, entries)
{
    if (name in entries)
    {
        // Remove names from lists
        if (enteredNames.includes(name))
        {
            enteredNames = enteredNames.filter(element => {
    
                return element != name;
            });

            raffleArray = raffleArray.filter(element => {
    
                return element != name;
            });

            totalEntries -= entries[name].entries;
            console.log(name.toUpperCase(), "removed to raffle.", entries[name]);
        }

        // Add names to list
        else
        {
            if (entries[name].entries == 0)
                entries[name].entries = 1;

            // Suspended user
            if (entries[name].suspended == "true")
            {
                var suspended = readline.question("User is suspended! Proceed anyways? Y/N\n");
                suspended = suspended.toLowerCase().trim();
                    
                while (!(suspended.startsWith("n") || suspended.startsWith("y")))
                {
                    suspended = readline.question("Please select Y or N to confirm overruling suspension.\n").toLowerCase().trim();
                }

                if (suspended.startsWith("n"))
                {
                    console.log(name + " not added to list due to suspension.");
                    return 5;
                }
                if (suspended.startsWith("y"))
                {
                    enteredNames.push(name);
                    for (i = 0 ; i < entries[name].entries ; i++)
                    {
                        raffleArray.push(name);
                        totalEntries += 1;
                    }
                    console.log(name.toUpperCase(), "added to raffle.", entries[name]);
                }
            }
            // Add normal user
            else
            {
                enteredNames.push(name);
                for (i = 0 ; i < entries[name].entries ; i++)
                {
                    raffleArray.push(name);
                    totalEntries += 1;
                }
                console.log(name.toUpperCase(), "added to raffle.", entries[name]);
            }
        }
        return 5;
    }

    // Quit
    else if (name == 4)
    {
        return 4;
    }
    
    // Confirms
    else if (name == 3)
    {
        if (enteredNames.length == 0)
        {
            console.log("No names entered.");
        }
        else
        {
            return 3;
        }
    }

    // Lists current selection of names
    else if (name == 2)
    {
        if (enteredNames.length == 0)
        {
            console.log("List is empty.");
        }
        else
        {
            console.log("Current raffle list of", enteredNames.length, "people and", totalEntries, "total entries.\n");

            enteredNames.forEach(element => {
                console.log("\t", element, entries[element]);
            });
        }
        return 2;
    }

    // Show entire list of people archived
    else if (name == 1)
    {
        Object.keys(entries).forEach(element => {

            var string = element + "    ";
            for (i = 0 ; i < 28 - element.length ; i++)
                string += "-";

            string += "    ";

            console.log(string, entries[element]);
        });

        console.log("\nEnter usernames wishing to participate in the raffle -- Enter again to remove from raffle list -- You can enter multiple names separated by commas\n(Names not currently on list can be added too! To skip confirmation, put a * at the end of the name)\n\n\t1) Show table\n\t2) Show current raffle list\n\t3) Confirm the raffle\n\t4) Exit to previous menu");
        return 1;
    }

    // Name not in archive
    else
    {
        if (!name.endsWith("\*"))
        {
            var confirmName = readline.question(name.toUpperCase() + " not found in archive. Would you like to add to the list and make an archive entry anyways? Y/N\n");
            confirmName = confirmName.toLowerCase().trim();
            
            while (!(confirmName.startsWith("n") || confirmName.startsWith("y")))
            {
                confirmName = readline.question("Please select Y or N to confirm adding user to list and archive.\n").toLowerCase().trim();
            }

            // Add name to archive
            if (confirmName.startsWith("y"))
            {
                entries[name] = { "entries" : 1, "wins" : 0, "lastEntered" : formattedDate(), "suspended" : "false" };
                
                enteredNames.push(name);
                for (i = 0 ; i < entries[name].entries ; i++)
                {
                    raffleArray.push(name);
                    totalEntries += 1;
                }

                console.log(name.toUpperCase(), "added to raffle and archive.", entries[name]);
            }

            else if (confirmName.startsWith("n"))
            {
                console.log(name.toUpperCase() + " not added. Continue entering names to add to raffle list.");
            }
        }

        // Name ends with *, skip confirmation
        else
        {
            // Add name to archive
            name = name.replace(/\*$/, "");
            
            if (!enteredNames.includes(name))
            {
                entries[name] = { "entries" : 1, "wins" : 0, "lastEntered" : formattedDate(), "suspended" : "false" };
                
                enteredNames.push(name);
                for (i = 0 ; i < entries[name].entries ; i++)
                {
                    raffleArray.push(name);
                    totalEntries += 1;
                }

                console.log(name.toUpperCase(), "added to raffle and archive.", entries[name]);
            }
            
            else
            {
                console.log("Name already exists in archive! Remove the * at the end.");
            }
            return 0;
        }
    }
}

function addEntry(entries, changeName)
{
    var changeEntries = readline.question("\n" + changeName.toUpperCase() + " selected, how many entries should they have?\n").trim();

    while (changeEntries.match(/^[0-9]+$/) == null)
    {

        if ("" + changeEntries.toLowerCase() == "quit")
        {
            break;
        }

        changeEntries = readline.question("Please enter a valid number or QUIT to exit.\n").trim();
    }

    if (changeEntries.toLowerCase() == "quit")
    {
        return entries;
    }

    console.log("\nUser: " + changeName.toUpperCase() + "   Entries:", changeEntries, "\nIs user suspended? Y/N");
    var setSuspended = readline.question().trim();
    setSuspended = setSuspended.toLowerCase();

    while (!(setSuspended.startsWith("n") || setSuspended.startsWith("y")))
    {
        if (setSuspended.toLowerCase() == "quit")
        {
            break;
        }

        setSuspended = readline.question("Please select Y or N to confirm winners or QUIT to exit.\n").toLowerCase().trim();
    }

    if (setSuspended.toLowerCase() == "quit")
    {
        return entries;
    }

    if (setSuspended.startsWith("y"))
    {
        setSuspended = "true";
    }
    else
    {
        setSuspended = "false";
    }

    var obj = '{ "entries" : ' + changeEntries + ', "wins" : 0, "lastEntered" : "0/0/0000", "suspended" : ' + '"' + setSuspended + '"' + '}';
    entries[changeName] = JSON.parse(obj);

    console.log("Added entry:");
    console.log(entries[changeName]);
    return entries;
}

/*
 * formattedDate()
 *
 * Input - None
 * 
 * Output - Gets today's date in mm/dd/yyyy format
 */

function formattedDate()
{
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth() + 1;
    var yyyy = today.getFullYear();

    if (dd < 10) 
    {
        dd = '0' + dd;
    } 
    if (mm < 10) 
    {
        mm = '0' + mm;
    } 

    var today = mm + '/' + dd + '/' + yyyy;
    
    return today;
}

function sortJSON(unordered)
{
    const ordered = {};
    Object.keys(unordered).sort().forEach(function(key) {
        ordered[key] = unordered[key];
    });

    return ordered;
}

