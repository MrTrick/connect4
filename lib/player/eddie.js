'use strict';
const request = require('request-promise-native');

const { chooseRandom } = require('../helpers');
const Player = require('../player');

/**
 * Player: Eddie
 * As in 'Who Wants To Be a Millionaire' and the 'phone a friend' mechanism.
 * 
 * Uses a connect4 AI API provided by https://connect4.gamesolver.org
 * Plays perfectly.
 */
class PlayerEddie extends Player {
	static get name() { return "Eddie"; }
	static get description() { return 'Phones a friend for advice on where to place pieces'; }

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

	async getPlay(state) {
		this.assertValidState(state);
		const positions = state.validPlays();
		
		this.emit('thinking', 'Phoning a friend...');
		const position = await this.phoneAFriend(state)
		.then(({score}) => {
			this.emit('thinking', 'Choosing the best move...');
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

			const position = chooseRandom(positions);
			return position;
		});
		await this.delay(500);
		
		this.emit('thinking', 'Chose position '+position+'.');
		this.emit('highlight', [position]);

		return position;
	}
}

module.exports = PlayerEddie;