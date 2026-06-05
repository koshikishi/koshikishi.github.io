import {defineConfig} from 'eslint/config';
import config from '@koshikishi/eslint-config';

export default defineConfig([
  {
    extends: [config],
  },
]);
