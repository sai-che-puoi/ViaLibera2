import {generateId} from "./config.js";

export class QuizUI {
    constructor(container, quizData) {
        this.container = container;
        this.quizData = quizData;
        this.elements = {};
        this.id = generateId();
    }

    /**
     * Initialize the quiz UI
     */
    init() {
        const interviewEl = this.createInterviewerElement(this.quizData);
        const container = document.getElementById('interviewers');
        container.appendChild(interviewEl);
        this.elements.interviewers = interviewEl; // Store the SELECT element, not the div

        this.elements.title = document.getElementById('quizTitle');
        this.elements.description = document.getElementById('quizDescription');
        this.elements.questionsContainer = document.getElementById('questionsContainer');
        this.elements.form = document.getElementById('quizForm');

        this.elements.title.textContent = this.quizData.title + " - " + this.id;
        this.elements.description.textContent = this.quizData.description;

        this.renderQuiz();
    }

    /**
     * Render all questions
     */
    renderQuiz() {
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
        labels.style.width = '100%';
        labels.innerHTML = `
        <span>${question.minLabel}</span>
        <span>${question.maxLabel}</span>
    `;

        container.appendChild(wrapper);
        container.appendChild(labels);

        return container;
    }


    createDescription() {
        const container = document.createElement('div');
        container.className = 'description';
        return container;
    }


