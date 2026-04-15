export interface Club {
  id: number;
  name: string;
  sport: string;
  location: string;
  logoUrl: string;
  bannerUrl: string;
  description: string;
  budgetMin: number;
  budgetMax: number;
  audienceAge: string;
  audienceGender: string;
  website: string;
  foundedYear: number;
}

export interface ClubMetrics {
  id: number;
  clubId: number;
  followers: number;
  engagementRate: number;
  reach: number;
  avgLikes: number;
  avgComments: number;
  growthPercent: number;
}

export interface SavedSearch {
  id: number;
  brandIdentity: string;
  name: string;
  filtersJson: string;
  createdAt: string;
}

export interface Deal {
  id: number;
  brandIdentity: string;
  clubId: number;
  status: string;
  amount: number;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  createdAt: string;
}

export interface Message {
  id: number;
  senderIdentity: string;
  receiverIdentity: string;
  dealId: number;
  content: string;
  timestamp: string;
  read: boolean;
}

export interface Filters {
  sport: string;
  location: string;
  budgetMin: number;
  budgetMax: number;
  query: string;
}

export interface ClubProfile {
  clubId: number;
  territory: string;
  purpose: string;
  activationObjectives: string[];
  contentPillars: string[];
  targetAudiences: string[];
}
