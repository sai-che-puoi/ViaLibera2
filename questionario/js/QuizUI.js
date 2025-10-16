import {generateTimestamp} from "./config.js";

export class QuizUI {
    constructor(container, quizData) {
        this.container = container;
        this.quizData = quizData;
        this.elements = {};
    }

    /**
     * Initialize the quiz UI
     */
    init() {
        this.elements.title = document.getElementById('quizTitle');
        this.elements.description = document.getElementById('quizDescription');
        this.elements.questionsContainer = document.getElementById('questionsContainer');
        this.elements.form = document.getElementById('quizForm');

        this.elements.title.textContent = this.quizData.title;
        this.elements.description.textContent = this.quizData.description;

        this.renderQuestions();
    }

    /**
     * Render all questions
     */
    renderQuestions() {
        this.elements.questionsContainer.innerHTML = '';

        this.quizData.questions.forEach((question, index) => {
            const questionEl = this.createQuestionElement(question, index);
            this.elements.questionsContainer.appendChild(questionEl);
        });
    }



    /**
     * Create slider element
     */
    createSlider(question, index) {
        const container = document.createElement('div');
        container.className = 'question-slider-container';
        container.style.width = '100%';

        const wrapper = document.createElement('div');
        wrapper.className = 'slider-wrapper';

        const slider = document.createElement('input');
        slider.type = 'range';
        slider.className = 'slider';
        slider.name = `question${index}`;
        slider.id = question.id || `q${index}slider`;
        slider.min = question.min;
        slider.max = question.max;
        slider.value = question.defaultValue;

        const valueDisplay = document.createElement('div');
        valueDisplay.className = 'slider-value';
        valueDisplay.textContent = slider.value;

        slider.addEventListener('input', () => {
            valueDisplay.textContent = slider.value;
        });

        wrapper.appendChild(slider);
        wrapper.appendChild(valueDisplay);

        const labels = document.createElement('div');
        labels.className = 'slider-labels';
        labels.style.width = '100%'; // Add explicit width
        labels.innerHTML = `
        <span>${question.minLabel}</span>
        <span>${question.maxLabel}</span>
    `;

        container.appendChild(wrapper);
        container.appendChild(labels);

        return container;
    }
    /**
     * Create radio group element
     */
    createRadioGroup(question, index) {
        const container = document.createElement('div');
        container.className = 'options';

        question.options.forEach((option, optIndex) => {
            const optionDiv = document.createElement('div');
            optionDiv.className = 'option';

            const radio = document.createElement('input');
            radio.type = 'radio';
            radio.name = `question${index}`;
            radio.id = `${question.id}_${optIndex}`;
            radio.value = option.value;
            radio.required = true;
            radio.dataset.text = option.text;

            const label = document.createElement('label');
            label.htmlFor = radio.id;
            label.textContent = option.text;

            optionDiv.appendChild(radio);
            optionDiv.appendChild(label);

            optionDiv.addEventListener('click', () => {
                radio.checked = true;
                container.querySelectorAll('.option').forEach(el =>
                    el.classList.remove('selected')
                );
                optionDiv.classList.add('selected');
            });

            container.appendChild(optionDiv);
        });

        return container;
    }

