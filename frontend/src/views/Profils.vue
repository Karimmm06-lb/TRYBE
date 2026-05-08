<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useAppelOffresStore, type Profil } from '@/stores/appelOffres'
import Sidebar from '@/components/Sidebar.vue'
import { Plus, Edit3, Trash2, User, Target, Bell, ChevronDown, X, Check, Sliders } from 'lucide-vue-next'

const auth = useAuthStore()
const store = useAppelOffresStore()

const showModal = ref(false)
const editingId = ref<number | null>(null)
const saving = ref(false)
const deleting = ref<number | null>(null)

const form = ref({
  nomProfil: '',
  domaines: '',
  competences: '',
  budgetMin: '',
  seuilAlerte: 50,
  seuilTresRelevant: 75
})

onMounted(async () => {
  if (!auth.user) await auth.fetchMe()
  await store.fetchProfils()
})

function openCreate() {
  editingId.value = null
  form.value = { nomProfil: '', domaines: '', competences: '', budgetMin: '', seuilAlerte: 50, seuilTresRelevant: 75 }
  showModal.value = true
}

function openEdit(p: Profil) {
  editingId.value = p.id
  form.value = {
    nomProfil: p.nomProfil,
    domaines: p.domaines ?? '',
    competences: p.competences ?? '',
    budgetMin: p.budgetMin ? String(p.budgetMin) : '',
    seuilAlerte: p.seuilAlerte,
    seuilTresRelevant: p.seuilTresRelevant
  }
  showModal.value = true
}

async function saveForm() {
  if (!form.value.nomProfil) return
  saving.value = true
  try {
    const data = {
      nomProfil: form.value.nomProfil,
      domaines: form.value.domaines || null,
      competences: form.value.competences || null,
      budgetMin: form.value.budgetMin ? parseInt(form.value.budgetMin) : null,
      seuilAlerte: form.value.seuilAlerte,
      seuilTresRelevant: form.value.seuilTresRelevant
    }
    if (editingId.value) {
      await store.updateProfil(editingId.value, data)
    } else {
      await store.createProfil(data)
    }
    showModal.value = false
  } finally {
    saving.value = false
  }
}

