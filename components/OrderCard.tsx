"use client";

import { useRef, useState, useCallback } from "react";
import Link from "next/link";
import type { Order, OrderStatus } from "@/lib/types";
import StatusBadge from "./StatusBadge";
import { advanceOrderStatus, markOrderReturned } from "@/lib/orders";
import { ChevronRight, Package, MapPin, ArrowRight, AlertCircle } from "lucide-react";

interface OrderCardProps {
    order: Order;
    onStatusChange?: (id: string, newStatus: OrderStatus) => void;
}

const SWIPE_THRESHOLD = 80;

function haptic(pattern: number | number[] = 50) {
    if (typeof window !== "undefined" && "vibrate" in navigator) {
        navigator.vibrate(pattern);
    }
}

function formatCurrency(amount: number) {
    return new Intl.NumberFormat("en-PK", {
        style: "currency",
        currency: "PKR",
        minimumFractionDigits: 0,
    }).format(amount);
}

function formatDate(isoString: string) {
    return new Date(isoString).toLocaleDateString("en-PK", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}

export default function OrderCard({ order, onStatusChange }: OrderCardProps) {
    const [swipeOffset, setSwipeOffset] = useState(0);
    const [isActioning, setIsActioning] = useState(false);
    const [actionFeedback, setActionFeedback] = useState<"advance" | "help" | null>(null);
    const touchStartX = useRef<number | null>(null);
    const cardRef = useRef<HTMLDivElement>(null);

    // ── Touch handlers ──────────────────────────────────────────────────────
    const handleTouchStart = useCallback((e: React.TouchEvent) => {
        touchStartX.current = e.touches[0].clientX;
    }, []);

    const handleTouchMove = useCallback((e: React.TouchEvent) => {
        if (touchStartX.current === null) return;
        const delta = e.touches[0].clientX - touchStartX.current;
        // Max swipe ±120px
        setSwipeOffset(Math.max(-120, Math.min(120, delta)));
    }, []);

    const handleTouchEnd = useCallback(async () => {
        if (touchStartX.current === null) return;
        touchStartX.current = null;

        if (swipeOffset >= SWIPE_THRESHOLD) {
            // Swipe right → advance status
            setIsActioning(true);
            setActionFeedback("advance");
            haptic([40, 30, 40]);
            setSwipeOffset(0);
            if (order.id) {
                const next = await advanceOrderStatus(order.id, order.status);
                if (next && onStatusChange) onStatusChange(order.id, next);
            }
            setTimeout(() => {
                setIsActioning(false);
                setActionFeedback(null);
            }, 1200);
        } else if (swipeOffset <= -SWIPE_THRESHOLD) {
            // Swipe left → flag for help
            setIsActioning(true);
            setActionFeedback("help");
            haptic([80, 20, 80, 20, 80]);
            setSwipeOffset(0);
            if (order.id) {
                await markOrderReturned(order.id);
                if (onStatusChange) onStatusChange(order.id, "returned");
            }
            setTimeout(() => {
                setIsActioning(false);
                setActionFeedback(null);
            }, 1200);
        } else {
            // Snap back
            setSwipeOffset(0);
        }
    }, [swipeOffset, order, onStatusChange]);

    const rightReveal = Math.max(0, swipeOffset);
    const leftReveal = Math.max(0, -swipeOffset);

    return (
        <div className="relative overflow-hidden" style={{ touchAction: "pan-y" }}>
            {/* ── Right action bg (advance) ── */}
            {rightReveal > 10 && (
                <div
                    className="absolute inset-0 flex items-center pl-5 bg-[#0B0B0B] z-0"
                    style={{ opacity: Math.min(1, rightReveal / SWIPE_THRESHOLD) }}
                >
                    <div className="flex items-center gap-2 text-white">
                        <ArrowRight size={18} />
                        <span className="text-xs font-bold uppercase tracking-widest">Advance</span>
                    </div>
                </div>
            )}

            {/* ── Left action bg (help) ── */}
            {leftReveal > 10 && (
                <div
                    className="absolute inset-0 flex items-center justify-end pr-5 bg-red-600 z-0"
                    style={{ opacity: Math.min(1, leftReveal / SWIPE_THRESHOLD) }}
                >
                    <div className="flex items-center gap-2 text-white">
                        <span className="text-xs font-bold uppercase tracking-widest">Help</span>
                        <AlertCircle size={18} />
                    </div>
                </div>
            )}

            {/* ── Card body ── */}
            <div
                ref={cardRef}
                className="relative z-10 bg-white border-b border-[#E5E7EB] transition-transform"
                style={{
                    transform: `translateX(${swipeOffset}px)`,
                    transition: swipeOffset === 0 ? "transform 0.3s cubic-bezier(0.16,1,0.3,1)" : "none",
                }}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                <Link href={`/orders/${order.id}`} className="block p-4 active:bg-[#F8F9FA] transition-colors">
                    {/* ── Top row ── */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="font-serif text-[15px] font-semibold text-[#0B0B0B] truncate">
                                    {order.customer.name}
                                </span>
                            </div>
                            <p className="text-[11px] font-bold text-[#9CA3AF] tracking-widest uppercase">
                                {order.orderNumber}
                            </p>
                        </div>
                        <div className="flex flex-col items-end gap-2 flex-shrink-0">
                            <StatusBadge status={order.status} />
                            <ChevronRight size={14} className="text-[#9CA3AF]" />
                        </div>
                    </div>

                    {/* ── Items summary ── */}
                    <div className="flex items-center gap-2 mb-3">
                        <Package size={12} className="text-[#9CA3AF] flex-shrink-0" />
                        <p className="text-[12px] text-[#6B7280] truncate">
                            {order.items.length === 1
                                ? order.items[0].name
                                : `${order.items[0].name} +${order.items.length - 1} more`}
                        </p>
                    </div>

                    {/* ── Bottom row ── */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-[11px] text-[#9CA3AF]">
                            <MapPin size={11} />
                            <span>{order.customer.city}</span>
                            <span className="text-[#E5E7EB]">·</span>
                            <span>{formatDate(order.createdAt)}</span>
                        </div>
                        <span className="font-serif text-[15px] font-semibold text-[#0B0B0B]">
                            {formatCurrency(order.total)}
                        </span>
                    </div>
                </Link>

                {/* Action feedback overlay */}
                {isActioning && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/95 animate-fade-in z-20">
                        <div className="text-center">
                            <div className={`text-[11px] font-bold uppercase tracking-widest ${actionFeedback === "advance" ? "text-green-600" : "text-red-600"
                                }`}>
                                {actionFeedback === "advance" ? "✓ Status Updated" : "⚠ Flagged for Help"}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
