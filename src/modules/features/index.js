/* ── Feature Modules Registry ── */

const FEATURES = {
  preview: {
    id: 'feature:preview',
    type: 'feature',
    name: 'Code Preview',
    description: 'Live-Vorschau von React/JSX-Code im Browser',
    icon: '👁️',
    enabled: true,
  },
  tasks: {
    id: 'feature:tasks',
    type: 'feature',
    name: 'Task Datasets',
    description: 'Vordefinierte Programmieraufgaben zum Üben',
    icon: '📋',
    enabled: true,
  },
  generate: {
    id: 'feature:generate',
    type: 'feature',
    name: 'KI-Aufgaben Generierung',
    description: 'Neue Aufgaben per KI generieren lassen',
    icon: '🚀',
    enabled: true,
  },
  languages: {
    id: 'feature:languages',
    type: 'feature',
    name: 'Sprachmodule',
    description: 'Unterstützung für verschiedene Programmiersprachen',
    icon: '🌐',
    enabled: true,
  },
  themes: {
    id: 'feature:themes',
    type: 'feature',
    name: 'Theme-Unterstützung',
    description: 'Mehrere visuelle Themes für die Anwendung',
    icon: '🎨',
    enabled: true,
  },
}

export const FEATURE_LIST = Object.values(FEATURES)

export function getFeature(id) {
  return FEATURES[id]
}

export function isFeatureEnabled(featureId, moduleState) {
  const key = `feature:${featureId}`
  return moduleState?.[key] !== false
}
