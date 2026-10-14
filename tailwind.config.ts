import type { Config } from 'tailwindcss'

export default {
  content: [
    './components/**/*.{vue,js,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './composables/**/*.{js,ts}',
    './app.vue',
    './error.vue'
  ],
  theme: {
    extend: {
      colors: {
        // EDGE logo palette: purple #8062FD (primary) · green #5FCC7B · navy #010028.
        // `dark` / `deep` are shades of the same hue — the ramp exists so text and
        // white-on-fill keep their AA contrast; never introduce a new hue.
        brand: {
          DEFAULT: '#8062FD',  // 4.13:1 on white — fills, borders, icons, focus rings
          light:   '#9A82FE',  // gradient tops, subtle highlights
          dark:    '#6B4AEE',  // 5.47:1 — hover fills
          deep:    '#5B3FD9',  // 6.65:1 — purple text on white / on a brand tint
        },
        accent: {
          DEFAULT: '#5FCC7B',  // logo green, lightened — dots, tints, graphics (2.02:1, never text)
          dark:    '#0B8940',  // 4.50:1 — accent text, and fills carrying white text
          deep:    '#027231',  // 6.08:1 — accent text on an accent tint
        },
        text: {
          DEFAULT: '#010028CC',
        },
        heading: '#010028',
      },
      fontFamily: {
        sans: ['Poppins', 'Cairo', 'sans-serif'],
      },
      fontSize: {
        base: '14px',
      }
    }
  },
  plugins: []
} satisfies Config
