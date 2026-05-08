/* ═══════════════════════════════════════════
   Module Registry – Plugin Architecture
   ═══════════════════════════════════════════ */

import { FEATURE_LIST } from "./features";
import { PROVIDERS } from "./providers";
import { LANGUAGES } from "./languages";
import { TASKDATASETS } from "./taskdata";
import {
  Star,
  Link,
  Desktop,
  TerminalWindow,
  Plugs,
  Article,
  BookOpen,
} from "../components/Icons";

const MODULE_TYPES = {
  PROVIDER: "provider",
  TASKDATA: "taskdata",
  LANGUAGE: "language",
  FEATURE: "feature",
};

/* ── Build default module list from all module types ── */
export const DEFAULT_MODULES = [
  // AI Provider Modules
  ...PROVIDERS.map((p) => ({
    id: `provider:${p.id}`,
    type: MODULE_TYPES.PROVIDER,
    name: p.name,
    description: p.hint || p.name,
    icon: getProviderIcon(p.id),
    enabled: true,
    providerId: p.id,
  })),
  // Feature Modules
  ...FEATURE_LIST.map((f) => ({
    ...f,
    enabled: f.enabled !== false,
  })),
  // Language Modules
  ...LANGUAGES.map((l) => ({
    id: `lang:${l.id}`,
    type: MODULE_TYPES.LANGUAGE,
    name: l.name,
    description: `${l.name} Unterstützung`,
    icon: l.icon || Article,
    enabled: l.id === "javascript" ? true : false,
    langId: l.id,
  })),
  // Task Dataset Modules (dynamically discovered from taskdata/ folder)
  ...TASKDATASETS.map((d) => ({
    ...d,
    enabled: d.enabled !== false,
  })),
];

function getProviderIcon(id) {
  const icons = {
    gemini: Star,
    openrouter: Link,
    ollama: Desktop,
    opencode: TerminalWindow,
  };
  return icons[id] || Plugs;
}

/* ── Persistence ── */
export function loadModuleSettings() {
  try {
    const saved = localStorage.getItem("code_trainer_modules");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && typeof parsed === "object") return parsed;
    }
  } catch {
    /* ignore */
  }
  return null;
}

export function saveModuleSettings(settings) {
  try {
    localStorage.setItem("code_trainer_modules", JSON.stringify(settings));
  } catch {
    /* ignore */
  }
}

export function getModuleState() {
  const saved = loadModuleSettings();
  if (saved) return saved;
  const state = {};
  for (const mod of DEFAULT_MODULES) {
    state[mod.id] = mod.enabled;
  }
  return state;
}

export function toggleModule(moduleId) {
  const state = getModuleState();
  state[moduleId] = !state[moduleId];
  saveModuleSettings(state);
  return state;
}

export function getEnabledProviders() {
  const state = getModuleState();
  return PROVIDERS.filter((p) => state[`provider:${p.id}`] !== false).map(
    (p) => p.id,
  );
}

/**
 * Get the list of enabled task dataset names
 */
export function getEnabledDatasets() {
  const state = getModuleState();
  return TASKDATASETS.filter((d) => state[d.id] !== false).map(
    (d) => d.datasetName,
  );
}

export function isFeatureEnabled(featureId) {
  const state = getModuleState();
  const id = featureId.startsWith("feature:")
    ? featureId
    : `feature:${featureId}`;
  return state[id] !== false;
}

export function getModulesByType() {
  const state = getModuleState();
  const providers = DEFAULT_MODULES.filter(
    (m) => m.type === MODULE_TYPES.PROVIDER,
  );
  const features = DEFAULT_MODULES.filter(
    (m) => m.type === MODULE_TYPES.FEATURE,
  );
  const languages = DEFAULT_MODULES.filter(
    (m) => m.type === MODULE_TYPES.LANGUAGE,
  );
  const taskdata = DEFAULT_MODULES.filter(
    (m) => m.type === MODULE_TYPES.TASKDATA,
  );
  return { providers, features, languages, taskdata };
}
