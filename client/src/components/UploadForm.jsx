import { useRef, useState } from 'react';

const MAX_MB = 5;

export default function UploadForm({ onAnalyze, loading }) {
  const [file, setFile] = useState(null);
  const [jd, setJd] = useState('');
  const [fileError, setFileError] = useState('');
  const inputRef = useRef(null);

  function pickFile(f) {
    setFileError('');
    if (!f) return;
    const ok = /\.(pdf|docx)$/i.test(f.name);
    if (!ok) return setFileError('Only PDF and DOCX files are supported.');
    if (f.size > MAX_MB * 1024 * 1024) return setFileError(`File must be under ${MAX_MB} MB.`);
    setFile(f);
  }

  function onDrop(e) {
    e.preventDefault();
    pickFile(e.dataTransfer.files?.[0]);
  }

  function submit(e) {
    e.preventDefault();
    if (file) onAnalyze(file, jd);
  }

  return (
    <div className="panel">
      <div
        className={`drop ${file ? 'has-file' : ''}`}
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && inputRef.current?.click()}
        role="button"
        tabIndex={0}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.docx"
          hidden
          onChange={(e) => pickFile(e.target.files?.[0])}
        />
        {file ? (
          <>
            <strong>{file.name}</strong>
            <span>{(file.size / 1024).toFixed(0)} KB. Click to replace.</span>
          </>
        ) : (
          <>
            <strong>Drop your resume here</strong>
            <span>or click to browse (PDF or DOCX, up to {MAX_MB} MB)</span>
          </>
        )}
      </div>
      {fileError && <p className="field-error">{fileError}</p>}

      <label htmlFor="jd">Job description <span className="muted">(optional, improves keyword matching)</span></label>
      <textarea
        id="jd"
        rows={10}
        placeholder="Paste the job description here"
        value={jd}
        onChange={(e) => setJd(e.target.value)}
      />

      <button onClick={submit} disabled={!file || loading}>
        {loading ? 'Analyzing…' : 'Analyze resume'}
      </button>
    </div>
  );
}
