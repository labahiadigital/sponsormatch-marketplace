export interface ContentMetrics {
  monthlyImpressions: number;
  monthlyReach: number;
  engagementRate: number;
  avgInteractions: number;
  estimatedMonthlyMediaValue: number;
  recommendedPostsPerWeek: number;
}

export interface MediaComparison {
  mediaType: string;
  equivalentValue: string;
  description: string;
}

const CPM_RATE = 0.012;

export function calculateContentMetrics(
  followers: number,
  engagementRate: number,
  avgLikes: number,
  avgComments: number,
): ContentMetrics {
  const postsPerMonth = 20;
  const impressionsPerPost = followers * 0.3;
  const monthlyImpressions = Math.round(impressionsPerPost * postsPerMonth);
  const monthlyReach = Math.round(followers * 0.6);
  const avgInteractions = avgLikes + avgComments;

  const estimatedMonthlyMediaValue = Math.round(monthlyImpressions * CPM_RATE * (1 + engagementRate / 50));

  let recommendedPostsPerWeek: number;
  if (followers >= 5_000_000) recommendedPostsPerWeek = 7;
  else if (followers >= 1_000_000) recommendedPostsPerWeek = 5;
  else recommendedPostsPerWeek = 3;

  return {
    monthlyImpressions,
    monthlyReach,
    engagementRate,
    avgInteractions,
    estimatedMonthlyMediaValue,
    recommendedPostsPerWeek,
  };
}

const LOCAL_MEDIA_BENCHMARKS: Record<string, { newspaper: number; radio: number; tv: number }> = {
  Madrid: { newspaper: 250_000, radio: 400_000, tv: 2_000_000 },
  Barcelona: { newspaper: 200_000, radio: 350_000, tv: 1_800_000 },
  default: { newspaper: 100_000, radio: 200_000, tv: 800_000 },
};

export function compareWithLocalMedia(metrics: ContentMetrics, location: string): MediaComparison[] {
  const benchmarks = LOCAL_MEDIA_BENCHMARKS[location] || LOCAL_MEDIA_BENCHMARKS.default;

  const comparisons: MediaComparison[] = [];

  const newspaperMultiple = Math.round(metrics.monthlyImpressions / benchmarks.newspaper * 10) / 10;
  comparisons.push({
    mediaType: 'Prensa local',
    equivalentValue: `${newspaperMultiple}x`,
    description: `Tu alcance equivale a ${newspaperMultiple} veces la audiencia mensual de un periódico local`,
  });

  const radioMultiple = Math.round(metrics.monthlyImpressions / benchmarks.radio * 10) / 10;
  comparisons.push({
    mediaType: 'Radio local',
    equivalentValue: `${radioMultiple}x`,
    description: `Tus impresiones mensuales equivalen a ${radioMultiple} veces las de una emisora local`,
  });

  const digitalEquivalent = Math.round(metrics.estimatedMonthlyMediaValue / 0.8);
  comparisons.push({
    mediaType: 'Publicidad Digital (display)',
    equivalentValue: `€${digitalEquivalent.toLocaleString('es-ES')}`,
    description: `El valor de tu alcance orgánico equivale a ${digitalEquivalent.toLocaleString('es-ES')}€ en publicidad digital de pago`,
  });

  if (metrics.monthlyImpressions > benchmarks.tv) {
    const tvMultiple = Math.round(metrics.monthlyImpressions / benchmarks.tv * 10) / 10;
    comparisons.push({
      mediaType: 'TV regional',
      equivalentValue: `${tvMultiple}x`,
      description: `Superas ${tvMultiple} veces la audiencia mensual de TV regional`,
    });
  }

  return comparisons;
}
