import { createReactFreeRule } from '../shared/react-free-rule.factory.mjs';

export default createReactFreeRule({
  description: 'Pure layers (helpers, mappers, schemas, constants, keys, paths…) stay React-free.',
  kinds: [
    'helper',
    'utils',
    'mapper',
    'schema',
    'constants',
    'enums',
    'keys',
    'paths',
    'migrations',
    'selectors',
    'parser',
  ],
});
