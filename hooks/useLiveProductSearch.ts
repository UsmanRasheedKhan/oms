import { useState, useEffect } from 'react';
import { liveSearchProducts } from '@/lib/inventory';
import { Product } from '@/lib/types';

export function useLiveProductSearch(delay = 300) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<Product[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setLoading(true);
        const handler = setTimeout(async () => {
            try {
                const matches = await liveSearchProducts(query);
                setResults(matches);
            } catch (error) {
                console.error('Search failed', error);
            } finally {
                setLoading(false);
            }
        }, delay);

        return () => clearTimeout(handler);
    }, [query, delay]);

    return { query, setQuery, results, loading };
}
