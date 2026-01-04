import { CONFIG, QUIZ_DATA } from './config.js';
import { QuizController } from './QuizController.js';
import {interviewers} from "./interviewers.js";
import { ResultUI } from './ResultUI.js';

document.addEventListener('DOMContentLoaded', () => {
    const app = new QuizController(CONFIG, QUIZ_DATA, interviewers);
    app.init();
});