import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";

// POST /api/offers/lead - Yeni lead kaydet ve admin'e bildir
export async function POST(request: NextRequest) {
  try {
    const { offerId, email, name, phone, message, referrer } = await request.json();

    if (!offerId || !email) {
      return NextResponse.json(
        { error: "Offer ID and email are required" },
        { status: 400 }
      );
    }

    // Get offer details
    const offer = await prisma.specialOffer.findUnique({
      where: { id: offerId },
    });

    if (!offer || !offer.isActive) {
      return NextResponse.json(
        { error: "Offer not found or inactive" },
        { status: 404 }
      );
    }

    // Create lead
    const lead = await prisma.offerLead.create({
      data: {
        offerId,
        email,
        name,
        phone,
        message,
        referrer,
        ipAddress: request.headers.get("x-forwarded-for") || undefined,
        userAgent: request.headers.get("user-agent") || undefined,
      },
    });

    // Update offer stats
    await prisma.specialOffer.update({
      where: { id: offerId },
      data: {
        emailCount: { increment: 1 },
      },
    });

    // Send notification email to admin
    try {
      await sendEmail({
        to: process.env.ADMIN_EMAIL || "admin@pazaryonetimi.com",
        subject: `🔥 Yeni Özel Teklif Başvurusu: ${offer.title}`,
        html: `
          <h2>Yeni Lead Kaydı</h2>
          <p><strong>Teklif:</strong> ${offer.title}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>İsim:</strong> ${name || "Belirtilmemiş"}</p>
          <p><strong>Telefon:</strong> ${phone || "Belirtilmemiş"}</p>
          <p><strong>Mesaj:</strong> ${message || "Yok"}</p>
          <p><strong>Tarih:</strong> ${new Date().toLocaleString("tr-TR")}</p>
          <hr>
          <p>Admin panelden detayları görüntüleyin: 
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/offers/${offerId}/leads">
              Leads Sayfası
            </a>
          </p>
        `,
      });

      // Mark as notified
      await prisma.offerLead.update({
        where: { id: lead.id },
        data: { isNotified: true },
      });
    } catch (emailError) {
      console.error("Failed to send notification email:", emailError);
    }

    return NextResponse.json({
      success: true,
      message: "Lead created successfully",
      lead,
    });
  } catch (error) {
    console.error("Error creating lead:", error);
    return NextResponse.json(
      { error: "Failed to create lead" },
      { status: 500 }
    );
  }
}
