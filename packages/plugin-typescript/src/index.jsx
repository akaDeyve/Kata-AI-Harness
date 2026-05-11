/* ═══════════════════════════════════════════
   @harness/plugin-typescript
   Language module for TypeScript
   ═══════════════════════════════════════════ */

export const harness = {
  name: '@harness/plugin-typescript',
  id: 'plugin:typescript',
  type: 'language',
  contributes: { languages: ['typescript'] },
  activationEvents: ['onLanguage:typescript'],
}

export const TYPESCRIPT_CONFIG = {
  id: 'typescript',
  name: 'TypeScript',
  icon: null,
  extensions: ['.ts', '.tsx'],
  defaultStarter: `// TypeScript Aufgabe
// Dein Code hier

function main(): void {
  console.log('Hallo TypeScript!');
}

main();
`,
}

export function activate(context) {
  context.setConfig('language', TYPESCRIPT_CONFIG)
  return { config: TYPESCRIPT_CONFIG }
}
