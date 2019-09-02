'use strict';
const assert = require('assert').strict;

const { chooseRandom } = require('../helpers');
const Player = require('../player');
const State = require('../state');

/**
 * Player: Hugh
 * Plays according to some simple heuristics.
 *  1. Will choose a position that wins.
 *  2. Will avoid a position that enables the other play to win immediately.
 *  3. Will choose a position that has the most of its adjacent pieces.
 *  4. If all else fails, chooses a valid position.
 */
class PlayerHugh extends Player {
	static get name() { return 'Hugh'; }
	static get description() { return 'Plays with simple heuristics'; }

	/**
	 * Return the set of positions with an immediate win.
	 * @param {State} state 
	 * @return {Number[]} 
	 */
	getWinningPlays(state) {
		const validPlays = state.validPlays();

		return validPlays.filter(pos=>{
			const next = state.play(pos);
			return next.winner !== false;
		});
	}

	/**
	 * Return the set of positions with no win in the following turn.
	 * @param {State} state 
	 * @return {Number[]} 
	 */
	getSafePlays(state) {
		const validPlays = state.validPlays();

		return validPlays.filter(pos=>{
			const next = state.play(pos);
			return this.getWinningPlays(next).length === 0;
		});
	}

	/**
	 * Return a rough hugh-ristic [sic] score for the given play position.
	 * Looks only at immediate neighbouring pieces:
	 *  - Friendly pieces are worth two
	 *  - Empty spaces or floors are worth one
	 *  - Walls or enemies are worth zero
	 * 
	 * @param {State} state 
	 * @param {Number} pos 
	 * @returns {Number} Score of the position, higher is better.
	 */
	scorePlay(state, pos) {
		assert(state.validPlay(pos));
		//Coordinates of the piece that would be played
		const c = pos - 1, r = state.board[c].length;
		//Coordinates of each neighbouring piece, clockwise from up-right. (above is omitted)
		const neighbours = [[c+1,r+1],[c+1,r],[c+1,r-1],[c,r-1],[c-1,r-1],[c-1,r],[c-1,r+1]];
		//Identity of the player's pieces
		const p = state.nextPiece();

		return neighbours.reduce((score, [c,r])=>{
			//Neighbour is off the top or sides; worth zero.
			if (c>=State.width || c<0 || r>=State.height) return score;

			//Neighbour is off the bottom; worth one.
			else if (r<0) return score + 1;

			//Neighbour is your piece; worth two.
			else if (state.board[c][r] === p) return score + 2;

			//Neighbour is empty; worth one.
			else if (!state.board[c][r]) return score + 1;

			//Neighbour is an opposing piece; worth zero.
			else return score;
		}, 0);
	}

	async getPlay(state) {
		this.assertValidState(state);
		const validPlays = state.validPlays();
		this.emit('highlight', validPlays);

		// Does playing a piece in any position win?
		const winningPlays = this.getWinningPlays(state);
		this.emit('thinking', 'Can I play a winning piece? ' + JSON.stringify(winningPlays));
		if (winningPlays.length > 0) { 
			this.emit('highlight', winningPlays);
			this.emit('thinking', 'Found one! (or more)');
			await this.delay(500);
			return chooseRandom(winningPlays);
		} else {
			this.emit('highlight', []);
			this.emit('thinking', 'No.');
		}

		// Does playing a piece in any position allow the opponent to win?
		this.emit('highlight', validPlays);
		const safePlays = this.getSafePlays(state);
		this.emit('thinking', 'Which places won\'t give the opponent a win? ' + JSON.stringify(safePlays));
		this.emit('highlight', safePlays);
		if (safePlays.length === 0) {
			this.emit('thinking', 'Uh oh. Only losing moves remain...');
			await this.delay(500);
			return chooseRandom(validPlays);
		}

		//Which of the safe spaces is the best move?
		this.emit('thinking', 'Thinking about which safe place is best');
		let max = -1;
		let bestPlays = [];
		for (let pos of safePlays) {
			const score = this.scorePlay(state, pos);
			if (score > max) { 
				bestPlays = [pos];
				max = score;
			} else if (score === max) {
				bestPlays.push(pos);
			}
		}
		this.emit('thinking', JSON.stringify(bestPlays));
		this.emit('thinking', 'Found '+bestPlays.length+' plays with a max score of '+max);
		this.emit('highlight', bestPlays);
		await this.delay(500);
		return chooseRandom(bestPlays);
	}
}

module.exports = PlayerHugh;