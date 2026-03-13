import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/dashboard/', '/auth/', '/onboarding/'],
    },
    sitemap: 'https://mycontxt.ai/sitemap.xml',
  };
}
