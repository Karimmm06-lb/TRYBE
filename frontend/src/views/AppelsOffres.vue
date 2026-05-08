<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useAppelOffresStore } from '@/stores/appelOffres'
import Sidebar from '@/components/Sidebar.vue'
import { Search, Filter, Upload, Trash2, ExternalLink, FileText, ChevronDown, X } from 'lucide-vue-next'

const router = useRouter()
const auth = useAuthStore()
const store = useAppelOffresStore()

const search = ref('')
const filterStatut = ref('all')
const sortBy = ref('date')
const showFilters = ref(false)
const deleting = ref<number | null>(null)

onMounted(async () => {
  if (!auth.user) await auth.fetchMe()
  await store.fetchAll()
})

const filtered = computed(() => {
  let list = [...store.list]
  if (search.value) {
    const q = search.value.toLowerCase()
    list = list.filter(a => a.titre.toLowerCase().includes(q) || (a.domaine ?? '').toLowerCase().includes(q))
  }
  if (filterStatut.value !== 'all') {
    list = list.filter(a => a.statut === filterStatut.value)
  }
  if (sortBy.value === 'score') {
    list.sort((a, b) => (b.score ?? -1) - (a.score ?? -1))
  } else if (sortBy.value === 'score_asc') {
    list.sort((a, b) => (a.score ?? 101) - (b.score ?? 101))
  } else {
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }
  return list
})

function scoreColor(score: number | null) {
  if (score === null) return '#475569'
  if (score >= 70) return '#10b981'
  if (score >= 40) return '#f59e0b'
  return '#f43f5e'
}

function statusBadge(s: string) {
  const map: Record<string, string> = {
    analyse: 'badge-analyse', pertinent: 'badge-pertinent',
    non_pertinent: 'badge-non-pertinent', en_attente: 'badge-attente'
  }
  return map[s] ?? 'badge-attente'
}

function statusLabel(s: string) {
  const map: Record<string, string> = {
    analyse: 'Analysé', pertinent: 'Pertinent',
    non_pertinent: 'Non pertinent', en_attente: 'En attente'
  }
  return map[s] ?? s
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
}

async function deleteAO(id: number, e: Event) {
  e.stopPropagation()
  if (!confirm('Supprimer cet appel d\'offres ?')) return
  deleting.value = id
  try {
    await store.remove(id)
  } finally {
    deleting.value = null
  }
}
</script>

