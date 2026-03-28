<script setup lang="ts">
import { ref } from 'vue'
import { useMaterialSettings } from '@/composables/useMaterialSettings'

const { settings, toggleSetting, setSetting, resetSettings } = useMaterialSettings()

const isOpen = ref(false)

const settingItems: { key: keyof typeof settings.value; label: string; description: string }[] = [
  {
    key: 'blendGlass',
    label: '混色毛玻璃',
    description: '开启背景饱和度与亮度增强的混色效果'
  },
  {
    key: 'textBlend',
    label: '文字混色',
    description: '文字使用 mix-blend-mode 混合模式'
  },
  {
    key: 'progressiveBlur',
    label: '渐变模糊',
    description: '多层递进模糊边缘过渡效果'
  },
  {
    key: 'smoothCorner',
    label: '平滑圆角',
    description: '使用 Squircle 平滑圆角效果'
  },
]

const glassHoleItems: { key: keyof typeof settings.value; label: string; description: string }[] = [
  {
    key: 'glassHoleBlend',
    label: '混色效果',
    description: 'GlassHole 组件的模糊混色效果'
  },
]
</script>

<template>
  <div class="settings-wrapper">
    <button
        class="settings-toggle"
        @click="isOpen = !isOpen"
        :class="{ active: isOpen }"
        aria-label="设置"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="3"/>
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
      </svg>
    </button>

    <Transition name="panel">
      <div v-if="isOpen" class="settings-panel">
        <div class="panel-header">
          <h3>材质样式设置</h3>
          <button class="close-btn" @click="isOpen = false">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div class="panel-content">
          <div class="section-title">GlassCard</div>
          <div
              v-for="item in settingItems"
              :key="item.key"
              class="setting-item"
          >
            <div class="setting-info">
              <span class="setting-label">{{ item.label }}</span>
              <span class="setting-desc">{{ item.description }}</span>
            </div>
            <label class="toggle">
              <input
                  type="checkbox"
                  :checked="Boolean(settings[item.key])"
                  @change="toggleSetting(item.key)"
              />
              <span class="toggle-slider"></span>
            </label>
          </div>

          <!-- 圆角设置 -->
          <div v-if="settings.smoothCorner" class="slider-group">
            <div class="slider-item">
              <div class="slider-header">
                <span class="slider-label">圆角大小</span>
                <span class="slider-value">{{ settings.cornerRadius }}px</span>
              </div>
              <input
                  type="range"
                  class="slider"
                  min="0"
                  max="120"
                  :value="settings.cornerRadius"
                  @input="setSetting('cornerRadius', Number(($event.target as HTMLInputElement).value))"
              />
            </div>
            <div class="slider-item">
              <div class="slider-header">
                <span class="slider-label">平滑度</span>
                <span class="slider-value">{{ (settings.cornerSmoothing * 100).toFixed(0) }}%</span>
              </div>
              <input
                  type="range"
                  class="slider"
                  min="0"
                  max="100"
                  :value="settings.cornerSmoothing * 100"
                  @input="setSetting('cornerSmoothing', Number(($event.target as HTMLInputElement).value) / 100)"
              />
            </div>
          </div>

          <div class="section-title">GlassHole</div>
          <div
              v-for="item in glassHoleItems"
              :key="item.key"
              class="setting-item"
          >
            <div class="setting-info">
              <span class="setting-label">{{ item.label }}</span>
              <span class="setting-desc">{{ item.description }}</span>
            </div>
            <label class="toggle">
              <input
                  type="checkbox"
                  :checked="Boolean(settings[item.key])"
                  @change="toggleSetting(item.key)"
              />
              <span class="toggle-slider"></span>
            </label>
          </div>
        </div>

        <div class="panel-footer">
          <button class="reset-btn" @click="resetSettings">
            重置默认
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.settings-wrapper {
  position: fixed;
  top: clamp(12px, 2vw, 24px);
  right: clamp(60px, 8vw, 84px);
  z-index: 998;
}

.settings-toggle {
  width: clamp(36px, 5vw, 52px);
  height: clamp(36px, 5vw, 52px);
  border-radius: 50%;
  border: none;
  cursor: pointer;
  font-size: clamp(16px, 2.5vw, 24px);
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.4);
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #333;
}

.settings-toggle:hover {
  transform: scale(1.1);
  background: rgba(255, 255, 255, 0.6);
}

.settings-toggle.active {
  background: rgba(100, 100, 100, 0.5);
}

:global([data-theme="dark"]) .settings-toggle {
  background: rgba(50, 50, 50, 0.6);
  color: #fff;
}

:global([data-theme="dark"]) .settings-toggle:hover {
  background: rgba(70, 70, 70, 0.8);
}

.settings-panel {
  position: fixed;
  top: clamp(60px, 10vw, 90px);
  right: clamp(12px, 2vw, 24px);
  width: min(320px, calc(100vw - 24px));
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(20px) brightness(1.5) saturate(1.5);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15), 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  z-index: 999;
  max-height: calc(100vh - 120px);
  overflow: hidden;
}

