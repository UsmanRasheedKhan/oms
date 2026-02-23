"use client";

import { useEffect, useState } from "react";
import { WifiOff } from "lucide-react";

export default function OfflineBanner() {
    const [isOffline, setIsOffline] = useState(false);
    const [wasOffline, setWasOffline] = useState(false);
    const [showReconnected, setShowReconnected] = useState(false);

    useEffect(() => {
        const handleOffline = () => {
            setIsOffline(true);
            setWasOffline(true);
            setShowReconnected(false);
        };

        const handleOnline = () => {
            setIsOffline(false);
            if (wasOffline) {
                setShowReconnected(true);
                setTimeout(() => setShowReconnected(false), 3000);
            }
        };

        window.addEventListener("offline", handleOffline);
        window.addEventListener("online", handleOnline);

        // Check initial state
        if (!navigator.onLine) setIsOffline(true);

        return () => {
            window.removeEventListener("offline", handleOffline);
            window.removeEventListener("online", handleOnline);
        };
    }, [wasOffline]);

    if (!isOffline && !showReconnected) return null;

    return (
        <div
            className={`fixed top-0 inset-x-0 z-[100] flex items-center gap-2 px-4 py-2.5 text-[11px] font-bold uppercase tracking-widest text-center justify-center transition-all
        ${isOffline
                    ? "bg-[#0B0B0B] text-white"
                    : "bg-green-600 text-white"
                }`}
        >
            {isOffline ? (
                <>
                    <WifiOff size={12} />
                    <span>Offline — Changes will sync when reconnected</span>
                </>
            ) : (
                <>
                    <span>✓</span>
                    <span>Back online — Syncing changes…</span>
                </>
            )}
        </div>
    );
}
