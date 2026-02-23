import type { OrderStatus } from "@/lib/types";
import { STATUS_LABELS } from "@/lib/types";

const STATUS_STYLES: Record<OrderStatus, { bg: string; text: string; dot: string }> = {
    new: {
        bg: "bg-[#F5F5F5] border-[#0B0B0B]/20",
        text: "text-[#0B0B0B]",
        dot: "bg-[#0B0B0B]",
    },
    in_process: {
        bg: "bg-[#FFFBEB] border-amber-300/60",
        text: "text-amber-700",
        dot: "bg-amber-500",
    },
    shipped: {
        bg: "bg-[#EFF6FF] border-blue-300/60",
        text: "text-blue-700",
        dot: "bg-blue-500",
    },
    delivered: {
        bg: "bg-[#F0FDF4] border-green-300/60",
        text: "text-green-700",
        dot: "bg-green-500",
    },
    returned: {
        bg: "bg-[#FEF2F2] border-red-300/60",
        text: "text-red-700",
        dot: "bg-red-500",
    },
};

interface StatusBadgeProps {
    status: OrderStatus;
    size?: "sm" | "md";
}

export default function StatusBadge({ status, size = "md" }: StatusBadgeProps) {
    const styles = STATUS_STYLES[status];

    return (
        <span
            className={`inline-flex items-center gap-1.5 border font-bold uppercase tracking-[0.1em]
        ${styles.bg} ${styles.text}
        ${size === "sm" ? "px-2 py-0.5 text-[9px]" : "px-2.5 py-1 text-[10px]"}
      `}
        >
            <span className={`w-1.5 h-1.5 rounded-full ${styles.dot}`} />
            {STATUS_LABELS[status]}
        </span>
    );
}
