import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { markerPositions, prefecturePaths, shikokuViewBox } from './mapPaths.js';
import './styles.css';

const A = '/assets/';

const detailTabs = [
  ['overview', '概览'],
  ['plan', '安排'],
  ['traffic', '交通'],
  ['stay', '住宿'],
  ['rules', '取舍']
];

const prefectures = {
  kagawa: {
    id: 'kagawa', name: '香川', kana: 'Kagawa', mood: '入口 / 庭园 / 瀬户内跳岛', tone: '#8fa885',
    image: 'shikoku_02_Ritsurin_bdd6995a.jpg',
    summary: '高松是四国慢启动和瀬户内枢纽：先把节奏降下来，再决定小豆岛、直岛/丰岛、高屋神社这些分支要不要加。',
    details: {
      overview: ['角色是“入口”和“缓冲”，不是刷景点的城市。', '适合用 3 晚建立节奏：庭园、港口、海岛，每天只抓一个主活动。'],
      plan: ['D1 抵达后只吃乌冬或散步，不排硬景点。', 'D2 栗林公园尽量早去，下午只留高松港/北滨。', 'D3 小豆岛只选 2–3 个点：橄榄、酱油仓、海边咖啡，不追全岛。'],
      traffic: ['高松港是跳岛枢纽；艺术祭或旺季要提前查船班和预约。', '如果直岛/丰岛权重上升，可把跳岛部分住宿改到宇野，减少来回折返。'],
      stay: ['优先高松港、北滨、片原町、瓦町；方便吃饭、坐船和城市轻逛。', '琴平不建议当天往返硬塞，作为进祖谷前一晚缓冲更舒服。'],
      rules: ['保留：高松 3 晚、栗林公园、小豆岛慢日、琴平缓冲。', '可删/后置：高屋神社、直岛/丰岛艺术岛，除非你愿意牺牲主线松弛感。']
    },
    keep: ['高松 3 晚', '栗林公园半天', '小豆岛一日慢渡轮', '琴平作为进山缓冲'],
    avoid: ['不要小豆岛一天追全岛', '不要艺术祭期间临时订船票/美术馆', '不要把高屋神社塞进疲劳日']
  },
  tokushima: {
    id: 'tokushima', name: '德岛', kana: 'Tokushima', mood: '山谷 / 降噪 / 祖谷三晚', tone: '#7896a0',
    image: 'shikoku_06_Iya_6ef748b6.jpg',
    summary: '祖谷/大步危是整条线的核心，不是路过景点。这里承担真正断网、进山、降噪。',
    details: {
      overview: ['主线最重要的停留段。三晚不是奢侈，是为了不把山谷变成打卡。', '大步危、藤桥、集落、温泉、古民家住宿本身就是体验。'],
      plan: ['D5 琴平进入大步危/祖谷，主要是转场和适应山谷。', 'D6 西祖谷低强度：藤桥、集落、温泉，不深入追车。', 'D7 作为深呼吸日：奥祖谷可选，也可以完全不动。'],
      traffic: ['公共交通班次少，必须提前核对巴士、末班车、住宿接送。', '9/30 深处线路未必每日运行；10/1 后也要以当年时刻表为准。'],
      stay: ['优先祖谷古民家、山间温泉、大步危周边小宿。', '确认晚餐、接送和取消规则；山里临时换住宿会很被动。'],
      rules: ['绝对不要压缩成一晚。', '国庆启动期留在山谷，不回大阪/京都/东京这类高热城市。']
    },
    keep: ['祖谷 / 大步危 3 晚', '大步危峡短船或河谷散步', '西祖谷藤桥', '山间温泉 / 古民家住宿'],
    avoid: ['不要压缩成一晚', '不要不查巴士就进山', '国庆当天不要回城市人堆']
  },
  kochi: {
    id: 'kochi', name: '高知', kana: 'Kochi', mood: '南国小城 / 四万十清流', tone: '#c69368',
    image: 'shikoku_10_Shimanto_e5151e9b.jpg',
    summary: '高知市是补给点，四万十才是后半段主角。足摺岬、柏岛、大堂海岸很强，但不进入当前 13 天主线。',
    details: {
      overview: ['从山谷回到城市，但不要在高知市内排满。', '后半段真正的恢复来自四万十川：沉下桥、清流、半日水上活动。'],
      plan: ['D8 祖谷出山到高知，晚上吃好睡好。', 'D9 高知去四万十/中村，抵达清流地带。', 'D10 四万十整日，只安排沉下桥 + 屋形船/独木舟/SUP 半日。'],
      traffic: ['高知到中村/四万十时间不短，D9 不要再加远景点。', '水上活动和屋形船最好提前预约；天气差就换成河边散步。'],
      stay: ['高知市一晚只为补给。', '四万十两晚优先中村或河边 cottage，安静比便利更重要。'],
      rules: ['不把足摺岬、柏岛、大堂海岸塞进 13 天。', '如果后续要做高知西部分支，应作为另一条路线单独评估。']
    },
    keep: ['高知市轻逛一晚', '四万十川 2 晚', '沉下桥', '屋形船 / 独木舟 / SUP 半日'],
    avoid: ['不要把足摺岬、柏岛、大堂海岸全塞一天', '不要周末才订四万十活动', '不要高知市内排满']
  },
  ehime: {
    id: 'ehime', name: '爱媛', kana: 'Ehime', mood: '城下町 / 老街 / 温泉收束', tone: '#b9a36b',
    image: 'shikoku_11_Ozu_castle_town_Hijikawa_river_Ehime_2029096e.jpg',
    summary: '大洲/内子负责温柔收束；道后温泉是可选强化，不应该盖过町家、小城和肱川。',
    details: {
      overview: ['这是后半段“落地”的地方：老街、町家、河边、蜡烛和小城节奏。', '最后两天不再远征，让身体慢慢退出旅行。'],
      plan: ['D11 四万十经宇和岛到大洲/内子，作为转场和收束开始。', 'D12 大洲/内子整日：町家、内子座、蜡烛/和纸、肱川。', 'D13 保留返程缓冲，不再加重景点。'],
      traffic: ['四万十到爱媛是长转场，D11 不要安排复杂预约。', '返程可接松山、冈山或关西路径，后续根据航班再锁定。'],
      stay: ['优先大洲/内子町家两晚。', '如果你特别想泡道后，可以最后一晚改松山/道后，但不要因此删大洲/内子。'],
      rules: ['保留大洲/内子 2 晚。', '道后温泉只是强化项，不是这条疗愈主线的终点。']
    },
    keep: ['大洲 / 内子 2 晚', '大洲城下町与肱川', '内子座、町家、蜡烛/和纸', '返程日保持缓冲'],
    avoid: ['最后两天不要远征', '不要为了道后删大洲/内子', '返程日不要加重景点']
  }
};

