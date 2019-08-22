'use strict';
const assert = require('assert').strict;

const Player = require('../player');
const State = require('../state');

/**
 * Player: Human
 * Meatbag.
 * 
 * Expects access to the terminal to listen for keyboard input.
 * Plays poorly or well, depending on who has the keyboard.
 */
class PlayerHuman extends Player {
	constructor(term) {
		super();
		this.term = term;
	}

	static get name() { return "Human"; }
	static get description() { return 'Human player - uses keyboard input'; }

	getPlay(state) {
		this.assertValidState(state);
		const positions = state.validPlays().sort();

		return new Promise((res) => {
			let i = 0;
			this.emit('highlight',[positions[i]]);
			
			//Allow choosing between the valid positions
			const onKey = key => {
				if (key == 'LEFT' && i > 0) {
					i--;
					this.emit('highlight',[positions[i]]);
				} else if (key == 'RIGHT' && i < positions.length - 1) {
					i++;
					this.emit('highlight',[positions[i]]);
				} else if (key == 'ENTER') {
					this.emit('thinking', 'Chosen position '+positions[i]+'.');
					this.term.off('key', onKey);
					res(positions[i]);
				}
			};
			this.term.on('key', onKey);
			this.emit('thinking', 'Use LEFT/RIGHT to choose position, and ENTER to confirm');		
		});
	}
}

module.exports = PlayerHuman;