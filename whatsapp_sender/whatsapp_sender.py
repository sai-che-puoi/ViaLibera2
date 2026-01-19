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


def send_whatsapp_messages(urls, wait_time_range=(5, 60)):
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

        for index, url in enumerate(urls, 1):
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
    # Your WhatsApp URLs here
    urls = [
        "https://web.whatsapp.com/send?phone=393495646599&text=ciao%21%0Avolevamo%20ricordarti%20il%20https%3A%2F%2Ftinyurl.com%2FCSBSEPDF",
        "https://web.whatsapp.com/send?phone=393495646599&text=ciao%21%0Asecondo%20messaggio",
        # Add more URLs here as needed
    ]

    # Validate URLs
    if not urls:
        print("Error: No URLs provided!")
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