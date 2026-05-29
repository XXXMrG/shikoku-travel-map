import React from 'react';
import { extraSpots, prefectures } from '../content/travelData.js';

export function AttractionPicker({ regionId, selectedSpot, onSpot }) {
  const items = extraSpots.filter(s => s.region === regionId);
  return <div className="picker-card">
    <b>{prefectures[regionId].name}景点池</b>
    <span>{items.length} 个可选点位，点击后地图和右侧详情同步。</span>
    <div className="picker-list">
      {items.map(s => <button key={s.id} className={selectedSpot?.id === s.id ? 'active' : ''} onClick={() => onSpot(s)} title={s.details.overview[0]}>{s.name}</button>)}
    </div>
  </div>;
}