async function deleteProfil(id: number) {
  if (!confirm('Supprimer ce profil ?')) return
  deleting.value = id
  try {
    await store.deleteProfil(id)
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
          <h1 class="text-xl font-bold text-white" style="font-family: 'Space Grotesk', sans-serif;">Profils d'intérêt</h1>
          <p class="text-sm mt-0.5" style="color: #475569;">Configurez vos critères pour affiner le score de pertinence.</p>
        </div>
        <button @click="openCreate" class="btn-neon flex items-center gap-2 text-sm px-5 py-2.5">
          <Plus :size="16" />
          Nouveau profil
        </button>
      </div>

      <div class="p-8">
        <!-- Empty state -->
        <div v-if="store.profils.length === 0" class="glass-card-static p-16 text-center animate-fade-in">
          <div class="w-20 h-20 mx-auto mb-6 rounded-3xl flex items-center justify-center"
               style="background: rgba(139,92,246,0.08); border: 1px solid rgba(139,92,246,0.15);">
            <Sliders :size="36" style="color: #8b5cf6; opacity: 0.7;" />
          </div>
          <h3 class="text-xl font-bold text-white mb-2" style="font-family: 'Space Grotesk', sans-serif;">Aucun profil configuré</h3>
          <p class="text-sm mb-8" style="color: #475569;">Créez un profil pour affiner l'analyse des AOs selon vos critères.</p>
          <button @click="openCreate" class="btn-neon px-8 py-3 mx-auto flex items-center gap-2">
            <Plus :size="16" />
            Créer un profil
          </button>
        </div>

        <!-- Profils grid -->
        <div v-else class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          <div v-for="p in store.profils" :key="p.id"
               class="glass-card p-6 group animate-slide-up">
            <!-- Header -->
            <div class="flex items-start justify-between mb-5">
              <div class="w-12 h-12 rounded-2xl flex items-center justify-center"
                   style="background: rgba(139,92,246,0.12); border: 1px solid rgba(139,92,246,0.2);">
                <User :size="22" style="color: #8b5cf6;" />
              </div>
              <div class="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button @click="openEdit(p)" class="p-2 rounded-lg transition-colors"
                        style="background: rgba(255,255,255,0.04); color: #94a3b8;"
                        onmouseover="this.style.color='#00d4ff'" onmouseout="this.style.color='#94a3b8'">
                  <Edit3 :size="14" />
                </button>
                <button @click="deleteProfil(p.id)" class="p-2 rounded-lg transition-colors"
                        style="background: rgba(255,255,255,0.04); color: #94a3b8;"
                        onmouseover="this.style.color='#f43f5e'" onmouseout="this.style.color='#94a3b8'">
                  <div v-if="deleting === p.id" class="spinner w-4 h-4"></div>
                  <Trash2 v-else :size="14" />
                </button>
              </div>
            </div>

            <h3 class="text-lg font-bold text-white mb-4" style="font-family: 'Space Grotesk', sans-serif;">{{ p.nomProfil }}</h3>

            <div class="space-y-3 text-sm">
              <div v-if="p.domaines" class="flex items-start gap-3">
                <Target :size="14" class="mt-0.5 flex-shrink-0" style="color: #00d4ff;" />
                <div>
                  <div class="text-xs mb-1" style="color: #475569;">Domaines</div>
                  <div class="flex flex-wrap gap-1">
                    <span v-for="d in p.domaines.split(',').filter(Boolean)" :key="d"
                          class="px-2 py-0.5 rounded-full text-xs"
                          style="background: rgba(0,212,255,0.08); color: #00d4ff; border: 1px solid rgba(0,212,255,0.15);">
                      {{ d.trim() }}
                    </span>
                  </div>
                </div>
              </div>

              <div v-if="p.competences" class="flex items-start gap-3">
                <ChevronDown :size="14" class="mt-0.5 flex-shrink-0" style="color: #8b5cf6;" />
                <div>
                  <div class="text-xs mb-1" style="color: #475569;">Compétences</div>
                  <div class="flex flex-wrap gap-1">
                    <span v-for="c in p.competences.split(',').filter(Boolean).slice(0, 4)" :key="c"
                          class="px-2 py-0.5 rounded-full text-xs"
                          style="background: rgba(139,92,246,0.08); color: #8b5cf6; border: 1px solid rgba(139,92,246,0.15);">
                      {{ c.trim() }}
                    </span>
                  </div>
                </div>
              </div>

              <div class="pt-2 border-t" style="border-color: rgba(255,255,255,0.05);">
                <div class="flex justify-between items-center text-xs">
                  <div class="flex items-center gap-1.5">
                    <Bell :size="12" style="color: #f59e0b;" />
                    <span style="color: #475569;">Seuil alerte</span>
                  </div>
                  <span class="font-semibold" style="color: #f59e0b;">≥ {{ p.seuilAlerte }}</span>
                </div>
                <div class="flex justify-between items-center text-xs mt-2">
                  <div class="flex items-center gap-1.5">
                    <Target :size="12" style="color: #10b981;" />
                    <span style="color: #475569;">Très pertinent</span>
                  </div>
                  <span class="font-semibold" style="color: #10b981;">≥ {{ p.seuilTresRelevant }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal -->
      <Teleport to="body">
        <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center p-4"
             style="background: rgba(0,0,0,0.7); backdrop-filter: blur(8px);"
             @click.self="showModal = false">
          <div class="w-full max-w-lg animate-slide-up" style="background: #0d0d20; border: 1px solid rgba(255,255,255,0.1); border-radius: 20px; padding: 32px;">
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-xl font-bold text-white" style="font-family: 'Space Grotesk', sans-serif;">
                {{ editingId ? 'Modifier le profil' : 'Nouveau profil' }}
              </h2>
              <button @click="showModal = false" class="p-2 rounded-lg" style="color: #475569;" onmouseover="this.style.color='#e2e8f0'" onmouseout="this.style.color='#475569'">
                <X :size="18" />
              </button>
            </div>

            <form @submit.prevent="saveForm" class="space-y-5">
              <div>
                <label class="block text-sm font-medium mb-2" style="color: #94a3b8;">Nom du profil *</label>
                <input v-model="form.nomProfil" type="text" placeholder="ex: Développement Web" class="input-neon" required />
              </div>

              <div>
                <label class="block text-sm font-medium mb-2" style="color: #94a3b8;">
                  Domaines ciblés <span style="color: #475569;">(séparés par virgule)</span>
                </label>
                <input v-model="form.domaines" type="text" placeholder="ex: IT, Cloud, Sécurité" class="input-neon" />
              </div>

              <div>
                <label class="block text-sm font-medium mb-2" style="color: #94a3b8;">
                  Compétences <span style="color: #475569;">(séparées par virgule)</span>
                </label>
                <input v-model="form.competences" type="text" placeholder="ex: React, Node.js, AWS" class="input-neon" />
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium mb-2" style="color: #94a3b8;">Seuil d'alerte</label>
                  <div class="flex items-center gap-3">
                    <input v-model="form.seuilAlerte" type="range" min="0" max="100" step="5" class="flex-1" style="accent-color: #f59e0b;" />
                    <span class="text-sm font-bold w-8" style="color: #f59e0b;">{{ form.seuilAlerte }}</span>
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-medium mb-2" style="color: #94a3b8;">Très pertinent</label>
                  <div class="flex items-center gap-3">
                    <input v-model="form.seuilTresRelevant" type="range" min="0" max="100" step="5" class="flex-1" style="accent-color: #10b981;" />
                    <span class="text-sm font-bold w-8" style="color: #10b981;">{{ form.seuilTresRelevant }}</span>
                  </div>
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium mb-2" style="color: #94a3b8;">Budget minimum (€)</label>
                <input v-model="form.budgetMin" type="number" placeholder="ex: 10000" class="input-neon" />
              </div>

              <div class="flex gap-3 pt-2">
                <button type="submit" :disabled="saving" class="btn-neon flex-1 flex items-center justify-center gap-2 py-3">
                  <div v-if="saving" class="spinner"></div>
                  <template v-else>
                    <Check :size="16" />
                    {{ editingId ? 'Sauvegarder' : 'Créer le profil' }}
                  </template>
                </button>
                <button type="button" @click="showModal = false" class="btn-ghost px-6 py-3">Annuler</button>
              </div>
            </form>
          </div>
        </div>
      </Teleport>

    </main>
  </div>
</template>
