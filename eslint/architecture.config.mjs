import { ALL_ARCHITECTURE_RULE_NAMES, architecturePlugin } from './architecture-plugin/index.mjs';

const allRulesAsError = Object.fromEntries(
  ALL_ARCHITECTURE_RULE_NAMES.map((name) => [`architecture/${name}`, 'error']),
);

/** Flat-config block enabling every architecture rule for application source. */
export const architectureConfig = {
  name: 'capacitor-ranger/architecture',
  files: ['src/**/*.{ts,tsx}'],
  plugins: {
    architecture: architecturePlugin,
  },
  rules: allRulesAsError,
};
