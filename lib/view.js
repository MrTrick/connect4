// Handles user-facing concerns - rendering, catching keystrokes
'use strict';
const assert = require('assert').strict;

const State = require('./state');

class Connect4View {
	constructor(term) {
		this.term = term;
	}

	async showIntro() {
		const t = this.term;
		t.clear();
		t.bold('Connect 4\n=========\n');
	}

	async choosePlayers(players) {
		this.term('Select your players:\n');
		for (let [name, playerClass] of Object.entries(players)) {
			this.term("  ").bold(name + ": ")(playerClass.description+'\n');
		}

		this.term.brightRed('\nSelect Player 1:');
		const player1Name = (await this.term.singleColumnMenu(Object.keys(players)).promise).selectedText;
		const player1 = new (players[player1Name])(this.term);

		this.term.brightBlue('\nSelect Player 2:');
		const player2Name = (await this.term.singleColumnMenu(Object.keys(players)).promise).selectedText;
		const player2 = new (players[player2Name])(this.term);
	
		return {player1, player2};
	}

	showGame(game) {
		const player = game.nextPlayer;
		const t = this.term;
		t.clear();

		t.bold('Connect 4\n=========\n');
		t('(Press Ctrl+C to quit)\n');
		this.renderBoard(game);
		this.renderNextPlayer(game);
	}

	renderBoard(game) {
		const t = this.term;
		t.moveTo(1,4);

		t.brightWhite('╔═══════════════╗\n');
		for(let row = State.height-1; row >= 0; row--) {
			t.brightWhite('║');
			for(let col = 0; col < State.width; col++) {
				const vert = game.state.board[col];
				t(' ');
				if (vert[row] === 1) t.brightRed('■');
				else if (vert[row] === 2) t.brightBlue('■');
				else t(' ');
			}
			t.brightWhite(' ║\n');
		}
		t.brightWhite('╚═══════════════╝\n');

		const positions = game.state.validPlays();
		t(' ');
		for(let col = 0; col < State.width; col++) {
			t(' ');
			if (game.highlight.includes(col+1)) t.brightYellow(col+1);
			else if (positions.includes(col+1)) t.brightYellow('.');
			else t(' ');
		}

		t.moveTo(20,5);
		t('Moves: '+game.state.moves.map((m,i)=>t.str[i%2?'bgRed':'bgBlue'](m)).join(''));
	}

	renderNextPlayer(game) {
		const t = this.term;
		const player = game.nextPlayer;

		t.moveTo(1,14);
		if (player === game.player1)
			t.brightRed('Player 1 - ')(player.name +'\'s turn:\n');
		else
			t.brightBlue('Player 2 - ')(player.name +'\'s turn:\n');

		t(game.thoughts.join('\n'));
		t.eraseDisplayBelow();
	}

	renderWinner(game) {
		assert(game.state.gameover);
		
		const t = this.term;
		const winner = game.state.winner;

		t.moveTo(20,7)('Game Over.\n\n').moveTo(20,9);
		if(winner === 1) t('Winner is: ').brightRed('Player 1\n');
		else if (winner === 2) t('Winner is: ').brightBlue('Player 2\n');
		else t('Draw');
		t.moveTo(1,20);
	}
	
}

module.exports = Connect4View;