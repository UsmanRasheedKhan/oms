// Firestore order schema types

export type OrderStatus =
    | "new"
    | "in_process"
    | "shipped"
    | "delivered"
    | "returned";

export interface OrderItem {
    productId: string;
    name: string;
    qty: number;
    unitPrice: number;
    imageUrl?: string;
}

export interface TimelineEntry {
    status: OrderStatus;
    timestamp: string; // ISO string
    note?: string;
}

export interface Customer {
    id?: string;
    name: string;
    phone: string;
    email?: string;
    address: string;
    city: string;
}

export interface Order {
    id?: string;
    orderNumber: string;
    customer: Customer;
    items: OrderItem[];
    subtotal: number;
    shippingCost: number;
    discount: number;
    tax: number;
    total: number;
    status: OrderStatus;
    timeline: TimelineEntry[];
    notes?: string;
    createdAt: string;
    updatedAt: string;
}

export interface Product {
    id?: string;
    name: string;
    sku: string;
    price: number;
    imageUrl?: string;
    category?: string;
    stock?: number;
}

export const STATUS_LABELS: Record<OrderStatus, string> = {
    new: "New",
    in_process: "In Process",
    shipped: "Shipped",
    delivered: "Delivered",
    returned: "Returned",
};

export const STATUS_FLOW: OrderStatus[] = [
    "new",
    "in_process",
    "shipped",
    "delivered",
];

export const TIMELINE_STEPS: Array<{ status: OrderStatus; label: string; description: string }> = [
    { status: "new", label: "Order Placed", description: "Order received and confirmed" },
    { status: "in_process", label: "Arrived at Warehouse", description: "Item arrived at WH — QC in progress" },
    { status: "shipped", label: "Packed & Shipped", description: "QC passed, packed and handed to courier" },
    { status: "delivered", label: "Delivered", description: "Successfully delivered to customer" },
];
