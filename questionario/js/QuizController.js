import { QuizUI } from './QuizUI.js';
import { ResultCalculator } from "./ResultCalculator.js";
import { GoogleAPI } from "./GoogleAPI.js";
import { ResultUI } from "./ResultUI.js";

export class QuizController {
    constructor(config, quizData, interviewers) {
        this.quizData = quizData;

        this.ui = new QuizUI(document.body, quizData, interviewers);
        this.calculator = new ResultCalculator(quizData.questions);
        this.api = new GoogleAPI(config);
        this.resultUI = new ResultUI(this.api);

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
        this.resultUI.init();
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
        const audioData = this.ui.getRecording();

        const result = this.calculator.calculate(answers);

        // Show loading
        this.showSection('loading');
        let interviewerInput = document.getElementById("interviewers").querySelector('.interviewer-input');

        // send audio file to google drive
        let fileUrl = "";
        if (audioData) {
            const filename = this.ui.id + ".webm";
            fileUrl = await this.api.writeAudioBlobToGoogleDrive(audioData, filename);
        }

        // Prepare submission data
        const submissionData = {
            timestamp: result.timestamp,
            id: this.ui.id,
            userAgent: navigator.userAgent,
            interviewer: interviewerInput.value,
            audioFileUrl: fileUrl,
            ...result.answers,
        };

        await this.api.sendFormToSheet(submissionData);

        // Calculate coordinates using the new algorithm
        const coordinates = this.calculator.calculateCoordinates(answers);

        // Show result with cartesian plane
        this.displayResult(result, coordinates);
    }


    /**
     * Display result to user
     */
    displayResult(result, coordinates) {
        document.getElementById('resultTitle').textContent = "Il tuo risultato";
        document.getElementById('resultDescription').textContent = "Ecco la tua posizione e il tuo profilo basati sulle risposte fornite";

        // Pass archetype to ResultUI for display
        if (result.archetype) {
            this.resultUI.setArchetype(result.archetype);
        } else {
            console.log('No archetype found in result:', result);
        }

        // Update the cartesian plane with coordinates
        this.resultUI.updatePlane(coordinates.x, coordinates.y);

        // Store current submission ID for the audio recording
        this.resultUI.setSubmissionId(this.ui.id + "_followup");
        this.resultUI.setOriginalId(this.ui.id);

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
        this.ui.reset();
        this.resultUI.reset();
        this.showSection('form');
    }
}