function showToast(message) {
    const toastContainer = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    
    // Add toast to the container
    toastContainer.appendChild(toast);
    
    // Remove toast after animation
    setTimeout(() => {
        toastContainer.removeChild(toast);
    }, 3000);
}

// ######################################################

// Initial card values, replicating die faces
const initialDecks = {
    "White": [0, 0, 1, 1, 2, "{2}"],
    "Yellow": [0, 0, 1, 2, 3, "{3}"],
    "Red": [0, 0, 2, 3, 3, "{4}"],
    "Black": [0, 0, 3, 3, 4, "{5}"]
};

// Deck instances
const allDecks = {
    "Oathsworn": {},
    "Encounter": {}
};

// Get deck with 18 cards (equivalent to 3 dice rolls)
function getDeck(deckName) {
    return initialDecks[deckName].flatMap(card => [card, card, card]);
}

// Init decks with Draw and Discard attrs
function initAllDecks() {
    Object.keys(initialDecks).forEach(deckName => {
        allDecks.Oathsworn[deckName] = {
            Draw: getDeck(deckName),
            Discard: []
        };
        allDecks.Encounter[deckName] = {
            Draw: getDeck(deckName),
            Discard: []
        };
    });
}

// Reset specific deck to initial state
function resetDeck(instance, deckName) {
    allDecks[instance][deckName].Draw = getDeck(deckName);
    allDecks[instance][deckName].Discard = [];
    updateStats(instance, deckName);
    showToast(`Reset ${deckName.toLowerCase()} ${instance.toLowerCase()} deck`);
}

// ######################################################

// Init the UI for a given deck
function initDeckUI(deckName, instance) {
    const deckContainer = document.getElementById(`${instance}-decks`);
    const deckDiv = createDeckUI(deckName, instance);
    deckContainer.appendChild(deckDiv);
    updateStats(instance, deckName);
}

// Create deck and card wrapper UI elements
function createDeckUI(deckName, instance) {
    const deckDiv = document.createElement("div");
    deckDiv.className = "deck-container";

    // Header for the deck
    /*
    const header = document.createElement("div");
    header.className = "deck-header";
    header.textContent = deckName;
    deckDiv.appendChild(header);
    */

    // Total cards and health
    const topCornerContainer = document.createElement("div");
    topCornerContainer.className = "top-corner-container";

    // Corner display for total card count
    const totalCardsDisplay = document.createElement("div");
    totalCardsDisplay.className = "total-cards-corner";
    totalCardsDisplay.id = `${instance}-${deckName}-total-corner`;
    topCornerContainer.appendChild(totalCardsDisplay);

    // Miss health
    const missBox = document.createElement("div");
    missBox.className = "miss-box";
    missBox.id = `${instance}-${deckName}-miss-box`;
    topCornerContainer.appendChild(missBox);

    // Crit health
    const criticalsDisplay = document.createElement("div");
    criticalsDisplay.className = "criticals-box";
    criticalsDisplay.id = `${instance}-${deckName}-criticals-box`;
    topCornerContainer.appendChild(criticalsDisplay);

    // Average Hit Value
    const avgBox = document.createElement("div");
    avgBox.className = "avg-box";
    avgBox.id = `${instance}-${deckName}-avg-box`;
    avgBox.textContent = "Avg: 0.00";  // Initial text
    topCornerContainer.appendChild(avgBox);

    deckDiv.appendChild(topCornerContainer);

    // Button container and card wrappers
    const buttonContainer = document.createElement("div");
    buttonContainer.className = "button-container";
    const uniqueCards = [...new Set(initialDecks[deckName])];

    uniqueCards.forEach(card => {
        // Create card wrapper
        const cardWrapper = document.createElement("div");
        cardWrapper.className = "card-wrapper";

        // Create button for the card
        const button = document.createElement("button");
        button.textContent = card === 0 ? "" : card; // Show text for non-blank cards
        button.onclick = () => drawCard(instance, deckName, card);
        button.className = deckName.toLowerCase();
        cardWrapper.appendChild(button);

        // Create composition display for the card
        const compositionDisplay = document.createElement("div");
        compositionDisplay.className = "composition-display";
        compositionDisplay.id = `${instance}-${deckName}-${card}-composition`;
        cardWrapper.appendChild(compositionDisplay);

        // Add the card wrapper to the button container
        buttonContainer.appendChild(cardWrapper);
    });

    deckDiv.appendChild(buttonContainer);

    // Button container for Reset
    const actionButtonContainer = document.createElement("div");
    actionButtonContainer.className = "action-button-container";

    // Reset button
    const resetButton = document.createElement("button");
    resetButton.textContent = "Reset";
    resetButton.classList.add("reset-button");
    resetButton.onclick = () => resetDeck(instance, deckName);
    actionButtonContainer.appendChild(resetButton);

    deckDiv.appendChild(actionButtonContainer);

    return deckDiv;
}

// ######################################################

// Get the count of a specific card in the deck
function getCardCount(instance, deckName, card) {
    return allDecks[instance][deckName].filter(c => c === card).length;
}

// Draw a card and add to discard
function drawCard(instance, deckName, card) {
    const deck = allDecks[instance][deckName];
    const cardIndex = deck.Draw.indexOf(card);
    if (cardIndex >= 0) {
        // Remove card from the Draw pile
        deck.Draw.splice(cardIndex, 1);
        // Add card to the Discard pile
        deck.Discard.push(card);
        updateStats(instance, deckName);
        showToast(`Drew "${card}" from ${deckName.toLowerCase()} ${instance.toLowerCase()} deck`);
    }
}

