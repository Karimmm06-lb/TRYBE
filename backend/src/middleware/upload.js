import multer from 'multer'
import path from 'path'
import fs from 'fs'

const uploadDir = 'uploads'
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true })

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e6)}`
    cb(null, `${unique}${path.extname(file.originalname)}`)
  }
})

const fileFilter = (req, file, cb) => {
  const allowed = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain'
  ]
  const extAllowed = ['.pdf', '.docx', '.txt']
  const ext = path.extname(file.originalname).toLowerCase()
  if (allowed.includes(file.mimetype) || extAllowed.includes(ext)) {
    cb(null, true)
  } else {
    cb(new Error('Format non supporté. Utilisez PDF, DOCX ou TXT.'))
  }
}

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 20 * 1024 * 1024 }
})
