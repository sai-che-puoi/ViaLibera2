import { QuizController } from './QuizController.js';

export class ResultUI {
    constructor(api) {
        this.api = api;
        this.recording = null;
        this.submissionId = null;
        this.originalId = null;
        this.elements = {};
    }

    /**
     * Initialize the result UI
     */
    init() {
        const resultSection = document.getElementById('resultSection');

        // Create cartesian plane container
        const planeContainer = document.createElement('div');
        planeContainer.id = 'cartesianPlane';
        planeContainer.className = 'cartesian-plane-container';

        // Create SVG for the cartesian plane
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', '500');
        svg.setAttribute('height', '500');
        svg.setAttribute('viewBox', '-130 -130 260 260');
        svg.id = 'planeSvg';

        // Add axes
        // X-axis
        const xAxis = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        xAxis.setAttribute('x1', '-100');
        xAxis.setAttribute('y1', '0');
        xAxis.setAttribute('x2', '100');
        xAxis.setAttribute('y2', '0');
        xAxis.setAttribute('stroke', '#666');
        xAxis.setAttribute('stroke-width', '0.5');
        svg.appendChild(xAxis);

        // Y-axis
        const yAxis = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        yAxis.setAttribute('x1', '0');
        yAxis.setAttribute('y1', '-100');
        yAxis.setAttribute('x2', '0');
        yAxis.setAttribute('y2', '100');
        yAxis.setAttribute('stroke', '#666');
        yAxis.setAttribute('stroke-width', '0.5');
        svg.appendChild(yAxis);

        // Add axis labels
        // X-axis labels (Quartiere tranquillo/ordinato <-> Quartiere vivace)
        const xLabelLeft1 = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        xLabelLeft1.setAttribute('x', '-95');
        xLabelLeft1.setAttribute('y', '15');
        xLabelLeft1.setAttribute('font-size', '6');
        xLabelLeft1.setAttribute('fill', '#666');
        xLabelLeft1.textContent = 'Quartiere tranquillo/';
        svg.appendChild(xLabelLeft1);
        
        const xLabelLeft2 = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        xLabelLeft2.setAttribute('x', '-95');
        xLabelLeft2.setAttribute('y', '25');
        xLabelLeft2.setAttribute('font-size', '6');
        xLabelLeft2.setAttribute('fill', '#666');
        xLabelLeft2.textContent = 'ordinato';
        svg.appendChild(xLabelLeft2);

        const xLabelRight = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        xLabelRight.setAttribute('x', '50');
        xLabelRight.setAttribute('y', '15');
        xLabelRight.setAttribute('font-size', '6');
        xLabelRight.setAttribute('fill', '#666');
        xLabelRight.textContent = 'Quartiere vivace';
        svg.appendChild(xLabelRight);

        // Y-axis labels (Teniamolo così <-> Cambiamo lo spazio pubblico)
        const yLabelBottom = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        yLabelBottom.setAttribute('x', '10');
        yLabelBottom.setAttribute('y', '95');
        yLabelBottom.setAttribute('font-size', '6');
        yLabelBottom.setAttribute('fill', '#666');
        yLabelBottom.textContent = 'Teniamolo così';
        svg.appendChild(yLabelBottom);

        const yLabelTop1 = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        yLabelTop1.setAttribute('x', '10');
        yLabelTop1.setAttribute('y', '-90');
        yLabelTop1.setAttribute('font-size', '6');
        yLabelTop1.setAttribute('fill', '#666');
        yLabelTop1.textContent = 'Cambiamo lo spazio';
        svg.appendChild(yLabelTop1);
        
        const yLabelTop2 = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        yLabelTop2.setAttribute('x', '10');
        yLabelTop2.setAttribute('y', '-80');
        yLabelTop2.setAttribute('font-size', '6');
        yLabelTop2.setAttribute('fill', '#666');
        yLabelTop2.textContent = 'pubblico';
        svg.appendChild(yLabelTop2);

        // Add grid lines
        for (let i = -100; i <= 100; i += 20) {
            if (i !== 0) {
                // Vertical grid line
                const vLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                vLine.setAttribute('x1', i);
                vLine.setAttribute('y1', '-100');
                vLine.setAttribute('x2', i);
                vLine.setAttribute('y2', '100');
                vLine.setAttribute('stroke', '#e0e0e0');
                vLine.setAttribute('stroke-width', '0.3');
                svg.appendChild(vLine);

                // Horizontal grid line
                const hLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                hLine.setAttribute('x1', '-100');
                hLine.setAttribute('y1', i);
                hLine.setAttribute('x2', '100');
                hLine.setAttribute('y2', i);
                hLine.setAttribute('stroke', '#e0e0e0');
                hLine.setAttribute('stroke-width', '0.3');
                svg.appendChild(hLine);
            }
        }

        // Add point (will be positioned later)
        const point = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        point.id = 'resultPoint';
        point.setAttribute('r', '4');
        point.setAttribute('fill', '#667eea');
        point.setAttribute('stroke', '#fff');
        point.setAttribute('stroke-width', '1');
        svg.appendChild(point);

        // Add coordinate labels
        const coordsLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        coordsLabel.id = 'coordsLabel';
        coordsLabel.setAttribute('text-anchor', 'middle');
        coordsLabel.setAttribute('font-size', '8');
        coordsLabel.setAttribute('fill', '#667eea');
        coordsLabel.setAttribute('font-weight', 'bold');
        svg.appendChild(coordsLabel);

        planeContainer.appendChild(svg);

        // Create archetype section
        const archetypeSection = document.createElement('div');
        archetypeSection.className = 'archetype-section';
        archetypeSection.id = 'archetypeSection';
        archetypeSection.innerHTML = `
            <div class="archetype-card">
                <div class="archetype-icon">🏛️</div>
                <h3 class="archetype-name" id="archetypeName">Il tuo profilo</h3>
                <p class="archetype-description" id="archetypeDescription">Analizzando le tue risposte...</p>
            </div>
        `;

        // Create recording section
        const recordingSection = document.createElement('div');
        recordingSection.className = 'result-recording-section';
        recordingSection.innerHTML = `
            <h3>Registrazione aggiuntiva</h3>
            <p>Vuoi aggiungere un commento audio?</p>
        `;

        const recordingWrapper = this.createRecordingControls();
        recordingSection.appendChild(recordingWrapper);

        // Create buttons container
        const buttonsContainer = document.createElement('div');
        buttonsContainer.className = 'result-buttons';

        const completeBtn = document.createElement('button');
        completeBtn.type = 'button';
        completeBtn.id = 'completeBtn';
        completeBtn.className = 'submit-btn';
        completeBtn.textContent = 'Concludi e Ricomincia';
        completeBtn.addEventListener('click', () => this.handleComplete());

        buttonsContainer.appendChild(completeBtn);

        // Clear existing content and add new elements
        const existingContent = resultSection.querySelector('.result-content');
        if (!existingContent) {
            const content = document.createElement('div');
            content.className = 'result-content';
            resultSection.appendChild(content);
        }

        const content = resultSection.querySelector('.result-content');
        content.appendChild(archetypeSection);
        content.appendChild(planeContainer);
        content.appendChild(recordingSection);
        content.appendChild(buttonsContainer);

        this.elements = {
            svg,
            point,
            coordsLabel,
            completeBtn
        };
    }

