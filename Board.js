import { Cell } from './Cell.js';

export class Board {
    constructor(rows, cols, boardElement) {
        this.rows = rows;
        this.cols = cols;
        this.boardElement = boardElement;
        this.grid = [];

        this.initBoard();
    }

    initBoard() {
        this.boardElement.innerHTML = "";

        for (let row = 0; row < this.rows; row++) {
            const rowCells = [];
            for (let col = 0; col < this.cols; col++) {
                const cell = new Cell(row, col, this.boardElement);
                rowCells.push(cell);
            }
            this.grid.push(rowCells);
        }
    }

    getCell(row, col) {
        if (row >= 0 && row < this.rows && col >= 0 && col < this.cols) {
            return this.grid[row][col];
        }
        return null;
    }

    resetBoard() {
        for (let row of this.grid) {
            for (let cell of row) {
                cell.reset();
            }
        }
    }
}
