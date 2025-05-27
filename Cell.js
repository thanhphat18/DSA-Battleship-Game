export class Cell {
    constructor(row, col, boardElement) {
        this.row = row;
        this.col = col;
        this.isHit = false;
        this.hasShip = false;

        this.element = document.createElement("div");
        this.element.classList.add("cell");
        boardElement.appendChild(this.element);
    }

    placeShip() {
        this.hasShip = true;
    }

    handleClick() {
        if (this.isHit) return;
        this.isHit = true;

        if (this.hasShip) {
            this.element.classList.add("hit");
        } else {
            this.element.classList.add("miss");
        }
    }

    reset() {
        this.isHit = false;
        this.hasShip = false;
        this.element.className = "cell";
    }
}
