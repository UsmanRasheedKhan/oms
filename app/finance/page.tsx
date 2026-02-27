import Navbar from "@/components/Navbar";
import { CashFlowChart, InventoryValuationChart } from "@/components/finance/ClientCharts";
import JournalTable from "@/components/finance/JournalTable";
import { getLedgerEntries } from "@/lib/finance";

// Simulated historical data for demo purposes since we don't have historical snapshot architecture built
const demoCashFlowData = [
    { month: 'Jan', cashIn: 4000, cashOut: 2400 },
    { month: 'Feb', cashIn: 3000, cashOut: 1398 },
    { month: 'Mar', cashIn: 2000, cashOut: 9800 },
    { month: 'Apr', cashIn: 2780, cashOut: 3908 },
    { month: 'May', cashIn: 1890, cashOut: 4800 },
    { month: 'Jun', cashIn: 2390, cashOut: 3800 },
    { month: 'Jul', cashIn: 3490, cashOut: 4300 },
];

const demoValuationData = [
    { date: '2026-01-01', valuation: 40000 },
    { date: '2026-02-01', valuation: 45000 },
    { date: '2026-03-01', valuation: 38000 },
    { date: '2026-04-01', valuation: 55000 },
    { date: '2026-05-01', valuation: 60000 },
    { date: '2026-06-01', valuation: 58000 },
];

export default async function FinancePage() {
    const entries = await getLedgerEntries();

    return (
        <div className="min-h-screen pb-safe">
            <Navbar />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in">
                <div className="mb-8 border-b border-border pb-4">
                    <span className="label-luxury block text-accent">Intelligence</span>
                    <h1 className="text-3xl font-display text-obsidian">Financial Ledger</h1>
                </div>

                {/* Charts Dashboard */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                    <CashFlowChart data={demoCashFlowData} />
                    <InventoryValuationChart data={demoValuationData} />
                </div>

                {/* Financial Journal */}
                <div>
                    <div className="flex justify-between items-end mb-6 border-b border-border pb-2">
                        <h2 className="text-2xl font-display">General Journal</h2>
                        <button className="btn btn-secondary text-xs !py-1.5">
                            Export CSV
                        </button>
                    </div>
                    <JournalTable entries={entries} />
                </div>
            </main>
        </div>
    );
}
