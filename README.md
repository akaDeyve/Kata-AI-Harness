# Code Trainer AI – Open Source

[![Version](https://img.shields.io/badge/version-1.0.0-blue)](https://github.com/your-username/coding-trainer)
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
| **🔌 Plugin-Architektur** | AI-Provider, Sprachen und Features als Module erweiterbar |
| **🎨 Theme-Support** | Light, Dark & Rose Theme – erweiterbar über CSS-Variablen |
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

## 🧩 Plugin-Architektur

Das Projekt setzt auf maximale Erweiterbarkeit durch eine modulare Plugin-Architektur:

```
src/modules/
├── index.js              ← Zentrale Registry (alle Module)
├── registry.js           ← Enable/Disable System
├── providers/            ← AI-Anbieter-Module
│   ├── gemini.js         ← Google Gemini (★ Default)
│   ├── openrouter.js     ← OpenRouter
│   ├── ollama.js         ← Ollama (lokal)
│   └── opencode.js       ← OpenCode (lokal)
├── languages/            ← Sprach-Module
│   ├── javascript.jsx    ← JavaScript / React
│   ├── python.jsx        ← Python (geplant)
│   └── typescript.jsx    ← TypeScript (geplant)
├── themes/               ← Theme-Module
│   ├── light.js          ← Hell (Default)
│   ├── dark.js           ← Dunkel
│   └── rose.js           ← Rose
├── features/             ← Feature-Module
│   └── index.js          ← Preview, Tasks, Generate
└── taskdata/             ← Aufgaben-Datensets
    └── tasks.json
```

**Neue Module hinzufügen:**
1. Datei im entsprechenden Ordner erstellen
2. In der Registry (`index.js`) registrieren
3. Fertig – UI, Einstellungen und Enable/Disable funktionieren automatisch

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
│   ├── ConfigSettingsModal.jsx← Einstellungen (Module aktivieren)
│   ├── Editor.jsx             ← CodeMirror 6 Editor
│   ├── EditorToolbar.jsx      ← Toolbar (Preview, Reset, Copy)
│   ├── GenerateTaskModal.jsx  ← KI-Aufgabengenerierung
│   ├── Icons.jsx              ← SVG-Icon-Komponenten
│   ├── RightPanel.jsx         ← Rechte Seitenleiste (Feedback)
│   ├── Sidebar.jsx            ← Linke Navigation (Aufgaben)
│   ├── StatusBar.jsx          ← Statusleiste
│   ├── Toast.jsx              ← Benachrichtigungen
│   └── TopBar.jsx             ← Obere Aktionsleiste
└── modules/                   ← Plugin-Architektur
    ├── providers/             ← AI-Anbieter
    ├── languages/             ← Sprachen
    ├── themes/                ← Themes
    ├── features/              ← Features
    └── taskdata/              ← Aufgaben
```

---

## 🛣️ Roadmap

| Bereich | Status | Details |
|---------|--------|---------|
| **Multi-Language** | ⚡ In Arbeit | Python (Pyodide), TypeScript, Java/Rust (WASM) |
| **Plugin-Architektur** | ✅ Implementiert | Provider, Sprachen, Features, Themes als Module |
| **UI & Icon Overhaul** | 🔜 Geplant | Einheitliche Icon-Bibliothek (Lucide), Barebone-Theme |
| **AI-Modelle** | ✅ Implementiert | Gemini (Default), OpenRouter, Ollama, OpenCode |
| **Dokumentation** | ⚡ In Arbeit | README, CONTRIBUTING, Architektur-Diagramm, Vercel Demo |
| **Testing** | 🔜 Geplant | Unit Tests (Vitest), E2E (Playwright), CI/CD (GitHub Actions) |

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
