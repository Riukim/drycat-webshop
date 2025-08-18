module.exports = {
    purge: [],
    darkMode: false, // or 'media' or 'class'
    theme: {
        extend: {
            keyframes: {
                scroll: {
                    "0%": { transform: "translateX(0)" },
                    "100%": { transform: "translateX(-50%)" },
                },
            },
            animation: {
                scroll: "scroll 30s linear infinite",
            }
        },
    },
    variants: {
        extend: {},
    },
    plugins: [],
}