const spots = [
  { id:'takamatsu', region:'kagawa', name:'高松', type:'base', label:'主基地', days:'D1–D3', dx:14, dy:-12,
    details:{ overview:['四国入口和瀬户内枢纽。不要把它当大城市刷景点。'], plan:['D1 只落地、吃乌冬、散步。D2 栗林公园 + 港口街区。'], traffic:['港口、JR、机场巴士都方便；跳岛前确认船班。'], stay:['高松港/北滨/片原町/瓦町优先。'], rules:['慢启动，少换乘，别第一天就把自己累爆。'] } },
  { id:'shodoshima', region:'kagawa', name:'小豆岛', type:'island', label:'海岛慢日', days:'D3', dx:12, dy:-10,
    details:{ overview:['小豆岛适合作为海岛散心，不适合作为全岛竞速。'], plan:['橄榄公园、酱油仓、海边咖啡三选二到三。'], traffic:['高松港往返；岛内巴士节奏慢，提前查末班。'], stay:['主线不住岛；如果跳岛分支升级，再评估岛宿。'], rules:['宁可少走，也不要追网红拍照点。'] } },
  { id:'kotohira', region:'kagawa', name:'琴平', type:'buffer', label:'进山缓冲', days:'D4', dx:15, dy:18,
    details:{ overview:['高松到祖谷之间的降速缓冲。'], plan:['参道、温泉、小镇散步；不用把登顶当 KPI。'], traffic:['从高松转入琴平相对顺；次日再进大步危/祖谷。'], stay:['琴平温泉小宿一晚。'], rules:['它的价值是缓冲，不是硬凑景点。'] } },
  { id:'iya', region:'tokushima', name:'祖谷 / 大步危', type:'core', label:'核心', days:'D5–D7', dx:14, dy:-14,
    details:{ overview:['整条线的降噪核心，三晚保留。'], plan:['D5 进山；D6 西祖谷核心；D7 留白或奥祖谷。'], traffic:['班次少，住宿接送、出租车、末班车必须提前确认。'], stay:['古民家、山间温泉、大步危周边。'], rules:['不要压缩；不要不查交通就进山。'] } },
  { id:'kochi', region:'kochi', name:'高知', type:'supply', label:'补给', days:'D8', dx:15, dy:14,
    details:{ overview:['出山后的补给小城，不是主角。'], plan:['晚上吃饭、轻逛、补给，早点睡。'], traffic:['从祖谷出山当天不再安排远景点。'], stay:['高知市中心一晚即可。'], rules:['不要把市内排满，给四万十留体力。'] } },
  { id:'shimanto', region:'kochi', name:'四万十川', type:'core', label:'清流', days:'D9–D10', dx:-86, dy:2,
    details:{ overview:['后半段恢复主角，靠清流和低强度活动慢下来。'], plan:['沉下桥、屋形船/独木舟/SUP 半日，剩余时间留白。'], traffic:['高知到中村需要时间；活动受天气影响。'], stay:['中村或河边 cottage 两晚优先。'], rules:['不和足摺岬/柏岛混成赶路日。'] } },
  { id:'ozu', region:'ehime', name:'大洲 / 内子', type:'finish', label:'收束', days:'D11–D12', dx:-92, dy:1,
    details:{ overview:['小城、町家、肱川，负责温柔收束。'], plan:['D11 转场抵达；D12 町家、内子座、蜡烛/和纸。'], traffic:['从四万十过来是长转场，不要加复杂预约。'], stay:['大洲/内子町家两晚。'], rules:['最后两天不远征，保留返程缓冲。'] } },
  { id:'matsuyama', region:'ehime', name:'松山 / 道后', type:'onsen', label:'温泉可选', days:'D13 / 可选', dx:-102, dy:-4,
    details:{ overview:['温泉强化项，不是主线中心。'], plan:['若想泡道后，可把最后一晚改松山/道后。'], traffic:['返程可从松山衔接；但要看航班价格和时间。'], stay:['道后温泉旅馆只在明确想泡温泉时考虑。'], rules:['不要为了道后删掉大洲/内子。'] } },
  { id:'naoshima', region:'kagawa', name:'直岛 / 丰岛', type:'branch', label:'跳岛分支', days:'分支', dx:-92, dy:-12,
    details:{ overview:['艺术岛是强分支，不混入疗愈主线。'], plan:['适合单独做 5–9 天瀬户内跳岛方案。'], traffic:['船票、美术馆、住宿都要提前预约；可住宇野。'], stay:['跳岛期高松/宇野二选一。'], rules:['只有你明确想艺术岛优先时才加入。'] } },
  { id:'takaya', region:'kagawa', name:'高屋神社', type:'optional', label:'体力点', days:'备选', dx:-84, dy:14,
    details:{ overview:['天空鸟居很强，但它是体力和交通点。'], plan:['只适合状态好、天气好、交通确认后的半日备选。'], traffic:['查登山道开放、停车/接驳、公交可达性。'], stay:['不为它单独改住宿。'], rules:['不要塞进疲劳日；不要为一张照片破坏主线。'] } }
];

