import { regionGallerySeeds } from '../content/travelData.js';
import { spotImages } from '../content/spotImages.js';

const A = '/assets/';

export function imageSource(src) {
  if (!src) return '';
  return src.startsWith('http') || src.startsWith('/') ? src : `${A}${src}`;
}

export function galleryFor(target, region) {
  if (target?.id && spotImages[target.id]?.length) return spotImages[target.id];
  const seedIds = regionGallerySeeds[region.id] || [];
  const images = seedIds.flatMap(id => spotImages[id] || []);
  if (images.length) return images.slice(0, 4);
  return [{ src: `${A}${region.image}`, caption: region.name, source: '' }];
}

export function galleryCount(spotId) {
  return spotImages[spotId]?.length || 0;
}
