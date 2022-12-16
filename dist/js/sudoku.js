// TO DO:
// -create "log" array to track steps, implement ctrl z & undo button
// -track table progress in cache to continue later
// -change features to on/off options:
//    -show errors
//    -update notes
//    **once I know how to make the solution grid...:
//    -new feature: hint
//    -new feature: check for mistakes

//Create DOM variables
const gameTable = document.querySelector(".gameTable");
const difficultyButtons = document.querySelectorAll("#difficultyButtons button.difficulty");
const userPanel = document.querySelector(".userPanel");
const newGameButton = document.querySelector("#newGame");
const notesButton = document.querySelector("#pencilNotes");
const notesButtonSpan = notesButton.querySelector("#onOff");
const timerButton = document.querySelector("#timerButton");
const timerMinutes = document.querySelector("#timerMinutes");
const timerSeconds = document.querySelector("#timerSeconds");

//Create other tracking variables
let selectedCell;
let selectedNumber;
let matchingNumberCells = [];
let notesModeIsOn = false;
let didWin = false;
let difficultyLevel = 0;

let startingTables = [

    //Easy
    [
        [null, 6, null, null, 1, null, null, null, 4],
        [null, 8, null, null, 9, null, 2, null, null],
        [4, null, null, null, null, null, 6, 1, 3],
        [5, null, 7, 4, 6, null, 8, 3, 2],
        [null, 2, 4, null, 3, 5, null, 9, 6],
        [null, 3, 6, 2, null, null, 7, null, null],
        [6, null, null, 1, 5, null, 4, 2, null],
        [null, 4, 5, null, null, null, 3, 7, null],
        [null, null, 8, null, null, 7, null, null, null]
    ],
    //Medium
    [
        [null, 6, null, null, null, null, 7, 3, null],
        [null, null, 4, null, 2, 8, null, null, null],
        [null, null, null, null, null, 3, null, null, 9],
        [5, null, null, null, 7, null, null, null, 4],
        [null, null, null, null, null, 1, null, null, 7],
        [8, null, 7, null, 4, null, null, 6, 3],
        [7, 5, null, null, 8, null, 9, null, null],
        [null, null, null, 3, null, 6, 4, null, null],
        [4, null, 6, 1, null, 7, null, null, 2]
    ],
    //Hard
    [
        [null, 6, null, null, null, null, null, 1, null],
        [7, null, 1, null, null, null, null, null, 4],
        [null, null, 3, 9, null, null, null, null, null],
        [6, null, 9, null, null, null, null, null, 5],
        [null, 5, null, null, null, 9, 7, 2, null],
        [null, 7, null, 2, null, 6, null, null, null],
        [null, null, 6, null, 3, null, null, null, null],
        [9, null, null, 7, null, null, 5, 3, null],
        [null, null, null, null, 9, null, 1, null, null]
    ],
    //Expert
    [
        [null, 7, null, null, null, null, null, 9, null],
        [null, null, 9, null, null, 3, null, 1, null],
        [5, 6, null, null, 2, 8, null, null, null],
        [null, null, null, 6, null, null, null, null, 1],
        [null, null, null, null, 4, null, null, null, null],
        [2, 5, null, null, 3, null, null, 6, null],
        [8, null, null, null, 5, null, 9, null, null],
        [null, null, null, null, 9, null, null, 2, null],
        [null, null, 6, null, null, null, null, 7, null]
    ]


]



init();


// ***************************** //
//***** Table Setup Methods *****//
// ***************************** //

function init() {
    includeFillRange(); //add a custom method to the Array prototype
    initPanel();
    initGameTable();
    fillTable();
    initDifficultyBar();

    //set click & keypress handlers
    document.onkeydown = keyDown;
    document.onclick = globalClick;
    window.addEventListener("keydown", function(event) {
        if([32,37,38,39,40].indexOf(event.keyCode) > -1) {
            event.preventDefault();
        }
    });

    //set up timer
    initTimer();
}

