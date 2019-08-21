//Test the Player class and its subclasses
'use strict';
const assert = require('assert').strict;
const EventEmitter = require('events');

const State = require('../lib/state');
const Player = require('../lib/player');
const PlayerRando = require('../lib/player/rando');
const PlayerEddie = require('../lib/player/eddie');
const PlayerHuman = require('../lib/player/human');

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
	const playerEddie = new PlayerEddie();
	playerEddie.phoneAFriend = mockAFriend;

	const players = [
		[PlayerHuman,'Human', playerHuman],
		[PlayerRando,'Rando', playerRando],
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
					thoughts = [], highlights = [];
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