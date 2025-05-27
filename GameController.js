import { Player, ComputerPlayer } from './Player.js';
import { Board } from './Board.js';

export class GameController {
    constructor(playerBoardElement, enemyBoardElement) {
        this.GRID_SIZE = 10;
        this.playerBoardElement = playerBoardElement;
        this.enemyBoardElement = enemyBoardElement;

        this.player = new Player("Player", new Board(this.GRID_SIZE, this.GRID_SIZE, playerBoardElement));
        this.computer = new ComputerPlayer("Computer", new Board(this.GRID_SIZE, this.GRID_SIZE, enemyBoardElement));

        this.isPlayerTurn = true;
        this.isHorizontal = true;
        this.selectedShipLength = null;
        this.selectedShipId = null;
        this.placedShips = 0;
        this.totalShipsToPlace = 5;
        this.gameStarted = false;

        this.setupUI();
        this.resetGame();
    }

    setupUI() {
        this.rotateBtn = document.getElementById("rotate-ship-button");
        this.startBtn = document.getElementById("start-game-button");
        this.resetBtn = document.getElementById("reset-ships-button");
        this.messageArea = document.getElementById("message-area");
        this.turnIndicator = document.getElementById("turn-indicator");
        this.opponentSunkList = document.getElementById("opponent-sunk-list");
        this.playerSunkList = document.getElementById("player-sunk-list");
        this.palette = document.querySelectorAll(".ship-option");

        // Gán event
        this.palette.forEach(btn => {
            btn.addEventListener("click", () => {
                this.selectedShipLength = parseInt(btn.dataset.length);
                this.selectedShipId = btn.dataset.id;
                this.showMessage(`Select the cell to place: ${btn.textContent}`, "info");
            });
        });

        this.rotateBtn.addEventListener("click", () => {
            this.isHorizontal = !this.isHorizontal;
            this.rotateBtn.textContent = `Rotate (${this.isHorizontal ? "Horizontal" : "Vertical"})`;
        });

        this.resetBtn.addEventListener("click", () => this.resetGame());

        this.startBtn.addEventListener("click", () => {
            this.gameStarted = true;
            this.startBtn.disabled = true;
            this.rotateBtn.disabled = true;
            this.resetBtn.disabled = true;
            this.showMessage("Game start! Player's turn.", "info");
            this.turnIndicator.textContent = "Turn: Player";
            this.placeComputerShips();
            this.enablePlayerAttack();
        });

        this.addPlayerBoardClick();
    }

    resetGame() {
        this.player.board.resetBoard();
        this.computer.board.resetBoard();
        this.player.ships = [];
        this.computer.ships = [];
        this.placedShips = 0;
        this.gameStarted = false;
        this.isPlayerTurn = true;
        this.selectedShipLength = null;
        this.selectedShipId = null;
        this.opponentSunkList.innerHTML = '';
        this.playerSunkList.innerHTML = '';
        this.startBtn.disabled = true;
        this.rotateBtn.disabled = false;
        this.resetBtn.disabled = false;
        this.palette.forEach(btn => btn.disabled = false);
        this.showMessage("Welcome to Battleship! Please select the ship and place on the board.", "info");
        this.turnIndicator.textContent = "Haven't started";
    }

    addPlayerBoardClick() {
        this.player.board.grid.flat().forEach(cell => {
            cell.element.addEventListener("click", () => {
                if (this.gameStarted || !this.selectedShipLength) return;

                const row = cell.row;
                const col = cell.col;
                if (this.canPlaceShip(this.player, row, col, this.selectedShipLength, this.isHorizontal)) {
                    this.player.addShip(this.selectedShipLength, row, col, this.isHorizontal, this.selectedShipId);
                    this.markShipCells(this.player, row, col, this.selectedShipLength, this.isHorizontal, this.selectedShipId);

                    // Disable button
                    const btn = Array.from(this.palette).find(b => b.dataset.id === this.selectedShipId);
                    if (btn) btn.disabled = true;

                    this.placedShips++;
                    this.selectedShipLength = null;
                    this.selectedShipId = null;

                    if (this.placedShips === this.totalShipsToPlace) {
                        this.showMessage("All ships placed. Ready to begin!", "success");
                        this.startBtn.disabled = false;
                    } else {
                        this.showMessage(`Ship placed. Remaining: ${this.totalShipsToPlace - this.placedShips}`, "info");
                    }
                } else {
                    this.showMessage("Cannot place the ship in this position!", "error");
                }
            });
        });
    }