// Update statistics for the deck
function updateStats(instance, deckName) {
    const deck = allDecks[instance][deckName];
    const totalCards = deck.Draw.length;
    const totalCardsDisplay = document.getElementById(`${instance}-${deckName}-total-corner`);
    const missBox = document.getElementById(`${instance}-${deckName}-miss-box`);
    const criticalsBox = document.getElementById(`${instance}-${deckName}-criticals-box`);
    const avgBox = document.getElementById(`${instance}-${deckName}-avg-box`);

    // ## Total card count ##
    if (totalCardsDisplay) totalCardsDisplay.textContent = totalCards;

    // ## Individual cards ##
    const uniqueCards = [...new Set(initialDecks[deckName])];
    uniqueCards.forEach(card => {
        const compositionDisplay = document.getElementById(`${instance}-${deckName}-${card}-composition`);
        if (compositionDisplay) {
            const count = deck.Draw.filter(c => c === card).length;
            const percentage = totalCards ? ((count / totalCards) * 100).toFixed(1) : 0;
            compositionDisplay.innerHTML = `${count}<br>${percentage}%`;
        }
    });

    // ## Misses ##
    // Calculate miss health
    const misses = deck.Draw.filter(card => card === 0).length;
    const missPercentage = totalCards ? (misses / totalCards) * 100 : 0;

    // Colour for misses
    let red = 0;
    let green = 0;
    let textmiss = `Miss`;

    if (missPercentage.toFixed(1) > 33.3) {
        red = 255;
        green = 0;
    } else if (missPercentage.toFixed(1) < 33.3) {
        red = 0;
        green = 255;
    } else {
        red = 0;
        green = 0;
    }

    if (`${instance}` === "Encounter") {
        // More misses are good... For us.
        [red, green] = [green, red];
        textmiss = "0's"
    }

    // Set miss box colour
    const missColour = `rgb(${red}, ${green}, 0, 0.6)`;
    missBox.style.backgroundColor = missColour;
    missBox.textContent = textmiss;

    // ## Crits ##
    const criticalCards = deck.Draw.filter(card => /\{\d\}/.test(card));  // Regex to detect cards like {2}, {3}, etc.
    const critCount = criticalCards.length;  // Get the number of critical cards
    const critPercentage = totalCards ? (critCount / totalCards) * 100 : 0;

    if (critPercentage.toFixed(1) > 16.7) {
        red = 0;
        green = 255;
    } else if (critPercentage.toFixed(1) < 16.7) {
        red = 255;
        green = 0;
    } else {
        red = 0;
        green = 0;
    }

    // Repeat rather than refactor as clearer...
    if (`${instance}` === "Encounter") {
        // Fewer hits are good... For us.
        [red, green] = [green, red];
    }

    // Set crit box colour
    const critColour = `rgb(${red}, ${green}, 0, 0.6)`;
    criticalsBox.style.backgroundColor = critColour;
    criticalsBox.textContent = `{*}`;

    // ## Average Hit Value ##
    const avgHitValue = calculateAverageHitValue(instance, deck.Draw);
    if (avgBox) avgBox.textContent = avgHitValue.toFixed(2);  // Display average hit value
}

// Adjust the layout for buttons on window resize
function adjustLayout() {
    const container = document.getElementById("Oathsworn-decks");
    const containerWidth = container.offsetWidth;
    const maxDeckWidth = Math.floor(containerWidth / 4) - 20;
    const maxButtons = Math.max(...Object.keys(initialDecks).map(deck => initialDecks[deck].length));
    const buttonSize = Math.min(Math.floor((maxDeckWidth - 50) / maxButtons), 80);
    const minButtonSize = 30;

    document.querySelectorAll('.deck-container').forEach(deck => deck.style.width = `${maxDeckWidth}px`);
    document.querySelectorAll('.button-container button').forEach(button => {
        button.style.width = `${Math.max(buttonSize, minButtonSize)}px`;
        button.style.height = `${Math.max(buttonSize, minButtonSize)}px`;
        button.style.fontSize = `${Math.max(buttonSize / 3, 12)}px`;
    });
}

// ######################################################

// Calculate avg from given deck
function calculateAverageHitValue(instance, faces) {
    const parsedFaces = faces.map(face => {
        if (typeof face === 'string') {
            return parseInt(face.replace(/[{}]/g, '')); // Handle exploding face like "{2}" -> 2
        }
        return face;
    });

    const rerollFace = parsedFaces[parsedFaces.length - 1];
    const probability = 1 / parsedFaces.length;
    
    // Calculate the expected value recursively (without infinite recursion)
    // Calc the expected value of a single die roll first.
    let expectedValue = 0;
    
    // Calculate the sum of non-exploding faces
    parsedFaces.forEach(face => {
        if (face === rerollFace && instance !== 'Encounter') {
            // For the reroll face, we need to add the value plus the expected value again
            expectedValue += probability * (face + expectedValue); 
        } else {
            expectedValue += probability * face; // For regular faces, just add their value
        }
    });

    return expectedValue;
}

// Display the average dice values
Object.keys(initialDecks).forEach(deckName => {
    const averageValue = calculateAverageHitValue("None", initialDecks[deckName]).toFixed(2);
    document.getElementById(`${deckName.toLowerCase()}DieValueOath`).innerText = averageValue;
});

// Run layout adjustment on window resize
window.addEventListener('resize', adjustLayout);

// Init both decks then adjust layout to suit
window.onload = () => {
    initAllDecks();
    ["Oathsworn", "Encounter"].forEach(instance => {
        Object.keys(initialDecks).forEach(deckName => initDeckUI(deckName, instance));
    });
    adjustLayout();
};