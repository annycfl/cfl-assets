"""Deploy the static site to Cloudflare Pages using securely injected credentials.

No token is accepted as a command-line argument or written to a file.
The required token permission is Account > Cloudflare Pages > Edit.
"""
import argparse
import json
import os
from pathlib import Path
import re
import subprocess
import sys
import tempfile
import urllib.error
import urllib.request

from build_site import build, PUBLIC_FILES

ROOT = Path(__file__).resolve().parents[1]
WRANGLER_VERSION = "4.152.0"
DEFAULT_PROJECT = "our-home-islands-annycfl"


def api_call(account_id, token, project, method="GET"):
    endpoint = f"https://api.cloudflare.com/client/v4/accounts/{account_id}/pages/projects"
    if method == "GET":
        endpoint += f"/{project}"
    payload = {"name": project, "production_branch": "main"} if method == "POST" else None
    request = urllib.request.Request(
        endpoint,
        data=json.dumps(payload).encode() if payload is not None else None,
        headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
        method=method,
    )
    try:
        with urllib.request.urlopen(request, timeout=30) as response:
            result = json.load(response)
    except urllib.error.HTTPError as error:
        if error.code == 404 and method == "GET":
            return None
        raise RuntimeError(
            f"Cloudflare API returned HTTP {error.code}; check network access and Pages token permissions."
        ) from None
    except urllib.error.URLError:
        raise RuntimeError(
            "Cannot reach api.cloudflare.com; save the required network settings and retry."
        ) from None
    if result.get("success") is not True:
        raise RuntimeError("Cloudflare did not accept the request; check account access and Pages permissions.")
    return result["result"]


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--project", default=DEFAULT_PROJECT, help="Cloudflare Pages project name")
    args = parser.parse_args()
    if not re.fullmatch(r"[a-z0-9](?:[a-z0-9-]{0,56}[a-z0-9])?", args.project):
        parser.error("Project name must contain 1–58 lowercase letters, digits, or internal hyphens.")
    token = os.environ.get("CLOUDFLARE_API_TOKEN")
    account_id = os.environ.get("CLOUDFLARE_ACCOUNT_ID", "")
    if not token:
        parser.error("CLOUDFLARE_API_TOKEN is missing. Enter it securely in environment settings, not in chat.")
    if not re.fullmatch(r"[0-9a-f]{32}", account_id):
        parser.error("Set CLOUDFLARE_ACCOUNT_ID to your account's 32-character identifier in environment settings.")

    build()
    project = api_call(account_id, token, args.project)
    if project is None:
        print("Creating Cloudflare Pages project…", flush=True)
        api_call(account_id, token, args.project, method="POST")
    else:
        # Refuse to publish to a branch that would silently become a preview deployment.
        if project.get("production_branch") != "main":
            raise RuntimeError("Existing project has a different production branch; verify its settings before deploying.")
        print("Using existing Cloudflare Pages project.", flush=True)
    environment = os.environ.copy()
    environment["WRANGLER_SEND_METRICS"] = "false"
    environment.setdefault("XDG_CONFIG_HOME", str(Path(tempfile.gettempdir()) / "memory-islands-cloudflare"))
    command = [
        "npm", "--cache", str(Path(tempfile.gettempdir()) / "memory-islands-npm-cache"),
        "exec", "--yes", f"--package=wrangler@{WRANGLER_VERSION}", "--", "wrangler",
        "pages", "deploy", "dist", "--project-name", args.project,
        "--branch", "main", "--commit-dirty=true",
    ]
    print(f"Uploading {len(PUBLIC_FILES)} public website assets…", flush=True)
    subprocess.run(command, cwd=ROOT, env=environment, check=True)
    print("Cloudflare upload completed. Verify the deployment URL printed above.", flush=True)


if __name__ == "__main__":
    try:
        main()
    except (RuntimeError, subprocess.CalledProcessError) as error:
        print(f"Deployment stopped: {error}", file=sys.stderr)
        sys.exit(1)
