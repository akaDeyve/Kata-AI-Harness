/* ═══════════════════════════════════════════
   @harness/plugin-python
   Language module for Python
   ═══════════════════════════════════════════ */

export const harness = {
  name: '@harness/plugin-python',
  id: 'plugin:python',
  type: 'language',
  contributes: { languages: ['python'] },
  activationEvents: ['onLanguage:python'],
}

export const PYTHON_CONFIG = {
  id: 'python',
  name: 'Python',
  icon: null,
  extensions: ['.py'],
  defaultStarter: `# Python Aufgabe
# Dein Code hier

def main():
    print("Hallo Python!")

if __name__ == "__main__":
    main()
`,
}

export function activate(context) {
  context.setConfig('language', PYTHON_CONFIG)
  return { config: PYTHON_CONFIG }
}
