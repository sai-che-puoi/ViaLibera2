import { QuizUI } from './QuizUI.js';
import {ResultCalculator} from "./ResultCalculator.js";
import {GoogleSheetsAPI} from "./GoogleSheetsAPI.js";

export class QuizController {
    constructor(config, quizData, interviewers) {
        this.quizData = quizData;

        this.ui = new QuizUI(document.body, quizData, interviewers);
        this.calculator = new ResultCalculator(quizData.questions);
        this.api = new GoogleSheetsAPI(config);

        this.sections = {
            form: document.getElementById('formSection'),
            loading: document.getElementById('loadingSection'),
            result: document.getElementById('resultSection')
        };
    }

    /**
     * Initialize the application
     */
    init() {
        this.ui.init();
        this.attachEventListeners();
    }

    /**
     * Attach event listeners
     */
    attachEventListeners() {
        this.ui.elements.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSubmit();
        });

        // Make restart function available globally
        window.restartQuiz = () => this.restart();
    }

    /**
     * Handle form submission
     */
    async handleSubmit() {
        const answers = this.ui.collectAnswers();
        const result = this.calculator.calculate(answers);

        // Show loading
        this.showSection('loading');
        let interviewerInput = document.getElementById("interviewers").querySelector('.interviewer-input');

        // Prepare submission data
        const submissionData = {
            timestamp: result.timestamp,
            id:  this.ui.id,
            userAgent: navigator.userAgent,
            // result: result.category.name,
            interviewer: interviewerInput.value,
            // x: result.coordinates.x,
            // y: result.coordinates.y,
            ...result.answers,
        };

        // Send to API
        await this.api.send(submissionData);
        
        // Display result briefly
        this.displayResult(result);
        
        // After successful submission, immediately restart the quiz
        this.restart();
    }

    /**
     * Display result to user
     */
    displayResult(result) {
        document.getElementById('resultTitle').textContent = "title";
        document.getElementById('resultDescription').textContent = "desrciption";

        // this.plane.update(result.coordinates.x, result.coordinates.y);

        this.showSection('result');
    }

    /**
     * Show a specific section
     */
    showSection(section) {
        this.sections.form.classList.toggle('hidden', section !== 'form');
        this.sections.loading.classList.toggle('show', section === 'loading');
        // this.sections.result.classList.toggle('show', section === 'result');
    }

    /**
     * Restart the quiz
     */
    restart() {
        // location.reload();
        this.ui.reset();
        this.showSection('form');
    }
}