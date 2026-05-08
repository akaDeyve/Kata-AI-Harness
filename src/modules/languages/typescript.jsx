/* ── TypeScript Language Module ── */

export const TYPESCRIPT_CONFIG = {
  id: 'typescript',
  name: 'TypeScript',
  icon: '🔷',
  extensions: ['.ts', '.tsx'],
  defaultStarter: `// TypeScript Aufgabe
// Dein Code hier

function main(): void {
  console.log('Hallo TypeScript!');
}

main();
`,
}

export function validateTypeScript(code) {
  // Basic syntax validation
  const issues = []
  
  // Check for unclosed brackets
  const openBraces = (code.match(/{/g) || []).length
  const closeBraces = (code.match(/}/g) || []).length
  if (openBraces !== closeBraces) {
    issues.push('Nicht übereinstimmende geschweifte Klammern')
  }
  
  return {
    valid: issues.length === 0,
    errors: issues,
  }
}
