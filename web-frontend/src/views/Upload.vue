<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()

// ── State ────────────────────────────────────────────────────────────────────
const step = ref<1 | 2 | 3>(1)
const file = ref<File | null>(null)
const dragging = ref(false)
const loading = ref(false)
const error = ref('')
const result = ref<any>(null)

// ── Drag & Drop ──────────────────────────────────────────────────────────────
function onDrop(e: DragEvent) {
  dragging.value = false
  const f = e.dataTransfer?.files?.[0]
  if (f) selectFile(f)
}

function onFileInput(e: Event) {
  const f = (e.target as HTMLInputElement).files?.[0]
  if (f) selectFile(f)
}

function selectFile(f: File) {
  const allowed = ['application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain']
  if (!allowed.includes(f.type) && !f.name.match(/\.(pdf|docx|txt)$/i)) {
    error.value = 'Format non supporté. Seuls PDF, DOCX et TXT sont acceptés.'
    return
  }
  error.value = ''
  file.value = f
  step.value = 2
}

function removeFile() {
  file.value = null
  step.value = 1
  error.value = ''
}

// ── Submit ───────────────────────────────────────────────────────────────────
async function submit() {
  if (!file.value) return
  loading.value = true
  error.value = ''
  step.value = 3

  const form = new FormData()
  form.append('fichier', file.value)

  try {
    const token = localStorage.getItem('token')
    const res = await axios.post('/api/karim/upload', form, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${token}`,
      },
    })
    result.value = res.data.ao
  } catch (e: any) {
    error.value = e.response?.data?.error || 'Erreur lors de l\'analyse.'
    step.value = 2
  } finally {
    loading.value = false
  }
}

// ── Helpers ──────────────────────────────────────────────────────────────────
const fileSize = computed(() => {
  if (!file.value) return ''
  const kb = file.value.size / 1024
  return kb > 1024 ? `${(kb / 1024).toFixed(1)} Mo` : `${Math.round(kb)} Ko`
})

const fileIcon = computed(() => {
  if (!file.value) return '📄'
  if (file.value.name.endsWith('.pdf')) return '📕'
  if (file.value.name.endsWith('.docx')) return '📘'
  return '📄'
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
</script>

<template>
  <div class="min-h-screen bg-[#fdf6f0]">

    <!-- Header -->
    <header class="sticky top-0 z-50 bg-white border-b border-gray-200 h-16 flex items-center justify-between px-8">
      <button @click="router.push('/dashboard')"
              class="text-2xl font-extrabold text-[#e85d26] tracking-tight hover:opacity-80 transition-opacity">
        trybe
      </button>
      <div class="flex items-center gap-3">
        <button @click="router.push('/dashboard')"
                class="text-sm text-gray-500 hover:text-gray-900 transition-colors px-3 py-1.5 rounded-lg hover:bg-gray-100">
          ← Tableau de bord
        </button>
      </div>
    </header>

    <div class="max-w-2xl mx-auto px-4 py-12">

      <!-- Titre -->
      <div class="mb-10">
        <h1 class="text-3xl font-extrabold text-gray-900 tracking-tight">Analyser un appel d'offres</h1>
        <p class="mt-2 text-gray-500">Importez votre document — l'IA extrait, score et classe automatiquement.</p>
      </div>

      <!-- Stepper -->
      <div class="flex items-center gap-0 mb-10">
        <div v-for="(s, i) in ['Sélection', 'Confirmation', 'Résultat']" :key="i"
             class="flex items-center">
          <div class="flex items-center gap-2">
            <div class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all"
                 :class="step > i + 1 ? 'bg-[#e85d26] text-white'
                   : step === i + 1 ? 'bg-[#e85d26] text-white ring-4 ring-[#fde8dc]'
                   : 'bg-gray-200 text-gray-400'">
              <svg v-if="step > i + 1" class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <span v-else>{{ i + 1 }}</span>
            </div>
            <span class="text-xs font-semibold"
                  :class="step === i + 1 ? 'text-[#e85d26]' : step > i + 1 ? 'text-gray-700' : 'text-gray-400'">
              {{ s }}
            </span>
          </div>
          <div v-if="i < 2" class="w-12 h-px mx-3"
               :class="step > i + 1 ? 'bg-[#e85d26]' : 'bg-gray-200'"></div>
        </div>
      </div>

      <!-- ── Étape 1 : Drop zone ── -->
      <div v-if="step === 1"
           class="bg-white rounded-2xl border-2 border-dashed transition-all p-12 text-center cursor-pointer"
           :class="dragging ? 'border-[#e85d26] bg-[#fdf6f0]' : 'border-gray-200 hover:border-[#e85d26] hover:bg-[#fffaf7]'"
           @dragover.prevent="dragging = true"
           @dragleave="dragging = false"
           @drop.prevent="onDrop"
           @click="($refs.fileInput as HTMLInputElement).click()">
        <input ref="fileInput" type="file" accept=".pdf,.docx,.txt" class="hidden" @change="onFileInput" />
        <div class="w-16 h-16 rounded-2xl bg-[#fde8dc] flex items-center justify-center mx-auto mb-5">
          <svg class="w-8 h-8 text-[#e85d26]" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round"
              d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
          </svg>
        </div>
        <p class="font-bold text-gray-900 text-lg mb-1">Glissez votre fichier ici</p>
        <p class="text-gray-400 text-sm mb-4">ou cliquez pour parcourir</p>
        <div class="flex items-center justify-center gap-2">
          <span v-for="fmt in ['PDF', 'DOCX', 'TXT']" :key="fmt"
                class="px-3 py-1 rounded-full text-xs font-semibold bg-[#fde8dc] text-[#e85d26]">
            {{ fmt }}
          </span>
        </div>
        <p class="text-xs text-gray-400 mt-3">Taille max : 20 Mo</p>
      </div>

      <!-- ── Étape 2 : Confirmation ── -->
      <div v-else-if="step === 2" class="space-y-4">
        <!-- Fichier sélectionné -->
        <div class="bg-white rounded-2xl border border-gray-200 p-5 flex items-center gap-4">
          <span class="text-3xl">{{ fileIcon }}</span>
          <div class="flex-1 min-w-0">
            <p class="font-semibold text-gray-900 truncate">{{ file?.name }}</p>
            <p class="text-sm text-gray-400 mt-0.5">{{ fileSize }}</p>
          </div>
          <button @click="removeFile" class="p-2 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Info -->
        <div class="bg-[#fdf6f0] rounded-2xl border border-[#fde8dc] p-5">
          <div class="flex items-start gap-3">
            <div class="w-8 h-8 rounded-xl bg-[#fde8dc] flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg class="w-4 h-4 text-[#e85d26]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p class="text-sm font-semibold text-gray-900 mb-1">Analyse IA complète</p>
              <p class="text-sm text-gray-500 leading-relaxed">
                Le document sera analysé par GPT-4o-mini : extraction du texte, scoring de pertinence (0-100),
                identification du domaine, des compétences requises et du budget estimé.
              </p>
            </div>
          </div>
        </div>

        <!-- Erreur -->
        <div v-if="error" class="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-600">
          {{ error }}
        </div>

        <!-- Actions -->
        <div class="flex gap-3 pt-2">
          <button @click="removeFile"
                  class="flex-1 px-6 py-3 rounded-xl border border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50 transition-colors">
            Annuler
          </button>
          <button @click="submit"
                  class="flex-1 px-6 py-3 rounded-xl bg-[#e85d26] text-white font-bold text-sm hover:bg-[#c2410c] transition-colors flex items-center justify-center gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round"
                d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15M14.25 3.104c.251.023.501.05.75.082M19.8 15l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.607L5 14.5m14.8.5l.394 1.57A2.25 2.25 0 0118 18.75H6a2.25 2.25 0 01-2.194-2.68L5 14.5" />
            </svg>
            Lancer l'analyse IA
          </button>
        </div>
      </div>

      <!-- ── Étape 3 : Résultat / Loading ── -->
      <div v-else-if="step === 3">
        <!-- Loading -->
        <div v-if="loading" class="bg-white rounded-2xl border border-gray-200 p-16 text-center">
          <div class="w-14 h-14 rounded-full border-4 border-[#fde8dc] border-t-[#e85d26] animate-spin mx-auto mb-6"></div>
          <p class="font-bold text-gray-900 text-lg mb-2">Analyse en cours…</p>
          <p class="text-sm text-gray-400">GPT-4o-mini extrait et score votre document.</p>
        </div>

        <!-- Résultat -->
        <div v-else-if="result" class="space-y-4">
          <!-- Score card -->
          <div class="bg-white rounded-2xl border border-gray-200 p-6">
            <div class="flex items-start justify-between mb-4">
              <div class="flex-1 min-w-0 pr-4">
                <h2 class="font-bold text-gray-900 text-xl leading-tight">{{ result.titre }}</h2>
                <p v-if="result.domaine" class="text-sm text-gray-400 mt-1">{{ result.domaine }}</p>
              </div>
              <!-- Score cercle -->
              <div class="flex-shrink-0 text-center">
                <div class="w-20 h-20 rounded-full flex items-center justify-center border-4"
                     :style="`border-color: ${scoreColor(result.score)}; background: ${scoreColor(result.score)}18`">
                  <span class="text-2xl font-extrabold" :style="`color: ${scoreColor(result.score)}`">
                    {{ result.score }}
                  </span>
                </div>
                <p class="text-xs font-semibold mt-1" :style="`color: ${scoreColor(result.score)}`">
                  {{ scoreLabel(result.score) }}
                </p>
              </div>
            </div>

            <!-- Barre de score -->
            <div class="h-2 rounded-full bg-gray-100 mb-4">
              <div class="h-2 rounded-full transition-all duration-700"
                   :style="`width: ${result.score}%; background: ${scoreColor(result.score)}`"></div>
            </div>

            <!-- Tags info -->
            <div class="flex flex-wrap gap-2">
              <span v-if="result.budgetEstime"
                    class="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                💰 {{ result.budgetEstime }}
              </span>
              <span v-if="result.duree"
                    class="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                ⏱ {{ result.duree }}
              </span>
              <span v-if="result.dateLimite"
                    class="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                📅 {{ new Date(result.dateLimite).toLocaleDateString('fr-FR') }}
              </span>
            </div>
          </div>

          <!-- Résumé -->
          <div v-if="result.resume" class="bg-white rounded-2xl border border-gray-200 p-5">
            <h3 class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Résumé IA</h3>
            <p class="text-sm text-gray-700 leading-relaxed">{{ result.resume }}</p>
          </div>

          <!-- Justification -->
          <div v-if="result.justification" class="bg-white rounded-2xl border border-gray-200 p-5">
            <h3 class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Justification du score</h3>
            <div class="flex gap-3">
              <div class="w-1 flex-shrink-0 rounded-full" :style="`background: ${scoreColor(result.score)}`"></div>
              <p class="text-sm text-gray-600 leading-relaxed">{{ result.justification }}</p>
            </div>
          </div>

          <!-- Compétences -->
          <div v-if="result.competences?.length" class="bg-white rounded-2xl border border-gray-200 p-5">
            <h3 class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Compétences requises</h3>
            <div class="flex flex-wrap gap-2">
              <span v-for="c in result.competences" :key="c"
                    class="px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#fde8dc] text-[#e85d26]">
                {{ c }}
              </span>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex gap-3 pt-2">
            <button @click="router.push('/dashboard')"
                    class="flex-1 px-6 py-3 rounded-xl border border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50 transition-colors">
              Retour au tableau de bord
            </button>
            <button @click="router.push(`/appels-offres/${result.id}`)"
                    class="flex-1 px-6 py-3 rounded-xl bg-[#e85d26] text-white font-bold text-sm hover:bg-[#c2410c] transition-colors">
              Voir le détail complet →
            </button>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>
