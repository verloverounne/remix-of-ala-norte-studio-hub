import type { Config } from "tailwindcss";

export default {
    darkMode: ["class"],
    content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
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
  			sans: [
  				'Roboto',
  				'ui-sans-serif',
  				'system-ui',
  				'sans-serif',
  				'Apple Color Emoji',
  				'Segoe UI Emoji',
  				'Segoe UI Symbol',
  				'Noto Color Emoji'
  			],
  			heading: [
  				'Poppins',
  				'ui-sans-serif',
  				'system-ui',
  				'sans-serif'
  			],
  			mono: [
  				'Roboto Mono',
  				'ui-monospace',
  				'SFMono-Regular',
  				'Menlo',
  				'Monaco',
  				'Consolas',
  				'Liberation Mono',
  				'Courier New',
  				'monospace'
  			],
  			serif: [
  				'Lora',
  				'ui-serif',
  				'Georgia',
  				'Cambria',
  				'Times New Roman',
  				'Times',
  				'serif'
  			]
  		},
  		colors: {
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))',
  				hover: 'hsl(var(--primary-hover))',
  				light: 'hsl(var(--primary-light))',
  				lighter: 'hsl(var(--primary-lighter))',
  				dark: 'hsl(var(--primary-dark))'
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
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			gray: {
  				dark: 'hsl(var(--gray-dark))',
  				medium: 'hsl(var(--gray-medium))',
  				light: 'hsl(var(--gray-light))',
  				lighter: 'hsl(var(--gray-lighter))'
  			}
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'var(--radius)',
  			sm: 'var(--radius)',
  			none: '0'
  		},
  		borderWidth: {
  			'2': '1px',
  			'3': '1px',
  			'4': '1px',
  			'8': '1px'
  		},
  		boxShadow: {
  			brutal: 'var(--shadow-brutal)',
  			'brutal-sm': 'var(--shadow-brutal-sm)',
  			'brutal-lg': 'var(--shadow-brutal-lg)',
  			'brutal-red': 'var(--shadow-brutal-red)',
  			'2xs': 'var(--shadow-2xs)',
  			xs: 'var(--shadow-xs)',
  			sm: 'var(--shadow-sm)',
  			md: 'var(--shadow-md)',
  			lg: 'var(--shadow-lg)',
  			xl: 'var(--shadow-xl)',
  			'2xl': 'var(--shadow-2xl)'
  		},
  		keyframes: {
  			'accordion-down': {
  				from: {
  					height: '0',
  					opacity: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)',
  					opacity: '1'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)',
  					opacity: '1'
  				},
  				to: {
  					height: '0',
  					opacity: '0'
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
  			'fade-in-up': {
  				'0%': {
  					opacity: '0',
  					transform: 'translateY(20px)'
  				},
  				'100%': {
  					opacity: '1',
  					transform: 'translateY(0)'
  				}
  			},
  			'slide-in': {
  				'0%': {
  					transform: 'translateX(-100%)'
  				},
  				'100%': {
  					transform: 'translateX(0)'
  				}
  			},
  			'pulse-slow': {
  				'0%, 100%': {
  					opacity: '1'
  				},
  				'50%': {
  					opacity: '0.8'
  				}
  			},
  			shimmer: {
  				'100%': {
  					transform: 'translateX(100%)'
  				}
  			},
  			'bounce-x': {
  				'0%, 100%': {
  					transform: 'translateX(0)'
  				},
  				'50%': {
  					transform: 'translateX(25%)'
  				}
  			},
  			'cinema-focus': {
  				'0%': {
  					filter: 'blur(8px)',
  					opacity: '0',
  					transform: 'translateY(20px)'
  				},
  				'60%': {
  					filter: 'blur(2px)',
  					opacity: '0.8'
  				},
  				'100%': {
  					filter: 'blur(0)',
  					opacity: '1',
  					transform: 'translateY(0)'
  				}
  			},
  			'digital-glitch': {
  				'0%': {
  					transform: 'translateY(20px) skewX(0deg)',
  					opacity: '0'
  				},
  				'30%': {
  					transform: 'translateY(10px) skewX(-1deg)',
  					opacity: '0.7'
  				},
  				'60%': {
  					transform: 'translateY(5px) skewX(0.5deg)',
  					opacity: '0.9'
  				},
  				'100%': {
  					transform: 'translateY(0) skewX(0deg)',
  					opacity: '1'
  				}
  			},
  			'battery-load': {
  				'0%': {
  					opacity: '0',
  					transform: 'translateY(30px) scale(0.95)'
  				},
  				'50%': {
  					opacity: '0.7',
  					transform: 'translateY(10px) scale(0.98)'
  				},
  				'100%': {
  					opacity: '1',
  					transform: 'translateY(0) scale(1)'
  				}
  			},
  			'reveal-scan': {
  				'0%': {
  					opacity: '0',
  					transform: 'translateY(30px)',
  					clipPath: 'polygon(0 100%, 100% 100%, 100% 100%, 0 100%)'
  				},
  				'100%': {
  					opacity: '1',
  					transform: 'translateY(0)',
  					clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)'
  				}
  			},
  			'aperture-open': {
  				'0%': {
  					opacity: '0',
  					transform: 'scale(0.8)',
  					clipPath: 'circle(0% at 50% 50%)'
  				},
  				'100%': {
  					opacity: '1',
  					transform: 'scale(1)',
  					clipPath: 'circle(150% at 50% 50%)'
  				}
  			},
  			'interactive-pulse': {
  				'0%': {
  					boxShadow: '0 0 0 0 hsl(var(--primary) / 0.4)'
  				},
  				'50%': {
  					boxShadow: '0 0 0 8px hsl(var(--primary) / 0.1)'
  				},
  				'100%': {
  					boxShadow: '0 0 0 0 hsl(var(--primary) / 0)'
  				}
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.3s ease-out',
  			'accordion-up': 'accordion-up 0.3s ease-out',
  			'fade-in': 'fade-in 0.5s ease-out',
  			'fade-in-up': 'fade-in-up 0.6s ease-out',
  			'slide-in': 'slide-in 0.4s ease-out',
  			'pulse-slow': 'pulse-slow 3s ease-in-out infinite',
  			shimmer: 'shimmer 1.5s infinite',
  			'bounce-x': 'bounce-x 1s ease-in-out infinite',
  			'cinema-focus': 'cinema-focus 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards',
  			'digital-glitch': 'digital-glitch 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards',
  			'battery-load': 'battery-load 0.7s cubic-bezier(0.4, 0, 0.2, 1) forwards',
  			'reveal-scan': 'reveal-scan 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards',
  			'aperture-open': 'aperture-open 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards',
  			'interactive-pulse': 'interactive-pulse 1.5s ease-out'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
