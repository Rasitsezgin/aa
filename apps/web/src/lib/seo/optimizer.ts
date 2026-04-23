// SEO Optimizer
// Search engine optimization tools and generators

interface SEOMetadata {
  title: string;
  description: string;
  keywords: string[];
  canonical?: string;
  robots: 'index,follow' | 'noindex,follow' | 'index,nofollow' | 'noindex,nofollow';
  og: {
    title: string;
    description: string;
    image: string;
    type: string;
    url: string;
  };
  twitter: {
    card: 'summary' | 'summary_large_image' | 'app' | 'player';
    title: string;
    description: string;
    image: string;
  };
  structuredData: Record<string, unknown>[];
  alternateLanguages?: Record<string, string>;
  breadcrumbs?: Array<{ name: string; url: string }>;
}

interface SEOSitemap {
  url: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
  images?: string[];
  videos?: string[];
}

interface SEOResult {
  score: number;
  maxScore: number;
  checks: Array<{
    name: string;
    status: 'pass' | 'warn' | 'fail';
    message: string;
    value?: string | number;
  }>;
  suggestions: string[];
}

// SEO Optimizer
export class SEOOptimizer {
  // Generate metadata for product
  generateProductMetadata(
    product: {
      id: string;
      name: string;
      description: string;
      price: number;
      currency: string;
      image: string;
      category: string;
      brand?: string;
      availability: 'in_stock' | 'out_of_stock' | 'preorder';
      url: string;
    },
    options: {
      siteName: string;
      siteUrl: string;
    }
  ): SEOMetadata {
    const title = `${product.name} | ${options.siteName}`;
    const description = this.truncate(product.description, 160);

    return {
      title,
      description,
      keywords: [product.name, product.category, product.brand || ''].filter(Boolean),
      robots: 'index,follow',
      og: {
        title: product.name,
        description,
        image: product.image,
        type: 'product',
        url: product.url,
      },
      twitter: {
        card: 'summary_large_image',
        title: product.name,
        description,
        image: product.image,
      },
      structuredData: [
        {
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: product.name,
          image: product.image,
          description: product.description,
          brand: product.brand ? { '@type': 'Brand', name: product.brand } : undefined,
          offers: {
            '@type': 'Offer',
            price: product.price,
            priceCurrency: product.currency,
            availability: `https://schema.org/${product.availability}`,
            url: product.url,
          },
        },
      ],
    };
  }

  // Generate metadata for category
  generateCategoryMetadata(
    category: {
      name: string;
      description: string;
      image?: string;
      url: string;
      products: { name: string; url: string }[];
    },
    options: { siteName: string }
  ): SEOMetadata {
    return {
      title: `${category.name} | ${options.siteName}`,
      description: this.truncate(category.description, 160),
      keywords: [category.name, 'online shopping'],
      robots: 'index,follow',
      og: {
        title: category.name,
        description: category.description,
        image: category.image || '',
        type: 'website',
        url: category.url,
      },
      twitter: {
        card: 'summary',
        title: category.name,
        description: category.description,
        image: category.image || '',
      },
      structuredData: [
        {
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: category.name,
          description: category.description,
          url: category.url,
          hasPart: category.products.map(p => ({
            '@type': 'Product',
            name: p.name,
            url: p.url,
          })),
        },
      ],
    };
  }

