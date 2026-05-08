import { FilePy } from '../../components/Icons'

/* ── Python Language Module ── */

export const PYTHON_CONFIG = {
  id: 'python',
  name: 'Python',
  icon: FilePy,
  extensions: ['.py'],
  defaultStarter: `# Python Aufgabe
# Dein Code hier

def main():
    print("Hallo Python!")

if __name__ == "__main__":
    main()
`,
}

export function validatePython(code) {
  // Basic syntax check for Python
  const lines = code.split('\n')
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (line.includes('def ') || line.includes('class ')) {
      if (!line.trim().endsWith(':')) {
        return { valid: false, error: `Zeile ${i + 1}: Funktions-/Klassendefinition fehlt ':'` }
      }
    }
  }
  return { valid: true }
}
