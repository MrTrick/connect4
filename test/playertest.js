//Test the Player class and its subclasses
'use strict';
/* jshint mocha: true */

const assert = require('assert').strict;
const EventEmitter = require('events');

const State = require('../lib/state');
const Player = require('../lib/player');
const PlayerHuman = require('../lib/player/human');
const PlayerRando = require('../lib/player/rando');
const PlayerHugh = require('../lib/player/hugh');
const PlayerEddie = require('../lib/player/eddie');


describe('Player (Parent Class)', function() {
	const player = new Player();

	describe('#assertValidState()', function() {
		it('should accept valid, playable states', function() {
			assert.doesNotThrow(()=>player.assertValidState(new State()), 'Empty start state');
			assert.doesNotThrow(()=>player.assertValidState(State.parse('12345677654321')), 'Two pieces in each column');
			assert.doesNotThrow(()=>player.assertValidState(State.parse('244444666666777777333555555')), 'Some columns full');
			assert.doesNotThrow(()=>player.assertValidState(State.parse('12345672345677654327116543211234567672543')), 'Last move');
		});
		it('should reject bad states or not-states', function() {
			assert.throws(()=>player.assertValidState());
			assert.throws(()=>player.assertValidState(undefined));
			assert.throws(()=>player.assertValidState(false));
			assert.throws(()=>player.assertValidState({not:'a state'}));

			const badState1 = State.parse('1212121');
			assert.throws(()=>player.assertValidState(badState1), 'Game over - player 1 won');
			const badState2 = State.parse('123456723456776543271165432112345676725431');
			assert.throws(()=>player.assertValidState(badState2), 'Game over in draw');
		});
	});
});

describe('Player (Implementations)',  function() {
	const mockTerm = new EventEmitter();
	const mockAFriend = function(state) {
		return Promise.resolve({ pos: state.moves, score: [1,2,3,-1,-2,-100,4]});
	};

	const playerHuman = new PlayerHuman(mockTerm);
	const playerRando = new PlayerRando();
	const playerHugh = new PlayerHugh();
	const playerEddie = new PlayerEddie();
	playerEddie.phoneAFriend = mockAFriend;

	const players = [
		[PlayerHuman,'Human', playerHuman],
		[PlayerRando,'Rando', playerRando],
		[PlayerHugh,'Hugh', playerHugh],
		[PlayerEddie,'Eddie', playerEddie]
	];
	players.forEach(function([playerClass, name, player]) {
		describe(playerClass.name, function() {
			it('should follow the Player specification', function() {
				assert(player instanceof Player);
				assert(typeof player.getPlay === 'function');
				assert.strictEqual(playerClass.name, name);
				assert(typeof playerClass.description === 'string');
			});

			describe('#getPlay()', function() {
				let thoughts = [], highlights = [], monkey;
				//Replace the delay method with one that returns immediately-resolving functions
				player.delay = () => (v => Promise.resolve(v)); 
				//Capture and log activity events
				player.on('thinking', msg=>thoughts.push(msg));
				player.on('highlight', highlight=>highlights.push(highlight));
				beforeEach(function() {
					thoughts = [];
					highlights = [];
				});
				before(function() {
					//Regularly press buttons in case human
					monkey = setInterval(()=>{
						mockTerm.emit('key','ENTER');
						mockTerm.emit('key','RIGHT');
					}, 200);
				});

				it('should choose an opening move', function() {
					const state = new State();
					const getPlay = player.getPlay(state);
					assert(getPlay instanceof Promise);
					return getPlay.then(function(pos) {
						//Check the resolved value
						assert(Number.isInteger(pos), 'Resolves with a valid move');
						assert(pos>=1 && pos<=State.width, 'Resolves with a valid move');

						//Check the activity
						assert(thoughts.length > 0, 'Emits thinking events' );
						thoughts.forEach(msg => assert(typeof msg === 'string', 'thinking events emit strings'));
						assert(highlights.length > 0, 'Emits highlight events');
						highlights.forEach(highlight => assert(Array.isArray(highlight), 'highlight events emit strings'));
					});
				});
				it('should choose a valid move', function() {
					const state = State.parse('12345672345677654327116543211234567672543');
					const getPlay = player.getPlay(state);
					assert(getPlay instanceof Promise);
					return getPlay.then(function(pos) {
						assert.strictEqual(pos, 1, 'Only one column left to choose');
					});
				});

				after(function() {
					clearInterval(monkey);
				});
			});
		});
	});
});

describe('Player (Hugh)', function() {
	const playerHugh = new PlayerHugh();
	it('should recognise a winning move', function() {
		const state1 = State.parse('1624351');
		assert.deepStrictEqual(playerHugh.getWinningPlays(state1), [7]);
		
		const state2 = State.parse('1314751');
		assert.deepStrictEqual(playerHugh.getWinningPlays(state2), [2,6]);

		const state3 = State.parse('1223');
		assert.deepStrictEqual(playerHugh.getWinningPlays(state3), []);
	});
	
	it('should recognise if an opponent could win in the next turn', function() {
		const state1 = State.parse('14131');
		assert.deepStrictEqual(playerHugh.getSafePlays(state1), [1], 'Opponent has three in a vertical, must block to prevent win.');

		const state2 = State.parse('2334454');
		assert.deepStrictEqual(playerHugh.getSafePlays(state2), [1,2,3,4,5,6,7], 'Anywhere is safe (though 6 is actually a winning play)');

		const state3 = State.parse('3234462');
		assert.deepStrictEqual(playerHugh.getSafePlays(state3), [2,3,4,6,7], 'Opponent has three horizontal, but can\'t put pieces there - yet');
	});

	it('should score positions as expected', function() {
		const state1 = State.parse('4');
		assert.deepStrictEqual([1,2,3,4,5,6,7].map(p=>playerHugh.scorePlay(state1, p)), [4,7,6,6,6,7,4]);

		const state2 = State.parse('424');
		assert.deepStrictEqual([1,2,3,4,5,6,7].map(p=>playerHugh.scorePlay(state2, p)), [5,8,6,6,5,7,4]);
	});
});