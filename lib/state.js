// Stores a current state of the connect4 game
'use strict'
var assert = require('assert').strict;

// Game attributes
// It might make sense in another context to make the state parametric, 
// but for simplicity (and compatibility) they are left constant for now.
const width = 7;
const height = 6;
const win_length = 4;

/**
 * 
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
	 * @param {integer} pos Position of the new piece, a number between 1 and width
	 * @param {State} prev State from which this new state descends
	 */
	constructor(pos, prev) {
		//Special case - call with no arguments to create a start state.
		if (arguments.length === 0) {
			this.board = Object.freeze(Array.from({length:width}, ()=>Object.freeze([])));
			this.moves = Object.freeze([]);
			return;
		}

		assert(Number.isInteger(pos) && pos >= 1 && pos <= width, 'pos is an integer 1..width');
		assert(prev instanceof State, 'previous is a State object');
		assert(prev.canPlay(pos), 'pos is a valid position for a piece');
		
		//Build a new list with the new move added
		this.moves = prev.moves.concat(pos);

		//Make a shallow copy of the board, then make a copy of that column with the new piece appended.
		const piece = prev.nextPlayer();
		this.board = prev.board.slice();
		this.board[pos-1] = this.board[pos-1].concat(piece);

		//Lock the internal state of the object - enforce immutability
		Object.freeze(this.board[pos-1]);
		Object.freeze(this.board);
		Object.freeze(this.moves);
	}

	/**
	 * Report whether a piece can validly be played into the given position.
	 * (The position argument is of the correct type and range, and the column is not yet full)
	 * 
	 * @param {integer} pos Position of a new piece, a number between 1 and width
	 * @return {boolean} TRUE if a piece could be played there, FALSE if not. 
	 */
	canPlay(pos) {
		assert(Number.isInteger(pos) && pos >= 1 && pos <= width, 'pos is an integer 1..width');
		return this.board[pos-1] && this.board[pos-1].length < height;
	}

	/**
	 * Play a piece at the given position.
	 * Creates a new state representing the board with that piece played.
	 * 
	 * @param {integer} pos Position of a new piece, a number between 1 and width
	 * @return {State} The new state
	 */
	play(pos) {
		return new State(pos, this);
	}

	/**
	 * Report which player (1 or 2) is next to play a piece.
	 * Alternates, where player 1 always goes first.
	 * @return {1|2} next player
	 */
	nextPlayer() {
		return (this.moves.length % 2) + 1;
	}

	/**
	 * Calculate if the current state has a winner.
	 * (Checks only runs coincident to the last-placed piece)
	 * 
	 * NOTE: This could be implemented very efficiently and 
	 * verbosely with loop sections and tallying code for each possible direction.
	 * There would be many opportunities for typo and other bugs to creep in, needing very many test cases.
	 * 
	 * This implementation assembles 'stripes' of elements, and checks for a win using substring matching. 
	 * It is less performant, but far shorter and easier to test.
	 * 
	 * @return {2|1|false} 2 if Player 2 has won, 1 if Player 1 has won, FALSE if no player has won.
	 */
	findWinner() {
		//Find the location and identity of the last piece
		const col = this.moves[this.moves.length - 1] - 1;
		const row = this.board[col].length - 1;
		const piece = this.board[col][row];
		
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

	/**
	 * Render the state to a compact string form
	 * @return {String}
	 */
	toString() {
		const out = [];
		out.push(this.moves.join(''));
		for(let row = height-1; row >= 0; row--) {
			out.push(this.board.map(vert=>vert[row]||'.').join(''));
		}
		return out.join('\n');
	}
}

module.exports = State;