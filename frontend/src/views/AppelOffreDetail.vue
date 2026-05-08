<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useAppelOffresStore } from '@/stores/appelOffres'
import Sidebar from '@/components/Sidebar.vue'
import ScoreGauge from '@/components/ScoreGauge.vue'
import { ArrowLeft, Calendar, Tag, Building, Cpu, FileText, Trash2, CheckCircle, Clock } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const store = useAppelOffresStore()

const loading = ref(true)
const ao = computed(() => store.current)

onMounted(async () => {
  if (!auth.user) await auth.fetchMe()
  await store.fetchOne(Number(route.params.id))
  loading.value = false
})

function formatDate(d: string | null) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
}

function scoreColor(score: number) {
  if (score >= 70) return '#10b981'
  if (score >= 40) return '#f59e0b'
  return '#f43f5e'
}

function statusLabel(s: string) {
  const map: Record<string, string> = {
    analyse: 'Analysé', pertinent: 'Pertinent',
    non_pertinent: 'Non pertinent', en_attente: 'En attente'
  }
  return map[s] ?? s
}

function statusBadge(s: string) {
  const map: Record<string, string> = {
    analyse: 'badge-analyse', pertinent: 'badge-pertinent',
    non_pertinent: 'badge-non-pertinent', en_attente: 'badge-attente'
  }
  return map[s] ?? 'badge-attente'
}

async function deleteAO() {
  if (!ao.value || !confirm('Supprimer définitivement cet appel d\'offres ?')) return
  await store.remove(ao.value.id)
  router.push('/appels-offres')
}

const infoItems = computed(() => {
  if (!ao.value) return []
  return [
    { label: 'Domaine', value: ao.value.domaine, icon: Tag },
    { label: 'Format', value: ao.value.format?.toUpperCase(), icon: FileText },
    { label: 'Source', value: ao.value.source, icon: Building },
    { label: 'Date limite', value: formatDate(ao.value.dateLimite), icon: Calendar },
    { label: 'Date d\'analyse', value: formatDate(ao.value.dateAnalyse), icon: Clock },
    { label: 'Budget estimé', value: ao.value.budget_estime ? `${ao.value.budget_estime.toLocaleString()} €` : null, icon: CheckCircle },
  ].filter(i => i.value)
})
</script>

