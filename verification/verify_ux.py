
from playwright.sync_api import sync_playwright

def verify_skip_link():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        
        # Load the index.html file directly from the filesystem
        # Note: We use absolute path for file:// protocol
        import os
        cwd = os.getcwd()
        page.goto(f'file://{cwd}/index.html')
        
        # Check if the skip link exists
        skip_link = page.locator('a.skip-to-content')
        if skip_link.count() > 0:
            print('Skip link found')
            
            # Verify it points to #main-content
            href = skip_link.get_attribute('href')
            print(f'Skip link href: {href}')
            
            # Verify #main-content exists
            main_content = page.locator('#main-content')
            if main_content.count() > 0:
                print('#main-content found')
            else:
                print('#main-content NOT found')

            # Force focus to show the skip link (simulate tab)
            skip_link.focus()
            page.screenshot(path='verification/skip_link_focused.png')
            print('Screenshot taken: verification/skip_link_focused.png')
            
        else:
            print('Skip link NOT found')
            
        browser.close()

if __name__ == '__main__':
    verify_skip_link()

