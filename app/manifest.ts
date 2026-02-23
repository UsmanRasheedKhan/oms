import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: "Elite Order Management",
        short_name: "Elite OMS",
        description: "Luxury-grade order management system for high-end retail",
        start_url: "/",
        display: "standalone",
        orientation: "portrait",
        background_color: "#FFFFFF",
        theme_color: "#0B0B0B",
        categories: ["business", "productivity"],
        icons: [
            {
                src: "/icons/icon-192x192.png",
                sizes: "192x192",
                type: "image/png",
                purpose: "maskable",
            },
            {
                src: "/icons/icon-512x512.png",
                sizes: "512x512",
                type: "image/png",
                purpose: "any",
            },
        ],
        screenshots: [],
        shortcuts: [
            {
                name: "New Order",
                short_name: "New Order",
                description: "Create a new order",
                url: "/orders/new",
                icons: [{ src: "/icons/icon-192x192.png", sizes: "192x192" }],
            },
        ],
    };
}
