<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()

interface Notif {
  id: number
  type: string
  statut: 'envoye' | 'lu'
  envoyeeLe: string
  ao_id: number
  appelOffre?: { titre: string; score: number | null }
}

const notifications = ref<Notif[]>([])
const loading = ref(true)
const filter = ref<'all' | 'envoye' | 'lu'>('all')
const sendingId = ref<number | null>(null)

onMounted(async () => {
  await fetchNotifs()
})

async function fetchNotifs() {
  loading.value = true
  try {
    const token = localStorage.getItem('token')
    const res = await axios.get('/api/karim/notifications', {
      headers: { Authorization: `Bearer ${token}` },
    })
    notifications.value = res.data
  } finally {
    loading.value = false
  }
}

async function markRead(id: number) {
  const token = localStorage.getItem('token')
  await axios.put(`/api/karim/notifications/${id}/lue`, {}, {
    headers: { Authorization: `Bearer ${token}` },
  })
  const n = notifications.value.find(n => n.id === id)
  if (n) n.statut = 'lu'
}

async function markAllRead() {
  await Promise.all(
    notifications.value.filter(n => n.statut === 'envoye').map(n => markRead(n.id))
  )
}

async function resend(id: number) {
  sendingId.value = id
  try {
    const token = localStorage.getItem('token')
    await axios.post(`/api/karim/notifications/${id}/renvoyer`, {}, {
      headers: { Authorization: `Bearer ${token}` },
    })
    const n = notifications.value.find(n => n.id === id)
    if (n) n.statut = 'envoye'
  } finally {
    sendingId.value = null
  }
}

