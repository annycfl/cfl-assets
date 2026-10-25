"""Prepare only public website assets for static hosting; no dependencies required."""
from pathlib import Path
from shutil import copy2

ROOT = Path(__file__).resolve().parents[1]
PUBLIC_FILES = (
    "index.html", "style.css", "app.js", "scene3d.js", "favicon.svg",
    "vendor/three/three.module.js", "vendor/three/three.core.js",
    "vendor/three/OrbitControls.js", "vendor/three/BufferGeometryUtils.js",
    "vendor/three/LICENSE",
)


def build():
    output = ROOT / "dist"
    output.mkdir(exist_ok=True)
    for name in PUBLIC_FILES:
        (output / name).parent.mkdir(parents=True, exist_ok=True)
        copy2(ROOT / name, output / name)
    print(f"Prepared static website in dist/ ({len(PUBLIC_FILES)} public files)")
    return output


if __name__ == "__main__":
    build()
