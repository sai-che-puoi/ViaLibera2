import { CONFIG, QUIZ_DATA } from './config.js';
import { QuizController } from './QuizController.js';

document.addEventListener('DOMContentLoaded', () => {
    const app = new QuizController(CONFIG, QUIZ_DATA);
    app.init();
});