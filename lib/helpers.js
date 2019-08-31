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
 * Select a random element from the given array.
 * @param {any[]} array 
 * @return {any|false} One of the array elements, or false if array is empty
 */
function chooseRandom(array) {
	if (array.length === 0) return false;
	
	const index = Math.floor(Math.random() * array.length);
	return array[index];
}

/**
 * Resolve after a given delay
 * @param {Number} ms Number of milliseconds to delay
 * @returns {Promise()} A promise resolving after the given ms delay
 */
function delayPromise(ms) {
	return new Promise(resolve => setTimeout(()=>resolve(), ms));
}

module.exports = { deepFreeze, chooseRandom, delayPromise };