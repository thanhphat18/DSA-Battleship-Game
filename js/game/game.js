import { Player } from '/js/models/player.js';
import { AIPlayer } from '/js/bot/aiPlayer.js';
import { SetupState } from '/js/game/states/setupState.js';
import { PlayState } from '/js/game/states/playState.js';
import { EndState } from '/js/game/states/endState.js';

export class Game {
  constructor() {
    this.playerGridElement = document.getElementById('player-grid');
    this.opponentGridElement = document.getElementById('opponent-grid');
    this.messageArea = document.getElementById('message-area');
    this.turnIndicator = document.getElementById('turn-indicator');
    this.startGameButton = document.getElementById('start-game-button');
    this.resetShipsButton = document.getElementById('reset-ships-button');
    this.rotateShipButton = document.getElementById('rotate-ship-button');
    this.shipsPalette = document.querySelectorAll('.ship-option');

    this.player = new Player('You', this.playerGridElement);
    this.opponent = new AIPlayer('Opponent', this.opponentGridElement);

    this.isHorizontal = true;
    this.selectedShipId = null;
    this.gameStarted = false;
    this.playerTurn = true;

    this.states = {
      setup: new SetupState(this),
      play: new PlayState(this),
      end: new EndState(this),
    };

    this.currentState = this.states.setup;

    this.init();
  }

  init() {
    this.attachEventListeners();
    this.currentState.enter();
  }

  attachEventListeners() {
    this.shipsPalette.forEach(shipEl => {
      shipEl.addEventListener('click', () => {
        this.currentState.onShipPaletteClick(shipEl.dataset.id);
      });
    });

    this.rotateShipButton.addEventListener('click', () => {
      this.currentState.onRotateButtonClick();
    });

    this.startGameButton.addEventListener('click', () => {
      this.currentState.onStartButtonClick();
    });

    this.resetShipsButton.addEventListener('click', () => {
      this.currentState.onResetButtonClick();
    });

    this.playerGridElement.addEventListener('click', e => {
      this.currentState.onPlayerGridClick(e);
    });

    this.opponentGridElement.addEventListener('click', e => {
      this.currentState.onOpponentGridClick(e);
    });
  }

  switchState(stateName) {
    this.currentState.exit();
    this.currentState = this.states[stateName];
    this.currentState.enter();
  }

  markShipSelectedPlaced(shipId) {
    this.shipsPalette.forEach(shipEl => {
      if (shipEl.dataset.id === shipId) {
        shipEl.style.opacity = 0.5;
        shipEl.style.pointerEvents = 'none';
      }
    });
  }

  // setupOpponentShips() {
  //     this.opponent.ships.forEach(ship => {
  //         let placed = false;
  //         while (!placed) {
  //             const isHorizontal = Math.random() < 0.5;
  //             const row = Math.floor(Math.random() * 10);
  //             const col = Math.floor(Math.random() * 10);
  //             placed = this.opponent.placeShip(ship.id, row, col, isHorizontal);
  //         }
  //     });
  // }

  // opponentMove() {
  //     let row, col, result;
  //     do {
  //         row = Math.floor(Math.random() * 10);
  //         col = Math.floor(Math.random() * 10);
  //         result = this.player.grid.receiveAttack(row, col);
  //     } while (!result);

  //     if (result === 'hit') {
  //         this.updateMessage('Đối thủ đã trúng tàu của bạn!');
  //         if (this.player.allShipsSunk()) {
  //             this.updateMessage('Bạn đã thua! 😢');
  //             this.switchState('end');
  //             return;
  //         }
  //     } else {
  //         this.updateMessage('Đối thủ đã bắn trượt.');
  //     }

  //     this.playerTurn = true;
  //     this.turnIndicator.textContent = 'Lượt của: Bạn';
  // }

  handleResult(row, col, result) {
    if (result.hit) {
      this.updateMessage(`Máy đã bắn trúng tàu của bạn tại (${row}, ${col})!`, "ai-hit");

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
        this.updateMessage(`Máy đã đánh chìm ${result.sunkShip.name} của bạn!`, "ai-sunk");
        this.resetTargeting();
        if (checkWin(this.ships)) {
          endGame(false);
        }
      }
    } else {
      this.updateMessage(`Máy bắn trượt tại (${row}, ${col}).`, "ai-miss");

      if (this.direction) {
        this.direction = GridUtils.reverse(this.direction);
        this.targetQueue = [GridUtils.nextInDirection(this.lastHit.row, this.lastHit.col, this.direction)];
      } else if (this.lastHit) {
        this.triedDirections.push({ row, col });
        this.addAdjacentTargets(this.lastHit.row, this.lastHit.col);
      }
    }
  }

  updateMessage(text) {
    this.messageArea.textContent = text;
  }

  updateStartButtonState() {
    const allPlaced = this.player.ships.every(ship => ship.positions.length > 0);
    this.startGameButton.disabled = !allPlaced;
  }

  enableShipPlacementUI() {
    this.shipsPalette.forEach(shipEl => {
      shipEl.style.pointerEvents = 'auto';
      shipEl.style.opacity = 1;
    });
    this.rotateShipButton.disabled = false;
    this.startGameButton.disabled = true;
    this.resetShipsButton.disabled = false;
  }

  disableShipPlacementUI() {
    this.shipsPalette.forEach(shipEl => {
      shipEl.style.pointerEvents = 'none';
      shipEl.style.opacity = 0.5;
    });
    this.rotateShipButton.disabled = true;
  }

  resetGame() {
    this.player.reset();
    this.opponent.reset();

    this.selectedShipId = null;
    this.gameStarted = false;
    this.playerTurn = true;
    this.isHorizontal = true;

    this.rotateShipButton.textContent = 'Xoay tàu (Ngang)';
    this.updateMessage('Chào mừng đến với Battleship! Hãy đặt tàu của bạn.');

    this.shipsPalette.forEach(shipEl => {
      shipEl.style.opacity = 1;
      shipEl.style.pointerEvents = 'auto';
    });

    this.rotateShipButton.disabled = false;
    this.startGameButton.disabled = true;
    this.resetShipsButton.disabled = false;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new Game();
});
