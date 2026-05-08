/* ── JavaScript Language Module ── */

export const JAVASCRIPT_CONFIG = {
  id: 'javascript',
  name: 'JavaScript',
  icon: '📜',
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
