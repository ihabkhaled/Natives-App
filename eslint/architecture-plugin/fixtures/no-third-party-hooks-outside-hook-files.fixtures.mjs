export default {
  valid: [
    {
      filename: 'src/packages/i18n/hooks/use-app-translation.hook.ts',
      code: 'import { useTranslation } from "react-i18next"; export function useAppTranslation(){ return useTranslation(); }',
    },
    {
      filename: 'src/modules/demo/containers/demo.container.tsx',
      code: 'import { useAppTranslation } from "@/packages/i18n"; export function DemoContainer(){ const t = useAppTranslation(); return <div>{t.locale}</div>; }',
    },
  ],
  invalid: [
    {
      filename: 'src/modules/demo/containers/demo.container.tsx',
      code: 'import { useTranslation } from "react-i18next"; export function DemoContainer(){ const { t } = useTranslation(); return <div>{t("x")}</div>; }',
      errors: [{ messageId: 'vendorHookOutsideHookFile' }],
    },
  ],
};
