"use strict";
(function(){

var body = document.body;
var character = document.getElementById("character");
var controls = document.getElementById("controls");
var buttons = controls.getElementsByTagName("button");
var winStateCTA = document.getElementById("winState");
var loseStateCTA = document.getElementById("loseState");
var lastInteractionImpact, lastMood, depreciation;

// Characters's Happiness Meters
var happinessMeter = {
    // (They all start at 1. Your work is cut out for you!)
    meters : {
        restMeter : 1,
        hungerMeter : 1,
        engagementMeter : 1
    },
    hungerMeterViz : document.getElementById("meter-hunger"),
    restMeterViz : document.getElementById("meter-rest"),
    engagementMeterViz : document.getElementById("meter-engagement"),
    measureHappiness : function() {
        var sumHappiness = 0;
        for (var i in happinessMeter.meters) {
            sumHappiness = sumHappiness + happinessMeter.meters[i];
        }
        return sumHappiness;
    },
    updateMeterViz : function(meter, increment) {
        meter.value = increment;
        meter.setAttribute("aria-valuenow", increment);
    },
    incrementPoint : function(meterName) {
        if (this.meters[meterName] < 3) {
            this.updateMeterViz(happinessMeter[meterName +"Viz"], ++this.meters[meterName]);
        } else {
            this.updateMeterViz(happinessMeter[meterName +"Viz"], this.meters[meterName]);
        }
    },
    decrementPoint : function(meterName) {
        if (this.meters[meterName] > 0) {
            this.updateMeterViz(happinessMeter[meterName +"Viz"], --this.meters[meterName]);
        } else {
            this.updateMeterViz(happinessMeter[meterName +"Viz"], this.meters[meterName]);
        }
    },
    init : function() {
        controls.hidden = false;
        winStateCTA.hidden = true;
        loseStateCTA.hidden = true;
        // enable buttons
        for (var i=0; i<buttons.length; i++) {
            buttons[i].removeAttribute("disabled");
        }
        // Measure the meters and set them up in the DOM
        for (var i in happinessMeter.meters) {
            happinessMeter.meters[i] = 1;
            happinessMeter.updateMeterViz(happinessMeter[i +"Viz"], happinessMeter.meters[i]);
        }
        updateEmotion();
        // Start happiness depletion timer
        depreciation = setInterval(depreciateMeters, 5000);
    },
    youWin : function() {
        // stop depreciation
        clearInterval(depreciation);
        // hide controls, show win state
        controls.hidden = true;
        winStateCTA.hidden = false;
    },
    youLose : function() {
        // stop depreciation
        clearInterval(depreciation);
        // hide controls, show lose state
        for (var i=0; i<buttons.length; i++) {
            buttons[i].setAttribute("disabled", true);
        }
        loseStateCTA.hidden = false;
    }
}

function swapClasses(oldClass, newClass) {
    body.classList.remove(oldClass);
    body.classList.add(newClass);
    return newClass;
}

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
        happinessMeter.incrementPoint("hungerMeter");
        happinessMeter.incrementPoint("hungerMeter");
        happinessMeter.decrementPoint("restMeter");
        updateEmotion("full");
    });
});

document.getElementById("snack").addEventListener("click", function(){
    updateAction("snacking", function(){
        happinessMeter.incrementPoint("hungerMeter");
        happinessMeter.decrementPoint("engagementMeter");
        updateEmotion("yum");
    });
});

document.getElementById("sleep").addEventListener("click", function(){
    updateAction("sleeping", function(){
        happinessMeter.incrementPoint("restMeter");
        happinessMeter.incrementPoint("restMeter");
        updateEmotion("rested");
    });
});

document.getElementById("play").addEventListener("click", function(){
    updateAction("playing", function(){
        happinessMeter.incrementPoint("engagementMeter");
        happinessMeter.decrementPoint("restMeter");
        updateEmotion("rambunctious");
    });
});

