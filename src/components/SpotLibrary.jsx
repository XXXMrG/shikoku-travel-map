import React from 'react';
import { extraSpots, prefectures } from '../content/travelData.js';
import { spotImages } from '../content/spotImages.js';
import { imageSource } from '../utils/images.js';

export function SpotLibrary({ onSpot }) {
  return <section className="spot-library" aria-label="四国景点池总览">
    <div className="dock-head"><b>四国景点池</b><span>不强行塞进 13 天；先按县域看位置和类型，再决定替换哪个主线日。</span></div>
    <div className="library-grid">
      {Object.values(prefectures).map(p => <article key={p.id}>
        <h3>{p.name}</h3>
        {extraSpots.filter(s => s.region === p.id).map(s => {
          const cover = spotImages[s.id]?.[0];
          return <button key={s.id} onClick={() => onSpot(s)}>
            {cover && <img src={imageSource(cover.src)} alt={`${s.name}参考图`} loading="lazy" />}
            <b>{s.name}</b><span>{s.label} · {s.days}</span>
          </button>;
        })}
      </article>)}
    </div>
  </section>;
}
