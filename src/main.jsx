import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { markerPositions, prefecturePaths, shikokuViewBox } from './mapPaths.js';
import './styles.css';

const A = '/assets/';

const prefectures = {
  kagawa: {
    id: 'kagawa', name: '香川', kana: 'Kagawa', mood: '入口 / 庭园 / 瀬户内跳岛', tone: '#7aa876',
    summary: '高松是这趟四国的慢启动和瀬户内枢纽：栗林公园、高松港、小豆岛、直岛/丰岛分支都从这里展开。',
    stay: '高松港 / 北滨 / 片原町 / 瓦町；跳岛旺季可改住宇野。',
    image: 'shikoku_02_Ritsurin_bdd6995a.jpg',
    keep: ['高松 3 晚', '栗林公园半天', '小豆岛一日慢渡轮', '琴平作为进山缓冲'],
    avoid: ['不要小豆岛一天追全岛', '不要艺术祭期间临时订船票/美术馆', '不要把高屋神社塞进疲劳日']
  },
  tokushima: {
    id: 'tokushima', name: '德岛', kana: 'Tokushima', mood: '山谷 / 降噪 / 祖谷三晚', tone: '#5f8fa2',
    summary: '祖谷/大步危是整条线的核心，不是“顺路景点”。这里负责真正断网、进山、降噪。',
    stay: '祖谷古民家、山间温泉、大步危周边；晚餐、接送、末班车必须提前确认。',
    image: 'shikoku_06_Iya_6ef748b6.jpg',
    keep: ['祖谷 / 大步危 3 晚', '大步危峡短船或河谷散步', '西祖谷藤桥', '山间温泉 / 古民家住宿'],
    avoid: ['不要压缩成一晚', '不要不查巴士就进山', '国庆当天不要回城市人堆']
  },
  kochi: {
    id: 'kochi', name: '高知', kana: 'Kochi', mood: '南国小城 / 四万十清流', tone: '#d49a62',
    summary: '高知市只是补给点；四万十才是后半段主角。足摺岬、柏岛很强，但不塞进 13 天主线。',
    stay: '高知市一晚补给；中村/四万十河边两晚，优先河边 cottage 或安静旅宿。',
    image: 'shikoku_10_Shimanto_e5151e9b.jpg',
    keep: ['高知市轻逛一晚', '四万十川 2 晚', '沉下桥', '屋形船 / 独木舟 / SUP 半日'],
    avoid: ['不要把足摺岬、柏岛、大堂海岸全塞一天', '不要周末才订四万十活动', '不要高知市内排满']
  },
  ehime: {
    id: 'ehime', name: '爱媛', kana: 'Ehime', mood: '城下町 / 老街 / 温泉收束', tone: '#c6a058',
    summary: '大洲/内子负责温柔收束；道后温泉是可选强化，不应盖过小城町家体验。',
    stay: '大洲 / 内子町家两晚优先；如果想温泉打卡，可把最后一晚改松山 / 道后。',
    image: 'shikoku_11_Ozu_castle_town_Hijikawa_river_Ehime_2029096e.jpg',
    keep: ['大洲 / 内子 2 晚', '大洲城下町与肱川', '内子座、町家、蜡烛/和纸', '返程日保持缓冲'],
    avoid: ['最后两天不要远征', '不要为了道后删大洲/内子', '返程日不要加重景点']
  }
};

