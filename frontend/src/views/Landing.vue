<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Zap, Upload, Brain, Bell, ArrowRight, CheckCircle, FileText, Star, ChevronDown, Github, Twitter } from 'lucide-vue-next'

const router = useRouter()
const statsVisible = ref(false)
const counters = ref({ documents: 0, score: 0, time: 0 })

const features = [
  {
    icon: Upload,
    title: 'Upload Multi-format',
    desc: 'Importez vos appels d\'offres en PDF, DOCX ou TXT. Notre système extrait automatiquement le contenu.',
    color: '#00d4ff',
    bg: 'rgba(0,212,255,0.08)'
  },
  {
    icon: Brain,
    title: 'Analyse par IA',
    desc: 'GPT-4 analyse le contenu, génère un résumé structuré, identifie le domaine et extrait les compétences clés.',
    color: '#8b5cf6',
    bg: 'rgba(139,92,246,0.08)'
  },
  {
    icon: Star,
    title: 'Score de Pertinence',
    desc: 'Obtenez un score de 0 à 100 basé sur vos profils d\'intérêt. Filtrez rapidement les meilleures opportunités.',
    color: '#10b981',
    bg: 'rgba(16,185,129,0.08)'
  },
  {
    icon: Bell,
    title: 'Alertes Email',
    desc: 'Recevez des notifications automatiques quand un AO dépasse votre seuil de pertinence défini.',
    color: '#f59e0b',
    bg: 'rgba(245,158,11,0.08)'
  }
]

const steps = [
  { num: '01', title: 'Importez votre document', desc: 'Glissez-déposez votre appel d\'offres' },
  { num: '02', title: 'Extraction automatique', desc: 'Le texte est extrait selon le format' },
  { num: '03', title: 'Analyse par GPT-4', desc: 'L\'IA génère résumé et score de pertinence' },
  { num: '04', title: 'Résultats & Alertes', desc: 'Consultez les résultats et recevez des notifications' },
]

const testimonials = [
  { name: 'Sophie Martin', role: 'Responsable Appels d\'offres', text: 'TRYBE nous a permis de réduire de 80% le temps passé à lire les AOs. Un gain énorme.', score: 5 },
  { name: 'Antoine Dupuis', role: 'Chef de projet IT', text: 'Le score de pertinence est redoutablement précis. On ne rate plus aucune opportunité.', score: 5 },
  { name: 'Clara Rousseau', role: 'Directrice commerciale', text: 'Interface magnifique et fonctionnalités top. Je recommande à tous mes collègues.', score: 5 },
]

onMounted(() => {
  setTimeout(() => {
    statsVisible.value = true
    animateCounter('documents', 1240, 2000)
    animateCounter('score', 94, 1500)
    animateCounter('time', 80, 1800)
  }, 800)
})

function animateCounter(key: 'documents' | 'score' | 'time', target: number, duration: number) {
  const start = performance.now()
  const step = (now: number) => {
    const progress = Math.min((now - start) / duration, 1)
    const ease = 1 - Math.pow(1 - progress, 3)
    counters.value[key] = Math.round(ease * target)
    if (progress < 1) requestAnimationFrame(step)
  }
  requestAnimationFrame(step)
}
</script>

