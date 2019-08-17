'use strict';
const assert = require('assert').strict;

const { shuffle, delayPromise } = require('../helpers');
const Player = require('../player');

class PlayerRando extends Player {
	constructor() { super(); }

	get name() { return "Rando"; }

	getPlay(state) {
		assert(!state.gameover, "Not given a finished game state");
		const positions = state.validPlays();
		assert(positions.length > 0, "Can make at least one play");
		const position = shuffle(positions)[0];

		return Promise.resolve()
		.then(delayPromise(100))
		.then(() => {
			this.emit('thinking', "Considering options...\n");
			this.emit('highlight', positions);
		})
		.then(delayPromise(500))
		.then(() => {
			this.emit('thinking', "Choosing one at random...\n");
		})
		.then(delayPromise(500))
		.then(() => {
			this.emit('thinking', "Chose position "+position+".\n");
			this.emit('highlight', [position]);

			return position;
		});
	}
}

module.exports = PlayerRando;