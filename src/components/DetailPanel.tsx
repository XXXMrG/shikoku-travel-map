import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { detailTabs } from '@/content/travelData';
import type { DecisionMap, DecisionValue, DetailTabId, Prefecture, Spot } from '@/content/types';
import { galleryFor, imageSource } from '@/utils/images';

type DetailPanelProps = {
  region: Prefecture;
  spot: Spot | null;
  tab: DetailTabId;
  onTab: (tab: DetailTabId) => void;
  saved: DecisionMap;
  onSave: (id: string, value: DecisionValue) => void;
};

const decisionLabels: Array<[DecisionValue, string]> = [
  ['keep', '想保留'],
  ['maybe', '待定'],
  ['cut', '可删']
];

export function DetailPanel({ region, spot, tab, onTab, saved, onSave }: DetailPanelProps) {
  const target = spot || region;
  const targetName = target.name;
  const detailSource = spot?.details || region.details;
  const detailLines = detailSource[tab] || [];
  const fullLines = (Object.entries(detailSource) as Array<[DetailTabId, string[]]>).flatMap(([key, lines]) =>
    lines.map(line => `${detailTabs.find(([id]) => id === key)?.[1] || key}｜${line}`)
  );
  const decisionKey = spot?.id || region.id;
  const gallery = galleryFor(spot, region);

  return (
    <Card className="grid min-w-0 grid-cols-[minmax(380px,0.95fr)_minmax(420px,1.05fr)] items-start gap-4 rounded-[1.7rem] p-4 max-lg:block max-lg:p-3">
      <div className="min-w-0 max-lg:mb-4" aria-label={`${targetName}参考图片`}>
        <figure className="m-0 overflow-hidden rounded-[1.5rem] border border-white/75 bg-stone-200 shadow-sm">
          <img className="aspect-[16/10] w-full object-cover saturate-95 contrast-[0.98]" src={imageSource(gallery[0]?.src)} alt={`${targetName}参考图 1`} loading="lazy" />
          <figcaption className="bg-white/60 px-3 py-2.5 text-xs leading-snug text-muted-foreground">{gallery[0]?.caption || targetName}</figcaption>
        </figure>
        <div className="mt-2 grid grid-cols-3 gap-2 max-sm:gap-1.5">
          {gallery.slice(1).map((image, index) => (
            <a key={`${image.src}-${index}`} className="min-w-0 overflow-hidden rounded-2xl border border-white/75 bg-white/50 shadow-sm" href={image.source || image.src} target="_blank" rel="noreferrer" title={image.caption || targetName}>
              <img className="aspect-[4/3] w-full object-cover" src={imageSource(image.src)} alt={`${targetName}参考图 ${index + 2}`} loading="lazy" />
              <span className="block truncate px-2 py-1.5 text-[10.5px] leading-tight text-muted-foreground max-sm:hidden">{image.caption || '参考图'}</span>
            </a>
          ))}
        </div>
      </div>

      <div className="grid min-w-0 content-start gap-3">
        <div className="font-mono text-[11px] font-bold uppercase tracking-[0.1em] text-amber-800/80">{region.kana} · {spot ? spot.label : region.mood}</div>
        <h1 className="m-0 text-[clamp(1.65rem,2.2vw,2.4rem)] font-semibold leading-tight tracking-[0.01em]">{targetName}</h1>
        <p className="m-0 text-[15.5px] leading-7 text-stone-700">{spot ? detailSource.overview[0] : region.summary}</p>
        <div className="flex flex-wrap items-center gap-2">
          <Badge>{spot ? spot.days : '县域'}</Badge>
          <Badge variant="secondary">{region.name} · {spot ? spot.type : 'region'}</Badge>
        </div>
        {spot?.source && (
          <Button asChild variant="outline" size="sm" className="justify-self-start">
            <a href={spot.source} target="_blank" rel="noreferrer">资料来源</a>
          </Button>
        )}

        <div className="flex flex-wrap gap-2" aria-label="旅行取舍标记">
          {decisionLabels.map(([value, label]) => (
            <Button key={value} variant={saved[decisionKey] === value ? 'default' : 'outline'} size="sm" aria-pressed={saved[decisionKey] === value} onClick={() => onSave(decisionKey, value)}>
              {label}
            </Button>
          ))}
        </div>

        <Tabs value={tab} onValueChange={value => onTab(value as DetailTabId)}>
          <TabsList className="grid-cols-5">
            {detailTabs.map(([id, label]) => (
              <TabsTrigger key={id} value={id}>{label}</TabsTrigger>
            ))}
          </TabsList>
          {detailTabs.map(([id, label]) => (
            <TabsContent key={id} value={id}>
              <div className="rounded-2xl border border-border bg-white/50 p-3">
                <b className="mb-2 block text-sm text-primary">{label}</b>
                {(id === tab ? detailLines : detailSource[id]).map(line => <p className="m-0 mt-1.5 text-sm leading-7 text-stone-700" key={line}>{line}</p>)}
              </div>
            </TabsContent>
          ))}
        </Tabs>

        <details className="group">
          <summary className="cursor-pointer list-none rounded-2xl border border-border bg-white/[0.58] px-3 py-2.5 text-center text-sm font-extrabold text-primary transition-colors hover:bg-accent group-open:bg-accent [&::-webkit-details-marker]:hidden">展开完整攻略</summary>
          <div className="mt-2 grid max-h-[250px] gap-2 overflow-auto rounded-2xl border border-border bg-white/50 px-3 py-2.5">
            {fullLines.map(line => <span className="text-[13.5px] leading-6 text-stone-700" key={line}>{line}</span>)}
          </div>
        </details>

        <div className="grid grid-cols-2 gap-2 max-sm:grid-cols-1">
          <div className="rounded-2xl border border-border bg-white/50 p-3"><b className="mb-1.5 block text-sm text-primary">保留</b>{region.keep.map(item => <span className="mt-1.5 block text-[13px] leading-6 text-stone-700" key={item}>{item}</span>)}</div>
          <div className="rounded-2xl border border-border bg-white/50 p-3"><b className="mb-1.5 block text-sm text-primary">避坑</b>{region.avoid.map(item => <span className="mt-1.5 block text-[13px] leading-6 text-stone-700" key={item}>{item}</span>)}</div>
        </div>
      </div>
    </Card>
  );
}
