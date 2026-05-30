import { markerPositions, prefecturePaths, shikokuViewBox } from '@/content/mapPaths';
import { extraSpots, prefectures, routeSpots } from '@/content/travelData';
import type { RegionId, Spot } from '@/content/types';
import { activateWithKeyboard } from '@/utils/a11y';

type ShikokuMapProps = {
  selectedRegion: RegionId;
  selectedSpot: Spot | null;
  onRegion: (region: RegionId) => void;
  onSpot: (spot: Spot) => void;
};

export function ShikokuMap({ selectedRegion, selectedSpot, onRegion, onSpot }: ShikokuMapProps) {
  const routeLine = ['takamatsu', 'kotohira', 'iya', 'kochi', 'shimanto', 'ozu', 'matsuyama']
    .map(id => `${markerPositions[id].x},${markerPositions[id].y}`)
    .join(' ');
  const visibleExtras = extraSpots.filter(spot => spot.region === selectedRegion);

  return (
    <section className="real-map-card relative h-[min(76vh,860px)] min-h-[680px] overflow-hidden rounded-[1.4rem] border border-primary/[0.15] bg-[#edf4f0] max-lg:h-[560px] max-lg:min-h-[560px] max-sm:h-[510px] max-sm:min-h-[510px]" aria-label="真实四国地图攻略">
      <div className="pointer-events-none absolute left-4 top-4 z-10 flex items-center gap-2 rounded-full border border-white/80 bg-card/80 px-3 py-2 shadow-sm backdrop-blur-md max-sm:left-3 max-sm:top-3 max-sm:px-2.5 max-sm:py-1.5">
        <b className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground">当前查看</b>
        <span className="text-sm font-extrabold text-primary">{selectedSpot?.name || prefectures[selectedRegion].name}</span>
      </div>
      <svg viewBox={shikokuViewBox} role="img" aria-label="四国真实轮廓交互地图">
        <defs>
          <filter id="landShadow"><feDropShadow dx="0" dy="12" stdDeviation="10" floodColor="#1f2a25" floodOpacity=".14" /></filter>
          <radialGradient id="seaGlow" cx="54%" cy="38%" r="72%"><stop stopColor="#eef5f2" /><stop offset="1" stopColor="#dbe8e4" /></radialGradient>
        </defs>
        <rect width="760" height="520" rx="28" fill="url(#seaGlow)" />
        <text x="512" y="38" className="sea-label">瀬户内海</text>
        <text x="590" y="482" className="sea-label">太平洋</text>
        <g className="map-content" transform="translate(-48 -18) scale(1.05)">
          <g filter="url(#landShadow)">
            {Object.values(prefectures).map(region => {
              const select = () => onRegion(region.id);
              return (
                <path
                  key={region.id}
                  d={prefecturePaths[region.id]}
                  fill={region.tone}
                  className={`prefecture-shape ${selectedRegion === region.id ? 'active' : ''}`}
                  role="button"
                  tabIndex={0}
                  aria-label={region.name}
                  onMouseDown={event => event.preventDefault()}
                  onClick={select}
                  onKeyDown={event => activateWithKeyboard(event, select)}
                />
              );
            })}
          </g>
          <polyline className="main-route-line" points={routeLine} />
          {routeSpots.map(spot => {
            const point = markerPositions[spot.id];
            const select = () => onSpot(spot);
            return (
              <g
                key={spot.id}
                className={`spot-marker ${selectedSpot?.id === spot.id ? 'active' : ''} ${spot.type}`}
                transform={`translate(${point.x} ${point.y})`}
                role="button"
                tabIndex={0}
                aria-label={spot.name}
                onMouseDown={event => event.preventDefault()}
                onClick={select}
                onKeyDown={event => activateWithKeyboard(event, select)}
              >
                <circle className="hit-area" r={22} />
                <circle className="spot-dot" r={spot.type === 'core' ? 10 : 7} />
                <text x={spot.dx} y={spot.dy}>{spot.name}</text>
              </g>
            );
          })}
          {visibleExtras.map(spot => {
            const select = () => onSpot(spot);
            return (
              <g
                key={spot.id}
                className={`attraction-marker ${selectedSpot?.id === spot.id ? 'active' : ''} ${spot.type}`}
                transform={`translate(${spot.x} ${spot.y})`}
                role="button"
                tabIndex={0}
                aria-label={spot.name}
                onMouseDown={event => event.preventDefault()}
                onClick={select}
                onKeyDown={event => activateWithKeyboard(event, select)}
              >
                <title>{spot.name}</title>
                <circle className="hit-area" r={10} />
                <circle className="attraction-dot" r={4.5} />
                {selectedSpot?.id === spot.id && <text x="8" y="-8">{spot.name}</text>}
              </g>
            );
          })}
        </g>
        <text x="32" y="496" className="source-label">县域轮廓来自 GeoJSON；小点显示当前县景点池，点位为攻略决策定位</text>
      </svg>
    </section>
  );
}
