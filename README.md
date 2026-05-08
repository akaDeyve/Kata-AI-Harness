# CodeLab – Coding Trainer

> Interaktive React-Lernplattform mit KI-gestütztem Feedback, Code-Editor und Live-Vorschau.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite)
![Tailwind](https://img.shields.io/badge/Tailwind-3-06B6D4?logo=tailwindcss)
![License](https://img.shields.io/badge/license-MIT-green)

---

## 📋 Übersicht

**CodeLab** ist eine webbasierte Lernplattform für React- und JavaScript-Entwickler.  
Die App bietet praxisnahe Programmieraufgaben mit integriertem Code-Editor, KI-Feedback und einer Live-Vorschau – ideal zum Üben von Array-Methoden, React Hooks, sicherem Datenzugriff und Rendering-Mustern.

### Features

- ✏️ **VS-Code-artiger Editor** – CodeMirror 6 mit Syntax-Highlighting, Code-Folding, Autovervollständigung, Suchen/Ersetzen (Strg+F) und mehr
- 🤖 **KI-Feedback & Korrektur** – OpenAI-kompatible APIs bewerten den Code und zeigen Verbesserungsvorschläge
- 🧠 **KI-Aufgaben generieren** – Lass dir per KI neue Aufgaben mit Starter-Code erstellen
- 👁️ **Live Code Preview** – Echtzeit-Vorschau deiner React-Komponenten in einer Sandbox-Umgebung
- 📚 **Aufgaben-Bibliothek** – Fertige Übungen zu Arrays, Optional Chaining, Conditional Rendering, API-Zustand und mehr
- 💾 **Autosave** – Code wird automatisch im Browser gespeichert
- 🔒 **Security First** – Sandboxed iframe, Content-Security-Policy, XSS-Schutz

---

## 🚀 Quick Start

```bash
# Repository klonen
git clone https://github.com/dein-username/coding-trainer.git
cd coding-trainer

# Abhängigkeiten installieren
npm install

# Entwicklungsserver starten
npm run dev
```

Dann im Browser `http://localhost:5173` öffnen.

### Build für Production

```bash
npm run build
npm run preview
```

---

## 🔧 Konfiguration

### KI-Anbieter einrichten

Klicke oben rechts auf **API** und wähle einen Anbieter:

| Anbieter     | Typ         | API-Key nötig | Base URL                                         |
|-------------|-------------|:-------------:|--------------------------------------------------|
| **OpenAI**  | OpenAI-komp. | ✅            | `https://api.openai.com/v1`                      |
| **Gemini**  | OpenAI-komp. | ✅            | `/gemini-api` *(Proxy, falls konfiguriert)*      |
| **Groq**    | OpenAI-komp. | ✅            | `https://api.groq.com/openai/v1`                 |
| **OpenRouter** | OpenAI-komp. | ✅         | `https://openrouter.ai/api/v1`                   |
| **Ollama**  | OpenAI-komp. | ❌            | `http://localhost:11434/v1`                      |
| **OpenCode**| Eigenes API  | ❌            | `http://localhost:4096`                           |

> 🔒 API-Keys werden **nur lokal** im Browser (`localStorage`) gespeichert.

---

## 🗂️ Projektstruktur

```
src/
├── components/
│   ├── ApiKeyModal.jsx        # KI-Anbieter-Auswahl
│   ├── CodePreview.jsx        # Live-Vorschau (Babel + iframe)
│   ├── Editor.jsx             # CodeMirror 6 Editor
│   ├── EditorToolbar.jsx      # Toolbar (Preview, Reset, Copy)
│   ├── GenerateTaskModal.jsx  # KI-Aufgabengenerierung
│   ├── Icons.jsx              # SVG-Icon-Komponenten
│   ├── RightPanel.jsx         # Rechte Seitenleiste (Info, Feedback)
│   ├── Sidebar.jsx            # Linke Navigation (Aufgaben-Gruppen)
│   ├── StatusBar.jsx          # Statusleiste unten
│   ├── TaskPanel.jsx          # Aufgaben-Detailansicht
│   ├── Toast.jsx              # Toast-Benachrichtigungen
│   └── TopBar.jsx             # Obere Aktionsleiste
├── data/
│   └── tasks.json             # Aufgaben-Definitionen
├── lib/
│   └── api.js                 # Zentrale API-Helper (OpenAI, OpenCode)
├── App.jsx                    # Hauptkomponente & State-Management
├── index.css                  # Tailwind + globale Styles
└── main.jsx                   # Einstiegspunkt
```

---

## 🧪 Aufgaben-Kategorien

| Kategorie               | Themen                                                    |
|------------------------|-----------------------------------------------------------|
| **Array-Operationen**  | `find()`, `map()`, `filter()`, Spread-Operator            |
| **Sicherer Datenzugriff** | Optional Chaining `?.`, Nullish Coalescing `??`, Destructuring |
| **Rendering-Muster**   | Conditional Rendering, key-Prop, Listen                   |
| **API & State**        | fetch, Formulare, async/await, useEffect                  |
| **React Hooks**        | useState, useEffect, useRef, useCallback, Custom Hooks    |
| **CSS & Styling**      | Tailwind, CSS-in-JS, Responsive Design                    |

---

## 🛡️ Sicherheit

- **Content-Security-Policy** – restriktive CSP-Header in `index.html`
- **Sandboxed Preview** – iframe ohne `allow-same-origin` verhindert Zugriff auf die Elternseite
- **Prototype Pollution Schutz** – `safeJsonParse()` blockiert `__proto__`-Angriffe
- **URL-Validierung** – `isValidUrl()` prüft alle API-Endpoints vor dem Fetch
- **API-Keys** – werden ausschließlich im `localStorage` des Browsers vorgehalten

---

## 💻 Entwickeln

### Technologie-Stack

- **Frontend:** React 18, Vite 5, Tailwind CSS 3
- **Editor:** CodeMirror 6 (JavaScript/JSX, Autocomplete, Folding, Search)
- **Preview:** Babel Standalone (lazy loaded, ~3 MB on demand)
- **Icons:** Phosphor Icons (React)
- **Syntax Highlighting:** react-syntax-highlighter (Prism)

### Abhängigkeiten installieren

```bash
npm install
```

### Dev-Server starten

```bash
npm run dev
```

---

## 📄 Lizenz

MIT License – siehe [LICENSE](./LICENSE).

---

> Made with ❤️ für Entwickler, die React besser verstehen wollen.
