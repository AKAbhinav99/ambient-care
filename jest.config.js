/**
 * Lightweight Jest config for the pure logic modules (interactions, adherence,
 * refill, intents). These import only types, so a plain node environment with the
 * Expo babel transform is enough — no React Native runtime needed.
 */
module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/src/**/*.test.ts'],
  transform: {
    '^.+\\.[jt]sx?$': ['babel-jest', { presets: ['babel-preset-expo'] }],
  },
};
