import type { Order } from "@/lib/types";
import { TIMELINE_STEPS } from "@/lib/types";
import { Check } from "lucide-react";

interface OrderTimelineProps {
    order: Order;
}

function getStepState(stepStatus: string, order: Order): "completed" | "active" | "pending" {
    const statusOrder = ["new", "in_process", "shipped", "delivered"];
    const currentIndex = statusOrder.indexOf(order.status);
    const stepIndex = statusOrder.indexOf(stepStatus);

    if (order.status === "returned") {
        // Show as completed up to the last known status
        return stepIndex < currentIndex ? "completed" : "pending";
    }

    if (stepIndex < currentIndex) return "completed";
    if (stepIndex === currentIndex) return "active";
    return "pending";
}

function getStepTimestamp(stepStatus: string, order: Order): string | null {
    const entry = order.timeline
        .slice()
        .reverse()
        .find((t) => t.status === stepStatus);
    if (!entry) return null;
    return new Date(entry.timestamp).toLocaleString("en-PK", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
    });
}

export default function OrderTimeline({ order }: OrderTimelineProps) {
    return (
        <div className="px-4 py-2">
            {TIMELINE_STEPS.map((step, index) => {
                const state = getStepState(step.status, order);
                const timestamp = getStepTimestamp(step.status, order);
                const isLast = index === TIMELINE_STEPS.length - 1;

                return (
                    <div key={step.status} className="flex gap-4">
                        {/* ── Dot + line ── */}
                        <div className="flex flex-col items-center">
                            <div
                                className={`w-6 h-6 rounded-full flex items-center justify-center border-2 flex-shrink-0 transition-all
                  ${state === "completed"
                                        ? "border-[#0B0B0B] bg-[#0B0B0B]"
                                        : state === "active"
                                            ? "border-[#C9A96E] bg-white shadow-[0_0_0_4px_#E8D5B0]"
                                            : "border-[#E5E7EB] bg-white"
                                    }`}
                            >
                                {state === "completed" && (
                                    <Check size={12} strokeWidth={3} className="text-white" />
                                )}
                                {state === "active" && (
                                    <div className="w-2 h-2 rounded-full bg-[#C9A96E] animate-pulse-dot" />
                                )}
                            </div>
                            {!isLast && (
                                <div
                                    className={`w-px flex-1 my-1 ${state === "completed" ? "bg-[#0B0B0B]/20" : "bg-[#E5E7EB]"
                                        }`}
                                    style={{ minHeight: "2rem" }}
                                />
                            )}
                        </div>

                        {/* ── Step content ── */}
                        <div className={`pb-6 flex-1 ${isLast ? "pb-0" : ""}`}>
                            <div className="flex items-start justify-between gap-2">
                                <div>
                                    <p
                                        className={`text-sm font-semibold leading-snug transition-colors
                      ${state === "pending" ? "text-[#9CA3AF]" : "text-[#0B0B0B]"}`}
                                    >
                                        {step.label}
                                    </p>
                                    <p
                                        className={`text-xs mt-0.5 leading-relaxed
                      ${state === "pending" ? "text-[#C4C9D4]" : "text-[#6B7280]"}`}
                                    >
                                        {step.description}
                                    </p>
                                </div>
                                {timestamp && (
                                    <span className="text-[10px] text-[#9CA3AF] whitespace-nowrap pt-0.5 flex-shrink-0">
                                        {timestamp}
                                    </span>
                                )}
                            </div>

                            {/* Return flag */}
                            {state === "active" && order.status === "returned" && (
                                <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 bg-red-50 border border-red-200 text-red-700 text-[10px] font-bold uppercase tracking-wider">
                                    ⚠ Flagged for Return
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}

            {/* Return step (only when returned) */}
            {order.status === "returned" && (
                <div className="flex gap-4 mt-0">
                    <div className="flex flex-col items-center">
                        <div className="w-6 h-6 rounded-full flex items-center justify-center border-2 border-red-400 bg-red-50 flex-shrink-0">
                            <div className="w-2 h-2 rounded-full bg-red-500" />
                        </div>
                    </div>
                    <div className="pb-2 flex-1">
                        <p className="text-sm font-semibold text-red-600 leading-snug">Return Initiated</p>
                        <p className="text-xs text-red-400 mt-0.5">Order flagged and queued for return</p>
                    </div>
                </div>
            )}
        </div>
    );
}
