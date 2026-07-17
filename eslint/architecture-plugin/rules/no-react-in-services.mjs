import { createReactFreeRule } from '../shared/react-free-rule.factory.mjs';

export default createReactFreeRule({
  description: 'Service use-case files stay React-free.',
  kinds: ['service'],
});
