// main.js — bootstrap: build the game, expose it for debugging and playtests.
import { SpotGame } from './game.js';

const game = new SpotGame();
window.__game = game;
