// Board - contains and manages the state of a connect4 game board
'use strict'
var assert = require('assert').strict;

/**
 * 
 */
class Board {

    /**
     * Build a new board of 
     * @param {*} width 
     * @param {*} height 
     */
    constructor(options) {
        assert(typeof options === 'object')
        

        let {width, height, board} = options;

        this.width = width;
        this.height = height;
        this.board = new Uint8Array(this.height*)
        this.board = Array.from(Array(this.height), () => new Array(this.width).fill(0));
    }

    /**
     * 
     */
    toString() {
        return ('.'+'-'.repeat(this.width)+'.')+'\n'+this.board.map(r=>'|'+r.map(p=>p||' ').join('')+'|').join('\n')+'\n'+('`'+'-'.repeat(this.width)+'`')
    }
    
    freeSpaces(column) {
        for (let row = 0; row < this.height; row++) {
            if (this.board[row][column]) return row;
        }
        return this.height;
    }

    addPiece(column, value) {
        if (!Number.isInteger(value)) throw new TypeError("value must be integer");
        else if (value <= 0) throw new RangeError("value must be positive");
        else if (!Number.isInteger(column)) throw new TypeError("column must be integer");
        else if (column >= this.width || column < 0) throw new TypeError("column must be 0 - width");

        let row = this.freeSpaces(column) - 1;
        if (row < 0) throw new Error("Cannot place a piece in this column");

        this.board[row][column] = value;
        return row;
    }

    isFull() {
        for (let col = 0; col < this.height; col++) {
            if (!this.board[0][col]) return false;
        }
        return true;
    }
}

module.exports = Board;