// Content Script - Runs on marketplace pages (Trendyol, Amazon, Hepsiburada)
import type { ScrapedProductData } from './types';

// API endpoint (used in message passing to background script)
// const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api.pazaryonetimi.com';

// Detect current platform
function detectPlatform(): string | null {
  const hostname = window.location.hostname;
  
  if (hostname.includes('trendyol.com')) return 'TRENDYOL';
  if (hostname.includes('hepsiburada.com')) return 'HEPSIBURADA';
  if (hostname.includes('amazon.com.tr')) return 'AMAZON';
  if (hostname.includes('n11.com')) return 'N11';
  if (hostname.includes('ciceksepeti.com')) return 'CICEKSEPETI';
  
  return null;
}

// Extract product data from page
function extractProductData(): ScrapedProductData | null {
  const platform = detectPlatform();
  if (!platform) return null;

  try {
    switch (platform) {
      case 'TRENDYOL':
        return extractTrendyolProduct();
      case 'HEPSIBURADA':
        return extractHepsiburadaProduct();
      case 'AMAZON':
        return extractAmazonProduct();
      case 'N11':
        return extractN11Product();
      default:
        return null;
    }
  } catch (error) {
    console.error('Pazaryonetimi Extension: Product extraction failed', error);
    return null;
  }
}

function extractTrendyolProduct(): ScrapedProductData | null {
  const title = document.querySelector('h1.pr-new-br')?.textContent?.trim() ||
                document.querySelector('[data-testid="product-name"]')?.textContent?.trim();
  
  const priceEl = document.querySelector('.prc-dsc') || 
                  document.querySelector('[data-testid="price-current-price"]');
  const priceText = priceEl?.textContent?.trim() || '';
  const price = parsePrice(priceText);

  const ratingEl = document.querySelector('.rating-score');
  const rating = parseFloat(ratingEl?.textContent?.replace(',', '.') || '0');

  const reviewEl = document.querySelector('.rating-count');
  const reviewCount = parseInt(reviewEl?.textContent?.replace(/\D/g, '') || '0');

  const imageEl = document.querySelector('.base-product-image img') as HTMLImageElement;
  const images = imageEl?.src ? [imageEl.src] : [];

  const stockStatus = !document.querySelector('.out-of-stock') && 
                      !document.querySelector('[data-testid="out-of-stock"]');

  if (!title) return null;

  return {
    title,
    price,
    images,
    rating: normalizeRating(rating),
    reviewCount,
    stockStatus,
  };
}

function extractHepsiburadaProduct(): ScrapedProductData | null {
  const title = document.querySelector('h1')?.textContent?.trim() ||
                document.querySelector('[data-testid="product-name"]')?.textContent?.trim();
  
  const priceEl = document.querySelector('[data-testid="final-price"]') ||
                  document.querySelector('.price');
  const priceText = priceEl?.textContent?.trim() || '';
  const price = parsePrice(priceText);

  const ratingEl = document.querySelector('[data-testid="review-star-rating"]');
  const rating = parseFloat(ratingEl?.textContent?.replace(',', '.') || '0');

  const reviewEl = document.querySelector('[data-testid="review-count"]');
  const reviewCount = parseInt(reviewEl?.textContent?.replace(/\D/g, '') || '0');

  const imageEl = document.querySelector('[data-testid="product-image"] img') as HTMLImageElement;
  const images = imageEl?.src ? [imageEl.src] : [];

  const stockStatus = !document.querySelector('[data-testid="out-of-stock"]');

  if (!title) return null;

  return {
    title,
    price,
    images,
    rating: normalizeRating(rating),
    reviewCount,
    stockStatus,
  };
}

