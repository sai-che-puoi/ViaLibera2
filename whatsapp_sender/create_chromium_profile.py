from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
import os
import tempfile

# Use /tmp directory which has guaranteed write permissions
profile_path = os.path.expanduser( "~/selenium-chromium-profile")
os.makedirs(profile_path, exist_ok=True)
os.chmod(profile_path, 0o755)
print(f"Profile path: {profile_path}")

# Remove existing profile if it's corrupted
if os.path.exists(profile_path):
    import shutil
    shutil.rmtree(profile_path, ignore_errors=True)

os.makedirs(profile_path, exist_ok=True)

chrome_options = Options()
# chrome_options.add_argument("--headless=new")
chrome_options.add_argument("--no-sandbox")
chrome_options.add_argument("--disable-dev-shm-usage")
chrome_options.add_argument("--disable-gpu")
chrome_options.add_argument(f"--user-data-dir={profile_path}")

# Specify the binary location explicitly for Chromium
chrome_options.binary_location = "/usr/bin/chromium-browser"  # or chromium-browser

service = Service('/usr/bin/chromedriver')
driver = webdriver.Chrome(service=service, options=chrome_options)

driver.get("https://example.com")
print(f"Title: {driver.title}")
driver.quit()