const spots = [
  { id:'takamatsu', region:'kagawa', name:'高松', type:'base', label:'主基地', note:'入口、栗林公园、高松港、北滨，跳岛前站。', days:'D1–D3', dx:14, dy:-12 },
  { id:'shodoshima', region:'kagawa', name:'小豆岛', type:'island', label:'海岛慢日', note:'酱油、橄榄、海边咖啡三选二到三；一天别追全岛。', days:'D3', dx:12, dy:-10 },
  { id:'kotohira', region:'kagawa', name:'琴平', type:'buffer', label:'进山缓冲', note:'参道与温泉缓冲，进入祖谷前降速。', days:'D4', dx:15, dy:18 },
  { id:'iya', region:'tokushima', name:'祖谷 / 大步危', type:'core', label:'核心', note:'整条线降噪核心，3晚，不要压缩。', days:'D5–D7', dx:14, dy:-14 },
  { id:'kochi', region:'kochi', name:'高知', type:'supply', label:'补给', note:'南国小城补给，轻逛即可。', days:'D8', dx:15, dy:14 },
  { id:'shimanto', region:'kochi', name:'四万十川', type:'core', label:'清流', note:'后半段恢复日，沉下桥与半日水上活动。', days:'D9–D10', dx:-86, dy:2 },
  { id:'ozu', region:'ehime', name:'大洲 / 内子', type:'finish', label:'收束', note:'城下町、町家、肱川，温柔收束。', days:'D11–D12', dx:-92, dy:1 },
  { id:'matsuyama', region:'ehime', name:'松山 / 道后', type:'onsen', label:'温泉可选', note:'温泉强化可选，不要盖过大洲/内子。', days:'D13 / 可选', dx:-102, dy:-4 },
  { id:'naoshima', region:'kagawa', name:'直岛 / 丰岛', type:'branch', label:'跳岛分支', note:'艺术岛需预约；跳岛期可改住宇野。', days:'分支', dx:-92, dy:-12 },
  { id:'takaya', region:'kagawa', name:'高屋神社', type:'optional', label:'体力点', note:'天空鸟居，强体力点；查登山道开放和交通。', days:'备选', dx:-84, dy:14 }
];

const routeDays = [
  ['D1','高松落地'], ['D2','栗林公园'], ['D3','小豆岛'], ['D4','琴平'], ['D5','进祖谷'], ['D6','西祖谷'], ['D7','祖谷留白'], ['D8','高知补给'], ['D9','四万十'], ['D10','清流整日'], ['D11','大洲/内子'], ['D12','町家小城'], ['D13','返程']
];

const variants = [
  ['瀬户内跳岛', '直岛/丰岛/小豆岛做独立分支，不掺进疗愈主线。'],
  ['温泉强化', '祖谷温泉保留；最后一晚才考虑松山/道后。'],
  ['高知西部', '足摺岬、柏岛作为素材池，不进入当前 13 天。']
];

function useLocalDecision() {
  const [saved, setSaved] = useState(() => {
    try { return JSON.parse(localStorage.getItem('shikoku-decisions') || '{}'); } catch { return {}; }
  });
  useEffect(() => { localStorage.setItem('shikoku-decisions', JSON.stringify(saved)); }, [saved]);
  return [saved, setSaved];
}

function ShikokuMap({ selectedRegion, selectedSpot, onRegion, onSpot }) {
  const routeLine = ['takamatsu','kotohira','iya','kochi','shimanto','ozu','matsuyama']
    .map(id => `${markerPositions[id].x},${markerPositions[id].y}`).join(' ');

  return <section className="real-map-card" aria-label="真实四国地图攻略">
    <svg viewBox={shikokuViewBox} role="img" aria-label="四国真实轮廓交互地图">
      <defs>
        <filter id="landShadow"><feDropShadow dx="0" dy="18" stdDeviation="12" floodColor="#3a2b1a" floodOpacity=".22"/></filter>
        <radialGradient id="seaGlow" cx="55%" cy="38%" r="70%"><stop stopColor="#eef8f5"/><stop offset="1" stopColor="#d9e9e5"/></radialGradient>
      </defs>
      <rect width="760" height="520" rx="34" fill="url(#seaGlow)" />
      <text x="508" y="38" className="sea-label">瀬户内海</text>
      <text x="590" y="482" className="sea-label">太平洋</text>
      <g filter="url(#landShadow)">
        {Object.values(prefectures).map(p => <path
          key={p.id}
          d={prefecturePaths[p.id]}
          fill={p.tone}
          className={`prefecture-shape ${selectedRegion === p.id ? 'active' : ''}`}
          role="button"
          tabIndex="0"
          aria-label={p.name}
          onClick={() => onRegion(p.id)}
        />)}
      </g>
      <polyline className="main-route-line" points={routeLine} />
      {spots.map(s => {
        const p = markerPositions[s.id];
        return <g key={s.id} className={`spot-marker ${selectedSpot?.id === s.id ? 'active' : ''} ${s.type}`} transform={`translate(${p.x} ${p.y})`} role="button" tabIndex="0" aria-label={s.name} onClick={() => onSpot(s)}>
          <circle r={s.type === 'core' ? 11 : 8} />
          <text x={s.dx} y={s.dy}>{s.name}</text>
        </g>;
      })}
      <text x="32" y="496" className="source-label">真实县域轮廓：Global Map Japan / dataofjapan，点位为攻略决策定位</text>
    </svg>
  </section>;
}

