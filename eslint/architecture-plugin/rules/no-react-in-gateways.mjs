import { createReactFreeRule } from '../shared/react-free-rule.factory.mjs';

export default createReactFreeRule({
  description: 'Gateway and repository files stay React-free.',
  kinds: ['gateway', 'repository'],
});
