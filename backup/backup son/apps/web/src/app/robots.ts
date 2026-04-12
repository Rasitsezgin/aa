import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: [
                    '/dashboard',
                    '/api',
                    '/admin',
                    '/checkout',
                    '/auth',
                    '/_sites',
                    '/_next',
                ],
            },
            {
                userAgent: 'Googlebot',
                allow: '/',
                disallow: [
                    '/dashboard/',
                    '/api/',
                    '/admin/',
                    '/checkout/',
                ],
            },
            {
                userAgent: 'Bingbot',
                allow: '/',
                disallow: [
                    '/dashboard/',
                    '/api/',
                    '/admin/',
                    '/checkout/',
                ],
            },
            {
                userAgent: 'Yandex',
                allow: '/',
                disallow: [
                    '/dashboard/',
                    '/api/',
                    '/admin/',
                    '/checkout/',
                ],
            },
        ],
        sitemap: 'https://pazaryonetimi.com/sitemap.xml',
        host: 'https://pazaryonetimi.com',
    };
}
