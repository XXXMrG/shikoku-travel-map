import React from 'react';
import { useState } from 'react';
import { AttractionPicker } from '../components/AttractionPicker.jsx';
import { DetailPanel } from '../components/DetailPanel.jsx';
import { RegionNav } from '../components/RegionNav.jsx';
import { RouteDock } from '../components/RouteDock.jsx';
import { ShikokuMap } from '../components/ShikokuMap.jsx';
import { SiteHeader } from '../components/SiteHeader.jsx';
import { SpotLibrary } from '../components/SpotLibrary.jsx';
import { prefectures } from '../content/travelData.js';
import { useLocalDecision } from '../utils/useLocalDecision.js';

export function MapPage() {
  const [selectedRegion, setSelectedRegion] = useState('kagawa');
  const [selectedSpot, setSelectedSpot] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [saved, setSaved] = useLocalDecision();
  const region = prefectures[selectedRegion];

  const saveDecision = (id, value) => setSaved(prev => ({ ...prev, [id]: value }));
  const selectRegion = (id) => { setSelectedRegion(id); setSelectedSpot(null); setActiveTab('overview'); };
  const selectSpot = (item) => { if (!item) return; setSelectedSpot(item); setSelectedRegion(item.region); setActiveTab('overview'); };

  return <main className="map-page">
    <SiteHeader page="map" />

    <section className="atlas-intro">
      <div>
        <p className="eyebrow">Personal travel atlas</p>
        <h2><span>地图单独放大，</span><span>景点用图片判断。</span></h2>
      </div>
      <p className="intro-copy"><span>主线保留轻松骨架，地图区独立成大画布。</span><span>景点池按县域切换，点位不再挤在侧栏里。</span><span>图片关系已拆成独立数据层；完整图集在“景点图片”页按景点核对。</span></p>
    </section>

    <section className="map-stage" aria-label="四国大地图">
      <div className="map-stage-head">
        <div><b>四国大地图</b><span>先选县域，再点地图小点；当前只显示该县景点池，避免全岛点位混成一团。</span></div>
        <RegionNav selectedRegion={selectedRegion} onRegion={selectRegion} />
      </div>
      <ShikokuMap selectedRegion={selectedRegion} selectedSpot={selectedSpot} onRegion={selectRegion} onSpot={selectSpot} />
    </section>

    <section className="detail-workbench" aria-label="景点详情与图片">
      <AttractionPicker regionId={selectedRegion} selectedSpot={selectedSpot} onSpot={selectSpot} />
      <DetailPanel region={region} spot={selectedSpot} tab={activeTab} onTab={setActiveTab} saved={saved} onSave={saveDecision} />
    </section>

    <RouteDock saved={saved} onSpot={selectSpot} />
    <SpotLibrary onSpot={selectSpot} />
  </main>;
}
