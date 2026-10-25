"""End-to-end regression checks. Requires Playwright and a Chromium executable.

Start `python3 -m http.server 8000` at the repository root, then run this file.
TEST_BASE_URL and CHROMIUM_PATH may override the defaults.
All test data stays in disposable browser contexts and temporary directories.
"""
import json
import os
import tempfile
from pathlib import Path
from playwright.sync_api import sync_playwright

BASE_URL = os.environ.get('TEST_BASE_URL', 'http://127.0.0.1:8000')
CHROMIUM = os.environ.get('CHROMIUM_PATH', '/usr/bin/chromium')
ROOT = Path(__file__).resolve().parents[1]


def check(condition, label):
    assert condition, label
    print(f'PASS {label}', flush=True)


def open_directory(page, name):
    page.locator('#directory-open').click()
    page.locator('.stamp').filter(has=page.get_by_text(name, exact=True)).click()
    page.locator('#memory-dialog').wait_for(state='visible')


with tempfile.TemporaryDirectory(prefix='memory-island-test-') as temp:
    with sync_playwright() as p:
        browser = p.chromium.launch(executable_path=CHROMIUM, headless=True,
                                   args=['--no-sandbox', '--enable-unsafe-swiftshader'])
        context = browser.new_context(viewport={'width': 1440, 'height': 1000}, device_scale_factor=.6)
        context.set_default_timeout(60000)
        page = context.new_page()
        errors = []
        page.on('pageerror', lambda error: errors.append(str(error)))
        response = page.goto(BASE_URL, wait_until='networkidle')
        page.wait_for_function('window.memory3D?.getState().frames >= 1', timeout=60000)
        check(response.status == 200 and page.locator('.island-3d-label').count() == 11,
              'page renders eleven real 3D islands with accessible labels')
        check(page.title() == '我們的家 — 回憶群島', 'personalized site title')
        page.get_by_role('button', name='探索哞花島', exact=True).click()
        check('哞哞、花花' in page.locator('#memory-tagline').inner_text(),
              'cat names are personalized')
        page.locator('#edit-memory').click()
        story = '哞哞和花花，今天也陪我們一起看夕陽。\n<script>throw Error("unsafe")</script>'
        page.locator('[name=story]').fill(story)
        page.locator('[name=date]').fill('2026-10-25')
        page.locator('[name=photo]').set_input_files(ROOT / 'logo_favicon.png')
        page.get_by_role('button', name='儲存回憶 ♡').click()
        page.wait_for_function("document.querySelector('#memory-form').hidden")
        check(page.locator('#memory-story').inner_text() == story and
              page.locator('#memory-photo').is_visible(),
              'story and uploaded image save; markup is treated as text')
        page.get_by_role('button', name='關閉回憶', exact=True).click()
        page.reload(wait_until='networkidle')
        page.get_by_role('button', name='探索哞花島', exact=True).click()
        page.wait_for_function("document.querySelector('#memory-photo').naturalWidth > 0")
        check(page.locator('#memory-story').inner_text() == story and
              page.locator('#memory-date').inner_text() == '♡ 2026 . 10 . 25',
              'photo, story, and date survive reload')
        page.get_by_role('button', name='關閉回憶', exact=True).click()
        page.get_by_role('button', name='我們的旅行護照').click()
        check(page.locator('.stamp').count() == 7, 'passport contains seven destinations')
        page.locator('.stamp').filter(has_text='日本島').click()
        check(page.locator('#memory-title').inner_text() == '日本島',
              'passport opens selected island')
        page.get_by_role('button', name='關閉回憶', exact=True).click()
        page.get_by_role('button', name='一起旅行', exact=True).click()
        check(page.locator('.island-3d-label.dimmed').count() == 4, 'travel filter dims life islands')
        previous = page.evaluate('window.memory3D.getState().camera')
        page.get_by_role('button', name='放大地圖', exact=True).click()
        check(previous != page.evaluate('window.memory3D.getState().camera'), 'zoom moves the 3D camera')
        page.mouse.move(600, 720)
        page.mouse.down()
        page.mouse.move(670, 710, steps=10)
        page.mouse.up()
        check(not page.locator('#memory-dialog').is_visible(), 'dragging does not open a memory')
        page.get_by_role('button', name='重設地圖位置與縮放').click()
        check(page.locator('.island-3d-label.dimmed').count() == 0, 'map reset restores all islands')
        page.get_by_role('button', name='回憶備份').click()
        with page.expect_download() as download:
            page.locator('#export-memory').click()
        backup_path = Path(temp) / 'backup.json'
        download.value.save_as(backup_path)
        backup = json.loads(backup_path.read_text())
        check(len(backup['memories']) == 1 and
              backup['memories'][0]['photo'].startswith('data:image/jpeg;base64,'),
              'backup exports stories and real image bytes')
        page.get_by_role('button', name='關閉備份視窗').click()
        page.locator('.island-3d-label[data-id=baby]').focus()
        page.keyboard.press('Enter')
        check(page.locator('#memory-title').inner_text() == '泡泡星球' and
              '2027' in page.locator('#memory-kicker').inner_text(),
              'baby planet works with keyboard navigation')
        page.keyboard.press('Escape')
        check(not page.locator('#memory-dialog').is_visible(), 'Escape closes dialog')
        context.close()

        # Import into a new browser context, proving the backup is independent of its source.
        fresh = browser.new_context(viewport={'width': 390, 'height': 844},
                                    is_mobile=True, has_touch=True, device_scale_factor=.75)
        fresh.set_default_timeout(60000)
        mobile = fresh.new_page()
        mobile.on('pageerror', lambda error: errors.append(str(error)))
        mobile.goto(BASE_URL, wait_until='networkidle')
        mobile.wait_for_function('window.memory3D?.getState().frames >= 1', timeout=60000)
        check(not mobile.evaluate('document.documentElement.scrollWidth > innerWidth'),
              'mobile layout has no horizontal document overflow')
        mobile.get_by_role('button', name='回憶備份').click()
        mobile.locator('#import-memory').set_input_files(backup_path)
        mobile.get_by_text('已成功匯入 1 座島嶼的回憶。', exact=True).wait_for()
        mobile.get_by_role('button', name='關閉備份視窗').click()
        open_directory(mobile, '哞花島')
        mobile.wait_for_function("document.querySelector('#memory-photo').naturalWidth > 0")
        check(mobile.locator('#memory-story').inner_text() == story,
              'backup restores photo and story into a separate mobile browser')
        mobile.locator('#edit-memory').click()
        mobile.locator('[name=removePhoto]').check()
        mobile.locator('[name=name]').fill('哞花的小宇宙')
        mobile.get_by_role('button', name='儲存回憶 ♡').click()
        mobile.wait_for_function("document.querySelector('#memory-form').hidden")
        check(not mobile.locator('#memory-photo').is_visible() and
              mobile.locator('#memory-title').inner_text() == '哞花的小宇宙',
              'photo removal and custom island names work')
        mobile.get_by_role('button', name='關閉回憶', exact=True).click()
        mobile.reload(wait_until='networkidle')
        open_directory(mobile, '哞花的小宇宙')
        check(not mobile.locator('#memory-photo').is_visible(), 'photo deletion persists')
        mobile.get_by_role('button', name='關閉回憶', exact=True).click()
        mobile.get_by_role('button', name='回憶備份').click()
        invalid = dict(backup)
        invalid['memories'] = [dict(backup['memories'][0]),
                              {'id': 'unknown', 'name': 'broken', 'date': '', 'story': ''}]
        invalid['memories'][0]['name'] = '不應被匯入'
        invalid_path = Path(temp) / 'invalid.json'
        invalid_path.write_text(json.dumps(invalid))
        mobile.locator('#import-memory').set_input_files(invalid_path)
        mobile.get_by_text('備份的島嶼資料格式不正確，尚未匯入任何回憶。', exact=True).wait_for()
        mobile.get_by_role('button', name='關閉備份視窗').click()
        open_directory(mobile, '哞花的小宇宙')
        check(mobile.locator('#memory-title').inner_text() == '哞花的小宇宙',
              'invalid backup is rejected atomically without overwriting existing memories')
        mobile.get_by_role('button', name='關閉回憶', exact=True).click()
        cdp = fresh.new_cdp_session(mobile)
        before_pinch = mobile.evaluate('window.memory3D.getState().camera')
        cdp.send('Input.dispatchTouchEvent', {'type': 'touchStart', 'touchPoints': [
            {'x': 140, 'y': 540, 'id': 1}, {'x': 220, 'y': 540, 'id': 2}]})
        cdp.send('Input.dispatchTouchEvent', {'type': 'touchMove', 'touchPoints': [
            {'x': 100, 'y': 540, 'id': 1}, {'x': 260, 'y': 540, 'id': 2}]})
        cdp.send('Input.dispatchTouchEvent', {'type': 'touchEnd', 'touchPoints': []})
        check(before_pinch != mobile.evaluate('window.memory3D.getState().camera') and
              not mobile.locator('#memory-dialog').is_visible(),
              'real touch pinch zooms without opening an island')
        check(not errors, f'no JavaScript runtime errors: {errors}')
        fresh.close()
        browser.close()
