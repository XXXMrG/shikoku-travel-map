import type { Dispatch, SetStateAction } from 'react';
import { useEffect, useState } from 'react';
import type { DecisionMap } from '@/content/types';

const STORAGE_KEY = 'shikoku-decisions';

export function useLocalDecision(): [DecisionMap, Dispatch<SetStateAction<DecisionMap>>] {
  const [saved, setSaved] = useState<DecisionMap>(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') as DecisionMap;
    } catch {
      return {};
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
  }, [saved]);

  return [saved, setSaved];
}
