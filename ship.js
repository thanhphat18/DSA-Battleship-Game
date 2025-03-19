class Ship{
    constructor(name, size){
        this.name = name;
        this.size = size;
        this.cells = [];
        this.hits = 0;
    }

    isSunk(){
        return this.hits >= this.size;
    }

    hit(){
        this.hits++;
    }
}