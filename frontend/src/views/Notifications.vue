<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import Sidebar from '@/components/Sidebar.vue'
import { Bell, CheckCheck, Mail, TrendingUp, Clock, ArrowRight, Filter, Send, Trash2 } from 'lucide-vue-next'
import axios from 'axios'

const router = useRouter()
const auth = useAuthStore()

interface Notif {
  id: number
  type: string
  statut: string
  envoyeeLe: string
  ao_id: number
  appelOffre?: { titre: string; score: number | null }
}

const notifications = ref<Notif[]>([])
const loading = ref(true)
const filter = ref<'all' | 'envoye' | 'lu'>('all')

onMounted(async () => {
  if (!auth.user) await auth.fetchMe()
  try {
    const res = await axios.get('/api/notifications')
    notifications.value = res.data
  } finally {
    loading.value = false
  }
})

async function markRead(id: number) {
  await axios.put(`/api/notifications/${id}/lue`)
  const n = notifications.value.find(n => n.id === id)
  if (n) n.statut = 'lu'
}

async function markAllRead() {
  await Promise.all(
    notifications.value.filter(n => n.statut === 'envoye').map(n => markRead(n.id))
  )
}

const sendingId = ref<number | null>(null)

async function resend(id: number) {
  sendingId.value = id
  try {
    await axios.post(`/api/notifications/${id}/renvoyer`)
    const n = notifications.value.find(n => n.id === id)
    if (n) { n.statut = 'envoye' }
  } finally {
    sendingId.value = null
  }
}

async function deleteNotif(id: number) {
  await axios.delete(`/api/notifications/${id}`)
  notifications.value = notifications.value.filter(n => n.id !== id)
}

const filtered = computed(() => {
  if (filter.value === 'all') return notifications.value
  return notifications.value.filter(n => n.statut === filter.value)
})

const unreadCount = computed(() => notifications.value.filter(n => n.statut === 'envoye').length)

function typeLabel(type: string) {
  const map: Record<string, string> = {
    pertinent: 'AO Pertinent',
    tres_pertinent: 'Très pertinent',
    alerte: 'Alerte seuil'
  }
  return map[type] ?? type
}

function typeColor(type: string) {
  if (type === 'tres_pertinent') return { text: '#10b981', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.2)' }
  if (type === 'pertinent') return { text: '#00d4ff', bg: 'rgba(0,212,255,0.1)', border: 'rgba(0,212,255,0.2)' }
  return { text: '#f59e0b', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.2)' }
}

