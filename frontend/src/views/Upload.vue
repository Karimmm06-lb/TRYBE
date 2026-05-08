<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useAppelOffresStore, type AppelOffre } from '@/stores/appelOffres'
import Sidebar from '@/components/Sidebar.vue'
import ScoreGauge from '@/components/ScoreGauge.vue'
import { Upload, FileText, CheckCircle, Brain, Bell, X, ChevronDown, ArrowRight, FileUp, Zap } from 'lucide-vue-next'

const router = useRouter()
const auth = useAuthStore()
const store = useAppelOffresStore()

const file = ref<File | null>(null)
const dragOver = ref(false)
const selectedProfil = ref<number | null>(null)
const step = ref<'idle' | 'uploading' | 'extracting' | 'analyzing' | 'done' | 'error'>('idle')
const result = ref<AppelOffre | null>(null)
const errorMsg = ref('')

onMounted(async () => {
  if (!auth.user) await auth.fetchMe()
  await store.fetchProfils()
})

const steps = [
  { key: 'uploading', label: 'Upload', icon: FileUp },
  { key: 'extracting', label: 'Extraction', icon: FileText },
  { key: 'analyzing', label: 'Analyse IA', icon: Brain },
  { key: 'done', label: 'Résultats', icon: CheckCircle },
]

const stepIndex = computed(() => {
  const map: Record<string, number> = { idle: -1, uploading: 0, extracting: 1, analyzing: 2, done: 3, error: -1 }
  return map[step.value] ?? -1
})

function getStepStatus(i: number) {
  if (step.value === 'error') return i < stepIndex.value ? 'done' : 'pending'
  if (i < stepIndex.value) return 'done'
  if (i === stepIndex.value) return 'active'
  return 'pending'
}

function onDrop(e: DragEvent) {
  dragOver.value = false
  const f = e.dataTransfer?.files?.[0]
  if (f) setFile(f)
}

function onFileInput(e: Event) {
  const input = e.target as HTMLInputElement
  const f = input.files?.[0]
  if (f) setFile(f)
}

function setFile(f: File) {
  const allowed = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain']
  if (!allowed.includes(f.type) && !f.name.match(/\.(pdf|docx|txt)$/i)) {
    errorMsg.value = 'Format non supporté. Utilisez PDF, DOCX ou TXT.'
    return
  }
  if (f.size > 20 * 1024 * 1024) {
    errorMsg.value = 'Le fichier est trop lourd (max 20 Mo).'
    return
  }
  file.value = f
  errorMsg.value = ''
}

function removeFile() {
  file.value = null
  step.value = 'idle'
  result.value = null
}

async function analyze() {
  if (!file.value) return
  errorMsg.value = ''
  step.value = 'uploading'

  try {
    await delay(600)
    step.value = 'extracting'
    await delay(800)
    step.value = 'analyzing'

    const res = await store.upload(file.value, selectedProfil.value ?? undefined)
    result.value = res
    step.value = 'done'
  } catch (e: any) {
    step.value = 'error'
    errorMsg.value = e?.response?.data?.message ?? 'Erreur lors de l\'analyse. Vérifiez votre connexion.'
  }
}

function reset() {
  file.value = null
  step.value = 'idle'
  result.value = null
  errorMsg.value = ''
}

function delay(ms: number) { return new Promise(r => setTimeout(r, ms)) }

function fileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} o`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`
}

function fileIcon(name: string) {
  if (name.endsWith('.pdf')) return '📄'
  if (name.endsWith('.docx')) return '📝'
  return '📃'
}

