// Stores a current state of the connect4 game
'use strict';
const assert = require('assert').strict;
const { deepFreeze } = require('./helpers');

// Game attributes
//   It might make sense in another context to make the state parametric, 
//   but for simplicity (and compatibility) they are left constant for now.
const width = 7;
const height = 6;
const win_length = 4;

/**
 * Immutably represents a state of a connect4 game.
 * Includes:
 *  - a sequence of the moves made up til this point (player 1 moves first, then alternating)
 *  - a 2D array representing the board produced by those moves
 *  - flags for winner and gameover
 *  - the coordinates of the last piece placed
 * 
 * State is immutable for several reasons:
 *  - Optimised for generating move trees and searching the solution space
 *  - Much simpler, the only modification occurs upon copy. (construction)
 *  - Cannot be modified by sneaky or poorly written player objects.
 */
class State {
	/**
	 * Create a new state.
	 * Called in two modes:
	 * 
	 * new State()
	 *   Constructs a start state, eg with no moves yet made.
	 * 
	 * new State(pos, previous)
	 *   Add a piece to a previous state, constructing a new state
	 * 
	 * @param {Number} pos Position of the new piece, a number between 1 and width
	 * @param {State} state Previous state from which this new state descends
	 */
	constructor(pos, state) {
		//Special case - call with no arguments to create a start state.
		if (arguments.length === 0) {
			this.board = Array.from({length:width}, ()=>[]);
			this.moves = [];
			this.winner = false;
			this.gameover = false;
			deepFreeze(this);
			return;
		}

		assert(Number.isInteger(pos) && pos >= 1 && pos <= width, 'pos is an integer 1..width');
		assert(state instanceof State, 'previous is a State object');
		assert(state.validPlay(pos), 'pos is a valid position for a piece');
		
		//Build a new list with the new move added
		this.moves = state.moves.concat(pos);

		//Where will this piece land?
		this.col = pos - 1;
		this.row = state.board[this.col].length;

		//Make a shallow copy of the board, then make a copy of that column with the new piece appended.
		const piece = state.nextPiece();
		this.board = state.board.slice();
		this.board[this.col] = this.board[this.col].concat(piece);

		//Set the state's flags;
		this.winner = this._won(pos-1, this.board[pos - 1].length - 1, piece) ? piece : false;
		this.gameover = this.winner || this._full();

		//Lock the internal state of the object - enforce immutability
		deepFreeze(this);
	}

	/**
	 * Report whether a piece can validly be played into the given position.
	 * (The position argument is of the correct type and range, and the column is not yet full)
	 * 
	 * @param {Number} pos Position of a new piece, a number between 1 and width
	 * @return {boolean} TRUE if a piece could be played there, FALSE if not. 
	 */
	validPlay(pos) {
		assert(Number.isInteger(pos) && pos >= 1 && pos <= width, 'pos is an integer 1..width');

		return this.board[pos-1] && this.board[pos-1].length < height;
	}

	/**
	 * Report on all valid play positions
	 * 
	 * @return {object} An array of positions where a piece can be played
	 */
	validPlays() {
		let valid_plays = [];

		for (let pos=1;pos<=width;pos++) {
			if (this.validPlay(pos)) valid_plays.push(pos);
		}

		return valid_plays;
	}

	/**
	 * Report which player (1 or 2) is next to play a piece.
	 * Alternates, where player 1 always goes first.
	 * @return {1|2} next player
	 */
	nextPiece() {
		return (this.moves.length % 2) + 1;
	}

	/**
	 * Play a piece at the given position.
	 * Creates a new state representing the board with that piece played.
	 * 
	 * @param {Number} pos Position of a new piece, a number between 1 and width
	 * @return {State} The new state
	 */
	play(pos) {
		return new State(pos, this);
	}

	/**
	 * Render the state to a compact string form
	 * @return {String}
	 */
	toString() {
		const out = [];
		out.push(this.moves.join(''));
		for(let row = height-1; row >= 0; row--) {
			const r = row;
			out.push(this.board.map(vert=>vert[r]||'.').join(''));
		}
		return out.join('\n');
	}

	/**
	 * (Internal method - called only by constructor)
	 * Calculate whether the state represents a full board - a tie game.
	 * (Does not itself check for wins, only that the board is full)
	 * 
	 * @return {boolean} TRUE if the board is full, FALSE it not
	 */
	_full() {
		return this.moves.length >= width*height;
	}

	/**
	 * (Internal method - called only by constructor)
	 * Calculate whether the current state has a winner.
	 * (Checks only runs coincident to the last-placed piece)
	 * 
	 * NOTE: This could be implemented very efficiently and 
	 * verbosely with loop sections and tallying code for each possible direction.
	 * There would be many opportunities for typo and other bugs to creep in, needing very many test cases.
	 * 
	 * This implementation assembles 'stripes' of elements, and checks for a win using substring matching. 
	 * It is less performant, but far shorter and easier to test.
	 * 
	 * @param {Number} col Column of the last move, 0 <= col < width
	 * @param {Number} row Row of the last move, 0 <= row < height
	 * @param {2|1} piece Identity of the piece 
	 * @return {2|1|false} 2 if Player 2 has won, 1 if Player 1 has won, FALSE if no player has won.
	 */
	_won(col, row, piece) {
		const win_string = String(piece).repeat(win_length);

		//Check vertical wins
		if (this.board[col].join('').includes(win_string)) return true;

		//Check horizontal wins
		if (this.board.map(vert=>vert[row]||'').join('').includes(win_string)) return true;

		//Check 'forward-slash' diagonal wins, eg:
		//  ....o..   c = 4, r = 5
		//  ...o...   c = 3, r = 4
		//  ..x.... < col=2, row=3
		//  .o.....   c = 1, r = 2
		//  o......   c = 0, r = 1 
		//  .......
		if (this.board.map((vert,c)=>vert[c+row-col]||'').join('').includes(win_string)) return true;

		//Check 'backward-slash' diagonal wins, eg:
		//  o......   c = 0, r = 5
		//  .o.....   c = 1, r = 4
		//  ..o....   c = 2, r = 3
		//  ...o...   c = 3, r = 2
		//  ....x.. < col=4, row=1
		//  .....o.   c = 5, r = 0
		if (this.board.map((vert,c)=>vert[col+row-c]||'').join('').includes(win_string)) return true;

		return false;
	}
}

/**
 * Construct a state by making the given sequence of moves.
 * The sequence can be an array or a string of digits.
 * 
 * @param {string|Number[]} moves Sequence of move positions 1..width
 * @return {State} The resultant state
 * @throws Error if the sequence would result in an invalid state
 */
State.parse = function(moves) {
	if (typeof moves === 'string') moves = moves.split('').map(p=>+p);
	assert(Array.isArray(moves), 'moves is a string or an array of position numbers');

	let state = new State();
	for (let pos of moves) {
		state = new State(pos, state);
	}
	return state;
};

State.width = width;
State.height = height;
Object.freeze(State);

module.exports = State;