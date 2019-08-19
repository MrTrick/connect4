'use strict';
const assert = require('assert').strict;

const { shuffle, delayPromise } = require('../helpers');
const Player = require('../player');
const State = require('../state');

class PlayerRando extends Player {
	get name() { return 'Rando'; }

	getPlay(state) {
		this.assertValidState(state);
		const positions = state.validPlays();

		this.emit('thinking', 'Considering options...');
		this.emit('highlight', positions);
		return delayPromise(500)()
		.then(() => {
			this.emit('thinking', 'Choosing one at random...');
			return shuffle(positions)[0];
		})
		.then(delayPromise(500))
		.then((position) => {
			this.emit('thinking', 'Chose position '+position+'.');
			this.emit('highlight', [position]);

			return position;
		});
	}
}

module.exports = PlayerRando;