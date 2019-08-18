//Ensure that the State object behaves internally as expected
var assert = require('assert').strict;
var State = require('../lib/state');

/**
 * Helper to compare State object attributes to expected values
 * @param {State} state 
 * @param {Number[]} moves 
 * @param {Number[][]} board 
 * @param {boolean} gameover 
 * @param {boolean} winner 
 * @param {Number?} col 
 * @param {Number?} row 
 * @param {string?} msg 
 */
function assertState(state, moves, board, gameover, winner, col, row, msg) {
	assert.deepStrictEqual(state.moves, moves, (msg||'')+'(moves)');
	assert.deepStrictEqual(state.board, board, (msg||'')+'(board)');
	assert.strictEqual(state.gameover, gameover, (msg||'')+'(gameover)');
	assert.strictEqual(state.winner, winner, (msg||'')+'(winner)');
	col===undefined || assert.strictEqual(state.col, col, (msg||'')+'(col)');
	row===undefined || assert.strictEqual(state.row, row, (msg||'')+'(row)');
}

describe('State', function() {
	it('should not allow mutation', function() {
		assert(Object.isFrozen(State));
	});
	it('should have static dimension properties', function() {
		assert(Number.isInteger(State.width));
		assert(State.width > 0);
		assert(Number.isInteger(State.height));
		assert(State.height > 0);
	});

	describe('#constructor', function() {
		it('should create an empty board if called without arguments', function() {
			const state = new State();
			assertState(state, [], [[],[],[],[],[],[],[]], false, false);
		});
		it('should create an immutable object with immutable properties', function() {
			const state = new State();
			assert(Object.isFrozen(state, "State is frozen"));
			assert(Object.isFrozen(state.moves), "Moves are frozen");
			assert(Object.isFrozen(state.board), "Board is frozen");
			state.board.forEach(vert=>assert(Object.isFrozen(vert), "Columns in board are frozen"));
		});
		it('should create a child state if called with pos and previous state', function() {
			const state1 = new State();
			const state2 = new State(4, state1);
			assert.notEqual(state1, state2);
			assertState(state2, [4], [[],[],[],[1],[],[],[]], false, false, 3, 0);

			const state3 = new State(4, state2);
			assertState(state3, [4,4], [[],[],[],[1,2],[],[],[]], false, false, 3, 1);

			const state4 = new State(1, state3);
			assertState(state4, [4,4,1], [[1],[],[],[1,2],[],[],[]], false, false, 0, 0);
		});
		it('should require valid arguments; pos and previous state, or no arguments', function() {
			const state = new State();
			assert.throws(()=>new State('Oops'), 'Only one argument');
			assert.throws(()=>new State(undefined), 'Only one argument');
			assert.throws(()=>new State(4), 'Only one argument');
			assert.throws(()=>new State('Not a number', state), 'Invalid position');
			assert.throws(()=>new State(0, state), 'Not in range');
			assert.throws(()=>new State(-1, state), 'Not in range');
			assert.throws(()=>new State(State.width+1, state), 'Not in range');
			assert.throws(()=>new State(4, null), 'Not a state');
			assert.throws(()=>new State(4, {}), 'Not a state');

			assert.doesNotThrow(()=>new State(1, state));
		});
	});

	describe('#parse()', function() {
		it('should allow building a state from a set of moves', function() {
			const state1 = new State();
			assert.deepStrictEqual(State.parse(''), state1, 'Empty sequence');
			assert.deepStrictEqual(State.parse([]), state1, 'Empty sequence');

			const state2 = State.parse([1,2,3,4,5,6,7]);
			const state2b = State.parse('1234567');
			assert.deepStrictEqual(state2, state2b, 'String or array sequence is equivalent');
			assertState(state2, [1,2,3,4,5,6,7], [[1],[2],[1],[2],[1],[2],[1]], false, false, 6, 0, 'One piece in each column');

			const state3 = State.parse('12345677654321');
			assertState(state3, 
				[1,2,3,4,5,6,7,7,6,5,4,3,2,1], 
				[[1,2],[2,1],[1,2],[2,1],[1,2],[2,1],[1,2]], 
				false, false, 0, 1);

			const state4 = State.parse('244444666666777777333555555');
			assertState(state4,
				[2,4,4,4,4,4,6,6,6,6,6,6,7,7,7,7,7,7,3,3,3,5,5,5,5,5,5],
				[
					[],
					[1],
					[1,2,1],
					[2,1,2,1,2],
					[2,1,2,1,2,1],
					[1,2,1,2,1,2],
					[1,2,1,2,1,2]
				],
				false, false, 4, 5
			);
		})
	})

	describe('#validPlay()', function() {
		it('should require a valid positional argument', function() {
			const state = new State();
			assert.throws(()=>state.validPlay());
			assert.throws(()=>state.validPlay('foo'));
			assert.throws(()=>state.validPlay(0));
			assert.throws(()=>state.validPlay(State.width+1));

			assert.doesNotThrow(()=>state.validPlay(1));
		});
		it('should consider valid if column not full', function() {
			//Start state has all columns valid
			const state1 = new State();
			[1,2,3,4,5,6,7].forEach(p=>
				assert.strictEqual(state1.validPlay(p), true)
			);

			//Make a state with some columns full
			const state2 = State.parse('244444666666777777333555555');
			assert.strictEqual(state2.validPlay(1), true);
			assert.strictEqual(state2.validPlay(2), true);
			assert.strictEqual(state2.validPlay(3), true);
			assert.strictEqual(state2.validPlay(4), true);
			assert.strictEqual(state2.validPlay(5), false);
			assert.strictEqual(state2.validPlay(6), false);
			assert.strictEqual(state2.validPlay(7), false);
		});
	});

	describe('#validPlays()', function() {
		it('should show all open positions', function() {
			//Start state has all columns valid
			const state1 = new State();
			assert.deepStrictEqual(state1.validPlays().sort(), [1,2,3,4,5,6,7]);	

			//Make a mock state with some columns full
			const state2 = State.parse('244444666666777777333555555');
			assert.deepStrictEqual(state2.validPlays().sort(), [1,2,3,4]);
		})
	});

	describe('#nextPiece()', function() {
		it('should return alternating 1 or 2, each move that is made', function() {
			let state = new State();
			while(!state.gameover) {
				assert.strictEqual(state.nextPiece(), 1);
				state = new State(state.validPlays()[0], state);
				assert.strictEqual(state.board[state.col][state.row], 1);

				if (state.gameover) break;

				assert.strictEqual(state.nextPiece(), 2);
				state = new State(state.validPlays()[0], state);
				assert.strictEqual(state.board[state.col][state.row], 2);
			}
		});
	});

	describe('#play()', function() {
		it('should alias/match new State(pos,state)', function() {
			const state1 = new State();
			const state2a = new State(4, state1);
			const state2b = state1.play(4);

			assert.deepStrictEqual(state2a, state2b);
		});
	});
		
	describe('#toString()', function() {
		it('should convert the board state to an ascii-bordered string', function() {
			//Start state is empty
			const state1 = new State();
			assert.strictEqual(state1.toString(), "\n.......\n.......\n.......\n.......\n.......\n.......");

			//Make a mock state with lots of activity
			const state2 = State.parse('244444666666777777333555555');
			assert.strictEqual(state2.toString(), "244444666666777777333555555\n....122\n...2211\n...1122\n..12211\n..21122\n.112211");
		});
	});

	describe('#_full()', function() {
		it('should return true if every tile is filled', function() {
			const state1 = new State();
			assert.strictEqual(state1._full(), false);

			const state2 = State.parse('244444666666777777333555555');
			assert.strictEqual(state2._full(), false);

			const state3 = State.parse('123456723456776543271165432112345676725431');
			assert.strictEqual(state3._full(), true);
		});

		it('should be used by the constructor to set the gameover flag', function() {
			const state3 = State.parse('123456723456776543271165432112345676725431');
			assert.strictEqual(state3.gameover, true);
			assert.strictEqual(state3.winner, false);
		})
	});

	describe('#_won()', function() {
		it('should return false if no winner, for any set of inputs', function() {
			const state1 = State.parse('244444666666777777333555555');
			const state2 = State.parse('123456723456776543271165432112345676725431');

			for(let col = 0; col < State.width; col++) {
				for (let row = 0; row < State.height; row++) {
					if (state1.board[col][row]) {
						assert.strictEqual(state1._won(col, row, state1.board[col][row]), false, 'No winner 1 ['+col+','+col+']');
					}
					if (state2.board[col][row]) {
						assert.strictEqual(state2._won(col, row, state2.board[col][row]), false, 'No winner 2 ['+col+','+col+']');
					}
				}
			}
		});
		it ('should return true for winning cases', function() {
			const stateVert = State.parse('436767656');
			assert.strictEqual(stateVert._won(5, 3, 1), true, 'Player 1 wins vertically in column 5');

			const stateHorz = State.parse('4152637');
			assert.strictEqual(stateHorz._won(6, 0, 1), true, 'Player 1 wins horizontally in row 0');

			const stateDiagF = State.parse('466653557674');
			assert.strictEqual(stateDiagF._won(3, 1, 2), true, 'Player 2 wins with a forward diagonal');

			const stateDiagB = State.parse('345436344365');
			assert.strictEqual(stateDiagB._won(4, 1, 2), true, 'Player 2 wins with a back diagonal');
		});
		it('should be used by the constructor to set the gameover/winner flags', function() {
			const stateVert = State.parse('436767656'); //Player 1 wins vertically in column 5
			const stateHorz = State.parse('4152637'); //Player 1 wins horizontally in row 0
			const stateDiagF = State.parse('466653557674'); //Player 2 wins with a forward diagonal
			const stateDiagB = State.parse('345436344365'); //Player 2 wins with a back diagonal
			[stateVert, stateHorz, stateDiagF, stateDiagB].forEach(state=>{
				assert(state.gameover, 'Gameover');
				assert(state.winner, 'Winner');
			});
		});
	});

});