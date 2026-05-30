import { useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { Draggable } from 'gsap/Draggable';
import { ArrowLeft, ArrowRight, ChevronDown, ListChecks, MapPinned, Navigation2, Plus, RotateCcw, Sparkles, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { SiteHeader } from '@/components/SiteHeader';
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
};

const regionOrder: RegionId[] = ['kagawa', 'tokushima', 'kochi', 'ehime'];
const featuredOrder = [
  'ritsurin', 'shodoshima', 'naoshima', 'naruto', 'otsuka', 'iya', 'kazurabashi',
  'kochi-castle', 'hirome', 'niyodo', 'shimanto', 'matsuyama-castle', 'dogo', 'ozu', 'shimanami'
];

const regionPalettes: Record<RegionId, SpotPalette> = {
  kagawa: {
    card: '#ffb526',
    text: '#251613',
    muted: '#5d3d20',
    accent: '#fff3ca',
    soft: '#ffe8a3',
    checker: '#412018'
  },
  tokushima: {
    card: '#9d8cff',
    text: '#211339',
    muted: '#4d3e77',
    accent: '#fbf4ff',
    soft: '#cec5ff',
    checker: '#26163d'
  },
  kochi: {
    card: '#f48ac1',
    text: '#2a1120',
    muted: '#6e3853',
    accent: '#fff1f7',
    soft: '#ffc5df',
    checker: '#2d1422'
  },
  ehime: {
    card: '#ff7b5f',
    text: '#2b1611',
    muted: '#713627',
    accent: '#fff0e8',
    soft: '#ffc2a9',
    checker: '#351711'
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

function RegionMiniMap({ spot, className }: { spot: Spot; className?: string }) {
  const region = prefectures[spot.region];
  const point = spotPoint(spot);
  return (
    <svg className={cn('block h-full w-full', className)} viewBox={shikokuViewBox} role="img" aria-label={`${spot.name} 在四国地图中的位置`}>
      <rect width="760" height="520" rx="34" fill="rgba(255,255,255,.38)" />
      <g transform="translate(-48 -18) scale(1.05)">
        {Object.values(prefectures).map(prefecture => (
          <path
            key={prefecture.id}
            d={prefecturePaths[prefecture.id]}
            fill={prefecture.id === spot.region ? region.tone : 'rgba(255,255,255,.42)'}
            stroke="rgba(37,22,19,.28)"
            strokeWidth="1.6"
            opacity={prefecture.id === spot.region ? 0.96 : 0.5}
          />
        ))}
        <circle cx={point.x} cy={point.y} r="18" fill="rgba(255,255,255,.84)" stroke="rgba(37,22,19,.5)" strokeWidth="2" />
        <circle cx={point.x} cy={point.y} r="8" fill={region.tone} stroke="white" strokeWidth="2.4" />
      </g>
    </svg>
  );
}

function ArtOrbit({ palette }: { palette: SpotPalette }) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[2rem]" aria-hidden="true">
      <div
        className="absolute -right-24 -top-20 h-[28rem] w-[28rem] rounded-full border-[1.15rem] border-white/85 opacity-90"
        style={{ boxShadow: `inset 0 0 0 28px ${palette.soft}66` }}
      />
      <div className="absolute -left-16 bottom-24 h-24 w-[34rem] rotate-[-13deg] rounded-full bg-white/70 blur-[1px]" />
      <div
        className="absolute bottom-20 right-12 h-24 w-24 rounded-[1.45rem] opacity-75"
        style={{
          backgroundImage: `linear-gradient(45deg, ${palette.checker} 25%, transparent 25%, transparent 75%, ${palette.checker} 75%), linear-gradient(45deg, ${palette.checker} 25%, transparent 25%, transparent 75%, ${palette.checker} 75%)`,
          backgroundPosition: '0 0, 10px 10px',
          backgroundSize: '20px 20px'
        }}
      />
      <div className="absolute left-8 top-36 h-28 w-28 rounded-full border border-current/50 opacity-45" style={{ color: palette.text }} />
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
  cardRef?: React.Ref<HTMLDivElement>;
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
    '--card-muted': palette.muted
  } as React.CSSProperties;

  return (
    <article
      ref={cardRef}
      className={cn(
        'absolute inset-0 overflow-hidden rounded-[2rem] border border-white/55 shadow-[0_28px_80px_rgba(31,19,45,.32)] will-change-transform',
        current ? 'z-30 cursor-grab active:cursor-grabbing' : 'pointer-events-none',
        stackIndex > 0 && 'origin-bottom'
      )}
      style={{
        ...cardStyle,
        transform: stackIndex > 0 ? `translate3d(0, ${stackIndex * 14}px, 0) scale(${1 - stackIndex * 0.045}) rotate(${stackIndex % 2 ? -1.6 : 1.2}deg)` : undefined,
        opacity: stackIndex > 2 ? 0 : 1
      }}
      data-card-state={current ? 'current' : 'queued'}
      data-intent="idle"
      aria-label={`${spot.name} 景点卡片`}
      aria-hidden={!current}
    >
      <ArtOrbit palette={palette} />

      <div className="relative z-10 grid h-full grid-rows-[minmax(220px,48%)_1fr]">
        <div className="relative m-3 mb-0 overflow-hidden rounded-[1.55rem] border border-white/70 bg-black/10 shadow-[inset_0_0_0_1px_rgba(255,255,255,.24)]">
          <img className="h-full min-h-[220px] w-full object-cover saturate-[1.06]" src={primaryImage(spot)} alt={`${spot.name} 核心参考图`} draggable={false} />
          <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/45" />
          <div className="absolute left-3 top-3 flex flex-wrap gap-2">
            <Badge className="border-white/50 bg-white/82 text-stone-900">{region.name}</Badge>
            <Badge className="border-white/40 bg-white/64 text-stone-900">{spot.days}</Badge>
            <Badge className="border-white/40 bg-white/64 text-stone-900">{spot.label}</Badge>
          </div>
          <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-3 text-white">
            <div>
              <p className="m-0 font-mono text-[10px] font-black uppercase tracking-[0.18em] opacity-85">{region.kana} · {spot.type}</p>
              <h2 className="m-0 text-[clamp(2rem,10vw,3.8rem)] font-black leading-[.92] tracking-[-0.045em] drop-shadow-[0_5px_18px_rgba(0,0,0,.28)]">{spot.name}</h2>
            </div>
            <div className="hidden h-20 w-24 overflow-hidden rounded-[1.1rem] border border-white/55 bg-white/20 backdrop-blur sm:block">
              <RegionMiniMap spot={spot} />
            </div>
          </div>
        </div>

        <div className="relative grid content-between gap-3 p-4 pt-3 sm:p-5 sm:pt-4">
          <div className="grid gap-3">
            <p className="m-0 line-clamp-3 text-[15px] font-semibold leading-7" style={{ color: palette.text }}>{summarizeList(spot.details.overview)}</p>
            <div className="grid grid-cols-3 gap-2 text-[11px] font-black leading-snug tracking-[0.02em] max-[420px]:grid-cols-1">
              <div className="rounded-2xl border border-white/45 bg-white/40 p-3">
                <span className="block opacity-60">位置</span>
                <b>{region.name} · {region.mood}</b>
              </div>
              <div className="rounded-2xl border border-white/45 bg-white/40 p-3">
                <span className="block opacity-60">地图坐标</span>
                <b>{Math.round(point.x)} / {Math.round(point.y)}</b>
              </div>
              <div className="rounded-2xl border border-white/45 bg-white/40 p-3">
                <span className="block opacity-60">图库</span>
                <b>{images.length || 1} 张参考图</b>
              </div>
            </div>
          </div>

          {expanded && (
            <div className="grid max-h-[44dvh] gap-2 overflow-y-auto rounded-[1.35rem] border border-white/55 bg-white/55 p-3 pr-2 shadow-inner backdrop-blur-md sm:max-h-[34dvh]" data-expanded-details>
              {details.map(block => (
                <section key={block.id} className="rounded-[1rem] border border-stone-900/10 bg-white/45 p-3">
                  <h3 className="m-0 mb-1 text-[13px] font-black tracking-[0.03em]" style={{ color: palette.muted }}>{block.title}</h3>
                  <ul className="m-0 grid gap-1.5 p-0 text-[13px] leading-6 marker:text-current">
                    {block.items.map((item, index) => <li className="ml-4" key={`${block.id}-${index}`}>{item}</li>)}
                  </ul>
                </section>
              ))}
              {spot.source && (
                <a className="justify-self-start rounded-full border border-stone-900/10 bg-white/65 px-3 py-1.5 text-xs font-black" href={spot.source} target="_blank" rel="noreferrer">
                  {sourceLabel(spot.source)}
                </a>
              )}
            </div>
          )}

          <div className="flex items-center justify-between gap-2">
            <Button type="button" variant="outline" size="sm" className="border-white/50 bg-white/50 text-current hover:bg-white/70" onClick={onSkip} aria-label={`暂不加入 ${spot.name}`} disabled={!current} tabIndex={current ? 0 : -1}>
              <ArrowLeft className="h-4 w-4" /> 暂不
            </Button>
            <Button type="button" variant="outline" size="sm" className="border-white/50 bg-white/50 text-current hover:bg-white/70" onClick={expanded ? onCollapse : onDetails} aria-label={`${expanded ? '收起' : '展开'} ${spot.name} 详情`} disabled={!current} tabIndex={current ? 0 : -1}>
              <ChevronDown className={cn('h-4 w-4 transition-transform', expanded && 'rotate-180')} /> {expanded ? '收起详情' : '下滑看详情'}
            </Button>
            <Button type="button" variant="outline" size="sm" className="border-white/50 bg-white/86 text-current hover:bg-white" onClick={onAdd} aria-label={`加入 ${spot.name} 到清单`} disabled={!current} tabIndex={current ? 0 : -1}>
              加入 <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-6 top-1/2 z-20 flex -translate-y-1/2 items-center justify-between opacity-0 transition-opacity data-[visible=true]:opacity-100" data-swipe-hint>
        <span className="rounded-full border border-white/60 bg-white/80 px-4 py-2 text-sm font-black text-stone-900 shadow-lg"><X className="mr-1 inline h-4 w-4" />略过</span>
        <span className="rounded-full border border-white/60 bg-white/80 px-4 py-2 text-sm font-black text-stone-900 shadow-lg"><Plus className="mr-1 inline h-4 w-4" />加入</span>
      </div>
    </article>
  );
}

function EmptyDeck({ onReset }: { onReset: () => void }) {
  return (
    <div className="absolute inset-0 grid place-items-center rounded-[2rem] border border-white/70 bg-white/65 p-7 text-center shadow-[0_24px_80px_rgba(31,19,45,.18)] backdrop-blur-xl">
      <div className="grid max-w-sm gap-4">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-primary text-primary-foreground"><ListChecks className="h-8 w-8" /></div>
        <h2 className="m-0 text-3xl font-black tracking-[-0.04em] text-primary">这一轮筛完了</h2>
        <p className="m-0 leading-7 text-stone-700">你可以从右侧清单继续删改，或重置重新刷一轮景点卡片。</p>
        <Button type="button" onClick={onReset}><RotateCcw className="h-4 w-4" />重新开始</Button>
      </div>
    </div>
  );
}

function GeneratedMap({ selectedSpots, activeId, onActive }: { selectedSpots: Spot[]; activeId: string | null; onActive: (id: string) => void }) {
  const points = selectedSpots.map(spot => spotPoint(spot));
  const line = points.map(point => `${point.x},${point.y}`).join(' ');
  const regionCounts = regionOrder.map(id => ({ region: prefectures[id], count: selectedSpots.filter(spot => spot.region === id).length }));

  return (
    <Card className="overflow-hidden rounded-[1.75rem] p-0">
      <header className="flex items-center justify-between gap-3 border-b border-stone-900/10 p-4">
        <div>
          <p className="eyebrow mb-1">Generated marker map</p>
          <h2 className="m-0 text-xl font-black text-primary">地图标记图</h2>
        </div>
        <Badge variant="accent">{selectedSpots.length} 个已加入</Badge>
      </header>
      <div className="relative aspect-[4/3] min-h-[280px] bg-[#efe8d6]">
        <svg className="h-full w-full" viewBox={shikokuViewBox} role="img" aria-label="已加入景点在四国地图上的分布">
          <defs>
            <radialGradient id="cardMapSea" cx="50%" cy="38%" r="80%">
              <stop stopColor="#fbf7e8" />
              <stop offset="1" stopColor="#e1d3bc" />
            </radialGradient>
            <filter id="cardMapShadow"><feDropShadow dx="0" dy="9" stdDeviation="8" floodColor="#2b2017" floodOpacity=".16" /></filter>
          </defs>
          <rect width="760" height="520" rx="34" fill="url(#cardMapSea)" />
          <g transform="translate(-48 -18) scale(1.05)" filter="url(#cardMapShadow)">
            {Object.values(prefectures).map(prefecture => (
              <path key={prefecture.id} d={prefecturePaths[prefecture.id]} fill={prefecture.tone} opacity="0.72" stroke="rgba(255,255,255,.72)" strokeWidth="1.4" />
            ))}
            {selectedSpots.length > 1 && <polyline points={line} fill="none" stroke="#2b2017" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="8 8" opacity="0.55" />}
            {selectedSpots.map((spot, index) => {
              const point = spotPoint(spot);
              const isActive = activeId === spot.id;
              return (
                <g key={spot.id} transform={`translate(${point.x} ${point.y})`} role="button" tabIndex={0} aria-label={`清单第 ${index + 1} 个：${spot.name}`} onClick={() => onActive(spot.id)}>
                  <circle r={isActive ? 17 : 13} fill={isActive ? '#24132e' : '#fff9ea'} stroke="#24132e" strokeWidth="2.4" />
                  <text y="4" textAnchor="middle" fontSize="11" fontWeight="900" fill={isActive ? '#fff9ea' : '#24132e'}>{index + 1}</text>
                  {selectedSpots.length <= 10 && (
                    <text x="18" y="-11" fontSize="10.5" fontWeight="800" fill="#24132e" paintOrder="stroke" stroke="#fff9ea" strokeWidth="3.2" strokeLinejoin="round">{spot.name}</text>
                  )}
                </g>
              );
            })}
          </g>
        </svg>
        {!selectedSpots.length && (
          <div className="absolute inset-0 grid place-items-center p-6 text-center">
            <div className="max-w-xs rounded-[1.5rem] border border-white/70 bg-white/72 p-4 shadow-sm backdrop-blur-md">
              <MapPinned className="mx-auto mb-2 h-7 w-7 text-primary" />
              <b className="text-primary">右滑或点击“加入”后，分布图会自动生成。</b>
            </div>
          </div>
        )}
      </div>
      <div className="grid grid-cols-4 gap-2 border-t border-stone-900/10 p-3 max-sm:grid-cols-2">
        {regionCounts.map(({ region, count }) => (
          <button
            key={region.id}
            type="button"
            className="rounded-[1rem] border border-stone-900/10 bg-white/55 p-2 text-left text-xs font-black text-stone-800"
            onClick={() => {
              const first = selectedSpots.find(spot => spot.region === region.id);
              if (first) onActive(first.id);
            }}
          >
            <span className="mb-1 block h-2 w-10 rounded-full" style={{ backgroundColor: region.tone }} />
            {region.name}<span className="ml-1 text-stone-500">{count}</span>
          </button>
        ))}
      </div>
    </Card>
  );
}

function GeneratedList({ selectedSpots, activeId, onActive, onRemove, onClear }: { selectedSpots: Spot[]; activeId: string | null; onActive: (id: string) => void; onRemove: (id: string) => void; onClear: () => void }) {
  return (
    <Card className="rounded-[1.75rem] p-4">
      <header className="mb-3 flex items-start justify-between gap-3">
        <div>
          <p className="eyebrow mb-1">Generated checklist</p>
          <h2 className="m-0 text-xl font-black text-primary">景点清单</h2>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={onClear} disabled={!selectedSpots.length}>清空</Button>
      </header>
      <div className="grid gap-2">
        {selectedSpots.length ? selectedSpots.map((spot, index) => {
          const region = prefectures[spot.region];
          const active = activeId === spot.id;
          return (
            <article key={spot.id} className={cn('grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-[1.25rem] border p-2.5 transition-colors', active ? 'border-primary/35 bg-primary/[0.08]' : 'border-stone-900/10 bg-white/55')}>
              <button type="button" className="grid h-9 w-9 place-items-center rounded-full text-sm font-black text-white" style={{ backgroundColor: region.tone }} onClick={() => onActive(spot.id)} aria-label={`高亮 ${spot.name}`}>{index + 1}</button>
              <button type="button" className="min-w-0 text-left" onClick={() => onActive(spot.id)}>
                <b className="block truncate text-[15px] text-stone-900">{spot.name}</b>
                <span className="block truncate text-xs font-bold text-stone-600">{region.name} · {spot.label} · {spot.days}</span>
              </button>
              <button type="button" className="grid h-8 w-8 place-items-center rounded-full border border-stone-900/10 bg-white/65 text-stone-700" onClick={() => onRemove(spot.id)} aria-label={`从清单移除 ${spot.name}`}><X className="h-4 w-4" /></button>
            </article>
          );
        }) : (
          <div className="rounded-[1.25rem] border border-dashed border-stone-900/20 bg-white/45 p-5 text-sm font-bold leading-7 text-stone-600">
            清单还为空。右滑加入，左滑暂不，下滑展开更多决策信息。
          </div>
        )}
      </div>
    </Card>
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
      setAcceptedIds(prev => prev.includes(spot.id) ? prev : [...prev, spot.id]);
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
        y: source === 'drag' ? '+=24' : -24,
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
      gsap.to(cardRef.current, { x: 0, y: 0, rotation: 0, scale: 1, duration: 0.42, ease: 'elastic.out(1, 0.72)', onComplete: () => {
        if (cardRef.current) cardRef.current.dataset.intent = 'idle';
      } });
    }
  };

  const collapseDetails = () => {
    setExpanded(false);
    if (cardRef.current) gsap.fromTo(cardRef.current, { scale: 0.985 }, { scale: 1, duration: 0.26, ease: 'power2.out' });
  };

  const resetAll = () => {
    setAcceptedIds([]);
    setSkippedIds([]);
    setActiveListId(null);
    setExpanded(false);
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
        tl.from('.cards-hero-line', { y: 30, autoAlpha: 0, duration: 0.72, stagger: 0.08 })
          .from('.deck-stage', { y: 28, scale: 0.96, autoAlpha: 0, duration: 0.72 }, '<0.08')
          .from('.generated-panel', { y: 20, autoAlpha: 0, duration: 0.54, stagger: 0.08 }, '<0.16')
          .to('.floating-ribbon', { xPercent: 4, yPercent: -5, rotation: 2.5, repeat: -1, yoyo: true, duration: 4.8, ease: 'sine.inOut' }, 0);
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
        gsap.to(element, { x: 0, y: 0, rotation: 0, scale: 1, duration: 0.38, ease: 'elastic.out(1, 0.72)' });
      }
    });

    return () => drag.kill();
  }, { scope: rootRef, dependencies: [currentSpot?.id] });

  useGSAP(() => {
    if (!cardRef.current || !currentSpot) return;
    gsap.fromTo(cardRef.current, { y: 26, scale: 0.965, autoAlpha: 0 }, { y: 0, scale: 1, autoAlpha: 1, duration: 0.42, ease: 'power3.out' });
  }, { scope: rootRef, dependencies: [currentSpot?.id] });

  return (
    <main ref={rootRef} className="page-shell relative isolate overflow-hidden pb-12">
      <div className="floating-ribbon pointer-events-none absolute -right-24 top-24 -z-10 h-80 w-80 rounded-full border-[28px] border-white/55 opacity-80 blur-[0.2px]" aria-hidden="true" />
      <div className="floating-ribbon pointer-events-none absolute -left-20 top-80 -z-10 h-[32rem] w-[32rem] rounded-full bg-[radial-gradient(circle_at_50%_50%,rgba(255,181,38,.28),transparent_62%)]" aria-hidden="true" />

      <SiteHeader page="cards" />

      <section className="grid min-h-[calc(100dvh-5.5rem)] grid-cols-[minmax(320px,0.95fr)_minmax(360px,0.78fr)] gap-4 max-xl:grid-cols-1" aria-label="卡片式景点展示与清单生成">
        <div className="grid content-start gap-4">
          <Card className="overflow-hidden rounded-[1.9rem] p-[clamp(1.3rem,3vw,2.7rem)]">
            <div className="grid grid-cols-[1fr_auto] items-start gap-4 max-md:grid-cols-1">
              <div>
                <p className="cards-hero-line eyebrow mb-2">GSAP attraction deck</p>
                <h1 className="cards-hero-line m-0 max-w-4xl text-[clamp(2.35rem,6.8vw,6.2rem)] font-black leading-[0.9] tracking-[-0.065em] text-primary">
                  像翻艺术卡片一样筛景点。
                </h1>
              </div>
              <div className="cards-hero-line grid min-w-[11rem] gap-2 rounded-[1.35rem] border border-primary/10 bg-white/55 p-3 text-sm font-bold text-stone-700 max-md:min-w-0">
                <span className="flex items-center gap-2"><ArrowRight className="h-4 w-4 text-primary" />右滑：加入清单</span>
                <span className="flex items-center gap-2"><ArrowLeft className="h-4 w-4 text-primary" />左滑：暂不加入</span>
                <span className="flex items-center gap-2"><ChevronDown className="h-4 w-4 text-primary" />下滑：展开详情</span>
              </div>
            </div>
            <p className="cards-hero-line mt-4 max-w-3xl text-[15px] font-semibold leading-7 text-stone-700 sm:text-base">
              用参考图那种高饱和艺术卡片语言，把图片、县域位置、动线天数、交通、落脚和取舍规则拆成不同注意力层级。动效只走 transform / opacity，卡片拖拽由 GSAP Draggable 接管。
            </p>
          </Card>

          <div className="deck-stage relative mx-auto h-[min(76dvh,760px)] min-h-[650px] w-full max-w-[620px] max-sm:h-[calc(100dvh-9rem)] max-sm:min-h-[620px]" aria-live="polite">
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
        </div>

        <aside className="grid content-start gap-4 xl:sticky xl:top-4">
          <Card className="generated-panel rounded-[1.75rem] p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <p className="eyebrow mb-1">Decision progress</p>
                <h2 className="m-0 text-xl font-black text-primary">筛选进度</h2>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={resetAll}><RotateCcw className="h-4 w-4" />重置</Button>
            </div>
            <div className="grid gap-3">
              <div className="h-3 overflow-hidden rounded-full bg-stone-900/10">
                <div className="h-full rounded-full bg-primary transition-[width] duration-300" style={{ width: `${progress}%` }} />
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-xs font-black text-stone-700">
                <div className="rounded-2xl bg-white/55 p-3"><b className="block text-lg text-primary">{acceptedIds.length}</b>已加入</div>
                <div className="rounded-2xl bg-white/55 p-3"><b className="block text-lg text-primary">{skippedIds.length}</b>暂不</div>
                <div className="rounded-2xl bg-white/55 p-3"><b className="block text-lg text-primary">{remaining.length}</b>待筛</div>
              </div>
              {currentSpot && (
                <div className="rounded-[1.15rem] border border-primary/10 bg-primary/[0.07] p-3 text-sm font-bold leading-6 text-primary">
                  当前：{currentSpot.name} · {prefectures[currentSpot.region].name}。也可以进入<Link className="mx-1 underline decoration-primary/35 underline-offset-4" to={`/?region=${currentSpot.region}&spot=${currentSpot.id}`}>原地图页定位</Link>。
                </div>
              )}
            </div>
          </Card>

          <div className="generated-panel">
            <GeneratedList selectedSpots={selectedSpots} activeId={activeListId} onActive={setActiveListId} onRemove={id => setAcceptedIds(prev => prev.filter(item => item !== id))} onClear={() => { setAcceptedIds([]); setActiveListId(null); }} />
          </div>
          <div className="generated-panel">
            <GeneratedMap selectedSpots={selectedSpots} activeId={activeListId} onActive={setActiveListId} />
          </div>

          <Card className="generated-panel rounded-[1.75rem] p-4">
            <div className="flex items-start gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground"><Sparkles className="h-5 w-5" /></div>
              <div className="min-w-0">
                <h2 className="m-0 text-lg font-black text-primary">信息没有被压缩掉</h2>
                <p className="m-0 mt-1 text-sm font-semibold leading-7 text-stone-700">卡片首屏只放判断所需的图片、位置和一句理由；下滑后才打开安排、交通、落脚和取舍规则，避免一开始把注意力压垮。</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Badge variant="ochre"><Navigation2 className="mr-1 h-3.5 w-3.5" />地理位置</Badge>
                  <Badge variant="ochre"><MapPinned className="mr-1 h-3.5 w-3.5" />地图分布</Badge>
                  <Badge variant="ochre"><ListChecks className="mr-1 h-3.5 w-3.5" />清单生成</Badge>
                </div>
              </div>
            </div>
          </Card>
        </aside>
      </section>
    </main>
  );
}