async function deleteNotif(id: number) {
  const token = localStorage.getItem('token')
  await axios.delete(`/api/karim/notifications/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  notifications.value = notifications.value.filter(n => n.id !== id)
}

const filtered = computed(() => {
  if (filter.value === 'all') return notifications.value
  return notifications.value.filter(n => n.statut === filter.value)
})

const unreadCount = computed(() => notifications.value.filter(n => n.statut === 'envoye').length)

function typeLabel(type: string) {
  const map: Record<string, string> = {
    tres_pertinent: 'Très pertinent',
    pertinent: 'Pertinent',
    alerte_ao: 'Alerte AO',
    recuperation_auto: 'Récupération auto',
    erreur: 'Erreur'
  }
  return map[type.toLowerCase()] ?? type
}

function typeColor(type: string) {
  const t = type.toLowerCase()
  if (t === 'tres_pertinent') return { bg: '#d1fae5', text: '#065f46', dot: '#10b981' }
  if (t === 'pertinent') return { bg: '#dbeafe', text: '#1e40af', dot: '#3b82f6' }
  if (t === 'erreur') return { bg: '#fee2e2', text: '#991b1b', dot: '#f43f5e' }
  return { bg: '#fde8dc', text: '#9a3412', dot: '#e85d26' }
}

function formatDate(d: string) {
  const date = new Date(d)
  const now = new Date()
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000)
  if (diff < 60) return 'À l\'instant'
  if (diff < 3600) return `Il y a ${Math.floor(diff / 60)} min`
  if (diff < 86400) return `Il y a ${Math.floor(diff / 3600)}h`
  return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })
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
        <h1 class="text-gray-700 font-semibold">Notifications</h1>
        <span v-if="unreadCount > 0"
              class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#e85d26] text-white">
          {{ unreadCount }}
        </span>
      </div>
      <div class="flex items-center gap-3">
        <button v-if="unreadCount > 0" @click="markAllRead"
                class="text-sm font-semibold text-[#e85d26] hover:underline transition-colors flex items-center gap-1.5">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
          Tout marquer lu
        </button>
        <button @click="router.push('/dashboard')"
                class="text-sm text-gray-500 hover:text-gray-900 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors">
          ← Tableau de bord
        </button>
      </div>
    </header>

    <div class="max-w-3xl mx-auto px-4 py-10">

      <!-- Filtres -->
      <div class="flex gap-2 mb-6">
        <button v-for="f in [
          { key: 'all', label: 'Toutes' },
          { key: 'envoye', label: 'Non lues' },
          { key: 'lu', label: 'Lues' }
        ]" :key="f.key"
        @click="filter = f.key as any"
        class="px-4 py-2 rounded-xl text-sm font-semibold transition-all"
        :class="filter === f.key
          ? 'bg-[#e85d26] text-white shadow-sm'
          : 'bg-white border border-gray-200 text-gray-500 hover:border-[#e85d26] hover:text-[#e85d26]'">
          {{ f.label }}
        </button>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="flex justify-center py-20">
        <div class="w-8 h-8 rounded-full border-4 border-[#fde8dc] border-t-[#e85d26] animate-spin"></div>
      </div>

      <!-- Empty -->
      <div v-else-if="filtered.length === 0"
           class="bg-white rounded-2xl border border-gray-200 p-16 text-center">
        <svg class="w-12 h-12 mx-auto mb-4 text-gray-200" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
        </svg>
        <h3 class="text-lg font-bold text-gray-900 mb-1">Aucune notification</h3>
        <p class="text-sm text-gray-400">Vous recevrez des alertes quand un AO dépasse votre seuil.</p>
      </div>

      <!-- Liste -->
      <div v-else class="space-y-3">
        <div v-for="notif in filtered" :key="notif.id"
             class="bg-white rounded-2xl border transition-all flex gap-4 p-4"
             :class="notif.statut === 'envoye' ? 'border-[#e85d26]/20 shadow-sm' : 'border-gray-200'">

          <!-- Dot indicateur -->
          <div class="flex flex-col items-center gap-2 pt-1">
            <div class="w-2.5 h-2.5 rounded-full flex-shrink-0"
                 :style="`background: ${notif.statut === 'envoye' ? typeColor(notif.type).dot : '#e2e8f0'}`"></div>
          </div>

          <!-- Contenu -->
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 mb-1">
              <span class="px-2.5 py-0.5 rounded-full text-xs font-bold"
                    :style="`background: ${typeColor(notif.type).bg}; color: ${typeColor(notif.type).text}`">
                {{ typeLabel(notif.type) }}
              </span>
              <span class="text-xs text-gray-400">{{ formatDate(notif.envoyeeLe) }}</span>
            </div>
            <p v-if="notif.appelOffre" class="text-sm font-medium text-gray-800 truncate mb-1">
              {{ notif.appelOffre.titre }}
            </p>
            <div v-if="notif.appelOffre?.score !== null && notif.appelOffre?.score !== undefined"
                 class="flex items-center gap-1">
              <svg class="w-3 h-3 text-green-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
              </svg>
              <span class="text-xs font-semibold text-green-600">Score : {{ notif.appelOffre.score }}/100</span>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex flex-col items-end gap-2 flex-shrink-0">
            <div class="flex gap-1.5 flex-wrap justify-end">
              <button v-if="notif.statut === 'envoye'" @click="markRead(notif.id)"
                      class="text-xs px-2.5 py-1 rounded-lg font-medium bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors">
                Marquer lu
              </button>
              <button @click="resend(notif.id)" :disabled="sendingId === notif.id"
                      class="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg font-medium bg-[#fde8dc] text-[#e85d26] hover:bg-[#fbd5c5] transition-colors disabled:opacity-50">
                <svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                </svg>
                {{ sendingId === notif.id ? '...' : 'Renvoyer' }}
              </button>
              <button v-if="notif.ao_id" @click="router.push(`/appels-offres/${notif.ao_id}`)"
                      class="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg font-medium bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors">
                Voir
                <svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </button>
              <button @click="deleteNotif(notif.id)"
                      class="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg font-medium bg-red-50 text-red-400 hover:bg-red-100 hover:text-red-600 transition-colors">
                <svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>
