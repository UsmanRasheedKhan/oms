'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getGlobalSizes, addGlobalSize, softDeleteSize, toggleSizeActive } from '@/lib/settings';
import { Plus, Trash2, Loader2, Power } from 'lucide-react';

export default function GlobalSizes() {
    const [newSize, setNewSize] = useState('');
    const queryClient = useQueryClient();

    const { data: sizes = [], isLoading } = useQuery({
        queryKey: ['globalSizes'],
        queryFn: getGlobalSizes
    });

    const addMutation = useMutation({
        mutationFn: () => addGlobalSize({ name: newSize.toUpperCase(), description: 'Custom Size' }),
        onSuccess: () => {
            setNewSize('');
            queryClient.invalidateQueries({ queryKey: ['globalSizes'] });
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => softDeleteSize(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['globalSizes'] });
        }
    });

    const toggleMutation = useMutation({
        mutationFn: ({ id, current }: { id: string, current: boolean }) => toggleSizeActive(id, current),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['globalSizes'] });
        }
    });

    if (isLoading) {
        return <div className="animate-pulse h-32 bg-slate-mid"></div>;
    }

    return (
        <div className="card-luxury p-6">
            <h3 className="text-xl font-display mb-4 border-b border-border pb-2">Global Master Sizes</h3>
            <p className="text-sm text-muted mb-6">Manage standardized dimensions or clothing sizes for all products.</p>

            <div className="flex gap-2 mb-6">
                <input
                    type="text"
                    value={newSize}
                    onChange={(e) => setNewSize(e.target.value)}
                    placeholder="e.g. XL, 2x4, 500ml"
                    className="input-luxury flex-1 mb-0"
                    onKeyDown={(e) => e.key === 'Enter' && newSize && addMutation.mutate()}
                />
                <button
                    onClick={() => addMutation.mutate()}
                    disabled={!newSize || addMutation.isPending}
                    className="btn btn-primary"
                >
                    {addMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                    Add
                </button>
            </div>

            <div className="flex flex-wrap gap-3">
                {sizes.map(size => (
                    <div key={size.id} className={`group relative flex items-center justify-between border border-border px-4 py-2 font-mono transition-colors ${size.isActive ? 'bg-slate text-accent' : 'bg-transparent text-muted-light line-through'}`}>
                        <span>{size.name}</span>
                        <div className="ml-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                                onClick={() => toggleMutation.mutate({ id: size.id!, current: size.isActive || false })}
                                className={`transition-colors ${size.isActive ? 'text-green-500 hover:text-green-400' : 'text-slate-light hover:text-green-500'}`}
                                title={size.isActive ? "Deactivate Size" : "Activate Size"}
                            >
                                <Power className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => deleteMutation.mutate(size.id!)}
                                className="text-muted hover:text-red-500 transition-colors"
                                title="Soft Remove"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div >
    );
}
