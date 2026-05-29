import React, { useMemo, useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

const A = '/assets/';

const prefectures = {
  kagawa: {
    id: 'kagawa', name: '香川', kana: 'Kagawa', mood: '入口 / 庭园 / 瀬户内跳岛', tone: '#4f7c68',
    summary: '高松是慢启动与跳岛枢纽；栗林公园、小豆岛、直岛/丰岛分支都从这里展开。',
    stay: '高松港 / 北滨 / 片原町 / 瓦町；跳岛旺季可改住宇野。',
    image: 'shikoku_02_Ritsurin_bdd6995a.jpg',
    must: ['栗林公园半天慢逛', '高松港 / 北滨 Alley', '小豆岛酱油、橄榄、海边咖啡', '琴平作为进山前缓冲'],
    avoid: ['跳岛期死守高松住宿', '小豆岛一天追全岛', '艺术祭期间临时订美术馆/船票'],
    spots: ['高松', '栗林公园', '小豆岛', '琴平', '直岛 / 丰岛分支', '高屋神社备选']
  },
  tokushima: {
    id: 'tokushima', name: '德岛', kana: 'Tokushima', mood: '山谷 / 降噪 / 祖谷三晚', tone: '#406f81',
    summary: '祖谷/大步危是整条四国线的核心，不要被艺术岛分支稀释。这里负责真正“断网降噪”。',
    stay: '祖谷古民家、山间温泉、大步危周边；晚餐和接送必须提前确认。',
    image: 'shikoku_06_Iya_6ef748b6.jpg',
    must: ['大步危峡短船或河谷散步', '西祖谷藤桥', '山间温泉 / 古民家住宿', '奥祖谷只作为体力好时的可选项'],
    avoid: ['不查巴士时刻就进山', '晚上临时找饭', '国庆当天跑回城市人堆'],
    spots: ['祖谷', '大步危', '藤桥', '奥祖谷可选', '阿波池田转乘']
  },
  kochi: {
    id: 'kochi', name: '高知', kana: 'Kochi', mood: '南国小城 / 四万十清流 / 海岬素材池', tone: '#b17449',
    summary: '高知市是补给点，四万十是后半段主角。足摺岬、柏岛很强，但不要全塞进13天主线。',
    stay: '高知市一晚补给；中村/四万十河边两晚，优先河边 cottage 或安静旅宿。',
    image: 'shikoku_10_Shimanto_e5151e9b.jpg',
    must: ['高知轻逛：高知城外观 / ひろめ市场 / 竹林寺三选一', '四万十沉下桥', '屋形船 / 独木舟 / SUP 半日', '雨天河边看雨也成立'],
    avoid: ['把足摺岬、柏岛、大堂海岸全塞一天', '周末不预订四万十活动', '高知市内排满导致第二天转场疲劳'],
    spots: ['高知市', '四万十川', '佐田沉下桥', '竹林寺 / 牧野植物园', '足摺岬备选']
  },
  ehime: {
    id: 'ehime', name: '爱媛', kana: 'Ehime', mood: '城下町 / 老街 / 温泉收束', tone: '#9a6b35',
    summary: '大洲/内子负责温柔收束；道后温泉是强打卡点，但不应盖过小城町家体验。',
    stay: '大洲 / 内子町家两晚优先；如果想温泉打卡，可把最后一晚改松山 / 道后。',
    image: 'shikoku_11_Ozu_castle_town_Hijikawa_river_Ehime_2029096e.jpg',
    must: ['大洲城下町与肱川', '内子座、町家、蜡烛/和纸', '松山/道后温泉作为可选强化', '返程日保持缓冲'],
    avoid: ['最后两天还长距离远征', '把道后温泉排得太满', '返程日加重景点'],
    spots: ['大洲', '内子', '松山', '道后温泉可选', '宇和岛转场']
  }
};

const routeDays = [
  { day: 'D1', date: '9/25 周五', base: '高松 1/3', region: 'kagawa', title: '杭州出发 → 进四国', plan: '只落地、补给、吃乌冬或骨付鸟，早点睡。', tip: '如果关西落地太晚，允许机场/冈山过夜，别硬赶。' },
  { day: 'D2', date: '9/26 周六', base: '高松 2/3', region: 'kagawa', title: '栗林公园 + 高松港 / 北滨', plan: '早去栗林公园，走一段、坐一会、喝茶；下午港口散步。', tip: '截图补充：掬月亭、飞来峰、偃月桥、芙蓉峰、游船/茶席都值得，但别赶。' },
  { day: 'D3', date: '9/27 周日', base: '高松 3/3', region: 'kagawa', title: '小豆岛一日慢渡轮', plan: '酱油之乡、橄榄公园、海边咖啡三选二到三；Angel Road 潮汐顺路再看。', tip: '小豆岛很大，一天不要追全岛。' },
  { day: 'D4', date: '9/28 周一', base: '琴平', region: 'kagawa', title: '琴平参道与温泉缓冲', plan: '金刀比罗宫参道慢走，体力好到本宫；下午泡汤。', tip: '这天的作用是给祖谷进山前降速，不是冲台阶成绩。' },
  { day: 'D5', date: '9/29 周二', base: '祖谷/大步危 1/3', region: 'tokushima', title: '进入祖谷山谷', plan: '铁路 + 巴士/出租车进山，只安排大步危短船或旅宿周边散步。', tip: '提前确认接送、晚餐、末班车。' },
  { day: 'D6', date: '9/30 周三', base: '祖谷/大步危 2/3', region: 'tokushima', title: '西祖谷低强度日', plan: '藤桥、集落、温泉；不深入追车。', tip: '9/30 不适合硬冲奥祖谷深处，以当年时刻表为准。' },
  { day: 'D7', date: '10/1 周四', base: '祖谷/大步危 3/3', region: 'tokushima', title: '祖谷深呼吸日', plan: '国庆当天躲在山谷。体力好再奥祖谷，否则完全不动。', tip: '这是整条路线的降噪日，不要拿来补打卡。' },
  { day: 'D8', date: '10/2 周五', base: '高知', region: 'kochi', title: '出山 → 高知补给', plan: '中午前后离开祖谷，下午到高知；高知城外观、ひろめ市场、竹林寺三选一。', tip: '这是交通日，不安排远景点。' },
  { day: 'D9', date: '10/3 周六', base: '四万十/中村 1/2', region: 'kochi', title: '抵达四万十清流地带', plan: '高知到四万十，下午河边散步、订第二天半日活动。', tip: '周末活动和河边住宿要提前订。' },
  { day: 'D10', date: '10/4 周日', base: '四万十/中村 2/2', region: 'kochi', title: '四万十川整日恢复', plan: '沉下桥、屋形船/独木舟/SUP、河边骑行；下午留白。', tip: '只预约半日活动，别把清流日变成赶路。' },
  { day: 'D11', date: '10/5 周一', base: '大洲/内子 1/2', region: 'ehime', title: '四万十 → 大洲 / 内子', plan: '长转场日，晚上住老街或町家。', tip: '宇和岛只是转场可能，不要额外加重。' },
  { day: 'D12', date: '10/6 周二', base: '大洲/内子 2/2', region: 'ehime', title: '町家、剧场、肱川', plan: '内子座、町家、蜡烛/和纸、大洲肱川，小城咖啡慢收束。', tip: '人文浓度最高的一天，不赶去松山热门区。' },
  { day: 'D13', date: '10/7 周三', base: '返程', region: 'ehime', title: '松山/冈山/关西返程', plan: '只返程，最多松山短暂停留。', tip: '预留国际航班缓冲。' }
];

const markers = [
  { id:'takamatsu', region:'kagawa', x:57, y:19, name:'高松', type:'base', note:'入口、栗林公园、高松港、北滨，跳岛前站。' },
  { id:'shodoshima', region:'kagawa', x:66, y:8, name:'小豆岛', type:'island', note:'酱油、橄榄、海边慢渡轮；1天只选2–3点。' },
  { id:'kotohira', region:'kagawa', x:45, y:28, name:'琴平', type:'buffer', note:'参道与温泉缓冲，进入祖谷前降速。' },
  { id:'iya', region:'tokushima', x:47, y:50, name:'祖谷 / 大步危', type:'core', note:'整条线降噪核心，3晚，不要压缩。' },
  { id:'kochi', region:'kochi', x:43, y:70, name:'高知', type:'supply', note:'南国小城补给，轻逛即可。' },
  { id:'shimanto', region:'kochi', x:18, y:78, name:'四万十川', type:'core', note:'清流恢复日，沉下桥与半日水上活动。' },
  { id:'ozu', region:'ehime', x:14, y:49, name:'大洲 / 内子', type:'finish', note:'城下町、町家、肱川，温柔收束。' },
  { id:'matsuyama', region:'ehime', x:13, y:28, name:'松山 / 道后', type:'onsen', note:'可选温泉强化，不要盖过大洲/内子。' },
  { id:'naoshima', region:'kagawa', x:54, y:7, name:'直岛 / 丰岛分支', type:'branch', note:'艺术岛需预约；跳岛期可改住宇野。' },
  { id:'takaya', region:'kagawa', x:33, y:19, name:'高屋神社', type:'optional', note:'天空鸟居，强体力点；查登山道开放和交通。' }
];

const branches = [
  { name:'PDF 13天疗愈主线', fit:'第一次执行 / 想恢复体力', keep:'高松3晚 → 琴平1晚 → 祖谷3晚 → 高知1晚 → 四万十2晚 → 大洲/内子2晚', cut:'不要硬塞直岛/丰岛；不要追足摺岬、柏岛远征。' },
  { name:'瀬户内跳岛 5天最小版', fit:'只想判断艺术岛值不值', keep:'高松 → 直岛 → 丰岛 → 小豆岛或高松补缺 → 返程', cut:'不做祖谷/四万十，避免两条路线都半吊子。' },
  { name:'跳岛 6–9天增强版', fit:'瀬户内艺术祭 / 岛屿优先', keep:'高松 + 直岛 + 丰岛 + 小豆岛 + 女木/男木；8天后再加金刀比罗或岛波海道', cut:'不要每天从高松往返远路，必要时住宇野/丸龟/坂出/今治。' },
  { name:'温泉强化版', fit:'想打卡四国名汤', keep:'祖谷温泉保留；最后大洲/内子 2晚可改成 大洲/内子1晚 + 松山/道后1晚', cut:'不要为了道后温泉删祖谷三晚。' }
];

const sourceNotes = [
  '四国 PDF：2026.09.25–10.07，13天12晚，高松3晚→琴平1晚→祖谷/大步危3晚→高知1晚→四万十2晚→大洲/内子2晚。',
  '旧四条路线总览网页：四国定位为“山谷清流与小城人文”，核心是每天一个主活动、住宿体验优先。',
  '小红书截图提炼：栗林公园细化、直岛电助力车/预约、宇野跳岛基地、小豆岛做减法、高屋神社体力风险、高知西部素材池、穷游/交通票券经验。'
];

function useLocalDecision() {
  const [saved, setSaved] = useState(() => {
    try { return JSON.parse(localStorage.getItem('shikoku-decisions') || '{}'); } catch { return {}; }
  });
  useEffect(() => { localStorage.setItem('shikoku-decisions', JSON.stringify(saved)); }, [saved]);
  return [saved, setSaved];
}

function ShikokuMap({ selectedRegion, selectedMarker, onRegion, onMarker }) {
  const regionClass = (id) => `pref ${selectedRegion === id ? 'active' : ''}`;
  return <div className="map-frame" aria-label="四国交互地图">
    <svg viewBox="0 0 760 520" role="img">
      <defs>
        <filter id="softShadow"><feDropShadow dx="0" dy="14" stdDeviation="12" floodColor="#3c2b18" floodOpacity=".18"/></filter>
        <linearGradient id="sea" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#d8e9e9"/><stop offset="1" stopColor="#f7f0df"/></linearGradient>
      </defs>
      <rect x="0" y="0" width="760" height="520" rx="34" fill="url(#sea)" />
      <path className="sea-line" d="M68 112 C180 80, 265 116, 360 90 S560 70, 690 124" />
      <text x="604" y="74" className="water-label">瀬户内海</text>
      <text x="536" y="455" className="water-label">太平洋</text>
      <g filter="url(#softShadow)">
        <path tabIndex="0" role="button" aria-label="香川" onClick={() => onRegion('kagawa')} className={regionClass('kagawa')} fill={prefectures.kagawa.tone} d="M333 119 C392 86 488 85 581 116 C613 127 637 154 624 184 C606 225 524 217 465 205 C404 193 339 213 296 184 C269 165 286 141 333 119Z" />
        <path tabIndex="0" role="button" aria-label="德岛" onClick={() => onRegion('tokushima')} className={regionClass('tokushima')} fill={prefectures.tokushima.tone} d="M455 211 C527 213 624 213 665 258 C710 307 669 384 598 398 C536 411 484 375 461 319 C442 274 417 233 455 211Z" />
        <path tabIndex="0" role="button" aria-label="高知" onClick={() => onRegion('kochi')} className={regionClass('kochi')} fill={prefectures.kochi.tone} d="M206 310 C280 276 380 284 459 319 C510 342 548 392 522 433 C492 480 361 471 254 437 C156 406 89 367 111 334 C126 312 166 328 206 310Z" />
        <path tabIndex="0" role="button" aria-label="爱媛" onClick={() => onRegion('ehime')} className={regionClass('ehime')} fill={prefectures.ehime.tone} d="M119 185 C177 154 255 159 315 185 C371 209 375 273 318 305 C270 331 217 298 170 319 C127 338 74 331 62 286 C51 242 75 208 119 185Z" />
      </g>
      <path className="route-line" d="M433 118 L345 145 L357 253 L335 355 L167 386 L109 253" />
      {markers.map(m => <g key={m.id} className={`marker ${selectedMarker === m.id ? 'active' : ''}`} transform={`translate(${m.x*7.6} ${m.y*5.2})`} onClick={() => onMarker(m)} role="button" tabIndex="0" aria-label={m.name}>
        <circle r={m.type === 'core' ? 13 : 10} />
        <text x="16" y="5">{m.name}</text>
      </g>)}
      <text x="54" y="487" className="map-note">示意地图：用于路线决策，不按真实比例绘制</text>
    </svg>
  </div>;
}

function RegionPanel({ region, marker, onSave, saved }) {
  return <aside className="region-panel">
    <div className="panel-photo"><img src={`${A}${region.image}`} alt={region.name} /></div>
    <div className="panel-kicker">{region.kana} · {region.mood}</div>
    <h2>{marker ? marker.name : region.name}</h2>
    <p className="panel-summary">{marker ? marker.note : region.summary}</p>
    <div className="decision-row">
      <button className={saved[region.id] === 'keep' ? 'active' : ''} onClick={() => onSave(region.id, 'keep')}>想保留</button>
      <button className={saved[region.id] === 'maybe' ? 'active' : ''} onClick={() => onSave(region.id, 'maybe')}>待定</button>
      <button className={saved[region.id] === 'cut' ? 'active' : ''} onClick={() => onSave(region.id, 'cut')}>可删</button>
    </div>
    <dl className="facts"><dt>住宿策略</dt><dd>{region.stay}</dd><dt>核心点</dt><dd>{region.spots.join(' / ')}</dd></dl>
    <div className="mini-grid"><div><b>要做</b>{region.must.map(x => <span key={x}>{x}</span>)}</div><div><b>避坑</b>{region.avoid.map(x => <span key={x}>{x}</span>)}</div></div>
  </aside>;
}

function Timeline({ activeRegion, onRegion }) {
  const days = useMemo(() => activeRegion === 'all' ? routeDays : routeDays.filter(d => d.region === activeRegion), [activeRegion]);
  return <div className="timeline">
    {days.map(d => <button className="day-card" key={d.day} onClick={() => onRegion(d.region)}>
      <span className="day-index">{d.day}<small>{d.date}</small></span>
      <span><b>{d.title}</b><em>{d.base}</em><p>{d.plan}</p><i>{d.tip}</i></span>
    </button>)}
  </div>;
}

function App() {
  const [selectedRegion, setSelectedRegion] = useState('kagawa');
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [routeFilter, setRouteFilter] = useState('all');
  const [saved, setSaved] = useLocalDecision();
  const region = prefectures[selectedRegion];
  const markerObj = selectedMarker ? markers.find(m => m.id === selectedMarker) : null;
  const chooseMarker = (m) => { setSelectedMarker(m.id); setSelectedRegion(m.region); };
  const chooseRegion = (id) => { setSelectedRegion(id); setSelectedMarker(null); };
  const saveDecision = (id, value) => setSaved(prev => ({ ...prev, [id]: value }));
  const savedSummary = Object.entries(saved).filter(([,v]) => v === 'keep').map(([id]) => prefectures[id]?.name).filter(Boolean);

  return <main>
    <nav className="topbar"><a className="brand" href="#top">Shikoku Personal Map</a><div><a href="#map">地图</a><a href="#route">13天路线</a><a href="#branches">跳岛分支</a><a href="#sources">资料来源</a></div></nav>
    <header id="top" className="hero">
      <div className="hero-copy">
        <p className="eyebrow">2026.09.25 — 10.07 · 晓倩专属四国攻略</p>
        <h1><span>点开地图，</span><span>直接判断四国</span><span>每一段要怎么玩。</span></h1>
        <p className="hero-lead">不是普通路线清单：把之前的四国 PDF、总览网页、每日玩法增强版和小红书截图经验整理成一个可交互地图。你点香川、德岛、高知、爱媛，立刻看到该区域的住宿、取舍、避坑和对应天数。</p>
        <div className="hero-actions"><a href="#map">打开交互地图</a><a href="#route">看13天主线</a></div>
      </div>
      <div className="hero-card"><img src={`${A}shikoku_10_Shimanto_e5151e9b.jpg`} alt="四万十川"/><div><b>当前推荐骨架</b><span>高松 3晚 → 琴平 1晚 → 祖谷 3晚 → 高知 1晚 → 四万十 2晚 → 大洲/内子 2晚</span></div></div>
    </header>

    <section className="section map-section" id="map">
      <div className="section-head"><span>Interactive map</span><h2>像 japan.travel 那样点地图，但内容只服务你的这趟四国。</h2><p>点击县域或地点标记，右侧会切换到对应攻略；点击“想保留 / 待定 / 可删”会保存在本机浏览器里，方便你后续取舍。</p></div>
      <div className="map-layout">
        <ShikokuMap selectedRegion={selectedRegion} selectedMarker={selectedMarker} onRegion={chooseRegion} onMarker={chooseMarker} />
        <RegionPanel region={region} marker={markerObj} saved={saved} onSave={saveDecision}/>
      </div>
      <div className="saved-bar"><b>你标记想保留：</b>{savedSummary.length ? savedSummary.join('、') : '还没有选择；建议先保留德岛祖谷、高知四万十、爱媛大洲/内子。'}</div>
    </section>

    <section className="section route-section" id="route">
      <div className="section-head compact"><span>Main route</span><h2>13天主线：每天一个主活动，避免把疗愈旅行变成打卡劳动。</h2></div>
      <div className="filter-row"><button className={routeFilter==='all'?'active':''} onClick={()=>setRouteFilter('all')}>全部</button>{Object.values(prefectures).map(p => <button key={p.id} className={routeFilter===p.id?'active':''} onClick={()=>setRouteFilter(p.id)}>{p.name}</button>)}</div>
      <Timeline activeRegion={routeFilter} onRegion={chooseRegion}/>
    </section>

    <section className="section branch-section" id="branches">
      <div className="section-head"><span>Variants</span><h2>跳岛、温泉、高知西部，都做成分支，不要污染主线。</h2><p>这是你之前截图里最重要的策略变化：新素材不是“都加进去”，而是帮你更聪明地取舍。</p></div>
      <div className="branch-grid">{branches.map(b => <article className="branch-card" key={b.name}><h3>{b.name}</h3><p><b>适合：</b>{b.fit}</p><p><b>保留：</b>{b.keep}</p><p><b>删减：</b>{b.cut}</p></article>)}</div>
    </section>

    <section className="section gallery-section">
      <div className="section-head compact"><span>Key scenes</span><h2>核心画面：只放能帮助决策的地方。</h2></div>
      <div className="gallery">
        {[['栗林公园','test_ritsurin2_Ritsurin_bdd6995a.jpg','高松慢启动，不需要赶。'],['小豆岛','try2_Shodoshima_Olive_Park_Shodoshima_Olive_Park_235c7184.jpg','1天只抓酱油/橄榄/海边。'],['祖谷藤桥','probe_Iya_Valley_vine_bridge_Tokushima_Iya_6ef748b6.jpg','山谷段核心，3晚不要压缩。'],['大步危峡','shikoku_05_Oboke_Gorge_Iya_Valley_Tokushima_933e01b6.jpg','进山第一天轻活动。'],['四万十川','shikoku_10_Shimanto_e5151e9b.jpg','后半段水边恢复。'],['大洲城下町','shikoku_11_Ozu_castle_town_Hijikawa_river_Ehime_2029096e.jpg','最后两晚慢收束。']].map(([title,img,desc]) => <figure key={title}><img src={`${A}${img}`} alt={title}/><figcaption><b>{title}</b><span>{desc}</span></figcaption></figure>)}
      </div>
    </section>

    <section className="section source-section" id="sources">
      <div className="source-card"><span>Source synthesis</span><h2>这版综合了哪些资料</h2>{sourceNotes.map(n => <p key={n}>{n}</p>)}<p className="fineprint">说明：地图为路线决策示意图，不按真实比例；船班、巴士、门票预约、艺术祭展览、登山道开放和价格，出发前 30–60 天仍需以官网复核。</p></div>
    </section>
  </main>;
}

createRoot(document.getElementById('root')).render(<App />);
