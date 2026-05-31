import { useMemo, useRef, useState, type KeyboardEvent, type Ref } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { Draggable } from 'gsap/Draggable';
import { ArrowLeft, ArrowRight, ChevronDown, ListChecks, MapPinned, Navigation2, Plus, RotateCcw, ShoppingBag, Trash2, X } from 'lucide-react';
import { prefecturePaths, shikokuViewBox } from '@/content/mapPaths';
import { allSpots, prefectures } from '@/content/travelData';
import { spotImages } from '@/content/spotImages';
import type { DetailContent, DetailTabId, RegionId, Spot } from '@/content/types';
import { cn } from '@/lib/utils';
import { imageSource } from '@/utils/images';

gsap.registerPlugin(useGSAP, Draggable);

type SwipeDecision = 'add' | 'skip';
type GestureIntent = 'join' | 'skip' | 'detail' | 'idle';

type DetailBlock = {
  id: DetailTabId;
  title: string;
  items: string[];
};

type SpotPalette = {
  card: string;
  text: string;
  muted: string;
  accent: string;
  soft: string;
  checker: string;
  glow: string;
};

const regionOrder: RegionId[] = ['kagawa', 'tokushima', 'kochi', 'ehime'];
const featuredOrder = [
  'ritsurin', 'shodoshima', 'naoshima', 'naruto', 'otsuka', 'iya', 'kazurabashi',
  'kochi-castle', 'hirome', 'niyodo', 'shimanto', 'matsuyama-castle', 'dogo', 'ozu', 'shimanami'
];

const regionPalettes: Record<RegionId, SpotPalette> = {
  kagawa: {
    card: '#ffb526',
    text: '#24130f',
    muted: '#6f4318',
    accent: '#fff7d3',
    soft: '#ffe194',
    checker: '#3d1d13',
    glow: 'rgba(255,181,38,.42)'
  },
  tokushima: {
    card: '#9d8cff',
    text: '#201136',
    muted: '#57459b',
    accent: '#fbf5ff',
    soft: '#d8d0ff',
    checker: '#25133e',
    glow: 'rgba(157,140,255,.42)'
  },
  kochi: {
    card: '#f68bc1',
    text: '#2b111f',
    muted: '#7b3354',
    accent: '#fff1f8',
    soft: '#ffcce4',
    checker: '#32131f',
    glow: 'rgba(246,139,193,.42)'
  },
  ehime: {
    card: '#ff7b5f',
    text: '#2b140f',
    muted: '#7a3725',
    accent: '#fff1e9',
    soft: '#ffc5ac',
    checker: '#35150f',
    glow: 'rgba(255,123,95,.42)'
  }
};

const tabTitles: Array<[DetailTabId, string]> = [
  ['overview', '为什么值得去'],
  ['plan', '怎么安排'],
  ['traffic', '交通提醒'],
  ['stay', '落脚判断'],
  ['rules', '取舍规则']
];

function deckSpots(): Spot[] {
  const featured = featuredOrder
    .map(id => allSpots.find(spot => spot.id === id))
    .filter((spot): spot is Spot => Boolean(spot));
  const featuredIds = new Set(featured.map(spot => spot.id));
  const rest = allSpots
    .filter(spot => !featuredIds.has(spot.id))
    .sort((a, b) => regionOrder.indexOf(a.region) - regionOrder.indexOf(b.region) || a.name.localeCompare(b.name, 'zh-Hans-CN'));
  return [...featured, ...rest];
}

function spotPoint(spot: Spot) {
  return { x: spot.x, y: spot.y };
}

function primaryImage(spot: Spot): string {
  const image = spotImages[spot.id]?.[0]?.src || prefectures[spot.region].image;
  return imageSource(image);
}

function summarizeList(items: string[], fallback = '暂未补充') {
  return items.length ? items[0] : fallback;
}

function detailBlocks(details: DetailContent): DetailBlock[] {
  return tabTitles.map(([id, title]) => ({ id, title, items: details[id] || [] }));
}

function sourceLabel(source: string): string {
  if (!source) return '资料来源';
  try {
    const host = new URL(source).hostname.replace(/^www\./, '');
    if (host.includes('japan.travel')) return 'Japan Travel';
    if (host.includes('wikimedia')) return 'Wikimedia';
    return host;
  } catch {
    return '资料来源';
  }
}

function activateByKeyboard(event: KeyboardEvent, action: () => void) {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    action();
  }
}

