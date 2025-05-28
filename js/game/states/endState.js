export class EndState {
    constructor(game) {
        this.game = game;
    }

    enter() {
        this.game.gameStarted = false;
        this.game.disableShipPlacementUI();
        this.game.startGameButton.disabled = true;
        this.game.resetShipsButton.disabled = false;
    }

    exit() {
        // nothing special here
    }

    onPlayerGridClick() {
        // no actions allowed
    }

    onRotateButtonClick() {
        // no actions allowed
    }

    onStartButtonClick() {
        // no actions allowed
    }

    onResetButtonClick() {
        this.game.resetGame();
        this.game.switchState('setup');
    }

    onShipPaletteClick() {
        // no actions allowed
    }

    onOpponentGridClick() {
        // no actions allowed
    }
}