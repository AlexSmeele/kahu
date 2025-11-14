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
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))',
					hover: 'hsl(var(--primary-hover))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))',
					hover: 'hsl(var(--secondary-hover))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))',
					hover: 'hsl(var(--accent-hover))'
				},
				success: {
					DEFAULT: 'hsl(var(--success))',
					foreground: 'hsl(var(--success-foreground))'
				},
				warning: {
					DEFAULT: 'hsl(var(--warning))',
					foreground: 'hsl(var(--warning-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				// Extended color scales from design system
				emerald: {
					50: 'hsl(154 91% 96%)',
					100: 'hsl(152 81% 91%)',
					200: 'hsl(149 80% 81%)',
					300: 'hsl(152 76% 72%)',
					400: 'hsl(156 72% 60%)',
					500: 'hsl(160 84% 39%)',
					600: 'hsl(161 94% 30%)',
					700: 'hsl(163 94% 24%)',
					800: 'hsl(163 88% 20%)',
					900: 'hsl(164 86% 16%)',
				},
				amber: {
					50: 'hsl(48 100% 96%)',
					100: 'hsl(48 96% 89%)',
					200: 'hsl(48 97% 77%)',
					300: 'hsl(46 97% 65%)',
					400: 'hsl(43 96% 56%)',
					500: 'hsl(38 92% 50%)',
					600: 'hsl(32 95% 44%)',
					700: 'hsl(26 90% 37%)',
					800: 'hsl(23 83% 31%)',
					900: 'hsl(22 78% 26%)',
				},
				orange: {
					50: 'hsl(33 100% 96%)',
					100: 'hsl(34 100% 92%)',
					200: 'hsl(32 98% 83%)',
					300: 'hsl(31 97% 72%)',
					400: 'hsl(27 96% 61%)',
					500: 'hsl(25 95% 53%)',
					600: 'hsl(21 90% 48%)',
					700: 'hsl(17 88% 40%)',
					800: 'hsl(15 79% 34%)',
					900: 'hsl(15 75% 28%)',
				},
				purple: {
					50: 'hsl(270 100% 98%)',
					100: 'hsl(269 100% 95%)',
					200: 'hsl(269 100% 92%)',
					300: 'hsl(269 97% 85%)',
					400: 'hsl(270 95% 75%)',
					500: 'hsl(271 81% 56%)',
					600: 'hsl(271 91% 65%)',
					700: 'hsl(272 72% 47%)',
					800: 'hsl(273 67% 39%)',
					900: 'hsl(274 66% 32%)',
				},
				pink: {
					50: 'hsl(327 73% 97%)',
					100: 'hsl(326 78% 95%)',
					200: 'hsl(326 85% 90%)',
					300: 'hsl(327 87% 82%)',
					400: 'hsl(329 86% 70%)',
					500: 'hsl(330 81% 60%)',
					600: 'hsl(333 71% 51%)',
					700: 'hsl(335 78% 42%)',
					800: 'hsl(336 74% 35%)',
					900: 'hsl(336 69% 30%)',
				},
				blue: {
					50: 'hsl(214 100% 97%)',
					100: 'hsl(214 95% 93%)',
					200: 'hsl(213 97% 87%)',
					300: 'hsl(212 96% 78%)',
					400: 'hsl(213 94% 68%)',
					500: 'hsl(217 91% 60%)',
					600: 'hsl(221 83% 53%)',
					700: 'hsl(224 76% 48%)',
					800: 'hsl(226 71% 40%)',
					900: 'hsl(224 64% 33%)',
				},
				gray: {
					50: 'hsl(210 40% 98%)',
					100: 'hsl(210 40% 96%)',
					200: 'hsl(214 32% 91%)',
					300: 'hsl(213 27% 84%)',
					400: 'hsl(215 20% 65%)',
					500: 'hsl(220 9% 46%)',
					600: 'hsl(215 14% 34%)',
					700: 'hsl(217 19% 27%)',
					800: 'hsl(215 28% 17%)',
					900: 'hsl(220 9% 10%)',
				},
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
				'fadeIn': {
					from: {
						opacity: '0'
					},
					to: {
						opacity: '1'
					}
				},
				'scaleIn': {
					from: {
						opacity: '0',
						transform: 'scale(0.95)'
					},
					to: {
						opacity: '1',
						transform: 'scale(1)'
					}
				},
				'slideUp': {
					from: {
						opacity: '0',
						transform: 'translateY(10px)'
					},
					to: {
						opacity: '1',
						transform: 'translateY(0)'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fadeIn 0.3s ease-in-out',
				'scale-in': 'scaleIn 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
				'slide-up': 'slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
			},
			height: {
				'13': '3.25rem', // 52px for button lg
				'15': '3.75rem', // 60px for button xl
			}
		}
	},
	plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
} satisfies Config;
