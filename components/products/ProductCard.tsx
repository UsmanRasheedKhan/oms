'use client';

import Link from "next/link";
import { Product } from "@/lib/types";
import { Edit, Image as ImageIcon, Trash2 } from "lucide-react";
import { useUIStore } from "@/store/useUIStore";
import { softDeleteProduct } from "@/lib/products";
import toast from "react-hot-toast";

interface ProductCardProps {
    product: Product;
    onDelete?: (id: string) => void;
}

export default function ProductCard({ product, onDelete }: ProductCardProps) {
    const currency = useUIStore(state => state.currency);

    // Get the primary image from the product, fallback to first image
    let primaryImage = '';
    if (product.images && product.images.length > 0) {
        const primary = product.images.find(img => img.isPrimary);
        primaryImage = primary?.url || product.images[0].url;
    }

    const allVariants = product.variants || [];

    // Calculate aggregated stats
    const totalQty = allVariants.reduce((sum, v) => sum + v.quantity, 0);
    const minPrice = allVariants.length > 0 ? Math.min(...allVariants.map(v => v.sellPrice)) : 0;
    const maxPrice = allVariants.length > 0 ? Math.max(...allVariants.map(v => v.sellPrice)) : 0;

    // Group variants by size/color for summary
    const uniqueSizes = Array.from(new Set(allVariants.map(v => v.size))).filter(Boolean);

    const handleDelete = async (e: React.MouseEvent) => {
        e.preventDefault();
        if (confirm(`Are you sure you want to delete ${product.name}?`)) {
            try {
                if (navigator.onLine) {
                    await softDeleteProduct(product.id!);
                    toast.success('Product deleted.');
                } else {
                    toast.error('Cannot delete while offline currently.');
                    return;
                }
                if (onDelete) onDelete(product.id!);
            } catch (err) {
                console.error(err);
                toast.error('Failed to delete product.');
            }
        }
    }

    return (
        <div className="card-luxury flex flex-col hover:shadow-luxury-md transition-shadow h-full bg-white relative group">
            <Link href={`/products/${product.id}`} className="absolute inset-0 z-0"></Link>

            {/* Quick Actions (Hover) */}
            <div className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                <Link
                    href={`/products/${product.id}`}
                    className="p-2 bg-white border border-border text-muted hover:text-obsidian hover:border-obsidian transition-colors shadow-sm"
                    title="Edit Product"
                >
                    <Edit className="w-4 h-4" />
                </Link>
                <button
                    onClick={handleDelete}
                    className="p-2 bg-white border border-border text-muted hover:text-red-500 hover:border-red-500 transition-colors shadow-sm"
                    title="Delete Product"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>

            {/* Image Container */}
            <div className="relative aspect-square border-b border-border bg-slate-mid overflow-hidden rounded-t-[1px]">
                {primaryImage ? (
                    <img
                        src={primaryImage}
                        alt={product.name}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-muted">
                        <ImageIcon className="w-8 h-8 mb-2 opacity-30" />
                        <span className="text-xs font-mono uppercase tracking-widest">No Media</span>
                    </div>
                )}

                {/* Stock Badge */}
                <div className={`absolute bottom-3 right-3 px-2 py-1 text-xs font-mono font-medium ${totalQty > 10 ? 'bg-obsidian text-white' : totalQty > 0 ? 'bg-[#C9A96E] text-obsidian' : 'bg-red-500 text-white'}`}>
                    {totalQty === 0 ? 'OUT OF STOCK' : `${totalQty} IN STOCK`}
                </div>
            </div>

            {/* Details Container */}
            <div className="p-5 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-lg leading-tight line-clamp-2 pr-4 text-obsidian z-10">
                        {product.name}
                    </h3>
                </div>

                <p className="text-xs uppercase tracking-widest text-[#C9A96E] font-semibold mb-3 z-10">
                    {product.collectionId || "Uncategorized"}
                </p>

                {/* Variant Summary */}
                <div className="mt-auto space-y-3 relative z-10">
                    <div className="text-xs font-mono text-muted flex gap-2 flex-wrap">
                        {allVariants.length} Variants
                        {uniqueSizes.length > 0 && <span>• Sizes: {uniqueSizes.slice(0, 3).join(', ')}{uniqueSizes.length > 3 ? '...' : ''}</span>}
                    </div>

                    <div className="pt-3 border-t border-border flex justify-between items-end">
                        <span className="text-xs text-muted font-mono uppercase">Price Range</span>
                        <span className="font-mono text-obsidian font-medium">
                            {currency === 'USD' ? '$' : '₨'}{minPrice.toFixed(2)}
                            {minPrice !== maxPrice && ` - ${currency === 'USD' ? '$' : '₨'}${maxPrice.toFixed(2)}`}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
