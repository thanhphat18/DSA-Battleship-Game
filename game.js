class Game {
    constructor() {
      this.playerBoard = new Board("player-board");
      this.computerBoard = new Board("computer-board");
      this.playerShips = [
        new Ship('Carrier', 5),
        new Ship('Battleship', 4),
        new Ship('Cruiser', 3),
        new Ship('Submarine', 3),
        new Ship('Destroyer', 2)
      ];
      this.computerShips = [
        new Ship('Carrier', 5),
        new Ship('Battleship', 4),
        new Ship('Cruiser', 3),
        new Ship('Submarine', 3),
        new Ship('Destroyer', 2)
      ];
      this.currentShipIndex = 0;
      this.currentTurn = 'player';
    }
  
    placePlayerShips() {
      const playerBoard = this.playerBoard;
      this.playerShips.forEach(ship => {
        let placed = false;
        while (!placed) {
          const startIndex = Math.floor(Math.random() * 100);
          const orientation = Math.random() > 0.5 ? 'horizontal' : 'vertical';
          placed = playerBoard.placeShip(ship, startIndex, orientation);
        }
      });
    }
  
    start() {
      this.placePlayerShips();
      alert('All ships placed! Your turn to start!');
    }
  
    checkWinner() {
      if (this.playerBoard.ships.every(ship => ship.isSunk())) {
        alert("Computer wins!");
      } else if (this.computerBoard.ships.every(ship => ship.isSunk())) {
        alert("Player wins!");
      }
    }
  }
  