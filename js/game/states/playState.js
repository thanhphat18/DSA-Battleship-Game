import { GridUtils } from '/js/bot/gridUtils.js';

export class PlayState {
    constructor(game) {
        this.game = game;
        this.targetQueue = []; //Queue
        this.lastHit = null;
        this.direction = null;
        this.triedDirections = [];
        this.moveHistory = []; //Stack
    }

    enter() {
        this.game.gameStarted = true;
        this.game.playerTurn = true;
        this.game.updateMessage('Trò chơi bắt đầu! Lượt của bạn.');
        this.game.turnIndicator.textContent = 'Lượt của: Bạn';
        this.game.disableShipPlacementUI();
        this.setupOpponentShips();
        this.game.startGameButton.disabled = true;
        this.game.resetShipsButton.disabled = false;

        this.grid = this.game.playerGridElement;
        this.ships = this.game.player.ships;
        this.shipConfigs = this.ships;
        this.gridSize = this.game.gridSize;
        this.sunkList = document.getElementById('player-sunk-list');
        this.opponentSunkList = document.getElementById('opponent-sunk-list');
    }

    // exit() {
    //     this.game.switchState('setup')
    // }

    // onPlayerGridClick() {}

    // onRotateButtonClick() {}

    // onStartButtonClick() {}

    onResetButtonClick() {
        this.game.resetGame();
        this.game.switchState('setup');
    }

    onShipPaletteClick() { }

    setupOpponentShips() {
        this.game.opponent.placeBotShips();
    }

    onOpponentGridClick(e) {
        if (!this.game.playerTurn || !e.target.classList.contains('grid-cell')) return;

        const row = parseInt(e.target.dataset.row);
        const col = parseInt(e.target.dataset.col);

        const result = this.processAttack(row, col, this.game.opponent.ships, this.game.opponentGridElement, 'opponent', this.opponentSunkList, this.game.opponent.ships);

        if (!result) {
            this.game.updateMessage('Bạn đã chọn ô này rồi. Chọn ô khác.');
            return;
        }

        if (result.hit) {
            this.game.sound.play('fire');
            this.game.updateMessage('Bạn đã trúng tàu địch!');
            if (this.game.opponent.allShipsSunk()) {
                this.game.updateMessage('Bạn thắng rồi! 🎉');
                this.game.switchState('end');
                return;
            }
        } else {
            this.game.updateMessage('Bạn đã bắn trượt.');
        }

        this.game.playerTurn = false;
        this.game.turnIndicator.textContent = 'Lượt của: Đối thủ';

        setTimeout(() => this.opponentMove(), 1000);
    }

    opponentMove() {
        if (this.game.playerTurn) return;

        const target = this.chooseTarget();
        if (!target) {
            this.game.playerTurn = true;
            this.game.turnIndicator.textContent = 'Lượt của: Bạn';
            return;
        }

        const { row, col } = target;
        this.game.updateMessage(`Máy bắn vào ô (${row}, ${col}) của bạn...`, 'ai-turn');

        const result = this.processAttack(row, col, this.ships, this.grid, 'player', this.sunkList, this.shipConfigs);
        this.handleResult(row, col, result);

        if (this.checkWin(this.ships)) {
            this.endGame(false);
        } else {
            this.game.playerTurn = true;
            this.game.turnIndicator.textContent = 'Lượt của: Bạn';
        }
    }

    processAttack(row, col, targetShips, targetGridElement, targetOwner, sunkListElement, targetShipConfigs) {
        const cell = targetGridElement.querySelector(`.grid-cell[data-row='${row}'][data-col='${col}']`);
        if (!cell || cell.classList.contains('hit') || cell.classList.contains('miss')) return false;

        let hitShip = false;
        let sunkShipInfo = null;
        let affectedShip = null;

        for (const ship of targetShips) {
            if (ship.isSunk) continue;

            for (const pos of ship.positions) {
                if (pos.row === row && pos.col === col && !pos.hit) {
                    pos.hit = true;
                    ship.hit();
                    cell.classList.add('hit');
                    hitShip = true;
                    affectedShip = ship;

                    if (ship.isSunk) {
                        this.game.sound.play('sunk');
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

        this.moveHistory.push({
            row,
            col,
            targetGridElement,
            ship: affectedShip,
        });

        return { hit: hitShip, sunkShip: sunkShipInfo };
    }

    undoMove() {
        if (this.moveHistory.length < 2) {
            this.game.updateMessage("Không thể hoàn tác lúc này.");
            return;
        }

        const undoOne = (move) => {
            const { row, col, targetGridElement, ship } = move;
            const cell = targetGridElement.querySelector(`.grid-cell[data-row='${row}'][data-col='${col}']`);
            if (!cell) return;

            // Remove visuals
            cell.classList.remove('hit', 'miss', 'sunk');

            // Restore ship logic if hit
            if (ship) {
                ship.hits = Math.max(0, ship.hits - 1);
                ship.isSunk = false;
                const pos = ship.positions.find(p => p.row === row && p.col === col);
                if (pos) pos.hit = false;
            }
        };

        // Undo AI's move (most recent)
        undoOne(this.moveHistory.pop());

        // Undo Player's move (second most recent)
        undoOne(this.moveHistory.pop());

        this.game.playerTurn = true;
        this.game.turnIndicator.textContent = 'Lượt của: Bạn';
    }

    chooseTarget() {
        while (this.targetQueue.length > 0) {
            const target = this.targetQueue.shift();
            if (!this.isAlreadyAttacked(target.row, target.col)) return target;
        } //choose cell that not yet targetted

        //If there's no targetted cell, randomly choose a cell
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
            this.game.sound.play('fire');
            this.game.updateMessage(`Máy đã bắn trúng tàu của bạn tại (${row}, ${col})!`, 'ai-hit');
            if (!this.lastHit) { //First hit case
                this.lastHit = { row, col };
                this.triedDirections = []; 
                this.addAdjacentTargets(row, col);
            } else if (!this.direction) { //Second hit case
                //determine the direction of the boat
                this.direction = GridUtils.getDirection(this.lastHit, { row, col }); 
                if (this.direction) {
                    this.targetQueue = [GridUtils.nextInDirection(row, col, this.direction)];
                }
            } else { //Continuing hit of known direction
                this.targetQueue.unshift(GridUtils.nextInDirection(row, col, this.direction));
            }

            if (result.sunkShip) {
                this.game.sound.play('sunk');
                this.game.updateMessage(`Máy đã đánh chìm ${result.sunkShip.id} của bạn!`, 'ai-sunk');
                this.resetTargeting();
            }
        } else {
            this.game.updateMessage(`Máy bắn trượt tại (${row}, ${col}).`, 'ai-miss');
            if (this.direction) {
                this.direction = GridUtils.reverse(this.direction);
                this.targetQueue = [GridUtils.nextInDirection(this.lastHit.row, this.lastHit.col, this.direction)];
            } else if (this.lastHit) {
                this.triedDirections.push({ row, col });
                this.addAdjacentTargets(this.lastHit.row, this.lastHit.col);
            }
        }
    }

    addAdjacentTargets(row, col) { //Add the adjacent target into targetQueue
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
        this.game.updateMessage(playerWon ? 'Bạn thắng rồi! 🎉' : 'Bạn đã thua... 💥');
    }
}
