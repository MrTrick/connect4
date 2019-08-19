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
		this.assertValidState(state);
		
		this.emit('thinking', 'Phoning a friend...');
		return this.phoneAFriend(state)
		.then(({score}) => {
			this.emit('thinking', 'Choosing the best move...')
			this.emit('highlight', positions);

			//Find and return the valid column having the highest score
			let highest = -1000, winner = -1;
			for (let pos of positions) if (score[pos-1] > highest) {
				highest = score[pos-1];
				winner = pos;
			
			}
			return winner;
		})
		.catch((error) => {
			this.emit('thinking', 'They didn\'t answer my call!');
			this.emit('thinking', '(Error: '+error+')');
			this.emit('thinking', 'Making up something instead...');
			this.emit('highlight', positions);

			const position = shuffle(positions)[0];
			return position;
		})
		.then(delayPromise(500))
		.then((position) => {
			this.emit('thinking', 'Chose position '+position+'.');
			this.emit('highlight', [position]);

			return position;
		});
	}
}

module.exports = PlayerEddie;