function extractAmazonProduct(): ScrapedProductData | null {
  const title = document.querySelector('#productTitle')?.textContent?.trim();
  
  const priceEl = document.querySelector('.a-price .a-offscreen') ||
                  document.querySelector('#priceblock_dealprice');
  const priceText = priceEl?.textContent?.trim() || '';
  const price = parsePrice(priceText);

  const ratingEl = document.querySelector('a[href*="customerReviews"] i.a-icon-star span');
  const ratingText = ratingEl?.textContent?.match(/([\d,]+)/)?.[0] || '0';
  const rating = parseFloat(ratingText.replace(',', '.'));

  const reviewEl = document.querySelector('a[href*="customerReviews"] span');
  const reviewCount = parseInt(reviewEl?.textContent?.replace(/\D/g, '') || '0');

  const imageEl = document.querySelector('#landingImage') as HTMLImageElement;
  const images = imageEl?.src ? [imageEl.src] : [];

  const stockStatus = !document.querySelector('#availability span')?.textContent?.includes('stokta yok');

  if (!title) return null;

  return {
    title,
    price,
    images,
    rating: normalizeRating(rating, 5),
    reviewCount,
    stockStatus,
  };
}

function extractN11Product(): ScrapedProductData | null {
  const title = document.querySelector('.proName')?.textContent?.trim() ||
                document.querySelector('h1')?.textContent?.trim();
  
  const priceEl = document.querySelector('.newPrice') ||
                  document.querySelector('.price');
  const priceText = priceEl?.textContent?.trim() || '';
  const price = parsePrice(priceText);

  const ratingEl = document.querySelector('.ratingScore');
  const rating = parseFloat(ratingEl?.textContent?.replace(',', '.') || '0');

  const reviewEl = document.querySelector('.ratingCount');
  const reviewCount = parseInt(reviewEl?.textContent?.replace(/\D/g, '') || '0');

  const imageEl = document.querySelector('#productDetailGallery img') as HTMLImageElement;
  const images = imageEl?.src ? [imageEl.src] : [];

  const stockStatus = !document.querySelector('.out-of-stock');

  if (!title) return null;

  return {
    title,
    price,
    images,
    rating: normalizeRating(rating),
    reviewCount,
    stockStatus,
  };
}

// Helper functions
function parsePrice(priceText: string): number {
  if (!priceText) return 0;
  const normalized = priceText
    .replace(/\./g, '')
    .replace(/,/g, '.')
    .replace(/[^\d.]/g, '');
  return parseFloat(normalized) || 0;
}

function normalizeRating(rating: number, maxScale: number = 10): number {
  if (maxScale === 10 && rating > 5) {
    return Math.min(5, rating / 2);
  }
  return Math.min(5, rating);
}

