import React from 'react';
import { prefectures } from '../content/travelData.js';

export function RegionNav({ selectedRegion, onRegion }) {
  return <div className="region-nav" aria-label="四国县域切换">
    {Object.values(prefectures).map(p => <button key={p.id} className={selectedRegion === p.id ? 'active' : ''} onClick={() => onRegion(p.id)}>
      <b>{p.name}</b><span>{p.mood}</span>
    </button>)}
  </div>;
}
