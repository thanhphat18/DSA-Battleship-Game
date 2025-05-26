import { Ship } from "../models/ship";

class AIPlayer {
    constructor(name, gridElement, isOpponent = true) {
        this.name = name;
        this.grid = new Board(gridElement, isOpponent);
        this.ships = [];
        this.isOpponent = isOpponent;
        this.shipsPlaced = false;
        this.initializeShips();

        targetQueue = [];
        lastHit = null;
        direction = null;
        triedDirections = [];
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

    //Place botship randomly
    placeBotShips() {
        const leftShips = [];
        //this.ships.forEach(ship => ship.isPlaced = false);

        for (const ship of this.ships) {
            let placed = false;
            while (!placed) {
                const horizontal = Math.random() < 0.5; //Random whether the ship placed is horizontal or not (boolean)
                const row = Math.floor(Math.random() * 10);
                const col = Math.floor(Math.random() * 10);
                //generate random coordinate for ship

                if (canPlaceShip(leftShips, row, col, ship.size, horizontal, this.grid.gridSize)) {
                    const newShip = new Ship(ship.name, ship.size)
                    for (let i = 0; i < ship.length; i++) {
                        let r = row;
                        let c = col;
                        if (horizontal) {
                            c += i
                        } else {
                            r += i
                        }
                        newShip.positions.push({ row: r, col: c })
                    }
                    leftShips.push(newShip);
                    ship.isPlaced = true;
                    placed = true;
                }
            }
        }
    }

    //check for ship placement
    canPlaceShip(currentShips, row, col, length, horizontal, gridSize) {
        const tempPositions = [];
        for (let i = 0; i < length; i++) {
            let r = row;
            let c = col;
            if (horizontal) {
                c += i;
            } else {
                r += i;
            }
            if (r >= gridSize || c >= gridSize) return false;
            tempPositions.push({ row: r, col: c })
        }

        //Check for overlapping
        for (const ship of currentShips) {
            for (const coord of ship.coordinates) {
                for (const tempPos of tempPositions) {
                    if (coord.row === tempPos.row && coord.col === tempPos.col) {
                        return false;
                    }
                }
            }
        }
        return true;
    }

    takeTurn() {
        if (gameOver) return;

        const target = this.chooseTarget();
        if (!target) return this.endTurn();

        const { row, col } = target;
        updateMessage(`Máy bắn vào ô (${row}, ${col}) của bạn...`, "ai-turn");

        const result = processAttack(row, col, this.ships, this.grid, 'player', this.sunkList, this.shipConfigs);
        this.handleResult(row, col, result);

        if (!gameOver) this.endTurn();
    }

    chooseTarget() {
        // Priority: target queue
        while (this.targetQueue.length > 0) {
            const target = this.targetQueue.shift();
            if (!this.isAlreadyAttacked(target.row, target.col)) {
                return target;
            }
        }

        // Fallback: random
        let attempts = 0;
        while (attempts < this.gridSize * this.gridSize) {
            const row = Math.floor(Math.random() * this.gridSize);
            const col = Math.floor(Math.random() * this.gridSize);
            if (!this.isAlreadyAttacked(row, col)) return { row, col };
            attempts++;
        }

        return null;
    }
    //Return choose coordinate (row, col)

    handleResult(row, col, result) {
        if (result.hit) {
            updateMessage(`Máy đã bắn trúng tàu của bạn tại (${row}, ${col})!`, "ai-hit");

            if (!this.lastHit) {
                this.lastHit = { row, col };
                this.triedDirections = [];
                this.addAdjacentTargets(row, col);
            } else if (!this.direction) {
                this.direction = GridUtils.getDirection(this.lastHit, { row, col });
                if (this.direction) {
                    this.targetQueue = [GridUtils.nextInDirection(row, col, this.direction)];
                }
            } else {
                this.targetQueue.unshift(GridUtils.nextInDirection(row, col, this.direction));
            }

            if (result.sunkShip) {
                updateMessage(`Máy đã đánh chìm ${result.sunkShip.name} của bạn!`, "ai-sunk");
                this.resetTargeting();
                if (checkWin(this.ships)) {
                    endGame(false);
                }
            }
        } else {
            updateMessage(`Máy bắn trượt tại (${row}, ${col}).`, "ai-miss");

            if (this.direction) {
                this.direction = GridUtils.reverse(this.direction);
                this.targetQueue = [GridUtils.nextInDirection(this.lastHit.row, this.lastHit.col, this.direction)];
            } else if (this.lastHit) {
                this.triedDirections.push({ row, col });
                this.addAdjacentTargets(this.lastHit.row, this.lastHit.col);
            }
        }
    }

    addAdjacentTargets(row, col) {
        const adjacents = GridUtils.adjacentCells(row, col, this.gridSize);
        adjacents.forEach(cell => this.targetQueue.push(cell));
    }

    isAlreadyAttacked(row, col) {
        const cell = this.grid.querySelector(`.grid-cell[data-row='${row}'][data-col='${col}']`);
        return cell.classList.contains('hit') || cell.classList.contains('miss');
    }

    // endTurn() {
    //     playerTurn = true;
    //     turnIndicator.textContent = "Lượt của: Bạn";
    //     enableOpponentGridAttacks();
    // }

    resetTargeting() {
        this.lastHit = null;
        this.direction = null;
        this.targetQueue = [];
        this.triedDirections = [];
    }
}