//setup HTML (gameTable)
function initGameTable() {

    //set new row 9x
    for(let i=0; i<9; i++) {
        let row = gameTable.insertRow();
        row.className = "gameRow";

        //set new td 9x
        for (let i=0; i<9; i++) {
            let cell = row.insertCell();
            cell.className = "gameCell";
            cell.addEventListener("click",cellClicked);

            //set cell display
            const displayDiv = document.createElement('div');
            displayDiv.classList.add('cellValue');
            cell.appendChild(displayDiv);
            
            //add span to displayDiv
            const displaySpan = document.createElement('span');
            displaySpan.innerText = "";
            displayDiv.appendChild(displaySpan);

            //set pencil grid
            const pencilGridDiv = document.createElement('div');
            pencilGridDiv.classList.add("pencilGrid");
            cell.appendChild(pencilGridDiv);
            for (let i=0; i<9; i++) {
                const newDiv = document.createElement('div');
                newDiv.classList.add("pencilGridCell", "pencilGridCell" + (i+1));
                pencilGridDiv.appendChild(newDiv);
            }
        }

    }
}


//fill game table with numbers
function fillTable() {

    //Systematic Pattern
    // for (let i=0; i<=8; i++) {

    //     for (let j=0; j<=8; j++) {
    //         //equation to set x: 0,3,6,(+1)1,4,7,(+2)2,5,8
    //         let x = (3*j)%9+Math.floor(3*j/9);
    //         // if(i===0) {console.log("j:"+j+" x:"+x);}
    //         setCellValue(j,i,(i+x)%9+1); //this equation offsets the values by 3, wrapping around 9
    //     }
    // }

    let newGameTable = startingTables[difficultyLevel];

    //Preset Table
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            let cell = getCell(i,j);
            let value = newGameTable[i][j];
            if(value) {
                setCellValue(i, j, value);
                cell.classList.add("startValue");
            } else {
                cell.classList.add("userValue");
            }
        }
    }
};

function initDifficultyBar() {
    difficultyButtons[0].classList.add("selected");
    difficultyButtons.forEach( (item, level) => {
        item.addEventListener('click', () => {
            setDifficulty(level);
        });
    });
}


function createNewTable() {
    //requires custom array prototype method "fillRange"

    let newTable = [];
    for (let i = 0; i < 9; i++) {
        newTable[i] = new Array(9).fill(null).slice(0);
    }

    let numbers = [];

    // first row
    numbers.fillRange(1,9);

    for(let j=0; j<=8; j++) {
        let index = randInt(0,numbers.length-1);
        newTable[0][j] = Number(numbers.splice(index,1));
    }

    //columns 2-3
    //distribution of first three indeces
    let randDist = randInt(1,20);
    let numMoveRight = 1; //match random distribution
    if (randDist === 20) {
        numMoveRight = 3;
    } else if (randDist ===19) {
        numMoveRight = 0;
    } else if (randDist < 10) {
        numMoveRight = 2;
    }

    //repeat this code for rows 2 and 3:
    for(let i = 1; i < 3; i++) {
        numbers.fillRange(1,9); //use to track open indeces
        for (let box = 0; box < 3; box++) {
            for (let j = 0; j < 3; j++) {

            }
        }
    }


    return newTable;
    // //set up startingTable with newTable values
    // for (let i = 0; i < newTable.length; i++){
    //     startingTable[i] = newTable[i].slice();
    // }


}

//Setup User Panel:
function initPanel() {

    //panel button event listeners
    newGameButton.addEventListener("click", newGame);
    notesButton.addEventListener("click", togglePencilGrid);
    
    let numberGrid = userPanel.querySelector("table.numberHighlightGrid");

    for (let i = 0; i < 3; i++) {

        let row = numberGrid.insertRow();
        row.classList.add("numbersRow");

        for (let j = 0; j < 3; j++) {

            let cell = row.insertCell();
            cell.classList.add("numbersCell");
            cell.innerText = 3*i + j + 1
            cell.addEventListener("click", function() {
                inputCellValue(selectedCell, Number(this.innerText));
            });
        }
    }
}

//save/load data from local storage
function storeData() {
    let storedTable = localStorage.setItem('sudokuTable', gameTable);

}

function loadData() {
    if(localStorage.getItem('sudokuTable')) {

    }
}

function resetGameTable() {
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            let cell = getCell(i,j);
            if(cell.classList.contains("startValue")) {
                cell.classList.remove("startValue");
            } else {
                cell.classList.remove("userValue");
            }
            clearCell(i,j);
            clearNotes(cell);
        }
    }

    didWin = false;
}

