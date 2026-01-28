# WhatsApp Message Sender

An automated Python script that uses Selenium to send WhatsApp messages from pre-filled URLs. The script opens WhatsApp Web URLs one at a time, clicks the send button, and includes randomized delays between messages to avoid spam detection.

## Features

- 🚀 Automated message sending from WhatsApp Web URLs
- ⏱️ Randomized delays (5-60 seconds) between messages
- 🔍 Robust error handling and timeout management
- 📊 Progress tracking and detailed logging
- 🛡️ Browser session persistence for easy QR code login
- ⚡ Interruption support (Ctrl+C to stop)

## Installation

### 1. Install Chrome/Chromium

```bash
sudo apt update
sudo apt install chromium-browser
```

### 2. Clone or Download This Repository

```bash
git clone <your-repo-url>
cd <repo-directory>
```

### 3. Install Python Dependencies

**Option A: System-wide installation**
```bash
pip install --break-system-packages -r requirements.txt
```

**Option B: Using a virtual environment (recommended)**
```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

## Configuration

Open `whatsapp_sender.py` and modify the `urls` list in the `main()` function with your WhatsApp URLs:

```python
def main():
    urls = [
        "https://web.whatsapp.com/send?phone=393490000000&text=ciao%21%0Avolevamo%20ricordarti%20il%20http%3A%2F%2Fsai-che-puoi.github.io%2Fpdf%2Ftest.pdf",
        "https://web.whatsapp.com/send?phone=393420000000&text=hello%20world",
        # Add more URLs here
    ]
```

### URL Format

WhatsApp Web URLs should follow this format:
```
https://web.whatsapp.com/send?phone=<COUNTRY_CODE><PHONE_NUMBER>&text=<URL_ENCODED_MESSAGE>
```

**Example:**
- Phone: +39 349 0000000
- Message: "Ciao! Come stai?"
- URL: `https://web.whatsapp.com/send?phone=393490000000&text=Ciao%21%20Come%20stai%3F`

You can URL-encode your message using online tools or Python's `urllib.parse.quote()`.

## Usage

### Basic Usage

```bash
python3 whatsapp_sender.py
```

### Step-by-Step Process

1. **Run the script**
   ```bash
   python3 whatsapp_sender.py
   ```

2. **Confirm execution**
   - The script will display the number of messages to send
   - Type `y` and press Enter to continue

3. **Login to WhatsApp Web**
   - A Chrome browser window will open
   - Scan the QR code with your phone if you're not already logged in
   - The script waits 20 seconds for authentication

4. **Automatic sending**
   - The script will process each URL automatically
   - Progress is displayed in the terminal
   - Messages are sent with random delays between them

5. **Completion**
   - The browser remains open for verification
   - Close it manually when you're done

### Example Output

```
Ready to send 3 WhatsApp message(s)
Random wait time between messages: 5-60 seconds

Continue? (y/n): y
Opening WhatsApp Web...
Please scan the QR code if you haven't already logged in.
Waiting 20 seconds for you to log in...

Processing 3 messages...

[1/3] Opening URL...
  Waiting for send button...
  Clicking send button...
  ✓ Message sent successfully!
  Waiting 37 seconds before next message...

[2/3] Opening URL...
  Waiting for send button...
  Clicking send button...
  ✓ Message sent successfully!
  Waiting 52 seconds before next message...

[3/3] Opening URL...
  Waiting for send button...
  Clicking send button...
  ✓ Message sent successfully!

=== All messages processed ===
The browser will remain open. Close it manually when done.
```

## Customization

### Adjusting Wait Time

To change the random delay range between messages, modify the `wait_time_range` parameter:

```python
send_whatsapp_messages(urls, wait_time_range=(10, 120))  # 10-120 seconds
```

### Browser Options

You can customize Chrome options in the script:

```python
options = webdriver.ChromeOptions()
options.add_argument("--start-maximized")  # Start maximized
options.add_argument("--headless")  # Run in headless mode (not recommended)
options.add_argument("--disable-notifications")  # Disable notifications
```

## Troubleshooting

### Send Button Not Found

**Symptoms:** Error message "Send button not found within timeout period"

**Solutions:**
- Ensure WhatsApp Web loaded completely
- Verify the phone number in the URL is valid and exists on WhatsApp
- Check that you're logged into WhatsApp Web
- Increase the timeout value in the script (default is 30 seconds)

### Browser Doesn't Open

**Solutions:**
- Install Chrome/Chromium: `sudo apt install chromium-browser`
- Verify Selenium installation: `pip list | grep selenium`
- Check that Chrome is in your PATH: `which chromium-browser`

### QR Code Timeout

**Solutions:**
- The script waits 30 seconds by default
- Increase the wait time in the script if needed:
  ```python
  time.sleep(30)  
  ```

### Rate Limiting / Blocked by WhatsApp

**Symptoms:** Messages not sending or account restrictions

**Solutions:**
- Increase the wait time between messages: `wait_time_range=(60, 180)`
- Send fewer messages per session
- Use WhatsApp according to their Terms of Service
- Avoid sending identical messages to multiple recipients

### Script Crashes or Freezes

**Solutions:**
- Press Ctrl+C to stop the script
- Check Chrome/Chromium is updated: `sudo apt update && sudo apt upgrade chromium-browser`
- Restart your system and try again
- Check system resources (RAM, CPU)
## How It Works

1. **Initialization**
   - Launches Chrome with Selenium WebDriver
   - Opens WhatsApp Web for authentication
   - Waits for user to scan QR code

2. **Message Processing Loop**
   - Iterates through each URL in the list
   - Opens the URL (pre-filled with recipient and message)
   - Waits for the Send button to become clickable
   - Clicks the Send button
   - Waits a random duration before the next message

3. **Error Handling**
   - Catches timeouts if elements don't load
   - Handles missing elements gracefully
   - Continues to next message on error
   - Logs all actions and errors

## Dependencies

- `selenium>=4.15.0` - Browser automation

See `requirements.txt` for the complete list.
