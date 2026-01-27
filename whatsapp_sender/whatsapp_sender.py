#!/usr/bin/env python3
"""
WhatsApp Message Sender
Automates sending WhatsApp messages from pre-filled URLs using Selenium
"""

import time
import random
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException
from selenium.webdriver.chrome.service import Service

# For loading/saving of google sheet
import gspread
from google.oauth2.service_account import Credentials

## GOOGLE SHEET CONFIG

### IMPORTANTE: IL SERVICE ACCOUNT (BOT) DI GOOGLE CONFIGURATO IN `credentials.json` DEVE AVERE ACCESSO ALLA SHEET.
### PER DARGLIELO BASTA APRIRE IL FILE JSON, E AGGIUNGERE IN MODALITÀ EDITOR L'EMAIL DEL BOT NELLA SHEET (COME SE SI
### DESSE ACCESSO AD UNA PERSONA QUALSIASI)
SOURCE_TABLE_URL = "https://docs.google.com/spreadsheets/d/10ygghSp3dRymRewUs8DmugPAKAlYBTvA4InKzj3B4xo"
SHEET_TABLE_NAME = "Sheet1"
WHATSAPP_LINK_COLUMN_NAME = "Link Messaggio"
SENT_COLUMN_NAME = "Inviato?"

##########################################################################################

def get_google_sheet():
    scopes = ["https://www.googleapis.com/auth/spreadsheets"]
    creds = Credentials.from_service_account_file(
        "credentials.json",
        scopes=scopes
    )
    client = gspread.authorize(creds)
    sheet = client.open_by_url(SOURCE_TABLE_URL).worksheet(SHEET_TABLE_NAME)
    return sheet

def get_column_index(sheet):
    headers = sheet.row_values(1)
    try:
        return headers.index(SENT_COLUMN_NAME) + 1
    except ValueError:
        raise RuntimeError(f"Column '{SENT_COLUMN_NAME}' not found")

def load_pending_urls(sheet):
    records = sheet.get_all_records()
    sent_col_idx = get_column_index(sheet)

    tasks = []

    for row_num, record in enumerate(records, start=2):
        url = str(record.get(WHATSAPP_LINK_COLUMN_NAME, "")).strip()
        sent = record.get(SENT_COLUMN_NAME, False)

        if not url or sent is True:
            continue

        # Closure capturing row_num
        def make_callback(r=row_num):
            def callback():
                sheet.update_cell(r, sent_col_idx, True)
            return callback

        tasks.append((url, make_callback()))

    return tasks

##########################################################################################
##########################################################################################

def send_whatsapp_messages(urls_callbacks, wait_time_range=(5, 60)):
    """
    Opens WhatsApp URLs one at a time and clicks the send button.

    Args:
        urls: List of WhatsApp web URLs with pre-filled messages
        wait_time_range: Tuple of (min, max) seconds to wait between messages
    """
    # Set up Chrome options
    options = webdriver.ChromeOptions()
    # Keep the browser open to maintain WhatsApp Web session
    options.add_experimental_option("detach", True)
    # Optional: start maximized for better visibility
    options.add_argument("--start-maximized")

    # Initialize the driver
    # driver = webdriver.Chrome(options=options)
    service = Service('/usr/bin/chromedriver')
    driver = webdriver.Chrome(service=service, options=options)

    try:
        print("Opening WhatsApp Web...")
        print("Please scan the QR code if you haven't already logged in.")
        print("Waiting 20 seconds for you to log in...")

        # Open WhatsApp Web first to allow login
        driver.get("https://web.whatsapp.com/")
        time.sleep(20)  # Give user time to scan QR code

        print(f"\nProcessing {len(urls)} messages...\n")

        for index, (url, success_callback) in enumerate(urls_callbacks, 1):
            print(f"[{index}/{len(urls)}] Opening URL...")
            driver.get(url)

            try:
                # Wait for the send button to be clickable
                # The send button has aria-label="Send"
                print("  Waiting for send button...")
                send_button = WebDriverWait(driver, 30).until(
                    EC.element_to_be_clickable((By.CSS_SELECTOR, 'button[aria-label="Send"]'))
                )

                # Small delay before clicking
                time.sleep(1)

                print("  Clicking send button...")
                send_button.click()

                # Wait a moment to confirm message was sent
                time.sleep(2)
                print("  ✓ Message sent successfully!")

                success_callback()

            except TimeoutException:
                print("  ✗ Error: Send button not found within timeout period")
                print("    This might happen if WhatsApp Web didn't load properly")
            except NoSuchElementException:
                print("  ✗ Error: Send button element not found")
            except Exception as e:
                print(f"  ✗ Error: {str(e)}")

            # Wait random time before next message (except for the last one)
            if index < len(urls):
                wait_seconds = random.randint(wait_time_range[0], wait_time_range[1])
                print(f"  Waiting {wait_seconds} seconds before next message...\n")
                time.sleep(wait_seconds)

        print("\n=== All messages processed ===")
        print("The browser will remain open. Close it manually when done.")

    except KeyboardInterrupt:
        print("\n\nScript interrupted by user.")
    except Exception as e:
        print(f"\nUnexpected error: {str(e)}")
    finally:
        # Don't close the driver automatically - let user close it
        print("\nScript finished. Browser remains open for your inspection.")

def main():
    sheet = get_google_sheet()
    urls = load_pending_urls(sheet)

    # Validate URLs
    if not urls:
        print("Error: No URLs provided!")
        return

    return

    print(f"Ready to send {len(urls)} WhatsApp message(s)")
    print("Random wait time between messages: 5-60 seconds")
    print("\nPress Ctrl+C at any time to stop.\n")

    # Optional: Add a confirmation prompt
    response = input("Continue? (y/n): ")
    if response.lower() != 'y':
        print("Cancelled.")
        return

    send_whatsapp_messages(urls)


if __name__ == "__main__":
    main()
