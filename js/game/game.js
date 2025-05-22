document.addEventListener("DOMContentLoaded", () => {
  //Global state for AI attack
  let aiHitsQueue = [];
  let aiLastHit = null;
  let aiDirection = null;
  let aiTriedDirection = [];

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

  //place ship function
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

  //Place botship randomly
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

  //Function for AI attack
  function aiTurn() {
        if (gameOver) return;

        const target = aiChooseTarget();
        if (!target) {
            playerTurn = true;
            turnIndicator.textContent = "Lượt của: Bạn";
            enableOpponentGridAttacks();
            return;
        }

        const { row, col } = target;
        updateMessage(`Máy bắn vào ô (${row}, ${col}) của bạn...`, "ai-turn");

        const result = processAttack(row, col, playerShips, playerGridElement, 'player', playerSunkList, playerShipConfigs);
        aiHandleResult(row, col, result);

        if (!gameOver) {
            playerTurn = true;
            turnIndicator.textContent = "Lượt của: Bạn";
            enableOpponentGridAttacks();
        }
    }

  //
  function aiChooseTarget() {
    let row, col;

    //Try target queue first
    while (aiHitsQueue.length > 0) {
      const candidate = aiHitsQueue.shift();
      const cell = playerGridElement.querySelector(`.grid-cell[data-row='${candidate.row}'][data-col='${candidate.col}']`)
      if (cell && !cell.classList.contains('hit') && !cell.classList.contains('miss')) {
        return candidate;
      }
    }

    //Fallback: random shot
    let attempts = 0;
    while (attempts < GRID_SIZE * GRID_SIZE) {
      row = Math.floor(Math.random() * GRID_SIZE);
      col = Math.floor(Math.random() * GRID_SIZE);
      const cell = playerGridElement.querySelector(`.grid-cell[data-row='${row}'][data-col='${col}']`);
      if (cell && !cell.classList.contains('hit') && !cell.classList.contains('miss')) {
        return { row, col };
      }
      attempts++;
    }

    return null;
  }

  //
  function aiHandleResult(row, col, result) {
    if (result.hit) {
      updateMessage(`Máy đã bắn trúng tàu của bạn tại (${row}, ${col})!`, "ai-hit");
      if (!aiLastHit) {
        aiLastHit = { row, col };
        aiTriedDirections = [];
        addAdjacentTargets(row, col);
      } else if (!aiDirection) {
        aiDirection = getDirection(aiLastHit, { row, col });
        if (aiDirection) {
          aiHitsQueue = [getNextCellInDirection(row, col, aiDirection)];
        }
      } else {
        aiHitsQueue.unshift(getNextCellInDirection(row, col, aiDirection));
      }

      if (result.sunkShip) {
        updateMessage(`Máy đã đánh chìm ${result.sunkShip.name} của bạn!`, "ai-sunk");
        aiLastHit = null;
        aiDirection = null;
        aiHitsQueue = [];
        aiTriedDirections = [];

        if (checkWin(playerShips)) {
          endGame(false) //AI win
        }
      }

    } else {
      updateMessage(`Máy bắn trượt tại (${row}, ${col}).`, "ai-miss");

      if (aiDirection) {
        aiDirection = reverseDirection(aiDirection);
        aiHitsQueue = [getNextCellInDirection(aiLastHit.row, aiLastHit.col, aiDirection)];
      } else if (aiLastHit) {
        aiTriedDirections.push({ row, col });
        addAdjacentTargets(aiLastHit.row, aiLastHit.col);
      }
    }
  }

  //Helper function for AI
  function addAdjacentTargets(row, col) {
    const directions = [
      { dir: "up", row: row - 1, col },
      { dir: "down", row: row + 1, col },
      { dir: "left", row, col: col - 1 },
      { dir: "right", row, col: col + 1 }
    ];
    directions.forEach(d => {
      if (d.row >= 0 && d.row < GRID_SIZE && d.col >= 0 && d.col < GRID_SIZE) {
        aiHitsQueue.push({ row: d.row, col: d.col });
      }
    });
  }

  function getDirection(from, to) {
    if (from.row === to.row) return from.col < to.col ? "right" : "left";
    if (from.col === to.col) return from.row < to.row ? "down" : "up";
    return null;
  }

  function reverseDirection(dir) {
    const map = { up: "down", down: "up", left: "right", right: "left" };
    return map[dir] || null;
  }

  function getNextCellInDirection(row, col, dir) {
    switch (dir) {
      case "up": return { row: row - 1, col };
      case "down": return { row: row + 1, col };
      case "left": return { row, col: col - 1 };
      case "right": return { row, col: col + 1 };
      default: return null;
    }
  }

  // Add event listener to the start game button
  const startButton = document.getElementById('start-btn');
  startButton.addEventListener("click", startGame);
});
