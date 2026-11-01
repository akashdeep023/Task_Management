// Reglas prácticas para que el chequeo local también pueda correr en CI.
module.exports = {
  env: {
    node: true,
    es2021: true,
  },
  extends: ["eslint:recommended"],
  parserOptions: {
    ecmaVersion: 2022,
  },
  rules: {
    "no-unused-vars": [
      "error",
      {
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_",
        ignoreRestSiblings: true,
      },
    ],
  },
  overrides: [
    {
      files: ["tests/**/*.js", "tests/**/*.cjs"],
      env: {
        jest: true,
      },
    },
  ],
};