// ****************************** //
// ****************************** //


//***** Other Top Level Functions *****//
// *********************************** //

// //Testing recursive function
// function fillTableWithEx(index) {
//     let row = (index/9 >>0); let col = index % 9;
//     let cell = getCell(row, col);
//     if(cell) {
//         if(!cell.classList.contains("startValue")) {
//             cell.querySelector(".cellValue span").innerText = "!";
//         }
//         fillTableWithEx(index+1);
//     } else {
//         return
//     }
// }


function solveTable() {

    //*** Solver V. 2.1 ***//
    //changes to make:
    // - remove available numbers for initial filled in numbers (or don't update them?)
    let numberOfSolutions = 0; //still need to implement this counter!

    initAvailableNumbersArray();
    setInitialAvailableNumbers();
    let result = fillNextCell();
    console.log(result);

    function fillNextCell() {
        //recursive function
        //steps:
        // 1) select next cell with findFewestAvailableNumbers function

        let cell = findFewestAvailableNumbers();

        //    If no empty cells - return SOLVED
        //    If 0 available numbers - return INSOLVABLE

        if (!cell) {return "SOLVED"}
        if (cell.availableNumbers.length === 0) {return "UNSOLVABLE"}
        
        let row = getCellRow(cell); let col = getCellCol(cell);

        // 2) loop through available values:

        for (let i = 0; i < cell.availableNumbers.length; i++) {

            //    a) initiate a variable array to track cells this is deleted from
            let changedCells = [];

            //    b) set the cell to available value i
            let value = cell.availableNumbers[i];
            setCellValue(row, col, value);

            //    c) delete value[i] from every related cell that has value in its available values
            //       add the coordinates from every cell this was deleted from to array
            forEachRelated(cell, (x,y) => {
                let relatedCell = getCell(x,y);
                let index = relatedCell.availableNumbers.indexOf(value);
                if(index >= 0) {
                    relatedCell.availableNumbers.splice(index,1);
                    changedCells.push({"row":x,"col":y});
                }
            });

            //    d) call fillNextCell to continue filling cells
            let result = fillNextCell();
            
            //    e) after this is called, check the return value (puzzle solved, insolvable)
            if (result === "SOLVED") {
                return result;
            }

            //    f) add the deleted value back to available numbers for every cell in the changed numbers list
            changedCells.forEach( (el) => {
                let cell = getCell(el.row, el.col);
                cell.availableNumbers.push(value);
            });

            //    g) clear cell (if this was the last number, and the puzzle is still unsolvable, it's time to backtrack)
            cell.querySelector(".cellValue span").innerText = "";

            //    g) step is complete. The number has been tested through all possible outcomes of future cells. Continue loop.

        }

        // 3) Every possible value has now been checked for the cell. Either:
        //    1 - the puzzle has been solved - (already returned)
        //    2 - the puzzle was insolvable - (return insolvable)
    }


    function initAvailableNumbersArray() {
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++){
                let cell = getCell(row,col);
                cell.availableNumbers = [];
                for (let num = 1; num <=9; num++) {
                    cell.availableNumbers.push(num);
                }
            }
        }
    }

    function setInitialAvailableNumbers(count=0) {
        //loop through filled cells, and apply value to other cells
        if(count < 81) {
            //setup cell for given count value
            let row = (count/9 >>0); let col = count%9;
            let cell = getCell(row, col);
            let cellValue = getCellValue(row,col);

            if (cellValue) { //for any cells that are not empty...
                forEachRelated(cell, (x,y) => {
                    let relatedCell = getCell(x,y);
                    let index = relatedCell.availableNumbers.indexOf(cellValue);
                    if(index >= 0) {
                        relatedCell.availableNumbers.splice(index,1);
                    }
                });

            }


            setInitialAvailableNumbers(count+1); //continue recursion
        } else {
            return; //end recursion if count reaches 81 (outside table range)
        }
    }


    function findFewestAvailableNumbers() { //returns an optional cell
        var fewestAvailable = 10;
        var nextCell = null;
    
        function searchCells(count=0) {
            //requres "fewestAvailable" and "nextCell" variables to exist.
            //call with count = 0;
            if(count < 81) {
                let row = (count/9 >>0); let col = count%9;
                let cell = getCell(row, col);
                if (!getCellValue(row, col)) { //if cell is empty, check available numbers list.
                    // console.log("row: " + row + ", col: " + col);
                    // console.log(cell.availableNumbers);
                    if (cell.availableNumbers.length < fewestAvailable) {
                        nextCell = cell;
                        fewestAvailable = cell.availableNumbers.length;
                    }
                }
                searchCells(count+1);
            } else {
                return;
            }
        }
    
        searchCells();
    
        return nextCell;
    }



    // //Solver V. 2.0
    // let numberOfSolutions = 0; //still need to implement this counter!
    // let movingForward = true;

    // let count = 0; //row = (count/9>>0), col = count%9;
    // let row, col;
    // while (count < 81 && count >= 0) { //loop through table rows
    //     row = (count/9>>0); //drop decimal
    //     col = count%9;
    //     let cell = getCell(row, col);

    //     if (cell.classList.contains("startValue")) { //skip over starting values
    //         count += movingForward? 1:-1;
    //         continue;
    //     } else { //if the cell is editable by the user...

    //         if (movingForward) { //set up available numbers
    //             //reset list of available numbers to include all
    //             let numbers = [];
    //             numbers.fillRange(1,9);
    //             cell.availableNumbers = numbers.slice(0);

    //             forEachRelated(cell, function(x,y) {
    //                 let unavailableValue = getCellValue(x,y);
    //                 if (!unavailableValue) {unavailableValue = 0}
    //                 let index = cell.availableNumbers.indexOf(unavailableValue);
    //                 if (index >= 0) {
    //                     cell.availableNumbers.splice(index,1);
    //                 }
    //             });
    //             cell.availableNumberCount = 0;
    //         } else {
    //             cell.availableNumberCount +=1;
    //         }

    //         if (cell.availableNumberCount < cell.availableNumbers.length) {
    //             setCellValue(row,col,cell.availableNumbers[cell.availableNumberCount])
    //             movingForward = true;
    //         } else {
    //             cell.querySelector(".cellValue span").innerText = "";
    //             movingForward = false;
    //         }
    //     }

    //     //iteration
    //     count += movingForward? 1:-1;
    // }

    // if (count < 0) {console.log("count < 0 : no solution found")}
    // if (count > 81) {console.log("count > 81 : solution found")}