<template>
  <div class="flex min-h-screen" style="background: #03030f;">
    <Sidebar />
    <main class="flex-1 ml-64 min-h-screen">

      <!-- Header -->
      <div class="sticky top-0 z-30 px-8 py-5 flex items-center gap-4"
           style="background: rgba(3,3,15,0.9); backdrop-filter: blur(20px); border-bottom: 1px solid rgba(255,255,255,0.05);">
        <button @click="router.push('/appels-offres')" class="p-2 rounded-xl transition-all"
                style="background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.07);"
                onmouseover="this.style.borderColor='rgba(0,212,255,0.2)'" onmouseout="this.style.borderColor='rgba(255,255,255,0.07)'">
          <ArrowLeft :size="18" style="color: #94a3b8;" />
        </button>
        <div class="flex-1">
          <h1 class="text-xl font-bold text-white truncate" style="font-family: 'Space Grotesk', sans-serif;">
            {{ ao?.titre ?? 'Chargement...' }}
          </h1>
        </div>
        <button @click="deleteAO" class="p-2.5 rounded-xl transition-all"
                style="background: rgba(244,63,94,0.05); border: 1px solid rgba(244,63,94,0.1);"
                onmouseover="this.style.background='rgba(244,63,94,0.15)'" onmouseout="this.style.background='rgba(244,63,94,0.05)'">
          <Trash2 :size="16" style="color: #f43f5e;" />
        </button>
      </div>

      <div class="p-8">
        <!-- Loading -->
        <div v-if="loading" class="flex items-center justify-center h-64">
          <div class="w-10 h-10 rounded-full border-2 animate-spin"
               style="border-color: rgba(0,212,255,0.2); border-top-color: #00d4ff;"></div>
        </div>

        <!-- Not found -->
        <div v-else-if="!ao" class="text-center py-20">
          <h2 class="text-xl font-bold text-white mb-4">Document introuvable</h2>
          <button @click="router.push('/appels-offres')" class="btn-ghost px-6 py-3">Retour à la liste</button>
        </div>

        <template v-else>
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

            <!-- Left: Score + info -->
            <div class="space-y-5">
              <!-- Score card -->
              <div class="glass-card-static p-6 flex flex-col items-center">
                <ScoreGauge v-if="ao.score !== null" :score="ao.score" :size="180" />
                <div v-else class="text-center py-8">
                  <Clock :size="40" class="mx-auto mb-3" style="color: #334155;" />
                  <div class="text-sm" style="color: #475569;">En attente d'analyse</div>
                </div>

                <div class="w-full mt-4">
                  <span :class="['badge w-full justify-center', statusBadge(ao.statut)]">{{ statusLabel(ao.statut) }}</span>
                </div>
              </div>

              <!-- Info -->
              <div class="glass-card-static p-5 space-y-3">
                <h3 class="text-sm font-semibold text-white mb-4" style="font-family: 'Space Grotesk', sans-serif;">Informations</h3>
                <div v-for="item in infoItems" :key="item.label" class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                       style="background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.07);">
                    <component :is="item.icon" :size="14" style="color: #475569;" />
                  </div>
                  <div>
                    <div class="text-xs" style="color: #475569;">{{ item.label }}</div>
                    <div class="text-sm font-medium text-white">{{ item.value }}</div>
                  </div>
                </div>
              </div>

              <!-- Competences -->
              <div v-if="ao.competences?.length" class="glass-card-static p-5">
                <h3 class="text-sm font-semibold text-white mb-4 flex items-center gap-2" style="font-family: 'Space Grotesk', sans-serif;">
                  <Cpu :size="15" style="color: #8b5cf6;" />
                  Compétences requises
                </h3>
                <div class="flex flex-wrap gap-2">
                  <span v-for="c in ao.competences" :key="c.id"
                        class="px-3 py-1.5 rounded-xl text-xs font-medium"
                        style="background: rgba(139,92,246,0.1); color: #8b5cf6; border: 1px solid rgba(139,92,246,0.2);">
                    {{ c.competence }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Right: Analysis -->
            <div class="lg:col-span-2 space-y-5">

              <!-- Summary -->
              <div v-if="ao.resume" class="glass-card-static p-6">
                <h3 class="text-sm font-semibold mb-4 uppercase tracking-widest" style="color: #475569;">Résumé IA</h3>
                <p class="leading-relaxed" style="color: #94a3b8; font-size: 15px; line-height: 1.8;">{{ ao.resume }}</p>
              </div>

              <!-- Justification -->
              <div v-if="ao.justification" class="glass-card-static p-6">
                <h3 class="text-sm font-semibold mb-4 uppercase tracking-widest" style="color: #475569;">Justification du score</h3>
                <div class="flex gap-4">
                  <div class="w-1 flex-shrink-0 rounded-full self-stretch"
                       :style="`background: ${ao.score !== null ? scoreColor(ao.score) : '#475569'}40;`"></div>
                  <p class="leading-relaxed" style="color: #94a3b8; font-size: 15px; line-height: 1.8;">{{ ao.justification }}</p>
                </div>
              </div>

              <!-- Score breakdown visual -->
              <div v-if="ao.score !== null" class="glass-card-static p-6">
                <h3 class="text-sm font-semibold mb-4 uppercase tracking-widest" style="color: #475569;">Niveau de pertinence</h3>
                <div class="space-y-3">
                  <div v-for="threshold in [
                    { label: 'Très pertinent (≥75)', min: 75, color: '#10b981' },
                    { label: 'Pertinent (≥60)', min: 60, color: '#34d399' },
                    { label: 'Moyen (≥40)', min: 40, color: '#f59e0b' },
                    { label: 'Faible (<40)', min: 0, color: '#f43f5e' },
                  ]" :key="threshold.label" class="flex items-center gap-3">
                    <div class="w-3 h-3 rounded-full flex-shrink-0" :style="`background: ${threshold.color};`"></div>
                    <span class="text-sm flex-1" style="color: #64748b;">{{ threshold.label }}</span>
                    <CheckCircle v-if="ao.score >= threshold.min"
                                 :size="16" :style="`color: ${threshold.color};`" />
                    <div v-else class="w-4 h-4 rounded-full border" style="border-color: rgba(255,255,255,0.1);"></div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </template>
      </div>
    </main>
  </div>
</template>
