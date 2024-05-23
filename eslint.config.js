import config from '@koshikishi/eslint-config';
import globals from 'globals';

export default [
  ...config,
  {
    languageOptions: {
      globals: globals.browser,
    },
  },
];
