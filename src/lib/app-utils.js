/* ═══════════════════════════════════════════
   App Utilities – extracted from App.jsx
   ═══════════════════════════════════════════ */

import { getEnabledPluginIds, DISCOVERED_PLUGINS } from '../modules/plugin-bridge'
import { getTasksForDatasets } from '../modules'
import { safeJsonParse } from './api'

const STORAGE_PREFIX = 'code_trainer_code_'
const STORAGE_TASKS_KEY = 'code_trainer_tasks'

/** Build plugin state from the new plugin system (disabled-list semantics) */
export function buildPluginState() {
  const enabledIds = getEnabledPluginIds()
  const state = {}
  for (const { manifest } of DISCOVERED_PLUGINS) {
    const id = manifest.harness.id
    state[id] = enabledIds.includes(id)
  }
  return state
}

/** Get enabled provider IDs from plugin state (disabled-list semantics) */
export function getEnabledProviderIds() {
  const enabledIds = getEnabledPluginIds()
  const all = DISCOVERED_PLUGINS
    .filter(p => p.manifest.harness.type === 'aiProvider')
    .map(p => p.manifest.harness.id.replace('provider:', ''))
  if (enabledIds.length === 0) return all
  return all.filter(id => enabledIds.includes(`provider:${id}`))
}

/** Get enabled dataset names for task loading */
export function getEnabledDatasetNames() {
  return ['react-hooks', 'css-basics', 'array-ops']
}

export function loadSavedCode(taskId) {
  try { return localStorage.getItem(`${STORAGE_PREFIX}${taskId}`) } catch { return null }
}

export function saveCodeToStorage(taskId, code) {
  try { localStorage.setItem(`${STORAGE_PREFIX}${taskId}`, code) } catch { /* ignore */ }
}

export function getInitialTasks() {
  const enabled = getEnabledDatasetNames()
  const data = getTasksForDatasets(enabled)
  const saved = localStorage.getItem(STORAGE_TASKS_KEY)
  if (saved) {
    const parsed = safeJsonParse(saved)
    if (Array.isArray(parsed)) return parsed
  }
  return data
}
