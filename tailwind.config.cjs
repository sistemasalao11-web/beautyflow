/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                display: ['Cinzel', 'serif'],
            },
            colors: {
                amber: {
                    500: '#f59e0b',
                    600: '#d97706',
                }
            }
        },
    },
    plugins: [],
}
