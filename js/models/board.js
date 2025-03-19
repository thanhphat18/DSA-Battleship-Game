class Board {
    constructor(boardId) {
      this.boardId = boardId; // ID of the board (e.g., player-board or bot-board)
      this.grid = [];          // Array to store the cells of the grid
      this.createBoard();      // Create the grid when the board is initialized
    }
  
    // Create the 10x10 grid
    createBoard() {
      const boardElement = document.getElementById(this.boardId);
      
      // Create 100 cells (10x10 grid)
      for (let i = 0; i < 100; i++) {
        const cell = document.createElement("div");
        cell.classList.add("cell");
        cell.setAttribute("data-index", i);  // Set a unique data-index for each cell
        this.grid.push(cell);
        boardElement.appendChild(cell);  // Append the cell to the board container
  
        // Add event listener to handle clicks (for now, just logging)
        if (this.boardId === 'player-board') {
          cell.addEventListener("click", (e) => this.handleCellClick(e));
        }
      }
    }
  
    // Handle the player's click to place ships on the player's board
    handleCellClick(event) {
      const cell = event.target;
      const index = parseInt(cell.getAttribute("data-index"));
  
      // Convert index to row and column (to easily access cells)
      const row = Math.floor(index / 10);
      const col = index % 10;
  
      console.log(`Player clicked on cell at row: ${row}, col: ${col}`);
      // You can later add logic here to place a ship when a cell is clicked
    }
  
    // Update the board by marking a cell as occupied (for ship placement)
    updateCell(row, col, ship) {
      const boardElement = document.getElementById(this.boardId);
      const cellIndex = row * 10 + col;
      const cell = boardElement.children[cellIndex];
      cell.classList.add("occupied");
    }
  }
  