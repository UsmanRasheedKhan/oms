import Navbar from "@/components/Navbar";

export default function CustomersPage() {
    return (
        <div className="min-h-dvh bg-[#F8F9FA]">
            <Navbar />
            <main className="md:ml-64 pb-24 md:pb-10">
                <div className="bg-white border-b border-[#E5E7EB] px-5 py-6 md:px-8">
                    <p className="text-[10px] uppercase tracking-[0.15em] text-[#9CA3AF] font-semibold mb-1">
                        Directory
                    </p>
                    <h1 className="heading-serif text-2xl font-semibold text-[#0B0B0B]">Customers</h1>
                </div>
                <div className="flex flex-col items-center justify-center py-20 gap-3 text-center px-6">
                    <p className="font-serif text-lg text-[#0B0B0B]">Customer management</p>
                    <p className="text-sm text-[#9CA3AF]">Customer profiles will appear here once orders are created.</p>
                </div>
            </main>
        </div>
    );
}
