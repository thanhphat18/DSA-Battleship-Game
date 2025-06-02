export class SetupState {
    constructor(game) {
        this.game = game;
    }

    enter() {
        this.game.updateMessage('Welcome to Battleship! Place your ships.');
        this.game.updateStartButtonState();
        this.game.enableShipPlacementUI();
        this.game.selectedShipId = null;
        this.game.isHorizontal = true;
        this.game.rotateShipButton.textContent = 'Rotate Ship (Horizontal)';
    }

    exit() {
        this.game.disableShipPlacementUI();
    }

    onPlayerGridClick(e) {
        if (!this.game.selectedShipId) return;
        if (!e.target.classList.contains('grid-cell')) return;

        const row = parseInt(e.target.dataset.row);
        const col = parseInt(e.target.dataset.col);
        if (this.game.player.placeShip(this.game.selectedShipId, row, col, this.game.isHorizontal)) {
            this.game.markShipSelectedPlaced(this.game.selectedShipId);
            this.game.selectedShipId = null;
            this.game.updateStartButtonState();
            this.game.updateMessage('Ship placed successfully. Select another ship or start the game.');
        } else {
            this.game.updateMessage('Invalid ship placement position.');
        }
    }

    onRotateButtonClick() {
        this.game.isHorizontal = !this.game.isHorizontal;
        this.game.rotateShipButton.textContent = `Rotate Ship (${this.game.isHorizontal ? 'Horizontal' : 'Vertical'})`;
    }

    onStartButtonClick() {
        if (this.game.player.ships.every(s => s.positions.length > 0)) {
            this.game.switchState('play');
        } else {
            this.game.updateMessage('Please place all ships before starting.');
        }
    }

    onResetButtonClick() {
        this.game.resetGame();
    }

    onShipPaletteClick(shipId) {
        if (this.game.player.ships.find(s => s.id === shipId && s.positions.length > 0)) {
            this.game.updateMessage('This ship has already been placed.');
            return;
        }
        this.game.selectedShipId = shipId;
        this.game.updateMessage(`Select position to place ship: ${shipId}`);
    }

    onOpponentGridClick() {
        // no action during setup on opponent grid
    }
}
