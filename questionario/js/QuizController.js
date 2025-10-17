import { QuizUI } from './QuizUI.js';
import {ResultCalculator} from "./ResultCalculator.js";
import {CartesianPlane} from "./CartesianPlane.js";
import {GoogleSheetsAPI} from "./GoogleSheetsAPI.js";

export class QuizController {
    constructor(config, quizData) {
        this.quizData = quizData;

        this.ui = new QuizUI(document.body, quizData);
        this.calculator = new ResultCalculator(quizData.questions);
        this.plane = new CartesianPlane(
            document.querySelector('#cartesianPlane svg'),
            config.coordinates
        );
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
        let interviewer = document.getElementById("interviewers").querySelector('select')

        // Prepare submission data
        const submissionData = {
            timestamp: result.timestamp,
            id:  this.ui.id,
            userAgent: navigator.userAgent,
            result: result.category.name,
            interviewer: interviewer.value,
            x: result.coordinates.x,
            y: result.coordinates.y,
            ...result.answers,
        };

        // Display result
        this.displayResult(result);

        // Send to API
        await this.api.send(submissionData);
    }

    /**
     * Display result to user
     */
    displayResult(result) {
        document.getElementById('resultTitle').textContent = result.category.name;
        document.getElementById('resultDescription').textContent = result.category.description;

        this.plane.update(result.coordinates.x, result.coordinates.y);

        this.showSection('result');
    }

    /**
     * Show a specific section
     */
    showSection(section) {
        this.sections.form.classList.toggle('hidden', section !== 'form');
        this.sections.loading.classList.toggle('show', section === 'loading');
        this.sections.result.classList.toggle('show', section === 'result');
    }

    /**
     * Restart the quiz
     */
    restart() {
        location.reload();
    }
}