//    // Alternative Method
//     let i = 0; let j = 0;
//     while (i < 9 && i >= 0) { //loop through table rows

//         while (j < 9 && j >= 0) { //loop through table columns

//             let cell = getCell(i,j);

    //         if (cell.classList.contains("startValue")) { //skip over starting values
    //             j += movingForward? 1:-1;
    //             continue;
    //         } else { //if the cell is editable by the user...
    //             let val = getCellValue(i,j);
    //             if (!val) {val = 0} //replace null value with 0, which will increment to 1
    //             val += 1;
    //             while(val <= 9) { //keep checking for errors until a valid value is found, or all values have been checked
    //                 let errors = checkForErrors(i,j,val);
    //                 if (errors.length === 0) { //valid value has been found. Set the cell value, break the loop, and move forward
    //                     setCellValue(i,j,val);
    //                     movingForward = true;
    //                     break;
    //                 }
    //                 val += 1; //increment to next value up
    //             }
    //             if (val > 9) {
    //                 //loop could have broken for two reasons:
    //                 //   If a correct value is found, no additional code is needed.
    //                 //   If the value is > 9, no valid value was found. A previous error must have been made. Start moving backwards.
    //                 cell.querySelector(".cellValue span").innerText = "";
    //                 movingForward = false;
    //             }
    //         }
    //         j += movingForward ? 1:-1;
    //     }
    //     j = movingForward ? 0:8;
    //     i += movingForward ? 1:-1;
    // }
}



// ************************************* //
// ************************************* //



//*** Event Listener Methods ***//

function setDifficulty(level) {
    if(timerMinutes.innerText>0 || timerSeconds.innerText>5) {
        let answer = confirm("Would you like to reset the game?");
        if (!answer) {
            return;
        }
    }
    difficultyButtons[difficultyLevel].classList.remove("selected");
    difficultyLevel = level;
    difficultyButtons[difficultyLevel].classList.add("selected");

    resetGameTable();
    fillTable();
    resetTimer();
    stopTimer();
}

