import { GameController } from './GameController.js';

const playerBoardEl = document.getElementById("player-board");
const enemyBoardEl = document.getElementById("enemy-board");

const game = new GameController(playerBoardEl, enemyBoardEl);
