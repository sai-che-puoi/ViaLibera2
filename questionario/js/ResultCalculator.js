import {QUIZ_DATA} from './config.js';

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
     * Calculates the user's archetype based on their quiz responses
     * @param {number[]} responses - Array of 7 responses (values 0-5)
     * @returns {Object} - Archetype object with name and description
     */
    archetypeFor(responses) {
        // Build mapping from question index to attitude
        const mappingStatementsToAttitude = QUIZ_DATA.questions.map(q => q.attitude);

        // Build archetypes lookup table
        const archetypesTable = this.buildArchetypesTable(QUIZ_DATA.archetypes);

        // 1) Calculate scores per attitude (mean of raw responses)
        const groups = {};
        mappingStatementsToAttitude.forEach((attitude, idx) => {
            if (!groups[attitude]) {
                groups[attitude] = [];
            }
            groups[attitude].push(idx);
        });

        const scores = {};
        for (const attitude in groups) {
            const indices = groups[attitude];
            const values = indices
                .map(i => responses[i])
                .filter(val => val !== null && val !== undefined);

            if (values.length > 0) {
                scores[attitude] = this.mean(values);
            }
        }

        // 2) Get top-2 attitudes
        const ordered = Object.keys(scores).sort((a, b) => {
            const scoreDiff = scores[b] - scores[a];
            if (scoreDiff !== 0) {
                return scoreDiff; // descending by score
            }
            // Tie-breaker: original question order (first appearance)
            const indexA = mappingStatementsToAttitude.indexOf(a);
            const indexB = mappingStatementsToAttitude.indexOf(b);
            return indexA - indexB;
        });

        if (ordered.length < 2) {
            return {
                name: "Archetipo non definito",
                description: "Dati insufficienti"
            };
        }

        const A1 = ordered[0];
        const A2 = ordered[1];

        // 3) Create canonical key (alphabetically sorted)
        const key = this.canonicalKey(A1, A2);

        // 4) Lookup archetype
        if (key in archetypesTable) {
            return archetypesTable[key];
        } else {
            return {
                name: "Archetipo non definito",
                description: `Coppia: ${key}`
            };
        }
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
        const coords = this.calculateCoordinates(answers);
        const category = this.archetypeFor(answers);
        const answerData = {};
        answers.forEach((answer) => {
            if (answer.type === 'slider') {
                answerData[answer.id] = parseFloat(answer.value)
            }
            else if (answer.type === 'option') {
                const num = answer.value[0]?.split('_')[0];
                for (let i = 1; i <= answer.options_number; i++) {
                    const key = `${num}_${i}`;
                    const id = `${answer.id}_${i}`;
                    answerData[id] = answer.value.includes(key) ? 1 : 0;
                }
            }
            else if (answer.type === 'allocation') {
                for (let i = 1; i <= answer.options_number; i++) {
                    const id = `${answer.id}_${i}`;
                    answerData[id] = answer.value[i-1];
                }
            }
            else {
                answerData[answer.id] = answer.text;
            }

        });

        return {
            timestamp: new Date().toISOString(),
            coordinates: coords,
            category,
            answers: answerData
        };
    }
}
