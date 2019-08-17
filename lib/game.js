// 
'use strict'
var assert = require('assert').strict;

class Game {
	/**
	 * 
	 * @param {State} start_state 
	 * @param {Player} player1 
	 * @param {Player} player2 
	 */
	constructor(start_state, player1, player2) {
		this.state = start_state;
		this.player1 = player1;
		this.player2 = player2;
	}

	nextPlayer() {
		const piece = this.state.nextPiece();
		return (piece == 1) ? this.player1 : this.player2;
	}

	play() {
		assert(!this.state.gameover, 'Game continuing');

		//Fetch the play from the player whose turn is next
		const play = this.nextPlayer().getPlay(this.state);

		//When a play is chosen, update the board.
		return play.then(pos => {
			const next = this.state.play(pos);
			this.state = next;
			return next;
		});
	}
}

module.exports = Game;