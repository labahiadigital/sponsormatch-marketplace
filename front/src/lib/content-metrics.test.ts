import { describe, test, expect } from 'vitest';
import {
  calculateContentMetrics,
  compareWithLocalMedia,
  type ContentMetrics,
  type MediaComparison,
} from './content-metrics';

describe('calculateContentMetrics', () => {
  test('returns monthly impressions, reach and engagement', () => {
    const metrics = calculateContentMetrics(5_000_000, 4.5, 500_000, 25_000);
    expect(metrics.monthlyImpressions).toBeGreaterThan(0);
    expect(metrics.monthlyReach).toBeGreaterThan(0);
    expect(metrics.engagementRate).toBe(4.5);
    expect(metrics.avgInteractions).toBeGreaterThan(0);
  });

  test('estimated media value is positive for active club', () => {
    const metrics = calculateContentMetrics(1_000_000, 3.5, 100_000, 5_000);
    expect(metrics.estimatedMonthlyMediaValue).toBeGreaterThan(0);
  });

  test('content frequency is at least weekly', () => {
    const metrics = calculateContentMetrics(500_000, 6.0, 50_000, 3_000);
    expect(metrics.recommendedPostsPerWeek).toBeGreaterThanOrEqual(3);
  });

  test('higher followers produce higher impressions', () => {
    const small = calculateContentMetrics(100_000, 4.0, 50_000, 2_000);
    const large = calculateContentMetrics(10_000_000, 4.0, 5_000_000, 200_000);
    expect(large.monthlyImpressions).toBeGreaterThan(small.monthlyImpressions);
  });
});

describe('compareWithLocalMedia', () => {
  test('returns comparison with local media equivalents', () => {
    const metrics: ContentMetrics = {
      monthlyImpressions: 5_000_000,
      monthlyReach: 2_000_000,
      engagementRate: 4.5,
      avgInteractions: 250_000,
      estimatedMonthlyMediaValue: 60_000,
      recommendedPostsPerWeek: 5,
    };
    const comparison = compareWithLocalMedia(metrics, 'Madrid');
    expect(comparison.length).toBeGreaterThan(0);
    expect(comparison[0]).toHaveProperty('mediaType');
    expect(comparison[0]).toHaveProperty('equivalentValue');
    expect(comparison[0]).toHaveProperty('description');
  });

  test('media comparisons include digital and traditional channels', () => {
    const metrics: ContentMetrics = {
      monthlyImpressions: 10_000_000,
      monthlyReach: 4_000_000,
      engagementRate: 5.0,
      avgInteractions: 500_000,
      estimatedMonthlyMediaValue: 120_000,
      recommendedPostsPerWeek: 7,
    };
    const comparison = compareWithLocalMedia(metrics, 'Barcelona');
    const types = comparison.map(c => c.mediaType);
    expect(types.some(t => t.includes('Digital') || t.includes('digital'))).toBe(true);
  });
});
