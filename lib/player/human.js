'use strict';
const assert = require('assert').strict;

const Player = require('../player');
const State = require('../state');

class PlayerHuman extends Player {
	constructor(term) {
		super();
		this.term = term;
	}

	get name() { return "Human"; }

	get description() { return 'Human player - uses keyboard input'; }

	getPlay(state) {
		this.assertValidState(state);
		const positions = state.validPlays();

		return new Promise((res) => {
			let pos = 1;
			this.emit('highlight',[pos]);
			const onKey = key => {
				if (key == 'LEFT' && pos > 1) {
					pos--;
					this.emit('highlight',[pos]);
				} else if (key == 'RIGHT' && pos < State.width) {
					pos++;
					this.emit('highlight',[pos]);
				} else if (key == 'ENTER') {
					//Valid position to play?
					if (positions.includes(pos)) {
						this.emit('thinking', 'Chosen position '+pos+'.');
						this.term.off('key', onKey);
						res(pos);
					} else {
						this.emit('thinking', 'Invalid position, choose again.');
					}
				}
			}
			this.term.on('key', onKey);
			this.emit('thinking', 'Use LEFT/RIGHT to choose position, and ENTER to confirm');		
		});
	}
}

module.exports = PlayerHuman;