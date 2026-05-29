import React from 'react';
import { detailTabs } from '../content/travelData.js';
import { galleryFor, imageSource } from '../utils/images.js';

export function DetailPanel({ region, spot, tab, onTab, saved, onSave }) {
  const target = spot || region;
  const targetName = target.name;
  const detailSource = spot?.details || region.details;
  const detailLines = detailSource[tab] || [];
  const fullLines = Object.entries(detailSource).flatMap(([key, lines]) => lines.map(line => `${detailTabs.find(([id]) => id === key)?.[1] || key}｜${line}`));
  const decisionKey = spot?.id || region.id;
  const gallery = galleryFor(spot, region);

  return <aside className="detail-panel">
    <div className="detail-gallery" aria-label={`${targetName}参考图片`}>
      <figure className="hero-photo">
        <img src={imageSource(gallery[0]?.src)} alt={`${targetName}参考图 1`} loading="lazy" />
        <figcaption>{gallery[0]?.caption || targetName}</figcaption>
      </figure>
      <div className="thumb-strip">
        {gallery.slice(1).map((img, index) => <a key={`${img.src}-${index}`} href={img.source || img.src} target="_blank" rel="noreferrer" title={img.caption || targetName}>
          <img src={imageSource(img.src)} alt={`${targetName}参考图 ${index + 2}`} loading="lazy" />
          <span>{img.caption || '参考图'}</span>
        </a>)}
      </div>
    </div>
    <div className="detail-kicker">{region.kana} · {spot ? spot.label : region.mood}</div>
    <h1>{targetName}</h1>
    <p className="summary">{spot ? detailSource.overview[0] : region.summary}</p>
    <div className="spot-meta"><b>{spot ? spot.days : '县域'}</b><span>{region.name} · {spot ? spot.type : 'region'}</span></div>
    {spot?.source && <a className="source-link" href={spot.source} target="_blank" rel="noreferrer">资料来源</a>}

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