function typeIcon(type: string) {
  if (type === 'tres_pertinent') return TrendingUp
  if (type === 'pertinent') return Mail
  return Bell
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
  <div class="flex min-h-screen" style="background: #03030f;">
    <Sidebar />
    <main class="flex-1 ml-64 min-h-screen">

      <!-- Header -->
      <div class="sticky top-0 z-30 px-8 py-5 flex items-center justify-between"
           style="background: rgba(3,3,15,0.9); backdrop-filter: blur(20px); border-bottom: 1px solid rgba(255,255,255,0.05);">
        <div class="flex items-center gap-3">
          <h1 class="text-xl font-bold text-white" style="font-family: 'Space Grotesk', sans-serif;">Notifications</h1>
          <span v-if="unreadCount > 0"
                class="px-2.5 py-0.5 rounded-full text-xs font-bold"
                style="background: rgba(0,212,255,0.15); color: #00d4ff; border: 1px solid rgba(0,212,255,0.25);">
            {{ unreadCount }}
          </span>
        </div>
        <button v-if="unreadCount > 0" @click="markAllRead"
                class="btn-ghost flex items-center gap-2 text-sm px-4 py-2">
          <CheckCheck :size="15" />
          Tout marquer lu
        </button>
      </div>

      <div class="p-8 max-w-3xl">

        <!-- Filter tabs -->
        <div class="flex gap-2 mb-6 animate-slide-up">
          <button v-for="f in [
            { key: 'all', label: 'Toutes' },
            { key: 'envoye', label: 'Non lues' },
            { key: 'lu', label: 'Lues' }
          ]" :key="f.key"
          @click="filter = f.key as any"
          class="px-4 py-2 rounded-xl text-sm font-medium transition-all"
          :style="filter === f.key
            ? 'background: rgba(0,212,255,0.1); color: #00d4ff; border: 1px solid rgba(0,212,255,0.2);'
            : 'background: rgba(255,255,255,0.03); color: #475569; border: 1px solid rgba(255,255,255,0.06);'">
            {{ f.label }}
          </button>
        </div>

        <!-- Loading -->
        <div v-if="loading" class="flex justify-center py-20">
          <div class="w-8 h-8 rounded-full border-2 animate-spin" style="border-color: rgba(0,212,255,0.2); border-top-color: #00d4ff;"></div>
        </div>

        <!-- Empty -->
        <div v-else-if="filtered.length === 0" class="glass-card-static p-16 text-center animate-fade-in">
          <Bell :size="48" class="mx-auto mb-4" style="color: #1e293b;" />
          <h3 class="text-xl font-bold text-white mb-2" style="font-family: 'Space Grotesk', sans-serif;">Aucune notification</h3>
          <p class="text-sm" style="color: #475569;">Vous recevrez des alertes quand un AO dépasse votre seuil.</p>
        </div>

        <!-- List -->
        <div v-else class="space-y-3">
          <div v-for="notif in filtered" :key="notif.id"
               class="notif-item animate-slide-up"
               :style="notif.statut === 'envoye' ? 'border-color: rgba(0,212,255,0.12);' : ''">

            <!-- Icon -->
            <div class="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                 :style="`background: ${typeColor(notif.type).bg}; border: 1px solid ${typeColor(notif.type).border};`">
              <component :is="typeIcon(notif.type)" :size="18" :style="`color: ${typeColor(notif.type).text};`" />
            </div>

            <!-- Content -->
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-1">
                <span class="text-sm font-semibold" :style="`color: ${typeColor(notif.type).text};`">
                  {{ typeLabel(notif.type) }}
                </span>
                <div v-if="notif.statut === 'envoye'" class="w-2 h-2 rounded-full" style="background: #00d4ff;"></div>
              </div>
              <p v-if="notif.appelOffre" class="text-sm mb-1 truncate" style="color: #94a3b8;">
                {{ notif.appelOffre.titre }}
              </p>
              <div v-if="notif.appelOffre?.score !== null" class="flex items-center gap-2">
                <TrendingUp :size="12" style="color: #10b981;" />
                <span class="text-xs font-medium" style="color: #10b981;">Score : {{ notif.appelOffre?.score }}/100</span>
              </div>
            </div>

            <!-- Right side -->
            <div class="flex flex-col items-end gap-2 flex-shrink-0">
              <div class="flex items-center gap-1 text-xs" style="color: #334155;">
                <Clock :size="11" />
                {{ formatDate(notif.envoyeeLe) }}
              </div>
              <div class="flex gap-2 flex-wrap justify-end">
                <button v-if="notif.statut === 'envoye'" @click="markRead(notif.id)"
                        class="text-xs px-2.5 py-1 rounded-lg transition-colors"
                        style="background: rgba(0,212,255,0.08); color: #00d4ff;"
                        onmouseover="this.style.background='rgba(0,212,255,0.15)'" onmouseout="this.style.background='rgba(0,212,255,0.08)'">
                  Marquer lu
                </button>
                <button @click="resend(notif.id)" :disabled="sendingId === notif.id"
                        class="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg transition-colors"
                        style="background: rgba(139,92,246,0.08); color: #8b5cf6;"
                        onmouseover="this.style.background='rgba(139,92,246,0.18)'" onmouseout="this.style.background='rgba(139,92,246,0.08)'">
                  <Send :size="10" />
                  {{ sendingId === notif.id ? '...' : 'Renvoyer' }}
                </button>
                <button v-if="notif.ao_id" @click="router.push(`/appels-offres/${notif.ao_id}`)"
                        class="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg transition-colors"
                        style="background: rgba(255,255,255,0.04); color: #64748b;"
                        onmouseover="this.style.color='#e2e8f0'" onmouseout="this.style.color='#64748b'">
                  Voir <ArrowRight :size="10" />
                </button>
                <button @click="deleteNotif(notif.id)"
                        class="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg transition-colors"
                        style="background: rgba(244,63,94,0.06); color: #f43f5e;"
                        onmouseover="this.style.background='rgba(244,63,94,0.15)'" onmouseout="this.style.background='rgba(244,63,94,0.06)'">
                  <Trash2 :size="10" />
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </main>
  </div>
</template>
