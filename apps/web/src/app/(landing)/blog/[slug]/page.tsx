"use client";

import React from 'react';
import { motion } from 'framer-motion';
import {
    Calendar, Clock, ArrowLeft, ArrowRight, Share2, Bookmark, Heart,
    Twitter, Linkedin, Facebook, Link2, Copy, Check, User, MessageCircle,
    ChevronRight, Tag, Eye, ThumbsUp, Sparkles
} from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import ReadingProgress from '@/components/blog/ReadingProgress';
import TableOfContents from '@/components/blog/TableOfContents';
import WowAISummary from '@/components/blog/WowAISummary';
import Image from 'next/image';

// Blog içerikleri - Gerçek uygulamada CMS'den gelecek
const BLOG_POSTS: Record<string, BlogPost> = {
    '1': {
        id: 1,
        slug: '1',
        title: "E-ticarette Yapay Zeka: 2026'da Neler Değişiyor?",
        excerpt: "Yapay zeka teknolojileri e-ticaret sektörünü kökten değiştiriyor. Otomasyon, kişiselleştirme ve tahminleme alanlarındaki son gelişmeleri inceliyoruz.",
        image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&h=600&fit=crop",
        category: "Yapay Zeka",
        date: "28 Ocak 2026",
        readTime: "8 dk",
        author: {
            name: "Ahmet Yılmaz",
            avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop",
            role: "AI & E-ticaret Uzmanı",
            bio: "10 yıllık e-ticaret deneyimi ile yapay zeka çözümleri geliştiriyor."
        },
        tags: ["Yapay Zeka", "E-ticaret", "Otomasyon", "2026 Trendleri"],
        summary: [
            "Yapay zeka, kişiselleştirme ve müşteri deneyimini %47 oranında artırıyor.",
            "Dinamik fiyatlandırma ve stok yönetimi ile kârlılık %23 yükseliyor.",
            "2026'da AI kullanımı rekabet avantajı değil, hayatta kalma şartı olacak."
        ],
        views: 12453,
        likes: 847,
        content: `
            <p class="lead">Yapay zeka, e-ticaret dünyasını benzeri görülmemiş bir hızla dönüştürüyor. 2026 yılında bu dönüşüm daha da hızlanarak satıcıların iş yapma biçimini kökten değiştiriyor.</p>

            <h2>1. Kişiselleştirilmiş Müşteri Deneyimi</h2>
            <p>Yapay zeka destekli kişiselleştirme, artık sadece "Bu ürünü alanlar şunları da aldı" önerilerinin çok ötesine geçti. Modern AI sistemleri:</p>
            <ul>
                <li><strong>Gerçek zamanlı davranış analizi:</strong> Müşterinin site içi hareketlerini anlık olarak analiz ederek, o an için en uygun ürünleri öne çıkarıyor.</li>
                <li><strong>Duygusal zeka:</strong> Müşteri yorumları ve iletişimlerinden duygu durumunu analiz ederek, müşteri hizmetlerini optimize ediyor.</li>
                <li><strong>Çok kanallı profilleme:</strong> Web sitesi, mobil uygulama, sosyal medya ve mağaza içi verileri birleştirerek 360 derece müşteri profili oluşturuyor.</li>
            </ul>

            <blockquote>
                "2026'da kişiselleştirme artık bir lüks değil, zorunluluk. AI kullanan satıcılar, kullanmayanlara göre ortalama %47 daha yüksek dönüşüm oranı elde ediyor."
                <cite>— E-ticaret Türkiye Araştırması 2026</cite>
            </blockquote>

            <h2>2. Akıllı Fiyatlandırma ve Dinamik Pricing</h2>
            <p>Yapay zeka destekli fiyatlandırma sistemleri, onlarca faktörü aynı anda değerlendirerek optimal fiyatı belirliyor:</p>

            <div class="info-box">
                <h4>🎯 AI Fiyatlandırma Faktörleri</h4>
                <ul>
                    <li>Rakip fiyatları (gerçek zamanlı)</li>
                    <li>Stok durumu ve tedarik zinciri maliyetleri</li>
                    <li>Talep tahmini ve sezonsal değişimler</li>
                    <li>Müşteri segmenti ve satın alma geçmişi</li>
                    <li>Pazaryeri komisyon oranları</li>
                    <li>Kâr marjı hedefleri</li>
                </ul>
            </div>

            <p>Pazaryonetimi'nin AI fiyatlandırma motoru, bu faktörleri saniyeler içinde analiz ederek satıcılara optimal fiyat önerileri sunuyor. Beta kullanıcılarımız ortalama <strong>%23 kâr artışı</strong> bildirdi.</p>

            <h2>3. Stok ve Talep Tahmini</h2>
            <p>Geleneksel stok yönetimi "geçmişe bakarak gelecek tahmin etme" yaklaşımına dayanıyordu. Modern AI sistemleri ise çok daha sofistike:</p>

            <img src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&h=400&fit=crop" alt="Stok Yönetimi" class="rounded-2xl my-8" />

            <h3>Makine Öğrenimi ile Talep Tahmini</h3>
            <p>Derin öğrenme algoritmaları, şu faktörleri birlikte değerlendirerek 30-90 gün sonrası talebi tahmin edebiliyor:</p>
            <ol>
                <li><strong>Mevsimsellik:</strong> Yılın hangi döneminde hangi ürünlerin talep göreceği</li>
                <li><strong>Trend analizi:</strong> Sosyal medya ve arama trendlerinden yaklaşan talep dalgaları</li>
                <li><strong>Ekonomik göstergeler:</strong> Enflasyon, döviz kuru, tüketici güveni</li>
                <li><strong>Rekabet:</strong> Rakiplerin kampanyaları ve fiyat değişiklikleri</li>
                <li><strong>Dış faktörler:</strong> Hava durumu, tatiller, özel günler</li>
            </ol>

            <h2>4. Otomatik İçerik ve Görsel Üretimi</h2>
            <p>Generatif AI, ürün açıklamalarından görsellere kadar içerik üretimini otomatikleştiriyor:</p>

            <div class="comparison-box">
                <div class="before">
                    <h4>❌ Geleneksel Yöntem</h4>
                    <p>Her ürün için manuel açıklama yazımı, profesyonel fotoğraf çekimi, her pazaryeri için ayrı optimizasyon...</p>
                    <p><strong>Süre:</strong> Ürün başına 2-3 saat</p>
                </div>
                <div class="after">
                    <h4>✅ AI Destekli</h4>
                    <p>Otomatik SEO uyumlu açıklamalar, AI görsel iyileştirme, tüm pazaryerlerine tek tıkla optimizasyon...</p>
                    <p><strong>Süre:</strong> Ürün başına 5 dakika</p>
                </div>
            </div>

            <h2>5. Akıllı Müşteri Hizmetleri</h2>
            <p>Chatbot'lar artık sadece "sıkça sorulan sorulara" cevap vermiyor. Yeni nesil AI asistanlar:</p>
            <ul>
                <li>Doğal dilde karmaşık soruları anlayabiliyor</li>
                <li>Sipariş durumu, iade süreçleri gibi işlemleri otomatik yönetebiliyor</li>
                <li>Müşteri duygu durumuna göre iletişim tonunu ayarlayabiliyor</li>
                <li>Gerektiğinde sorunsuz şekilde insan temsilciye aktarabiliyor</li>
            </ul>

            <h2>Sonuç: AI Adaptasyonu Artık Zorunluluk</h2>
            <p>2026'da yapay zeka, e-ticarette rekabet avantajı olmaktan çıkıp <strong>hayatta kalma şartına</strong> dönüşüyor. Pazaryonetimi olarak, satıcılarımıza en güncel AI teknolojilerini erişilebilir fiyatlarla sunmaya devam edeceğiz.</p>

            <div class="cta-box">
                <h4>🚀 AI Özelliklerini Keşfedin</h4>
                <p>Pazaryonetimi'nin yapay zeka destekli araçlarını 14 gün ücretsiz deneyin.</p>
                <a href="/ucretsiz-dene" class="cta-button">Ücretsiz Başla →</a>
            </div>
        `
    },
    '2': {
        id: 2,
        slug: '2',
        title: "Trendyol'da Satışlarınızı %200 Artırmanın 10 Yolu",
        excerpt: "Trendyol'da rekabette öne çıkmak için uygulamanız gereken stratejiler ve SEO ipuçları.",
        image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200&h=600&fit=crop",
        category: "Pazaryeri",
        date: "25 Ocak 2026",
        readTime: "6 dk",
        author: {
            name: "Zeynep Kaya",
            avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
            role: "Pazaryeri Stratejisti",
            bio: "Türkiye'nin en büyük e-ticaret markalarına danışmanlık yapıyor."
        },
        tags: ["Trendyol", "Pazaryeri", "Satış Stratejisi", "SEO"],
        summary: [
            "Ürün başlıkları ve görselleri, tıklama oranlarını doğrudan etkileyen en önemli faktörlerdir.",
            "Doğru fiyatlandırma ve stok yönetimi, Buy Box kazanma şansını artırır.",
            "Trendyol kampanyalarına katılım ve mağaza puanı, görünürlüğü maksimize eder."
        ],
        views: 28934,
        likes: 1523,
        content: `
            <p class="lead">Trendyol, Türkiye'nin en büyük e-ticaret pazaryeri olarak milyonlarca satıcıya ev sahipliği yapıyor. Bu kalabalıkta öne çıkmak için doğru stratejilere ihtiyacınız var.</p>

            <h2>1. Ürün Başlıklarınızı Optimize Edin</h2>
            <p>Trendyol'da arama sonuçlarında üst sıralarda çıkmak için başlık optimizasyonu kritik öneme sahip:</p>
            <ul>
                <li><strong>Marka adı:</strong> Başlığın en başında yer almalı</li>
                <li><strong>Ana anahtar kelime:</strong> Ürünün ne olduğunu net belirtin</li>
                <li><strong>Özellikler:</strong> Beden, renk, malzeme gibi önemli özellikleri ekleyin</li>
                <li><strong>Karakter limiti:</strong> 80-120 karakter optimal</li>
            </ul>

            <div class="example-box">
                <h4>📝 Örnek Başlık Optimizasyonu</h4>
                <p class="bad">❌ Kötü: Kadın Elbise</p>
                <p class="good">✅ İyi: ABC Marka Kadın Yazlık Midi Elbise - Çiçek Desenli - Viskon Kumaş - 36-44 Beden</p>
            </div>

            <h2>2. Görsellerde Profesyonellik</h2>
            <p>İlk görsel, tıklama oranınızı doğrudan etkiler. Dikkat etmeniz gerekenler:</p>
            <ol>
                <li>Minimum 1000x1000 piksel çözünürlük</li>
                <li>Beyaz veya açık renk arka plan</li>
                <li>Ürünün tamamını gösteren ana görsel</li>
                <li>Detay ve kullanım görselleri (en az 4-5 görsel)</li>
                <li>Video içerik ekleme (varsa)</li>
            </ol>

            <h2>3. Fiyatlandırma Stratejisi</h2>
            <p>Rekabetçi fiyatlandırma için şunları uygulayın:</p>
            <ul>
                <li>Rakip fiyatlarını günlük takip edin</li>
                <li>Psikolojik fiyatlandırma kullanın (199,99 TL gibi)</li>
                <li>Kampanya dönemlerinde agresif fiyatlamaya hazır olun</li>
                <li>Kargo dahil fiyat sunmayı değerlendirin</li>
            </ul>

            <blockquote>
                "Trendyol'da fiyat, sıralamanın en önemli faktörlerinden biri. Ancak sürdürülebilir kârlılık olmadan düşük fiyat stratejisi çıkmaz sokak."
            </blockquote>

            <h2>4. Stok Yönetimi</h2>
            <p>Stok bitimi = Sıralama düşüşü. Bu nedenle:</p>
            <ul>
                <li>Kritik stok seviyesi belirleyin ve alarm kurun</li>
                <li>Çok satan ürünlerde buffer stok tutun</li>
                <li>Tedarikçilerinizle hızlı tedarik anlaşması yapın</li>
            </ul>

            <h2>5. Müşteri Yorumları</h2>
            <p>Olumlu yorumlar sıralamanızı yükseltir:</p>
            <ul>
                <li>Satış sonrası değerlendirme isteyin</li>
                <li>Olumsuz yorumlara hızlı ve profesyonel yanıt verin</li>
                <li>Yorum karşılığı indirim kampanyaları düzenleyin</li>
            </ul>

            <h2>6. Kargo Performansı</h2>
            <p>Hızlı teslimat = Memnun müşteri = Daha fazla satış:</p>
            <ul>
                <li>Siparişleri aynı gün kargoya verin</li>
                <li>Trendyol Express'e katılmayı değerlendirin</li>
                <li>Kargo takip bilgilerini proaktif paylaşın</li>
            </ul>

            <h2>7. Kampanya Katılımı</h2>
            <p>Trendyol'un düzenlediği kampanyalara mutlaka katılın:</p>
            <ul>
                <li>İndirim Şenliği</li>
                <li>Efsane Kasım</li>
                <li>Yaz Fırsatları</li>
                <li>Kategori kampanyaları</li>
            </ul>

            <h2>8. Mağaza Puanı</h2>
            <p>Mağaza puanınızı yüksek tutmak için:</p>
            <ul>
                <li>Sipariş iptal oranını %1 altında tutun</li>
                <li>İade oranını minimize edin (doğru ürün açıklaması ile)</li>
                <li>Müşteri şikayetlerini hızlı çözün</li>
            </ul>

            <h2>9. Reklam Yatırımı</h2>
            <p>Trendyol Reklam Platformu'nu stratejik kullanın:</p>
            <ul>
                <li>Yüksek kâr marjlı ürünlerde reklam verin</li>
                <li>Kampanya dönemlerinde bütçe artırın</li>
                <li>A/B test ile en iyi performansı bulun</li>
            </ul>

            <h2>10. Veri Analizi</h2>
            <p>Kararlarınızı veriye dayandırın:</p>
            <ul>
                <li>Hangi ürünler en çok görüntüleniyor?</li>
                <li>Dönüşüm oranı neden düşük?</li>
                <li>Hangi saatlerde satış zirve yapıyor?</li>
            </ul>

            <div class="cta-box">
                <h4>📊 Verilerinizi Tek Panelde Görün</h4>
                <p>Pazaryonetimi ile tüm pazaryerlerinizdeki verileri tek ekrandan analiz edin.</p>
                <a href="/ucretsiz-dene" class="cta-button">Demo İste →</a>
            </div>
        `
    },
    '3': {
        id: 3,
        slug: '3',
        title: "Stok Yönetiminde Yapılan 5 Kritik Hata",
        excerpt: "E-ticaret satıcılarının stok yönetiminde sıkça yaptığı hatalar ve bunlardan nasıl kaçınılacağı.",
        image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1200&h=600&fit=crop",
        category: "Operasyon",
        date: "22 Ocak 2026",
        readTime: "5 dk",
        author: {
            name: "Mehmet Demir",
            avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
            role: "Operasyon Müdürü",
            bio: "15 yıllık lojistik ve operasyon deneyimi."
        },
        tags: ["Stok Yönetimi", "Operasyon", "E-ticaret", "Lojistik"],
        summary: [
            "Manuel stok takibi ve %100 stoksuz çalışma (Just-in-Time) modelleri yüksek risk taşır.",
            "ABC analizi ile kritik ürünlere odaklanmak, kaynak verimliliğini artırır.",
            "Tek tedarikçiye bağımlılık, operasyonel sürekliliği tehlikeye atar."
        ],
        views: 8234,
        likes: 412,
        content: `
            <p class="lead">Stok yönetimi, e-ticaretin belkemiğidir. Doğru yönetilmediğinde hem müşteri kaybı hem de ciddi mali kayıplara yol açabilir.</p>

            <h2>Hata 1: Manuel Takip</h2>
            <p>Excel tabloları ile stok takibi yapmak 2026'da kabul edilemez bir risk:</p>
            <ul>
                <li>İnsan hatası riski çok yüksek</li>
                <li>Gerçek zamanlı güncelleme yok</li>
                <li>Birden fazla kanal senkronizasyonu imkansız</li>
            </ul>

            <div class="warning-box">
                <h4>⚠️ Gerçek Bir Vaka</h4>
                <p>Bir müşterimiz, Excel'de yanlış stok girişi nedeniyle 500 adet olmayan ürünü satmış ve tüm siparişleri iptal etmek zorunda kalmıştı. Pazaryeri puanı %40 düştü.</p>
            </div>

            <h2>Hata 2: Güvenlik Stoku Tutmamak</h2>
            <p>Sıfır stok politikası tehlikeli sonuçlar doğurabilir:</p>
            <ul>
                <li>Tedarik gecikmelerinde satış kaybı</li>
                <li>Pazaryeri sıralama düşüşü</li>
                <li>Müşteri memnuniyetsizliği</li>
            </ul>

            <p><strong>Çözüm:</strong> Her ürün için ortalama 2-4 haftalık güvenlik stoku belirleyin.</p>

            <h2>Hata 3: ABC Analizi Yapmamak</h2>
            <p>Tüm ürünlere aynı önemi vermek kaynak israfıdır:</p>
            <ul>
                <li><strong>A Grubu (%20):</strong> Ciron %80'ini oluşturur - Yüksek öncelik</li>
                <li><strong>B Grubu (%30):</strong> Cironun %15'i - Orta öncelik</li>
                <li><strong>C Grubu (%50):</strong> Cironun %5'i - Düşük öncelik</li>
            </ul>

            <h2>Hata 4: Sezonsal Planlamayı İhmal Etmek</h2>
            <p>Mevsimsel talep değişimlerine hazırlıksız yakalanmak:</p>
            <ul>
                <li>Yaz ürünlerini Nisan'da sipariş etmek geç kalınmış demektir</li>
                <li>Black Friday için Ekim başında hazırlıklara başlayın</li>
                <li>Yılbaşı talebi için Kasım'da stokları tamamlayın</li>
            </ul>

            <h2>Hata 5: Tek Tedarikçiye Bağımlılık</h2>
            <p>Tüm yumurtaları aynı sepete koymak:</p>
            <ul>
                <li>Tedarikçi sorununda tam operasyon durması</li>
                <li>Fiyat pazarlık gücü kaybı</li>
                <li>Kalite kontrol zorluğu</li>
            </ul>

            <p><strong>Çözüm:</strong> Her kritik üründe en az 2 alternatif tedarikçi bulundurun.</p>

            <div class="cta-box">
                <h4>🔄 Otomatik Stok Senkronizasyonu</h4>
                <p>Pazaryonetimi ile tüm kanallarınızda stokları otomatik senkronize edin, hatalara son verin.</p>
                <a href="/ucretsiz-dene" class="cta-button">Ücretsiz Deneyin →</a>
            </div>
        `
    },
    '4': {
        id: 4,
        slug: '4',
        title: "Çoklu Pazaryeri Yönetimi: Başlangıç Rehberi",
        excerpt: "Birden fazla pazaryerinde satış yaparken verimliliği nasıl artırabilirsiniz? Kapsamlı rehberimiz.",
        image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=600&fit=crop",
        category: "Rehber",
        date: "18 Ocak 2026",
        readTime: "10 dk",
        author: {
            name: "Ayşe Yıldız",
            avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
            role: "E-ticaret Danışmanı",
            bio: "500+ e-ticaret işletmesine büyüme danışmanlığı verdi."
        },
        tags: ["Çoklu Pazaryeri", "Entegrasyon", "Strateji", "Rehber"],
        summary: [
            "Tek pazaryerine bağımlılık risklidir; çoklu kanal stratejisi riski dağıtır ve ciroyu artırır.",
            "Her pazaryerinin (Trendyol, Amazon, Hepsiburada) farklı bir hedef kitlesi ve dinamikleri vardır.",
            "Merkezi entegrasyon yazılımları, operasyonel yükü azaltarak büyümeyi ölçeklendirir."
        ],
        views: 15678,
        likes: 923,
        content: `
            <p class="lead">Tek pazaryerine bağımlılık, e-ticarette en büyük risklerden biridir. Çoklu pazaryeri stratejisi ile hem riskinizi dağıtabilir hem de satışlarınızı katlayabilirsiniz.</p>

            <h2>Neden Çoklu Pazaryeri?</h2>
            <ul>
                <li><strong>Risk dağıtımı:</strong> Tek platformun politika değişikliğinden etkilenmezsiniz</li>
                <li><strong>Daha geniş müşteri kitlesi:</strong> Her platformun farklı müşteri profili var</li>
                <li><strong>Fiyat esnekliği:</strong> Farklı platformlarda farklı fiyatlandırma yapabilirsiniz</li>
                <li><strong>Marka bilinirliği:</strong> Her platformda görünürlük = Daha fazla tanınırlık</li>
            </ul>

            <h2>Hangi Pazaryerlerinde Olmalısınız?</h2>
            <p>Türkiye'nin önde gelen pazaryerleri ve özellikleri:</p>

            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Pazaryeri</th>
                            <th>Güçlü Yanları</th>
                            <th>Hedef Kitle</th>
                            <th>Komisyon</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Trendyol</td>
                            <td>En yüksek trafik, hızlı teslimat</td>
                            <td>Genel</td>
                            <td>%8-15</td>
                        </tr>
                        <tr>
                            <td>Hepsiburada</td>
                            <td>Premium müşteri, yüksek sepet</td>
                            <td>Orta-üst gelir</td>
                            <td>%7-12</td>
                        </tr>
                        <tr>
                            <td>Amazon TR</td>
                            <td>Uluslararası açılım, FBA</td>
                            <td>Tech-savvy</td>
                            <td>%8-15</td>
                        </tr>
                        <tr>
                            <td>N11</td>
                            <td>Düşük komisyon, esneklik</td>
                            <td>Fiyat odaklı</td>
                            <td>%5-10</td>
                        </tr>
                        <tr>
                            <td>Çiçeksepeti</td>
                            <td>Hediye kategorisi lider</td>
                            <td>Hediye alıcıları</td>
                            <td>%10-18</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <h2>Entegrasyon Stratejisi</h2>
            <p>Başarılı çoklu pazaryeri yönetimi için:</p>
            <ol>
                <li><strong>Merkezi ürün yönetimi:</strong> Tek yerden tüm platformlara ürün gönderimi</li>
                <li><strong>Otomatik stok senkronizasyonu:</strong> Bir platformda satış olduğunda diğerlerinde stok düşümü</li>
                <li><strong>Tek panelden sipariş takibi:</strong> Tüm kanallardan gelen siparişleri tek ekrandan yönetim</li>
                <li><strong>Entegre raporlama:</strong> Kanal bazlı ve toplam performans analizi</li>
            </ol>

            <h2>Adım Adım Başlangıç</h2>
            <ol>
                <li><strong>Hafta 1-2:</strong> Mevcut satış verilerinizi analiz edin, hangi ürünler hangi platformda daha iyi performans gösterebilir?</li>
                <li><strong>Hafta 3-4:</strong> İlk yeni pazaryeri başvurusunu yapın, belgelerinizi hazırlayın</li>
                <li><strong>Hafta 5-6:</strong> Pilot ürün grubu ile satışa başlayın</li>
                <li><strong>Hafta 7-8:</strong> Performansı analiz edin, optimizasyon yapın</li>
                <li><strong>Ay 3+:</strong> Ürün gamını genişletin, diğer pazaryerlerini ekleyin</li>
            </ol>

            <div class="cta-box">
                <h4>🔗 Hepsini Tek Panelden Yönetin</h4>
                <p>Pazaryonetimi ile 7+ pazaryerini tek panelden yönetin, zamanınızı büyümeye ayırın.</p>
                <a href="/ucretsiz-dene" class="cta-button">14 Gün Ücretsiz Deneyin →</a>
            </div>
        `
    },
    '5': {
        id: 5,
        slug: '5',
        title: "2026 E-ticaret Trendleri: Hazır mısınız?",
        excerpt: "Bu yıl e-ticaret dünyasını şekillendirecek trendler ve işletmenizi nasıl hazırlayabileceğiniz.",
        image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=600&fit=crop",
        category: "Trend",
        date: "15 Ocak 2026",
        readTime: "7 dk",
        author: {
            name: "Can Özkan",
            avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop",
            role: "Strateji Direktörü",
            bio: "E-ticaret sektöründe 12 yıllık deneyim."
        },
        tags: ["Trendler", "2026", "Strateji", "E-ticaret"],
        summary: [
            "AI-First yaklaşımı, e-ticaretin her alanında (öneri, destek, fiyatlama) standart hale geliyor.",
            "Sosyal ticaret ve Influencer pazarlaması, satış kanallarını çeşitlendiriyor.",
            "Sürdürülebilirlik ve hızlı teslimat (Quick Commerce), tüketici tercihlerini belirliyor."
        ],
        views: 21456,
        likes: 1245,
        content: `
            <p class="lead">2026, e-ticaret için dönüşüm yılı olmaya aday. Teknolojiyi doğru kullanan işletmeler büyürken, adapte olamayanlar geride kalacak.</p>

            <h2>Trend 1: AI-First E-ticaret</h2>
            <p>Yapay zeka artık "olsa iyi olur" değil, "olmazsa olmaz":</p>
            <ul>
                <li>AI destekli ürün önerileri standart hale geliyor</li>
                <li>Chatbot'lar müşteri hizmetlerinin %80'ini karşılıyor</li>
                <li>Dinamik fiyatlandırma AI olmadan rekabet edilemez</li>
            </ul>

            <h2>Trend 2: Sosyal Ticaret Patlaması</h2>
            <p>Instagram, TikTok ve YouTube alışverişi %300 büyüyor:</p>
            <ul>
                <li>Canlı yayın satışları ana gelir kanalı oluyor</li>
                <li>Influencer partnership'ler zorunlu hale geliyor</li>
                <li>User Generated Content (UGC) güven inşa ediyor</li>
            </ul>

            <h2>Trend 3: Sürdürülebilirlik Beklentisi</h2>
            <p>Tüketicilerin %67'si çevreci markaları tercih ediyor:</p>
            <ul>
                <li>Karbon-nötr teslimat seçenekleri</li>
                <li>Geri dönüştürülebilir ambalaj</li>
                <li>İkinci el ve yenilenmiş ürün pazarı</li>
            </ul>

            <h2>Trend 4: Hiper-Kişiselleştirme</h2>
            <p>Her müşteriye özel deneyim beklentisi:</p>
            <ul>
                <li>Kişiselleştirilmiş ürün sayfaları</li>
                <li>Davranış bazlı e-posta kampanyaları</li>
                <li>Dinamik içerik ve fiyatlandırma</li>
            </ul>

            <h2>Trend 5: Quick Commerce</h2>
            <p>10-30 dakika teslimat beklentisi yaygınlaşıyor:</p>
            <ul>
                <li>Dark store ağları genişliyor</li>
                <li>Mikro lojistik merkezleri</li>
                <li>Aynı gün teslimat standart oluyor</li>
            </ul>

            <div class="cta-box">
                <h4>🎯 Geleceğe Hazır Olun</h4>
                <p>Pazaryonetimi ile 2026 trendlerine uyum sağlayın, rekabette öne geçin.</p>
                <a href="/ucretsiz-dene" class="cta-button">Hemen Başlayın →</a>
            </div>
        `
    },
    '6': {
        id: 6,
        slug: '6',
        title: "Amazon Türkiye'de Satış Yapmaya Başlamak",
        excerpt: "Amazon Türkiye'de mağaza açma sürecinden ilk satışa kadar bilmeniz gereken her şey.",
        image: "https://images.unsplash.com/photo-1523474253046-8cd2748b5fd2?w=1200&h=600&fit=crop",
        category: "Pazaryeri",
        date: "12 Ocak 2026",
        readTime: "9 dk",
        author: {
            name: "Emre Şahin",
            avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&h=100&fit=crop",
            role: "Amazon Uzmanı",
            bio: "Amazon Türkiye lansmanından beri 200+ satıcıya danışmanlık yaptı."
        },
        tags: ["Amazon", "Pazaryeri", "Başlangıç", "Rehber"],
        summary: [
            "Amazon Türkiye, global pazarlara açılmak için stratejik bir ilk adımdır.",
            "FBA (Fulfillment by Amazon) lojistik yükünü alarak satışa odaklanmanızı sağlar.",
            "Buy Box ve A+ Content, satış performansını belirleyen temel metriklerdir."
        ],
        views: 34567,
        likes: 1876,
        content: `
            <p class="lead">Amazon Türkiye, global bir dev markette satış yapma fırsatı sunuyor. Doğru stratejilerle bu fırsattan maksimum fayda sağlayabilirsiniz.</p>

            <h2>Neden Amazon Türkiye?</h2>
            <ul>
                <li><strong>Global marka güveni:</strong> Müşteriler Amazon'a güveniyor</li>
                <li><strong>FBA seçeneği:</strong> Lojistiği Amazon'a bırakın</li>
                <li><strong>Prime avantajı:</strong> Prime üyelerine öncelikli görünürlük</li>
                <li><strong>Uluslararası açılım:</strong> Amazon EU pazarlarına erişim</li>
            </ul>

            <h2>Satıcı Hesabı Türleri</h2>
            <p>Amazon'da iki tür satıcı hesabı bulunuyor:</p>
            
            <div class="comparison-box">
                <div class="option-1">
                    <h4>Bireysel Hesap</h4>
                    <ul>
                        <li>Aylık ücret yok</li>
                        <li>Satış başına 4,99 TL</li>
                        <li>40 ürün/ay sınırı</li>
                        <li>Sınırlı araçlar</li>
                    </ul>
                    <p><strong>Kimler için:</strong> Başlangıç, düşük hacim</p>
                </div>
                <div class="option-2">
                    <h4>Profesyonel Hesap</h4>
                    <ul>
                        <li>Aylık 149,99 TL</li>
                        <li>Satış başına ücret yok</li>
                        <li>Sınırsız ürün</li>
                        <li>Gelişmiş araçlar ve raporlar</li>
                    </ul>
                    <p><strong>Kimler için:</strong> Ciddi satıcılar, yüksek hacim</p>
                </div>
            </div>

            <h2>Kayıt Süreci</h2>
            <ol>
                <li><strong>Belgeler:</strong> Vergi levhası, banka hesap bilgisi, kimlik</li>
                <li><strong>Başvuru:</strong> sellercentral.amazon.com.tr adresinden</li>
                <li><strong>Video görüşme:</strong> Kimlik doğrulama (15-20 dakika)</li>
                <li><strong>Onay:</strong> Genellikle 2-5 iş günü</li>
            </ol>

            <h2>FBA vs FBM</h2>
            <p>İki farklı lojistik modeli:</p>
            <ul>
                <li><strong>FBA (Fulfillment by Amazon):</strong> Ürünleri Amazon depolarına gönderirsiniz, Amazon paketler ve gönderir</li>
                <li><strong>FBM (Fulfillment by Merchant):</strong> Siparişleri kendiniz karşılarsınız</li>
            </ul>

            <h2>Başarı İpuçları</h2>
            <ol>
                <li>Buy Box kazanmak için rekabetçi fiyatlandırma</li>
                <li>A+ Content ile zengin ürün sayfaları</li>
                <li>PPC reklamlarını stratejik kullanın</li>
                <li>Müşteri yorumlarına hızlı yanıt verin</li>
                <li>Stok takibini aksatmayın</li>
            </ol>

            <div class="cta-box">
                <h4>🛒 Amazon Entegrasyonu</h4>
                <p>Pazaryonetimi ile Amazon'u diğer pazaryerlerinizle birlikte tek panelden yönetin.</p>
                <a href="/ucretsiz-dene" class="cta-button">Entegrasyonu Keşfedin →</a>
            </div>
        `
    }
};

