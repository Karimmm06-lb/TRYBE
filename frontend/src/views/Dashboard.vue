<script setup lang="ts">
import { onMounted, computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useAppelOffresStore } from '@/stores/appelOffres'
import Sidebar from '@/components/Sidebar.vue'
import { FileText, TrendingUp, CheckCircle, Clock, Upload, Bell, ArrowRight, ExternalLink, RefreshCw } from 'lucide-vue-next'

const router = useRouter()
const auth = useAuthStore()
const store = useAppelOffresStore()

const loading = ref(true)

onMounted(async () => {
  if (!auth.user) await auth.fetchMe()
  await store.fetchAll()
  loading.value = false
})

const stats = computed(() => store.getDashboardStats())

const recent = computed(() => store.list.slice(0, 6))

function scoreColor(score: number | null) {
  if (score === null) return '#64748b'
  if (score >= 70) return '#10b981'
  if (score >= 40) return '#f59e0b'
  return '#f43f5e'
}

function scoreBg(score: number | null) {
  if (score === null) return 'rgba(100,116,139,0.1)'
  if (score >= 70) return 'rgba(16,185,129,0.12)'
  if (score >= 40) return 'rgba(245,158,11,0.12)'
  return 'rgba(244,63,94,0.12)'
}

function statusBadge(statut: string) {
  const map: Record<string, string> = {
    'analyse': 'badge-analyse',
    'pertinent': 'badge-pertinent',
    'non_pertinent': 'badge-non-pertinent',
    'en_attente': 'badge-attente'
  }
  return map[statut] ?? 'badge-attente'
}

function statusLabel(statut: string) {
  const map: Record<string, string> = {
    'analyse': 'Analysé',
    'pertinent': 'Pertinent',
    'non_pertinent': 'Non pertinent',
    'en_attente': 'En attente'
  }
  return map[statut] ?? statut
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
}

const greetingName = computed(() => auth.user?.email?.split('@')[0] ?? 'vous')

const statCards = computed(() => [
  {
    label: 'Total AOs',
    value: stats.value.total,
    icon: FileText,
    color: '#00d4ff',
    bg: 'rgba(0,212,255,0.08)',
    suffix: ''
  },
  {
    label: 'Documents analysés',
    value: stats.value.analyses,
    icon: CheckCircle,
    color: '#10b981',
    bg: 'rgba(16,185,129,0.08)',
    suffix: ''
  },
  {
    label: 'Score moyen',
    value: stats.value.avgScore,
    icon: TrendingUp,
    color: '#8b5cf6',
    bg: 'rgba(139,92,246,0.08)',
    suffix: '/100'
  },
  {
    label: 'Pertinents (≥60)',
    value: stats.value.pertinents,
    icon: Clock,
    color: '#f59e0b',
    bg: 'rgba(245,158,11,0.08)',
    suffix: ''
  }
])
</script>

