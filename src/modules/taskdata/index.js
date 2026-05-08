/* ── Dynamic Task Dataset Discovery ── */
// Uses Vite's import.meta.glob to discover all .json files in this folder

const taskGlob = import.meta.glob('./*.json', { eager: true, import: 'default' })

/**
 * All discovered task datasets, keyed by filename (without .json)
 */
export const TASKDATASETS = Object.entries(taskGlob).map(([path, data]) => {
  const name = path.replace('./', '').replace('.json', '')
  const tasks = Array.isArray(data) ? data : []
  return {
    id: `taskdata:${name}`,
    type: 'taskdata',
    name: name === 'tasks' ? 'Standard-Aufgaben' : name,
    description: `${tasks.length} Aufgaben`,
    enabled: true,
    datasetName: name,
    tasks,
  }
})

/**
 * Get all tasks from all enabled task datasets
 */
export function getTasksForDatasets(datasetNames) {
  const allTasks = []
  for (const ds of TASKDATASETS) {
    if (datasetNames.includes(ds.datasetName) || datasetNames.length === 0) {
      allTasks.push(...ds.tasks)
    }
  }
  return allTasks
}

/**
 * Get a specific dataset by name
 */
export function getDataset(name) {
  return TASKDATASETS.find(d => d.datasetName === name) || null
}
