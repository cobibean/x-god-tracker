'use client';

import { useEffect } from 'react';
import { registerAutoSync } from '@/lib/sync';

export function DailySyncClient() {
  useEffect(() => {
    registerAutoSync();
  }, []);
  return null;
}


