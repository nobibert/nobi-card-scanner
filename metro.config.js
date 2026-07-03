// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// RN 0.81 core ships JS with ES2022 class private-field syntax
// (Libraries/vendor/emitter/EventEmitter.js and src/private/webapis/*).
// babel-preset-expo relies on hermes-parser to correctly handle & transform
// this syntax. If hermesParser is disabled (or missing), the private-field
// tokens survive into the final bundle and Hermes' compiler chokes with
// "private properties are not supported".
config.transformer = {
  ...(config.transformer || {}),
  hermesParser: true,
};

module.exports = config;
