'use strict';
var term = require( 'terminal-kit' ).terminal ;

//Play...

//1. Who is playing?
//2. Start game, render.
//3. Loop;
//  - Get current player
//  - Get player move
//  - Move
//  - If won, stop.
//  - If draw, stop.
//4. Show end state

const State = require('./lib/state');
const PlayerRando = require('./lib/player/rando');
const PlayerEddie = require('./lib/player/eddie');
const PlayerHuman = require('./lib/player/human');
const Game = require('./lib/game.js');

term.grabInput() ;
term.on('key', name => name==='CTRL_C' && process.exit()); // Detect CTRL-C and exit 'manually'


const state = new State();
const player1 = new PlayerHuman(term);
//const player1 = new PlayerRando();
const player2 = new PlayerRando();
//const player2 = new PlayerEddie();
const game = new Game(state, player1, player2);

player1.on('thinking', msg=>console.log('Player 1: '+msg));
player1.on('highlight', cols=>console.log('(Player 1 highlighted '+JSON.stringify(cols)+')'));
player2.on('thinking', msg=>console.log('Player 2: '+msg));
player2.on('highlight', cols=>console.log('(Player 2 highlighted '+JSON.stringify(cols)+')'));

console.log('Connect 4');
console.log(state.toString());
console.log();
function next() {
	game.play().then((state)=>{
		console.log(state.toString());
		if (state.gameover) {
			console.log("Game over");
			console.log(state.winner?"Winner is Player "+state.winner:"Draw");
			process.exit();
		} else {
			console.log('----');
			setImmediate(next);
		}
	})
}
setImmediate(next);