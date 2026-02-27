import Navbar from "@/components/Navbar";
import BalanceSheet from "@/components/inventory/BalanceSheet";

export default function InventoryPage() {
    return (
        <div className="min-h-screen pb-safe print:bg-chalk print:min-h-0">
            <div className="print-hidden">
                <Navbar />
            </div>
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 print:p-0 print:m-0 print:max-w-none">
                <div className="mb-8 border-b border-border pb-4 print-hidden">
                    <span className="label-luxury block">Operations</span>
                    <h1 className="text-3xl font-display text-obsidian">Inventory Balance Sheet</h1>
                </div>

                <BalanceSheet />
            </main>
        </div>
    );
}
