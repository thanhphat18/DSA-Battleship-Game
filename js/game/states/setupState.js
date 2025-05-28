export class SetupState {
    constructor(game) {
        this.game = game;
    }

    enter() {
        this.game.updateMessage('Chào mừng đến với Battleship! Hãy đặt tàu của bạn.');
        this.game.updateStartButtonState();
        this.game.enableShipPlacementUI();
        this.game.selectedShipId = null;
        this.game.isHorizontal = true;
        this.game.rotateShipButton.textContent = 'Xoay tàu (Ngang)';
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
            this.game.updateMessage('Đặt tàu thành công. Chọn tàu khác hoặc bắt đầu chơi.');
        } else {
            this.game.updateMessage('Vị trí đặt tàu không hợp lệ.');
        }
    }

    onRotateButtonClick() {
        this.game.isHorizontal = !this.game.isHorizontal;
        this.game.rotateShipButton.textContent = `Xoay tàu (${this.game.isHorizontal ? 'Ngang' : 'Dọc'})`;
    }

    onStartButtonClick() {
        if (this.game.player.ships.every(s => s.positions.length > 0)) {
            this.game.switchState('play');
        } else {
            this.game.updateMessage('Vui lòng đặt tất cả tàu trước khi bắt đầu.');
        }
    }

    onResetButtonClick() {
        this.game.resetGame();
    }

    onShipPaletteClick(shipId) {
        if (this.game.player.ships.find(s => s.id === shipId && s.positions.length > 0)) {
            this.game.updateMessage('Tàu này đã được đặt.');
            return;
        }
        this.game.selectedShipId = shipId;
        this.game.updateMessage(`Chọn vị trí để đặt tàu: ${shipId}`);
    }

    onOpponentGridClick() {
        // no action during setup on opponent grid
    }
}