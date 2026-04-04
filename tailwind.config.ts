import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: '#000000',
          card: '#1C1C1E',
          elevated: '#2C2C2E',
          glow: '#0A0A0C',
        },
        text: {
          primary: '#FFFFFF',
          secondary: '#8E8E93',
          tertiary: '#48484A',
          muted: '#3A3A3C',
        },
        // Generic Premium Accents
        // -> During onboarding, you can swap `primary` with your actual brand color
        accent: {
          primary: '#0A84FF', // Default Blue
          secondary: '#7D7AFF', // Default Purple
          tertiary: '#32D3FF', // Default Aqua
          brand: '#FF9500', // Default Orange
          success: '#30D158',
          warning: '#FF9F0A',
          error: '#FF453A',
        },
        surface: {
          base: '#09090B',
          subtle: '#121212',
          elevated: '#2C2C2E',
        },
        stroke: {
          soft: '#2F2F30',
          subtle: '#2F2F30',
          strong: '#3F3F41',
          glow: '#1B1B1D',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      fontSize: {
        display: [
          '4rem',
          { lineHeight: '1', fontWeight: '300', letterSpacing: '-0.02em' },
        ],
        'display-sm': [
          '3rem',
          { lineHeight: '1', fontWeight: '300', letterSpacing: '-0.015em' },
        ],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'orbital-glow': 'orbital 16s linear infinite',
        'ambient-shift': 'ambientShift 8s ease-in-out infinite',
        'bounce-in':
          'bounceIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
        'scale-in': 'scaleIn 0.2s ease-out forwards',
        float: 'float 3s ease-in-out infinite',
      },
      keyframes: {
        orbital: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        ambientShift: {
          '0%, 100%': { opacity: '0.35', filter: 'hue-rotate(0deg)' },
          '50%': { opacity: '0.6', filter: 'hue-rotate(45deg)' },
        },
        bounceIn: {
          '0%': { transform: 'scale(0.3)', opacity: '0' },
          '50%': { transform: 'scale(1.05)' },
          '70%': { transform: 'scale(0.9)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      backgroundImage: {
        'gradient-aurora':
          'linear-gradient(120deg, rgba(10,132,255,0.6) 0%, rgba(125,122,255,0.4) 50%, rgba(50,211,255,0.3) 100%)',
        'gradient-midnight':
          'linear-gradient(160deg, rgba(12,12,15,0.9) 0%, rgba(27,27,31,0.9) 50%, rgba(10,10,12,0.95) 100%)',
        'gradient-primary': 'linear-gradient(135deg, #0A84FF 0%, #32D3FF 100%)',
      },
      boxShadow: {
        neon: '0 0 30px rgba(10, 132, 255, 0.4)',
        glow: '0 10px 40px rgba(10, 132, 255, 0.3)',
        soft: '0 20px 60px rgba(0, 0, 0, 0.45)',
      },
      dropShadow: {
        neon: '0 0 10px rgba(10, 132, 255, 0.6)',
      },
      backdropBlur: {
        heavy: '24px',
        medium: '18px',
        light: '12px',
      },
    },
  },
  plugins: [],
}

export default config
