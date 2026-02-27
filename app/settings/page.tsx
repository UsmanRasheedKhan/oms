import Navbar from "@/components/Navbar";
import GlobalSizes from "@/components/settings/GlobalSizes";
import CollectionManager from "@/components/settings/CollectionManager";
import FeatureToggles from "@/components/settings/FeatureToggles";

export default function SettingsPage() {
    return (
        <div className="min-h-screen pb-safe">
            <Navbar />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in">
                <div className="mb-8 border-b border-border pb-4">
                    <span className="label-luxury block text-accent">Administration</span>
                    <h1 className="text-3xl font-display text-obsidian">Omni-Admin Panel</h1>
                    <p className="text-muted text-sm mt-2 max-w-2xl">
                        Configure system-wide settings, destructive actions, offline synchronization rules, and standardized product data parameters.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        <GlobalSizes />
                        <CollectionManager />
                    </div>
                    <div className="lg:col-span-1 border-l border-border pl-8 pt-2">
                        <FeatureToggles />
                    </div>
                </div>
            </main>
        </div>
    );
}
