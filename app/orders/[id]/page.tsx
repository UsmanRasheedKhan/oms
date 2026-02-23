"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Navbar from "@/components/Navbar";
import OrderTimeline from "@/components/OrderTimeline";
import StatusBadge from "@/components/StatusBadge";
import InvoiceDownload from "@/components/InvoiceDownload";
import { advanceOrderStatus, markOrderReturned } from "@/lib/orders";
import type { Order, OrderStatus } from "@/lib/types";
import { STATUS_LABELS, STATUS_FLOW } from "@/lib/types";
import { ChevronLeft, MapPin, Phone, Mail, Package, ArrowRight, RotateCcw, Loader2 } from "lucide-react";
import Link from "next/link";

function haptic(pattern: number | number[] = 50) {
    if (typeof window !== "undefined" && "vibrate" in navigator) {
        navigator.vibrate(pattern);
    }
}

function formatPKR(n: number) {
    return `PKR ${n.toLocaleString("en-PK")}`;
}

function formatDate(isoString: string) {
    return new Date(isoString).toLocaleDateString("en-PK", {
        weekday: "long", day: "numeric", month: "long", year: "numeric",
    });
}

export default function OrderDetailPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [advancing, setAdvancing] = useState(false);
    const [returning, setReturning] = useState(false);

    useEffect(() => {
        async function fetchOrder() {
            const snap = await getDoc(doc(db, "orders", id));
            if (snap.exists()) {
                setOrder({ id: snap.id, ...(snap.data() as Omit<Order, "id">) });
            }
            setLoading(false);
        }
        fetchOrder();
    }, [id]);

    async function handleAdvance() {
        if (!order?.id || !order.status) return;
        setAdvancing(true);
        haptic([40, 30, 40]);
        const next = await advanceOrderStatus(order.id, order.status);
        if (next) {
            setOrder((prev) => prev ? { ...prev, status: next } : prev);
        }
        setAdvancing(false);
    }

    async function handleReturn() {
        if (!order?.id) return;
        setReturning(true);
        haptic([80, 20, 80]);
        await markOrderReturned(order.id);
        setOrder((prev) => prev ? { ...prev, status: "returned" } : prev);
        setReturning(false);
    }

    if (loading) {
        return (
            <div className="min-h-dvh bg-[#F8F9FA] flex items-center justify-center md:ml-64">
                <Loader2 size={24} className="text-[#9CA3AF] animate-spin" />
                <Navbar />
            </div>
        );
    }

    if (!order) {
        return (
            <div className="min-h-dvh bg-[#F8F9FA] flex flex-col items-center justify-center gap-4 md:ml-64">
                <Navbar />
                <Package size={32} className="text-[#9CA3AF]" />
                <p className="font-serif text-lg text-[#0B0B0B]">Order not found</p>
                <Link href="/" className="btn btn-secondary">← Back to Dashboard</Link>
            </div>
        );
    }

    const canAdvance = STATUS_FLOW.includes(order.status) &&
        STATUS_FLOW.indexOf(order.status) < STATUS_FLOW.length - 1;

    const nextStatus = canAdvance
        ? STATUS_FLOW[STATUS_FLOW.indexOf(order.status) + 1] as OrderStatus
        : null;

    return (
        <div className="min-h-dvh bg-[#F8F9FA]">
            <Navbar />
            <main className="md:ml-64 pb-24 md:pb-10">

                {/* ── Header ── */}
                <div className="bg-white border-b border-[#E5E7EB] px-5 py-5 md:px-8">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-[#9CA3AF] hover:text-[#0B0B0B] transition-colors mb-4"
                    >
                        <ChevronLeft size={14} />
                        Orders
                    </Link>
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                        <div>
                            <p className="text-[10px] uppercase tracking-[0.15em] text-[#9CA3AF] font-semibold mb-1">
                                {order.orderNumber}
                            </p>
                            <h1 className="heading-serif text-2xl font-semibold text-[#0B0B0B]">
                                {order.customer.name}
                            </h1>
                            <p className="text-xs text-[#9CA3AF] mt-1">{formatDate(order.createdAt)}</p>
                        </div>
                        <StatusBadge status={order.status} />
                    </div>
                </div>

                <div className="max-w-3xl mx-auto px-0 md:px-8 md:py-6 space-y-4">

                    {/* ── Action buttons ── */}
                    {(canAdvance || order.status !== "returned") && (
                        <div className="bg-white border border-[#E5E7EB] md:shadow-luxury p-4 flex flex-wrap gap-3">
                            {canAdvance && nextStatus && (
                                <button
                                    onClick={handleAdvance}
                                    disabled={advancing}
                                    className="btn btn-primary flex-1 gap-2"
                                >
                                    {advancing ? <Loader2 size={14} className="animate-spin" /> : <ArrowRight size={14} />}
                                    Mark as {STATUS_LABELS[nextStatus]}
                                </button>
                            )}
                            {order.status !== "returned" && order.status !== "delivered" && (
                                <button
                                    onClick={handleReturn}
                                    disabled={returning}
                                    className="btn btn-secondary gap-2 min-w-[120px]"
                                >
                                    {returning ? <Loader2 size={14} className="animate-spin" /> : <RotateCcw size={14} />}
                                    Flag Return
                                </button>
                            )}
                        </div>
                    )}

                    {/* ── Timeline ── */}
                    <div className="bg-white border border-[#E5E7EB] md:shadow-luxury">
                        <div className="px-5 py-4 border-b border-[#E5E7EB] flex items-center gap-2">
                            <span className="gold-line mb-0 w-5" />
                            <h2 className="font-serif text-base font-semibold text-[#0B0B0B]">Order Timeline</h2>
                        </div>
                        <div className="p-5">
                            <OrderTimeline order={order} />
                        </div>
                    </div>

                    {/* ── Customer ── */}
                    <div className="bg-white border border-[#E5E7EB] md:shadow-luxury">
                        <div className="px-5 py-4 border-b border-[#E5E7EB]">
                            <h2 className="font-serif text-base font-semibold text-[#0B0B0B]">Customer</h2>
                        </div>
                        <div className="p-5 space-y-3">
                            <p className="font-serif text-lg text-[#0B0B0B]">{order.customer.name}</p>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm text-[#6B7280]">
                                    <Phone size={13} className="flex-shrink-0" />
                                    <span>{order.customer.phone}</span>
                                </div>
                                {order.customer.email && (
                                    <div className="flex items-center gap-2 text-sm text-[#6B7280]">
                                        <Mail size={13} className="flex-shrink-0" />
                                        <span>{order.customer.email}</span>
                                    </div>
                                )}
                                <div className="flex items-start gap-2 text-sm text-[#6B7280]">
                                    <MapPin size={13} className="flex-shrink-0 mt-0.5" />
                                    <span>{order.customer.address}, {order.customer.city}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── Items ── */}
                    <div className="bg-white border border-[#E5E7EB] md:shadow-luxury">
                        <div className="px-5 py-4 border-b border-[#E5E7EB]">
                            <h2 className="font-serif text-base font-semibold text-[#0B0B0B]">Order Items</h2>
                        </div>
                        <div className="divide-y divide-[#E5E7EB]">
                            {order.items.map((item, i) => (
                                <div key={i} className="px-5 py-4 flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 bg-[#F8F9FA] border border-[#E5E7EB] flex items-center justify-center flex-shrink-0">
                                            <Package size={14} className="text-[#9CA3AF]" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-[#0B0B0B]">{item.name}</p>
                                            <p className="text-xs text-[#9CA3AF]">{formatPKR(item.unitPrice)} × {item.qty}</p>
                                        </div>
                                    </div>
                                    <span className="font-serif text-sm font-semibold text-[#0B0B0B] flex-shrink-0">
                                        {formatPKR(item.unitPrice * item.qty)}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* Cost summary */}
                        <div className="bg-[#0B0B0B] p-5">
                            {[
                                { label: "Subtotal", value: order.subtotal },
                                { label: "Shipping", value: order.shippingCost },
                                { label: "Tax", value: order.tax },
                                { label: "Discount", value: -order.discount },
                            ].map(({ label, value }) => (
                                <div key={label} className="flex justify-between py-1.5 border-b border-white/10 last:border-0">
                                    <span className="text-xs text-white/50 uppercase tracking-widest">{label}</span>
                                    <span className={`text-sm ${value < 0 ? "text-red-400" : "text-white/80"}`}>
                                        {value < 0 ? `- ${formatPKR(-value)}` : formatPKR(value)}
                                    </span>
                                </div>
                            ))}
                            <div className="flex justify-between pt-3 mt-1">
                                <span className="font-serif text-white font-semibold">Total</span>
                                <span className="font-serif text-[#C9A96E] text-lg font-semibold">
                                    {formatPKR(order.total)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* ── Notes ── */}
                    {order.notes && (
                        <div className="bg-white border border-[#E5E7EB] md:shadow-luxury p-5">
                            <p className="text-[10px] uppercase tracking-widest text-[#9CA3AF] font-semibold mb-2">Notes</p>
                            <p className="text-sm text-[#6B7280]">{order.notes}</p>
                        </div>
                    )}

                    {/* ── Invoice ── */}
                    <div className="bg-white border border-[#E5E7EB] md:shadow-luxury p-5">
                        <p className="text-[10px] uppercase tracking-widest text-[#9CA3AF] font-semibold mb-4">Invoice</p>
                        <InvoiceDownload order={order} />
                    </div>
                </div>
            </main>
        </div>
    );
}
