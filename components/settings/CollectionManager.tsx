'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCollections, addCollection, softDeleteCollection, toggleCollectionActive } from '@/lib/settings';
import { Plus, Trash2, Folder, Power } from 'lucide-react';

export default function CollectionManager() {
    const [newCol, setNewCol] = useState('');
    const queryClient = useQueryClient();

    const { data: cols = [], isLoading } = useQuery({
        queryKey: ['globalCollections'],
        queryFn: getCollections
    });

    const addMutation = useMutation({
        mutationFn: () => addCollection({ name: newCol, description: 'User-defined collection' }),
        onSuccess: () => {
            setNewCol('');
            queryClient.invalidateQueries({ queryKey: ['globalCollections'] });
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => softDeleteCollection(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['globalCollections'] });
        }
    });

    const toggleMutation = useMutation({
        mutationFn: ({ id, current }: { id: string, current: boolean }) => toggleCollectionActive(id, current),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['globalCollections'] });
        }
    });

    if (isLoading) {
        return <div className="card-luxury p-6 h-64 animate-pulse bg-slate-mid"></div>;
    }

    return (
        <div className="card-luxury p-6">
            <h3 className="text-xl font-display mb-4 border-b border-border pb-2">Collections</h3>

            <div className="flex gap-2 mb-6">
                <input
                    type="text"
                    value={newCol}
                    onChange={(e) => setNewCol(e.target.value)}
                    placeholder="New Collection Name"
                    className="input-luxury flex-1 mb-0"
                    onKeyDown={(e) => e.key === 'Enter' && newCol && addMutation.mutate()}
                />
                <button
                    onClick={() => addMutation.mutate()}
                    disabled={!newCol || addMutation.isPending}
                    className="btn btn-secondary !border-border min-w-[100px]"
                >
                    Add
                </button>
            </div>

            <div className="space-y-3">
                {cols.map(c => (
                    <div key={c.id} className={`flex items-center justify-between border-b border-border pb-2 last:border-0 ${c.isActive ? 'opacity-100' : 'opacity-40'}`}>
                        <div className="flex items-center gap-3">
                            <Folder className={`w-4 h-4 ${c.isActive ? 'text-accent' : 'text-muted'}`} />
                            <span className={`font-semibold ${!c.isActive && 'line-through text-muted'}`}>{c.name}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => toggleMutation.mutate({ id: c.id!, current: c.isActive || false })}
                                className={`transition-colors ${c.isActive ? 'text-green-500 hover:text-green-400' : 'text-slate-light hover:text-green-500'}`}
                                title={c.isActive ? "Deactivate Collection" : "Activate Collection"}
                            >
                                <Power className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => deleteMutation.mutate(c.id!)}
                                className="text-muted hover:text-red-500 transition-colors"
                                title="Soft Remove"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))}
                {cols.length === 0 && <p className="text-sm font-mono text-muted text-center pt-4">No collections active.</p>}
            </div>
        </div>
    );
}
