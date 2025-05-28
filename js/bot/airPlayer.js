// ✅ Refactored aiPlayer.js
import { Ship } from '/js/models/ship.js';
import { Board } from '/js/models/board.js';

export class AIPlayer {
    constructor(name, gridElement, isOpponent = true) {
        this.name = name;
        this.grid = new Board(gridElement, isOpponent);
        this.ships = [];
        this.isOpponent = isOpponent;
        this.shipsPlaced = false;
        this.initializeShips();
    }

    initializeShips() {
        this.ships = [
            new Ship('carrier', 5),
            new Ship('battleship', 4),
            new Ship('cruiser', 3),
            new Ship('submarine', 3),
            new Ship('destroyer', 2),
        ];
    }

    placeBotShips() {
        for (const ship of this.ships) {
            let placed = false;

            while (!placed) {
                const horizontal = Math.random() < 0.5;
                const row = Math.floor(Math.random() * this.grid.gridSize);
                const col = Math.floor(Math.random() * this.grid.gridSize);

                // Dùng logic placeShip của board
                placed = this.grid.placeShip(ship, row, col, horizontal);
            }
        }

        this.shipsPlaced = true;
    }

    allShipsSunk() {
        return this.ships.every(ship => ship.isSunk);
    }

    reset() {
        this.grid.reset();
        this.initializeShips();
        this.shipsPlaced = false;
    }
}