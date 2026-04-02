from playwright.sync_api import sync_playwright
import os

def run_cuj(page):
    page.on("console", lambda msg: print(f"Browser console: {msg.text}"))
    page.on("pageerror", lambda exc: print(f"Uncaught exception: {exc}"))

    # Try admin routes
    routes = ["/admin/users", "/admin/accounting", "/admin/settings"]
    for route in routes:
        print(f"Checking {route}...")
        page.goto(f"http://localhost:3000{route}")
        page.wait_for_timeout(2000)
        page.screenshot(path=f"/home/jules/verification/screenshots{route.replace('/', '_')}.png")

if __name__ == "__main__":
    os.makedirs("/home/jules/verification/screenshots", exist_ok=True)
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            run_cuj(page)
        finally:
            browser.close()