function cellClicked() {
    let cell = deselectCell();
    if (this === cell) {return} //if selection is same as previous, deselect and break

    selectCell(this);
}

function globalClick(event) {
    let isClickInsideGameTable = gameTable.contains(event.target);
    let isClickInsideUserPanel = userPanel.contains(event.target);

    if(!isClickInsideGameTable && !isClickInsideUserPanel) {
        deselectCell();
    }
}

function keyDown(event) {
    if (event.repeat) {return} //prevent repeated keycode press

    let code = event.keyCode;

    if (code >= 49 && code <= 57) { //only num keys 1-9
        let num = code-48; //convert the code directly to the number pressed
        inputCellValue(selectedCell, num);

    } else if ([8, 46, 32].indexOf(code) > -1) { //backspace, delete, or space
        if (selectedCell) {
            clearCell(getCellRow(selectedCell), getCellCol(selectedCell));
            clearNotes(selectedCell);
        }
    } else if (code === 78) { //"N" - toggle notes
        togglePencilGrid();        
        
    } else if ([37,38,39,40].indexOf(code) > -1) { // left, right, up, or down arrows
        //move selected cell, if one is selected
        if (selectedCell) {
            row = getCellRow(selectedCell);
            col = getCellCol(selectedCell);
            if (code === 37 && col > 0) {
                col -= 1;
            } else if  (code === 39 && col < 8) {
                col += 1;
            } else if  (code === 38 && row > 0) {
                row -= 1;
            } else if  (code === 40 && row < 8) {
                row += 1;
            }
            deselectCell();
            selectCell(getCell(row, col));
        }

    } else if (code === 27) { //esc key
        deselectCell();
    }


    console.log("Keypress CODE: " + code);
}

function newGame(confirmation = false) {
    if(confirmation != true) {
        let newGameConfirmation = confirm("Are you sure you would like to reset the game?");
        if (!newGameConfirmation) {return}
    }

    deselectCell(selectedCell);
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            let cell = getCell(i,j);
            cell.classList.remove("errorValue");
            if(cell.classList.contains("userValue")) {
                cell.querySelector(".cellValue span").innerText = "";
                clearNotes(cell);
            }
        }
    }
    resetTimer();
}

function togglePencilGrid() {

    if (notesButtonSpan.innerText === "ON") {
        notesButtonSpan.innerText = "OFF";
        notesButtonSpan.style.backgroundColor = "#aa3333";
        notesModeIsOn = false;
    } else {
        notesButtonSpan.innerText = "ON";
        notesButtonSpan.style.backgroundColor = "#33aa33";
        notesModeIsOn = true;
    }

}



//*** General Use Methods ***//

function inputCellValue(cell, num) {
    if (!cell) {return}
    if (cell.classList.contains("startValue")) {return} //never change value of initial cells

    if (!window.sudokuTimer) { //start timer when number is input, if timer is paused
        startTimer();
    }

    let row = getCellRow(cell);
    let col = getCellCol(cell);
    clearCell(row, col); //includes error comparison

    if (notesModeIsOn) {
        console.log("NOTES: " + num);
        let notesCell = getCellNotes(cell, num);
        console.log(notesCell.innerText);
        notesCell.innerText = (notesCell.innerText == num) ? "":num; //remove val if already there

    } else {

        //set new cell value and process new errors
        setCellValue(row, col, num);
        showMatchingCells(cell);
        removeMatchingNotes(cell);
        processErrors(getCellRow(cell), getCellCol(cell));
        //clear notes (still need to implement a way to check if necessary)
        clearNotes(cell);
        checkForWin();
    }
    
}

//select a cell
function selectCell(cell) {
    if(didWin) return;
    selectedCell = cell;
    cell.classList.add("selectedCell");
    formatRelatedCells(selectedCell);
    showMatchingCells(selectedCell);
}


//deselect a cell
function deselectCell() {
//USE INSTRUCTIONS: selectedCell should generally be set to null after use.
    formatRelatedCells(selectedCell); //deselect related cells of previously selected
    hideMatchingCells(selectedCell);
    selectedCell?.classList?.remove("selectedCell");
    let cell = selectedCell;
    selectedCell = null;
    return cell;
}

