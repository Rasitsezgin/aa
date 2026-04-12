// Kurumsal Sayfa İçerikleri - Admin panelinden düzenlenebilir
export interface LegalSection {
    title: string;
    content: string;
}

export interface LegalPage {
    title: string;
    updated: string;
    summary?: string;
    sections?: LegalSection[];
    content?: string;
}

export const LEGAL_PAGES: Record<string, LegalPage> = {
    'gizlilik-politikasi': {
        title: 'Gizlilik Politikası',
        updated: '1 Şubat 2026',
        summary: 'Pazaryonetimi olarak kişisel verilerinizin güvenliğine büyük önem veriyoruz. Bu Gizlilik Politikası, hizmetlerimizi kullanırken toplanan kişisel verilerin nasıl işlendiğini, korunduğunu ve haklarınızı açıklamaktadır.',
        sections: [
            {
                title: 'Veri Sorumlusu',
                content: `
                    <p>Bu Gizlilik Politikası kapsamında veri sorumlusu:</p>
                    <div class="bg-slate-50 dark:bg-white/5 p-4 rounded-xl my-4">
                        <p><strong>Şirket Unvanı:</strong> Pazaryonetimi Teknoloji A.Ş.</p>
                        <p><strong>Adres:</strong> Maslak Mahallesi, Büyükdere Caddesi No:255, Nurol Plaza Kat:5, 34485 Sarıyer/İstanbul</p>
                        <p><strong>E-posta:</strong> kvkk@pazaryonetimi.com</p>
                        <p><strong>Telefon:</strong> 0850 840 26 26</p>
                        <p><strong>Mersis No:</strong> 0123456789012345</p>
                    </div>
                    <p>Şirketimiz, 6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") ve ilgili mevzuat kapsamında veri sorumlusu sıfatıyla kişisel verilerinizi işlemektedir.</p>
                `
            },
            {
                title: 'Toplanan Kişisel Veriler',
                content: `
                    <p>Hizmetlerimizi kullanırken aşağıdaki kategorilerde kişisel veriler toplanabilmektedir:</p>
                    
                    <h3>2.1. Kimlik Bilgileri</h3>
                    <ul>
                        <li>Ad, soyad, T.C. kimlik numarası</li>
                        <li>Doğum tarihi, cinsiyet</li>
                        <li>Şirket unvanı, vergi kimlik numarası</li>
                        <li>İmza, fotoğraf</li>
                    </ul>
                    
                    <h3>2.2. İletişim Bilgileri</h3>
                    <ul>
                        <li>E-posta adresi, telefon numarası</li>
                        <li>Posta adresi, fatura adresi</li>
                        <li>Sosyal medya hesap bilgileri</li>
                    </ul>
                    
                    <h3>2.3. Finansal Bilgiler</h3>
                    <ul>
                        <li>Banka hesap bilgileri, IBAN</li>
                        <li>Kredi kartı bilgileri (şifrelenmiş)</li>
                        <li>Fatura ve ödeme geçmişi</li>
                    </ul>
                    
                    <h3>2.4. Teknik Veriler</h3>
                    <ul>
                        <li>IP adresi, cihaz bilgileri</li>
                        <li>Tarayıcı türü ve versiyonu</li>
                        <li>İşletim sistemi bilgileri</li>
                        <li>Çerez verileri, oturum bilgileri</li>
                        <li>Log kayıtları, erişim zamanları</li>
                    </ul>
                    
                    <h3>2.5. Kullanım Verileri</h3>
                    <ul>
                        <li>Platform kullanım alışkanlıkları</li>
                        <li>Tıklama ve gezinme verileri</li>
                        <li>Arama sorguları, tercihler</li>
                        <li>Pazaryeri entegrasyon verileri</li>
                    </ul>
                `
            },
            {
                title: 'Verilerin Toplanma Yöntemleri',
                content: `
                    <p>Kişisel verileriniz aşağıdaki yöntemlerle toplanmaktadır:</p>
                    <ul>
                        <li><strong>Doğrudan Sizden:</strong> Kayıt formları, iletişim formları, müşteri hizmetleri görüşmeleri</li>
                        <li><strong>Otomatik Olarak:</strong> Çerezler, log dosyaları, analitik araçlar aracılığıyla</li>
                        <li><strong>Üçüncü Taraflardan:</strong> Pazaryeri API'leri, ödeme sağlayıcıları, iş ortakları</li>
                        <li><strong>Kamuya Açık Kaynaklardan:</strong> Ticaret sicil gazetesi, şirket veritabanları</li>
                    </ul>
                `
            },
            {
                title: 'Verilerin İşlenme Amaçları',
                content: `
                    <p>Toplanan kişisel veriler aşağıdaki amaçlarla işlenmektedir:</p>
                    
                    <h3>4.1. Hizmet Sunumu</h3>
                    <ul>
                        <li>Üyelik ve hesap oluşturma işlemlerinin yürütülmesi</li>
                        <li>Platform hizmetlerinin sağlanması ve iyileştirilmesi</li>
                        <li>Pazaryeri entegrasyonlarının gerçekleştirilmesi</li>
                        <li>Sipariş, stok ve fiyat yönetimi hizmetlerinin sunulması</li>
                        <li>Teknik destek ve müşteri hizmetlerinin sağlanması</li>
                    </ul>
                    
                    <h3>4.2. Güvenlik</h3>
                    <ul>
                        <li>Hesap güvenliğinin sağlanması</li>
                        <li>Dolandırıcılık ve kötüye kullanımın önlenmesi</li>
                        <li>Sistem güvenliğinin korunması</li>
                        <li>Yetkisiz erişimlerin tespit edilmesi</li>
                    </ul>
                    
                    <h3>4.3. Yasal Yükümlülükler</h3>
                    <ul>
                        <li>Vergi mevzuatı kapsamındaki yükümlülükler</li>
                        <li>E-ticaret mevzuatı gereklilikleri</li>
                        <li>Yetkili kurum ve kuruluşlara bilgi sağlanması</li>
                        <li>Hukuki süreçlerin yürütülmesi</li>
                    </ul>
                    
                    <h3>4.4. İletişim ve Pazarlama</h3>
                    <ul>
                        <li>Hizmet güncellemeleri ve bildirimlerin iletilmesi</li>
                        <li>Kampanya ve promosyonların duyurulması (izninize bağlı)</li>
                        <li>Anket ve geri bildirim talepleri</li>
                        <li>Kişiselleştirilmiş içerik ve önerilerin sunulması</li>
                    </ul>
                `
            },
            {
                title: 'Verilerin Saklanma Süresi',
                content: `
                    <p>Kişisel verileriniz, işleme amaçlarının gerektirdiği süre boyunca saklanmaktadır:</p>
                    <ul>
                        <li><strong>Üyelik Bilgileri:</strong> Üyelik süresince ve sonlandırılmasından itibaren 10 yıl</li>
                        <li><strong>Finansal Veriler:</strong> İlgili işlemden itibaren 10 yıl (vergi mevzuatı gereği)</li>
                        <li><strong>İletişim Kayıtları:</strong> Son iletişimden itibaren 3 yıl</li>
                        <li><strong>Log Kayıtları:</strong> Oluşturulmasından itibaren 2 yıl</li>
                        <li><strong>Pazarlama Verileri:</strong> İzin geri alınana veya 3 yıl etkileşim olmadığında</li>
                    </ul>
                    <p>Yasal saklama süreleri sona erdikten sonra kişisel verileriniz silinir, yok edilir veya anonim hale getirilir.</p>
                `
            },
            {
                title: 'Verilerin Paylaşımı',
                content: `
                    <p>Kişisel verileriniz, aşağıdaki taraflarla ve belirtilen amaçlarla paylaşılabilmektedir:</p>
                    
                    <h3>6.1. Hizmet Sağlayıcılar</h3>
                    <ul>
                        <li><strong>Bulut Hizmet Sağlayıcıları:</strong> Amazon Web Services, Google Cloud (veri depolama ve işleme)</li>
                        <li><strong>Ödeme Kuruluşları:</strong> iyzico, PayTR (ödeme işlemleri)</li>
                        <li><strong>E-posta Hizmetleri:</strong> SendGrid, Mailgun (iletişim)</li>
                        <li><strong>Analitik Araçlar:</strong> Google Analytics, Mixpanel (kullanım analizi)</li>
                    </ul>
                    
                    <h3>6.2. İş Ortakları</h3>
                    <ul>
                        <li><strong>Pazaryerleri:</strong> Trendyol, Hepsiburada, Amazon, N11 (entegrasyon hizmetleri kapsamında)</li>
                        <li><strong>Kargo Firmaları:</strong> Aras, Yurtiçi, MNG (sipariş teslimatı)</li>
                    </ul>
                    
                    <h3>6.3. Yetkili Kurumlar</h3>
                    <ul>
                        <li>Mahkemeler ve icra daireleri (yasal zorunluluk halinde)</li>
                        <li>Vergi daireleri ve düzenleyici kurumlar</li>
                        <li>Kişisel Verileri Koruma Kurumu</li>
                    </ul>
                    
                    <p class="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-xl border border-amber-200 dark:border-amber-800 mt-4">
                        <strong>Önemli:</strong> Verileriniz hiçbir koşulda satılmaz veya ticari amaçlarla üçüncü taraflara devredilmez.
                    </p>
                `
            },
            {
                title: 'Veri Güvenliği',
                content: `
                    <p>Kişisel verilerinizin güvenliği için aşağıdaki teknik ve idari tedbirler uygulanmaktadır:</p>
                    
                    <h3>7.1. Teknik Tedbirler</h3>
                    <ul>
                        <li>SSL/TLS şifreleme (256-bit)</li>
                        <li>Güvenlik duvarı (Firewall) koruması</li>
                        <li>Saldırı tespit ve önleme sistemleri (IDS/IPS)</li>
                        <li>Düzenli güvenlik taramaları ve penetrasyon testleri</li>
                        <li>Veri şifreleme (AES-256)</li>
                        <li>İki faktörlü kimlik doğrulama (2FA)</li>
                        <li>Erişim kontrolü ve yetkilendirme</li>
                    </ul>
                    
                    <h3>7.2. İdari Tedbirler</h3>
                    <ul>
                        <li>Çalışan gizlilik sözleşmeleri</li>
                        <li>Düzenli güvenlik eğitimleri</li>
                        <li>Veri erişim politikaları</li>
                        <li>Olay müdahale prosedürleri</li>
                        <li>Periyodik denetimler</li>
                    </ul>
                `
            },
            {
                title: 'Haklarınız',
                content: `
                    <p>KVKK'nın 11. maddesi kapsamında aşağıdaki haklara sahipsiniz:</p>
                    <ul>
                        <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
                        <li>İşlenmişse buna ilişkin bilgi talep etme</li>
                        <li>İşlenme amacını ve bunların amacına uygun kullanılıp kullanılmadığını öğrenme</li>
                        <li>Yurt içinde veya yurt dışında aktarıldığı üçüncü kişileri bilme</li>
                        <li>Eksik veya yanlış işlenmişse düzeltilmesini isteme</li>
                        <li>KVKK'nın 7. maddesinde öngörülen şartlar çerçevesinde silinmesini veya yok edilmesini isteme</li>
                        <li>Düzeltme, silme veya yok etme işlemlerinin aktarıldığı üçüncü kişilere bildirilmesini isteme</li>
                        <li>İşlenen verilerin münhasıran otomatik sistemler vasıtasıyla analiz edilmesi suretiyle aleyhinize bir sonucun ortaya çıkmasına itiraz etme</li>
                        <li>Kanuna aykırı olarak işlenmesi sebebiyle zarara uğramanız hâlinde zararın giderilmesini talep etme</li>
                    </ul>
                    
                    <p class="mt-4">Haklarınızı kullanmak için:</p>
                    <ul>
                        <li>E-posta: kvkk@pazaryonetimi.com</li>
                        <li>Posta: Maslak Mah. Büyükdere Cad. No:255 Nurol Plaza K:5 Sarıyer/İstanbul</li>
                        <li>Platform üzerinden: Hesap Ayarları > Gizlilik > Veri Talebi</li>
                    </ul>
                    
                    <p>Başvurularınız 30 gün içinde ücretsiz olarak sonuçlandırılacaktır.</p>
                `
            },
            {
                title: 'Çocukların Gizliliği',
                content: `
                    <p>Hizmetlerimiz 18 yaşından küçük bireylere yönelik değildir. Bilerek 18 yaşından küçük bireylerden kişisel veri toplamıyoruz. Eğer bir çocuğun kişisel verilerini topladığımızı fark ederseniz, lütfen bizimle iletişime geçin; ilgili verileri derhal sileceğiz.</p>
                `
            },
            {
                title: 'Politika Değişiklikleri',
                content: `
                    <p>Bu Gizlilik Politikası, yasal gereklilikler veya hizmet değişiklikleri doğrultusunda güncellenebilir. Önemli değişiklikler:</p>
                    <ul>
                        <li>E-posta ile bildirilecektir</li>
                        <li>Platform üzerinde duyurulacaktır</li>
                        <li>Bu sayfada yayınlanacaktır</li>
                    </ul>
                    <p>Güncellemelerden sonra hizmetlerimizi kullanmaya devam etmeniz, değişiklikleri kabul ettiğiniz anlamına gelir.</p>
                `
            },
            {
                title: 'İletişim',
                content: `
                    <p>Gizlilik Politikası ile ilgili sorularınız için:</p>
                    <div class="bg-slate-50 dark:bg-white/5 p-4 rounded-xl">
                        <p><strong>Pazaryonetimi Teknoloji A.Ş.</strong></p>
                        <p><strong>Veri Koruma Sorumlusu (DPO)</strong></p>
                        <p>E-posta: kvkk@pazaryonetimi.com</p>
                        <p>Telefon: 0850 840 26 26</p>
                        <p>Adres: Maslak Mah. Büyükdere Cad. No:255 Nurol Plaza K:5 34485 Sarıyer/İstanbul</p>
                    </div>
                `
            }
        ]
    },

    'kullanim-sartlari': {
        title: 'Kullanım Şartları',
        updated: '1 Şubat 2026',
        summary: 'Bu Kullanım Şartları, Pazaryonetimi platformunu kullanımınızı düzenleyen yasal sözleşmedir. Platformumuzu kullanarak bu şartları kabul etmiş sayılırsınız.',
        sections: [
            {
                title: 'Tanımlar',
                content: `
                    <p>Bu Kullanım Şartları'nda geçen terimler:</p>
                    <ul>
                        <li><strong>"Platform":</strong> pazaryonetimi.com web sitesi, mobil uygulamalar ve ilgili tüm hizmetler</li>
                        <li><strong>"Şirket", "Biz":</strong> Pazaryonetimi Teknoloji A.Ş.</li>
                        <li><strong>"Kullanıcı", "Siz":</strong> Platformu kullanan gerçek veya tüzel kişi</li>
                        <li><strong>"Hizmetler":</strong> Platform üzerinden sunulan tüm özellik ve fonksiyonlar</li>
                        <li><strong>"İçerik":</strong> Platform üzerindeki tüm metin, görsel, video ve diğer materyaller</li>
                        <li><strong>"Kullanıcı İçeriği":</strong> Kullanıcılar tarafından yüklenen veya oluşturulan içerikler</li>
                    </ul>
                `
            },
            {
                title: 'Hizmet Kapsamı',
                content: `
                    <p>Pazaryonetimi, e-ticaret satıcılarına aşağıdaki hizmetleri sunmaktadır:</p>
                    <ul>
                        <li>Çoklu pazaryeri entegrasyonu ve yönetimi</li>
                        <li>Ürün, stok ve fiyat yönetimi</li>
                        <li>Sipariş takibi ve yönetimi</li>
                        <li>Raporlama ve analitik araçlar</li>
                        <li>Yapay zeka destekli optimizasyon</li>
                        <li>Müşteri desteği ve danışmanlık</li>
                    </ul>
                    <p>Şirket, hizmetlerin kapsamını, özelliklerini ve fiyatlandırmasını önceden bildirmek suretiyle değiştirme hakkını saklı tutar.</p>
                `
            },
            {
                title: 'Hesap Oluşturma ve Güvenlik',
                content: `
                    <h3>3.1. Kayıt Şartları</h3>
                    <ul>
                        <li>18 yaşından büyük olmak</li>
                        <li>Yasal olarak bağlayıcı sözleşme yapma ehliyetine sahip olmak</li>
                        <li>Doğru, güncel ve eksiksiz bilgi sağlamak</li>
                        <li>Türkiye'de veya hizmet verilen ülkelerde yerleşik olmak</li>
                    </ul>
                    
                    <h3>3.2. Hesap Güvenliği</h3>
                    <p>Kullanıcı olarak:</p>
                    <ul>
                        <li>Hesap bilgilerinizin gizliliğinden sorumlusunuz</li>
                        <li>Güçlü şifre kullanmalısınız (en az 8 karakter, harf, rakam ve özel karakter)</li>
                        <li>İki faktörlü kimlik doğrulamayı etkinleştirmeniz önerilir</li>
                        <li>Şüpheli aktiviteleri derhal bildirmelisiniz</li>
                        <li>Hesabınızı başkalarıyla paylaşmamalısınız</li>
                    </ul>
                    
                    <h3>3.3. Hesap Askıya Alma</h3>
                    <p>Şirket, aşağıdaki durumlarda hesabınızı önceden bildirim yapmaksızın askıya alabilir veya sonlandırabilir:</p>
                    <ul>
                        <li>Kullanım şartlarının ihlali</li>
                        <li>Yasadışı faaliyetler</li>
                        <li>Dolandırıcılık veya kötüye kullanım</li>
                        <li>Ödeme yükümlülüklerinin yerine getirilmemesi</li>
                        <li>Uzun süreli inaktivite (12 aydan fazla)</li>
                    </ul>
                `
            },
            {
                title: 'Kabul Edilebilir Kullanım',
                content: `
                    <h3>4.1. İzin Verilen Kullanımlar</h3>
                    <ul>
                        <li>Kendi e-ticaret operasyonlarınızı yönetmek</li>
                        <li>Pazaryeri entegrasyonlarını kullanmak</li>
                        <li>Raporları görüntülemek ve indirmek</li>
                        <li>API'yi dokümantasyona uygun şekilde kullanmak</li>
                    </ul>
                    
                    <h3>4.2. Yasaklanan Kullanımlar</h3>
                    <p>Aşağıdaki faaliyetler kesinlikle yasaktır:</p>
                    <ul>
                        <li>Yasalara aykırı ürün veya hizmet satışı</li>
                        <li>Sahte, taklit veya çalıntı ürün listelemeleri</li>
                        <li>Platformun güvenliğini tehlikeye atacak eylemler</li>
                        <li>Reverse engineering, kaynak kod çözümleme</li>
                        <li>Otomatik bot veya scraper kullanımı (izinsiz)</li>
                        <li>Diğer kullanıcıların verilerine yetkisiz erişim</li>
                        <li>Spam, zararlı yazılım veya virüs dağıtımı</li>
                        <li>Platformun aşırı yüklenmesine neden olan kullanım</li>
                        <li>Fikri mülkiyet haklarının ihlali</li>
                        <li>Yanıltıcı veya aldatıcı faaliyetler</li>
                    </ul>
                `
            },
            {
                title: 'Ödeme ve Faturalandırma',
                content: `
                    <h3>5.1. Ücretlendirme</h3>
                    <ul>
                        <li>Hizmet ücretleri seçilen plana göre belirlenir</li>
                        <li>Fiyatlar KDV hariç olarak gösterilir</li>
                        <li>Aylık veya yıllık ödeme seçenekleri mevcuttur</li>
                        <li>Yıllık ödemelerde indirim uygulanır</li>
                    </ul>
                    
                    <h3>5.2. Ödeme Koşulları</h3>
                    <ul>
                        <li>Ödemeler her ayın 1'inde otomatik olarak tahsil edilir</li>
                        <li>Kredi kartı veya havale/EFT ile ödeme yapılabilir</li>
                        <li>Başarısız ödemelerde 3 gün içinde yeniden deneme yapılır</li>
                        <li>Ödeme yapılmaması durumunda hizmet askıya alınır</li>
                    </ul>
                    
                    <h3>5.3. İade Politikası</h3>
                    <ul>
                        <li>Aylık planlar: İade yapılmaz</li>
                        <li>Yıllık planlar: İlk 14 gün içinde tam iade</li>
                        <li>İade talepleri destek ekibine iletilmelidir</li>
                    </ul>
                `
            },
            {
                title: 'Fikri Mülkiyet Hakları',
                content: `
                    <h3>6.1. Şirketin Hakları</h3>
                    <p>Platform ve içeriğindeki tüm fikri mülkiyet hakları Pazaryonetimi Teknoloji A.Ş.'ye aittir:</p>
                    <ul>
                        <li>Yazılım, kaynak kod ve algoritmalar</li>
                        <li>Tasarım, logo ve markalar</li>
                        <li>Dokümantasyon ve eğitim materyalleri</li>
                        <li>API ve teknik spesifikasyonlar</li>
                    </ul>
                    
                    <h3>6.2. Kullanıcı İçeriği</h3>
                    <p>Platforma yüklediğiniz içerikler üzerindeki haklar size aittir. Ancak bu içerikleri yükleyerek:</p>
                    <ul>
                        <li>Hizmetlerin sunulması için gerekli lisansı verirsiniz</li>
                        <li>İçeriklerin yasal olduğunu beyan edersiniz</li>
                        <li>Üçüncü taraf haklarını ihlal etmediğinizi garanti edersiniz</li>
                    </ul>
                `
            },
            {
                title: 'Sorumluluk Sınırlaması',
                content: `
                    <h3>7.1. Hizmet Garantisi</h3>
                    <p>Platform "olduğu gibi" sunulmaktadır. Şirket:</p>
                    <ul>
                        <li>Hizmetlerin kesintisiz veya hatasız olacağını garanti etmez</li>
                        <li>Belirli bir amaca uygunluğu garanti etmez</li>
                        <li>Üçüncü taraf hizmetlerinin performansından sorumlu değildir</li>
                    </ul>
                    
                    <h3>7.2. Sorumluluk Limiti</h3>
                    <p>Şirketin toplam sorumluluğu, hiçbir koşulda son 12 ayda ödediğiniz toplam ücreti aşmayacaktır. Şirket aşağıdaki zararlardan sorumlu tutulamaz:</p>
                    <ul>
                        <li>Dolaylı, arızi veya sonuç olarak ortaya çıkan zararlar</li>
                        <li>Kar kaybı, iş kaybı veya itibar kaybı</li>
                        <li>Veri kaybı (yedekleme kullanıcının sorumluluğundadır)</li>
                        <li>Pazaryerlerinin kararları veya politika değişiklikleri</li>
                    </ul>
                `
            },
            {
                title: 'Gizlilik ve Veri Koruma',
                content: `
                    <p>Kişisel verilerinizin işlenmesi hakkında detaylı bilgi için <a href="/kurumsal/gizlilik-politikasi">Gizlilik Politikamızı</a> inceleyiniz.</p>
                    <p>Platform kullanımınız sırasında:</p>
                    <ul>
                        <li>Verileriniz güvenli sunucularda saklanır</li>
                        <li>Şifreleme teknolojileri kullanılır</li>
                        <li>KVKK ve GDPR uyumluluğu sağlanır</li>
                        <li>Verilerinizi istediğiniz zaman silebilirsiniz</li>
                    </ul>
                `
            },
            {
                title: 'Sözleşme Değişiklikleri',
                content: `
                    <p>Şirket, bu Kullanım Şartları'nı güncelleyebilir. Değişiklikler:</p>
                    <ul>
                        <li>En az 30 gün önceden e-posta ile bildirilir</li>
                        <li>Platform üzerinde duyurulur</li>
                        <li>Bu sayfada yayınlanır</li>
                    </ul>
                    <p>Değişiklikleri kabul etmemeniz halinde, yürürlük tarihinden önce hesabınızı kapatabilirsiniz. Değişiklik sonrası platformu kullanmaya devam etmeniz, yeni şartları kabul ettiğiniz anlamına gelir.</p>
                `
            },
            {
                title: 'Uyuşmazlık Çözümü',
                content: `
                    <h3>10.1. Uygulanacak Hukuk</h3>
                    <p>Bu sözleşme Türkiye Cumhuriyeti kanunlarına tabidir.</p>
                    
                    <h3>10.2. Yetkili Mahkeme</h3>
                    <p>Uyuşmazlıklarda İstanbul (Çağlayan) Mahkemeleri ve İcra Daireleri yetkilidir.</p>
                    
                    <h3>10.3. Alternatif Çözüm</h3>
                    <p>Taraflar, uyuşmazlıkları öncelikle müzakere yoluyla çözmeye çalışacaklardır. Müzakere sonuçsuz kalırsa, arabuluculuk yoluna başvurulabilir.</p>
                `
            },
            {
                title: 'Genel Hükümler',
                content: `
                    <ul>
                        <li><strong>Bölünebilirlik:</strong> Herhangi bir hükmün geçersiz sayılması, diğer hükümleri etkilemez</li>
                        <li><strong>Feragat:</strong> Bir hakkın kullanılmaması, o haktan feragat anlamına gelmez</li>
                        <li><strong>Devir:</strong> Kullanıcı, bu sözleşmeden doğan haklarını Şirketin yazılı izni olmadan devredemez</li>
                        <li><strong>Mücbir Sebep:</strong> Tarafların kontrolü dışındaki olaylardan (doğal afet, savaş, pandemi vb.) kaynaklanan aksaklıklardan sorumluluk doğmaz</li>
                        <li><strong>Bütünlük:</strong> Bu sözleşme, taraflar arasındaki anlaşmanın tamamını oluşturur</li>
                    </ul>
                `
            },
            {
                title: 'İletişim',
                content: `
                    <p>Bu Kullanım Şartları hakkında sorularınız için:</p>
                    <div class="bg-slate-50 dark:bg-white/5 p-4 rounded-xl">
                        <p><strong>Pazaryonetimi Teknoloji A.Ş.</strong></p>
                        <p>E-posta: hukuk@pazaryonetimi.com</p>
                        <p>Telefon: 0850 840 26 26</p>
                        <p>Adres: Maslak Mah. Büyükdere Cad. No:255 Nurol Plaza K:5 34485 Sarıyer/İstanbul</p>
                    </div>
                `
            }
        ]
    },

    'cerez-politikasi': {
        title: 'Çerez Politikası',
        updated: '1 Şubat 2026',
        summary: 'Bu Çerez Politikası, Pazaryonetimi platformunda kullanılan çerezler ve benzeri teknolojiler hakkında sizi bilgilendirmek amacıyla hazırlanmıştır.',
        sections: [
            {
                title: 'Çerez Nedir?',
                content: `
                    <p>Çerezler (cookies), web sitelerinin cihazınıza (bilgisayar, tablet, akıllı telefon) yerleştirdiği küçük metin dosyalarıdır. Bu dosyalar:</p>
                    <ul>
                        <li>Oturum bilgilerinizi hatırlar</li>
                        <li>Tercihlerinizi saklar</li>
                        <li>Site deneyiminizi kişiselleştirir</li>
                        <li>Site performansını ölçmeye yardımcı olur</li>
                    </ul>
                    <p>Çerezler, kişisel dosyalarınıza erişemez veya bilgisayarınıza zarar veremez.</p>
                `
            },
            {
                title: 'Çerez Türleri',
                content: `
                    <h3>2.1. Süreye Göre</h3>
                    <ul>
                        <li><strong>Oturum Çerezleri:</strong> Tarayıcınızı kapattığınızda otomatik olarak silinir</li>
                        <li><strong>Kalıcı Çerezler:</strong> Belirli bir süre cihazınızda kalır (örn. 1 yıl)</li>
                    </ul>
                    
                    <h3>2.2. Kaynağa Göre</h3>
                    <ul>
                        <li><strong>Birinci Taraf Çerezleri:</strong> Doğrudan pazaryonetimi.com tarafından yerleştirilir</li>
                        <li><strong>Üçüncü Taraf Çerezleri:</strong> Hizmet sağlayıcılarımız tarafından yerleştirilir</li>
                    </ul>
                `
            },
            {
                title: 'Kullandığımız Çerezler',
                content: `
                    <h3>3.1. Zorunlu Çerezler</h3>
                    <p>Sitenin temel işlevleri için gereklidir ve devre dışı bırakılamaz.</p>
                    <table class="w-full text-sm mt-2">
                        <thead>
                            <tr class="bg-slate-100 dark:bg-white/10">
                                <th class="p-2 text-left">Çerez Adı</th>
                                <th class="p-2 text-left">Amaç</th>
                                <th class="p-2 text-left">Süre</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr class="border-b border-slate-200 dark:border-white/10">
                                <td class="p-2">session_id</td>
                                <td class="p-2">Oturum yönetimi</td>
                                <td class="p-2">Oturum</td>
                            </tr>
                            <tr class="border-b border-slate-200 dark:border-white/10">
                                <td class="p-2">csrf_token</td>
                                <td class="p-2">Güvenlik</td>
                                <td class="p-2">Oturum</td>
                            </tr>
                            <tr class="border-b border-slate-200 dark:border-white/10">
                                <td class="p-2">auth_token</td>
                                <td class="p-2">Kimlik doğrulama</td>
                                <td class="p-2">7 gün</td>
                            </tr>
                            <tr class="border-b border-slate-200 dark:border-white/10">
                                <td class="p-2">cookie_consent</td>
                                <td class="p-2">Çerez tercihleri</td>
                                <td class="p-2">1 yıl</td>
                            </tr>
                        </tbody>
                    </table>
                    
                    <h3 class="mt-6">3.2. İşlevsel Çerezler</h3>
                    <p>Gelişmiş özellikler ve kişiselleştirme için kullanılır.</p>
                    <table class="w-full text-sm mt-2">
                        <thead>
                            <tr class="bg-slate-100 dark:bg-white/10">
                                <th class="p-2 text-left">Çerez Adı</th>
                                <th class="p-2 text-left">Amaç</th>
                                <th class="p-2 text-left">Süre</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr class="border-b border-slate-200 dark:border-white/10">
                                <td class="p-2">language</td>
                                <td class="p-2">Dil tercihi</td>
                                <td class="p-2">1 yıl</td>
                            </tr>
                            <tr class="border-b border-slate-200 dark:border-white/10">
                                <td class="p-2">theme</td>
                                <td class="p-2">Tema tercihi (aydınlık/karanlık)</td>
                                <td class="p-2">1 yıl</td>
                            </tr>
                            <tr class="border-b border-slate-200 dark:border-white/10">
                                <td class="p-2">dashboard_layout</td>
                                <td class="p-2">Panel düzeni</td>
                                <td class="p-2">6 ay</td>
                            </tr>
                            <tr class="border-b border-slate-200 dark:border-white/10">
                                <td class="p-2">recent_searches</td>
                                <td class="p-2">Son aramalar</td>
                                <td class="p-2">30 gün</td>
                            </tr>
                        </tbody>
                    </table>
                    
                    <h3 class="mt-6">3.3. Analitik Çerezler</h3>
                    <p>Site kullanımını analiz etmek ve iyileştirmek için kullanılır.</p>
                    <table class="w-full text-sm mt-2">
                        <thead>
                            <tr class="bg-slate-100 dark:bg-white/10">
                                <th class="p-2 text-left">Çerez Adı</th>
                                <th class="p-2 text-left">Sağlayıcı</th>
                                <th class="p-2 text-left">Amaç</th>
                                <th class="p-2 text-left">Süre</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr class="border-b border-slate-200 dark:border-white/10">
                                <td class="p-2">_ga</td>
                                <td class="p-2">Google Analytics</td>
                                <td class="p-2">Kullanıcı tanımlama</td>
                                <td class="p-2">2 yıl</td>
                            </tr>
                            <tr class="border-b border-slate-200 dark:border-white/10">
                                <td class="p-2">_gid</td>
                                <td class="p-2">Google Analytics</td>
                                <td class="p-2">Kullanıcı tanımlama</td>
                                <td class="p-2">24 saat</td>
                            </tr>
                            <tr class="border-b border-slate-200 dark:border-white/10">
                                <td class="p-2">mp_*</td>
                                <td class="p-2">Mixpanel</td>
                                <td class="p-2">Davranış analizi</td>
                                <td class="p-2">1 yıl</td>
                            </tr>
                            <tr class="border-b border-slate-200 dark:border-white/10">
                                <td class="p-2">_hjid</td>
                                <td class="p-2">Hotjar</td>
                                <td class="p-2">Isı haritası</td>
                                <td class="p-2">1 yıl</td>
                            </tr>
                        </tbody>
                    </table>
                    
                    <h3 class="mt-6">3.4. Pazarlama Çerezleri</h3>
                    <p>Kişiselleştirilmiş reklamlar göstermek için kullanılır (onayınıza bağlı).</p>
                    <table class="w-full text-sm mt-2">
                        <thead>
                            <tr class="bg-slate-100 dark:bg-white/10">
                                <th class="p-2 text-left">Çerez Adı</th>
                                <th class="p-2 text-left">Sağlayıcı</th>
                                <th class="p-2 text-left">Amaç</th>
                                <th class="p-2 text-left">Süre</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr class="border-b border-slate-200 dark:border-white/10">
                                <td class="p-2">_fbp</td>
                                <td class="p-2">Facebook</td>
                                <td class="p-2">Reklam hedefleme</td>
                                <td class="p-2">90 gün</td>
                            </tr>
                            <tr class="border-b border-slate-200 dark:border-white/10">
                                <td class="p-2">_gcl_au</td>
                                <td class="p-2">Google Ads</td>
                                <td class="p-2">Dönüşüm takibi</td>
                                <td class="p-2">90 gün</td>
                            </tr>
                            <tr class="border-b border-slate-200 dark:border-white/10">
                                <td class="p-2">li_fat_id</td>
                                <td class="p-2">LinkedIn</td>
                                <td class="p-2">B2B hedefleme</td>
                                <td class="p-2">30 gün</td>
                            </tr>
                        </tbody>
                    </table>
                `
            },
            {
                title: 'Çerez Tercihlerinizi Yönetme',
                content: `
                    <h3>4.1. Platform Üzerinden</h3>
                    <p>Çerez tercihlerinizi yönetmek için:</p>
                    <ul>
                        <li>Sayfanın alt kısmındaki "Çerez Ayarları" bağlantısına tıklayın</li>
                        <li>Hesap Ayarları > Gizlilik > Çerez Tercihleri bölümüne gidin</li>
                    </ul>
                    <p>Zorunlu çerezler hariç, diğer kategorilerdeki çerezleri istediğiniz zaman açıp kapatabilirsiniz.</p>
                    
                    <h3>4.2. Tarayıcı Ayarları</h3>
                    <p>Tarayıcınız üzerinden çerezleri yönetebilirsiniz:</p>
                    <ul>
                        <li><strong>Chrome:</strong> Ayarlar > Gizlilik ve Güvenlik > Çerezler</li>
                        <li><strong>Firefox:</strong> Seçenekler > Gizlilik ve Güvenlik > Çerezler</li>
                        <li><strong>Safari:</strong> Tercihler > Gizlilik > Çerezler</li>
                        <li><strong>Edge:</strong> Ayarlar > Gizlilik > Çerezler</li>
                    </ul>
                    
                    <h3>4.3. Üçüncü Taraf Opt-Out</h3>
                    <ul>
                        <li><a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener">Google Analytics Opt-out</a></li>
                        <li><a href="https://www.facebook.com/settings?tab=ads" target="_blank" rel="noopener">Facebook Reklam Tercihleri</a></li>
                        <li><a href="https://www.youronlinechoices.eu/" target="_blank" rel="noopener">Your Online Choices (AB)</a></li>
                    </ul>
                    
                    <p class="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-xl border border-amber-200 dark:border-amber-800 mt-4">
                        <strong>Uyarı:</strong> Çerezleri devre dışı bırakmak, platformun bazı özelliklerinin düzgün çalışmamasına neden olabilir.
                    </p>
                `
            },
            {
                title: 'Benzeri Teknolojiler',
                content: `
                    <p>Çerezlerin yanı sıra aşağıdaki teknolojiler de kullanılmaktadır:</p>
                    
                    <h3>5.1. Web Beacons (Piksel Etiketleri)</h3>
                    <p>E-postalarda ve web sayfalarında, açılma oranları ve tıklamaları ölçmek için kullanılan küçük görsel öğeler.</p>
                    
                    <h3>5.2. Local Storage</h3>
                    <p>Tarayıcınızın yerel depolama alanı, uygulama verilerini saklamak için kullanılır. Çerezlere göre daha fazla veri saklayabilir.</p>
                    
                    <h3>5.3. Session Storage</h3>
                    <p>Oturum bazlı geçici veri depolama. Sekme kapatıldığında silinir.</p>
                    
                    <h3>5.4. Fingerprinting</h3>
                    <p>Cihaz özelliklerinden benzersiz tanımlayıcı oluşturma. Dolandırıcılık önleme amacıyla sınırlı kullanılır.</p>
                `
            },
            {
                title: 'Veri Aktarımı',
                content: `
                    <p>Çerezler aracılığıyla toplanan veriler, hizmet sağlayıcılarımızla paylaşılabilir:</p>
                    <ul>
                        <li><strong>Google LLC (ABD):</strong> Analytics ve reklamcılık</li>
                        <li><strong>Meta Platforms (ABD):</strong> Sosyal medya ve reklamcılık</li>
                        <li><strong>Hotjar Ltd (Malta):</strong> Kullanıcı davranış analizi</li>
                    </ul>
                    <p>Bu aktarımlar, AB-ABD Veri Gizliliği Çerçevesi ve Standart Sözleşme Maddeleri kapsamında güvence altındadır.</p>
                `
            },
            {
                title: 'Çocukların Gizliliği',
                content: `
                    <p>Platformumuz 18 yaşından küçüklere yönelik değildir. Bilerek çocuklardan çerez aracılığıyla veri toplamıyoruz.</p>
                `
            },
            {
                title: 'Politika Güncellemeleri',
                content: `
                    <p>Bu Çerez Politikası zaman zaman güncellenebilir. Önemli değişiklikler:</p>
                    <ul>
                        <li>E-posta ile bildirilecektir</li>
                        <li>Platform üzerinde çerez banner'ı ile duyurulacaktır</li>
                        <li>Bu sayfada yayınlanacaktır</li>
                    </ul>
                    <p>Son güncelleme tarihi sayfanın üst kısmında belirtilmiştir.</p>
                `
            },
            {
                title: 'İletişim',
                content: `
                    <p>Çerezler ve gizlilik hakkında sorularınız için:</p>
                    <div class="bg-slate-50 dark:bg-white/5 p-4 rounded-xl">
                        <p><strong>Pazaryonetimi Teknoloji A.Ş.</strong></p>
                        <p>E-posta: gizlilik@pazaryonetimi.com</p>
                        <p>Telefon: 0850 840 26 26</p>
                    </div>
                `
            }
        ]
    },

    'kvkk': {
        title: 'KVKK Aydınlatma Metni',
        updated: '1 Şubat 2026',
        summary: '6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında, kişisel verilerinizin işlenmesi hakkında sizleri bilgilendirmek amacıyla hazırlanmıştır.',
        sections: [
            {
                title: 'Veri Sorumlusu',
                content: `
                    <p>6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") kapsamında veri sorumlusu:</p>
                    <div class="bg-slate-50 dark:bg-white/5 p-4 rounded-xl my-4">
                        <p><strong>Şirket Unvanı:</strong> Pazaryonetimi Teknoloji Anonim Şirketi</p>
                        <p><strong>Mersis No:</strong> 0123456789012345</p>
                        <p><strong>Adres:</strong> Maslak Mahallesi, Büyükdere Caddesi No:255, Nurol Plaza Kat:5, 34485 Sarıyer/İstanbul</p>
                        <p><strong>E-posta:</strong> kvkk@pazaryonetimi.com</p>
                        <p><strong>KEP Adresi:</strong> pazaryonetimi@hs01.kep.tr</p>
                        <p><strong>VKN:</strong> 1234567890</p>
                    </div>
                `
            },
            {
                title: 'Kişisel Verilerin İşlenme Amaçları',
                content: `
                    <p>Kişisel verileriniz KVKK'nın 5. ve 6. maddelerinde belirtilen hukuki sebeplere dayanarak aşağıdaki amaçlarla işlenmektedir:</p>
                    
                    <h3>2.1. Sözleşmenin İfası (md. 5/2-c)</h3>
                    <ul>
                        <li>Üyelik sözleşmesinin kurulması ve ifası</li>
                        <li>Platform hizmetlerinin sunulması</li>
                        <li>Sipariş ve ödeme işlemlerinin gerçekleştirilmesi</li>
                        <li>Teknik destek sağlanması</li>
                        <li>Pazaryeri entegrasyonlarının yapılması</li>
                    </ul>
                    
                    <h3>2.2. Yasal Yükümlülük (md. 5/2-ç)</h3>
                    <ul>
                        <li>5651 sayılı Kanun kapsamında log kayıtlarının tutulması</li>
                        <li>6563 sayılı Elektronik Ticaretin Düzenlenmesi Kanunu yükümlülükleri</li>
                        <li>Vergi mevzuatı kapsamında fatura ve mali kayıtların saklanması</li>
                        <li>Yetkili kurum ve kuruluşlara bilgi sağlanması</li>
                    </ul>
                    
                    <h3>2.3. Meşru Menfaat (md. 5/2-f)</h3>
                    <ul>
                        <li>Hizmet kalitesinin iyileştirilmesi</li>
                        <li>Dolandırıcılık ve güvenlik tehditlerinin önlenmesi</li>
                        <li>İstatistiksel analizler ve raporlama</li>
                        <li>Hukuki süreçlerin yürütülmesi</li>
                    </ul>
                    
                    <h3>2.4. Açık Rıza (md. 5/1)</h3>
                    <ul>
                        <li>Pazarlama ve promosyon iletişimi</li>
                        <li>Profilleme ve kişiselleştirilmiş içerik sunumu</li>
                        <li>Üçüncü taraf hizmetleriyle entegrasyon</li>
                    </ul>
                `
            },
            {
                title: 'İşlenen Kişisel Veri Kategorileri',
                content: `
                    <table class="w-full text-sm">
                        <thead>
                            <tr class="bg-slate-100 dark:bg-white/10">
                                <th class="p-3 text-left">Veri Kategorisi</th>
                                <th class="p-3 text-left">Açıklama</th>
                                <th class="p-3 text-left">Örnekler</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr class="border-b border-slate-200 dark:border-white/10">
                                <td class="p-3 font-medium">Kimlik</td>
                                <td class="p-3">Kimliğinizi belirleyen bilgiler</td>
                                <td class="p-3">Ad, soyad, T.C. kimlik no, vergi no</td>
                            </tr>
                            <tr class="border-b border-slate-200 dark:border-white/10">
                                <td class="p-3 font-medium">İletişim</td>
                                <td class="p-3">Sizinle iletişim kurmak için</td>
                                <td class="p-3">E-posta, telefon, adres</td>
                            </tr>
                            <tr class="border-b border-slate-200 dark:border-white/10">
                                <td class="p-3 font-medium">Müşteri İşlem</td>
                                <td class="p-3">Hizmet kullanım bilgileri</td>
                                <td class="p-3">Sipariş geçmişi, destek talepleri</td>
                            </tr>
                            <tr class="border-b border-slate-200 dark:border-white/10">
                                <td class="p-3 font-medium">Finans</td>
                                <td class="p-3">Mali işlem bilgileri</td>
                                <td class="p-3">Fatura, ödeme, banka bilgileri</td>
                            </tr>
                            <tr class="border-b border-slate-200 dark:border-white/10">
                                <td class="p-3 font-medium">İşlem Güvenliği</td>
                                <td class="p-3">Güvenlik amaçlı veriler</td>
                                <td class="p-3">IP adresi, log kayıtları, şifre</td>
                            </tr>
                            <tr class="border-b border-slate-200 dark:border-white/10">
                                <td class="p-3 font-medium">Pazarlama</td>
                                <td class="p-3">İletişim tercihleri</td>
                                <td class="p-3">Tercihler, izinler, kampanya geçmişi</td>
                            </tr>
                        </tbody>
                    </table>
                `
            },
            {
                title: 'Kişisel Verilerin Toplanma Yöntemleri',
                content: `
                    <p>Kişisel verileriniz aşağıdaki yöntemlerle toplanmaktadır:</p>
                    
                    <h3>4.1. Otomatik Olmayan Yollar</h3>
                    <ul>
                        <li>Üyelik ve kayıt formları</li>
                        <li>Müşteri hizmetleri iletişimi (telefon, e-posta, canlı destek)</li>
                        <li>Fiziksel formlar ve sözleşmeler</li>
                        <li>İş başvuru formları</li>
                    </ul>
                    
                    <h3>4.2. Otomatik Yollar</h3>
                    <ul>
                        <li>Çerezler ve benzeri teknolojiler</li>
                        <li>Log dosyaları ve sunucu kayıtları</li>
                        <li>Analitik araçlar</li>
                        <li>API entegrasyonları</li>
                    </ul>
                    
                    <h3>4.3. Üçüncü Taraflardan</h3>
                    <ul>
                        <li>Pazaryeri platformları (Trendyol, Hepsiburada, Amazon vb.)</li>
                        <li>Ödeme kuruluşları</li>
                        <li>Sosyal medya platformları (izninize bağlı)</li>
                        <li>İş ortakları ve tedarikçiler</li>
                    </ul>
                `
            },
            {
                title: 'Kişisel Verilerin Aktarımı',
                content: `
                    <p>Kişisel verileriniz, KVKK'nın 8. ve 9. maddelerinde belirtilen şartlara uygun olarak aşağıdaki taraflara aktarılabilmektedir:</p>
                    
                    <h3>5.1. Yurt İçi Aktarım</h3>
                    <table class="w-full text-sm mt-2 mb-4">
                        <thead>
                            <tr class="bg-slate-100 dark:bg-white/10">
                                <th class="p-2 text-left">Alıcı Grubu</th>
                                <th class="p-2 text-left">Aktarım Amacı</th>
                                <th class="p-2 text-left">Hukuki Sebep</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr class="border-b border-slate-200 dark:border-white/10">
                                <td class="p-2">İş Ortakları</td>
                                <td class="p-2">Hizmet sunumu</td>
                                <td class="p-2">Sözleşmenin ifası</td>
                            </tr>
                            <tr class="border-b border-slate-200 dark:border-white/10">
                                <td class="p-2">Tedarikçiler</td>
                                <td class="p-2">Altyapı hizmetleri</td>
                                <td class="p-2">Meşru menfaat</td>
                            </tr>
                            <tr class="border-b border-slate-200 dark:border-white/10">
                                <td class="p-2">Yetkili Kurumlar</td>
                                <td class="p-2">Yasal zorunluluk</td>
                                <td class="p-2">Kanuni yükümlülük</td>
                            </tr>
                            <tr class="border-b border-slate-200 dark:border-white/10">
                                <td class="p-2">Avukatlar/Danışmanlar</td>
                                <td class="p-2">Hukuki süreçler</td>
                                <td class="p-2">Meşru menfaat</td>
                            </tr>
                        </tbody>
                    </table>
                    
                    <h3>5.2. Yurt Dışı Aktarım</h3>
                    <p>Aşağıdaki durumlarda kişisel verileriniz yurt dışına aktarılabilir:</p>
                    <ul>
                        <li><strong>Bulut Hizmetleri:</strong> AWS, Google Cloud (ABD/AB) - Standart Sözleşme Maddeleri ile</li>
                        <li><strong>Analitik:</strong> Google Analytics, Mixpanel - Anonim/toplu veri</li>
                        <li><strong>Uluslararası Pazaryerleri:</strong> Amazon (hizmet gerekliliği)</li>
                    </ul>
                    <p>Yurt dışı aktarımlarda KVKK md. 9 kapsamında gerekli güvenceler sağlanmaktadır.</p>
                `
            },
            {
                title: 'Veri Saklama Süreleri',
                content: `
                    <table class="w-full text-sm">
                        <thead>
                            <tr class="bg-slate-100 dark:bg-white/10">
                                <th class="p-3 text-left">Veri Türü</th>
                                <th class="p-3 text-left">Saklama Süresi</th>
                                <th class="p-3 text-left">Yasal Dayanak</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr class="border-b border-slate-200 dark:border-white/10">
                                <td class="p-3">Üyelik Bilgileri</td>
                                <td class="p-3">Üyelik + 10 yıl</td>
                                <td class="p-3">Borçlar Kanunu md. 146</td>
                            </tr>
                            <tr class="border-b border-slate-200 dark:border-white/10">
                                <td class="p-3">Fatura ve Mali Kayıtlar</td>
                                <td class="p-3">10 yıl</td>
                                <td class="p-3">VUK md. 253</td>
                            </tr>
                            <tr class="border-b border-slate-200 dark:border-white/10">
                                <td class="p-3">Traffic Log Kayıtları</td>
                                <td class="p-3">2 yıl</td>
                                <td class="p-3">5651 sayılı Kanun</td>
                            </tr>
                            <tr class="border-b border-slate-200 dark:border-white/10">
                                <td class="p-3">Ticari İletişim İzinleri</td>
                                <td class="p-3">İzin + 3 yıl</td>
                                <td class="p-3">E-Ticaret Yönetmeliği</td>
                            </tr>
                            <tr class="border-b border-slate-200 dark:border-white/10">
                                <td class="p-3">Müşteri Hizmetleri Kayıtları</td>
                                <td class="p-3">3 yıl</td>
                                <td class="p-3">İspat yükümlülüğü</td>
                            </tr>
                            <tr class="border-b border-slate-200 dark:border-white/10">
                                <td class="p-3">Pazarlama Verileri</td>
                                <td class="p-3">İzin geri alınana kadar</td>
                                <td class="p-3">Açık rıza</td>
                            </tr>
                        </tbody>
                    </table>
                    <p class="mt-4">Saklama süreleri sona erdiğinde veriler KVKK md. 7 kapsamında silinir, yok edilir veya anonim hale getirilir.</p>
                `
            },
            {
                title: 'İlgili Kişinin Hakları',
                content: `
                    <p>KVKK'nın 11. maddesi kapsamında aşağıdaki haklara sahipsiniz:</p>
                    
                    <div class="grid gap-3 mt-4">
                        <div class="bg-slate-50 dark:bg-white/5 p-4 rounded-xl">
                            <h4 class="font-semibold">a) Bilgi Edinme Hakkı</h4>
                            <p class="text-sm mt-1">Kişisel verilerinizin işlenip işlenmediğini öğrenme, işlenmişse buna ilişkin bilgi talep etme</p>
                        </div>
                        <div class="bg-slate-50 dark:bg-white/5 p-4 rounded-xl">
                            <h4 class="font-semibold">b) Amaç Öğrenme Hakkı</h4>
                            <p class="text-sm mt-1">Kişisel verilerinizin işlenme amacını ve bunların amacına uygun kullanılıp kullanılmadığını öğrenme</p>
                        </div>
                        <div class="bg-slate-50 dark:bg-white/5 p-4 rounded-xl">
                            <h4 class="font-semibold">c) Aktarım Bilgisi Hakkı</h4>
                            <p class="text-sm mt-1">Yurt içinde veya yurt dışında kişisel verilerin aktarıldığı üçüncü kişileri bilme</p>
                        </div>
                        <div class="bg-slate-50 dark:bg-white/5 p-4 rounded-xl">
                            <h4 class="font-semibold">d) Düzeltme Hakkı</h4>
                            <p class="text-sm mt-1">Kişisel verilerin eksik veya yanlış işlenmiş olması hâlinde bunların düzeltilmesini isteme</p>
                        </div>
                        <div class="bg-slate-50 dark:bg-white/5 p-4 rounded-xl">
                            <h4 class="font-semibold">e) Silme/Yok Etme Hakkı</h4>
                            <p class="text-sm mt-1">KVKK md. 7'de öngörülen şartlar çerçevesinde kişisel verilerin silinmesini veya yok edilmesini isteme</p>
                        </div>
                        <div class="bg-slate-50 dark:bg-white/5 p-4 rounded-xl">
                            <h4 class="font-semibold">f) Bildirim Hakkı</h4>
                            <p class="text-sm mt-1">Düzeltme, silme veya yok etme işlemlerinin, kişisel verilerin aktarıldığı üçüncü kişilere bildirilmesini isteme</p>
                        </div>
                        <div class="bg-slate-50 dark:bg-white/5 p-4 rounded-xl">
                            <h4 class="font-semibold">g) İtiraz Hakkı</h4>
                            <p class="text-sm mt-1">İşlenen verilerin münhasıran otomatik sistemler vasıtasıyla analiz edilmesi suretiyle kişinin kendisi aleyhine bir sonucun ortaya çıkmasına itiraz etme</p>
                        </div>
                        <div class="bg-slate-50 dark:bg-white/5 p-4 rounded-xl">
                            <h4 class="font-semibold">h) Tazminat Hakkı</h4>
                            <p class="text-sm mt-1">Kişisel verilerin kanuna aykırı olarak işlenmesi sebebiyle zarara uğraması hâlinde zararın giderilmesini talep etme</p>
                        </div>
                    </div>
                `
            },
            {
                title: 'Başvuru Yöntemleri',
                content: `
                    <p>Haklarınızı kullanmak için aşağıdaki yöntemlerle başvurabilirsiniz:</p>
                    
                    <h3>8.1. Yazılı Başvuru</h3>
                    <p>Kimlik teyidinizi içeren dilekçenizi aşağıdaki adrese iadeli taahhütlü posta ile gönderebilirsiniz:</p>
                    <div class="bg-slate-50 dark:bg-white/5 p-4 rounded-xl my-3">
                        <p>Pazaryonetimi Teknoloji A.Ş.</p>
                        <p>Maslak Mah. Büyükdere Cad. No:255 Nurol Plaza K:5</p>
                        <p>34485 Sarıyer/İstanbul</p>
                    </div>
                    
                    <h3>8.2. E-posta Başvurusu</h3>
                    <p>Kayıtlı elektronik posta adresinizden:</p>
                    <div class="bg-slate-50 dark:bg-white/5 p-4 rounded-xl my-3">
                        <p>E-posta: kvkk@pazaryonetimi.com</p>
                        <p>KEP: pazaryonetimi@hs01.kep.tr</p>
                    </div>
                    
                    <h3>8.3. Platform Üzerinden</h3>
                    <p>Hesabınıza giriş yaparak:</p>
                    <ul>
                        <li>Hesap Ayarları > Gizlilik > KVKK Başvurusu</li>
                        <li>Otomatik kimlik doğrulama ile hızlı işlem</li>
                    </ul>
                    
                    <h3>8.4. Başvuru Formu</h3>
                    <p>İlgili Kişi Başvuru Formu'nu doldurarak yukarıdaki kanallardan iletebilirsiniz.</p>
                    
                    <p class="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800 mt-4">
                        <strong>Not:</strong> Başvurularınız 30 gün içinde ücretsiz olarak sonuçlandırılacaktır. İşlemin ayrıca bir maliyet gerektirmesi hâlinde, Kurul tarafından belirlenen tarifedeki ücret alınabilir.
                    </p>
                `
            },
            {
                title: 'Kişisel Verileri Koruma Kurulu\'na Şikayet',
                content: `
                    <p>Başvurunuzun reddedilmesi, verilen cevabın yetersiz bulunması veya 30 gün içinde cevap verilmemesi hallerinde, cevabı öğrendiğiniz tarihten itibaren 30 gün ve her halde başvuru tarihinden itibaren 60 gün içinde Kişisel Verileri Koruma Kurulu'na şikayette bulunabilirsiniz.</p>
                    
                    <div class="bg-slate-50 dark:bg-white/5 p-4 rounded-xl mt-4">
                        <p><strong>Kişisel Verileri Koruma Kurumu</strong></p>
                        <p>Nasuh Akar Mahallesi 1407. Sokak No:4, 06520 Çankaya/Ankara</p>
                        <p>Web: <a href="https://www.kvkk.gov.tr" target="_blank">www.kvkk.gov.tr</a></p>
                    </div>
                `
            },
            {
                title: 'Veri Güvenliği Tedbirleri',
                content: `
                    <p>Kişisel verilerinizin güvenliği için KVKK md. 12 kapsamında gerekli teknik ve idari tedbirler alınmaktadır:</p>
                    
                    <h3>10.1. Teknik Tedbirler</h3>
                    <ul>
                        <li>SSL/TLS ile şifreli veri iletimi</li>
                        <li>AES-256 ile veri şifreleme</li>
                        <li>Güvenlik duvarı ve saldırı tespit sistemleri</li>
                        <li>Düzenli güvenlik taramaları ve penetrasyon testleri</li>
                        <li>Erişim kontrol sistemleri ve yetkilendirme</li>
                        <li>Yedekleme ve felaket kurtarma sistemleri</li>
                    </ul>
                    
                    <h3>10.2. İdari Tedbirler</h3>
                    <ul>
                        <li>Kişisel veri işleme envanteri</li>
                        <li>Veri işleme sözleşmeleri</li>
                        <li>Çalışan gizlilik taahhütnameleri</li>
                        <li>Düzenli eğitim programları</li>
                        <li>Erişim yetki matrisi</li>
                        <li>Veri ihlali müdahale prosedürleri</li>
                    </ul>
                `
            },
            {
                title: 'Değişiklikler',
                content: `
                    <p>Bu Aydınlatma Metni, yasal düzenlemeler veya veri işleme faaliyetlerimizdeki değişiklikler doğrultusunda güncellenebilir. Önemli değişiklikler e-posta ile bildirilecek ve bu sayfada yayınlanacaktır.</p>
                    <p>Son güncelleme tarihi sayfanın üst kısmında belirtilmiştir.</p>
                `
            }
        ]
    },

    'satis-sozlesmesi': {
        title: 'Mesafeli Satış Sözleşmesi',
        updated: '1 Şubat 2026',
        summary: '6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği kapsamında düzenlenen Mesafeli Satış Sözleşmesi metnidir.',
        sections: [
            {
                title: 'Taraflar',
                content: `
                    <h3>1.1. Satıcı (Hizmet Sağlayıcı)</h3>
                    <div class="bg-slate-50 dark:bg-white/5 p-4 rounded-xl my-4">
                        <p><strong>Unvan:</strong> Pazaryonetimi Teknoloji Anonim Şirketi</p>
                        <p><strong>Adres:</strong> Maslak Mahallesi, Büyükdere Caddesi No:255, Nurol Plaza Kat:5, 34485 Sarıyer/İstanbul</p>
                        <p><strong>Telefon:</strong> 0850 840 26 26</p>
                        <p><strong>E-posta:</strong> destek@pazaryonetimi.com</p>
                        <p><strong>Mersis No:</strong> 0123456789012345</p>
                        <p><strong>Vergi Dairesi/No:</strong> Maslak V.D. / 1234567890</p>
                    </div>
                    
                    <h3>1.2. Alıcı (Müşteri)</h3>
                    <p>İşbu sözleşmeyi onaylayan ve sipariş veren gerçek veya tüzel kişi. Alıcı bilgileri sipariş sırasında alınmaktadır.</p>
                `
            },
            {
                title: 'Sözleşmenin Konusu',
                content: `
                    <p>İşbu Mesafeli Satış Sözleşmesi'nin konusu, Alıcı'nın Satıcı'ya ait pazaryonetimi.com internet sitesinden elektronik ortamda sipariş verdiği aşağıda nitelikleri ve satış fiyatı belirtilen hizmetin satışı ve teslimi ile ilgili olarak 6502 sayılı Tüketicinin Korunması Hakkındaki Kanun ve Mesafeli Sözleşmeler Yönetmeliği hükümleri gereğince tarafların hak ve yükümlülüklerinin belirlenmesidir.</p>
                    
                    <p>Satışa konu hizmetler:</p>
                    <ul>
                        <li>E-ticaret yönetim platformu abonelik hizmetleri</li>
                        <li>Pazaryeri entegrasyon hizmetleri</li>
                        <li>Stok, sipariş ve fiyat yönetimi hizmetleri</li>
                        <li>Raporlama ve analitik hizmetleri</li>
                        <li>Yapay zeka destekli optimizasyon hizmetleri</li>
                        <li>Teknik destek ve danışmanlık hizmetleri</li>
                    </ul>
                `
            },
            {
                title: 'Sözleşme Tarihi ve Teslimat',
                content: `
                    <h3>3.1. Sözleşme Tarihi</h3>
                    <p>İşbu sözleşme, Alıcı tarafından elektronik ortamda onaylandığı tarihte yürürlüğe girer.</p>
                    
                    <h3>3.2. Hizmet Teslimatı</h3>
                    <ul>
                        <li>Dijital hizmetler, ödemenin onaylanmasının ardından derhal aktif hale getirilir</li>
                        <li>Hesap aktivasyonu ortalama 15 dakika içinde tamamlanır</li>
                        <li>Pazaryeri entegrasyonları, pazaryeri onay süreçlerine bağlı olarak 1-7 iş günü içinde tamamlanır</li>
                        <li>Teknik destek 7/24 canlı destek ve e-posta kanalları üzerinden sağlanır</li>
                    </ul>
                    
                    <h3>3.3. Teslimat Şekli</h3>
                    <p>Hizmet tamamen dijital ortamda sunulur. Fiziksel teslimat söz konusu değildir. Alıcı, hizmete pazaryonetimi.com üzerinden kullanıcı hesabı ile erişir.</p>
                `
            },
            {
                title: 'Hizmet Bilgileri ve Fiyatlandırma',
                content: `
                    <h3>4.1. Hizmet Paketleri</h3>
                    <p>Satıcı tarafından sunulan güncel paketler ve fiyatlar pazaryonetimi.com/fiyatlandirma sayfasında yayınlanmaktadır. Sipariş anındaki fiyat geçerlidir.</p>
                    
                    <h3>4.2. Fiyat ve Ödeme</h3>
                    <ul>
                        <li>Tüm fiyatlar Türk Lirası (TL) cinsinden ve KDV hariç olarak gösterilmektedir</li>
                        <li>%20 KDV satış fiyatına eklenir</li>
                        <li>Ödeme, kredi kartı veya havale/EFT yoluyla yapılabilir</li>
                        <li>Abonelik ödemeleri aylık veya yıllık olarak tahsil edilir</li>
                        <li>Yıllık ödemelerde %20 indirim uygulanır</li>
                    </ul>
                    
                    <h3>4.3. Fatura</h3>
                    <p>Fatura, her ödeme döneminin başında elektronik olarak düzenlenir ve kayıtlı e-posta adresine gönderilir. E-fatura mükelleflerine e-fatura, diğerlerine e-arşiv fatura düzenlenir.</p>
                `
            },
            {
                title: 'Cayma Hakkı',
                content: `
                    <h3>5.1. Cayma Hakkının Kullanımı</h3>
                    <p>Alıcı, hizmet sözleşmesinin kurulduğu tarihten itibaren 14 (ondört) gün içinde herhangi bir gerekçe göstermeksizin ve cezai şart ödemeksizin sözleşmeden cayma hakkına sahiptir.</p>
                    
                    <h3>5.2. Cayma Hakkının Kullanılamayacağı Durumlar</h3>
                    <p>Mesafeli Sözleşmeler Yönetmeliği'nin 15. maddesi gereğince, aşağıdaki hallerde cayma hakkı kullanılamaz:</p>
                    <ul>
                        <li>Alıcının onayı ile cayma hakkı süresi içinde ifasına başlanan hizmetler</li>
                        <li>Elektronik ortamda anında ifa edilen hizmetler</li>
                        <li>Cayma hakkı süresi içinde tamamen ifa edilen hizmetler</li>
                    </ul>
                    
                    <p class="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-xl border border-amber-200 dark:border-amber-800 mt-4">
                        <strong>Önemli:</strong> Alıcı, hizmetin derhal başlatılmasını talep ettiğinde ve onayladığında, cayma hakkından feragat etmiş sayılır. Sipariş sürecinde bu durum açıkça belirtilir ve onay alınır.
                    </p>
                    
                    <h3>5.3. Cayma Bildirimi</h3>
                    <p>Cayma hakkının kullanılması için 14 günlük süre içinde Satıcı'ya yazılı bildirimde bulunulması yeterlidir:</p>
                    <ul>
                        <li>E-posta: cayma@pazaryonetimi.com</li>
                        <li>Platform: Hesap > Abonelik > Cayma Talebi</li>
                        <li>Posta: Satıcı adresine iadeli taahhütlü mektup</li>
                    </ul>
                    
                    <h3>5.4. Cayma Halinde İade</h3>
                    <p>Cayma hakkının kullanılması halinde, ödenen bedel 14 gün içinde Alıcı'nın ödeme yaptığı yöntemle iade edilir. Kullanılan hizmet süresine tekabül eden bedel orantılı olarak düşülebilir.</p>
                `
            },
            {
                title: 'Alıcının Hak ve Yükümlülükleri',
                content: `
                    <h3>6.1. Alıcının Hakları</h3>
                    <ul>
                        <li>Seçilen pakete dahil tüm özellikleri kullanma hakkı</li>
                        <li>7/24 teknik destek alma hakkı</li>
                        <li>Verilerine erişim ve indirme hakkı</li>
                        <li>İstediği zaman aboneliğini iptal etme hakkı</li>
                        <li>Şikayette bulunma ve itiraz hakkı</li>
                    </ul>
                    
                    <h3>6.2. Alıcının Yükümlülükleri</h3>
                    <ul>
                        <li>Abonelik ücretlerini zamanında ödemek</li>
                        <li>Doğru ve güncel bilgi sağlamak</li>
                        <li>Kullanım şartlarına uymak</li>
                        <li>Hesap güvenliğini sağlamak</li>
                        <li>Yasalara ve pazaryeri kurallarına uygun hareket etmek</li>
                        <li>Platformu üçüncü kişilerle paylaşmamak</li>
                    </ul>
                `
            },
            {
                title: 'Satıcının Hak ve Yükümlülükleri',
                content: `
                    <h3>7.1. Satıcının Hakları</h3>
                    <ul>
                        <li>Ödeme yapılmaması halinde hizmeti askıya alma</li>
                        <li>Kullanım şartlarının ihlali halinde hesabı kapatma</li>
                        <li>Hizmet özelliklerini ve fiyatlarını güncelleme</li>
                        <li>Teknik bakım için hizmeti geçici olarak durdurma</li>
                    </ul>
                    
                    <h3>7.2. Satıcının Yükümlülükleri</h3>
                    <ul>
                        <li>Hizmeti sözleşme şartlarına uygun sunmak</li>
                        <li>Teknik destek sağlamak</li>
                        <li>Alıcı verilerini korumak</li>
                        <li>Şikayetleri değerlendirmek ve yanıtlamak</li>
                        <li>Planlı bakımları önceden bildirmek</li>
                        <li>Hizmet kalitesini sürdürmek</li>
                    </ul>
                `
            },
            {
                title: 'Garanti ve Hizmet Seviyesi',
                content: `
                    <h3>8.1. Hizmet Seviyesi Taahhüdü (SLA)</h3>
                    <ul>
                        <li><strong>Uptime Garantisi:</strong> %99.9 aylık erişilebilirlik</li>
                        <li><strong>Destek Yanıt Süresi:</strong> Kritik sorunlar için maksimum 1 saat, normal talepler için 24 saat</li>
                        <li><strong>Veri Yedekleme:</strong> Günlük otomatik yedekleme</li>
                    </ul>
                    
                    <h3>8.2. SLA İhlali</h3>
                    <p>Aylık uptime'ın %99.9'un altına düşmesi halinde:</p>
                    <ul>
                        <li>%99.0 - %99.9 arası: Aylık ücretin %10'u kredi</li>
                        <li>%95.0 - %99.0 arası: Aylık ücretin %25'i kredi</li>
                        <li>%95.0 altı: Aylık ücretin %50'si kredi</li>
                    </ul>
                    
                    <h3>8.3. İstisnalar</h3>
                    <p>Aşağıdaki durumlar SLA kapsamı dışındadır:</p>
                    <ul>
                        <li>Planlı bakım süreleri (önceden bildirilmiş)</li>
                        <li>Mücbir sebepler (doğal afet, savaş, pandemi vb.)</li>
                        <li>Üçüncü taraf hizmet kesintileri</li>
                        <li>Kullanıcı kaynaklı sorunlar</li>
                    </ul>
                `
            },
            {
                title: 'Abonelik İptali ve Sonlandırma',
                content: `
                    <h3>9.1. İptal Prosedürü</h3>
                    <p>Alıcı, aboneliğini istediği zaman iptal edebilir:</p>
                    <ul>
                        <li>Hesap Ayarları > Abonelik > İptal Et</li>
                        <li>E-posta: iptal@pazaryonetimi.com</li>
                        <li>Müşteri hizmetleri: 0850 840 26 26</li>
                    </ul>
                    
                    <h3>9.2. İptal Sonrası</h3>
                    <ul>
                        <li>İptal, mevcut fatura döneminin sonunda geçerli olur</li>
                        <li>Kullanılmayan süre için kısmi iade yapılmaz (aylık aboneliklerde)</li>
                        <li>Yıllık aboneliklerde, ilk 14 gün içinde tam iade, sonrasında kısmi iade</li>
                        <li>Verileriniz iptalden 30 gün sonra silinir (talep üzerine erken silinebilir)</li>
                        <li>İptal öncesi verilerinizi dışa aktarabilirsiniz</li>
                    </ul>
                    
                    <h3>9.3. Satıcı Tarafından Sonlandırma</h3>
                    <p>Satıcı, aşağıdaki durumlarda sözleşmeyi tek taraflı sonlandırabilir:</p>
                    <ul>
                        <li>Ödeme yükümlülüklerinin 30 gün içinde yerine getirilmemesi</li>
                        <li>Kullanım şartlarının ağır ihlali</li>
                        <li>Yasadışı faaliyetler</li>
                    </ul>
                `
            },
            {
                title: 'Kişisel Verilerin Korunması',
                content: `
                    <p>Alıcı'nın kişisel verileri, 6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında işlenmektedir. Detaylı bilgi için:</p>
                    <ul>
                        <li><a href="/kurumsal/gizlilik-politikasi">Gizlilik Politikası</a></li>
                        <li><a href="/kurumsal/kvkk">KVKK Aydınlatma Metni</a></li>
                    </ul>
                `
            },
            {
                title: 'Uyuşmazlık Çözümü',
                content: `
                    <h3>11.1. Şikayet ve İtiraz</h3>
                    <p>Hizmetle ilgili şikayet ve itirazlarınızı aşağıdaki kanallara iletebilirsiniz:</p>
                    <ul>
                        <li>E-posta: sikayet@pazaryonetimi.com</li>
                        <li>Telefon: 0850 840 26 26</li>
                        <li>Platform: Hesap > Destek > Şikayet</li>
                    </ul>
                    <p>Şikayetler 14 gün içinde değerlendirilir ve sonuçlandırılır.</p>
                    
                    <h3>11.2. Tüketici Hakları</h3>
                    <p>Alıcı, 6502 sayılı Kanun kapsamında:</p>
                    <ul>
                        <li>Tüketici Hakem Heyetine başvurabilir (belirli tutarlara kadar)</li>
                        <li>Tüketici Mahkemesinde dava açabilir</li>
                    </ul>
                    
                    <h3>11.3. Yetkili Mahkeme</h3>
                    <p>İşbu sözleşmeden doğacak uyuşmazlıklarda Alıcı'nın yerleşim yerindeki veya İstanbul (Çağlayan) Tüketici Hakem Heyetleri ve Tüketici Mahkemeleri yetkilidir.</p>
                `
            },
            {
                title: 'Diğer Hükümler',
                content: `
                    <ul>
                        <li><strong>Delil Sözleşmesi:</strong> Taraflar, işbu sözleşmeden doğabilecek ihtilaflarda Satıcı'nın resmi defter ve ticari kayıtları ile bilgisayar kayıtlarının 6100 sayılı HMK md. 193 kapsamında kesin delil niteliğinde olacağını kabul eder.</li>
                        <li><strong>Bölünebilirlik:</strong> Sözleşmenin herhangi bir hükmünün geçersiz sayılması, diğer hükümlerin geçerliliğini etkilemez.</li>
                        <li><strong>Devir:</strong> Alıcı, bu sözleşmeden doğan hak ve yükümlülüklerini Satıcı'nın yazılı izni olmaksızın devredemez.</li>
                        <li><strong>Mücbir Sebep:</strong> Tarafların kontrolü dışındaki olaylardan kaynaklanan aksaklıklardan sorumluluk doğmaz.</li>
                        <li><strong>Tebligat:</strong> Taraflar, kayıtlı adreslerine yapılan tebligatları geçerli kabul eder.</li>
                    </ul>
                `
            },
            {
                title: 'Yürürlük',
                content: `
                    <p>İşbu Mesafeli Satış Sözleşmesi, Alıcı tarafından elektronik ortamda onaylanmakla yürürlüğe girer. Alıcı, sözleşmenin tüm maddelerini okuduğunu, anladığını ve kabul ettiğini beyan eder.</p>
                    
                    <p class="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl border border-green-200 dark:border-green-800 mt-4">
                        <strong>Onay:</strong> "Ödemeyi Tamamla" butonuna tıklamakla bu sözleşmeyi kabul etmiş sayılırsınız.
                    </p>
                `
            }
        ]
    },

    'hizmet-politikalari': {
        title: 'Hizmet Politikaları',
        updated: '1 Şubat 2026',
        summary: 'Pazaryonetimi platform hizmetlerinin kullanımına ilişkin politikalar, standartlar ve beklentiler hakkında detaylı bilgi.',
        sections: [
            {
                title: 'Hizmet Tanımları',
                content: `
                    <p>Pazaryonetimi, e-ticaret satıcılarına kapsamlı bir yönetim platformu sunmaktadır:</p>
                    
                    <h3>1.1. Temel Hizmetler</h3>
                    <ul>
                        <li><strong>Pazaryeri Entegrasyonu:</strong> Trendyol, Hepsiburada, Amazon, N11, Çiçeksepeti ve diğer pazaryerlerine tek panelden erişim</li>
                        <li><strong>Ürün Yönetimi:</strong> Merkezi ürün kataloğu, toplu düzenleme, varyant yönetimi</li>
                        <li><strong>Stok Yönetimi:</strong> Gerçek zamanlı stok senkronizasyonu, otomatik stok düşümü, kritik stok uyarıları</li>
                        <li><strong>Sipariş Yönetimi:</strong> Tüm kanallardan siparişlerin tek ekranda takibi, otomatik faturalama</li>
                        <li><strong>Fiyat Yönetimi:</strong> Dinamik fiyatlandırma, kampanya yönetimi, rakip takibi</li>
                    </ul>
                    
                    <h3>1.2. Gelişmiş Hizmetler</h3>
                    <ul>
                        <li><strong>Raporlama:</strong> Satış analizleri, performans raporları, özel rapor oluşturma</li>
                        <li><strong>Yapay Zeka:</strong> Fiyat önerileri, talep tahmini, stok optimizasyonu</li>
                        <li><strong>Otomasyon:</strong> Kural tabanlı iş akışları, otomatik yanıtlar</li>
                        <li><strong>API Erişimi:</strong> Geliştiriciler için REST API</li>
                    </ul>
                `
            },
            {
                title: 'Hizmet Seviyeleri (Paketler)',
                content: `
                    <h3>2.1. Başlangıç Paketi</h3>
                    <ul>
                        <li>2 pazaryeri entegrasyonu</li>
                        <li>1.000 ürün limiti</li>
                        <li>500 sipariş/ay</li>
                        <li>Temel raporlama</li>
                        <li>E-posta desteği</li>
                    </ul>
                    
                    <h3>2.2. Profesyonel Paket</h3>
                    <ul>
                        <li>5 pazaryeri entegrasyonu</li>
                        <li>10.000 ürün limiti</li>
                        <li>5.000 sipariş/ay</li>
                        <li>Gelişmiş raporlama</li>
                        <li>Yapay zeka önerileri</li>
                        <li>Canlı destek</li>
                        <li>API erişimi</li>
                    </ul>
                    
                    <h3>2.3. Kurumsal Paket</h3>
                    <ul>
                        <li>Sınırsız pazaryeri</li>
                        <li>Sınırsız ürün</li>
                        <li>Sınırsız sipariş</li>
                        <li>Özel raporlar</li>
                        <li>Tam AI erişimi</li>
                        <li>Özel hesap yöneticisi</li>
                        <li>SLA garantisi</li>
                        <li>Öncelikli destek</li>
                    </ul>
                    
                    <p class="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800 mt-4">
                        <strong>Not:</strong> Güncel fiyatlar ve paket detayları için <a href="/fiyatlandirma">fiyatlandırma sayfamızı</a> ziyaret ediniz.
                    </p>
                `
            },
            {
                title: 'Teknik Destek Politikası',
                content: `
                    <h3>3.1. Destek Kanalları</h3>
                    <table class="w-full text-sm">
                        <thead>
                            <tr class="bg-slate-100 dark:bg-white/10">
                                <th class="p-3 text-left">Kanal</th>
                                <th class="p-3 text-left">Erişim</th>
                                <th class="p-3 text-left">Yanıt Süresi</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr class="border-b border-slate-200 dark:border-white/10">
                                <td class="p-3">Canlı Destek</td>
                                <td class="p-3">7/24</td>
                                <td class="p-3">Anında</td>
                            </tr>
                            <tr class="border-b border-slate-200 dark:border-white/10">
                                <td class="p-3">E-posta</td>
                                <td class="p-3">7/24</td>
                                <td class="p-3">4 saat</td>
                            </tr>
                            <tr class="border-b border-slate-200 dark:border-white/10">
                                <td class="p-3">Telefon</td>
                                <td class="p-3">09:00-22:00</td>
                                <td class="p-3">Anında</td>
                            </tr>
                            <tr class="border-b border-slate-200 dark:border-white/10">
                                <td class="p-3">Bilgi Bankası</td>
                                <td class="p-3">7/24</td>
                                <td class="p-3">Self-servis</td>
                            </tr>
                        </tbody>
                    </table>
                    
                    <h3 class="mt-6">3.2. Öncelik Seviyeleri</h3>
                    <ul>
                        <li><strong>Kritik (P1):</strong> Platform erişilemez, veri kaybı riski - 1 saat</li>
                        <li><strong>Yüksek (P2):</strong> Önemli özellik çalışmıyor - 4 saat</li>
                        <li><strong>Orta (P3):</strong> Özellik kısmen çalışıyor - 24 saat</li>
                        <li><strong>Düşük (P4):</strong> Genel sorular, öneriler - 48 saat</li>
                    </ul>
                    
                    <h3>3.3. Destek Kapsamı</h3>
                    <p>Desteklenen konular:</p>
                    <ul>
                        <li>Platform kullanımı ve özellikler</li>
                        <li>Entegrasyon sorunları</li>
                        <li>Hesap ve faturalandırma</li>
                        <li>Teknik hatalar</li>
                        <li>API kullanımı</li>
                    </ul>
                    
                    <p>Destek kapsamı dışı:</p>
                    <ul>
                        <li>Pazaryeri politikaları ve kararları</li>
                        <li>Üçüncü taraf yazılımlar</li>
                        <li>Özel yazılım geliştirme</li>
                        <li>İş danışmanlığı</li>
                    </ul>
                `
            },
            {
                title: 'Veri Yönetimi Politikası',
                content: `
                    <h3>4.1. Veri Sahipliği</h3>
                    <p>Platformda oluşturduğunuz ve yüklediğiniz tüm veriler (ürünler, siparişler, müşteri bilgileri vb.) size aittir. Pazaryonetimi, bu veriler üzerinde yalnızca hizmet sunumu için gerekli işlem yetkisine sahiptir.</p>
                    
                    <h3>4.2. Veri Yedekleme</h3>
                    <ul>
                        <li>Günlük otomatik yedekleme</li>
                        <li>30 günlük yedek saklama</li>
                        <li>Coğrafi olarak dağıtılmış yedekleme</li>
                        <li>Talep üzerine veri geri yükleme</li>
                    </ul>
                    
                    <h3>4.3. Veri Dışa Aktarma</h3>
                    <p>Verilerinizi istediğiniz zaman dışa aktarabilirsiniz:</p>
                    <ul>
                        <li>CSV, Excel, JSON formatları</li>
                        <li>API üzerinden toplu veri çekme</li>
                        <li>Hesap kapatma öncesi tam veri paketi</li>
                    </ul>
                    
                    <h3>4.4. Veri Saklama</h3>
                    <ul>
                        <li>Aktif hesaplar: Süresiz</li>
                        <li>İptal edilen hesaplar: 30 gün sonra silme</li>
                        <li>Yasal saklama gereklilikleri ayrıca geçerlidir</li>
                    </ul>
                `
            },
            {
                title: 'Güvenlik Politikası',
                content: `
                    <h3>5.1. Platform Güvenliği</h3>
                    <ul>
                        <li>256-bit SSL/TLS şifreleme</li>
                        <li>ISO 27001 uyumlu altyapı</li>
                        <li>DDoS koruması</li>
                        <li>Web Application Firewall</li>
                        <li>Düzenli penetrasyon testleri</li>
                        <li>7/24 güvenlik izleme</li>
                    </ul>
                    
                    <h3>5.2. Hesap Güvenliği</h3>
                    <ul>
                        <li>İki faktörlü kimlik doğrulama (2FA)</li>
                        <li>IP kısıtlama seçeneği</li>
                        <li>Oturum yönetimi ve zaman aşımı</li>
                        <li>Şüpheli aktivite bildirimleri</li>
                        <li>Güvenli şifre politikası</li>
                    </ul>
                    
                    <h3>5.3. Uyumluluk</h3>
                    <ul>
                        <li>KVKK (6698 sayılı Kanun)</li>
                        <li>GDPR (AB kullanıcıları için)</li>
                        <li>PCI-DSS (ödeme güvenliği)</li>
                        <li>SOC 2 Type II</li>
                    </ul>
                `
            },
            {
                title: 'Kullanım Limitleri',
                content: `
                    <h3>6.1. API Limitleri</h3>
                    <table class="w-full text-sm">
                        <thead>
                            <tr class="bg-slate-100 dark:bg-white/10">
                                <th class="p-3 text-left">Paket</th>
                                <th class="p-3 text-left">Günlük Limit</th>
                                <th class="p-3 text-left">Dakikalık Limit</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr class="border-b border-slate-200 dark:border-white/10">
                                <td class="p-3">Başlangıç</td>
                                <td class="p-3">10.000</td>
                                <td class="p-3">100</td>
                            </tr>
                            <tr class="border-b border-slate-200 dark:border-white/10">
                                <td class="p-3">Profesyonel</td>
                                <td class="p-3">100.000</td>
                                <td class="p-3">500</td>
                            </tr>
                            <tr class="border-b border-slate-200 dark:border-white/10">
                                <td class="p-3">Kurumsal</td>
                                <td class="p-3">Özel</td>
                                <td class="p-3">Özel</td>
                            </tr>
                        </tbody>
                    </table>
                    
                    <h3 class="mt-6">6.2. Depolama Limitleri</h3>
                    <ul>
                        <li>Başlangıç: 5 GB</li>
                        <li>Profesyonel: 50 GB</li>
                        <li>Kurumsal: 500 GB (genişletilebilir)</li>
                    </ul>
                    
                    <h3>6.3. Limit Aşımı</h3>
                    <p>Limitlerinize yaklaştığınızda e-posta bildirimi alırsınız. Limit aşımında:</p>
                    <ul>
                        <li>Geçici yavaşlama uygulanabilir</li>
                        <li>Ek kapasite satın alınabilir</li>
                        <li>Üst pakete geçiş yapılabilir</li>
                    </ul>
                `
            },
            {
                title: 'Bakım ve Güncellemeler',
                content: `
                    <h3>7.1. Planlı Bakımlar</h3>
                    <ul>
                        <li>Haftalık bakım penceresi: Pazar 03:00-05:00 (İstanbul)</li>
                        <li>En az 72 saat önceden e-posta bildirimi</li>
                        <li>Bakım sırasında minimal kesinti hedefi</li>
                        <li>Acil bakımlar hariç</li>
                    </ul>
                    
                    <h3>7.2. Platform Güncellemeleri</h3>
                    <ul>
                        <li>Yeni özellikler düzenli olarak eklenir</li>
                        <li>Büyük güncellemeler önceden duyurulur</li>
                        <li>Değişiklik notları yayınlanır</li>
                        <li>Beta özellikleri isteğe bağlı test edilebilir</li>
                    </ul>
                    
                    <h3>7.3. API Sürüm Politikası</h3>
                    <ul>
                        <li>Yeni API sürümleri uyumluluk bozulmadan eklenir</li>
                        <li>Eski sürümler en az 12 ay desteklenir</li>
                        <li>Kullanımdan kaldırma 6 ay önceden duyurulur</li>
                    </ul>
                `
            },
            {
                title: 'Kabul Edilebilir Kullanım',
                content: `
                    <h3>8.1. İzin Verilen Kullanımlar</h3>
                    <ul>
                        <li>Kendi e-ticaret işletmenizi yönetmek</li>
                        <li>Yasal ürün ve hizmet satışı</li>
                        <li>Pazaryeri kurallarına uygun faaliyet</li>
                        <li>API'yi dokümantasyona uygun kullanmak</li>
                    </ul>
                    
                    <h3>8.2. Yasaklanan Kullanımlar</h3>
                    <ul>
                        <li>Yasadışı ürün/hizmet satışı</li>
                        <li>Sahte, taklit veya çalıntı ürünler</li>
                        <li>Platformu kötüye kullanmak</li>
                        <li>Sistemleri manipüle etmeye çalışmak</li>
                        <li>Diğer kullanıcılara zarar vermek</li>
                        <li>Spam veya zararlı içerik</li>
                        <li>Telif hakkı ihlali</li>
                    </ul>
                    
                    <h3>8.3. İhlal Sonuçları</h3>
                    <ul>
                        <li>Uyarı (ilk ihlal)</li>
                        <li>Geçici askıya alma (tekrar ihlal)</li>
                        <li>Hesap kapatma (ciddi/sürekli ihlal)</li>
                        <li>Yasal işlem (yasadışı faaliyetler)</li>
                    </ul>
                `
            },
            {
                title: 'Sorumluluk Reddi',
                content: `
                    <h3>9.1. Hizmet Garantisi</h3>
                    <p>Platform "olduğu gibi" sunulmaktadır. Pazaryonetimi:</p>
                    <ul>
                        <li>Kesintisiz veya hatasız hizmet garanti etmez</li>
                        <li>Pazaryerlerinin kararlarından sorumlu değildir</li>
                        <li>Üçüncü taraf hizmet kesintilerinden sorumlu değildir</li>
                        <li>Kullanıcı hatalarından kaynaklanan zararlardan sorumlu değildir</li>
                    </ul>
                    
                    <h3>9.2. Sorumluluk Limiti</h3>
                    <p>Pazaryonetimi'nin toplam sorumluluğu, son 12 ayda ödenen abonelik ücretini aşamaz.</p>
                `
            },
            {
                title: 'İletişim ve Geri Bildirim',
                content: `
                    <p>Hizmet politikalarımız hakkında soru, öneri ve geri bildirimleriniz için:</p>
                    
                    <div class="bg-slate-50 dark:bg-white/5 p-4 rounded-xl">
                        <p><strong>Pazaryonetimi Teknoloji A.Ş.</strong></p>
                        <p>E-posta: destek@pazaryonetimi.com</p>
                        <p>Telefon: 0850 840 26 26</p>
                        <p>Adres: Maslak Mah. Büyükdere Cad. No:255 Nurol Plaza K:5 34485 Sarıyer/İstanbul</p>
                    </div>
                    
                    <p class="mt-4">Geri bildirimleriniz bizim için değerlidir. Hizmetlerimizi sürekli iyileştirmek için önerilerinizi bekliyoruz.</p>
                `
            }
        ]
    },

    'hakkimizda': {
        title: 'Hakkımızda',
        updated: '1 Şubat 2026',
        summary: 'Pazaryonetimi, Türkiye\'nin lider e-ticaret yönetim platformu olarak binlerce satıcıya tek panelden tüm pazaryerlerini yönetme imkanı sunuyor.',
        sections: [
            {
                title: 'Hikayemiz',
                content: `
                    <p class="text-lg leading-relaxed">Pazaryonetimi, 2020 yılında e-ticaret satıcılarının karşılaştığı karmaşık operasyonel zorlukları çözmek amacıyla kuruldu. Kurucularımız, yıllarca e-ticaret sektöründe çalışırken satıcıların birden fazla pazaryerini yönetmekte yaşadığı zorlukları bizzat deneyimledi.</p>
                    
                    <blockquote class="border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20 py-4 px-6 my-6 rounded-r-xl">
                        <p class="italic text-lg">"Her pazaryeri için ayrı panel, ayrı stok takibi, ayrı sipariş yönetimi... Bu kaos içinde verimli olmak imkansızdı. Biz bunu değiştirmek istedik."</p>
                        <cite class="block mt-2 text-sm font-semibold">— Ahmet Yılmaz, Kurucu & CEO</cite>
                    </blockquote>
                    
                    <p>İlk günden itibaren vizyonumuz netti: <strong>E-ticaret satıcılarına tek bir platform üzerinden tüm operasyonlarını yönetebilecekleri, yapay zeka destekli akıllı bir çözüm sunmak.</strong></p>
                    
                    <div class="grid md:grid-cols-3 gap-6 my-8">
                        <div class="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 rounded-2xl text-center">
                            <div class="text-4xl font-black text-blue-600 mb-2">2020</div>
                            <div class="text-sm text-slate-600 dark:text-slate-400">Kuruluş Yılı</div>
                        </div>
                        <div class="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-6 rounded-2xl text-center">
                            <div class="text-4xl font-black text-green-600 mb-2">25,000+</div>
                            <div class="text-sm text-slate-600 dark:text-slate-400">Aktif Satıcı</div>
                        </div>
                        <div class="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 p-6 rounded-2xl text-center">
                            <div class="text-4xl font-black text-purple-600 mb-2">₺50M+</div>
                            <div class="text-sm text-slate-600 dark:text-slate-400">Yatırım</div>
                        </div>
                    </div>
                `
            },
            {
                title: 'Misyonumuz',
                content: `
                    <div class="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-8 rounded-2xl my-4">
                        <h3 class="text-2xl font-bold mb-4">🎯 Misyonumuz</h3>
                        <p class="text-lg text-blue-100">E-ticaret satıcılarının operasyonel yükünü minimize ederek, işlerini büyütmeye odaklanmalarını sağlamak. Teknoloji ve yapay zeka gücünü herkes için erişilebilir kılmak.</p>
                    </div>
                    
                    <p class="mt-6">Bu misyonu gerçekleştirmek için:</p>
                    <ul>
                        <li><strong>Basitlik:</strong> Karmaşık süreçleri sezgisel arayüzlerle basitleştiriyoruz</li>
                        <li><strong>Otomasyon:</strong> Tekrarlayan görevleri otomatikleştirerek zaman kazandırıyoruz</li>
                        <li><strong>Zeka:</strong> Yapay zeka ile veri odaklı kararlar almayı kolaylaştırıyoruz</li>
                        <li><strong>Güvenilirlik:</strong> %99.9 uptime ile kesintisiz hizmet sunuyoruz</li>
                        <li><strong>Destek:</strong> 7/24 uzman ekibimizle yanınızdayız</li>
                    </ul>
                `
            },
            {
                title: 'Vizyonumuz',
                content: `
                    <div class="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-8 rounded-2xl my-4">
                        <h3 class="text-2xl font-bold mb-4">🚀 Vizyonumuz</h3>
                        <p class="text-lg text-purple-100">2030 yılına kadar Avrupa'nın lider e-ticaret yönetim platformu olmak ve 1 milyon satıcıya hizmet vermek.</p>
                    </div>
                    
                    <p class="mt-6">Bu vizyona ulaşmak için belirlediğimiz stratejik hedefler:</p>
                    <ol>
                        <li><strong>Küresel Genişleme:</strong> Türkiye'den sonra Avrupa ve Orta Doğu pazarlarına açılım</li>
                        <li><strong>Teknoloji Liderliği:</strong> Yapay zeka ve makine öğrenimi alanında öncü çözümler</li>
                        <li><strong>Ekosistem Geliştirme:</strong> Entegrasyon marketplace ve partner ağı oluşturma</li>
                        <li><strong>Sürdürülebilirlik:</strong> Karbon-nötr operasyonlar ve yeşil teknolojiler</li>
                    </ol>
                `
            },
            {
                title: 'Değerlerimiz',
                content: `
                    <div class="grid md:grid-cols-2 gap-6 my-6">
                        <div class="bg-slate-50 dark:bg-white/5 p-6 rounded-2xl border border-slate-200 dark:border-white/10">
                            <div class="text-3xl mb-3">💡</div>
                            <h4 class="font-bold text-lg mb-2">İnovasyon</h4>
                            <p class="text-sm text-slate-600 dark:text-slate-400">Sürekli öğreniyor, deneyimliyor ve sınırları zorluyoruz. Yeni teknolojileri erken benimseyerek müşterilerimize avantaj sağlıyoruz.</p>
                        </div>
                        <div class="bg-slate-50 dark:bg-white/5 p-6 rounded-2xl border border-slate-200 dark:border-white/10">
                            <div class="text-3xl mb-3">🤝</div>
                            <h4 class="font-bold text-lg mb-2">Müşteri Odaklılık</h4>
                            <p class="text-sm text-slate-600 dark:text-slate-400">Müşteri başarısı bizim başarımızdır. Her kararımızda müşterilerimizin ihtiyaçlarını önceliklendiriyoruz.</p>
                        </div>
                        <div class="bg-slate-50 dark:bg-white/5 p-6 rounded-2xl border border-slate-200 dark:border-white/10">
                            <div class="text-3xl mb-3">🎯</div>
                            <h4 class="font-bold text-lg mb-2">Şeffaflık</h4>
                            <p class="text-sm text-slate-600 dark:text-slate-400">Açık iletişim ve dürüstlük temel prensiplerimizdir. Müşterilerimiz, çalışanlarımız ve iş ortaklarımızla şeffaf ilişkiler kuruyoruz.</p>
                        </div>
                        <div class="bg-slate-50 dark:bg-white/5 p-6 rounded-2xl border border-slate-200 dark:border-white/10">
                            <div class="text-3xl mb-3">⚡</div>
                            <h4 class="font-bold text-lg mb-2">Hız</h4>
                            <p class="text-sm text-slate-600 dark:text-slate-400">Hızlı karar alır, hızlı uygular ve hızlı öğreniriz. Pazar dinamiklerine anında adapte olabilme yeteneğimiz en büyük gücümüz.</p>
                        </div>
                        <div class="bg-slate-50 dark:bg-white/5 p-6 rounded-2xl border border-slate-200 dark:border-white/10">
                            <div class="text-3xl mb-3">🌟</div>
                            <h4 class="font-bold text-lg mb-2">Mükemmellik</h4>
                            <p class="text-sm text-slate-600 dark:text-slate-400">İyi yeterli değildir, mükemmele ulaşmaya çalışıyoruz. Detaylara özen gösterir, kaliteden ödün vermeyiz.</p>
                        </div>
                        <div class="bg-slate-50 dark:bg-white/5 p-6 rounded-2xl border border-slate-200 dark:border-white/10">
                            <div class="text-3xl mb-3">🌍</div>
                            <h4 class="font-bold text-lg mb-2">Sürdürülebilirlik</h4>
                            <p class="text-sm text-slate-600 dark:text-slate-400">Çevreye ve topluma karşı sorumluluğumuzun bilincindeyiz. Karbon ayak izimizi azaltmak için aktif adımlar atıyoruz.</p>
                        </div>
                    </div>
                `
            },
            {
                title: 'Liderlik Ekibi',
                content: `
                    <p class="mb-8">Pazaryonetimi'ni kuran ve yöneten ekip, e-ticaret, teknoloji ve finans sektörlerinden derin deneyime sahip profesyonellerden oluşmaktadır.</p>
                    
                    <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div class="bg-white dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden group hover:shadow-xl transition-all">
                            <div class="aspect-square bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 flex items-center justify-center">
                                <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop" alt="Ahmet Yılmaz" class="w-full h-full object-cover" />
                            </div>
                            <div class="p-5">
                                <h4 class="font-bold text-lg">Ahmet Yılmaz</h4>
                                <p class="text-blue-600 dark:text-blue-400 text-sm font-medium">Kurucu & CEO</p>
                                <p class="text-sm text-slate-600 dark:text-slate-400 mt-2">15 yıl e-ticaret deneyimi. Daha önce Hepsiburada'da Ürün Direktörü olarak görev yaptı.</p>
                            </div>
                        </div>
                        
                        <div class="bg-white dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden group hover:shadow-xl transition-all">
                            <div class="aspect-square bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 flex items-center justify-center">
                                <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&h=300&fit=crop" alt="Zeynep Kaya" class="w-full h-full object-cover" />
                            </div>
                            <div class="p-5">
                                <h4 class="font-bold text-lg">Zeynep Kaya</h4>
                                <p class="text-purple-600 dark:text-purple-400 text-sm font-medium">Kurucu Ortak & CTO</p>
                                <p class="text-sm text-slate-600 dark:text-slate-400 mt-2">Stanford Üniversitesi CS mezunu. Google ve Amazon'da 10 yıl yazılım mühendisliği deneyimi.</p>
                            </div>
                        </div>
                        
                        <div class="bg-white dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden group hover:shadow-xl transition-all">
                            <div class="aspect-square bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 flex items-center justify-center">
                                <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop" alt="Mehmet Demir" class="w-full h-full object-cover" />
                            </div>
                            <div class="p-5">
                                <h4 class="font-bold text-lg">Mehmet Demir</h4>
                                <p class="text-green-600 dark:text-green-400 text-sm font-medium">CFO</p>
                                <p class="text-sm text-slate-600 dark:text-slate-400 mt-2">Harvard MBA. Goldman Sachs ve Sequoia Capital'de 12 yıl finans ve yatırım deneyimi.</p>
                            </div>
                        </div>
                        
                        <div class="bg-white dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden group hover:shadow-xl transition-all">
                            <div class="aspect-square bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-900/30 dark:to-red-900/30 flex items-center justify-center">
                                <img src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=300&fit=crop" alt="Ayşe Yıldız" class="w-full h-full object-cover" />
                            </div>
                            <div class="p-5">
                                <h4 class="font-bold text-lg">Ayşe Yıldız</h4>
                                <p class="text-orange-600 dark:text-orange-400 text-sm font-medium">COO</p>
                                <p class="text-sm text-slate-600 dark:text-slate-400 mt-2">McKinsey alümni. Operasyonel mükemmellik ve ölçeklendirme konusunda uzman.</p>
                            </div>
                        </div>
                        
                        <div class="bg-white dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden group hover:shadow-xl transition-all">
                            <div class="aspect-square bg-gradient-to-br from-cyan-100 to-blue-100 dark:from-cyan-900/30 dark:to-blue-900/30 flex items-center justify-center">
                                <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop" alt="Can Özkan" class="w-full h-full object-cover" />
                            </div>
                            <div class="p-5">
                                <h4 class="font-bold text-lg">Can Özkan</h4>
                                <p class="text-cyan-600 dark:text-cyan-400 text-sm font-medium">VP of Engineering</p>
                                <p class="text-sm text-slate-600 dark:text-slate-400 mt-2">ODTÜ Bilgisayar Mühendisliği. Facebook ve Spotify'da backend sistemleri geliştirdi.</p>
                            </div>
                        </div>
                        
                        <div class="bg-white dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden group hover:shadow-xl transition-all">
                            <div class="aspect-square bg-gradient-to-br from-pink-100 to-rose-100 dark:from-pink-900/30 dark:to-rose-900/30 flex items-center justify-center">
                                <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop" alt="Elif Arslan" class="w-full h-full object-cover" />
                            </div>
                            <div class="p-5">
                                <h4 class="font-bold text-lg">Elif Arslan</h4>
                                <p class="text-pink-600 dark:text-pink-400 text-sm font-medium">VP of Marketing</p>
                                <p class="text-sm text-slate-600 dark:text-slate-400 mt-2">Boğaziçi İşletme. Trendyol ve Getir'de dijital pazarlama direktörlüğü yaptı.</p>
                            </div>
                        </div>
                    </div>
                `
            },
            {
                title: 'Yolculuğumuz',
                content: `
                    <p class="mb-8">Kuruluşumuzdan bugüne kadar kat ettiğimiz yol ve önemli kilometre taşları:</p>
                    
                    <div class="relative">
                        <div class="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-600 via-purple-600 to-pink-600"></div>
                        
                        <div class="space-y-8">
                            <div class="relative pl-12">
                                <div class="absolute left-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">1</div>
                                <div class="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-2xl border border-blue-200 dark:border-blue-800">
                                    <div class="text-blue-600 dark:text-blue-400 font-bold mb-1">2020 Q1</div>
                                    <h4 class="font-bold text-lg mb-2">Kuruluş</h4>
                                    <p class="text-slate-600 dark:text-slate-400">3 kurucu ortak ve 500.000 TL başlangıç sermayesi ile yola çıkıldı. İlk MVP 3 ayda geliştirildi.</p>
                                </div>
                            </div>
                            
                            <div class="relative pl-12">
                                <div class="absolute left-0 w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-sm">2</div>
                                <div class="bg-indigo-50 dark:bg-indigo-900/20 p-6 rounded-2xl border border-indigo-200 dark:border-indigo-800">
                                    <div class="text-indigo-600 dark:text-indigo-400 font-bold mb-1">2020 Q4</div>
                                    <h4 class="font-bold text-lg mb-2">İlk 1000 Kullanıcı</h4>
                                    <p class="text-slate-600 dark:text-slate-400">Beta sürümünde ilk 1000 aktif satıcıya ulaşıldı. Trendyol ve Hepsiburada entegrasyonları tamamlandı.</p>
                                </div>
                            </div>
                            
                            <div class="relative pl-12">
                                <div class="absolute left-0 w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">3</div>
                                <div class="bg-purple-50 dark:bg-purple-900/20 p-6 rounded-2xl border border-purple-200 dark:border-purple-800">
                                    <div class="text-purple-600 dark:text-purple-400 font-bold mb-1">2021 Q2</div>
                                    <h4 class="font-bold text-lg mb-2">Seed Yatırım: $2M</h4>
                                    <p class="text-slate-600 dark:text-slate-400">212 Venture Capital liderliğinde 2 milyon dolarlık seed yatırım aldık. Ekip 15 kişiye ulaştı.</p>
                                </div>
                            </div>
                            
                            <div class="relative pl-12">
                                <div class="absolute left-0 w-8 h-8 bg-violet-600 rounded-full flex items-center justify-center text-white font-bold text-sm">4</div>
                                <div class="bg-violet-50 dark:bg-violet-900/20 p-6 rounded-2xl border border-violet-200 dark:border-violet-800">
                                    <div class="text-violet-600 dark:text-violet-400 font-bold mb-1">2022 Q1</div>
                                    <h4 class="font-bold text-lg mb-2">10.000 Aktif Satıcı</h4>
                                    <p class="text-slate-600 dark:text-slate-400">Platform 10.000 aktif satıcıya ulaştı. Amazon, N11 ve Çiçeksepeti entegrasyonları eklendi.</p>
                                </div>
                            </div>
                            
                            <div class="relative pl-12">
                                <div class="absolute left-0 w-8 h-8 bg-fuchsia-600 rounded-full flex items-center justify-center text-white font-bold text-sm">5</div>
                                <div class="bg-fuchsia-50 dark:bg-fuchsia-900/20 p-6 rounded-2xl border border-fuchsia-200 dark:border-fuchsia-800">
                                    <div class="text-fuchsia-600 dark:text-fuchsia-400 font-bold mb-1">2023 Q3</div>
                                    <h4 class="font-bold text-lg mb-2">Series A: $15M</h4>
                                    <p class="text-slate-600 dark:text-slate-400">Sequoia Capital Türkiye ve mevcut yatırımcılardan 15 milyon dolar Series A yatırım. Ekip 80 kişiye ulaştı.</p>
                                </div>
                            </div>
                            
                            <div class="relative pl-12">
                                <div class="absolute left-0 w-8 h-8 bg-pink-600 rounded-full flex items-center justify-center text-white font-bold text-sm">6</div>
                                <div class="bg-pink-50 dark:bg-pink-900/20 p-6 rounded-2xl border border-pink-200 dark:border-pink-800">
                                    <div class="text-pink-600 dark:text-pink-400 font-bold mb-1">2024 Q2</div>
                                    <h4 class="font-bold text-lg mb-2">AI Lansmanı: PazarAI</h4>
                                    <p class="text-slate-600 dark:text-slate-400">Yapay zeka asistanımız PazarAI lansmanı. Otomatik fiyatlandırma, stok tahmini ve akıllı öneriler aktif.</p>
                                </div>
                            </div>
                            
                            <div class="relative pl-12">
                                <div class="absolute left-0 w-8 h-8 bg-rose-600 rounded-full flex items-center justify-center text-white font-bold text-sm">7</div>
                                <div class="bg-rose-50 dark:bg-rose-900/20 p-6 rounded-2xl border border-rose-200 dark:border-rose-800">
                                    <div class="text-rose-600 dark:text-rose-400 font-bold mb-1">2025 Q4</div>
                                    <h4 class="font-bold text-lg mb-2">Series B: $35M</h4>
                                    <p class="text-slate-600 dark:text-slate-400">Index Ventures liderliğinde 35 milyon dolar Series B yatırım. Avrupa genişlemesi için hazırlıklar başladı.</p>
                                </div>
                            </div>
                            
                            <div class="relative pl-12">
                                <div class="absolute left-0 w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">🎯</div>
                                <div class="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-6 rounded-2xl border border-blue-200 dark:border-purple-800">
                                    <div class="text-blue-600 dark:text-blue-400 font-bold mb-1">2026 - Bugün</div>
                                    <h4 class="font-bold text-lg mb-2">25.000+ Aktif Satıcı</h4>
                                    <p class="text-slate-600 dark:text-slate-400">150+ çalışan, 7 pazaryeri entegrasyonu, aylık 2 milyon+ işlenen sipariş. Avrupa lansmanı için geri sayım başladı.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                `
            },
            {
                title: 'Rakamlarla Pazaryonetimi',
                content: `
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 my-6">
                        <div class="bg-gradient-to-br from-blue-600 to-blue-700 text-white p-6 rounded-2xl text-center">
                            <div class="text-4xl font-black mb-1">25K+</div>
                            <div class="text-blue-200 text-sm">Aktif Satıcı</div>
                        </div>
                        <div class="bg-gradient-to-br from-green-600 to-green-700 text-white p-6 rounded-2xl text-center">
                            <div class="text-4xl font-black mb-1">2M+</div>
                            <div class="text-green-200 text-sm">Aylık Sipariş</div>
                        </div>
                        <div class="bg-gradient-to-br from-purple-600 to-purple-700 text-white p-6 rounded-2xl text-center">
                            <div class="text-4xl font-black mb-1">₺5B+</div>
                            <div class="text-purple-200 text-sm">İşlenen GMV</div>
                        </div>
                        <div class="bg-gradient-to-br from-orange-600 to-orange-700 text-white p-6 rounded-2xl text-center">
                            <div class="text-4xl font-black mb-1">7+</div>
                            <div class="text-orange-200 text-sm">Pazaryeri</div>
                        </div>
                        <div class="bg-gradient-to-br from-pink-600 to-pink-700 text-white p-6 rounded-2xl text-center">
                            <div class="text-4xl font-black mb-1">150+</div>
                            <div class="text-pink-200 text-sm">Çalışan</div>
                        </div>
                        <div class="bg-gradient-to-br from-cyan-600 to-cyan-700 text-white p-6 rounded-2xl text-center">
                            <div class="text-4xl font-black mb-1">99.9%</div>
                            <div class="text-cyan-200 text-sm">Uptime</div>
                        </div>
                        <div class="bg-gradient-to-br from-indigo-600 to-indigo-700 text-white p-6 rounded-2xl text-center">
                            <div class="text-4xl font-black mb-1">4.9/5</div>
                            <div class="text-indigo-200 text-sm">Müşteri Puanı</div>
                        </div>
                        <div class="bg-gradient-to-br from-rose-600 to-rose-700 text-white p-6 rounded-2xl text-center">
                            <div class="text-4xl font-black mb-1">$50M+</div>
                            <div class="text-rose-200 text-sm">Toplam Yatırım</div>
                        </div>
                    </div>
                    
                    <div class="bg-slate-50 dark:bg-white/5 p-6 rounded-2xl border border-slate-200 dark:border-white/10 mt-8">
                        <h4 class="font-bold mb-4">📈 Büyüme Metrikleri (2025-2026)</h4>
                        <div class="grid md:grid-cols-3 gap-6">
                            <div>
                                <div class="text-3xl font-black text-green-600">+180%</div>
                                <div class="text-sm text-slate-600 dark:text-slate-400">Yıllık Gelir Büyümesi</div>
                            </div>
                            <div>
                                <div class="text-3xl font-black text-blue-600">+120%</div>
                                <div class="text-sm text-slate-600 dark:text-slate-400">Yeni Müşteri Kazanımı</div>
                            </div>
                            <div>
                                <div class="text-3xl font-black text-purple-600">95%</div>
                                <div class="text-sm text-slate-600 dark:text-slate-400">Müşteri Tutma Oranı</div>
                            </div>
                        </div>
                    </div>
                `
            },
            {
                title: 'Yatırımcılarımız',
                content: `
                    <p class="mb-6">Pazaryonetimi'ne güvenen önde gelen yatırım kuruluşları:</p>
                    
                    <div class="grid md:grid-cols-4 gap-6">
                        <div class="bg-white dark:bg-white/5 p-6 rounded-2xl border border-slate-200 dark:border-white/10 flex items-center justify-center h-24">
                            <div class="text-xl font-bold text-slate-700 dark:text-slate-300">Index Ventures</div>
                        </div>
                        <div class="bg-white dark:bg-white/5 p-6 rounded-2xl border border-slate-200 dark:border-white/10 flex items-center justify-center h-24">
                            <div class="text-xl font-bold text-slate-700 dark:text-slate-300">Sequoia Capital</div>
                        </div>
                        <div class="bg-white dark:bg-white/5 p-6 rounded-2xl border border-slate-200 dark:border-white/10 flex items-center justify-center h-24">
                            <div class="text-xl font-bold text-slate-700 dark:text-slate-300">212 VC</div>
                        </div>
                        <div class="bg-white dark:bg-white/5 p-6 rounded-2xl border border-slate-200 dark:border-white/10 flex items-center justify-center h-24">
                            <div class="text-xl font-bold text-slate-700 dark:text-slate-300">Revo Capital</div>
                        </div>
                    </div>
                    
                    <blockquote class="border-l-4 border-green-500 bg-green-50 dark:bg-green-900/20 py-4 px-6 my-6 rounded-r-xl">
                        <p class="italic">"Pazaryonetimi, Türkiye e-ticaret ekosisteminin en hızlı büyüyen ve en umut vadeden oyuncularından biri. Yapay zeka vizyonları ve müşteri odaklı yaklaşımları onları öne çıkarıyor."</p>
                        <cite class="block mt-2 text-sm font-semibold">— Martin Mignot, Index Ventures Partner</cite>
                    </blockquote>
                `
            },
            {
                title: 'Ofislerimiz',
                content: `
                    <div class="grid md:grid-cols-2 gap-6">
                        <div class="bg-white dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden">
                            <div class="aspect-video bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30">
                                <img src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&h=300&fit=crop" alt="İstanbul Ofis" class="w-full h-full object-cover" />
                            </div>
                            <div class="p-6">
                                <div class="flex items-center gap-2 mb-2">
                                    <span class="text-2xl">🏢</span>
                                    <h4 class="font-bold text-lg">İstanbul - Genel Merkez</h4>
                                </div>
                                <p class="text-sm text-slate-600 dark:text-slate-400 mb-4">Ana operasyon merkezi, Ar-Ge ve müşteri başarı ekipleri</p>
                                <div class="text-sm space-y-1">
                                    <p><strong>Adres:</strong> Maslak Mah. Büyükdere Cad. No:255 Nurol Plaza K:5</p>
                                    <p><strong>İlçe/İl:</strong> Sarıyer / İstanbul</p>
                                    <p><strong>Çalışan:</strong> 120+ kişi</p>
                                </div>
                            </div>
                        </div>
                        
                        <div class="bg-white dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden">
                            <div class="aspect-video bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30">
                                <img src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&h=300&fit=crop" alt="Ankara Ofis" class="w-full h-full object-cover" />
                            </div>
                            <div class="p-6">
                                <div class="flex items-center gap-2 mb-2">
                                    <span class="text-2xl">🏛️</span>
                                    <h4 class="font-bold text-lg">Ankara - Teknoloji Merkezi</h4>
                                </div>
                                <p class="text-sm text-slate-600 dark:text-slate-400 mb-4">Yapay zeka Ar-Ge, backend geliştirme ekipleri</p>
                                <div class="text-sm space-y-1">
                                    <p><strong>Adres:</strong> Bilkent Cyberpark A Blok No:301</p>
                                    <p><strong>İlçe/İl:</strong> Çankaya / Ankara</p>
                                    <p><strong>Çalışan:</strong> 30+ kişi</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="mt-6 p-6 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl border border-purple-200 dark:border-purple-800">
                        <h4 class="font-bold mb-2">🌍 Yakında: Amsterdam Ofisi</h4>
                        <p class="text-sm text-slate-600 dark:text-slate-400">2026 Q3'te Avrupa operasyonları için Amsterdam'da ofis açıyoruz. Avrupa pazarı genişlemesi için başvurularınızı bekliyoruz!</p>
                    </div>
                `
            },
            {
                title: 'Basında Biz',
                content: `
                    <p class="mb-6">Pazaryonetimi hakkında ulusal ve uluslararası basında çıkan haberler:</p>
                    
                    <div class="space-y-4">
                        <a href="#" class="block bg-white dark:bg-white/5 p-5 rounded-2xl border border-slate-200 dark:border-white/10 hover:border-blue-300 dark:hover:border-blue-500/30 transition-colors">
                            <div class="flex items-center gap-4">
                                <div class="w-20 h-12 bg-slate-100 dark:bg-white/10 rounded-lg flex items-center justify-center font-bold text-slate-500">TechCrunch</div>
                                <div class="flex-1">
                                    <h4 class="font-bold">Turkish e-commerce platform Pazaryonetimi raises $35M Series B</h4>
                                    <p class="text-sm text-slate-500">Kasım 2025</p>
                                </div>
                            </div>
                        </a>
                        
                        <a href="#" class="block bg-white dark:bg-white/5 p-5 rounded-2xl border border-slate-200 dark:border-white/10 hover:border-blue-300 dark:hover:border-blue-500/30 transition-colors">
                            <div class="flex items-center gap-4">
                                <div class="w-20 h-12 bg-slate-100 dark:bg-white/10 rounded-lg flex items-center justify-center font-bold text-slate-500">Forbes TR</div>
                                <div class="flex-1">
                                    <h4 class="font-bold">E-ticarette Yapay Zeka Devrimi: Pazaryonetimi'nin PazarAI'ı</h4>
                                    <p class="text-sm text-slate-500">Haziran 2024</p>
                                </div>
                            </div>
                        </a>
                        
                        <a href="#" class="block bg-white dark:bg-white/5 p-5 rounded-2xl border border-slate-200 dark:border-white/10 hover:border-blue-300 dark:hover:border-blue-500/30 transition-colors">
                            <div class="flex items-center gap-4">
                                <div class="w-20 h-12 bg-slate-100 dark:bg-white/10 rounded-lg flex items-center justify-center font-bold text-slate-500">Webrazzi</div>
                                <div class="flex-1">
                                    <h4 class="font-bold">Pazaryonetimi, Türkiye'nin en hızlı büyüyen 10 startup'ı arasına girdi</h4>
                                    <p class="text-sm text-slate-500">Mart 2025</p>
                                </div>
                            </div>
                        </a>
                        
                        <a href="#" class="block bg-white dark:bg-white/5 p-5 rounded-2xl border border-slate-200 dark:border-white/10 hover:border-blue-300 dark:hover:border-blue-500/30 transition-colors">
                            <div class="flex items-center gap-4">
                                <div class="w-20 h-12 bg-slate-100 dark:bg-white/10 rounded-lg flex items-center justify-center font-bold text-slate-500">Bloomberg HT</div>
                                <div class="flex-1">
                                    <h4 class="font-bold">E-ticaret altyapısında yerli çözüm: Pazaryonetimi CEO'su ile röportaj</h4>
                                    <p class="text-sm text-slate-500">Ocak 2026</p>
                                </div>
                            </div>
                        </a>
                    </div>
                `
            },
            {
                title: 'İletişim',
                content: `
                    <div class="grid md:grid-cols-2 gap-6">
                        <div class="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 rounded-2xl border border-blue-200 dark:border-blue-800">
                            <h4 class="font-bold text-lg mb-4">📧 Genel İletişim</h4>
                            <div class="space-y-2 text-sm">
                                <p><strong>E-posta:</strong> info@pazaryonetimi.com</p>
                                <p><strong>Telefon:</strong> 0850 840 26 26</p>
                                <p><strong>Çalışma Saatleri:</strong> Hafta içi 09:00 - 18:00</p>
                            </div>
                        </div>
                        
                        <div class="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-6 rounded-2xl border border-green-200 dark:border-green-800">
                            <h4 class="font-bold text-lg mb-4">🎯 Satış Ekibi</h4>
                            <div class="space-y-2 text-sm">
                                <p><strong>E-posta:</strong> satis@pazaryonetimi.com</p>
                                <p><strong>Demo Talebi:</strong> pazaryonetimi.com/demo</p>
                                <p><strong>Kurumsal:</strong> kurumsal@pazaryonetimi.com</p>
                            </div>
                        </div>
                        
                        <div class="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-6 rounded-2xl border border-purple-200 dark:border-purple-800">
                            <h4 class="font-bold text-lg mb-4">📰 Basın & PR</h4>
                            <div class="space-y-2 text-sm">
                                <p><strong>E-posta:</strong> basin@pazaryonetimi.com</p>
                                <p><strong>Basın Kiti:</strong> pazaryonetimi.com/basin</p>
                            </div>
                        </div>
                        
                        <div class="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 p-6 rounded-2xl border border-orange-200 dark:border-orange-800">
                            <h4 class="font-bold text-lg mb-4">💼 Kariyer</h4>
                            <div class="space-y-2 text-sm">
                                <p><strong>E-posta:</strong> kariyer@pazaryonetimi.com</p>
                                <p><strong>Açık Pozisyonlar:</strong> pazaryonetimi.com/kariyer</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="mt-8 p-6 bg-slate-900 dark:bg-white/5 rounded-2xl text-center">
                        <h4 class="font-bold text-xl text-white mb-2">Bizi Sosyal Medyada Takip Edin</h4>
                        <div class="flex justify-center gap-4 mt-4">
                            <a href="#" class="w-12 h-12 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center text-white transition-colors">
                                <span class="text-xl">𝕏</span>
                            </a>
                            <a href="#" class="w-12 h-12 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center text-white transition-colors">
                                <span class="text-xl">in</span>
                            </a>
                            <a href="#" class="w-12 h-12 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center text-white transition-colors">
                                <span class="text-xl">📸</span>
                            </a>
                            <a href="#" class="w-12 h-12 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center text-white transition-colors">
                                <span class="text-xl">▶️</span>
                            </a>
                        </div>
                    </div>
                `
            }
        ]
    },

    'kariyer': {
        title: 'Kariyer',
        updated: '1 Şubat 2026',
        summary: 'Pazaryonetimi ailesine katılın! E-ticareti dönüştüren ekibimizde yerinizi alın.',
        sections: [
            {
                title: 'Neden Pazaryonetimi?',
                content: `
                    <p>Pazaryonetimi'nde çalışmak, sadece bir iş değil, e-ticaret dünyasını dönüştüren bir misyonun parçası olmak demek.</p>
                    
                    <div class="grid md:grid-cols-3 gap-4 my-6">
                        <div class="bg-blue-50 dark:bg-blue-900/20 p-5 rounded-xl text-center">
                            <div class="text-3xl mb-2">🚀</div>
                            <h4 class="font-bold">Hızlı Büyüme</h4>
                            <p class="text-sm text-slate-600 dark:text-slate-400">Yılda %180+ büyüyen bir şirkette kariyer fırsatları</p>
                        </div>
                        <div class="bg-green-50 dark:bg-green-900/20 p-5 rounded-xl text-center">
                            <div class="text-3xl mb-2">🧠</div>
                            <h4 class="font-bold">Öğrenme Kültürü</h4>
                            <p class="text-sm text-slate-600 dark:text-slate-400">Sürekli gelişim ve eğitim fırsatları</p>
                        </div>
                        <div class="bg-purple-50 dark:bg-purple-900/20 p-5 rounded-xl text-center">
                            <div class="text-3xl mb-2">🌍</div>
                            <h4 class="font-bold">Global Vizyon</h4>
                            <p class="text-sm text-slate-600 dark:text-slate-400">Avrupa genişlemesiyle uluslararası deneyim</p>
                        </div>
                    </div>
                `
            },
            {
                title: 'Açık Pozisyonlar',
                content: `
                    <p class="mb-6">Şu anda aşağıdaki pozisyonlar için yetenekli takım arkadaşları arıyoruz:</p>
                    
                    <div class="space-y-4">
                        <div class="bg-white dark:bg-white/5 p-5 rounded-xl border border-slate-200 dark:border-white/10">
                            <div class="flex justify-between items-start">
                                <div>
                                    <h4 class="font-bold">Senior Backend Engineer</h4>
                                    <p class="text-sm text-slate-500">Mühendislik • İstanbul / Remote • Tam Zamanlı</p>
                                </div>
                                <span class="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-bold rounded-full">Yeni</span>
                            </div>
                        </div>
                        <div class="bg-white dark:bg-white/5 p-5 rounded-xl border border-slate-200 dark:border-white/10">
                            <div class="flex justify-between items-start">
                                <div>
                                    <h4 class="font-bold">AI/ML Engineer</h4>
                                    <p class="text-sm text-slate-500">Yapay Zeka • Ankara • Tam Zamanlı</p>
                                </div>
                                <span class="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-bold rounded-full">Acil</span>
                            </div>
                        </div>
                        <div class="bg-white dark:bg-white/5 p-5 rounded-xl border border-slate-200 dark:border-white/10">
                            <div class="flex justify-between items-start">
                                <div>
                                    <h4 class="font-bold">Product Manager</h4>
                                    <p class="text-sm text-slate-500">Ürün • İstanbul • Tam Zamanlı</p>
                                </div>
                            </div>
                        </div>
                        <div class="bg-white dark:bg-white/5 p-5 rounded-xl border border-slate-200 dark:border-white/10">
                            <div class="flex justify-between items-start">
                                <div>
                                    <h4 class="font-bold">Customer Success Manager</h4>
                                    <p class="text-sm text-slate-500">Müşteri Başarısı • İstanbul • Tam Zamanlı</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <p class="mt-6">Tüm pozisyonlar için: <a href="mailto:kariyer@pazaryonetimi.com" class="text-blue-600 hover:underline">kariyer@pazaryonetimi.com</a></p>
                `
            }
        ]
    }
};
