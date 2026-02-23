import Navbar from "@/components/Navbar";

export default function ReportsPage() {
    return (
        <div className="min-h-dvh bg-[#F8F9FA]">
            <Navbar />
            <main className="md:ml-64 pb-24 md:pb-10">
                <div className="bg-white border-b border-[#E5E7EB] px-5 py-6 md:px-8">
                    <p className="text-[10px] uppercase tracking-[0.15em] text-[#9CA3AF] font-semibold mb-1">
                        Analytics
                    </p>
                    <h1 className="heading-serif text-2xl font-semibold text-[#0B0B0B]">Reports</h1>
                </div>
                <div className="flex flex-col items-center justify-center py-20 gap-3 text-center px-6">
                    <p className="font-serif text-lg text-[#0B0B0B]">Reporting module</p>
                    <p className="text-sm text-[#9CA3AF]">Order analytics, revenue charts and trends will appear here.</p>
                </div>
            </main>
        </div>
    );
}
