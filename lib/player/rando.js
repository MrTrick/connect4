'use strict';
const assert = require('assert').strict;

const { shuffle } = require('../helpers');
const Player = require('../player');
const State = require('../state');

class PlayerRando extends Player {
	static get name() { return 'Rando'; }
	static get description() { return 'Just randomly places pieces'; }

	getPlay(state) {
		this.assertValidState(state);
		const positions = state.validPlays();

		this.emit('thinking', 'Considering options...');
		this.emit('highlight', positions);
		return this.delay(500)()
		.then(() => {
			const position = shuffle(positions)[0];
			this.emit('thinking', 'Choosing one at random...');
			this.emit('highlight', [position]);
			return position;
		})
		.then(this.delay(500))
		.then((position) => {
			this.emit('thinking', 'Chose position '+position+'.');

			return position;
		});
	}
}

module.exports = PlayerRando;