    /**
     * Create resource allocation element
     */
    createResourceAllocation(question, index) {
        const container = document.createElement('div');
        container.className = 'allocation-question';
        container.id = `allocation_${index}`;

        // Header
        const header = document.createElement('div');
        header.className = 'allocation-header';
        header.innerHTML = `
        <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            Hai a disposizione <strong>100 punti</strong> da distribuire tra i seguenti elementi, 
            in base a quanto li ritieni importanti. La somma totale deve essere 100.
        </p>
    `;
        container.appendChild(header);

        // Remaining resources display
        const remainingBox = document.createElement('div');
        remainingBox.className = 'remaining-resources';
        remainingBox.innerHTML = `
        <div class="remaining-display">
            <span class="remaining-label">Punti rimanenti:</span>
            <span class="remaining-value warning" id="remainingValue_${index}">100</span>
        </div>
        <div class="progress-bar-container">
            <div class="progress-bar warning" id="progressBar_${index}" style="width: 0"></div>
        </div>
        <div class="progress-labels">
            <span>0</span>
            <span>Allocati: <span id="allocatedValue_${index}">0</span></span>
            <span>100</span>
        </div>
    `;
        container.appendChild(remainingBox);

        // Error message
        const errorMsg = document.createElement('div');
        errorMsg.className = 'error-message';
        errorMsg.id = `errorMessage_${index}`;
        errorMsg.innerHTML = `
        <svg class="error-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" stroke-width="2"></circle>
            <line x1="12" y1="8" x2="12" y2="12" stroke-width="2"></line>
            <line x1="12" y1="16" x2="12.01" y2="16" stroke-width="2"></line>
        </svg>
        <span>Hai superato il limite di 100 punti. Riduci alcune allocazioni.</span>
    `;
        container.appendChild(errorMsg);

        // Options container - all in one div
        const optionsContainer = document.createElement('div');
        optionsContainer.id = `optionsContainer_${index}`;
        optionsContainer.className = 'allocation-options-wrapper';

        question.options.forEach((option, optIndex) => {
            const optionDiv = document.createElement('div');
            optionDiv.className = 'allocation-option';

            optionDiv.innerHTML = `
            <div style="display: none;" class="option-header">
                <span class="option-value" id="value_${index}_${optIndex}">0</span>
            </div>
            <div style="display: flex; flex-direction: column; gap: 10px;">
                <div>${option.text}</div>
                <div class="slider-container">
                    <input 
                        type="range"
                        class="slider allocation-slider"
                        id="slider_${index}_${optIndex}"
                        name="${option.value}"
                        min="0" 
                        max="100" 
                        value="0"
                        data-question="${index}"
                        data-option="${optIndex}"
                    >
                    <div>&nbsp;</div>
                    <input 
                        type="number"
                        class="number-input"
                        id="number_${index}_${optIndex}"
                        min="0" 
                        max="100" 
                        value="0"
                        data-question="${index}"
                        data-option="${optIndex}"
                    />
                </div>
            </div>
        `;

            optionsContainer.appendChild(optionDiv);
        });

        container.appendChild(optionsContainer);

        // Submit hint
        const hint = document.createElement('div');
        hint.className = 'submit-hint';
        hint.id = `submitHint_${index}`;
        hint.textContent = 'Distribuisci tutti i 100 punti per continuare';
        container.appendChild(hint);

        // Add event listeners after appending to DOM
        setTimeout(() => {
            this.initAllocationListeners(index, question.options.length);
        }, 0);

        return container;
    }

    /**
     * Initialize allocation listeners
     */
    initAllocationListeners(questionIndex, optionsCount) {
        const updateAllocation = () => {
            let total = 0;
            // const values = [];

            // Calculate total
            for (let i = 0; i < optionsCount; i++) {
                const slider = document.getElementById(`slider_${questionIndex}_${i}`);
                const value = parseInt(slider.value) || 0;
                values.push(value);
                total += value;
            }

            const remaining = 100 - total;
            const isValid = remaining >= 0;

            // Update remaining display
            const remainingEl = document.getElementById(`remainingValue_${questionIndex}`);
            const progressBar = document.getElementById(`progressBar_${questionIndex}`);
            const allocatedEl = document.getElementById(`allocatedValue_${questionIndex}`);
            const errorMsg = document.getElementById(`errorMessage_${questionIndex}`);
            const hint = document.getElementById(`submitHint_${questionIndex}`);

            remainingEl.textContent = remaining;
            allocatedEl.textContent = total;

            // Update colors
            remainingEl.className = 'remaining-value ';
            progressBar.className = 'progress-bar ';

            if (!isValid) {
                remainingEl.className += 'invalid';
                progressBar.className += 'invalid';
                errorMsg.classList.add('show');
            } else if (remaining === 0) {
                remainingEl.className += 'valid';
                progressBar.className += 'valid';
                errorMsg.classList.remove('show');
            } else {
                remainingEl.className += 'warning';
                progressBar.className += 'warning';
                errorMsg.classList.remove('show');
            }

            // Update progress bar
            const percentage = Math.min(total, 100);
            progressBar.style.width = `${percentage}%`;

            // Update hint
            if (remaining === 0) {
                hint.textContent = 'Perfetto! Puoi continuare';
                hint.style.color = '#10b981';
            } else if (remaining > 0) {
                hint.textContent = `Distribuisci i ${remaining} punti rimanenti per continuare`;
                hint.style.color = '#666';
            } else {
                hint.textContent = `Riduci di ${Math.abs(remaining)} punti per continuare`;
                hint.style.color = '#ef4444';
            }

            // Store validation state
            const container = document.getElementById(`allocation_${questionIndex}`);
            container.dataset.valid = (isValid && remaining === 0).toString();
        };

        // Add listeners to all sliders and number inputs
        for (let i = 0; i < optionsCount; i++) {
            const slider = document.getElementById(`slider_${questionIndex}_${i}`);
            const numberInput = document.getElementById(`number_${questionIndex}_${i}`);
            const valueDisplay = document.getElementById(`value_${questionIndex}_${i}`);

            slider.addEventListener('input', (e) => {
                const value = e.target.value;
                numberInput.value = value;
                valueDisplay.textContent = value;

                // Update slider gradient
                const percentage = (value / 100) * 100;
                slider.style.background = `linear-gradient(to right, #667eea ${percentage}%, #e5e7eb ${percentage}%)`;

                updateAllocation();
            });

            numberInput.addEventListener('input', (e) => {
                let value = parseInt(e.target.value) || 0;
                value = Math.max(0, Math.min(100, value));

                slider.value = value;
                valueDisplay.textContent = value;

                // Update slider gradient
                const percentage = (value / 100) * 100;
                slider.style.background = `linear-gradient(to right, #667eea ${percentage}%, #e5e7eb ${percentage}%)`;

                updateAllocation();
            });
        }

        updateAllocation();
    }

// Update the createQuestionElement method to handle allocation type
// Add this case in your existing createQuestionElement method:

