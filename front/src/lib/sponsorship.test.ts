import { describe, test, expect } from 'vitest';
import {
  calculateROI,
  calculateMediaValue,
  getMatchScore,
  getAudienceSegments,
  type SponsorObjective,
} from './sponsorship';

describe('calculateMediaValue', () => {
  test('estimates media value from followers and engagement rate', () => {
    const value = calculateMediaValue(1_000_000, 4.5);
    expect(value).toBeGreaterThan(0);
    expect(typeof value).toBe('number');
  });

  test('higher engagement yields higher media value', () => {
    const lowEngagement = calculateMediaValue(1_000_000, 2.0);
    const highEngagement = calculateMediaValue(1_000_000, 8.0);
    expect(highEngagement).toBeGreaterThan(lowEngagement);
  });

  test('more followers yields higher media value', () => {
    const smallClub = calculateMediaValue(100_000, 4.0);
    const bigClub = calculateMediaValue(10_000_000, 4.0);
    expect(bigClub).toBeGreaterThan(smallClub);
  });

  test('returns zero for zero followers', () => {
    expect(calculateMediaValue(0, 5.0)).toBe(0);
  });
});

describe('calculateROI', () => {
  test('returns positive ROI when media value exceeds investment', () => {
    const roi = calculateROI({
      investmentAmount: 50_000,
      followers: 5_000_000,
      engagementRate: 5.0,
      reach: 3_000_000,
      growthPercent: 10,
    });
    expect(roi.estimatedROI).toBeGreaterThan(0);
    expect(roi.mediaValue).toBeGreaterThan(0);
    expect(roi.audienceReach).toBeGreaterThan(0);
    expect(roi.costPerImpression).toBeGreaterThan(0);
  });

  test('returns negative ROI for overpriced small club', () => {
    const roi = calculateROI({
      investmentAmount: 5_000_000,
      followers: 10_000,
      engagementRate: 2.0,
      reach: 5_000,
      growthPercent: 1,
    });
    expect(roi.estimatedROI).toBeLessThan(0);
  });

  test('cost per impression decreases with larger audiences', () => {
    const small = calculateROI({
      investmentAmount: 50_000,
      followers: 100_000,
      engagementRate: 3.0,
      reach: 50_000,
      growthPercent: 2,
    });
    const large = calculateROI({
      investmentAmount: 50_000,
      followers: 10_000_000,
      engagementRate: 3.0,
      reach: 5_000_000,
      growthPercent: 2,
    });
    expect(large.costPerImpression).toBeLessThan(small.costPerImpression);
  });

  test('growth factor amplifies estimated ROI', () => {
    const noGrowth = calculateROI({
      investmentAmount: 50_000,
      followers: 1_000_000,
      engagementRate: 4.0,
      reach: 500_000,
      growthPercent: 0,
    });
    const highGrowth = calculateROI({
      investmentAmount: 50_000,
      followers: 1_000_000,
      engagementRate: 4.0,
      reach: 500_000,
      growthPercent: 25,
    });
    expect(highGrowth.estimatedROI).toBeGreaterThan(noGrowth.estimatedROI);
  });
});

describe('getMatchScore', () => {
  test('returns score between 0 and 100', () => {
    const score = getMatchScore(
      { sector: 'Tecnología', budget: 200_000, objectives: ['branding'] },
      { sport: 'Fútbol', followers: 5_000_000, engagementRate: 4.5, budgetMin: 100_000, budgetMax: 500_000, audienceAge: '18-45', growthPercent: 3 }
    );
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });

  test('budget within range scores higher than out of range', () => {
    const clubProfile = { sport: 'Fútbol', followers: 1_000_000, engagementRate: 4.0, budgetMin: 50_000, budgetMax: 200_000, audienceAge: '18-45', growthPercent: 3 };
    const inRange = getMatchScore(
      { sector: 'Tecnología', budget: 100_000, objectives: ['branding'] },
      clubProfile
    );
    const outRange = getMatchScore(
      { sector: 'Tecnología', budget: 1_000_000, objectives: ['branding'] },
      clubProfile
    );
    expect(inRange).toBeGreaterThan(outRange);
  });

  test('more matching objectives yield higher score', () => {
    const clubProfile = { sport: 'Fútbol', followers: 5_000_000, engagementRate: 6.0, budgetMin: 50_000, budgetMax: 500_000, audienceAge: '18-35', growthPercent: 10 };
    const fewObjectives = getMatchScore(
      { sector: 'Moda', budget: 100_000, objectives: ['branding'] as SponsorObjective[] },
      clubProfile
    );
    const manyObjectives = getMatchScore(
      { sector: 'Moda', budget: 100_000, objectives: ['branding', 'content', 'experience', 'conversion'] as SponsorObjective[] },
      clubProfile
    );
    expect(manyObjectives).toBeGreaterThanOrEqual(fewObjectives);
  });
});

describe('getAudienceSegments', () => {
  test('returns array of audience segments for a club', () => {
    const segments = getAudienceSegments('18-45', 'Mixto', 5_000_000);
    expect(segments.length).toBeGreaterThan(0);
    expect(segments[0]).toHaveProperty('name');
    expect(segments[0]).toHaveProperty('percentage');
    expect(segments[0]).toHaveProperty('size');
  });

  test('segment sizes sum to approximately total followers', () => {
    const followers = 1_000_000;
    const segments = getAudienceSegments('18-45', 'Mixto', followers);
    const totalSize = segments.reduce((sum, s) => sum + s.size, 0);
    expect(totalSize).toBeGreaterThan(followers * 0.9);
    expect(totalSize).toBeLessThan(followers * 1.1);
  });

  test('young audience has higher digital-native segment', () => {
    const young = getAudienceSegments('14-30', '65% Masculino', 1_000_000);
    const older = getAudienceSegments('25-60', 'Mixto', 1_000_000);
    const youngDigital = young.find(s => s.name === 'Digital Natives');
    const olderDigital = older.find(s => s.name === 'Digital Natives');
    expect(youngDigital!.percentage).toBeGreaterThan(olderDigital!.percentage);
  });
});
