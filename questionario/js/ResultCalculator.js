export class ResultCalculator {
    constructor(questions) {
        this.questions = questions;
    }

    /**
     * Normalize slider values to [-1, 1] range
     */
    normalizeValue(value, min = 0, max = 5) {
        const center = (max + min) / 2;
        const range = (max - min) / 2;
        return (value - center) / range;
    }

    /**
     * Calculate weighted coordinates
     */
    calculateCoordinates(answers) {
        let sumX = 0, sumY = 0;
        let countX = 0, countY = 0;

        answers.forEach((answer, index) => {
            if (answer.type === 'slider') {
                const question = this.questions[index];
                const normalized = this.normalizeValue(
                    parseFloat(answer.value),
                    question.min,
                    question.max
                );

                if (Math.abs(question.weights.x) > 0) {
                    sumX += normalized * question.weights.x;
                    countX++;
                }

                if (Math.abs(question.weights.y) > 0) {
                    sumY += normalized * question.weights.y;
                    countY++;
                }
            }
        });

        const avgX = sumX / countX;
        const avgY = sumY / countY;

        // Convert from [-1, 1] to [0, 100]
        const xPct = 50 * (avgX + 1);
        const yPct = 50 * (avgY + 1);

        return {x: xPct, y: yPct};
    }

    /**
     * Builds a lookup table from archetypes array
     * @param {Array} archetypes - Array of archetype objects
     * @returns {Object} - Dictionary with canonical keys
     */
    buildArchetypesTable(archetypes) {
        const table = {};
        archetypes.forEach(archetype => {
            if (archetype.base.length === 2) {
                const key = this.canonicalKey(archetype.base[0], archetype.base[1]);
                table[key] = {
                    name: archetype.name,
                    description: archetype.description
                };
            }
        });
        return table;
    }

    /**
     * Creates a canonical key from two attitudes (alphabetically sorted)
     * @param {string} att1 - First attitude
     * @param {string} att2 - Second attitude
     * @returns {string} - Canonical key "Att1 | Att2"
     */
    canonicalKey(att1, att2) {
        const sorted = [att1, att2].sort();
        return `${sorted[0]} | ${sorted[1]}`;
    }

    /**
     * Calculates the mean of an array of numbers
     * @param {number[]} values - Array of numbers
     * @returns {number} - Mean value
     */
    mean(values) {
        if (values.length === 0) return 0;
        const sum = values.reduce((acc, val) => acc + val, 0);
        return sum / values.length;
    }

    /**
     * Calculate complete result
     */
    calculate(answers) {
        const answerData = {};

        answers.forEach((answer) => {
            if (answer.type === 'slider') {
                answerData[answer.id] = parseFloat(answer.value)
            } else if (answer.type === 'option') {
                const num = answer.value[0]?.split('_')[0];
                for (let i = 1; i <= answer.options_number; i++) {
                    const key = `${num}_${i}`;
                    const id = `${answer.id}_${i}`;
                    answerData[id] = answer.value.includes(key) ? 1 : 0;
                }
            } else if (answer.type === 'sorting') {
                // Create a column for each position
                for (let i = 1; i <= answer.options_number; i++) {
                    const id = `${answer.id}_${i}`;
                    answerData[id] = answer.value[i - 1]; // The option text at position i
                }
            } else if (answer.type === 'input') {
                var result = answer.text;
                if (result === "Preferisco non rispondere") {
                    result = "0"
                }
                answerData[answer.id] = result;
            } else {
                answerData[answer.id] = answer.text;
            }
        });

        console.log(answerData);
        return {
            timestamp: new Date().toISOString(),
            answers: answerData
        };
    }
}