// Create floating action button
function createAssistantButton(): HTMLButtonElement {
  const button = document.createElement('button');
  button.id = 'pazaryonetimi-assistant-btn';
  button.innerHTML = `
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" fill="white"/>
    </svg>
  `;
  button.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
    border: none;
    cursor: pointer;
    z-index: 999999;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 12px rgba(249, 115, 22, 0.4);
    transition: transform 0.2s, box-shadow 0.2s;
  `;
  
  button.addEventListener('mouseenter', () => {
    button.style.transform = 'scale(1.1)';
    button.style.boxShadow = '0 6px 20px rgba(249, 115, 22, 0.5)';
  });
  
  button.addEventListener('mouseleave', () => {
    button.style.transform = 'scale(1)';
    button.style.boxShadow = '0 4px 12px rgba(249, 115, 22, 0.4)';
  });
  
  button.addEventListener('click', handleAssistantClick);
  
  return button;
}

// Handle assistant button click
function handleAssistantClick() {
  const productData = extractProductData();
  
  if (productData) {
    // Send to background script
    chrome.runtime.sendMessage({
      type: 'ANALYZE_PRODUCT',
      data: productData,
      platform: detectPlatform(),
      url: window.location.href,
    }, (response) => {
      if (response?.success) {
        showAnalysisPanel(response.analysis);
      } else {
        showError('Analiz yapılamadı. Lütfen tekrar deneyin.');
      }
    });
  } else {
    showError('Ürün bilgisi alınamadı. Sayfa tamamen yüklenmiş olmalı.');
  }
}

// Show analysis panel
function showAnalysisPanel(analysis: any) {
  // Remove existing panel
  const existingPanel = document.getElementById('pazaryonetimi-panel');
  if (existingPanel) {
    existingPanel.remove();
  }
  
  const panel = document.createElement('div');
  panel.id = 'pazaryonetimi-panel';
  panel.style.cssText = `
    position: fixed;
    bottom: 90px;
    right: 20px;
    width: 320px;
    background: white;
    border-radius: 16px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
    z-index: 999998;
    padding: 20px;
    font-family: system-ui, -apple-system, sans-serif;
  `;
  
  panel.innerHTML = `
    <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 15px;">
      <div style="width: 32px; height: 32px; background: linear-gradient(135deg, #f97316, #ea580c); 
                  border-radius: 8px; display: flex; align-items: center; justify-content: center;">
        <span style="color: white; font-size: 14px; font-weight: bold;">P</span>
      </div>
      <div>
        <div style="font-weight: 600; font-size: 14px; color: #1f2937;">Rakip Analizi</div>
        <div style="font-size: 12px; color: #6b7280;">${detectPlatform()}</div>
      </div>
      <button id="close-pazaryonetimi-panel" style="margin-left: auto; background: none; border: none; 
              cursor: pointer; font-size: 18px; color: #6b7280;">×</button>
    </div>
    <div style="space-y: 8px;">
      <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
        <span style="font-size: 13px; color: #6b7280;">Fiyat Konumu</span>
        <span style="font-size: 13px; font-weight: 600; color: ${analysis?.pricePosition === 'high' ? '#ef4444' : analysis?.pricePosition === 'low' ? '#22c55e' : '#6b7280'};">
          ${analysis?.pricePosition === 'high' ? 'Yüksek' : analysis?.pricePosition === 'low' ? 'Düşük' : 'Ortalama'}
        </span>
      </div>
      <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
        <span style="font-size: 13px; color: #6b7280;">Puan</span>
        <span style="font-size: 13px; font-weight: 600; color: #1f2937;">${analysis?.rating || '-'}</span>
      </div>
      <div style="display: flex; justify-content: space-between; padding: 8px 0;">
        <span style="font-size: 13px; color: #6b7280;">Tavsiye</span>
        <span style="font-size: 13px; font-weight: 600; color: #22c55e;">${analysis?.recommendation || '-'}</span>
      </div>
    </div>
    <button id="open-dashboard-btn" style="width: 100%; margin-top: 15px; padding: 10px; 
            background: #1f2937; color: white; border: none; border-radius: 8px; 
            font-size: 13px; font-weight: 600; cursor: pointer;">
      Dashboard'da Görüntüle
    </button>
  `;
  
  document.body.appendChild(panel);
  
  // Close button handler
  document.getElementById('close-pazaryonetimi-panel')?.addEventListener('click', () => {
    panel.remove();
  });
  
  // Dashboard button handler
  document.getElementById('open-dashboard-btn')?.addEventListener('click', () => {
    chrome.runtime.sendMessage({ type: 'OPEN_DASHBOARD' });
  });
}

function showError(message: string) {
  const existingPanel = document.getElementById('pazaryonetimi-panel');
  if (existingPanel) {
    existingPanel.remove();
  }
  
  const panel = document.createElement('div');
  panel.id = 'pazaryonetimi-panel';
  panel.style.cssText = `
    position: fixed;
    bottom: 90px;
    right: 20px;
    padding: 16px 20px;
    background: #fef2f2;
    border: 1px solid #fecaca;
    border-radius: 12px;
    color: #dc2626;
    font-size: 13px;
    z-index: 999998;
    max-width: 280px;
  `;
  panel.textContent = message;
  
  document.body.appendChild(panel);
  
  setTimeout(() => {
    panel.remove();
  }, 4000);
}

// Initialize
function init() {
  const platform = detectPlatform();
  
  if (platform && window.location.pathname.includes('/urun') || 
      window.location.pathname.includes('/product') ||
      window.location.pathname.includes('/dp/')) {
    
    // Wait for page to fully load
    setTimeout(() => {
      const button = createAssistantButton();
      document.body.appendChild(button);
      
      console.log('Pazaryonetimi Extension: Assistant button added');
    }, 2000);
  }
}

// Run initialization
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// Listen for messages from popup/background
chrome.runtime.onMessage.addListener(
  (request: any, _sender: chrome.runtime.MessageSender, sendResponse: (response?: any) => void) => {
    if (request.type === 'GET_PRODUCT_DATA') {
      const data = extractProductData();
      sendResponse({ success: true, data });
    }
    return true;
  }
);
