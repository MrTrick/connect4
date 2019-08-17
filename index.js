'use strict';

//Play...

//1. Who is playing?
//2. Start game, render.
//3. Loop;
//  - Get current player
//  - Get player move
//  - Move
//  - If won, stop.
//  - If draw, stop.
//4. Show end state

const State = require('./lib/state');
const PlayerRando = require('./lib/player/rando');
const Game = require('./lib/game.js');

const state = new State();
const player1 = new PlayerRando();
const player2 = new PlayerRando();
const game = new Game(state, player1, player2);

player1.on('thinking', function(msg) {
	process.stdout.write(msg);
});
player2.on('thinking', function(msg) {
	process.stdout.write(msg);
});

function next() {
	game.play().then((state)=>{
		console.log(state.toString());
		if (state.gameover) {
			console.log("Game over");
			console.log(state.winner?"Winner is Player "+state.winner:"Draw");
		} else {
			setImmediate(next);
		}
	})
}
setImmediate(next);


//const Board = require('./lib/board.js');
//

/*let s = new State();
console.log(s.toString());
console.log('can play', s.canPlay(4));
s = s.play(4);
console.log(s.toString());
s = s.play(3);
console.log(s.toString());
s = s.play(5);
s = s.play(1);
s = s.play(7);
s = s.play(3);
s = s.play(3);
console.log(s.toString());
s = s.play(2).play(4).play(3).play(2).play(6);
console.log(s.toString());*/

//let b = new Board(7,5);

//console.log(b.freeSpaces(2));
//b.addPiece(2,1); 
//b.addPiece(2,2);
//b.addPiece(0,1);
//b.addPiece(3,2);
//b.addPiece(1,1);


//console.log(b.toString());
//console.log(b.freeSpaces(2));

/*var blessed = require('blessed');

// Create a screen object.
var screen = blessed.screen({
  smartCSR: true
});

screen.title = 'my window title';

// Create a box perfectly centered horizontally and vertically.
var box = blessed.box({
  top: 'center',
  left: 'center',
  width: '50%',
  height: '50%',
  content: 'Hello {bold}world{/bold}!',
  tags: true,
  border: {
    type: 'line'
  },
  style: {
    fg: 'white',
    bg: 'magenta',
    border: {
      fg: '#f0f0f0'
    },
    hover: {
      bg: 'green'
    }
  }
});

// Append our box to the screen.
screen.append(box);

// Add a png icon to the box
var icon = blessed.image({
  parent: box,
  top: 0,
  left: 0,
  type: 'overlay',
  width: 'shrink',
  height: 'shrink',
  file: __dirname + '/my-program-icon.png',
  search: false
});

// If our box is clicked, change the content.
box.on('click', function(data) {
  box.setContent('{center}Some different {red-fg}content{/red-fg}.{/center}');
  screen.render();
});

// If box is focused, handle `enter`/`return` and give us some more content.
box.key('enter', function(ch, key) {
  box.setContent('{right}Even different {black-fg}content{/black-fg}.{/right}\n');
  box.setLine(1, 'bar');
  box.insertLine(1, 'foo');
  screen.render();
});

// Quit on Escape, q, or Control-C.
screen.key(['escape', 'q', 'C-c'], function(ch, key) {
  return process.exit(0);
});

// Focus our element.
box.focus();

// Render the screen.
screen.render();*/