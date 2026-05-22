<template>
  <div class="min-h-screen pb-12 bg-[#fdf6f0]">
    
    <header class="sticky top-0 z-50 bg-white border-b border-gray-200 h-16 flex items-center justify-between px-8">
      <span class="text-2xl font-extrabold text-[#e85d26] tracking-tight">trybe</span>
      
      <div class="flex items-center gap-5">
        <div class="relative" ref="notifRef">
          <button @click="showNotifs = !showNotifs" class="relative text-gray-500 hover:text-gray-900 transition-colors">
            <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
            <span v-if="unreadCount > 0" class="absolute -top-1 -right-1 w-4 h-4 bg-[#e85d26] text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
              {{ unreadCount }}
            </span>
          </button>

          <div v-if="showNotifs" class="absolute right-0 mt-3 w-96 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden">
            <div class="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50">
              <h3 class="text-base font-bold text-gray-900">Notifications</h3>
              <button @click="clearNotifs" class="text-sm font-semibold text-[#e85d26]">Tout effacer</button>
            </div>
            <div class="p-3 text-center text-gray-500 text-sm">
              Aucune nouvelle notification.
            </div>
          </div>
        </div>

        <div class="relative" ref="profileRef">
          <button @click="showProfile = !showProfile" class="w-10 h-10 rounded-full bg-[#e85d26] hover:bg-[#c2410c] text-white flex items-center justify-center font-bold shadow-sm transition-colors">
            {{ user.initials || '?' }}
          </button>

          <div v-if="showProfile" class="absolute right-0 mt-3 w-64 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden">
            <div class="p-4 border-b border-gray-100">
              <div class="font-bold text-gray-900">{{ user.name || 'Utilisateur' }}</div>
              <div class="text-sm text-gray-500">{{ user.email || 'Chargement...' }}</div>
            </div>
            <div class="p-2 flex flex-col gap-1">
              <button class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors w-full text-left">
                <svg width="25" height="25" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
                Paramètres du Profil
              </button>
              <button @click="logout" class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-600 hover:bg-red-50 transition-colors w-full text-left">
                <svg width="25" height="25" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>

    <main class="max-w-[1100px] mx-auto p-8">
      
      <div v-if="isLoading" class="flex flex-col items-center justify-center py-32">
        <div class="w-12 h-12 border-4 border-[#fef3ec] border-t-[#e85d26] rounded-full animate-spin mb-4"></div>
        <p class="text-gray-500 font-semibold">Connexion à la base de données...</p>
      </div>

      <div v-else-if="errorMessage" class="bg-red-50 text-red-600 p-6 rounded-xl border border-red-200 shadow-sm flex flex-col items-center py-12">
        <svg class="w-12 h-12 mb-4" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        <h3 class="text-lg font-bold mb-1">Erreur de chargement</h3>
        <p>{{ errorMessage }}</p>
        <button @click="loadDashboardData" class="mt-4 px-6 py-2 bg-red-100 text-red-700 font-bold rounded-lg hover:bg-red-200 transition-colors">Réessayer</button>
      </div>

      <div v-else>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex justify-between items-center border-l-4 border-l-[#e85d26]">
            <div>
              <p class="text-sm text-gray-500 mb-1">Total AO</p>
              <p class="text-3xl font-extrabold text-gray-900">{{ stats.totalAO }}</p>
            </div>
            <div class="w-12 h-12 rounded-lg bg-orange-50 text-[#e85d26] flex items-center justify-center">
              <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
            </div>
          </div>

          <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex justify-between items-center border-l-4 border-l-[#16a34a]">
            <div>
              <p class="text-sm text-gray-500 mb-1">AO Sauvegardés</p>
              <p class="text-3xl font-extrabold text-gray-900">{{ savedAOs.length }}</p>
            </div>
            <div class="w-12 h-12 rounded-lg bg-green-50 text-[#16a34a] flex items-center justify-center">
              <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            </div>
          </div>

          <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex justify-between items-center border-l-4 border-l-[#3b82f6]">
            <div>
              <p class="text-sm text-gray-500 mb-1">Score Moyen</p>
              <p class="text-3xl font-extrabold text-gray-900">{{ stats.scoreMoyen }}%</p>
            </div>
            <div class="w-12 h-12 rounded-lg bg-blue-50 text-[#3b82f6] flex items-center justify-center">
              <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-xl shadow-sm border border-gray-100">
          
          <div class="flex px-6 border-b border-gray-200">
            <button @click="activeTab = 'all'" :class="activeTab === 'all' ? 'border-[#e85d26] text-[#e85d26]' : 'border-transparent text-gray-500 hover:text-gray-700'" class="flex items-center gap-2 py-4 mr-8 font-semibold border-b-2 transition-colors">
              <svg width="25" height="25" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
              Appels d'Offres
            </button>
            <button @click="activeTab = 'saved'" :class="activeTab === 'saved' ? 'border-[#e85d26] text-[#e85d26]' : 'border-transparent text-gray-500 hover:text-gray-700'" class="flex items-center gap-2 py-4 font-semibold border-b-2 transition-colors">
              <svg width="25" height="25" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              AO Sauvegardés
            </button>
          </div>

          <div class="p-6">
            <div class="flex gap-4 mb-6">
              <div class="relative flex-1">
                <span class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                </span>
                <input type="text" placeholder="Rechercher un appel d'offres..." class="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg outline-none focus:border-[#e85d26] transition-colors text-sm">
              </div>

              <div class="relative" ref="filterRef">
                <button @click="showFilters = !showFilters" class="flex items-center gap-2 px-6 py-3 border border-gray-200 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition-colors">
                  <svg width="25" height="25" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
                  Filtrer
                </button>

                <div v-if="showFilters" class="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-xl shadow-xl z-40 p-5">
                  <h4 class="font-bold text-gray-900 mb-4 text-lg">Filtres</h4>
                  <div class="space-y-4">
                    <div>
                      <label class="block text-sm font-semibold text-gray-800 mb-1">Domaine</label>
                      <select class="w-full p-2.5 border border-gray-200 rounded-lg text-sm text-gray-700 outline-none focus:border-[#e85d26] bg-white cursor-pointer">
                        <option v-for="d in filters.domaines" :key="d">{{ d }}</option>
                      </select>
                    </div>
                    <div>
                      <label class="block text-sm font-semibold text-gray-800 mb-1">Score</label>
                      <select class="w-full p-2.5 border border-gray-200 rounded-lg text-sm text-gray-700 outline-none focus:border-[#e85d26] bg-white cursor-pointer">
                        <option v-for="s in filters.scores" :key="s">{{ s }}</option>
                      </select>
                    </div>
                    <div>
                      <label class="block text-sm font-semibold text-gray-800 mb-1">Statut</label>
                      <select class="w-full p-2.5 border border-gray-200 rounded-lg text-sm text-gray-700 outline-none focus:border-[#e85d26] bg-white cursor-pointer">
                        <option v-for="st in filters.statuts" :key="st">{{ st }}</option>
                      </select>
                    </div>
                  </div>
                  <div class="mt-6 text-center">
                    <button class="text-sm font-bold text-[#e85d26] hover:text-[#c2410c] transition-colors">Réinitialiser les filtres</button>
                  </div>
                </div>
              </div>
            </div>

            <div v-if="filteredAOs.length === 0" class="text-center py-16">
              <div class="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                <svg width="32" height="32" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="15" x2="15" y2="15"/></svg>
              </div>
              <p class="text-gray-500 font-medium">Aucun appel d'offres à afficher.</p>
              <p class="text-sm text-gray-400 mt-1">S'il s'agit d'une base vide, déclenchez d'abord l'analyse de vos offres.</p>
            </div>
            
            <AoCard 
              v-for="ao in filteredAOs" 
              :key="ao.id" 
              :ao="ao" 
              :is-saved="isSaved(ao)"
              @toggle-save="toggleSave"
            />
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import AoCard from '../components/AoCard.vue'

const router = useRouter()


const isLoading = ref(true)
const errorMessage = ref('')

const user = ref<any>({ name: '', initials: '', email: '' })
const stats = ref<any>({ totalAO: 0, aoSauvegardes: 0, scoreMoyen: 0 })
const appelsOffres = ref<any[]>([])
const notifications = ref<any[]>([])
        
const filters = ref<any>({
  domaines: ['Tous les domaines', 'Développement Web', 'Infrastructure', 'Mobile', 'Informatique', 'Cybersécurité', 'Gestion d\'entreprise'],
  scores: ['Tous les scores', '90% et +', '75% et +', 'Moins de 75%'],
  statuts: ['Tous les statuts', 'EN_ATTENTE', 'ANALYSE', 'PERTINENT']
})

const activeTab = ref('all')
const savedAOs = ref<any[]>([])
const showNotifs = ref(false)
const showProfile = ref(false)
const showFilters = ref(false)

const notifRef = ref<HTMLElement | null>(null)
const profileRef = ref<HTMLElement | null>(null)
const filterRef = ref<HTMLElement | null>(null)


const loadDashboardData = async () => {
  isLoading.value = true
  errorMessage.value = ''
          
  try {
    
    const response = await fetch('http://localhost:8080/tenders');
            
    if (!response.ok) {
      throw new Error(`Erreur réseau: ${response.status}`);
    }
            
    const data = await response.json();
            
    
    user.value = data.user;
    stats.value = data.stats;
    appelsOffres.value = data.appelsOffres;
            
  } catch (error: any) {
    console.error("Erreur backend:", error);
    errorMessage.value = "Impossible de se connecter au serveur (port 8080). Assurez-vous que votre backend est lancé.";
  } finally {
    isLoading.value = false;
  }
}


onMounted(() => {
  loadDashboardData();
  document.addEventListener('click', closeDropdowns);
})

onUnmounted(() => {
  document.removeEventListener('click', closeDropdowns);
})


const unreadCount = computed(() => notifications.value.filter(n => n.unread).length)
const filteredAOs = computed(() => activeTab.value === 'all' ? appelsOffres.value : savedAOs.value)

const isSaved = (ao: any) => savedAOs.value.some((item: any) => item.id === ao.id)
        
const toggleSave = (ao: any) => {
  const index = savedAOs.value.findIndex((item: any) => item.id === ao.id)
  if (index === -1) savedAOs.value.push(ao)
  else savedAOs.value.splice(index, 1)
}
        
const clearNotifs = () => notifications.value.forEach(n => n.unread = false)
const logout = () => router.push('/login')

const closeDropdowns = (e: MouseEvent) => {
  if (notifRef.value && !notifRef.value.contains(e.target as Node)) showNotifs.value = false
  if (profileRef.value && !profileRef.value.contains(e.target as Node)) showProfile.value = false
  if (filterRef.value && !filterRef.value.contains(e.target as Node)) showFilters.value = false
}
</script>