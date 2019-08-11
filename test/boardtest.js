var assert = require('assert').strict;
var Board = require('../lib/board');

function shouldThrow(func, exception_type, msg) {
  //Allow calling as shouldThrow(func, msg)
  if (!msg && typeof exception_type == 'string') {
    msg = exception_type;
    exception_type = null;
  }
  try {
    func();
    fail(msg);
  } catch(e) {
    if (exception_type) {
      assert.equal(typeof e, exception_type, msg);
    }
  }
}

describe('Board', function() {
  describe('#constructor', function() {
    it('should take and store width + height', function() {
      let b = new Board(7, 5);
      assert.equal(b.width, 7);
      assert.equal(b.height, 5);
    });
    it('should initialise an empty board', function() {
      let b = new Board(4, 2);
      assert.deepEqual(b.board, [[0,0,0,0],[0,0,0,0]]);
    });
    it('should not allow invalid dimensions', function() {
      shouldThrow(()=>new Board(0,4), 'Zero-width board');
      shouldThrow(()=>new Board(4,0), 'Zero-height board');
      shouldThrow(()=>new Board(-4,3), 'Negative-width board');
      shouldThrow(()=>new Board(4,-3), 'Negative-height board');
      shouldThrow(()=>new Board(4, 'frog'), 'Non-numeric');
      shouldThrow(()=>new Board('frog',3), 'Non-numeric')
      shouldThrow(()=>new Board(6), 'Missing dimension');
    })
  });

  describe('#toString()', function() {
    it('should convert the board state to an ascii-bordered string', function() {
      let b = new Board(4, 3);
      assert.equal(b.toString(), '.----.\n|    |\n|    |\n|    |\n`----`');
      b.board[2][0] = b.board[1][0] = 1;
      b.board[2][1] = 2;
      assert.equal(b.toString(), '.----.\n|    |\n|1   |\n|12  |\n`----`');
    });
  });

  describe('#clear()', function() {
    it('should reset the board state to all-zeros', function() {
      let b = new Board(4, 3);
      b.board[2][0] = b.board[1][0] = 1;
      b.board[2][1] = 2;
      assert.deepEqual(b.board, [[0,0,0,0],[1,0,0,0],[1,2,0,0]]);
      b.clear();
      assert.deepEqual(b.board, [[0,0,0,0],[0,0,0,0],[0,0,0,0]]);
    });
  });

  describe('#freeSpaces()', function() {
    it('should return a number equal to the height of the board for any column in an empty board', function() {
      let b = new Board(7, 5);
      for(let c = 0; c < b.width; c++) {
        assert.equal(b.freeSpaces(c), b.height);
      }
    });
    it('should reduce by 1 each time the bottommost empty cell of that column is filled', function() {
      let b = new Board(7, 5);
      assert.equal(b.freeSpaces(2), 5);
      b.board[4][2] = 1;
      assert.equal(b.freeSpaces(2), 4);
      b.board[3][2] = 2;
      assert.equal(b.freeSpaces(2), 3);
      b.board[2][2] = 1;
      assert.equal(b.freeSpaces(2), 2);
      b.board[1][2] = 2;
      assert.equal(b.freeSpaces(2), 1);
      b.board[0][2] = 1;
      assert.equal(b.freeSpaces(2), 0);

      assert.equal(b.freeSpaces(3), 5, 'Other columns are unaffected');
    });
    it('should count from the top', function() {
      let b = new Board(7,5);
      b.board[2][2] = 1; //Would leave a 'hole' underneath, not possible in standard gameplay
      assert.equal(b.freeSpaces(2), 2);
    });
    it('should not allow an invalid column', function() {
      let b = new Board(7,6);
      shouldThrow(()=>b.freeSpaces(-1),'Negative');
      shouldThrow(()=>b.freeSpaces(7),'Larger than maximum');
      shouldThrow(()=>b.freeSpaces('f'),'Not numeric');
      shouldThrow(()=>b.freeSpaces(4.5),'Not integer');
    })
  });

  describe('#addPiece()', function() {
    it('should place each new place from the bottom of that column, and return the row', function() {
      let b = new Board(4, 3);
      let row = b.addPiece(1, 1);
      assert.equal(row, 2);
      assert.deepEqual(b.board, [[0,0,0,0],[0,0,0,0],[0,1,0,0]]);
      row = b.addPiece(1, 2);
      assert.equal(row, 1);
      assert.deepEqual(b.board, [[0,0,0,0],[0,2,0,0],[0,1,0,0]]);
      row = b.addPiece(1, 1);
      assert.equal(row, 0);
      assert.deepEqual(b.board, [[0,1,0,0],[0,2,0,0],[0,1,0,0]]);
      row = b.addPiece(0,2);
      assert.equal(row, 2);
      assert.deepEqual(b.board, [[0,1,0,0],[0,2,0,0],[2,1,0,0]]);
    });
    it('should not allow more pieces to be added than fit in a column', function() {
      let b = new Board(7,6);
      b.addPiece(2, 1);
      b.addPiece(2, 2);
      b.addPiece(2, 1);
      b.addPiece(2, 2);
      b.addPiece(2, 1);
      b.addPiece(2, 2);
      shouldThrow(()=>b.addPiece(2, 1), "should not fit");
    });
  });
});