<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted, nextTick, watch } from "vue"
import { getMaterialSettings } from '@/composables/useMaterialSettings'

const props = defineProps({
  text: { type: String, default: "GLASS" },
  mode: { type: String, default: "text" },
  blur: { type: Number, default: 16 },
  brightness: { type: Number, default: 1.5 },
  saturate: { type: Number, default: 1.5 },
  tint: { type: String, default: "rgba(255,255,255,0.2)" },
  fontSize: { type: Number, default: 60 },
  fontWeight: { type: [String, Number], default: 700 },
  letterSpacing: { type: Number, default: 4 },
  padding: { type: Number, default: 20 },
  maxWidth: { type: Number, default: 0 },
})

const settings = getMaterialSettings()
const containerRef = ref<HTMLElement | null>(null)
const textRef = ref<SVGTextElement | null>(null)
const slotRef = ref<HTMLElement | null>(null)
const dimensions = ref({ width: 0, height: 0 })
const maskId = `mask-${Math.random().toString(36).slice(2)}`

const shouldUseBlend = computed(() => settings.value.glassHoleBlend)

const blurStyle = computed(() => ({
  backdropFilter: `blur(${props.blur}px) brightness(${props.brightness}) saturate(${props.saturate})`,
  WebkitBackdropFilter: `blur(${props.blur}px) brightness(${props.brightness}) saturate(${props.saturate})`,
  background: props.tint,
  mask: `url(#${maskId})`,
  WebkitMask: `url(#${maskId})`,
  maskSize: "100% 100%",
  maskPosition: "center",
  maskRepeat: "no-repeat",
  WebkitMaskSize: "100% 100%",
  WebkitMaskPosition: "center",
  WebkitMaskRepeat: "no-repeat",
}))

let observer: ResizeObserver | null = null
let scale = ref(1)

const textStyle = computed(() => ({
  fontSize: (props.fontSize * scale.value) + "px",
  fontWeight: String(props.fontWeight),
  letterSpacing: (props.letterSpacing * scale.value) + "px",
}))

const updateDimensions = async () => {
  await nextTick()
  
  if (props.mode === 'text' && textRef.value) {
    const bbox = textRef.value.getBBox()
    let width = Math.ceil(bbox.width + props.padding * 2)
    let height = Math.ceil(bbox.height + props.padding * 2)
    
    if (props.maxWidth > 0 && width > props.maxWidth) {
      scale.value = props.maxWidth / width
      width = props.maxWidth
      height = Math.ceil(height * scale.value)
    } else {
      scale.value = 1
    }
    
    dimensions.value = { width, height }
  } else if (props.mode === 'custom' && slotRef.value) {
    const rect = slotRef.value.getBoundingClientRect()
    dimensions.value = {
      width: Math.ceil(rect.width + props.padding * 2),
      height: Math.ceil(rect.height + props.padding * 2)
    }
  }
}

onMounted(() => {
  updateDimensions()
  
  if (containerRef.value) {
    observer = new ResizeObserver(updateDimensions)
    observer.observe(containerRef.value)
  }
})

onUnmounted(() => {
  observer?.disconnect()
})

watch(() => props.text, updateDimensions)
watch(() => props.fontSize, updateDimensions)
watch(() => props.maxWidth, updateDimensions)
</script>

<template>
  <div ref="containerRef" class="glass-hole" :style="{ width: dimensions.width + 'px', height: dimensions.height + 'px' }">
    <!-- 混色模式 -->
    <template v-if="shouldUseBlend">
      <svg class="glass-svg" :viewBox="`0 0 ${dimensions.width} ${dimensions.height}`">
        <defs>
          <mask :id="maskId" maskUnits="userSpaceOnUse">
            <rect :width="dimensions.width" :height="dimensions.height" fill="black" />
            
            <!-- 文字模式 -->
            <text
              v-if="mode === 'text'"
              ref="textRef"
              :x="dimensions.width / 2"
              :y="dimensions.height / 2"
              text-anchor="middle"
              dominant-baseline="middle"
              fill="white"
              :style="textStyle"
            >
              {{ text }}
            </text>
            
            <!-- 自定义模式 -->
            <g v-else fill="white">
              <foreignObject 
                :x="padding" 
                :y="padding" 
                :width="dimensions.width - padding * 2" 
                :height="dimensions.height - padding * 2"
              >
                <div ref="slotRef" class="mask-slot">
                  <slot name="mask" />
                </div>
              </foreignObject>
            </g>
          </mask>
        </defs>
      </svg>
      <div class="glass-blur" :style="blurStyle"></div>
    </template>

    <!-- 普通模式 -->
    <template v-else>
      <div v-if="mode === 'text'" class="glass-simple" :style="textStyle">
        {{ text }}
      </div>
      <div v-else class="glass-simple">
        <slot name="mask" />
      </div>
    </template>
  </div>
</template>

<style scoped>
.glass-hole {
  position: relative;
  display: inline-block;
  max-width: 100%;
}

.glass-svg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.mask-slot {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.glass-blur {
  position: absolute;
  inset: 0;
}

.glass-simple {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  color: var(--simple-text-color, rgba(0, 0, 0, 0.5));
}

:global([data-theme="dark"]) .glass-hole .glass-simple {
  --simple-text-color: rgba(255, 255, 255, 0.6);
}
</style>