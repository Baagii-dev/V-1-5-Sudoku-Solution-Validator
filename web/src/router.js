import { useEffect, useState } from 'react';

// GitHub Pages дээр сервер талын чиглүүлэлтгүй тул hash (#/...) ашиглана.
export const ROUTES = [
  { path: '/', label: 'Нүүр' },
  { path: '/validator', label: 'Шалгагч' },
  { path: '/about', label: 'Бидний тухай' },
];

function current() {
  const hash = location.hash.replace(/^#/, '');
  if (hash) return ROUTES.some((r) => r.path === hash) ? hash : '/';
  // Хуучин холбоос (?sample=...&autorun=1) шууд шалгагч руу орно.
  return location.search ? '/validator' : '/';
}

export function useRoute() {
  const [route, setRoute] = useState(current);
  useEffect(() => {
    const on = () => setRoute(current());
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);
  return route;
}
