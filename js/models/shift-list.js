class ShipList {
    constructor(containerId, ships) {
      this.container = document.getElementById(containerId);  // The container where ships will be listed
      this.ships = ships;  // Array of ships to be displayed in the list
      this.createShipList();  // Call the function to create the ship list
    }
  
    // Create the ship list in the UI
    createShipList() {
      this.ships.forEach((ship) => {
        const shipElement = document.createElement("div");
        shipElement.classList.add("ship-item");
        shipElement.id = ship.name;
        shipElement.textContent = `${ship.name} (${ship.size} cells)`;  // Display name and size
        shipElement.draggable = true;  // Make the ship draggable
  
        // Set the ship name in the dataTransfer object for drag-and-drop
        shipElement.addEventListener("dragstart", (e) => {
          e.dataTransfer.setData("ship", ship.name);
        });
  
        // Append the ship element to the container
        this.container.appendChild(shipElement);
      });
    }
  }
  