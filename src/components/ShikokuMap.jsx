import React from 'react';
import { markerPositions, prefecturePaths, shikokuViewBox } from '../content/mapPaths.js';
import { extraSpots, prefectures, routeSpots } from '../content/travelData.js';
import { activateWithKeyboard } from '../utils/a11y.js';

export function ShikokuMap({ selectedRegion, selectedSpot, onRegion, onSpot }) {
  const routeLine = ['takamatsu', 'kotohira', 'iya', 'kochi', 'shimanto', 'ozu', 'matsuyama']
    .map(id => `${markerPositions[id].x},${markerPositions[id].y}`).join(' ');
  const visibleExtras = extraSpots.filter(s => s.region === selectedRegion);

  return <section className="real-map-card" aria-label="真实四国地图攻略">
    <div className="map-status"><b>当前查看</b><span>{selectedSpot?.name || prefectures[selectedRegion].name}</span></div>
    <svg viewBox={shikokuViewBox} role="img" aria-label="四国真实轮廓交互地图">
      <defs>
        <filter id="landShadow"><feDropShadow dx="0" dy="12" stdDeviation="10" floodColor="#1f2a25" floodOpacity=".14"/></filter>
        <radialGradient id="seaGlow" cx="54%" cy="38%" r="72%"><stop stopColor="#eef5f2"/><stop offset="1" stopColor="#dbe8e4"/></radialGradient>
      </defs>
      <rect width="760" height="520" rx="28" fill="url(#seaGlow)" />
      <text x="512" y="38" className="sea-label">瀬户内海</text>
      <text x="590" y="482" className="sea-label">太平洋</text>
      <g className="map-content" transform="translate(-48 -18) scale(1.05)">
        <g filter="url(#landShadow)">
          {Object.values(prefectures).map(p => {
            const select = () => onRegion(p.id);
            return <path key={p.id} d={prefecturePaths[p.id]} fill={p.tone} className={`prefecture-shape ${selectedRegion === p.id ? 'active' : ''}`} role="button" tabIndex="0" aria-label={p.name} onMouseDown={(event) => event.preventDefault()} onClick={select} onKeyDown={(event) => activateWithKeyboard(event, select)} />;
          })}
        </g>
        <polyline className="main-route-line" points={routeLine} />
        {routeSpots.map(s => {
          const p = markerPositions[s.id];
          const select = () => onSpot(s);
          return <g key={s.id} className={`spot-marker ${selectedSpot?.id === s.id ? 'active' : ''} ${s.type}`} transform={`translate(${p.x} ${p.y})`} role="button" tabIndex="0" aria-label={s.name} onMouseDown={(event) => event.preventDefault()} onClick={select} onKeyDown={(event) => activateWithKeyboard(event, select)}>
            <circle className="hit-area" r="22" />
            <circle className="spot-dot" r={s.type === 'core' ? 10 : 7} />
            <text x={s.dx} y={s.dy}>{s.name}</text>
          </g>;
        })}
        {visibleExtras.map(s => {
          const select = () => onSpot(s);
          return <g key={s.id} className={`attraction-marker ${selectedSpot?.id === s.id ? 'active' : ''} ${s.type}`} transform={`translate(${s.x} ${s.y})`} role="button" tabIndex="0" aria-label={s.name} onMouseDown={(event) => event.preventDefault()} onClick={select} onKeyDown={(event) => activateWithKeyboard(event, select)}>
            <circle className="hit-area" r="15" />
            <circle className="attraction-dot" r="4.5" />
            <text x="8" y="-8">{s.name}</text>
          </g>;
        })}
      </g>
      <text x="32" y="496" className="source-label">县域轮廓来自 GeoJSON；小点显示当前县景点池，点位为攻略决策定位</text>
    </svg>
  </section>;
}
