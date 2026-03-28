import { ref, watch, onMounted } from 'vue'

export type Theme = 'light' | 'dark'

export function useTheme() {
  const theme = ref<Theme>('light')

  const getSystemTheme = (): Theme => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }

  const applyTheme = (newTheme: Theme) => {
    if (newTheme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark')
    } else {
      document.documentElement.removeAttribute('data-theme')
    }
  }

  const toggleTheme = () => {
    theme.value = theme.value === 'dark' ? 'light' : 'dark'
  }

  const setTheme = (newTheme: Theme) => {
    theme.value = newTheme
  }

  onMounted(() => {
    const saved = localStorage.getItem('theme') as Theme | null
    theme.value = saved || getSystemTheme()
    applyTheme(theme.value)
  })

  watch(theme, (newTheme) => {
    applyTheme(newTheme)
    localStorage.setItem('theme', newTheme)
  })

  return {
    theme,
    toggleTheme,
    setTheme,
  }
}
