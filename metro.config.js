const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// macOS resource forks on external volumes (._file, .__file.tsx) break Metro.
config.resolver.blockList = [
  ...(Array.isArray(config.resolver.blockList) ? config.resolver.blockList : []),
  /\._[^/]+$/,
  /\.__[^/]+$/,
];

module.exports = config;
