import React from 'react';
import { SiteHeader } from '../components/SiteHeader.jsx';
import { allSpots, prefectures } from '../content/travelData.js';
import { spotImages } from '../content/spotImages.js';
import { imageSource } from '../utils/images.js';

function groupedSpots() {
  return Object.values(prefectures).map(region => ({
    region,
    spots: allSpots.filter(spot => spot.region === region.id)
  }));
}

function sourceLabel(source) {
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

  return <main className="map-page gallery-page">
    <SiteHeader page="gallery" />

    <section className="gallery-hero">
      <p className="eyebrow">Attraction image index</p>
      <h1>景点图片索引</h1>
      <p>把图片和景点的关联关系单独摊开：每个景点都有介绍、类型、建议停留和独立图片组，方便你检查“这张图到底属于哪个地方”。</p>
      <div className="gallery-stats"><span>{allSpots.length} 个景点</span><span>{totalImages} 张参考图</span><span>按四县分组</span></div>
    </section>

    <nav className="gallery-region-jump" aria-label="跳转到县域图片组">
      {groups.map(({ region, spots }) => <a key={region.id} href={`#gallery-${region.id}`}>{region.name}<small>{spots.length}</small></a>)}
    </nav>

    {groups.map(({ region, spots }) => <section className="gallery-region-section" id={`gallery-${region.id}`} key={region.id}>
      <header>
        <div><p className="eyebrow">{region.kana}</p><h2>{region.name}</h2></div>
        <p>{region.summary}</p>
      </header>
      <div className="gallery-spot-grid">
        {spots.map(spot => {
          const images = spotImages[spot.id] || [];
          const overview = spot.details?.overview?.[0] || region.summary;
          return <article className="gallery-spot-card" key={spot.id} id={`spot-${spot.id}`}>
            <div className="gallery-spot-copy">
              <div className="spot-meta"><b>{spot.days}</b><span>{region.name} · {spot.label}</span></div>
              <h3>{spot.name}</h3>
              <p>{overview}</p>
              <div className="gallery-actions">
                <a href={`/#map`} aria-label={`回到地图查看${spot.name}`}>回地图查看</a>
                {spot.source && <a href={spot.source} target="_blank" rel="noreferrer">官方/资料页</a>}
              </div>
            </div>
            <div className="gallery-image-grid">
              {images.map((image, index) => <figure key={`${spot.id}-${image.src}-${index}`}>
                <img src={imageSource(image.src)} alt={`${spot.name}参考图 ${index + 1}`} loading="lazy" />
                <figcaption>
                  <span>{image.caption || `${spot.name}参考图 ${index + 1}`}</span>
                  {image.source && <a href={image.source} target="_blank" rel="noreferrer">{sourceLabel(image.source)}</a>}
                </figcaption>
              </figure>)}
            </div>
          </article>;
        })}
      </div>
    </section>)}
  </main>;
}
