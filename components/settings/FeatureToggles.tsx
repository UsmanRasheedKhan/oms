'use client';

import { useState } from 'react';

export default function FeatureToggles() {
    const [toggles, setToggles] = useState({
        softDelete: true,
        offlineMode: true,
        autoBarcode: false,
        strictInventory: true
    });

    const handleToggle = (key: keyof typeof toggles) => {
        setToggles(prev => ({ ...prev, [key]: !prev[key] }));
    };

    return (
        <div className="card-luxury p-6">
            <h3 className="text-xl font-display mb-4 border-b border-border pb-2">System Config</h3>

            <div className="space-y-4">
                <label className="flex items-center justify-between cursor-pointer group">
                    <div>
                        <p className="font-semibold">Destructive Soft Deletes</p>
                        <p className="text-xs text-muted">Hide globally without deleting database rows</p>
                    </div>
                    <div className={`w-10 h-5 border relative transition-colors ${toggles.softDelete ? 'bg-obsidian border-obsidian' : 'bg-slate border-border'}`} onClick={() => handleToggle('softDelete')}>
                        <div className={`absolute top-0.5 bottom-0.5 w-4 bg-chalk transition-all ${toggles.softDelete ? 'left-[22px]' : 'left-[2px]'}`}></div>
                    </div>
                </label>

                <label className="flex items-center justify-between cursor-pointer group">
                    <div>
                        <p className="font-semibold">Offline Engine</p>
                        <p className="text-xs text-muted">Use IndexedDB local queue for operations</p>
                    </div>
                    <div className={`w-10 h-5 border relative transition-colors ${toggles.offlineMode ? 'bg-obsidian border-obsidian' : 'bg-slate border-border'}`} onClick={() => handleToggle('offlineMode')}>
                        <div className={`absolute top-0.5 bottom-0.5 w-4 bg-chalk transition-all ${toggles.offlineMode ? 'left-[22px]' : 'left-[2px]'}`}></div>
                    </div>
                </label>

                <label className="flex items-center justify-between cursor-pointer group">
                    <div>
                        <p className="font-semibold">Auto-Generate Barcodes</p>
                        <p className="text-xs text-muted">Auto-generate CODE128 derived from SKU</p>
                    </div>
                    <div className={`w-10 h-5 border relative transition-colors ${toggles.autoBarcode ? 'bg-obsidian border-obsidian' : 'bg-slate border-border'}`} onClick={() => handleToggle('autoBarcode')}>
                        <div className={`absolute top-0.5 bottom-0.5 w-4 bg-chalk transition-all ${toggles.autoBarcode ? 'left-[22px]' : 'left-[2px]'}`}></div>
                    </div>
                </label>
            </div>
        </div>
    );
}