  // Generate sitemap XML
  generateSitemap(urls: SEOSitemap[]): string {
    const entries = urls.map(url => `
  <url>
    <loc>${this.escapeXml(url.url)}</loc>
    ${url.lastmod ? `<lastmod>${url.lastmod}</lastmod>` : ''}
    ${url.changefreq ? `<changefreq>${url.changefreq}</changefreq>` : ''}
    ${url.priority !== undefined ? `<priority>${url.priority}</priority>` : ''}
    ${url.images?.map(img => `    <image:image><image:loc>${img}</image:loc></image:image>`).join('\n') || ''}
  </url>`).join('');

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${entries}
</urlset>`;
  }

  // Generate robots.txt
  generateRobotsTxt(options: {
    sitemapUrl: string;
    disallow?: string[];
    crawlDelay?: number;
  }): string {
    return `User-agent: *
${options.disallow?.map(p => `Disallow: ${p}`).join('\n') || 'Disallow:'}
${options.crawlDelay ? `Crawl-delay: ${options.crawlDelay}` : ''}
Sitemap: ${options.sitemapUrl}`;
  }

  // Analyze SEO
  analyze(url: string, content: {
    title?: string;
    description?: string;
    headings: { h1: string[]; h2: string[] };
    images: { alt: string; src: string }[];
    links: { internal: number; external: number; broken: number };
    wordCount: number;
    loadTime: number;
    mobileFriendly: boolean;
    hasHttps: boolean;
    hasStructuredData: boolean;
  }): SEOResult {
    const checks = [];
    let score = 0;
    const maxScore = 100;

    // Title check
    if (content.title) {
      const titleLen = content.title.length;
      if (titleLen >= 30 && titleLen <= 60) {
        checks.push({ name: 'Title length', status: 'pass', message: 'Title length is optimal', value: titleLen });
        score += 10;
      } else {
        checks.push({ name: 'Title length', status: 'warn', message: 'Title should be 30-60 characters', value: titleLen });
        score += 5;
      }
    } else {
      checks.push({ name: 'Title', status: 'fail', message: 'Missing title tag' });
    }

    // Description check
    if (content.description) {
      const descLen = content.description.length;
      if (descLen >= 120 && descLen <= 160) {
        checks.push({ name: 'Meta description', status: 'pass', message: 'Description length is optimal' });
        score += 10;
      } else {
        checks.push({ name: 'Meta description', status: 'warn', message: 'Description should be 120-160 characters' });
        score += 5;
      }
    } else {
      checks.push({ name: 'Meta description', status: 'fail', message: 'Missing meta description' });
    }

    // H1 check
    if (content.headings.h1.length === 1) {
      checks.push({ name: 'H1 tag', status: 'pass', message: 'Single H1 tag found' });
      score += 10;
    } else if (content.headings.h1.length === 0) {
      checks.push({ name: 'H1 tag', status: 'fail', message: 'Missing H1 tag' });
    } else {
      checks.push({ name: 'H1 tag', status: 'warn', message: 'Multiple H1 tags found', value: content.headings.h1.length });
      score += 5;
    }

    // Image alt check
    const imagesWithAlt = content.images.filter(img => img.alt).length;
    const imageAltRatio = content.images.length > 0 ? imagesWithAlt / content.images.length : 0;
    if (imageAltRatio === 1) {
      checks.push({ name: 'Image alt text', status: 'pass', message: 'All images have alt text' });
      score += 10;
    } else if (imageAltRatio > 0.5) {
      checks.push({ name: 'Image alt text', status: 'warn', message: `${Math.round((1 - imageAltRatio) * 100)}% missing alt text` });
      score += 5;
    } else {
      checks.push({ name: 'Image alt text', status: 'fail', message: 'Most images missing alt text' });
    }

    // HTTPS
    if (content.hasHttps) {
      checks.push({ name: 'HTTPS', status: 'pass', message: 'Site uses HTTPS' });
      score += 10;
    } else {
      checks.push({ name: 'HTTPS', status: 'fail', message: 'Site does not use HTTPS' });
    }

    // Mobile friendly
    if (content.mobileFriendly) {
      checks.push({ name: 'Mobile friendly', status: 'pass', message: 'Site is mobile friendly' });
      score += 10;
    } else {
      checks.push({ name: 'Mobile friendly', status: 'fail', message: 'Site is not mobile friendly' });
    }

    // Load time
    if (content.loadTime < 3000) {
      checks.push({ name: 'Load time', status: 'pass', message: 'Fast load time', value: `${content.loadTime}ms` });
      score += 10;
    } else if (content.loadTime < 5000) {
      checks.push({ name: 'Load time', status: 'warn', message: 'Average load time', value: `${content.loadTime}ms` });
      score += 5;
    } else {
      checks.push({ name: 'Load time', status: 'fail', message: 'Slow load time', value: `${content.loadTime}ms` });
    }

    // Structured data
    if (content.hasStructuredData) {
      checks.push({ name: 'Structured data', status: 'pass', message: 'Structured data present' });
      score += 10;
    } else {
      checks.push({ name: 'Structured data', status: 'warn', message: 'No structured data found' });
      score += 5;
    }

    // Content length
    if (content.wordCount > 300) {
      checks.push({ name: 'Content length', status: 'pass', message: 'Good content length', value: content.wordCount });
      score += 10;
    } else {
      checks.push({ name: 'Content length', status: 'warn', message: 'Content could be longer', value: content.wordCount });
      score += 5;
    }

    const suggestions = this.generateSuggestions(checks);

    return {
      score,
      maxScore,
      checks,
      suggestions,
    };
  }

  // Generate hreflang tags
  generateHreflang(alternates: Record<string, string>, defaultLang: string): string {
    return Object.entries(alternates)
      .map(([lang, url]) => `<link rel="alternate" hreflang="${lang}" href="${url}" />`)
      .join('\n') + 
      `\n<link rel="alternate" hreflang="x-default" href="${alternates[defaultLang]}" />`;
  }

  // Private methods
  private truncate(text: string, length: number): string {
    if (text.length <= length) return text;
    return text.slice(0, length - 3) + '...';
  }

  private escapeXml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  private generateSuggestions(checks: SEOResult['checks']): string[] {
    const suggestions: string[] = [];
    
    for (const check of checks) {
      if (check.status === 'fail') {
        switch (check.name) {
          case 'Title':
            suggestions.push('Add a descriptive title tag (30-60 characters)');
            break;
          case 'Meta description':
            suggestions.push('Add a meta description (120-160 characters)');
            break;
          case 'H1 tag':
            suggestions.push('Add a single H1 tag that describes the page content');
            break;
          case 'HTTPS':
            suggestions.push('Enable HTTPS for better security and SEO ranking');
            break;
          case 'Mobile friendly':
            suggestions.push('Implement responsive design for mobile users');
            break;
          case 'Load time':
            suggestions.push('Optimize images and enable compression to improve load time');
            break;
        }
      }
    }

    return suggestions;
  }
}

// Export singleton
export const seoOptimizer = new SEOOptimizer();

export { SEOMetadata, SEOSitemap, SEOResult };
