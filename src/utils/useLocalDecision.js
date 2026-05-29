import { useEffect, useState } from 'react';

export function useLocalDecision() {
  const [saved, setSaved] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('shikoku-decisions') || '{}');
    } catch {
      return {};
    }
  });

  useEffect(() => {
    localStorage.setItem('shikoku-decisions', JSON.stringify(saved));
  }, [saved]);

  return [saved, setSaved];
}