const routeDays = [
  { d:'D1', t:'高松落地', spot:'takamatsu', note:'杭州出发，抵达后不安排硬景点。' },
  { d:'D2', t:'栗林公园', spot:'takamatsu', note:'庭园 + 港口街区，把速度降下来。' },
  { d:'D3', t:'小豆岛', spot:'shodoshima', note:'海岛慢日，只选 2–3 个点。' },
  { d:'D4', t:'琴平', spot:'kotohira', note:'参道、温泉、小镇，进山前缓冲。' },
  { d:'D5', t:'进祖谷', spot:'iya', note:'转场为主，确认接送和晚餐。' },
  { d:'D6', t:'西祖谷', spot:'iya', note:'藤桥、集落、温泉，不追深处。' },
  { d:'D7', t:'祖谷留白', spot:'iya', note:'奥祖谷可选，或完全不动。' },
  { d:'D8', t:'高知补给', spot:'kochi', note:'出山交通日，晚上吃好睡好。' },
  { d:'D9', t:'四万十', spot:'shimanto', note:'抵达清流地带，不再远征。' },
  { d:'D10', t:'清流整日', spot:'shimanto', note:'沉下桥 + 半日水上活动。' },
  { d:'D11', t:'大洲/内子', spot:'ozu', note:'长转场，开始小城收束。' },
  { d:'D12', t:'町家小城', spot:'ozu', note:'町家、内子座、肱川，低强度。' },
  { d:'D13', t:'返程', spot:'matsuyama', note:'只保留返程缓冲，不加重景点。' }
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

function activateWithKeyboard(event, action) {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    action();
  }
}

