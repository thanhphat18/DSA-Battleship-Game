import { Ship } from "/js/models/ship.js";

export class Board {
    constructor(gridElement, isOpponent = false) {
        this.gridElement = gridElement;
        this.isOpponent = isOpponent;
        this.cells = [];
        this.gridSize = 10;
        this.initGrid();
    }

    initGrid() {
        this.gridElement.innerHTML = '';
        this.cells = [];
        for (let r = 0; r < this.gridSize; r++) {
            const row = [];
            for (let c = 0; c < this.gridSize; c++) {
                const cellDiv = document.createElement('div');
                cellDiv.classList.add('grid-cell');
                cellDiv.dataset.row = r;
                cellDiv.dataset.col = c;
                this.gridElement.appendChild(cellDiv);

                row.push({ ship: null, status: 'empty', cellDiv });
            }
            this.cells.push(row);
        }
    }

    placeShip(ship, startRow, startCol, isHorizontal) {
        const positions = [];
        for (let i = 0; i < ship.length; i++) {
            const r = startRow + (isHorizontal ? 0 : i);
            const c = startCol + (isHorizontal ? i : 0);
            if (r < 0 || r >= this.gridSize || c < 0 || c >= this.gridSize) return false;
            if (this.cells[r][c].ship !== null) return false;
            positions.push({ row: r, col: c });
        }
        ship.place(positions);
        for (const pos of positions) {
            this.cells[pos.row][pos.col].ship = ship;
            if (!this.isOpponent) {
                this.cells[pos.row][pos.col].cellDiv.classList.add('ship');
            }
        }
        return true;
    }

    receiveAttack(row, col) {
        const cell = this.cells[row][col];
        if (cell.status !== 'empty') return false;

        if (cell.ship) {
            cell.status = 'hit';
            cell.ship.hit();
            cell.cellDiv.classList.add('hit');
            if (cell.ship.isSunk) {
                this.markSunkShip(cell.ship);
            }
            return 'hit';
        } else {
            cell.status = 'miss';
            cell.cellDiv.classList.add('miss');
            return 'miss';
        }
    }

    markSunkShip(ship) {
        for (const pos of ship.positions) {
            this.cells[pos.row][pos.col].cellDiv.classList.add('sunk');
        }
    }

    reset() {
        this.initGrid();
    }
}
