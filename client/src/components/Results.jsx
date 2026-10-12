function ScoreRing({ score }) {
  const r = 52;
  const c = 2 * Math.PI * r;
  const tone = score >= 75 ? 'good' : score >= 50 ? 'mid' : 'low';
  return (
    <div className={`ring ${tone}`}>
      <svg viewBox="0 0 120 120" width="140" height="140" role="img" aria-label={`Overall score ${score} out of 100`}>
        <circle cx="60" cy="60" r={r} className="track" />
        <circle
          cx="60" cy="60" r={r} className="bar"
          strokeDasharray={c}
          strokeDashoffset={c - (c * score) / 100}
          transform="rotate(-90 60 60)"
        />
      </svg>
      <div className="ring-num">{score}<small>/100</small></div>
    </div>
  );
}

function Meter({ label, value }) {
  if (value === null || value === undefined) return null;
  return (
    <div className="meter">
      <div className="meter-head"><span>{label}</span><span>{value}%</span></div>
      <div className="meter-track"><div className="meter-fill" style={{ width: `${value}%` }} /></div>
    </div>
  );
}

function Chips({ items, tone }) {
  if (!items?.length) return <p className="muted">None</p>;
  return (
    <div className="chips">
      {items.map((k) => <span key={k} className={`chip ${tone}`}>{k}</span>)}
    </div>
  );
}

export default function Results({ data }) {
  const { score, breakdown = {}, summary, matchedKeywords, missingKeywords, strengths, improvements, rewriteSuggestions, mode, notice, stats } = data;
  const hasJD = breakdown.keywordMatch !== null && breakdown.keywordMatch !== undefined;

  return (
    <div className="results">
      {notice && <div className="notice">{notice}</div>}

      <div className="panel score-card">
        <ScoreRing score={score} />
        <div>
          <h2>Overall score</h2>
          <p>{summary}</p>
          <p className="muted small">
            {mode === 'ai' ? 'Analyzed by Claude' : 'Rule-based analysis'}
            {stats ? `, ${stats.wordCount} words` : ''}
          </p>
        </div>
      </div>

      <div className="panel">
        <h3>Breakdown</h3>
        <Meter label="Keyword match" value={breakdown.keywordMatch} />
        <Meter label="Sections" value={breakdown.sections} />
        <Meter label="Formatting and contact info" value={breakdown.formatting} />
        <Meter label="Impact and action verbs" value={breakdown.impact} />
      </div>

      {hasJD && (
        <div className="panel two">
          <div>
            <h3>Matched keywords</h3>
            <Chips items={matchedKeywords} tone="good" />
          </div>
          <div>
            <h3>Missing keywords</h3>
            <Chips items={missingKeywords} tone="low" />
          </div>
        </div>
      )}

      <div className="panel two">
        <div>
          <h3>Strengths</h3>
          <ul>{strengths?.map((s, i) => <li key={i}>{s}</li>)}</ul>
        </div>
        <div>
          <h3>Improvements</h3>
          <ul>{improvements?.map((s, i) => <li key={i}>{s}</li>)}</ul>
        </div>
      </div>

      {rewriteSuggestions?.length > 0 && (
        <div className="panel">
          <h3>Suggested rewrites</h3>
          {rewriteSuggestions.map((r, i) => (
            <div className="rewrite" key={i}>
              <p className="before">{r.original}</p>
              <p className="after">{r.improved}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
