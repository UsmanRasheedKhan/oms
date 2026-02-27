import ProductForm from "@/components/products/ProductForm";
import Navbar from "@/components/Navbar";

export default function NewProductPage() {
    return (
        <div className="min-h-screen pb-safe">
            <Navbar />
            <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in">
                <div className="mb-8 border-b border-border pb-4">
                    <span className="label-luxury block text-accent">Registration</span>
                    <h1 className="text-3xl font-display text-obsidian">New Product</h1>
                </div>
                <ProductForm />
            </main>
        </div>
    );
}
