import Navbar from "@/components/Navbar";
import OrderForm from "@/components/OrderForm";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default function NewOrderPage() {
    return (
        <div className="min-h-dvh bg-[#F8F9FA]">
            <Navbar />
            <main className="md:ml-64 pb-24 md:pb-10">
                {/* Header */}
                <div className="bg-white border-b border-[#E5E7EB] px-5 py-5 md:px-8">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-[#9CA3AF] hover:text-[#0B0B0B] transition-colors mb-4"
                    >
                        <ChevronLeft size={14} />
                        Back to Dashboard
                    </Link>
                    <p className="text-[10px] uppercase tracking-[0.15em] text-[#9CA3AF] font-semibold mb-1">
                        Create
                    </p>
                    <h1 className="heading-serif text-2xl font-semibold text-[#0B0B0B]">New Order</h1>
                </div>

                <div className="max-w-2xl mx-auto px-5 py-8 md:px-8">
                    <OrderForm />
                </div>
            </main>
        </div>
    );
}
