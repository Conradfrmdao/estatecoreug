import type { Config } from 'tailwindcss'

/**
 * Colours are declared once, as RGB channels in app/globals.css, and mapped
 * here so opacity modifiers work (`bg-ink/10`). Components use these names,
 * never raw hex, so a palette change is a one-file edit.
 */
function channel(name: string) {
  return `rgb(var(--c-${name}) / <alpha-value>)`
}

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif']
      },
      colors: {
        ground: channel('ground'),
        canvas: channel('canvas'),
        ink: {
          DEFAULT: channel('ink'),
          soft: channel('ink-soft')
        },
        muted: channel('muted'),
        faint: channel('faint'),
        line: {
          DEFAULT: channel('line'),
          strong: channel('line-strong')
        },
        forest: {
          DEFAULT: channel('forest'),
          muted: channel('forest-muted'),
          ink: channel('forest-ink')
        },
        night: {
          DEFAULT: channel('night'),
          raised: channel('night-raised'),
          muted: channel('night-muted'),
          line: channel('night-line')
        },
        hi: {
          DEFAULT: channel('hi'),
          strong: channel('hi-strong')
        },
        mint: {
          DEFAULT: channel('mint'),
          soft: channel('mint-soft'),
          strong: channel('mint-strong')
        },
        brand: {
          DEFAULT: channel('brand'),
          text: channel('brand-text')
        },
        danger: {
          DEFAULT: channel('danger'),
          line: channel('danger-line'),
          soft: channel('danger-soft')
        },
        paid: { fg: channel('paid-fg'), bg: channel('paid-bg') },
        advance: { fg: channel('advance-fg'), bg: channel('advance-bg') },
        carried: { fg: channel('carried-fg'), bg: channel('carried-bg'), bar: channel('carried-bar') },
        due: { fg: channel('due-fg'), bg: channel('due-bg') },
        overdue: { fg: channel('overdue-fg'), bg: channel('overdue-bg') }
      },
      borderRadius: {
        card: '28px',
        panel: '22px',
        tile: '18px'
      },
      boxShadow: {
        soft: '0 12px 40px rgba(15, 19, 17, 0.08)',
        float: '0 14px 30px -14px rgba(15, 19, 17, 0.5)',
        pop: '0 6px 14px -8px rgba(15, 19, 17, 0.55)',
        overlay: '0 28px 70px -24px rgba(15, 19, 17, 0.45)'
      },
      transitionTimingFunction: {
        rail: 'cubic-bezier(0.65, 0, 0.35, 1)',
        'out-soft': 'cubic-bezier(0.22, 1, 0.36, 1)'
      }
    }
  },
  plugins: []
}

export default config
