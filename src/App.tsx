import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { GalleryPage } from '@/pages/GalleryPage';
import { MapPage } from '@/pages/MapPage';

const CardDiscoveryPage = lazy(() => import('@/pages/CardDiscoveryPage').then(module => ({ default: module.CardDiscoveryPage })));

function ScrollManager() {
  const { pathname, hash, search } = useLocation();

  useEffect(() => {
    if (hash) {
      requestAnimationFrame(() => {
        document.getElementById(decodeURIComponent(hash.slice(1)))?.scrollIntoView({ block: 'start' });
      });
      return;
    }
    window.scrollTo({ top: 0 });
  }, [pathname, hash, search]);

  return null;
}

function SiteRouteFallback() {
  return (
    <div className="grid min-h-[60dvh] place-items-center rounded-[1.5rem] border border-white/80 bg-card/75 p-6 text-center text-sm font-bold text-primary shadow-atlas backdrop-blur-xl">
      景点卡片加载中…
    </div>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <ScrollManager />
      <Routes>
        <Route path="/" element={<MapPage />} />
        <Route path="/cards" element={<Suspense fallback={<div className="page-shell"><SiteRouteFallback /></div>}><CardDiscoveryPage /></Suspense>} />
        <Route path="/gallery" element={<GalleryPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
