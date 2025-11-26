import {googleDriveFolderScriptUrl} from "./script_key.js";

export class GoogleAPI {

    constructor(config) {
        this.url = config.googleScriptUrl;
        this.enabled = config.enableDataCollection;
    }

    /**
     * Send data to Google Sheets
     */
    async sendFormToSheet(data) {
        if (!this.enabled) {
            console.log('Data collection disabled');
            return {success: true, disabled: true};
        }

        if (!this.url || this.url === 'YOUR_GOOGLE_SCRIPT_URL_HERE') {
            console.warn('Google Sheets URL not configured');
            return {success: false, error: 'Not configured'};
        }

        try {
            await fetch(this.url, {
                method: 'POST',
                mode: 'no-cors',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(data)
            });

            return {success: true};
        } catch (error) {
            console.error('Error sending data:', error);
            return {success: false, error: error.message};
        }
    }

    async writeAudioBlobToGoogleDrive(audioBlob, filename) {

        async function blobToBase64(audioBlob) {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    // Remove the data URL prefix (e.g., "data:audio/webm;base64,")
                    const base64 = reader.result.split(',')[1];
                    resolve(base64);
                };
                reader.onerror = reject;
                reader.readAsDataURL(audioBlob);
            });
        }

        try {
            // Convert blob to base64
            const base64Audio = await blobToBase64(audioBlob);

            // Prepare payload
            const payload = {
                file: base64Audio,
                filename: filename,
            };

            // Send to Google Apps Script
            const response = await fetch(googleDriveFolderScriptUrl, {
                method: 'POST',
                redirect: 'follow',
                headers: {'Content-Type': 'text/plain'},
                body: JSON.stringify(payload)
            });

            const result = await response.json();
            // console.log(result);

            if (result.success) {
                console.log('Upload successful:', result);
                return result.url;
            } else {
                throw new Error(result.error || 'Upload failed');
            }
        } catch (error) {
            console.error('Error uploading recording:', error);
            throw error;
        }
    }
}
