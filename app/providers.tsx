'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { ReactNode, useEffect } from 'react';
import { useUIStore } from '@/store/useUIStore';

export default function Providers({ children }: { children: ReactNode }) {
    const setOffline = useUIStore((state) => state.setOffline);

    useEffect(() => {
        // Initialize Sync Engine strictly on client
        import('@/lib/syncEngine').then(({ syncEngine }) => {
            if (syncEngine && navigator.onLine) {
                syncEngine.flushQueue();
            }
        });

        const handleOnline = () => setOffline(false);
        const handleOffline = () => setOffline(true);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        setOffline(!navigator.onLine);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, [setOffline]);
    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    );
}
