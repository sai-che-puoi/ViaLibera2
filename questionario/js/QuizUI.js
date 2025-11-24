import {generateId} from "./config.js";

export class QuizUI {
    constructor(container, quizData, interviewers) {
        this.container = container;
        this.interviewers = interviewers;
        this.quizData = quizData;
        this.elements = {};
        this.id = generateId();
    }

    /**
     * Initialize the quiz UI
     */
    init() {
        const interviewEl = this.createInterviewerElement(this.quizData, this.interviewers);
        const container = document.getElementById('interviewers');
        container.appendChild(interviewEl);
        this.elements.interviewers = interviewEl;

        this.elements.title = document.getElementById('quizTitle');
        this.elements.questionsContainer = document.getElementById('questionsContainer');
        this.elements.form = document.getElementById('quizForm');

        this.elements.title.textContent = this.quizData.title;

        this.renderQuiz();
        
        // Initially hide form until interviewer is selected
        this.selectedInterviewer = null;
        this.toggleFormVisibility();
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
     * Create sorting question element
     */
    createSorting(question, index) {
        const container = document.createElement('div');
        container.className = 'sorting-wrapper';
        container.id = `sorting_${index}`;

        const sortingContainer = document.createElement('div');
        sortingContainer.className = 'sorting-container';

        // Create a dropdown for each position
        question.options.forEach((_, posIndex) => {
            const positionDiv = document.createElement('div');
            positionDiv.className = 'sorting-position';

            const label = document.createElement('label');
            label.className = 'sorting-label';
            label.textContent = `${posIndex + 1}º posto`;
            label.htmlFor = `sorting_${index}_${posIndex}`;

            const select = document.createElement('select');
            select.className = 'sorting-select';
            select.id = `sorting_${index}_${posIndex}`;
            select.name = `sorting_${index}_${posIndex}`;
            select.dataset.questionIndex = index;
            select.dataset.position = posIndex;

            // Add default empty option
            const defaultOption = document.createElement('option');
            defaultOption.value = '';
            defaultOption.textContent = 'Seleziona...';
            select.appendChild(defaultOption);

            // Add all options
            question.options.forEach((option, optIndex) => {
                const optionEl = document.createElement('option');
                optionEl.value = option;
                optionEl.textContent = option;
                optionEl.dataset.optionIndex = optIndex;
                select.appendChild(optionEl);
            });

            // Add change listener
            select.addEventListener('change', () => {
                this.updateSortingOptions(index, question.options.length);
            });

            positionDiv.appendChild(label);
            positionDiv.appendChild(select);
            sortingContainer.appendChild(positionDiv);
        });

        container.appendChild(sortingContainer);

        // Add reset button and hint container
        const bottomContainer = document.createElement('div');
        bottomContainer.className = 'sorting-bottom';

        const resetBtn = document.createElement('button');
        resetBtn.type = 'button';
        resetBtn.className = 'sorting-reset-btn';
        resetBtn.id = `sorting_reset_${index}`;
        resetBtn.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path>
                <path d="M21 3v5h-5"></path>
                <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path>
                <path d="M3 21v-5h5"></path>
            </svg>
            Ricomincia
        `;
        resetBtn.addEventListener('click', () => {
            this.resetSorting(index, question.options.length);
        });

        const hint = document.createElement('div');
        hint.className = 'sorting-hint';
        hint.id = `sorting_hint_${index}`;
        hint.textContent = `Ordina tutte le ${question.options.length} opzioni`;

        bottomContainer.appendChild(resetBtn);
        bottomContainer.appendChild(hint);
        container.appendChild(bottomContainer);

        // Store validation state
        container.dataset.valid = 'false';

        return container;
    }

    /**
     * Update sorting dropdown options
     */
    updateSortingOptions(questionIndex, optionsCount) {
        const container = document.getElementById(`sorting_${questionIndex}`);
        const selects = container.querySelectorAll('.sorting-select');
        const hint = document.getElementById(`sorting_hint_${questionIndex}`);

        // Collect all selected values
        const selectedValues = new Set();
        selects.forEach(select => {
            if (select.value) {
                selectedValues.add(select.value);
            }
        });

        // Update each dropdown
        selects.forEach(select => {
            const currentValue = select.value;
            const options = select.querySelectorAll('option');

            options.forEach(option => {
                if (option.value === '') return; // Skip the default option

                // If this option is selected in another dropdown, disable it UNLESS it's the current dropdown's value
                if (selectedValues.has(option.value) && option.value !== currentValue) {
                    option.disabled = true;
                    option.classList.add('disabled-option');
                } else {
                    option.disabled = false;
                    option.classList.remove('disabled-option');
                }
            });

            // Update visual state
            if (select.value) {
                select.classList.add('selected');
            } else {
                select.classList.remove('selected');
            }
        });

        // Update hint
        const filledCount = selectedValues.size;
        const remaining = optionsCount - filledCount;

        if (filledCount === 0) {
            hint.textContent = `Ordina tutte le ${optionsCount} opzioni`;
            hint.style.color = '#666';
        } else if (filledCount < optionsCount) {
            hint.textContent = `Ancora ${remaining} opzion${remaining > 1 ? 'i' : 'e'} da ordinare`;
            hint.style.color = '#667eea';
        } else {
            hint.textContent = `Perfetto! Tutte le opzioni ordinate`;
            hint.style.color = '#10b981';
        }

        // Update validation state
        container.dataset.valid = (filledCount === optionsCount).toString();
    }

    /**
     * Reset sorting question
     */
    resetSorting(questionIndex, optionsCount) {
        const container = document.getElementById(`sorting_${questionIndex}`);
        const selects = container.querySelectorAll('.sorting-select');
        const hint = document.getElementById(`sorting_hint_${questionIndex}`);

        // Reset all selects to default
        selects.forEach(select => {
            select.value = '';
            select.classList.remove('selected');

            // Re-enable all options
            const options = select.querySelectorAll('option');
            options.forEach(option => {
                option.disabled = false;
                option.classList.remove('disabled-option');
            });
        });

        // Reset hint
        hint.textContent = `Ordina tutte le ${optionsCount} opzioni`;
        hint.style.color = '#666';

        // Reset validation
        container.dataset.valid = 'false';
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
        valueDisplay.style.display = 'none'; // Hide the original value display

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
        <span class="slider-value-center">${slider.value}</span>
        <span>${question.maxLabel}</span>
    `;

        // Update the value display function to also update the center value
        const centerValueSpan = labels.querySelector('.slider-value-center');
        slider.addEventListener('input', () => {
            valueDisplay.textContent = slider.value;
            centerValueSpan.textContent = slider.value;
        });

        container.appendChild(wrapper);
        container.appendChild(labels);

        return container;
    }

    createDescription() {
        const container = document.createElement('div');
        container.className = 'description';
        return container;
    }

    createInputWithAlt(question, index) {
        const container = document.createElement('div');
        container.className = 'input-wrapper';

        const radioContainer = document.createElement('div');
        radioContainer.className = 'input-radio-options';

        const option1 = document.createElement('div');
        option1.className = 'option input-option';

        const radio1 = document.createElement('input');
        radio1.type = 'radio';
        radio1.name = `input_radio_${index}`;
        radio1.id = `${question.id}_input_enable`;
        radio1.value = 'enable_input';
        radio1.checked = true;

        const label1 = document.createElement('label');
        label1.htmlFor = radio1.id;
        label1.textContent = 'Inserisci risposta';

        const inputWrapper = document.createElement('div');
        inputWrapper.className = 'text-input-wrapper';

        const input = document.createElement('input');
        input.type = 'number';
        input.className = 'text-input';
        input.inputMode = 'numeric';
        input.id = question.id || `input_${index}`;
        input.name = `question${index}`;

        input.addEventListener('click', () => {
            radio1.checked = true;
            option1.classList.add('selected');
            option2.classList.remove('selected');
            input.disabled = false;
        });

        input.addEventListener('focus', () => {
            radio1.checked = true;
            option1.classList.add('selected');
            option2.classList.remove('selected');
            input.disabled = false;
        });

        option1.appendChild(radio1);
        option1.appendChild(input);

        const option2 = document.createElement('div');
        option2.className = 'option input-option';

        const radio2 = document.createElement('input');
        radio2.type = 'radio';
        radio2.name = `input_radio_${index}`;
        radio2.id = `${question.id}_input_alt`;
        radio2.value = 'alternative';

        const label2 = document.createElement('label');
        label2.htmlFor = radio2.id;
        label2.textContent = question.alt || 'Preferisco non rispondere';

        option2.appendChild(radio2);
        option2.appendChild(label2);

        radioContainer.appendChild(option1);
        radioContainer.appendChild(option2);

        option1.addEventListener('click', () => {
            radio1.checked = true;
            option1.classList.add('selected');
            option2.classList.remove('selected');
            input.disabled = false;
            input.focus();
            inputWrapper.classList.remove('disabled');
        });

        option2.addEventListener('click', () => {
            radio2.checked = true;
            option2.classList.add('selected');
            option1.classList.remove('selected');
            input.disabled = true;
            input.value = '';
            inputWrapper.classList.add('disabled');
        });

        option1.classList.add('selected');

        container.appendChild(radioContainer);
        container.appendChild(inputWrapper);

        return container;
    }

    createRecording(question, index) {
        const container = document.createElement('div');
        container.className = 'recording-wrapper';
        container.id = `recording_${index}`;

        const controls = document.createElement('div');
        controls.className = 'recording-controls';

        const startBtn = document.createElement('button');
        startBtn.type = 'button';
        startBtn.className = 'recording-btn start-btn';
        startBtn.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <circle cx="12" cy="12" r="3" fill="currentColor"></circle>
        </svg>
        <span>Inizia Registrazione</span>
    `;

        const stopBtn = document.createElement('button');
        stopBtn.type = 'button';
        stopBtn.className = 'recording-btn stop-btn';
        stopBtn.style.display = 'none';
        stopBtn.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <rect x="6" y="6" width="12" height="12" fill="currentColor"></rect>
        </svg>
        <span>Termina Registrazione</span>
    `;

        const status = document.createElement('div');
        status.className = 'recording-status';
        status.innerHTML = `
        <div class="status-indicator"></div>
        <span class="status-text">Pronto per registrare</span>
        <span class="status-time">00:00</span>
    `;

        controls.appendChild(startBtn);
        controls.appendChild(stopBtn);
        container.appendChild(controls);
        container.appendChild(status);

        let mediaRecorder = null;
        let audioChunks = [];
        let recordingStartTime = null;
        let timerInterval = null;

        startBtn.addEventListener('click', async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({audio: true});
                mediaRecorder = new MediaRecorder(stream);
                audioChunks = [];

                mediaRecorder.ondataavailable = (event) => {
                    audioChunks.push(event.data);
                };

                mediaRecorder.onstop = () => {
                    const audioBlob = new Blob(audioChunks, {type: 'audio/webm'});
                    if (!this.recordings) this.recordings = {};
                    this.recordings[question.id || `recording_${index}`] = audioBlob;

                    const statusText = status.querySelector('.status-text');
                    statusText.textContent = 'Registrazione salvata';
                    status.classList.remove('recording');
                    status.classList.add('saved');

                    stream.getTracks().forEach(track => track.stop());
                };

                mediaRecorder.start();
                recordingStartTime = Date.now();

                startBtn.style.display = 'none';
                stopBtn.style.display = 'flex';
                status.classList.add('recording');
                status.querySelector('.status-text').textContent = 'Registrazione in corso...';

                timerInterval = setInterval(() => {
                    const elapsed = Math.floor((Date.now() - recordingStartTime) / 1000);
                    const minutes = Math.floor(elapsed / 60).toString().padStart(2, '0');
                    const seconds = (elapsed % 60).toString().padStart(2, '0');
                    status.querySelector('.status-time').textContent = `${minutes}:${seconds}`;
                }, 1000);

            } catch (error) {
                console.error('Error accessing microphone:', error);
                status.querySelector('.status-text').textContent = 'Errore: microfono non disponibile';
                status.classList.add('error');
            }
        });

