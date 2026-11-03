const expoConfig = require('eslint-config-expo/flat');
const boundaries = require('eslint-plugin-boundaries');

const zones = [
  { type: 'core', pattern: 'src/core/**', mode: 'folder' },
  { type: 'data', pattern: 'src/data/**', mode: 'folder' },
  { type: 'ui', pattern: 'src/ui/**', mode: 'folder' },
  { type: 'features', pattern: 'src/features/**', mode: 'folder' },
  { type: 'app', pattern: 'src/app/**', mode: 'folder' },
  { type: 'composition', pattern: 'src/composition/**', mode: 'folder' },
  { type: 'bootstrap', pattern: 'src/bootstrap.ts', mode: 'file' },
];

/** @type {import('eslint').Linter.Config[]} */
module.exports = [
  ...expoConfig,
  {
    ignores: [
      '.scaffold-tmp/**',
      'node_modules/**',
      'dist/**',
      '.expo/**',
      '.agents/**',
      'docs/**',
      '**/*.mjs',
      '**/._*',
    ],
  },
  {
    plugins: { boundaries },
    settings: {
      'boundaries/include': ['src/**'],
      'boundaries/elements': zones,
    },
    rules: {
      'boundaries/element-types': [
        'error',
        {
          default: 'disallow',
          rules: [
            { from: 'core', allow: ['core'] },
            { from: 'ui', allow: ['core', 'ui'] },
            { from: 'data', allow: ['core', 'data'] },
            { from: 'features', allow: ['core', 'ui', 'data', 'features', 'composition'] },
            { from: 'app', allow: ['core', 'ui', 'data', 'features', 'app', 'composition'] },
            { from: 'composition', allow: ['core', 'data', 'composition'] },
            {
              from: 'bootstrap',
              allow: ['core', 'ui', 'data', 'features', 'app', 'bootstrap', 'composition'],
            },
          ],
        },
      ],
    },
  },
];
