"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import OrderCard from "@/components/OrderCard";
import OfflineBanner from "@/components/OfflineBanner";
import { subscribeToOrders, seedDemoOrders } from "@/lib/orders";
import type { Order, OrderStatus } from "@/lib/types";
import { STATUS_LABELS } from "@/lib/types";
import { Plus, RefreshCw, Package, TrendingUp, Truck, CheckCircle2 } from "lucide-react";
import { useUIStore } from "@/store/useUIStore";

type TabStatus = "new" | "in_process" | "shipped" | "delivered" | "returned";

const TABS: { status: TabStatus; label: string }[] = [
  { status: "new", label: "New Orders" },
  { status: "in_process", label: "In Process" },
  { status: "shipped", label: "Shipped" },
  { status: "delivered", label: "Delivered" },
  { status: "returned", label: "Returns" },
];

function StatCard({ label, value, icon: Icon, accent }: {
  label: string; value: number | string; icon: React.ElementType; accent?: boolean;
}) {
  return (
    <div className={`flex items-center gap-4 p-4 border ${accent ? "bg-[#0B0B0B] border-[#0B0B0B]" : "bg-white border-[#E5E7EB]"}`}>
      <div className={`w-10 h-10 flex items-center justify-center flex-shrink-0 ${accent ? "bg-[#C9A96E]/20" : "bg-[#F8F9FA]"}`}>
        <Icon size={18} className={accent ? "text-[#C9A96E]" : "text-[#6B7280]"} />
      </div>
      <div>
        <p className={`text-xl font-serif font-semibold ${accent ? "text-[#C9A96E]" : "text-[#0B0B0B]"}`}>{value}</p>
        <p className={`text-[10px] uppercase tracking-widest font-semibold ${accent ? "text-white/50" : "text-[#9CA3AF]"}`}>{label}</p>
      </div>
    </div>
  );
}

function formatCurrency(n: number, currencyCode: string) {
  const sym = currencyCode === 'USD' ? '$' : 'PKR';
  if (n >= 1000) return `${sym} ${(n / 1000).toFixed(1)}k`;
  return `${sym} ${n}`;
}

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<TabStatus>("new");
  const [orders, setOrders] = useState<Order[]>([]);
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const currency = useUIStore((state) => state.currency);

  // Subscribe to active tab orders
  useEffect(() => {
    setLoading(true);
    const unsub = subscribeToOrders(activeTab, (data) => {
      setOrders(data);
      setLoading(false);
    });
    return () => unsub();
  }, [activeTab]);

  // Subscribe to all orders for stats
  useEffect(() => {
    const unsub = subscribeToOrders("all", (data) => setAllOrders(data));
    return () => unsub();
  }, []);

  const handleStatusChange = useCallback((id: string, newStatus: OrderStatus) => {
    setOrders((prev) => prev.filter((o) => o.id !== id || newStatus === activeTab));
  }, [activeTab]);

  async function handleSeedData() {
    setSeeding(true);
    await seedDemoOrders();
    setSeeding(false);
  }

  // Stats
  const stats = {
    new: allOrders.filter((o) => o.status === "new").length,
    shipped: allOrders.filter((o) => o.status === "shipped").length,
    delivered: allOrders.filter((o) => o.status === "delivered").length,
    revenue: allOrders.filter(o => o.status === "delivered").reduce((s, o) => s + o.total, 0),
  };

  const tabCount = (status: TabStatus) => allOrders.filter((o) => o.status === status).length;

  return (
    <div className="min-h-dvh bg-[#F8F9FA]">
      <OfflineBanner />
      <Navbar />

      <main className="md:ml-64 pb-24 md:pb-6">
        {/* ── Page Header ── */}
        <div className="bg-white border-b border-[#E5E7EB] px-5 py-6 md:px-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] uppercase tracking-[0.15em] text-[#9CA3AF] font-semibold mb-1">
                Elite Order Management
              </p>
              <h1 className="heading-serif text-2xl md:text-3xl font-semibold text-[#0B0B0B] leading-tight">
                Order Dashboard
              </h1>
            </div>
            <Link href="/orders/new" className="btn btn-primary gap-2 hidden sm:inline-flex">
              <Plus size={15} />
              New Order
            </Link>
          </div>

          {/* ── Stats row ── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-6">
            <StatCard label="Pending" value={stats.new} icon={Package} />
            <StatCard label="In Transit" value={stats.shipped} icon={Truck} />
            <StatCard label="Delivered" value={stats.delivered} icon={CheckCircle2} />
            <StatCard label="Products" value={42} icon={Package} />
            <StatCard label="Inv Value" value={`${currency === 'USD' ? '$' : 'PKR'} 2.5k`} icon={TrendingUp} accent />
            <StatCard label="Revenue" value={formatCurrency(stats.revenue, currency)} icon={TrendingUp} accent />
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="bg-white border-b border-[#E5E7EB] sticky top-0 z-20">
          <div className="tab-list px-2 md:px-8" role="tablist">
            {TABS.map(({ status, label }) => {
              const count = tabCount(status);
              return (
                <button
                  key={status}
                  role="tab"
                  aria-selected={activeTab === status}
                  onClick={() => setActiveTab(status)}
                  className={`tab-item flex items-center gap-2 ${activeTab === status ? "active" : ""}`}
                >
                  {label}
                  {count > 0 && (
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 min-w-[20px] text-center leading-none
                      ${activeTab === status
                        ? "bg-[#0B0B0B] text-white"
                        : "bg-[#F8F9FA] text-[#6B7280]"}`}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Orders list ── */}
        <div className="max-w-3xl mx-auto md:px-8 md:pt-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <RefreshCw size={20} className="text-[#9CA3AF] animate-spin" />
              <p className="text-sm text-[#9CA3AF]">Loading orders…</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4 text-center px-6">
              <div className="w-14 h-14 bg-[#F8F9FA] border border-[#E5E7EB] flex items-center justify-center">
                <Package size={22} className="text-[#9CA3AF]" />
              </div>
              <div>
                <p className="font-serif text-lg text-[#0B0B0B] mb-1">No {STATUS_LABELS[activeTab]} orders</p>
                <p className="text-sm text-[#9CA3AF]">
                  {activeTab === "new"
                    ? "Create your first order to get started."
                    : `No orders with status "${STATUS_LABELS[activeTab]}" yet.`}
                </p>
              </div>
              {activeTab === "new" && (
                <div className="flex gap-3 flex-wrap justify-center">
                  <Link href="/orders/new" className="btn btn-primary gap-2">
                    <Plus size={14} />
                    Create Order
                  </Link>
                  <button
                    onClick={handleSeedData}
                    disabled={seeding}
                    className="btn btn-secondary gap-2"
                  >
                    {seeding ? <RefreshCw size={14} className="animate-spin" /> : null}
                    Load Demo Data
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="md:border md:border-[#E5E7EB] md:shadow-luxury overflow-hidden">
              {orders.map((order, index) => (
                <div key={order.id} className={`animate-in`} style={{ animationDelay: `${index * 40}ms` }}>
                  <OrderCard order={order} onStatusChange={handleStatusChange} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Mobile FAB */}
        <Link
          href="/orders/new"
          className="sm:hidden fixed bottom-20 right-5 w-14 h-14 bg-[#0B0B0B] text-white flex items-center justify-center shadow-luxury-md z-30"
          aria-label="New Order"
        >
          <Plus size={22} />
        </Link>
      </main>
    </div>
  );
}
