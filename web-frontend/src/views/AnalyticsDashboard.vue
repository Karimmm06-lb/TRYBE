<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()

interface Stats {
  totalAnalyses: number
  totalAlertes: number
  scoreMoyen: number
  derniersTresPertinents: { id: number; titre: string; score: number; domaine: string; createdAt: string }[]
  evolutionHebdomadaire: { semaine: string; count: number }[]
  repartitionStatut: Record<string, number>
  repartitionDomaine: { domaine: string; count: number }[]
}

const stats = ref<Stats | null>(null)
const loading = ref(true)
const error = ref('')

onMounted(async () => {
  try {
    const token = localStorage.getItem('token')
    const res = await axios.get('/api/karim/stats', {
      headers: { Authorization: `Bearer ${token}` },
    })
    stats.value = res.data
  } catch {
    error.value = 'Impossible de charger les statistiques.'
  } finally {
    loading.value = false
  }
})

function scoreColor(score: number) {
  if (score >= 70) return '#10b981'
  if (score >= 40) return '#f59e0b'
  return '#f43f5e'
}

function statutColor(s: string): string {
  const map: Record<string, string> = {
    PERTINENT: '#10b981', ANALYSE: '#3b82f6',
    EN_ATTENTE: '#f59e0b', ARCHIVE: '#94a3b8'
  }
  return map[s] ?? '#e85d26'
}

function statutLabel(s: string): string {
  const map: Record<string, string> = {
    PERTINENT: 'Pertinent', ANALYSE: 'Analysé',
    EN_ATTENTE: 'En attente', ARCHIVE: 'Archivé'
  }
  return map[s] ?? s
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })
}

// Calcul de la hauteur max pour le graphe barre
function barHeight(count: number): number {
  if (!stats.value) return 0
  const max = Math.max(...stats.value.evolutionHebdomadaire.map(w => w.count), 1)
  return Math.round((count / max) * 100)
}
</script>

