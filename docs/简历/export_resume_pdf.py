#!/usr/bin/env python3
from __future__ import annotations

import argparse
import posixpath
from functools import partial
from http import HTTPStatus
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, quote, unquote, urlparse

from playwright.sync_api import sync_playwright


BASE_DIR = Path(__file__).resolve().parent
DEFAULT_HTML = "洋-AI产品经理简历-202606-agent-cover.html"
DEFAULT_PDF = "汪洋-AI产品经理简历-202606.pdf"

EXPORT_CSS = """
@page {
  size: A4;
  margin: 0;
}

@media print {
  * {
    font-family: "Arial Unicode MS", "STHeiti", "Heiti SC", sans-serif !important;
  }

  html,
  body,
  .resume-book {
    width: 210mm !important;
    margin: 0 !important;
    padding: 0 !important;
    background: #ffffff !important;
  }

  .resume-book {
    display: block !important;
    gap: 0 !important;
  }

  .export-toolbar {
    display: none !important;
  }

  .page {
    width: 210mm !important;
    height: 296.8mm !important;
    min-height: 296.8mm !important;
    max-height: 296.8mm !important;
    margin: 0 !important;
    box-shadow: none !important;
    overflow: hidden !important;
    break-inside: avoid !important;
    page-break-inside: avoid !important;
    break-after: page !important;
    page-break-after: always !important;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  .page:last-child {
    break-after: auto !important;
    page-break-after: auto !important;
  }
}
"""


def safe_html_path(file_name: str) -> Path:
    normalized = posixpath.normpath(unquote(file_name)).lstrip("/")
    path = (BASE_DIR / normalized).resolve()
    if BASE_DIR not in path.parents and path != BASE_DIR:
        raise ValueError("file path is outside resume directory")
    if path.suffix.lower() != ".html":
        raise ValueError("only html files can be exported")
    if not path.exists():
        raise FileNotFoundError(path)
    return path


def render_pdf(source_url: str, browser_channel: str = "chrome") -> bytes:
    with sync_playwright() as playwright:
        launch_options = {}
        if browser_channel:
            launch_options["channel"] = browser_channel

        browser = playwright.chromium.launch(**launch_options)
        page = browser.new_page(viewport={"width": 794, "height": 1123}, device_scale_factor=1)
        page.goto(source_url, wait_until="networkidle")
        page.add_style_tag(content=EXPORT_CSS)
        page.emulate_media(media="print")
        pdf_bytes = page.pdf(
            format="A4",
            print_background=True,
            prefer_css_page_size=True,
            margin={"top": "0mm", "right": "0mm", "bottom": "0mm", "left": "0mm"},
            scale=1,
        )
        browser.close()
        return pdf_bytes


class ResumeHandler(SimpleHTTPRequestHandler):
    browser_channel = "chrome"

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(BASE_DIR), **kwargs)

    def log_message(self, format: str, *args) -> None:
        print(f"[resume-pdf] {self.address_string()} - {format % args}")

    def do_GET(self) -> None:
        parsed = urlparse(self.path)
        if parsed.path == "/":
            self.send_response(HTTPStatus.FOUND)
            self.send_header("Location", f"/{quote(DEFAULT_HTML)}")
            self.end_headers()
            return

        if parsed.path == "/export-pdf":
            self.handle_export(parsed.query)
            return

        super().do_GET()

    def handle_export(self, query: str) -> None:
        params = parse_qs(query)
        file_name = params.get("file", [DEFAULT_HTML])[0]

        try:
            html_path = safe_html_path(file_name)
            source_url = f"http://127.0.0.1:{self.server.server_port}/{quote(html_path.name)}?pdf-export=1"
            pdf_bytes = render_pdf(source_url, self.browser_channel)
        except Exception as error:
            message = f"PDF export failed: {error}\n"
            self.send_response(HTTPStatus.INTERNAL_SERVER_ERROR)
            self.send_header("Content-Type", "text/plain; charset=utf-8")
            self.send_header("Content-Length", str(len(message.encode("utf-8"))))
            self.end_headers()
            self.wfile.write(message.encode("utf-8"))
            return

        encoded_name = quote(DEFAULT_PDF)
        self.send_response(HTTPStatus.OK)
        self.send_header("Content-Type", "application/pdf")
        self.send_header("Content-Length", str(len(pdf_bytes)))
        self.send_header("Content-Disposition", f'attachment; filename="resume.pdf"; filename*=UTF-8\'\'{encoded_name}')
        self.end_headers()
        self.wfile.write(pdf_bytes)


def run_server(host: str, port: int, browser_channel: str) -> None:
    ResumeHandler.browser_channel = browser_channel
    handler = partial(ResumeHandler)
    server = ThreadingHTTPServer((host, port), handler)
    url = f"http://127.0.0.1:{server.server_port}/{quote(DEFAULT_HTML)}"
    print("Resume PDF export server is running.")
    print(f"Browser channel: {browser_channel or 'bundled chromium'}")
    print(f"Open: {url}")
    print("Press Ctrl+C to stop.")
    server.serve_forever()


def export_once(output: Path, html_file: str, browser_channel: str) -> None:
    html_path = safe_html_path(html_file)
    pdf_bytes = render_pdf(html_path.as_uri(), browser_channel)
    output.write_bytes(pdf_bytes)
    print(f"Wrote {output}")


def main() -> None:
    parser = argparse.ArgumentParser(description="Serve and export the resume as a text-layer PDF.")
    parser.add_argument("--host", default="127.0.0.1")
    parser.add_argument("--port", type=int, default=8765)
    parser.add_argument("--once", action="store_true", help="Export once without starting the HTTP server.")
    parser.add_argument("--file", default=DEFAULT_HTML)
    parser.add_argument("--output", default=str(BASE_DIR / DEFAULT_PDF))
    parser.add_argument(
        "--browser-channel",
        default="chrome",
        help='Browser channel passed to Playwright, default "chrome". Use "" for bundled Chromium.',
    )
    args = parser.parse_args()

    if args.once:
        export_once(Path(args.output).expanduser().resolve(), args.file, args.browser_channel)
        return

    run_server(args.host, args.port, args.browser_channel)


if __name__ == "__main__":
    main()
