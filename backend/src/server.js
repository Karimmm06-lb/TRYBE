import app from './app.js'

const PORT = process.env.PORT ?? 3000

app.listen(PORT, () => {
  console.log(`\n🚀 TRYBE API démarrée sur http://localhost:${PORT}`)
  console.log(`   Environnement : ${process.env.NODE_ENV ?? 'development'}`)
  console.log(`   Santé : http://localhost:${PORT}/api/health\n`)
})
