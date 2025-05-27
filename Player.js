import { Ship } from './Ship.js';

export class Player {
    constructor(name, board) {
        this.name = name;
        this.board = board;
        this.ships = [];
    }

    addShip(size, row, col, isHorizontal = true, name = "") {
        const ship = new Ship(size, name);
        try {
            ship.placeOnBoard(this.board, row, col, isHorizontal);
            this.ships.push(ship);
        } catch (err) {
            console.error("Cannot place ship:", err.message);
        }
    }

    receiveAttack(row, col) {
        const cell = this.board.getCell(row, col);
        if (!cell || cell.isHit) return false;

        cell.handleClick();
        return cell.hasShip;
    }

    allShipsSunk() {
        return this.ships.every(ship => ship.isSunk());
    }
}

export class ComputerPlayer extends Player {
    constructor(name, board) {
        super(name, board);
    }

    getRandomAttackCoord() {
        const row = Math.floor(Math.random() * this.board.rows);
        const col = Math.floor(Math.random() * this.board.cols);
        return { row, col };
    }

    attackOpponent(opponent) {
        let coord, cell;

        do {
            coord = this.getRandomAttackCoord();
            cell = opponent.board.getCell(coord.row, coord.col);
        } while (cell && cell.isHit);

        return opponent.receiveAttack(coord.row, coord.col);
    }
}