function ShikokuMap({ selectedRegion, selectedSpot, onRegion, onSpot }) {
  const routeLine = ['takamatsu','kotohira','iya','kochi','shimanto','ozu','matsuyama']
    .map(id => `${markerPositions[id].x},${markerPositions[id].y}`).join(' ');

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
          return <path
            key={p.id}
            d={prefecturePaths[p.id]}
            fill={p.tone}
            className={`prefecture-shape ${selectedRegion === p.id ? 'active' : ''}`}
            role="button"
            tabIndex="0"
            aria-label={p.name}
            onMouseDown={(event) => event.preventDefault()}
            onClick={select}
            onKeyDown={(event) => activateWithKeyboard(event, select)}
          />;
        })}
      </g>
      <polyline className="main-route-line" points={routeLine} />
      {spots.map(s => {
        const p = markerPositions[s.id];
        const select = () => onSpot(s);
        return <g
          key={s.id}
          className={`spot-marker ${selectedSpot?.id === s.id ? 'active' : ''} ${s.type}`}
          transform={`translate(${p.x} ${p.y})`}
          role="button"
          tabIndex="0"
          aria-label={s.name}
          onMouseDown={(event) => event.preventDefault()}
          onClick={select}
          onKeyDown={(event) => activateWithKeyboard(event, select)}
        >
          <circle className="hit-area" r="22" />
          <circle className="spot-dot" r={s.type === 'core' ? 10 : 7} />
          <text x={s.dx} y={s.dy}>{s.name}</text>
        </g>;
      })}
      </g>
      <text x="32" y="496" className="source-label">县域轮廓来自 GeoJSON；已按 Google Maps 视觉复核，点位为攻略决策定位</text>
    </svg>
  </section>;
}