:global([data-theme="dark"]) .settings-panel {
  background: rgba(40, 40, 40, 0.95);
  color: #fff;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3), 0 2px 8px rgba(0, 0, 0, 0.2);
}

.panel-header {
  padding: 16px 20px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

:global([data-theme="dark"]) .panel-header {
  border-bottom-color: rgba(255, 255, 255, 0.08);
}

.panel-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.close-btn {
  width: 28px;
  height: 28px;
  border: none;
  background: transparent;
  cursor: pointer;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: inherit;
  opacity: 0.6;
  transition: opacity 0.2s, background 0.2s;
}

.close-btn:hover {
  opacity: 1;
  background: rgba(0, 0, 0, 0.06);
}

:global([data-theme="dark"]) .close-btn:hover {
  background: rgba(255, 255, 255, 0.08);
}

.panel-content {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
}

.section-title {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: rgba(0, 0, 0, 0.4);
  margin: 16px 0 8px 4px;
}

.section-title:first-child {
  margin-top: 0;
}

:global([data-theme="dark"]) .section-title {
  color: rgba(255, 255, 255, 0.4);
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 12px;
  margin-bottom: 8px;
  background: rgba(0, 0, 0, 0.03);
  border-radius: 10px;
  transition: background 0.2s;
}

.setting-item:hover {
  background: rgba(0, 0, 0, 0.05);
}

:global([data-theme="dark"]) .setting-item {
  background: rgba(255, 255, 255, 0.04);
}

:global([data-theme="dark"]) .setting-item:hover {
  background: rgba(255, 255, 255, 0.06);
}

.setting-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
  margin-right: 12px;
}

.setting-label {
  font-size: 14px;
  font-weight: 500;
}

.setting-desc {
  font-size: 11px;
  opacity: 0.5;
  line-height: 1.3;
}

.toggle {
  position: relative;
  width: 44px;
  height: 24px;
  flex-shrink: 0;
}

.toggle input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  inset: 0;
  background: rgba(0, 0, 0, 0.12);
  border-radius: 24px;
  transition: all 0.25s;
}

:global([data-theme="dark"]) .toggle-slider {
  background: rgba(255, 255, 255, 0.12);
}

.toggle-slider::before {
  content: '';
  position: absolute;
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background: #fff;
  border-radius: 50%;
  transition: all 0.25s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
}

.toggle input:checked + .toggle-slider {
  background: #3b82f6;
}

.toggle input:checked + .toggle-slider::before {
  transform: translateX(20px);
}

:global([data-theme="dark"]) .toggle input:checked + .toggle-slider {
  background: #2563eb;
}

.slider-group {
  padding: 12px;
  margin-bottom: 8px;
  background: rgba(0, 0, 0, 0.03);
  border-radius: 10px;
}

:global([data-theme="dark"]) .slider-group {
  background: rgba(255, 255, 255, 0.04);
}

.slider-item {
  margin-bottom: 12px;
}

.slider-item:last-child {
  margin-bottom: 0;
}

.slider-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.slider-label {
  font-size: 13px;
  font-weight: 500;
}

.slider-value {
  font-size: 12px;
  opacity: 0.6;
  font-variant-numeric: tabular-nums;
}

.slider {
  width: 100%;
  height: 4px;
  border-radius: 2px;
  background: rgba(0, 0, 0, 0.1);
  outline: none;
  -webkit-appearance: none;
  appearance: none;
}

:global([data-theme="dark"]) .slider {
  background: rgba(255, 255, 255, 0.1);
}

.slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #3b82f6;
  cursor: pointer;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  transition: transform 0.15s;
}

.slider::-webkit-slider-thumb:hover {
  transform: scale(1.1);
}

.slider::-moz-range-thumb {
  width: 16px;
  height: 16px;
  border: none;
  border-radius: 50%;
  background: #3b82f6;
  cursor: pointer;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.panel-footer {
  padding: 12px 16px;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
}

:global([data-theme="dark"]) .panel-footer {
  border-top-color: rgba(255, 255, 255, 0.08);
}

.reset-btn {
  width: 100%;
  padding: 10px;
  border: none;
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.05);
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  color: inherit;
  opacity: 0.7;
  transition: opacity 0.2s, background 0.2s;
}

.reset-btn:hover {
  opacity: 1;
  background: rgba(0, 0, 0, 0.08);
}

:global([data-theme="dark"]) .reset-btn {
  background: rgba(255, 255, 255, 0.06);
}

:global([data-theme="dark"]) .reset-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

.panel-enter-active,
.panel-leave-active {
  transition: all 0.25s ease;
}

.panel-enter-from,
.panel-leave-to {
  opacity: 0;
  transform: translateY(-10px) scale(0.95);
}
</style>