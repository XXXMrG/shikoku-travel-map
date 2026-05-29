import React from 'react';
import { allSpots, routeDays, variants } from '../content/travelData.js';

export function RouteDock({ saved, onSpot }) {
  const keepNames = Object.entries(saved)
    .filter(([, value]) => value === 'keep')
    .map(([id]) => allSpots.find(s => s.id === id)?.name)
    .filter(Boolean);

  return <>
    <section className="route-dock" aria-label="13天路线简表">
      <div className="dock-head"><b>13 天骨架</b><span>{keepNames.length ? `已标记保留：${keepNames.join('、')}` : '建议先保留骨架，再从景点池替换：鸣门、仁淀、岛波海道都需要换出时间'}</span></div>
      <div className="day-rail">{routeDays.map(day => <button key={day.d} onClick={() => onSpot(allSpots.find(s => s.id === day.spot))} title={day.note}><b>{day.d}</b><span>{day.t}</span></button>)}</div>
    </section>

    <section className="variant-dock" aria-label="分支提醒">
      {variants.map(([name, text]) => <article key={name}><b>{name}</b><span>{text}</span></article>)}
    </section>
  </>;
}
