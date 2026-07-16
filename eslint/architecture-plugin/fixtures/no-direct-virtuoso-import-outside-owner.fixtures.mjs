export default {
  valid: [
    {
      filename:
        'src/packages/virtual-list/components/app-virtual-list/app-virtual-list.component.tsx',
      code: 'import { Virtuoso } from "react-virtuoso"; export function AppVirtualList(props){ return <Virtuoso data={props.items} />; }',
    },
  ],
  invalid: [
    {
      filename: 'src/modules/demo/components/demo-list/demo-list.component.tsx',
      code: 'import { Virtuoso } from "react-virtuoso"; export function DemoList(props){ return <Virtuoso data={props.items} />; }',
      errors: [{ messageId: 'outsideOwner' }],
    },
  ],
};
