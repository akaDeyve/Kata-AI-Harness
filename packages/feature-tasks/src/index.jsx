/* ═══════════════════════════════════════════
   @harness/feature-tasks
   Predefined programming task datasets
   ═══════════════════════════════════════════ */

import tasksData from './tasks.json'

export const TASKS_FEATURE = {
  id: 'feature:tasks',
  type: 'feature',
  name: 'Task Datasets',
  description: 'Vordefinierte Programmieraufgaben zum Üben',
  enabled: true,
}

export function getTasksForDatasets(datasets) {
  if (!datasets || datasets.length === 0) return tasksData
  return tasksData.filter(t => datasets.includes(t.dataset))
}

export function activate(context) {
  context.setConfig('feature', TASKS_FEATURE)
  context.setConfig('tasks', tasksData)
  return { config: TASKS_FEATURE, tasks: tasksData }
}