function formatRelatedCells(cell) {
    if (!cell) {return}
    let parentRow = cell.parentNode;
    let row = parentRow.rowIndex;
    let col = cell.cellIndex;

    //Row
    for (i=0; i<9; i++) {
        if (i === col) {continue}
        parentRow.cells[i].classList.toggle('relatedCell');
    }

    //Col
    for (i=0; i<9; i++) {
        if (i === row) {continue}
        gameTable.rows[i].cells[col].classList.toggle('relatedCell');
    }

    //Box
    //3x3 grid (box) index
    boxRowStart = 3*Math.floor(row/3);
    boxColStart = 3*Math.floor(col/3);

    for (i=0; i<3; i++) {
        for (j=0; j<3; j++) {
            if (i === row%3 || j=== col%3) {continue} //skip the rows and columns already formatted
            gameTable.rows[boxRowStart + i].cells[boxColStart + j].classList.toggle('relatedCell');
        }
    }

}

function showMatchingCells(cell) {
    if(!cell) {return}

    let num = getCellValue(getCellRow(cell), getCellCol(cell));
    if (num === null) {return} //skip empty cell

    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            if (getCellValue(row,col) === num) {
                let cell = getCell(row,col);
                cell.classList.add("matchingCell");
                matchingNumberCells.push(cell);
            }
        }
    }
}

function hideMatchingCells(cell) {
    if(!cell) {return}

    matchingNumberCells?.forEach(function(cell) {
        cell.classList.remove("matchingCell");
    })
    
    matchingNumberCells = [];
}




function processErrors(row, col) {
    let cell = getCell(row, col)
    let errorCells = checkForErrors(row, col);
    formatErrors(errorCells);
}

//Check for errors, but do not format them
//Return an array of error cells in format [ {row, col} ]
function checkForErrors(row,col,value=null) {
    const cell = getCell(row,col);

    //error handling
    if (!cell) {return}
    if (value === null) {value = getCellValue(row,col)} //if no value provided, use value of cell
    if (!value) {return []} //return empty array for blank cell

    let errorCells = [];

    forEachRelated(cell, function(x,y) {
        let compareValue = getCellValue(x,y)
        if (compareValue === value) {
            console.log("cell match error: " + x + ", " + y);
            errorCells.push({"row":x,"col":y});
        }
    });

    if (errorCells.length > 0) {errorCells.push({"row": row, "col": col})}

    return errorCells;

}

function formatErrors(errorCells) {
    errorCells.forEach(function(cellIndex) {
        let cell = getCell(cellIndex.row, cellIndex.col);
        cell.classList.add("errorValue");
    })
}


function removeMatchingNotes(cell) {
    //error handling
    if (!cell) {return}
    let row = getCellRow(cell); let col = getCellCol(cell);
    let value = getCellValue(row, col);
    if (!value) {return}

    forEachRelated(cell, function(row, col) {
        removeCellNote(row, col, value);
    });
}

function forEachRelated(cell, doThis) {
    if (!cell) {console.log("Invalid Cell entered on method: forEachRelated"); return}
    let row = getCellRow(cell); let col = getCellCol(cell);

    //check row & col value
    for (let i=0; i<=8; i++) {
        if (i !== col) {doThis(row, i)}
        if (i !== row) {doThis(i, col)}
    }

    //check 3x3 grid (box) value
    let boxRow = Math.floor(row/3); //0,0,0,1,1,1,2,2,2
    let boxCol = Math.floor(col/3); //0,0,0,1,1,1,2,2,2

    for (let i=boxRow*3; i<=boxRow*3+2; i++) {
        for (let j=boxCol*3; j<=boxCol*3+2; j++) {
            if (i !== row || j !== col) {doThis(i,j)}
        }
    }
}

function removeCellNote(row, col, num) {
    let cell = getCell(row,col);
    if (!cell) {console.log("removeCellNote method error: could not find cell or cell is empty"); return}

    let note = getCellNotes(cell, num);
    note.innerText = "";

}


//set cell value: use 1-9, 1-9 input for grid index
function setCellValue(row,col,val) {
    if (val < 1 || val > 9 || !Number.isInteger(val)) {console.log("setCellValue error: unexpected value entered: " + val); return; }

    const cell = getCell(row,col);
    if(cell) {
        cell.querySelector(".cellValue span").innerText = val;
    }
}

