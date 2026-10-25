"""Prepare only public website assets for static hosting; no dependencies required."""
from pathlib import Path
from shutil import copy2

ROOT = Path(__file__).resolve().parents[1]
PUBLIC_FILES = ("index.html", "style.css", "app.js", "favicon.svg")


def build():
    output = ROOT / "dist"
    output.mkdir(exist_ok=True)
    for name in PUBLIC_FILES:
        copy2(ROOT / name, output / name)
    print("Prepared static website in dist/ (4 public files)")
    return output


if __name__ == "__main__":
    build()
