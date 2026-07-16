export default {
  valid: [
    {
      filename: 'src/packages/ionic/index.ts',
      code: 'export { IonButton } from "@ionic/react";',
    },
    {
      filename: 'src/packages/router/index.ts',
      code: 'export { IonReactRouter } from "@ionic/react-router";',
    },
  ],
  invalid: [
    {
      filename: 'src/modules/demo/components/demo-view/demo-view.component.tsx',
      code: 'import { IonButton } from "@ionic/react"; export function DemoView(){ return <IonButton />; }',
      errors: [{ messageId: 'outsideOwner' }],
    },
  ],
};
