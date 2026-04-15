import type { SponsorshipAsset, NegotiationEvent, ClubProfile, Deal, Message } from './types';
import { clubProfiles, deals, messages, sponsorshipAssets, negotiationEvents } from './stores.svelte';

export function updateClubProfile(clubId: number, updates: Partial<Omit<ClubProfile, 'clubId'>>): boolean {
  const profile = clubProfiles.get(clubId);
  if (!profile) return false;
  const updated = { ...profile, ...updates };
  clubProfiles.set(clubId, updated);
  return true;
}

interface CreateAssetInput {
  clubId: number;
  name: string;
  description: string;
  price: number;
  pricePeriod: string;
  category: string;
  tags: string[];
}

export function createAsset(input: CreateAssetInput): SponsorshipAsset {
  const maxId = sponsorshipAssets.reduce((max, a) => Math.max(max, a.id), 0);
  const asset: SponsorshipAsset = {
    id: maxId + 1,
    ...input,
    available: true,
  };
  sponsorshipAssets.push(asset);
  return asset;
}

export function updateAsset(assetId: number, updates: Partial<Omit<SponsorshipAsset, 'id' | 'clubId'>>): boolean {
  const asset = sponsorshipAssets.find(a => a.id === assetId);
  if (!asset) return false;
  Object.assign(asset, updates);
  return true;
}

export function deleteAsset(assetId: number): boolean {
  const index = sponsorshipAssets.findIndex(a => a.id === assetId);
  if (index === -1) return false;
  sponsorshipAssets.splice(index, 1);
  return true;
}

export function toggleAssetAvailability(assetId: number): boolean {
  const asset = sponsorshipAssets.find(a => a.id === assetId);
  if (!asset) return false;
  asset.available = !asset.available;
  return true;
}

export function getClubAssets(clubId: number): SponsorshipAsset[] {
  return sponsorshipAssets.filter(a => a.clubId === clubId);
}

export function getClubDeals(clubId: number): Deal[] {
  return deals.filter(d => d.clubId === clubId);
}

export function respondToDeal(dealId: number, response: 'accepted' | 'rejected' | 'counter', description: string): boolean {
  const deal = deals.find(d => d.id === dealId);
  if (!deal) return false;

  if (response === 'accepted') {
    deal.status = 'aceptado';
  } else if (response === 'rejected') {
    deal.status = 'rechazado';
  }

  addNegotiationEvent(dealId, response, description);
  return true;
}

export function addNegotiationEvent(dealId: number, type: NegotiationEvent['type'], description: string): NegotiationEvent {
  const maxId = negotiationEvents.reduce((max, e) => Math.max(max, e.id), 0);
  const event: NegotiationEvent = {
    id: maxId + 1,
    dealId,
    type,
    description,
    timestamp: new Date().toISOString(),
  };
  negotiationEvents.push(event);
  return event;
}

export function sendClubMessage(clubId: number, receiverIdentity: string, dealId: number, content: string): Message {
  const maxId = messages.reduce((max, m) => Math.max(max, m.id), 0);
  const msg: Message = {
    id: maxId + 1,
    senderIdentity: `club${clubId}`,
    receiverIdentity,
    dealId,
    content,
    timestamp: new Date().toISOString(),
    read: false,
  };
  messages.push(msg);
  return msg;
}
