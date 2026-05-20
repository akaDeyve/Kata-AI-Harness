# Code Trainer AI (BETA)

[![Version](https://img.shields.io/badge/version-0.2.0-blue)](https://github.com/your-username/coding-trainer)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)](https://reactjs.org)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite)](https://vitejs.dev)
[![Tailwind](https://img.shields.io/badge/Tailwind-3-06B6D4?logo=tailwindcss)](https://tailwindcss.com)
[![CodeMirror](https://img.shields.io/badge/CodeMirror-6-D30707)](https://codemirror.net)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

An AI-powered coding practice environment. Write code, get real-time feedback from AI models, and work through interactive exercises — fully client-side and self-hostable.

---

## Features

- **AI feedback & correction** — submit code for evaluation and get improvement suggestions from any configured AI provider
- **AI task generation** — generate new exercises with starter code on demand
- **CodeMirror 6 editor** — syntax highlighting, autocomplete, search & replace, code folding
- **Live preview** — run React components in a sandboxed iframe in real time
- **Task library** — built-in exercises covering React Hooks, props, CSS, and array operations
- **Autosave** — editor state is saved automatically to localStorage
- **Plugin architecture** — languages, AI providers, themes, and features are all `@harness/*` npm packages
- **No backend** — runs entirely in the browser; API keys stay local

---

## Quick Start

```bash
git clone https://github.com/your-username/coding-trainer.git
cd coding-trainer
npm install
npm run dev
```

Open `http://localhost:5173`, then click **API** in the top-right corner to configure an AI provider.

```bash
# Production build
npm run build
npm run preview
```

---

## AI Providers

Gemini is the recommended default — get a free API key at [aistudio.google.com/apikey](https://aistudio.google.com/apikey).

| Provider | Requires API Key | Notes |
|---|:---:|---|
| **Gemini** ★ | ✅ | Recommended default |
| **OpenRouter** | ✅ | Access to many models |
| **Ollama** | ❌ | Local inference |
| **OpenCode** | ❌ | Local inference |

API keys are stored only in `localStorage` and are never sent anywhere except the provider's own API. Providers can be individually enabled or disabled in the settings menu (⚙️).

---

## Plugin Architecture

Everything beyond the core framework is a plugin — languages, AI providers, themes, and UI features. Plugins are standalone `@harness/*` npm packages discovered at startup via a `harness` manifest in their `package.json`.

### Package layout

```
packages/
├── core/                   # Plugin registry, context API, scanner
├── plugin-javascript/      # Language plugin
├── plugin-python/          # Language plugin
├── plugin-typescript/      # Language plugin
├── provider-gemini/        # AI provider (default)
├── provider-openrouter/    # AI provider
├── provider-ollama/        # AI provider (local)
├── provider-opencode/      # AI provider (local)
├── feature-preview/        # Live preview feature
├── feature-tasks/          # Task library feature
└── feature-generate/       # AI task generation feature
```

### Plugin manifest

Each plugin declares a `harness` field in its `package.json`:

```json
{
  "name": "@harness/plugin-python",
  "harness": {
    "id": "plugin:python",
    "type": "language",
    "contributes": {
      "languages": ["python"]
    },
    "activationEvents": ["onLanguage:python"]
  }
}
```

### Enabling and disabling plugins at runtime

```js
import { getEnabledPluginIds, togglePlugin, saveEnabledPluginIds } from './modules/plugin-bridge'

// Get currently enabled plugins (empty array = all enabled)
const enabled = getEnabledPluginIds()

// Toggle a single plugin
togglePlugin('plugin:python')

// Set an explicit list
saveEnabledPluginIds(['provider:gemini', 'plugin:javascript', 'feature:preview'])
```

### Plugin context API

Every plugin receives a `PluginContext` when activated:

| Method | Description |
|---|---|
| `getEditorState(key)` | Read a value from editor state |
| `setEditorState(key, value)` | Write a value to editor state |
| `onEvent(name, callback)` | Subscribe to an event |
| `emitEvent(name, payload)` | Emit an event |
| `getUI(slotName)` | Read a UI slot |
| `registerUI(slotName, component)` | Register a component into a UI slot |
| `registerCommand(name, handler)` | Register a command |
| `executeCommand(name, ...args)` | Execute a command |
| `getConfig(key, default)` | Read plugin config |
| `setConfig(key, value)` | Write plugin config |
| `storage` | Persistent plugin storage |

### Creating a plugin

1. Create `packages/plugin-myfeature/`
2. Add a `package.json` with a `harness` manifest:
   ```json
   {
     "name": "@harness/plugin-myfeature",
     "version": "1.0.0",
     "type": "module",
     "main": "src/index.js",
     "harness": {
       "id": "feature:myfeature",
       "type": "feature",
       "contributes": { "features": ["myfeature"] },
       "activationEvents": ["onStartupFinished"]
     }
   }
   ```
3. Implement `src/index.js` with an `activate(context)` export
4. Import and add it to `DISCOVERED_PLUGINS` in `src/modules/plugin-bridge.js`
5. Add a resolve alias in `vite.config.js`
6. Add `"@harness/plugin-myfeature": "file:packages/plugin-myfeature"` to the root `package.json`

To publish for others to use:

```bash
cd packages/plugin-myfeature
npm publish --access public
```

---

## Project Structure

```
src/
├── App.jsx                     # Root component and state management
├── index.css                   # Tailwind + theme CSS variables
├── main.jsx                    # Entry point
├── lib/
│   └── api.js                  # API helpers
├── components/
│   ├── ApiKeyModal.jsx          # AI provider configuration
│   ├── CodePreview.jsx          # Sandboxed live preview (Babel + iframe)
│   ├── ConfigSettingsModal.jsx  # Plugin enable/disable settings
│   ├── Editor.jsx               # CodeMirror 6 editor
│   ├── EditorToolbar.jsx        # Toolbar (preview, reset, copy)
│   ├── GenerateTaskModal.jsx    # AI task generation
│   ├── Icons.jsx                # SVG icon components
│   ├── RightPanel.jsx           # AI feedback panel
│   ├── Sidebar.jsx              # Task navigation
│   ├── StatusBar.jsx            # Status bar
│   ├── Toast.jsx                # Notifications
│   └── TopBar.jsx               # Top action bar
└── modules/
    ├── index.js                 # Re-exports for backward compatibility
    └── plugin-bridge.js         # Connects @harness/* packages to the app
```

---

## Security

- Code preview runs in a sandboxed `<iframe>` with no access to the parent DOM
- API keys are stored only in `localStorage` — never transmitted to third parties
- No backend — the app is entirely client-side
- Content Security Policy configured via Vite
- JSON parsing is protected against prototype pollution

---

## Dependencies

| Package | Role |
|---|---|
| React 18 | UI framework |
| Vite 5 | Build tool and dev server |
| Tailwind CSS 3 | Utility-first styling |
| CodeMirror 6 | Code editor |
| @phosphor-icons/react | Icons |
| @babel/standalone | JSX transpilation for live preview |
| react-syntax-highlighter | Syntax highlighting in feedback panel |

---

## Scripts

```bash
npm run dev          # Start development server
npm run build        # Production build
npm run preview      # Preview production build
npm run test         # Run tests (Vitest)
npm run lint         # Lint source files
npm run format       # Check formatting (Prettier)
npm run format:fix   # Auto-fix formatting
```

---

## Roadmap

| Area | Status |
|---|---|
| Multi-language support (Python via Pyodide, TypeScript, Java/Rust via WASM) | In progress |
| Plugin architecture | ✅ Done |
| Runtime plugin enable/disable | ✅ Done |
| AI providers (Gemini, OpenRouter, Ollama, OpenCode) | ✅ Done |
| Unified icon library (Lucide) | Planned |
| Unit tests (Vitest) + E2E (Playwright) + CI/CD | Planned |
| Plugin marketplace / community discoverability | Planned |
| Documentation site + Vercel demo | In progress |

---

## Contributing

Pull requests are welcome. For significant changes, open an issue first to discuss what you'd like to change.

1. Fork the repo
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m 'Add my feature'`
4. Push: `git push origin feature/my-feature`
5. Open a pull request

---

## License

MIT — see [LICENSE](LICENSE).
