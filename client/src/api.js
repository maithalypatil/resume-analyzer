export async function analyzeResume(file, jobDescription) {
  const form = new FormData();
  form.append('resume', file);
  form.append('jobDescription', jobDescription || '');

  const res = await fetch('/api/analyze', { method: 'POST', body: form });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || 'Analysis failed. Please try again.');
  }
  return data;
}
