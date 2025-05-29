export class Ship {
    constructor(id, length) {
        this.id = id;
        this.length = length;
        this.positions = [];
        this.hits = 0;
        this.isSunk = false;
        this.isPlaced = false;
    }

    place(positions) {
        this.positions = positions;
        this.hits = 0;
        this.isSunk = false;
    }

    hit() {
        this.hits++;
        if (this.hits >= this.length) {
            this.isSunk = true;
        }
    }
}