function ChromeButton({ children, className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={cn(
        'inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-white/12 bg-white/[0.08] px-4 py-2 text-sm font-black text-white shadow-[inset_0_1px_0_rgba(255,255,255,.16)] backdrop-blur-xl transition hover:bg-white/[0.14] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/80 disabled:pointer-events-none disabled:opacity-45',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

function RegionMiniMap({ spot, className }: { spot: Spot; className?: string }) {
  const region = prefectures[spot.region];
  const point = spotPoint(spot);
  return (
    <svg className={cn('block h-full w-full', className)} viewBox={shikokuViewBox} role="img" aria-label={`${spot.name} 在四国地图中的位置`}>
      <rect width="760" height="520" rx="34" fill="rgba(255,255,255,.2)" />
      <g transform="translate(-48 -18) scale(1.05)">
        {Object.values(prefectures).map(prefecture => (
          <path
            key={prefecture.id}
            d={prefecturePaths[prefecture.id]}
            fill={prefecture.id === spot.region ? region.tone : 'rgba(255,255,255,.32)'}
            stroke="rgba(255,255,255,.42)"
            strokeWidth="1.6"
            opacity={prefecture.id === spot.region ? 0.96 : 0.42}
          />
        ))}
        <circle cx={point.x} cy={point.y} r="18" fill="rgba(255,255,255,.84)" stroke="rgba(20,20,20,.35)" strokeWidth="2" />
        <circle cx={point.x} cy={point.y} r="8" fill={region.tone} stroke="white" strokeWidth="2.4" />
      </g>
    </svg>
  );
}

function ArtOrbit({ palette }: { palette: SpotPalette }) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[2.15rem]" aria-hidden="true">
      <div
        className="absolute -right-24 -top-24 h-[28rem] w-[28rem] rounded-full border-[1rem] border-white/85 opacity-90"
        style={{ boxShadow: `inset 0 0 0 26px ${palette.soft}66` }}
      />
      <div className="absolute -left-20 bottom-28 h-24 w-[34rem] rotate-[-13deg] rounded-full bg-white/70 blur-[1px]" />
      <div
        className="absolute bottom-20 right-9 h-24 w-24 rounded-[1.45rem] opacity-70 max-sm:h-[4.5rem] max-sm:w-[4.5rem]"
        style={{
          backgroundImage: `linear-gradient(45deg, ${palette.checker} 25%, transparent 25%, transparent 75%, ${palette.checker} 75%), linear-gradient(45deg, ${palette.checker} 25%, transparent 25%, transparent 75%, ${palette.checker} 75%)`,
          backgroundPosition: '0 0, 10px 10px',
          backgroundSize: '20px 20px'
        }}
      />
      <div className="absolute left-8 top-36 h-28 w-28 rounded-full border border-current/40 opacity-45" style={{ color: palette.text }} />
      <div className="absolute left-20 top-44 h-16 w-16 rounded-full bg-white/28" />
    </div>
  );
}

function SpotCard({
  spot,
  stackIndex = 0,
  expanded = false,
  current = false,
  onAdd,
  onSkip,
  onDetails,
  onCollapse,
  cardRef
}: {
  spot: Spot;
  stackIndex?: number;
  expanded?: boolean;
  current?: boolean;
  onAdd?: () => void;
  onSkip?: () => void;
  onDetails?: () => void;
  onCollapse?: () => void;
  cardRef?: Ref<HTMLDivElement>;
}) {
  const region = prefectures[spot.region];
  const palette = regionPalettes[spot.region];
  const images = spotImages[spot.id] || [];
  const details = detailBlocks(spot.details);
  const point = spotPoint(spot);
  const cardStyle = {
    backgroundColor: palette.card,
    color: palette.text,
    '--card-accent': palette.accent,
    '--card-soft': palette.soft,
    '--card-muted': palette.muted,
    '--card-glow': palette.glow
  } as React.CSSProperties;

  return (
    <article
      ref={cardRef}
      className={cn(
        'absolute inset-0 overflow-hidden rounded-[2.15rem] border border-white/60 shadow-[0_40px_120px_rgba(0,0,0,.42)] will-change-transform touch-none select-none',
        current ? 'z-30 cursor-grab active:cursor-grabbing' : 'pointer-events-none',
        stackIndex > 0 && 'origin-bottom'
      )}
      style={{
        ...cardStyle,
        transform: stackIndex > 0 ? `translate3d(0, ${stackIndex * 13}px, 0) scale(${1 - stackIndex * 0.047}) rotate(${stackIndex % 2 ? -1.2 : 1.1}deg)` : undefined,
        opacity: stackIndex > 2 ? 0 : 1
      }}
      data-card-state={current ? 'current' : 'queued'}
      data-intent="idle"
      aria-label={`${spot.name} 景点卡片`}
      aria-hidden={!current}
    >
      <ArtOrbit palette={palette} />

      <div className="relative z-10 grid h-full grid-rows-[minmax(200px,46%)_1fr] max-sm:grid-rows-[minmax(190px,43%)_1fr]">
        <div className="relative m-3 mb-0 overflow-hidden rounded-[1.65rem] border border-white/75 bg-black/10 shadow-[inset_0_0_0_1px_rgba(255,255,255,.22)]">
          <img className="h-full min-h-[190px] w-full object-cover saturate-[1.08]" src={primaryImage(spot)} alt={`${spot.name} 核心参考图`} draggable={false} />
          <div className="absolute inset-0 bg-gradient-to-b from-black/8 via-transparent to-black/52" />
          <div className="absolute left-3 top-3 flex flex-wrap gap-2 text-[11px] font-black">
            <span className="rounded-full border border-white/55 bg-white/82 px-2.5 py-1 text-stone-900">{region.name}</span>
            <span className="rounded-full border border-white/45 bg-white/66 px-2.5 py-1 text-stone-900">{spot.days}</span>
            <span className="rounded-full border border-white/45 bg-white/66 px-2.5 py-1 text-stone-900">{spot.label}</span>
          </div>
          <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-3 text-white">
            <div className="min-w-0">
              <p className="m-0 font-mono text-[10px] font-black uppercase tracking-[0.18em] opacity-85">{region.kana} · {spot.type}</p>
              <h2 className="m-0 max-w-[14ch] text-[clamp(2rem,9vw,3.65rem)] font-black leading-[.92] tracking-[-0.045em] drop-shadow-[0_5px_18px_rgba(0,0,0,.3)]">{spot.name}</h2>
            </div>
            <div className="hidden h-20 w-24 shrink-0 overflow-hidden rounded-[1.1rem] border border-white/55 bg-white/20 backdrop-blur sm:block">
              <RegionMiniMap spot={spot} />
            </div>
          </div>
        </div>

        <div className="relative grid content-between gap-3 p-4 pb-[4.85rem] pt-3 sm:p-5 sm:pb-[5.1rem] sm:pt-4">
          <div className="grid gap-3">
            <p className="m-0 line-clamp-3 text-[15px] font-bold leading-6 max-sm:text-[14px] max-sm:leading-6" style={{ color: palette.text }}>{summarizeList(spot.details.overview)}</p>
            <div className="grid grid-cols-3 gap-2 text-[11px] font-black leading-snug tracking-[0.02em]">
              <div className="rounded-2xl border border-white/45 bg-white/40 p-2.5">
                <span className="block opacity-60">位置</span>
                <b>{region.name}</b>
              </div>
              <div className="rounded-2xl border border-white/45 bg-white/40 p-2.5">
                <span className="block opacity-60">主题</span>
                <b>{spot.label}</b>
              </div>
              <div className="rounded-2xl border border-white/45 bg-white/40 p-2.5">
                <span className="block opacity-60">图库</span>
                <b>{images.length || 1} 张</b>
              </div>
            </div>
          </div>

          {expanded && (
            <div className="absolute inset-x-3 bottom-[4.7rem] z-30 grid max-h-[min(50dvh,350px)] gap-2 overflow-y-auto rounded-[1.55rem] border border-white/18 bg-[#101114]/88 p-3 pr-2 text-white shadow-[0_20px_60px_rgba(0,0,0,.38)] backdrop-blur-2xl max-sm:max-h-[44dvh] sm:grid-cols-2" data-expanded-details>
              {details.map(block => (
                <section key={block.id} className="rounded-[1rem] border border-white/10 bg-white/[0.08] p-2.5">
                  <h3 className="m-0 mb-0.5 text-[12px] font-black tracking-[0.03em] text-white/74">{block.title}</h3>
                  <ul className="m-0 grid gap-1 p-0 text-[12px] leading-5 marker:text-white/50">
                    {block.items.map((item, index) => <li className="ml-4" key={`${block.id}-${index}`}>{item}</li>)}
                  </ul>
                </section>
              ))}
              {spot.source && (
                <a className="justify-self-start rounded-full border border-white/12 bg-white/[0.08] px-3 py-1.5 text-xs font-black text-white/86 hover:bg-white/[0.14] sm:col-span-2" href={spot.source} target="_blank" rel="noreferrer">
                  {sourceLabel(spot.source)}
                </a>
              )}
            </div>
          )}
        </div>

        <div className="absolute inset-x-3 bottom-3 z-40 grid grid-cols-[1fr_1.25fr_1fr] gap-2">
          <button type="button" className="inline-flex min-h-11 items-center justify-center gap-1 rounded-full border border-white/52 bg-white/52 px-3 text-sm font-black text-current backdrop-blur transition hover:bg-white/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white" onClick={onSkip} aria-label={`暂不加入 ${spot.name}`} disabled={!current} tabIndex={current ? 0 : -1}>
            <ArrowLeft className="h-4 w-4" /> 暂不
          </button>
          <button type="button" className="inline-flex min-h-11 items-center justify-center gap-1 rounded-full border border-white/52 bg-white/50 px-3 text-sm font-black text-current backdrop-blur transition hover:bg-white/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white" onClick={expanded ? onCollapse : onDetails} aria-label={`${expanded ? '收起' : '展开'} ${spot.name} 详情`} disabled={!current} tabIndex={current ? 0 : -1}>
            <ChevronDown className={cn('h-4 w-4 transition-transform', expanded && 'rotate-180')} /> {expanded ? '收起详情' : '看详情'}
          </button>
          <button type="button" className="inline-flex min-h-11 items-center justify-center gap-1 rounded-full border border-white/70 bg-white/90 px-3 text-sm font-black text-current shadow-[0_10px_26px_rgba(0,0,0,.16)] transition hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white" onClick={onAdd} aria-label={`加入 ${spot.name} 到清单`} disabled={!current} tabIndex={current ? 0 : -1}>
            加入 <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-6 top-1/2 z-20 flex -translate-y-1/2 items-center justify-between opacity-0 transition-opacity data-[visible=true]:opacity-100" data-swipe-hint>
        <span className="rounded-full border border-white/60 bg-white/86 px-4 py-2 text-sm font-black text-stone-900 shadow-lg"><X className="mr-1 inline h-4 w-4" />略过</span>
        <span className="rounded-full border border-white/60 bg-white/86 px-4 py-2 text-sm font-black text-stone-900 shadow-lg"><Plus className="mr-1 inline h-4 w-4" />加入</span>
      </div>
    </article>
  );
}

function EmptyDeck({ onReset }: { onReset: () => void }) {
  return (
    <div className="absolute inset-0 grid place-items-center rounded-[2.15rem] border border-white/12 bg-white/[0.08] p-7 text-center shadow-[0_30px_90px_rgba(0,0,0,.28)] backdrop-blur-xl">
      <div className="grid max-w-sm gap-4">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-white text-black"><ListChecks className="h-8 w-8" /></div>
        <h2 className="m-0 text-3xl font-black tracking-[-0.04em] text-white">这一轮筛完了</h2>
        <p className="m-0 leading-7 text-white/70">可以打开右上角清单继续删改，或重置重新刷一轮景点卡片。</p>
        <ChromeButton onClick={onReset}><RotateCcw className="h-4 w-4" />重新开始</ChromeButton>
      </div>
    </div>
  );
}

function GeneratedMap({ selectedSpots, activeId, onActive }: { selectedSpots: Spot[]; activeId: string | null; onActive: (id: string) => void }) {
  const points = selectedSpots.map(spot => spotPoint(spot));
  const line = points.map(point => `${point.x},${point.y}`).join(' ');
  const regionCounts = regionOrder.map(id => ({ region: prefectures[id], count: selectedSpots.filter(spot => spot.region === id).length }));

  return (
    <section className="overflow-hidden rounded-[1.55rem] border border-white/10 bg-white/[0.06]">
      <header className="flex items-center justify-between gap-3 border-b border-white/10 p-3">
        <div>
          <p className="m-0 font-mono text-[10px] font-black uppercase tracking-[0.18em] text-white/42">Generated marker map</p>
          <h2 className="m-0 text-lg font-black text-white">地图标记图</h2>
        </div>
        <span className="rounded-full border border-white/12 bg-white/[0.08] px-3 py-1 text-xs font-black text-white/76">{selectedSpots.length} 个已加入</span>
      </header>
      <div className="relative aspect-[4/3] min-h-[210px] bg-[#11161c] max-sm:min-h-[185px]">
        <svg className="h-full w-full" viewBox={shikokuViewBox} role="img" aria-label="已加入景点在四国地图上的分布">
          <defs>
            <radialGradient id="cartMapSea" cx="50%" cy="38%" r="80%">
              <stop stopColor="#1d252d" />
              <stop offset="1" stopColor="#0c1015" />
            </radialGradient>
            <filter id="cartMapShadow"><feDropShadow dx="0" dy="9" stdDeviation="8" floodColor="#000000" floodOpacity=".34" /></filter>
          </defs>
          <rect width="760" height="520" rx="34" fill="url(#cartMapSea)" />
          <g transform="translate(-48 -18) scale(1.05)" filter="url(#cartMapShadow)">
            {Object.values(prefectures).map(prefecture => (
              <path key={prefecture.id} d={prefecturePaths[prefecture.id]} fill={prefecture.tone} opacity="0.58" stroke="rgba(255,255,255,.22)" strokeWidth="1.4" />
            ))}
            {selectedSpots.length > 1 && <polyline points={line} fill="none" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="8 8" opacity="0.42" />}
            {selectedSpots.map((spot, index) => {
              const point = spotPoint(spot);
              const isActive = activeId === spot.id;
              return (
                <g
                  key={spot.id}
                  transform={`translate(${point.x} ${point.y})`}
                  role="button"
                  tabIndex={0}
                  aria-label={`清单第 ${index + 1} 个：${spot.name}`}
                  onClick={() => onActive(spot.id)}
                  onKeyDown={event => activateByKeyboard(event, () => onActive(spot.id))}
                >
                  <circle r={isActive ? 17 : 13} fill={isActive ? '#ffffff' : '#11161c'} stroke="#ffffff" strokeWidth="2.4" />
                  <text y="4" textAnchor="middle" fontSize="11" fontWeight="900" fill={isActive ? '#11161c' : '#ffffff'}>{index + 1}</text>
                  {selectedSpots.length <= 8 && (
                    <text x="18" y="-11" fontSize="10.5" fontWeight="800" fill="#ffffff" paintOrder="stroke" stroke="#11161c" strokeWidth="3.2" strokeLinejoin="round">{spot.name}</text>
                  )}
                </g>
              );
            })}
          </g>
        </svg>
        {!selectedSpots.length && (
          <div className="absolute inset-0 grid place-items-center p-5 text-center">
            <div className="max-w-xs rounded-[1.3rem] border border-white/12 bg-black/35 p-4 shadow-sm backdrop-blur-md">
              <MapPinned className="mx-auto mb-2 h-7 w-7 text-white" />
              <b className="text-sm text-white/82">把心动景点加入清单后，这里会生成分布图。</b>
            </div>
          </div>
        )}
      </div>
      <div className="grid grid-cols-4 gap-2 border-t border-white/10 p-3 max-sm:grid-cols-2">
        {regionCounts.map(({ region, count }) => (
          <button
            key={region.id}
            type="button"
            className="rounded-[1rem] border border-white/10 bg-white/[0.06] p-2 text-left text-xs font-black text-white/82 transition hover:bg-white/[0.1]"
            onClick={() => {
              const first = selectedSpots.find(spot => spot.region === region.id);
              if (first) onActive(first.id);
            }}
          >
            <span className="mb-1 block h-2 w-10 rounded-full" style={{ backgroundColor: region.tone }} />
            {region.name}<span className="ml-1 text-white/46">{count}</span>
          </button>
        ))}
      </div>
    </section>
  );
}

function CartDrawer({
  open,
  selectedSpots,
  activeId,
  skippedCount,
  remainingCount,
  onClose,
  onActive,
  onRemove,
  onClear,
  onReset
}: {
  open: boolean;
  selectedSpots: Spot[];
  activeId: string | null;
  skippedCount: number;
  remainingCount: number;
  onClose: () => void;
  onActive: (id: string) => void;
  onRemove: (id: string) => void;
  onClear: () => void;
  onReset: () => void;
}) {
  return (
    <>
      <button
        type="button"
        className={cn('fixed inset-0 z-[70] bg-black/45 backdrop-blur-sm transition-opacity', open ? 'opacity-100' : 'pointer-events-none opacity-0')}
        aria-label="关闭景点清单"
        onClick={onClose}
      />
      <aside
        className={cn(
          'fixed right-3 top-3 z-[80] grid h-[calc(100dvh-1.5rem)] w-[min(430px,calc(100vw-1.5rem))] grid-rows-[auto_minmax(0,1fr)] overflow-hidden rounded-[2rem] border border-white/14 bg-[#111318]/92 text-white shadow-[0_30px_120px_rgba(0,0,0,.55)] backdrop-blur-2xl transition-transform duration-300 ease-out max-sm:inset-x-2 max-sm:bottom-2 max-sm:top-auto max-sm:h-[min(78dvh,720px)] max-sm:w-auto max-sm:rounded-[1.7rem]',
          open ? 'translate-x-0 max-sm:translate-y-0' : 'translate-x-[calc(100%+1rem)] max-sm:translate-x-0 max-sm:translate-y-[calc(100%+1rem)]'
        )}
        aria-label="景点清单"
        aria-hidden={!open}
      >
        <header className="border-b border-white/10 p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="m-0 font-mono text-[10px] font-black uppercase tracking-[0.18em] text-white/42">Trip cart</p>
              <h2 className="m-0 text-2xl font-black tracking-[-0.04em]">景点清单</h2>
            </div>
            <button type="button" className="grid h-10 w-10 place-items-center rounded-full border border-white/12 bg-white/[0.08] text-white/76 transition hover:bg-white/[0.14]" onClick={onClose} aria-label="关闭清单"><X className="h-5 w-5" /></button>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs font-black text-white/62">
            <div className="rounded-2xl bg-white/[0.06] p-2.5"><b className="block text-lg text-white">{selectedSpots.length}</b>已加入</div>
            <div className="rounded-2xl bg-white/[0.06] p-2.5"><b className="block text-lg text-white">{skippedCount}</b>暂不</div>
            <div className="rounded-2xl bg-white/[0.06] p-2.5"><b className="block text-lg text-white">{remainingCount}</b>待筛</div>
          </div>
        </header>

        <div className="grid min-h-0 gap-3 overflow-y-auto p-4">
          <div className="flex gap-2">
            <ChromeButton className="min-h-10 flex-1 px-3 text-xs" onClick={onReset}><RotateCcw className="h-4 w-4" />重置全部</ChromeButton>
            <ChromeButton className="min-h-10 flex-1 px-3 text-xs" onClick={onClear} disabled={!selectedSpots.length}><Trash2 className="h-4 w-4" />清空清单</ChromeButton>
          </div>

          <section className="rounded-[1.55rem] border border-white/10 bg-white/[0.06] p-3">
            <div className="mb-3 flex items-center justify-between gap-2">
              <h3 className="m-0 text-base font-black">已加入</h3>
              <span className="rounded-full bg-white/[0.08] px-2.5 py-1 text-xs font-black text-white/56">可随时删改</span>
            </div>
            <div className="grid max-h-[28dvh] gap-2 overflow-y-auto pr-1 max-sm:max-h-[22dvh]" data-cart-list>
              {selectedSpots.length ? selectedSpots.map((spot, index) => {
                const region = prefectures[spot.region];
                const active = activeId === spot.id;
                return (
                  <article key={spot.id} className={cn('grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-[1.25rem] border p-2.5 transition-colors', active ? 'border-white/30 bg-white/[0.14]' : 'border-white/10 bg-black/20')}>
                    <button type="button" className="grid h-9 w-9 place-items-center rounded-full text-sm font-black text-white" style={{ backgroundColor: region.tone }} onClick={() => onActive(spot.id)} aria-label={`高亮 ${spot.name}`}>{index + 1}</button>
                    <button type="button" className="min-w-0 text-left" onClick={() => onActive(spot.id)}>
                      <b className="block truncate text-[15px] text-white">{spot.name}</b>
                      <span className="block truncate text-xs font-bold text-white/52">{region.name} · {spot.label} · {spot.days}</span>
                    </button>
                    <button type="button" className="grid h-9 w-9 place-items-center rounded-full border border-white/10 bg-white/[0.06] text-white/70 transition hover:bg-white/[0.12]" onClick={() => onRemove(spot.id)} aria-label={`从清单移除 ${spot.name}`}><X className="h-4 w-4" /></button>
                  </article>
                );
              }) : (
                <div className="rounded-[1.25rem] border border-dashed border-white/16 bg-black/20 p-5 text-sm font-bold leading-7 text-white/56">
                  清单还为空。遇到想去的地方，点“加入”收进这里。
                </div>
              )}
            </div>
          </section>

          <GeneratedMap selectedSpots={selectedSpots} activeId={activeId} onActive={onActive} />
        </div>
      </aside>
    </>
  );
}

function StatusRail({ acceptedCount, skippedCount, remainingCount, progress, onOpenCart, onReset }: { acceptedCount: number; skippedCount: number; remainingCount: number; progress: number; onOpenCart: () => void; onReset: () => void }) {
  return (
    <aside className="app-chrome hidden min-w-0 content-center gap-4 lg:grid">
      <div className="rounded-[2rem] border border-white/12 bg-white/[0.07] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,.12)] backdrop-blur-2xl">
        <p className="m-0 font-mono text-[10px] font-black uppercase tracking-[0.18em] text-white/42">Shikoku cards</p>
        <h1 className="m-0 mt-2 text-[clamp(2.2rem,4.6vw,4.6rem)] font-black leading-[.9] tracking-[-0.07em] text-white">
          四国景点<br />灵感卡片
        </h1>
        <p className="mt-4 max-w-sm text-sm font-bold leading-7 text-white/62">
          从栗林公园、小豆岛、直岛到祖谷溪，把想去的地方收进清单，再看它们在四国的分布。
        </p>
      </div>
      <div className="rounded-[2rem] border border-white/12 bg-white/[0.07] p-4 backdrop-blur-2xl">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <p className="m-0 font-mono text-[10px] font-black uppercase tracking-[0.18em] text-white/42">Decision</p>
            <h2 className="m-0 text-lg font-black text-white">筛选进度</h2>
          </div>
          <button className="rounded-full border border-white/12 bg-white/[0.08] px-3 py-1.5 text-xs font-black text-white/70" type="button" onClick={onReset}>重置</button>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-white/10">
          <div className="h-full rounded-full bg-white transition-[width] duration-300" style={{ width: `${progress}%` }} />
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs font-black text-white/54">
          <div className="rounded-2xl bg-white/[0.06] p-3"><b className="block text-lg text-white">{acceptedCount}</b>已加入</div>
          <div className="rounded-2xl bg-white/[0.06] p-3"><b className="block text-lg text-white">{skippedCount}</b>暂不</div>
          <div className="rounded-2xl bg-white/[0.06] p-3"><b className="block text-lg text-white">{remainingCount}</b>待筛</div>
        </div>
        <ChromeButton className="mt-4 w-full bg-white text-black hover:bg-white/90" onClick={onOpenCart}><ShoppingBag className="h-4 w-4" />打开景点清单</ChromeButton>
      </div>
    </aside>
  );
}

export function CardDiscoveryPage() {
  const rootRef = useRef<HTMLElement | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const animatingRef = useRef(false);
  const [acceptedIds, setAcceptedIds] = useState<string[]>([]);
  const [skippedIds, setSkippedIds] = useState<string[]>([]);
  const [expanded, setExpanded] = useState(false);
  const [activeListId, setActiveListId] = useState<string | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const deck = useMemo(deckSpots, []);
  const acceptedSet = useMemo(() => new Set(acceptedIds), [acceptedIds]);
  const skippedSet = useMemo(() => new Set(skippedIds), [skippedIds]);
  const remaining = deck.filter(spot => !acceptedSet.has(spot.id) && !skippedSet.has(spot.id));
  const currentSpot = remaining[0] ?? null;
  const queuedSpots = remaining.slice(0, 4);
  const selectedSpots = acceptedIds.map(id => deck.find(spot => spot.id === id)).filter((spot): spot is Spot => Boolean(spot));
  const progress = Math.round(((deck.length - remaining.length) / deck.length) * 100);

  const finalizeDecision = (spot: Spot, decision: SwipeDecision) => {
    if (decision === 'add') {
      setAcceptedIds(prev => {
        const next = prev.includes(spot.id) ? prev : [...prev, spot.id];
        if (!prev.length && next.length) setCartOpen(true);
        return next;
      });
      setSkippedIds(prev => prev.filter(id => id !== spot.id));
      setActiveListId(spot.id);
    } else {
      setSkippedIds(prev => prev.includes(spot.id) ? prev : [...prev, spot.id]);
    }
    setExpanded(false);
    animatingRef.current = false;
  };

  const commitDecision = (decision: SwipeDecision, source: 'drag' | 'button' = 'button') => {
    if (!currentSpot || animatingRef.current) return;
    const element = cardRef.current;
    animatingRef.current = true;
    const direction = decision === 'add' ? 1 : -1;
    if (element) {
      element.dataset.intent = decision === 'add' ? 'join' : 'skip';
      const distance = source === 'drag' ? direction * window.innerWidth * 0.95 : direction * 520;
      gsap.to(element, {
        x: distance,
        y: source === 'drag' ? '+=18' : -20,
        rotation: direction * 18,
        autoAlpha: 0,
        scale: 0.92,
        duration: 0.34,
        ease: 'power3.in',
        onComplete: () => {
          gsap.set(element, { clearProps: 'transform,opacity,visibility' });
          element.dataset.intent = 'idle';
          finalizeDecision(currentSpot, decision);
        }
      });
      return;
    }
    finalizeDecision(currentSpot, decision);
  };

  const revealDetails = () => {
    if (!currentSpot || animatingRef.current) return;
    setExpanded(true);
    if (cardRef.current) {
      cardRef.current.dataset.intent = 'detail';
      gsap.to(cardRef.current, { x: 0, y: 0, rotation: 0, scale: 1, duration: 0.38, ease: 'elastic.out(1, 0.72)', onComplete: () => {
        if (cardRef.current) cardRef.current.dataset.intent = 'idle';
      } });
    }
  };

  const collapseDetails = () => {
    setExpanded(false);
    if (cardRef.current) gsap.fromTo(cardRef.current, { scale: 0.985 }, { scale: 1, duration: 0.24, ease: 'power2.out' });
  };

  const resetAll = () => {
    setAcceptedIds([]);
    setSkippedIds([]);
    setActiveListId(null);
    setExpanded(false);
    setCartOpen(false);
    animatingRef.current = false;
  };

  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add(
      {
        reduceMotion: '(prefers-reduced-motion: reduce)',
        okMotion: '(prefers-reduced-motion: no-preference)'
      },
      context => {
        if (context.conditions?.reduceMotion) return;
        const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
        tl.from('.app-chrome', { y: 18, autoAlpha: 0, duration: 0.54, stagger: 0.06 })
          .from('.deck-stage', { y: 24, scale: 0.96, autoAlpha: 0, duration: 0.58 }, '<0.08')
          .to('.ambient-orb', { xPercent: 5, yPercent: -4, rotation: 2.2, repeat: -1, yoyo: true, duration: 5.2, ease: 'sine.inOut' }, 0);
      }
    );
    return () => mm.revert();
  }, { scope: rootRef });

  useGSAP(() => {
    const element = cardRef.current;
    if (!element || !currentSpot) return;
    const hint = element.querySelector('[data-swipe-hint]') as HTMLElement | null;
    gsap.set(element, { x: 0, y: 0, rotation: 0, scale: 1, autoAlpha: 1 });
    element.dataset.intent = 'idle';

    const updateIntent = (intent: GestureIntent) => {
      element.dataset.intent = intent;
      if (hint) hint.dataset.visible = intent === 'join' || intent === 'skip' ? 'true' : 'false';
    };

    const [drag] = Draggable.create(element, {
      type: 'x,y',
      edgeResistance: 0.82,
      allowNativeTouchScrolling: false,
      dragResistance: 0.08,
      cursor: 'grab',
      activeCursor: 'grabbing',
      onDrag() {
        const power = gsap.utils.clamp(-1, 1, this.x / 190);
        const vertical = gsap.utils.clamp(0, 1, this.y / 150);
        gsap.set(element, { rotation: power * 11, scale: 1 - vertical * 0.025 });
        const ax = Math.abs(this.x);
        const ay = Math.abs(this.y);
        if (ax > 36 && ax > ay * 0.75) updateIntent(this.x > 0 ? 'join' : 'skip');
        else if (this.y > 52 && ay > ax * 0.72) updateIntent('detail');
        else updateIntent('idle');
      },
      onDragEnd() {
        const ax = Math.abs(this.x);
        const ay = Math.abs(this.y);
        if (ax > 110 && ax > ay * 0.72) {
          commitDecision(this.x > 0 ? 'add' : 'skip', 'drag');
          return;
        }
        if (this.y > 92 && ay > ax * 0.68) {
          revealDetails();
          updateIntent('idle');
          return;
        }
        updateIntent('idle');
        gsap.to(element, { x: 0, y: 0, rotation: 0, scale: 1, duration: 0.35, ease: 'elastic.out(1, 0.72)' });
      }
    });

    return () => drag.kill();
  }, { scope: rootRef, dependencies: [currentSpot?.id] });

  useGSAP(() => {
    if (!cardRef.current || !currentSpot) return;
    gsap.fromTo(cardRef.current, { y: 22, scale: 0.965, autoAlpha: 0 }, { y: 0, scale: 1, autoAlpha: 1, duration: 0.38, ease: 'power3.out' });
  }, { scope: rootRef, dependencies: [currentSpot?.id] });

  return (
    <main ref={rootRef} className="relative h-dvh max-h-dvh w-full overflow-hidden bg-[#090b10] text-white">
      <div className="ambient-orb pointer-events-none absolute -left-28 top-12 h-[34rem] w-[34rem] rounded-full bg-[radial-gradient(circle_at_50%_50%,rgba(255,181,38,.23),transparent_62%)] blur-2xl" aria-hidden="true" />
      <div className="ambient-orb pointer-events-none absolute -right-36 bottom-[-12rem] h-[38rem] w-[38rem] rounded-full bg-[radial-gradient(circle_at_50%_50%,rgba(157,140,255,.22),transparent_64%)] blur-2xl" aria-hidden="true" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,.08)_0,transparent_22%,transparent_70%,rgba(255,255,255,.07)_100%)]" aria-hidden="true" />

      <header className="app-chrome absolute inset-x-0 top-0 z-50 flex items-center justify-between gap-2 px-3 py-3 sm:px-5">
        <div className="flex min-w-0 items-center gap-2">
          <Link className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/12 bg-white/[0.08] px-4 py-2 text-sm font-black text-white shadow-[inset_0_1px_0_rgba(255,255,255,.16)] backdrop-blur-xl transition hover:bg-white/[0.14] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/80" to="/">
            <ArrowLeft className="h-4 w-4" />地图
          </Link>
          <Link className="hidden min-h-11 items-center rounded-full border border-white/12 bg-white/[0.05] px-4 py-2 text-sm font-black text-white/68 backdrop-blur-xl transition hover:bg-white/[0.1] sm:inline-flex" to="/gallery">
            图库
          </Link>
        </div>
        <div className="pointer-events-none absolute left-1/2 top-3 hidden -translate-x-1/2 rounded-full border border-white/10 bg-black/25 px-4 py-2 text-center font-mono text-[10px] font-black uppercase tracking-[0.2em] text-white/46 backdrop-blur-xl sm:block">
          四国景点卡片
        </div>
        <ChromeButton className="relative bg-white text-black hover:bg-white/90" onClick={() => setCartOpen(true)} aria-label={`打开景点清单，已加入 ${acceptedIds.length} 个`}>
          <ShoppingBag className="h-4 w-4" />清单
          <span className="grid h-5 min-w-5 place-items-center rounded-full bg-black px-1.5 text-[11px] leading-none text-white">{acceptedIds.length}</span>
        </ChromeButton>
      </header>

      <section className="relative z-10 grid h-full grid-cols-[minmax(330px,620px)_minmax(280px,360px)] items-center justify-center gap-[clamp(1rem,4vw,4rem)] px-3 pb-4 pt-[4.65rem] max-lg:grid-cols-1 max-lg:place-items-center max-sm:px-2 max-sm:pb-3 max-sm:pt-[4.35rem]" aria-label="全屏卡片式景点展示与清单生成">
        <div className="deck-stage relative h-[min(720px,calc(100dvh-6.25rem))] min-h-[520px] w-full max-w-[560px] max-sm:h-[calc(100dvh-5.4rem)] max-sm:min-h-0 max-sm:max-w-none" aria-live="polite">
          {queuedSpots.slice(1).reverse().map((spot, index) => (
            <SpotCard key={spot.id} spot={spot} stackIndex={queuedSpots.length - index - 1} />
          ))}
          {currentSpot ? (
            <SpotCard
              key={currentSpot.id}
              spot={currentSpot}
              current
              expanded={expanded}
              onAdd={() => commitDecision('add')}
              onSkip={() => commitDecision('skip')}
              onDetails={revealDetails}
              onCollapse={collapseDetails}
              cardRef={cardRef}
            />
          ) : <EmptyDeck onReset={resetAll} />}
        </div>

        <StatusRail
          acceptedCount={acceptedIds.length}
          skippedCount={skippedIds.length}
          remainingCount={remaining.length}
          progress={progress}
          onOpenCart={() => setCartOpen(true)}
          onReset={resetAll}
        />
      </section>

      <CartDrawer
        open={cartOpen}
        selectedSpots={selectedSpots}
        activeId={activeListId}
        skippedCount={skippedIds.length}
        remainingCount={remaining.length}
        onClose={() => setCartOpen(false)}
        onActive={setActiveListId}
        onRemove={id => setAcceptedIds(prev => prev.filter(item => item !== id))}
        onClear={() => { setAcceptedIds([]); setActiveListId(null); }}
        onReset={resetAll}
      />

      {currentSpot && (
        <Link className="app-chrome absolute bottom-3 right-3 z-50 hidden min-h-11 items-center gap-2 rounded-full border border-white/12 bg-white/[0.08] px-4 py-2 text-sm font-black text-white backdrop-blur-xl transition hover:bg-white/[0.14] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/80 lg:inline-flex" to={`/?region=${currentSpot.region}&spot=${currentSpot.id}`}>
          <Navigation2 className="h-4 w-4" />在地图中看
        </Link>
      )}
    </main>
  );
}
