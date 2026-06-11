import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://maricarostore.cl'
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: ['/admin/', '/api/', '/cuenta/'] },
    ],
    sitemap: `${appUrl}/sitemap.xml`,
  }
}
