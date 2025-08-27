
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			fontFamily: {
				'display': ['Poppins', 'sans-serif'],
				'sans': ['Poppins', 'system-ui', 'sans-serif'],
			},
			colors: {
				// Surface Colors - Modern Gradient Theme
				'surface': {
					900: '#0a0e1a',
					800: '#111827',
					700: '#1f2937',
					600: '#374151',
					500: '#4b5563',
				},
				// Primary Gradient Colors
				'gradient': {
					teal: '#14b8a6',
					cyan: '#22d3ee',
					blue: '#3b82f6',
					indigo: '#6366f1',
				},
				// Accent Colors - Soft & Modern
				'accent': {
					emerald: '#10b981',
					sky: '#0ea5e9',
					violet: '#8b5cf6',
					pink: '#ec4899',
					// Legacy support
					cyan: '#22d3ee',
					rose: '#ec4899',
				},
				// Glass Colors
				'glass': {
					1: 'rgba(20, 184, 166, 0.05)',
					2: 'rgba(34, 211, 238, 0.08)',
					3: 'rgba(59, 130, 246, 0.12)',
					white: 'rgba(255, 255, 255, 0.06)',
				},
				// Text Colors - Improved Contrast
				'text': {
					primary: '#f8fafc',
					secondary: '#cbd5e1',
					tertiary: '#94a3b8',
					muted: '#64748b',
				},
				// Status Colors - Softer Tones
				'status': {
					success: '#22c55e',
					danger: '#ef4444',
					warning: '#f59e0b',
					info: '#22d3ee',
				},
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
			},
			backgroundImage: {
				'gradient-main': 'linear-gradient(135deg, #14b8a6 0%, #22d3ee 25%, #3b82f6 75%, #6366f1 100%)',
				'gradient-panel': 'linear-gradient(135deg, #111827 0%, #1f2937 100%)',
				'gradient-card': 'linear-gradient(135deg, rgba(20, 184, 166, 0.08) 0%, rgba(59, 130, 246, 0.08) 100%)',
				'gradient-button': 'linear-gradient(135deg, #14b8a6 0%, #22d3ee 50%, #3b82f6 100%)',
				'gradient-glow': 'linear-gradient(135deg, rgba(20, 184, 166, 0.15) 0%, rgba(59, 130, 246, 0.15) 100%)',
				// Legacy support
				'gradient-cta': 'linear-gradient(135deg, #14b8a6 0%, #22d3ee 50%, #3b82f6 100%)',
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'fade-in': {
					'0%': {
						opacity: '0',
						transform: 'translateY(10px)'
					},
					'100%': {
						opacity: '1',
						transform: 'translateY(0)'
					}
				},
				'slide-up': {
					'0%': {
						opacity: '0',
						transform: 'translateY(20px)'
					},
					'100%': {
						opacity: '1',
						transform: 'translateY(0)'
					}
				},
				'float': {
					'0%, 100%': {
						transform: 'translateY(0px)'
					},
					'50%': {
						transform: 'translateY(-10px)'
					}
				},
				'mint-flip': {
					'0%': {
						transform: 'perspective(1000px) rotateY(0deg)',
					},
					'50%': {
						transform: 'perspective(1000px) rotateY(90deg)',
					},
					'100%': {
						transform: 'perspective(1000px) rotateY(0deg)',
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.28s ease-out',
				'slide-up': 'slide-up 0.28s ease-out',
				'float': 'float 6s ease-in-out infinite',
				'mint-flip': 'mint-flip 1.5s ease-in-out',
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
