<template>
  <div class="border border-border rounded-xl p-6 bg-surface hover:shadow-md transition-shadow mb-4">
    <div class="flex justify-between items-start mb-4">
      <div>
        <h3 class="text-xl font-bold text-textPrimary mb-2">{{ ao.titre }}</h3>
        <div class="flex items-center gap-2 text-sm text-textSecondary">
          <strong>Domaine:</strong> {{ ao.domaine }} 
          <span class="text-textMuted">•</span> {{ ao.date }} 
          <span class="text-textMuted">•</span> <span class="text-brand">{{ ao.source }}</span>
        </div>
      </div>
      <div class="flex flex-col items-end gap-2">
        <span class="px-3 py-1 bg-green-100 text-green-700 text-sm font-bold rounded-full">
          Score: {{ ao.score }}%
        </span>
        <span class="px-3 py-0.5 bg-orange-100 text-orange-700 text-xs font-semibold rounded-full">
          {{ ao.statut }}
        </span>
      </div>
    </div>
    
    <p class="text-sm text-textSecondary mb-6 leading-relaxed">{{ ao.description }}</p>
    
    <div class="flex gap-3">
      <button class="px-6 py-2.5 bg-[#e85d26] text-white text-sm font-bold rounded-lg shadow-sm hover:bg-[#c2410c] transition-colors">
        Voir les détails
      </button>
      <button @click="$emit('toggle-save', ao)" 
              :class="isSaved ? 'bg-gray-100 text-gray-500' : 'bg-[#16a34a] text-white hover:bg-green-700'" 
              class="px-6 py-2.5 text-sm font-bold rounded-lg shadow-sm transition-colors">
        {{ isSaved ? 'Sauvegardé' : 'Sauvegarder' }}
      </button>
      <button class="px-6 py-2.5 border border-gray-300 text-gray-700 text-sm font-bold rounded-lg hover:bg-gray-50 transition-colors">
        Ignorer
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  ao: any,
  isSaved: boolean
}>()

defineEmits(['toggle-save'])
</script>