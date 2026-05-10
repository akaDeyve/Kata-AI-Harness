/* ═══════════════════════════════════════════
   @harness/plugin-javascript
   Language module for JavaScript/React
   ═══════════════════════════════════════════ */

export const JAVASCRIPT_CONFIG = {
  id: 'javascript',
  name: 'JavaScript',
  icon: null, // Icon will be provided by host
  extensions: ['.js', '.jsx'],
  defaultStarter: `// JavaScript Aufgabe
// Dein Code hier

function main() {
  console.log('Hallo JavaScript!');
}

main();
`,
}

export function validateJavaScript(code) {
  try {
    new Function(code)
    return { valid: true }
  } catch (e) {
    return { valid: false, error: e.message }
  }
}

export function activate(context) {
  context.setConfig('language', JAVASCRIPT_CONFIG)
  return { config: JAVASCRIPT_CONFIG, validate: validateJavaScript }
}