    createSeparator() {
        const container = document.createElement('div');
        container.className = 'separator';
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
            radio.required = false;
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
     * Create checkbox group element (option type)
     */
    createCheckboxGroup(question, index) {
        const wrapper = document.createElement('div');
        wrapper.className = 'option-question-wrapper';

        const container = document.createElement('div');
        container.className = 'options';
        container.id = `option_${index}`;

        question.options.forEach((option, optIndex) => {
            const optionDiv = document.createElement('div');
            optionDiv.className = 'option';

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.name = `question${index}`;
            checkbox.id = `${index}_checkbox_${optIndex}`;
            checkbox.value = option.value;
            checkbox.dataset.text = option.text;
            checkbox.dataset.questionIndex = index;

            const label = document.createElement('label');
            label.htmlFor = checkbox.id;
            label.textContent = option.text;

            optionDiv.appendChild(checkbox);
            optionDiv.appendChild(label);

            label.addEventListener('click', (e) => {
                if (e.target !== checkbox) {
                    checkbox.checked = !checkbox.checked;
                }
                this.updateCheckboxSelection(index, question.max_choices);
            });

            optionDiv.addEventListener('click', (e) => {
                if (e.target !== checkbox) {
                    checkbox.checked = !checkbox.checked;
                }
                this.updateCheckboxSelection(index, question.max_choices);
            });

            checkbox.addEventListener('change', () => {
                this.updateCheckboxSelection(index, question.max_choices);
            });

            container.appendChild(optionDiv);
        });

        wrapper.appendChild(container);

        // Add hint message
        const hint = document.createElement('div');
        hint.className = 'checkbox-hint';
        hint.id = `checkbox_hint_${index}`;
        hint.textContent = `Seleziona fino a ${question.max_choices} opzion${question.max_choices > 1 ? 'i' : 'e'}`;
        wrapper.appendChild(hint);

        // Store validation state
        wrapper.dataset.valid = 'false';
        wrapper.dataset.maxChoices = question.max_choices;

        return wrapper;
    }

    /**
     * Update checkbox selection and validation
     */
    updateCheckboxSelection(questionIndex, maxChoices) {
        const container = document.getElementById(`option_${questionIndex}`);
        const checkboxes = container.querySelectorAll('input[type="checkbox"]');
        const hint = document.getElementById(`checkbox_hint_${questionIndex}`);
        const wrapper = container.parentElement;

        let checkedCount = 0;
        checkboxes.forEach(cb => {
            if (cb.checked) checkedCount++;
        });

        // Update visual selection
        checkboxes.forEach(cb => {
            const optionDiv = cb.closest('.option');
            if (cb.checked) {
                optionDiv.classList.add('selected');
            } else {
                optionDiv.classList.remove('selected');
            }

            // Disable unchecked boxes if max reached
            if (checkedCount >= maxChoices && !cb.checked) {
                cb.disabled = true;
                optionDiv.classList.add('disabled');
            } else {
                cb.disabled = false;
                optionDiv.classList.remove('disabled');
            }
        });

        // Update hint message
        const remaining = maxChoices - checkedCount;
        if (checkedCount === 0) {
            hint.textContent = `Seleziona fino a ${maxChoices} opzion${maxChoices > 1 ? 'i' : 'e'}`;
            hint.style.color = '#666';
        } else if (checkedCount < maxChoices) {
            hint.textContent = `Puoi selezionare ancora ${remaining} opzion${remaining > 1 ? 'i' : 'e'}`;
            hint.style.color = '#667eea';
        } else {
            hint.textContent = `Perfetto! Hai selezionato ${maxChoices} opzion${maxChoices > 1 ? 'i' : 'e'}`;
            hint.style.color = '#10b981';
        }

        // Update validation state
        wrapper.dataset.valid = (checkedCount > 0 && checkedCount <= maxChoices).toString();
    }

    /**
     * Create resource allocation element
     */
    createResourceAllocation(question, index) {
        const container = document.createElement('div');
        container.className = 'allocation-question';
        container.id = `allocation_${index}`;

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
        // const errorMsg = document.createElement('div');
        // errorMsg.className = 'error-message';
        // errorMsg.id = `errorMessage_${index}`;
        //     errorMsg.innerHTML = `
        //     <svg class="error-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        //         <circle cx="12" cy="12" r="10" stroke-width="2"></circle>
        //         <line x1="12" y1="8" x2="12" y2="12" stroke-width="2"></line>
        //         <line x1="12" y1="16" x2="12.01" y2="16" stroke-width="2"></line>
        //     </svg>
        //     <span>Hai superato il limite di 100 punti. Riduci alcune allocazioni.</span>
        // `;
        //     container.appendChild(errorMsg);

        // Options container
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
                        step="5"
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
            const values = [];

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
            // const errorMsg = document.getElementById(`errorMessage_${questionIndex}`);
            const hint = document.getElementById(`submitHint_${questionIndex}`);

            remainingEl.textContent = remaining;
            allocatedEl.textContent = total;

            // Update colors
            remainingEl.className = 'remaining-value ';
            progressBar.className = 'progress-bar ';

            if (!isValid) {
                remainingEl.className += 'invalid';
                progressBar.className += 'invalid';
                // errorMsg.classList.add('show');
            } else if (remaining === 0) {
                remainingEl.className += 'valid';
                progressBar.className += 'valid';
                // errorMsg.classList.remove('show');
            } else {
                remainingEl.className += 'warning';
                progressBar.className += 'warning';
                // errorMsg.classList.remove('show');
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


    /**
     * Create a question element (UPDATED)
     */
    createQuestionElement(question, index) {
        const div = document.createElement('div');
        div.className = 'question';

        const text = document.createElement('div');
        text.className = 'question-text';
        text.textContent = `${question.text}`;
        div.appendChild(text);

        if (question.type === 'slider') {
            div.appendChild(this.createSlider(question, index));
        } else if (question.type === 'radio') {
            div.appendChild(this.createRadioGroup(question, index));
        } else if (question.type === 'option') {
            div.appendChild(this.createCheckboxGroup(question, index));
            text.textContent = `${question.text} ID: ${this.id}`
        } else if (question.type === 'allocation') {
            div.appendChild(this.createResourceAllocation(question, index));
        } else if (question.type === 'separator') {
            div.appendChild(this.createSeparator());
        } else if (question.type === 'description') {
            div.appendChild(this.createDescription());
        }

        return div;
    }

    /**
     * Collect answers from form (UPDATED)
     */
    collectAnswers() {
        const answers = [];

        this.quizData.questions.forEach((question, index) => {
            if (question.type === 'slider') {
                const slider = document.getElementById(question.id || `q${index}slider`);
                answers.push({
                    id: question.id,
                    type: 'slider',
                    value: slider.value,
                    text: slider.value,
                    attitude: question.attitude,
                });
            } else if (question.type === 'radio') {
                const selected = document.querySelector(`input[name="question${index}"]:checked`);
                if (selected) {
                    answers.push({
                        id: question.id,
                        type: 'radio',
                        value: selected.value,
                        text: selected.dataset.text
                    });
                }
            } else if (question.type === 'option') {
                const container = document.getElementById(`option_${index}`);
                const checkboxes = container.querySelectorAll('input[type="checkbox"]:checked');
                const selectedValues = [];
                const selectedTexts = [];

                checkboxes.forEach(cb => {
                    selectedValues.push(cb.value);
                    selectedTexts.push(cb.dataset.text);
                });

                answers.push({
                    id: question.id,
                    type: 'option',
                    value: selectedValues,
                    text: selectedTexts.join(', '),
                    options_number: question.options_number
                });
            } else if (question.type === 'allocation') {
                const sliderValues = [];
                question.options.forEach((option, optIndex) => {
                    const slider = document.getElementById(`slider_${index}_${optIndex}`);
                    sliderValues.push(parseInt(slider.value) || 0);
                });
                answers.push({
                    id: question.id,
                    type: 'allocation',
                    value: sliderValues,
                    options_number: question.options_number
                });
            }
        });

        return answers;
    }

    createInterviewerElement(quizData) {

        const dropdown = document.createElement('select');
        dropdown.className = 'interviewers';

        quizData.interviewers.forEach(((option, index) => {
            // Create a new <option> element
            const optionEl = document.createElement('option');

            // Set the value and text of the option
            optionEl.value = option.location + " - " + option.couple;
            optionEl.text = optionEl.value;
            optionEl.selected = (index === 17)

            // Add the option to the dropdown
            dropdown.appendChild(optionEl);
        }));

        return dropdown;
    }

    /**
     * Reset the form
     */
    reset() {
        this.elements.form.reset();
        document.getElementById("quizTitle").textContent = "Questionario Via Libera - " + generateId();

        document.querySelectorAll('.option').forEach(el => {
            el.classList.remove('selected');
            el.classList.remove('disabled');
        });

        // Reset checkboxes
        document.querySelectorAll('input[type="checkbox"]').forEach(cb => {
            cb.disabled = false;
        });

        this.quizData.questions.forEach((question, index) => {
            if (question.type === 'slider') {
                const slider = document.getElementById(question.id || `q${index}slider`);
                slider.value = question.defaultValue;
                const valueDisplay = slider.nextElementSibling;
                if (valueDisplay) {
                    valueDisplay.textContent = slider.value;
                }
            } else if (question.type === 'option') {
                const hint = document.getElementById(`checkbox_hint_${index}`);
                if (hint) {
                    hint.textContent = `Seleziona fino a ${question.max_choices} opzion${question.max_choices > 1 ? 'i' : 'e'}`;
                    hint.style.color = '#666';
                }
            }
        });
    }
}