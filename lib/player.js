'use strict';
const assert = require('assert').strict;
const EventEmitter = require('events');
const State = require('./state');

class Player extends EventEmitter {
	/**
	 * 
	 * @param {State} state 
	 */
	assertValidState(state) {
		assert(state instanceof State, 'State state');
		assert(!state.gameover, 'Game not over');
		const positions = state.validPlays();
		assert(positions.length > 0, 'Can make at least one play');
	}
}

module.exports = Player;