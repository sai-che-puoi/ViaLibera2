
export class GoogleSheetsAPI {
    constructor(config) {
        this.url = config.googleScriptUrl;
        this.enabled = config.enableDataCollection;
    }

    /**
     * Send data to Google Sheets
     */
    async send(data) {
        if (!this.enabled) {
            console.log('Data collection disabled');
            return { success: true, disabled: true };
        }

        if (!this.url || this.url === 'YOUR_GOOGLE_SCRIPT_URL_HERE') {
            console.warn('Google Sheets URL not configured');
            return { success: false, error: 'Not configured' };
        }

        try {
            await fetch(this.url, {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            return { success: true };
        } catch (error) {
            console.error('Error sending data:', error);
            return { success: false, error: error.message };
        }
    }
}
