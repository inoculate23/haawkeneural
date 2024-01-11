module.exports = {

  content: [
    './your-files/**/*.{html,js}',
  ],

  plugins: [require('daisyui')],

  // config docs: https://daisyui.com/docs/config/
  daisyui: {
    themes: ["light", "dark", "dracula", "night", "dim", "cupcake","pastel", "wireframe", "nord", "retro" , "synthwave", "cyberpunk", "lofi", "business", "aqua", "forest"],
  },
  darkTheme: "dark",
  base: true, // applies background color and foreground color for root element by default
  styled: true, // include daisyUI colors and design decisions for all components
  utils: true, // adds responsive and modifier utility classes
  prefix: "", // prefix for daisyUI classnames (components, modifiers and responsive class names. Not colors)
  logs: true, // Shows info about daisyUI version and used config in the console when building your CSS
  themeRoot: ":root"
}