    /**
     * Create a question element (UPDATED)
     */
    createQuestionElement(question, index) {
        const div = document.createElement('div');
        div.className = 'question';

        const text = document.createElement('div');
        text.className = 'question-text';
        text.textContent = `${index + 1}. ${question.text}`;
        div.appendChild(text);

        if (question.type === 'slider') {
            div.appendChild(this.createSlider(question, index));
        } else if (question.type === 'radio') {
            div.appendChild(this.createRadioGroup(question, index));
        } else if (question.type === 'allocation') {
            div.appendChild(this.createResourceAllocation(question, index));
        }

        return div;
    }

// Update collectAnswers to handle allocation questions
    /**
     * Collect answers from form (UPDATED)
     */
    collectAnswers() {
        const answers = [];

        this.quizData.questions.forEach((question, index) => {
            if (question.type === 'slider') {
                const slider = document.getElementById(question.id || `q${index}slider`);
                answers.push({
                    type: 'slider',
                    value: slider.value,
                    text: slider.value
                });
            } else if (question.type === 'radio') {
                const selected = document.querySelector(`input[name="question${index}"]:checked`);
                if (selected) {
                    answers.push({
                        type: 'radio',
                        value: selected.value,
                        text: selected.dataset.text
                    });
                }
            } else if (question.type === 'allocation') {
                const allocations = {};
                question.options.forEach((option, optIndex) => {
                    const slider = document.getElementById(`slider_${index}_${optIndex}`);
                    allocations[option.value] = parseInt(slider.value) || 0;
                });
                answers.push({
                    type: 'allocation',
                    value: allocations,
                    text: JSON.stringify(allocations)
                });
            }
        });

        return answers;
    }

// Validation before submit - add this to QuizController.handleSubmit()
// Before collecting answers, validate allocation questions:

    async handleSubmit() {
        // Validate allocation questions
        let allValid = true;
        this.quizData.questions.forEach((question, index) => {
            if (question.type === 'allocation') {
                const container = document.getElementById(`allocation_${index}`);
                if (container.dataset.valid !== 'true') {
                    allValid = false;
                    alert('Per favore, distribuisci esattamente 100 punti prima di continuare.');
                }
            }
        });

        if (!allValid) return;

        const answers = this.ui.collectAnswers();
        this.calculator.calculate(answers, this.quizData.results);
    }

    /**
     * Reset the form
     */
    reset() {
        this.elements.form.reset();
        document.getElementById("quizTitle").textContent = "Questionario Via Libera - " + generateTimestamp();

        document.querySelectorAll('.option').forEach(el =>
            el.classList.remove('selected')
        );

        this.quizData.questions.forEach((question, index) => {
            if (question.type === 'slider') {
                const slider = document.getElementById(question.id || `q${index}slider`);
                slider.value = question.defaultValue;
                const valueDisplay = slider.nextElementSibling;
                if (valueDisplay) {
                    valueDisplay.textContent = slider.value;
                }
            }
        });
    }
}