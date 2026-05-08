import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'

export interface User {
  id: number
  email: string
  role: string
  notif_email_active: boolean
  createdAt: string
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(localStorage.getItem('trybe_token'))

  const isAuthenticated = computed(() => !!token.value)
  const isAdmin = computed(() => user.value?.role === 'admin')

  if (token.value) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token.value}`
  }

  async function login(email: string, password: string) {
    const res = await axios.post('/api/auth/login', { email, password })
    token.value = res.data.token
    user.value = res.data.user
    localStorage.setItem('trybe_token', res.data.token)
    axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`
  }

  async function register(email: string, password: string) {
    const res = await axios.post('/api/auth/register', { email, password })
    token.value = res.data.token
    user.value = res.data.user
    localStorage.setItem('trybe_token', res.data.token)
    axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`
  }

  async function fetchMe() {
    try {
      const res = await axios.get('/api/auth/me')
      user.value = res.data
    } catch {
      logout()
    }
  }

  function logout() {
    token.value = null
    user.value = null
    localStorage.removeItem('trybe_token')
    delete axios.defaults.headers.common['Authorization']
  }

  return { user, token, isAuthenticated, isAdmin, login, register, fetchMe, logout }
})
