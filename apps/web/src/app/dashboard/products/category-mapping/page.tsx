"use client";

import React, { useState, useEffect } from "react";

import { Search, Save, Layers, ArrowRightLeft } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { 
  getInternalCategories, 
  getMarketplaceCategories, 
  getCategoryMappings, 
  saveCategoryMappings 
} from "@/app/actions/category-mapping";

export default function CategoryMappingPage() {
  const { data: session } = useSession();
  const tenantId = (session?.user as any)?.tenantId || "";
  
  const [searchTerm, setSearchTerm] = useState("");
  const [mappings, setMappings] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const [myCategories, setMyCategories] = useState<{id: string, name: string}[]>([]);
  const [trendyolCategories, setTrendyolCategories] = useState<{id: string, name: string}[]>([]);

  useEffect(() => {
    if (!tenantId) return;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [internalCats, remoteCats, existingMappings] = await Promise.all([
          getInternalCategories(tenantId),
          getMarketplaceCategories("TRENDYOL"),
          getCategoryMappings(tenantId, "TRENDYOL")
        ]);
        
        setMyCategories(internalCats);
        setTrendyolCategories(remoteCats);
        setMappings(existingMappings);
      } catch (error) {
        console.error(error);
        toast.error("Kategoriler yüklenirken bir hata oluştu.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [tenantId]);

  const handleMappingChange = (myCategoryId: string, trendyolCategoryId: string) => {
    setMappings((prev) => ({
      ...prev,
      [myCategoryId]: trendyolCategoryId,
    }));
  };

  const handleSave = async () => {
    if (!tenantId) {
      toast.error("Oturum süresi dolmuş veya hatalı. Lütfen tekrar giriş yapın.");
      return;
    }
    
    setIsSaving(true);
    try {
      const res = await saveCategoryMappings(tenantId, "TRENDYOL", mappings);
      if (res.success) {
        toast.success("Kategori eşleştirmeleri başarıyla kaydedildi.");
      } else {
        toast.error(res.error || "Kayıt işlemi başarısız.");
      }
    } catch (error) {
       toast.error("Beklenmeyen bir hata oluştu.");
    } finally {
      setIsSaving(false);
    }
  };

  const filteredCategories = myCategories.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Kategori Eşleştirme</h1>
          <p className="text-muted-foreground mt-2">
            Kendi mağazanızdaki kategorileri, pazaryerindeki hedef kategorilerle eşleştirin. 
            Bu işlem, ürün gönderiminde pazar yerinin ürününüzü doğru rafa koymasını sağlar.
          </p>
        </div>
        <Button onClick={handleSave} disabled={isSaving || isLoading} className="gap-2 shrink-0">
          <Save className="h-4 w-4" />
          {isSaving ? "Kaydediliyor..." : "Tümünü Kaydet"}
        </Button>
      </div>

      <Card>
        <CardHeader className="bg-muted/30 border-b">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <Layers className="h-5 w-5 text-primary" />
                Eşleştirme Tablosu
              </CardTitle>
              <CardDescription>Aktif kategorilerinizi ilgili Trendyol kategorilerine bağlayın.</CardDescription>
            </div>
            <div className="relative w-64 hidden sm:block">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Kategori ara..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground">Kategoriler yükleniyor...</div>
          ) : (
            <div className="divide-y">
              {filteredCategories.map((category, index) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  key={category.id} 
                  className="flex items-center justify-between p-4 hover:bg-muted/10 transition-colors"
                >
                  <div className="flex items-center gap-3 w-1/3">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    <span className="font-medium">{category.name}</span>
                  </div>
                  
                  <ArrowRightLeft className="h-4 w-4 text-muted-foreground mx-4 shrink-0" />
                  
                  <div className="w-1/2">
                    <select 
                      value={mappings[category.id] || ""} 
                      onChange={(e) => handleMappingChange(category.id, e.target.value)}
                      className={`w-full p-2 border rounded-md outline-none bg-background ${mappings[category.id] ? "border-primary/50 bg-primary/5" : ""}`}
                    >
                      <option value="">Trendyol'dan Kategori Seçin</option>
                      {trendyolCategories.map((tc) => (
                        <option key={tc.id} value={tc.id}>
                          {tc.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </motion.div>
              ))}

              {filteredCategories.length === 0 && (
                <div className="p-8 text-center text-muted-foreground">
                  Aradığınız kriterde bir kategori bulunamadı.
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Inline fallback UI components
function Button({ children, className, disabled, onClick }: any) {
  return (
    <button 
      onClick={onClick} 
      disabled={disabled}
      className={`inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2 ${className || ''}`}
    >
      {children}
    </button>
  );
}

function Input({ className, ...props }: any) {
  return (
    <input 
      className={`flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-1 disabled:cursor-not-allowed disabled:opacity-50 ${className || ''}`} 
      {...props} 
    />
  );
}

function Card({ className, children }: any) {
  return <div className={`rounded-xl border bg-card text-card-foreground shadow ${className || ''}`}>{children}</div>;
}

function CardHeader({ className, children }: any) {
  return <div className={`flex flex-col space-y-1.5 p-6 ${className || ''}`}>{children}</div>;
}

function CardTitle({ className, children }: any) {
  return <h3 className={`font-semibold leading-none tracking-tight ${className || ''}`}>{children}</h3>;
}

function CardDescription({ className, children }: any) {
  return <p className={`text-sm text-muted-foreground ${className || ''}`}>{children}</p>;
}

function CardContent({ className, children }: any) {
  return <div className={`p-6 pt-0 ${className || ''}`}>{children}</div>;
}
