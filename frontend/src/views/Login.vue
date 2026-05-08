<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { Zap, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-vue-next'

const router = useRouter()
const auth = useAuthStore()

const email = ref('')
const password = ref('')
const showPass = ref(false)
const loading = ref(false)
const error = ref('')

async function submit() {
  error.value = ''
  if (!email.value || !password.value) {
    error.value = 'Veuillez remplir tous les champs.'
    return
  }
  loading.value = true
  try {
    await auth.login(email.value, password.value)
    router.push('/dashboard')
  } catch (e: any) {
    error.value = e?.response?.data?.message ?? 'Email ou mot de passe incorrect.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center relative overflow-hidden bg-grid"
       style="background: #03030f;">
    <!-- Glows -->
    <div class="absolute top-1/4 left-1/4 w-96 h-96 rounded-full pointer-events-none"
         style="background: radial-gradient(circle, rgba(0,212,255,0.08), transparent 70%);"></div>
    <div class="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full pointer-events-none"
         style="background: radial-gradient(circle, rgba(139,92,246,0.08), transparent 70%);"></div>

    <div class="relative z-10 w-full max-w-md px-4">
      <!-- Back to landing -->
      <button @click="router.push('/')" class="flex items-center gap-2 mb-8 text-sm transition-colors"
              style="color: #475569;" onmouseover="this.style.color='#e2e8f0'" onmouseout="this.style.color='#475569'">
        ← Retour à l'accueil
      </button>

      <div class="auth-card animate-slide-up">
        <!-- Logo -->
        <div class="flex items-center gap-3 mb-8">
          <div class="w-10 h-10 rounded-xl flex items-center justify-center"
               style="background: linear-gradient(135deg, #00d4ff, #8b5cf6);">
            <Zap :size="20" color="white" />
          </div>
          <span class="text-white font-bold text-2xl" style="font-family: 'Space Grotesk', sans-serif; letter-spacing: -0.02em;">TRYBE</span>
        </div>

        <h1 class="text-2xl font-bold text-white mb-1" style="font-family: 'Space Grotesk', sans-serif;">Bon retour !</h1>
        <p class="text-sm mb-8" style="color: #475569;">Connectez-vous à votre espace TRYBE.</p>

        <!-- Error -->
        <div v-if="error" class="mb-6 px-4 py-3 rounded-xl text-sm"
             style="background: rgba(244,63,94,0.1); border: 1px solid rgba(244,63,94,0.2); color: #f43f5e;">
          {{ error }}
        </div>

        <form @submit.prevent="submit" class="space-y-5">
          <!-- Email -->
          <div>
            <label class="block text-sm font-medium mb-2" style="color: #94a3b8;">Email</label>
            <div class="relative">
              <Mail :size="16" class="absolute left-4 top-1/2 -translate-y-1/2" style="color: #475569;" />
              <input
                v-model="email" type="email" placeholder="vous@email.com"
                class="input-neon pl-11" autocomplete="email"
              />
            </div>
          </div>

          <!-- Password -->
          <div>
            <label class="block text-sm font-medium mb-2" style="color: #94a3b8;">Mot de passe</label>
            <div class="relative">
              <Lock :size="16" class="absolute left-4 top-1/2 -translate-y-1/2" style="color: #475569;" />
              <input
                v-model="password" :type="showPass ? 'text' : 'password'"
                placeholder="••••••••" class="input-neon pl-11 pr-11"
                autocomplete="current-password"
              />
              <button type="button" @click="showPass = !showPass"
                      class="absolute right-4 top-1/2 -translate-y-1/2 transition-colors"
                      style="color: #475569;" onmouseover="this.style.color='#94a3b8'" onmouseout="this.style.color='#475569'">
                <component :is="showPass ? EyeOff : Eye" :size="16" />
              </button>
            </div>
          </div>

          <button type="submit" :disabled="loading"
                  class="btn-neon w-full flex items-center justify-center gap-2 py-3.5 mt-2">
            <div v-if="loading" class="spinner"></div>
            <template v-else>
              Se connecter
              <ArrowRight :size="16" />
            </template>
          </button>
        </form>

        <p class="mt-6 text-center text-sm" style="color: #475569;">
          Pas encore de compte ?
          <RouterLink to="/register" class="font-semibold ml-1 transition-colors"
                      style="color: #00d4ff;" onmouseover="this.style.color='#33ddff'" onmouseout="this.style.color='#00d4ff'">
            Créer un compte
          </RouterLink>
        </p>
      </div>
    </div>
  </div>
</template>
