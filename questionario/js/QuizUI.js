
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
     * Create a question element
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
        }

        return div;
    }

    /**
     * Create slider element
     */
    createSlider(question, index) {
        const container = document.createElement('div');
        container.className = 'slider-container';

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
     * Collect answers from form
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
            }
        });

        return answers;
    }

    /**
     * Reset the form
     */
    reset() {
        this.elements.form.reset();

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