    canPlaceShip(player, row, col, length, isHorizontal) {
        for (let i = 0; i < length; i++) {
            const r = isHorizontal ? row : row + i;
            const c = isHorizontal ? col + i : col;
            const cell = player.board.getCell(r, c);
            if (!cell || cell.hasShip) return false;
        }
        return true;
    }

    markShipCells(player, row, col, length, isHorizontal, id) {
        for (let i = 0; i < length; i++) {
            const r = isHorizontal ? row : row + i;
            const c = isHorizontal ? col + i : col;
            const cell = player.board.getCell(r, c);
            cell.element.classList.add("ship");
            cell.element.classList.add(`ship-${id}`);
        }
    }

    placeComputerShips() {
        const ships = [
            { size: 5, name: 'Carrier' }, { size: 4, name: 'Battleship' },
            { size: 3, name: 'Submarine' }, { size: 3, name: 'Cruiser' },
            { size: 2, name: 'Destroyer' }
        ];
        for (const ship of ships) {
            let placed = false;
            while (!placed) {
                const isHorizontal = Math.random() < 0.5;
                const row = Math.floor(Math.random() * this.GRID_SIZE);
                const col = Math.floor(Math.random() * this.GRID_SIZE);
                if (this.canPlaceShip(this.computer, row, col, ship.size, isHorizontal)) {
                    this.computer.addShip(ship.size, row, col, isHorizontal, ship.name);
                    placed = true;
                }
            }
        }
    }

    enablePlayerAttack() {
        this.computer.board.grid.flat().forEach(cell => {
            cell.element.addEventListener("click", () => {
                if (!this.gameStarted || !this.isPlayerTurn || cell.isHit) return;

                const hit = this.computer.receiveAttack(cell.row, cell.col);
                this.updateGameState(this.computer, hit, this.opponentSunkList, true);

                if (this.computer.allShipsSunk()) {
                    this.showMessage("You have sunk all opponent's ships! Congratulations 🎉", "win");
                    this.endGame();
                    return;
                }

                if (!hit) {
                    this.isPlayerTurn = false;
                    this.turnIndicator.textContent = "Turn: Opponent (Computer)";
                    setTimeout(() => this.computerTurn(), 800);
                }
            });
        });
    }

    computerTurn() {
        let row, col, cell;
        do {
            row = Math.floor(Math.random() * this.GRID_SIZE);
            col = Math.floor(Math.random() * this.GRID_SIZE);
            cell = this.player.board.getCell(row, col);
        } while (cell.isHit);

        const hit = this.player.receiveAttack(row, col);
        this.updateGameState(this.player, hit, this.playerSunkList, false);

        if (this.player.allShipsSunk()) {
            this.showMessage("All of your ships have sunk! You lose. 😢", "lose");
            this.endGame();
            return;
        }

        if (!hit) {
            this.isPlayerTurn = true;
            this.turnIndicator.textContent = "Turn: Yours";
        } else {
            setTimeout(() => this.computerTurn(), 800);
        }
    }

    updateGameState(targetPlayer, wasHit, sunkListElement, isPlayerAttacking) {
        const lastShip = targetPlayer.ships.find(ship => ship.isSunk() && !ship.marked);
        if (lastShip) {
            const li = document.createElement("li");
            li.textContent = `${lastShip.name} ${lastShip.size}`;
            sunkListElement.appendChild(li);
            lastShip.marked = true;

            if (isPlayerAttacking) {
                this.showMessage("You have sunk one of oppponent's ship!", "success");
            } else {
                this.showMessage("Opponent (Computer) have sunk one of your ships!", "warn");
            }
        } else {
            if (wasHit) {
                this.showMessage(isPlayerAttacking ? "You hits!" : "Opponent hits!", "success");
            } else {
                this.showMessage(isPlayerAttacking ? "You miss!" : "Opponent miss!", "info");
            }
        }
    }

    showMessage(msg, type = "info") {
        this.messageArea.textContent = msg;
        this.messageArea.className = "";
        this.messageArea.classList.add(`message-${type}`);
    }

    endGame() {
        this.gameStarted = false;
        this.isPlayerTurn = false;
        this.startBtn.disabled = true;
        this.rotateBtn.disabled = true;
        this.resetBtn.disabled = false;
        this.turnIndicator.textContent = "GAME OVER";
    }
}
