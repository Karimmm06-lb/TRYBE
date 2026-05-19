import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'

export interface Competence {
  id: number
  competence: string
}

export interface AppelOffre {
  id: number
  titre: string
  domaine: string | null
  fichierPath: string | null
  format: string | null
  statut: string
  score: number | null
  resume: string | null
  justification: string | null
  budget_estime: number | null
  dateLimite: string | null
  source: string
  dateAnalyse: string | null
  createdAt: string
  competences: Competence[]
  profil?: { nomProfil: string } | null
}

export interface Profil {
  id: number
  nomProfil: string
  domaines: string | null
  competences: string | null
  budgetMin: number | null
  seuilAlerte: number
  seuilTresRelevant: number
}

export const useAppelOffresStore = defineStore('appelOffres', () => {
  const list = ref<AppelOffre[]>([])
  const current = ref<AppelOffre | null>(null)
  const profils = ref<Profil[]>([])
  const loading = ref(false)
  const analyzing = ref(false)

  async function fetchAll() {
    loading.value = true
    try {
      const res = await axios.get('/api/appels-offres')
      list.value = res.data
    } finally {
      loading.value = false
    }
  }

  async function fetchOne(id: number) {
    const res = await axios.get(`/api/appels-offres/${id}`)
    current.value = res.data
  }

  async function upload(file: File, profilId?: number): Promise<AppelOffre> {
    analyzing.value = true
    try {
      const form = new FormData()
      form.append('file', file)
      if (profilId) form.append('profil_id', String(profilId))
      const res = await axios.post('/api/appels-offres/upload', form, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      list.value.unshift(res.data)
      return res.data
    } finally {
      analyzing.value = false
    }
  }

  async function remove(id: number) {
    await axios.delete(`/api/appels-offres/${id}`)
    list.value = list.value.filter(a => a.id !== id)
  }

  async function updateStatut(id: number, statut: string) {
    const res = await axios.patch(`/api/appels-offres/${id}/statut`, { statut })
    if (current.value?.id === id) current.value = res.data
    const idx = list.value.findIndex(a => a.id === id)
    if (idx !== -1) list.value[idx] = res.data
    return res.data
  }

  async function exportPdf(id: number, titre: string) {
    const res = await axios.get(`/api/appels-offres/${id}/export`, { responseType: 'blob' })
    const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }))
    const a = document.createElement('a')
    a.href = url
    a.download = `trybe-ao-${id}-${titre.slice(0, 30).replace(/[^a-z0-9]/gi, '-')}.pdf`
    a.click()
    URL.revokeObjectURL(url)
  }

  async function fetchProfils() {
    const res = await axios.get('/api/profils')
    profils.value = res.data
  }

  async function createProfil(data: Partial<Profil>) {
    const res = await axios.post('/api/profils', data)
    profils.value.push(res.data)
    return res.data
  }

  async function updateProfil(id: number, data: Partial<Profil>) {
    const res = await axios.put(`/api/profils/${id}`, data)
    const idx = profils.value.findIndex(p => p.id === id)
    if (idx !== -1) profils.value[idx] = res.data
  }

  async function deleteProfil(id: number) {
    await axios.delete(`/api/profils/${id}`)
    profils.value = profils.value.filter(p => p.id !== id)
  }

  function getDashboardStats() {
    const total = list.value.length
    const analyses = list.value.filter(a => a.score !== null).length
    const pertinents = list.value.filter(a => a.score !== null && a.score >= 60).length
    const scores = list.value.filter(a => a.score !== null).map(a => a.score as number)
    const avgScore = scores.length ? Math.round(scores.reduce((s, n) => s + n, 0) / scores.length) : 0
    return { total, analyses, pertinents, avgScore }
  }

  return {
    list, current, profils, loading, analyzing,
    fetchAll, fetchOne, upload, remove, updateStatut, exportPdf,
    fetchProfils, createProfil, updateProfil, deleteProfil,
    getDashboardStats
  }
})
