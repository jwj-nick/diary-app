import { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'light' | 'dark' | 'system'
type ResolvedTheme = 'light' | 'dark'

interface ThemeContextValue {
  theme: Theme
  resolved: ResolvedTheme
  setTheme: (t: Theme) => void
  toggle: () => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)
const STORAGE_KEY = 'diary-theme'

function getSystemTheme(): ResolvedTheme {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function applyThemeClass(resolved: ResolvedTheme) {
  const root = document.documentElement
  root.classList.toggle('dark', resolved === 'dark')
  root.style.colorScheme = resolved
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window === 'undefined') return 'system'
    return (localStorage.getItem(STORAGE_KEY) as Theme | null) ?? 'system'
  })

  const [resolved, setResolved] = useState<ResolvedTheme>(() =>
    theme === 'system' ? getSystemTheme() : theme
  )

  useEffect(() => {
    const next = theme === 'system' ? getSystemTheme() : theme
    setResolved(next)
    applyThemeClass(next)

    if (theme !== 'system') return
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => {
      const sys = getSystemTheme()
      setResolved(sys)
      applyThemeClass(sys)
    }
    media.addEventListener('change', handler)
    return () => media.removeEventListener('change', handler)
  }, [theme])

  const setTheme = (t: Theme) => {
    setThemeState(t)
    localStorage.setItem(STORAGE_KEY, t)
  }

  const toggle = () => setTheme(resolved === 'dark' ? 'light' : 'dark')

  return (
    <ThemeContext.Provider value={{ theme, resolved, setTheme, toggle }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider')
  return ctx
}
