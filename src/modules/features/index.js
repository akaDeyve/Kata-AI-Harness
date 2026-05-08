import { Eye, Article, Rocket, Globe } from '../../components/Icons'

/* ── Feature Modules Registry ── */

const FEATURES = {
  preview: {
    id: 'feature:preview',
    type: 'feature',
    name: 'Code Preview',
    description: 'Live-Vorschau von React/JSX-Code im Browser',
    icon: Eye,
    enabled: true,
  },
  tasks: {
    id: 'feature:tasks',
    type: 'feature',
    name: 'Task Datasets',
    description: 'Vordefinierte Programmieraufgaben zum Üben',
    icon: Article,
    enabled: true,
  },
  generate: {
    id: 'feature:generate',
    type: 'feature',
    name: 'KI-Aufgaben Generierung',
    description: 'Neue Aufgaben per KI generieren lassen',
    icon: Rocket,
    enabled: true,
  },
  languages: {
    id: 'feature:languages',
    type: 'feature',
    name: 'Sprachmodule',
    description: 'Unterstützung für verschiedene Programmiersprachen',
    icon: Globe,
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
