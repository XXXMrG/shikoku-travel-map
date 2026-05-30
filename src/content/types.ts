export type RegionId = 'kagawa' | 'tokushima' | 'kochi' | 'ehime';

export type DetailTabId = 'overview' | 'plan' | 'traffic' | 'stay' | 'rules';

export type DetailContent = Record<DetailTabId, string[]>;

export interface Prefecture {
  id: RegionId;
  name: string;
  kana: string;
  mood: string;
  tone: string;
  image: string;
  summary: string;
  details: DetailContent;
  keep: string[];
  avoid: string[];
}

export interface Spot {
  id: string;
  region: RegionId;
  name: string;
  type: string;
  label: string;
  days: string;
  x: number;
  y: number;
  dx: number;
  dy: number;
  details: DetailContent;
  source: string;
}

export interface RouteDay {
  d: string;
  t: string;
  spot: string;
  note: string;
}

export interface GalleryImage {
  src: string;
  caption: string;
  source: string;
}

export interface MapPoint {
  x: number;
  y: number;
}

export type DecisionValue = 'keep' | 'maybe' | 'cut';
export type DecisionMap = Partial<Record<string, DecisionValue>>;
