<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, useAttrs, computed } from 'vue';
import { getSvgPath } from './utils';

export interface SquircleProps {
  as?: string;
  radius?: number;
  topLeftRadius?: number;
  topRightRadius?: number;
  bottomRightRadius?: number;
  bottomLeftRadius?: number;
  cornerSmoothing?: number;
  preserveSmoothing?: boolean;
  disabled?: boolean;
  useMask?: boolean;
}

const props = withDefaults(defineProps<SquircleProps>(), {
  as: 'div',
  cornerSmoothing: 0.8,
  preserveSmoothing: true,
  disabled: false,
  useMask: false,
});

const attrs = useAttrs();
const elementRef = ref<HTMLElement | null>(null);
const dimensions = ref({ width: 0, height: 0 });
const maskId = ref(`squircle-mask-${Math.random().toString(36).slice(2)}`);

declare global {
  interface Window {
    squircle: Record<string, string>;
  }
}

const svgPath = computed(() => {
  const { width, height } = dimensions.value;
  if (width === 0 || height === 0) return '';

  const key = `${width}-${height}-${props.radius}-${props.cornerSmoothing}`;
  if (!window.squircle) window.squircle = {};

  if (window.squircle[key]) {
    return window.squircle[key];
  }

  const path = getSvgPath({
    width,
    height,
    radius: props.radius,
    topLeftRadius: props.topLeftRadius,
    topRightRadius: props.topRightRadius,
    bottomRightRadius: props.bottomRightRadius,
    bottomLeftRadius: props.bottomLeftRadius,
    cornerSmoothing: props.cornerSmoothing,
    preserveSmoothing: props.preserveSmoothing,
  });
  window.squircle[key] = path;
  return path;
});

const applyStyle = () => {
  if (!elementRef.value) return;

  const { width, height } = dimensions.value;
  if (width === 0 || height === 0) return;

  if (props.disabled) {
    elementRef.value.style.clipPath = '';
    elementRef.value.style.mask = '';
    elementRef.value.style.webkitMask = '';
    elementRef.value.style.borderRadius = `${props.radius}px`;
    return;
  }

  const path = svgPath.value;
  if (!path) return;

  if (props.useMask) {
    elementRef.value.style.clipPath = '';
    elementRef.value.style.mask = `url(#${maskId.value})`;
    elementRef.value.style.webkitMask = `url(#${maskId.value})`;
    elementRef.value.style.borderRadius = `${props.radius}px`;
  } else {
    elementRef.value.style.mask = '';
    elementRef.value.style.webkitMask = '';
    elementRef.value.style.clipPath = `path('${path}')`;
    elementRef.value.style.borderRadius = `${props.radius}px`;
  }
};

let observer: ResizeObserver | null = null;

onMounted(() => {
  if (!elementRef.value) return;

  observer = new ResizeObserver((entries) => {
    for (const entry of entries) {
      const { width, height } = entry.contentRect;
      dimensions.value = { width, height };
    }
  });

  observer.observe(elementRef.value);
});

onUnmounted(() => {
  observer?.disconnect();
});

watch([dimensions, () => props.disabled, () => props.useMask], applyStyle, { deep: true });
</script>

<template>
  <component :is="as" ref="elementRef" v-bind="attrs">
    <svg
      v-if="useMask && !disabled && svgPath"
      class="squircle-mask-svg"
      :viewBox="`0 0 ${dimensions.width} ${dimensions.height}`"
    >
      <defs>
        <mask :id="maskId" maskUnits="userSpaceOnUse">
          <path :d="svgPath" fill="white" />
        </mask>
      </defs>
    </svg>
    <slot />
  </component>
</template>

<style scoped>
.squircle-mask-svg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}
</style>