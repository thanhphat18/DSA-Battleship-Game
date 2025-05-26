import { Ship } from './ship';
import { Board } from './board';

export class Player {
    constructor(name, gridElement, isOpponent = false) {
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
            new Ship('destroyer', 2)
        ];
    }

    placeShip(shipId, startRow, startCol, isHorizontal) {
        const ship = this.ships.find(s => s.id === shipId);
        if (!ship) return false;
        return this.grid.placeShip(ship, startRow, startCol, isHorizontal);
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

