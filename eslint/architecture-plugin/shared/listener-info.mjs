/** Native listener registration calls that hand back a cleanup function. */
const LISTENER_CALL_PATTERN = /^(?:subscribeTo[A-Z]|register[A-Z]|startDeepLinkListener$)/u;

export function isListenerRegistrationCall(node) {
  return (
    node.type === 'CallExpression' &&
    node.callee.type === 'Identifier' &&
    LISTENER_CALL_PATTERN.test(node.callee.name)
  );
}
