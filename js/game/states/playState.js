// ✅ Refactored playState.js
import { GridUtils } from '/js/bot/gridUtil.js';

export class PlayState {
    constructor(game) {
        this.game = game;
        this.targetQueue = [];
        this.lastHit = null;
        this.direction = null;
        this.triedDirections = [];
    }

    enter() {
        this.game.gameStarted = true;
        this.game.playerTurn = true;
        this.game.updateMessage('Game Start! Your turn.');
        this.game.turnIndicator.textContent = "Turn: Player's";
        this.game.disableShipPlacementUI();
        this.setupOpponentShips();
        this.game.startGameButton.disabled = true;
        this.game.resetShipsButton.disabled = true;

        this.grid = this.game.playerGridElement;
        this.ships = this.game.player.ships;
        this.shipConfigs = this.ships;
        this.gridSize = this.game.gridSize;
        this.sunkList = document.getElementById('player-sunk-list');
        this.opponentSunkList = document.getElementById('opponent-sunk-list');
    }

    exit() {}

    onPlayerGridClick() {}

    onRotateButtonClick() {}

    onStartButtonClick() {}

    onResetButtonClick() {
        this.game.resetGame();
        this.game.switchState('setup');
    }

    onShipPaletteClick() {}

    setupOpponentShips() {
        this.game.opponent.placeBotShips();
    }

    onOpponentGridClick(e) {
        if (!this.game.playerTurn || !e.target.classList.contains('grid-cell')) return;

        const row = parseInt(e.target.dataset.row);
        const col = parseInt(e.target.dataset.col);

        const result = this.processAttack(row, col, this.game.opponent.ships, this.game.opponentGridElement, 'opponent', this.opponentSunkList, this.game.opponent.ships);

        if (!result) {
            this.game.updateMessage('This cell has already been selected. Select another cell.');
            return;
        }

        if (result.hit) {
            this.game.updateMessage('You have hit the enemy ship!');
            if (this.game.opponent.allShipsSunk()) {
                this.game.updateMessage('You win! 🎉');
                this.game.switchState('end');
                return;
            }
        } else {
            this.game.updateMessage('You have missed.');
        }

        this.game.playerTurn = false;
        this.game.turnIndicator.textContent = 'Turn: Opponent (Computer)';

        setTimeout(() => this.opponentMove(), 1000);
    }

    processAttack(row, col, targetShips, targetGridElement, targetOwner, sunkListElement, targetShipConfigs) {
        const cell = targetGridElement.querySelector(`.grid-cell[data-row='${row}'][data-col='${col}']`);
        if (!cell || cell.classList.contains('hit') || cell.classList.contains('miss')) return false;

        let hitShip = false;
        let sunkShipInfo = null;

        for (const ship of targetShips) {
            if (ship.isSunk) continue;

            for (const pos of ship.positions) {
                if (pos.row === row && pos.col === col && !pos.hit) {
                    pos.hit = true;
                    ship.hit();
                    cell.classList.add('hit');
                    hitShip = true;

                    if (ship.isSunk) {
                        sunkShipInfo = ship;
                        ship.positions.forEach(p => {
                            const sunkCell = targetGridElement.querySelector(`.grid-cell[data-row='${p.row}'][data-col='${p.col}']`);
                            sunkCell && sunkCell.classList.add('sunk');
                        });
                        const li = document.createElement('li');
                        li.textContent = `${ship.id} (${ship.length})`;
                        sunkListElement.appendChild(li);
                    }
                    break;
                }
            }
            if (hitShip) break;
        }

        if (!hitShip) {
            cell.classList.add('miss');
        }

        return { hit: hitShip, sunkShip: sunkShipInfo };
    }

    opponentMove() {
        if (this.game.playerTurn) return;

        const target = this.chooseTarget();
        if (!target) {
            this.game.playerTurn = true;
            this.game.turnIndicator.textContent = "Turn: Player's";
            return;
        }

        const { row, col } = target;
        this.game.updateMessage(`Opponent (Computer) hits (${row}, ${col}) of yours...`, 'ai-turn');

        const result = this.processAttack(row, col, this.ships, this.grid, 'player', this.sunkList, this.shipConfigs);
        this.handleResult(row, col, result);

        if (this.checkWin(this.ships)) {
            this.endGame(false);
        } else {
            this.game.playerTurn = true;
            this.game.turnIndicator.textContent = "Turn: Player's";
        }
    }

    chooseTarget() {
        while (this.targetQueue.length > 0) {
            const target = this.targetQueue.shift();
            if (!this.isAlreadyAttacked(target.row, target.col)) return target;
        }

        let attempts = 0;
        while (attempts < this.gridSize * this.gridSize) {
            const row = Math.floor(Math.random() * this.gridSize);
            const col = Math.floor(Math.random() * this.gridSize);
            if (!this.isAlreadyAttacked(row, col)) return { row, col };
            attempts++;
        }

        return null;
    }

    handleResult(row, col, result) {
        if (result.hit) {
            this.game.updateMessage(`Opponent (Computer) hits your ship at (${row}, ${col})!`, 'ai-hit');
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
                this.game.updateMessage(`Opponent (Computer) sunk ${result.sunkShip.id} of yours!`, 'ai-sunk');
                this.resetTargeting();
            }
        } else {
            this.game.updateMessage(`Opponent (Computer) misses at (${row}, ${col}).`, 'ai-miss');
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
        GridUtils.adjacentCells(row, col, this.gridSize).forEach(cell => {
            if (!this.isAlreadyAttacked(cell.row, cell.col)) this.targetQueue.push(cell);
        });
    }

    isAlreadyAttacked(row, col) {
        const cell = this.grid.querySelector(`.grid-cell[data-row='${row}'][data-col='${col}']`);
        return cell.classList.contains('hit') || cell.classList.contains('miss');
    }

    resetTargeting() {
        this.lastHit = null;
        this.direction = null;
        this.targetQueue = [];
        this.triedDirections = [];
    }

    checkWin(ships) {
        return ships.every(ship => ship.isSunk);
    }

    endGame(playerWon) {
        this.game.switchState('end');
        this.game.updateMessage(playerWon ? 'You win! 🎉' : 'You lose... 💥');
    }
}