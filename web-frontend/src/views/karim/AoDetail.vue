<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'

const route = useRoute()
const router = useRouter()

const ao = ref<any>(null)
const loading = ref(true)
const actionLoading = ref(false)
const error = ref('')

const STATUTS_VALIDES = ['EN_ATTENTE', 'ANALYSE', 'PERTINENT', 'ARCHIVE']

onMounted(async () => {
  try {
    const token = localStorage.getItem('token')
    const res = await axios.get(`/api/karim/ao/${route.params.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    ao.value = res.data
  } catch {
    error.value = 'Impossible de charger cet appel d\'offres.'
  } finally {
    loading.value = false
  }
})

function scoreColor(score: number) {
  if (score >= 70) return '#10b981'
  if (score >= 40) return '#f59e0b'
  return '#f43f5e'
}

function scoreLabel(score: number) {
  if (score >= 75) return 'Très pertinent'
  if (score >= 60) return 'Pertinent'
  if (score >= 40) return 'Moyen'
  return 'Faible pertinence'
}

function statutLabel(s: string) {
  const map: Record<string, string> = {
    EN_ATTENTE: 'En attente', ANALYSE: 'Analysé',
    PERTINENT: 'Pertinent', ARCHIVE: 'Archivé'
  }
  return map[s] ?? s
}

function formatDate(d: string | null) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
}

async function setStatut(statut: string) {
  if (!ao.value) return
  actionLoading.value = true
  try {
    const token = localStorage.getItem('token')
    await axios.patch(`/api/karim/ao/${ao.value.id}/statut`, { statut }, {
      headers: { Authorization: `Bearer ${token}` },
    })
    ao.value.statut = statut
  } catch {
    alert('Erreur lors de la mise à jour du statut.')
  } finally {
    actionLoading.value = false
  }
}

async function exportPdf() {
  if (!ao.value) return
  actionLoading.value = true
  try {
    const token = localStorage.getItem('token')
    const res = await axios.get(`/api/karim/ao/${ao.value.id}/export`, {
      headers: { Authorization: `Bearer ${token}` },
      responseType: 'blob',
    })
    const url = URL.createObjectURL(res.data)
    const a = document.createElement('a')
    a.href = url
    a.download = `AO_${ao.value.id}_${ao.value.titre.slice(0, 40).replace(/[^a-zA-Z0-9]/g, '_')}.pdf`
    a.click()
    URL.revokeObjectURL(url)
  } catch {
    alert('Erreur lors de la génération du PDF.')
  } finally {
    actionLoading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-[#fdf6f0]">

    <!-- Header -->
    <header class="sticky top-0 z-50 bg-white border-b border-gray-200 h-16 flex items-center gap-4 px-8">
      <button @click="router.push('/dashboard')"
              class="p-2 rounded-xl border border-gray-200 text-gray-400 hover:text-gray-700 hover:border-gray-300 transition-all">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <span class="text-2xl font-extrabold text-[#e85d26] tracking-tight">trybe</span>
      <span class="text-gray-300">|</span>
      <span class="text-gray-600 text-sm font-medium truncate max-w-md">
        {{ ao?.titre || 'Chargement…' }}
      </span>

      <div class="ml-auto flex items-center gap-2">
        <!-- Export PDF -->
        <button @click="exportPdf" :disabled="actionLoading || !ao"
                class="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border border-[#e85d26] text-[#e85d26] hover:bg-[#fde8dc] transition-colors disabled:opacity-50">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round"
              d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
          </svg>
          Exporter PDF
        </button>
      </div>
    </header>

    <div class="max-w-5xl mx-auto px-6 py-10">

      <!-- Loading -->
      <div v-if="loading" class="flex items-center justify-center h-64">
        <div class="w-10 h-10 rounded-full border-4 border-[#fde8dc] border-t-[#e85d26] animate-spin"></div>
      </div>

      <!-- Error -->
      <div v-else-if="error" class="text-center py-20">
        <p class="text-red-500 font-medium mb-4">{{ error }}</p>
        <button @click="router.push('/dashboard')"
                class="px-6 py-2.5 rounded-xl bg-[#e85d26] text-white font-semibold text-sm">
          Retour au tableau de bord
        </button>
      </div>

      <template v-else-if="ao">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

          <!-- ── Colonne gauche ── -->
          <div class="space-y-4">

            <!-- Score card -->
            <div class="bg-white rounded-2xl border border-gray-200 p-6 text-center">
              <div v-if="ao.score !== null" class="mb-4">
                <!-- Cercle score SVG -->
                <div class="relative w-32 h-32 mx-auto mb-3">
                  <svg viewBox="0 0 120 120" class="w-full h-full -rotate-90">
                    <circle cx="60" cy="60" r="50" fill="none" stroke="#f1f5f9" stroke-width="10"/>
                    <circle cx="60" cy="60" r="50" fill="none"
                            :stroke="scoreColor(ao.score)" stroke-width="10"
                            stroke-linecap="round"
                            :stroke-dasharray="`${ao.score * 3.14} 314`"
                            class="transition-all duration-700"/>
                  </svg>
                  <div class="absolute inset-0 flex flex-col items-center justify-center">
                    <span class="text-3xl font-extrabold" :style="`color: ${scoreColor(ao.score)}`">
                      {{ ao.score }}
                    </span>
                    <span class="text-xs text-gray-400 font-medium">/100</span>
                  </div>
                </div>
                <p class="text-sm font-bold" :style="`color: ${scoreColor(ao.score)}`">
                  {{ scoreLabel(ao.score) }}
                </p>
              </div>
              <div v-else class="py-8 text-gray-400">
                <svg class="w-10 h-10 mx-auto mb-2 opacity-30" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p class="text-sm">En attente d'analyse</p>
              </div>

              <!-- Badge statut -->
              <span class="inline-block px-4 py-1.5 rounded-full text-sm font-bold w-full text-center"
                    :class="{
                      'bg-blue-100 text-blue-700': ao.statut === 'ANALYSE',
                      'bg-green-100 text-green-700': ao.statut === 'PERTINENT',
                      'bg-gray-100 text-gray-500': ao.statut === 'EN_ATTENTE' || ao.statut === 'ARCHIVE',
                    }">
                {{ statutLabel(ao.statut) }}
              </span>
            </div>

            <!-- Infos -->
            <div class="bg-white rounded-2xl border border-gray-200 p-5 space-y-3">
              <h3 class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Informations</h3>
              <div v-if="ao.domaine" class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center flex-shrink-0">
                  <svg class="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 6h.008v.008H6V6z" />
                  </svg>
                </div>
                <div>
                  <p class="text-[10px] text-gray-400 font-medium uppercase">Domaine</p>
                  <p class="text-sm font-semibold text-gray-800">{{ ao.domaine }}</p>
                </div>
              </div>
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center flex-shrink-0">
                  <svg class="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                  </svg>
                </div>
                <div>
                  <p class="text-[10px] text-gray-400 font-medium uppercase">Source</p>
                  <p class="text-sm font-semibold text-gray-800">{{ ao.sourceType === 'AUTO' ? 'Récupération auto' : 'Manuel' }}</p>
                </div>
              </div>
              <div v-if="ao.budgetEstime" class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center flex-shrink-0">
                  <svg class="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p class="text-[10px] text-gray-400 font-medium uppercase">Budget estimé</p>
                  <p class="text-sm font-semibold text-gray-800">{{ ao.budgetEstime }}</p>
                </div>
              </div>
              <div v-if="ao.dateLimite" class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center flex-shrink-0">
                  <svg class="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                  </svg>
                </div>
                <div>
                  <p class="text-[10px] text-gray-400 font-medium uppercase">Date limite</p>
                  <p class="text-sm font-semibold text-gray-800">{{ formatDate(ao.dateLimite) }}</p>
                </div>
              </div>
              <div v-if="ao.dateAnalyse" class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center flex-shrink-0">
                  <svg class="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p class="text-[10px] text-gray-400 font-medium uppercase">Date d'analyse</p>
                  <p class="text-sm font-semibold text-gray-800">{{ formatDate(ao.dateAnalyse) }}</p>
                </div>
              </div>
            </div>

            <!-- Compétences -->
            <div v-if="ao.competences?.length" class="bg-white rounded-2xl border border-gray-200 p-5">
              <h3 class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Compétences requises</h3>
              <div class="flex flex-wrap gap-2">
                <span v-for="c in ao.competences" :key="c"
                      class="px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#fde8dc] text-[#e85d26]">
                  {{ c }}
                </span>
              </div>
            </div>
          </div>

          <!-- ── Colonne droite ── -->
          <div class="lg:col-span-2 space-y-4">

            <!-- Résumé -->
            <div v-if="ao.resume" class="bg-white rounded-2xl border border-gray-200 p-6">
              <h3 class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Résumé IA</h3>
              <p class="text-gray-700 leading-relaxed text-[15px]">{{ ao.resume }}</p>
            </div>

            <!-- Justification -->
            <div v-if="ao.justification" class="bg-white rounded-2xl border border-gray-200 p-6">
              <h3 class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Justification du score</h3>
              <div class="flex gap-4">
                <div class="w-1 flex-shrink-0 rounded-full self-stretch"
                     :style="`background: ${ao.score !== null ? scoreColor(ao.score) : '#94a3b8'}40`"></div>
                <p class="text-gray-600 leading-relaxed text-[15px]">{{ ao.justification }}</p>
              </div>
            </div>

            <!-- Niveau de pertinence -->
            <div v-if="ao.score !== null" class="bg-white rounded-2xl border border-gray-200 p-6">
              <h3 class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Niveau de pertinence</h3>
              <div class="space-y-3">
                <div v-for="threshold in [
                  { label: 'Très pertinent (≥75)', min: 75, color: '#10b981' },
                  { label: 'Pertinent (≥60)', min: 60, color: '#34d399' },
                  { label: 'Moyen (≥40)', min: 40, color: '#f59e0b' },
                  { label: 'Faible (<40)', min: 0, color: '#f43f5e' },
                ]" :key="threshold.label" class="flex items-center gap-3">
                  <div class="w-3 h-3 rounded-full flex-shrink-0" :style="`background: ${threshold.color}`"></div>
                  <span class="text-sm flex-1 text-gray-500">{{ threshold.label }}</span>
                  <svg v-if="ao.score >= threshold.min" class="w-4 h-4" :style="`color: ${threshold.color}`"
                       fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div v-else class="w-4 h-4 rounded-full border border-gray-200"></div>
                </div>
              </div>
            </div>

            <!-- Actions -->
            <div class="bg-white rounded-2xl border border-gray-200 p-5">
              <h3 class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Actions</h3>
              <div class="flex flex-wrap gap-3">
                <button v-if="ao.statut !== 'PERTINENT'"
                        @click="setStatut('PERTINENT')" :disabled="actionLoading"
                        class="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border border-green-200 text-green-700 bg-green-50 hover:bg-green-100 transition-colors disabled:opacity-50">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Marquer pertinent
                </button>
                <button v-if="ao.statut !== 'ARCHIVE'"
                        @click="setStatut('ARCHIVE')" :disabled="actionLoading"
                        class="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border border-gray-200 text-gray-500 bg-gray-50 hover:bg-gray-100 transition-colors disabled:opacity-50">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                  </svg>
                  Archiver
                </button>
                <button v-if="['ARCHIVE'].includes(ao.statut)"
                        @click="setStatut('EN_ATTENTE')" :disabled="actionLoading"
                        class="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border border-[#e85d26] text-[#e85d26] bg-[#fde8dc] hover:bg-[#fbd5c5] transition-colors disabled:opacity-50">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                  </svg>
                  Remettre en actif
                </button>
              </div>
            </div>

          </div>
        </div>
      </template>
    </div>
  </div>
</template>
