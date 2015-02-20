(function(){
	"use strict";

	var body = document.body;
	var character = document.getElementById("character");
	var controls = document.getElementById("controls");
	var buttons = [].slice.call(controls.getElementsByTagName("button"), 0);
	var winStateCallToAction = document.getElementById("winState");
	var loseStateCallToAction = document.getElementById("loseState");
	var depletionInterval = 5000;
	var lastInteractionImpact, lastMood, depreciationTimer, userAway;

	// Characters's Happiness Meters
	var happinessMeter = {
		// (They all start at 1. Your work is cut out for you!)
		meters : {
			rest : 1,
			hunger : 1,
			engagement : 1
		},
		visibleMeters: {
			hunger : document.getElementById("meter-hunger"),
			rest : document.getElementById("meter-rest"),
			engagement : document.getElementById("meter-engagement")
		},
		measureHappiness : function() {
			var sumHappiness = 0;
			for (var i in happinessMeter.meters) {
				sumHappiness = sumHappiness + happinessMeter.meters[i];
			}
			return sumHappiness;
		},
		updateVisibleMeter : function(meter, newValue) {
			meter.value = newValue;
			meter.setAttribute("aria-valuenow", newValue);
		},
		incrementMeter : function(meterName, amount) {
			if (this.meters[meterName] + amount >= 3) {
			  this.meters[meterName] = 3;
			} else {
				this.meters[meterName] += amount;
			}
			this.updateVisibleMeter(this.visibleMeters[meterName], this.meters[meterName]);

		},
		decrementMeter : function(meterName, amount) {
			if (this.meters[meterName] - amount <= 0) {
			  this.meters[meterName] = 0;
			} else {
				this.meters[meterName] -= amount;
			}
			this.updateVisibleMeter(this.visibleMeters[meterName], this.meters[meterName]);
		},
		init : function() {
			controls.hidden = false;
			winStateCallToAction.hidden = true;
			loseStateCallToAction.hidden = true;
			// enable buttons: iterate over the array of buttons with forEach
			[].forEach.call(buttons, function(element) {
				element.removeAttribute("disabled");
			});

			// Measure the meters and set them up in the DOM
			Object.keys(this.meters).forEach(function(key) {
				happinessMeter.meters[key] = 1;
				happinessMeter.updateVisibleMeter(happinessMeter.visibleMeters[key], happinessMeter.meters[key]);
			});
			updateEmotion();
			// Start happiness depletion timer
			depreciationTimer = setTimeout(depreciateMeters, depletionInterval);
		},
		youWin : function() {
			setTimeout( function(){
				// stop depreciation
				clearTimeout(depreciationTimer);
				// hide controls, show win state
				controls.hidden = true;
				winStateCallToAction.hidden = false;
			}, 1750)
		},
		youLose : function() {
			// stop depreciation
			clearTimeout(depreciationTimer);
			setTimeout( function(){
				// hide controls, show lose state
				[].forEach.call(buttons, function(element) {
					element.setAttribute("disabled", true);
				});
				loseStateCallToAction.hidden = false;
			}, 1750)
		}
	}

	function swapClasses(oldClass, newClass) {
		body.classList.remove(oldClass);
		body.classList.add(newClass);
		return newClass;
	}

	// Update Action character takes
	function updateAction(actionTaken, repercussions) {
		body.classList.add(actionTaken);
		// stop the clock.
		clearTimeout(depreciationTimer);
			console.log("cleared");
		// Plz don't hit the buttons
		[].forEach.call(buttons, function(element) {
			element.setAttribute("disabled", true);
		});
		// wait 5 seconds.
		setTimeout(function(){
			// remove action class.
			body.classList.remove(actionTaken);
			// turn buttons back on
			[].forEach.call(buttons, function(element) {
				element.removeAttribute("disabled");
			});
			// restart the clock
			depreciationTimer = setTimeout(depreciateMeters, depletionInterval);
			repercussions();
		}, depletionInterval);
	}

	// Update Character's mood
	function updateEmotion(interactionImpact) {
		var totalPoints = happinessMeter.measureHappiness();


		// find out how they feel
		// act accordingly
		var moods = ["rage-quit", "enraged", "unhappy", "okay", "okay", "happy", "happy", "joyous", "joyous", "overjoyed"];
		lastMood = swapClasses(lastMood, moods[totalPoints]);

		// if no points, lose. If 9 points, win!
		if (!totalPoints) {
		  happinessMeter.youLose();
		} else if (totalPoints === 9) {
		  happinessMeter.youWin();
		}

		// these always take precedence over the above in the CSS
		function updateNeeds(meter, need) {
			// https://developer.mozilla.org/en-US/docs/Web/API/Element.classList
			body.classList.toggle(need, !meter);
		}

		updateNeeds(happinessMeter.meters.engagement, "bored");
		updateNeeds(happinessMeter.meters.hunger, "hungry");
		updateNeeds(happinessMeter.meters.rest, "tired");

		// Show a special emotion after each action
		// By adding a new class
		if (interactionImpact) {
			lastInteractionImpact = swapClasses(lastInteractionImpact, interactionImpact);
		}
		// This allows our character to be happy about something even if it over all makes them sad.
	}

	function hasValue(obj, key, value) {
		return obj.hasOwnProperty(key) && obj[key] === value;
	}

	function depreciateMeters() {
    	var meterArray = Object.keys(happinessMeter.meters);
    	var lengthOfMeters = meterArray.length;
    	var randomMeter = Math.floor(Math.random() * (1 - lengthOfMeters)) + lengthOfMeters;
    	var randomMeterName = meterArray[randomMeter];

    	// find out if we have more than one points left
		if (happinessMeter.measureHappiness() > 1) {
			// randomly pick a meter that has some points left
			if (hasValue(happinessMeter.meters, randomMeterName, 0)) {
				// bleh, there's nothing in this meter, start again
				depreciateMeters();
			} else {
				// ooh, this meter has something...
				happinessMeter.decrementMeter(randomMeterName, 1);
				updateEmotion();
				depreciationTimer = setTimeout(depreciateMeters, depletionInterval);
			}
		} else {
			// You have only one point left.
			Object.keys(happinessMeter.meters).forEach(function(key) {
				// Set all happinessMeter's meters to 0.
				happinessMeter.meters[key] = 0;
				// Update the visual meters.
				happinessMeter.updateVisibleMeter(happinessMeter.visibleMeters[key], happinessMeter.meters[key]);
			});
			updateEmotion();
			console.log("Game over, man, game over!")
		}
	};

	//from the fail state
	document.getElementById("tryAgain").addEventListener("click", function(){
		happinessMeter.init();
		controls.classList.remove("deactivated");
	});

	// from the win state
	document.getElementById("playAgain").addEventListener("click", function(){
		happinessMeter.init();
	});

	// Buttons add happiness points... and take them away.
	document.getElementById("meal").addEventListener("click", function(){
		updateAction("eating", function(){
			happinessMeter.incrementMeter("hunger", 2);
			happinessMeter.decrementMeter("rest", 1);
			updateEmotion("full");
		});
	});

	document.getElementById("snack").addEventListener("click", function(){
		updateAction("snacking", function(){
			happinessMeter.incrementMeter("hunger", 1);
			happinessMeter.decrementMeter("engagement", 1);
			updateEmotion("yum");
		});
	});

	document.getElementById("sleep").addEventListener("click", function(){
		updateAction("sleeping", function(){
			happinessMeter.incrementMeter("rest", 2);
			updateEmotion("rested");
		});
	});

	document.getElementById("play").addEventListener("click", function(){
		updateAction("playing", function(){
			happinessMeter.incrementMeter("engagement", 1);
			happinessMeter.decrementMeter("rest", 1);
			updateEmotion("rambunctious");
		});
	});

	document.getElementById("read").addEventListener("click", function(){
		updateAction("reading", function(){
			happinessMeter.incrementMeter("engagement", 1);
			updateEmotion("curious");
		});
	});

	// Music
	// Get the audio element
	// var soundTyping = document.querySelector('audio');

	// // Wait till the music loads (or get a nasty error!)
	// soundTyping.addEventListener("canplaythrough", function () {

	// }, false);

	window.addEventListener("load", function load(event){
		window.removeEventListener("load", load, false); //remove listener, no longer needed

		// start the happiness meter afresh
		happinessMeter.init();
	},false);

})();