# Plugin-Entwicklungsguide für Code Trainer

> **Code Trainer** (ehemals Harness) verwendet ein modulares Plugin-System, das auf `@harness/core` basiert. Plugins sind eigenständige npm-Packages, die neue Sprachen, AI-Provider oder Features zur App hinzufügen.

---

## 📋 Inhaltsverzeichnis

1. [Architektur-Überblick](#1-architektur-überblick)
2. [Plugin-Typen](#2-plugin-typen)
3. [Schnellstart: Ein neues Plugin erstellen](#3-schnellstart-ein-neues-plugin-erstellen)
4. [Sprach-Plugin (Language)](#4-sprach-plugin-language)
5. [AI-Provider-Plugin](#5-ai-provider-plugin)
6. [Feature-Plugin](#6-feature-plugin)
7. [Theme-Plugin (Zukunft)](#7-theme-plugin-zukunft)
8. [Plugin-Manifest (package.json)](#8-plugin-manifest-packagejson)
9. [Plugin im System registrieren](#9-plugin-im-system-registrieren)
10. [PluginContext-API](#10-plugincontext-api)
11. [Fortgeschrittene Konzepte](#11-fortgeschrittene-konzepte)
12. [FAQ & Troubleshooting](#12-faq--troubleshooting)

---

## 1. Architektur-Überblick

```
┌──────────────────────────────────────────────────┐
│               Host-App (src/)                     │
│  ┌─────────────────────────────────────────┐     │
│  │      Plugin Bridge (modules/)           │     │
│  │  plugin-bridge.js + index.js            │     │
│  └──────────────────┬──────────────────────┘     │
├─────────────────────┼────────────────────────────┤
│  ┌──────────────────┴──────────────────────┐     │
│  │         @harness/core (Framework)        │     │
│  │  PluginRegistry · PluginContext · Types  │     │
│  └──────────────────┬──────────────────────┘     │
├─────────────────────┼────────────────────────────┤
│  ┌──────────────────┴──────────────────────┐     │
│  │      @harness/plugin-*  (Packages)       │     │
│  │  plugin-javascript · provider-gemini    │     │
│  │  feature-preview  · ...                 │     │
│  └─────────────────────────────────────────┘     │
└──────────────────────────────────────────────────┘
```

**Drei Schichten:**
- **@harness/core** – Das Framework: Registry, Context, Lebenszyklus
- **Plugin Bridge** – Verbindet Plugins mit der Host-App
- **Plugin Packages** – Die eigentlichen Plugins (`@harness/plugin-*`, `@harness/provider-*`, `@harness/feature-*`)

---

## 2. Plugin-Typen

| Typ | ID-Präfix | Beschreibung | Beispiele |
|---|---|---|---|
| `language` | `plugin:` | Programmiersprache für den Editor | JavaScript, Python, TypeScript |
| `aiProvider` | `provider:` | AI-API-Anbieter | Gemini, OpenRouter, Ollama, OpenCode |
| `feature` | `feature:` | App-Funktion/Feature | Preview, Tasks, Generate |
| `theme` | `theme:` | Farbschema/Theme | (zukunft) |
| `panel` | `panel:` | UI-Panel-Komponente | (zukunft) |

---

## 3. Schnellstart: Ein neues Plugin erstellen

### 3.1 Package anlegen

```
packages/
  mein-plugin/
    package.json
    src/
      index.js
```

### 3.2 package.json mit Manifest

```jsonc
{
  "name": "@harness/mein-plugin",
  "version": "1.0.0",
  "type": "module",
  "main": "src/index.js",
  "exports": {
    ".": "./src/index.js"
  },
  "harness": {
    "id": "plugin:mein-plugin",
    "type": "language",          // language | aiProvider | feature | theme | panel
    "contributes": {
      "languages": ["meinsprache"]
    },
    "activationEvents": ["onLanguage:meinsprache"]
  }
}
```

### 3.3 Plugin-Code schreiben

```javascript
// packages/mein-plugin/src/index.js

export const MEIN_CONFIG = {
  id: 'meinsprache',
  name: 'Meine Sprache',
  extensions: ['.abc'],
  defaultStarter: `// Willkommen in Meiner Sprache!\n`,
}

export function activate(context) {
  // Konfiguration an die App übergeben
  context.setConfig('language', MEIN_CONFIG)

  // Events abonnieren
  const unsubscribe = context.onEvent('editorStateChange', ({ key, value }) => {
    console.log(`Editor-State geändert: ${key} =`, value)
  })

  // Command registrieren
  context.registerCommand('mein-plugin:hello', () => {
    console.log('Hallo aus dem Plugin!')
  })

  return { config: MEIN_CONFIG }
}

export function deactivate(instance) {
  // Aufräumen (optional)
  console.log('Plugin wird deaktiviert')
}
```

### 3.4 Im Plugin-Bridge registrieren

In `src/modules/plugin-bridge.js`:

```javascript
// 1. Import hinzufügen
import * as meinPlugin from '@harness/mein-plugin'

// 2. In DISCOVERED_PLUGINS eintragen
export const DISCOVERED_PLUGINS = [
  // ... bestehende Einträge ...
  {
    manifest: {
      name: '@harness/mein-plugin',
      harness: {
        id: 'plugin:mein-plugin',
        type: 'language',
        contributes: { languages: ['meinsprache'] },
        activationEvents: ['onLanguage:meinsprache'],
      },
    },
    module: meinPlugin,
  },
]
```

### 3.5 Als Dependency einbinden

```jsonc
// package.json (root)
{
  "dependencies": {
    "@harness/mein-plugin": "file:./packages/mein-plugin"
  }
}
```

---

## 4. Sprach-Plugin (Language)

Ein Sprach-Plugin stellt eine Programmiersprache für den Editor bereit.

### Minimal-Beispiel

```javascript
export const SPRACHE_CONFIG = {
  id: 'meinsprache',           // Eindeutige ID
  name: 'Meine Sprache',       // Anzeigename
  extensions: ['.abc'],        // Dateiendungen
  defaultStarter: `// Starter-Code\n`,  // Startcode für neue Aufgaben
}

export function activate(context) {
  context.setConfig('language', SPRACHE_CONFIG)
  return { config: SPRACHE_CONFIG }
}
```

### Mit Validierung

```javascript
export function validate(code) {
  try {
    // Eigene Validierungslogik
    return { valid: true }
  } catch (e) {
    return { valid: false, error: e.message }
  }
}

export function activate(context) {
  context.setConfig('language', SPRACHE_CONFIG)
  return { config: SPRACHE_CONFIG, validate }
}
```

### Vollständiges Beispiel (JavaScript)

Siehe `packages/plugin-javascript/src/index.jsx`:

```javascript
export const JAVASCRIPT_CONFIG = {
  id: 'javascript',
  name: 'JavaScript',
  icon: null, // Icon wird vom Host bereitgestellt
  extensions: ['.js', '.jsx'],
  defaultStarter: `// JavaScript Aufgabe\n...`,
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
```

---

## 5. AI-Provider-Plugin

Ein AI-Provider-Plugin kapselt die API-Anbindung an einen KI-Dienst.

### Struktur

```javascript
export const PROVIDER_CONFIG = {
  id: 'mein-ai',               // Eindeutige ID
  name: 'Mein AI',             // Anzeigename
  defaultUrl: 'https://api.example.com/v1',  // Basis-URL
  defaultModel: 'model-name',  // Standard-Modell
  needsKey: true,              // Wird ein API-Key benötigt?
  recommended: false,          // Standard-Provider?
  hint: 'API-Key unter https://...',  // Setup-Hinweis
}

export async function callProvider({ key, baseUrl, model }, system, user) {
  const url = baseUrl?.replace(/\/+$/, '') || PROVIDER_CONFIG.defaultUrl
  const m = model || PROVIDER_CONFIG.defaultModel

  const r = await fetch(`${url}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: m,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    }),
  })

  if (!r.ok) throw new Error(`API-Fehler: ${r.status}`)
  const data = await r.json()
  return data.choices?.[0]?.message?.content || 'Keine Antwort.'
}

export function activate(context) {
  context.setConfig('provider', PROVIDER_CONFIG)
  return { config: PROVIDER_CONFIG, call: callProvider }
}
```

### Provider ohne API-Key (lokal)

```javascript
export const OLLAMA_CONFIG = {
  id: 'ollama',
  name: 'Ollama',
  defaultUrl: 'http://localhost:11434/v1',
  defaultModel: 'llama3',
  needsKey: false,          // Kein Key nötig
  recommended: false,
  hint: 'Lokalen Ollama-Server starten: ollama serve',
}
```

> **Wichtig:** Die `call`-Funktion muss als drittes Argument das `system`-Prompt und als viertes das `user`-Prompt erhalten. Sie muss einen String zurückgeben.

---

## 6. Feature-Plugin

Ein Feature-Plugin fügt der App eine neue Funktion hinzu.

### Einfaches Feature

```javascript
export const MEIN_FEATURE = {
  id: 'feature:mein-feature',
  type: 'feature',
  name: 'Mein Feature',
  description: 'Beschreibung des Features',
  enabled: true,  // Standardmäßig aktiviert
}

export function activate(context) {
  context.setConfig('feature', MEIN_FEATURE)
  return { config: MEIN_FEATURE }
}
```

### Feature mit Daten

```javascript
import daten from './daten.json'

export function activate(context) {
  context.setConfig('feature', MEIN_FEATURE)
  context.setConfig('meine-daten', daten)  // Daten ins System einbringen
  return { config: MEIN_FEATURE, daten }
}
```

### Feature mit React-Komponente (Zukunft)

```javascript
import MeineKomponente from './MeineKomponente.jsx'

export function activate(context) {
  // UI-Slot registrieren – die Host-App kann die Komponente einbinden
  context.registerUI('sidebar-bottom', MeineKomponente)
  return { config: MEIN_FEATURE }
}
```

---

## 7. Theme-Plugin (Zukunft)

Theme-Plugins sind vorbereitet aber noch nicht vollständig in der UI integriert:

```javascript
export const THEME = {
  id: 'dark-custom',
  name: 'Dark Custom',
  vars: {
    '--bg': '#0a0a0a',
    '--text': '#e0e0e0',
    '--accent': '#66b8ff',
    // ... weitere CSS-Variablen
  }
}

export function activate(context) {
  context.setConfig('theme', THEME)
  // Theme-Variablen direkt setzen:
  Object.entries(THEME.vars).forEach(([k, v]) =>
    document.documentElement.style.setProperty(k, v))
  return { config: THEME }
}
```

---

## 8. Plugin-Manifest (package.json)

Das `harness`-Feld in `package.json` ist zwingend erforderlich.

### Felder

```jsonc
{
  "name": "@harness/mein-plugin",     // Wird als Anzeigename verwendet
  "version": "1.0.0",
  "type": "module",
  "main": "src/index.js",
  "exports": {
    ".": "./src/index.js"
  },
  "harness": {                        // ← Plugin-Manifest
    "id": "plugin:mein-plugin",       // Eindeutige ID (Präfix: plugin: | provider: | feature:)
    "type": "language",               // language | aiProvider | feature | theme | panel
    "contributes": {                  // Was stellt das Plugin bereit?
      "languages": ["meinsprache"],
      "aiProviders": [],
      "panels": [],
      "themes": [],
      "features": []
    },
    "activationEvents": [             // Wann wird das Plugin aktiviert?
      "onLanguage:meinsprache",
      "onDemand",
      "onStartupFinished"
    ]
  }
}
```

### Activation Events

| Event | Bedeutung |
|---|---|
| `onLanguage:<id>` | Wird ausgelöst, wenn eine bestimmte Sprache ausgewählt wird |
| `onDemand` | Wird nur bei Bedarf aktiviert (z. B. bei Provider-Auswahl) |
| `onStartupFinished` | Wird nach dem App-Start aktiviert |

---

## 9. Plugin im System registrieren

Die Registrierung erfolgt im **Plugin Bridge** (`src/modules/plugin-bridge.js`).

### 1. Plugin importieren

```javascript
import * as meinPlugin from '@harness/mein-plugin'
```

### 2. In DISCOVERED_PLUGINS eintragen

```javascript
export const DISCOVERED_PLUGINS = [
  // Bestehende Plugins...
  { manifest: { name: '@harness/mein-plugin', harness: { id: 'plugin:mein-plugin', type: 'language', ... } }, module: meinPlugin },
]
```

### 3. Enable/Disable über die UI

Das `ConfigSettingsModal` zeigt alle registrierten Plugins nach Typ gruppiert an. Der Benutzer kann sie dort ein- und ausschalten. Der Status wird in `localStorage` unter `harness_disabled_plugins` persistiert.

---

## 10. PluginContext-API

Jedes Plugin erhält bei der Aktivierung einen `PluginContext` mit folgenden APIs:

### Editor-State

```javascript
const state = context.getEditorState()       // Alle States
const value = context.getEditorState('key')  // Einzelner State
context.setEditorState('key', value)         // State setzen (löst Event aus)
```

### Events

```javascript
// Event abonnieren → gibt unsubscribe-Funktion zurück
const unsubscribe = context.onEvent('eventName', (payload) => {
  console.log('Event erhalten:', payload)
})

// Event auslösen
context.emitEvent('eventName', { data: 'wert' })

// Vordefinierte Events:
// 'editorStateChange' – Editor-State wurde geändert
// 'configChange'      – Konfiguration wurde geändert
// 'uiSlotRegistered'  – Ein UI-Slot wurde registriert
```

### UI-Slots

```javascript
// Komponente in einem UI-Slot registrieren
context.registerUI('sidebar-bottom', MeineKomponente)

// Registrierte Komponente abrufen (von der Host-App)
const component = context.getUI('sidebar-bottom')
```

### Commands

```javascript
// Command registrieren
context.registerCommand('mein-plugin:action', (...args) => {
  console.log('Command ausgeführt:', args)
})

// Command ausführen
await context.executeCommand('mein-plugin:action', arg1, arg2)
```

### Konfiguration

```javascript
// Config lesen (plugin-spezifisch)
const value = context.getConfig('key', 'default')
const all = context.getConfig()  // Alle Configs

// Config setzen
context.setConfig('key', 'value')
context.setConfig({ key1: 'val1', key2: 'val2' })  // Mehrere auf einmal
```

### Persistenter Storage

```javascript
const storage = context.storage  // Direkter Zugriff auf persistentes Objekt
storage.userData = { score: 42 }
// Der Storage ist plugin-spezifisch und bleibt erhalten
```

---

## 11. Fortgeschrittene Konzepte

### 11.1 Lazy Loading mit Activation Events

```jsonc
{
  "harness": {
    "activationEvents": ["onLanguage:rust", "onDemand"]
  }
}
```

Das Plugin wird erst aktiviert, wenn ein Benutzer die Rust-Sprache auswählt. Das reduziert die Startzeit der App.

### 11.2 Contribution-basierte Abfragen

```javascript
// Alle Pluings finden, die eine bestimmte Contribution bieten
const linterPlugins = registry.queryByContribution('linters')
const languagePlugins = registry.queryByContribution('languages')
```

### 11.3 Plugin-zu-Plugin Kommunikation

```javascript
// Plugin A: Data bereitstellen
context.setConfig('shared-data', { wichtigeInfo: '...' })

// Plugin B: Data abrufen
const data = context.getConfig('', null, 'shared-data')  // Zugriff über den Context
```

Oder über Events:

```javascript
// Plugin A sendet Event
context.emitEvent('custom:data-ready', payload)

// Plugin B hört zu
context.onEvent('custom:data-ready', (payload) => { ... })
```

### 11.4 Eigene activate()-Logik

Die `activate()`-Funktion kann asynchron sein und beliebige Initialisierung durchführen:

```javascript
export async function activate(context) {
  // Asynchrone Initialisierung
  const response = await fetch('/api/config')
  const config = await response.json()

  // Ressourcen registrieren
  context.setConfig('dynamic-config', config)
  context.registerCommand('mein-plugin:refresh', async () => {
    const neu = await fetch('/api/config')
    context.setConfig('dynamic-config', await neu.json())
  })

  return { config }
}
```

### 11.5 Dynamische Plugin-Entdeckung (Zukunft)

Der `Scanner` in `@harness/core` unterstützt `import.meta.glob` für automatische Plugin-Entdeckung:

```javascript
// Automatische Entdeckung aller @harness/ Packages
const modules = import.meta.glob('/packages/*/src/index.js', { eager: true })
const entries = scanFromGlob(modules)
const plugins = scanPlugins(entries)
// → Manuelles Registrieren in DISCOVERED_PLUGINS entfällt
```

---

## 12. FAQ & Troubleshooting

### Plugin wird nicht in der UI angezeigt

1. **Im Plugin-Bridge registriert?** `DISCOVERED_PLUGINS` in `plugin-bridge.js` prüfen
2. **package.json hat `harness`-Feld?** Manifest ist zwingend erforderlich
3. **Dependency eingetragen?** `package.json` (root) prüfen
4. **Plugin-Typ korrekt?** `type: 'language' | 'aiProvider' | 'feature'`
5. **activationEvents passend?** Siehe Tabelle oben

### activate() wird nicht aufgerufen

- Die `activationEvents` müssen zum Kontext passen
- Bei `onStartupFinished`: Plugin wird beim App-Start aktiviert
- Bei `onDemand`: Plugin wird nur bei Bedarf aktiviert

### Plugin stürzt ab

- Die `activate()`-Funktion ist mit `try/catch` im Registry geschützt
- Fehler werden mit `console.error` geloggt
- Das Plugin wird übersprungen, die App läuft weiter

### Config wird nicht gespeichert

- `context.setConfig('key', value)` speichert in-memory
- Für dauerhafte Speicherung `context.storage` verwenden
- Storage ist plugin-spezifisch und bleibt über Seitenneuladung erhalten

---

## Weiterführende Informationen

- **Core Framework**: `packages/core/` – Registry, Context, Scanner, Types
- **Plugin Bridge**: `src/modules/plugin-bridge.js` – Verbindung zur App
- **Config UI**: `src/components/ConfigSettingsModal.jsx` – Plugin-Verwaltung
- **Beispiel-Plugins**: `packages/plugin-javascript/`, `packages/provider-gemini/`
