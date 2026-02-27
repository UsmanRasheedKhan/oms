import ProductForm from "@/components/products/ProductForm";
import Navbar from "@/components/Navbar";
import { getProductTree } from "@/lib/products";
import { notFound } from "next/navigation";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const product = await getProductTree(id);

    if (!product) {
        notFound();
    }

    return (
        <div className="min-h-screen pb-safe">
            <Navbar />
            <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in">
                <div className="mb-8 border-b border-border pb-4 flex justify-between items-end">
                    <div>
                        <span className="label-luxury block text-accent">Modifying</span>
                        <h1 className="text-3xl font-display text-obsidian">{product.name}</h1>
                    </div>
                    <div className="font-mono text-sm text-muted bg-slate-mid px-2 py-1">
                        SKU REF: {product.id}
                    </div>
                </div>
                <ProductForm initialData={product} />
            </main>
        </div>
    );
}
