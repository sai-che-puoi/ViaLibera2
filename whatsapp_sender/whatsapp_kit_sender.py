#!/usr/bin/env python3
"""
WhatsApp Kit Message Sender — Via Libera 2
Sends kit-pickup messages from the questionario sheet.
Reads =HYPERLINK() formulas from the Link WA columns and marks
the corresponding Inviato checkbox as TRUE after each successful send.
"""

import re
import time
import random
import os
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException
from selenium.webdriver.chrome.service import Service

import urllib.parse
import gspread
from google.oauth2.service_account import Credentials
from google.auth.transport.requests import AuthorizedSession

## CONFIG #####################################################################

SOURCE_TABLE_URL = "https://docs.google.com/spreadsheets/d/1B3h7TWd4T5mqpa6t3ii8exTpdk1gPBgRSSEQKVdnBvI"
SHEET_GID        = 2083932060   # gid from the sheet URL

LINK_COLUMNS    = ["Link WA 1",  "Link WA 2",  "Link WA 3"]
INVIATO_COLUMNS = ["Inviato 1", "Inviato 2", "Inviato 3"]

ALREADY_SENT = {True, "TRUE", "True", "true", "YES", "Yes", "yes", 1, "1"}

###############################################################################


SPREADSHEET_ID = SOURCE_TABLE_URL.rstrip("/").split("/")[-1]


def get_google_sheet():
    scopes = ["https://www.googleapis.com/auth/spreadsheets"]
    creds = Credentials.from_service_account_file("credentials.json", scopes=scopes)
    client = gspread.authorize(creds)
    sheet = client.open_by_url(SOURCE_TABLE_URL).get_worksheet_by_id(SHEET_GID)
    return sheet, creds


def get_sheet_data_with_hyperlinks(creds, sheet_title):
    """
    Call the Sheets REST API directly with valueRenderOption=FORMULA so that
    =HYPERLINK() cells return their formula instead of the display label.
    gspread's get_all_values() does not reliably forward this option in all versions.
    """
    # Use spreadsheets.get with includeGridData so each cell exposes its
    # 'hyperlink' field — works for both =HYPERLINK() formulas and rich-text
    # hyperlinks set via setRichTextValue/setLinkUrl in Apps Script.
    session = AuthorizedSession(creds)
    url = f"https://sheets.googleapis.com/v4/spreadsheets/{SPREADSHEET_ID}"
    params = {
        "includeGridData": "true",
        "ranges": f"'{sheet_title}'!A:Z",
        "fields": "sheets.data.rowData.values(formattedValue,hyperlink)",
    }
    response = session.get(url, params=params)
    response.raise_for_status()
    row_data = response.json()["sheets"][0]["data"][0].get("rowData", [])
    return row_data


def normalise_whatsapp_url(url):
    """Convert wa.me/PHONE?text=MSG → web.whatsapp.com/send?phone=PHONE&text=MSG."""
    if not url or "wa.me" not in url:
        return url
    parsed = urllib.parse.urlparse(url)
    phone = parsed.path.lstrip("/")
    query = urllib.parse.parse_qs(parsed.query, keep_blank_values=True)
    text = query.get("text", [""])[0]
    new_query = urllib.parse.urlencode({"phone": phone, "text": text})
    return f"https://web.whatsapp.com/send?{new_query}"


def load_pending_tasks(sheet, creds):
    """
    Returns a list of (url, mark_sent_callback) for every unsent message.
    Uses spreadsheets.get with includeGridData to read the hyperlink URL
    directly from cell metadata, regardless of how the link was stored.
    """
    row_data = get_sheet_data_with_hyperlinks(creds, sheet.title)

    def cell_value(row_cells, idx):
        if idx >= len(row_cells):
            return ""
        return row_cells[idx].get("formattedValue", "")

    def cell_hyperlink(row_cells, idx):
        if idx >= len(row_cells):
            return ""
        return row_cells[idx].get("hyperlink", "")

    # Build column index map from the header row
    first_row_cells = row_data[0].get("values", [])
    headers = [cell_value(first_row_cells, i) for i in range(len(first_row_cells))]
    col_idx = {name: i for i, name in enumerate(headers) if name}

    tasks = []
    for row_num, row in enumerate(row_data[1:], start=2):
        cells = row.get("values", [])
        for link_col, inviato_col in zip(LINK_COLUMNS, INVIATO_COLUMNS):
            if link_col not in col_idx or inviato_col not in col_idx:
                continue

            url = normalise_whatsapp_url(cell_hyperlink(cells, col_idx[link_col]))
            if not url:
                continue

            if cell_value(cells, col_idx[inviato_col]) in ALREADY_SENT:
                print(f"  Row {row_num} – {link_col}: already sent, skipping")
                continue

            sent_col_1based = col_idx[inviato_col] + 1

            def make_callback(r=row_num, c=sent_col_1based):
                def callback():
                    sheet.update_cell(r, c, True)
                return callback

            tasks.append((url, make_callback()))

    return tasks


