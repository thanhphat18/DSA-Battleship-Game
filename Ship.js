export class Ship {
    constructor(size, name = "") {
        this.size = size;
        this.name = name;
        this.cells = [];
    }
    

    placeOnBoard(board, startRow, startCol, isHorizontal = true) {
        this.cells = [];

        for (let i = 0; i < this.size; i++) {
            const row = isHorizontal ? startRow : startRow + i;
            const col = isHorizontal ? startCol + i : startCol;

            const cell = board.getCell(row, col);
            if (!cell) throw new Error("Invalid ship placement");

            cell.placeShip();
            this.cells.push(cell);
        }
    }

    isSunk() {
        return this.cells.every(cell => cell.isHit);
    }
}
