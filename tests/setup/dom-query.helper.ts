/**
 * Element-shape assertions for rendered rich text. `<strong>`, `<em>`,
 * `<code>`, `<pre>` and `<blockquote>` carry no role Testing Library can
 * query, yet "did this render as an element or as literal asterisks?" is
 * exactly the question a Markdown renderer must answer. This isolates the one
 * legitimate direct DOM read behind a plain (non-test, non-testing-library)
 * file, the same way `head-meta.helper.ts` does for `<meta>` tags, so
 * `testing-library/no-node-access` does not apply to it.
 */
export function countElements(root: ParentNode, selector: string): number {
  return root.querySelectorAll(selector).length;
}

export function textOfElements(root: ParentNode, selector: string): readonly string[] {
  return [...root.querySelectorAll(selector)].map((node) => node.textContent);
}
