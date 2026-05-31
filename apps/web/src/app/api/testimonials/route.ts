export const dynamic = "force-dynamic";

import { NextResponse } from 'next/server';

export async function GET() {
    const testimonials = [
        { id: '1', name: "Ahmet Yılmaz", title: "E-ticaret Müdürü, ModaLife", content: "Pazaryonetimi sayesinde tüm ürünlerimizi tek panelden yönetmeye başladık. Satışlarımız %40 arttı.", rating: 5, avatarUrl: null },
        { id: '2', name: "Zeynep Kaya", title: "Kurucu, OrganicToys", content: "Stok takibi kabusumdu, şimdi tamamen otomatik. Arta kalan zamanımı markamı büyütmeye harcıyorum.", rating: 5, avatarUrl: null },
        { id: '3', name: "Caner Demir", title: "Operasyon Uzmanı, TechStore", content: "AI SEO özelliği inanılmaz. Ürünlerimiz aramalar en üst sıralara çıktı. Kesinlikle tavsiye ederim.", rating: 5, avatarUrl: null },
        { id: '4', name: "Merve Çelik", title: "Pazarlama Direktörü, BeautyBox", content: "Kampanya yönetimi çok kolaylaştı. Dönüşüm oranlarımızda ciddi artış var.", rating: 5, avatarUrl: null },
        { id: '5', name: "Burak Öz", title: "CEO, GamerZone", content: "Hız, performans ve destek ekibi harika. Kesinlikle sektörün en iyisi.", rating: 5, avatarUrl: null },
    ];

    return NextResponse.json(testimonials);
}
