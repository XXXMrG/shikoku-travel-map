import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { extraSpots, prefectures } from '@/content/travelData';
import type { RegionId, Spot } from '@/content/types';

type AttractionPickerProps = {
  regionId: RegionId;
  selectedSpot: Spot | null;
  onSpot: (spot: Spot) => void;
};

export function AttractionPicker({ regionId, selectedSpot, onSpot }: AttractionPickerProps) {
  const items = extraSpots.filter(spot => spot.region === regionId);

  return (
    <Card className="sticky top-3 min-w-0 rounded-[1.4rem] max-xl:static">
      <CardHeader className="gap-1 pb-3">
        <CardTitle className="text-[15px]">{prefectures[regionId].name}景点池</CardTitle>
        <CardDescription>{items.length} 个可选点位，点击后地图和右侧详情同步。</CardDescription>
      </CardHeader>
      <CardContent className="grid max-h-[560px] gap-1.5 overflow-auto pr-2 max-xl:max-h-none max-xl:grid-cols-3 max-xl:overflow-visible max-md:grid-cols-2 max-sm:grid-cols-1">
        {items.map(spot => (
          <Button
            key={spot.id}
            variant={selectedSpot?.id === spot.id ? 'default' : 'chip'}
            size="sm"
            className="h-auto whitespace-normal px-3 py-2 text-center text-xs leading-snug"
            onClick={() => onSpot(spot)}
            title={spot.details.overview[0]}
          >
            {spot.name}
          </Button>
        ))}
      </CardContent>
    </Card>
  );
}
