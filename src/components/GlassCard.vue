<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { getMaterialSettings } from '@/composables/useMaterialSettings'
import { getSvgPath } from '@/components/squircle/utils'

type Variant = 'thin' | 'regular' | 'thick'

interface Props {
  variant?: Variant
  radius?: number
  cornerSmoothing?: number
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'regular',
})

const settings = getMaterialSettings()
const containerRef = ref<HTMLElement | null>(null)
const dimensions = ref({ width: 0, height: 0 })
const maskId = `glass-mask-${Math.random().toString(36).slice(2)}`

declare global {
  interface Window {
    squircle: Record<string, string>;
  }
}

const variantClass = computed(() => `material--${props.variant}`)

const glassBlurValue = computed(() => {
  switch (props.variant) {
    case 'thin': return 10
    case 'regular': return 20
    case 'thick': return 40
    default: return 20
  }
})

const shouldUseTextBlend = computed(() => settings.value.textBlend)
const shouldUseSmoothCorner = computed(() => settings.value.smoothCorner)

const currentRadius = computed(() => props.radius ?? settings.value.cornerRadius)
const currentSmoothing = computed(() => props.cornerSmoothing ?? settings.value.cornerSmoothing)

const svgPath = computed(() => {
  const { width, height } = dimensions.value
  if (width === 0 || height === 0) return ''
  
  if (!shouldUseSmoothCorner.value) return ''
  
  const key = `${width}-${height}-${currentRadius.value}-${currentSmoothing.value}`
  if (!window.squircle) window.squircle = {}
  
  if (window.squircle[key]) return window.squircle[key]
  
  const path = getSvgPath({
    width,
    height,
    radius: currentRadius.value,
    cornerSmoothing: currentSmoothing.value,
    preserveSmoothing: true,
  })
  window.squircle[key] = path
  return path
})

const glassStyle = computed(() => {
  const baseStyle = {
    '--glass-blur': `${glassBlurValue.value}px`,
    '--glass-saturate': settings.value.blendGlass ? '150%' : '100%',
    '--glass-brightness': settings.value.blendGlass ? '1.3' : '1',
  }
  
  if (shouldUseSmoothCorner.value && svgPath.value) {
    return {
      ...baseStyle,
      mask: `url(#${maskId})`,
      webkitMask: `url(#${maskId})`,
    }
  }
  
  return {
    ...baseStyle,
    mask: '',
    webkitMask: '',
  }
})

const containerStyle = computed(() => ({
  borderRadius: `${currentRadius.value}px`,
}))

let observer: ResizeObserver | null = null

onMounted(() => {
  if (!containerRef.value) return
  
  observer = new ResizeObserver((entries) => {
    for (const entry of entries) {
      const { width, height } = entry.contentRect
      dimensions.value = { width, height }
    }
  })
  observer.observe(containerRef.value)
})

onUnmounted(() => {
  observer?.disconnect()
})
</script>

<template>
  <div ref="containerRef" class="material" :class="variantClass" :style="containerStyle">
    <!-- SVG mask 定义 -->
    <svg
      v-if="shouldUseSmoothCorner && svgPath"
      class="material__svg"
      :viewBox="`0 0 ${dimensions.width} ${dimensions.height}`"
    >
      <defs>
        <mask :id="maskId" maskUnits="userSpaceOnUse">
          <path :d="svgPath" fill="white" />
        </mask>
      </defs>
    </svg>
    
    <!-- 模糊层 -->
    <div class="material__glass" :style="glassStyle"></div>
    
    <!-- 内容层 -->
    <div class="material__content">
      <div class="material__inner">
        <template v-if="shouldUseTextBlend">
          <div class="glass-shadow">
            <slot></slot>
          </div>
          <div class="glass-blend">
            <slot></slot>
          </div>
        </template>
        <div v-else class="glass-simple">
          <slot></slot>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.material {
  width: 100%;
  height: clamp(140px, 25vw, 200px);
  position: relative;
  background: rgba(255, 255, 255, 0.01);
  transition: box-shadow 0.35s cubic-bezier(.2, .8, .2, 1);
}

.material:hover {
  box-shadow:
    10px 30px 30px rgba(0, 0, 0, 0.15),
    2px 10px 10px rgba(0, 0, 0, 0.1);
}

.material__svg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.material__glass {
  position: absolute;
  inset: 0;
  box-shadow: inset 0 0 0 1px var(--glass-border, rgba(255, 255, 255, 0.2));
  backdrop-filter: blur(var(--glass-blur)) saturate(var(--glass-saturate)) brightness(var(--glass-brightness));
  -webkit-backdrop-filter: blur(var(--glass-blur)) saturate(var(--glass-saturate)) brightness(var(--glass-brightness));
}

.material--thin .material__glass {
  background: color-mix(in srgb,
      var(--glass-bg, rgba(255, 255, 255, 0.6)) calc(var(--glass-opacity-thin, 0.3) * 100%),
      transparent);
}

.material--regular .material__glass {
  background: color-mix(in srgb,
      var(--glass-bg, rgba(255, 255, 255, 0.6)) calc(var(--glass-opacity-regular, 0.6) * 100%),
      transparent);
}

.material--thick .material__glass {
  background: color-mix(in srgb,
      var(--glass-bg, rgba(255, 255, 255, 0.6)) calc(var(--glass-opacity-thick, 0.75) * 100%),
      transparent);
}

.material__content {
  position: absolute;
  inset: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  pointer-events: none;
}

.material__inner {
  font-size: clamp(28px, 5vw, 48px);
  font-weight: 900;
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  pointer-events: auto;
}

.material__inner :deep(svg) {
  height: clamp(70px, 12vw, 120px);
  fill: currentColor;
  display: block;
}

.glass-shadow,
.glass-blend {
  position: absolute;
  align-items: center;
  justify-content: center;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}

.glass-shadow {
  color: var(--text-shadow, rgba(0, 0, 0, 0.2));
  mix-blend-mode: multiply;
}

.glass-blend {
  color: var(--text-main, #000);
  mix-blend-mode: overlay;
}

.glass-simple {
  color: var(--simple-text-color, rgba(0, 0, 0, 0.6));
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}

:global([data-theme="dark"]) .material .glass-simple {
  --simple-text-color: rgba(255, 255, 255, 0.7);
}

@media (max-width: 768px) {
  .material {
    height: clamp(120px, 30vw, 180px);
  }

  .material__inner {
    font-size: clamp(24px, 6vw, 48px);
  }

  .material__inner :deep(svg) {
    height: clamp(60px, 15vw, 100px);
  }
}

@media (max-width: 480px) {
  .material {
    height: 140px;
  }

  .material__inner {
    font-size: 28px;
  }

  .material__inner :deep(svg) {
    height: 70px;
  }
}
</style>