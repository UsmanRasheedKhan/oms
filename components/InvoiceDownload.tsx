"use client";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { Order } from "@/lib/types";
import { STATUS_LABELS } from "@/lib/types";
import { Download, Printer } from "lucide-react";

interface InvoiceDownloadProps {
    order: Order;
}

function formatPKR(n: number) {
    return `PKR ${n.toLocaleString("en-PK")}`;
}

function generatePDF(order: Order): jsPDF {
    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const pageW = doc.internal.pageSize.getWidth();

    // ── Header background ──
    doc.setFillColor(11, 11, 11); // obsidian
    doc.rect(0, 0, pageW, 38, "F");

    // Brand name
    doc.setFont("times", "bold");
    doc.setFontSize(20);
    doc.setTextColor(201, 169, 110); // gold
    doc.text("ELITE OMS", 14, 18);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(180, 180, 180);
    doc.text("ORDER MANAGEMENT SYSTEM", 14, 24);

    // INVOICE label
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(255, 255, 255);
    doc.text("INVOICE", pageW - 14, 20, { align: "right" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(180, 180, 180);
    doc.text(order.orderNumber, pageW - 14, 28, { align: "right" });
    doc.text(
        new Date(order.createdAt).toLocaleDateString("en-PK", {
            day: "numeric",
            month: "long",
            year: "numeric",
        }),
        pageW - 14,
        34,
        { align: "right" }
    );

    // ── Customer section ──
    let y = 50;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(150, 150, 150);
    doc.text("BILLED TO", 14, y);

    y += 5;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(11, 11, 11);
    doc.text(order.customer.name, 14, y);

    y += 5;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text(order.customer.address, 14, y);
    y += 5;
    doc.text(`${order.customer.city}`, 14, y);
    y += 5;
    doc.text(order.customer.phone, 14, y);
    if (order.customer.email) {
        y += 5;
        doc.text(order.customer.email, 14, y);
    }

    // Status badge area on right
    const statusY = 50;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(150, 150, 150);
    doc.text("STATUS", pageW - 14, statusY, { align: "right" });
    doc.setFontSize(10);
    doc.setTextColor(11, 11, 11);
    doc.text(STATUS_LABELS[order.status].toUpperCase(), pageW - 14, statusY + 5, { align: "right" });

    // ── Separator line ──
    y += 10;
    doc.setDrawColor(229, 231, 235);
    doc.setLineWidth(0.3);
    doc.line(14, y, pageW - 14, y);
    y += 8;

    // ── Items table ──
    autoTable(doc, {
        startY: y,
        head: [["#", "ITEM", "QTY", "UNIT PRICE", "TOTAL"]],
        body: order.items.map((item, i) => [
            i + 1,
            item.name,
            item.qty,
            formatPKR(item.unitPrice),
            formatPKR(item.qty * item.unitPrice),
        ]),
        headStyles: {
            fillColor: [11, 11, 11],
            textColor: [255, 255, 255],
            fontStyle: "bold",
            fontSize: 7,
            cellPadding: 4,
            halign: "left",
        },
        bodyStyles: {
            fontSize: 9,
            cellPadding: 4,
            textColor: [11, 11, 11],
            lineColor: [229, 231, 235],
            lineWidth: 0.3,
        },
        alternateRowStyles: { fillColor: [248, 249, 250] },
        columnStyles: {
            0: { cellWidth: 10, halign: "center" },
            2: { cellWidth: 15, halign: "center" },
            3: { cellWidth: 35, halign: "right" },
            4: { cellWidth: 35, halign: "right" },
        },
        margin: { left: 14, right: 14 },
    });

    // ── Cost summary ──
    const finalY = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8;

    const summaryRows: [string, string, boolean][] = [
        ["Subtotal", formatPKR(order.subtotal), false],
        ["Shipping", formatPKR(order.shippingCost), false],
        ["Tax", formatPKR(order.tax), false],
        ["Discount", `- ${formatPKR(order.discount)}`, false],
    ];

    autoTable(doc, {
        startY: finalY,
        body: [
            ...summaryRows.map(([label, value]) => [label, value]),
            ["TOTAL", formatPKR(order.total)],
        ],
        bodyStyles: {
            fontSize: 9,
            cellPadding: 3,
            textColor: [11, 11, 11],
        },
        columnStyles: {
            0: { fontStyle: "normal", textColor: [100, 100, 100] },
            1: { halign: "right" },
        },
        didParseCell: (data) => {
            if (data.row.index === summaryRows.length) {
                data.cell.styles.fontStyle = "bold";
                data.cell.styles.fontSize = 11;
                data.cell.styles.fillColor = [11, 11, 11];
                data.cell.styles.textColor = [201, 169, 110];
            }
        },
        margin: { left: pageW / 2, right: 14 },
    });

    // ── Footer ──
    const footerY = doc.internal.pageSize.getHeight() - 14;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(180, 180, 180);
    doc.text("Generated by Elite OMS · Thank you for your order", pageW / 2, footerY, {
        align: "center",
    });

    return doc;
}

export default function InvoiceDownload({ order }: InvoiceDownloadProps) {
    function handleDownload() {
        const doc = generatePDF(order);
        doc.save(`${order.orderNumber}-invoice.pdf`);
    }

    function handlePrint() {
        const doc = generatePDF(order);
        const blob = doc.output("blob");
        const url = URL.createObjectURL(blob);
        window.open(url, "_blank");
    }

    return (
        <div className="flex gap-3">
            <button onClick={handleDownload} className="btn btn-primary gap-2">
                <Download size={14} />
                Download Invoice
            </button>
            <button onClick={handlePrint} className="btn btn-secondary gap-2">
                <Printer size={14} />
                Print
            </button>
        </div>
    );
}