<template>
  <div class="flex min-h-screen" style="background: #03030f;">
    <Sidebar />

    <!-- Main content -->
    <main class="flex-1 ml-64 min-h-screen">
      <!-- Header -->
      <div class="sticky top-0 z-30 px-8 py-5 flex items-center justify-between"
           style="background: rgba(3,3,15,0.9); backdrop-filter: blur(20px); border-bottom: 1px solid rgba(255,255,255,0.05);">
        <div>
          <h1 class="text-xl font-bold text-white" style="font-family: 'Space Grotesk', sans-serif;">
            Bonjour, <span class="gradient-text-cyan">{{ greetingName }}</span> 👋
          </h1>
          <p class="text-sm mt-0.5" style="color: #475569;">Voici un aperçu de votre activité.</p>
        </div>
        <div class="flex items-center gap-3">
          <button @click="router.push('/notifications')" class="relative p-2.5 rounded-xl transition-all"
                  style="background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.07);"
                  onmouseover="this.style.borderColor='rgba(0,212,255,0.2)'" onmouseout="this.style.borderColor='rgba(255,255,255,0.07)'">
            <Bell :size="18" style="color: #94a3b8;" />
          </button>
          <button @click="router.push('/upload')" class="btn-neon flex items-center gap-2 text-sm px-5 py-2.5">
            <Upload :size="16" />
            Analyser un AO
          </button>
        </div>
      </div>

      <div class="p-8">
        <!-- Loading state -->
        <div v-if="loading" class="flex items-center justify-center h-64">
          <div class="flex flex-col items-center gap-4">
            <div class="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin"
                 style="border-color: rgba(0,212,255,0.2); border-top-color: #00d4ff;"></div>
            <p class="text-sm" style="color: #475569;">Chargement...</p>
          </div>
        </div>

        <template v-else>
          <!-- Stats Cards -->
          <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
            <div v-for="(card, i) in statCards" :key="i" class="stat-card animate-slide-up"
                 :style="`animation-delay: ${i * 0.1}s;`">
              <div class="flex items-start justify-between mb-4">
                <div class="w-11 h-11 rounded-xl flex items-center justify-center"
                     :style="`background: ${card.bg}; border: 1px solid ${card.color}25;`">
                  <component :is="card.icon" :size="20" :style="`color: ${card.color};`" />
                </div>
                <span class="text-xs px-2 py-1 rounded-full" :style="`background: ${card.bg}; color: ${card.color}; border: 1px solid ${card.color}20;`">
                  +{{ Math.floor(Math.random() * 12) + 1 }}%
                </span>
              </div>
              <div class="text-3xl font-black text-white mb-1" style="font-family: 'Space Grotesk', sans-serif;">
                {{ card.value }}{{ card.suffix }}
              </div>
              <div class="text-sm" style="color: #475569;">{{ card.label }}</div>
            </div>
          </div>

          <!-- Score distribution bar -->
          <div v-if="store.list.length > 0" class="glass-card-static p-6 mb-8 animate-slide-up delay-300">
            <h2 class="text-sm font-semibold text-white mb-4">Distribution des scores</h2>
            <div class="flex gap-3 items-end h-16">
              <div v-for="range in [
                { label: '0-30', count: store.list.filter(a => a.score !== null && a.score < 30).length, color: '#f43f5e' },
                { label: '30-60', count: store.list.filter(a => a.score !== null && a.score >= 30 && a.score < 60).length, color: '#f59e0b' },
                { label: '60-80', count: store.list.filter(a => a.score !== null && a.score >= 60 && a.score < 80).length, color: '#10b981' },
                { label: '80+', count: store.list.filter(a => a.score !== null && a.score >= 80).length, color: '#00d4ff' },
              ]" :key="range.label" class="flex-1 flex flex-col items-center gap-2">
                <span class="text-xs font-semibold" :style="`color: ${range.color};`">{{ range.count }}</span>
                <div class="w-full rounded-t-lg transition-all duration-1000"
                     :style="`height: ${Math.max(8, (range.count / Math.max(store.list.length, 1)) * 48)}px; background: ${range.color}30; border: 1px solid ${range.color}40;`"></div>
                <span class="text-xs" style="color: #475569;">{{ range.label }}</span>
              </div>
            </div>
          </div>

          <!-- Empty state -->
          <div v-if="store.list.length === 0" class="glass-card-static p-16 text-center mb-8 animate-fade-in">
            <div class="w-20 h-20 mx-auto mb-6 rounded-3xl flex items-center justify-center"
                 style="background: rgba(0,212,255,0.08); border: 1px solid rgba(0,212,255,0.15);">
              <FileText :size="36" style="color: #00d4ff; opacity: 0.7;" />
            </div>
            <h3 class="text-xl font-bold text-white mb-2" style="font-family: 'Space Grotesk', sans-serif;">Aucun appel d'offres</h3>
            <p class="text-sm mb-8" style="color: #475569;">Importez votre premier document pour commencer l'analyse.</p>
            <button @click="router.push('/upload')" class="btn-neon flex items-center gap-2 mx-auto px-6 py-3">
              <Upload :size="16" />
              Analyser un document
            </button>
          </div>

          <!-- Recent AOs table -->
          <div v-else class="glass-card-static overflow-hidden animate-slide-up delay-400">
            <div class="px-6 py-5 flex items-center justify-between"
                 style="border-bottom: 1px solid rgba(255,255,255,0.05);">
              <h2 class="font-semibold text-white" style="font-family: 'Space Grotesk', sans-serif;">Appels d'offres récents</h2>
              <button @click="router.push('/appels-offres')" class="flex items-center gap-1 text-sm transition-colors"
                      style="color: #00d4ff;" onmouseover="this.style.color='#33ddff'" onmouseout="this.style.color='#00d4ff'">
                Voir tout <ArrowRight :size="14" />
              </button>
            </div>
            <table class="data-table">
              <thead>
                <tr>
                  <th>Titre</th>
                  <th>Domaine</th>
                  <th>Score</th>
                  <th>Statut</th>
                  <th>Date</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="ao in recent" :key="ao.id" class="cursor-pointer" @click="router.push(`/appels-offres/${ao.id}`)">
                  <td>
                    <div class="font-medium text-white truncate max-w-52">{{ ao.titre }}</div>
                  </td>
                  <td>
                    <span class="text-sm" style="color: #64748b;">{{ ao.domaine ?? '—' }}</span>
                  </td>
                  <td>
                    <div v-if="ao.score !== null" class="flex items-center gap-2">
                      <span class="text-lg font-bold" :style="`color: ${scoreColor(ao.score)};`">{{ ao.score }}</span>
                      <div class="w-16 progress-bar-track">
                        <div class="progress-bar-fill" :style="`width: ${ao.score}%; background: linear-gradient(90deg, ${scoreColor(ao.score)}, ${scoreColor(ao.score)}99);`"></div>
                      </div>
                    </div>
                    <span v-else class="text-sm" style="color: #334155;">—</span>
                  </td>
                  <td>
                    <span :class="['badge', statusBadge(ao.statut)]">{{ statusLabel(ao.statut) }}</span>
                  </td>
                  <td>
                    <span class="text-sm" style="color: #475569;">{{ formatDate(ao.createdAt) }}</span>
                  </td>
                  <td>
                    <ExternalLink :size="14" style="color: #334155;" />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </template>
      </div>
    </main>
  </div>
</template>
