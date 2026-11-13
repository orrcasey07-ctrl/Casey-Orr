import fs from 'node:fs';
import path from 'node:path';

const rawSiteUrl = process.env.SITE_URL || process.env.VITE_SITE_URL || process.env.APP_URL || process.env.CF_PAGES_URL;

if (!rawSiteUrl || rawSiteUrl.includes('IHRE-ECHTE-DOMAIN') || rawSiteUrl.includes('MY_APP_URL')) {
  console.log('ℹ️ Keine gültige SITE_URL gesetzt. Sitemap-Generierung mit Platzhalter wird übersprungen.');
  process.exit(0);
}

const siteUrl = rawSiteUrl.replace(/\/+$/, '');
const today = new Date().toISOString().split('T')[0];

const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${siteUrl}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${siteUrl}/impressum.html</loc>
    <lastmod>${today}</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.3</priority>
  </url>
  <url>
    <loc>${siteUrl}/datenschutz.html</loc>
    <lastmod>${today}</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.3</priority>
  </url>
  <url>
    <loc>${siteUrl}/kontakt.html</loc>
    <lastmod>${today}</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.4</priority>
  </url>
</urlset>
`;

const targets = ['public/sitemap.xml', 'dist/sitemap.xml'];
for (const target of targets) {
  const dir = path.dirname(target);
  if (fs.existsSync(dir)) {
    fs.writeFileSync(target, sitemapContent, 'utf-8');
    console.log(`✅ Sitemap generiert: ${target} (${siteUrl})`);
  }
}
