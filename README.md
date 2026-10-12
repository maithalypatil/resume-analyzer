# AI Resume Analyzer

Upload a resume (PDF or DOCX), optionally paste a job description, and get:

- An overall score with a breakdown (keyword match, sections, formatting, impact)
- Matched and missing keywords against the job description
- Strengths, improvements and rewrite suggestions

Two modes:
- **AI mode**: if `ANTHROPIC_API_KEY` is set, Claude does the analysis.
- **Local mode**: with no key, a rule-based analyzer runs. The app works either way.

## Stack
React (Vite) + Node.js/Express + multer + pdf-parse + mammoth + Anthropic SDK

## Run it

```bash
# 1. Backend
cd server
npm install
cp .env.example .env      # add your ANTHROPIC_API_KEY (optional)
npm start                 # http://localhost:5000

# 2. Frontend (new terminal)
cd client
npm install
npm run dev               # http://localhost:5173
```

## API
`POST /api/analyze` (multipart/form-data)
- `resume`: PDF or DOCX file (max 5 MB)
- `jobDescription`: text (optional)

## Folder structure
```
server/
  index.js               Express app + routes
  utils/extractText.js   PDF/DOCX -> text
  utils/localAnalyzer.js Rule-based scoring
  utils/aiAnalyzer.js    Claude-powered analysis
client/
  src/App.jsx
  src/api.js
  src/components/UploadForm.jsx
  src/components/Results.jsx
  src/styles.css
```
