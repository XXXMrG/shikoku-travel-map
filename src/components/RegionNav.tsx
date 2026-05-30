import { Button } from '@/components/ui/button';
import { prefectures } from '@/content/travelData';
import type { RegionId } from '@/content/types';

type RegionNavProps = {
  selectedRegion: RegionId;
  onRegion: (region: RegionId) => void;
};

export function RegionNav({ selectedRegion, onRegion }: RegionNavProps) {
  return (
    <div className="grid grid-cols-4 gap-2 max-md:grid-cols-2" aria-label="四国县域切换">
      {Object.values(prefectures).map(region => (
        <Button
          key={region.id}
          variant={selectedRegion === region.id ? 'atlas' : 'outline'}
          className="h-auto min-w-0 justify-start rounded-2xl px-3 py-2 text-left data-[state=active]:bg-accent"
          data-state={selectedRegion === region.id ? 'active' : 'inactive'}
          onClick={() => onRegion(region.id)}
        >
          <span className="min-w-0">
            <b className="block text-sm text-primary">{region.name}</b>
            <span className="mt-0.5 block truncate text-[11.5px] font-medium text-muted-foreground max-sm:hidden">{region.mood}</span>
          </span>
        </Button>
      ))}
    </div>
  );
}
