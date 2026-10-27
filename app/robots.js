export default function robots() {
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/api/', '/unavailable'] }],
    sitemap: 'https://www.parallaxswap.com/sitemap.xml',
  };
}
