/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    // Use 'class' strategy exclusively - no media queries
    // This ensures theme switching works purely via DOM class manipulation
    darkMode: 'class',
    theme: {
        extend: {},
    },
    plugins: [],
    // Important: Ensure media queries don't override class-based dark mode
    corePlugins: {
        // Disable Tailwind's media query-based dark mode support
        // This forces exclusive use of class-based dark mode
    },
}
