// Define each deck with the initial card values
const initialDecks = {
    "White": [0, 0, 1, 1, 2, "{2}"],
    "Yellow": [0, 0, 1, 2, 3, "{3}"],
    "Red": [0, 0, 2, 3, 3, "{4}"],
    "Black": [0, 0, 3, 3, 4, "{5}"]
};

// Create an object to hold the decks for each instance
let allDecks = {
    "Oathsworn": {},
    "Encounter": {}
};

// Initialize the decks for both instances with cards tripled (18 cards per deck)
Object.keys(initialDecks).forEach(deckName => {
    allDecks.Oathsworn[deckName] = initialDecks[deckName].concat(initialDecks[deckName], initialDecks[deckName]);
    allDecks.Encounter[deckName] = initialDecks[deckName].concat(initialDecks[deckName], initialDecks[deckName]);
});

// Initialize the UI for the specified deck
function initializeDeck(deckName, instance) {
    const deckContainer = document.getElementById(`${instance}-decks`);

    const deckDiv = document.createElement("div");
    deckDiv.className = "deck-container";

    const header = document.createElement("div");
    header.className = "deck-header";
    header.textContent = `${deckName}`;
    deckDiv.appendChild(header);

    // Total cards remaining display
    const totalCardsDisplay = document.createElement("div");
    totalCardsDisplay.className = "total-cards";
    totalCardsDisplay.id = `${instance}-${deckName}-total`; // Unique ID for each deck
    totalCardsDisplay.textContent = `Total Cards Remaining: ${allDecks[instance][deckName].length}`;
    deckDiv.appendChild(totalCardsDisplay);

    // Button container for each card
    const buttonContainer = document.createElement("div");
    buttonContainer.className = "button-container";

    const uniqueCards = [...new Set(initialDecks[deckName])];

    uniqueCards.forEach(card => {
        const cardWrapper = document.createElement("div"); // Create a wrapper for button and count
        cardWrapper.className = "card-wrapper"; // Styling class for spacing

        const button = document.createElement("button");
        button.textContent = card === 0 ? "" : card; // Show text only for non-blank cards
        button.onclick = () => drawCard(instance, deckName, card); // Pass instance and deck name
        button.className = deckName.toLowerCase(); // Add class based on deck name for styling
        cardWrapper.appendChild(button); // Append button to the wrapper

        // Create and append composition display for each button
        const compositionDisplay = document.createElement("div");
        compositionDisplay.className = "composition-display";
        compositionDisplay.id = `${instance}-${deckName}-${card}-composition`; // Unique ID for later reference

        cardWrapper.appendChild(compositionDisplay); // Append composition display below button
        buttonContainer.appendChild(cardWrapper); // Append the wrapper to the button container
    });

    deckDiv.appendChild(buttonContainer);

    // Reset button
    const resetButton = document.createElement("button");
    resetButton.textContent = "Reset Deck";
    resetButton.onclick = () => resetDeck(instance, deckName);
    deckDiv.appendChild(resetButton); // Add reset button below the buttons

    deckContainer.appendChild(deckDiv);

    updateStats(instance, deckName);
}

// Get the count of a specific card in the specified deck
function getCardCount(instance, deckName, card) {
    return allDecks[instance][deckName].filter(c => c === card).length;
}

// Draw a card and remove it from the specified deck
function drawCard(instance, deckName, card) {
    const index = allDecks[instance][deckName].indexOf(card);
    if (index > -1) {
        allDecks[instance][deckName].splice(index, 1);
        updateStats(instance, deckName);
    }
}

// Update statistics for the specified deck
function updateStats(instance, deckName) {
    const totalCards = allDecks[instance][deckName].length; // Update total cards remaining here

    // Update total cards remaining display for the specific deck
    const totalCardsDisplay = document.getElementById(`${instance}-${deckName}-total`);
    if (totalCardsDisplay) {
        totalCardsDisplay.textContent = `Total Cards Remaining: ${totalCards} / 18`;
    }

    // Ensure all unique cards are accounted for in stats
    const uniqueCards = [...new Set(initialDecks[deckName])];

    uniqueCards.forEach(card => {
        // Update the composition display for each card
        const compositionDisplay = document.getElementById(`${instance}-${deckName}-${card}-composition`);
        if (compositionDisplay) {
            const count = getCardCount(instance, deckName, card);
            const percentage = totalCards ? ((count / totalCards) * 100).toFixed(1) : 0;
            compositionDisplay.innerHTML = `${count} / ${totalCards}<br>${percentage}%`;
        }
    });
}

// Reset the specified deck to its initial state
function resetDeck(instance, deckName) {
    allDecks[instance][deckName] = initialDecks[deckName].concat(initialDecks[deckName], initialDecks[deckName]); // Reset to 18 cards
    updateStats(instance, deckName); // Update statistics for the specific deck
}

// Initialize the deck tracker for both decks on page load
window.onload = () => {
    // Initialize Oathsworn decks
    Object.keys(initialDecks).forEach(deckName => {
        initializeDeck(deckName, "Oathsworn");
    });

    // Initialize Encounter decks
    Object.keys(initialDecks).forEach(deckName => {
        initializeDeck(deckName, "Encounter");
    });
};
