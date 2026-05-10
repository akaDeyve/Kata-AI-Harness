# Code Trainer AI – Open Source

[![Version](https://img.shields.io/badge/version-2.0.0-blue)](https://github.com/your-username/coding-trainer)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)](https://reactjs.org)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite)](https://vitejs.dev)
[![Tailwind](https://img.shields.io/badge/Tailwind-3-06B6D4?logo=tailwindcss)](https://tailwindcss.com)
[![CodeMirror](https://img.shields.io/badge/CodeMirror-6-D30707?logo=codemirror)](https://codemirror.net)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

**Code Trainer** ist ein universelles, KI-gestütztes Coding-Lernsystem.  
Schreibe Code, erhalte Echtzeit-Feedback von KI-Modellen und lerne durch interaktive Aufgaben – alles offline-fähig und selbst hostbar.

> 🧠 **Vision:** Ein universeller **Code Training AI Harness** zum Lernen beliebiger Programmiersprachen mit AI-Feedback.

---

## ✨ Features

| Feature | Beschreibung |
|---------|-------------|
| **🤖 KI-Feedback & Korrektur** | Code bewerten lassen und automatische Korrekturen mit Verbesserungsvorschlägen anfordern |
| **🧠 KI-Aufgaben generieren** | Neue Programmieraufgaben mit Starter-Code per KI erstellen lassen |
| **✏️ Code-Editor** | CodeMirror 6 mit Syntax-Highlighting, Autovervollständigung, Suchen & Ersetzen, Code-Folding |
| **👁️ Live Code Preview** | React-Komponenten in einer sicheren Sandbox-Umgebung ausführen |
| **📚 Aufgaben-Bibliothek** | Fertige Übungen zu React Hooks, Props, CSS, Array-Operationen |
| **💾 Autosave** | Code wird automatisch im Browser gespeichert |
| **🔌 Plugin-Architektur** | AI-Provider, Sprachen, Features und Themes als `@harness/*` npm-Packages |
| **🎨 Theme-Support** | Light, Dark & Rose Theme – erweiterbar als Plugin |
| **🛡️ Security** | Sandboxed iframe, Content-Security-Policy, API-Keys nur lokal |

---

## 🚀 Quick Start

```bash
# Repository klonen
git clone https://github.com/your-username/coding-trainer.git
cd coding-trainer

# Abhängigkeiten installieren
npm install

# Entwicklungsserver starten
npm run dev
```

Dann im Browser `http://localhost:5173` öffnen und oben rechts auf **API** klicken, um einen KI-Anbieter einzurichten.

### Build für Production

```bash
npm run build
npm run preview
```

---

## 🔧 KI-Anbieter konfigurieren

**★ Gemini ist der empfohlene Standard** – kostenloser API-Key unter [aistudio.google.com/apikey](https://aistudio.google.com/apikey).

| Anbieter | Typ | API-Key | Empfohlen |
|----------|-----|:-------:|:---------:|
| **Gemini** ★ | OpenAI-kompatibel | ✅ | ✅ |
| **OpenRouter** | OpenAI-kompatibel | ✅ | |
| **Ollama** (lokal) | OpenAI-kompatibel | ❌ | |
| **OpenCode** (lokal) | Eigenes API | ❌ | |

API-Keys werden **nur lokal** im Browser (`localStorage`) gespeichert und **nie** an Dritte gesendet.
Nicht benötigte Anbieter können im **Einstellungsmenü** (⚙️ oben rechts) deaktiviert werden.

---

## 🧩 Plugin-Architektur (v2.0)

Das Projekt verwendet eine **hybride Plugin-Architektur** mit npm-Paketen als Verteilungskanal.
Jedes Plugin ist ein eigenständiges `@harness/*` Package mit einem `harness`-Manifest in der `package.json`.

### Kern-Prinzip

- **@harness/core** – Nur Plugin Interface, Registry, PluginContext und Scanner
- **@harness/bundle-default** – Core + empfohlene Plugins (JS, Gemini, Light Theme)
- **Alles andere** kommt als Plugin: Sprachen, AI-Provider, Themes, Features

### Struktur

```
packages/
├── core/                      ← Plugin Framework (Registry, Context, Scanner)
│   ├── src/
│   │   ├── index.js           ← Exporte: PluginRegistry, PluginContext, scanPlugins
│   │   ├── types.js           ← JSDoc Typ-Definitionen
│   │   ├── registry.js        ← Load, Activate, Deactivate, Query
│   │   ├── context.js         ← PluginContext API für Plugins
│   │   └── scanner.js         ← Plugin Discovery & Runtime Config
│   └── package.json
├── plugin-javascript/         ← Sprach-Plugin
├── plugin-python/             ← Sprach-Plugin
├── plugin-typescript/         ← Sprach-Plugin
├── provider-gemini/           ← AI-Provider Plugin ★ Default
├── provider-openrouter/       ← AI-Provider Plugin
├── provider-ollama/           ← AI-Provider Plugin (lokal)
├── provider-opencode/         ← AI-Provider Plugin (lokal)
├── theme-light/               ← Theme Plugin
├── theme-dark/                ← Theme Plugin
├── theme-rose/                ← Theme Plugin
├── feature-preview/           ← Feature Plugin (Live Preview)
├── feature-tasks/             ← Feature Plugin (Aufgaben)
├── feature-generate/          ← Feature Plugin (KI-Generierung)
└── bundle-default/            ← Bundle: Core + empfohlene Plugins
```

### Plugin Manifest

Jedes Plugin definiert ein `harness`-Feld in seiner `package.json`:

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

### Runtime Konfiguration

Plugins werden zur Laufzeit über `localStorage` aktiviert/deaktiviert:

```js
import { getEnabledPluginIds, togglePlugin, saveEnabledPluginIds } from './modules/plugin-bridge'

// Alle aktivierten Plugins abrufen
const enabled = getEnabledPluginIds() // [] = alle aktiv

// Plugin togglen
const updated = togglePlugin('plugin:python')

// Explizit setzen
saveEnabledPluginIds(['provider:gemini', 'plugin:javascript', 'feature:preview'])
```

### Neues Plugin erstellen

1. **Verzeichnis erstellen:** `packages/plugin-meinfeature/`
2. **package.json mit harness-Manifest:**
   ```json
   {
     "name": "@harness/plugin-meinfeature",
     "version": "1.0.0",
     "type": "module",
     "main": "src/index.js",
     "harness": {
       "id": "feature:meinfeature",
       "type": "feature",
       "contributes": { "features": ["meinfeature"] },
       "activationEvents": ["onStartupFinished"]
     }
   }
   ```
3. **Implementierung:** `src/index.js` mit `activate(context)` Funktion
4. **Registrieren:** In `src/modules/plugin-bridge.js` importieren und zu `DISCOVERED_PLUGINS` hinzufügen
5. **Vite Alias:** In `vite.config.js` einen resolve-Alias hinzufügen
6. **Abhängigkeit:** In der root `package.json` als `file:packages/plugin-meinfeature` eintragen

### Plugin Context API

Plugins erhalten beim Aktivieren einen `PluginContext` mit folgenden Methoden:

| Methode | Beschreibung |
|---------|-------------|
| `getEditorState(key)` | Editor-Zustand lesen |
| `setEditorState(key, value)` | Editor-Zustand setzen |
| `onEvent(name, callback)` | Event abonnieren |
| `emitEvent(name, payload)` | Event auslösen |
| `getUI(slotName)` | UI-Slot abrufen |
| `registerUI(slotName, component)` | UI-Slot registrieren |
| `registerCommand(name, handler)` | Befehl registrieren |
| `executeCommand(name, ...args)` | Befehl ausführen |
| `getConfig(key, default)` | Plugin-Konfig lesen |
| `setConfig(key, value)` | Plugin-Konfig setzen |
| `storage` | Persistenter Plugin-Speicher |

### Eigenes Plugin als npm-Package publishen

```bash
# Im Plugin-Verzeichnis
cd packages/plugin-meinfeature
npm publish --access public
```

Andere Nutzer können es dann installieren:

```bash
npm install @harness/plugin-meinfeature
```

---

## 🗂️ Projektstruktur

```
src/
├── App.jsx                    ← Hauptkomponente & State-Management
├── index.css                  ← Tailwind + Theme CSS-Variablen
├── main.jsx                   ← Einstiegspunkt
├── lib/
│   └── api.js                 ← Zentrale API-Helper
├── components/                ← UI-Komponenten
│   ├── ApiKeyModal.jsx        ← KI-Anbieter-Auswahl
│   ├── CodePreview.jsx        ← Live-Vorschau (Babel + iframe)
│   ├── ConfigSettingsModal.jsx← Einstellungen (Plugins aktivieren)
│   ├── Editor.jsx             ← CodeMirror 6 Editor
│   ├── EditorToolbar.jsx      ← Toolbar (Preview, Reset, Copy)
│   ├── GenerateTaskModal.jsx  ← KI-Aufgabengenerierung
│   ├── Icons.jsx              ← SVG-Icon-Komponenten
│   ├── RightPanel.jsx         ← Rechte Seitenleiste (Feedback)
│   ├── Sidebar.jsx            ← Linke Navigation (Aufgaben)
│   ├── StatusBar.jsx          ← Statusleiste
│   ├── Toast.jsx              ← Benachrichtigungen
│   └── TopBar.jsx             ← Obere Aktionsleiste
└── modules/                   ← Plugin Bridge (Migration Layer)
    ├── index.js               ← Re-Export für Backward Compatibility
    └── plugin-bridge.js       ← Verbindet @harness/* mit der App

packages/                      ← @harness/* Plugin Packages
├── core/                      ← Plugin Framework
├── plugin-*/                  ← Sprach-Plugins
├── provider-*/                ← AI-Provider Plugins
├── theme-*/                   ← Theme Plugins
├── feature-*/                 ← Feature Plugins
└── bundle-default/            ← Default Bundle
```

---

## 🛣️ Roadmap

| Bereich | Status | Details |
|---------|--------|---------|
| **Multi-Language** | ⚡ In Arbeit | Python (Pyodide), TypeScript, Java/Rust (WASM) |
| **Plugin-Architektur** | ✅ Implementiert | `@harness/*` npm-Packages mit Plugin-Interface |
| **Runtime Plugin Config** | ✅ Implementiert | localStorage-basiertes Enable/Disable |
| **UI & Icon Overhaul** | 🔜 Geplant | Einheitliche Icon-Bibliothek (Lucide), Barebone-Theme |
| **AI-Modelle** | ✅ Implementiert | Gemini (Default), OpenRouter, Ollama, OpenCode als Plugins |
| **Dokumentation** | ⚡ In Arbeit | README, CONTRIBUTING, Architektur-Diagramm, Vercel Demo |
| **Testing** | 🔜 Geplant | Unit Tests (Vitest), E2E (Playwright), CI/CD (GitHub Actions) |
| **Plugin Marketplace** | 🔜 Geplant | Community-Plugins als npm-Packages discoverable machen |

### USPs

| Merkmal | Beschreibung |
|---------|-------------|
| **AI-Native** | Echtzeit-Feedback durch verschiedene KI-Modelle |
| **Multi-Language** | Unterstützung vieler Programmiersprachen |
| **Open Source** | Vollständig quelloffen (MIT) |
| **Self-Hostable** | Eigenes Hosting ohne Cloud-Abhängigkeit |
| **Erweiterbar** | Plugin-basierte Architektur für Community-Beiträge |

---

## 🛡️ Sicherheit

- **Sandboxed iframe** für Code-Preview – kein Zugriff auf parent-DOM
- **API-Keys** werden nur im Browser gespeichert (`localStorage`)
- **Kein Backend** – die App läuft komplett clientseitig
- **Content-Security-Policy** via Vite konfiguriert
- **Prototype Pollution** Schutz bei JSON-Parsing

---

## 📦 Abhängigkeiten

- **React 18** – UI-Framework
- **Vite 5** – Build-Tool & Dev-Server
- **Tailwind CSS 3** – Utility-First Styling
- **CodeMirror 6** – Code-Editor
- **@phosphor-icons/react** – Icons
- **@babel/standalone** – JSX-Transpilierung für Live-Preview
- **react-syntax-highlighter** – Syntax-Highlighting für Feedback

---

## 🤝 Beitragen

Verbesserungen, Bugfixes und neue Module sind willkommen!

1. Fork erstellen
2. Feature-Branch: `git checkout -b feature/mein-feature`
3. Commit: `git commit -m 'Neues Feature'`
4. Push: `git push origin feature/mein-feature`
5. Pull Request erstellen

Siehe [CONTRIBUTING.md](CONTRIBUTING.md) für Details.

---

## 📄 Lizenz

MIT License – siehe [LICENSE](LICENSE).

---

## 💡 Inspiration

Gebaut mit ❤️ für alle, die programmieren lernen und lehren wollen.  
Feedback und Ideen sind immer willkommen – erstellt ein Issue oder diskutiert mit auf GitHub!
