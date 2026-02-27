'use client';

import { Combobox } from '@headlessui/react';
import { useLiveProductSearch } from '@/hooks/useLiveProductSearch';
import { Product } from '@/lib/types';
import { Check, ChevronsUpDown, Loader2 } from 'lucide-react';

interface ProductComboboxProps {
    onSelect: (product: Product | null) => void;
}

export default function ProductCombobox({ onSelect }: ProductComboboxProps) {
    const { query, setQuery, results, loading } = useLiveProductSearch(300);

    return (
        <div className="relative w-full max-w-md print-hidden">
            <Combobox onChange={onSelect}>
                <div className="relative">
                    <Combobox.Input
                        className="input-luxury w-full pr-10"
                        displayValue={(p: Product) => p?.name || ''}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder="Search products by name..."
                    />
                    <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
                        {loading ? (
                            <Loader2 className="w-5 h-5 text-muted animate-spin" />
                        ) : (
                            <ChevronsUpDown className="w-5 h-5 text-muted" />
                        )}
                    </Combobox.Button>
                </div>
                <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto bg-chalk border border-border py-1 shadow-luxury focus:outline-none">
                    {results.length === 0 && query !== '' && !loading ? (
                        <div className="relative cursor-default select-none py-2 px-4 text-muted">
                            Nothing found.
                        </div>
                    ) : (
                        results.map((product) => (
                            <Combobox.Option
                                key={product.id}
                                className={({ active }) =>
                                    `relative cursor-default select-none py-2 pl-10 pr-4 transition-colors ${active ? 'bg-slate text-obsidian font-medium' : 'text-muted'
                                    }`
                                }
                                value={product}
                            >
                                {({ selected, active }) => (
                                    <>
                                        <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                                            {product.name}
                                            <span className="text-xs text-muted-light block">{product.collectionId}</span>
                                        </span>
                                        {selected ? (
                                            <span className={`absolute inset-y-0 left-0 flex items-center pl-3 ${active ? 'text-accent' : 'text-obsidian'}`}>
                                                <Check className="h-4 w-4" aria-hidden="true" />
                                            </span>
                                        ) : null}
                                    </>
                                )}
                            </Combobox.Option>
                        ))
                    )}
                </Combobox.Options>
            </Combobox>
        </div>
    );
}
