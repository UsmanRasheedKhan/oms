'use client';

import { useState, Fragment } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getInventoryBalanceSheet, updateVariantQuantity } from '@/lib/inventory';
import ProductCombobox from './ProductCombobox';
import { Product, Variant } from '@/lib/types';
import { Printer, X, FileText, Barcode as BarcodeIcon, LayoutGrid } from 'lucide-react';
import { useUIStore } from '@/store/useUIStore';
import BarcodeImage from '../products/BarcodeImage';

type PrintMode = 'barcodes' | 'invoice-no-barcode' | 'invoice-with-barcode';

interface SheetRow {
    rowId: string;
    product: Product;
    selectedVariantId: string;
    costPrice: number;
    sellPrice: number;
    qty: number;
}

export default function BalanceSheet() {
    const [rows, setRows] = useState<SheetRow[]>([]);
    const [printMode, setPrintMode] = useState<PrintMode>('invoice-no-barcode');

    const queryClient = useQueryClient();
    const currency = useUIStore(state => state.currency);

    const { data: balanceSheet, isLoading } = useQuery({
        queryKey: ['inventoryBalanceSheet'],
        queryFn: getInventoryBalanceSheet
    });

    const mutation = useMutation({
        mutationFn: ({ productId, variantId, qty }: { productId: string, variantId: string, qty: number }) =>
            updateVariantQuantity(productId, variantId, qty),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['inventoryBalanceSheet'] });
        }
    });

    const handlePrint = (mode: PrintMode) => {
        setPrintMode(mode);
        setTimeout(() => window.print(), 100);
    };

    const handleProductSelect = (product: Product | null) => {
        if (product && product.variants && product.variants.length > 0) {
            const defaultVariant = product.variants[0];
            setRows(prev => [...prev, {
                rowId: Date.now().toString() + Math.random().toString(),
                product,
                selectedVariantId: defaultVariant.id!,
                costPrice: defaultVariant.costPrice,
                sellPrice: defaultVariant.sellPrice,
                qty: defaultVariant.quantity
            }]);
        }
    };

    const updateRow = (rowId: string, updates: Partial<SheetRow>) => {
        setRows(prev => prev.map(row =>
            row.rowId === rowId ? { ...row, ...updates } : row
        ));
    };

    const handleVariantChange = (rowId: string, variantId: string, product: Product) => {
        const variant = product.variants?.find(v => v.id === variantId);
        if (variant) {
            updateRow(rowId, {
                selectedVariantId: variantId,
                costPrice: variant.costPrice,
                sellPrice: variant.sellPrice,
                qty: variant.quantity
            });
        }
    };

    const removeRow = (rowId: string) => {
        setRows(prev => prev.filter(r => r.rowId !== rowId));
    };

    if (isLoading) {
        return (
            <div className="space-y-4 animate-pulse">
                <div className="h-10 bg-slate-mid w-64"></div>
                <div className="h-96 bg-slate-mid w-full"></div>
            </div>
        );
    }

    return (
        <div className={`space-y-8 animate-in mt-6 print-mode-${printMode}`}>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 print-hidden">
                <ProductCombobox onSelect={handleProductSelect} />

                <div className="flex gap-2 bg-slate-mid/50 p-1.5 rounded-sm">
                    <button
                        onClick={() => handlePrint('invoice-no-barcode')}
                        className="btn bg-white hover:bg-slate-mid text-obsidian border border-border !py-1.5 !px-3 text-xs"
                    >
                        <FileText className="w-4 h-4 mr-2" />
                        Invoice (Standard)
                    </button>
                    <button
                        onClick={() => handlePrint('invoice-with-barcode')}
                        className="btn bg-white hover:bg-slate-mid text-obsidian border border-border !py-1.5 !px-3 text-xs"
                    >
                        <BarcodeIcon className="w-4 h-4 mr-2" />
                        Invoice + Barcodes
                    </button>
                    <button
                        onClick={() => handlePrint('barcodes')}
                        className="btn bg-white hover:bg-slate-mid text-obsidian border border-border !py-1.5 !px-3 text-xs"
                    >
                        <LayoutGrid className="w-4 h-4 mr-2" />
                        Print Barcodes (2-Col)
                    </button>
                </div>
            </div>

            {/* Print Mode: Barcodes Only (2-Column Grid) */}
            <div className={`hidden ${printMode === 'barcodes' ? 'print:grid' : ''} grid-cols-2 gap-8 print:gap-12`}>
                {rows.map(row => {
                    const variant = row.product.variants?.find(v => v.id === row.selectedVariantId);
                    if (!variant) return null;
                    return (
                        <div key={row.rowId} className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-obsidian/30 text-center break-inside-avoid">
                            <h3 className="font-display font-bold text-lg mb-1">{row.product.name}</h3>
                            <p className="font-mono text-xs mb-4 text-obsidian/70">{variant.size} • {variant.color}</p>
                            <BarcodeImage sku={variant.sku} />
                            <p className="font-mono font-bold mt-3 text-xl">{currency === 'USD' ? '$' : '₨'}{row.sellPrice.toFixed(2)}</p>
                        </div>
                    );
                })}
            </div>

            {/* Print Mode: Invoice (With or Without Barcodes) */}
            <div className={`card-luxury p-8 print:shadow-none print:border-none print:p-0 print:m-0 print:w-full ${printMode === 'barcodes' ? 'print:hidden' : ''}`}>
                <div className="hidden print:block mb-4 text-center border-b-2 border-obsidian pb-2">
                    <h1 className="text-2xl font-display font-bold uppercase tracking-widest">Inventory Sheet</h1>
                    <p className="font-mono text-muted text-[10px] mt-1">Generated: {new Date().toLocaleDateString()}</p>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse print:text-[10px]">
                        <thead>
                            <tr className="border-b-2 border-obsidian font-mono text-sm print:text-[10px] tracking-wide bg-slate">
                                <th className="py-4 px-4 print:py-1 print:px-1">Item</th>
                                <th className="py-4 px-4 min-w-[150px] print:min-w-0 print:py-1 print:px-1">Variant</th>
                                <th className="py-4 px-4 print:py-1 print:px-1">SKU</th>
                                <th className={`py-4 px-4 print:py-1 print:px-1 ${printMode === 'invoice-with-barcode' ? 'print:table-cell' : 'print:hidden'}`}>Barcode</th>
                                <th className="py-4 px-4 print:py-1 print:px-1 text-right">Cost Price</th>
                                <th className="py-4 px-4 print:py-1 print:px-1 text-right">Selling Price</th>
                                <th className="py-4 px-4 print:py-1 print:px-1 text-right min-w-[100px] print:min-w-0">Stock Qty</th>
                                <th className="py-4 px-2 print:hidden w-10"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="py-12 text-center text-muted font-mono">
                                        Use the search bar above to add products to your balance sheet view.
                                    </td>
                                </tr>
                            ) : rows.map(row => {
                                const variant = row.product.variants?.find(v => v.id === row.selectedVariantId);
                                return (
                                    <tr key={row.rowId} className="border-b border-border hover:bg-slate/50 transition-colors group print:border-b-obsidian/20">
                                        <td className="py-3 px-4 print:py-1 print:px-1 font-semibold text-accent uppercase tracking-wider text-xs print:text-[10px]">
                                            {row.product.name}
                                        </td>
                                        <td className="py-3 px-4 print:py-1 print:px-1">
                                            <select
                                                className="input-luxury !py-1 !px-2 text-sm print:text-[10px] bg-white print:border-none print:appearance-none print:bg-transparent print:!p-0"
                                                value={row.selectedVariantId}
                                                onChange={(e) => handleVariantChange(row.rowId, e.target.value, row.product)}
                                            >
                                                {row.product.variants?.map(v => (
                                                    <option key={v.id} value={v.id}>{v.size} - {v.color}</option>
                                                ))}
                                            </select>
                                        </td>
                                        <td className="py-3 px-4 print:py-1 print:px-1 font-mono text-sm print:text-[10px]">
                                            {variant?.sku || 'N/A'}
                                        </td>
                                        <td className={`py-3 px-4 print:py-1 print:px-1 ${printMode === 'invoice-with-barcode' ? 'print:table-cell' : 'print:hidden'}`}>
                                            {variant?.sku ? (
                                                <div className="w-32 print:w-24">
                                                    <BarcodeImage sku={variant.sku} />
                                                </div>
                                            ) : '-'}
                                        </td>
                                        <td className="py-3 px-4 print:py-1 print:px-1 text-right">
                                            <div className="flex items-center justify-end font-mono">
                                                <span className="text-muted mr-1">{currency === 'USD' ? '$' : '₨'}</span>
                                                <input
                                                    type="number"
                                                    value={row.costPrice}
                                                    onChange={(e) => updateRow(row.rowId, { costPrice: parseFloat(e.target.value) || 0 })}
                                                    className="input-luxury w-24 text-right !py-1 !px-2 print:border-none print:bg-transparent print:!p-0 print:w-auto print:text-[10px]"
                                                />
                                            </div>
                                        </td>
                                        <td className="py-3 px-4 print:py-1 print:px-1 text-right">
                                            <div className="flex items-center justify-end font-mono">
                                                <span className="text-muted mr-1">{currency === 'USD' ? '$' : '₨'}</span>
                                                <input
                                                    type="number"
                                                    value={row.sellPrice}
                                                    onChange={(e) => updateRow(row.rowId, { sellPrice: parseFloat(e.target.value) || 0 })}
                                                    className="input-luxury w-24 text-right !py-1 !px-2 print:border-none print:bg-transparent print:!p-0 print:w-auto print:text-[10px]"
                                                />
                                            </div>
                                        </td>
                                        <td className="py-3 px-4 print:py-1 print:px-1 text-right">
                                            <input
                                                type="number"
                                                className="input-luxury w-20 text-right font-mono !py-1 !px-2 print:border-none print:bg-transparent print:!p-0 print:w-auto print:text-[10px]"
                                                value={row.qty}
                                                onChange={(e) => updateRow(row.rowId, { qty: parseInt(e.target.value) || 0 })}
                                                onBlur={(e) => {
                                                    const newQty = parseInt(e.target.value, 10);
                                                    if (!isNaN(newQty) && variant && newQty !== variant.quantity) {
                                                        mutation.mutate({ productId: row.product.id!, variantId: variant.id!, qty: newQty });
                                                    }
                                                }}
                                            />
                                        </td>
                                        <td className="py-3 px-2 print:hidden text-center">
                                            <button
                                                onClick={() => removeRow(row.rowId)}
                                                className="text-muted hover:text-red-500 transition-colors"
                                                title="Remove row"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
