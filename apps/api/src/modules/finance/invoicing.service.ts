import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class InvoicingService {
    private readonly logger = new Logger(InvoicingService.name);

    constructor(private prisma: PrismaService) { }

    async generateInvoice(orderId: string) {
        const order = await this.prisma.order.findUnique({
            where: { id: orderId },
            include: {
                items: true,
                tenant: true
            }
        });

        if (!order) throw new Error('Order not found');

        const invoiceNumber = `INV-${new Date().getFullYear()}-${Math.floor(Math.random() * 90000) + 10000}`;

        // In a real app, we would use a PDF generation library (e.g., pdfkit, puppeteer)
        // For this implementation, we'll simulate the generation and return a mock URL
        this.logger.log(`Generating invoice ${invoiceNumber} for order ${orderId}`);

        const invoice = await this.prisma.invoice.create({
            data: {
                orderId: order.id,
                invoiceNumber,
                status: 'SENT',
                url: `https://storage.pazaryonetimi.com/invoices/${invoiceNumber}.pdf`
            }
        });

        return invoice;
    }

    async getInvoices(tenantId: string) {
        return this.prisma.invoice.findMany({
            where: {
                order: {
                    tenantId
                }
            },
            include: {
                order: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
    }
}
