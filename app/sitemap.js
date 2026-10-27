const BASE = 'https://www.parallaxswap.com';

export default function sitemap() {
  const now = new Date();
  return ['', '/tunnel', '/ghost', '/track', '/docs', '/terms'].map((path) => ({
    url: `${BASE}${path}`,
    lastModified: now,
    changeFrequency: path === '' ? 'weekly' : 'monthly',
    priority: path === '' ? 1 : path === '/tunnel' ? 0.9 : 0.6,
  }));
}