function DetailPanel({ region, spot, tab, onTab, saved, onSave }) {
  const target = spot || region;
  const targetName = target.name;
  const detailSource = spot?.details || region.details;
  const detailLines = detailSource[tab] || [];
  const fullLines = Object.entries(detailSource).flatMap(([key, lines]) => lines.map(line => `${detailTabs.find(([id]) => id === key)?.[1] || key}｜${line}`));
  const decisionKey = spot?.id || region.id;

  return <aside className="detail-panel">
    <div className="photo"><img src={`${A}${region.image}`} alt={targetName} /></div>
    <div className="detail-kicker">{region.kana} · {spot ? spot.label : region.mood}</div>
    <h1>{targetName}</h1>
    <p className="summary">{spot ? detailSource.overview[0] : region.summary}</p>
    <div className="spot-meta"><b>{spot ? spot.days : '县域'}</b><span>{region.name} · {spot ? spot.type : 'region'}</span></div>

    <div className="decision-row" aria-label="旅行取舍标记">
      <button className={saved[decisionKey] === 'keep' ? 'active' : ''} onClick={() => onSave(decisionKey, 'keep')}>想保留</button>
      <button className={saved[decisionKey] === 'maybe' ? 'active' : ''} onClick={() => onSave(decisionKey, 'maybe')}>待定</button>
      <button className={saved[decisionKey] === 'cut' ? 'active' : ''} onClick={() => onSave(decisionKey, 'cut')}>可删</button>
    </div>

    <div className="tab-row" role="tablist" aria-label="详细攻略分类">
      {detailTabs.map(([id, label]) => <button key={id} className={tab === id ? 'active' : ''} onClick={() => onTab(id)}>{label}</button>)}
    </div>

    <div className="drill-card">
      <b>{detailTabs.find(([id]) => id === tab)?.[1]}</b>
      {detailLines.map(line => <p key={line}>{line}</p>)}
    </div>

    <details className="deep-details">
      <summary>展开完整攻略</summary>
      <div className="deep-list">
        {fullLines.map(line => <span key={line}>{line}</span>)}
      </div>
    </details>

    <div className="two-col compact">
      <div><b>保留</b>{region.keep.map(x => <span key={x}>{x}</span>)}</div>
      <div><b>避坑</b>{region.avoid.map(x => <span key={x}>{x}</span>)}</div>
    </div>
  </aside>;
}

function App() {
  const [selectedRegion, setSelectedRegion] = useState('kagawa');
  const [selectedSpot, setSelectedSpot] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [saved, setSaved] = useLocalDecision();
  const region = prefectures[selectedRegion];
  const saveDecision = (id, value) => setSaved(prev => ({ ...prev, [id]: value }));
  const selectRegion = (id) => { setSelectedRegion(id); setSelectedSpot(null); setActiveTab('overview'); };
  const selectSpot = (spot) => { setSelectedSpot(spot); setSelectedRegion(spot.region); setActiveTab('overview'); };
  const keepNames = Object.entries(saved).filter(([,v]) => v === 'keep').map(([id]) => spots.find(s => s.id === id)?.name || prefectures[id]?.name).filter(Boolean);

  return <main className="map-page">
    <header className="map-topbar">
      <a className="brand" href="/">四国旅行地图</a>
      <div className="top-summary">13 天疗愈主线 · 可下钻查询 · 日本元素克制版</div>
    </header>

    <section className="map-shell">
      <div className="intro-card">
        <p className="eyebrow">Personal travel atlas</p>
        <h2><span>先看地图，</span><span>再决定停留。</span></h2>
        <p className="intro-copy"><span>点县域或地点，右侧查看详细攻略。</span><span>信息不删，只收进下钻面板。</span><span>路线骨架留在底部，避免主地图变乱。</span></p>
        <div className="map-audit-note"><b>地图核对</b><span>轮廓和点位已对照 Google Maps：方位正确；它是攻略定位图，不是导航比例尺。</span></div>
      </div>

      <ShikokuMap selectedRegion={selectedRegion} selectedSpot={selectedSpot} onRegion={selectRegion} onSpot={selectSpot} />
      <DetailPanel
        region={region}
        spot={selectedSpot}
        tab={activeTab}
        onTab={setActiveTab}
        saved={saved}
        onSave={saveDecision}
      />
    </section>

    <section className="route-dock" aria-label="13天路线简表">
      <div className="dock-head"><b>13 天骨架</b><span>{keepNames.length ? `已标记保留：${keepNames.join('、')}` : '建议优先保留：祖谷、四万十、大洲/内子'}</span></div>
      <div className="day-rail">{routeDays.map(day => <button key={day.d} onClick={() => selectSpot(spots.find(s => s.id === day.spot))} title={day.note}><b>{day.d}</b><span>{day.t}</span></button>)}</div>
    </section>

    <section className="variant-dock" aria-label="分支提醒">
      {variants.map(([name, text]) => <article key={name}><b>{name}</b><span>{text}</span></article>)}
    </section>
  </main>;
}

createRoot(document.getElementById('root')).render(<App />);
