<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import {
  LayoutDashboard, Upload, FileText, User, Bell,
  LogOut, Zap, ChevronRight
} from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const links = [
  { name: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { name: 'upload', label: 'Analyser', icon: Upload },
  { name: 'appels-offres', label: 'Mes AOs', icon: FileText },
  { name: 'profils', label: 'Profils', icon: User },
  { name: 'notifications', label: 'Notifications', icon: Bell },
]

const isActive = (name: string) => route.name === name

function logout() {
  auth.logout()
  router.push('/')
}

const initials = computed(() => {
  if (!auth.user?.email) return '?'
  return auth.user.email.substring(0, 2).toUpperCase()
})
</script>

<template>
  <aside class="fixed left-0 top-0 h-screen w-64 flex flex-col z-40"
         style="background: rgba(8,8,24,0.95); border-right: 1px solid rgba(255,255,255,0.06); backdrop-filter: blur(20px);">

    <!-- Logo -->
    <div class="px-6 py-6 flex items-center gap-3">
      <div class="w-9 h-9 rounded-xl flex items-center justify-center relative"
           style="background: linear-gradient(135deg, #00d4ff, #8b5cf6);">
        <Zap :size="18" color="white" :stroke-width="2.5" />
      </div>
      <span class="text-white font-bold text-xl" style="font-family: 'Space Grotesk', sans-serif; letter-spacing: -0.02em;">TRYBE</span>
      <span class="ml-auto text-xs px-2 py-0.5 rounded-full"
            style="background: rgba(0,212,255,0.1); color: #00d4ff; border: 1px solid rgba(0,212,255,0.2);">IA</span>
    </div>

    <div class="h-px mx-4" style="background: rgba(255,255,255,0.06);"></div>

    <!-- Nav -->
    <nav class="flex-1 px-3 py-4 space-y-1">
      <RouterLink
        v-for="link in links"
        :key="link.name"
        :to="{ name: link.name }"
        :class="['sidebar-link', isActive(link.name) ? 'active' : '']"
      >
        <component :is="link.icon" :size="18" :stroke-width="isActive(link.name) ? 2 : 1.8" />
        <span>{{ link.label }}</span>
        <ChevronRight v-if="isActive(link.name)" :size="14" class="ml-auto opacity-60" />
      </RouterLink>
    </nav>

    <div class="h-px mx-4" style="background: rgba(255,255,255,0.06);"></div>

    <!-- User section -->
    <div class="p-4">
      <div class="flex items-center gap-3 p-3 rounded-xl" style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06);">
        <div class="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0"
             style="background: linear-gradient(135deg, rgba(0,212,255,0.3), rgba(139,92,246,0.3)); color: #00d4ff; border: 1px solid rgba(0,212,255,0.2);">
          {{ initials }}
        </div>
        <div class="flex-1 min-w-0">
          <div class="text-white text-sm font-medium truncate">{{ auth.user?.email?.split('@')[0] }}</div>
          <div class="text-xs" style="color: #475569;">{{ auth.user?.role === 'admin' ? 'Administrateur' : 'Utilisateur' }}</div>
        </div>
        <button @click="logout" class="p-1.5 rounded-lg transition-colors hover:bg-red-500/10 hover:text-red-400" style="color: #475569;">
          <LogOut :size="15" />
        </button>
      </div>
    </div>
  </aside>
</template>
