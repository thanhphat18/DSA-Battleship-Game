import { Player } from '/js/models/player.js';
import { AIPlayer } from '/js/bot/aiPlayer.js';
import { SetupState } from '/js/game/states/setupState.js';
import { PlayState } from '/js/game/states/playState.js';
import { EndState } from '/js/game/states/endState.js';
import { SoundManager } from '/sounds/soundManager.js';


export class Game {
  constructor() {
    this.playerGridElement = document.getElementById('player-grid');
    this.opponentGridElement = document.getElementById('opponent-grid');
    this.messageArea = document.getElementById('message-area');
    this.turnIndicator = document.getElementById('turn-indicator');
    this.startGameButton = document.getElementById('start-game-button');
    this.resetShipsButton = document.getElementById('reset-ships-button');
    this.rotateShipButton = document.getElementById('rotate-ship-button');
    this.undoButton = document.getElementById('undo-button');
    this.shipsPalette = document.querySelectorAll('.ship-option');
    this.gridSize = 10;
    this.sound = new SoundManager();

    this.player = new Player('You', this.playerGridElement);
    this.opponent = new AIPlayer('Opponent', this.opponentGridElement);

    this.isHorizontal = true;
    this.selectedShipId = null;
    this.gameStarted = false;
    this.playerTurn = true;

    //AI set up
    this.targetQueue = [];
    this.lastHit = null;
    this.direction = null;
    this.triedDirections = [];

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

    this.undoButton.addEventListener('click', () => {
      if (this.currentState.undoMove) {
        this.currentState.undoMove();
      }
    });

    this.playerGridElement.addEventListener('click', e => {
      this.currentState.onPlayerGridClick(e);
    });

    this.opponentGridElement.addEventListener('click', e => {
      this.currentState.onOpponentGridClick(e);
    });
  }

  switchState(stateName) {
    //this.currentState.exit();
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

    this.rotateShipButton.textContent = 'Rotate Ship (Horizontal)';
    this.updateMessage('Welcome to Battleship! Place your ships.');

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

  // Dark Mode Toggle
const themeButton = document.getElementById("toggle-theme");
themeButton.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  const isDark = document.body.classList.contains("dark");
  themeButton.textContent = isDark ? "☀️ Light Mode" : "🌙 Dark Mode";
});

  // Game cover
  const cover = document.getElementById("game-cover");
const startCoverBtn = document.getElementById("start-cover-btn");

startCoverBtn.addEventListener("click", () => {
  cover.style.display = "none"; // Ẩn màn cover
});
});