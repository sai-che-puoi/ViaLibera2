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

        // Update loading message for audio upload
        this.updateLoadingMessage('Caricamento registrazione audio...', 'file-audio');

        // send audio file to google drive
        let fileUrl = "";
        if (audioData) {
            const filename = this.ui.id + ".webm";
            fileUrl = await this.api.writeAudioBlobToGoogleDrive(audioData, filename);
        }

        // Update loading message for form submission
        this.updateLoadingMessage('Invio dati questionario...', 'form');

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

        // Update loading message for final processing
        this.updateLoadingMessage('Elaborazione risultati...', 'chart');

        // Calculate coordinates using the new algorithm
        const coordinates = this.calculator.calculateCoordinates(answers);

        // Small delay to show the final loading message
        await new Promise(resolve => setTimeout(resolve, 800));

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
     * Update loading message with dynamic content and icon
     */
    updateLoadingMessage(message, iconType) {
        const loadingSection = this.sections.loading;
        let messageElement = loadingSection.querySelector('.loading-message');
        let iconElement = loadingSection.querySelector('.loading-icon');
        
        // Create message element if it doesn't exist
        if (!messageElement) {
            messageElement = document.createElement('p');
            messageElement.className = 'loading-message';
            loadingSection.appendChild(messageElement);
        }
        
        // Create icon element if it doesn't exist
        if (!iconElement) {
            iconElement = document.createElement('div');
            iconElement.className = 'loading-icon';
            // Insert after spinner, before message
            const spinner = loadingSection.querySelector('.spinner');
            spinner.parentNode.insertBefore(iconElement, spinner.nextSibling);
        }
        
        messageElement.textContent = message;
        
        // Icon mappings
        const icons = {
            'file-audio': `<svg width="20" height="20" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" fill="none">
                <path d="M9 18V5l12-2v13M9 18c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2zM21 16c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2z"/>
            </svg>`,
            'form': `<svg width="20" height="20" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" fill="none">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14,2 14,8 20,8"/><line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/><polyline points="10,9 9,9 8,9"/>
            </svg>`,
            'chart': `<svg width="20" height="20" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" fill="none">
                <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/>
                <line x1="6" y1="20" x2="6" y2="14"/>
            </svg>`
        };
        
        if (icons[iconType]) {
            iconElement.innerHTML = icons[iconType];
            iconElement.style.display = 'block';
        } else {
            iconElement.style.display = 'none';
        }
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