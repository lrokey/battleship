const view = {
	displayMessage: function(msg) {
		const messageArea = document.getElementById("messageArea");
		messageArea.innerHTML = msg;
	},
	displayHit: function(location) {
		const cell = document.getElementById(location);
		cell.setAttribute("class", "hit");
	},
	displayMiss: function(location) {
		const cell = document.getElementById(location);
		cell.setAttribute("class", "miss");
	}
};

const model = {
	boardSize: 7,
	numShips: 3,
	shipLength: 3,
	shipsSunk: 0,
	ships: [ { locations: [0, 0, 0], hits: ["", "", ""] }, 
			 { locations: [0, 0, 0], hits: ["", "", ""] }, 
			 { locations: [0, 0, 0], hits: ["", "", ""] }],
	fire: function(guess) {
		for (let i = 0; i < this.numShips; i++) {
			let ship = this.ships[i];
			let index = ship.locations.indexOf(guess);
			if (index >= 0) {
				// we have a hit!
				ship.hits[index] = "hit";
				view.displayHit(guess);
				view.displayMessage("HIT!");
				if (this.isSunk(ship)) {
					view.displayMessage("You sank my battleship!");
					this.shipsSunk++;
				}
				return true;
			}
		}
		view.displayMiss(guess);
		view.displayMessage("You missed.");
		return false;
	},
	isSunk: function(ship) {
		for(let i = 0; i < this.shipLength; i++) {
			if (ship.hits[i] !== "hit") {
				return false;
			}
		}
		return true;
	},
	generateShipLocations: function() {
		let locations;
		for (let i = 0; i <this.numShips; i++) {
			do {
				locations = this.generateShip();
			} while (this.collision(locations));
			this.ships[i].locations = locations;
		}
	},
	generateShip: function(){
		let direction = Math.floor(Math.random() * 2);
		let row;
		let col;
		if (direction === 1) {
			// generate a starting location for a horizontal ship
			row = Math.floor(Math.random() * this.boardSize);
			col = Math.floor(Math.random() * (this.boardSize - (this.shipLength + 1)));
		} else {
			// generate a location for a vertical ship
			row = Math.floor(Math.random() * (this.boardSize - (this.shipLength + 1)));
			col = Math.floor(Math.random() * this.boardSize);
		}
		let newShipLocations = [];
		for(let i = 0; i < this.shipLength; i++) {
			if (direction === 1) {
				// add location to array for new horizontal ship
				newShipLocations.push(row + "" + (col + i));
			} else {
				// add location to array for new vertical ship
				newShipLocations.push((row + i) + "" + col);
			}
		}
		return newShipLocations;
	},
	collision: function(locations) {
		for (let i = 0; i <this.numShips; i++) {
			let ship = this.ships[i];
			for (let j = 0; j <locations.length; j++) {
				if (ship.locations.indexOf(locations[j]) >= 0) {
					return true;
				}
			}
		}
		return false;
	}
};

const controller = {
	guesses: 0,
	guessedPositions: [],
	processGuess: function(guess) {
		const location = parseGuess(guess);
		if (location) {
			this.guesses++;
			if (alreadyGuessed(guess)) {
				view.displayMessage("You already guessed that!");
			} else {
				const hit = model.fire(location);
				controller.guessedPositions.push(guess);
				if (hit && model.shipsSunk === model.numShips) {
					view.displayMessage("You sank all my battleships, in " + this.guesses + " guesses.");
				}
			}
		}
	}

}

function alreadyGuessed(guess) {
	if (controller.guessedPositions == undefined || controller.guessedPositions.length == 0) {
		return false;
	}
	for (let i = 0; i < controller.guessedPositions.length; i++) {
		if (controller.guessedPositions[i] == guess) {
			return true;
		}
	}
	return false;
}
function parseGuess(guess) {
	const alphabet = ["A", "B", "C", "D", "E", "F", "G"];
	if (guess === null || guess.length !== 2) {
		alert("Oops, please enter a letter and a number on the board.");
	} else {
		const firstChar = guess.charAt(0).toUpperCase();
		const row = alphabet.indexOf(firstChar);
		const column = guess.charAt(1);

		if (isNaN(row) || isNaN(column)) {
			alert("Oops, that isn't on the board.");
		} else if (row < 0 || row >= model.boardSize ||
					column < 0 || column >= model.boardSize) {
			alert("Oops, that's off the board!");
		} else {
			return row + column;
		}
	}
	return null;
}

function init() {
	const fireButton = document.getElementById("fireButton");
	fireButton.onclick = handleFireButton;
	const  guessInput = document.getElementById("guessInput");
	guessInput.onkeypress = handleKeyPress;
	model.generateShipLocations();
	controller.guessedPositions = [];
}
function handleFireButton() {
	const guessInput = document.getElementById("guessInput");
	const guess = guessInput.value;
	// pass to controller
	controller.processGuess(guess);
	guessInput.value = "";
}
function handleKeyPress(e) {
	const fireButton = document.getElementById("fireButton");
	if (e.keyCode === 13) {
		fireButton.click();
		return false;
	}
}
window.onload = init;