function scoreColor(score: number) {
  if (score >= 70) return '#10b981'
  if (score >= 40) return '#f59e0b'
  return '#f43f5e'
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
          <h1 class="text-xl font-bold text-white" style="font-family: 'Space Grotesk', sans-serif;">Analyser un document</h1>
          <p class="text-sm mt-0.5" style="color: #475569;">Importez votre appel d'offres pour une analyse IA instantanée.</p>
        </div>
      </div>

      <div class="p-8 max-w-4xl">

        <!-- Step indicator -->
        <div v-if="step !== 'idle'" class="flex items-center justify-between mb-10 animate-slide-up">
          <div v-for="(s, i) in steps" :key="s.key" class="flex items-center flex-1">
            <div class="flex flex-col items-center gap-2">
              <div :class="['step-dot', getStepStatus(i)]">
                <CheckCircle v-if="getStepStatus(i) === 'done'" :size="16" />
                <div v-else-if="getStepStatus(i) === 'active'" class="w-3 h-3 rounded-full animate-ping-slow"
                     style="background: #00d4ff;"></div>
                <span v-else class="text-xs">{{ i + 1 }}</span>
              </div>
              <span class="text-xs font-medium" :style="`color: ${getStepStatus(i) === 'active' ? '#00d4ff' : getStepStatus(i) === 'done' ? '#10b981' : '#334155'};`">
                {{ s.label }}
              </span>
            </div>
            <div v-if="i < steps.length - 1" class="flex-1 h-px mx-3 mb-5"
                 :style="`background: ${getStepStatus(i) === 'done' ? 'rgba(16,185,129,0.4)' : 'rgba(255,255,255,0.06)'};`"></div>
          </div>
        </div>

        <!-- IDLE / Upload zone -->
        <div v-if="step === 'idle' || step === 'error'">
          <!-- Drop zone -->
          <div
            :class="['upload-zone p-16 text-center mb-6 relative animate-slide-up', dragOver ? 'drag-over' : '']"
            @dragover.prevent="dragOver = true"
            @dragleave="dragOver = false"
            @drop.prevent="onDrop"
          >
            <!-- Background animation when drag over -->
            <div v-if="dragOver" class="absolute inset-0 rounded-2xl pointer-events-none"
                 style="background: rgba(0,212,255,0.02); animation: border-glow 1s ease infinite;"></div>

            <div class="w-20 h-20 mx-auto mb-6 rounded-3xl flex items-center justify-center"
                 :style="`background: ${dragOver ? 'rgba(0,212,255,0.15)' : 'rgba(255,255,255,0.04)'}; border: 1px solid ${dragOver ? 'rgba(0,212,255,0.3)' : 'rgba(255,255,255,0.08)'}; transition: all 0.3s;`">
              <Upload :size="36" :style="`color: ${dragOver ? '#00d4ff' : '#334155'}; transition: color 0.3s;`" />
            </div>

            <h3 class="text-xl font-bold text-white mb-2" style="font-family: 'Space Grotesk', sans-serif;">
              {{ dragOver ? 'Déposez le fichier ici' : 'Glissez votre appel d\'offres' }}
            </h3>
            <p class="text-sm mb-6" style="color: #475569;">
              Formats supportés : <span style="color: #94a3b8;">PDF · DOCX · TXT</span> · Max 20 Mo
            </p>

            <label class="btn-ghost inline-flex items-center gap-2 cursor-pointer text-sm px-6 py-3">
              <FileUp :size="16" />
              Parcourir les fichiers
              <input type="file" accept=".pdf,.docx,.txt" class="hidden" @change="onFileInput" />
            </label>
          </div>

          <!-- File preview -->
          <div v-if="file" class="glass-card-static p-4 mb-6 flex items-center gap-4 animate-slide-up">
            <div class="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                 style="background: rgba(0,212,255,0.08); border: 1px solid rgba(0,212,255,0.15);">
              {{ fileIcon(file.name) }}
            </div>
            <div class="flex-1 min-w-0">
              <div class="font-medium text-white truncate">{{ file.name }}</div>
              <div class="text-sm" style="color: #475569;">{{ fileSize(file.size) }}</div>
            </div>
            <button @click="removeFile" class="p-2 rounded-lg transition-colors"
                    style="color: #475569;" onmouseover="this.style.color='#f43f5e'" onmouseout="this.style.color='#475569'">
              <X :size="16" />
            </button>
          </div>

          <!-- Profil selector -->
          <div v-if="store.profils.length > 0" class="mb-6 animate-slide-up delay-100">
            <label class="block text-sm font-medium mb-2" style="color: #94a3b8;">
              Profil d'intérêt (optionnel)
            </label>
            <div class="relative">
              <select v-model="selectedProfil" class="input-neon appearance-none pr-10 cursor-pointer">
                <option :value="null">Aucun profil sélectionné</option>
                <option v-for="p in store.profils" :key="p.id" :value="p.id">{{ p.nomProfil }}</option>
              </select>
              <ChevronDown :size="16" class="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" style="color: #475569;" />
            </div>
          </div>

          <!-- Error -->
          <div v-if="errorMsg" class="mb-6 px-4 py-3 rounded-xl text-sm flex items-center gap-3"
               style="background: rgba(244,63,94,0.1); border: 1px solid rgba(244,63,94,0.2); color: #f43f5e;">
            <X :size="16" />
            {{ errorMsg }}
          </div>

          <!-- Analyze button -->
          <button @click="analyze" :disabled="!file" class="btn-neon w-full flex items-center justify-center gap-2 py-4 text-base animate-slide-up delay-200"
                  :style="!file ? 'opacity: 0.4; cursor: not-allowed; pointer-events: none;' : ''">
            <Zap :size="20" />
            Lancer l'analyse IA
            <ArrowRight :size="18" />
          </button>
        </div>

        <!-- LOADING state -->
        <div v-else-if="['uploading','extracting','analyzing'].includes(step)" class="text-center py-20 animate-fade-in">
          <div class="w-24 h-24 mx-auto mb-8 relative">
            <div class="absolute inset-0 rounded-full animate-spin"
                 style="border: 2px solid rgba(0,212,255,0.1); border-top-color: #00d4ff;"></div>
            <div class="absolute inset-3 rounded-full animate-spin"
                 style="border: 2px solid rgba(139,92,246,0.1); border-top-color: #8b5cf6; animation-duration: 1.5s; animation-direction: reverse;"></div>
            <div class="absolute inset-0 flex items-center justify-center">
              <Brain :size="28" style="color: #00d4ff;" />
            </div>
          </div>
          <h3 class="text-2xl font-bold text-white mb-3" style="font-family: 'Space Grotesk', sans-serif;">
            {{ step === 'uploading' ? 'Upload en cours...' : step === 'extracting' ? 'Extraction du texte...' : 'Analyse par GPT-4...' }}
          </h3>
          <p class="text-sm" style="color: #475569;">
            {{ step === 'analyzing' ? 'L\'IA analyse le contenu de votre document. Cela peut prendre quelques secondes.' : 'Traitement de votre document...' }}
          </p>
        </div>

        <!-- RESULTS -->
        <div v-else-if="step === 'done' && result" class="animate-slide-up">
          <!-- Success banner -->
          <div class="flex items-center gap-3 px-5 py-4 rounded-xl mb-8"
               style="background: rgba(16,185,129,0.08); border: 1px solid rgba(16,185,129,0.2);">
            <CheckCircle :size="20" style="color: #10b981;" />
            <span class="font-medium" style="color: #10b981;">Analyse terminée avec succès !</span>
            <button @click="router.push(`/appels-offres/${result.id}`)" class="ml-auto flex items-center gap-1 text-sm underline" style="color: #10b981;">
              Voir détail <ArrowRight :size="14" />
            </button>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <!-- Score -->
            <div class="glass-card-static p-6 flex flex-col items-center">
              <ScoreGauge :score="result.score ?? 0" :size="160" />
            </div>

            <!-- Summary -->
            <div class="md:col-span-2 glass-card-static p-6">
              <h3 class="font-semibold text-white mb-1 text-lg" style="font-family: 'Space Grotesk', sans-serif;">{{ result.titre }}</h3>
              <div class="flex items-center gap-3 mb-4">
                <span v-if="result.domaine" class="badge badge-analyse">{{ result.domaine }}</span>
                <span v-if="result.budget_estime" class="text-sm" style="color: #64748b;">
                  Budget estimé : {{ result.budget_estime.toLocaleString() }}€
                </span>
              </div>
              <p class="text-sm leading-relaxed mb-4" style="color: #94a3b8;">{{ result.resume }}</p>

              <!-- Compétences -->
              <div v-if="result.competences?.length" class="mb-4">
                <div class="text-xs font-semibold mb-2 uppercase tracking-widest" style="color: #475569;">Compétences extraites</div>
                <div class="flex flex-wrap gap-2">
                  <span v-for="c in result.competences" :key="c.id"
                        class="px-3 py-1 rounded-full text-xs font-medium"
                        style="background: rgba(139,92,246,0.1); color: #8b5cf6; border: 1px solid rgba(139,92,246,0.2);">
                    {{ c.competence }}
                  </span>
                </div>
              </div>

              <div class="text-sm p-4 rounded-xl" style="background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.04);">
                <div class="text-xs font-semibold mb-2 uppercase tracking-widest" style="color: #475569;">Justification IA</div>
                <p style="color: #94a3b8;">{{ result.justification }}</p>
              </div>
            </div>
          </div>

          <div class="flex gap-4">
            <button @click="router.push(`/appels-offres/${result.id}`)" class="btn-neon flex items-center gap-2 px-6 py-3">
              Voir le détail complet <ArrowRight :size="16" />
            </button>
            <button @click="reset" class="btn-ghost flex items-center gap-2 px-6 py-3">
              Analyser un autre document
            </button>
          </div>
        </div>

      </div>
    </main>
  </div>
</template>
