import { GridUtils } from '/js/bot/gridUtils.js';

export class AIController {
  constructor(game) {
    this.game = game;
    this.grid = game.playerGridElement;
    this.gridSize = game.gridSize;
    this.mode = 'hunt'; 
    this.targetQueue = [];
    this.lastHit = null;
    this.direction = null;
    this.triedDirections = [];
  }

  init() {
    this.mode = 'hunt';
    this.targetQueue = [];
    this.lastHit = null;
    this.direction = null;
    this.triedDirections = [];
  }

  chooseTarget() {
    if (this.mode === 'target' && this.targetQueue.length > 0) {
      return this.targetQueue.pop();
    }

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
      this.mode = 'target';
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
        // Switch direction and try from original hit
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
    const cell = this.grid.querySelector(`.grid-cell[data-row="${row}"][data-col="${col}"]`);
    return cell.classList.contains('hit') || cell.classList.contains('miss');
  }

  undoTarget(row, col) {
    if (this.mode === 'target') {
      this.targetQueue.push({ row, col });
    }
  }

  resetTargeting() {
    this.mode = 'hunt';
    this.lastHit = null;
    this.direction = null;
    this.triedDirections = [];
    this.targetQueue = [];
  }
}