document.getElementById("read").addEventListener("click", function(){
    updateAction("reading", function(){
        happinessMeter.incrementPoint("engagementMeter");
        updateEmotion("curious");
    });
});

// Update Action character takes
function updateAction(actionTaken, repercussions) {
    body.classList.add(actionTaken);
    // stop the clock.
    clearInterval(depreciation);
    // Plz don't hit the buttons
    for (var i=0; i<buttons.length; i++) {
        buttons[i].setAttribute("disabled", true);
    }

    // wait 5 seconds.
    var fallout = setTimeout(function(){
        clearTimeout(fallout);
        // remove action class.
        body.classList.remove(actionTaken);
        // turn buttons back on
        for (var i=0; i<buttons.length; i++) {
            buttons[i].removeAttribute("disabled");
        }
        // restart the clock
        depreciation = setInterval(depreciateMeters, 5000);
        repercussions();
    }, 5000);
}

// Update Character's mood
function updateEmotion(interactionImpact) {
    var totalPoints = happinessMeter.measureHappiness();

    // find out how they feel
    // act accordingly
    if (totalPoints == 0){
        console.log("That's it! I'm outta here!");
        lastMood = swapClasses(lastMood, "rage-quit");
        happinessMeter.youLose();
    } else if (totalPoints <= 1){
        console.log("VERY unhappy");
        lastMood = swapClasses(lastMood, "enraged");
    } else if (totalPoints <= 2){
        console.log("unhappy");
        lastMood = swapClasses(lastMood, "unhappy");
    } else if (totalPoints <= 4) {
        console.log("okay");
        lastMood = swapClasses(lastMood, "okay");
    } else if (totalPoints <= 6) {
        console.log("happy");
        lastMood = swapClasses(lastMood, "happy");
    } else if (totalPoints == 8) {
        console.log("So happy!");
        lastMood = swapClasses(lastMood, "joyous");
    } else if (totalPoints == 9) {
        console.log("You win at life!!");
        lastMood = swapClasses(lastMood, "overjoyed");
        happinessMeter.youWin();
    }

    // these always take precedence over the above in the CSS
    function updateNeeds(meter, need) {
        if (meter > 0) {
            body.classList.remove(need);
        } else {
            body.classList.add(need);
        }
    }

    updateNeeds(happinessMeter.meters.engagementMeter, "bored");
    updateNeeds(happinessMeter.meters.hungerMeter, "hungry");
    updateNeeds(happinessMeter.meters.restMeter, "tired");

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

function pickRandomProperty(obj) {
    var result;
    var count = 0;
    for (var prop in obj)
        if (Math.random() < 1/++count)
           result = prop;
    return result;
}

function depreciateMeters() {
    // find out if we have more than one points left
    var randomMeter = pickRandomProperty(happinessMeter.meters);
    var meterValue, meterViz;

    if (happinessMeter.measureHappiness() > 1) {
        // randomly pick a meter that has some points left
        if (hasValue(happinessMeter.meters, randomMeter, 0)) {
            // bleh, there's nothing in this meter, start again
            depreciateMeters();
        } else {
            // ooh, this meter has something...
            meterValue = happinessMeter.meters[randomMeter];
            meterViz = randomMeter + "Viz";
            happinessMeter.decrementPoint(randomMeter);
            updateEmotion();
        }
    } else {
        // You have only one point left.
        for (var i in happinessMeter.meters) {
            // Set all happinessMeter's meters to 0.
            happinessMeter.meters[i] = 0;
            // Update the visual meters.
            happinessMeter.updateMeterViz(happinessMeter[i +"Viz"], happinessMeter.meters[i]);
        }
        updateEmotion();
        console.log("Game over, man, game over!")
    }
};

window.addEventListener("load", function load(event){
    window.removeEventListener("load", load, false); //remove listener, no longer needed

    // start the happiness meter afresh
    happinessMeter.init();
},false);

})();