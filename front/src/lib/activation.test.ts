import { describe, test, expect } from 'vitest';
import {
  generateActivationPlan,
  type ActivationPhase,
  type ActivationAction,
} from './activation';

describe('generateActivationPlan', () => {
  test('returns three phases: pre, during, post', () => {
    const plan = generateActivationPlan('Fútbol', 200_000, ['branding', 'content']);
    const phaseNames = plan.map(p => p.phase);
    expect(phaseNames).toContain('pre-evento');
    expect(phaseNames).toContain('durante-evento');
    expect(phaseNames).toContain('post-evento');
  });

  test('each phase has at least one action', () => {
    const plan = generateActivationPlan('Baloncesto', 100_000, ['experience']);
    for (const phase of plan) {
      expect(phase.actions.length).toBeGreaterThan(0);
    }
  });

  test('each action has name, description, estimatedCost, and channel', () => {
    const plan = generateActivationPlan('Esports', 80_000, ['content', 'conversion']);
    for (const phase of plan) {
      for (const action of phase.actions) {
        expect(action.name).toBeTruthy();
        expect(action.description).toBeTruthy();
        expect(action.estimatedCost).toBeGreaterThanOrEqual(0);
        expect(action.channel).toBeTruthy();
      }
    }
  });

  test('total estimated cost stays within budget multiplied by activation ratio', () => {
    const budget = 150_000;
    const plan = generateActivationPlan('Pádel', budget, ['branding']);
    const totalCost = plan.reduce((sum, phase) =>
      sum + phase.actions.reduce((s, a) => s + a.estimatedCost, 0), 0);
    expect(totalCost).toBeLessThanOrEqual(budget * 0.4);
  });

  test('esports plan includes digital-specific activations', () => {
    const plan = generateActivationPlan('Esports', 100_000, ['content']);
    const allActions = plan.flatMap(p => p.actions);
    const hasDigital = allActions.some(a =>
      a.channel === 'Digital' || a.channel === 'Redes Sociales' || a.channel === 'Streaming'
    );
    expect(hasDigital).toBe(true);
  });

  test('branding objective includes media/visibility actions', () => {
    const plan = generateActivationPlan('Fútbol', 300_000, ['branding']);
    const allActions = plan.flatMap(p => p.actions);
    const hasBranding = allActions.some(a =>
      a.name.toLowerCase().includes('marca') ||
      a.name.toLowerCase().includes('visibilidad') ||
      a.name.toLowerCase().includes('naming') ||
      a.name.toLowerCase().includes('branding') ||
      a.channel === 'Medios'
    );
    expect(hasBranding).toBe(true);
  });

  test('csr objective includes social responsibility actions', () => {
    const plan = generateActivationPlan('Fútbol', 200_000, ['csr']);
    const allActions = plan.flatMap(p => p.actions);
    const hasCsr = allActions.some(a =>
      a.name.toLowerCase().includes('solidari') ||
      a.name.toLowerCase().includes('social') ||
      a.name.toLowerCase().includes('comunidad') ||
      a.name.toLowerCase().includes('responsabilidad')
    );
    expect(hasCsr).toBe(true);
  });
});
