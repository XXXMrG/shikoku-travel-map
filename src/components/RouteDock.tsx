import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { allSpots, routeDays, variants } from '@/content/travelData';
import type { DecisionMap, Spot } from '@/content/types';

type RouteDockProps = {
  saved: DecisionMap;
  onSpot: (spot: Spot) => void;
};

export function RouteDock({ saved, onSpot }: RouteDockProps) {
  const keepNames = Object.entries(saved)
    .filter(([, value]) => value === 'keep')
    .map(([id]) => allSpots.find(spot => spot.id === id)?.name)
    .filter((name): name is string => Boolean(name));

  return (
    <>
      <Card className="mt-3 rounded-[1.35rem] p-3" aria-label="13天路线简表">
        <div className="mb-2.5 flex justify-between gap-4 text-sm text-muted-foreground max-sm:flex-col max-sm:gap-1">
          <b className="text-primary">13 天骨架</b>
          <span>{keepNames.length ? `已标记保留：${keepNames.join('、')}` : '建议先保留骨架，再从景点池替换：鸣门、仁淀、岛波海道都需要换出时间'}</span>
        </div>
        <div className="grid grid-cols-[repeat(13,minmax(82px,1fr))] gap-1.5 overflow-x-auto pb-0.5 max-sm:grid-cols-[repeat(13,88px)]">
          {routeDays.map(day => {
            const target = allSpots.find(spot => spot.id === day.spot);
            return (
              <Button key={day.d} variant="outline" className="h-auto min-w-[82px] justify-start rounded-2xl px-2 py-2 text-left" title={day.note} onClick={() => target && onSpot(target)}>
                <span>
                  <b className="block font-mono text-xs text-primary">{day.d}</b>
                  <span className="mt-0.5 block whitespace-nowrap text-xs font-medium text-stone-600">{day.t}</span>
                </span>
              </Button>
            );
          })}
        </div>
      </Card>

      <section className="mt-3 grid grid-cols-3 gap-2.5 max-md:grid-cols-1" aria-label="分支提醒">
        {variants.map(([name, text]) => (
          <Card key={name} className="rounded-[1.15rem] p-3.5">
            <Badge variant="accent">{name}</Badge>
            <span className="mt-2 block text-sm leading-6 text-muted-foreground">{text}</span>
          </Card>
        ))}
      </section>
    </>
  );
}
