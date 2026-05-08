<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { Zap, Mail, Lock, Eye, EyeOff, ArrowRight, CheckCircle } from 'lucide-vue-next'

const router = useRouter()
const auth = useAuthStore()

const email = ref('')
const password = ref('')
const confirm = ref('')
const showPass = ref(false)
const showConfirm = ref(false)
const loading = ref(false)
const error = ref('')

const perks = ['Analyse IA illimitée', 'Score de pertinence 0-100', 'Alertes email', 'Multi-profils d\'intérêt']

async function submit() {
  error.value = ''
  if (!email.value || !password.value || !confirm.value) {
    error.value = 'Veuillez remplir tous les champs.'
    return
  }
  if (password.value !== confirm.value) {
    error.value = 'Les mots de passe ne correspondent pas.'
    return
  }
  if (password.value.length < 6) {
    error.value = 'Le mot de passe doit contenir au moins 6 caractères.'
    return
  }
  loading.value = true
  try {
    await auth.register(email.value, password.value)
    router.push('/dashboard')
  } catch (e: any) {
    error.value = e?.response?.data?.message ?? 'Erreur lors de la création du compte.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center relative overflow-hidden bg-grid"
       style="background: #03030f;">
    <div class="absolute top-1/3 right-1/4 w-96 h-96 rounded-full pointer-events-none"
         style="background: radial-gradient(circle, rgba(139,92,246,0.08), transparent 70%);"></div>
    <div class="absolute bottom-1/4 left-1/4 w-80 h-80 rounded-full pointer-events-none"
         style="background: radial-gradient(circle, rgba(0,212,255,0.08), transparent 70%);"></div>

    <div class="relative z-10 w-full max-w-md px-4">
      <button @click="router.push('/')" class="flex items-center gap-2 mb-8 text-sm transition-colors"
              style="color: #475569;" onmouseover="this.style.color='#e2e8f0'" onmouseout="this.style.color='#475569'">
        ← Retour à l'accueil
      </button>

      <div class="auth-card animate-slide-up">
        <div class="flex items-center gap-3 mb-8">
          <div class="w-10 h-10 rounded-xl flex items-center justify-center"
               style="background: linear-gradient(135deg, #00d4ff, #8b5cf6);">
            <Zap :size="20" color="white" />
          </div>
          <span class="text-white font-bold text-2xl" style="font-family: 'Space Grotesk', sans-serif; letter-spacing: -0.02em;">TRYBE</span>
        </div>

        <h1 class="text-2xl font-bold text-white mb-1" style="font-family: 'Space Grotesk', sans-serif;">Créer un compte</h1>
        <p class="text-sm mb-6" style="color: #475569;">Commencez à analyser vos appels d'offres dès maintenant.</p>

        <!-- Perks -->
        <div class="grid grid-cols-2 gap-2 mb-6">
          <div v-for="p in perks" :key="p" class="flex items-center gap-2">
            <CheckCircle :size="13" style="color: #10b981; flex-shrink: 0;" />
            <span class="text-xs" style="color: #64748b;">{{ p }}</span>
          </div>
        </div>

        <div v-if="error" class="mb-5 px-4 py-3 rounded-xl text-sm"
             style="background: rgba(244,63,94,0.1); border: 1px solid rgba(244,63,94,0.2); color: #f43f5e;">
          {{ error }}
        </div>

        <form @submit.prevent="submit" class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-2" style="color: #94a3b8;">Email</label>
            <div class="relative">
              <Mail :size="16" class="absolute left-4 top-1/2 -translate-y-1/2" style="color: #475569;" />
              <input v-model="email" type="email" placeholder="vous@email.com" class="input-neon pl-11" />
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium mb-2" style="color: #94a3b8;">Mot de passe</label>
            <div class="relative">
              <Lock :size="16" class="absolute left-4 top-1/2 -translate-y-1/2" style="color: #475569;" />
              <input v-model="password" :type="showPass ? 'text' : 'password'" placeholder="Min. 6 caractères"
                     class="input-neon pl-11 pr-11" />
              <button type="button" @click="showPass = !showPass"
                      class="absolute right-4 top-1/2 -translate-y-1/2" style="color: #475569;">
                <component :is="showPass ? EyeOff : Eye" :size="16" />
              </button>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium mb-2" style="color: #94a3b8;">Confirmer le mot de passe</label>
            <div class="relative">
              <Lock :size="16" class="absolute left-4 top-1/2 -translate-y-1/2" style="color: #475569;" />
              <input v-model="confirm" :type="showConfirm ? 'text' : 'password'" placeholder="Répétez le mot de passe"
                     class="input-neon pl-11 pr-11" />
              <button type="button" @click="showConfirm = !showConfirm"
                      class="absolute right-4 top-1/2 -translate-y-1/2" style="color: #475569;">
                <component :is="showConfirm ? EyeOff : Eye" :size="16" />
              </button>
            </div>
          </div>

          <button type="submit" :disabled="loading"
                  class="btn-neon w-full flex items-center justify-center gap-2 py-3.5 mt-2">
            <div v-if="loading" class="spinner"></div>
            <template v-else>
              Créer mon compte
              <ArrowRight :size="16" />
            </template>
          </button>
        </form>

        <p class="mt-6 text-center text-sm" style="color: #475569;">
          Déjà un compte ?
          <RouterLink to="/login" class="font-semibold ml-1" style="color: #00d4ff;">Se connecter</RouterLink>
        </p>
      </div>
    </div>
  </div>
</template>
