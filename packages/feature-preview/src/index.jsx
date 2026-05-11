/* ═══════════════════════════════════════════
   @harness/feature-preview
   Live code preview (Babel + iframe sandbox)
   ═══════════════════════════════════════════ */

export const harness = {
  name: '@harness/feature-preview',
  id: 'feature:preview',
  type: 'feature',
  contributes: { features: ['preview'] },
  activationEvents: ['onStartupFinished'],
}

export const PREVIEW_FEATURE = {
  id: 'feature:preview',
  type: 'feature',
  name: 'Code Preview',
  description: 'Live-Vorschau von React/JSX-Code im Browser',
  enabled: true,
}

export function activate(context) {
  context.setConfig('feature', PREVIEW_FEATURE)
  return { config: PREVIEW_FEATURE }
}
