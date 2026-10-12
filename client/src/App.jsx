import { useState } from 'react';
import UploadForm from './components/UploadForm.jsx';
import Results from './components/Results.jsx';
import { analyzeResume } from './api.js';

export default function App() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  async function handleAnalyze(file, jobDescription) {
    setLoading(true);
    setError('');
    try {
      const data = await analyzeResume(file, jobDescription);
      setResult(data);
    } catch (e) {
      setResult(null);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page">
      <header className="top">
        <h1>Resume Analyzer</h1>
        <p>Upload your resume, add a job description, and see how well they match.</p>
      </header>

      <main className="layout">
        <UploadForm onAnalyze={handleAnalyze} loading={loading} />
        <section aria-live="polite">
          {error && <div className="error" role="alert">{error}</div>}
          {!error && !result && !loading && (
            <div className="empty">
              <h2>Your analysis appears here</h2>
              <p>Upload a PDF or DOCX resume to get a score, missing keywords, and specific fixes.</p>
            </div>
          )}
          {loading && <div className="empty"><h2>Reading your resume…</h2></div>}
          {result && !loading && <Results data={result} />}
        </section>
      </main>
    </div>
  );
}
