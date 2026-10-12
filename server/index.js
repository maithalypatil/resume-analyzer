require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');

const { extractText } = require('./utils/extractText');
const { analyzeLocally } = require('./utils/localAnalyzer');
const { analyzeWithAI } = require('./utils/aiAnalyzer');

const app = express();
app.use(cors());
app.use(express.json());

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, aiEnabled: Boolean(process.env.ANTHROPIC_API_KEY) });
});

app.post('/api/analyze', upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Please upload a resume (PDF or DOCX).' });
    }

    const resumeText = await extractText(req.file);
    if (!resumeText || resumeText.trim().length < 50) {
      return res.status(422).json({
        error: 'Could not read text from this file. If it is a scanned PDF, upload a text-based version.',
      });
    }

    const jobDescription = (req.body.jobDescription || '').trim();
    const local = analyzeLocally(resumeText, jobDescription);

    if (!process.env.ANTHROPIC_API_KEY) {
      return res.json({ ...local, mode: 'local' });
    }

    try {
      const ai = await analyzeWithAI(resumeText, jobDescription, local);
      return res.json({ ...ai, mode: 'ai' });
    } catch (err) {
      console.error('AI analysis failed, using local analyzer:', err.message);
      return res.json({
        ...local,
        mode: 'local',
        notice: 'AI analysis was unavailable, so the rule-based analyzer was used.',
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'Something went wrong while analyzing the resume.' });
  }
});

// Multer / generic error handler
app.use((err, _req, res, _next) => {
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ error: 'File is too large. Maximum size is 5 MB.' });
  }
  res.status(500).json({ error: err.message || 'Server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Resume Analyzer API running on http://localhost:${PORT}`));
