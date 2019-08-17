//Internal 'helper' functions used by the application
'use strict';

/**
 * Freeze the object and all of its properties.
 * 
 * Reference implementation directly from MDN
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/freeze
 * 
 * @param {any} object to be frozen 
 * @returns the same object that was passed in, now frozen
 */
function deepFreeze(object) {
	// Retrieve the property names defined on object
	const propNames = Object.getOwnPropertyNames(object);

	// Freeze properties before freezing self
	for (let name of propNames) {
		let value = object[name];
		if (!Object.isFrozen(value)) {
			object[name] = value && typeof value === "object" ? deepFreeze(value) : value;
		}
	}

	return Object.freeze(object);
}

/**
 * Randomly shuffle an array in place
 * 
 * @license Apache2.0
 * @see https://github.com/Daplie/knuth-shuffle
 * @see https://stackoverflow.com/a/2450976/1293256
 * @param  {Array} array The array to shuffle
 * @return {any} The first item in the shuffled array
 */
function shuffle(array) {

	var currentIndex = array.length;
	var temporaryValue, randomIndex;

	// While there remain elements to shuffle...
	while (0 !== currentIndex) {
		// Pick a remaining element...
		randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex -= 1;

		// And swap it with the current element.
		temporaryValue = array[currentIndex];
		array[currentIndex] = array[randomIndex];
		array[randomIndex] = temporaryValue;
	}

	return array;

};

/**
 * Higher-order function that inserts a delay in a promise chain.
 * (and pipes any received value to the next function)
 * @param {Number} ms 
 * @returns {function(any): Promise(any)} A function returning a promise that resolves with the called value after the given ms delay
 */
function delayPromise(ms) {
	return function(value) {
		return new Promise(resolve => setTimeout(()=>resolve(value), ms));
	}
}

module.exports = { deepFreeze, shuffle, delayPromise };