//Program entry point
'use strict';

const State = require('./lib/state');
const Game = require('./lib/game.js');
const View = require('./lib/view');

//List available Player implementations
const players = {
	human: require('./lib/player/human'),
	rando: require('./lib/player/rando'),
	hugh: require('./lib/player/hugh'),
	eddie: require('./lib/player/eddie')
};

//Set up the terminal
const term = require( 'terminal-kit' ).terminal;
term.grabInput() ;
term.on('key', name => name==='CTRL_C' && process.exit()); // Detect CTRL-C and exit 'manually'

//Main process
async function run() {
	const view = new View(term);

	//Show the intro screen, gather information
	await view.showIntro();
	const {player1, player2} = await view.choosePlayers(players);

	//Build and display the game
	const game = new Game(new State(), player1, player2);
	view.showGame(game);

	//Set up update conditions - when should parts of the screen be re-rendered?
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

	//Main loop - run until the game is complete
	while(!game.state.gameover) {
		await game.play();
	} 

	//Game finished, render the winner	
	view.renderWinner(game);
	process.exit();
}
run();
