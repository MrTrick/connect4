'use strict';
const assert = require('assert').strict;
const EventEmitter = require('events');
const { delayPromise } = require('./helpers');
const State = require('./state');

/**
 * Base class for Player implementations
 */
class Player extends EventEmitter {
	/**
	 * @return {string} Player name
	 */
	static get name() { assert.fail("Must be overridden."); }
	get name() { return this.constructor.name; }

	/**
	 * @return {string} Player description
	 */
	static get description() { assert.fail("Must be overridden."); }
	get description() { return this.constructor.description; }

	/**
	 * Main player method - given the current state, calculate
	 * and resolve with the next place to play a piece
	 * @param {State} state 
	 * @return {Promise(Number)} A promise resolving with a number 1-State.width
	 */
	getPlay(state) { // jshint unused:false
		assert.fail("Must be overridden.");
	}

	/**
	 * Helper method.
	 * Wraps the delayPromise helper, allowing unit tests to mock it away.
	 * @see delayPromise
	 * @param {Number} ms 
	 * @returns {Promise(any)} Resolve after the given ms delay
	 */
	delay(ms) { return delayPromise(ms); }

	/**
	 * Helper method.
	 * Runs assertions on a State object, ensuring it is valid for continuing play.
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