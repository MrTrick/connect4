'use strict';
const assert = require('assert').strict;
const request = require('request-promise-native');

const { shuffle, delayPromise } = require('../helpers');
const Player = require('../player');
const State = require('../state');

class PlayerEddie extends Player {
	get name() { return "Eddie"; }

	/**
	 * Fetch external help
	 * @param {State} state 
	 * @return {Promise(Object)} Resolve with a {pos, score[]} object
	 */
	phoneAFriend(state) {
		//Pass the list of moves, as a URL query
		const uri = 'https://connect4.gamesolver.org/solve?pos=' + state.moves.join('');
		const headers = {referer:uri};
		const timeout = 2000;
		return request({uri,headers,timeout}).then(bodystr=>JSON.parse(bodystr));
	}

	getPlay(state) {
		assert(state instanceof State, 'State state');
		assert(!state.gameover, 'Game not over');
		const positions = state.validPlays();
		assert(positions.length > 0, 'Can make at least one valid play');
		
		return Promise.resolve()
		.then(() => {
			this.emit('thinking', 'Phoning a friend...');
			return this.phoneAFriend(state);
		})
		.then(({score}) => {
			this.emit('thinking', 'Choosing the best move...')
			this.emit('highlight', positions);

			//Find the column with the largest score
			let max = -1000, maxCol = -1;
			for(let col of positions) {
				if (score[col] > max) {
					max = score[col];
					maxCol = col;
				}
			}
			
			//Convert column to position
			return maxCol+1;
		})
		.then(delayPromise(500))
		.then((position) => {
			this.emit('thinking', 'Chose position '+position+'.\n');
			this.emit('highlight', [position]);

			return position;
		});
	}
}

module.exports = PlayerEddie;