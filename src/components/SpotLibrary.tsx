import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { extraSpots, prefectures } from '@/content/travelData';
import type { Spot } from '@/content/types';
import { spotImages } from '@/content/spotImages';
import { imageSource } from '@/utils/images';

type SpotLibraryProps = {
  onSpot: (spot: Spot) => void;
};

export function SpotLibrary({ onSpot }: SpotLibraryProps) {
  return (
    <Card className="mt-3 rounded-[1.5rem] p-3.5" aria-label="四国景点池总览">
      <div className="mb-3 flex justify-between gap-4 text-sm text-muted-foreground max-sm:flex-col max-sm:gap-1">
        <b className="text-primary">四国景点池</b>
        <span>不强行塞进 13 天；先按县域看位置和类型，再决定替换哪个主线日。</span>
      </div>
      <div className="grid grid-cols-4 gap-2.5 max-xl:grid-cols-2 max-sm:grid-cols-1">
        {Object.values(prefectures).map(region => (
          <article key={region.id} className="min-w-0 rounded-[1.1rem] border border-border bg-white/[0.45] p-3">
            <h3 className="m-0 mb-2.5 text-base font-extrabold text-primary">{region.name}</h3>
            {extraSpots.filter(spot => spot.region === region.id).map(spot => {
              const cover = spotImages[spot.id]?.[0];
              return (
                <Button key={spot.id} variant="ghost" className="grid h-auto w-full min-w-0 grid-cols-[58px_minmax(0,1fr)] justify-start gap-x-2 border-t border-stone-900/10 px-0 py-2.5 text-left first:border-t-0" onClick={() => onSpot(spot)}>
                  {cover ? <img className="row-span-2 h-[46px] w-[58px] rounded-xl bg-stone-200 object-cover" src={imageSource(cover.src)} alt={`${spot.name}参考图`} loading="lazy" /> : <span className="row-span-2 h-[46px] w-[58px] rounded-xl bg-muted" />}
                  <b className="block truncate text-sm text-stone-800">{spot.name}</b>
                  <span className="mt-0.5 block truncate text-xs font-medium text-muted-foreground">{spot.label} · {spot.days}</span>
                </Button>
              );
            })}
          </article>
        ))}
      </div>
    </Card>
  );
}
