'use strict';


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
const Game = require('./lib/game.js');
const View = require('./lib/view');
const players = {
	human: require('./lib/player/human'),
	rando: require('./lib/player/rando'),
	eddie: require('./lib/player/eddie')
};

const term = require( 'terminal-kit' ).terminal;
term.grabInput() ;
term.on('key', name => name==='CTRL_C' && process.exit()); // Detect CTRL-C and exit 'manually'

async function run() {
	const view = new View(term);
	await view.showIntro();
	const {player1, player2} = await view.choosePlayers(players);

	const game = new Game(new State(), player1, player2);
	view.showGame(game);

	game.on('state', ()=>{
		view.renderBoard(game);
		view.renderNextPlayer(game);
	});
	game.on('highlight', ()=>{
		view.renderBoard(game);
	});
	game.on('thinking', ()=>{
		view.renderNextPlayer(game);
	});

	do {
		await game.play();

	} while(!game.state.gameover);

	view.renderWinner(game);
	process.exit();
}
run();
