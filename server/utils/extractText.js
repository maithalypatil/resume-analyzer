const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

async function extractText(file) {
  const name = (file.originalname || '').toLowerCase();
  const type = file.mimetype;

  if (type === 'application/pdf' || name.endsWith('.pdf')) {
    const data = await pdfParse(file.buffer);
    return data.text;
  }

  if (
    type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    name.endsWith('.docx')
  ) {
    const result = await mammoth.extractRawText({ buffer: file.buffer });
    return result.value;
  }

  throw new Error('Unsupported file type. Upload a PDF or DOCX file.');
}

module.exports = { extractText };
