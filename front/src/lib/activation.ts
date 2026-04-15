import type { SponsorObjective } from './sponsorship';

export interface ActivationAction {
  name: string;
  description: string;
  estimatedCost: number;
  channel: string;
}

export interface ActivationPhase {
  phase: 'pre-evento' | 'durante-evento' | 'post-evento';
  actions: ActivationAction[];
}

interface ActionTemplate {
  name: string;
  description: string;
  costRatio: number;
  channel: string;
  objectives: SponsorObjective[];
  sports?: string[];
}

const ACTION_TEMPLATES: ActionTemplate[] = [
  { name: 'Campaña de expectación en redes', description: 'Countdown, teasers y contenido previo para generar expectación en audiencias digitales', costRatio: 0.04, channel: 'Redes Sociales', objectives: ['branding', 'content'] },
  { name: 'Rueda de prensa de presentación', description: 'Presentación oficial del patrocinio con cobertura mediática', costRatio: 0.02, channel: 'Medios', objectives: ['branding'] },
  { name: 'Naming y visibilidad de marca', description: 'Presencia del patrocinador en naming, cartelería y materiales oficiales', costRatio: 0.05, channel: 'Medios', objectives: ['branding'] },
  { name: 'Sorteo de entradas o experiencias VIP', description: 'Sorteo entre seguidores para generar engagement y base de datos', costRatio: 0.02, channel: 'Digital', objectives: ['conversion', 'content'] },
  { name: 'Contenido behind-the-scenes', description: 'Acceso exclusivo a entrenamientos, vestuario o preparación del evento', costRatio: 0.03, channel: 'Redes Sociales', objectives: ['content'] },
  { name: 'Activación experiencial in-situ', description: 'Stand interactivo, photocall o zona de experiencias para asistentes', costRatio: 0.06, channel: 'Evento', objectives: ['experience'] },
  { name: 'Retransmisión en streaming', description: 'Cobertura en directo del evento con integración de marca del patrocinador', costRatio: 0.05, channel: 'Streaming', objectives: ['branding', 'content'], sports: ['Esports'] },
  { name: 'Challenge o hashtag viral', description: 'Reto participativo en redes sociales vinculado al evento', costRatio: 0.02, channel: 'Redes Sociales', objectives: ['content', 'conversion'] },
  { name: 'Acción solidaria comunitaria', description: 'Iniciativa de responsabilidad social vinculada al evento deportivo', costRatio: 0.03, channel: 'Comunidad', objectives: ['csr'] },
  { name: 'Donación por gol/punto/victoria', description: 'Donación a causa social por cada logro deportivo conseguido', costRatio: 0.02, channel: 'Comunidad', objectives: ['csr'] },
  { name: 'Torneo corporativo', description: 'Evento exclusivo para empleados y clientes del patrocinador', costRatio: 0.05, channel: 'Evento', objectives: ['experience', 'conversion'] },
  { name: 'Resumen y highlights post-evento', description: 'Vídeo resumen con métricas de impacto y mejores momentos', costRatio: 0.03, channel: 'Digital', objectives: ['content', 'branding'] },
  { name: 'Informe de ROI para el patrocinador', description: 'Documento con métricas de alcance, impresiones, engagement y valor mediático', costRatio: 0.01, channel: 'Medios', objectives: ['branding', 'conversion', 'content', 'experience', 'csr'] },
  { name: 'Campaña de UGC (contenido de fans)', description: 'Incentivar a fans a compartir contenido orgánico con hashtag oficial', costRatio: 0.02, channel: 'Redes Sociales', objectives: ['content'] },
  { name: 'Encuentro exclusivo con deportistas', description: 'Meet & greet con atletas para clientes premium del patrocinador', costRatio: 0.04, channel: 'Evento', objectives: ['experience'] },
  { name: 'Promoción cruzada con e-commerce', description: 'Descuentos o códigos exclusivos vinculados al evento', costRatio: 0.02, channel: 'Digital', objectives: ['conversion'] },
];

const PHASE_ASSIGNMENT: Record<string, ('pre-evento' | 'durante-evento' | 'post-evento')[]> = {
  'Campaña de expectación en redes': ['pre-evento'],
  'Rueda de prensa de presentación': ['pre-evento'],
  'Naming y visibilidad de marca': ['pre-evento', 'durante-evento'],
  'Sorteo de entradas o experiencias VIP': ['pre-evento'],
  'Contenido behind-the-scenes': ['pre-evento', 'durante-evento'],
  'Activación experiencial in-situ': ['durante-evento'],
  'Retransmisión en streaming': ['durante-evento'],
  'Challenge o hashtag viral': ['pre-evento', 'durante-evento'],
  'Acción solidaria comunitaria': ['durante-evento'],
  'Donación por gol/punto/victoria': ['durante-evento'],
  'Torneo corporativo': ['pre-evento'],
  'Resumen y highlights post-evento': ['post-evento'],
  'Informe de ROI para el patrocinador': ['post-evento'],
  'Campaña de UGC (contenido de fans)': ['durante-evento', 'post-evento'],
  'Encuentro exclusivo con deportistas': ['durante-evento'],
  'Promoción cruzada con e-commerce': ['pre-evento', 'post-evento'],
};

export function generateActivationPlan(
  sport: string,
  budget: number,
  objectives: SponsorObjective[]
): ActivationPhase[] {
  const maxActivationBudget = budget * 0.35;

  const relevant = ACTION_TEMPLATES.filter(t => {
    const matchesObjective = t.objectives.some(o => objectives.includes(o));
    const matchesSport = !t.sports || t.sports.includes(sport);
    return matchesObjective && matchesSport;
  });

  const phases: Record<string, ActivationAction[]> = {
    'pre-evento': [],
    'durante-evento': [],
    'post-evento': [],
  };

  let totalCost = 0;

  for (const template of relevant) {
    const cost = Math.round(budget * template.costRatio);
    if (totalCost + cost > maxActivationBudget) continue;

    const assignedPhases = PHASE_ASSIGNMENT[template.name] || ['durante-evento'];
    const targetPhase = assignedPhases[0];

    phases[targetPhase].push({
      name: template.name,
      description: template.description,
      estimatedCost: cost,
      channel: template.channel,
    });
    totalCost += cost;
  }

  for (const key of Object.keys(phases)) {
    if (phases[key].length === 0) {
      const fallback = relevant.find(t => {
        const p = PHASE_ASSIGNMENT[t.name] || ['durante-evento'];
        return p.includes(key as 'pre-evento' | 'durante-evento' | 'post-evento');
      });
      if (fallback) {
        phases[key].push({
          name: fallback.name,
          description: fallback.description,
          estimatedCost: Math.round(budget * fallback.costRatio),
          channel: fallback.channel,
        });
      } else {
        phases[key].push({
          name: key === 'pre-evento' ? 'Comunicación previa' : key === 'post-evento' ? 'Informe de resultados' : 'Visibilidad de marca',
          description: `Acción estándar para fase ${key}`,
          estimatedCost: 0,
          channel: 'Digital',
        });
      }
    }
  }

  return [
    { phase: 'pre-evento', actions: phases['pre-evento'] },
    { phase: 'durante-evento', actions: phases['durante-evento'] },
    { phase: 'post-evento', actions: phases['post-evento'] },
  ];
}