<template>
  <div class="min-h-screen bg-[#fdf6f0]">

    <!-- Header -->
    <header class="sticky top-0 z-50 bg-white border-b border-gray-200 h-16 flex items-center justify-between px-8">
      <div class="flex items-center gap-3">
        <button @click="router.push('/dashboard')"
                class="text-2xl font-extrabold text-[#e85d26] tracking-tight hover:opacity-80 transition-opacity">
          trybe
        </button>
        <span class="text-gray-300">|</span>
        <h1 class="text-gray-700 font-semibold">Analytics</h1>
      </div>
      <div class="flex items-center gap-2">
        <button @click="router.push('/appels-offres/nouveau')"
                class="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#e85d26] text-white text-sm font-bold hover:bg-[#c2410c] transition-colors">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Analyser un AO
        </button>
        <button @click="router.push('/dashboard')"
                class="text-sm text-gray-500 hover:text-gray-900 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors">
          ← Tableau de bord
        </button>
      </div>
    </header>

    <div class="max-w-6xl mx-auto px-6 py-10">

      <!-- Loading -->
      <div v-if="loading" class="flex items-center justify-center h-64">
        <div class="w-10 h-10 rounded-full border-4 border-[#fde8dc] border-t-[#e85d26] animate-spin"></div>
      </div>

      <!-- Error -->
      <div v-else-if="error" class="text-center py-20 text-red-500 font-medium">{{ error }}</div>

      <template v-else-if="stats">

        <!-- ── KPI Cards ── -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">

          <!-- Total analyses -->
          <div class="bg-white rounded-2xl border border-gray-200 p-6">
            <div class="flex items-start justify-between mb-4">
              <div class="w-10 h-10 rounded-xl bg-[#fde8dc] flex items-center justify-center">
                <svg class="w-5 h-5 text-[#e85d26]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
              </div>
              <span class="text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">Total</span>
            </div>
            <p class="text-4xl font-extrabold text-gray-900 mb-1">{{ stats.totalAnalyses }}</p>
            <p class="text-sm text-gray-400">AO analysés</p>
          </div>

          <!-- Score moyen -->
          <div class="bg-white rounded-2xl border border-gray-200 p-6">
            <div class="flex items-start justify-between mb-4">
              <div class="w-10 h-10 rounded-xl flex items-center justify-center"
                   :style="`background: ${scoreColor(stats.scoreMoyen)}18`">
                <svg class="w-5 h-5" :style="`color: ${scoreColor(stats.scoreMoyen)}`"
                     fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
                </svg>
              </div>
              <span class="text-xs font-semibold px-2 py-0.5 rounded-full"
                    :style="`color: ${scoreColor(stats.scoreMoyen)}; background: ${scoreColor(stats.scoreMoyen)}18`">
                /100
              </span>
            </div>
            <p class="text-4xl font-extrabold mb-1" :style="`color: ${scoreColor(stats.scoreMoyen)}`">
              {{ stats.scoreMoyen }}
            </p>
            <p class="text-sm text-gray-400">Score moyen IA</p>
          </div>

          <!-- Alertes -->
          <div class="bg-white rounded-2xl border border-gray-200 p-6">
            <div class="flex items-start justify-between mb-4">
              <div class="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                <svg class="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                </svg>
              </div>
              <button @click="router.push('/notifications')"
                      class="text-xs font-semibold text-blue-500 hover:underline">Voir tout</button>
            </div>
            <p class="text-4xl font-extrabold text-gray-900 mb-1">{{ stats.totalAlertes }}</p>
            <p class="text-sm text-gray-400">Alertes envoyées</p>
          </div>
        </div>

        <!-- ── Graphique évolution + Répartition statut ── -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">

          <!-- Évolution hebdomadaire -->
          <div class="lg:col-span-2 bg-white rounded-2xl border border-gray-200 p-6">
            <h2 class="text-sm font-bold text-gray-900 mb-1">Évolution des analyses</h2>
            <p class="text-xs text-gray-400 mb-6">Nombre d'AO analysés par semaine (8 dernières semaines)</p>
            <div class="flex items-end gap-2 h-36">
              <div v-for="week in stats.evolutionHebdomadaire" :key="week.semaine"
                   class="flex-1 flex flex-col items-center gap-1">
                <span class="text-xs font-bold text-gray-700">{{ week.count || '' }}</span>
                <div class="w-full rounded-t-lg transition-all duration-500"
                     :style="`height: ${barHeight(week.count)}%; background: ${week.count > 0 ? '#e85d26' : '#f1e8e2'}; min-height: 4px;`">
                </div>
                <span class="text-[10px] text-gray-400 text-center leading-tight">{{ week.semaine }}</span>
              </div>
            </div>
          </div>

          <!-- Répartition par statut -->
          <div class="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 class="text-sm font-bold text-gray-900 mb-1">Répartition statut</h2>
            <p class="text-xs text-gray-400 mb-5">Distribution des AO par statut</p>
            <div class="space-y-3">
              <div v-for="(count, statut) in stats.repartitionStatut" :key="statut">
                <div class="flex items-center justify-between mb-1">
                  <div class="flex items-center gap-2">
                    <div class="w-2.5 h-2.5 rounded-full" :style="`background: ${statutColor(String(statut))}`"></div>
                    <span class="text-xs font-medium text-gray-600">{{ statutLabel(String(statut)) }}</span>
                  </div>
                  <span class="text-xs font-bold text-gray-900">{{ count }}</span>
                </div>
                <div class="h-1.5 rounded-full bg-gray-100">
                  <div class="h-1.5 rounded-full transition-all duration-700"
                       :style="`width: ${Math.round((count / Math.max(stats!.totalAnalyses, 1)) * 100)}%;
                                background: ${statutColor(String(statut))}`"></div>
                </div>
              </div>
              <div v-if="Object.keys(stats.repartitionStatut).length === 0"
                   class="text-xs text-gray-400 text-center py-4">Aucune donnée</div>
            </div>
          </div>
        </div>

        <!-- ── Domaines + Derniers très pertinents ── -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">

          <!-- Top domaines -->
          <div class="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 class="text-sm font-bold text-gray-900 mb-1">Top domaines</h2>
            <p class="text-xs text-gray-400 mb-5">Répartition des AO par secteur</p>
            <div class="space-y-3">
              <div v-for="(d, i) in stats.repartitionDomaine" :key="d.domaine" class="flex items-center gap-3">
                <span class="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
                      style="background: #e85d26; opacity: 0.6"
                      :style="`opacity: ${1 - i * 0.12}`">
                  {{ i + 1 }}
                </span>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center justify-between mb-0.5">
                    <span class="text-xs font-medium text-gray-700 truncate">{{ d.domaine }}</span>
                    <span class="text-xs font-bold text-gray-900 ml-2 flex-shrink-0">{{ d.count }}</span>
                  </div>
                  <div class="h-1.5 rounded-full bg-gray-100">
                    <div class="h-1.5 rounded-full"
                         :style="`width: ${Math.round((d.count / (stats!.repartitionDomaine[0]?.count || 1)) * 100)}%;
                                  background: #e85d26; opacity: ${1 - i * 0.1}`"></div>
                  </div>
                </div>
              </div>
              <div v-if="stats.repartitionDomaine.length === 0"
                   class="text-xs text-gray-400 text-center py-4">Aucune donnée</div>
            </div>
          </div>

          <!-- Derniers très pertinents -->
          <div class="bg-white rounded-2xl border border-gray-200 p-6">
            <div class="flex items-center justify-between mb-1">
              <h2 class="text-sm font-bold text-gray-900">Très pertinents récents</h2>
              <span class="text-xs text-[#e85d26] font-semibold">Score ≥ 75</span>
            </div>
            <p class="text-xs text-gray-400 mb-5">Les 5 derniers AO hautement pertinents</p>
            <div class="space-y-3">
              <div v-for="ao in stats.derniersTresPertinents" :key="ao.id"
                   @click="router.push(`/appels-offres/${ao.id}`)"
                   class="flex items-center gap-3 p-3 rounded-xl hover:bg-[#fdf6f0] cursor-pointer transition-colors group">
                <!-- Score badge -->
                <div class="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                     style="background: #d1fae5">
                  <span class="text-sm font-extrabold text-green-700">{{ ao.score }}</span>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-semibold text-gray-800 truncate group-hover:text-[#e85d26] transition-colors">
                    {{ ao.titre }}
                  </p>
                  <p class="text-xs text-gray-400 mt-0.5">{{ ao.domaine }} · {{ formatDate(ao.createdAt) }}</p>
                </div>
                <svg class="w-4 h-4 text-gray-300 group-hover:text-[#e85d26] transition-colors flex-shrink-0"
                     fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </div>
              <div v-if="stats.derniersTresPertinents.length === 0"
                   class="text-xs text-gray-400 text-center py-8">
                Aucun AO très pertinent pour l'instant.
              </div>
            </div>
          </div>
        </div>

      </template>
    </div>
  </div>
</template>
