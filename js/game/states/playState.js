export class PlayState {
    constructor(game) {
        this.game = game;
    }

    enter() {
        this.game.gameStarted = true;
        this.game.playerTurn = true;
        this.game.updateMessage('Trò chơi bắt đầu! Lượt của bạn.');
        this.game.turnIndicator.textContent = 'Lượt của: Bạn';
        this.game.disableShipPlacementUI();
        this.game.setupOpponentShips();
        this.game.startGameButton.disabled = true;
        this.game.resetShipsButton.disabled = true;
    }

    exit() {
        // no cleanup needed here currently
    }

    onPlayerGridClick() {
        // no action during play on player's own grid
    }

    onRotateButtonClick() {
        // disable rotation during play
    }

    onStartButtonClick() {
        // start button disabled during play
    }

    onResetButtonClick() {
        this.game.resetGame();
        this.game.switchState('setup');
    }

    onShipPaletteClick() {
        // no ship selection during play
    }

    onOpponentGridClick(e) {
        if (!this.game.playerTurn) return;
        if (!e.target.classList.contains('grid-cell')) return;

        const row = parseInt(e.target.dataset.row);
        const col = parseInt(e.target.dataset.col);
        const result = this.game.opponent.grid.receiveAttack(row, col);

        if (!result) {
            this.game.updateMessage('Bạn đã chọn ô này rồi. Chọn ô khác.');
            return;
        }

        if (result === 'hit') {
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

        setTimeout(() => this.game.opponentMove(), 1000);
    }
}
