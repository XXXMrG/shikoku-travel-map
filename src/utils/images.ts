import type { Prefecture, Spot } from '@/content/types';
import { regionGallerySeeds } from '@/content/travelData';
import { spotImages } from '@/content/spotImages';

const ASSET_ROOT = '/assets/';

export function imageSource(src?: string): string {
  if (!src) return '';
  return src.startsWith('http') || src.startsWith('/') ? src : `${ASSET_ROOT}${src}`;
}

export function galleryFor(target: Spot | null | undefined, region: Prefecture) {
  if (target?.id && spotImages[target.id]?.length) return spotImages[target.id];
  const seedIds = regionGallerySeeds[region.id] || [];
  const images = seedIds.flatMap(id => spotImages[id] || []);
  if (images.length) return images.slice(0, 4);
  return [{ src: `${ASSET_ROOT}${region.image}`, caption: region.name, source: '' }];
}

export function galleryCount(spotId: string): number {
  return spotImages[spotId]?.length || 0;
}
