'use client';

import dynamic from 'next/dynamic';

export const CashFlowChart = dynamic(() => import('./CashFlowChart'), { ssr: false });
export const InventoryValuationChart = dynamic(() => import('./InventoryValuationChart'), { ssr: false });
