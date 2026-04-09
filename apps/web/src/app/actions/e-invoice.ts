"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getInvoices(tenantId: string) {
    try {
        const invoices = await prisma.invoice.findMany({
            where: { tenantId },
            orderBy: { createdAt: 'desc' }
        });

        // Calculate statistics
        const totalAmount = invoices.reduce((acc, inv) => acc + Number(inv.totalAmount || 0), 0);
        const totalTax = invoices.reduce((acc, inv) => acc + Number(inv.taxAmount || 0), 0);

        const statusCounts: Record<string, number> = {};
        invoices.forEach(inv => {
            statusCounts[inv.status] = (statusCounts[inv.status] || 0) + 1;
        });

        const byStatus = Object.keys(statusCounts).map(status => ({
            status,
            count: statusCounts[status]
        }));

        const stats = {
            total: invoices.length,
            totals: { amount: totalAmount, tax: totalTax },
            byStatus
        };

        const serializedInvoices = invoices.map(inv => ({
            id: inv.id,
            invoiceNumber: inv.invoiceNumber,
            invoiceDate: inv.invoiceDate.toISOString(),
            buyerTitle: inv.buyerTitle || 'Bilinmiyor',
            buyerTaxNumber: inv.buyerTaxNumber || '-',
            type: inv.type,
            scenario: inv.scenario,
            status: inv.status,
            totalAmount: Number(inv.totalAmount || 0),
            taxAmount: Number(inv.taxAmount || 0),
            currency: inv.currency,
            gibInvoiceId: inv.gibInvoiceId
        }));

        return { success: true, invoices: serializedInvoices, stats };
    } catch (error) {
        console.error("Error fetching invoices:", error);
        return { success: false, invoices: [], stats: null, error: "Faturalar yüklenemedi." };
    }
}
