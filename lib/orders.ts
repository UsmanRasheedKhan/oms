import {
    collection,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    getDocs,
    query,
    where,
    orderBy,
    onSnapshot,
    Timestamp,
    type Unsubscribe,
} from "firebase/firestore";
import { db } from "./firebase";
import type { Order, OrderStatus, TimelineEntry } from "./types";
import { STATUS_FLOW } from "./types";

const ORDERS_COLLECTION = "orders";

// ── Generate order number ──────────────────────────────────────────────────
function generateOrderNumber(): string {
    const num = Math.floor(10000 + Math.random() * 90000);
    return `ELT-${num}`;
}

// ── Create a new order ─────────────────────────────────────────────────────
export async function createOrder(
    data: Omit<Order, "id" | "orderNumber" | "createdAt" | "updatedAt" | "status" | "timeline">
): Promise<string> {
    const now = new Date().toISOString();
    const initialTimeline: TimelineEntry[] = [
        { status: "new", timestamp: now, note: "Order placed" },
    ];

    const orderData: Omit<Order, "id"> = {
        ...data,
        orderNumber: generateOrderNumber(),
        status: "new",
        timeline: initialTimeline,
        createdAt: now,
        updatedAt: now,
    };

    const docRef = await addDoc(collection(db, ORDERS_COLLECTION), orderData);
    return docRef.id;
}

// ── Update order status ────────────────────────────────────────────────────
export async function updateOrderStatus(
    id: string,
    newStatus: OrderStatus,
    note?: string
): Promise<void> {
    const orderRef = doc(db, ORDERS_COLLECTION, id);
    const now = new Date().toISOString();

    const timelineEntry: TimelineEntry = {
        status: newStatus,
        timestamp: now,
        note: note ?? `Status updated to ${newStatus}`,
    };

    // We need to fetch current timeline to append
    const { getDoc } = await import("firebase/firestore");
    const snap = await getDoc(orderRef);
    const currentTimeline: TimelineEntry[] = snap.data()?.timeline ?? [];

    await updateDoc(orderRef, {
        status: newStatus,
        timeline: [...currentTimeline, timelineEntry],
        updatedAt: now,
    });
}

// ── Advance order to next status ───────────────────────────────────────────
export async function advanceOrderStatus(
    id: string,
    currentStatus: OrderStatus
): Promise<OrderStatus | null> {
    const currentIndex = STATUS_FLOW.indexOf(currentStatus);
    if (currentIndex === -1 || currentIndex >= STATUS_FLOW.length - 1) return null;
    const nextStatus = STATUS_FLOW[currentIndex + 1];
    await updateOrderStatus(id, nextStatus);
    return nextStatus;
}

// ── Real-time listener for orders by status ────────────────────────────────
export function subscribeToOrders(
    status: OrderStatus | "all",
    callback: (orders: Order[]) => void
): Unsubscribe {
    let q;
    if (status === "all") {
        q = query(
            collection(db, ORDERS_COLLECTION),
            orderBy("createdAt", "desc")
        );
    } else {
        q = query(
            collection(db, ORDERS_COLLECTION),
            where("status", "==", status),
            orderBy("createdAt", "desc")
        );
    }

    return onSnapshot(q, (snapshot) => {
        const orders: Order[] = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...(doc.data() as Omit<Order, "id">),
        }));
        callback(orders);
    });
}

// ── Get a batch of orders by status (one-time fetch) ──────────────────────
export async function getOrders(status?: OrderStatus): Promise<Order[]> {
    let q;
    if (status) {
        q = query(
            collection(db, ORDERS_COLLECTION),
            where("status", "==", status),
            orderBy("createdAt", "desc")
        );
    } else {
        q = query(collection(db, ORDERS_COLLECTION), orderBy("createdAt", "desc"));
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Order, "id">),
    }));
}

// ── Delete / return order ──────────────────────────────────────────────────
export async function markOrderReturned(id: string): Promise<void> {
    await updateOrderStatus(id, "returned", "Order flagged for return/help");
}

export async function deleteOrder(id: string): Promise<void> {
    await deleteDoc(doc(db, ORDERS_COLLECTION, id));
}

// ── Seed demo data ─────────────────────────────────────────────────────────
export async function seedDemoOrders(): Promise<void> {
    const demoOrders: Array<Omit<Order, "id" | "orderNumber" | "createdAt" | "updatedAt" | "status" | "timeline">> = [
        {
            customer: {
                name: "Ayesha Tariq",
                phone: "+92-300-1234567",
                email: "ayesha.t@email.com",
                address: "House 14, Block D, Gulberg III",
                city: "Lahore",
            },
            items: [
                { productId: "p1", name: "Embroidered Lawn Suit", qty: 1, unitPrice: 4500, imageUrl: "" },
                { productId: "p2", name: "Silk Dupatta", qty: 1, unitPrice: 1800, imageUrl: "" },
            ],
            subtotal: 6300,
            shippingCost: 250,
            discount: 500,
            tax: 0,
            total: 6050,
            notes: "Gift wrap requested",
        },
        {
            customer: {
                name: "Zara Ahmed",
                phone: "+92-321-9876543",
                address: "Apt 5B, Clifton Block 2",
                city: "Karachi",
            },
            items: [
                { productId: "p3", name: "Chiffon Evening Gown", qty: 1, unitPrice: 12500, imageUrl: "" },
            ],
            subtotal: 12500,
            shippingCost: 350,
            discount: 0,
            tax: 0,
            total: 12850,
        },
        {
            customer: {
                name: "Maryam Siddiqui",
                phone: "+92-333-5554444",
                address: "Street 7, F-8/4",
                city: "Islamabad",
            },
            items: [
                { productId: "p4", name: "Stitched Khaddar Ensemble", qty: 2, unitPrice: 3200, imageUrl: "" },
            ],
            subtotal: 6400,
            shippingCost: 300,
            discount: 300,
            tax: 0,
            total: 6400,
        },
    ];

    for (const order of demoOrders) {
        await createOrder(order);
    }
}
