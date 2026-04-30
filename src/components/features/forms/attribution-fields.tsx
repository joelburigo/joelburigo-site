'use client';

import { useEffect, useState } from 'react';
import { readAttribution, type AttributionData } from '@/lib/attribution';

export function AttributionFields() {
  const [attr, setAttr] = useState<AttributionData>({});

  useEffect(() => {
    // Lê cookie no client após mount (SSR-safe). Single shot, sem cascading render.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAttr(readAttribution());
  }, []);

  return (
    <>
      {Object.entries(attr).map(([k, v]) =>
        v ? <input key={k} type="hidden" name={k} value={v} /> : null
      )}
    </>
  );
}
