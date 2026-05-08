import fs from 'fs'
import path from 'path'

export async function extractText(filePath) {
  const ext = path.extname(filePath).toLowerCase()

  if (ext === '.txt') {
    return fs.readFileSync(filePath, 'utf-8')
  }

  if (ext === '.pdf') {
    const pdfParse = (await import('pdf-parse')).default
    const buffer = fs.readFileSync(filePath)
    const data = await pdfParse(buffer)
    return data.text
  }

  if (ext === '.docx') {
    const mammoth = (await import('mammoth')).default
    const result = await mammoth.extractRawText({ path: filePath })
    return result.value
  }

  throw new Error(`Format non supporté : ${ext}`)
}

export function cleanText(text) {
  return text
    .replace(/\s+/g, ' ')
    .replace(/[^\x00-\x7FÀ-ÿ]/g, ' ')
    .trim()
    .slice(0, 12000)
}

export function getFormat(filePath) {
  const ext = path.extname(filePath).toLowerCase()
  const map = { '.pdf': 'pdf', '.docx': 'docx', '.txt': 'txt' }
  return map[ext] ?? 'unknown'
}
