export default {
  valid: [
    {
      filename: 'src/packages/logger/logger.factory.ts',
      code: '/* eslint-disable no-console -- EXC-0001: the logger package is the single console owner. */\nexport function log(){ console.info("x"); }\n/* eslint-enable no-console -- EXC-0001 */',
    },
  ],
  invalid: [
    {
      filename: 'src/modules/demo/services/load-demo.service.ts',
      code: '// eslint-disable-next-line no-console\nexport function loadDemo(){ return 1; }',
      errors: [{ messageId: 'undocumentedDisable' }],
    },
  ],
};
