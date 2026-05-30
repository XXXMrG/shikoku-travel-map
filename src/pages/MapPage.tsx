import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AttractionPicker } from '@/components/AttractionPicker';
import { DetailPanel } from '@/components/DetailPanel';
import { RegionNav } from '@/components/RegionNav';
import { RouteDock } from '@/components/RouteDock';
import { ShikokuMap } from '@/components/ShikokuMap';
import { SiteHeader } from '@/components/SiteHeader';
import { SpotLibrary } from '@/components/SpotLibrary';
import { Card } from '@/components/ui/card';
import { allSpots, prefectures } from '@/content/travelData';
import type { DecisionValue, DetailTabId, RegionId, Spot } from '@/content/types';
import { useLocalDecision } from '@/utils/useLocalDecision';

type MapSelection = {
  region: RegionId;
  spot: Spot | null;
};

function isRegionId(value: string | null): value is RegionId {
  return Boolean(value && value in prefectures);
}

function findSpot(value: string | null): Spot | null {
  return allSpots.find(spot => spot.id === value) ?? null;
}

function selectionFromSearch(searchParams: URLSearchParams): MapSelection {
  const spot = findSpot(searchParams.get('spot'));
  if (spot) return { region: spot.region, spot };

  const regionParam = searchParams.get('region');
  return { region: isRegionId(regionParam) ? regionParam : 'kagawa', spot: null };
}

export function MapPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSelection = selectionFromSearch(searchParams);
  const [selectedRegion, setSelectedRegion] = useState<RegionId>(initialSelection.region);
  const [selectedSpot, setSelectedSpot] = useState<Spot | null>(initialSelection.spot);
  const [activeTab, setActiveTab] = useState<DetailTabId>('overview');
  const [saved, setSaved] = useLocalDecision();
  const region = prefectures[selectedRegion];

  useEffect(() => {
    const next = selectionFromSearch(searchParams);
    setSelectedRegion(next.region);
    setSelectedSpot(next.spot);
    setActiveTab('overview');
  }, [searchParams]);

  const writeSelection = (next: MapSelection) => {
    const params = new URLSearchParams();
    params.set('region', next.region);
    if (next.spot) params.set('spot', next.spot.id);
    setSearchParams(params, { replace: true });
  };

  const saveDecision = (id: string, value: DecisionValue) => setSaved(prev => ({ ...prev, [id]: value }));
  const selectRegion = (id: RegionId) => {
    setSelectedRegion(id);
    setSelectedSpot(null);
    setActiveTab('overview');
    writeSelection({ region: id, spot: null });
  };
  const selectSpot = (item: Spot | null | undefined) => {
    if (!item) return;
    setSelectedSpot(item);
    setSelectedRegion(item.region);
    setActiveTab('overview');
    writeSelection({ region: item.region, spot: item });
  };

  return (
    <main className="page-shell">
      <SiteHeader page="map" />

      <Card className="grid grid-cols-[minmax(280px,0.8fr)_minmax(360px,1.2fr)] items-end gap-7 rounded-[1.75rem] p-[clamp(1.4rem,3vw,2.5rem)] max-lg:grid-cols-1 max-lg:gap-4">
        <div>
          <p className="eyebrow mb-2">Personal travel atlas</p>
          <h2 className="m-0 text-[clamp(1.9rem,3.8vw,3.9rem)] font-semibold leading-[1.12] tracking-[0.01em] max-md:text-[clamp(1.9rem,8vw,2.65rem)]">
            <span className="block">地图单独放大，</span><span className="block">景点用图片判断。</span>
          </h2>
        </div>
        <p className="m-0 text-[clamp(0.95rem,1.15vw,1.125rem)] leading-8 text-stone-700">
          <span className="block">主线保留轻松骨架，地图区独立成大画布。</span>
          <span className="block">景点池按县域切换，点位不再挤在侧栏里。</span>
          <span className="block">图片关系已拆成独立数据层；完整图集在“景点图片”页按景点核对。</span>
        </p>
      </Card>

      <Card className="mt-3 rounded-[1.75rem] p-[clamp(0.75rem,1.4vw,1.25rem)]" aria-label="四国大地图">
        <div className="mb-3 grid grid-cols-[minmax(300px,0.75fr)_minmax(520px,1.25fr)] items-center gap-4 max-xl:grid-cols-1">
          <div>
            <b className="block text-lg text-primary">四国大地图</b>
            <span className="mt-1 block text-[13.5px] leading-6 text-muted-foreground">先选县域，再点地图小点；当前只显示该县景点池，避免全岛点位混成一团。</span>
          </div>
          <RegionNav selectedRegion={selectedRegion} onRegion={selectRegion} />
        </div>
        <ShikokuMap selectedRegion={selectedRegion} selectedSpot={selectedSpot} onRegion={selectRegion} onSpot={selectSpot} />
      </Card>

      <section className="mt-3 grid grid-cols-[360px_minmax(0,1fr)] items-start gap-3.5 max-xl:grid-cols-1" aria-label="景点详情与图片">
        <AttractionPicker regionId={selectedRegion} selectedSpot={selectedSpot} onSpot={selectSpot} />
        <DetailPanel region={region} spot={selectedSpot} tab={activeTab} onTab={setActiveTab} saved={saved} onSave={saveDecision} />
      </section>

      <RouteDock saved={saved} onSpot={selectSpot} />
      <SpotLibrary onSpot={selectSpot} />
    </main>
  );
}
