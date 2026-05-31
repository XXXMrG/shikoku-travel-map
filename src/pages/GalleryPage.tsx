import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { SiteHeader } from '@/components/SiteHeader';
import { allSpots, prefectures } from '@/content/travelData';
import type { Prefecture, Spot } from '@/content/types';
import { spotImages } from '@/content/spotImages';
import { imageSource } from '@/utils/images';

type GalleryGroup = {
  region: Prefecture;
  spots: Spot[];
};

function groupedSpots(): GalleryGroup[] {
  return Object.values(prefectures).map(region => ({
    region,
    spots: allSpots.filter(spot => spot.region === region.id)
  }));
}

function sourceLabel(source: string): string {
  if (!source) return '来源待核';
  try {
    const host = new URL(source).hostname.replace(/^www\./, '');
    return host.includes('wikimedia') ? 'Wikimedia Commons' : host;
  } catch {
    return '资料来源';
  }
}

export function GalleryPage() {
  const groups = groupedSpots();
  const totalImages = Object.values(spotImages).reduce((sum, images) => sum + images.length, 0);

  return (
    <main className="page-shell pb-10">
      <SiteHeader page="gallery" />

      <Card className="mt-3 grid grid-cols-[minmax(260px,0.72fr)_minmax(360px,1.28fr)] items-end gap-6 rounded-[1.75rem] p-[clamp(1.5rem,4vw,3.4rem)] max-lg:grid-cols-1">
        <div>
          <p className="eyebrow mb-2">Attraction image index</p>
          <h1 className="m-0 text-[clamp(2.25rem,5.2vw,4.9rem)] font-semibold leading-none tracking-[0.015em]">景点图片索引</h1>
        </div>
        <div>
          <p className="m-0 max-w-3xl text-[clamp(0.95rem,1.2vw,1.125rem)] leading-8 text-stone-700">按四县和景点整理参考图。先看景点介绍、类型和建议停留，再用图片判断是否值得加入路线。</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Badge variant="accent">{allSpots.length} 个景点</Badge>
            <Badge variant="accent">{totalImages} 张参考图</Badge>
            <Badge variant="accent">按四县分组</Badge>
          </div>
        </div>
      </Card>

      <nav className="mt-3 grid grid-cols-4 gap-2 rounded-[1.4rem] border border-white/80 bg-card/[0.85] p-2 shadow-atlas backdrop-blur-xl max-md:grid-cols-2" aria-label="跳转到县域图片组">
        {groups.map(({ region, spots }) => (
          <Button asChild key={region.id} variant="ghost" className="justify-center">
            <Link to={`#gallery-${region.id}`}>{region.name}<Badge variant="secondary" className="ml-1 px-2 py-0.5 text-[11px]">{spots.length}</Badge></Link>
          </Button>
        ))}
      </nav>

      {groups.map(({ region, spots }) => (
        <Card className="mt-4 rounded-[1.75rem] p-[clamp(1rem,2.2vw,1.9rem)]" id={`gallery-${region.id}`} key={region.id}>
          <header className="mb-4 grid grid-cols-[minmax(180px,0.55fr)_minmax(360px,1.45fr)] items-end gap-4 border-b border-stone-900/10 pb-4 max-lg:grid-cols-1">
            <div>
              <p className="eyebrow mb-2">{region.kana}</p>
              <h2 className="m-0 text-[clamp(1.75rem,3vw,2.875rem)] font-semibold leading-tight">{region.name}</h2>
            </div>
            <p className="m-0 leading-8 text-stone-700">{region.summary}</p>
          </header>
          <div className="grid gap-3.5">
            {spots.map(spot => {
              const images = spotImages[spot.id] || [];
              const overview = spot.details.overview[0] || region.summary;
              return (
                <article className="grid min-w-0 grid-cols-[minmax(240px,0.38fr)_minmax(0,0.62fr)] gap-3.5 rounded-[1.5rem] border border-border bg-white/[0.45] p-3.5 max-xl:grid-cols-1" key={spot.id} id={`spot-${spot.id}`}>
                  <div className="grid min-w-0 content-start gap-2.5 p-1">
                    <div className="flex flex-wrap gap-2"><Badge>{spot.days}</Badge><Badge variant="secondary">{region.name} · {spot.label}</Badge></div>
                    <h3 className="m-0 text-[clamp(1.25rem,2vw,1.875rem)] font-semibold leading-tight text-foreground">{spot.name}</h3>
                    <p className="m-0 leading-7 text-stone-700">{overview}</p>
                    <div className="mt-0.5 flex flex-wrap gap-2">
                      <Button asChild variant="outline" size="sm"><Link to={`/?region=${spot.region}&spot=${spot.id}`} aria-label={`回到地图查看${spot.name}`}>回地图查看</Link></Button>
                      {spot.source && <Button asChild variant="outline" size="sm"><a href={spot.source} target="_blank" rel="noreferrer">官方/资料页</a></Button>}
                    </div>
                  </div>
                  <div className="grid min-w-0 grid-cols-4 gap-2 max-md:grid-cols-2">
                    {images.map((image, index) => (
                      <figure className="m-0 min-w-0 overflow-hidden rounded-[1.05rem] border border-stone-900/10 bg-white/[0.65]" key={`${spot.id}-${image.src}-${index}`}>
                        <img className="aspect-[4/3] w-full bg-stone-200 object-cover" src={imageSource(image.src)} alt={`${spot.name}参考图 ${index + 1}`} loading="lazy" />
                        <figcaption className="grid min-h-[74px] content-start gap-1 px-2.5 py-2">
                          <span className="line-clamp-2 text-xs leading-snug text-stone-700">{image.caption || `${spot.name}参考图 ${index + 1}`}</span>
                          {image.source && <a className="justify-self-start text-[11px] font-bold text-amber-800" href={image.source} target="_blank" rel="noreferrer">{sourceLabel(image.source)}</a>}
                        </figcaption>
                      </figure>
                    ))}
                  </div>
                </article>
              );
            })}
          </div>
        </Card>
      ))}
    </main>
  );
}
