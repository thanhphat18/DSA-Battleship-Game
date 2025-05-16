document.addEventListener("DOMContentLoaded", () => {
  // Create the player and bot boards
  const playerBoard = new Board('player-board');
  const botBoard = new Board('bot-board');

  // Create ships
  const ship1 = new Ship('Battleship', 4);  // Ship with size 4
  const ship2 = new Ship('Cruiser', 3);     // Ship with size 3
  const ship3 = new Ship('Destroyer', 2);   // Ship with size 2
  const ship4 = new Ship('Submarine', 3);   // Ship with size 3
  const ship5 = new Ship('Carrier', 5);     // Ship with size 5
  
  // Store all ships in an array
  const playerShips = [ship1, ship2, ship3, ship4, ship5];
  const botShips = [ship1, ship2, ship3, ship4, ship5];

  // Create the ship list using the ShipList class
  const shipList = new ShipList('ships', playerShips);  // Pass the container ID ('ships') and the ship array

  // Function to start the game after placing ships
  function startGame() {
    console.log("Game Started! Place your ships and make your moves.");
    // Logic to start the game (e.g., first turn, etc.)
  }

  //
  function canPlaceShip(currentShips, row, col, length, horizontal, gridSize) {
    const tempPositions = [];
    for (let i = 0; i < length; i++){
      let r = row;
      let c = col;
      if (horizontal){
        c += i;
      } else {
        r += i;
      }
      if (r >= gridSize || c >= gridSize) return false;
      tempPositions.push({row: r, col: c})
    }

    //Check for overlapping
    for (const ship of currentShips){
      for (const coord of ship.coordinates){
        for (const tempPos of tempPositions) {
          if (coord.row === tempPos.row && coord.col === tempPos.col){
            return false;
          }
        }
      }
    }
    return true;
  }

  //
  function placeBotShips(){
    leftShips = [];
    botShips.forEach(ship => ship.isPlaced = false);

    for (const ship of botShips){
      let placed = false;
      while (!placed){
        const horizontal = Math.random() < 0.5; //Random whether the ship placed is horizontal or not(boolean)
        const row = Math.floor(Math.random() * 10); 
        const col = Math.floor(Math.random() * 10);
        //generate random coordinate for ship

        if (canPlaceShip(leftShips, row, col, ship.size, horizontal, 10)){
          const newShip = new Ship(ship.name, shipship.size)
          for (let i = 0; i< shipship.length; i++){
            let r = row;
            let c = col;
            if (horizontal){
              c += i
            } else {
              r += i
            }
            newShip.coordinates.push({row: r, col:c})
          }
          leftShips.push(newShip);
          ship.isPlaced = true;
          placed = true;
        }
      }
    }
  }

  // Add event listener to the start game button
  const startButton = document.getElementById('start-btn');
  startButton.addEventListener("click", startGame);
});
