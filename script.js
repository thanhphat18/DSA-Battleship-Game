// Function to create the game board (10x10 grid)
function createBoard(boardId) {
    const board = document.getElementById(boardId);
    for (let i = 0; i < 100; i++) {
      const cell = document.createElement("div");
      cell.classList.add("cell");
      cell.setAttribute("data-index", i);
      cell.addEventListener("click", () => attack(cell, boardId));
      board.appendChild(cell);
    }
  }
  
  // Function to handle attacks (for now, marking as a miss)
  function attack(cell, boardId) {
    if (boardId === "player-board") {
      console.log("Player attacked:", cell.dataset.index);
    } else if (boardId === "computer-board") {
      console.log("Computer attacked:", cell.dataset.index);
    }
    // Mark the cell as a miss temporarily
    cell.classList.add('miss');
  }
  
  // Initialize boards for both player and computer
  createBoard("player-board");
  createBoard("computer-board");
  