###############################################################################


def send_whatsapp_messages(tasks, wait_time_range=(5, 60)):
    options = webdriver.ChromeOptions()

    profile_path = os.path.expanduser("~/selenium-chromium-profile")
    options.add_argument(f"user-data-dir={profile_path}")
    options.add_argument("--no-first-run")
    options.add_argument("--no-default-browser-check")
    options.add_argument("--disable-dev-shm-usage")
    options.add_experimental_option("detach", True)
    options.add_argument("--start-maximized")

    service = Service("/usr/bin/chromedriver")
    options.binary_location = "/usr/bin/chromium-browser"
    driver = webdriver.Chrome(service=service, options=options)

    try:
        print("Opening WhatsApp Web…")
        driver.get("https://web.whatsapp.com/")

        print(f"\nProcessing {len(tasks)} message(s)…\n")

        sent_ok = []
        errors  = []

        for index, (url, mark_sent) in enumerate(tasks, 1):
            print(f"[{index}/{len(tasks)}] Opening URL…")
            driver.get(url)

            try:
                print("  Waiting for send button…")
                send_btn = WebDriverWait(driver, 30).until(
                    EC.element_to_be_clickable(
                        (By.CSS_SELECTOR, 'button[aria-label="Send"]')
                    )
                )
                time.sleep(1)
                print("  Clicking send button…")
                send_btn.click()
                time.sleep(2)
                print("  ✓ Sent! Marking sheet…")
                mark_sent()
                sent_ok.append(url)

            except TimeoutException:
                msg = "Timeout: send button not found within 30 s"
                print(f"  ✗ {msg}")
                errors.append((url, msg))
            except NoSuchElementException:
                msg = "Send button element not found"
                print(f"  ✗ {msg}")
                errors.append((url, msg))
            except Exception as e:
                print(f"  ✗ Error: {e}")
                errors.append((url, str(e)))

            if index < len(tasks):
                wait_sec = random.randint(*wait_time_range)
                print(f"  Waiting {wait_sec} s before next message…\n")
                time.sleep(wait_sec)

        print("\n" + "=" * 50)
        print(f"  RECAP: {len(sent_ok)} sent, {len(errors)} error(s)")
        print("=" * 50)
        if errors:
            print("\nFailed messages:")
            for url, reason in errors:
                print(f"  ✗ {reason}")
                print(f"    {url[:80]}{'…' if len(url) > 80 else ''}")
        print("\nThe browser will remain open. Close it manually when done.")

    except KeyboardInterrupt:
        print("\n\nInterrupted by user.")
    except Exception as e:
        print(f"\nUnexpected error: {e}")
    finally:
        print("\nScript finished. Browser remains open.")


###############################################################################


def main():
    print("Connecting to Google Sheet…")
    sheet, creds = get_google_sheet()

    print("Loading pending messages…")
    tasks = load_pending_tasks(sheet, creds)

    if not tasks:
        print("No pending messages to send!")
        return

    print(f"\nReady to send {len(tasks)} WhatsApp message(s)")
    print(f"Random wait between messages: {5}–{60} s")
    print("\nPress Ctrl+C at any time to stop.\n")

    if input("Continue? (y/n): ").lower() != "y":
        print("Cancelled.")
        return

    send_whatsapp_messages(tasks)


if __name__ == "__main__":
    main()
