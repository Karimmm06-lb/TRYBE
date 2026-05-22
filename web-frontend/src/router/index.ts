
import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/Login.vue'
import Dashboard from '../views/Dashboard.vue'

// Karim — Module Ingestion & Analyse
const Upload              = () => import('../views/Upload.vue')
const AoDetail            = () => import('../views/AoDetail.vue')
const NotificationsView   = () => import('../views/NotificationsView.vue')
const AnalyticsDashboard  = () => import('../views/AnalyticsDashboard.vue')

const router = createRouter({
  history: createWebHistory(),
  routes: [

    { path: '/', redirect: '/login' },


    { path: '/login', name: 'login', component: Login },


    { path: '/dashboard', name: 'dashboard', component: Dashboard },

    // Karim — Module Ingestion & Analyse
    { path: '/appels-offres/nouveau',  name: 'upload',        component: Upload },
    { path: '/appels-offres/:id',      name: 'ao-detail',     component: AoDetail },
    { path: '/notifications',          name: 'notifications', component: NotificationsView },
    { path: '/analytics',              name: 'analytics',     component: AnalyticsDashboard }
  ]
})

export default router