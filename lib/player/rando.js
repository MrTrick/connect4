'use strict';
const assert = require('assert').strict;

const { shuffle, delayPromise } = require('../helpers');
const Player = require('../player');
const State = require('../state');

class PlayerRando extends Player {
	get name() { return 'Rando'; }

	getPlay(state) {
		assert(state instanceof State, 'State state');
		assert(!state.gameover, 'Can play a piece');
		const positions = state.validPlays();
		assert(positions.length > 0, 'Can make at least one play');
		const position = shuffle(positions)[0];

		return Promise.resolve()
		.then(() => {
			this.emit('thinking', 'Considering options...');
			this.emit('highlight', positions);
		})
		.then(delayPromise(500))
		.then(() => {
			this.emit('thinking', 'Choosing one at random...');
		})
		.then(delayPromise(500))
		.then(() => {
			this.emit('thinking', 'Chose position '+position+'.');
			this.emit('highlight', [position]);

			return position;
		});
	}
}

module.exports = PlayerRando;