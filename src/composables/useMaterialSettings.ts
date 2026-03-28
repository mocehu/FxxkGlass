import { ref, watch, onMounted } from 'vue'

export interface MaterialSettings {
  blendGlass: boolean
  textBlend: boolean
  progressiveBlur: boolean
  smoothCorner: boolean
  glassHoleBlend: boolean
  cornerRadius: number
  cornerSmoothing: number
}

const defaultSettings: MaterialSettings = {
  blendGlass: true,
  textBlend: true,
  progressiveBlur: true,
  smoothCorner: true,
  glassHoleBlend: true,
  cornerRadius: 24,
  cornerSmoothing: 0.8,
}

const settings = ref<MaterialSettings>({ ...defaultSettings })

export function useMaterialSettings() {
  const loadSettings = () => {
    const saved = localStorage.getItem('materialSettings')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        settings.value = { ...defaultSettings, ...parsed }
      } catch {
        settings.value = { ...defaultSettings }
      }
    }
  }

  const saveSettings = () => {
    localStorage.setItem('materialSettings', JSON.stringify(settings.value))
  }

  const resetSettings = () => {
    settings.value = { ...defaultSettings }
  }

  const toggleSetting = (key: keyof MaterialSettings) => {
    if (typeof settings.value[key] === 'boolean') {
      (settings.value as Record<string, unknown>)[key] = !(settings.value as Record<string, unknown>)[key]
    }
  }

  const setSetting = <K extends keyof MaterialSettings>(key: K, value: MaterialSettings[K]) => {
    settings.value[key] = value
  }

  onMounted(() => {
    loadSettings()
  })

  watch(settings, saveSettings, { deep: true })

  return {
    settings,
    toggleSetting,
    setSetting,
    resetSettings,
  }
}

export function getMaterialSettings() {
  return settings
}