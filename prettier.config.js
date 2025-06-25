/** @type {import("prettier").Config} */
const functions = ["cn", "clsx", "cva"];
const config = {
  tailwindFunctions: functions,
  customFunctions: functions,
  endingPosition: "absolute-with-indent",
  plugins: [
    // https://www.nikolailehbr.ink/blog/tailwind-css-tips#Automatic-wrapping-of-long-class-names
    "prettier-plugin-tailwindcss",
    "prettier-plugin-classnames",
    "prettier-plugin-merge",
  ],
  tailwindStylesheet: "./app/app.css",
  semi: true,
  tabWidth: 2,
  singleQuote: false,
};

export default config;