<template>
  <div class="flex min-h-screen" style="background: #03030f;">
    <Sidebar />
    <main class="flex-1 ml-64 min-h-screen">

      <!-- Header -->
      <div class="sticky top-0 z-30 px-8 py-5 flex items-center justify-between"
           style="background: rgba(3,3,15,0.9); backdrop-filter: blur(20px); border-bottom: 1px solid rgba(255,255,255,0.05);">
        <div>
          <h1 class="text-xl font-bold text-white" style="font-family: 'Space Grotesk', sans-serif;">Appels d'offres</h1>
          <p class="text-sm mt-0.5" style="color: #475569;">{{ store.list.length }} document{{ store.list.length > 1 ? 's' : '' }} au total</p>
        </div>
        <button @click="router.push('/upload')" class="btn-neon flex items-center gap-2 text-sm px-5 py-2.5">
          <Upload :size="16" />
          Analyser
        </button>
      </div>

      <div class="p-8">
        <!-- Search + filters -->
        <div class="flex flex-col sm:flex-row gap-3 mb-6 animate-slide-up">
          <div class="relative flex-1">
            <Search :size="16" class="absolute left-4 top-1/2 -translate-y-1/2" style="color: #475569;" />
            <input v-model="search" placeholder="Rechercher par titre, domaine..."
                   class="input-neon pl-11 w-full" />
            <button v-if="search" @click="search = ''" class="absolute right-4 top-1/2 -translate-y-1/2" style="color: #475569;">
              <X :size="14" />
            </button>
          </div>

          <div class="relative">
            <select v-model="filterStatut" class="input-neon appearance-none pr-10 cursor-pointer" style="width: 180px;">
              <option value="all">Tous les statuts</option>
              <option value="en_attente">En attente</option>
              <option value="analyse">Analysé</option>
              <option value="pertinent">Pertinent</option>
              <option value="non_pertinent">Non pertinent</option>
            </select>
            <ChevronDown :size="14" class="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style="color: #475569;" />
          </div>

          <div class="relative">
            <select v-model="sortBy" class="input-neon appearance-none pr-10 cursor-pointer" style="width: 180px;">
              <option value="date">Trier par date</option>
              <option value="score">Score (desc)</option>
              <option value="score_asc">Score (asc)</option>
            </select>
            <ChevronDown :size="14" class="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style="color: #475569;" />
          </div>
        </div>

        <!-- Empty state -->
        <div v-if="filtered.length === 0" class="glass-card-static p-16 text-center animate-fade-in">
          <FileText :size="48" class="mx-auto mb-4" style="color: #1e293b;" />
          <h3 class="text-xl font-bold text-white mb-2" style="font-family: 'Space Grotesk', sans-serif;">
            {{ search || filterStatut !== 'all' ? 'Aucun résultat' : 'Aucun appel d\'offres' }}
          </h3>
          <p class="text-sm mb-6" style="color: #475569;">
            {{ search || filterStatut !== 'all' ? 'Modifiez vos filtres.' : 'Importez votre premier document.' }}
          </p>
          <button v-if="!search && filterStatut === 'all'" @click="router.push('/upload')" class="btn-neon px-6 py-2.5 text-sm mx-auto">
            Analyser un document
          </button>
        </div>

        <!-- Grid cards -->
        <div v-else class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <div v-for="ao in filtered" :key="ao.id"
               class="glass-card p-5 cursor-pointer group relative animate-slide-up"
               @click="router.push(`/appels-offres/${ao.id}`)">

            <!-- Score circle -->
            <div class="flex items-start justify-between mb-4">
              <div v-if="ao.score !== null"
                   class="w-14 h-14 rounded-2xl flex flex-col items-center justify-center"
                   :style="`background: ${ao.score >= 70 ? 'rgba(16,185,129,0.12)' : ao.score >= 40 ? 'rgba(245,158,11,0.12)' : 'rgba(244,63,94,0.12)'}; border: 1px solid ${scoreColor(ao.score)}30;`">
                <span class="text-xl font-black" :style="`color: ${scoreColor(ao.score)}; font-family: 'Space Grotesk';`">{{ ao.score }}</span>
                <span class="text-xs" :style="`color: ${scoreColor(ao.score)}; opacity: 0.7;`">/100</span>
              </div>
              <div v-else class="w-14 h-14 rounded-2xl flex items-center justify-center"
                   style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07);">
                <FileText :size="22" style="color: #334155;" />
              </div>

              <div class="flex items-center gap-2">
                <span :class="['badge', statusBadge(ao.statut)]">{{ statusLabel(ao.statut) }}</span>
                <button @click="deleteAO(ao.id, $event)"
                        class="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg"
                        style="color: #475569;" onmouseover="this.style.color='#f43f5e'" onmouseout="this.style.color='#475569'">
                  <div v-if="deleting === ao.id" class="spinner w-4 h-4"></div>
                  <Trash2 v-else :size="14" />
                </button>
              </div>
            </div>

            <!-- Title -->
            <h3 class="font-semibold text-white mb-1 leading-snug line-clamp-2">{{ ao.titre }}</h3>

            <!-- Domain -->
            <div v-if="ao.domaine" class="text-sm mb-3" style="color: #475569;">{{ ao.domaine }}</div>

            <!-- Competences preview -->
            <div v-if="ao.competences?.length" class="flex flex-wrap gap-1.5 mb-4">
              <span v-for="c in ao.competences.slice(0, 3)" :key="c.id"
                    class="px-2 py-0.5 rounded-full text-xs"
                    style="background: rgba(139,92,246,0.08); color: #8b5cf6; border: 1px solid rgba(139,92,246,0.15);">
                {{ c.competence }}
              </span>
              <span v-if="ao.competences.length > 3" class="px-2 py-0.5 rounded-full text-xs" style="color: #334155;">
                +{{ ao.competences.length - 3 }}
              </span>
            </div>

            <!-- Footer -->
            <div class="flex items-center justify-between mt-auto pt-3"
                 style="border-top: 1px solid rgba(255,255,255,0.05);">
              <span class="text-xs" style="color: #334155;">{{ formatDate(ao.createdAt) }}</span>
              <ExternalLink :size="14" class="opacity-0 group-hover:opacity-100 transition-opacity" style="color: #00d4ff;" />
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>
