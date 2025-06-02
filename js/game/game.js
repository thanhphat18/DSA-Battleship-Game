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
    // Click handler for ship selection
    this.shipsPalette.forEach(shipEl => {
      shipEl.addEventListener('click', (e) => {
        // Only handle click if not coming from a drag operation
        if (!e.target.closest('.ship-preview')) {
          this.currentState.onShipPaletteClick(shipEl.dataset.id);
        }
      });

      // Drag and drop handlers
      shipEl.addEventListener('dragstart', this.handleDragStart.bind(this));
      shipEl.addEventListener('dragend', this.handleDragEnd.bind(this));
    });

    // Grid drop handlers
    this.playerGridElement.addEventListener('dragover', this.handleDragOver.bind(this));
    this.playerGridElement.addEventListener('dragleave', this.handleDragLeave.bind(this));
    this.playerGridElement.addEventListener('drop', this.handleDrop.bind(this));
    this.playerGridElement.addEventListener('dragend', this.handleDragEnd.bind(this));

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

  handleDragStart(e) {
    if (!this.currentState.onShipPaletteClick) return;
    
    const shipEl = e.target.closest('.ship-option');
    if (!shipEl) return;
    
    const shipId = shipEl.dataset.id;
    const ship = this.player.ships.find(s => s.id === shipId);
    
    if (ship && ship.positions.length > 0) {
      e.preventDefault();
      return;
    }
    
    this.selectedShipId = shipId;
    shipEl.classList.add('dragging');
    
    // Set drag image to a small preview
    const dragImage = document.createElement('div');
    dragImage.style.width = '20px';
    dragImage.style.height = '20px';
    dragImage.style.background = '#1a365d';
    dragImage.style.position = 'absolute';
    dragImage.style.top = '-9999px';
    document.body.appendChild(dragImage);
    e.dataTransfer.setDragImage(dragImage, 10, 10);
    
    // Store ship data for drop handling
    e.dataTransfer.setData('text/plain', JSON.stringify({
      shipId: shipId,
      length: parseInt(shipEl.dataset.length)
    }));
    
    // Clean up
    setTimeout(() => document.body.removeChild(dragImage), 0);
  }
  
  handleDragOver(e) {
    e.preventDefault();
    const cell = e.target.closest('.grid-cell');
    if (!cell || !this.selectedShipId) return;
    
    const row = parseInt(cell.dataset.row);
    const col = parseInt(cell.dataset.col);
    
    // Highlight valid drop targets
    const ship = this.player.ships.find(s => s.id === this.selectedShipId);
    if (ship && this.player.canPlaceShip(this.selectedShipId, row, col, this.isHorizontal)) {
      cell.classList.add('drop-target');
      // Highlight all cells that would be occupied by the ship
      this.highlightShipPlacement(row, col, this.selectedShipId, true);
    } else {
      cell.classList.add('invalid-drop');
    }
  }
  
  handleDragLeave(e) {
    const cell = e.target.closest('.grid-cell');
    if (cell) {
      cell.classList.remove('drop-target', 'invalid-drop');
      this.clearPlacementHighlights();
    }
  }
  
  handleDrop(e) {
    e.preventDefault();
    const cell = e.target.closest('.grid-cell');
    if (!cell || !this.selectedShipId) return;
    
    const row = parseInt(cell.dataset.row);
    const col = parseInt(cell.dataset.col);
    
    // Clear any highlighting
    this.clearPlacementHighlights();
    
    // Place the ship
    this.currentState.onPlayerGridClick({
      target: cell,
      preventDefault: () => {}
    });
  }
  
  handleDragEnd() {
    // Clear any highlighting
    this.clearPlacementHighlights();
    // Remove dragging class from all ship options
    this.shipsPalette.forEach(el => el.classList.remove('dragging'));
  }
  
  highlightShipPlacement(row, col, shipId, isValid) {
    const ship = this.player.ships.find(s => s.id === shipId);
    if (!ship) return;
    
    const length = ship.size;
    const cells = [];
    
    for (let i = 0; i < length; i++) {
      const r = this.isHorizontal ? row : row + i;
      const c = this.isHorizontal ? col + i : col;
      const cell = this.playerGridElement.querySelector(`[data-row="${r}"][data-col="${c}"]`);
      if (cell) {
        cells.push(cell);
        cell.classList.add(isValid ? 'placement-preview' : 'invalid-placement');
      }
    }
    
    return cells;
  }
  
  clearPlacementHighlights() {
    // Clear all placement preview highlights
    const cells = this.playerGridElement.querySelectorAll('.grid-cell');
    cells.forEach(cell => {
      cell.classList.remove('drop-target', 'invalid-drop', 'placement-preview', 'invalid-placement');
    });
  }
  
  markShipSelectedPlaced(shipId) {
    this.shipsPalette.forEach(shipEl => {
      if (shipEl.dataset.id === shipId) {
        shipEl.classList.add('placed');
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
    
    // Reset ship palette UI
    this.shipsPalette.forEach(shipEl => {
      shipEl.classList.remove('placed');
    });

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
