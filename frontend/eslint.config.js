// eslint.config.js
import js from '@eslint/js';
import tseslint from 'typescript-eslint'; // Si tu utilises TypeScript

export default [
  js.configs.recommended, // Applique la config recommandée pour JavaScript
  tseslint.configs.recommended, // Applique la config recommandée pour TypeScript
  {
    files: ['**/*.ts', '**/*.js'], // Appliquer les règles sur TS et JS
    rules: {
      'no-console': 'warn',
      eqeqeq: 'error',
    },
  },
];
