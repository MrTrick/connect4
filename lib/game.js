//Represents and encapsulates the game itself - the players and the board state
'use strict';
const assert = require('assert').strict;
const EventEmitter = require('events');

const State = require('./state');
const Player = require('./player');

/**
 * Game Controller
 * 
 * Contains:
 *  - The game state
 *  - The players (and current player)
 *  - The highlighted columns
 *  - The current player's thoughts
 * 
 * Implements Action:
 *  - Play (next move)
 * 
 * Generates/Relays events on:
 *  - Change of state
 *  - Change of highlighted columns
 *  - Change of player's thoughts
 */
class Game extends EventEmitter {
	/**
	 * @param {State} start_state 
	 * @param {Player} player1 
	 * @param {Player} player2 
	 */
	constructor(start_state, player1, player2) {
		super();

		assert(start_state instanceof State);
		assert(player1 instanceof Player);
		assert(player2 instanceof Player);

		this.state = start_state;
		this.player1 = player1;
		this.player2 = player2;

		this.thoughts = [];
		this.highlight = [];

		//Chain Player events to Game events
		const onThinking = (msg, player) => {
			if (player !== this.nextPlayer) return;
			this.thoughts.push(msg);
			this.emit('thinking', msg, player);
		};
		const onHighlight = (highlight, player) => {
			if (player !== this.nextPlayer) return;
			this.highlight = highlight;
			this.emit('highlight', highlight, player);
		};
		player1.on('thinking', msg=>onThinking(msg, player1));
		player2.on('thinking', msg=>onThinking(msg, player2));
		player1.on('highlight', highlight=>onHighlight(highlight, player1));
		player2.on('highlight', highlight=>onHighlight(highlight, player2));
	}

	/**
	 * Accessor for the next player to make a move.
	 * Based off the 
	 * @return {Player}
	 */
	get nextPlayer() {
		const piece = this.state.nextPiece();
		return (piece === 1) ? this.player1 : this.player2;
	}

	/**
	 * Play the next step of the game.
	 * Delegate to the current player to choose where to place the piece.
	 * Delegate to state to generate the next state.
	 * @returns {Promise()}
	 */
	play() {
		assert(!this.state.gameover, 'Game continuing');

		//Fetch the play from the player whose turn is next
		const play = this.nextPlayer.getPlay(this.state);

		//When a play is chosen, update the board.
		return play.then(pos => {
			const next = this.state.play(pos);
			this.highlight = [];
			this.thoughts = [];
			this.state = next;
			this.emit('state', this.state);
			return next;
		});
	}
}

module.exports = Game;