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
     * @param responses - Array of 7 responses (values 0-5)
     * @returns {Object} - Archetype object with name and description
     */
    archetypeFor(responses) {
        // Sort questions by value in descending order
        const sorted = [...responses].filter((resp) => resp.type === "slider").sort((a, b) => parseInt(b.value) - parseInt(a.value));

        // Get the highest score
        const topScore = parseInt(sorted[0].value);

        // Find all questions with the top score
        const topScored = sorted.filter(q => parseInt(q.value) === topScore);

        // If we have more than 2 questions with the top score, randomly select 2
        if (topScored.length > 2) {
            const shuffled = [...topScored].sort(() => Math.random() - 0.5);
            const slice = shuffled.slice(0, 2).map(q => q.attitude);
            return this.findArchetype(slice[0], slice[1]);
        }

        // If we have exactly 2 we return them
        if (topScored.length === 2) {
            const topTwo = topScored.map(q => q.attitude);
            return this.findArchetype(topTwo[0], topTwo[1]);
        }

        // If only 1 question has the top score, get the second highest score
        const secondScore = parseInt(sorted[1].value);
        const secondScored = sorted.filter(q => parseInt(q.value) === secondScore);

        // If multiple questions have the second highest score, randomly pick one
        if (secondScored.length > 1) {
            const randomSecond = secondScored[Math.floor(Math.random() * secondScored.length)];
            return this.findArchetype(topScored[0].attitude, randomSecond.attitude);
        }

        return this.findArchetype(topScored[0].attitude, secondScored[0].attitude);
    }

    findArchetype(attitude1, attitude2) {
        const archetype = QUIZ_DATA.archetypes.find(archetype =>
            archetype.base.length === 2 &&
            archetype.base.includes(attitude1) &&
            archetype.base.includes(attitude2)
        );

        return archetype || null; // or throw an error if preferred
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
            } else if (answer.type === 'option') {
                const num = answer.value[0]?.split('_')[0];
                for (let i = 1; i <= answer.options_number; i++) {
                    const key = `${num}_${i}`;
                    const id = `${answer.id}_${i}`;
                    answerData[id] = answer.value.includes(key) ? 1 : 0;
                }
            } else if (answer.type === 'allocation') {
                for (let i = 1; i <= answer.options_number; i++) {
                    const id = `${answer.id}_${i}`;
                    answerData[id] = answer.value[i - 1];
                }
            } else {
                answerData[answer.id] = answer.text;
            }

        });

        return {
            timestamp: new Date().toISOString(),
            coordinates: coords,
            category: category,
            answers: answerData
        };
    }
}
