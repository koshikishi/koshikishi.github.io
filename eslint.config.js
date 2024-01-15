import config from '@koshikishi/eslint-config';
import {Legacy} from '@eslint/eslintrc';

const {globals} = Legacy.environments.get('browser');

export default [
  ...config,
  {
    languageOptions: {
      globals,
    },
  },
];
