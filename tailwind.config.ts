import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        tezos: {
          blue: '#0F61FF',
          blueDark: '#003EE0',
          blueLight: '#408DFF',
          blueLighter: '#7CB3FF',
          blueLightest: '#BEDFFF',
          purple: '#9F329F',
        },
        stealth: {
          DEFAULT: '#1D2227',
          dark: '#030405',
          light: '#4A4E52',
          lighter: '#787D82',
          lightest: '#9FA4A9',
        },
        slate: {
          DEFAULT: '#616F82',
          dark: '#263042',
          light: '#818C9B',
          lighter: '#9BA6B5',
          lightest: '#B9C2CF',
        },
        steel: {
          DEFAULT: '#838893',
          dark: '#505561',
          light: '#AEB1B9',
          lighter: '#E3E4E5',
          lightest: '#F6F8FA',
        },
        white: '#FFFFFF',
        black: '#000000',
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
        info: '#3B82F6',
      },
      backgroundColor: {
        'stealth': '#1D2227',
        'stealth-dark': '#030405',
        'stealth-light': '#4A4E52',
        'steel-dark': '#505561',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'tezos-gradient': 'linear-gradient(90deg, #0F61FF 0%, #9F329F 100%)',
      },
    },
  },
  plugins: [],
};

export default config; 