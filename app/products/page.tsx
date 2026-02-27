import { getProducts } from "@/lib/products";
import Link from "next/link";
import { Plus } from "lucide-react";
import Navbar from "@/components/Navbar";
import ProductCard from "@/components/products/ProductCard";

export default async function ProductsPage() {
    const products = await getProducts();

    return (
        <div className="min-h-screen pb-safe">
            <Navbar />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in">
                <div className="flex justify-between items-end mb-8 border-b border-border pb-4">
                    <div>
                        <span className="label-luxury block">Catalog</span>
                        <h1 className="text-3xl font-display text-obsidian">Products</h1>
                    </div>
                    <Link href="/products/new" className="btn btn-primary">
                        <Plus className="w-4 h-4" />
                        New Product
                    </Link>
                </div>

                {products.length === 0 ? (
                    <div className="text-center py-20 border border-dashed border-border">
                        <p className="text-muted font-mono mb-4">No products found.</p>
                        <Link href="/products/new" className="btn btn-secondary">
                            Create your first product
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {products.map(product => (
                            <ProductCard key={product.id!} product={product} />
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
