
import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export async function POST(request: NextRequest) {
    try {
        const { url } = await request.json();

        if (!url) {
            return NextResponse.json(
                { error: 'URL is required' },
                { status: 400 }
            );
        }

        // 1. Fetch the HTML
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
                'Accept-Language': 'tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7',
            },
        });

        if (!response.ok) {
            return NextResponse.json(
                { error: `Failed to fetch page: ${response.statusText}` },
                { status: response.status }
            );
        }

        const html = await response.text();
        const $ = cheerio.load(html);

        // 2. Extract Store Metadata
        let storeName = '';
        let rating = 0;
        let followers = 0;
        let logo = '';

        // Try to find the initial state JSON
        let merchantData: any = null;

        const tryParseJsObject = (text: string) => {
            // Find first brace and extract balanced object text
            const first = text.indexOf('{');
            if (first === -1) return null;
            let depth = 0;
            let end = -1;
            for (let i = first; i < text.length; i++) {
                const ch = text[i];
                if (ch === '{') depth++;
                else if (ch === '}') {
                    depth--;
                    if (depth === 0) { end = i; break; }
                }
            }
            if (end === -1) return null;
            const objText = text.slice(first, end + 1);

            // Try JSON.parse first
            try {
                return JSON.parse(objText);
            } catch (jsonErr) {
                // Fallback: try to evaluate JS object literal (may have unquoted keys)
                try {
                    // eslint-disable-next-line no-new-func
                    const fn = new Function('return (' + objText + ')');
                    return fn();
                } catch (evalErr) {
                    return null;
                }
            }
        };

        $('script').each((_, element) => {
            const content = $(element).html() || '';
            if (!content) return;

            if (content.includes('window.MCONTENT') || content.includes('MCONTENT')) {
                try {
                    // Try to extract object from the script block robustly
                    const parsed = tryParseJsObject(content);
                    if (parsed) {
                        // If structure is like Object.assign(..., { key: { STATE: ... } }) the parsed object may be the RHS
                        const keys = Object.keys(parsed || {});
                        if (keys.length > 0) {
                            const candidate = parsed[keys[0]]?.STATE || parsed[keys[0]] || parsed;
                            merchantData = candidate;
                        } else {
                            merchantData = parsed;
                        }
                    }
                } catch (e) {
                    console.error('Error parsing merchant script block:', e);
                }
            }
        });

        if (merchantData?.merchant) {
            storeName = merchantData.merchant.legalName || '';
            rating = merchantData.storeRating || 0;
        }

        // DOM Scraping Fallback for Store Info
        if (!storeName) {
            storeName = $('h1.merchant-name').text().trim() ||
                $('.merchant-page-header .title').text().trim() ||
                $('title').text().split('Mağazası')[0].trim();
        }

        if (rating === 0) {
            const ratingText = $('.merchant-rating .rating-score').text().trim() ||
                $('.merchant-header-rating').text().trim();
            rating = parseFloat(ratingText.replace(',', '.')) || 0;
        }

        // Followers - try to find text like "11.854 Takipçi" or similar
        const followersText = $('.merchant-followers').text().trim() ||
            $('div:contains("Takipçi")').last().text().trim();
        if (followersText) {
            const match = followersText.match(/([\d\.,]+)/);
            if (match) {
                followers = parseInt(match[1].replace(/\./g, '').replace(/,/g, '')) || 0;
            }
        }

        // Logo
        logo = $('.merchant-logo img').attr('src') || '';

        // 3. Extract Products
        const products: any[] = [];

        const extractFromMerchantData = (mData: any) => {
            if (!mData) return;
            if (mData.desktopRows) {
                Object.values(mData.desktopRows).forEach((row: any) => {
                    if (row.type === 'product' && row.data) {
                        const items = Array.isArray(row.data) ? row.data : (row.data.items || []);
                        items.forEach((item: any) => {
                            if (item.productId) {
                                products.push({
                                    id: item.productId,
                                    name: item.name,
                                    price: item.priceInfo?.price || 0,
                                    originalPrice: item.priceInfo?.originalPrice || item.priceInfo?.price || 0,
                                    rating: item.customerReviewRating || 0,
                                    reviewCount: item.customerReviewCount || 0,
                                    image: item.variantList?.[0]?.images?.[0]?.link?.replace('{size}', '500') || '',
                                    url: item.url && item.url.startsWith('http') ? item.url : `https://www.hepsiburada.com${item.url}`,
                                    category: item.mainCategory?.name || ''
                                });
                            }
                        });
                    }
                });
            }
        };

        extractFromMerchantData(merchantData);

        // If we didn't find product info via initial HTML+JSON, try a headless-rendered fallback
        if ((products.length === 0 || !merchantData) && typeof process !== 'undefined') {
            try {
                // Dynamically import playwright only when needed
                // eslint-disable-next-line @typescript-eslint/no-var-requires
                const playwright = await import('playwright');
                const browser = await playwright.chromium.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'], headless: true });
                const context = await browser.newContext({ userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' });
                const page = await context.newPage();
                await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 }).catch(() => null);

                // Try to read a global variable used by Hepsiburada if present
                try {
                    const mcontent = await page.evaluate(() => {
                        const win = window as unknown as { MCONTENT?: { MERCHANTLAYOUT?: unknown } };
                        return win.MCONTENT?.MERCHANTLAYOUT || win.MCONTENT || null;
                    });
                    if (mcontent) {
                        // if evaluation returned an object, try extracting product rows
                        if (typeof mcontent === 'object' && mcontent !== null) {
                            // Cast to any to handle dynamic Hepsiburada structure safely in scraper
                            const normalized = mcontent as any;
                            const keys = Object.keys(normalized);
                            let targetData = normalized;
                            if (keys.length > 0 && normalized[keys[0]]?.STATE) {
                                targetData = normalized[keys[0]].STATE;
                            }
                            extractFromMerchantData(targetData);
                            if (products.length === 0 && targetData?.merchant) {
                                merchantData = targetData;
                            }
                        }
                    }
                } catch (e) {
                    // ignore
                }

                // If still no products, load rendered HTML and parse with cheerio
                if (products.length === 0) {
                    const renderedHtml = await page.content();
                    const $$ = cheerio.load(renderedHtml);

                    // Try to parse product cards from rendered DOM
                    $$('[data-testid="product-card"], .product-card, .search-item, .product-item, .product-list-item').each((_, el) => {
                        try {
                            const name = $$(el).find('h3, .title, .product-title').first().text().trim();
                            const link = $$(el).find('a').first().attr('href') || '';
                            const priceText = $$(el).find('.price, .current-price, .product-price').first().text().replace(/[₺,\.\s]/g, '').trim();
                            const price = parseFloat(priceText) || 0;
                            const img = $$(el).find('img').first().attr('src') || $$(el).find('img').first().attr('data-src') || '';
                            if (name) {
                                products.push({ id: link || name, name, price, image: img, url: link && link.startsWith('http') ? link : `https://www.hepsiburada.com${link}` });
                            }
                        } catch (e) { }
                    });
                }

                await browser.close();
            } catch (err) {
                console.warn('Playwright fallback failed or not installed:', err);
            }
        }

        // 4. Calculate Derived Metrics & Heuristics
        let titleScore = 0;
        let imageScore = 0;
        let priceScore = 0;
        const stockScore = 100; // Default active, can be adjusted if we detect OOS
        let estimatedTurnover = 0;

        if (products.length > 0) {
            // Title Optimization: Ideal length 50-120 chars
            const totalTitleLength = products.reduce((sum, p) => sum + (p.name?.length || 0), 0);
            const avgTitleLength = totalTitleLength / products.length;
            titleScore = Math.min(100, Math.max(0, (avgTitleLength >= 50 && avgTitleLength <= 120) ? 100 : 100 - Math.abs(85 - avgTitleLength)));

            // Image Optimization: Check for high-res images (we already prioritize high-res in scraping)
            // Heuristic: If we found images for all products, score is high.
            const productsWithImages = products.filter(p => p.image && !p.image.includes('default'));
            imageScore = Math.min(100, (productsWithImages.length / products.length) * 100);

            // Price Competitiveness: Variance check (heuristic). 
            // If prices end in .99 or .90, usually optimized.
            const optimizedPrices = products.filter(p => {
                const priceStr = p.price.toString();
                return priceStr.endsWith('9') || priceStr.endsWith('0'); // Simple heuristic
            });
            priceScore = Math.min(100, 50 + ((optimizedPrices.length / products.length) * 50));

            // Turnover Estimation (Heuristic based on reviews)
            // Avg Price * Review Count * Multiplier (assuming 1 review ~= 30-50 sales historically)
            const totalReviews = products.reduce((sum, p) => sum + (p.reviewCount || 0), 0);
            const avgPrice = products.reduce((sum, p) => sum + p.price, 0) / products.length;

            // Monthly turnover estimation heuristic
            // This is a rough guess: (Total Reviews / 12 months) * 40 sales/review * Avg Price
            // Capped/Floored to be realistic
            estimatedTurnover = Math.round((totalReviews / 12) * 40 * avgPrice);
            if (estimatedTurnover === 0 && products.length > 0) estimatedTurnover = 15000; // Minimum for active store
        }

        if (rating === 0 && products.length > 0) {
            const totalRating = products.reduce((sum, p) => sum + p.rating, 0);
            rating = Number((totalRating / products.length).toFixed(1));
        }

        return NextResponse.json({
            storeName: storeName || 'Hepsiburada Mağazası',
            rating,
            followers,
            products: products.slice(0, 50),
            totalProducts: products.length,
            logo,
            heuristics: {
                titleOptimization: Math.round(titleScore),
                imageOptimization: Math.round(imageScore),
                priceCompetitiveness: Math.round(priceScore),
                stockHealth: stockScore,
                estimatedTurnover
            }
        });

    } catch (error) {
        console.error('Hepsiburada Scraper Error:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