<template>
  <div class="min-h-screen" style="background: #03030f; font-family: 'Inter', sans-serif;">

    <!-- NAVBAR -->
    <nav class="fixed top-0 left-0 right-0 z-50 px-6 py-4"
         style="background: rgba(3,3,15,0.8); backdrop-filter: blur(20px); border-bottom: 1px solid rgba(255,255,255,0.05);">
      <div class="max-w-7xl mx-auto flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-xl flex items-center justify-center"
               style="background: linear-gradient(135deg, #00d4ff, #8b5cf6);">
            <Zap :size="18" color="white" :stroke-width="2.5" />
          </div>
          <span class="text-white font-bold text-xl" style="font-family: 'Space Grotesk', sans-serif; letter-spacing: -0.02em;">TRYBE</span>
        </div>

        <div class="hidden md:flex items-center gap-8">
          <a href="#features" class="text-sm transition-colors" style="color: #64748b;" onmouseover="this.style.color='#e2e8f0'" onmouseout="this.style.color='#64748b'">Fonctionnalités</a>
          <a href="#how" class="text-sm transition-colors" style="color: #64748b;" onmouseover="this.style.color='#e2e8f0'" onmouseout="this.style.color='#64748b'">Comment ça marche</a>
          <a href="#stats" class="text-sm transition-colors" style="color: #64748b;" onmouseover="this.style.color='#e2e8f0'" onmouseout="this.style.color='#64748b'">Stats</a>
        </div>

        <div class="flex items-center gap-3">
          <button @click="router.push('/login')" class="btn-ghost text-sm px-5 py-2.5">Connexion</button>
          <button @click="router.push('/register')" class="btn-neon text-sm px-5 py-2.5">Commencer</button>
        </div>
      </div>
    </nav>

    <!-- HERO -->
    <section class="relative min-h-screen flex items-center justify-center overflow-hidden bg-grid pt-20">
      <!-- Glowing orbs -->
      <div class="hero-glow-1"></div>
      <div class="hero-glow-2"></div>
      <div class="hero-glow-3"></div>

      <!-- Floating decorative elements -->
      <div class="absolute top-32 right-32 w-64 h-64 animate-float-slow opacity-10"
           style="border: 1px solid rgba(0,212,255,0.3); border-radius: 30px; transform: rotate(15deg);"></div>
      <div class="absolute bottom-40 left-20 w-40 h-40 animate-float opacity-10"
           style="border: 1px solid rgba(139,92,246,0.4); border-radius: 20px; transform: rotate(-10deg);"></div>

      <div class="relative z-10 text-center max-w-5xl mx-auto px-6">
        <!-- Badge -->
        <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 animate-slide-up"
             style="background: rgba(0,212,255,0.08); border: 1px solid rgba(0,212,255,0.2);">
          <div class="w-2 h-2 rounded-full bg-neon-cyan animate-ping-slow" style="background: #00d4ff;"></div>
          <span class="text-sm font-medium" style="color: #00d4ff;">Propulsé par GPT-4 · Analyse en temps réel</span>
        </div>

        <!-- Main headline -->
        <h1 class="text-6xl md:text-8xl font-black mb-6 leading-none animate-slide-up delay-100"
            style="font-family: 'Space Grotesk', sans-serif; letter-spacing: -0.04em;">
          <span class="text-white">Analysez vos</span><br>
          <span class="gradient-text animate-gradient-x">Appels d'Offres</span><br>
          <span class="text-white">avec l'</span><span class="text-white">IA</span>
        </h1>

        <!-- Subtitle -->
        <p class="text-lg md:text-xl max-w-2xl mx-auto mb-10 animate-slide-up delay-200"
           style="color: #64748b; line-height: 1.8;">
          TRYBE analyse automatiquement vos documents, génère un score de pertinence,
          extrait les compétences clés et vous alerte par email sur les meilleures opportunités.
        </p>

        <!-- CTA Buttons -->
        <div class="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-slide-up delay-300">
          <button @click="router.push('/register')" class="btn-neon flex items-center gap-2 text-base px-8 py-4 w-full sm:w-auto">
            <Zap :size="18" />
            Commencer gratuitement
            <ArrowRight :size="16" />
          </button>
          <button @click="router.push('/login')" class="btn-ghost flex items-center gap-2 text-base px-8 py-4 w-full sm:w-auto">
            Voir la démo
          </button>
        </div>

        <!-- Social proof -->
        <div class="flex flex-wrap items-center justify-center gap-8 animate-slide-up delay-400">
          <div v-for="check in ['Upload PDF/DOCX/TXT', 'Score IA 0-100', 'Alertes email', 'Multi-profils']"
               :key="check" class="flex items-center gap-2">
            <CheckCircle :size="16" style="color: #10b981;" />
            <span class="text-sm" style="color: #64748b;">{{ check }}</span>
          </div>
        </div>

        <!-- Scroll indicator -->
        <div class="mt-20 flex flex-col items-center gap-2 animate-float" style="color: #2d3748;">
          <span class="text-xs">Défiler</span>
          <ChevronDown :size="20" />
        </div>
      </div>
    </section>

    <!-- STATS -->
    <section id="stats" class="py-20 relative" style="background: #080818;">
      <div class="max-w-5xl mx-auto px-6">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div class="text-center stat-card p-8">
            <div class="text-5xl font-black mb-2 gradient-text-cyan"
                 style="font-family: 'Space Grotesk', sans-serif;">
              {{ counters.documents.toLocaleString() }}+
            </div>
            <div class="text-sm" style="color: #475569;">Documents analysés</div>
          </div>
          <div class="text-center stat-card p-8">
            <div class="text-5xl font-black mb-2" style="color: #10b981; font-family: 'Space Grotesk', sans-serif;">
              {{ counters.score }}%
            </div>
            <div class="text-sm" style="color: #475569;">Précision du score IA</div>
          </div>
          <div class="text-center stat-card p-8">
            <div class="text-5xl font-black mb-2 gradient-text-purple" style="font-family: 'Space Grotesk', sans-serif;">
              -{{ counters.time }}%
            </div>
            <div class="text-sm" style="color: #475569;">De temps de lecture</div>
          </div>
        </div>
      </div>
    </section>

    <!-- FEATURES -->
    <section id="features" class="py-28 relative bg-grid-sm" style="background: #03030f;">
      <div class="max-w-7xl mx-auto px-6">
        <div class="text-center mb-20">
          <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
               style="background: rgba(139,92,246,0.1); border: 1px solid rgba(139,92,246,0.2);">
            <span class="text-xs font-semibold" style="color: #8b5cf6; text-transform: uppercase; letter-spacing: 0.1em;">Fonctionnalités</span>
          </div>
          <h2 class="text-4xl md:text-5xl font-black mb-4"
              style="font-family: 'Space Grotesk', sans-serif; letter-spacing: -0.03em; color: white;">
            Tout ce dont vous avez besoin
          </h2>
          <p class="text-lg max-w-2xl mx-auto" style="color: #64748b;">
            De l'import du document à la notification email, TRYBE automatise toute la chaîne d'analyse.
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div v-for="(feat, i) in features" :key="i"
               class="feature-card" :style="`--accent-color: ${feat.color};`">
            <div class="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform duration-300 hover:scale-110"
                 :style="`background: ${feat.bg}; border: 1px solid ${feat.color}30;`">
              <component :is="feat.icon" :size="24" :style="`color: ${feat.color};`" />
            </div>
            <h3 class="text-xl font-bold text-white mb-3" style="font-family: 'Space Grotesk', sans-serif;">{{ feat.title }}</h3>
            <p class="leading-relaxed" style="color: #64748b; font-size: 15px;">{{ feat.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- HOW IT WORKS -->
    <section id="how" class="py-28 relative" style="background: #080818;">
      <div class="max-w-4xl mx-auto px-6">
        <div class="text-center mb-20">
          <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
               style="background: rgba(0,212,255,0.08); border: 1px solid rgba(0,212,255,0.2);">
            <span class="text-xs font-semibold" style="color: #00d4ff; text-transform: uppercase; letter-spacing: 0.1em;">Comment ça marche</span>
          </div>
          <h2 class="text-4xl md:text-5xl font-black text-white"
              style="font-family: 'Space Grotesk', sans-serif; letter-spacing: -0.03em;">
            4 étapes, résultats immédiats
          </h2>
        </div>

        <div class="relative">
          <!-- Connecting line -->
          <div class="absolute left-8 top-10 bottom-10 w-px hidden md:block"
               style="background: linear-gradient(180deg, rgba(0,212,255,0.4), rgba(139,92,246,0.4), rgba(16,185,129,0.4), rgba(245,158,11,0.4));"></div>

          <div class="space-y-8">
            <div v-for="(step, i) in steps" :key="i"
                 class="flex gap-8 items-start">
              <div class="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 font-black text-lg z-10"
                   :style="`background: rgba(${i===0?'0,212,255':i===1?'139,92,246':i===2?'16,185,129':'245,158,11'},0.1); border: 1px solid rgba(${i===0?'0,212,255':i===1?'139,92,246':i===2?'16,185,129':'245,158,11'},0.3); color: ${['#00d4ff','#8b5cf6','#10b981','#f59e0b'][i]}; font-family: 'Space Grotesk', sans-serif;`">
                {{ step.num }}
              </div>
              <div class="flex-1 pb-8">
                <h3 class="text-xl font-bold text-white mb-2" style="font-family: 'Space Grotesk', sans-serif;">{{ step.title }}</h3>
                <p style="color: #64748b;">{{ step.desc }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- TESTIMONIALS -->
    <section class="py-28 relative bg-grid" style="background: #03030f;">
      <div class="max-w-7xl mx-auto px-6">
        <div class="text-center mb-20">
          <h2 class="text-4xl font-black text-white mb-4" style="font-family: 'Space Grotesk', sans-serif; letter-spacing: -0.03em;">
            Ils nous font confiance
          </h2>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div v-for="t in testimonials" :key="t.name" class="glass-card p-8">
            <div class="flex gap-1 mb-4">
              <Star v-for="i in t.score" :key="i" :size="16" fill="#f59e0b" style="color: #f59e0b;" />
            </div>
            <p class="mb-6 leading-relaxed" style="color: #94a3b8; font-style: italic;">"{{ t.text }}"</p>
            <div>
              <div class="font-semibold text-white">{{ t.name }}</div>
              <div class="text-sm" style="color: #475569;">{{ t.role }}</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="py-32 relative overflow-hidden" style="background: #080818;">
      <div class="absolute inset-0">
        <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full"
             style="background: radial-gradient(circle, rgba(0,212,255,0.06), transparent 70%);"></div>
      </div>
      <div class="relative z-10 max-w-3xl mx-auto px-6 text-center">
        <h2 class="text-5xl md:text-6xl font-black mb-6"
            style="font-family: 'Space Grotesk', sans-serif; letter-spacing: -0.04em;">
          <span class="text-white">Prêt à </span>
          <span class="gradient-text">automatiser</span>
          <span class="text-white"> votre veille ?</span>
        </h2>
        <p class="text-lg mb-10" style="color: #64748b;">
          Rejoignez des centaines d'équipes qui utilisent TRYBE pour ne plus jamais rater une opportunité.
        </p>
        <button @click="router.push('/register')" class="btn-neon flex items-center gap-2 text-base px-10 py-5 mx-auto">
          <Zap :size="20" />
          Commencer maintenant — C'est gratuit
          <ArrowRight :size="18" />
        </button>
      </div>
    </section>

    <!-- FOOTER -->
    <footer class="py-12 px-6" style="background: #03030f; border-top: 1px solid rgba(255,255,255,0.05);">
      <div class="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg flex items-center justify-center"
               style="background: linear-gradient(135deg, #00d4ff, #8b5cf6);">
            <Zap :size="15" color="white" />
          </div>
          <span class="font-bold" style="font-family: 'Space Grotesk', sans-serif; color: #64748b;">TRYBE</span>
        </div>
        <p class="text-sm" style="color: #334155;">
          Projet de stage 2ème année · Analyse automatisée des appels d'offres par IA
        </p>
        <div class="flex items-center gap-4">
          <a href="#" class="p-2 rounded-lg transition-colors" style="color: #475569;" onmouseover="this.style.color='#e2e8f0'" onmouseout="this.style.color='#475569'">
            <Github :size="18" />
          </a>
          <a href="#" class="p-2 rounded-lg transition-colors" style="color: #475569;" onmouseover="this.style.color='#e2e8f0'" onmouseout="this.style.color='#475569'">
            <Twitter :size="18" />
          </a>
        </div>
      </div>
    </footer>

  </div>
</template>
