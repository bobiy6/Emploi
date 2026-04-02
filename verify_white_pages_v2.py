from playwright.sync_api import sync_playwright
import os

def run_cuj(page):
    page.on("console", lambda msg: print(f"Browser console: {msg.text}"))
    page.on("pageerror", lambda exc: print(f"Uncaught exception: {exc}"))

    routes = ["/admin/users", "/admin/accounting", "/admin/settings"]
    for route in routes:
        print(f"\n--- Checking {route} ---")
        try:
            page.goto(f"http://localhost:3000{route}")
            page.wait_for_timeout(2000)
            page.screenshot(path=f"/home/jules/verification/screenshots{route.replace('/', '_')}_final.png")
        except Exception as e:
            print(f"Error navigating to {route}: {e}")

if __name__ == "__main__":
    os.makedirs("/home/jules/verification/screenshots", exist_ok=True)
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Use a context without storage state first, but we might need a dummy token
        context = browser.new_context()
        page = context.new_page()
        # Mock a token if needed, but the white page usually happens before the 401 check crashes the app
        try:
            run_cuj(page)
        finally:
            browser.close()
