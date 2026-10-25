"""Functional WebGL checks: geometry, actual animation, camera input, and fallback."""
import os
from playwright.sync_api import sync_playwright

URL = os.environ.get('TEST_BASE_URL', 'http://127.0.0.1:8000')
CHROMIUM = os.environ.get('CHROMIUM_PATH', '/usr/bin/chromium')


def check(condition, text):
    assert condition, text
    print('PASS ' + text, flush=True)


with sync_playwright() as p:
    browser = p.chromium.launch(executable_path=CHROMIUM, headless=True,
                               args=['--no-sandbox', '--enable-unsafe-swiftshader'])
    page = browser.new_page(viewport={'width': 1100, 'height': 860}, device_scale_factor=.6)
    page.set_default_timeout(60000)
    errors = []
    page.on('pageerror', lambda error: errors.append(str(error)))
    page.on('console', lambda message: errors.append(message.text)
            if message.type == 'error' else None)
    page.goto(URL, wait_until='networkidle')
    page.wait_for_function('window.memory3D?.getState().frames >= 2', timeout=60000)
    initial = page.evaluate('memory3D.getState()')
    check(initial['triangles'] > 1000 and initial['actors'] == 20,
          'WebGL renders real 3D geometry and twenty moving people/cats')
    page.wait_for_function('(frame) => memory3D.getState().frames >= frame + 2',
                           arg=initial['frames'])
    moved = page.evaluate('memory3D.getState()')
    check(initial['positions'] != moved['positions'], 'inhabitants actually change position over time')
    page.locator('#toggle-life').click()
    page.wait_for_function('memory3D.getState().living === false')
    paused = page.evaluate('memory3D.getState()')
    page.wait_for_function('(frame) => memory3D.getState().frames >= frame + 2',
                           arg=paused['frames'])
    check(paused['positions'] == page.evaluate('memory3D.getState().positions'),
          'rest mode pauses walking while the 3D scene keeps rendering')
    camera_before = page.evaluate('memory3D.getState().camera')
    canvas = page.locator('#island-canvas').bounding_box()
    page.mouse.move(canvas['x'] + 600, canvas['y'] + 530)
    page.mouse.down()
    page.mouse.move(canvas['x'] + 760, canvas['y'] + 570, steps=8)
    page.mouse.up()
    check(camera_before != page.evaluate('memory3D.getState().camera') and
          not page.locator('#memory-dialog').is_visible(),
          'dragging rotates the actual camera without opening a memory')
    page.locator('#reset-map').click()
    # Raycast an actual island surface, rather than calling a scene function directly.
    page.wait_for_function('(previous) => memory3D.getState().frames > previous',
                           arg=page.evaluate('memory3D.getState().frames'))
    state = page.evaluate('memory3D.getState()')
    target = next(item for item in state['islandCenters'] if item['id'] == 'home')
    old_target = state['target']
    page.mouse.click(canvas['x'] + target['x'], canvas['y'] + target['y'])
    check(old_target != page.evaluate('memory3D.getState().target'),
          'clicking an island model raycasts and moves the camera closer')
    page.get_by_role('button', name='探索我們的家', exact=True).click()
    check(page.locator('#memory-title').inner_text() == '我們的家',
          'projected island labels still open the original memory editor')
    page.keyboard.press('Escape')
    page.locator('#toggle-orbit').click()
    before_orbit = page.evaluate('memory3D.getState()')
    page.wait_for_function('(frame) => memory3D.getState().frames >= frame + 2',
                           arg=before_orbit['frames'])
    check(before_orbit['camera'] != page.evaluate('memory3D.getState().camera'),
          'orbit view automatically turns the camera')
    page.locator('#reset-map').click()
    check(page.locator('#toggle-orbit').get_attribute('aria-pressed') == 'false',
          'reset stops orbit and restores the overview')
    check(not errors, 'no WebGL shader errors or JavaScript runtime errors')
    page.close()

    # Respect reduced-motion preferences before the first frame.
    reduced = browser.new_context(reduced_motion='reduce', viewport={'width': 800, 'height': 800})
    quiet = reduced.new_page()
    quiet.goto(URL, wait_until='networkidle')
    quiet.wait_for_function('window.memory3D?.getState().frames >= 1', timeout=60000)
    check(quiet.evaluate('memory3D.getState().living') is False,
          'reduced-motion preference starts with resting inhabitants')
    reduced.close()

    # A machine without WebGL must retain a working, clearly identified fallback.
    fallback = browser.new_context()
    fallback.add_init_script('''
      const original = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function(type, ...args) {
        if (type.startsWith('webgl') || type === 'experimental-webgl') return null;
        return original.call(this, type, ...args);
      };
    ''')
    flat = fallback.new_page()
    flat.goto(URL, wait_until='networkidle')
    flat.get_by_text('這個瀏覽器無法啟用 3D，先以插畫地圖探索回憶。', exact=True).wait_for()
    flat.get_by_role('button', name='探索哞花島', exact=True).click()
    check(flat.locator('#memory-title').inner_text() == '哞花島',
          'no-WebGL fallback explains the limitation and keeps memories accessible')
    fallback.close()
    browser.close()
