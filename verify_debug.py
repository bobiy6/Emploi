from playwright.sync_api import sync_playwright
import os

def run_cuj(page):
    page.on("console", lambda msg: print(f"Browser console: {msg.text}"))
    page.on("pageerror", lambda exc: print(f"Uncaught exception: {exc}"))

    # Go to login page first to see if it renders
    print("Navigating to login...")
    page.goto("http://localhost:3000/login")
    page.wait_for_timeout(2000)
    page.screenshot(path="/home/jules/verification/screenshots/login_check.png")

    # Go to admin page
    print("Navigating to admin...")
    page.goto("http://localhost:3000/admin")
    page.wait_for_timeout(2000)
    page.screenshot(path="/home/jules/verification/screenshots/admin_check_v2.png")

if __name__ == "__main__":
    os.makedirs("/home/jules/verification/screenshots", exist_ok=True)
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            run_cuj(page)
        finally:
            browser.close()
