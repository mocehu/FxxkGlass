<script setup lang="ts">
import { computed } from 'vue'
import { getMaterialSettings } from '@/composables/useMaterialSettings'

interface Props {
  blur: number
  height: number
  color: string
  position: 'top' | 'bottom' | 'both'
  border?: number
}

const props = withDefaults(defineProps<Props>(), {
  border: 0,
})

const settings = getMaterialSettings()

interface Layer {
  id: number
  height: number
  blur: number
  color: string
}

interface Color {
  r: number
  g: number
  b: number
  a: number
}

function transhextorgba(color: string): Color {
  if (color.startsWith('#')) {
    if (color.length === 7) {
      const r = parseInt(color.slice(1, 3), 16)
      const g = parseInt(color.slice(3, 5), 16)
      const b = parseInt(color.slice(5, 7), 16)
      return { r, g, b, a: 0.85 }
    } else if (color.length === 9) {
      const r = parseInt(color.slice(1, 3), 16)
      const g = parseInt(color.slice(3, 5), 16)
      const b = parseInt(color.slice(5, 7), 16)
      const a = parseInt(color.slice(7, 9), 16)
      return { r, g, b, a: a / 255 }
    }
  } else if (color.startsWith('rgba(')) {
    const [r, g, b, a] = color.slice(5, -1).split(',').map(Number)
    return { r, g, b, a }
  }
  return { r: 255, g: 255, b: 255, a: 0.85 }
}

function calculateFineLayers(totalHeight: number): number {
  if (totalHeight < 100) {
    const fineTarget = Math.max(0, Math.floor(totalHeight / 4))
    return Math.max(0, Math.ceil(fineTarget / 2))
  } else {
    return 15
  }
}

function calculateLayersCount(totalHeight: number): number {
  const N = calculateFineLayers(totalHeight)
  let h = totalHeight
  let i = 1
  let coarseBase = 2
  while (h > 0) {
    if (i <= N) {
      h -= 2
    } else {
      h -= coarseBase * coarseBase
      coarseBase++
    }
    i++
  }
  return i
}

const layers = computed(() => {
  const { blur, height, color, position, border } = props
  const colorRgba: Color = transhextorgba(color)
  const flagtop = position === 'top' || position === 'both'
  const flagbottom = position === 'bottom' || position === 'both'
  const useProgressiveBlur = settings.value.progressiveBlur

  if (!useProgressiveBlur) {
    const simpleLayer: Layer = {
      id: 1,
      height: height,
      blur: blur,
      color: `rgba(${colorRgba.r}, ${colorRgba.g}, ${colorRgba.b}, ${colorRgba.a})`,
    }
    return {
      toplayers: [simpleLayer],
      bottomlayers: [simpleLayer],
      flagtop,
      flagbottom,
      height,
      border,
      isProgressive: false,
    }
  }

  const fineLayers = calculateFineLayers(height)
  const layersCount = calculateLayersCount(height)

  const layerCount = Math.max(0, layersCount - 1)
  const progressList: number[] = []

  {
    let tmpHeight = height
    for (let i = 1; i <= layerCount; i++) {
      if (i <= fineLayers) {
        tmpHeight -= 2
      } else {
        const j = i - fineLayers
        tmpHeight -= Math.pow(j + 1, 2)
      }
      const covered = height - Math.max(0, tmpHeight)
      const p = height > 0 ? Math.max(0, Math.min(1, covered / height)) : 0
      progressList.push(p)
    }
  }

  const sumPSq = progressList.reduce((acc, p) => acc + p * p, 0)
  const scale = sumPSq > 0 ? blur / Math.sqrt(sumPSq) : 0
  const perLayerBlur: number[] = progressList.map((p) => scale * p)

  const toplayers: Layer[] = []
  const bottomlayers: Layer[] = []
  let theight = height

  for (let i = 1; i <= layerCount; i++) {
    let colort: string
    let colorb: string

    if (i === 1) {
      colort = `linear-gradient(180deg, rgba(${colorRgba.r}, ${colorRgba.g}, ${colorRgba.b}, ${colorRgba.a}), transparent)`
      colorb = `linear-gradient(0deg, rgba(${colorRgba.r}, ${colorRgba.g}, ${colorRgba.b}, ${colorRgba.a}), transparent)`
    } else {
      colort = 'rgba(0, 0, 0, 0)'
      colorb = 'rgba(0, 0, 0, 0)'
    }

    const tblur = perLayerBlur[i - 1]
    if (i <= fineLayers) {
      theight -= 2
    } else {
      const j = i - fineLayers
      theight -= Math.pow(j + 1, 2)
    }

    toplayers.unshift({
      id: i,
      height: theight,
      blur: tblur,
      color: colort,
    })
    bottomlayers.unshift({
      id: i,
      height: theight,
      blur: tblur,
      color: colorb,
    })
  }

  return {
    toplayers,
    bottomlayers,
    flagtop,
    flagbottom,
    height,
    border,
    isProgressive: true,
  }
})
</script>

<template>
  <div class="relative w-full" aria-hidden>
    <div
      v-if="layers.flagtop"
      class="left-0 w-full z-50 pointer-events-none"
      :style="{
        height: `${layers.height}px`,
        position: 'fixed',
        top: '0'
      }"
    >
      <div
        v-for="layer in layers.toplayers"
        :key="layer.id"
        class="absolute left-0 top-0 w-full"
        :style="{
          background: layer.color,
          height: `${layer.height}px`,
          backdropFilter: `blur(${layer.blur}px)`,
          borderTopLeftRadius: `${layers.border}px`,
          borderTopRightRadius: `${layers.border}px`,
        }"
      ></div>
    </div>
    <div
      v-if="layers.flagbottom"
      class="absolute bottom-0 left-0 w-full flex flex-col-reverse z-99 pointer-events-none"
      :style="{ height: `${layers.height}px` }"
    >
      <div
        v-for="layer in layers.bottomlayers"
        :key="layer.id"
        class="absolute left-0 bottom-0 w-full"
        :style="{
          background: layer.color,
          height: `${layer.height}px`,
          backdropFilter: `blur(${layer.blur}px)`,
          borderBottomLeftRadius: `${layers.border}px`,
          borderBottomRightRadius: `${layers.border}px`,
        }"
      ></div>
    </div>
    <slot></slot>
  </div>
</template>
