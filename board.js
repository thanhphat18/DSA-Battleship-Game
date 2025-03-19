class Board{
    constructor(boardID){
        this.boardID = boardID;
        this.grid = [];
        this.ships = [];
        this.createBoard();
    }

    createBoard(){
        const boardElement = document.getElementById(this.boardID);
        for(let i = 0; i < 100; i++){
            const cell = document.createElement("div");
            cell.classList.add("cell");
            cell.setAttribute("data-index", i);
            this.grid.push(cell);
            cell.addEventListener("click", () => this.attack(cell));
            boardElement.appendChild(cell);
        }
    } //end of method

    placeShip(){
        const shipCells = [];
        for (let i = 0; i < ship.size; i++) {
            let cellIndex;
            if (orientation === 'horizontal'){
                cellIndex = startIndex + i;
                if (cellIndex % 10 < startIndex % 10) return false;
            } else {
                cellIndex = startIndex + i * 10;
                if (cellIndex>= 100) return false;
            }

            if (this.grid[cellIndex].classList.contains('occupied'))
            {
                return false;
            }
            shipCells.push(this.grid[cellIndex]);
        }

        ship.cells = shipCells;
        shipCells.forEach(cell => cell.classList.add('occupied'));
        this.ships.push(ship);
        return true;

    } //end of method

    attack(cell){
        const index = parseInt(cell.dataset.index);
        for(const ship of this.ships){
            if (ship.cells.some(shipCell => shipCell.dataset.index == index)) {
                ship.hit();
                cell.classList.add('hit');
                return true;
            }
        }
        cell.classList.add('miss');
        return false;
    }
}