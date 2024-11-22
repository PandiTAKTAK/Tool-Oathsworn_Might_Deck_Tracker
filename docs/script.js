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

    // Small label for total cards remaining in the corner
    const totalCardsDisplay = document.createElement("div");
    totalCardsDisplay.className = "total-cards-corner";
    totalCardsDisplay.id = `${instance}-${deckName}-total-corner`;
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
    resetButton.textContent = "Reset";
    resetButton.classList.add("reset-button");
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
    const totalCards = allDecks[instance][deckName].length;

    // Update the corner display with the new count
    const totalCardsCornerDisplay = document.getElementById(`${instance}-${deckName}-total-corner`);
    if (totalCardsCornerDisplay) {
        totalCardsCornerDisplay.textContent = `${totalCards}`;
    }

    // Ensure all unique cards are accounted for in stats
    const uniqueCards = [...new Set(initialDecks[deckName])];

    uniqueCards.forEach(card => {
        // Update the composition display for each card
        const compositionDisplay = document.getElementById(`${instance}-${deckName}-${card}-composition`);
        if (compositionDisplay) {
            const count = getCardCount(instance, deckName, card);
            const percentage = totalCards ? ((count / totalCards) * 100).toFixed(1) : 0;
            compositionDisplay.innerHTML = `${count}<br>${percentage}%`;
        }
    });

    // Calculate advanced stats (average result and hit chance)
    const advancedStats = calculateAdvancedStats(allDecks[instance][deckName]);
    displayAdvancedStats(instance, deckName, advancedStats);
}

// Calculate advanced statistics for a given deck
function calculateAdvancedStats(deck) {
    const results = { 1: {}, 2: {}, 3: {}, 4: {}, 5: {} };

    [1, 2, 3, 4, 5].forEach(numCards => {
        let totalScore = 0;
        let hitCount = 0;
        const trials = 10000; // Use Monte Carlo simulation for exploding cards

        for (let i = 0; i < trials; i++) {
            const hand = drawRandomHand(deck, numCards);
            const { score, misses } = processHand(hand, deck);

            if (misses < 2) hitCount++;
            totalScore += score;
        }

        results[numCards] = {
            average: (totalScore / trials).toFixed(2),
            hitChance: ((hitCount / trials) * 100).toFixed(1) + "%"
        };
    });

    return results;
}

// Draw a random hand of specified size from the deck
function drawRandomHand(deck, numCards) {
    const shuffledDeck = [...deck].sort(() => Math.random() - 0.5);
    return shuffledDeck.slice(0, numCards);
}

// Process a hand of cards, including exploding cards
function processHand(hand, fullDeck) {
    let score = 0;
    let misses = 0;

    for (const card of hand) {
        if (card === 0) {
            misses++;
        } else if (typeof card === "string" && card.includes("{")) {
            // Exploding card logic
            const value = parseInt(card.match(/\d+/)[0], 10);
            score += value;

            // Simulate drawing one extra card for the explosion
            const extraCard = drawRandomCard(fullDeck);
            if (extraCard !== null) {
                const extraResult = processHand([extraCard], fullDeck);
                score += extraResult.score;
                misses += extraResult.misses;
            }
        } else {
            score += card;
        }
    }

    return { score, misses };
}

// Draw a single random card from the deck
function drawRandomCard(deck) {
    if (deck.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * deck.length);
    return deck[randomIndex];
}


// Get all combinations of a specific number of cards from the deck
function getCombinations(deck, numCards) {
    if (deck.length < numCards) return [];
    const combinations = [];

    function helper(start, combo) {
        if (combo.length === numCards) {
            combinations.push(combo);
            return;
        }

        for (let i = start; i < deck.length; i++) {
            helper(i + 1, combo.concat(deck[i]));
        }
    }

    helper(0, []);
    return combinations;
}

// Display advanced statistics for a deck
function displayAdvancedStats(instance, deckName, stats) {
    const containerId = `${instance}-${deckName}-stats`;
    let statsContainer = document.getElementById(containerId);

    if (!statsContainer) {
        // Create stats container if it doesn't exist
        const deckDiv = document.querySelector(`#${instance}-decks .deck-container:nth-child(${Object.keys(initialDecks).indexOf(deckName) + 1})`);
        statsContainer = document.createElement("div");
        statsContainer.id = containerId;
        statsContainer.className = "advanced-stats";
        deckDiv.appendChild(statsContainer);
    }

    // Update stats content
    statsContainer.innerHTML = `
        <strong>Advanced Stats:</strong><br>
        ${[1, 2, 3, 4, 5]
            .map(
                numCards =>
                    `${numCards} cards: Avg = ${stats[numCards].average}, Hit% = ${stats[numCards].hitChance}`
            )
            .join("<br>")}
    `;
}

// Reset the specified deck to its initial state
function resetDeck(instance, deckName) {
    allDecks[instance][deckName] = initialDecks[deckName].concat(initialDecks[deckName], initialDecks[deckName]); // Reset to 18 cards
    updateStats(instance, deckName); // Update statistics for the specific deck
}

function adjustLayout() {
    // Get the maximum number of buttons in any deck
    const maxButtons = Math.max(...Object.keys(initialDecks).map(deck => initialDecks[deck].length));

    // Get the available width for the container
    const container = document.getElementById("Oathsworn-decks");
    const containerWidth = container.offsetWidth;

    // Calculate the maximum size for a single deck container
    const maxDeckWidth = Math.floor(containerWidth / 4) - 20; // Account for gap
    const buttonSize = Math.min(Math.floor((maxDeckWidth - 50) / maxButtons), 80); // Max button size

    // Update the style of all buttons and containers
    const allDecks = document.querySelectorAll('.deck-container');
    const allButtons = document.querySelectorAll('.button-container button');

    allDecks.forEach(deck => {
        deck.style.width = `${maxDeckWidth}px`;
    });

    allButtons.forEach(button => {
        button.style.width = `${buttonSize}px`;
        button.style.height = `${buttonSize}px`;
        button.style.fontSize = `${buttonSize / 3}px`;
    });
}

// Run the layout adjustment on window resize
window.addEventListener('resize', adjustLayout);

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

    // Adjust layout after decks are initialized
    adjustLayout();
};
