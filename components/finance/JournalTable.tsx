'use client';

import { LedgerEntry } from '@/lib/types';
import { useUIStore } from '@/store/useUIStore';

interface JournalTableProps {
    entries: LedgerEntry[];
}

export default function JournalTable({ entries }: JournalTableProps) {
    const currency = useUIStore(state => state.currency);
    if (entries.length === 0) {
        return (
            <div className="text-center py-12 border border-dashed border-border bg-slate">
                <p className="text-muted font-mono">No journal entries found.</p>
            </div>
        );
    }

    return (
        <div className="card-luxury overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="border-b border-border bg-slate font-mono text-xs uppercase text-muted tracking-wider">
                        <th className="py-4 px-6">Date</th>
                        <th className="py-4 px-6">Description</th>
                        <th className="py-4 px-6">Reference ID</th>
                        <th className="py-4 px-6 text-right">Debit / Credit</th>
                    </tr>
                </thead>
                <tbody className="font-mono text-sm">
                    {entries.map((entry) => (
                        <tr key={entry.id} className="border-b border-border hover:bg-slate/50 transition-colors">
                            <td className="py-4 px-6">
                                {new Date(entry.date).toLocaleDateString()}
                            </td>
                            <td className="py-4 px-6 font-sans">
                                {entry.description}
                                <span className="block text-xs font-mono text-muted uppercase mt-1">
                                    TYPE: {entry.type.replace('_', ' ')}
                                </span>
                            </td>
                            <td className="py-4 px-6 text-muted-light">
                                {entry.referenceId || '--'}
                            </td>
                            <td className={`py-4 px-6 text-right font-medium ${entry.type === 'cash_in' ? 'text-green-600' : entry.type === 'cash_out' ? 'text-red-600' : 'text-obsidian'}`}>
                                {entry.type === 'cash_in' ? '+' : entry.type === 'cash_out' ? '-' : ''}
                                {currency === 'USD' ? '$' : '₨'}{entry.amount.toFixed(2)}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
