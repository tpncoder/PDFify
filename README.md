# PDF Merger

A self-hostable web app for common PDF operations: merge, split, rotate, extract text, and compress. Built with a FastAPI backend and a React (Vite) frontend using shadcn/ui components.

## Features

- **Merge** — combine multiple PDFs into one
- **Split** — split into individual page images, or extract specific page ranges as separate PDFs
- **Extract text** — pull all text content out of a PDF as a `.txt` file
- **Compress** — downsample and re-encode embedded images to reduce file size

## Tech Stack

- **Backend**: FastAPI, pypdf, pypdfium2, pikepdf, Pillow
- **Frontend**: React, Vite, TypeScript, shadcn/ui, Tailwind CSS

## Prerequisites

- Python 3.11+
- Node.js 20+

## Project Structure

```
.
├── main.py                 # FastAPI app and all route handlers
├── requirements.txt        # Python dependencies
├── .env                    # Backend env vars (not committed)
└── web/                    # React frontend
    ├── src/
    ├── package.json
    ├── .env                # Frontend env vars (not committed)
    └── ...
```

## Environment Variables

**Backend** (`.env` at project root):
| Variable | Description | Example |
|---|---|---|
| `WEB_PORT` | Port the frontend runs on, used to configure CORS | `5173` |

**Frontend** (`web/.env`):
| Variable | Description | Example |
|---|---|---|
| `VITE_API_URL` | Base URL of the backend API | `http://localhost:8000` |

Copy `.env.example` → `.env` in each location and fill in real values before running.

## Running Locally (without Docker)

**Backend:**
```bash
python -m venv .venv
.venv\Scripts\activate      # Windows
source .venv/bin/activate   # macOS/Linux

pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

**Frontend** (separate terminal):
```bash
cd web
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`, backend at `http://localhost:8000`.

## API Endpoints

| Method | Path | Description |
|---|---|---|
| `POST` | `/merge` | Merge multiple uploaded PDFs into one |
| `POST` | `/split` | Split a PDF — `mode=pages` (individual page images, zipped) or `mode=ranges` (specific page ranges as separate PDFs, zipped; requires `ranges` as JSON, e.g. `[{"start":1,"end":3}]`) |
| `POST` | `/extract` | Extract all text from a PDF as `.txt` |
| `POST` | `/compress` | Compress a PDF by downsampling and re-encoding embedded images |

All endpoints accept `multipart/form-data` with a `file` field (or `files` for `/merge`) and return the result as a downloadable stream.

## Deployment Notes

- Both services are containerized and have no external dependencies beyond what's in `requirements.txt` / `package.json` — no database, no third-party API keys required.
- `/compress` and `/split` load the entire PDF into memory; ensure the host has enough RAM for expected file sizes (large, image-heavy PDFs can be significant).
- CORS is currently locked to a single origin read from `WEB_PORT` — update `allow_origins` in `main.py` to match your production frontend domain before going live.
- No authentication is implemented — add a layer in front of this (reverse proxy auth, VPN, etc.) if it shouldn't be publicly accessible.

## Testing

_Backend tests (pytest) coming soon._