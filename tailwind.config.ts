import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                obsidian: "#0B0B0B",
                chalk: "#FFFFFF",
                slate: "#F8F9FA",
                "slate-mid": "#E9ECEF",
                muted: "#6B7280",
                "muted-light": "#9CA3AF",
                accent: "#C9A96E", // warm gold accent
                "accent-light": "#E8D5B0",
                "status-new": "#0B0B0B",
                "status-process": "#D97706",
                "status-shipped": "#2563EB",
                "status-delivered": "#16A34A",
                "status-returned": "#DC2626",
            },
            fontFamily: {
                serif: ["Playfair Display", "Georgia", "serif"],
                sans: ["Inter", "system-ui", "sans-serif"],
            },
            boxShadow: {
                luxury: "0 4px 32px rgba(11, 11, 11, 0.08), 0 1px 4px rgba(11, 11, 11, 0.04)",
                "luxury-md": "0 8px 48px rgba(11, 11, 11, 0.12), 0 2px 8px rgba(11, 11, 11, 0.06)",
                "luxury-lg": "0 20px 80px rgba(11, 11, 11, 0.16), 0 4px 16px rgba(11, 11, 11, 0.08)",
                "inset-luxury": "inset 0 1px 0 rgba(255,255,255,0.6)",
            },
            borderWidth: {
                "0.5": "0.5px",
            },
            animation: {
                "fade-in": "fadeIn 0.3s ease-out",
                "slide-up": "slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
                "slide-in-right": "slideInRight 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
                "pulse-dot": "pulseDot 2s ease-in-out infinite",
            },
            keyframes: {
                fadeIn: {
                    from: { opacity: "0" },
                    to: { opacity: "1" },
                },
                slideUp: {
                    from: { opacity: "0", transform: "translateY(16px)" },
                    to: { opacity: "1", transform: "translateY(0)" },
                },
                slideInRight: {
                    from: { opacity: "0", transform: "translateX(24px)" },
                    to: { opacity: "1", transform: "translateX(0)" },
                },
                pulseDot: {
                    "0%, 100%": { opacity: "1", transform: "scale(1)" },
                    "50%": { opacity: "0.5", transform: "scale(0.85)" },
                },
            },
        },
    },
    plugins: [],
};
export default config;
