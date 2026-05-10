/* ═══════════════════════════════════════════
   @harness/feature-generate
   AI-powered task generation
   ═══════════════════════════════════════════ */

export const GENERATE_FEATURE = {
  id: 'feature:generate',
  type: 'feature',
  name: 'KI-Aufgaben Generierung',
  description: 'Neue Aufgaben per KI generieren lassen',
  enabled: true,
}

export function activate(context) {
  context.setConfig('feature', GENERATE_FEATURE)
  return { config: GENERATE_FEATURE }
}
