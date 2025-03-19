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

  // Create the ship list using the ShipList class
  const shipList = new ShipList('ships', playerShips);  // Pass the container ID ('ships') and the ship array

  // Function to start the game after placing ships
  function startGame() {
    console.log("Game Started! Place your ships and make your moves.");
    // Logic to start the game (e.g., first turn, etc.)
  }

  // Add event listener to the start game button
  const startButton = document.getElementById('start-btn');
  startButton.addEventListener("click", startGame);
});