        stopBtn.addEventListener('click', () => {
            if (mediaRecorder && mediaRecorder.state === 'recording') {
                mediaRecorder.stop();
                clearInterval(timerInterval);

                startBtn.style.display = 'flex';
                stopBtn.style.display = 'none';
            }
        });

        return container;
    }

    createSeparator() {
        const container = document.createElement('div');
        container.className = 'separator';
        return container;
    }

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

        const hint = document.createElement('div');
        hint.className = 'checkbox-hint';
        hint.id = `checkbox_hint_${index}`;
        hint.textContent = `Seleziona fino a ${question.max_choices} opzion${question.max_choices > 1 ? 'i' : 'e'}`;
        wrapper.appendChild(hint);

        wrapper.dataset.valid = 'false';
        wrapper.dataset.maxChoices = question.max_choices;

        return wrapper;
    }

    updateCheckboxSelection(questionIndex, maxChoices) {
        const container = document.getElementById(`option_${questionIndex}`);
        const checkboxes = container.querySelectorAll('input[type="checkbox"]');
        const hint = document.getElementById(`checkbox_hint_${questionIndex}`);
        const wrapper = container.parentElement;

        let checkedCount = 0;
        checkboxes.forEach(cb => {
            if (cb.checked) checkedCount++;
        });

        checkboxes.forEach(cb => {
            const optionDiv = cb.closest('.option');
            if (cb.checked) {
                optionDiv.classList.add('selected');
            } else {
                optionDiv.classList.remove('selected');
            }

            if (checkedCount >= maxChoices && !cb.checked) {
                cb.disabled = true;
                optionDiv.classList.add('disabled');
            } else {
                cb.disabled = false;
                optionDiv.classList.remove('disabled');
            }
        });

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

        wrapper.dataset.valid = (checkedCount > 0 && checkedCount <= maxChoices).toString();
    }

    createResourceAllocation(question, index) {
        const container = document.createElement('div');
        container.className = 'allocation-question';
        container.id = `allocation_${index}`;

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

        const hint = document.createElement('div');
        hint.className = 'submit-hint';
        hint.id = `submitHint_${index}`;
        hint.textContent = 'Distribuisci tutti i 100 punti per continuare';
        container.appendChild(hint);

        setTimeout(() => {
            this.initAllocationListeners(index, question.options.length);
        }, 0);

        return container;
    }

    initAllocationListeners(questionIndex, optionsCount) {
        const updateAllocation = () => {
            let total = 0;
            const values = [];

            for (let i = 0; i < optionsCount; i++) {
                const slider = document.getElementById(`slider_${questionIndex}_${i}`);
                const value = parseInt(slider.value) || 0;
                values.push(value);
                total += value;
            }

            const remaining = 100 - total;
            const isValid = remaining >= 0;

            const remainingEl = document.getElementById(`remainingValue_${questionIndex}`);
            const progressBar = document.getElementById(`progressBar_${questionIndex}`);
            const allocatedEl = document.getElementById(`allocatedValue_${questionIndex}`);
            const hint = document.getElementById(`submitHint_${questionIndex}`);

            remainingEl.textContent = remaining;
            allocatedEl.textContent = total;

            remainingEl.className = 'remaining-value ';
            progressBar.className = 'progress-bar ';

            if (!isValid) {
                remainingEl.className += 'invalid';
                progressBar.className += 'invalid';
            } else if (remaining === 0) {
                remainingEl.className += 'valid';
                progressBar.className += 'valid';
            } else {
                remainingEl.className += 'warning';
                progressBar.className += 'warning';
            }

            const percentage = Math.min(total, 100);
            progressBar.style.width = `${percentage}%`;

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

            const container = document.getElementById(`allocation_${questionIndex}`);
            container.dataset.valid = (isValid && remaining === 0).toString();
        };

        for (let i = 0; i < optionsCount; i++) {
            const slider = document.getElementById(`slider_${questionIndex}_${i}`);
            const numberInput = document.getElementById(`number_${questionIndex}_${i}`);
            const valueDisplay = document.getElementById(`value_${questionIndex}_${i}`);

            slider.addEventListener('input', (e) => {
                const value = e.target.value;
                numberInput.value = value;
                valueDisplay.textContent = value;

                const percentage = (value / 100) * 100;
                slider.style.background = `linear-gradient(to right, #667eea ${percentage}%, #e5e7eb ${percentage}%)`;

                updateAllocation();
            });

            numberInput.addEventListener('input', (e) => {
                let value = parseInt(e.target.value) || 0;
                value = Math.max(0, Math.min(100, value));

                slider.value = value;
                valueDisplay.textContent = value;

                const percentage = (value / 100) * 100;
                slider.style.background = `linear-gradient(to right, #667eea ${percentage}%, #e5e7eb ${percentage}%)`;

                updateAllocation();
            });
        }

        updateAllocation();
    }

    createQuestionElement(question, index) {
        const div = document.createElement('div');
        div.className = 'question';

        const text = document.createElement('div');
        text.className = 'question-text';

        // Handle description type with array of text
        if ((question.type === 'description' || question.type === 'sorting') && Array.isArray(question.text)) {
            text.innerHTML = question.text.join('<br><br>');
        } else {
            text.textContent = `${question.text}`;
        }

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
        } else if (question.type === 'sorting') {
            div.appendChild(this.createSorting(question, index));
        } else if (question.type === 'separator') {
            div.appendChild(this.createSeparator());
        } else if (question.type === 'description') {
            div.appendChild(this.createDescription());
        } else if (question.type === 'input') {
            div.appendChild(this.createInputWithAlt(question, index));
        } else if (question.type === 'recording') {
            div.appendChild(this.createRecording(question, index));
        }

        return div;
    }

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
            } else if (question.type === 'sorting') {
                const sortedValues = [];
                question.options.forEach((_, posIndex) => {
                    const select = document.getElementById(`sorting_${index}_${posIndex}`);
                    sortedValues.push(select.value);
                });
                answers.push({
                    id: question.id,
                    type: 'sorting',
                    value: sortedValues,
                    text: sortedValues.join(' > '),
                    options_number: question.options.length
                });
            } else if (question.type === 'input') {
                const radio1 = document.getElementById(`${question.id}_input_enable`);
                const radio2 = document.getElementById(`${question.id}_input_alt`);
                const input = document.getElementById(question.id || `input_${index}`);

                if (radio2 && radio2.checked) {
                    answers.push({
                        id: question.id,
                        type: 'input',
                        value: 'alternative',
                        text: question.alt || 'Preferisco non rispondere'
                    });
                } else if (input && input.value) {
                    answers.push({
                        id: question.id,
                        type: 'input',
                        value: input.value,
                        text: input.value
                    });
                }
            } else if (question.type === 'recording') {
                const recordingId = question.id || `recording_${index}`;
                if (this.recordings && this.recordings[recordingId]) {
                    answers.push({
                        id: question.id,
                        type: 'recording',
                        value: 'audio_recorded',
                        text: 'Audio recording available'
                    });
                }
            }
        });

        return answers;
    }

    async uploadRecordings(googleScriptUrl, formData) {
        if (!this.recordings || Object.keys(this.recordings).length === 0) {
            return {success: true, message: 'No recordings to upload'};
        }

        const uploadPromises = [];

        for (const [recordingId, audioBlob] of Object.entries(this.recordings)) {
            const reader = new FileReader();
            const base64Promise = new Promise((resolve, reject) => {
                reader.onloadend = () => {
                    const base64data = reader.result.split(',')[1];
                    resolve({recordingId, base64data});
                };
                reader.onerror = reject;
                reader.readAsDataURL(audioBlob);
            });

            uploadPromises.push(base64Promise);
        }

        try {
            const recordings = await Promise.all(uploadPromises);

            const response = await fetch(googleScriptUrl, {
                method: 'POST',
                mode: 'no-cors',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    type: 'audio_upload',
                    formId: formData.id || this.id,
                    interviewer: formData.interviewer,
                    recordings: recordings
                })
            });

            return {success: true, message: 'Recordings uploaded successfully'};
        } catch (error) {
            console.error('Error uploading recordings:', error);
            return {success: false, message: 'Error uploading recordings', error};
        }
    }

    createInterviewerElement(quizData, interviewers) {
        const container = document.createElement('div');
        container.className = 'interviewer-container';
        
        const wrapper = document.createElement('div');
        wrapper.className = 'dropdown-wrapper';
        
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'interviewer-input';
        input.placeholder = 'Seleziona o digita per filtrare intervistatore...';
        input.autocomplete = 'off';
        
        const dropdownList = document.createElement('div');
        dropdownList.className = 'dropdown-list';
        dropdownList.style.display = 'none';
        
        // Store original interviewers data
        this.interviewersData = interviewers;
        this.selectedInterviewer = null;
        
        // Create dropdown options
        this.updateDropdownList(dropdownList, interviewers, input);
        
        // Add event listeners
        input.addEventListener('keydown', (e) => {
            // Prevent form submission when pressing Enter in the dropdown
            if (e.key === 'Enter') {
                e.preventDefault();
                // If there's exactly one option visible, select it
                const visibleOptions = dropdownList.querySelectorAll('.dropdown-option');
                if (visibleOptions.length === 1) {
                    const value = visibleOptions[0].dataset.value;
                    input.value = value;
                    this.selectedInterviewer = value;
                    dropdownList.style.display = 'none';
                    this.toggleFormVisibility();
                }
            }
        });
        
        input.addEventListener('input', () => {
            const filter = input.value.toLowerCase();
            const filtered = interviewers.filter(interviewer => 
                (interviewer.location + ' - ' + interviewer.couple).toLowerCase().includes(filter)
            );
            this.updateDropdownList(dropdownList, filtered, input);
            dropdownList.style.display = filtered.length > 0 ? 'block' : 'none';
            // Clear selection if input doesn't match exactly
            const exactMatch = filtered.find(interviewer => 
                (interviewer.location + ' - ' + interviewer.couple).toLowerCase() === filter
            );
            if (!exactMatch) {
                this.selectedInterviewer = null;
                this.toggleFormVisibility();
            }
        });
        
        input.addEventListener('focus', () => {
            const filter = input.value.toLowerCase();
            const filtered = interviewers.filter(interviewer => 
                (interviewer.location + ' - ' + interviewer.couple).toLowerCase().includes(filter)
            );
            this.updateDropdownList(dropdownList, filtered, input);
            dropdownList.style.display = filtered.length > 0 ? 'block' : 'none';
        });
        
        // Hide dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!wrapper.contains(e.target)) {
                dropdownList.style.display = 'none';
            }
        });
        
        wrapper.appendChild(input);
        wrapper.appendChild(dropdownList);
        container.appendChild(wrapper);
        
        // Don't set default selection - let user choose
        this.selectedInterviewer = null;
        
        return container;
    }
    
    updateDropdownList(dropdownList, interviewers, input) {
        dropdownList.innerHTML = '';
        
        interviewers.forEach(interviewer => {
            const option = document.createElement('div');
            option.className = 'dropdown-option';
            const value = interviewer.location + ' - ' + interviewer.couple;
            option.textContent = value;
            option.dataset.value = value;
            
            option.addEventListener('click', () => {
                input.value = value;
                this.selectedInterviewer = value;
                dropdownList.style.display = 'none';
                this.toggleFormVisibility();
            });
            
            dropdownList.appendChild(option);
        });
    }
    
    toggleFormVisibility() {
        const questionsContainer = document.getElementById('questionsContainer');
        const submitBtn = document.getElementById('submitBtn');
        
        if (this.selectedInterviewer) {
            questionsContainer.classList.add('visible');
            submitBtn.classList.add('visible');
        } else {
            questionsContainer.classList.remove('visible');
            submitBtn.classList.remove('visible');
        }
    }

    reset() {
        // Store current interviewer selection
        const currentInterviewer = this.selectedInterviewer;
        
        this.elements.form.reset();
        
        // Generate new ID but keep the interviewer selection
        this.id = generateId();
        document.getElementById("quizTitle").textContent = this.quizData.title;

        document.querySelectorAll('.option').forEach(el => {
            el.classList.remove('selected');
            el.classList.remove('disabled');
        });

        document.querySelectorAll('input[type="checkbox"]').forEach(cb => {
            cb.disabled = false;
        });

        this.quizData.questions.forEach((question, index) => {
            if (question.type === 'slider') {
                const slider = document.getElementById(question.id || `q${index}slider`);
                if (slider) {
                    slider.value = question.defaultValue;
                    const valueDisplay = slider.nextElementSibling;
                    if (valueDisplay) {
                        valueDisplay.textContent = slider.value;
                    }
                    // Also reset the center value display in labels
                    const centerValueSpan = slider.closest('.question-slider-container').querySelector('.slider-value-center');
                    if (centerValueSpan) {
                        centerValueSpan.textContent = question.defaultValue;
                    }
                }
            } else if (question.type === 'option') {
                const hint = document.getElementById(`checkbox_hint_${index}`);
                if (hint) {
                    hint.textContent = `Seleziona fino a ${question.max_choices} opzion${question.max_choices > 1 ? 'i' : 'e'}`;
                    hint.style.color = '#666';
                }
            } else if (question.type === 'sorting') {
                const hint = document.getElementById(`sorting_hint_${index}`);
                if (hint) {
                    hint.textContent = `Ordina tutte le ${question.options.length} opzioni`;
                    hint.style.color = '#666';
                }
            }
        });
        
        // Restore interviewer selection and keep form visible
        if (currentInterviewer) {
            const interviewerInput = document.querySelector('.interviewer-input');
            if (interviewerInput) {
                interviewerInput.value = currentInterviewer;
                this.selectedInterviewer = currentInterviewer;
            }
        }
        
        // Ensure form remains visible with interviewer selected
        this.toggleFormVisibility();
    }
}