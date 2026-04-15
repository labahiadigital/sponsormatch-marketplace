export type SponsorObjective = 'branding' | 'conversion' | 'content' | 'experience' | 'csr';

export interface ROIInput {
  investmentAmount: number;
  followers: number;
  engagementRate: number;
  reach: number;
  growthPercent: number;
}

export interface ROIResult {
  mediaValue: number;
  estimatedROI: number;
  audienceReach: number;
  costPerImpression: number;
}

export interface BrandProfile {
  sector: string;
  budget: number;
  objectives: SponsorObjective[];
}

export interface ClubSponsorProfile {
  sport: string;
  followers: number;
  engagementRate: number;
  budgetMin: number;
  budgetMax: number;
  audienceAge: string;
  growthPercent: number;
}

export interface AudienceSegment {
  name: string;
  percentage: number;
  size: number;
}

const CPM_BASE = 0.012;
const ENGAGEMENT_MULTIPLIER = 1.8;

export function calculateMediaValue(followers: number, engagementRate: number): number {
  if (followers === 0) return 0;
  const impressions = followers * 12;
  const engagementBonus = 1 + (engagementRate / 100) * ENGAGEMENT_MULTIPLIER;
  return Math.round(impressions * CPM_BASE * engagementBonus);
}

export function calculateROI(input: ROIInput): ROIResult {
  const { investmentAmount, followers, engagementRate, reach, growthPercent } = input;

  const growthMultiplier = 1 + growthPercent / 100;
  const mediaValue = calculateMediaValue(followers, engagementRate) * growthMultiplier;

  const estimatedROI = ((mediaValue - investmentAmount) / investmentAmount) * 100;

  const monthlyImpressions = reach * 4;
  const audienceReach = monthlyImpressions * 12;

  const costPerImpression = audienceReach > 0 ? investmentAmount / audienceReach : 0;

  return {
    mediaValue,
    estimatedROI: Math.round(estimatedROI * 100) / 100,
    audienceReach,
    costPerImpression: Math.round(costPerImpression * 10000) / 10000,
  };
}

export function getMatchScore(brand: BrandProfile, club: ClubSponsorProfile): number {
  let score = 0;

  const budgetInRange = brand.budget >= club.budgetMin && brand.budget <= club.budgetMax;
  if (budgetInRange) {
    score += 30;
  } else {
    const distance = brand.budget < club.budgetMin
      ? (club.budgetMin - brand.budget) / club.budgetMin
      : (brand.budget - club.budgetMax) / brand.budget;
    score += Math.max(0, 30 - distance * 40);
  }

  if (club.engagementRate >= 5) score += 15;
  else if (club.engagementRate >= 3) score += 10;
  else score += 5;

  if (club.followers >= 10_000_000) score += 15;
  else if (club.followers >= 1_000_000) score += 10;
  else if (club.followers >= 100_000) score += 5;

  if (club.growthPercent >= 10) score += 10;
  else if (club.growthPercent >= 5) score += 7;
  else if (club.growthPercent >= 2) score += 4;

  const objectiveScoreMap: Record<SponsorObjective, (c: ClubSponsorProfile) => number> = {
    branding: (c) => c.followers >= 1_000_000 ? 8 : 4,
    conversion: (c) => c.engagementRate >= 4 ? 8 : 4,
    content: (c) => c.engagementRate >= 5 ? 8 : 4,
    experience: () => 6,
    csr: () => 6,
  };

  let objectiveScore = 0;
  for (const obj of brand.objectives) {
    objectiveScore += objectiveScoreMap[obj](club);
  }
  const allObjectivesMax = 5 * 8;
  score += (objectiveScore / allObjectivesMax) * 30;

  return Math.min(100, Math.round(score));
}

function parseAgeRange(ageStr: string): { min: number; max: number } {
  const match = ageStr.match(/(\d+)\s*-\s*(\d+)/);
  if (!match) return { min: 18, max: 45 };
  return { min: parseInt(match[1]), max: parseInt(match[2]) };
}

export function getAudienceSegments(audienceAge: string, audienceGender: string, followers: number): AudienceSegment[] {
  const age = parseAgeRange(audienceAge);
  const midAge = (age.min + age.max) / 2;

  let digitalNativePct = midAge <= 25 ? 40 : midAge <= 35 ? 28 : 18;
  let casualFanPct = 25;
  let hardcoreFanPct = 20;
  let familyPct = midAge >= 30 ? 20 : 10;
  let corporatePct = 15;

  if (audienceGender.includes('Masculino')) {
    hardcoreFanPct += 5;
    familyPct -= 5;
  }

  const total = digitalNativePct + casualFanPct + hardcoreFanPct + familyPct + corporatePct;

  const normalize = (pct: number) => Math.round((pct / total) * 100);

  const segments: AudienceSegment[] = [
    { name: 'Digital Natives', percentage: normalize(digitalNativePct), size: 0 },
    { name: 'Fans Casuales', percentage: normalize(casualFanPct), size: 0 },
    { name: 'Fans Hardcore', percentage: normalize(hardcoreFanPct), size: 0 },
    { name: 'Familias', percentage: normalize(familyPct), size: 0 },
    { name: 'Corporativo', percentage: normalize(corporatePct), size: 0 },
  ];

  for (const seg of segments) {
    seg.size = Math.round(followers * seg.percentage / 100);
  }

  return segments;
}
