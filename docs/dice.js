document.addEventListener('DOMContentLoaded', function () {
    generateMissTable();
});

// Calc chance of missing
function calculateMissProbability(dice, rerolls) {

    // Oathsworn dice have 2/6 blanks, 1/3

    // Base probability is all-dice-hit + all-but-one-hit (everything else is a miss) 
    // Probability of all dice hitting = (2/3)^n
    // Probability of getting 1 blank = (2/3)^(n-1)*(1/3)*n

    let allHitProbability = Math.pow(2 / 3, dice);
    let oneBlankProbability = Math.pow(2 / 3, dice - 1) * (1 / 3 * dice);

    // ## Base probability of missing ##
    const baseMissProbability = (dice) => {
        let probNoMiss = 0;

        // All hits
        probNoMiss += allHitProbability;
        // All but 1 hit
        probNoMiss += oneBlankProbability;
        return 1 - probNoMiss; // Base miss
    };

    // Base probability
    let missProb = baseMissProbability(dice);

    // ## Re-rolls ##
    // 1/3 of the time we'd have a blank
    
    // TODO: Do a re-roll
    if (rerolls > 0) { // Escape the 0 case.....

        // For each reroll, calculate the probability of missing again
        let rerollMissProb = baseMissProbability(1); // Miss probability for 1 die
        let totalMissProb = missProb; // Start with base probability of missing
        // TODO: Handle the case where a single die could be re-roled multiple times
        
        for (let i = 0; i < rerolls; i++) {
            // Calculate the new miss probability after the reroll
            // Should get smaller each time, so multiply the current miss probability by the chance that the die misses
            // TODO: Check nuance
            totalMissProb *= rerollMissProb;
        }
        
        missProb = totalMissProb;
    }
    return (missProb * 100).toFixed(2);
}

// Generate table
function generateMissTable() {
    const table = document.getElementById("missTable");

    // TODO - Make web params
    const rerolls = 6; // i.e. 0 .. 5
    const qtyDice = 10;

    let tableHTML = '<tr><th class="title"><div class="c1">#ReRoll</div><div class ="c2">#Dice</div></th>';

    // Column header
    for (let reroll = 0; reroll < rerolls; reroll++) {
        tableHTML += `<th>${reroll}</th>`;
    }
    tableHTML += '</tr>';

    // Rows
    for (let dice = 1; dice <= qtyDice; dice++) {
        tableHTML += `<tr><td class="title">${dice}</td>`;

        // Fill table
        for (let reroll = 0; reroll < rerolls; reroll++) {
            tableHTML += `<td>${calculateMissProbability(dice, reroll)}%</td>`;
        }

        tableHTML += '</tr>';
    }

    table.innerHTML = tableHTML;
}