interface Author {
    name: string;
    avatar: string;
    role: string;
    bio: string;
}

interface BlogPost {
    id: number;
    slug: string;
    title: string;
    excerpt: string;
    image: string;
    category: string;
    date: string;
    readTime: string;
    author: Author;
    tags: string[];
    summary?: string[];
    views: number;
    likes: number;
    content: string;
}

export default function BlogDetailPage() {
    const params = useParams();
    const slugParam = params?.slug;
    const slug = Array.isArray(slugParam) ? slugParam[0] : slugParam;
    const [copied, setCopied] = React.useState(false);
    const [liked, setLiked] = React.useState(false);
    const [bookmarked, setBookmarked] = React.useState(false);

    const post = slug ? BLOG_POSTS[slug] : undefined;

    if (!post) {
        return (
            <section className="min-h-screen pt-32 pb-24 bg-white dark:bg-[#02040a]">
                <div className="container mx-auto px-6 text-center">
                    <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
                        Yazı Bulunamadı
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 mb-8">
                        Aradığınız blog yazısı mevcut değil.
                    </p>
                    <Link
                        href="/blog"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
                    >
                        <ArrowLeft size={18} />
                        Blog&apos;a Dön
                    </Link>
                </div>
            </section>
        );
    }

    // İlgili yazıları bul
    const relatedPosts = Object.values(BLOG_POSTS)
        .filter(p => p.id !== post.id && (p.category === post.category || p.tags.some(t => post.tags.includes(t))))
        .slice(0, 3);

    const copyLink = () => {
        navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <section className="min-h-screen pt-32 pb-24 bg-white dark:bg-[#02040a] transition-colors duration-500">
            {/* Background */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-500/5 dark:bg-blue-500/10 blur-[150px] rounded-full" />
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-500/5 dark:bg-indigo-500/10 blur-[150px] rounded-full" />
            </div>

            <ReadingProgress />

            <article className="container mx-auto px-6 relative z-10">
                {/* Breadcrumb */}
                <motion.nav
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-8"
                >
                    <Link href="/" className="hover:text-blue-600 transition-colors">Ana Sayfa</Link>
                    <ChevronRight size={14} />
                    <Link href="/blog" className="hover:text-blue-600 transition-colors">Blog</Link>
                    <ChevronRight size={14} />
                    <span className="text-slate-700 dark:text-slate-300">{post.category}</span>
                </motion.nav>

                {/* Header */}
                <motion.header
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-4xl mx-auto text-center mb-12"
                >
                    <div className="flex items-center justify-center gap-3 mb-6">
                        <span className="px-4 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-bold rounded-full">
                            {post.category}
                        </span>
                        <span className="flex items-center gap-1 text-sm text-slate-500">
                            <Eye size={14} />
                            {post.views.toLocaleString()} görüntülenme
                        </span>
                    </div>

                    <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-6 leading-tight">
                        {post.title}
                    </h1>

                    <p className="text-xl text-slate-600 dark:text-slate-400 mb-8">
                        {post.excerpt}
                    </p>

                    {/* Meta */}
                    <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-slate-500 dark:text-slate-400">
                        <span className="flex items-center gap-2">
                            <Calendar size={16} />
                            {post.date}
                        </span>
                        <span className="flex items-center gap-2">
                            <Clock size={16} />
                            {post.readTime} okuma
                        </span>
                        <span className="flex items-center gap-2">
                            <ThumbsUp size={16} />
                            {post.likes.toLocaleString()} beğeni
                        </span>
                    </div>
                </motion.header>

                {/* Featured Image */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="max-w-5xl mx-auto mb-12"
                >
                    <Image
                        src={post.image}
                        alt={post.title}
                        width={1200}
                        height={600}
                        className="w-full aspect-video object-cover rounded-3xl shadow-2xl"
                        priority
                    />
                </motion.div>

                {/* Content Layout */}
                <div className="max-w-5xl mx-auto grid lg:grid-cols-[1fr_300px] gap-12">
                    {/* Main Content */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        {/* AI Summary */}
                        {post.summary && <WowAISummary summaryPoints={post.summary} />}

                        {/* Author Card */}
                        <div className="flex items-center gap-4 p-6 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10 mb-10">
                            <Image
                                src={post.author.avatar}
                                alt={post.author.name}
                                width={64}
                                height={64}
                                className="w-16 h-16 rounded-full object-cover"
                            />
                            <div>
                                <h3 className="font-bold text-slate-900 dark:text-white">{post.author.name}</h3>
                                <p className="text-sm text-blue-600 dark:text-blue-400">{post.author.role}</p>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{post.author.bio}</p>
                            </div>
                        </div>

                        {/* Article Content */}
                        <div
                            className="prose prose-lg prose-slate dark:prose-invert max-w-none
                                prose-headings:font-bold prose-headings:tracking-tight
                                prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-6
                                prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-4
                                prose-p:leading-relaxed prose-p:text-slate-600 dark:prose-p:text-slate-300
                                prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline
                                prose-strong:text-slate-900 dark:prose-strong:text-white
                                prose-ul:my-6 prose-li:my-2
                                prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:bg-blue-50 dark:prose-blockquote:bg-blue-900/20 prose-blockquote:py-4 prose-blockquote:px-6 prose-blockquote:rounded-r-xl prose-blockquote:not-italic
                                prose-img:rounded-2xl prose-img:shadow-xl
                                [&_.lead]:text-xl [&_.lead]:text-slate-700 dark:[&_.lead]:text-slate-300 [&_.lead]:leading-relaxed [&_.lead]:mb-8
                                [&_.info-box]:bg-blue-50 dark:[&_.info-box]:bg-blue-900/20 [&_.info-box]:p-6 [&_.info-box]:rounded-2xl [&_.info-box]:border [&_.info-box]:border-blue-200 dark:[&_.info-box]:border-blue-800 [&_.info-box]:my-8
                                [&_.info-box_h4]:text-blue-900 dark:[&_.info-box_h4]:text-blue-100 [&_.info-box_h4]:font-bold [&_.info-box_h4]:mb-4 [&_.info-box_h4]:text-lg
                                [&_.warning-box]:bg-amber-50 dark:[&_.warning-box]:bg-amber-900/20 [&_.warning-box]:p-6 [&_.warning-box]:rounded-2xl [&_.warning-box]:border [&_.warning-box]:border-amber-200 dark:[&_.warning-box]:border-amber-800 [&_.warning-box]:my-8
                                [&_.warning-box_h4]:text-amber-900 dark:[&_.warning-box_h4]:text-amber-100 [&_.warning-box_h4]:font-bold [&_.warning-box_h4]:mb-3
                                [&_.comparison-box]:grid [&_.comparison-box]:md:grid-cols-2 [&_.comparison-box]:gap-4 [&_.comparison-box]:my-8
                                [&_.comparison-box_>_div]:p-6 [&_.comparison-box_>_div]:rounded-2xl [&_.comparison-box_>_div]:border
                                [&_.before]:bg-red-50 dark:[&_.before]:bg-red-900/10 [&_.before]:border-red-200 dark:[&_.before]:border-red-800
                                [&_.after]:bg-green-50 dark:[&_.after]:bg-green-900/10 [&_.after]:border-green-200 dark:[&_.after]:border-green-800
                                [&_.example-box]:bg-slate-50 dark:[&_.example-box]:bg-white/5 [&_.example-box]:p-6 [&_.example-box]:rounded-2xl [&_.example-box]:my-8 [&_.example-box]:border [&_.example-box]:border-slate-200 dark:[&_.example-box]:border-white/10
                                [&_.bad]:text-red-600 dark:[&_.bad]:text-red-400 [&_.bad]:line-through
                                [&_.good]:text-green-600 dark:[&_.good]:text-green-400
                                [&_.cta-box]:bg-gradient-to-br [&_.cta-box]:from-blue-600 [&_.cta-box]:to-indigo-700 [&_.cta-box]:p-8 [&_.cta-box]:rounded-2xl [&_.cta-box]:my-10 [&_.cta-box]:text-white
                                [&_.cta-box_h4]:text-white [&_.cta-box_h4]:text-xl [&_.cta-box_h4]:font-bold [&_.cta-box_h4]:mb-2
                                [&_.cta-box_p]:text-blue-100 [&_.cta-box_p]:mb-4
                                [&_.cta-button]:inline-block [&_.cta-button]:bg-white [&_.cta-button]:text-blue-600 [&_.cta-button]:px-6 [&_.cta-button]:py-3 [&_.cta-button]:rounded-xl [&_.cta-button]:font-bold [&_.cta-button]:no-underline [&_.cta-button]:hover:bg-blue-50 [&_.cta-button]:transition-colors
                                [&_.table-container]:overflow-x-auto [&_.table-container]:my-8
                                [&_table]:w-full [&_table]:text-sm
                                [&_thead]:bg-slate-100 dark:[&_thead]:bg-white/10
                                [&_th]:p-3 [&_th]:text-left [&_th]:font-semibold
                                [&_td]:p-3 [&_td]:border-b [&_td]:border-slate-200 dark:[&_td]:border-white/10
                            "
                            dangerouslySetInnerHTML={{ __html: post.content }}
                        />

                        {/* Tags */}
                        <div className="flex flex-wrap gap-2 mt-12 pt-8 border-t border-slate-200 dark:border-white/10">
                            <span className="text-sm font-medium text-slate-500 dark:text-slate-400 mr-2">Etiketler:</span>
                            {post.tags.map(tag => (
                                <Link
                                    key={tag}
                                    href={`/blog?tag=${encodeURIComponent(tag)}`}
                                    className="px-3 py-1 bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 text-sm rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                                >
                                    #{tag}
                                </Link>
                            ))}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-between mt-8 py-6 border-t border-b border-slate-200 dark:border-white/10">
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => setLiked(!liked)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${liked
                                        ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                                        : 'bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/20'
                                        }`}
                                >
                                    <Heart size={18} fill={liked ? 'currentColor' : 'none'} />
                                    <span>{liked ? post.likes + 1 : post.likes}</span>
                                </button>
                                <button
                                    onClick={() => setBookmarked(!bookmarked)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${bookmarked
                                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                                        : 'bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/20'
                                        }`}
                                >
                                    <Bookmark size={18} fill={bookmarked ? 'currentColor' : 'none'} />
                                    <span>Kaydet</span>
                                </button>
                            </div>

                            <div className="flex items-center gap-2">
                                <span className="text-sm text-slate-500 dark:text-slate-400 mr-2">Paylaş:</span>
                                <a
                                    href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}&text=${encodeURIComponent(post.title)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 hover:bg-[#1DA1F2] hover:text-white transition-colors"
                                >
                                    <Twitter size={18} />
                                </a>
                                <a
                                    href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 hover:bg-[#0A66C2] hover:text-white transition-colors"
                                >
                                    <Linkedin size={18} />
                                </a>
                                <a
                                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 hover:bg-[#1877F2] hover:text-white transition-colors"
                                >
                                    <Facebook size={18} />
                                </a>
                                <button
                                    onClick={copyLink}
                                    className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 hover:bg-blue-600 hover:text-white transition-colors"
                                >
                                    {copied ? <Check size={18} /> : <Link2 size={18} />}
                                </button>
                            </div>
                        </div>
                    </motion.div>

                    {/* Sidebar */}
                    <motion.aside
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="space-y-8"
                    >
                        {/* Sticky Container */}
                        <div className="lg:sticky lg:top-32 space-y-8">
                            <TableOfContents />

                            {/* Newsletter */}
                            <div className="p-6 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl text-white">
                                <h3 className="font-bold text-lg mb-2">📬 Bültene Abone Ol</h3>
                                <p className="text-blue-100 text-sm mb-4">
                                    Haftalık e-ticaret içgörüleri doğrudan e-postanıza gelsin.
                                </p>
                                <input
                                    type="email"
                                    placeholder="E-posta adresiniz"
                                    className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/60 text-sm mb-3 focus:outline-none focus:border-white/40"
                                />
                                <button className="w-full py-3 bg-white text-blue-600 rounded-xl font-bold text-sm hover:bg-blue-50 transition-colors">
                                    Abone Ol
                                </button>
                            </div>

                            {/* Related Posts */}
                            {relatedPosts.length > 0 && (
                                <div className="p-6 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10">
                                    <h3 className="font-bold text-slate-900 dark:text-white mb-4">İlgili Yazılar</h3>
                                    <div className="space-y-4">
                                        {relatedPosts.map(relatedPost => (
                                            <Link
                                                key={relatedPost.id}
                                                href={`/blog/${relatedPost.slug}`}
                                                className="group block"
                                            >
                                                <div className="flex gap-3">
                                                    <img
                                                        src={relatedPost.image}
                                                        alt={relatedPost.title}
                                                        className="w-20 h-14 object-cover rounded-lg flex-shrink-0"
                                                    />
                                                    <div>
                                                        <h4 className="text-sm font-medium text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                                                            {relatedPost.title}
                                                        </h4>
                                                        <p className="text-xs text-slate-500 mt-1">{relatedPost.readTime}</p>
                                                    </div>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* CTA */}
                            <div className="p-6 bg-slate-900 dark:bg-white/5 rounded-2xl border border-slate-800 dark:border-white/10 text-center">
                                <h3 className="font-bold text-white mb-2">E-ticaretinizi Büyütün</h3>
                                <p className="text-slate-400 text-sm mb-4">
                                    7+ pazaryerini tek panelden yönetin.
                                </p>
                                <Link
                                    href="/ucretsiz-dene"
                                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-medium text-sm hover:bg-blue-700 transition-colors"
                                >
                                    Ücretsiz Deneyin
                                    <ArrowRight size={16} />
                                </Link>
                            </div>
                        </div>
                    </motion.aside>
                </div>

                {/* Post Navigation */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    className="max-w-4xl mx-auto mt-16 grid md:grid-cols-2 gap-4"
                >
                    {Number(slug) > 1 && (
                        <Link
                            href={`/blog/${Number(slug) - 1}`}
                            className="group p-6 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10 hover:border-blue-300 dark:hover:border-blue-500/30 transition-colors"
                        >
                            <span className="text-sm text-slate-500 flex items-center gap-1 mb-2">
                                <ArrowLeft size={14} />
                                Önceki Yazı
                            </span>
                            <h4 className="font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1">
                                {BLOG_POSTS[String(Number(slug) - 1)]?.title || 'Önceki Yazı'}
                            </h4>
                        </Link>
                    )}
                    {Number(slug) < Object.keys(BLOG_POSTS).length && (
                        <Link
                            href={`/blog/${Number(slug) + 1}`}
                            className="group p-6 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10 hover:border-blue-300 dark:hover:border-blue-500/30 transition-colors text-right md:col-start-2"
                        >
                            <span className="text-sm text-slate-500 flex items-center gap-1 justify-end mb-2">
                                Sonraki Yazı
                                <ArrowRight size={14} />
                            </span>
                            <h4 className="font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1">
                                {BLOG_POSTS[String(Number(slug) + 1)]?.title || 'Sonraki Yazı'}
                            </h4>
                        </Link>
                    )}
                </motion.div>
            </article>
        </section>
    );
}
