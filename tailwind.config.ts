import type { Config } from 'tailwindcss'

export default {
  content: [
    './components/**/*.{vue,js,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './app.vue',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        status: {
          operational: '#00b67a',
          degraded: '#f5a623',
          partial_outage: '#ff6b35',
          major_outage: '#dc3545',
          maintenance: '#6366f1',
        },
      },
    },
  },
  plugins: [],
} satisfies Config
