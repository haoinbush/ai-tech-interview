# Fintech Technical Interview Platform

A personal web-based platform for practicing SQL and Python technical interview questions focused on fintech.

## Features

- **Live SQL execution** - Run queries against pre-loaded fintech datasets (transactions, stock prices, portfolio holdings, risk metrics)
- **Live Python execution** - Run Python with Pandas and NumPy in the browser
- **Question browser** - Filter by topic (SQL, Python), difficulty, and fintech domain
- **Reference solutions** - Toggle to view model answers
- **Progress tracking** - Completed questions saved in localStorage
- **Company/job-specific questions** - Add a job URL (Greenhouse) to get tailored questions; optional AI generation with OpenAI/Anthropic

## Getting Started

**If you use nvm** (Node Version Manager), load it first in new terminals:

```bash
export NVM_DIR="$HOME/.nvm" && [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
```

Then:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Job-specific questions

1. Go to **Add job for practice** (sidebar) or `/jobs/add`
2. Paste a Greenhouse job URL (e.g. `https://job-boards.greenhouse.io/stripe/jobs/7516102`)
3. Click **Load Questions** — the platform will:
   - **First**: Fetch real questions from the web (DataLemur, etc.) for the company
   - **Then**: Match curated questions by job skills
   - **Optionally**: Generate more with AI when you enable the checkbox (uses API key from `.env.local`)
4. Save and start practicing

## Build for production

```bash
npm run build
```

Output is static HTML in the `out/` directory. Serve with any static file server.

## Tech Stack

- Next.js 14 (App Router)
- SQL.js (client-side SQLite)
- Pyodide (client-side Python with Pandas/NumPy)
- Monaco Editor
- Tailwind CSS
