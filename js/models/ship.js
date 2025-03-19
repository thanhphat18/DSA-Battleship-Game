class Ship {
    constructor(name, size) {
      this.name = name;
      this.size = size;
      this.isPlaced = false;
      this.coordinates = [];  // The list of coordinates where the ship is placed
    }
  
    // Place the ship on the board (define coordinates)
    place(coords) {
      this.coordinates = coords;
      this.isPlaced = true;
    }
  
    // Reset the ship (if the player wants to reposition it)
    reset() {
      this.coordinates = [];
      this.isPlaced = false;
    }
  }
  