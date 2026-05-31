
import { createRouter, createWebHistory } from 'vue-router'

// Ghani — Module Récupération & Classification
import Login     from '../views/ghani/Login.vue'
import Dashboard from '../views/ghani/Dashboard.vue'

// Karim — Module Ingestion & Analyse
const Upload             = () => import('../views/karim/Upload.vue')
const AoDetail           = () => import('../views/karim/AoDetail.vue')
const NotificationsView  = () => import('../views/karim/NotificationsView.vue')
const AnalyticsDashboard = () => import('../views/karim/AnalyticsDashboard.vue')

const router = createRouter({
  history: createWebHistory(),
  routes: [

    { path: '/', redirect: '/login' },

    // Ghani — Module Récupération & Classification
    { path: '/login',     name: 'login',     component: Login },
    { path: '/dashboard', name: 'dashboard', component: Dashboard },

    // Karim — Module Ingestion & Analyse
    { path: '/appels-offres/nouveau', name: 'upload',        component: Upload },
    { path: '/appels-offres/:id',     name: 'ao-detail',     component: AoDetail },
    { path: '/notifications',         name: 'notifications', component: NotificationsView },
    { path: '/analytics',             name: 'analytics',     component: AnalyticsDashboard }
  ]
})

export default router
