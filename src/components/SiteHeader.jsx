import React from 'react';
export function SiteHeader({ page = 'map' }) {
  return <header className="map-topbar">
    <a className="brand" href="/#map">四国旅行地图</a>
    <nav className="site-nav" aria-label="页面切换">
      <a className={page === 'map' ? 'active' : ''} href="/#map">地图决策</a>
      <a className={page === 'gallery' ? 'active' : ''} href="/#gallery">景点图片</a>
    </nav>
    <div className="top-summary">13 天骨架 · 多景点池 · 图片核对</div>
  </header>;
}
