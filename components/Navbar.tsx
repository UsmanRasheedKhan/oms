"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useUIStore } from "@/store/useUIStore";
import {
    LayoutDashboard,
    Plus,
    Users,
    BarChart3,
    Package,
    Settings,
    TrendingUp
} from "lucide-react";

const navItems = [
    { href: "/", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/orders/new", icon: Plus, label: "New Order" },
    { href: "/customers", icon: Users, label: "Customers" },
    { href: "/products", icon: Package, label: "Products" },
    { href: "/inventory", icon: BarChart3, label: "Inventory" },
    { href: "/finance", icon: TrendingUp, label: "Finance" },
    { href: "/settings", icon: Settings, label: "Settings" },
];

export default function Navbar() {
    const pathname = usePathname();

    return (
        <>
            {/* ── Desktop Left Sidebar ── */}
            <aside className="hidden md:flex flex-col fixed left-0 top-0 h-full w-64 bg-[#0B0B0B] z-50 border-r border-white/10">
                {/* Brand */}
                <div className="px-6 py-8 border-b border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-[#C9A96E] flex items-center justify-center">
                            <Package size={16} className="text-[#0B0B0B]" />
                        </div>
                        <div>
                            <p className="font-serif text-white text-sm font-semibold leading-none">Elite OMS</p>
                            <p className="text-white/40 text-xs mt-0.5 tracking-widest uppercase">Order Management</p>
                        </div>
                    </div>
                </div>

                {/* Nav Links */}
                <nav className="flex-1 px-4 py-6 space-y-1">
                    {navItems.map(({ href, icon: Icon, label }) => {
                        const isActive = pathname === href || (href !== "/" && pathname.startsWith(href));
                        return (
                            <Link
                                key={href}
                                href={href}
                                className={`flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all duration-150 group
                  ${isActive
                                        ? "bg-white text-[#0B0B0B]"
                                        : "text-white/60 hover:text-white hover:bg-white/8"
                                    }`}
                            >
                                <Icon
                                    size={16}
                                    className={isActive ? "text-[#0B0B0B]" : "text-white/40 group-hover:text-white"}
                                />
                                <span className="tracking-wide">{label}</span>
                                {isActive && (
                                    <span className="ml-auto w-1 h-4 bg-[#C9A96E]" />
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Footer & Currency */}
                <div className="px-6 py-5 border-t border-white/10 flex flex-col gap-4">
                    <div className="flex items-center justify-between text-xs tracking-widest text-white/40">
                        <span>CURRENCY</span>
                        <div className="flex bg-white/5 rounded-sm p-0.5 border border-white/10">
                            <button
                                onClick={() => useUIStore.getState().setCurrency('PKR')}
                                className={`px-2 py-1 transition-colors ${useUIStore.getState().currency === 'PKR' ? 'bg-white text-black' : 'hover:text-white'}`}
                            >
                                PKR
                            </button>
                            <button
                                onClick={() => useUIStore.getState().setCurrency('USD')}
                                className={`px-2 py-1 transition-colors ${useUIStore.getState().currency === 'USD' ? 'bg-white text-black' : 'hover:text-white'}`}
                            >
                                USD
                            </button>
                        </div>
                    </div>
                    <p className="text-white/25 text-[10px] tracking-widest uppercase">Elite Retail Systems</p>
                </div>
            </aside>

            {/* ── Mobile Bottom Nav ── */}
            <nav className="md:hidden fixed bottom-0 inset-x-0 bg-[#0B0B0B] z-50 border-t border-white/10 pb-safe">
                <div className="flex items-center justify-around h-16">
                    {navItems.map(({ href, icon: Icon, label }) => {
                        const isActive = pathname === href || (href !== "/" && pathname.startsWith(href));
                        return (
                            <Link
                                key={href}
                                href={href}
                                className={`flex flex-col items-center gap-1 px-4 py-2 transition-all duration-150
                  ${isActive ? "text-[#C9A96E]" : "text-white/40"}`}
                            >
                                <Icon size={20} className={href === "/orders/new" && isActive ? "text-[#C9A96E]" : ""} />
                                <span className="text-[9px] uppercase tracking-widest font-semibold">{label}</span>
                            </Link>
                        );
                    })}
                </div>
            </nav>
        </>
    );
}
