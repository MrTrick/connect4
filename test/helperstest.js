//Test the helper functions
'use strict';
/* jshint mocha: true */

const assert = require('assert').strict;

const { deepFreeze, chooseRandom, delayPromise } = require('../lib/helpers');

describe('Helpers', function() {

	describe('deepFreeze', function() {
		it('should freeze and return the object itself', function() {
			let obj = {foo: 'bar'};
			assert.strictEqual(obj, deepFreeze(obj), 'returns itself');
			assert.throws(()=>obj.foo = 'baz', 'Can\'t modify existing attribute');
			assert.throws(()=>obj.prop = 2, 'Can\'t add new attribute');
		});

		it('should freeze attributes in objects or arrays of the object' , function() {
			let obj = {obj: {a:1, b:2}, arr:[1,2,3,4], objObj: {first: {a:1, b:2}, second: {a:1, b:2}}, arrArr:[[],[1,2,3]]};
			assert.strictEqual(obj, deepFreeze(obj), 'returns itself');
			assert.throws(()=>obj.obj.a++);
			assert.throws(()=>obj.obj.c = 3);
			assert.throws(()=>obj.arr[0] = 10);
			assert.throws(()=>obj.arr.push(5));
			assert.throws(()=>obj.objObj.third = {});
			assert.throws(()=>obj.objObj.first.a++);
			assert.throws(()=>obj.objObj.first.c = 3);
			assert.throws(()=>obj.arrArr.push([]));
			assert.throws(()=>obj.arrArr[0].push(1));
			assert.throws(()=>obj.arrArr[1][0]++);
			assert.throws(()=>obj.arrArr[1].push(10));
		});
	});

	describe('chooseRandom', function() {
		it('should return false for empty arrays', function() {
			assert.strictEqual(chooseRandom([]), false);
		});

		it('should return one of the given set', function() {
			let arr = [1, 2, 20, 100];

			for(let i=0;i<1000;i++) {
				const el = chooseRandom(arr);
				const ind = arr.indexOf(el);
				assert(ind !== false && ind >= 0 && ind < arr.length);
			}
		});
	});

	describe('delayPromise', function() {
		it('should take (approx) the given amount of time to resolve', async function() {
			let start, end;
			start = Date.now();
			await delayPromise(20);
			end = Date.now();
			assert(end - start >= 18, 'end - start was ' + (end - start));
			assert(end - start < 40, 'end - start was ' + (end - start));

			start = Date.now();
			await delayPromise(150);
			end = Date.now();
			assert(end - start >= 148, 'end - start was ' + (end - start));
			assert(end - start < 170, 'end - start was ' + (end - start));
		});
	});
});