function DetailPanel({ region, spot, saved, onSave }) {
  const targetName = spot ? spot.name : region.name;
  return <aside className="detail-panel">
    <div className="photo"><img src={`${A}${region.image}`} alt={targetName} /></div>
    <div className="detail-kicker">{region.kana} · {spot ? spot.label : region.mood}</div>
    <h1>{targetName}</h1>
    <p className="summary">{spot ? spot.note : region.summary}</p>
    {spot && <div className="spot-meta"><b>{spot.days}</b><span>{prefectures[spot.region].name} · {spot.type}</span></div>}
    <div className="decision-row">
      <button className={saved[region.id] === 'keep' ? 'active' : ''} onClick={() => onSave(region.id, 'keep')}>想保留</button>
      <button className={saved[region.id] === 'maybe' ? 'active' : ''} onClick={() => onSave(region.id, 'maybe')}>待定</button>
      <button className={saved[region.id] === 'cut' ? 'active' : ''} onClick={() => onSave(region.id, 'cut')}>可删</button>
    </div>
    <div className="strategy-block"><b>住宿策略</b><p>{region.stay}</p></div>
    <div className="two-col">
      <div><b>保留</b>{region.keep.map(x => <span key={x}>{x}</span>)}</div>
      <div><b>避坑</b>{region.avoid.map(x => <span key={x}>{x}</span>)}</div>
    </div>
  </aside>;
}

function App() {
  const [selectedRegion, setSelectedRegion] = useState('kagawa');
  const [selectedSpot, setSelectedSpot] = useState(null);
  const [saved, setSaved] = useLocalDecision();
  const region = prefectures[selectedRegion];
  const saveDecision = (id, value) => setSaved(prev => ({ ...prev, [id]: value }));
  const selectRegion = (id) => { setSelectedRegion(id); setSelectedSpot(null); };
  const selectSpot = (spot) => { setSelectedSpot(spot); setSelectedRegion(spot.region); };
  const keepNames = Object.entries(saved).filter(([,v]) => v === 'keep').map(([id]) => prefectures[id]?.name).filter(Boolean);

  return <main className="map-page">
    <header className="map-topbar">
      <a className="brand" href="/">SHIKOKU PERSONAL MAP</a>
      <div className="top-summary">13 天疗愈主线 · 真实四国地图 · 只放决策信息</div>
    </header>

    <section className="map-shell">
      <div className="intro-card">
        <p className="eyebrow">四国地图攻略</p>
        <h2><span>点真实地图，</span><span>决定这一段</span><span>要不要去。</span></h2>
        <p className="intro-copy"><span>单独地图页。</span><span>点县域或地点，</span><span>看住宿、取舍、避坑。</span><span>路线和分支只留底部简表。</span></p>
      </div>

      <ShikokuMap selectedRegion={selectedRegion} selectedSpot={selectedSpot} onRegion={selectRegion} onSpot={selectSpot} />
      <DetailPanel region={region} spot={selectedSpot} saved={saved} onSave={saveDecision} />
    </section>

    <section className="route-dock" aria-label="13天路线简表">
      <div className="dock-head"><b>13 天骨架</b><span>{keepNames.length ? `已标记保留：${keepNames.join('、')}` : '建议优先保留：祖谷、四万十、大洲/内子'}</span></div>
      <div className="day-rail">{routeDays.map(([d,t]) => <button key={d} onClick={() => {
        const match = spots.find(s => t.includes(s.name.slice(0,2)) || (t.includes('祖谷') && s.id === 'iya') || (t.includes('四万十') && s.id === 'shimanto') || (t.includes('大洲') && s.id === 'ozu') || (t.includes('高松') && s.id === 'takamatsu') || (t.includes('小豆') && s.id === 'shodoshima') || (t.includes('琴平') && s.id === 'kotohira') || (t.includes('高知') && s.id === 'kochi'));
        if (match) selectSpot(match);
      }}><b>{d}</b><span>{t}</span></button>)}</div>
    </section>

    <section className="variant-dock" aria-label="分支提醒">
      {variants.map(([name, text]) => <article key={name}><b>{name}</b><span>{text}</span></article>)}
    </section>
  </main>;
}

createRoot(document.getElementById('root')).render(<App />);
