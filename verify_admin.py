from playwright.sync_api import sync_playwright
import os

def run_cuj(page):
    # Go to admin page
    # It might redirect to login if no token, but we want to see if the component even attempts to render
    page.goto("http://localhost:3000/admin")
    page.wait_for_timeout(2000)
    page.screenshot(path="/home/jules/verification/screenshots/admin_check.png")

    # Check if there's an error in console
    page.on("console", lambda msg: print(f"Browser console: {msg.text}"))

if __name__ == "__main__":
    os.makedirs("/home/jules/verification/screenshots", exist_ok=True)
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            run_cuj(page)
        finally:
            browser.close()
