const STOP_WORDS = new Set(
  `a an and are as at be but by for from has have in is it its of on or our that the their this to we will with you your
  who what when where which while about across after all also any can could do does etc more most must new not other
  out over per should such than then there these they those through use used using very was were would years year
  experience work working team teams strong ability skills required preferred responsibilities requirements role job
  position candidate company including plus well good great looking join etc`.split(/\s+/)
);

const SECTION_ALIASES = {
  summary: ['summary', 'objective', 'profile', 'about me'],
  experience: ['experience', 'work history', 'employment', 'internship', 'internships'],
  education: ['education', 'academic'],
  skills: ['skills', 'technical skills', 'technologies', 'tech stack'],
  projects: ['projects', 'project work', 'personal projects'],
  certifications: ['certifications', 'certificates', 'courses', 'achievements', 'awards'],
};

const ACTION_VERBS = [
  'built', 'developed', 'designed', 'implemented', 'created', 'led', 'managed', 'improved', 'optimized',
  'reduced', 'increased', 'launched', 'delivered', 'automated', 'architected', 'integrated', 'deployed',
  'analyzed', 'engineered', 'collaborated', 'migrated', 'streamlined', 'resolved', 'mentored', 'achieved',
];

function tokenize(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9+#.\s]/g, ' ')
    .split(/\s+/)
    .map((w) => w.replace(/^\.+|\.+$/g, ''))
    .filter((w) => w.length > 1);
}

function extractKeywords(jd, limit = 25) {
  const freq = new Map();
  for (const w of tokenize(jd)) {
    if (STOP_WORDS.has(w) || w.length < 3 || /^\d+$/.test(w)) continue;
    freq.set(w, (freq.get(w) || 0) + 1);
  }
  return [...freq.entries()]
    .sort((a, b) => b[1] - a[1] || b[0].length - a[0].length)
    .slice(0, limit)
    .map(([w]) => w);
}

function detectSections(text) {
  const lower = text.toLowerCase();
  const found = [];
  const missing = [];
  for (const [section, aliases] of Object.entries(SECTION_ALIASES)) {
    const hit = aliases.some((a) => new RegExp(`(^|\\n)\\s*${a}\\s*:?\\s*(\\n|$)`, 'i').test(lower) || lower.includes(`\n${a}`));
    (hit ? found : missing).push(section);
  }
  return { found, missing };
}

const clamp = (n) => Math.max(0, Math.min(100, Math.round(n)));

function analyzeLocally(resumeText, jobDescription = '') {
  const text = resumeText.replace(/\r/g, '');
  const lower = text.toLowerCase();
  const resumeTokens = new Set(tokenize(text));
  const words = text.split(/\s+/).filter(Boolean);

  // --- Keyword match ---
  let keywordMatch = null;
  let matchedKeywords = [];
  let missingKeywords = [];
  if (jobDescription) {
    const keywords = extractKeywords(jobDescription);
    matchedKeywords = keywords.filter((k) => resumeTokens.has(k));
    missingKeywords = keywords.filter((k) => !resumeTokens.has(k));
    keywordMatch = keywords.length ? clamp((matchedKeywords.length / keywords.length) * 100) : null;
  }

  // --- Sections ---
  const { found, missing } = detectSections(text);
  const core = ['experience', 'education', 'skills', 'projects', 'summary'];
  const coreFound = core.filter((s) => found.includes(s)).length;
  const sections = clamp((coreFound / core.length) * 100);

  // --- Formatting / completeness ---
  const hasEmail = /[\w.+-]+@[\w-]+\.[\w.]+/.test(text);
  const hasPhone = /(\+?\d[\d\s-]{8,}\d)/.test(text);
  const hasLinks = /(linkedin\.com|github\.com)/i.test(text);
  const bullets = (text.match(/^\s*[•\-*▪●]/gm) || []).length;
  let formatting = 0;
  formatting += hasEmail ? 25 : 0;
  formatting += hasPhone ? 15 : 0;
  formatting += hasLinks ? 20 : 0;
  formatting += bullets >= 5 ? 20 : bullets > 0 ? 10 : 0;
  formatting += words.length >= 250 && words.length <= 900 ? 20 : 8;

  // --- Impact ---
  const verbCount = ACTION_VERBS.filter((v) => lower.includes(v)).length;
  const numbers = (text.match(/\b\d+(\.\d+)?\s?(%|x|k|\+)?/g) || []).length;
  const impact = clamp(Math.min(verbCount, 10) * 6 + Math.min(numbers, 8) * 5);

  // --- Overall ---
  const score =
    keywordMatch === null
      ? clamp(sections * 0.3 + formatting * 0.35 + impact * 0.35)
      : clamp(keywordMatch * 0.4 + sections * 0.2 + formatting * 0.2 + impact * 0.2);

  // --- Feedback ---
  const strengths = [];
  const improvements = [];

  if (hasEmail && hasPhone) strengths.push('Contact details (email and phone) are present.');
  else improvements.push('Add a professional email and phone number at the top.');

  if (hasLinks) strengths.push('Includes LinkedIn or GitHub links.');
  else improvements.push('Add your LinkedIn and GitHub profile links.');

  if (found.length >= 4) strengths.push(`Good structure: found ${found.join(', ')} sections.`);
  if (missing.includes('summary')) improvements.push('Add a 2-3 line professional summary tailored to the role.');
  if (missing.includes('projects')) improvements.push('Add a Projects section with tech stack and outcomes.');
  if (missing.includes('skills')) improvements.push('Add a dedicated Skills section so ATS systems can find your keywords.');

  if (verbCount >= 6) strengths.push('Uses strong action verbs to describe work.');
  else improvements.push('Start bullet points with action verbs such as built, optimized, or delivered.');

  if (numbers >= 5) strengths.push('Includes measurable numbers to show impact.');
  else improvements.push('Quantify results (for example "reduced load time by 30%" or "served 500+ users").');

  if (words.length < 250) improvements.push('The resume is short. Add detail about projects, internships, and outcomes.');
  if (words.length > 900) improvements.push('The resume is long. Aim for one page for early-career roles.');

  if (keywordMatch !== null) {
    if (keywordMatch >= 70) strengths.push('Strong keyword alignment with the job description.');
    else improvements.push('Work the missing keywords into your skills and project bullets where they are true.');
  }

  return {
    score,
    breakdown: { keywordMatch, sections, formatting, impact },
    matchedKeywords,
    missingKeywords,
    sectionsFound: found,
    sectionsMissing: missing,
    strengths,
    improvements,
    rewriteSuggestions: [],
    summary:
      score >= 75
        ? 'Solid resume. A few targeted tweaks will make it stronger.'
        : score >= 50
        ? 'Decent foundation, but it needs clearer structure, keywords, and measurable impact.'
        : 'Needs significant work on structure, keywords, and impact.',
    stats: { wordCount: words.length, bulletCount: bullets },
  };
}

module.exports = { analyzeLocally };
