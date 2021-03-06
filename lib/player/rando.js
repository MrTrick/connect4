'use strict';
const { chooseRandom } = require('../helpers');
const Player = require('../player');

/**
 * Player: Rando
 * Has no idea, just chooses randomly.
 * 
 * Won't choose invalid moves.
 * Plays very poorly, 99% of the time.
 */
class PlayerRando extends Player {
	static get name() { return 'Rando'; }
	static get description() { return 'Just randomly places pieces'; }

	async getPlay(state) {
		this.assertValidState(state);
		const positions = state.validPlays();

		this.emit('thinking', 'Considering options...');
		this.emit('highlight', positions);
		await this.delay(500);
			
		const position = chooseRandom(positions);
		this.emit('thinking', 'Choosing one at random...');
		this.emit('highlight', [position]);
		await this.delay(500);

		this.emit('thinking', 'Chose position '+position+'.');
		return position;
	}
}

module.exports = PlayerRando;