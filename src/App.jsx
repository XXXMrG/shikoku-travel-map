import React from 'react';
import { useEffect, useState } from 'react';
import { GalleryPage } from './pages/GalleryPage.jsx';
import { MapPage } from './pages/MapPage.jsx';

function currentPage() {
  return window.location.hash.replace('#', '').startsWith('gallery') ? 'gallery' : 'map';
}

export function App() {
  const [page, setPage] = useState(currentPage);

  useEffect(() => {
    const onHashChange = () => setPage(currentPage());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  useEffect(() => {
    const id = window.location.hash.slice(1);
    if (page === 'gallery' && id && id !== 'gallery') {
      requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView({ block: 'start' }));
    }
    if (page === 'map') window.scrollTo({ top: 0 });
  }, [page]);

  return page === 'gallery' ? <GalleryPage /> : <MapPage />;
}