    /**
     * Create recording controls
     */
    createRecordingControls() {
        const container = document.createElement('div');
        container.className = 'recording-wrapper';
        container.id = 'result_recording';

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
                    this.recording = new Blob(audioChunks, {type: 'audio/webm'});

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

    /**
     * Update the point position on the cartesian plane
     */
    updatePlane(x, y) {
        const point = this.elements.point;
        const label = this.elements.coordsLabel;

        // Clamp values to -100, 100 range
        x = Math.max(-100, Math.min(100, x));
        y = Math.max(-100, Math.min(100, y));

        // Update point position (note: SVG y-axis is inverted)
        point.setAttribute('cx', x);
        point.setAttribute('cy', -y);

        // Update label
        label.setAttribute('x', x);
        label.setAttribute('y', -y - 8);
        label.textContent = `(${x.toFixed(1)}, ${y.toFixed(1)})`;

        // Animate point appearance
        point.style.opacity = '0';
        setTimeout(() => {
            point.style.transition = 'opacity 0.5s ease-in';
            point.style.opacity = '1';
        }, 100);
    }

    /**
     * Set the submission ID for the follow-up recording
     */
    setSubmissionId(id) {
        this.submissionId = id;
    }

    /**
     * Set the original submission ID for updating the spreadsheet row
     */
    setOriginalId(id) {
        this.originalId = id;
    }

    /**
     * Set and display the archetype
     */
    setArchetype(archetype) {
        const nameElement = document.getElementById('archetypeName');
        const descriptionElement = document.getElementById('archetypeDescription');
        
        if (nameElement && descriptionElement && archetype) {
            nameElement.textContent = archetype.name;
            descriptionElement.textContent = archetype.description;
            
            // Add animation
            const archetypeCard = document.querySelector('.archetype-card');
            if (archetypeCard) {
                archetypeCard.style.opacity = '0';
                archetypeCard.style.transform = 'translateY(20px)';
                
                setTimeout(() => {
                    archetypeCard.style.transition = 'all 0.8s ease-out';
                    archetypeCard.style.opacity = '1';
                    archetypeCard.style.transform = 'translateY(0)';
                }, 200);
            }
        }
    }

    /**
     * Handle completion - automatically submit audio if available, then restart
     */
    async handleComplete() {
        const completeBtn = this.elements.completeBtn;
        const resultSection = document.getElementById('resultSection');
        
        // Create and show loading overlay
        const loadingOverlay = this.createLoadingOverlay();
        resultSection.appendChild(loadingOverlay);
        
        completeBtn.disabled = true;
        
        if (this.recording) {
            // Audio was recorded, submit it
            this.updateLoadingMessage(loadingOverlay, 'Caricamento registrazione audio...', 'file-audio');
            
            try {
                const filename = this.submissionId + ".webm";
                const secondAudioUrl = await this.api.writeAudioBlobToGoogleDrive(this.recording, filename);

                console.log('filename:', filename);
                console.log('originalId:', this.originalId);
                console.log('Second audio URL:', secondAudioUrl);
                
                this.updateLoadingMessage(loadingOverlay, 'Aggiornamento database...', 'database');
                
                if (this.originalId && secondAudioUrl) {
                    await this.api.updateRowWithSecondAudio(this.originalId, secondAudioUrl);
                    
                    // Show success message briefly
                    this.updateLoadingMessage(loadingOverlay, 'Registrazione inviata con successo!', 'check-circle', true);
                    await new Promise(resolve => setTimeout(resolve, 1500));
                } else {
                    this.updateLoadingMessage(loadingOverlay, "Errore nell'invio della registrazione", 'x-circle', false, true);
                    await new Promise(resolve => setTimeout(resolve, 2000));
                }
            } catch (error) {
                console.error('Error submitting recording:', error);
                this.updateLoadingMessage(loadingOverlay, 'Errore nell\'invio della registrazione', 'x-circle', false, true);
                await new Promise(resolve => setTimeout(resolve, 2000));
                
                // Remove loading overlay and restore button
                resultSection.removeChild(loadingOverlay);
                completeBtn.disabled = false;
                completeBtn.textContent = 'Concludi e Ricomincia';
                return;
            }
        } else {
            // No recording to submit
            this.updateLoadingMessage(loadingOverlay, 'Completamento in corso...', 'check');
            await new Promise(resolve => setTimeout(resolve, 800));
        }
        
        // Remove loading overlay
        resultSection.removeChild(loadingOverlay);
        
        // Restart quiz
        window.restartQuiz();
    }

    /**
     * Create loading overlay
     */
    createLoadingOverlay() {
        const overlay = document.createElement('div');
        overlay.className = 'loading-overlay';
        overlay.innerHTML = `
            <div class="loading-content">
                <div class="loading-spinner"></div>
                <div class="loading-icon">
                    <svg width="40" height="40" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" fill="none">
                        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                    </svg>
                </div>
                <p class="loading-message">Operazione in corso...</p>
            </div>
        `;
        return overlay;
    }

    /**
     * Update loading message and icon
     */
    updateLoadingMessage(overlay, message, iconType, isSuccess = false, isError = false) {
        const messageElement = overlay.querySelector('.loading-message');
        const iconElement = overlay.querySelector('.loading-icon svg');
        const contentElement = overlay.querySelector('.loading-content');
        
        messageElement.textContent = message;
        
        // Icon mappings
        const icons = {
            'file-audio': `<svg width="40" height="40" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" fill="none">
                <path d="M9 18V5l12-2v13M9 18c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2zM21 16c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2z"/>
            </svg>`,
            'database': `<svg width="40" height="40" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" fill="none">
                <ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14c0 3 4 3 9 3s9 0 9-3V5"/>
                <path d="M3 12c0 3 4 3 9 3s9 0 9-3"/>
            </svg>`,
            'check-circle': `<svg width="40" height="40" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" fill="none">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22,4 12,14.01 9,11.01"/>
            </svg>`,
            'x-circle': `<svg width="40" height="40" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" fill="none">
                <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/>
                <line x1="9" y1="9" x2="15" y2="15"/>
            </svg>`,
            'check': `<svg width="40" height="40" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" fill="none">
                <polyline points="20,6 9,17 4,12"/>
            </svg>`
        };
        
        if (icons[iconType]) {
            iconElement.innerHTML = icons[iconType];
        }
        
        // Update colors based on status
        if (isSuccess) {
            contentElement.classList.add('success');
            contentElement.classList.remove('error');
        } else if (isError) {
            contentElement.classList.add('error');
            contentElement.classList.remove('success');
        } else {
            contentElement.classList.remove('success', 'error');
        }
    }

    /**
     * Reset the result UI
     */
    reset() {
        this.recording = null;
        this.submissionId = null;

        // Reset recording UI
        const wrapper = document.getElementById('result_recording');
        if (wrapper) {
            const startBtn = wrapper.querySelector('.start-btn');
            const stopBtn = wrapper.querySelector('.stop-btn');
            const status = wrapper.querySelector('.recording-status');

            if (startBtn) startBtn.style.display = 'flex';
            if (stopBtn) stopBtn.style.display = 'none';
            if (status) {
                status.classList.remove('recording', 'saved', 'error');
                const statusText = status.querySelector('.status-text');
                const statusTime = status.querySelector('.status-time');
                if (statusText) statusText.textContent = 'Pronto per registrare';
                if (statusTime) statusTime.textContent = '00:00';
            }
        }

        // Reset complete button
        if (this.elements.completeBtn) {
            this.elements.completeBtn.disabled = false;
            this.elements.completeBtn.textContent = 'Concludi e Ricomincia';
        }
    }
}