//pull value of cell from gameTable
function getCellValue(row,col) {
    const cell = getCell(row,col);
    return Number(cell?.querySelector(".cellValue span").innerText) || null;
}

function clearCell(row,col) {
    const cell = getCell(row,col);
    if (!cell) {return} //error handling
    if (cell.classList.contains("startValue")) {return} //never delete starting cells
    
    hideMatchingCells(selectedCell); // clear existing matching cells

    let previousErrors = checkForErrors(row, col); //will check previous errors after clearing cell

    cell.querySelector(".cellValue span").innerText = "";
    cell.classList.remove("errorValue");

    //check if previous error values still apply
    previousErrors.forEach(function(cell){
        let errors = checkForErrors(cell.row, cell.col);
        if (errors.length === 0) {
            getCell(cell.row, cell.col).classList.remove("errorValue");
        }
    });
}

function clearNotes(cell) {
    for (let i = 1; i <= 9; i++) {
        let note = getCellNotes(cell,i);
        note.innerText = "";
    }
}

function getCell(row,col) {
    //returns an optional cell (td)
    //includes error handling and adjustment for row and col

    //error handling
    if (!gameTable.rows[row] || !gameTable.rows[row].cells[col]) {console.log("getCell error: cell is outside of table range"); return; }

    return gameTable.rows[row].cells[col];
}

function getCellRow(cell) {
    return cell.parentNode.rowIndex;
}

function getCellCol(cell) {
    return cell.cellIndex;
}

function getCellNotes(cell,num) {
    //error handling
    if (num<1 || num>9 || !Number.isInteger(num)) {console.log("cannot get cell notes: unexpected number value given"); return}

    return cell.querySelector(".pencilGridCell" + num);
}

//Random Integer
function randInt(x,y) {
    let random = Math.random()*(y-x+1) + x;
    random = Math.floor(random);
    return random;
}


//Check to see if you won!
function checkForWin() {
    let count = 0
    let couldWin = true;
    while (count<81 && couldWin === true) {
        let row = (count/9>>0);
        let col = count%9;
        let cell = getCell(row, col);
        if (cell.classList.contains("errorValue") || getCellValue(row,col) === null) {
            couldWin = false;
            break;
        }
        count++;
    }
    if (couldWin === true) {
        didWin = true;
        deselectCell();
        stopTimer();
        setTimeout(() => {
            alert("Congratulations, you won!");
        }, 1);
    }

}



//Timer

function initTimer() {
    timerButton.addEventListener("click", toggleTimer);
    timerButton.innerHTML = '<i class="far fa-play-circle"></i>';
}

function toggleTimer() {
    if (window.sudokuTimer) {
        stopTimer();
    } else {
        startTimer();
    }
}

function startTimer() {
    window.sudokuTimer = setInterval(incrementTimer, 1000);
    timerButton.innerHTML = '<i class="far fa-pause-circle"></i>';
}

function stopTimer() {
    clearInterval(window.sudokuTimer);
    window.sudokuTimer = false;
    timerButton.innerHTML = '<i class="far fa-play-circle"></i>';
}

function resetTimer() {
    stopTimer();
    timerMinutes.innerText = "00";
    timerSeconds.innerText = "00";
    startTimer();
}

function incrementTimer() {
    let minutes = timerMinutes.innerText;
    let seconds = timerSeconds.innerText;
    seconds++;
    if (seconds === 60) {
        seconds = 0;
        minutes ++;
    }
    timerMinutes.innerText = formatTime(minutes);
    timerSeconds.innerText = formatTime(seconds);
}

function formatTime(num) {
    let numString = String(num);
    if (numString.length === 1) {
        return "0" + numString;
    } else {
        return numString;
    }
}







//ADD NEW FUNCTION TO ARRAY PROTOTYPE:
function includeFillRange(){
    //fill array with number range
    Array.prototype.fillRange = function(x,y) {
        //error handling - check for integers
        if(!Number.isInteger(x) || !Number.isInteger(y)) {console.log("error: non-integer value passed to Array.fillRange"); return;}

        this.splice(0,this.length);
        for(let i=x; i<=y; i++) {
            this.push(i);
        }
    }
}
