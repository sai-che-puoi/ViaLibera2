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
     * Utility functions for new algorithm
     */
    norm01(Q) {
        return (Q - 1) / 9;
    }

    clamp(v, lo, hi) {
        if (v < lo) return lo;
        if (v > hi) return hi;
        return v;
    }

    /**
     * Calculate weighted coordinates using new algorithm
     */
    calculateCoordinates(answers) {
        // Extract Q1-Q7 values from answers
        const Q = {};
        answers.forEach((answer, index) => {
            if (answer.type === 'slider') {
                Q[`Q${index + 1}`] = parseFloat(answer.value);
            }
        });

        // Normalization
        const q1 = this.norm01(Q.Q1);
        const q2 = this.norm01(Q.Q2);
        const q3 = this.norm01(Q.Q3);
        const q4 = this.norm01(Q.Q4);
        const q5 = this.norm01(Q.Q5);
        const q6 = this.norm01(Q.Q6);
        const q7 = this.norm01(Q.Q7);

        // Versione centrata (neutro = 0.5)
        const c1 = q1 - 0.5;
        const c2 = q2 - 0.5;
        const c3 = q3 - 0.5;
        const c4 = q4 - 0.5;
        const c5 = q5 - 0.5;
        const c6 = q6 - 0.5;
        const c7 = q7 - 0.5;

        // Asse X (Quartiere vivace <-> Quartiere tranquillo e ordinato)
        const X_raw = 0.90 * (q7 - q6) + 0.10 * (c5);
        const X = this.clamp(5 + 5 * X_raw, 0, 10);

        // Asse Y (Cambiamo lo spazio pubblico <-> Teniamolo così)
        const Y_core = 0.40 * (c1) + 0.35 * (-c4) + 0.25 * (c5);
        const Y_sup = 0.12 * (c3) + 0.06 * (c7) + 0.04 * (c2) + 0.08 * (-c6);
        const Y_raw = Y_core + Y_sup;
        const Y = this.clamp(5 + 5 * Y_raw, 0, 10);

        // Quadrante
        let quadrant;
        if (X >= 5 && Y >= 5) {
            quadrant = "Cambiamo + Quartiere vivace";
        } else if (X < 5 && Y >= 5) {
            quadrant = "Cambiamo + Quartiere tranquillo/ordinato";
        } else if (X < 5 && Y < 5) {
            quadrant = "Teniamolo così + Quartiere tranquillo/ordinato";
        } else {
            quadrant = "Teniamolo così + Quartiere vivace";
        }

        // Convert to SVG coordinates (-100 to 100)
        const x = (X - 5) * 20;
        const y = (Y - 5) * 20;

        return {x: x, y: y, quadrant: quadrant};
    }

    /**
     * Calculates the user's archetype based on their quiz responses
     * @param responses - Array of responses
     * @returns {Object} - Archetype object with name and description
     */
    archetypeFor(responses) {
        console.log('Starting archetype calculation with responses:', responses);
        
        // Sort questions by value in descending order
        const sorted = [...responses].filter((resp) => resp.type === "slider").sort((a, b) => parseInt(b.value) - parseInt(a.value));
        
        console.log('Sorted responses:', sorted);

        // Get the highest score
        const topScore = parseInt(sorted[0].value);
        console.log('Top score:', topScore);

        // Find all questions with the top score
        const topScored = sorted.filter(q => parseInt(q.value) === topScore);
        console.log('Top scored questions:', topScored);

        // If we have more than 2 questions with the top score, try multiple random pairs
        if (topScored.length > 2) {
            console.log('More than 2 questions with top score, trying multiple pairs');
            
            // Try up to 10 random pairs to find a matching archetype
            for (let attempt = 0; attempt < 10; attempt++) {
                const shuffled = [...topScored].sort(() => Math.random() - 0.5);
                const slice = shuffled.slice(0, 2).map(q => q.attitude);
                console.log(`Attempt ${attempt + 1}, selected attitudes:`, slice);
                
                const archetype = this.findArchetype(slice[0], slice[1]);
                if (archetype) {
                    console.log('Found matching archetype on attempt', attempt + 1);
                    return archetype;
                }
            }
            
            // If no match found, return a default archetype
            console.log('No archetype found after 10 attempts, returning default');
            return {
                name: "Profilo Equilibrato",
                description: "Hai una visione equilibrata su tutti i temi urbani, senza preferenze marcate."
            };
        }

        // If we have exactly 2 we return them
        if (topScored.length === 2) {
            const topTwo = topScored.map(q => q.attitude);
            console.log('Exactly 2 questions with top score, attitudes:', topTwo);
            return this.findArchetype(topTwo[0], topTwo[1]);
        }

        // If only 1 question has the top score, get the second highest score
        const secondScore = parseInt(sorted[1].value);
        const secondScored = sorted.filter(q => parseInt(q.value) === secondScore);

        // If multiple questions have the second highest score, try to find a matching pair
        if (secondScored.length > 1) {
            for (const second of secondScored) {
                const archetype = this.findArchetype(topScored[0].attitude, second.attitude);
                if (archetype) {
                    return archetype;
                }
            }
        }

        const finalArchetype = this.findArchetype(topScored[0].attitude, secondScored[0].attitude);
        if (finalArchetype) {
            return finalArchetype;
        }
        
        // Final fallback
        return {
            name: "Profilo Unico",
            description: "Il tuo profilo è unico e non corrisponde ai pattern più comuni che abbiamo mappato."
        };
    }

    findArchetype(attitude1, attitude2) {
        console.log('Looking for archetype with attitudes:', attitude1, attitude2);
        console.log('Available archetypes:', QUIZ_DATA.archetypes.length);
        
        const archetype = QUIZ_DATA.archetypes.find(archetype =>
            archetype.base.length === 2 &&
            archetype.base.includes(attitude1) &&
            archetype.base.includes(attitude2)
        );
        
        console.log('Found archetype:', archetype);
        return archetype || null;
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
                    result = "NA"
                }
                answerData[answer.id] = result;
            } else {
                answerData[answer.id] = answer.text;
            }
        });

        // Add attitude to slider answers for archetype calculation
        const answersWithAttitudes = answers.map((answer) => {
            if (answer.type === 'slider') {
                // Find the corresponding question by id
                const question = this.questions.find(q => q.id === answer.id);
                console.log(`Question for ${answer.id}:`, question);
                return {
                    ...answer,
                    attitude: question ? question.attitude : undefined
                };
            }
            return answer;
        });
        
        console.log('Questions available:', this.questions.filter(q => q.type === 'slider').map(q => ({id: q.id, attitude: q.attitude})));

        const archetype = this.archetypeFor(answersWithAttitudes);
        
        console.log('Answers with attitudes:', answersWithAttitudes);
        console.log('Calculated archetype:', archetype);
        console.log(answerData);
        return {
            timestamp: new Date().toISOString(),
            answers: answerData,
            archetype: archetype
        };
    }
}