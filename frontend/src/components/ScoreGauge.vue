<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ score: number; size?: number }>()

const size = computed(() => props.size ?? 160)
const radius = computed(() => (size.value - 20) / 2)
const circumference = computed(() => 2 * Math.PI * radius.value)
const strokeDash = computed(() => {
  const pct = Math.min(Math.max(props.score, 0), 100) / 100
  return circumference.value * pct
})
const strokeGap = computed(() => circumference.value - strokeDash.value)

const color = computed(() => {
  if (props.score >= 70) return ['#10b981', '#34d399']
  if (props.score >= 40) return ['#f59e0b', '#fcd34d']
  return ['#f43f5e', '#fb7185']
})

const label = computed(() => {
  if (props.score >= 70) return 'Pertinent'
  if (props.score >= 40) return 'Moyen'
  return 'Faible'
})

const cx = computed(() => size.value / 2)
const cy = computed(() => size.value / 2)
const gradientId = computed(() => `gauge-gradient-${props.score}`)
</script>

<template>
  <div class="flex flex-col items-center gap-2">
    <svg :width="size" :height="size" :viewBox="`0 0 ${size} ${size}`" class="rotate-[-90deg]">
      <defs>
        <linearGradient :id="gradientId" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" :stop-color="color[0]" />
          <stop offset="100%" :stop-color="color[1]" />
        </linearGradient>
        <filter :id="`glow-${score}`">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>

      <!-- Track -->
      <circle
        :cx="cx" :cy="cy" :r="radius"
        fill="none"
        stroke="rgba(255,255,255,0.06)"
        :stroke-width="10"
        stroke-linecap="round"
      />

      <!-- Fill -->
      <circle
        :cx="cx" :cy="cy" :r="radius"
        fill="none"
        :stroke="`url(#${gradientId})`"
        :stroke-width="10"
        stroke-linecap="round"
        :stroke-dasharray="`${strokeDash} ${strokeGap}`"
        :filter="`url(#glow-${score})`"
        style="transition: stroke-dasharray 1.2s cubic-bezier(0.4, 0, 0.2, 1);"
      />
    </svg>

    <div class="text-center -mt-2" :style="`margin-top: -${size * 0.6}px; position: relative; z-index: 1;`">
      <div class="font-bold" :style="`font-size: ${size * 0.22}px; color: ${color[0]}; font-family: 'Space Grotesk', sans-serif; line-height: 1;`">
        {{ score }}
      </div>
      <div class="text-xs font-medium mt-1" :style="`color: ${color[0]}; opacity: 0.8;`">{{ label }}</div>
    </div>

    <div class="text-center" :style="`margin-top: ${size * 0.28}px;`">
      <div class="text-xs" style="color: #475569;">Score de pertinence</div>
    </div>
  </div>
</template>
