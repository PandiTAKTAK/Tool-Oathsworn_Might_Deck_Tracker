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

// Init decks
function initAllDecks() {
    Object.keys(initialDecks).forEach(deckName => {
        allDecks.Oathsworn[deckName] = getDeck(deckName);
        allDecks.Encounter[deckName] = getDeck(deckName);
    });
}

// Reset specific deck to initial state
function resetDeck(instance, deckName) {
    allDecks[instance][deckName] = getDeck(deckName);
    updateStats(instance, deckName); // Update statistics for the deck
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
    const header = document.createElement("div");
    header.className = "deck-header";
    header.textContent = deckName;
    deckDiv.appendChild(header);

    // Corner display for total card count
    const totalCardsDisplay = document.createElement("div");
    totalCardsDisplay.className = "total-cards-corner";
    totalCardsDisplay.id = `${instance}-${deckName}-total-corner`;
    deckDiv.appendChild(totalCardsDisplay);

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

    // Reset button for the deck
    const resetButton = document.createElement("button");
    resetButton.textContent = "Reset";
    resetButton.classList.add("reset-button");
    resetButton.onclick = () => resetDeck(instance, deckName);
    deckDiv.appendChild(resetButton);

    return deckDiv;
}

// ######################################################

// Get the count of a specific card in the deck
function getCardCount(instance, deckName, card) {
    return allDecks[instance][deckName].filter(c => c === card).length;
}

// Draw a card and remove it from the deck
function drawCard(instance, deckName, card) {
    // Find the index of the specified card in the deck
    const cardIndex = allDecks[instance][deckName].indexOf(card);
    
    // If the card exists in the deck (index >= 0), remove it
    if (cardIndex >= 0) {
        allDecks[instance][deckName].splice(cardIndex, 1);  // Remove the card from the deck
        updateStats(instance, deckName);  // Update the deck statistics after drawing the card
    }
}

// Update statistics for the deck
function updateStats(instance, deckName) {
    const totalCards = allDecks[instance][deckName].length;
    const totalCardsDisplay = document.getElementById(`${instance}-${deckName}-total-corner`);
    if (totalCardsDisplay) totalCardsDisplay.textContent = totalCards;

    const uniqueCards = [...new Set(initialDecks[deckName])];

    uniqueCards.forEach(card => {
        const compositionDisplay = document.getElementById(`${instance}-${deckName}-${card}-composition`);
        if (compositionDisplay) {
            const count = getCardCount(instance, deckName, card);
            const percentage = totalCards ? ((count / totalCards) * 100).toFixed(1) : 0;
            compositionDisplay.innerHTML = `${count}<br>${percentage}%`;
        }
    });
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
