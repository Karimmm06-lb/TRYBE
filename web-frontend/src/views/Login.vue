<template>
  <div class="login-bg min-h-screen flex items-center justify-center p-4">
    <div class="w-full max-w-[420px]">
      <div class="text-center mb-8">
        <h1 class="text-5xl font-extrabold text-[#e85d26] tracking-tighter m-0">trybe</h1>
        <p class="text-gray-600 mt-2">Bienvenue</p>
      </div>

      <div class="bg-white rounded-[24px] border border-gray-200 p-10 shadow-xl" :class="{ 'animate-shake': error }">
        <form @submit.prevent="handleLogin" class="space-y-6">
          <div class="space-y-2">
            <label class="block text-sm font-bold text-gray-900">Email</label>
            <input 
              v-model="email" 
              type="email" 
              placeholder="your email" 
              class="w-full h-[52px] px-4 border border-gray-300 rounded-xl outline-none focus:border-[#e85d26] transition-all" 
              required
              :disabled="isLoading"
            >
          </div>

          <div class="space-y-2">
            <label class="block text-sm font-bold text-gray-900">Mot de passe</label>
            <input 
              v-model="password" 
              type="password" 
              placeholder="your password" 
              class="w-full h-[52px] px-4 border border-gray-300 rounded-xl outline-none focus:border-[#e85d26] transition-all" 
              required
              :disabled="isLoading"
            >
          </div>

          <p v-if="errorMessage" class="text-red-500 text-sm text-center font-bold">
            {{ errorMessage }}
          </p>

          <button 
            type="submit" 
            :disabled="isLoading"
            class="w-full py-4 bg-[#e85d26] text-white font-bold rounded-xl shadow-lg shadow-orange-200 hover:bg-[#c2410c] transition-all active:scale-[0.98] disabled:opacity-70 flex justify-center items-center"
          >
            <span v-if="isLoading" class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            <span v-else>Se connecter</span>
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const email = ref('')
const password = ref('')
const error = ref(false)
const errorMessage = ref('') 
const isLoading = ref(false)

const handleLogin = async () => {
  if (!email.value || !password.value) return;

  try {
    isLoading.value = true;
    errorMessage.value = '';

    
    const response = await fetch('http://localhost:8080/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: email.value,
        password: password.value
      })
    });

    const data = await response.json();

    
    if (!response.ok) {
      throw new Error(data.error || "Erreur de connexion");
    }

   
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));

    
    router.push('/dashboard');

  } catch (err: any) {
   
    error.value = true;
    errorMessage.value = err.message; 
    setTimeout(() => { error.value = false }, 400);
  } finally {
    isLoading.value = false;
  }
}
</script>

<style scoped>
.login-bg {
  background-image: 
    radial-gradient(ellipse at 20% 50%, rgba(232,93,38,0.08) 0%, transparent 60%),
    radial-gradient(ellipse at 80% 20%, rgba(232,93,38,0.05) 0%, transparent 50%);
  background-color: #fdf6f0;
}
.animate-shake { animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both; }
@keyframes shake {
  10%, 90% { transform: translate3d(-1px, 0, 0); }
  20%, 80% { transform: translate3d(2px, 0, 0); }
  30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
  40%, 60% { transform: translate3d(4px, 0, 0); }
}
</style>