import { FOUNDATIONAL_VENDORS, findOwnershipEntry } from '../../package-ownership.config.mjs';
import { getLayerInfo, isInsideAnyDir } from './file-info.mjs';
import { classifyImport, isTypeOnlyImport } from './import-info.mjs';
import { createRuleMeta, isApplicationSource, isTestFile } from './rule-helpers.mjs';

/**
 * Factory for the vendor-ownership rule family. Each produced rule flags
 * value imports of matching vendors outside their registered owner
 * directories. Type-only imports stay legal inside packages/ and platform/.
 */
export function createVendorOwnershipRule({ description, vendorFilter, unregisteredMessage }) {
  const messages = {
    outsideOwner:
      'Vendor "{{vendor}}" may only be imported by its owner ({{owner}}). Import the facade instead.',
    unregisteredVendor:
      unregisteredMessage ??
      'Vendor "{{vendor}}" has no registered owner in eslint/package-ownership.config.mjs. Register an owner before using it.',
  };
  return {
    meta: createRuleMeta({ description, messages }),
    create(context) {
      const filename = context.filename;
      if (!isApplicationSource(filename) || isTestFile(filename)) {
        return {};
      }
      return {
        ImportDeclaration(node) {
          const source = String(node.source.value);
          const classified = classifyImport(filename, source);
          if (classified.kind !== 'vendor') {
            return;
          }
          const vendor = classified.packageName;
          if (FOUNDATIONAL_VENDORS.includes(vendor) || !vendorFilter(vendor)) {
            return;
          }
          const entry = findOwnershipEntry(vendor);
          if (entry === null) {
            context.report({ node, messageId: 'unregisteredVendor', data: { vendor } });
            return;
          }
          if (isInsideAnyDir(filename, entry.ownerDirs)) {
            return;
          }
          if (isTypeOnlyImport(node)) {
            const layer = getLayerInfo(filename).layer;
            if (layer === 'packages' || layer === 'platform') {
              return;
            }
          }
          context.report({
            node,
            messageId: 'outsideOwner',
            data: { vendor, owner: entry.owner },
          });
        },
      };
    },
  };
}
