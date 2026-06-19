const prompt = `SEO konusunda son derece detayli, insansi, akici, tamamen ozgun ve uzman bir Turkce blog yazisi uret.
Hedef kitle: Turkiye e-ticaret saticilari
Ton: Profesyonel
Anahtar kelimeler: SEO, e-ticaret

Gereksinimler:
1. Icerik gercekten kapsamli ve doyurucu olmali. en az 800-1000 kelime blog icerigi. Cok kisa kesme, her alt basligi aciklayici paragraflarla doldur.
2. Markdown formatini (basliklar, alt basliklar, listeler, kalin yazi, alintilar, kod bloklari veya tablolar vb.) cok estetik, zengin ve okunabilir sekilde kullan. Paragraflari cok uzun tutma, alt basliklar altinda net bolumler olustur.
3. Insansi bir yazi dili kullan. Gereksiz tekrarlardan ve yapay zeka kliselerinden uzak dur. Gercek hayattan pratik ornekler ve tavsiyeler ekle.
4. SEO icin baslik, aciklama, keywordler ve etiketleri (tags) eksiksiz hazirla.

Lutfen SADECE asagidaki JSON formatinda donus yap, JSON disinda hicbir metin veya isaret ekleme:
{
  "title": "Cekici ve SEO uyumlu blog basligi",
  "excerpt": "Blogun listeleme sayfalarinda gorunecek 120-160 karakterlik kisa ozeti",
  "content": "Markdown formatinda yazilmis, detayli, insansi ve gorsel olarak zenginlestirilmis blog icerigi...",
  "metaTitle": "Arama motorlari (Google) icin SEO odakli baslik (maks 60 karakter)",
  "metaDescription": "Arama motorlari icin SEO odakli meta aciklamasi (maks 160 karakter)",
  "metaKeywords": "virgulle ayrilmis 5-8 anahtar kelime",
  "tags": "virgulle ayrilmis kategori/etiket isimleri (ornegin: Trendyol,Satis,KOBI)"
}`;

fetch('http://localhost:3001/api/v1/ai/copilot/chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-tenant-id': 'default'
  },
  body: JSON.stringify({ message: prompt, context: 'Admin blog yazari' })
}).then(res => res.text().then(data => ({ status: res.status, data })))
  .then(console.log)
  .catch(console.error);
